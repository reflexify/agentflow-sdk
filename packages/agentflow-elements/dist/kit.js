import { $ as e, A as t, B as n, C as r, D as i, E as a, F as o, G as s, H as c, I as l, J as u, K as d, L as f, M as p, N as m, O as h, P as g, Q as _, R as v, S as y, T as b, U as x, V as S, W as C, X as w, Y as T, Z as E, _ as D, a as O, at as k, b as ee, ct as A, d as te, dt as j, et as M, f as N, ft as P, i as F, it as ne, j as I, k as re, l as ie, lt as L, m as ae, n as oe, nt as R, o as z, ot as B, p as se, pt as V, q as ce, r as H, rt as le, s as ue, st as U, t as de, tt as W, u as fe, ut as G, v as pe, w as me, x as he, y as ge, z as _e } from "./chunks/version-D-AVIyWX.js";
import { a as ve, c as ye, d as be, f as xe, l as Se, n as Ce, o as we, p as Te, r as Ee, s as De, u as Oe } from "./chunks/mention-chip-BXN044oa.js";
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/chunk-QZ7TP4HQ.mjs
var ke = Object.defineProperty, Ae = (e, t, n) => t in e ? ke(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, je = (e, t, n) => Ae(e, typeof t == "symbol" ? t : t + "", n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/caret.mjs
function Me(e) {
	if (e) try {
		if (e.ownerDocument.activeElement !== e) return;
		let t = e.value.length;
		e.setSelectionRange(t, t);
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/shared.mjs
var Ne = (e, t) => e.map((n, r) => e[(Math.max(t, 0) + r) % e.length]), Pe = () => void 0, Fe = (e) => typeof e == "object" && !!e, Ie = 2147483647, K = (e) => e ? "" : void 0, Le = (e) => e ? "true" : void 0, Re = /\\/g, ze = /"/g, Be = (e) => globalThis.CSS?.escape?.(e) ?? e.replace(Re, "\\\\").replace(ze, "\\\""), Ve = (e) => `[data-ownedby~="${Be(String(e))}"]`, He = 1, Ue = 9, We = 11, Ge = (e) => Fe(e) && e.nodeType === He && typeof e.nodeName == "string", Ke = (e) => Fe(e) && e.nodeType === Ue, qe = (e) => Fe(e) && e === e.window, Je = (e) => Ge(e) ? e.localName || "" : "#document";
function Ye(e) {
	return [
		"html",
		"body",
		"#document"
	].includes(Je(e));
}
var Xe = (e) => Fe(e) && e.nodeType !== void 0, Ze = (e) => Xe(e) && e.nodeType === We && "host" in e, Qe = (e) => Ge(e) && e.localName === "input", $e = (e) => !!e?.matches("a[href]"), et = (e) => Ge(e) ? e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0 : !1;
function tt(e) {
	return e ? ct(e.getRootNode()) === e : !1;
}
var nt = /(textarea|select)/;
function rt(e) {
	if (e == null || !Ge(e)) return !1;
	try {
		return Qe(e) && e.selectionStart != null || nt.test(e.localName) || e.isContentEditable || e.getAttribute("contenteditable") === "true" || e.getAttribute("contenteditable") === "";
	} catch {
		return !1;
	}
}
function it(e, t) {
	if (!e || !t || !Ge(e) || !Xe(t)) return !1;
	if (Ge(t) && e === t || e.contains(t)) return !0;
	let n = t.getRootNode?.();
	if (n && Ze(n)) {
		let n = t;
		for (; n;) {
			if (e === n) return !0;
			n = n.parentNode || n.host;
		}
	}
	return !1;
}
function at(e) {
	return Ke(e) ? e : qe(e) ? e.document : e?.ownerDocument ?? document;
}
function ot(e) {
	return at(e).documentElement;
}
function st(e) {
	return Ze(e) ? st(e.host) : Ke(e) ? e.defaultView ?? window : Ge(e) ? e.ownerDocument?.defaultView ?? window : window;
}
function ct(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (!e || e === t) break;
		t = e;
	}
	return t;
}
function lt(e) {
	if (Je(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Ze(e) && e.host || ot(e);
	return Ze(t) ? t.host : t;
}
function ut(e) {
	let t;
	try {
		if (t = e.getRootNode({ composed: !0 }), Ke(t) || Ze(t)) return t;
	} catch {}
	return e.ownerDocument ?? document;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/computed-style.mjs
var dt = /* @__PURE__ */ new WeakMap();
function ft(e) {
	return dt.has(e) || dt.set(e, st(e).getComputedStyle(e)), dt.get(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/controller.mjs
var pt = /* @__PURE__ */ new Set([
	"menu",
	"listbox",
	"dialog",
	"grid",
	"tree",
	"region",
	"application"
]), mt = (e) => pt.has(e), ht = (e) => e.getAttribute("aria-controls")?.split(" ") || [];
function gt(e, t) {
	let n = /* @__PURE__ */ new Set(), r = ut(e), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = ht(e);
			for (let e of a) {
				if (!e || n.has(e)) continue;
				n.add(e);
				let a = r.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					if (e && mt(e) && !n && (a === t || a.contains(t) || i(a))) return !0;
				}
			}
		}
		return !1;
	};
	return i(e);
}
function _t(e, t) {
	let n = ut(e), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = ht(e);
			for (let e of a) {
				if (!e || r.has(e)) continue;
				r.add(e);
				let a = n.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					e && pt.has(e) && !n && (t(a), i(a));
				}
			}
		}
	};
	i(e);
}
function vt(e) {
	let t = /* @__PURE__ */ new Set();
	return _t(e, (n) => {
		e.contains(n) || t.add(n);
	}), Array.from(t);
}
function yt(e) {
	let t = e.getAttribute("role");
	return !!(t && pt.has(t));
}
function bt(e) {
	return e.hasAttribute("aria-controls") && e.getAttribute("aria-expanded") === "true";
}
function xt(e) {
	return bt(e) ? !0 : !!e.querySelector?.("[aria-controls][aria-expanded=\"true\"]");
}
function St(e) {
	if (!e.id) return !1;
	let t = ut(e), n = CSS.escape(e.id), r = `[aria-controls~="${n}"][aria-expanded="true"], [aria-controls="${n}"][aria-expanded="true"]`;
	return !!(t.querySelector(r) && yt(e));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/platform.mjs
var Ct = () => typeof document < "u";
function wt() {
	return navigator.userAgentData?.platform ?? navigator.platform;
}
function Tt() {
	let e = navigator.userAgentData;
	return e && Array.isArray(e.brands) ? e.brands.map(({ brand: e, version: t }) => `${e}/${t}`).join(" ") : navigator.userAgent;
}
var Et = (e) => Ct() && e.test(wt()), Dt = (e) => Ct() && e.test(Tt()), Ot = (e) => Ct() && e.test(navigator.vendor), kt = /^iPhone/i, At = /^iPad/i, jt = /^Mac/i, Mt = /apple/i, Nt = /Firefox/i, Pt = /Android/i, Ft = () => Ct() && !!navigator.maxTouchPoints, It = () => Et(kt), Lt = () => Et(At) || Bt() && navigator.maxTouchPoints > 1, Rt = () => It() || Lt(), zt = () => Bt() || Rt(), Bt = () => Et(jt), Vt = () => zt() && Ot(Mt), Ht = () => Dt(Nt), Ut = () => Dt(Pt);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/event.mjs
function Wt(e) {
	return e.composedPath?.() ?? e.nativeEvent?.composedPath?.();
}
function Gt(e) {
	return Wt(e)?.[0] ?? e.target;
}
function Kt(e) {
	let t = e.currentTarget;
	if (!t || !t.matches("a[href], button[type='submit'], input[type='submit']")) return !1;
	let n = e.button === 1, r = Yt(e);
	return n || r;
}
function qt(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let n = t.localName;
	return e.altKey ? n === "a" || n === "button" && t.type === "submit" || n === "input" && t.type === "submit" : !1;
}
function Jt(e) {
	return on(e).isComposing || e.keyCode === 229;
}
function Yt(e) {
	return Bt() ? e.metaKey : e.ctrlKey;
}
function Xt(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function Zt(e) {
	return e.pointerType === "" && e.isTrusted ? !0 : Ut() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
var Qt = (e) => e.button === 0, $t = (e) => e.button === 2 || Bt() && e.ctrlKey && e.button === 0, en = (e) => e.ctrlKey || e.altKey || e.metaKey, tn = (e) => "touches" in e && e.touches.length > 0, nn = {
	Up: "ArrowUp",
	Down: "ArrowDown",
	Esc: "Escape",
	" ": "Space",
	",": "Comma",
	Left: "ArrowLeft",
	Right: "ArrowRight"
}, rn = {
	ArrowLeft: "ArrowRight",
	ArrowRight: "ArrowLeft"
};
function an(e, t = {}) {
	let { dir: n = "ltr", orientation: r = "horizontal" } = t, i = e.key;
	return i = nn[i] ?? i, n === "rtl" && r === "horizontal" && i in rn && (i = rn[i]), i;
}
function on(e) {
	return e.nativeEvent ?? e;
}
function sn(e, t = "client") {
	let n = tn(e) ? e.touches[0] || e.changedTouches[0] : e;
	return {
		x: n[`${t}X`],
		y: n[`${t}Y`]
	};
}
var cn = (e, t, n, r) => {
	let i = typeof e == "function" ? e() : e;
	return i?.addEventListener(t, n, r), () => {
		i?.removeEventListener(t, n, r);
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/form.mjs
function ln(e, t) {
	let { type: n = "HTMLInputElement", property: r = "value" } = t, i = st(e)[n].prototype;
	return Object.getOwnPropertyDescriptor(i, r) ?? {};
}
function un(e) {
	if (e.localName === "input") return "HTMLInputElement";
	if (e.localName === "textarea") return "HTMLTextAreaElement";
	if (e.localName === "select") return "HTMLSelectElement";
}
function dn(e, t, n = "value") {
	if (!e) return;
	let r = un(e);
	r && ln(e, {
		type: r,
		property: n
	}).set?.call(e, t), e.setAttribute(n, t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/tabbable.mjs
var fn = (e) => Ge(e) && e.tagName === "IFRAME", pn = /^(audio|video|details)$/;
function mn(e) {
	let t = e.getAttribute("tabindex");
	return t ? parseInt(t, 10) : NaN;
}
var hn = (e) => !Number.isNaN(mn(e)), gn = (e) => mn(e) < 0;
function _n(e) {
	return Qe(e) && e.type === "radio";
}
function vn(e) {
	if (!_n(e) || !e.name || e.checked) return !0;
	let t = `input[type="radio"][name="${CSS.escape(e.name)}"]`, n = e.form ?? e.ownerDocument, r = Array.from(n.querySelectorAll(t)).filter((t) => t.form === e.form && Cn(t)), i = r.find((e) => e.checked);
	return i ? i === e : r[0] === e;
}
function yn(e, t) {
	if (!t) return null;
	if (t === !0) return e.shadowRoot || null;
	let n = t(e);
	return (n === !0 ? e.shadowRoot : n) || null;
}
function bn(e, t, n) {
	let r = [...e], i = [...e], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
	e.forEach((e, t) => o.set(e, t));
	let s = 0;
	for (; s < i.length;) {
		let e = i[s++];
		if (!e || a.has(e)) continue;
		a.add(e);
		let c = yn(e, t);
		if (c) {
			let t = Array.from(c.querySelectorAll(xn)).filter(n), a = o.get(e);
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
var xn = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type", Sn = (e, t = {}) => {
	if (!e) return [];
	let { includeContainer: n = !1, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(xn));
	(n == 1 || n == "if-empty" && i.length === 0) && Ge(e) && Cn(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (Cn(e)) {
		if (fn(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...Sn(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	return r ? bn(a, r, Cn) : a;
};
function Cn(e) {
	return !Ge(e) || e.closest("[inert]") ? !1 : e.matches(xn) && et(e);
}
function wn(e, t = {}) {
	if (!e) return [];
	let { includeContainer: n, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(xn));
	n && Tn(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (Tn(e)) {
		if (fn(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...wn(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	if (r) {
		let e = bn(a, r, Tn);
		return !e.length && n ? i : e;
	}
	return !a.length && n ? i : a;
}
function Tn(e) {
	return Ge(e) && e.tabIndex > 0 ? !0 : !Cn(e) || gn(e) ? !1 : vn(e);
}
function En(e, t = {}) {
	let n = wn(e, t);
	return [n[0] || null, n[n.length - 1] || null];
}
function Dn(e) {
	return e.tabIndex < 0 && (pn.test(e.localName) || rt(e)) && !hn(e) ? 0 : e.tabIndex;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function On(e) {
	let { root: t, getInitialEl: n, filter: r, enabled: i = !0 } = e;
	if (!i) return;
	let a = typeof n == "function" ? n() : n;
	return a ||= t?.querySelector("[data-autofocus],[autofocus]"), a ||= wn(t).filter((e) => !r || r(e)).find((e) => !e.hasAttribute("data-no-autofocus")), a || t || void 0;
}
function kn(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let [n, r] = En(t);
	return !(tt(n) && e.shiftKey || tt(r) && !e.shiftKey || !n && !r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/raf.mjs
var An = class e {
	constructor() {
		je(this, "id", null), je(this, "fn_cleanup"), je(this, "cleanup", () => {
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
	let t = An.create();
	return t.request(e), t.cleanup;
}
function jn(e) {
	let t = /* @__PURE__ */ new Set();
	function n(e) {
		let n = globalThis.requestAnimationFrame(e);
		t.add(() => globalThis.cancelAnimationFrame(n));
	}
	return n(() => n(e)), function() {
		t.forEach((e) => e());
	};
}
function Mn(e, t, n) {
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
function Nn(e, t) {
	if (!e) return;
	let { attributes: n, callback: r } = t, i = new (e.ownerDocument.defaultView || window).MutationObserver((e) => {
		for (let t of e) t.type === "attributes" && t.attributeName && n.includes(t.attributeName) && r(t);
	});
	return i.observe(e, {
		attributes: !0,
		attributeFilter: n
	}), () => i.disconnect();
}
function Pn(e, t) {
	let { defer: n } = t, r = n ? q : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Nn(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/navigate.mjs
function Fn(e) {
	let t = () => {
		let t = st(e);
		e.dispatchEvent(new t.MouseEvent("click"));
	};
	Ht() ? Mn(e, "keyup", t) : queueMicrotask(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/overflow.mjs
function In(e) {
	let t = lt(e);
	return Ye(t) ? at(t).body : Ge(t) && Bn(t) ? t : In(t);
}
function Ln(e, t = []) {
	let n = In(e), r = n === e.ownerDocument.body, i = st(n);
	return r ? t.concat(i, i.visualViewport || [], Bn(n) ? n : []) : t.concat(n, Ln(n, []));
}
var Rn = /auto|scroll|overlay|hidden|clip/, zn = /* @__PURE__ */ new Set(["inline", "contents"]);
function Bn(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = st(e).getComputedStyle(e);
	return Rn.test(t + r + n) && !zn.has(i);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/text-selection.mjs
var Vn = "default", Hn = "", Un = /* @__PURE__ */ new WeakMap();
function Wn(e = {}) {
	let { target: t, doc: n } = e, r = n ?? document, i = r.documentElement;
	return Rt() ? (Vn === "default" && (Hn = i.style.webkitUserSelect, i.style.webkitUserSelect = "none"), Vn = "disabled") : t && (Un.set(t, t.style.userSelect), t.style.userSelect = "none"), () => Gn({
		target: t,
		doc: r
	});
}
function Gn(e = {}) {
	let { target: t, doc: n } = e, r = (n ?? document).documentElement;
	if (Rt()) {
		if (Vn !== "disabled") return;
		Vn = "restoring", setTimeout(() => {
			jn(() => {
				Vn === "restoring" && (r.style.webkitUserSelect === "none" && (r.style.webkitUserSelect = Hn || ""), Hn = "", Vn = "default");
			});
		}, 300);
	} else if (t && Un.has(t)) {
		let e = Un.get(t);
		t.style.userSelect === "none" && (t.style.userSelect = e ?? ""), t.getAttribute("style") === "" && t.removeAttribute("style"), Un.delete(t);
	}
}
function Kn(e = {}) {
	let { defer: t, target: n, ...r } = e, i = t ? q : (e) => e(), a = [];
	return a.push(i(() => {
		let e = typeof n == "function" ? n() : n;
		a.push(Wn({
			...r,
			target: e
		}));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/proxy-tab-focus.mjs
function qn(e) {
	return e == null ? null : typeof e == "function" ? e() : e;
}
function Jn(e, t, n) {
	if (!t) return null;
	let r = wn(e.ownerDocument.body, { getShadowRoot: n }), i = r.indexOf(t);
	if (i === -1) return null;
	for (let t = i + 1; t < r.length; t++) {
		let n = r[t];
		if (!it(e, n)) return n;
	}
	return null;
}
function Yn(e, t = {}) {
	let { triggerElement: n, onFocus: r, onFocusEnter: i, getShadowRoot: a } = t, o = (qn(e) ?? qn(n))?.ownerDocument || document;
	function s(t) {
		if (t.key !== "Tab") return;
		let o = qn(e), s = qn(n);
		if (!o) return;
		let [c, l] = En(o, {
			includeContainer: !0,
			getShadowRoot: a
		}), u = !c && !l, d = null;
		t.shiftKey && (tt(c) || u) ? d = s : !t.shiftKey && tt(s) ? (i?.(), d = c) : !t.shiftKey && (tt(l) || u) ? d = Jn(o, s, a) : t.shiftKey && tt(Jn(o, s, a)) && (i?.(), d = l), d && (t.preventDefault(), typeof r == "function" ? r(d) : d.focus());
	}
	return cn(o, "keydown", s, !0);
}
function Xn(e, t) {
	let { defer: n, ...r } = t, i = n ? q : (e) => e(), a = [];
	return a.push(i(() => {
		a.push(Yn(e, r));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/query.mjs
function Zn(e, t) {
	return Array.from(e?.querySelectorAll(t) ?? []);
}
function Qn(e, t) {
	return e?.querySelector(t) ?? null;
}
var $n = (e) => e.id;
function er(e, t, n = $n) {
	return e.find((e) => n(e) === t);
}
function tr(e, t, n = $n) {
	let r = er(e, t, n);
	return r ? e.indexOf(r) : -1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/scroll.mjs
function nr(e) {
	return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth;
}
function rr(e, t) {
	let { rootEl: n, ...r } = t || {};
	e && n && Bn(n) && nr(n) && e.scrollIntoView(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/searchable.mjs
var ir = (e) => e.split("").map((e) => {
	let t = e.charCodeAt(0);
	return t > 0 && t < 128 ? e : t >= 128 && t <= 255 ? `/x${t.toString(16)}`.replace("/", "\\") : "";
}).join("").trim(), ar = (e) => ir(e.dataset?.valuetext ?? e.textContent ?? ""), or = (e, t) => e.trim().toLowerCase().startsWith(t.toLowerCase());
function sr(e, t, n, r = $n) {
	let i = n ? tr(e, n, r) : -1, a = n ? Ne(e, i) : e;
	return t.length === 1 && (a = a.filter((e) => r(e) !== n)), a.find((e) => or(ar(e), t));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/set.mjs
function cr(e, t) {
	if (!e) return Pe;
	let n = Object.keys(t).reduce((t, n) => (t[n] = e.style.getPropertyValue(n), t), {});
	return ur(n, t) ? Pe : (Object.assign(e.style, t), () => {
		Object.assign(e.style, n), e.style.length === 0 && e.removeAttribute("style");
	});
}
function lr(e, t, n) {
	if (!e) return Pe;
	let r = e.style.getPropertyValue(t);
	return r === n ? Pe : (e.style.setProperty(t, n), () => {
		e.style.setProperty(t, r), e.style.length === 0 && e.removeAttribute("style");
	});
}
function ur(e, t) {
	return Object.keys(e).every((n) => e[n] === t[n]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function dr(e, t) {
	let { state: n, activeId: r, key: i, timeout: a = 350, itemToId: o } = t, s = n.keysSoFar + i, c = s.length > 1 && Array.from(s).every((e) => e === s[0]) ? s[0] : s, l = sr(e.slice(), c, r, o);
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
var fr = /* @__PURE__ */ Object.assign(dr, {
	defaultOptions: {
		keysSoFar: "",
		timer: -1
	},
	isValidEvent: pr
});
function pr(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/wait-for.mjs
function mr(e, t, n) {
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
function hr(e, t) {
	let { timeout: n, rootNode: r } = t, i = st(r), a = at(r), o = new i.AbortController();
	return mr(new Promise((t) => {
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
function gr(e, t, n = {}) {
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
var _r = (e) => typeof e == "function", vr = (e, ...t) => _r(e) ? e(...t) : e;
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-context.js
function yr(e, t) {
	return `${e} returned \`undefined\`. Seems you forgot to wrap component within ${t}`;
}
var br = (e) => {
	let { name: t, strict: n = !0, hookName: r = "useContext", providerName: i = "Provider", errorMessage: a, defaultValue: o } = e, s = Symbol(t);
	return [
		(e) => A(s, e),
		() => {
			let e = k(s);
			if (n && !e) throw Error(a ?? yr(r, i));
			return e ? ne(s) : o;
		},
		s
	];
}, [xr, Sr] = br({
	name: "EnvironmentContext",
	strict: !1,
	defaultValue: () => ({
		getRootNode: () => document,
		getDocument: () => document,
		getWindow: () => window
	})
}), Cr = o("<span hidden=\"\"></span>"), wr = o("<!> <!>", 1);
function Tr(t, n) {
	U(n, !0);
	let r = F(n, "value", 7), a = F(n, "children", 7), o = M(null), s = () => vr(r()) ?? x(o)?.ownerDocument ?? document, c = R(() => ({
		getRootNode: s,
		getDocument: () => at(s()),
		getWindow: () => st(s())
	}));
	xr(() => x(c));
	var l = {
		get value() {
			return r();
		},
		set value(e) {
			r(e), W();
		},
		get children() {
			return a();
		},
		set children(e) {
			a(e), W();
		}
	}, u = wr(), d = T(u);
	I(d, () => a() ?? P);
	var f = E(d, 2), p = (t) => {
		var n = Cr();
		ue(n, (t) => e(o, t), () => x(o)), m(t, n);
	};
	return i(f, (e) => {
		r() || e(p);
	}), m(t, u), B(l);
}
H(Tr, {
	value: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-split-props.js
var Er = () => (e, t) => t.reduce((e, t) => {
	let [n, r] = e, i = t;
	return r[i] !== void 0 && (n[i] = r[i]), delete r[i], [n, r];
}, [{}, { ...e }]), [Dr, Or] = br({
	name: "RenderStrategyContext",
	hookName: "useRenderStrategyContext",
	providerName: "<RenderStrategyPropsProvider />"
}), kr = Er(), Ar = (e) => kr(e, ["lazyMount", "unmountOnExit"]), jr = Object.defineProperty, Mr = (e) => {
	throw TypeError(e);
}, Nr = (e, t, n) => t in e ? jr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, Pr = (e, t, n) => Nr(e, typeof t == "symbol" ? t : t + "", n), Fr = (e, t, n) => t.has(e) || Mr("Cannot " + n), Ir = (e, t, n) => (Fr(e, t, "read from private field"), n ? n.call(e) : t.get(e)), Lr = (e, t, n) => t.has(e) ? Mr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/array.mjs
function Rr(e) {
	return e == null ? [] : Array.isArray(e) ? e : [e];
}
var zr = (e) => e[0], Br = (e) => e[e.length - 1], Vr = (e, t) => e.indexOf(t) !== -1, Hr = (e, ...t) => e.concat(t), Ur = (e, ...t) => e.filter((e) => !t.includes(e)), Wr = (e) => Array.from(new Set(e)), Gr = (e, t) => Vr(e, t) ? Ur(e, t) : Hr(e, t);
function Kr(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n, a = t + r, o = e.length, s = o - 1;
	return t === -1 ? r > 0 ? 0 : s : a < 0 ? i ? s : 0 : a >= o ? i ? 0 : t > o ? o : t : a;
}
function qr(e, t, n = {}) {
	return e[Kr(e, t, n)];
}
function Jr(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n;
	return Kr(e, t, {
		step: -r,
		loop: i
	});
}
function Yr(e, t, n = {}) {
	return e[Jr(e, t, n)];
}
function Xr(e, t) {
	return e.reduce((e, n, r) => (r % t === 0 ? e.push([n]) : Br(e)?.push(n), e), []);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/equal.mjs
var Zr = (e) => e?.constructor.name === "Array", Qr = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!$r(e[n], t[n])) return !1;
	return !0;
}, $r = (e, t) => {
	if (Object.is(e, t)) return !0;
	if (e == null && t != null || e != null && t == null) return !1;
	if (typeof e?.isEqual == "function" && typeof t?.isEqual == "function") return e.isEqual(t);
	if (typeof e == "function" && typeof t == "function") return e.toString() === t.toString();
	if (Zr(e) && Zr(t)) return Qr(Array.from(e), Array.from(t));
	if (typeof e != "object" || typeof t != "object") return !1;
	let n = Object.keys(t ?? /* @__PURE__ */ Object.create(null)), r = n.length;
	for (let t = 0; t < r; t++) if (!Reflect.has(e, n[t])) return !1;
	for (let i = 0; i < r; i++) {
		let r = n[i];
		if (!$r(e[r], t[r])) return !1;
	}
	return !0;
}, ei = (e) => Array.isArray(e), ti = (e) => e === !0 || e === !1, ni = (e) => typeof e == "object" && !!e, ri = (e) => ni(e) && !ei(e), ii = (e) => typeof e == "string", ai = (e) => typeof e == "function", oi = (e) => e == null, si = (e, t) => Object.prototype.hasOwnProperty.call(e, t), ci = (e) => Object.prototype.toString.call(e), li = Function.prototype.toString, ui = li.call(Object), di = (e) => {
	if (!ni(e) || ci(e) != "[object Object]" || mi(e)) return !1;
	let t = Object.getPrototypeOf(e);
	if (t === null) return !0;
	let n = si(t, "constructor") && t.constructor;
	return typeof n == "function" && n instanceof n && li.call(n) == ui;
}, fi = (e) => typeof e == "object" && !!e && "$$typeof" in e && "props" in e, pi = (e) => typeof e == "object" && !!e && "__v_isVNode" in e, mi = (e) => fi(e) || pi(e), hi = (e, ...t) => (typeof e == "function" ? e(...t) : e) ?? void 0, gi = (e) => e, _i = (e) => e(), vi = () => {}, yi = (...e) => (...t) => {
	e.forEach(function(e) {
		e?.(...t);
	});
}, bi = /* @__PURE__ */ (() => {
	let e = 0;
	return () => (e++, e.toString(36));
})();
function xi(e, t, ...n) {
	if (e in t) {
		let r = t[e];
		return ai(r) ? r(...n) : r;
	}
	let r = /* @__PURE__ */ Error(`No matching key: ${JSON.stringify(e)} in ${JSON.stringify(Object.keys(t))}`);
	throw Error.captureStackTrace?.(r, xi), r;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/number.mjs
var { floor: Si, abs: Ci, round: wi, min: Ti, max: Ei, pow: Di, sign: Oi } = Math, ki = (e) => Number.isNaN(e), Ai = (e) => ki(e) ? 0 : e, ji = (e, t, n) => {
	let r = Ai(e);
	return (t == null || r >= t) && (n == null || r <= n);
}, Mi = (e, t, n) => Ti(Ei(Ai(e), t), n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/object.mjs
function Ni(e) {
	if (!di(e) || e === void 0) return e;
	let t = Reflect.ownKeys(e).filter((e) => typeof e == "string"), n = {};
	for (let r of t) {
		let t = e[r];
		t !== void 0 && (n[r] = Ni(t));
	}
	return n;
}
function Pi(e, t) {
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
function Fi(e, t = Object.is) {
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
var Ii = () => performance.now(), Li, Ri = class {
	constructor(e) {
		Pr(this, "onTick", e), Pr(this, "frameId", null), Pr(this, "pausedAtMs", null), Pr(this, "context"), Pr(this, "cancelFrame", () => {
			this.frameId !== null && (cancelAnimationFrame(this.frameId), this.frameId = null);
		}), Pr(this, "setStartMs", (e) => {
			this.context.startMs = e;
		}), Pr(this, "start", () => {
			if (this.frameId !== null) return;
			let e = Ii();
			this.pausedAtMs === null ? this.context.startMs = e : (this.context.startMs += e - this.pausedAtMs, this.pausedAtMs = null), this.frameId = requestAnimationFrame(Ir(this, Li));
		}), Pr(this, "pause", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = Ii());
		}), Pr(this, "stop", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = null);
		}), Lr(this, Li, (e) => {
			if (this.context.now = e, this.context.deltaMs = e - this.context.startMs, this.onTick(this.context) === !1) {
				this.stop();
				return;
			}
			this.frameId = requestAnimationFrame(Ir(this, Li));
		}), this.context = {
			now: 0,
			startMs: Ii(),
			deltaMs: 0
		};
	}
	get elapsedMs() {
		return this.pausedAtMs === null ? Ii() - this.context.startMs : this.pausedAtMs - this.context.startMs;
	}
};
Li = /* @__PURE__ */ new WeakMap();
function zi(e, t) {
	let n = new Ri(({ deltaMs: n }) => {
		if (n >= t) return e(), !1;
	});
	return n.start(), () => n.stop();
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/warning.mjs
function Bi(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	(e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production" && console.warn(t);
}
function Vi(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	if ((e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production") throw Error(t);
}
function Hi(e, t) {
	if (e == null) throw Error(t());
}
function Ui(e, t, n) {
	let r = [];
	for (let n of t) e[n] ?? r.push(n);
	if (r.length > 0) throw Error(`[zag-js${n ? ` > ${n}` : ""}] missing required props: ${r.join(", ")}`);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/merge-props.mjs
var Wi = (...e) => e.map((e) => e?.trim?.()).filter(Boolean).join(" "), Gi = (...e) => Array.from(new Set(Wi(...e).split(/\s+/).filter(Boolean))).join(" "), Ki = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, qi = (e) => {
	let t = {}, n;
	for (; n = Ki.exec(e);) t[n[1]] = n[2];
	return t;
}, Ji = (e, t) => {
	if (ii(e)) {
		if (ii(t)) return `${e};${t}`;
		e = qi(e);
	} else ii(t) && (t = qi(t));
	return Object.assign({}, e ?? {}, t ?? {});
};
function Yi(...e) {
	let t = {};
	for (let n of e) {
		if (!n) continue;
		for (let e in t) {
			if (e.startsWith("on") && typeof t[e] == "function" && typeof n[e] == "function") {
				t[e] = yi(n[e], t[e]);
				continue;
			}
			if (e === "className" || e === "class") {
				t[e] = Wi(t[e], n[e]);
				continue;
			}
			if (e === "style") {
				t[e] = Ji(t[e], n[e]);
				continue;
			}
			if (e === "data-ownedby") {
				t[e] = Gi(t[e], n[e]);
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
function Xi(e, t, n) {
	let r = [], i;
	return (a) => {
		let o = e(a);
		return o.length !== r.length || o.some((e, t) => !$r(r[t], e)) ? (r = o, i = t(o, a), n?.onChange?.(i), i) : i;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/state.mjs
var Zi = ".", Qi = "#", $i = /* @__PURE__ */ new WeakMap(), ea = /* @__PURE__ */ new WeakMap();
function ta(e) {
	return e.join(Zi);
}
function na(e) {
	return e.includes(Zi);
}
function ra(e) {
	return e.startsWith(Qi);
}
function ia(e) {
	return e.startsWith(Zi);
}
function aa(e) {
	return ra(e) ? e.slice(Qi.length) : e;
}
function oa(e, t) {
	return e ? `${e}${Zi}${t}` : t;
}
function sa(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e, i) => {
		t.set(e, i);
		let a = i.id;
		a && (n.has(a) && Vi(`[zag-js] Duplicate state id: "${a}"`), n.set(a, e));
		let o = i.states;
		if (o) {
			Hi(i.initial, () => `[zag-js] Compound state "${e}" has child states but no "initial" property`), i.initial in o || Vi(`[zag-js] Compound state "${e}" has initial "${String(i.initial)}" which is not a child state`);
			for (let [t, n] of Object.entries(o)) {
				if (!n) continue;
				let i = oa(e, t);
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
function ca(e) {
	let t = $i.get(e);
	if (t) return t;
	let { index: n, idIndex: r } = sa(e);
	return $i.set(e, n), ea.set(e, r), n;
}
function la(e, t) {
	return ca(e), ea.get(e)?.get(t);
}
function ua(e) {
	return e ? String(e).split(Zi).filter(Boolean) : [];
}
function da(e, t) {
	if (!t) return [];
	let n = ca(e), r = ua(t), i = [], a = [];
	for (let e of r) {
		a.push(e);
		let t = ta(a), r = n.get(t);
		if (!r) break;
		i.push({
			path: t,
			state: r
		});
	}
	return i;
}
function fa(e, t) {
	let n = ca(e), r = ua(t);
	if (!r.length) return t;
	let i = [];
	for (let e of r) {
		i.push(e);
		let r = ta(i);
		if (!n.has(r)) return t;
	}
	let a = ta(i), o = n.get(a);
	for (; o?.initial;) {
		let e = `${a}${Zi}${o.initial}`, t = n.get(e);
		if (!t) break;
		a = e, o = t;
	}
	return a;
}
function pa(e, t) {
	return ca(e).has(t);
}
function ma(e, t, n) {
	let r = String(t);
	if (ra(r)) {
		let t = aa(r), n = la(e, t);
		return Hi(n, () => `[zag-js] Unknown state id: "${t}"`), fa(e, n);
	}
	if (ia(r) && n) return fa(e, oa(n, r.slice(1)));
	if (!na(r) && n) {
		let t = ua(n);
		for (let n = t.length - 1; n >= 1; n--) {
			let i = oa(t.slice(0, n).join(Zi), r);
			if (pa(e, i)) return fa(e, i);
		}
		if (pa(e, r)) return fa(e, r);
	}
	return fa(e, r);
}
function ha(e, t, n) {
	let r = da(e, t);
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
function ga(e, t, n, r) {
	let i = t ? da(e, t) : [], a = da(e, n), o = 0;
	for (; o < i.length && o < a.length && i[o]?.path === a[o]?.path;) o += 1;
	let s = i.slice(o).reverse(), c = a.slice(o), l = i[i.length - 1]?.path === a[a.length - 1]?.path;
	return r && l && (s = i.slice().reverse(), c = a), {
		exiting: s,
		entering: c
	};
}
function _a(e, t) {
	return e ? e === t || e.startsWith(`${t}${Zi}`) : !1;
}
function va(e, t, n) {
	return da(e, t).some((e) => e.state.tags?.includes(n));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/create-machine.mjs
function ya() {
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
function ba(e) {
	return ca(e), e;
}
function xa() {
	return {
		guards: ya(),
		createMachine: (e) => ba(e),
		choose: (e) => function({ choose: t }) {
			return t(e)?.actions;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/types.mjs
var Sa = /* @__PURE__ */ ((e) => (e.NotStarted = "Not Started", e.Started = "Started", e.Stopped = "Stopped", e))(Sa || {}), Ca = "__init__";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/scope.mjs
function wa(e) {
	let t = () => e.getRootNode?.() ?? document, n = () => at(t()), r = () => n().defaultView ?? window, i = () => ct(t()), a = (e) => t().getElementById(e);
	return {
		...e,
		getRootNode: t,
		getDoc: n,
		getWin: r,
		getActiveElement: i,
		isActiveElement: tt,
		getById: a
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+types@1.43.3/node_modules/@zag-js/types/dist/prop-types.mjs
function Ta(e) {
	return new Proxy({}, { get(t, n) {
		return n === "style" ? (t) => e({ style: t }).style : e;
	} });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/normalize-props.js
var Ea = {
	className: "class",
	defaultChecked: "checked",
	defaultValue: "value",
	htmlFor: "for",
	onBlur: "onfocusout",
	onChange: "oninput",
	onFocus: "onfocusin",
	onDoubleClick: "ondblclick"
};
function Da(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		r != null && (n.startsWith("--") || (n = n.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)), t += `${n}:${r};`);
	}
	return t;
}
var Oa = new Set("viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(","));
function ka(e) {
	return e in Ea ? Ea[e] : Oa.has(e) ? e : e.toLowerCase();
}
function Aa(e, t) {
	return e === "style" && typeof t == "object" ? Da(t) : t;
}
var ja = Ta((e) => {
	let t = {};
	for (let n in e) t[ka(n)] = Aa(n, e[n]);
	return t;
}), Ma = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, Na = (e) => {
	let t = {}, n;
	for (; n = Ma.exec(e);) t[n[1]] = n[2];
	return t;
};
function J(...e) {
	let t = [];
	for (let n of e) n && "class" in n && n.class != null && t.push(n.class);
	let n = Yi(...e);
	return t.length > 0 && (n.class = t.length === 1 ? t[0] : t), "style" in n && (typeof n.style == "string" && (n.style = Na(n.style)), n.style = Da(n.style)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/bindable.svelte.js
function Pa(t) {
	let n = t().value ?? t().defaultValue, r = t().isEqual ?? Object.is, i = M(_(n)), a = R(() => t().value !== void 0), o = { current: C(() => x(i)) }, s = { current: void 0 };
	ce(() => {
		let e = x(a) ? t().value : x(i);
		o = { current: e }, s = { current: e };
	});
	let c = (n) => {
		let c = ai(n) ? n(o.current) : n, l = s.current;
		t().debug && console.log(`[bindable > ${t().debug}] setValue`, {
			next: c,
			prev: l
		}), x(a) || e(i, c, !0), r(c, l) || t().onChange?.(c, l);
	};
	function l() {
		return x(a) ? t().value : x(i);
	}
	return {
		initial: n,
		ref: o,
		get: l,
		set(e) {
			let n = t().sync ? W : _i;
			C(() => n(() => c(e)));
		},
		invoke(e, n) {
			t().onChange?.(e, n);
		},
		hash(e) {
			return t().hash?.(e) ?? String(e);
		}
	};
}
Pa.cleanup = (e) => {
	re(() => e());
}, Pa.ref = (e) => {
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
function Fa(e) {
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
var Ia = (e) => typeof e == "function" ? e() : e, La = (e, t) => {
	let n = [], r = !0;
	d(() => {
		if (r) {
			n = e.map((e) => Ia(e)), r = !1;
			return;
		}
		let i = !1;
		for (let t = 0; t < e.length; t++) if (!$r(n[t], Ia(e[t]))) {
			i = !0;
			break;
		}
		i && (n = e.map((e) => Ia(e)), t());
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/machine.svelte.js
function Ra(e) {
	return ai(e) ? e() : e;
}
function za(e, n) {
	let r = R(() => {
		let { id: e, ids: t, getRootNode: r } = Ra(n);
		return wa({
			id: e,
			ids: t,
			getRootNode: r
		});
	}), i = (...t) => {
		e.debug && console.log(...t);
	}, a = R(() => e.props?.({
		props: Ni(Ra(n)),
		scope: x(r)
	}) ?? Ra(n)), o = Ba(() => x(a)), s = e.context?.({
		prop: o,
		bindable: Pa,
		get scope() {
			return x(r);
		},
		flush: Va,
		getContext() {
			return c;
		},
		getComputed() {
			return S;
		},
		getRefs() {
			return h;
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
		...C,
		hasTag(t) {
			return va(e, C.get(), t);
		},
		matches(...e) {
			let t = C.get();
			return e.some((e) => _a(t, e));
		}
	}), h = Fa(e.refs?.({
		prop: o,
		context: c
	}) ?? {}), g = () => ({
		state: m(),
		context: c,
		event: p(),
		prop: o,
		send: T,
		action: _,
		guard: v,
		track: La,
		refs: h,
		computed: S,
		flush: Va,
		scope: x(r),
		choose: b
	}), _ = (t) => {
		let n = ai(t) ? t(g()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.actions?.[t];
			return n || Bi(`[zag-js] No implementation found for action "${JSON.stringify(t)}"`), n;
		});
		for (let e of r) e?.(g());
	}, v = (t) => {
		if (ai(t)) return t(g());
		let n = e.implementations?.guards?.[t];
		return n || Bi(`[zag-js] No implementation found for guard "${JSON.stringify(t)}"`), n?.(g());
	}, y = (t) => {
		let n = ai(t) ? t(g()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.effects?.[t];
			return n || Bi(`[zag-js] No implementation found for effect "${JSON.stringify(t)}"`), n;
		}), i = [];
		for (let e of r) {
			let t = e?.(g());
			t && i.push(t);
		}
		return () => i.forEach((e) => e?.());
	}, b = (e) => Rr(e).find((e) => {
		let t = !e.guard;
		return ii(e.guard) ? t = !!v(e.guard) : ai(e.guard) && (t = e.guard(g())), t;
	}), S = (t) => {
		Hi(e.computed, () => "[zag-js] No computed object found on machine");
		let n = e.computed[t];
		return n({
			context: c,
			event: p(),
			prop: o,
			refs: h,
			scope: x(r),
			computed: S
		});
	}, C = Pa(() => ({
		defaultValue: ma(e, e.initialState({ prop: o })),
		onChange(t, n) {
			let { exiting: r, entering: i } = ga(e, n, t, u.current?.reenter);
			if (r.forEach((e) => {
				l.get(e.path)?.(), l.delete(e.path);
			}), r.forEach((e) => {
				_(e.state?.exit);
			}), _(u.current?.actions), i.forEach((e) => {
				let t = y(e.state?.effects);
				if (t) {
					let n = l.get(e.path);
					l.set(e.path, n ? yi(n, t) : t);
				}
			}), n === "__init__") {
				_(e.entry);
				let t = y(e.effects);
				if (t) {
					let e = l.get(Ca);
					l.set(Ca, e ? yi(e, t) : t);
				}
			}
			i.forEach((e) => {
				_(e.state?.entry);
			});
		}
	})), w = Sa.NotStarted;
	t(() => {
		let e = w === Sa.Started;
		w = Sa.Started, i(e ? "rehydrating..." : "initializing..."), C.invoke(C.initial, Ca);
	}), re(() => {
		w === Sa.Started && (i("unmounting..."), w = Sa.Stopped, l.forEach((e) => e?.()), l = /* @__PURE__ */ new Map(), u.current = null, _(e.exit));
	});
	let T = (t) => {
		if (w !== Sa.Started) return;
		d.current = f.current, f.current = t;
		let n = C.get(), { transitions: r, source: a } = ha(e, n, t.type), o = b(r);
		if (!o) return;
		u.current = o;
		let s = ma(e, o.target ?? n, a);
		i("transition", t.type, o.target || n, `(${o.actions})`), s === n ? o.reenter ? C.invoke(n, n) : _(o.actions) : C.set(s);
	};
	return e.watch?.(g()), {
		get state() {
			return m();
		},
		send: T,
		context: c,
		prop: o,
		get scope() {
			return x(r);
		},
		refs: h,
		computed: S,
		get event() {
			return p();
		},
		getStatus: () => w
	};
}
function Ba(e) {
	return function(t) {
		return e()[t];
	};
}
function Va(e) {
	W(() => {
		queueMicrotask(() => e());
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/tags.js
var Ha = [
	"path",
	"rect",
	"circle",
	"ellipse",
	"line",
	"polygon",
	"polyline"
], Ua = (e) => typeof e == "string" && Ha.includes(e), Wa = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link"
], Ga = (e) => typeof e == "string" && Wa.includes(e), Ka = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"as",
	"ref"
]);
function qa(e, t) {
	U(t, !0);
	let n = F(t, "as", 7), r = F(t, "ref", 15, null), i = O(t, Ka);
	var a = {
		get as() {
			return n();
		},
		set as(e) {
			n(e), W();
		},
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), W();
		}
	}, o = g(), s = T(o);
	return he(s, n, !0, (e, t) => {
		ue(e, (e) => r(e), () => r()), fe(e, () => ({ ...i }));
	}), m(e, o), B(a);
}
H(qa, {
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/factory/factory.svelte
var Ja = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"asChild",
	"children",
	"as",
	"ref"
]), Ya = o("<textarea></textarea>");
function Y(e, t) {
	U(t, !0);
	let n = F(t, "asChild", 7), r = F(t, "children", 7), a = F(t, "as", 7), o = F(t, "ref", 15, null), s = O(t, Ja), c = (e) => J(s, e ?? {});
	var l = {
		get asChild() {
			return n();
		},
		set asChild(e) {
			n(e), W();
		},
		get children() {
			return r();
		},
		set children(e) {
			r(e), W();
		},
		get as() {
			return a();
		},
		set as(e) {
			a(e), W();
		},
		get ref() {
			return o();
		},
		set ref(e = null) {
			o(e), W();
		}
	}, u = g(), d = T(u), f = (e) => {
		var t = g(), r = T(t);
		I(r, () => n() ?? P, () => c), m(e, t);
	}, p = (e) => {
		qa(e, z({ get as() {
			return a();
		} }, () => s, {
			get ref() {
				return o();
			},
			set ref(e) {
				o(e);
			}
		}));
	}, h = R(() => Ua(a())), _ = (e) => {
		var t = g(), n = T(t);
		he(n, a, !1, (e, t) => {
			ue(e, (e) => o(e), () => o()), fe(e, () => ({ ...s }));
		}), m(e, t);
	}, v = R(() => Ga(a())), y = (e) => {
		var t = Ya();
		le(t), fe(t, () => ({ ...s })), ue(t, (e) => o(e), () => o()), m(e, t);
	}, b = (e) => {
		var t = g(), n = T(t);
		he(n, a, !1, (e, t) => {
			ue(e, (e) => o(e), () => o()), fe(e, () => ({ ...s }));
			var n = g(), i = T(n);
			I(i, () => r() ?? P), m(t, n);
		}), m(e, t);
	};
	return i(d, (e) => {
		n() ? e(f) : x(h) ? e(p, 1) : x(v) ? e(_, 2) : a() === "textarea" ? e(y, 3) : e(b, -1);
	}), m(e, u), B(l);
}
H(Y, {
	asChild: {},
	children: {},
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+presence@1.43.3/node_modules/@zag-js/presence/dist/presence.connect.mjs
function Xa(e, t) {
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
var Za = ba({
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
				let r = new (st(n)).CustomEvent("exitcomplete", { bubbles: !1 });
				n.dispatchEvent(r);
			},
			setupNode: ({ refs: e, event: t }) => {
				e.get("node") !== t.node && (e.set("node", t.node), e.set("styles", ft(t.node)));
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
					let i = Qa(t.get("styles"));
					e.set("unmountAnimationName", i), i === "none" || i === e.get("prevAnimationName") || t.get("styles")?.display === "none" || t.get("styles")?.animationDuration === "0s" ? n({
						type: "UNMOUNT",
						src: "presence.changed"
					}) : n({ type: "UNMOUNT.SUSPEND" });
				});
			},
			setPrevAnimationName: ({ context: e, refs: t }) => {
				q(() => {
					e.set("prevAnimationName", Qa(t.get("styles")));
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
						let r = ft(e);
						if (Qa(r) === "none" || r.display === "none" || r.animationDuration === "0s") {
							n("onEnterComplete")?.();
							return;
						}
						let a = (t) => {
							Gt(t) === e && n("present") && (e.removeEventListener("animationend", a), n("onEnterComplete")?.());
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
					(n.composedPath?.()?.[0] ?? n.target) === i && e.set("prevAnimationName", Qa(t.get("styles")));
				}, o = (a) => {
					let o = Qa(t.get("styles"));
					Gt(a) === i && o === e.get("unmountAnimationName") && !r("present") && n({
						type: "UNMOUNT",
						src: "animationend"
					});
				}, s = (e) => {
					Gt(e) === i && !r("present") && n({
						type: "UNMOUNT",
						src: "animationcancel"
					});
				};
				i.addEventListener("animationstart", a), i.addEventListener("animationcancel", s), i.addEventListener("animationend", o);
				let c = cr(i, { animationFillMode: "forwards" });
				return () => {
					i.removeEventListener("animationstart", a), i.removeEventListener("animationcancel", s), i.removeEventListener("animationend", o), jn(() => c());
				};
			}
		}
	}
});
function Qa(e) {
	return e?.animationName || "none";
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/presence/use-presence.svelte.js
var $a = (t) => {
	let n = R(() => hi(t)), r = R(() => Ar(x(n))), i = R(() => V(x(r), 2)), a = R(() => x(i)[0]), o = R(() => x(i)[1]), s = za(Za, () => x(o)), c = R(() => Xa(s, ja)), l = M(!1);
	d(() => {
		x(c).present && e(l, !0);
	});
	let u = (e) => {
		e && s.send({
			type: "NODE.SET",
			node: e
		});
	}, f = R(() => !x(c).present && !x(l) && x(a).lazyMount || x(a).unmountOnExit && !x(c).present && x(l)), p = R(() => ({
		getPresenceProps: () => ({
			"data-state": x(c).skip && x(n).skipAnimationOnMount ? void 0 : x(n).present ? "open" : "closed",
			hidden: !x(c).present
		}),
		present: x(c).present,
		setNode: u,
		unmounted: x(f)
	}));
	return () => x(p);
}, eo = (e) => Er()(e, [
	"immediate",
	"lazyMount",
	"onEnterComplete",
	"onExitComplete",
	"present",
	"skipAnimationOnMount",
	"unmountOnExit"
]), [to, no] = br({ name: "PresenceContext" }), [ro, io] = br({ name: "DialogContext" }), ao = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function oo(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, ao), a = io(), o = no(), s = R(() => J(a().getContentProps(), o().getPresenceProps(), r));
	function c(e) {
		o().setNode(e);
	}
	var l = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, u = g(), d = T(u), f = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			[h()]: c,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, p = R(() => !o().unmounted);
	return i(d, (e) => {
		x(p) && e(f);
	}), m(e, u), B(l);
}
H(oo, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-description.svelte
var so = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function co(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, so), i = io(), a = R(() => J(i().getDescriptionProps(), r));
	return Y(e, z({ as: "p" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(co, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-positioner.svelte
var lo = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function uo(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, lo), a = io(), o = no(), s = R(() => J(a().getPositionerProps(), r));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, l = g(), u = T(l), d = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = R(() => !o().unmounted);
	return i(u, (e) => {
		x(f) && e(d);
	}), m(e, l), B(c);
}
H(uo, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/providers/locale/use-locale-context.js
var [fo, po] = br({
	name: "LocaleContext",
	strict: !1,
	defaultValue: () => ({
		dir: "ltr",
		locale: "en-US"
	})
});
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/utils.mjs
function mo(e, t) {
	return e - t * Math.floor(e / t);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/calendars/GregorianCalendar.mjs
var ho = 1721426;
function go(e, t, n, r) {
	t = vo(e, t);
	let i = t - 1, a = -2;
	return n <= 2 ? a = 0 : _o(t) && (a = -1), 1721425 + 365 * i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400) + Math.floor((367 * n - 362) / 12 + a + r);
}
function _o(e) {
	return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function vo(e, t) {
	return e === "BC" ? 1 - t : t;
}
function yo(e) {
	let t = "AD";
	return e <= 0 && (t = "BC", e = 1 - e), [t, e];
}
var bo = {
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
}, xo = class {
	fromJulianDay(e) {
		let t = e, n = t - ho, r = Math.floor(n / 146097), i = mo(n, 146097), a = Math.floor(i / 36524), o = mo(i, 36524), s = Math.floor(o / 1461), c = mo(o, 1461), l = Math.floor(c / 365), [u, d] = yo(r * 400 + a * 100 + s * 4 + l + +(a !== 4 && l !== 4)), f = t - go(u, d, 1, 1), p = 2;
		t < go(u, d, 3, 1) ? p = 0 : _o(d) && (p = 1);
		let m = Math.floor(((f + p) * 12 + 373) / 367);
		return new Qs(u, d, m, t - go(u, d, m, 1) + 1);
	}
	toJulianDay(e) {
		return go(e.era, e.year, e.month, e.day);
	}
	getDaysInMonth(e) {
		return bo[_o(e.year) ? "leapyear" : "standard"][e.month - 1];
	}
	getMonthsInYear(e) {
		return 12;
	}
	getDaysInYear(e) {
		return _o(e.year) ? 366 : 365;
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
}, So = {
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
function Co(e, t) {
	return t = gs(t, e.calendar), e.era === t.era && e.year === t.year && e.month === t.month && e.day === t.day;
}
function wo(e, t) {
	return t = gs(t, e.calendar), e = Ho(e), t = Ho(t), e.era === t.era && e.year === t.year && e.month === t.month;
}
function To(e, t) {
	return t = gs(t, e.calendar), e = Wo(e), t = Wo(t), e.era === t.era && e.year === t.year;
}
function Eo(e, t) {
	return ko(e.calendar, t.calendar) && Co(e, t);
}
function Do(e, t) {
	return ko(e.calendar, t.calendar) && wo(e, t);
}
function Oo(e, t) {
	return ko(e.calendar, t.calendar) && To(e, t);
}
function ko(e, t) {
	return e.isEqual?.(t) ?? t.isEqual?.(e) ?? e.identifier === t.identifier;
}
function Ao(e, t) {
	return Co(e, Po(t));
}
var jo = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};
function Mo(e, t, n) {
	let r = e.calendar.toJulianDay(e), i = n ? jo[n] : Zo(t), a = Math.ceil(r + 1 - i) % 7;
	return a < 0 && (a += 7), a;
}
function No(e) {
	return ps(Date.now(), e);
}
function Po(e) {
	return ms(No(e));
}
function Fo(e, t) {
	return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function Io(e, t) {
	return Lo(e) - Lo(t);
}
function Lo(e) {
	return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
var Ro = null, zo = !1;
function Bo() {
	return Ro ??= new Intl.DateTimeFormat().resolvedOptions().timeZone, Ro;
}
function Vo() {
	return zo;
}
function Ho(e) {
	return e.subtract({ days: e.day - 1 });
}
function Uo(e) {
	return e.add({ days: e.calendar.getDaysInMonth(e) - e.day });
}
function Wo(e) {
	return Ho(e.subtract({ months: e.month - 1 }));
}
function Go(e) {
	return Uo(e.add({ months: e.calendar.getMonthsInYear(e) - e.month }));
}
function Ko(e, t, n) {
	let r = Mo(e, t, n);
	return e.subtract({ days: r });
}
function qo(e, t, n) {
	return Ko(e, t, n).add({ days: 6 });
}
var Jo = /* @__PURE__ */ new Map(), Yo = /* @__PURE__ */ new Map();
function Xo(e) {
	if (Intl.Locale) {
		let t = Jo.get(e);
		return t || (t = new Intl.Locale(e).maximize().region, t && Jo.set(e, t)), t;
	}
	let t = e.split("-")[1];
	return t === "u" ? void 0 : t;
}
function Zo(e) {
	let t = Yo.get(e);
	if (!t) {
		if (Intl.Locale) {
			let n = new Intl.Locale(e);
			if ("getWeekInfo" in n && (t = n.getWeekInfo(), t)) return Yo.set(e, t), t.firstDay;
		}
		let n = Xo(e);
		if (e.includes("-fw-")) {
			let n = e.split("-fw-")[1].split("-")[0];
			t = n === "mon" ? { firstDay: 1 } : n === "tue" ? { firstDay: 2 } : n === "wed" ? { firstDay: 3 } : n === "thu" ? { firstDay: 4 } : n === "fri" ? { firstDay: 5 } : n === "sat" ? { firstDay: 6 } : { firstDay: 0 };
		} else t = e.includes("-ca-iso8601") ? { firstDay: 1 } : { firstDay: n && So[n] || 0 };
		Yo.set(e, t);
	}
	return t.firstDay;
}
function Qo(e, t, n) {
	let r = e.calendar.getDaysInMonth(e);
	return Math.ceil((Mo(Ho(e), t, n) + r) / 7);
}
function $o(e, t) {
	return e && t ? e.compare(t) <= 0 ? e : t : e || t;
}
function es(e, t) {
	return e && t ? e.compare(t) >= 0 ? e : t : e || t;
}
var ts = {
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
function ns(e, t) {
	let n = e.calendar.toJulianDay(e), r = Math.ceil(n + 1) % 7;
	r < 0 && (r += 7);
	let [i, a] = ts[Xo(t)] || [6, 0];
	return r === i || r === a;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/conversion.mjs
function rs(e) {
	return e = gs(e, new xo()), is(vo(e.era, e.year), e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function is(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new Date();
	return s.setUTCHours(r, i, a, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function as(e, t) {
	if (t === "UTC") return 0;
	if (e > 0 && t === Bo() && !Vo()) return new Date(e).getTimezoneOffset() * -6e4;
	let { year: n, month: r, day: i, hour: a, minute: o, second: s } = ss(e, t);
	return is(n, r, i, a, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
var os = /* @__PURE__ */ new Map();
function ss(e, t) {
	let n = os.get(t);
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
	}), os.set(t, n));
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
var cs = 864e5;
function ls(e, t, n, r) {
	return (n === r ? [n] : [n, r]).filter((n) => us(e, t, n));
}
function us(e, t, n) {
	let r = ss(n, t);
	return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function ds(e, t, n = "compatible") {
	let r = hs(e);
	if (t === "UTC") return rs(r);
	if (t === Bo() && n === "compatible" && !Vo()) {
		r = gs(r, new xo());
		let e = /* @__PURE__ */ new Date(), t = vo(r.era, r.year);
		return e.setFullYear(t, r.month - 1, r.day), e.setHours(r.hour, r.minute, r.second, r.millisecond), e.getTime();
	}
	let i = rs(r), a = as(i - cs, t), o = as(i + cs, t), s = ls(r, t, i - a, i - o);
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
function fs(e, t, n = "compatible") {
	return new Date(ds(e, t, n));
}
function ps(e, t) {
	let n = as(e, t), r = new Date(e + n), i = r.getUTCFullYear(), a = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), c = r.getUTCMinutes(), l = r.getUTCSeconds(), u = r.getUTCMilliseconds();
	return new ec(i < 1 ? "BC" : "AD", i < 1 ? -i + 1 : i, a, o, t, n, s, c, l, u);
}
function ms(e) {
	return new Qs(e.calendar, e.era, e.year, e.month, e.day);
}
function hs(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	if ("timeZone" in e) ({hour: n, minute: r, second: i, millisecond: a} = e);
	else if ("hour" in e && !t) return e;
	return t && ({hour: n, minute: r, second: i, millisecond: a} = t), new $s(e.calendar, e.era, e.year, e.month, e.day, n, r, i, a);
}
function gs(e, t) {
	if (ko(e.calendar, t)) return e;
	let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
	return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, Es(r), r;
}
function _s(e, t, n) {
	return e instanceof ec ? e.timeZone === t ? e : ys(e, t) : ps(ds(e, t, n), t);
}
function vs(e) {
	let t = rs(e) - e.offset;
	return new Date(t);
}
function ys(e, t) {
	return gs(ps(rs(e) - e.offset, t), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/manipulation.mjs
var bs = 36e5;
function xs(e, t) {
	let n = e.copy(), r = "hour" in n ? Ps(n, t) : 0;
	Ss(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, Cs(n), Ts(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, ws(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
	let i = n.calendar.getYearsInEra(n);
	if (n.year > i) {
		let e = n.calendar.isInverseEra?.(n);
		n.year = i, n.month = e ? 1 : n.calendar.getMonthsInYear(n), n.day = e ? 1 : n.calendar.getDaysInMonth(n);
	}
	n.month < 1 && (n.month = 1, n.day = 1);
	let a = n.calendar.getMonthsInYear(n);
	return n.month > a && (n.month = a, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function Ss(e, t) {
	e.calendar.isInverseEra?.(e) && (t = -t), e.year += t;
}
function Cs(e) {
	for (; e.month < 1;) Ss(e, -1), e.month += e.calendar.getMonthsInYear(e);
	let t = 0;
	for (; e.month > (t = e.calendar.getMonthsInYear(e));) e.month -= t, Ss(e, 1);
}
function ws(e) {
	for (; e.day < 1;) e.month--, Cs(e), e.day += e.calendar.getDaysInMonth(e);
	for (; e.day > e.calendar.getDaysInMonth(e);) e.day -= e.calendar.getDaysInMonth(e), e.month++, Cs(e);
}
function Ts(e) {
	e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function Es(e) {
	e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), Ts(e);
}
function Ds(e) {
	let t = {};
	for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
	return t;
}
function Os(e, t) {
	return xs(e, Ds(t));
}
function ks(e, t) {
	let n = e.copy();
	return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), Es(n), n;
}
function As(e, t) {
	let n = e.copy();
	return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), Ms(n), n;
}
function js(e) {
	e.second += Math.floor(e.millisecond / 1e3), e.millisecond = Ns(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = Ns(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = Ns(e.minute, 60);
	let t = Math.floor(e.hour / 24);
	return e.hour = Ns(e.hour, 24), t;
}
function Ms(e) {
	e.millisecond = Math.max(0, Math.min(e.millisecond, 999)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function Ns(e, t) {
	let n = e % t;
	return n < 0 && (n += t), n;
}
function Ps(e, t) {
	return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, js(e);
}
function Fs(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "era": {
			let t = e.calendar.getEras(), a = t.indexOf(e.era);
			if (a < 0) throw Error("Invalid era: " + e.era);
			a = Ls(a, n, 0, t.length - 1, r?.round), i.era = t[a], Es(i);
			break;
		}
		case "year":
			i.calendar.isInverseEra?.(i) && (n = -n), i.year = Ls(e.year, n, -Infinity, 9999, r?.round), i.year === -Infinity && (i.year = 1), i.calendar.balanceYearMonth && i.calendar.balanceYearMonth(i, e);
			break;
		case "month":
			i.month = Ls(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
			break;
		case "day":
			i.day = Ls(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return e.calendar.balanceDate && e.calendar.balanceDate(i), Es(i), i;
}
function Is(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "hour": {
			let t = e.hour, a = 0, o = 23;
			if (r?.hourCycle === 12) {
				let e = t >= 12;
				a = e ? 12 : 0, o = e ? 23 : 11;
			}
			i.hour = Ls(t, n, a, o, r?.round);
			break;
		}
		case "minute":
			i.minute = Ls(e.minute, n, 0, 59, r?.round);
			break;
		case "second":
			i.second = Ls(e.second, n, 0, 59, r?.round);
			break;
		case "millisecond":
			i.millisecond = Ls(e.millisecond, n, 0, 999, r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return i;
}
function Ls(e, t, n, r, i = !1) {
	if (i) {
		e += Math.sign(t), e < n && (e = r);
		let i = Math.abs(t);
		e = t > 0 ? Math.ceil(e / i) * i : Math.floor(e / i) * i, e > r && (e = n);
	} else e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
	return e;
}
function Rs(e, t) {
	let n;
	return n = t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0 ? ds(xs(hs(e), {
		years: t.years,
		months: t.months,
		weeks: t.weeks,
		days: t.days
	}), e.timeZone) : rs(e) - e.offset, n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5, gs(ps(n, e.timeZone), e.calendar);
}
function zs(e, t) {
	return Rs(e, Ds(t));
}
function Bs(e, t, n, r) {
	switch (t) {
		case "hour": {
			let t = 0, i = 23;
			if (r?.hourCycle === 12) {
				let n = e.hour >= 12;
				t = n ? 12 : 0, i = n ? 23 : 11;
			}
			let a = hs(e), o = gs(As(a, { hour: t }), new xo()), s = [ds(o, e.timeZone, "earlier"), ds(o, e.timeZone, "later")].filter((t) => ps(t, e.timeZone).day === o.day)[0], c = gs(As(a, { hour: i }), new xo()), l = [ds(c, e.timeZone, "earlier"), ds(c, e.timeZone, "later")].filter((t) => ps(t, e.timeZone).day === c.day).pop(), u = rs(e) - e.offset, d = Math.floor(u / bs), f = u % bs;
			return u = Ls(d, n, Math.floor(s / bs), Math.floor(l / bs), r?.round) * bs + f, gs(ps(u, e.timeZone), e.calendar);
		}
		case "minute":
		case "second":
		case "millisecond": return Is(e, t, n, r);
		case "era":
		case "year":
		case "month":
		case "day": return gs(ps(ds(Fs(hs(e), t, n, r), e.timeZone), e.timeZone), e.calendar);
		default: throw Error("Unsupported field " + t);
	}
}
function Vs(e, t, n) {
	let r = hs(e), i = As(ks(r, t), t);
	return i.compare(r) === 0 ? e : gs(ps(ds(i, e.timeZone, n), e.timeZone), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/string.mjs
var Hs = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, Us = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
function Ws(e) {
	let t = e.match(Hs);
	if (!t) throw Us.test(e) ? Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : Error("Invalid ISO 8601 date string: " + e);
	let n = new Qs(Gs(t[1], 0, 9999), Gs(t[2], 1, 12), 1);
	return n.day = Gs(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function Gs(e, t, n) {
	let r = Number(e);
	if (r < t || r > n) throw RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
	return r;
}
function Ks(e) {
	return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function qs(e) {
	let t = gs(e, new xo()), n;
	return n = t.era === "BC" ? t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function Js(e) {
	return `${qs(e)}T${Ks(e)}`;
}
function Ys(e) {
	let t = Math.sign(e) < 0 ? "-" : "+";
	e = Math.abs(e);
	let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), i = Math.floor(e % 36e5 % 6e4 / 1e3), a = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
	return i !== 0 && (a += `:${String(i).padStart(2, "0")}`), a;
}
function Xs(e) {
	return `${Js(e)}${Ys(e.offset)}[${e.timeZone}]`;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/CalendarDate.mjs
function Zs(e) {
	let t = typeof e[0] == "object" ? e.shift() : new xo(), n;
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
var Qs = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Zs(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, Es(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day) : new e(this.calendar, this.year, this.month, this.day);
	}
	add(e) {
		return xs(this, e);
	}
	subtract(e) {
		return Os(this, e);
	}
	set(e) {
		return ks(this, e);
	}
	cycle(e, t, n) {
		return Fs(this, e, t, n);
	}
	toDate(e) {
		return fs(this, e);
	}
	toString() {
		return qs(this);
	}
	compare(e) {
		return Fo(this, e);
	}
}, $s = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Zs(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, Es(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return xs(this, e);
	}
	subtract(e) {
		return Os(this, e);
	}
	set(e) {
		return ks(As(this, e), e);
	}
	cycle(e, t, n) {
		switch (e) {
			case "era":
			case "year":
			case "month":
			case "day": return Fs(this, e, t, n);
			default: return Is(this, e, t, n);
		}
	}
	toDate(e, t) {
		return fs(this, e, t);
	}
	toString() {
		return Js(this);
	}
	compare(e) {
		let t = Fo(this, e);
		return t === 0 ? Io(this, hs(e)) : t;
	}
}, ec = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Zs(e), o = e.shift(), s = e.shift();
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.timeZone = o, this.offset = s, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, Es(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return Rs(this, e);
	}
	subtract(e) {
		return zs(this, e);
	}
	set(e, t) {
		return Vs(this, e, t);
	}
	cycle(e, t, n) {
		return Bs(this, e, t, n);
	}
	toDate() {
		return vs(this);
	}
	toString() {
		return Xs(this);
	}
	toAbsoluteString() {
		return this.toDate().toISOString();
	}
	compare(e) {
		return this.toDate().getTime() - _s(e, this.timeZone).toDate().getTime();
	}
}, tc = /* @__PURE__ */ new Map(), nc = class {
	constructor(e, t = {}) {
		this.formatter = ic(e, t), this.options = t;
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
		return cc() && (this.resolvedHourCycle ||= lc(e.locale, this.options), e.hourCycle = this.resolvedHourCycle, e.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), e.calendar === "ethiopic-amete-alem" && (e.calendar = "ethioaa"), e;
	}
}, rc = {
	true: { ja: "h11" },
	false: {}
};
function ic(e, t = {}) {
	if (typeof t.hour12 == "boolean" && oc()) {
		t = { ...t };
		let n = rc[String(t.hour12)][e.split("-")[0]], r = t.hour12 ? "h12" : "h23";
		t.hourCycle = n ?? r, delete t.hour12;
	}
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (tc.has(n)) return tc.get(n);
	let r = new Intl.DateTimeFormat(e, t);
	return tc.set(n, r), r;
}
var ac = null;
function oc() {
	return ac ??= new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		hour12: !1
	}).format(new Date(2020, 2, 3, 0)) === "24", ac;
}
var sc = null;
function cc() {
	return sc ??= new Intl.DateTimeFormat("fr", {
		hour: "numeric",
		hour12: !1
	}).resolvedOptions().hourCycle === "h12", sc;
}
function lc(e, t) {
	if (!t.timeStyle && !t.hour) return;
	e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
	let n = ic(e, {
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
var uc = (e, t = []) => ({
	parts: (...n) => {
		if (fc(t)) return uc(e, n);
		throw Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
	},
	extendWith: (...n) => uc(e, [...t, ...n]),
	omit: (...n) => uc(e, t.filter((e) => !n.includes(e))),
	rename: (e) => uc(e, t),
	keys: () => t,
	build: () => [...new Set(t)].reduce((t, n) => Object.assign(t, { [n]: {
		selector: [`&[data-scope="${dc(e)}"][data-part="${dc(n)}"]`, `& [data-scope="${dc(e)}"][data-part="${dc(n)}"]`].join(", "),
		attrs: {
			"data-scope": dc(e),
			"data-part": dc(n)
		}
	} }), {})
}), dc = (e) => e.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase(), fc = (e) => e.length === 0, pc = uc("dialog").parts("trigger", "backdrop", "positioner", "content", "title", "description", "closeTrigger").build(), mc = (e) => e.ids?.positioner ?? `dialog:${e.id}:positioner`, hc = (e) => e.ids?.backdrop ?? `dialog:${e.id}:backdrop`, gc = (e) => e.ids?.content ?? `dialog:${e.id}:content`, _c = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `dialog:${e.id}:trigger:${t}` : `dialog:${e.id}:trigger` : ai(n) ? n(t) : n;
}, vc = (e) => e.ids?.title ?? `dialog:${e.id}:title`, yc = (e) => e.ids?.description ?? `dialog:${e.id}:description`, bc = (e) => e.ids?.closeTrigger ?? `dialog:${e.id}:close`, xc = (e) => e.getById(gc(e)), Sc = (e) => e.getById(mc(e)), Cc = (e) => e.getById(hc(e)), wc = (e) => e.getById(_c(e)), Tc = (e) => e.getById(vc(e)), Ec = (e) => e.getById(yc(e)), Dc = (e) => e.getById(bc(e)), Oc = (e) => Zn(e.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${Ve(e.id)}`), kc = (e, t) => t == null ? wc(e) ?? Oc(e)[0] : e.getById(_c(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.connect.mjs
function Ac(e, t) {
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
				...pc.trigger.attrs,
				dir: a("dir"),
				id: _c(o, n),
				"data-ownedby": o.id,
				"data-value": n,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": n == null ? c : c && i,
				"data-state": c ? "open" : "closed",
				"aria-controls": gc(o),
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
				...pc.backdrop.attrs,
				dir: a("dir"),
				hidden: !c,
				id: hc(o),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...pc.positioner.attrs,
				dir: a("dir"),
				id: mc(o),
				style: Ni({ pointerEvents: !c || !a("modal") ? "none" : void 0 })
			});
		},
		getContentProps() {
			let e = i.get("rendered");
			return t.element({
				...pc.content.attrs,
				dir: a("dir"),
				role: a("role"),
				hidden: !c,
				id: gc(o),
				tabIndex: -1,
				"data-state": c ? "open" : "closed",
				"aria-modal": a("modal"),
				"aria-label": s || void 0,
				"aria-labelledby": s || !e.title ? void 0 : vc(o),
				"aria-describedby": e.description ? yc(o) : void 0,
				style: Ni({ pointerEvents: a("modal") ? void 0 : "auto" })
			});
		},
		getTitleProps() {
			return t.element({
				...pc.title.attrs,
				dir: a("dir"),
				id: vc(o)
			});
		},
		getDescriptionProps() {
			return t.element({
				...pc.description.attrs,
				dir: a("dir"),
				id: yc(o)
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...pc.closeTrigger.attrs,
				dir: a("dir"),
				id: bc(o),
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
var jc = /* @__PURE__ */ new WeakMap(), Mc = /* @__PURE__ */ new WeakMap(), Nc = {}, Pc = 0, Fc = (e) => e && (e.host || Fc(e.parentNode)), Ic = (e, t) => t.map((t) => {
	if (e.contains(t)) return t;
	let n = Fc(t);
	return n && e.contains(n) ? n : (console.error("[zag-js > ariaHidden] target", t, "in not contained inside", e, ". Doing nothing"), null);
}).filter((e) => !!e), Lc = /* @__PURE__ */ new Set([
	"script",
	"output",
	"status",
	"next-route-announcer"
]), Rc = (e) => Lc.has(e.localName) || e.role === "status" || e.hasAttribute("aria-live") ? !0 : e.matches("[data-live-announcer]"), zc = (e, t) => {
	let { parentNode: n, markerName: r, controlAttribute: i, explicitBooleanValue: a, followControlledElements: o = !0 } = t, s = Ic(n, Array.isArray(e) ? e : [e]);
	Nc[r] || (Nc[r] = /* @__PURE__ */ new WeakMap());
	let c = Nc[r], l = [], u = /* @__PURE__ */ new Set(), d = new Set(s), f = (e) => {
		e && !u.has(e) && (u.add(e), f(e.parentNode));
	};
	s.forEach((e) => {
		f(e), o && Ge(e) && _t(e, (e) => {
			f(e);
		});
	});
	let p = (e) => {
		e && !d.has(e) && Array.prototype.forEach.call(e.children, (e) => {
			if (u.has(e)) p(e);
			else try {
				if (Rc(e)) return;
				let t = e.getAttribute(i), n = a ? t === "true" : t !== null && t !== "false", o = (jc.get(e) || 0) + 1, s = (c.get(e) || 0) + 1;
				jc.set(e, o), c.set(e, s), l.push(e), o === 1 && n && Mc.set(e, !0), s === 1 && e.setAttribute(r, ""), n || e.setAttribute(i, a ? "true" : "");
			} catch (t) {
				console.error("[zag-js > ariaHidden] cannot operate on ", e, t);
			}
		});
	};
	return p(n), u.clear(), Pc++, () => {
		l.forEach((e) => {
			let t = jc.get(e) - 1, n = c.get(e) - 1;
			jc.set(e, t), c.set(e, n), t || (Mc.has(e) || e.removeAttribute(i), Mc.delete(e)), n || e.removeAttribute(r);
		}), Pc--, Pc || (jc = /* @__PURE__ */ new WeakMap(), jc = /* @__PURE__ */ new WeakMap(), Mc = /* @__PURE__ */ new WeakMap(), Nc = {});
	};
}, Bc = (e) => (Array.isArray(e) ? e[0] : e).ownerDocument.body, Vc = (e, t = Bc(e), n = "data-aria-hidden", r = !0) => {
	if (t) return zc(e, {
		parentNode: t,
		markerName: n,
		controlAttribute: "aria-hidden",
		explicitBooleanValue: !0,
		followControlledElements: r
	});
}, Hc = (e) => {
	let t = requestAnimationFrame(() => e());
	return () => cancelAnimationFrame(t);
};
function Uc(e, t = {}) {
	let { defer: n = !0 } = t, r = n ? Hc : (e) => e(), i = [];
	return i.push(r(() => {
		let t = (typeof e == "function" ? e() : e).filter(Boolean);
		t.length !== 0 && i.push(Vc(t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function Wc(e) {
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
function Gc(e) {
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
var Kc = "pointerdown.outside", qc = "focus.outside";
function Jc(e) {
	for (let t of e) if (Ge(t) && Cn(t)) return !0;
	return !1;
}
var Yc = (e) => "clientY" in e;
function Xc(e, t) {
	if (!Yc(t) || !e) return !1;
	let n = e.getBoundingClientRect();
	return n.width === 0 || n.height === 0 ? !1 : n.top <= t.clientY && t.clientY <= n.top + n.height && n.left <= t.clientX && t.clientX <= n.left + n.width;
}
function Zc(e, t) {
	return e.y <= t.y && t.y <= e.y + e.height && e.x <= t.x && t.x <= e.x + e.width;
}
function Qc(e, t) {
	if (!t || !Yc(e)) return !1;
	let n = t.scrollHeight > t.clientHeight, r = n && e.clientX > t.offsetLeft + t.clientWidth, i = t.scrollWidth > t.clientWidth, a = i && e.clientY > t.offsetTop + t.clientHeight;
	return Zc({
		x: t.offsetLeft,
		y: t.offsetTop,
		width: t.clientWidth + (n ? 16 : 0),
		height: t.clientHeight + (i ? 16 : 0)
	}, {
		x: e.clientX,
		y: e.clientY
	}) ? r || a : !1;
}
function $c(e, t) {
	let { exclude: n, onFocusOutside: r, onPointerDownOutside: i, onInteractOutside: a, defer: o, followControlledElements: s = !0 } = t;
	if (!e) return;
	let c = at(e), l = st(e), u = Wc(l), d = Gc(l);
	function f(t, r) {
		if (!Ge(r) || !r.isConnected || it(e, r) || Xc(e, t) || s && gt(e, r)) return !1;
		let i = c.querySelector(`[aria-controls="${e.id}"]`);
		return i && Qc(t, In(i)) || Qc(t, In(e)) ? !1 : !n?.(r);
	}
	let p = /* @__PURE__ */ new Set(), m = Ze(e?.getRootNode()), h = !1;
	function g(t) {
		h = !0;
		let n = () => {
			h = !1;
		};
		c.addEventListener("pointerup", n, { once: !0 }), l.addEventListener("pointerup", n, { once: !0 });
		function r(n) {
			let r = o && !Ft() ? q : (e) => e(), s = n ?? t, c = s?.composedPath?.() ?? [s?.target];
			r(() => {
				let n = m ? c[0] : Gt(t);
				if (e && f(t, n)) {
					if (i || a) {
						let t = yi(i, a);
						e.addEventListener(Kc, t, { once: !0 });
					}
					tl(e, Kc, {
						bubbles: !1,
						cancelable: !0,
						detail: {
							originalEvent: s,
							contextmenu: $t(s),
							focusable: Jc(c),
							target: n
						}
					});
				}
			});
		}
		t.pointerType === "touch" ? (p.forEach((e) => e()), p.add(cn(c, "click", r, { once: !0 })), p.add(d.addEventListener("click", r, { once: !0 })), p.add(u.addEventListener("click", r, { once: !0 }))) : r();
	}
	let _ = /* @__PURE__ */ new Set(), v = setTimeout(() => {
		_.add(cn(c, "pointerdown", g, !0)), _.add(d.addEventListener("pointerdown", g, !0)), _.add(u.addEventListener("pointerdown", g, !0));
	}, 0);
	function y(t) {
		h || (o ? q : (e) => e())(() => {
			let n = t?.composedPath?.() ?? [t?.target], i = m ? n[0] : Gt(t);
			if (e && f(t, i)) {
				if (r || a) {
					let t = yi(r, a);
					e.addEventListener(qc, t, { once: !0 });
				}
				tl(e, qc, {
					bubbles: !1,
					cancelable: !0,
					detail: {
						originalEvent: t,
						contextmenu: !1,
						focusable: Cn(i),
						target: i
					}
				});
			}
		});
	}
	return Ft() || (_.add(cn(c, "focusin", y, !0)), _.add(d.addEventListener("focusin", y, !0)), _.add(u.addEventListener("focusin", y, !0))), () => {
		clearTimeout(v), p.forEach((e) => e()), _.forEach((e) => e());
	};
}
function el(e, t) {
	let { defer: n } = t, r = n ? q : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push($c(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function tl(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, n);
	return e.dispatchEvent(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function nl(e, t) {
	return cn(at(e), "keydown", (e) => {
		e.key === "Escape" && (e.isComposing || t?.(e));
	}, { capture: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
var rl = "layer:request-dismiss", il = {
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
		return !!(this.getNestedLayers(e).some((e) => it(e.node, t)) || this.recentlyRemoved.size > 0);
	},
	isInBranch(e) {
		return Array.from(this.branches).some((t) => it(t, e));
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
			t && ol(t);
		}), this.recentlyRemoved.add(e), jn(() => this.recentlyRemoved.delete(e)), t < this.count() - 1 && this.getNestedLayers(e).forEach((t) => il.dismiss(t.node, e)), this.layers.splice(t, 1), this.syncLayers());
	},
	removeBranch(e) {
		let t = this.branches.indexOf(e);
		t >= 0 && this.branches.splice(t, 1);
	},
	syncLayers() {
		this.layers.forEach((e, t) => {
			al(e, t, e.node), e.styleTargets?.forEach((n) => {
				let r = n();
				if (!r || r === e.node) return;
				al(e, t, r);
				let { zIndex: i } = ft(e.node);
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
		cl(e, rl, (e) => {
			r.requestDismiss?.(e), e.defaultPrevented || r?.dismiss();
		}), sl(e, rl, {
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
function al(e, t, n) {
	n.style.setProperty("--layer-index", `${t}`), n.removeAttribute("data-nested"), n.removeAttribute("data-has-nested"), il.getParentLayerOfType(e.node, e.type) && n.setAttribute("data-nested", e.type);
	let r = il.countNestedLayersOfType(e.node, e.type);
	r > 0 && n.setAttribute("data-has-nested", e.type), n.style.setProperty("--nested-layer-count", `${r}`);
}
function ol(e) {
	e.style.removeProperty("--layer-index"), e.style.removeProperty("--nested-layer-count"), e.style.removeProperty("--z-index"), e.removeAttribute("data-nested"), e.removeAttribute("data-has-nested");
}
function sl(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, {
		cancelable: !0,
		bubbles: !0,
		detail: n
	});
	return e.dispatchEvent(r);
}
function cl(e, t, n) {
	e.addEventListener(t, n, { once: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
var ll = /* @__PURE__ */ new WeakMap(), ul = /* @__PURE__ */ new WeakMap();
function dl(e) {
	return il.isBelowPointerBlockingLayer(e) ? "none" : "auto";
}
function fl(e) {
	let t = dl(e);
	e.style.pointerEvents !== t && (e.style.pointerEvents = t);
}
function pl(e) {
	if (ul.has(e)) return;
	let t = st(e);
	if (t.MutationObserver === void 0) return;
	let n = new t.MutationObserver(() => {
		ul.has(e) && fl(e);
	});
	n.observe(e, {
		attributes: !0,
		attributeFilter: ["style"]
	}), ul.set(e, n);
}
function ml() {
	il.layers.forEach(({ node: e }) => {
		fl(e), pl(e);
	});
}
function hl(e) {
	let t = ul.get(e);
	t && (t.disconnect(), ul.delete(e)), e.style.pointerEvents = "";
}
function gl(e, t) {
	let n = at(e), r = [];
	return il.hasPointerBlockingLayer() && !n.body.hasAttribute("data-inert") && (ll.set(n.body, n.body.style.pointerEvents), queueMicrotask(() => {
		let e = n.body;
		e && (e.style.pointerEvents = "none", e.setAttribute("data-inert", ""));
	})), t?.forEach((e) => {
		let [t, n] = hr(() => {
			let t = e();
			return Ge(t) ? t : null;
		}, { timeout: 1e3 });
		t.then((e) => r.push(cr(e, { pointerEvents: "auto" }))), r.push(n);
	}), () => {
		il.hasPointerBlockingLayer() || (queueMicrotask(() => {
			let e = n.body;
			if (!e) return;
			let t = ll.get(e);
			t !== void 0 && (e.style.pointerEvents = t, ll.delete(e)), e.removeAttribute("data-inert"), e.style.length === 0 && e.removeAttribute("style");
		}), r.forEach((e) => e()));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function _l(e, t) {
	let { onDismiss: n, onRequestDismiss: r, pointerBlocking: i, exclude: a, debug: o, type: s = "dialog", layerStyleTargets: c } = t, l = {
		dismiss: n,
		node: e,
		type: s,
		pointerBlocking: i,
		requestDismiss: r,
		styleTargets: c
	};
	il.add(l), ml();
	function u(r) {
		let i = Gt(r.detail.originalEvent);
		il.isBelowPointerBlockingLayer(e) || il.isInBranch(i) || (t.onPointerDownOutside?.(r), t.onInteractOutside?.(r), !r.defaultPrevented && (o && console.log("onPointerDownOutside:", r.detail.originalEvent), n?.()));
	}
	function d(e) {
		let r = Gt(e.detail.originalEvent);
		il.isInBranch(r) || (t.onFocusOutside?.(e), t.onInteractOutside?.(e), !e.defaultPrevented && (o && console.log("onFocusOutside:", e.detail.originalEvent), n?.()));
	}
	function f(r) {
		il.isTopMost(e) && (t.onEscapeKeyDown?.(r), !r.defaultPrevented && n && (r.preventDefault(), n()));
	}
	function p(n) {
		let r = typeof a == "function" ? a() : a, i = Array.isArray(r) ? r : [r], o = t.persistentElements?.map((e) => e()).filter(Ge);
		return o && i.push(...o), i.some((e) => it(e, n)) || il.isInNestedLayer(e, n);
	}
	let m = [
		i ? gl(e, t.persistentElements) : void 0,
		nl(e, f),
		el(e, {
			exclude: p,
			onFocusOutside: d,
			onPointerDownOutside: u,
			defer: t.defer
		})
	];
	return () => {
		il.remove(e), ml(), hl(e), m.forEach((e) => e?.());
	};
}
function vl(e, t) {
	let { warnOnMissingNode: n = !0 } = t;
	return gr(e, (e) => _l(e, t), {
		defer: t.defer,
		onMissing: n ? () => Bi("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
	});
}
function yl(e, t = {}) {
	return gr(e, (e) => (il.addBranch(e), () => {
		il.removeBranch(e);
	}), {
		defer: t.defer,
		onMissing: () => Bi("[@zag-js/dismissable] branch node is `null` or `undefined`")
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/chunk-QZ7TP4HQ.mjs
var bl = Object.defineProperty, xl = (e, t, n) => t in e ? bl(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, X = (e, t, n) => xl(e, typeof t == "symbol" ? t : t + "", n), Sl = {
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
}, Cl = [], wl = class {
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
			let t = Gt(e), n = this.findContainerIndex(t, e) >= 0;
			if (n || Ke(t)) n && (this.state.mostRecentlyFocusedNode = t);
			else {
				e.stopImmediatePropagation();
				let t, n = !0;
				if (this.state.mostRecentlyFocusedNode) {
					if (Dn(this.state.mostRecentlyFocusedNode) > 0) {
						let e = this.findContainerIndex(this.state.mostRecentlyFocusedNode), { tabbableNodes: r } = this.state.containerGroups[e];
						if (r.length > 0) {
							let e = r.findIndex((e) => e === this.state.mostRecentlyFocusedNode);
							e >= 0 && (this.config.isKeyForward(this.state.recentNavEvent) ? e + 1 < r.length && (t = r[e + 1], n = !1) : e - 1 >= 0 && (t = r[e - 1], n = !1));
						}
					} else this.state.containerGroups.some((e) => e.tabbableNodes.some((e) => Dn(e) > 0)) || (n = !1);
				} else n = !1;
				n && (t = this.findNextNavNode({
					target: this.state.mostRecentlyFocusedNode,
					isBackward: this.config.isKeyBackward(this.state.recentNavEvent)
				})), t ? this.tryFocus(t) : this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode());
			}
			this.state.recentNavEvent = void 0;
		}), X(this, "handlePointerDown", (e) => {
			this.lastInteractionType = "pointer";
			let t = Gt(e);
			if (!(this.findContainerIndex(t, e) >= 0)) {
				if (kl(this.config.clickOutsideDeactivates, e)) {
					this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
					return;
				}
				kl(this.config.allowOutsideClick, e) || e.preventDefault();
			}
		}), X(this, "handleClick", (e) => {
			let t = Gt(e);
			this.findContainerIndex(t, e) >= 0 || kl(this.config.clickOutsideDeactivates, e) || kl(this.config.allowOutsideClick, e) || (e.preventDefault(), e.stopImmediatePropagation());
		}), X(this, "handleTabKey", (e) => {
			if (this.lastInteractionType = "keyboard", this.config.isKeyForward(e) || this.config.isKeyBackward(e)) {
				this.state.recentNavEvent = e;
				let t = this.config.isKeyBackward(e), n = this.findNextNavNode({
					event: e,
					isBackward: t
				});
				if (!n) return;
				El(e) && e.preventDefault(), this.tryFocus(n);
			}
		}), X(this, "handleEscapeKey", (e) => {
			Al(e) && kl(this.config.escapeDeactivates, e) !== !1 && (e.preventDefault(), this.deactivate());
		}), X(this, "_mutationObserver"), X(this, "setupMutationObserver", () => {
			let e = this.doc.defaultView || window;
			this._mutationObserver = new e.MutationObserver((e) => {
				e.some((e) => Array.from(e.removedNodes).some((e) => e === this.state.mostRecentlyFocusedNode)) && this.tryFocus(this.getInitialFocusNode()), e.some((e) => e.type === "attributes" && (e.attributeName === "aria-controls" || e.attributeName === "aria-expanded") || e.type === "childList" && e.addedNodes.length > 0 && Array.from(e.addedNodes).some((e) => {
					if (e.nodeType !== Node.ELEMENT_NODE) return !1;
					let t = e;
					return xt(t) ? !0 : t.id && !this.state.containers.some((e) => e.contains(t)) ? St(t) : !1;
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
			if (e === void 0 || e && !Cn(e)) {
				let t = ct(this.doc);
				if (t && this.findContainerIndex(t) >= 0) e = t;
				else {
					let t = this.state.tabbableGroups[0];
					e = t && t.firstTabbableNode || this.getNodeForOption("fallbackFocus");
				}
			} else e === null && (e = this.getNodeForOption("fallbackFocus"));
			if (!e || (e.isConnected || (e = this.getNodeForOption("fallbackFocus")), !e || !e.isConnected)) throw Error("Your focus-trap needs to have at least one focusable element");
			return e;
		}), X(this, "tryFocus", (e, t) => {
			if (e !== !1 && e !== ct(this.doc)) {
				if (!e || !e.focus) {
					this.tryFocus(this.getInitialFocusNode());
					return;
				}
				e.focus({
					preventScroll: !!this.config.preventScroll,
					...t
				}), this.state.mostRecentlyFocusedNode = e, Ml(e) && e.select();
			}
		}), X(this, "deactivate", (e) => {
			if (!this.state.active) return this;
			let t = {
				onDeactivate: this.config.onDeactivate,
				onPostDeactivate: this.config.onPostDeactivate,
				checkCanReturnFocus: this.config.checkCanReturnFocus,
				...e
			};
			clearTimeout(this.state.delayInitialFocusTimer), this.state.delayInitialFocusTimer = void 0, this.removeListeners(), this.state.active = !1, this.state.paused = !1, this.updateObservedNodes(), Sl.deactivateTrap(this.trapStack, this), this.portalContainers.clear();
			let n = this.getOption(t, "onDeactivate"), r = this.getOption(t, "onPostDeactivate"), i = this.getOption(t, "checkCanReturnFocus"), a = this.getOption(t, "returnFocus", "returnFocusOnDeactivate");
			n?.();
			let o = () => {
				jl(() => {
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
			let { event: t, isBackward: n = !1 } = e, r = e.target || Gt(t);
			this.updateTabbableNodes();
			let i = null;
			if (this.state.tabbableGroups.length > 0) {
				let e = this.findContainerIndex(r, t), a = e >= 0 ? this.state.containerGroups[e] : void 0;
				if (e < 0) i = n ? this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode : this.state.tabbableGroups[0].firstTabbableNode;
				else if (n) {
					let n = this.state.tabbableGroups.findIndex(({ firstTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || Cn(r) && !Tn(r) && !a?.nextTabbableNode(r, !1)) && (n = e), n >= 0) {
						let e = n === 0 ? this.state.tabbableGroups.length - 1 : n - 1, t = this.state.tabbableGroups[e];
						i = Dn(r) >= 0 ? t.lastTabbableNode : t.lastDomTabbableNode;
					} else El(t) || (i = a?.nextTabbableNode(r, !1));
				} else {
					let n = this.state.tabbableGroups.findIndex(({ lastTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || Cn(r) && !Tn(r) && !a?.nextTabbableNode(r)) && (n = e), n >= 0) {
						let e = n === this.state.tabbableGroups.length - 1 ? 0 : n + 1, t = this.state.tabbableGroups[e];
						i = Dn(r) >= 0 ? t.firstTabbableNode : t.firstDomTabbableNode;
					} else El(t) || (i = a?.nextTabbableNode(r));
				}
			} else i = this.getNodeForOption("fallbackFocus");
			return i;
		}), this.trapStack = t.trapStack || Cl;
		let n = {
			returnFocusOnDeactivate: !0,
			escapeDeactivates: !0,
			delayInitialFocus: !0,
			followControlledElements: !0,
			isKeyForward: Dl,
			isKeyBackward: Ol,
			...t
		};
		this.doc = n.document || at(Array.isArray(e) ? e[0] : e), this.config = n, this.updateContainerElements(e), this.setupMutationObserver();
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
			vt(e).forEach((e) => {
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
		return this.config.followControlledElements ? gt(e, t) : !1;
	}
	isPersistentElement(e, t) {
		let n = this.config.persistentElements;
		if (!n || n.length === 0) return !1;
		let r = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return n.some((t) => {
			let n = t();
			return it(n, e) || n != null && r?.includes(n);
		});
	}
	updateTabbableNodes() {
		if (this.state.containerGroups = this.state.containers.map((e) => {
			let t = wn(e, { getShadowRoot: this.config.getShadowRoot }), n = Sn(e, { getShadowRoot: this.config.getShadowRoot }), r = t[0], i = t[t.length - 1], a = r, o = i, s = !1;
			for (let e = 0; e < t.length; e++) if (Dn(t[e]) > 0) {
				s = !0;
				break;
			}
			function c(e, r = !0) {
				let i = t.indexOf(e);
				if (i >= 0) return t[i + (r ? 1 : -1)];
				let a = n.indexOf(e);
				if (!(a < 0)) {
					if (r) {
						for (let e = a + 1; e < n.length; e++) if (Tn(n[e])) return n[e];
					} else for (let e = a - 1; e >= 0; e--) if (Tn(n[e])) return n[e];
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
		if (this.state.active) return Sl.activateTrap(this.trapStack, this), this.listenerCleanups.push(cn(this.doc, "focusin", this.handleFocus, !0), cn(this.doc, "mousedown", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), cn(this.doc, "touchstart", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), cn(this.doc, "click", this.handleClick, {
			capture: !0,
			passive: !1
		}), cn(this.doc, "keydown", this.handleTabKey, {
			capture: !0,
			passive: !1
		}), cn(this.doc, "keydown", this.handleEscapeKey)), this;
	}
	commitInitialFocus() {
		return this.state.delayInitialFocusTimer = this.config.delayInitialFocus ? jl(() => {
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
		return this.state.containers.some((t) => it(t, e));
	}
	isSafeToOverrideFocus() {
		let e = ct(this.doc);
		return !e || e === this.doc.body || this.containsElement(e) ? !0 : this.trapStack.some((t) => t !== this && t.containsElement(e));
	}
	activate(e) {
		if (this.state.active) return this;
		let t = this.getOption(e, "onActivate"), n = this.getOption(e, "onPostActivate"), r = this.getOption(e, "checkCanFocusTrap");
		r || this.updateTabbableNodes(), this.state.active = !0, this.state.paused = !1, this.state.nodeFocusedBeforeActivation = ct(this.doc), t?.();
		let i = () => {
			r && this.updateTabbableNodes(), this.addListeners(), this.updateObservedNodes(), n?.();
		};
		return r ? (r(this.state.containers.concat()).then(i, i), this) : (i(), this);
	}
}, Tl = (e) => e?.type === "keydown", El = (e) => Tl(e) && e?.key === "Tab", Dl = (e) => Tl(e) && e.key === "Tab" && !e?.shiftKey, Ol = (e) => Tl(e) && e.key === "Tab" && e?.shiftKey, kl = (e, ...t) => typeof e == "function" ? e(...t) : e, Al = (e) => !e.isComposing && e.key === "Escape", jl = (e) => setTimeout(e, 0), Ml = (e) => e.localName === "input" && "select" in e && typeof e.select == "function";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/index.mjs
function Nl(e, t = {}) {
	let n, r = q(() => {
		let r = (Array.isArray(e) ? e : [e]).map((e) => typeof e == "function" ? e() : e).filter((e) => e != null);
		if (r.length === 0) return;
		let i = r[0];
		n = new wl(r, {
			escapeDeactivates: !1,
			allowOutsideClick: !0,
			preventScroll: !0,
			returnFocusOnDeactivate: !0,
			delayInitialFocus: !1,
			fallbackFocus: i,
			...t,
			document: at(i)
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
var Pl = "data-scroll-lock", Fl = /* @__PURE__ */ new WeakMap();
function Il(e) {
	let t = e.getBoundingClientRect().left;
	return Math.round(t) + e.scrollLeft ? "paddingLeft" : "paddingRight";
}
function Ll(e) {
	let t = ft(e)?.scrollbarGutter;
	return t === "stable" || t?.startsWith("stable ") === !0;
}
function Rl(e) {
	let { documentElement: t, body: n } = e;
	return Bn(t) ? t : n;
}
function zl(e) {
	let t = e.defaultView ?? window, { documentElement: n, body: r } = e, i = Rl(e), a = Ll(n) || Ll(r), o = t.innerWidth - n.clientWidth;
	r.setAttribute(Pl, "");
	let s = () => lr(n, "--scrollbar-width", `${o}px`), c = Il(n), l = [s(), Rt() ? (() => {
		let { scrollX: e, scrollY: n, visualViewport: i } = t, s = i?.offsetLeft ?? 0, l = i?.offsetTop ?? 0, u = {
			position: "fixed",
			overflow: "hidden",
			top: `${-(n - Math.floor(l))}px`,
			left: `${-(e - Math.floor(s))}px`,
			right: "0"
		};
		!a && o > 0 && (u[c] = `${o}px`);
		let d = cr(r, u);
		return () => {
			d?.(), t.scrollTo({
				left: e,
				top: n,
				behavior: "instant"
			});
		};
	})() : (() => {
		let e = { overflow: "hidden" };
		return !a && o > 0 && (e[c] = `${o}px`), cr(i, e);
	})()];
	return () => {
		l.forEach((e) => e?.()), r.removeAttribute(Pl);
	};
}
function Bl(e) {
	let t = e ?? document, n = Fl.get(t);
	n || (n = {
		count: 0,
		cleanup: zl(t)
	}, Fl.set(t, n)), n.count++;
	let r = n, i = !1;
	return () => {
		i || (i = !0, r.count--, r.count === 0 && (r.cleanup(), Fl.delete(t)));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.machine.mjs
var Vl = ba({
	props({ props: e, scope: t }) {
		let n = e.role === "alertdialog", r = n ? () => Dc(t) : void 0, i = typeof e.modal != "boolean" || e.modal;
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
						triggerElement: kc(n, e)
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
				return vl(() => xc(e), {
					type: "dialog",
					defer: !0,
					pointerBlocking: n("modal"),
					layerStyleTargets: [() => Cc(e), () => Sc(e)],
					exclude: [wc(e), ...Oc(e)].filter(Boolean),
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
				if (t("preventScroll")) return Bl(e.getDoc());
			},
			trapFocus({ scope: e, prop: t, context: n }) {
				return t("trapFocus") ? Nl(() => xc(e), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!t("restoreFocus"),
					initialFocus: () => On({
						root: xc(e),
						getInitialEl: t("initialFocusEl")
					}),
					setReturnFocus: (r) => {
						let i = t("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let t = kc(e, a);
							if (t) return t;
						}
						return Oc(e)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			},
			hideContentBelow({ scope: e, prop: t }) {
				return t("modal") ? Uc(() => [xc(e)], { defer: !0 }) : void 0;
			}
		},
		actions: {
			setInitialFocus({ prop: e, scope: t }) {
				e("trapFocus") || q(() => {
					On({
						root: xc(t),
						getInitialEl: e("initialFocusEl")
					})?.focus({ preventScroll: !0 });
				});
			},
			checkRenderedElements({ context: e, scope: t }) {
				q(() => {
					e.set("rendered", {
						title: !!Tc(t),
						description: !!Ec(t)
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
}), Hl = (e) => {
	let t = Sr(), n = po(), r = R(() => {
		let r = hi(e) || {};
		return {
			getRootNode: t().getRootNode,
			dir: n().dir,
			...r
		};
	}), i = za(Vl, () => x(r)), a = R(() => Ac(i, ja));
	return () => x(a);
}, Ul = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function Wl(e, t) {
	let n = f();
	U(t, !0);
	let r = F(t, "open", 15), i = F(t, "children", 7), a = O(t, Ul), o = R(() => eo(a)), s = R(() => V(x(o), 2)), c = R(() => x(s)[0]), l = R(() => x(s)[1]), u = R(() => Ar(x(c))), d = R(() => V(x(u), 1)), p = R(() => x(d)[0]), h = R(() => ({
		...x(l),
		id: x(l).id ?? n,
		open: r(),
		onOpenChange(e) {
			x(l).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), _ = Hl(() => x(h)), v = R(() => ({
		...x(c),
		present: _().open
	})), y = $a(() => x(v));
	ro(_), Dr(() => x(p)), to(y);
	var b = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), W();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), W();
		}
	}, S = g(), C = T(S);
	return I(C, () => i() ?? P), m(e, S), B(b);
}
H(Wl, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-title.svelte
var Gl = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Kl(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Gl), i = io(), a = R(() => J(i().getTitleProps(), r));
	return Y(e, z({ as: "h2" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Kl, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/css.ts
var ql = ".af-kit{--k-bg:var(--af-bg,#f8fafc);--k-surface:var(--af-surface,#fff);--k-fg:var(--af-fg,#0d1928);--k-muted:var(--af-muted-fg,#576477);--k-line:var(--af-border,#e0e6ee);--k-primary:var(--af-primary,#0c71d1);--k-primary-fg:var(--af-primary-fg,#fafcfe);--k-danger:var(--af-danger,#e40014);--k-warning:var(--af-warning,#dd7400);--k-success:var(--af-success,#009767);--k-info:#0f74c5;--k-radius:var(--af-radius,.625rem);--k-font:var(--af-font-sans,ui-sans-serif, system-ui, sans-serif);--k-ring:var(--k-primary);--k-hover:color-mix(in oklab, var(--k-fg) 5%, var(--k-surface));--k-press:color-mix(in oklab, var(--k-fg) 9%, var(--k-surface));font-family:var(--k-font);color:var(--k-fg)}@supports (color:lab(0% 0 0)){.af-kit{--k-bg:var(--af-bg,lab(98.1433% -.367165 -1.06069));--k-surface:var(--af-surface,lab(100% 0 0));--k-fg:var(--af-fg,lab(8.19431% -1.05806 -12.2385));--k-muted:var(--af-muted-fg,lab(41.8773% -1.78064 -12.648));--k-line:var(--af-border,lab(90.9248% -1.03632 -4.75875));--k-primary:var(--af-primary,lab(46.5609% 2.72214 -58.0728));--k-primary-fg:var(--af-primary-fg,lab(98.837% -.443995 -1.43219));--k-danger:var(--af-danger,lab(48.4493% 77.4328 61.5452));--k-warning:var(--af-warning,lab(60.3514% 40.5624 87.1228));--k-success:var(--af-success,lab(55.0481% -49.9246 15.93));--k-info:lab(47.0007% -3.24479 -50.2754)}}:host([data-theme=dark]) .af-kit{--k-bg:var(--af-bg,#0b121b);--k-surface:var(--af-surface,#131b25);--k-fg:var(--af-fg,#eff3f6);--k-muted:var(--af-muted-fg,#a9b2be);--k-line:var(--af-border,#ffffff1c);--k-primary:var(--af-primary,#63b1f9);--k-primary-fg:var(--af-primary-fg,#0a1725);--k-danger:var(--af-danger,#ff6568);--k-warning:var(--af-warning,#f99c00);--k-success:var(--af-success,#00bb7f);--k-info:#6db0f4}@supports (color:lab(0% 0 0)){:host([data-theme=dark]) .af-kit{--k-bg:var(--af-bg,lab(5.20297% -.7421 -7.06235));--k-surface:var(--af-surface,lab(9.19901% -1.18761 -8.50037));--k-fg:var(--af-fg,lab(95.5874% -.662178 -2.14615));--k-muted:var(--af-muted-fg,lab(72.1142% -1.52099 -7.28307));--k-line:var(--af-border,lab(100% 0 0/.11));--k-primary:var(--af-primary,lab(69.4527% -8.90157 -43.6168));--k-primary-fg:var(--af-primary-fg,lab(7.09383% -1.43068 -11.9741));--k-danger:var(--af-danger,lab(63.7053% 60.745 31.3109));--k-warning:var(--af-warning,lab(72.7183% 31.8672 97.9407));--k-success:var(--af-success,lab(66.9756% -58.27 19.5419));--k-info:lab(69.4439% -7.35071 -40.8943)}}.af-kit [popover]{color:inherit;background:0 0;border:0;margin:0;padding:0;inset:auto;overflow:visible}.af-button{border-radius:max(0px, calc(var(--k-radius) - 2px));border:1px solid var(--k-line);background:var(--k-surface);min-height:32px;color:var(--k-fg);font:inherit;white-space:nowrap;cursor:pointer;justify-content:center;align-items:center;gap:6px;padding:0 12px;font-size:14px;font-weight:500;line-height:20px;text-decoration:none;transition:background-color .1s cubic-bezier(.2,0,0,1),border-color .1s cubic-bezier(.2,0,0,1);display:inline-flex}.af-button svg{pointer-events:none;flex:none;width:16px;height:16px}.af-button:focus-visible{outline:2px solid var(--k-ring);outline-offset:2px}.af-button.primary{background:var(--k-primary);border-color:var(--k-primary);color:var(--k-primary-fg)}.af-button.secondary{background:var(--k-surface)}.af-button.danger{background:var(--k-danger);border-color:var(--k-danger);color:var(--k-primary-fg)}.af-button.ghost{background:0 0;border-color:#0000}.af-button:not([aria-disabled=true],:disabled):hover{background:var(--k-hover)}.af-button.primary:not([aria-disabled=true],:disabled):hover{background:color-mix(in oklab, var(--k-primary) 90%, var(--k-bg));border-color:color-mix(in oklab, var(--k-primary) 90%, var(--k-bg))}.af-button.danger:not([aria-disabled=true],:disabled):hover{background:color-mix(in oklab, var(--k-danger) 90%, var(--k-bg));border-color:color-mix(in oklab, var(--k-danger) 90%, var(--k-bg))}.af-button:not([aria-disabled=true],:disabled):active{background:var(--k-press);transition:none}.af-button.primary:not([aria-disabled=true],:disabled):active{background:color-mix(in oklab, var(--k-primary) 82%, var(--k-fg));border-color:color-mix(in oklab, var(--k-primary) 82%, var(--k-fg))}.af-button.danger:not([aria-disabled=true],:disabled):active{background:color-mix(in oklab, var(--k-danger) 82%, var(--k-fg));border-color:color-mix(in oklab, var(--k-danger) 82%, var(--k-fg))}.af-button.sm{min-height:28px;padding:0 10px;font-size:12px;line-height:18px}.af-button.icon{width:32px;padding:0}.af-button.icon.sm{border-radius:max(0px, calc(var(--k-radius) - 4px));width:24px;min-height:24px}.af-button[aria-disabled=true],.af-button:disabled{opacity:.55;cursor:not-allowed}.af-chip{background:color-mix(in oklab, var(--k-primary) 12%, var(--k-surface));color:var(--k-fg);border-radius:999px;align-items:center;gap:4px;padding:1px 8px;font-size:12px;line-height:18px;display:inline-flex}.af-chip.neutral{background:color-mix(in oklab, var(--k-fg) 7%, var(--k-surface));color:var(--k-fg)}.af-chip.danger{background:color-mix(in oklab, var(--k-danger) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-danger) 75%, var(--k-fg))}.af-chip.success{background:color-mix(in oklab, var(--k-success) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-success) 75%, var(--k-fg))}.af-chip.warning{background:color-mix(in oklab, var(--k-warning) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-warning) 75%, var(--k-fg))}.af-chip.info{background:color-mix(in oklab, var(--k-info) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-info) 75%, var(--k-fg))}.af-avatar{background:color-mix(in oklab, var(--k-primary) 20%, var(--k-surface));width:24px;height:24px;color:var(--k-fg);border-radius:50%;flex:none;place-items:center;font-size:10px;font-weight:600;display:inline-grid;overflow:hidden}.af-avatar.sm{width:20px;height:20px;font-size:9px}.af-avatar.lg{width:32px;height:32px;font-size:13px}.af-avatar img{object-fit:cover;width:100%;height:100%}.af-avatar[data-hue]{background:oklch(.92 .06 var(--k-hue,255));color:oklch(.38 .12 var(--k-hue,255))}:host([data-theme=dark]) .af-avatar[data-hue]{background:oklch(.36 .07 var(--k-hue,255));color:oklch(.9 .06 var(--k-hue,255))}.af-avatar[data-hue=\"0\"]{--k-hue:255}.af-avatar[data-hue=\"1\"]{--k-hue:290}.af-avatar[data-hue=\"2\"]{--k-hue:330}.af-avatar[data-hue=\"3\"]{--k-hue:20}.af-avatar[data-hue=\"4\"]{--k-hue:60}.af-avatar[data-hue=\"5\"]{--k-hue:145}.af-avatar[data-hue=\"6\"]{--k-hue:180}.af-avatar[data-hue=\"7\"]{--k-hue:215}.af-tabs{border-bottom:1px solid var(--k-line);gap:4px;display:flex}.af-tabs>[role=tab]{border-radius:max(0px, calc(var(--k-radius) - 4px)) max(0px, calc(var(--k-radius) - 4px)) 0 0;color:var(--k-muted);font:inherit;cursor:pointer;background:0 0;border:0;padding:8px 12px;transition:background-color .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1)}.af-tabs>[role=tab]:hover{background:var(--k-hover);color:var(--k-fg)}.af-tabs>[role=tab]:active{background:var(--k-press);transition:none}.af-tabs>[role=tab]:focus-visible{outline:2px solid var(--k-ring);outline-offset:-2px}.af-tabs>[role=tab][aria-selected=true]{color:var(--k-fg);box-shadow:inset 0 -2px 0 var(--k-primary)}.af-tabs.segmented{border-radius:max(0px, calc(var(--k-radius) - 2px));background:color-mix(in oklab, var(--k-bg) 94%, var(--k-fg));border:0;gap:2px;padding:2px;display:inline-flex}.af-tabs.segmented>[role=tab]{border-radius:max(0px, calc(var(--k-radius) - 4px));white-space:nowrap;align-items:center;gap:6px;height:28px;padding:0 12px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex}.af-tabs.segmented>[role=tab]:hover{background:color-mix(in oklab, var(--k-fg) 5%, transparent)}.af-tabs.segmented>[role=tab][aria-selected=true]{background:var(--k-surface);box-shadow:0 1px 2px #0f172a0f}.af-skeleton{border-radius:var(--k-radius);background:linear-gradient(90deg, color-mix(in oklab, var(--k-fg) 6%, transparent), color-mix(in oklab, var(--k-fg) 10%, transparent), color-mix(in oklab, var(--k-fg) 6%, transparent));background-size:200% 100%;min-height:12px;animation:1.2s linear infinite af-shimmer}@keyframes af-shimmer{to{background-position:-200% 0}}.af-banner{border-radius:var(--k-radius);border:1px solid var(--k-line);background:var(--k-surface);align-items:center;gap:8px;padding:8px 12px;display:flex}.af-banner>svg{flex:none}.af-banner.info{border-color:color-mix(in oklab, var(--k-info) 30%, var(--k-line));background:color-mix(in oklab, var(--k-info) 12%, var(--k-surface))}.af-banner.warning{border-color:color-mix(in oklab, var(--k-warning) 35%, var(--k-line));background:color-mix(in oklab, var(--k-warning) 14%, var(--k-surface))}.af-banner.danger{border-color:color-mix(in oklab, var(--k-danger) 35%, var(--k-line));background:color-mix(in oklab, var(--k-danger) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-danger) 78%, var(--k-fg))}.af-overlay{background:var(--k-surface);color:var(--k-fg);border:1px solid var(--k-line);border-radius:var(--k-radius);box-shadow:0 2px 6px #0f172a14,0 12px 28px -6px #0f172a38}:host([data-theme=dark]) .af-overlay{box-shadow:0 2px 6px #0006,0 12px 28px -6px #0009}@media (prefers-reduced-motion:reduce){.af-skeleton{animation:none}.af-button,.af-tabs>[role=tab]{transition:none}}";
//#endregion
//#region src/kit/KitStyles.svelte
function Jl(e) {
	let t = `<style>${ql}</style>`;
	var n = g(), r = T(n);
	me(r, () => t), m(e, n);
}
H(Jl, {}, [], [], { mode: "open" });
//#endregion
//#region src/kit/environment.ts
function Yl(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !1
	}));
}
function Xl(e, t, n) {
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
function Zl() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e instanceof HTMLElement ? e : null;
}
function Ql(e, t) {
	for (let n = t; n;) {
		if (n === e) return !0;
		let t = n.getRootNode();
		n = n.parentNode ?? (t instanceof ShadowRoot ? t.host : null);
	}
	return !1;
}
var $l = [];
function eu(e) {
	for (let t = $l.length - 1; t >= 0; t--) {
		if ($l[t].isConnected) return $l[t] === e;
		$l.splice(t, 1);
	}
	return !1;
}
function tu(e) {
	let t = null;
	return (n, r) => {
		if (n) {
			if (r && !n.open) t = Zl(), n.showModal(), $l.push(e);
			else if (!r && n.open) {
				n.close();
				let r = $l.lastIndexOf(e);
				r >= 0 && $l.splice(r, 1);
				let i = t;
				t = null;
				let a = Zl();
				i?.isConnected && (!a || a === document.body || Ql(e, a)) && i.focus({ preventScroll: !0 });
			}
		}
	};
}
//#endregion
//#region src/kit/text.ts
var nu = {
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
function ru(e, t) {
	let n = nu[/^vi(-|$)/i.test(e ?? "") ? "vi" : "en"], r = Object.fromEntries(Object.entries(t ?? {}).filter(([, e]) => e !== void 0));
	return {
		...n,
		...r
	};
}
//#endregion
//#region src/kit/Confirm.svelte
var iu = o("<p part=\"message\" class=\"svelte-1fchw0y\"> </p>"), au = o("<p part=\"impact\" class=\"svelte-1fchw0y\"> </p>"), ou = o("<div><!> <!></div>"), su = o("<!> <!> <footer part=\"actions\" class=\"svelte-1fchw0y\"><button type=\"button\" part=\"cancel\" class=\"af-button secondary\"> </button> <button type=\"button\" part=\"confirm\"> </button></footer>", 1), cu = o("<dialog><!></dialog>"), lu = o("<!> <!>", 1), uu = {
	hash: "svelte-1fchw0y",
	code: "dialog.svelte-1fchw0y {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-1fchw0y::backdrop {background:rgb(0 0 0 / 0.4);}p.svelte-1fchw0y {margin:0;}footer.svelte-1fchw0y {display:flex;justify-content:flex-end;gap:8px;}[data-scope='dialog'][data-part='content'] {display:grid;gap:12px;width:min(420px, calc(100vw - 32px));padding:16px;border-radius:calc(var(--k-radius) + 4px);}[data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='dialog'][data-part='title'] {margin:0;font-size:16px;font-weight:600;line-height:24px;}.description.svelte-1fchw0y {display:grid;gap:8px;font-size:14px;line-height:22px;}[part='message'].svelte-1fchw0y {color:var(--k-muted);}[part='impact'].svelte-1fchw0y {color:var(--k-fg);font-weight:500;}"
};
function du(t, r) {
	U(r, !0), ee(t, uu);
	let a = F(r, "open", 7, !1), o = F(r, "heading", 7, ""), c = F(r, "message", 7, ""), l = F(r, "confirmLabel", 7, null), f = F(r, "danger", 7, !1), h = F(r, "impact", 7, null), _ = F(r, "busy", 7, !1), b = F(r, "locale", 7, null), S = F(r, "strings", 7, null), C = r.$$host, O = R(() => ru(b(), S() ?? void 0)), k = M(null), A = M(!1), te = !1, j = tu(C);
	d(() => j(x(k), !!a())), d(() => {
		a() && e(A, !1);
	}), d(() => {
		let t = !!_();
		te && !t && e(A, !1), te = t;
	});
	function ne() {
		x(A) || _() || (e(A, !0), Yl(C, "confirm", {}));
	}
	var I = {
		get open() {
			return a();
		},
		set open(e = !1) {
			a(e), W();
		},
		get heading() {
			return o();
		},
		set heading(e = "") {
			o(e), W();
		},
		get message() {
			return c();
		},
		set message(e = "") {
			c(e), W();
		},
		get confirmLabel() {
			return l();
		},
		set confirmLabel(e = null) {
			l(e), W();
		},
		get danger() {
			return f();
		},
		set danger(e = !1) {
			f(e), W();
		},
		get impact() {
			return h();
		},
		set impact(e = null) {
			h(e), W();
		},
		get busy() {
			return _();
		},
		set busy(e = !1) {
			_(e), W();
		},
		get locale() {
			return b();
		},
		set locale(e = null) {
			b(e), W();
		},
		get strings() {
			return S();
		},
		set strings(e = null) {
			S(e), W();
		}
	}, re = lu(), ie = T(re);
	return Jl(ie, {}), Tr(E(ie, 2), {
		value: () => C.shadowRoot,
		children: (t, r) => {
			var d = g(), b = T(d), S = () => !!a();
			y(b, () => Wl, (t, r) => {
				r(t, {
					get open() {
						return S();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !1,
					role: "alertdialog",
					onOpenChange: (e) => {
						e.open || Yl(C, "cancel", { reason: "escape" });
					},
					children: (t, r) => {
						var a = g(), d = T(a);
						{
							let t = (t, r = P) => {
								var a = cu(), d = (e) => e.preventDefault();
								fe(a, (e) => ({
									...e,
									class: "af-kit",
									oncancel: d
								}), [() => r()()], void 0, void 0, "svelte-1fchw0y");
								var b = u(a);
								y(b, () => oo, (e, t) => {
									t(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, t) => {
											var r = su(), a = T(r);
											y(a, () => Kl, (e, t) => {
												t(e, {
													part: "heading",
													children: (e, t) => {
														L();
														var n = v();
														s(() => p(n, o() ?? "")), m(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var d = E(a, 2), b = (e) => {
												var t = g(), n = T(t);
												{
													let e = (e, t = P) => {
														var n = ou();
														fe(n, (e) => ({
															...e,
															class: "description"
														}), [() => t()()], void 0, void 0, "svelte-1fchw0y");
														var r = u(n), a = (e) => {
															var t = iu(), n = w(t, !0);
															s(() => p(n, c())), m(e, t);
														};
														i(r, (e) => {
															c() && e(a);
														});
														var o = E(r, 2), l = (e) => {
															var t = au(), n = w(t, !0);
															s(() => p(n, h())), m(e, t);
														};
														i(o, (e) => {
															h() && e(l);
														}), G(n), m(e, n);
													};
													y(n, () => co, (t, n) => {
														n(t, {
															asChild: e,
															$$slots: { asChild: !0 }
														});
													});
												}
												m(e, t);
											};
											i(d, (e) => {
												(c() || h()) && e(b);
											});
											var S = E(d, 2), k = u(S), ee = w(k, !0), te = E(k, 2), j = w(te, !0);
											G(S), s(() => {
												p(ee, x(O).cancel), D(te, 1, pe(f() ? "af-button danger" : "af-button primary")), N(te, "aria-disabled", x(A) || _() ? "true" : void 0), p(j, l() || x(O).confirm);
											}), n("click", k, () => Yl(C, "cancel", { reason: "close-button" })), n("click", te, ne), m(e, r);
										},
										$$slots: { default: !0 }
									});
								}), G(a), ue(a, (t) => e(k, t), () => x(k)), m(t, a);
							};
							y(d, () => uo, (e, n) => {
								n(e, {
									asChild: t,
									$$slots: { asChild: !0 }
								});
							});
						}
						m(t, a);
					},
					$$slots: { default: !0 }
				});
			}), m(t, d);
		},
		$$slots: { default: !0 }
	}), m(t, re), B(I);
}
_e(["click"]), H(du, {
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
var Z = uc("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/constrain.mjs
function fu(e, t, n, r, i) {
	let a = {};
	for (let e in t) {
		let n = e, r = t[n];
		r != null && (a[n] = Math.floor(r / 2), a[n] > 0 && r % 2 == 0 && a[n]--);
	}
	return hu(e, pu(e, t, n).subtract(a), t, n, r, i);
}
function pu(e, t, n, r, i) {
	let a = e;
	return t.years ? a = Wo(e) : t.months ? a = Ho(e) : t.weeks && (a = Ko(e, n)), hu(e, a, t, n, r, i);
}
function mu(e, t, n, r, i) {
	let a = { ...t };
	return a.days ? a.days-- : a.weeks ? a.weeks-- : a.months ? a.months-- : a.years && a.years--, hu(e, pu(e, t, n).subtract(a), t, n, r, i);
}
function hu(e, t, n, r, i, a) {
	return i && e.compare(i) >= 0 && (t = es(t, pu(ms(i), n, r))), a && e.compare(a) <= 0 && (t = $o(t, mu(ms(a), n, r))), t;
}
function gu(e, t, n) {
	let r = ms(e), i = t ? ms(t) : void 0, a = n ? ms(n) : void 0, o = r;
	return i && (o = es(o, i)), a && (o = $o(o, a)), o.compare(r) === 0 ? e : "hour" in e ? e.set({
		year: o.year,
		month: o.month,
		day: o.day
	}) : o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/align.mjs
function _u(e, t, n, r, i, a) {
	switch (t) {
		case "start": return pu(e, n, r, i, a);
		case "end": return mu(e, n, r, i, a);
		default: return fu(e, n, r, i, a);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/assertion.mjs
function vu(e, t) {
	return e == null || t == null ? e === t : !("hour" in e) && !("hour" in t) ? Co(e, t) : hs(e).compare(hs(t)) === 0;
}
function yu(e, t, n, r, i) {
	return e ? t?.(e, n) ? !0 : bu(e, r, i) : !1;
}
function bu(e, t, n) {
	return t != null && e.compare(t) < 0 || n != null && e.compare(n) > 0;
}
function xu(e, t, n) {
	let r = e.subtract({ days: 1 });
	return Co(r, e) || bu(r, t, n);
}
function Su(e, t, n) {
	let r = e.add({ days: 1 });
	return Co(r, e) || bu(r, t, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/duration.mjs
function Cu(e) {
	let t = { ...e };
	for (let e in t) t[e] = 1;
	return t;
}
function wu(e, t) {
	let n = { ...t };
	return n.days ? n.days-- : n.days = -1, e.add(n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/get-era-format.mjs
function Tu(e) {
	if (!e) return;
	let t = e.calendar.identifier;
	return t === "gregory" || t === "iso8601" ? e.era === "BC" ? "short" : void 0 : "short";
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/formatter.mjs
function Eu(e, t, n) {
	let r = n ?? hs(Po(t));
	return new nc(e, {
		weekday: "long",
		month: "long",
		year: "numeric",
		day: "numeric",
		era: Tu(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
function Du(e, t, n) {
	let r = n ?? Po(t);
	return new nc(e, {
		month: "long",
		year: "numeric",
		era: Tu(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/format.mjs
function Ou(e, t, n, r, i) {
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
function ku(e, t, n, r) {
	if (!e) return "";
	let i = e, a = t ?? e, o = Eu(n, r);
	return Co(i, a) ? o.format(i.toDate(r)) : Ou(i, a, o, (e, t) => `${e} \u2013 ${t}`, r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-month.mjs
var Au = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function ju(e) {
	return e == null ? void 0 : Au[e];
}
function Mu(e, t, n) {
	return Ko(e, t, ju(n));
}
function Nu(e, t, n, r) {
	let i = t.add({ weeks: e }), a = [], o = Mu(i, n, r);
	for (; a.length < 7;) {
		a.push(o);
		let e = o.add({ days: 1 });
		if (Co(o, e)) break;
		o = e;
	}
	return a;
}
function Pu(e, t, n, r) {
	let i = ju(r), a = n ?? Qo(e, t, i);
	return [...Array(a).keys()].map((n) => Nu(n, e, t, r));
}
function Fu(e, t) {
	let n = new nc(e, {
		weekday: "long",
		timeZone: t
	}), r = new nc(e, {
		weekday: "short",
		timeZone: t
	}), i = new nc(e, {
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
function Iu(e, t, n, r) {
	let i = Mu(e, r, t), a = [...Array(7).keys()], o = Fu(r, n);
	return a.map((e) => o(i.add({ days: e })));
}
function Lu(e, t = "long", n) {
	if (!n || n.calendar.identifier === "gregory" || n.calendar.identifier === "iso8601") {
		let n = new Date(2021, 0, 1), r = [];
		for (let i = 0; i < 12; i++) r.push(n.toLocaleString(e, { month: t })), n.setMonth(n.getMonth() + 1);
		return r;
	}
	let r = n.calendar.getMonthsInYear(n), i = new nc(e, {
		month: t,
		calendar: n.calendar.identifier
	}), a = [];
	for (let e = 1; e <= r; e++) {
		let t = n.set({ month: e });
		a.push(i.format(t.toDate("UTC")));
	}
	return a;
}
function Ru(e, t) {
	let n = Ko(e, t, "mon"), r = n.year, i = Ko(n.set({
		month: 1,
		day: 4
	}), t, "mon"), a = n.calendar.toJulianDay(n), o = i.calendar.toJulianDay(i);
	if (a >= o) return 1 + Math.floor((a - o) / 7);
	let s = Ko(n.set({
		year: r - 1,
		month: 1,
		day: 4
	}), t, "mon"), c = s.calendar.toJulianDay(s);
	return 1 + Math.floor((a - c) / 7);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-year.mjs
function zu(e) {
	let t = [];
	for (let n = e.from; n <= e.to; n += 1) t.push(n);
	return t;
}
var Bu = 1900, Vu = 2099;
function Hu(e, t, n) {
	let r = e.calendar;
	return {
		from: t?.year ?? gs(new Qs(Bu, 1, 1), r).year,
		to: n?.year ?? gs(new Qs(Vu, 12, 31), r).year
	};
}
var Uu = 10;
function Wu(e) {
	if (e) {
		if (e.length === 3) return e.padEnd(4, "0");
		if (e.length === 2) {
			let t = (/* @__PURE__ */ new Date()).getFullYear(), n = Math.floor(t / 100) * 100 + parseInt(e.slice(-2), 10);
			return n > t + Uu ? (n - 100).toString() : n.toString();
		}
		return e;
	}
}
function Gu(e, t) {
	let n = t?.strict ? 10 : 12, r = e - e % 10, i = [];
	for (let e = 0; e < n; e += 1) {
		let t = r + e;
		i.push(t);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/mutation.mjs
function Ku(e, t) {
	let n = Po(e ?? Bo());
	return t ? gs(n, t) : n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/pagination.mjs
function qu(e, t, n, r) {
	return function(i) {
		let { startDate: a, focusedDate: o } = i, s = wu(a, e);
		return bu(o, n, r) ? {
			startDate: a,
			focusedDate: gu(o, n, r),
			endDate: s
		} : o.compare(a) < 0 ? {
			startDate: mu(o, e, t, n, r),
			focusedDate: gu(o, n, r),
			endDate: s
		} : o.compare(s) > 0 ? {
			startDate: pu(o, e, t, n, r),
			endDate: s,
			focusedDate: gu(o, n, r)
		} : {
			startDate: a,
			endDate: s,
			focusedDate: gu(o, n, r)
		};
	};
}
function Ju(e, t, n, r, i, a) {
	let o = qu(n, r, i, a), s = t.add(n);
	return o({
		focusedDate: e.add(n),
		startDate: pu(hu(e, s, n, r, i, a), n, r)
	});
}
function Yu(e, t, n, r, i, a) {
	let o = qu(n, r, i, a), s = t.subtract(n);
	return o({
		focusedDate: e.subtract(n),
		startDate: pu(hu(e, s, n, r, i, a), n, r)
	});
}
function Xu(e, t, n, r, i, a, o) {
	let s = qu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.add(Cu(r)),
		startDate: t
	});
	if (r.days) return Ju(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.add({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.add({ years: 1 }),
		startDate: t
	});
}
function Zu(e, t, n, r, i, a, o) {
	let s = qu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.subtract(Cu(r)),
		startDate: t
	});
	if (r.days) return Yu(e, t, r, i, a, o);
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
var Qu = /* @__PURE__ */ new Map();
function $u(e) {
	let t = Qu.get(e);
	return t ?? (t = "0123456789" + new Intl.NumberFormat(e, { useGrouping: !1 }).format(1234567890), Qu.set(e, t), t);
}
var ed = (e, t) => t ? $u(t).includes(e) : /\d/.test(e), td = (e, t, n) => !e || e.length !== 1 || ed(e, n) || t.includes(e), nd = (e, t, n) => e.split("").filter((e) => td(e, t, n)).join(""), rd = /* @__PURE__ */ new Map();
function id(e) {
	let t = rd.get(e);
	if (t != null) return t;
	let n = new Intl.DateTimeFormat(e).formatToParts(/* @__PURE__ */ new Date()).find((e) => e.type === "literal");
	return t = n ? n.value : "/", rd.set(e, t), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/parse-date.mjs
var ad = (e) => e != null && e.length === 4, od = (e) => e != null && parseFloat(e) <= 12, sd = (e) => e != null && parseFloat(e) <= 31;
function cd(e, t, n) {
	let { year: r, month: i, day: a } = ud(ld(t, n), e) ?? {};
	if (r != null || i != null || a != null) {
		let e = /* @__PURE__ */ new Date();
		r ||= e.getFullYear().toString(), i ||= (e.getMonth() + 1).toString(), a ||= e.getDate().toString();
	}
	if (ad(r) || (r = Wu(r)), ad(r) && od(i) && sd(a)) return new Qs(+r, +i, +a);
	let o = Date.parse(e);
	if (!isNaN(o)) {
		let e = new Date(o);
		return new Qs(e.getFullYear(), e.getMonth() + 1, e.getDate());
	}
}
function ld(e, t) {
	return new nc(e, {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: t
	}).formatToParts(new Date(2e3, 11, 25)).map(({ type: e, value: t }) => e === "literal" ? `${t}?` : `((?!=<${e}>)\\d+)?`).join("");
}
function ud(e, t) {
	let n = t.match(e);
	return e.toString().match(/<(.+?)>/g)?.map((e) => {
		let t = e.match(/<(.+)>/);
		return !t || t.length <= 0 ? null : e.match(/<(.+)>/)?.[1];
	}).reduce((e, t, r) => (t && (e[t] = n && n.length > r ? n[r + 1] : null), e), {});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/preset.mjs
function dd(e, t, n) {
	let r = ms(No(n));
	switch (e) {
		case "thisWeek": return [Ko(r, t), qo(r, t)];
		case "thisMonth": return [Ho(r), r];
		case "thisQuarter": return [Ho(r).add({ months: -((r.month - 1) % 3) }), r];
		case "thisYear": return [Wo(r), r];
		case "last3Days": return [r.add({ days: -2 }), r];
		case "last7Days": return [r.add({ days: -6 }), r];
		case "last14Days": return [r.add({ days: -13 }), r];
		case "last30Days": return [r.add({ days: -29 }), r];
		case "last90Days": return [r.add({ days: -89 }), r];
		case "lastMonth": return [Ho(r.add({ months: -1 })), Uo(r.add({ months: -1 }))];
		case "lastQuarter": return [Ho(r.add({ months: -((r.month - 1) % 3) - 3 })), Uo(r.add({ months: -((r.month - 1) % 3) - 1 }))];
		case "lastWeek": return [Ko(r, t).add({ weeks: -1 }), qo(r, t).add({ weeks: -1 })];
		case "lastYear": return [Wo(r.add({ years: -1 })), Go(r.add({ years: -1 }))];
		default: throw Error(`Invalid date range preset: ${e}`);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-anchor.mjs
function fd(e = 0, t = 0, n = 0, r = 0) {
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
function pd(e) {
	if (!e) return fd();
	let { x: t, y: n, width: r, height: i } = e;
	return fd(t, n, r, i);
}
function md(e, t) {
	return {
		contextElement: Ge(e) ? e : e?.contextElement,
		getBoundingClientRect: () => {
			let n = e, r = t?.(n);
			return r || !n ? pd(r) : n.getBoundingClientRect();
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/middleware.mjs
var hd = (e) => ({
	variable: e,
	reference: `var(${e})`
}), gd = {
	arrowSize: hd("--arrow-size"),
	arrowSizeHalf: hd("--arrow-size-half"),
	arrowBg: hd("--arrow-background"),
	transformOrigin: hd("--transform-origin"),
	arrowOffset: hd("--arrow-offset")
}, _d = (e) => e === "top" || e === "bottom" ? "y" : "x";
function vd(e, t) {
	return {
		name: "transformOrigin",
		fn(n) {
			let { elements: r, middlewareData: i, placement: a, rects: o, y: s } = n, c = a.split("-")[0], l = _d(c), u = i.arrow?.x || 0, d = i.arrow?.y || 0, f = t?.clientWidth || 0, p = t?.clientHeight || 0, m = u + f / 2, h = d + p / 2, g = Math.abs(i.shift?.y || 0), _ = o.reference.height / 2, v = p / 2, y = e.offset?.mainAxis ?? e.gutter, b = typeof y == "number" ? y + v : y ?? v, x = g > b, S = {
				top: `${m}px calc(100% + ${b}px)`,
				bottom: `${m}px ${-b}px`,
				left: `calc(100% + ${b}px) ${h}px`,
				right: `${-b}px ${h}px`
			}[c], C = `${m}px ${o.reference.y + _ - s}px`, w = !!e.overlap && l === "y" && x;
			return r.floating.style.setProperty(gd.transformOrigin.variable, w ? C : S), { data: { transformOrigin: w ? C : S } };
		}
	};
}
var yd = {
	name: "rects",
	fn({ rects: e }) {
		return { data: e };
	}
}, bd = (e) => {
	if (e) return {
		name: "shiftArrow",
		fn({ placement: t, middlewareData: n }) {
			if (!n.arrow) return {};
			let { x: r, y: i } = n.arrow, a = t.split("-")[0];
			return Object.assign(e.style, {
				left: r == null ? "" : `${r}px`,
				top: i == null ? "" : `${i}px`,
				[a]: `calc(100% + ${gd.arrowOffset.reference})`
			}), {};
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/placement.mjs
function xd(e) {
	let [t, n] = e.split("-");
	return {
		side: t,
		align: n,
		hasAlign: n != null
	};
}
function Sd(e) {
	return e.split("-")[0];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-placement.mjs
var Cd = {
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
function wd(e, t) {
	let n = e.devicePixelRatio || 1;
	return Math.round(t * n) / n;
}
function Td(e, t) {
	return e != null && Math.abs(e - t) < .5;
}
function Ed(e) {
	return typeof e == "function" ? e() : e === "clipping-ancestors" ? "clippingAncestors" : e;
}
function Dd(e, t, n) {
	let r = e || t.createElement("div");
	return ve({
		element: r,
		padding: n.arrowPadding
	});
}
function Od(e, t) {
	if (!oi(t.offset ?? t.gutter)) return be(({ placement: n }) => {
		let r = (e?.clientHeight || 0) / 2, i = t.offset?.mainAxis ?? t.gutter, a = typeof i == "number" ? i + r : i ?? r, { hasAlign: o } = xd(n), s = o ? void 0 : t.shift;
		return Ni({
			crossAxis: t.offset?.crossAxis ?? s,
			mainAxis: a,
			alignmentAxis: t.shift
		});
	});
}
function kd(e) {
	if (e.flip) return ye(() => {
		let t = Ed(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			padding: e.overflowPadding,
			fallbackPlacements: e.flip === !0 ? void 0 : e.flip
		};
	});
}
function Ad(e) {
	if (e.slide || e.overlap) return xe(() => {
		let t = Ed(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			mainAxis: e.slide,
			crossAxis: e.overlap,
			padding: e.overflowPadding,
			limiter: Oe()
		};
	});
}
function jd(e) {
	if (e.sizeMiddleware === !1 && !e.sameWidth && !e.fitViewport) return;
	let t, n, r, i;
	return Te(() => {
		let a = Ed(e.boundary);
		return {
			padding: e.overflowPadding,
			...a ? { boundary: a } : void 0,
			apply({ elements: e, rects: a, availableHeight: o, availableWidth: s }) {
				let c = e.floating, l = Math.round(a.reference.width), u = Math.round(a.reference.height);
				s = Math.floor(s), o = Math.floor(o), Td(t, l) || (c.style.setProperty("--reference-width", `${l}px`), t = l), Td(n, u) || (c.style.setProperty("--reference-height", `${u}px`), n = u), Td(r, s) || (c.style.setProperty("--available-width", `${s}px`), r = s), Td(i, o) || (c.style.setProperty("--available-height", `${o}px`), i = o);
			}
		};
	});
}
function Md(e) {
	if (e.hideWhenDetached) return Se(() => ({
		strategy: "referenceHidden",
		boundary: Ed(e.boundary) ?? "clippingAncestors"
	}));
}
function Nd(e) {
	return e ? e === !0 ? {
		ancestorResize: !0,
		ancestorScroll: !0,
		elementResize: !0,
		layoutShift: !0
	} : e : {};
}
var Pd = [
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
], Fd = [
	"top",
	"right",
	"bottom",
	"left"
];
function Id(e, t) {
	if (!e) return vi;
	let n = new Map(t.map((t) => [t, e.style.getPropertyValue(t)]));
	return () => {
		n.forEach((t, n) => {
			t ? e.style.setProperty(n, t) : e.style.removeProperty(n);
		}), e.style.length === 0 && e.removeAttribute("style");
	};
}
function Ld(e) {
	return e == null ? null : Ge(e) ? e : typeof e == "object" && e && "contextElement" in e && e.contextElement ? e.contextElement : e;
}
function Rd(e, t, n = {}) {
	let r = () => (typeof t == "function" ? t() : t) ?? null, i = () => {
		let t = typeof e == "function" ? e() : e;
		return n.getAnchorElement?.() ?? t;
	}, a = () => {
		let e = i();
		return !e && !n.getAnchorRect ? null : md(e, n.getAnchorRect);
	}, o = Object.assign({}, Cd, n), s = [], c = null, l, u;
	function d(e) {
		l?.(), u?.(), c = e, l = o.restoreStyles ? Id(e, Pd) : void 0;
		let t = e.querySelector("[data-part=arrow]");
		u = o.restoreStyles ? Id(t, Fd) : void 0, s = [
			Od(t, o),
			kd(o),
			Ad(o),
			Dd(t, e.ownerDocument, o),
			bd(t),
			vd({
				gutter: o.gutter,
				offset: o.offset,
				overlap: o.overlap
			}, t),
			jd(o),
			Md(o),
			yd
		];
	}
	let { placement: f, strategy: p, onComplete: m, onPositioned: h } = o, g, _, v = !1, y, b, x = vi, S = Nd(o.listeners);
	function C() {
		if (!o.listeners) return;
		let e = i(), t = a(), n = r();
		t && n && (Ld(e) !== Ld(y) || n !== b) && (x(), y = e, b = n, x = we(t, n, T, S));
	}
	async function w() {
		C();
		let e = r();
		if (!e) return;
		e !== c && (d(e), v = !1);
		let t = a();
		if (!t) return;
		let n = await De(t, e, {
			placement: f,
			middleware: s,
			strategy: p
		}), i = st(e), l = wd(i, n.x), u = wd(i, n.y);
		if (m?.({
			...n,
			x: l,
			y: u
		}), o.applyStyles !== !1 && (Td(g, l) || (e.style.setProperty("--x", `${l}px`), g = l), Td(_, u) || (e.style.setProperty("--y", `${u}px`), _ = u), o.hideWhenDetached && (n.middlewareData.hide?.referenceHidden ? (e.style.setProperty("visibility", "hidden"), e.style.setProperty("pointer-events", "none")) : (e.style.removeProperty("visibility"), e.style.removeProperty("pointer-events"))), !v)) {
			let t = e.firstElementChild;
			t && (e.style.setProperty("--z-index", ft(t).zIndex), v = !0);
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
function zd(e, t, n = {}) {
	let { defer: r, ...i } = n, a = r ? q : (e) => e(), o = [];
	return o.push(a(() => {
		o.push(Rd(e, t, i));
	})), () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-styles.mjs
var Bd = {
	bottom: "rotate(45deg)",
	left: "rotate(135deg)",
	top: "rotate(225deg)",
	right: "rotate(315deg)"
};
function Vd(e = {}) {
	let { placement: t, sameWidth: n, fitViewport: r, strategy: i = "absolute" } = e;
	return {
		arrow: {
			position: "absolute",
			width: gd.arrowSize.reference,
			height: gd.arrowSize.reference,
			[gd.arrowSizeHalf.variable]: `calc(${gd.arrowSize.reference} / 2)`,
			[gd.arrowOffset.variable]: `calc(${gd.arrowSizeHalf.reference} * -1)`
		},
		arrowTip: {
			transform: t ? Bd[t.split("-")[0]] : void 0,
			background: gd.arrowBg.reference,
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
var Hd = (e, t) => e.ids?.label?.(t) ?? `datepicker:${e.id}:label:${t}`, Ud = (e) => e.ids?.root ?? `datepicker:${e.id}`, Wd = (e, t) => e.ids?.table?.(t) ?? `datepicker:${e.id}:table:${t}`, Gd = (e) => e.ids?.content ?? `datepicker:${e.id}:content`, Kd = (e, t) => e.ids?.cellTrigger?.(t) ?? `datepicker:${e.id}:cell-trigger:${t}`, qd = (e, t) => e.ids?.prevTrigger?.(t) ?? `datepicker:${e.id}:prev:${t}`, Jd = (e, t) => e.ids?.nextTrigger?.(t) ?? `datepicker:${e.id}:next:${t}`, Yd = (e, t) => e.ids?.viewTrigger?.(t) ?? `datepicker:${e.id}:view:${t}`, Xd = (e) => e.ids?.clearTrigger ?? `datepicker:${e.id}:clear`, Zd = (e) => e.ids?.control ?? `datepicker:${e.id}:control`, Qd = (e, t) => e.ids?.input?.(t) ?? `datepicker:${e.id}:input:${t}`, $d = (e) => e.ids?.trigger ?? `datepicker:${e.id}:trigger`, ef = (e) => e.ids?.positioner ?? `datepicker:${e.id}:positioner`, tf = (e) => e.ids?.monthSelect ?? `datepicker:${e.id}:month-select`, nf = (e) => e.ids?.yearSelect ?? `datepicker:${e.id}:year-select`, rf = (e, t) => Qn(of(e), `[data-part=table-cell-trigger][data-view=${t}][data-focus]:not([data-outside-range])`), af = (e) => e.getById($d(e)), of = (e) => e.getById(Gd(e)), sf = (e) => Zn(ff(e), "[data-part=input]"), cf = (e) => e.getById(nf(e)), lf = (e) => e.getById(tf(e)), uf = (e) => e.getById(Xd(e)), df = (e) => e.getById(ef(e)), ff = (e) => e.getById(Zd(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.utils.mjs
function pf(e) {
	let [t, n] = e, r;
	return r = !t || !n || t.compare(n) <= 0 ? e : [n, t], r;
}
function mf(e, t) {
	let [n, r] = t;
	return !n || !r ? !1 : n.compare(e) <= 0 && r.compare(e) >= 0;
}
function hf(e) {
	return e.slice().filter((e) => e != null).sort((e, t) => e.compare(t));
}
function gf(e) {
	return xi(e, {
		year: "calendar decade",
		month: "calendar year",
		day: "calendar month"
	});
}
var _f = {
	day: "dd",
	month: "mm",
	year: "yyyy"
};
function vf(e) {
	return new nc(e).formatToParts(/* @__PURE__ */ new Date()).map((e) => _f[e.type] ?? e.value).join("");
}
var yf = (e) => !Number.isNaN(e.day) && !Number.isNaN(e.month) && !Number.isNaN(e.year), bf = {
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
		return xi(e, {
			year: "Switch to previous decade",
			month: "Switch to previous year",
			day: "Switch to previous month"
		});
	},
	nextTrigger(e) {
		return xi(e, {
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
function xf(e, t) {
	return e ? e === "day" ? 0 : e === "month" ? 1 : 2 : t || 0;
}
function Sf(e) {
	return e === 0 ? "day" : e === 1 ? "month" : "year";
}
function Cf(e, t, n) {
	return Sf(Mi(xf(e, 0), xf(t, 0), xf(n, 2)));
}
function wf(e, t) {
	return xf(e, 0) > xf(t, 0);
}
function Tf(e, t) {
	return xf(e, 0) < xf(t, 0);
}
function Ef(e, t, n) {
	return Cf(Sf(xf(e, 0) + 1), t, n);
}
function Df(e, t, n) {
	return Cf(Sf(xf(e, 0) - 1), t, n);
}
var Of = [
	"day",
	"month",
	"year"
];
function kf(e) {
	Of.forEach((t) => e(t));
}
var Af = Xi((e) => [
	e.view,
	e.startValue.toString(),
	e.endValue.toString(),
	e.locale,
	e.timeZone,
	e.selectionMode
], ([e], t) => {
	let { startValue: n, endValue: r, locale: i, timeZone: a, selectionMode: o } = t;
	if (e === "year") {
		let e = Gu(n.year, { strict: !0 }), t = e.at(0).toString(), r = e.at(-1).toString();
		return {
			start: t,
			end: r,
			formatted: `${t} - ${r}`
		};
	}
	if (e === "month") {
		let e = new nc(i, {
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
	let s = new nc(i, {
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
function jf(e, t) {
	let { state: n, context: r, prop: i, send: a, computed: o, scope: s } = e, c = r.get("startValue"), l = o("endValue"), u = r.get("value"), d = r.get("focusedValue"), f = r.get("hoveredValue"), p = f ? pf([u[0], f]) : [], m = !!i("disabled"), h = !!i("readOnly"), g = !!i("invalid"), _ = o("isInteractive"), v = u.length === 0, y = i("min"), b = i("max"), x = i("locale"), S = i("timeZone"), C = i("startOfWeek"), w = n.matches("focused"), T = n.matches("open"), E = i("selectionMode") === "range", D = i("selectionMode") === "multiple", O = i("isDateUnavailable"), k = i("maxSelectedDates"), ee = D && k != null && u.length >= k, A = r.get("currentPlacement"), te = A ? Sd(A) : void 0, j = Vd({
		...i("positioning"),
		placement: A
	}), M = id(x), N = Pi(bf, i("translations"));
	function P(e = c) {
		let t = i("fixedWeeks") ? 6 : void 0;
		return Pu(e, x, t, C);
	}
	function F(e = {}) {
		let { format: t } = e;
		return Lu(x, t, d).map((e, t) => {
			let n = t + 1;
			return {
				label: e,
				value: n,
				disabled: bu(d.set({ month: n }), y, b)
			};
		});
	}
	function ne() {
		return zu(Hu(d, y, b)).map((e) => ({
			label: e.toString(),
			value: e,
			disabled: !ji(e, y?.year, b?.year)
		}));
	}
	function I(e) {
		return yu(e, O, x, y, b);
	}
	function re(e) {
		let t = c ?? Ku(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ month: e })
		});
	}
	function ie(e) {
		let t = c ?? Ku(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ year: e })
		});
	}
	function L(e) {
		let { value: t, disabled: n } = e, r = d.set({ year: t }), i = !Gu(c.year, { strict: !0 }).includes(t), a = ji(t, y?.year, b?.year), o = E && mf(r, u), s = E && u[0] && Oo(r, u[0]), l = E && u[1] && Oo(r, u[1]), f = E && p.length > 0, m = f && mf(r, p), h = f && p[0] && Oo(r, p[0]), g = f && p[1] && Oo(r, p[1]), _ = {
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
	function ae(e) {
		let { value: t, disabled: n } = e, r = d.set({ month: t }), i = Du(x, S, d), a = E && mf(r, u), o = E && u[0] && Do(r, u[0]), s = E && u[1] && Do(r, u[1]), c = E && p.length > 0, l = c && mf(r, p), f = c && p[0] && Do(r, p[0]), m = c && p[1] && Do(r, p[1]), h = {
			focused: d.month === e.value,
			selectable: !bu(r, y, b),
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
	function oe(e) {
		let { value: t, disabled: n, visibleRange: r = o("visibleRange") } = e, a = Eu(x, S, d), s = Cu(o("visibleDuration")), c = i("outsideDaySelectable"), l = r.start.add(s).subtract({ days: 1 }), f = bu(t, r.start, l), m = E && mf(t, u), h = E && u[0] && Co(t, u[0]), g = E && u[1] && Co(t, u[1]), _ = E && p.length > 0, v = _ && mf(t, p), C = _ && p[0] && Co(t, p[0]), w = _ && p[1] && Co(t, p[1]), T = u.some((e) => e != null && Co(t, e)), D = {
			invalid: bu(t, y, b),
			disabled: n || !c && f || bu(t, y, b) || ee && !T,
			selected: T,
			unavailable: yu(t, O, x, y, b) && !n,
			outsideRange: f,
			today: Ao(t, S),
			weekend: ns(t, x),
			value: t,
			valueText: a.format(t.toDate(S)),
			get focused() {
				return d != null && Co(t, d) && (!D.outsideRange || c);
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
	function R(e) {
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
			return dd(e, x, S);
		},
		getWeekNumber(e) {
			let t = e[0];
			return t ? Ru(t, x) : 0;
		},
		getDaysInWeek(e, t = c) {
			return Nu(e, t, x, C);
		},
		getOffset(e) {
			let t = c.add(e), n = l.add(e), r = Du(x, S, d);
			return {
				visibleRange: {
					start: t,
					end: n
				},
				weeks: P(t),
				visibleRangeText: {
					start: r.format(t.toDate(S)),
					end: r.format(n.toDate(S))
				}
			};
		},
		getMonthWeeks: P,
		isUnavailable: I,
		weeks: P(),
		weekDays: Iu(c, C, S, x),
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
			let e = gu(Ku(S, d.calendar), y, b);
			a({
				type: "VALUE.SET",
				value: [e]
			});
		},
		setValue(e) {
			let t = e.map((e) => gu(e, y, b));
			a({
				type: "VALUE.SET",
				value: t
			});
		},
		setTime(e, t = 0) {
			let n = Array.from(u), r = n[t];
			r && ("hour" in r || (r = hs(r)), r = r.set({
				hour: e.hour ?? ("hour" in r ? r.hour : 0),
				minute: e.minute ?? ("minute" in r ? r.minute : 0),
				second: e.second ?? ("second" in r ? r.second : 0),
				millisecond: e.millisecond ?? ("millisecond" in r ? r.millisecond : 0)
			}), n[t] = gu(r, y, b), a({
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
		focusMonth: re,
		focusYear: ie,
		getYears: ne,
		getMonths: F,
		getYearsGrid(e = {}) {
			let { columns: t = 1 } = e;
			return Xr(Gu(c.year, { strict: !0 }).map((e) => ({
				label: e.toString(),
				value: e,
				disabled: !ji(e, y?.year, b?.year)
			})), t);
		},
		getDecade() {
			let e = Gu(c.year, { strict: !0 });
			return {
				start: e.at(0),
				end: e.at(-1)
			};
		},
		getMonthsGrid(e = {}) {
			let { columns: t = 1, format: n } = e;
			return Xr(F({ format: n }), t);
		},
		format(e, t = {
			month: "long",
			year: "numeric"
		}) {
			return new nc(x, {
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
				id: Ud(s),
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
				id: Hd(s, n),
				dir: i("dir"),
				htmlFor: Qd(s, n),
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
				id: Zd(s),
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
				"data-placement": A,
				"data-side": te,
				"data-inline": K(i("inline")),
				id: Gd(s),
				tabIndex: -1,
				role: "application",
				"aria-roledescription": "datepicker",
				"aria-label": N.content
			});
		},
		getTableProps(e = {}) {
			let { view: n = "day", columns: r = n === "day" ? 7 : 4 } = e, o = R(e);
			return t.element({
				...Z.table.attrs,
				role: "grid",
				"data-columns": r,
				"aria-roledescription": gf(n),
				id: Wd(s, o),
				"aria-readonly": Le(h),
				"aria-disabled": Le(m),
				"aria-multiselectable": Le(i("selectionMode") !== "single"),
				"data-view": n,
				dir: i("dir"),
				tabIndex: -1,
				onKeyDown(e) {
					if (e.defaultPrevented || m) return;
					let t = {
						Enter() {
							_ && (n === "day" && I(d) || (n !== "month" || ae({ value: d.month }).selectable) && (n !== "year" || L({ value: d.year }).selectable) && a({
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
					}[an(e, { dir: i("dir") })];
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
				"aria-disabled": Le(m),
				"data-disabled": K(m),
				"data-view": n
			});
		},
		getWeekNumberHeaderCellProps(e = {}) {
			let { view: n = "day" } = e;
			return t.element({
				...Z.tableCell.attrs,
				scope: "col",
				"aria-label": N.weekColumnHeader,
				"data-view": n,
				"data-type": "week-number",
				"data-disabled": K(m)
			});
		},
		getWeekNumberCellProps(e) {
			let { weekIndex: n, week: r } = e, i = r[0] ? Ru(r[0], x) : 0;
			return t.element({
				...Z.tableCell.attrs,
				role: "rowheader",
				"aria-label": N.weekNumberCell?.(i),
				"data-view": "day",
				"data-week-index": n,
				"data-type": "week-number",
				"data-disabled": K(m)
			});
		},
		getDayTableCellState: oe,
		getDayTableCellProps(e) {
			let { value: n } = e, r = oe(e);
			return t.element({
				...Z.tableCell.attrs,
				role: "gridcell",
				"aria-disabled": Le(!r.selectable),
				"aria-selected": r.selected || r.inRange,
				"aria-invalid": Le(r.invalid),
				"aria-current": r.today ? "date" : void 0,
				"data-value": n.toString()
			});
		},
		getDayTableCellTriggerProps(e) {
			let { value: n } = e, r = oe(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: Kd(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": N.dayCell(r),
				"aria-disabled": Le(!r.selectable),
				"aria-invalid": Le(r.invalid),
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
					f && Eo(n, f) || a({
						type: "CELL.POINTER_MOVE",
						cell: "day",
						value: n,
						focus: t,
						outsideRange: r.outsideRange
					});
				} : void 0
			});
		},
		getMonthTableCellState: ae,
		getMonthTableCellProps(e) {
			let { value: n, columns: r } = e, a = ae(e);
			return t.element({
				...Z.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": Le(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": Le(!a.selectable),
				"data-value": n
			});
		},
		getMonthTableCellTriggerProps(e) {
			let { value: n } = e, r = ae(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: Kd(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": Le(!r.selectable),
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
					f && r.value && Do(r.value, f) || a({
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
				...Z.tableCell.attrs,
				dir: i("dir"),
				colSpan: r,
				role: "gridcell",
				"aria-selected": Le(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": Le(!a.selectable),
				"data-value": n
			});
		},
		getYearTableCellTriggerProps(e) {
			let { value: n } = e, r = L(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: Kd(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": Le(!r.selectable),
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
					f && r.value && Oo(r.value, f) || a({
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
				id: Jd(s, n),
				type: "button",
				"aria-label": N.nextTrigger(n),
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
				id: qd(s, n),
				type: "button",
				"aria-label": N.prevTrigger(n),
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
				id: Xd(s),
				dir: i("dir"),
				type: "button",
				"aria-label": N.clearTrigger,
				hidden: !u.length,
				onClick(e) {
					e.defaultPrevented || _ && a({ type: "VALUE.CLEAR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...Z.trigger.attrs,
				id: $d(s),
				dir: i("dir"),
				type: "button",
				"data-placement": A,
				"data-side": te,
				"aria-label": N.trigger(T),
				"aria-controls": Gd(s),
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
			let { view: n = "day" } = e, r = Ef(n, i("minView"), i("maxView")), o = r !== n, c = m || !o;
			return t.button({
				...Z.viewTrigger.attrs,
				"data-view": n,
				dir: i("dir"),
				id: Yd(s, n),
				type: "button",
				disabled: c,
				"data-disabled": K(c),
				"aria-label": N.viewTrigger(n, o ? r : void 0),
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
				id: Qd(s, n),
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
				"aria-invalid": Le(g),
				"data-invalid": K(g),
				placeholder: i("placeholder") || vf(x),
				defaultValue: o("valueAsString")[n],
				onBeforeInput(e) {
					let { data: t } = on(e);
					td(t, M, x) || e.preventDefault();
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
						Jt(e) || I(d) || e.currentTarget.value.trim() !== "" && a({
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
						value: nd(t, M, x),
						index: n
					});
				}
			});
		},
		getMonthSelectProps() {
			return t.select({
				...Z.monthSelect.attrs,
				id: tf(s),
				"aria-label": N.monthSelect,
				disabled: m,
				dir: i("dir"),
				defaultValue: c.month,
				onChange(e) {
					re(Number(e.currentTarget.value));
				}
			});
		},
		getYearSelectProps() {
			return t.select({
				...Z.yearSelect.attrs,
				id: nf(s),
				disabled: m,
				"aria-label": N.yearSelect,
				dir: i("dir"),
				defaultValue: c.year,
				onChange(e) {
					ie(Number(e.currentTarget.value));
				}
			});
		},
		getPositionerProps() {
			return t.element({
				id: ef(s),
				...Z.positioner.attrs,
				dir: i("dir"),
				style: j.floating
			});
		},
		getPresetTriggerProps(e) {
			let n = Array.isArray(e.value) ? e.value : dd(e.value, x, S), r = n.filter((e) => e != null).map((e) => e.toDate(S).toDateString());
			return t.button({
				...Z.presetTrigger.attrs,
				"aria-label": N.presetTrigger(r),
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
var Mf = "__live-region__", Nf = "__live-region-debug__", Pf = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
function Ff(e = {}) {
	let { level: t = "polite", document: n = document, root: r, delay: i = 0, debug: a = !1 } = e, o = n.defaultView ?? window, s = r ?? n.body;
	function c() {
		if (!a) return;
		let e = n.getElementById(Nf);
		return e || (e = n.createElement("div"), e.id = Nf, e.dataset.liveAnnouncerDebug = "true", e.setAttribute("aria-hidden", "true"), e.style.cssText = Pf, s.appendChild(e), e);
	}
	function l(e, r) {
		n.getElementById(Mf)?.remove(), r ??= i;
		let a = n.createElement("span");
		a.id = Mf, a.dataset.liveAnnouncer = "true";
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
		n.getElementById(Mf)?.remove(), n.getElementById(Nf)?.remove();
	}
	return {
		announce: l,
		destroy: u,
		toJSON() {
			return Mf;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.machine.mjs
var { and: If } = ya();
function Lf(e, t) {
	if (e?.length !== t?.length) return !1;
	let n = Math.max(e.length, t.length);
	for (let r = 0; r < n; r++) if (!vu(e[r], t[r])) return !1;
	return !0;
}
function Rf(e, t) {
	return e.map((e) => e == null ? "" : t("format")(e, {
		locale: t("locale"),
		timeZone: t("timeZone")
	}));
}
var zf = ba({
	props({ props: e }) {
		let t = e.locale || "en-US", n = e.timeZone || "UTC", r = e.selectionMode || "single", i = e.numOfMonths || 1, a;
		if (e.createCalendar) {
			let n = new Intl.DateTimeFormat(t).resolvedOptions().calendar;
			n !== "gregory" && n !== "iso8601" && (a = e.createCalendar(n));
		}
		let o = (e) => !a || e.calendar.identifier === a.identifier ? e : gs(e, a), s = e.defaultValue ? hf(e.defaultValue).map((t) => gu(o(t), e.min, e.max)) : void 0, c = e.value ? hf(e.value).map((t) => gu(o(t), e.min, e.max)) : void 0, l = e.focusedValue || e.defaultFocusedValue || c?.[0] || s?.[0] || Ku(n, a);
		l = gu(o(l), e.min, e.max);
		let u = e.minView || "day", d = e.maxView || "year", f = Cf(e.defaultView || e.view || u, u, d);
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
				return new nc(t, {
					timeZone: n,
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					calendar: a?.identifier
				}).format(e.toDate(n));
			},
			parse(e, { locale: t, timeZone: n }) {
				return cd(e, t, n);
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
				isEqual: vu,
				hash: (e) => e.toString(),
				sync: !0,
				onChange(t) {
					let r = n(), i = r.get("view"), a = r.get("value"), o = Rf(a, e);
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
				isEqual: Lf,
				hash: (e) => e.map((e) => e?.toString() ?? "").join(","),
				onChange(t) {
					let r = n(), i = Rf(t, e);
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
				isEqual: vu
			})),
			view: t(() => ({
				defaultValue: e("defaultView"),
				value: e("view"),
				onChange(t) {
					e("onViewChange")?.({ view: t });
				}
			})),
			startValue: t(() => ({
				defaultValue: _u(e("focusedValue") || e("defaultFocusedValue"), "start", { months: e("numOfMonths") }, e("locale")),
				isEqual: vu,
				hash: (e) => e.toString()
			})),
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			restoreFocus: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		isInteractive: ({ prop: e }) => !e("disabled") && !e("readOnly"),
		visibleDuration: ({ prop: e }) => ({ months: e("numOfMonths") }),
		endValue: ({ context: e, computed: t }) => wu(e.get("startValue"), t("visibleDuration")),
		visibleRange: ({ context: e, computed: t }) => ({
			start: e.get("startValue"),
			end: t("endValue")
		}),
		visibleRangeText: ({ context: e, prop: t, computed: n }) => Af({
			view: e.get("view"),
			startValue: e.get("startValue"),
			endValue: n("endValue"),
			locale: t("locale"),
			timeZone: t("timeZone"),
			selectionMode: t("selectionMode")
		}),
		isPrevVisibleRangeValid: ({ context: e, prop: t }) => !xu(e.get("startValue"), t("min"), t("max")),
		isNextVisibleRangeValid: ({ prop: e, computed: t }) => !Su(t("endValue"), e("min"), e("max")),
		valueAsString: ({ context: e, prop: t }) => Rf(e.get("value"), t)
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
						guard: If("shouldRestoreFocus", "isInteractOutsideEvent"),
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
						guard: If("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd"
						]
					},
					{
						guard: If("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
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
						guard: If("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: If("isRangePicker", "isSelectingEndDate"),
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
						guard: If("isMultiPicker", "canSelectDate"),
						actions: ["setFocusedDate", "toggleSelectedDate"]
					},
					{
						guard: "isMultiPicker",
						actions: ["setFocusedDate"]
					},
					{
						guard: If("closeOnSelect", "isOpenControlled"),
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
					guard: If("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
					actions: ["setHoveredDate"]
				}, {
					guard: If("isRangePicker", "isSelectingEndDate"),
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
						guard: If("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd",
							"focusNextDay"
						]
					},
					{
						guard: If("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose"
						]
					},
					{
						guard: If("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: If("isRangePicker", "isSelectingEndDate"),
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
						guard: If("isMultiPicker", "canSelectDate"),
						actions: ["toggleSelectedDate"]
					},
					{ guard: "isMultiPicker" },
					{
						guard: If("closeOnSelect", "isOpenControlled"),
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
			isAboveMinView: ({ context: e, prop: t }) => wf(e.get("view"), t("minView")),
			isDayView: ({ context: e, event: t }) => (t.view || e.get("view")) === "day",
			isMonthView: ({ context: e, event: t }) => (t.view || e.get("view")) === "month",
			isYearView: ({ context: e, event: t }) => (t.view || e.get("view")) === "year",
			isRangePicker: ({ prop: e }) => e("selectionMode") === "range",
			hasSelectedRange: ({ context: e }) => e.get("value").length === 2,
			isMultiPicker: ({ prop: e }) => e("selectionMode") === "multiple",
			canSelectDate: (e) => {
				let { context: t, prop: n, event: r } = e, i = n("maxSelectedDates");
				if (i == null) return !0;
				let a = t.get("value"), o = Bf(e, r.value ?? t.get("focusedValue"));
				return a.some((e) => vu(e, o)) ? !0 : a.length < i;
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
				return t("inline") ? void 0 : (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), zd(ff(n), () => df(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				}));
			},
			setupLiveRegion({ scope: e, refs: t }) {
				let n = e.getDoc();
				return t.set("announcer", Ff({
					level: "assertive",
					document: n
				})), () => t.get("announcer")?.destroy?.();
			},
			trackDismissableElement({ scope: e, send: t, context: n, prop: r }) {
				return r("inline") ? void 0 : vl(() => of(e), {
					type: "popover",
					defer: !0,
					layerStyleTargets: [() => df(e)],
					exclude: [
						...sf(e),
						af(e),
						uf(e)
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
				let n = Ef(e.get("view"), t("minView"), t("maxView"));
				e.set("view", n);
			},
			setPreviousView({ context: e, prop: t }) {
				let n = Df(e.get("view"), t("minView"), t("maxView"));
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
					o = e && t ? ku(e, t, i, a) : e ? ku(e, null, i, a) : t ? ku(t, null, i, a) : "";
				} else o = r.map((e) => ku(e, null, i, a)).filter(Boolean).join(",");
				n.get("announcer")?.announce(o, 3e3);
			},
			announceVisibleRange({ computed: e, refs: t }) {
				let { formatted: n } = e("visibleRangeText");
				t.get("announcer")?.announce(n);
			},
			disableTextSelection({ scope: e }) {
				Kn({
					target: of(e),
					doc: e.getDoc()
				});
			},
			enableTextSelection({ scope: e }) {
				Gn({
					doc: e.getDoc(),
					target: of(e)
				});
			},
			focusFirstSelectedDate(e) {
				let { context: t } = e;
				t.get("value").length && Q(e, t.get("value")[0]);
			},
			syncInputElement({ scope: e, computed: t }) {
				q(() => {
					sf(e).forEach((e, n) => {
						dn(e, t("valueAsString")[n] || "");
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
				let r = t.value.map((e) => gu(e, n("min"), n("max")));
				e.set("value", r);
			},
			clearDateValue({ context: e }) {
				e.set("value", []);
			},
			setSelectedDate(e) {
				let { context: t, event: n } = e, r = Array.from(t.get("value")), i = t.get("activeIndex"), a = r[i];
				r[i] = Vf(a, Bf(e, n.value ?? t.get("focusedValue"))), t.set("value", pf(r));
			},
			resetSelection(e) {
				let { context: t, event: n } = e, r = t.get("value")[0], i = Bf(e, n.value ?? t.get("focusedValue"));
				t.set("value", [Vf(r, i)]);
			},
			toggleSelectedDate(e) {
				let { context: t, event: n } = e, r = Bf(e, n.value ?? t.get("focusedValue")), i = t.get("value"), a = i.findIndex((e) => vu(e, r));
				if (a === -1) {
					let e = [...i, r];
					t.set("value", hf(e));
				} else {
					let e = Array.from(i);
					e.splice(a, 1), t.set("value", hf(e));
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
				n[r] = Vf(i, e.get("focusedValue").copy()), e.set("value", pf(n));
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
				Hf(e, Ju(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusPreviousPage(e) {
				let { context: t, computed: n, prop: r } = e;
				Hf(e, Yu(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
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
				let { context: t, event: n, computed: r, prop: i } = e, a = Xu(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && Hf(e, a);
			},
			focusPreviousSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = Zu(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && Hf(e, a);
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
				Q(e, Ku(n("timeZone"), r));
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
				let { context: t } = e, n = Gu(t.get("focusedValue").year);
				Q(e, t.get("focusedValue").set({ year: n[0] }));
			},
			focusLastYear(e) {
				let { context: t } = e, n = Gu(t.get("focusedValue").year);
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
					rf(e, t.get("view"))?.focus({ preventScroll: !0 });
				});
			},
			focusActiveCellIfNeeded({ scope: e, context: t, event: n }) {
				n.focus && q(() => {
					rf(e, t.get("view"))?.focus({ preventScroll: !0 });
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
					af(e)?.focus({ preventScroll: !0 });
				});
			},
			focusFirstInputElement({ scope: e, event: t }) {
				t.focus !== !1 && q(() => {
					let [t] = sf(e);
					(t ?? af(e))?.focus({ preventScroll: !0 });
				});
			},
			focusInputElement({ scope: e }) {
				q(() => {
					let t = sf(e);
					if (t.length === 0) {
						af(e)?.focus({ preventScroll: !0 });
						return;
					}
					let n = t.findLastIndex((e) => e.value !== ""), r = t[Math.max(n, 0)];
					r?.focus({ preventScroll: !0 }), r?.setSelectionRange(r.value.length, r.value.length);
				});
			},
			syncMonthSelectElement({ scope: e, context: t }) {
				dn(lf(e), t.get("startValue").month.toString());
			},
			syncYearSelectElement({ scope: e, context: t }) {
				dn(cf(e), t.get("startValue").year.toString());
			},
			setInputValue({ context: e, event: t }) {
				e.get("activeIndex") === t.index && e.set("inputValue", t.value);
			},
			syncInputValue({ scope: e, context: t, event: n }) {
				queueMicrotask(() => {
					dn(sf(e)[n.index ?? t.get("activeIndex")], t.get("inputValue"));
				});
			},
			focusParsedDate(e) {
				let { event: t, prop: n } = e;
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				r && yf(r) && Q(e, r);
			},
			selectParsedDate({ context: e, event: t, prop: n }) {
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				if ((!r || !yf(r)) && t.value && (r = e.get("focusedValue").copy()), !r) return;
				r = gu(r, n("min"), n("max"));
				let i = Array.from(e.get("value"));
				i[t.index] = Vf(i[t.index], r);
				let a = pf(i);
				e.set("value", a);
				let o = Rf(a, n);
				e.set("inputValue", o[t.index]);
			},
			resetView({ context: e }) {
				e.set("view", e.initial("view"));
			},
			setStartValue({ context: e, computed: t, prop: n }) {
				let r = e.get("focusedValue");
				if (!bu(r, e.get("startValue"), t("endValue"))) return;
				let i = _u(r, "start", { months: n("numOfMonths") }, n("locale"));
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
}), Bf = (e, t) => {
	let { context: n, prop: r } = e, i = n.get("view"), a = typeof t == "number" ? n.get("focusedValue").set({ [i]: t }) : t;
	return kf((e) => {
		Tf(e, r("minView")) && (a = a.set({ [e]: +(e === "day") }));
	}), a;
}, Vf = (e, t) => {
	if (!e || !("hour" in e)) return t;
	let n = "timeZone" in e, r = t;
	return "hour" in t || (r = n ? _s(hs(t), e.timeZone) : hs(t)), r.set({
		hour: e.hour,
		minute: e.minute,
		second: e.second,
		millisecond: e.millisecond
	});
};
function Q(e, t) {
	let { context: n, prop: r, computed: i } = e;
	if (!t) return;
	let a = Bf(e, t);
	if (vu(n.get("focusedValue"), a)) return;
	let o = qu(i("visibleDuration"), r("locale"), r("min"), r("max"))({
		focusedDate: a,
		startDate: n.get("startValue")
	});
	n.set("startValue", o.startDate), n.set("focusedValue", o.focusedDate);
}
function Hf(e, t) {
	let { context: n } = e;
	n.set("startValue", t.startDate), !vu(n.get("focusedValue"), t.focusedDate) && n.set("focusedValue", t.focusedDate);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.parse.mjs
function Uf(e) {
	return Array.isArray(e) ? e.map((e) => Uf(e)) : e instanceof Date ? new Qs(e.getFullYear(), e.getMonth() + 1, e.getDate()) : Ws(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-context.js
var [Wf, Gf] = br({
	name: "DatePickerContext",
	hookName: "useDatePickerContext",
	providerName: "<DatePickerProvider />"
}), Kf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qf(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Kf), i = Gf(), a = R(() => J(i().getClearTriggerProps(), r));
	return Y(e, z({ as: "button" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(qf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-content.svelte
var Jf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Yf(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Jf), a = Gf(), o = no(), s = R(() => J(a().getContentProps(), o().getPresenceProps(), r));
	function c(e) {
		o().setNode(e);
	}
	var l = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, u = g(), d = T(u), f = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			[h()]: c,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, p = R(() => !o().unmounted);
	return i(d, (e) => {
		x(p) && e(f);
	}), m(e, u), B(l);
}
H(Yf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-context.svelte
function Xf(e, t) {
	U(t, !0);
	let n = F(t, "render", 7), r = Gf();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), W();
		}
	}, a = g(), o = T(a);
	return I(o, n, () => r), m(e, a), B(i);
}
H(Xf, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-control.svelte
var Zf = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Qf(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Zf), i = Gf(), a = R(() => J(i().getControlProps(), r));
	return Y(e, z({ as: "div" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Qf, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-view-props-context.js
var [$f, ep] = br({
	name: "DatePickerViewPropsContext",
	hookName: "useDatePickerViewPropsContext",
	providerName: "<DatePickerViewPropsProvider />"
}), tp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function np(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, tp), i = Gf(), a = ep(), o = R(() => J(i().getNextTriggerProps(a()), r));
	return Y(e, z({ as: "button" }, () => x(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(np, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-positioner.svelte
var rp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ip(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, rp), a = Gf(), o = no(), s = R(() => J(a().getPositionerProps(), r));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, l = g(), u = T(l), d = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = R(() => !o().unmounted);
	return i(u, (e) => {
		x(f) && e(d);
	}), m(e, l), B(c);
}
H(ip, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-prev-trigger.svelte
var ap = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function op(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, ap), i = Gf(), a = ep(), o = R(() => J(i().getPrevTriggerProps(a()), r));
	return Y(e, z({ as: "button" }, () => x(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(op, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-range-text.svelte
var sp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function cp(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, sp), i = Gf(), a = R(() => J(i().getRangeTextProps(), r)), o = R(() => {
		let { start: e, end: t } = i().visibleRangeText;
		return Wr([e, t]).filter(Boolean).join(" - ");
	});
	return Y(e, z({ as: "div" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, t) => {
			L();
			var n = v();
			s(() => p(n, x(o))), m(e, n);
		},
		$$slots: { default: !0 }
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(cp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-visible@1.43.3/node_modules/@zag-js/focus-visible/dist/index.mjs
function lp(e) {
	return !(e.metaKey || !Bt() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
var up = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]), dp = [
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
function fp(e, t, n) {
	let r = n ? Gt(n) : null, i = at(r), a = st(r), o = ct(i);
	return e = e || o instanceof a.HTMLInputElement && !up.has(o?.type) || o instanceof a.HTMLTextAreaElement || o instanceof a.HTMLElement && o.isContentEditable, !(e && t === "keyboard" && n instanceof a.KeyboardEvent && !Reflect.has(bp, n.key));
}
var pp = null, mp = /* @__PURE__ */ new Set(), hp = /* @__PURE__ */ new Map(), gp = !1, _p = null, vp = !1, yp = null, bp = {
	Tab: !0,
	Escape: !0
};
function xp(e, t) {
	for (let n of mp) n(e, t);
}
function Sp(e) {
	_p = null, gp = !0, lp(e) && (pp = "keyboard", xp("keyboard", e));
}
function Cp(e) {
	(e.type !== "pointermove" && e.type !== "mousemove" || yp?.x !== e.clientX || yp?.y !== e.clientY) && (yp = {
		x: e.clientX,
		y: e.clientY
	}, pp = "pointer", (e.type === "mousedown" || e.type === "pointerdown") && (_p = null, gp = !0, xp("pointer", e)));
}
function wp(e) {
	if (Zt(e)) {
		_p = null, gp = !0, pp = "virtual";
		return;
	}
	_p = null;
	let t = Gt(e), n = t?.closest("label"), r = n?.control;
	if (!n || !r || r.matches(":disabled")) return;
	let i = t?.closest(dp);
	i && n.contains(i) && i !== r || r !== ct(n.ownerDocument) && (_p = r);
}
function Tp(e) {
	let t = Gt(e), n = t === _p;
	t !== st(t) && t !== at(t) && e.isTrusted && (!gp && !n && !vp && (pp = "virtual", xp("virtual", e)), gp = !1, _p = null, vp = !1);
}
function Ep() {
	gp = !1, _p = null, vp = !0;
}
function Dp(e) {
	if (typeof window > "u" || hp.get(st(e))) return;
	let t = st(e), n = at(e), r = t.HTMLElement.prototype.focus;
	function i() {
		gp = !0, r.apply(this, arguments);
	}
	try {
		Object.defineProperty(t.HTMLElement.prototype, "focus", {
			configurable: !0,
			value: i
		});
	} catch {}
	n.addEventListener("keydown", Sp, !0), n.addEventListener("keyup", Sp, !0), n.addEventListener("click", wp, !0), t.addEventListener("focus", Tp, !0), t.addEventListener("blur", Ep, !1), t.PointerEvent === void 0 ? (n.addEventListener("mousedown", Cp, !0), n.addEventListener("mousemove", Cp, !0), n.addEventListener("mouseup", Cp, !0)) : (n.addEventListener("pointerdown", Cp, !0), n.addEventListener("pointermove", Cp, !0), n.addEventListener("pointerup", Cp, !0)), t.addEventListener("beforeunload", () => {
		Op(e);
	}, { once: !0 }), hp.set(t, { focus: r });
}
var Op = (e, t) => {
	let n = st(e), r = at(e);
	t && r.removeEventListener("DOMContentLoaded", t);
	let i = hp.get(n);
	if (i) {
		try {
			Object.defineProperty(n.HTMLElement.prototype, "focus", {
				configurable: !0,
				value: i.focus
			});
		} catch {}
		r.removeEventListener("keydown", Sp, !0), r.removeEventListener("keyup", Sp, !0), r.removeEventListener("click", wp, !0), n.removeEventListener("focus", Tp, !0), n.removeEventListener("blur", Ep, !1), n.PointerEvent === void 0 ? (r.removeEventListener("mousedown", Cp, !0), r.removeEventListener("mousemove", Cp, !0), r.removeEventListener("mouseup", Cp, !0)) : (r.removeEventListener("pointerdown", Cp, !0), r.removeEventListener("pointermove", Cp, !0), r.removeEventListener("pointerup", Cp, !0)), hp.delete(n);
	}
};
function kp() {
	return pp;
}
function Ap(e) {
	pp = e, xp(e, null);
}
function jp() {
	return pp === "keyboard" || pp === "virtual";
}
function Mp(e = {}) {
	let { isTextInput: t, autoFocus: n, onChange: r, root: i } = e;
	Dp(i), r?.({
		isFocusVisible: n || jp(),
		modality: pp
	});
	let a = (e, n) => {
		fp(!!t, e, n) && r?.({
			isFocusVisible: jp(),
			modality: e
		});
	};
	return mp.add(a), () => {
		mp.delete(a);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker.svelte.js
var Np = (e) => {
	let t = Sr(), n = po(), r = R(() => {
		let r = hi(e);
		return {
			dir: n().dir,
			locale: n().locale,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = za(zf, () => x(r)), a = R(() => jf(i, ja));
	return () => x(a);
}, Pp = /* @__PURE__ */ new Set([
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
function Fp(e, t) {
	let n = f();
	U(t, !0);
	let r = F(t, "ref", 15, null), i = F(t, "value", 15), a = F(t, "focusedValue", 15), o = F(t, "open", 15), s = F(t, "view", 15), c = O(t, Pp), l = R(() => eo(c)), u = R(() => V(x(l), 2)), d = R(() => x(u)[0]), p = R(() => x(u)[1]), m = R(() => Er()(x(p), /* @__PURE__ */ "closeOnSelect.createCalendar.defaultFocusedValue.defaultOpen.defaultValue.defaultView.disabled.fixedWeeks.focusedValue.format.id.ids.inline.invalid.isDateUnavailable.locale.max.maxSelectedDates.maxView.min.minView.name.numOfMonths.onFocusChange.onOpenChange.onValueChange.onViewChange.onVisibleRangeChange.open.openOnClick.outsideDaySelectable.parse.placeholder.positioning.readOnly.required.selectionMode.showWeekNumbers.startOfWeek.timeZone.translations.value.view".split("."))), h = R(() => V(x(m), 2)), g = R(() => x(h)[0]), _ = R(() => x(h)[1]), v = R(() => ({
		...x(g),
		id: x(g).id ?? n,
		value: i(),
		onValueChange(e) {
			x(g).onValueChange?.(e), i() !== void 0 && i(e.value);
		},
		focusedValue: a(),
		onFocusChange(e) {
			x(g).onFocusChange?.(e), a() !== void 0 && a(e.focusedValue);
		},
		open: o(),
		onOpenChange(e) {
			x(g).onOpenChange?.(e), o() !== void 0 && o(e.open);
		},
		view: s(),
		onViewChange(e) {
			x(g).onViewChange?.(e), s() !== void 0 && s(e.view);
		}
	})), y = Np(() => x(v)), b = $a(() => ({
		present: y().open,
		...x(d)
	})), S = R(() => J(y().getRootProps(), x(_)));
	return Wf(y), to(b), Y(e, z({ as: "div" }, () => x(S), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), B({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), W();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), W();
		},
		get focusedValue() {
			return a();
		},
		set focusedValue(e) {
			a(e), W();
		},
		get open() {
			return o();
		},
		set open(e) {
			o(e), W();
		},
		get view() {
			return s();
		},
		set view(e) {
			s(e), W();
		}
	});
}
H(Fp, {
	ref: {},
	value: {},
	focusedValue: {},
	open: {},
	view: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-props-context.js
var [Ip, Lp] = br({
	name: "DatePickerTablePropsContext",
	hookName: "useDatePickerTablePropsContext",
	providerName: "<DatePickerTablePropsProvider />"
}), Rp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"columns"
]);
function zp(e, t) {
	let n = f();
	U(t, !0);
	let r = F(t, "columns", 7), i = O(t, Rp), a = Gf(), o = ep(), s = R(() => ({
		id: n,
		columns: r(),
		...o()
	})), c = R(() => J(a().getTableProps(x(s)), i));
	return Ip(() => x(s)), Y(e, z({ as: "table" }, () => x(c))), B({
		get columns() {
			return r();
		},
		set columns(e) {
			r(e), W();
		}
	});
}
H(zp, { columns: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-body.svelte
var Bp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vp(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Bp), i = Gf(), a = R(() => J(i().getTableBodyProps(), r));
	return Y(e, z({ as: "tbody" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Vp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-head.svelte
var Hp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Up(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Hp), i = Gf(), a = Lp(), o = R(() => J(i().getTableHeadProps(a()), r));
	return Y(e, z({ as: "thead" }, () => x(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Up, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-row.svelte
var Wp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Gp(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Wp), i = Gf(), a = Lp(), o = R(() => J(i().getTableRowProps(a()), r));
	return Y(e, z({ as: "tr" }, () => x(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Gp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-trigger.svelte
var Kp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qp(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Kp), i = Gf(), a = R(() => J(i().getTriggerProps(), r));
	return Y(e, z({ as: "button" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(qp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-cell-props-context.js
var [Jp, Yp] = br({
	name: "DatePickerTableCellPropsContext",
	hookName: "useDatePickerTableCellPropsContext",
	providerName: "<DatePickerTableCellPropsProvider />"
}), Xp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Zp(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Xp), i = R(() => Er()(r, [
		"disabled",
		"value",
		"visibleRange",
		"columns"
	])), a = R(() => V(x(i), 2)), o = R(() => x(a)[0]), s = R(() => x(a)[1]), c = Gf(), l = ep(), u = R(() => () => ({
		day: c().getDayTableCellProps,
		month: c().getMonthTableCellProps,
		year: c().getYearTableCellProps
	})[l().view](x(o))), d = R(() => J(x(u), x(s)));
	return Jp(() => x(o)), Y(e, z({ as: "td" }, () => x(d), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Zp, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-cell-trigger.svelte
var Qp = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function $p(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Qp), i = Gf(), a = Yp(), o = ep(), s = R(() => {
		let e = {
			day: i().getDayTableCellTriggerProps,
			month: i().getMonthTableCellTriggerProps,
			year: i().getYearTableCellTriggerProps
		}[o().view];
		return e(a());
	}), c = R(() => J(x(s), r));
	return Y(e, z({ as: "button" }, () => x(c), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H($p, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-header.svelte
var em = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function tm(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, em), i = Gf(), a = Lp(), o = R(() => J(i().getTableHeaderProps(a()), r));
	return Y(e, z({ as: "th" }, () => x(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(tm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view.svelte
var nm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function rm(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, nm), i = R(() => Er()(r, ["view"])), a = R(() => V(x(i), 2)), o = R(() => x(a)[0]), s = R(() => x(a)[1]), c = Gf(), l = R(() => J(c().getViewProps(x(o)), x(s)));
	return $f(() => x(o)), Y(e, z({ as: "div" }, () => x(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(rm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-control.svelte
var im = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function am(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, im), i = Gf(), a = ep(), o = R(() => J(i().getViewControlProps(a()), r));
	return Y(e, z({ as: "div" }, () => x(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(am, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-trigger.svelte
var om = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function sm(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, om), i = Gf(), a = ep(), o = R(() => J(i().getViewTriggerProps(a()), r));
	return Y(e, z({ as: "button" }, () => x(o), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(sm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/DateField.svelte
var cm = /^(\d{4})-(\d{2})-(\d{2})$/, lm = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, um = (e) => String(e).padStart(2, "0");
function dm(e, t, n) {
	let r = new Date(Date.UTC(2e3, t - 1, n));
	return r.setUTCFullYear(e), r.getUTCFullYear() !== e || r.getUTCMonth() !== t - 1 || r.getUTCDate() !== n ? null : `${String(e).padStart(4, "0")}-${um(t)}-${um(n)}`;
}
function fm(e) {
	let t = cm.exec(e ?? "");
	return t ? dm(Number(t[1]), Number(t[2]), Number(t[3])) : null;
}
function pm(e) {
	let t = e.trim(), n = lm.exec(t);
	return n ? dm(Number(n[3]), Number(n[2]), Number(n[1])) : fm(t);
}
var mm = (e) => /^vi(-|$)/i.test(e ?? "");
function hm(e, t) {
	let n = mm(t), r = n ? {
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
function gm() {
	let e = /* @__PURE__ */ new Date();
	return `${String(e.getFullYear()).padStart(4, "0")}-${um(e.getMonth() + 1)}-${um(e.getDate())}`;
}
var _m = (e, t) => e.replace(/\{(\w+)\}/g, (e, n) => t[n] ?? e), vm = l("<svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" aria-hidden=\"true\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"11\" rx=\"2\"></rect><path d=\"M2 6.5h12M5.5 1.5v3M10.5 1.5v3\"></path></svg>"), ym = o("<input part=\"input\" data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/> <!>", 1), bm = o("<!> <!> <!>", 1), xm = o("<!> <!>", 1), Sm = o("<!> <!> <!> <footer class=\"svelte-1voin8a\"><button type=\"button\" part=\"today\" class=\"af-button ghost\"> </button> <!></footer>", 1), Cm = o("<div class=\"af-kit\"><!></div>"), wm = {
	hash: "svelte-1voin8a",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}input.svelte-1voin8a {flex:1;min-width:0;width:8.5em;border:0;outline:none;background:transparent;color:inherit;font:inherit;}input.svelte-1voin8a::placeholder {color:var(--k-muted);}footer.svelte-1voin8a {display:flex;justify-content:space-between;gap:8px;margin-top:4px;}[data-scope='date-picker'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='date-picker'][hidden] {display:none !important;}[data-scope='date-picker'][data-part='control'] {display:flex;align-items:center;gap:2px;box-sizing:border-box;width:100%;min-height:32px;padding:0 2px 0 10px;border:1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%);border-radius:max(0px, calc(var(--k-radius) - 2px));background:var(--k-surface);}[data-scope='date-picker'][data-part='control']:focus-within {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='date-picker'][data-part='content'] {padding:8px;}[data-scope='date-picker'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='date-picker'][data-part='view-control'] {display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:4px;}[data-scope='date-picker'][data-part='range-text'] {font-weight:600;}[data-scope='date-picker'][data-part='table'] {border-collapse:collapse;}[data-scope='date-picker'][data-part='table-header'] {padding:4px 0;color:var(--k-muted);font-size:12px;font-weight:500;}[data-scope='date-picker'][data-part='table-cell'] {padding:1px;text-align:center;}[data-scope='date-picker'][data-part='table-cell-trigger'] {display:inline-grid;place-items:center;min-width:32px;min-height:32px;padding:0 4px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month'], [data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year'] {min-width:56px;}[data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled]) {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}[data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today] {box-shadow:inset 0 0 0 1px var(--k-primary);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {background:var(--k-primary);color:var(--k-primary-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range] {color:var(--k-muted);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled] {opacity:0.4;cursor:not-allowed;}"
};
function Tm(t, r) {
	U(r, !0), ee(t, wm);
	let o = F(r, "value", 7, null), c = F(r, "locale", 7, null), l = F(r, "min", 7, null), f = F(r, "max", 7, null), h = F(r, "clearable", 7, !1), _ = F(r, "placeholder", 7, null), C = F(r, "label", 7, null), D = F(r, "disabled", 7, !1), O = F(r, "strings", 7, null), k = r.$$host, A = R(() => ru(c(), O() ?? void 0)), j = R(() => mm(c()) ? "vi-VN" : "en-GB"), ne = R(() => fm(o())), I = R(() => fm(l())), re = R(() => fm(f())), ie = R(() => x(ne) ? hm(x(ne), c()) : ""), oe = R(() => x(ne) !== null && (x(I) !== null && x(ne) < x(I) || x(re) !== null && x(ne) > x(re))), se = R(() => x(ne) && !x(oe) ? [Uf(x(ne))] : []), V = (e) => e === "month" ? x(A).viewMonth : e === "year" ? x(A).viewYear : x(A).viewDay, ce = M(!1), H = M(null), le = M(null), de = !1;
	d(() => Xl(x(H), x(ce), k));
	let fe = (e) => x(I) !== null && e < x(I) || x(re) !== null && e > x(re);
	function pe(e) {
		return e !== null && fe(e) ? !1 : (e !== x(ne) && Yl(k, "change", { value: e }), !0);
	}
	function me() {
		if (!x(le) || !de) return;
		de = !1;
		let e = x(le).value.trim(), t = e === "" ? h() ? null : void 0 : pm(e) ?? void 0;
		t !== void 0 && t !== x(ne) && pe(t), x(le).value = x(ie);
	}
	function he(e) {
		e().setOpen(!1), k.shadowRoot?.querySelector("[part=\"trigger\"]")?.focus();
	}
	var ge = {
		get value() {
			return o();
		},
		set value(e = null) {
			o(e), W();
		},
		get locale() {
			return c();
		},
		set locale(e = null) {
			c(e), W();
		},
		get min() {
			return l();
		},
		set min(e = null) {
			l(e), W();
		},
		get max() {
			return f();
		},
		set max(e = null) {
			f(e), W();
		},
		get clearable() {
			return h();
		},
		set clearable(e = !1) {
			h(e), W();
		},
		get placeholder() {
			return _();
		},
		set placeholder(e = null) {
			_(e), W();
		},
		get label() {
			return C();
		},
		set label(e = null) {
			C(e), W();
		},
		get disabled() {
			return D();
		},
		set disabled(e = !1) {
			D(e), W();
		},
		get strings() {
			return O();
		},
		set strings(e = null) {
			O(e), W();
		}
	}, _e = xm(), ve = T(_e);
	return Jl(ve, {}), Tr(E(ve, 2), {
		value: () => k.shadowRoot,
		children: (t, r) => {
			var o = Cm(), l = u(o), d = () => x(se);
			{
				let t = R(() => x(I) ? Uf(x(I)) : void 0), r = R(() => x(re) ? Uf(x(re)) : void 0), o = R(() => !!D()), f = R(() => ({
					trigger: (e) => e ? x(A).closeCalendar : x(A).openCalendar,
					content: x(A).calendar,
					clearTrigger: x(A).clear,
					dayCell: (e) => _m(e.selected ? x(A).selectedDate : x(A).chooseDate, { date: e.valueText }),
					viewTrigger: (e, t) => _m(t ? x(A).switchView : x(A).currentView, { view: V(t ?? e) }),
					prevTrigger: (e) => e === "day" ? x(A).previousMonth : e === "month" ? x(A).previousYear : x(A).previousDecade,
					nextTrigger: (e) => e === "day" ? x(A).nextMonth : e === "month" ? x(A).nextYear : x(A).nextDecade
				}));
				y(l, () => Fp, (l, O) => {
					O(l, {
						get value() {
							return d();
						},
						set value(e) {},
						get locale() {
							return x(j);
						},
						selectionMode: "single",
						get min() {
							return x(t);
						},
						get max() {
							return x(r);
						},
						get disabled() {
							return x(o);
						},
						fixedWeeks: !0,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						format: (e) => hm(e.toString(), c()),
						get translations() {
							return x(f);
						},
						onValueChange: (e) => pe(e.value[0]?.toString() ?? null),
						onOpenChange: (t) => e(ce, t.open, !0),
						children: (t, r) => {
							var o = xm(), c = T(o);
							y(c, () => Qf, (t, r) => {
								r(t, {
									part: "control",
									children: (t, r) => {
										var i = ym(), a = T(i);
										te(a), ue(a, (t) => e(le, t), () => x(le));
										var o = E(a, 2);
										y(o, () => qp, (e, t) => {
											t(e, {
												part: "trigger",
												class: "af-button ghost",
												children: (e, t) => {
													var n = vm();
													m(e, n);
												},
												$$slots: { default: !0 }
											});
										}), s(() => {
											N(a, "data-part", x(oe) ? void 0 : "input"), ae(a, x(ie)), N(a, "placeholder", _() || "dd/mm/yyyy"), N(a, "aria-label", C() || _() || void 0), a.disabled = !!D();
										}), n("keydown", a, (e) => {
											e.key === "Enter" && !e.isComposing && (e.preventDefault(), me());
										}), n("input", a, () => de = !0), S("blur", a, me), m(t, i);
									},
									$$slots: { default: !0 }
								});
							});
							var l = E(c, 2);
							y(l, () => ip, (t, r) => {
								r(t, {
									popover: "manual",
									get ref() {
										return x(H);
									},
									set ref(t) {
										e(H, t, !0);
									},
									children: (e, t) => {
										var r = g(), o = T(r);
										y(o, () => Yf, (e, t) => {
											t(e, {
												class: "af-overlay date",
												part: "content",
												children: (e, t) => {
													var r = g(), o = T(r);
													{
														let e = (e, t = P) => {
															var r = Sm(), o = T(r);
															y(o, () => rm, (e, n) => {
																n(e, {
																	view: "day",
																	children: (e, n) => {
																		var r = xm(), i = T(r);
																		y(i, () => am, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = bm(), r = T(n);
																					y(r, () => op, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								L();
																								var n = v("‹");
																								m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var i = E(r, 2);
																					y(i, () => sm, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = g(), r = T(n);
																								y(r, () => cp, (e, t) => {
																									t(e, {});
																								}), m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = E(i, 2);
																					y(a, () => np, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								L();
																								var n = v("›");
																								m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					}), m(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		});
																		var o = E(i, 2);
																		y(o, () => zp, (e, n) => {
																			n(e, {
																				children: (e, n) => {
																					var r = xm(), i = T(r);
																					y(i, () => Up, (e, n) => {
																						n(e, {
																							children: (e, n) => {
																								var r = g(), i = T(r);
																								y(i, () => Gp, (e, n) => {
																									n(e, {
																										children: (e, n) => {
																											var r = g(), i = T(r);
																											b(i, 17, () => t()().weekDays, a, (e, t) => {
																												var n = g(), r = T(n);
																												y(r, () => tm, (e, n) => {
																													n(e, {
																														children: (e, n) => {
																															L();
																															var r = v();
																															s(() => p(r, x(t).narrow)), m(e, r);
																														},
																														$$slots: { default: !0 }
																													});
																												}), m(e, n);
																											}), m(e, r);
																										},
																										$$slots: { default: !0 }
																									});
																								}), m(e, r);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var o = E(i, 2);
																					y(o, () => Vp, (e, n) => {
																						n(e, {
																							children: (e, n) => {
																								var r = g(), i = T(r);
																								b(i, 17, () => t()().weeks, a, (e, n, r) => {
																									var i = g(), a = T(i);
																									y(a, () => Gp, (e, n) => {
																										n(e, {
																											children: (e, n) => {
																												var i = g(), a = T(i);
																												b(a, 17, () => t()().getDaysInWeek(r), (e) => e.toString(), (e, t) => {
																													var n = g(), r = T(n);
																													y(r, () => Zp, (e, n) => {
																														n(e, {
																															get value() {
																																return x(t);
																															},
																															children: (e, n) => {
																																var r = g(), i = T(r);
																																y(i, () => $p, (e, n) => {
																																	n(e, {
																																		children: (e, n) => {
																																			L();
																																			var r = v();
																																			s(() => p(r, x(t).day)), m(e, r);
																																		},
																																		$$slots: { default: !0 }
																																	});
																																}), m(e, r);
																															},
																															$$slots: { default: !0 }
																														});
																													}), m(e, n);
																												}), m(e, i);
																											},
																											$$slots: { default: !0 }
																										});
																									}), m(e, i);
																								}), m(e, r);
																							},
																							$$slots: { default: !0 }
																						});
																					}), m(e, r);
																				},
																				$$slots: { default: !0 }
																			});
																		}), m(e, r);
																	},
																	$$slots: { default: !0 }
																});
															});
															var c = E(o, 2);
															y(c, () => rm, (e, n) => {
																n(e, {
																	view: "month",
																	children: (e, n) => {
																		var r = xm(), i = T(r);
																		y(i, () => am, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = bm(), r = T(n);
																					y(r, () => op, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								L();
																								var n = v("‹");
																								m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var i = E(r, 2);
																					y(i, () => sm, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = g(), r = T(n);
																								y(r, () => cp, (e, t) => {
																									t(e, {});
																								}), m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = E(i, 2);
																					y(a, () => np, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								L();
																								var n = v("›");
																								m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					}), m(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		});
																		var o = E(i, 2);
																		y(o, () => zp, (e, n) => {
																			n(e, {
																				children: (e, n) => {
																					var r = g(), i = T(r);
																					y(i, () => Vp, (e, n) => {
																						n(e, {
																							children: (e, n) => {
																								var r = g(), i = T(r);
																								b(i, 17, () => t()().getMonthsGrid({
																									columns: 4,
																									format: "short"
																								}), a, (e, t) => {
																									var n = g(), r = T(n);
																									y(r, () => Gp, (e, n) => {
																										n(e, {
																											children: (e, n) => {
																												var r = g(), i = T(r);
																												b(i, 17, () => x(t), (e) => e.value, (e, t) => {
																													var n = g(), r = T(n);
																													y(r, () => Zp, (e, n) => {
																														n(e, {
																															get value() {
																																return x(t).value;
																															},
																															children: (e, n) => {
																																var r = g(), i = T(r);
																																y(i, () => $p, (e, n) => {
																																	n(e, {
																																		children: (e, n) => {
																																			L();
																																			var r = v();
																																			s(() => p(r, x(t).label)), m(e, r);
																																		},
																																		$$slots: { default: !0 }
																																	});
																																}), m(e, r);
																															},
																															$$slots: { default: !0 }
																														});
																													}), m(e, n);
																												}), m(e, r);
																											},
																											$$slots: { default: !0 }
																										});
																									}), m(e, n);
																								}), m(e, r);
																							},
																							$$slots: { default: !0 }
																						});
																					}), m(e, r);
																				},
																				$$slots: { default: !0 }
																			});
																		}), m(e, r);
																	},
																	$$slots: { default: !0 }
																});
															});
															var l = E(c, 2);
															y(l, () => rm, (e, n) => {
																n(e, {
																	view: "year",
																	children: (e, n) => {
																		var r = xm(), i = T(r);
																		y(i, () => am, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = bm(), r = T(n);
																					y(r, () => op, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								L();
																								var n = v("‹");
																								m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var i = E(r, 2);
																					y(i, () => sm, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = g(), r = T(n);
																								y(r, () => cp, (e, t) => {
																									t(e, {});
																								}), m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = E(i, 2);
																					y(a, () => np, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								L();
																								var n = v("›");
																								m(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					}), m(e, n);
																				},
																				$$slots: { default: !0 }
																			});
																		});
																		var o = E(i, 2);
																		y(o, () => zp, (e, n) => {
																			n(e, {
																				children: (e, n) => {
																					var r = g(), i = T(r);
																					y(i, () => Vp, (e, n) => {
																						n(e, {
																							children: (e, n) => {
																								var r = g(), i = T(r);
																								b(i, 17, () => t()().getYearsGrid({ columns: 4 }), a, (e, t) => {
																									var n = g(), r = T(n);
																									y(r, () => Gp, (e, n) => {
																										n(e, {
																											children: (e, n) => {
																												var r = g(), i = T(r);
																												b(i, 17, () => x(t), (e) => e.value, (e, t) => {
																													var n = g(), r = T(n);
																													y(r, () => Zp, (e, n) => {
																														n(e, {
																															get value() {
																																return x(t).value;
																															},
																															children: (e, n) => {
																																var r = g(), i = T(r);
																																y(i, () => $p, (e, n) => {
																																	n(e, {
																																		children: (e, n) => {
																																			L();
																																			var r = v();
																																			s(() => p(r, x(t).label)), m(e, r);
																																		},
																																		$$slots: { default: !0 }
																																	});
																																}), m(e, r);
																															},
																															$$slots: { default: !0 }
																														});
																													}), m(e, n);
																												}), m(e, r);
																											},
																											$$slots: { default: !0 }
																										});
																									}), m(e, n);
																								}), m(e, r);
																							},
																							$$slots: { default: !0 }
																						});
																					}), m(e, r);
																				},
																				$$slots: { default: !0 }
																			});
																		}), m(e, r);
																	},
																	$$slots: { default: !0 }
																});
															});
															var d = E(l, 2), f = u(d), _ = w(f, !0), S = E(f, 2), C = (e) => {
																var n = g(), r = T(n);
																y(r, () => qf, (e, n) => {
																	n(e, z({
																		part: "clear",
																		class: "af-button ghost"
																	}, () => x(oe) ? { hidden: !1 } : {}, {
																		onclick: () => {
																			x(oe) && pe(null), he(t());
																		},
																		children: (e, t) => {
																			L();
																			var n = v();
																			s(() => p(n, x(A).clear)), m(e, n);
																		},
																		$$slots: { default: !0 }
																	}));
																}), m(e, n);
															};
															i(S, (e) => {
																h() && e(C);
															}), G(d), s((e) => {
																f.disabled = e, p(_, x(A).today);
															}, [() => fe(gm())]), n("click", f, () => {
																pe(gm()) && he(t());
															}), m(e, r);
														};
														y(o, () => Xf, (t, n) => {
															n(t, {
																render: e,
																$$slots: { render: !0 }
															});
														});
													}
													m(e, r);
												},
												$$slots: { default: !0 }
											});
										}), m(e, r);
									},
									$$slots: { default: !0 }
								});
							}), m(t, o);
						},
						$$slots: { default: !0 }
					});
				});
			}
			G(o), m(t, o);
		},
		$$slots: { default: !0 }
	}), m(t, _e), B(ge);
}
_e([
	"keydown",
	"input",
	"click"
]), H(Tm, {
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
var Em = o("<header class=\"svelte-gp7kvq\"><!> <button type=\"button\" part=\"close\" class=\"af-button ghost icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></header> <div part=\"body\" class=\"svelte-gp7kvq\"><!></div> <footer part=\"actions\" class=\"svelte-gp7kvq\"><!></footer>", 1), Dm = o("<dialog><!></dialog>"), Om = o("<!> <!>", 1), km = {
	hash: "svelte-gp7kvq",
	code: "dialog.svelte-gp7kvq {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-gp7kvq::backdrop {background:rgb(0 0 0 / 0.4);}\n  /* On a short window the body scrolls between a heading and a footer that stay in view. */header.svelte-gp7kvq {display:flex;flex:none;align-items:center;justify-content:space-between;gap:12px;margin-right:-8px;}[part='body'].svelte-gp7kvq {flex:1 1 auto;min-height:0;margin:-4px -16px;padding:4px 16px;overflow:auto;overscroll-behavior:contain;}footer.svelte-gp7kvq {display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:8px;}footer[hidden].svelte-gp7kvq {display:none;}[data-scope='dialog'][data-part='content'] {display:flex;flex-direction:column;gap:12px;width:min(480px, calc(100vw - 32px));max-height:calc(100dvh - 64px);padding:16px;border-radius:calc(var(--k-radius) + 4px);box-sizing:border-box;}[data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='dialog'][data-part='title'] {margin:0;font-size:16px;font-weight:600;line-height:24px;}"
};
function Am(t, i) {
	U(i, !0), ee(t, km);
	let a = F(i, "open", 7, !1), o = F(i, "heading", 7, ""), l = F(i, "locale", 7, null), f = F(i, "strings", 7, null), h = i.$$host, _ = R(() => ru(l(), f() ?? void 0)), b = M(null), S = "escape", C = M(null), w = M(!1), D = tu(h);
	d(() => D(x(b), !!a()));
	let O = null, k = null, A = (e) => !(e instanceof Node && Ql(h, e)) && eu(h);
	d(() => {
		if (a() && x(b)) return c(h.ownerDocument, "pointerdown", (e) => {
			e !== k && e.button === 0 && e.pointerType !== "touch" && A(e.composedPath()[0] ?? null) && (O = e, Yl(h, "close", { reason: "outside" }));
		}, { capture: !0 });
	}), d(() => {
		let t = x(C)?.querySelector("slot");
		if (!t) return;
		let n = () => e(w, t.assignedNodes().length > 0);
		return n(), c(t, "slotchange", n);
	});
	var te = {
		get open() {
			return a();
		},
		set open(e = !1) {
			a(e), W();
		},
		get heading() {
			return o();
		},
		set heading(e = "") {
			o(e), W();
		},
		get locale() {
			return l();
		},
		set locale(e = null) {
			l(e), W();
		},
		get strings() {
			return f();
		},
		set strings(e = null) {
			f(e), W();
		}
	}, j = Om(), ne = T(j);
	return Jl(ne, {}), Tr(E(ne, 2), {
		value: () => h.shadowRoot,
		children: (t, c) => {
			var l = g(), d = T(l), f = () => !!a();
			y(d, () => Wl, (t, a) => {
				a(t, {
					get open() {
						return f();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !0,
					onEscapeKeyDown: () => S = "escape",
					onInteractOutside: (e) => {
						e.detail.originalEvent === O || !A(e.detail.target) ? e.preventDefault() : (k = e.detail.originalEvent, S = "outside");
					},
					onOpenChange: (e) => {
						e.open || (Yl(h, "close", { reason: S }), S = "escape");
					},
					children: (t, a) => {
						var c = g(), l = T(c);
						{
							let t = (t, a = P) => {
								var c = Dm(), l = (e) => e.preventDefault();
								fe(c, (e) => ({
									...e,
									class: "af-kit",
									oncancel: l
								}), [() => a()()], void 0, void 0, "svelte-gp7kvq");
								var d = u(c);
								y(d, () => oo, (t, a) => {
									a(t, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (t, a) => {
											var c = Em(), l = T(c), d = u(l);
											y(d, () => Kl, (e, t) => {
												t(e, {
													part: "heading",
													children: (e, t) => {
														L();
														var n = v();
														s(() => p(n, o() ?? "")), m(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var f = E(d, 2);
											G(l);
											var g = E(l, 2), b = u(g);
											r(b, i, "default", {}, null), G(g);
											var S = E(g, 2), D = u(S);
											r(D, i, "actions", {}, null), G(S), ue(S, (t) => e(C, t), () => x(C)), s(() => {
												N(f, "aria-label", x(_).close), N(S, "hidden", !x(w));
											}), n("click", f, () => Yl(h, "close", { reason: "close-button" })), m(t, c);
										},
										$$slots: { default: !0 }
									});
								}), G(c), ue(c, (t) => e(b, t), () => x(b)), m(t, c);
							};
							y(l, () => uo, (e, n) => {
								n(e, {
									asChild: t,
									$$slots: { asChild: !0 }
								});
							});
						}
						m(t, c);
					},
					$$slots: { default: !0 }
				});
			}), m(t, l);
		},
		$$slots: { default: !0 }
	}), m(t, j), B(te);
}
_e(["click"]), H(Am, {
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
var [jm, Mm] = br({
	name: "MenuContext",
	hookName: "useMenuContext",
	providerName: "<MenuProvider />",
	strict: !1
}), [Nm, Pm] = br({
	name: "MenuItemContext",
	hookName: "useMenuItemContext",
	providerName: "<MenuItemProvider />"
}), [Fm, Im] = br({
	name: "MenuItemPropsContext",
	hookName: "useMenuItemPropsContext",
	providerName: "<MenuItemPropsProvider />"
}), Lm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Rm(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Lm), a = Mm(), o = no(), s = R(() => J(a().getContentProps(), o().getPresenceProps(), r));
	function c(e) {
		o().setNode(e);
	}
	var l = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, u = g(), d = T(u), f = (e) => {
		Y(e, z({
			as: "div",
			[h()]: c
		}, () => x(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, p = R(() => !o().unmounted);
	return i(d, (e) => {
		x(p) && e(f);
	}), m(e, u), B(l);
}
H(Rm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-context.svelte
function zm(e, t) {
	U(t, !0);
	let n = F(t, "render", 7), r = Mm();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), W();
		}
	}, a = g(), o = T(a);
	return I(o, n, () => r), m(e, a), B(i);
}
H(zm, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item.svelte
var Bm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vm(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Bm), i = R(() => Er()(r, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText",
		"onSelect"
	])), a = R(() => V(x(i), 2)), o = R(() => x(a)[0]), s = R(() => x(a)[1]), c = Mm(), l = R(() => J(c().getItemProps(x(o)), x(s))), u = R(() => c().getItemState(x(o)));
	return d(() => c().addItemListener({
		id: x(u).id,
		onSelect: x(o).onSelect
	})), Fm(() => x(o)), Nm(() => x(u)), Y(e, z({ as: "div" }, () => x(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Vm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-positioner.svelte
var Hm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Um(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Hm), a = Mm(), o = no(), s = R(() => J(a().getPositionerProps(), r));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, l = g(), u = T(l), d = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = R(() => !o().unmounted);
	return i(u, (e) => {
		x(f) && e(d);
	}), m(e, l), B(c);
}
H(Um, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-machine-context.js
var [Wm, Gm] = br({
	name: "MenuMachineContext",
	hookName: "useMenuMachineContext",
	providerName: "<MenuMachineProvider />",
	strict: !1
}), [Km, qm] = br({
	name: "MenuTriggerItemContext",
	hookName: "useMenuTriggerItemContext",
	providerName: "<MenuTriggerItemProvider />",
	strict: !1
}), Jm = uc("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem").build(), Ym = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `menu:${e.id}:trigger:${t}` : `menu:${e.id}:trigger` : ai(n) ? n(t) : n;
}, Xm = (e, t) => {
	let n = e.ids?.contextTrigger;
	return n == null ? t ? `menu:${e.id}:ctx-trigger:${t}` : `menu:${e.id}:ctx-trigger` : ai(n) ? n(t) : n;
}, Zm = (e) => e.ids?.content ?? `menu:${e.id}:content`, Qm = (e) => e.ids?.arrow ?? `menu:${e.id}:arrow`, $m = (e) => e.ids?.positioner ?? `menu:${e.id}:popper`, eh = (e, t) => e.ids?.group?.(t) ?? `menu:${e.id}:group:${t}`, th = (e, t) => `${e.id}/${t}`, nh = (e) => e?.dataset.value ?? null, rh = (e, t) => e.ids?.groupLabel?.(t) ?? `menu:${e.id}:group-label:${t}`, ih = (e) => e.getById(Zm(e)), ah = (e) => e.getById($m(e)), oh = (e) => e.getById(Ym(e)), sh = (e, t) => t ? e.getById(th(e, t)) : null, ch = (e) => e.getById(Xm(e)), lh = (e) => Zn(e.getRootNode(), `[data-scope="menu"][data-part="trigger"]${Ve(e.id)}`), uh = (e) => Zn(e.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${Ve(e.id)}`), dh = (e, t) => t == null ? oh(e) ?? lh(e)[0] : e.getById(Ym(e, t)), fh = (e) => {
	let t = `[role^="menuitem"]${Ve(Zm(e))}:not([data-disabled])`;
	return Zn(ih(e), t);
}, ph = (e) => zr(fh(e)), mh = (e) => Br(fh(e)), hh = (e, t) => t ? e.id === t || e.dataset.value === t : !1, gh = (e, t) => {
	let n = fh(e);
	return qr(n, n.findIndex((e) => hh(e, t.value)), { loop: t.loop ?? t.loopFocus });
}, _h = (e, t) => {
	let n = fh(e);
	return Yr(n, n.findIndex((e) => hh(e, t.value)), { loop: t.loop ?? t.loopFocus });
}, vh = (e, t) => {
	let n = fh(e), r = n.find((e) => hh(e, t.value));
	return fr(n, {
		state: t.typeaheadState,
		key: t.key,
		activeId: r?.id ?? null
	});
}, yh = (e) => Ge(e) && (e.dataset.disabled === "" || e.hasAttribute("disabled")), bh = (e) => !!e?.getAttribute("role")?.startsWith("menuitem") && !!e?.hasAttribute("data-controls"), xh = "menu:select";
function Sh(e, t) {
	if (!e) return;
	let n = new (st(e)).CustomEvent(xh, { detail: { value: t } });
	e.dispatchEvent(n);
}
function Ch(e) {
	let t = Zm(e);
	return ih(e) ?? e.getDoc().getElementById(t);
}
function wh(e, t) {
	if (!Ge(e)) return !1;
	for (let n in t) {
		let r = t[n], i = Ch(r.scope);
		if (i && it(i, e)) return !0;
		let a = r.refs.get("children");
		if (Object.keys(a).length > 0 && wh(e, a)) return !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/rect.mjs
var Th = (e, t) => ({
	x: e,
	y: t
});
function Eh(e) {
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
		center: Th(a, o)
	};
}
function Dh(e) {
	return {
		top: Th(e.minX, e.minY),
		right: Th(e.maxX, e.minY),
		bottom: Th(e.maxX, e.maxY),
		left: Th(e.minX, e.maxY)
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function Oh(e, t) {
	let { top: n, right: r, left: i, bottom: a } = Dh(Eh(e)), [o] = t.split("-");
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
function kh(e, t) {
	let { x: n, y: r } = t, i = !1;
	for (let t = 0, a = e.length - 1; t < e.length; a = t++) {
		let o = e[t].x, s = e[t].y, c = e[a].x, l = e[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.utils.mjs
function Ah(e) {
	let t = e.parent;
	for (; t && t.context.get("isSubmenu");) t = t.refs.get("parent");
	t?.send({ type: "CLOSE" });
}
function jh(e, t) {
	return e ? kh(e, t) : !1;
}
function Mh(e, t, n) {
	let r = Object.keys(e).length > 0;
	if (!t) return null;
	if (!r) return th(n, t);
	for (let n in e) {
		let r = e[n], i = Ym(r.scope);
		if (i === t) return i;
	}
	return th(n, t);
}
function Nh(e, t) {
	e && (e.refs.set("pointerRoutingLocked", t), e.context.set("pointerRoutingMode", t ? "locked" : "interactive"));
}
function Ph(e) {
	let t = e.context.get("highlightedValue");
	if (!t) return !1;
	let n = e.refs.get("children");
	for (let e in n) {
		let r = n[e];
		if (r.state.hasTag("open") && Ym(r.scope) === t) return !0;
	}
	return !1;
}
function Fh(e, t) {
	e && (e.refs.get("pointerRoutingLocked") || t && Ph(e) || Nh(e, !1));
}
function Ih(e) {
	e && (Ph(e) || Nh(e, !1));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.connect.mjs
function Lh(e, t) {
	let { context: n, send: r, state: i, computed: a, prop: o, scope: s } = e, c = i.hasTag("open"), l = n.get("isSubmenu"), u = a("isTypingAhead"), d = o("composite"), f = n.get("currentPlacement"), p = f ? Sd(f) : void 0, m = n.get("anchorPoint"), h = n.get("highlightedValue"), g = n.get("triggerValue"), _ = Vd({
		...o("positioning"),
		placement: f
	});
	function v(e) {
		return {
			id: th(s, e.value),
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
		let { closeOnSelect: n, valueText: i, value: a } = e, o = v(e), c = th(s, a);
		return t.element({
			...Jm.item.attrs,
			id: c,
			role: "menuitem",
			"aria-disabled": Le(o.disabled),
			"data-disabled": K(o.disabled),
			"data-ownedby": Zm(s),
			"data-highlighted": K(o.highlighted),
			"data-value": a,
			"data-valuetext": i,
			onDragStart(e) {
				e.currentTarget.matches("a[href]") && e.preventDefault();
			},
			onPointerMove(e) {
				if (o.disabled || e.pointerType !== "mouse" || kp() !== "pointer") return;
				let t = e.currentTarget;
				if (o.highlighted) return;
				let i = sn(e);
				r({
					type: "ITEM_POINTERMOVE",
					id: c,
					target: t,
					closeOnSelect: n,
					point: i
				});
			},
			onPointerLeave(e) {
				if (o.disabled || e.pointerType !== "mouse" || kp() !== "pointer") return;
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
				if (qt(e) || Kt(e) || o.disabled) return;
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
			return t.addEventListener(xh, n), () => t.removeEventListener(xh, n);
		},
		getContextTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && g === n, a = Xm(s, n);
			return t.element({
				...Jm.contextTrigger.attrs,
				dir: o("dir"),
				id: a,
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": K(i),
				"data-state": c ? "open" : "closed",
				onPointerDown(e) {
					if (e.pointerType === "mouse") return;
					let t = sn(e);
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
					let t = sn(e);
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
			return Yi(x({ value: t.id }), t);
		},
		getTriggerProps(n = {}) {
			let { value: i } = n, a = i != null && g === i, u = Ym(s, i);
			return t.button({
				...l ? Jm.triggerItem.attrs : Jm.trigger.attrs,
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
				"aria-controls": Zm(s),
				"data-controls": Zm(s),
				"aria-expanded": i == null ? c : c && a,
				"data-state": c ? "open" : "closed",
				onPointerMove(e) {
					if (e.pointerType !== "mouse" || yh(e.currentTarget) || !l) return;
					let t = sn(e);
					r({
						type: "TRIGGER_POINTERMOVE",
						target: e.currentTarget,
						point: t
					});
				},
				onPointerLeave(t) {
					if (yh(t.currentTarget) || t.pointerType !== "mouse" || !l) return;
					Nh(e.refs.get("parent"), !0);
					let n = sn(t);
					r({
						type: "TRIGGER_POINTERLEAVE",
						target: t.currentTarget,
						point: n
					});
				},
				onPointerDown(e) {
					yh(e.currentTarget) || $t(e) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || yh(e.currentTarget) || r({
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
					}[an(e, {
						orientation: "vertical",
						dir: o("dir")
					})];
					t && (e.preventDefault(), t(e));
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...Jm.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...Jm.positioner.attrs,
				dir: o("dir"),
				id: $m(s),
				style: _.floating
			});
		},
		getArrowProps() {
			return t.element({
				id: Qm(s),
				...Jm.arrow.attrs,
				dir: o("dir"),
				style: _.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...Jm.arrowTip.attrs,
				dir: o("dir"),
				style: _.arrowTip
			});
		},
		getContentProps() {
			return t.element({
				...Jm.content.attrs,
				id: Zm(s),
				"aria-label": o("aria-label"),
				hidden: !c,
				"data-state": c ? "open" : "closed",
				role: d ? "menu" : "dialog",
				tabIndex: 0,
				dir: o("dir"),
				"aria-activedescendant": a("highlightedId") || void 0,
				"aria-labelledby": m ? Xm(s, g ?? void 0) : Ym(s, g ?? void 0),
				"data-placement": f,
				"data-side": p,
				onPointerEnter(e) {
					e.pointerType === "mouse" && r({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !it(e.currentTarget, Gt(e))) return;
					let t = Gt(e);
					if (t?.closest("[role=menu]") !== e.currentTarget && t !== e.currentTarget) return;
					if (e.key === "Tab" && !kn(e)) {
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
					}, i = n[an(e, { dir: o("dir") })];
					if (i) {
						i(e), e.stopPropagation(), e.preventDefault();
						return;
					}
					o("typeahead") && Xt(e) && (en(e) || rt(t) || (r({
						type: "TYPEAHEAD",
						key: e.key
					}), e.preventDefault()));
				}
			});
		},
		getSeparatorProps() {
			return t.element({
				...Jm.separator.attrs,
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
					...Jm.item.attrs,
					dir: o("dir"),
					"data-value": s.value,
					role: `menuitem${n}`,
					"aria-checked": !!c.checked,
					"data-state": c.checked ? "checked" : "unchecked",
					onClick(e) {
						if (i || qt(e) || Kt(e)) return;
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
			let n = b(gi(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...Jm.itemIndicator.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": si(e, "checked") ? r : void 0,
				hidden: si(e, "checked") ? !n.checked : void 0
			});
		},
		getItemTextProps(e) {
			let n = b(gi(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...Jm.itemText.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": si(e, "checked") ? r : void 0
			});
		},
		getItemGroupLabelProps(e) {
			return t.element({
				...Jm.itemGroupLabel.attrs,
				id: rh(s, e.htmlFor),
				dir: o("dir")
			});
		},
		getItemGroupProps(e) {
			return t.element({
				id: eh(s, e.id),
				...Jm.itemGroup.attrs,
				dir: o("dir"),
				"aria-labelledby": rh(s, e.id),
				role: "group"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.machine.mjs
var { not: Rh, and: zh, or: Bh } = ya(), Vh = ba({
	props({ props: e }) {
		return {
			closeOnSelect: !0,
			typeahead: !0,
			composite: !0,
			loopFocus: !1,
			navigate(e) {
				Fn(e.node);
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
						triggerElement: dh(n, e)
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
			typeaheadState: { ...fr.defaultOptions },
			positioningOverride: {}
		};
	},
	computed: {
		isRtl: ({ prop: e }) => e("dir") === "rtl",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar !== "",
		highlightedId: ({ context: e, scope: t, refs: n }) => Mh(n.get("children"), e.get("highlightedValue"), t)
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
					guard: Rh("isSubmenu"),
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
						guard: Bh("isOpenAutoFocusEvent", "isArrowDownEvent"),
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
					guard: zh(Rh("isTriggerItem"), "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: Rh("isTriggerItem"),
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
					guard: zh("isSubmenu", "isOpenControlled"),
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
					guard: Rh("isPointerRoutingLocked"),
					actions: [
						"setHighlightedItem",
						"focusMenu",
						"closeSiblingMenus"
					]
				}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
				ITEM_POINTERLEAVE: {
					guard: zh(Rh("isPointerRoutingLocked"), Rh("isTriggerItem")),
					actions: ["clearHighlightedItem"]
				},
				ITEM_CLICK: [
					{
						guard: zh(Rh("isTriggerItemHighlighted"), Rh("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					},
					{
						guard: zh(Rh("isTriggerItemHighlighted"), Rh("isHighlightedItemEditable"), "closeOnSelect"),
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
						guard: zh(Rh("isTriggerItemHighlighted"), Rh("isHighlightedItemEditable")),
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
			isTriggerItem: ({ event: e }) => bh(e.target),
			isTriggerItemHighlighted: ({ event: e, scope: t, computed: n }) => !!(e.target ?? t.getById(n("highlightedId")))?.hasAttribute("data-controls"),
			isSubmenu: ({ context: e }) => e.get("isSubmenu"),
			isPointerRoutingLocked: ({ refs: e }) => e.get("pointerRoutingLocked"),
			isHighlightedItemEditable: ({ scope: e, computed: t }) => rt(e.getById(t("highlightedId"))),
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
				return Mp({ root: e.getRootNode?.() });
			},
			trackPositioning({ context: e, prop: t, scope: n, refs: r }) {
				if (ch(n) || uh(n).length > 0) return;
				let i = {
					...t("positioning"),
					...r.get("positioningOverride")
				};
				return e.set("currentPlacement", i.placement), zd(() => dh(n, e.get("triggerValue")), () => ah(n), {
					...i,
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackInteractOutside({ refs: e, scope: t, prop: n, context: r, send: i }) {
				let a = () => ih(t), o = !0, s = (e) => uh(t).some((t) => it(t, e));
				return vl(a, {
					type: "menu",
					defer: !0,
					exclude: [oh(t), ...lh(t)].filter(Boolean),
					onInteractOutside: n("onInteractOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onFocusOutside(t) {
						n("onFocusOutside")?.(t);
						let r = Gt(t.detail.originalEvent);
						if (s(r)) {
							t.preventDefault();
							return;
						}
						if (wh(r, e.get("children"))) {
							t.preventDefault();
							return;
						}
					},
					onEscapeKeyDown(t) {
						n("onEscapeKeyDown")?.(t), r.get("isSubmenu") && t.preventDefault(), Ah({ parent: e.get("parent") });
					},
					onPointerDownOutside(e) {
						n("onPointerDownOutside")?.(e);
						let t = Gt(e.detail.originalEvent);
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
				return i ? (Nh(i, !0), cn(t.getDoc(), "pointermove", (t) => {
					jh(e.get("intentPolygon"), {
						x: t.clientX,
						y: t.clientY
					}) || (n({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" }), Nh(i, !1));
				})) : void 0;
			},
			scrollToHighlightedItem({ scope: e, computed: t }) {
				let n = () => {
					kp() !== "pointer" && rr(e.getById(t("highlightedId")), {
						rootEl: ih(e),
						block: "nearest"
					});
				};
				return q(() => {
					Ap("virtual"), n();
				}), Pn(() => ih(e), {
					defer: !0,
					attributes: ["aria-activedescendant"],
					callback: n
				});
			}
		},
		actions: {
			setAnchorPoint({ context: e, event: t }) {
				e.set("anchorPoint", (e) => $r(e, t.point) ? e : t.point);
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
				let a = () => ah(t), o = r.point ?? e.get("anchorPoint"), s = o ? () => ({
					width: 0,
					height: 0,
					...o
				}) : void 0, c = {
					...n("positioning"),
					...i.get("positioningOverride")
				}, l = r.value ?? e.get("triggerValue");
				zd(() => dh(t, l), a, {
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
				$e(i) ? n("navigate")?.({
					value: a,
					node: i,
					href: i.href
				}) : queueMicrotask(() => i.click());
			},
			setIntentPolygon({ context: e, scope: t, event: n }) {
				let r = ih(t), i = e.get("currentPlacement");
				if (!r || !i) return;
				let a = Oh(r.getBoundingClientRect(), i);
				if (!a) return;
				let o = Sd(i) === "right" ? -5 : 5;
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
					let e = Ym(n);
					r?.send({
						type: "HIGHLIGHTED.SUGGEST",
						value: e
					});
				}
				Nh(r, !1);
			},
			unlockParentOnClose({ refs: e, context: t }) {
				Fh(e.get("parent"), t.get("isSubmenu"));
			},
			setHighlightedItem({ context: e, event: t }) {
				let n = t.value || nh(t.target);
				e.set("highlightedValue", n);
			},
			clearHighlightedItem({ context: e }) {
				e.set("highlightedValue", null);
			},
			focusMenu({ scope: e }) {
				q(() => {
					let t = ih(e);
					On({
						root: t,
						enabled: !it(t, e.getActiveElement()),
						filter(e) {
							return !e.role?.startsWith("menuitem");
						}
					})?.focus({ preventScroll: !0 });
				});
			},
			highlightFirstItem({ context: e, scope: t }) {
				(ih(t) ? queueMicrotask : q)(() => {
					let n = ph(t);
					n && e.set("highlightedValue", nh(n));
				});
			},
			highlightLastItem({ context: e, scope: t }) {
				(ih(t) ? queueMicrotask : q)(() => {
					let n = mh(t);
					n && e.set("highlightedValue", nh(n));
				});
			},
			highlightNextItem({ context: e, scope: t, event: n, prop: r }) {
				let i = gh(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", nh(i));
			},
			highlightPrevItem({ context: e, scope: t, event: n, prop: r }) {
				let i = _h(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", nh(i));
			},
			invokeOnSelect({ context: e, prop: t, scope: n }) {
				let r = e.get("highlightedValue");
				r != null && (Sh(sh(n, r), r), t("onSelect")?.({ value: r }));
			},
			focusTrigger({ scope: e, context: t, event: n }) {
				t.get("isSubmenu") || t.get("anchorPoint") || n.restoreFocus === !1 || queueMicrotask(() => {
					dh(e, t.get("triggerValue"))?.focus({ preventScroll: !0 });
				});
			},
			highlightMatchedItem({ scope: e, context: t, event: n, refs: r }) {
				let i = vh(e, {
					key: n.key,
					value: t.get("highlightedValue"),
					typeaheadState: r.get("typeaheadState")
				});
				i && t.set("highlightedValue", nh(i));
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
				if (!bh(r)) return;
				let i = r?.getAttribute("data-uid"), a = e.get("children");
				for (let e in a) {
					if (e === i) continue;
					let r = a[e], o = r.context.get("intentPolygon");
					o && t.point && kh(o, t.point) || (ih(n)?.focus({ preventScroll: !0 }), r.send({ type: "CLOSE" }));
				}
			},
			closeRootMenu({ refs: e }) {
				Ah({ parent: e.get("parent") });
			},
			openSubmenu({ refs: e, scope: t, computed: n }) {
				let r = t.getById(n("highlightedId"))?.getAttribute("data-uid"), i = e.get("children");
				(r ? i[r] : null)?.send({ type: "OPEN_AUTOFOCUS" });
			},
			focusParentMenu({ refs: e }) {
				e.get("parent")?.send({ type: "FOCUS_MENU" });
			},
			setLastHighlightedItem({ context: e, event: t }) {
				e.set("lastHighlightedValue", nh(t.target));
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
				t.get("isSubmenu") && Ih(e.get("parent"));
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
}), Hh = (e) => {
	let t = Sr(), n = po(), r = R(() => {
		let r = hi(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = za(Vh, () => x(r)), a = R(() => Lh(i, ja));
	return () => ({
		api: x(a),
		service: i
	});
}, Uh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function Wh(e, n) {
	let r = f();
	U(n, !0);
	let i = F(n, "open", 15), a = O(n, Uh), o = R(() => eo(a)), s = R(() => V(x(o), 2)), c = R(() => x(s)[0]), l = R(() => x(s)[1]), u = R(() => Er()(x(l), [
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
	])), d = R(() => V(x(u), 2)), p = R(() => x(d)[0]), h = R(() => x(d)[1]), _ = Mm(), v = Gm(), y = R(() => ({
		...x(p),
		id: x(p).id ?? r,
		open: i(),
		onOpenChange(e) {
			x(p).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), b = Hh(() => x(y)), S = R(() => b().api), C = R(() => b().service), w = $a(() => ({
		present: x(S).open,
		...x(c)
	}));
	t(() => {
		let e = v?.(), t = _?.();
		e && t && (t.setChild(x(C)), x(S).setParent(e));
	});
	let E = R(() => _?.().getTriggerItemProps(x(S)));
	Km(() => x(E)), Wm(() => x(C)), jm(() => x(S)), to(w);
	var D = {
		get open() {
			return i();
		},
		set open(e) {
			i(e), W();
		}
	}, k = g(), ee = T(k);
	return I(ee, () => x(h).children ?? P), m(e, k), B(D);
}
H(Wh, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-trigger.svelte
var Gh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Kh(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Gh), i = R(() => Er()(r, ["value"])), a = R(() => V(x(i), 2)), o = R(() => x(a)[0]), s = R(() => x(a)[1]), c = Mm(), l = qm(), u = R(() => J(c().getTriggerProps(x(o)), l?.() || {}, x(s)));
	return Y(e, z({
		as: "button",
		"data-scope": "menu",
		"data-part": "trigger"
	}, () => x(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Kh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Menu.svelte
var qh = o("<af-tooltip><!></af-tooltip>", 2), Jh = o("<!> <!>", 1), Yh = o("<div class=\"af-kit\"><!></div>"), Xh = {
	hash: "svelte-j0sh25",
	code: "af-tooltip.svelte-j0sh25 {display:block;}[data-scope='menu'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='menu'][data-part='content'] {min-width:180px;padding:4px;}[data-scope='menu'][data-part='item'] {padding:6px 10px;border-radius:max(0px, calc(var(--k-radius) - 4px));font-size:13px;line-height:20px;cursor:pointer;}[data-scope='menu'][data-part='item'][data-highlighted] {background:color-mix(in oklab, var(--k-fg) 6%, transparent);}[data-scope='menu'][data-part='item'][data-danger] {color:color-mix(in oklab, var(--k-danger) 78%, var(--k-fg));}[data-scope='menu'][data-part='item'][aria-disabled='true'] {opacity:0.55;cursor:not-allowed;}"
};
function Zh(t, n) {
	U(n, !0), ee(t, Xh);
	let a = F(n, "items", 23, () => []), o = F(n, "label", 7, ""), c = n.$$host, l = M(!1), f = M(null);
	d(() => Xl(x(f), x(l), c));
	let h = (e) => e ? { "aria-description": e } : {};
	var _ = {
		get items() {
			return a();
		},
		set items(e = []) {
			a(e), W();
		},
		get label() {
			return o();
		},
		set label(e = "") {
			o(e), W();
		}
	}, S = Jh(), C = T(S);
	return Jl(C, {}), Tr(E(C, 2), {
		value: () => c.shadowRoot,
		children: (t, d) => {
			var _ = Yh(), S = u(_);
			y(S, () => Wh, (t, d) => {
				d(t, {
					positioning: {
						strategy: "fixed",
						placement: "bottom-end"
					},
					onSelect: (e) => {
						let t = (a() ?? []).find((t) => t.id === e.value);
						t && !t.disabled && Yl(c, "select", { id: t.id });
					},
					get open() {
						return x(l);
					},
					set open(t) {
						e(l, t, !0);
					},
					children: (t, c) => {
						var l = Jh(), d = T(l);
						{
							let e = R(() => o() ?? "");
							y(d, () => Kh, (t, i) => {
								i(t, {
									part: "trigger",
									class: "af-button ghost",
									get "aria-label"() {
										return x(e);
									},
									children: (e, t) => {
										var i = g(), a = T(i);
										r(a, n, "default", {}, null), m(e, i);
									},
									$$slots: { default: !0 }
								});
							});
						}
						var _ = E(d, 2);
						y(_, () => Um, (t, n) => {
							n(t, {
								popover: "manual",
								get ref() {
									return x(f);
								},
								set ref(t) {
									e(f, t, !0);
								},
								children: (e, t) => {
									var n = g(), r = T(n);
									y(r, () => Rm, (e, t) => {
										t(e, {
											class: "af-overlay menu",
											children: (e, t) => {
												var n = g(), r = T(n);
												{
													let e = (e, t = P) => {
														var n = g(), r = T(n);
														b(r, 17, () => a() ?? [], (e) => e.id, (e, n) => {
															var r = g(), a = T(r), o = (e) => {
																var t = qh();
																s(() => se(t, "text", x(n).reason ?? "")), D(t, 1, "svelte-j0sh25");
																var r = u(t);
																{
																	let e = R(() => h(x(n).reason)), t = R(() => x(n).danger ? "" : void 0);
																	y(r, () => Vm, (r, i) => {
																		i(r, z({
																			get value() {
																				return x(n).id;
																			},
																			disabled: !0,
																			part: "item",
																			"aria-disabled": "true"
																		}, () => x(e), {
																			get "data-danger"() {
																				return x(t);
																			},
																			children: (e, t) => {
																				L();
																				var r = v();
																				s(() => p(r, x(n).label)), m(e, r);
																			},
																			$$slots: { default: !0 }
																		}));
																	});
																}
																G(t), m(e, t);
															}, c = (e) => {
																var r = g(), i = T(r);
																{
																	let e = R(() => x(n).danger ? "" : void 0);
																	y(i, () => Vm, (r, i) => {
																		i(r, {
																			get value() {
																				return x(n).id;
																			},
																			part: "item",
																			get "data-danger"() {
																				return x(e);
																			},
																			onclickcapture: () => t()().setHighlightedValue(x(n).id),
																			children: (e, t) => {
																				L();
																				var r = v();
																				s(() => p(r, x(n).label)), m(e, r);
																			},
																			$$slots: { default: !0 }
																		});
																	});
																}
																m(e, r);
															};
															i(a, (e) => {
																x(n).disabled ? e(o) : e(c, -1);
															}), m(e, r);
														}), m(e, n);
													};
													y(r, () => zm, (t, n) => {
														n(t, {
															render: e,
															$$slots: { render: !0 }
														});
													});
												}
												m(e, n);
											},
											$$slots: { default: !0 }
										});
									}), m(e, n);
								},
								$$slots: { default: !0 }
							});
						}), m(t, l);
					},
					$$slots: { default: !0 }
				});
			}), G(_), m(t, _);
		},
		$$slots: { default: !0 }
	}), m(t, S), B(_);
}
H(Zh, {
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
var Qh = Object.defineProperty, $h = (e, t, n) => t in e ? Qh(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, $ = (e, t, n) => $h(e, typeof t == "symbol" ? t : t + "", n), eg = {
	itemToValue(e) {
		return typeof e == "string" ? e : ri(e) && si(e, "value") ? e.value : "";
	},
	itemToString(e) {
		return typeof e == "string" ? e : ri(e) && si(e, "label") ? e.label : eg.itemToValue(e);
	},
	isItemDisabled(e) {
		return ri(e) && si(e, "disabled") ? !!e.disabled : !1;
	}
}, tg = class e {
	constructor(t) {
		$(this, "options", t), $(this, "items"), $(this, "indexMap", null), $(this, "copy", (t) => new e({
			...this.options,
			items: t ?? [...this.items]
		})), $(this, "isEqual", (e) => $r(this.items, e.items)), $(this, "setItems", (e) => this.copy(e)), $(this, "getValues", (e = this.items) => {
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
		}), $(this, "sort", (e) => [...e].sort(this.sortFn.bind(this))), $(this, "getItemValue", (e) => e == null ? null : this.options.itemToValue?.(e) ?? eg.itemToValue(e)), $(this, "getItemDisabled", (e) => e == null ? !1 : this.options.isItemDisabled?.(e) ?? eg.isItemDisabled(e)), $(this, "stringifyItem", (e) => e == null ? null : this.options.itemToString?.(e) ?? eg.itemToString(e)), $(this, "stringify", (e) => e == null ? null : this.stringifyItem(this.find(e))), $(this, "stringifyItems", (e, t = ", ") => {
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
				if (!(r && this.getItemValue(a) === t) && !this.getItemDisabled(a) && ng(this.stringifyItem(a), e)) return a;
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
		}), $(this, "insert", (e, ...t) => this.copy(rg(this.items, e, ...t))), $(this, "insertBefore", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(rg(this.items, n, ...t));
		}), $(this, "insertAfter", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(rg(this.items, n + 1, ...t));
		}), $(this, "prepend", (...e) => this.copy(rg(this.items, 0, ...e))), $(this, "append", (...e) => this.copy(rg(this.items, this.items.length, ...e))), $(this, "filter", (e) => {
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
			return n === -1 ? this : this.copy(ig(this.items, [n], t));
		}), $(this, "moveBefore", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(ig(this.items, r, n));
		}), $(this, "moveAfter", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(ig(this.items, r, n + 1));
		}), $(this, "reorder", (e, t) => this.copy(ig(this.items, [e], t))), $(this, "compareValue", (e, t) => {
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
}, ng = (e, t) => !!e?.toLowerCase().startsWith(t.toLowerCase());
function rg(e, t, ...n) {
	return [
		...e.slice(0, t),
		...n,
		...e.slice(t)
	];
}
function ig(e, t, n) {
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
function ag({ values: e, collection: t, selectedItemMap: n }) {
	let r = [];
	for (let i of e) {
		let e = t.find(i) ?? n.get(i);
		e != null && r.push(e);
	}
	return r;
}
function og({ selectedItemMap: e, values: t, selectedItems: n, collection: r }) {
	let i = new Map(e);
	for (let e of n) {
		let t = r.getItemValue(e);
		t != null && i.set(t, e);
	}
	let a = new Set(t);
	for (let e of i.keys()) a.has(e) || i.delete(e);
	return i;
}
function sg({ values: e, collection: t, selectedItemMap: n }) {
	let r = ag({
		values: e,
		collection: t,
		selectedItemMap: n
	});
	return {
		selectedItems: r,
		nextSelectedItemMap: og({
			selectedItemMap: n,
			values: e,
			selectedItems: r,
			collection: t
		})
	};
}
function cg({ selectedItems: e, collection: t }) {
	return og({
		selectedItemMap: /* @__PURE__ */ new Map(),
		values: e.map((e) => t.getItemValue(e)).filter(Boolean),
		selectedItems: e,
		collection: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/collection/list-collection.js
var lg = (e) => new tg(e), [ug, dg] = br({
	name: "ComboboxContext",
	hookName: "useComboboxContext",
	providerName: "<ComboboxProvider />"
}), fg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function pg(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, fg), a = dg(), o = no(), s = R(() => J(a().getContentProps(), o().getPresenceProps(), r));
	function c(e) {
		o().setNode(e);
	}
	var l = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, u = g(), d = T(u), f = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			[h()]: c,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, p = R(() => !o().unmounted);
	return i(d, (e) => {
		x(p) && e(f);
	}), m(e, u), B(l);
}
H(pg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.anatomy.mjs
var mg = uc("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger"), hg = mg.build(), gg = (e) => new tg(e);
gg.empty = () => new tg({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.dom.mjs
var _g = (e) => e.ids?.root ?? `combobox:${e.id}`, vg = (e) => e.ids?.label ?? `combobox:${e.id}:label`, yg = (e) => e.ids?.control ?? `combobox:${e.id}:control`, bg = (e) => e.ids?.input ?? `combobox:${e.id}:input`, xg = (e) => e.ids?.content ?? `combobox:${e.id}:content`, Sg = (e) => e.ids?.positioner ?? `combobox:${e.id}:popper`, Cg = (e) => e.ids?.trigger ?? `combobox:${e.id}:toggle-btn`, wg = (e) => e.ids?.clearTrigger ?? `combobox:${e.id}:clear-btn`, Tg = (e, t) => e.ids?.itemGroup?.(t) ?? `combobox:${e.id}:optgroup:${t}`, Eg = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `combobox:${e.id}:optgroup-label:${t}`, Dg = (e, t) => e.ids?.item?.(t) ?? `combobox:${e.id}:option:${t}`, Og = (e) => e.getById(xg(e)), kg = (e) => e.getById(bg(e)), Ag = (e) => e.getById(Sg(e)), jg = (e) => e.getById(yg(e)), Mg = (e) => e.getById(Cg(e)), Ng = (e) => e.getById(wg(e)), Pg = (e, t) => {
	if (t == null) return null;
	let n = `[role=option][data-value="${CSS.escape(t)}"]`;
	return Qn(Og(e), n);
}, Fg = (e) => {
	let t = kg(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 }), Me(t);
}, Ig = (e) => {
	let t = Mg(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 });
}, Lg = {
	triggerLabel: "Toggle suggestions",
	clearTriggerLabel: "Clear value"
};
function Rg(e, t) {
	let { context: n, prop: r, state: i, send: a, scope: o, computed: s } = e, c = Pi(Lg, r("translations")), l = r("collection"), u = !!r("disabled"), d = s("isInteractive"), f = !!r("invalid"), p = !!r("required"), m = !!r("readOnly"), h = i.hasTag("open"), g = i.hasTag("focused"), _ = r("composite"), v = n.get("highlightedValue"), y = n.get("currentPlacement"), b = y ? Sd(y) : void 0, x = Vd({
		...r("positioning"),
		placement: y
	});
	function S(e) {
		let t = l.getItemDisabled(e.item), r = l.getItemValue(e.item);
		return Hi(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
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
			kg(o)?.focus();
		},
		setOpen(e, t = "script") {
			i.hasTag("open") !== e && a({
				type: e ? "OPEN" : "CLOSE",
				src: t
			});
		},
		getRootProps() {
			return t.element({
				...hg.root.attrs,
				dir: r("dir"),
				id: _g(o),
				"data-invalid": K(f),
				"data-readonly": K(m)
			});
		},
		getLabelProps() {
			return t.label({
				...hg.label.attrs,
				dir: r("dir"),
				htmlFor: bg(o),
				id: vg(o),
				"data-readonly": K(m),
				"data-disabled": K(u),
				"data-invalid": K(f),
				"data-required": K(p),
				"data-focus": K(g),
				onClick(e) {
					_ || (e.preventDefault(), Mg(o)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getControlProps() {
			return t.element({
				...hg.control.attrs,
				dir: r("dir"),
				id: yg(o),
				"data-state": h ? "open" : "closed",
				"data-focus": K(g),
				"data-disabled": K(u),
				"data-invalid": K(f)
			});
		},
		getPositionerProps() {
			return t.element({
				...hg.positioner.attrs,
				dir: r("dir"),
				id: Sg(o),
				style: x.floating
			});
		},
		getInputProps() {
			return t.input({
				...hg.input.attrs,
				dir: r("dir"),
				"aria-invalid": Le(f),
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
				id: bg(o),
				type: "text",
				role: "combobox",
				defaultValue: n.get("inputValue"),
				"aria-autocomplete": s("autoComplete") ? "both" : "list",
				"aria-controls": xg(o),
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-activedescendant": v ? Dg(o, v) : void 0,
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
					if (e.defaultPrevented || !d || e.ctrlKey || e.shiftKey || Jt(e)) return;
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
							let c = Pg(o, v);
							$e(c) && r("navigate")?.({
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
					}[an(e, { dir: r("dir") })];
					i?.(e);
				}
			});
		},
		getTriggerProps(e = {}) {
			return t.button({
				...hg.trigger.attrs,
				dir: r("dir"),
				id: Cg(o),
				"aria-haspopup": _ ? "listbox" : "dialog",
				type: "button",
				tabIndex: e.focusable ? void 0 : -1,
				"aria-label": c.triggerLabel,
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-controls": h ? xg(o) : void 0,
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
					e.defaultPrevented || d && Qt(e) && a({
						type: "TRIGGER.CLICK",
						src: "trigger-click"
					});
				},
				onPointerDown(e) {
					d && e.pointerType !== "touch" && Qt(e) && (e.preventDefault(), queueMicrotask(() => {
						Fg(o);
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
					}[an(e, { dir: r("dir") })];
					t && (t(e), e.preventDefault());
				}
			});
		},
		getContentProps() {
			return t.element({
				...hg.content.attrs,
				dir: r("dir"),
				id: xg(o),
				role: _ ? "listbox" : "dialog",
				tabIndex: -1,
				hidden: !h,
				"data-state": h ? "open" : "closed",
				"data-placement": y,
				"data-side": b,
				"aria-labelledby": vg(o),
				"aria-multiselectable": r("multiple") && _ ? !0 : void 0,
				"data-empty": K(l.size === 0),
				onPointerDown(e) {
					Qt(e) && e.preventDefault();
				}
			});
		},
		getListProps() {
			return t.element({
				...hg.list.attrs,
				role: _ ? void 0 : "listbox",
				"data-empty": K(l.size === 0),
				"aria-labelledby": vg(o),
				"aria-multiselectable": r("multiple") && !_ ? !0 : void 0
			});
		},
		getClearTriggerProps() {
			return t.button({
				...hg.clearTrigger.attrs,
				dir: r("dir"),
				id: wg(o),
				type: "button",
				tabIndex: -1,
				disabled: u,
				"data-invalid": K(f),
				"aria-label": c.clearTriggerLabel,
				"aria-controls": bg(o),
				hidden: !n.get("value").length,
				onPointerDown(e) {
					Qt(e) && e.preventDefault();
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
				...hg.item.attrs,
				dir: r("dir"),
				id: Dg(o, i),
				role: "option",
				tabIndex: -1,
				"data-highlighted": K(n.highlighted),
				"data-state": n.selected ? "checked" : "unchecked",
				"aria-selected": Le(n.selected),
				"aria-disabled": Le(n.disabled),
				"data-disabled": K(n.disabled),
				"data-value": n.value,
				onPointerMove() {
					n.disabled || kp() === "pointer" && (n.highlighted || a({
						type: "ITEM.POINTER_MOVE",
						value: i
					}));
				},
				onPointerLeave() {
					e.persistFocus || n.disabled || kp() === "pointer" && a({
						type: "ITEM.POINTER_LEAVE",
						value: i
					});
				},
				onClick(e) {
					qt(e) || Kt(e) || $t(e) || n.disabled || a({
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
				...hg.itemText.attrs,
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
				...hg.itemIndicator.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...hg.itemGroup.attrs,
				dir: r("dir"),
				id: Tg(o, n),
				"aria-labelledby": Eg(o, n),
				"data-empty": K(l.size === 0),
				role: "group"
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...hg.itemGroupLabel.attrs,
				dir: r("dir"),
				id: Eg(o, n),
				role: "presentation"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.machine.mjs
var { guards: zg, createMachine: Bg, choose: Vg } = xa(), { and: Hg, not: Ug } = zg, Wg = Bg({
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
				Fn(e);
			},
			collection: gg.empty(),
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
				isEqual: $r,
				hash(e) {
					return e.join(",");
				},
				onChange(t) {
					let r = n(), i = e("collection"), a = sg({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : sg({
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
					t = xi(e("selectionBehavior"), {
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
			selectedItemMap: t(() => ({ defaultValue: cg({
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
		selectedItems: ({ context: e, prop: t }) => ag({
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
	entry: Vg([{
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
								guard: Hg("isOpenControlled", "openOnChange"),
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
							guard: Hg("isCustomValue", Ug("allowCustomValue")),
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
								guard: Hg("isOpenControlled", "autoComplete"),
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
								guard: Hg("isOpenControlled", "autoComplete"),
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
						guard: Hg("isOpenControlled", "isCustomValue", Ug("hasHighlightedItem"), Ug("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Hg("isCustomValue", Ug("hasHighlightedItem"), Ug("allowCustomValue")),
						target: "closed.focused",
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Hg("isOpenControlled", "closeOnSelect"),
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
						guard: Hg("isOpenControlled", "closeOnSelect"),
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
						guard: Hg("isOpenControlled", "isCustomValue", Ug("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Hg("isCustomValue", Ug("allowCustomValue")),
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
						guard: Hg("autoComplete", "isLastItemHighlighted"),
						actions: ["clearHighlightedValue", "scrollContentToTop"]
					}, { actions: ["highlightNextItem"] }],
					"INPUT.ARROW_UP": [{
						guard: Hg("autoComplete", "isFirstItemHighlighted"),
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
							guard: Hg("isOpenControlled", "autoComplete"),
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
							guard: Hg("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
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
				return ti(n) ? n : !!n?.({ inputValue: t.get("inputValue") });
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
				return Mp({ root: e.getRootNode?.() });
			},
			trackDismissableLayer({ send: e, prop: t, scope: n }) {
				return t("disableLayer") ? void 0 : vl(() => Og(n), {
					type: "listbox",
					defer: !0,
					exclude: () => [
						kg(n),
						Mg(n),
						Ng(n)
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
				let n = Ff({
					level: "assertive",
					document: t.getDoc()
				});
				return e.set("liveRegion", n), () => n.destroy();
			},
			trackPlacement({ context: e, prop: t, scope: n }) {
				return e.set("currentPlacement", t("positioning").placement), zd(() => jg(n) || Mg(n), () => Ag(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				let r = kg(n), i = [], a = (r) => {
					if (kp() === "pointer") return;
					let a = e.get("highlightedValue");
					if (!a) return;
					let o = Og(n), s = t("scrollToIndexFn");
					if (s) {
						s({
							index: t("collection").indexOf(a),
							immediate: r,
							getElement: () => Pg(n, a)
						});
						return;
					}
					let c = Pg(n, a), l = q(() => {
						rr(c, {
							rootEl: o,
							block: "nearest"
						});
					});
					i.push(l);
				}, o = q(() => {
					Ap("virtual"), a(!0);
				});
				i.push(o);
				let s = Pn(r, {
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
				zd(() => jg(n), () => Ag(n), {
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
				let a = n("multiple") ? Gr(t.get("value"), i) : [i];
				n("onSelect")?.({
					value: a,
					itemValue: i
				}), t.set("value", a);
				let o = xi(n("selectionBehavior"), {
					preserve: t.get("inputValue"),
					replace: r.stringifyMany(a),
					clear: ""
				});
				t.set("inputValue", o);
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				jn(() => {
					let r = e.get("highlightedValue");
					if (r == null) return;
					let i = Pg(n, r), a = Og(n), o = t("scrollToIndexFn");
					if (o) {
						o({
							index: t("collection").indexOf(r),
							immediate: !0,
							getElement: () => Pg(n, r)
						});
						return;
					}
					rr(i, {
						rootEl: a,
						block: "nearest"
					});
				});
			},
			selectItem(e) {
				let { context: t, event: n, flush: r, prop: i } = e;
				n.value != null && r(() => {
					let e = i("multiple") ? Gr(t.get("value"), n.value) : [n.value];
					i("onSelect")?.({
						value: e,
						itemValue: n.value
					}), t.set("value", e);
					let r = xi(i("selectionBehavior"), {
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
					let e = Ur(t.get("value"), n.value);
					t.set("value", e);
					let r = xi(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(e),
						clear: ""
					});
					t.set("inputValue", r);
				});
			},
			setInitialFocus({ scope: e }) {
				q(() => {
					Fg(e);
				});
			},
			setFinalFocus({ scope: e }) {
				q(() => {
					Mg(e)?.dataset.focusable == null ? Fg(e) : Ig(e);
				});
			},
			syncInputValue({ context: e, scope: t, event: n }) {
				let r = kg(t);
				r && (r.value = e.get("inputValue"), queueMicrotask(() => {
					n.current().type !== "INPUT.CHANGE" && Me(r);
				}));
			},
			setInputValue({ context: e, event: t }) {
				e.set("inputValue", t.value);
			},
			clearInputValue({ context: e }) {
				e.set("inputValue", "");
			},
			revertInputValue({ context: e, prop: t, computed: n }) {
				let r = xi(t("selectionBehavior"), {
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
					let e = xi(i("selectionBehavior"), {
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
					let e = xi(r("selectionBehavior"), {
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
						getElement: () => Pg(t, r)
					});
				} else {
					let e = Og(t);
					if (!e) return;
					e.scrollTop = 0;
				}
			},
			invokeOnOpen({ prop: e, event: t, context: n }) {
				let r = Gg(t);
				e("onOpenChange")?.({
					open: !0,
					reason: r,
					value: n.get("value")
				});
			},
			invokeOnClose({ prop: e, event: t, context: n }) {
				let r = Gg(t);
				e("onOpenChange")?.({
					open: !1,
					reason: r,
					value: n.get("value")
				});
			},
			highlightFirstItem({ context: e, prop: t, scope: n }) {
				(Og(n) ? queueMicrotask : q)(() => {
					let n = t("collection").firstValue;
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstItemIfNeeded({ computed: e, action: t }) {
				e("autoHighlight") && t(["highlightFirstItem"]);
			},
			highlightLastItem({ context: e, prop: t, scope: n }) {
				(Og(n) ? queueMicrotask : q)(() => {
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
				let a = kg(i), o = n("collection");
				if (!t("autoComplete") || !a || !r.keypress) return;
				let s = o.stringify(e.get("highlightedValue"));
				q(() => {
					a.value = s || e.get("inputValue");
				});
			},
			syncSelectedItems(e) {
				queueMicrotask(() => {
					let { context: t, prop: n } = e, r = n("collection"), i = t.get("value"), a = sg({
						values: i,
						collection: r,
						selectedItemMap: t.get("selectedItemMap")
					});
					t.set("selectedItemMap", a.nextSelectedItemMap);
					let o = xi(n("selectionBehavior"), {
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
				if (!zt()) return;
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
function Gg(e) {
	return (e.previousEvent || e).src;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox.anatomy.js
var Kg = mg.extendWith("empty"), qg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Jg(e, t) {
	U(t, !0);
	let n = Kg.build(), r = F(t, "ref", 15, null), a = O(t, qg), o = dg(), s = R(() => o().collection.size === 0);
	var c = {
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), W();
		}
	}, l = g(), u = T(l), d = (e) => {
		Y(e, z({ as: "div" }, () => n.empty.attrs, () => a, {
			role: "presentation",
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	};
	return i(u, (e) => {
		x(s) && e(d);
	}), m(e, l), B(c);
}
H(Jg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-control.svelte
var Yg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Xg(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Yg), i = dg(), a = R(() => J(i().getControlProps(), r));
	return Y(e, z({ as: "div" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Xg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-input.svelte
var Zg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Qg(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Zg), i = dg(), a = R(() => J(i().getInputProps(), r));
	return Y(e, z({ as: "input" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(Qg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-item-context.js
var [$g, e_] = br({
	name: "ComboboxItemContext",
	hookName: "useComboboxItemContext",
	providerName: "<ComboboxItemProvider />"
}), [t_, n_] = br({
	name: "ComboboxItemPropsContext",
	hookName: "useComboboxItemPropsContext",
	providerName: "<ComboboxItemPropsProvider />"
}), r_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function i_(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, r_), i = R(() => Er()(r, ["item", "persistFocus"])), a = R(() => V(x(i), 2)), o = R(() => x(a)[0]), s = R(() => x(a)[1]), c = dg(), l = R(() => c().getItemState(x(o))), u = R(() => J(c().getItemProps(x(o)), x(s)));
	return $g(() => x(l)), t_(() => x(o)), Y(e, z({ as: "div" }, () => x(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(i_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-positioner.svelte
var a_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function o_(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, a_), a = dg(), o = no(), s = R(() => J(a().getPositionerProps(), r));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, l = g(), u = T(l), d = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = R(() => !o().unmounted);
	return i(u, (e) => {
		x(f) && e(d);
	}), m(e, l), B(c);
}
H(o_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/field/use-field-context.js
var [s_, c_] = br({
	name: "FieldContext",
	strict: !1
}), l_ = (e) => {
	let t = Sr(), n = po(), r = c_(), i = R(() => {
		let i = hi(e), a = hi(i.collection);
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
	}), a = za(Wg, () => x(i)), o = R(() => Rg(a, ja));
	return () => x(o);
}, u_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open",
	"value",
	"inputValue"
]);
function d_(e, t) {
	let n = f();
	U(t, !0);
	let r = F(t, "ref", 15, null), i = F(t, "open", 15), a = F(t, "value", 15), o = F(t, "inputValue", 15), s = O(t, u_), c = R(() => eo(s)), l = R(() => V(x(c), 2)), u = R(() => x(l)[0]), d = R(() => x(l)[1]), p = R(() => Er()(x(d), /* @__PURE__ */ "allowCustomValue.alwaysSubmitOnEnter.autoFocus.closeOnSelect.collection.composite.defaultHighlightedValue.defaultInputValue.defaultOpen.defaultValue.disabled.disableLayer.form.highlightedValue.id.ids.inputBehavior.inputValue.invalid.loopFocus.multiple.name.navigate.onFocusOutside.onHighlightChange.onInputValueChange.onInteractOutside.onOpenChange.onPointerDownOutside.onSelect.onValueChange.open.openOnChange.openOnClick.openOnKeyPress.placeholder.positioning.readOnly.required.scrollToIndexFn.selectionBehavior.translations.value".split("."))), m = R(() => V(x(p), 2)), h = R(() => x(m)[0]), g = R(() => x(m)[1]), _ = R(() => ({
		...x(h),
		id: x(h).id ?? n,
		open: i(),
		value: a(),
		inputValue: o(),
		onOpenChange(e) {
			x(h).onOpenChange?.(e), i() !== void 0 && i(e.open);
		},
		onValueChange(e) {
			x(h).onValueChange?.(e), a() !== void 0 && a(e.value);
		},
		onInputValueChange(e) {
			x(h).onInputValueChange?.(e), o() !== void 0 && o(e.inputValue);
		}
	})), v = l_(() => x(_)), y = $a(() => ({
		present: v().open,
		...x(u)
	})), b = R(() => J(v().getRootProps(), x(g)));
	return ug(v), to(y), Y(e, z({ as: "div" }, () => x(b), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), B({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), W();
		},
		get open() {
			return i();
		},
		set open(e) {
			i(e), W();
		},
		get value() {
			return a();
		},
		set value(e) {
			a(e), W();
		},
		get inputValue() {
			return o();
		},
		set inputValue(e) {
			o(e), W();
		}
	});
}
H(d_, {
	ref: {},
	open: {},
	value: {},
	inputValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/PersonPicker.svelte
var f_ = (e) => e.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
function p_(e) {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => Array.from(e)[0].toUpperCase());
	return t.length === 0 ? "" : t.length === 1 ? t[0] : t[0] + t[t.length - 1];
}
var m_ = o("<img alt=\"\"/>"), h_ = o("<span class=\"af-avatar\"><!></span>"), g_ = o("<span class=\"af-chip svelte-akzd1x\" part=\"chip\"><!> <span> </span> <button type=\"button\" part=\"remove\" class=\"svelte-akzd1x\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), __ = o("<span class=\"lead svelte-akzd1x\"><!></span>"), v_ = o("<button type=\"button\" part=\"clear\" class=\"af-button ghost svelte-akzd1x\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), y_ = o("<!> <!> <!>", 1), b_ = o("<span class=\"mail\"> </span>"), x_ = o("<!> <span class=\"who\"><span class=\"name\"> </span> <!></span>", 1), S_ = o("<!> <!>", 1), C_ = o("<div class=\"af-kit\"><!></div>"), w_ = {
	hash: "svelte-akzd1x",
	code: "[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x), [part='clear'].svelte-akzd1x {display:inline-grid;flex:none;place-items:center;width:24px;height:24px;min-height:0;padding:0;border:0;border-radius:max(0px, calc(var(--k-radius) - 4px));background:transparent;color:var(--k-muted);cursor:pointer;}[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x):hover:not(:disabled), [part='clear'].svelte-akzd1x:hover {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-fg);}[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x):focus-visible, [part='clear'].svelte-akzd1x:focus-visible {outline:2px solid var(--k-ring);outline-offset:-2px;}[part='chip'].svelte-akzd1x {padding-right:2px;}.lead.svelte-akzd1x {display:inline-flex;}[data-scope='combobox'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='combobox'][hidden] {display:none !important;}[data-scope='combobox'][data-part='control'] {display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-width:14em;min-height:32px;padding:2px 6px;border:1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%);border-radius:max(0px, calc(var(--k-radius) - 2px));background:var(--k-surface);}[data-scope='combobox'][data-part='control']:focus-within {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='combobox'][data-part='input'] {flex:1;min-width:6em;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='combobox'][data-part='input']::placeholder {color:var(--k-muted);}[data-scope='combobox'][data-part='content'] {max-height:280px;overflow:auto;padding:4px;}[data-scope='combobox'][data-part='item'] {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}[data-scope='combobox'][data-part='item'][data-highlighted] {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}[data-scope='combobox'][data-part='item'][data-state='checked'] {font-weight:600;}[data-scope='combobox'][data-part='item'] .who {display:flex;flex-direction:column;min-width:0;}[data-scope='combobox'][data-part='item'] .mail {color:var(--k-muted);font-size:12px;}[data-scope='combobox'][data-part='empty'] {padding:8px;color:var(--k-muted);}"
};
function T_(t, r) {
	U(r, !0), ee(t, w_);
	let a = (e, t = P) => {
		var n = h_(), r = u(n), a = (e) => {
			var n = m_();
			s(() => N(n, "src", t().avatar)), m(e, n);
		}, o = (e) => {
			var n = v();
			s((e) => p(n, e), [() => p_(t().name)]), m(e, n);
		}, c = R(() => x(te).has(t().id)), l = (e) => {
			var t = v("?");
			m(e, t);
		};
		i(r, (e) => {
			t().avatar ? e(a) : x(c) ? e(o, 1) : e(l, -1);
		}), G(n), m(e, n);
	}, o = F(r, "people", 23, () => []), c = F(r, "value", 7, null), l = F(r, "multiple", 7, !1), f = F(r, "placeholder", 7, null), h = F(r, "label", 7, null), _ = F(r, "loading", 7, !1), S = F(r, "locale", 7, null), C = F(r, "disabled", 7, !1), D = F(r, "strings", 7, null), O = r.$$host, k = R(() => ru(S(), D() ?? void 0)), A = R(() => {
		let e = /* @__PURE__ */ new Set();
		return (o() ?? []).filter((t) => !e.has(t.id) && !!e.add(t.id));
	}), te = R(() => new Map(x(A).map((e) => [e.id, e]))), j = R(() => [...new Set(Array.isArray(c()) ? c() : c() ? [c()] : [])]), ne = M(null), I = R(() => x(j).filter((e) => !x(te).has(e))), re = (e) => x(te).get(e)?.name ?? (_() ? "…" : x(A).length === 0 ? "" : x(I).length > 1 ? `${x(k).unknownPerson} ${x(I).indexOf(e) + 1}` : x(k).unknownPerson), ie = R(() => x(ne) ?? (l() || !x(j)[0] ? "" : x(te).has(x(j)[0]) ? x(te).get(x(j)[0]).name : _() ? "" : re(x(j)[0]))), ae = R(() => f_((x(ne) ?? "").trim())), oe = R(() => x(ae) === "" ? x(A) : x(A).filter((e) => f_(e.name).includes(x(ae)) || f_(e.email ?? "").includes(x(ae)))), z = R(() => lg({
		items: x(oe),
		itemToValue: (e) => e.id,
		itemToString: (e) => e.name
	})), se = M(!1), V = M(null);
	d(() => Xl(x(V), x(se), O));
	let ce = (e) => Yl(O, "change", { value: l() ? e : e[0] ?? null });
	var H = {
		get people() {
			return o();
		},
		set people(e = []) {
			o(e), W();
		},
		get value() {
			return c();
		},
		set value(e = null) {
			c(e), W();
		},
		get multiple() {
			return l();
		},
		set multiple(e = !1) {
			l(e), W();
		},
		get placeholder() {
			return f();
		},
		set placeholder(e = null) {
			f(e), W();
		},
		get label() {
			return h();
		},
		set label(e = null) {
			h(e), W();
		},
		get loading() {
			return _();
		},
		set loading(e = !1) {
			_(e), W();
		},
		get locale() {
			return S();
		},
		set locale(e = null) {
			S(e), W();
		},
		get disabled() {
			return C();
		},
		set disabled(e = !1) {
			C(e), W();
		},
		get strings() {
			return D();
		},
		set strings(e = null) {
			D(e), W();
		}
	}, le = S_(), ue = T(le);
	return Jl(ue, {}), Tr(E(ue, 2), {
		value: () => O.shadowRoot,
		children: (t, r) => {
			var o = C_(), c = u(o), d = () => x(j), _ = () => x(ie);
			{
				let t = R(() => !!l()), r = R(() => !!C());
				y(c, () => d_, (o, c) => {
					c(o, {
						get collection() {
							return x(z);
						},
						get multiple() {
							return x(t);
						},
						get disabled() {
							return x(r);
						},
						inputBehavior: "autohighlight",
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						get value() {
							return d();
						},
						set value(e) {},
						get inputValue() {
							return _();
						},
						set inputValue(e) {},
						onValueChange: (e) => ce(e.value),
						onInputValueChange: (t) => {
							if (t.reason !== "input-change") {
								e(ne, null);
								return;
							}
							e(ne, t.inputValue, !0), Yl(O, "search", { query: t.inputValue });
						},
						onOpenChange: (t) => {
							t.open || e(ne, null);
						},
						get open() {
							return x(se);
						},
						set open(t) {
							e(se, t, !0);
						},
						children: (t, r) => {
							var o = S_(), c = T(o);
							y(c, () => Xg, (e, t) => {
								t(e, {
									part: "control",
									children: (e, t) => {
										var r = y_(), o = T(r), c = (e) => {
											var t = g(), r = T(t);
											b(r, 16, () => x(j), (e) => e, (e, t) => {
												let r = R(() => x(te).get(t) ?? {
													id: t,
													name: re(t)
												});
												var i = g_(), o = u(i);
												a(o, () => x(r));
												var c = E(o, 2), l = w(c, !0), d = E(c, 2);
												G(i), s(() => {
													p(l, x(r).name), N(d, "aria-label", `${x(k).remove ?? ""}: ${x(r).name ?? ""}`), d.disabled = !!C();
												}), n("click", d, () => ce(x(j).filter((e) => e !== t))), m(e, i);
											}), m(e, t);
										}, d = (e) => {
											let t = R(() => x(te).get(x(j)[0]) ?? {
												id: x(j)[0],
												name: re(x(j)[0])
											});
											var n = __(), r = u(n);
											a(r, () => x(t)), G(n), m(e, n);
										};
										i(o, (e) => {
											l() ? e(c) : x(j)[0] && e(d, 1);
										});
										var _ = E(o, 2);
										{
											let e = R(() => f() ?? ""), t = R(() => h() || void 0);
											y(_, () => Qg, (n, r) => {
												r(n, {
													part: "input",
													autocomplete: "off",
													spellcheck: "false",
													get placeholder() {
														return x(e);
													},
													get "aria-label"() {
														return x(t);
													}
												});
											});
										}
										var v = E(_, 2), S = (e) => {
											var t = v_();
											s(() => N(t, "aria-label", x(k).clear)), n("click", t, () => ce([])), m(e, t);
										};
										i(v, (e) => {
											!l() && x(j)[0] && !C() && e(S);
										}), m(e, r);
									},
									$$slots: { default: !0 }
								});
							});
							var d = E(c, 2);
							y(d, () => o_, (t, n) => {
								n(t, {
									popover: "manual",
									get ref() {
										return x(V);
									},
									set ref(t) {
										e(V, t, !0);
									},
									children: (e, t) => {
										var n = g(), r = T(n);
										y(r, () => pg, (e, t) => {
											t(e, {
												class: "af-overlay people",
												part: "content",
												children: (e, t) => {
													var n = S_(), r = T(n);
													b(r, 17, () => x(z).items, (e) => e.id, (e, t) => {
														var n = g(), r = T(n);
														y(r, () => i_, (e, n) => {
															n(e, {
																get item() {
																	return x(t);
																},
																part: "option",
																children: (e, n) => {
																	var r = x_(), o = T(r);
																	a(o, () => x(t));
																	var c = E(o, 2), l = u(c), d = w(l, !0), f = E(l, 2), h = (e) => {
																		var n = b_(), r = w(n, !0);
																		s(() => p(r, x(t).email)), m(e, n);
																	};
																	i(f, (e) => {
																		x(t).email && e(h);
																	}), G(c), s(() => p(d, x(t).name)), m(e, r);
																},
																$$slots: { default: !0 }
															});
														}), m(e, n);
													});
													var o = E(r, 2);
													y(o, () => Jg, (e, t) => {
														t(e, {
															part: "empty",
															children: (e, t) => {
																L();
																var n = v();
																s(() => p(n, x(k).noResults)), m(e, n);
															},
															$$slots: { default: !0 }
														});
													}), m(e, n);
												},
												$$slots: { default: !0 }
											});
										}), m(e, n);
									},
									$$slots: { default: !0 }
								});
							}), m(t, o);
						},
						$$slots: { default: !0 }
					});
				});
			}
			G(o), m(t, o);
		},
		$$slots: { default: !0 }
	}), m(t, le), B(H);
}
_e(["click"]), H(T_, {
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
var [E_, D_] = br({ name: "PopoverContext" }), O_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function k_(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, O_), i = D_(), a = R(() => J(i().getAnchorProps(), r));
	return Y(e, z({ as: "div" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(k_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-content.svelte
var A_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function j_(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, A_), a = D_(), o = no(), s = R(() => J(a().getContentProps(), o().getPresenceProps(), r));
	function c(e) {
		o().setNode(e);
	}
	var l = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, u = g(), d = T(u), f = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			[h()]: c,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, p = R(() => !o().unmounted);
	return i(d, (e) => {
		x(p) && e(f);
	}), m(e, u), B(l);
}
H(j_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-positioner.svelte
var M_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function N_(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, M_), a = D_(), o = no(), s = R(() => J(a().getPositionerProps(), r));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, l = g(), u = T(l), d = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = R(() => !o().unmounted);
	return i(u, (e) => {
		x(f) && e(d);
	}), m(e, l), B(c);
}
H(N_, { ref: {} }, [], [], { mode: "open" });
var P_ = uc("popover").parts("arrow", "arrowTip", "anchor", "trigger", "indicator", "positioner", "content", "title", "description", "closeTrigger").build(), F_ = (e) => e.ids?.anchor ?? `popover:${e.id}:anchor`, I_ = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `popover:${e.id}:trigger:${t}` : `popover:${e.id}:trigger` : ai(n) ? n(t) : n;
}, L_ = (e) => e.ids?.content ?? `popover:${e.id}:content`, R_ = (e) => e.ids?.positioner ?? `popover:${e.id}:popper`, z_ = (e) => e.ids?.arrow ?? `popover:${e.id}:arrow`, B_ = (e) => e.ids?.title ?? `popover:${e.id}:title`, V_ = (e) => e.ids?.description ?? `popover:${e.id}:desc`, H_ = (e) => e.ids?.closeTrigger ?? `popover:${e.id}:close`, U_ = (e) => e.getById(F_(e)), W_ = (e) => e.getById(I_(e)), G_ = (e) => Zn(e.getRootNode(), `[data-scope="popover"][data-part="trigger"]${Ve(e.id)}`), K_ = (e, t) => t == null ? W_(e) ?? G_(e)[0] : e.getById(I_(e, t)), q_ = (e) => e.getById(L_(e)), J_ = (e) => e.getById(R_(e)), Y_ = (e) => e.getById(B_(e)), X_ = (e) => e.getById(V_(e)), Z_ = { closeTriggerLabel: "close" };
function Q_(e, t) {
	let { state: n, context: r, send: i, computed: a, prop: o, scope: s } = e, c = Pi(Z_, o("translations")), l = n.matches("open"), u = r.get("currentPlacement"), d = u ? Sd(u) : void 0, f = a("currentPortalled"), p = r.get("renderedElements"), m = r.get("triggerValue"), h = Vd({
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
				id: z_(s),
				...P_.arrow.attrs,
				dir: o("dir"),
				style: h.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...P_.arrowTip.attrs,
				dir: o("dir"),
				style: h.arrowTip
			});
		},
		getAnchorProps() {
			return t.element({
				...P_.anchor.attrs,
				dir: o("dir"),
				id: F_(s)
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && m === n;
			return t.button({
				...P_.trigger.attrs,
				dir: o("dir"),
				type: "button",
				"data-placement": u,
				"data-side": d,
				id: I_(s, n),
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": K(r),
				"aria-haspopup": "dialog",
				"aria-expanded": n == null ? l : l && r,
				"data-state": l ? "open" : "closed",
				"aria-controls": L_(s),
				onPointerDown(e) {
					Qt(e) && Vt() && e.currentTarget.focus();
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
				...P_.indicator.attrs,
				dir: o("dir"),
				"data-state": l ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				id: R_(s),
				...P_.positioner.attrs,
				dir: o("dir"),
				style: h.floating
			});
		},
		getContentProps() {
			return t.element({
				...P_.content.attrs,
				dir: o("dir"),
				id: L_(s),
				tabIndex: -1,
				role: "dialog",
				"aria-modal": Le(o("modal")),
				hidden: !l,
				"data-state": l ? "open" : "closed",
				"data-expanded": K(l),
				"aria-labelledby": p.title ? B_(s) : void 0,
				"aria-describedby": p.description ? V_(s) : void 0,
				"data-placement": u,
				"data-side": d
			});
		},
		getTitleProps() {
			return t.element({
				...P_.title.attrs,
				id: B_(s),
				dir: o("dir")
			});
		},
		getDescriptionProps() {
			return t.element({
				...P_.description.attrs,
				id: V_(s),
				dir: o("dir")
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...P_.closeTrigger.attrs,
				dir: o("dir"),
				id: H_(s),
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
var $_ = ba({
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
						triggerElement: K_(n, e)
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
				let r = U_(n);
				return zd(() => r ?? K_(n, e.get("triggerValue")), () => J_(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackDismissableElement({ send: e, prop: t, scope: n }) {
				let r = () => q_(n), i = !0;
				return vl(r, {
					type: "popover",
					pointerBlocking: t("modal"),
					exclude: [W_(n), ...G_(n)].filter(Boolean),
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
				return e("modal") || !e("portalled") ? void 0 : Xn(() => q_(t), {
					triggerElement: K_(t, n.get("triggerValue")),
					defer: !0,
					getShadowRoot: !0,
					onFocus(e) {
						e.focus({ preventScroll: !0 });
					}
				});
			},
			hideContentBelow({ prop: e, scope: t, context: n }) {
				return e("modal") ? Uc(() => [q_(t), K_(t, n.get("triggerValue"))], { defer: !0 }) : void 0;
			},
			preventScroll({ prop: e, scope: t }) {
				if (e("modal")) return Bl(t.getDoc());
			},
			trapFocus({ prop: e, scope: t, context: n }) {
				return e("modal") ? Nl(() => q_(t), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!e("restoreFocus"),
					initialFocus: () => On({
						root: q_(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					}),
					setReturnFocus: (r) => {
						let i = e("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let e = K_(t, a);
							if (e) return e;
						}
						return G_(t)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			}
		},
		actions: {
			reposition({ event: e, prop: t, scope: n, context: r }) {
				let i = U_(n);
				zd(() => i ?? K_(n, r.get("triggerValue")), () => J_(n), {
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
						title: !!Y_(t),
						description: !!X_(t)
					});
				});
			},
			setInitialFocus({ prop: e, scope: t }) {
				e("modal") || q(() => {
					On({
						root: q_(t),
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
					K_(n, r.get("triggerValue"))?.focus({ preventScroll: !0 });
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
}), ev = (e) => {
	let t = Sr(), n = po(), r = R(() => {
		let r = hi(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = za($_, () => x(r)), a = R(() => Q_(i, ja));
	return () => x(a);
}, tv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function nv(e, t) {
	let n = f();
	U(t, !0);
	let r = F(t, "open", 15), i = F(t, "children", 7), a = O(t, tv), o = R(() => eo(a)), s = R(() => V(x(o), 2)), c = R(() => x(s)[0]), l = R(() => x(s)[1]), u = R(() => ({
		...x(l),
		id: x(l).id ?? n,
		open: r(),
		onOpenChange(e) {
			x(l).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), d = ev(() => x(u)), p = R(() => ({
		...x(c),
		present: d().open
	})), h = $a(() => x(p));
	E_(d), to(h);
	var _ = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), W();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), W();
		}
	}, v = g(), y = T(v);
	return I(y, () => i() ?? P), m(e, v), B(_);
}
H(nv, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-trigger.svelte
var rv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function iv(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, rv), i = R(() => Er()(r, ["value"])), a = R(() => V(x(i), 2)), o = R(() => x(a)[0]), s = R(() => x(a)[1]), c = D_(), l = no(), u = R(() => {
		let e = c().getTriggerProps(x(o));
		return J({
			...e,
			"aria-controls": l().unmounted ? void 0 : e["aria-controls"]
		}, x(s));
	});
	return Y(e, z({ as: "button" }, () => x(u), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(iv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Popover.svelte
var av = o("<!> <!>", 1), ov = o("<div class=\"af-kit\"><!></div>"), sv = {
	hash: "svelte-1netzpl",
	code: "[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='anchor'] {display:inline-block;}[data-scope='popover'][data-part='content'] {padding:8px;}[data-scope='popover'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}"
};
function cv(t, n) {
	U(n, !0), ee(t, sv);
	let i = F(n, "open", 7, !1), a = F(n, "placement", 7, "bottom-start"), o = n.$$host, s = M(null), c = "outside";
	d(() => Xl(x(s), !!i(), o));
	var l = {
		get open() {
			return i();
		},
		set open(e = !1) {
			i(e), W();
		},
		get placement() {
			return a();
		},
		set placement(e = "bottom-start") {
			a(e), W();
		}
	}, f = av(), p = T(f);
	return Jl(p, {}), Tr(E(p, 2), {
		value: () => o.shadowRoot,
		children: (t, l) => {
			var d = ov(), f = u(d);
			{
				let t = R(() => !!i()), l = R(() => ({
					strategy: "fixed",
					placement: a() || "bottom-start"
				}));
				y(f, () => nv, (i, a) => {
					a(i, {
						get open() {
							return x(t);
						},
						closeOnEscape: !0,
						portalled: !1,
						get positioning() {
							return x(l);
						},
						onEscapeKeyDown: () => c = "escape",
						onInteractOutside: () => c = "outside",
						onOpenChange: (e) => {
							e.open || (Yl(o, "close", { reason: c }), c = "outside");
						},
						children: (t, i) => {
							var a = av(), o = T(a);
							y(o, () => k_, (e, t) => {
								t(e, {
									part: "anchor",
									children: (e, t) => {
										var i = g(), a = T(i);
										r(a, n, "anchor", {}, null), m(e, i);
									},
									$$slots: { default: !0 }
								});
							});
							var c = E(o, 2);
							y(c, () => N_, (t, i) => {
								i(t, {
									popover: "manual",
									get ref() {
										return x(s);
									},
									set ref(t) {
										e(s, t, !0);
									},
									children: (e, t) => {
										var i = g(), a = T(i);
										y(a, () => j_, (e, t) => {
											t(e, {
												class: "af-overlay popover",
												part: "content",
												children: (e, t) => {
													var i = g(), a = T(i);
													r(a, n, "content", {}, null), m(e, i);
												},
												$$slots: { default: !0 }
											});
										}), m(e, i);
									},
									$$slots: { default: !0 }
								});
							}), m(t, a);
						},
						$$slots: { default: !0 }
					});
				});
			}
			G(d), m(t, d);
		},
		$$slots: { default: !0 }
	}), m(t, f), B(l);
}
H(cv, {
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
var lv = l("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5\"></path><path d=\"M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5\"></path></svg>"), uv = o("<form class=\"link-form svelte-9gj0md\" novalidate=\"\"><input part=\"link-input\" type=\"url\" inputmode=\"url\" placeholder=\"https://\" class=\"svelte-9gj0md\"/> <button type=\"submit\" class=\"af-button primary\" part=\"link-apply\"> </button></form>"), dv = o("<!> <!>", 1), fv = o("<div part=\"toolbar\" class=\"toolbar svelte-9gj0md\"><button type=\"button\" part=\"tool-bold\" class=\"tool svelte-9gj0md\"><b>B</b></button> <button type=\"button\" part=\"tool-italic\" class=\"tool svelte-9gj0md\"><i>I</i></button> <button type=\"button\" part=\"tool-bullet-list\" class=\"tool svelte-9gj0md\">•</button> <button type=\"button\" part=\"tool-numbered-list\" class=\"tool svelte-9gj0md\">1.</button> <!></div>"), pv = o("<span part=\"placeholder\" class=\"placeholder svelte-9gj0md\" aria-hidden=\"true\"> </span>"), mv = o("<div class=\"mention-empty svelte-9gj0md\"> </div>"), hv = o("<div class=\"mention-title svelte-9gj0md\" part=\"mention-title\" aria-hidden=\"true\"> </div>"), gv = o("<div class=\"mention-scope svelte-9gj0md\" part=\"mention-scope\" role=\"option\" tabindex=\"-1\" data-kind=\"scope\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" class=\"svelte-9gj0md\"><circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-3.5-3.5\"></path></svg> <span class=\"mention-name svelte-9gj0md\"> </span></div>"), _v = o("<div class=\"mention-scopes svelte-9gj0md\"></div>"), vv = o("<span class=\"mention-name svelte-9gj0md\"> </span>"), yv = o("<span class=\"mention-meta svelte-9gj0md\"> </span>"), bv = o("<span class=\"mention-meta mention-side svelte-9gj0md\"> </span>"), xv = o("<span class=\"af-avatar mention-avatar svelte-9gj0md\" aria-hidden=\"true\"> </span> <span class=\"mention-text svelte-9gj0md\"><span class=\"mention-name svelte-9gj0md\"> </span> <!></span> <!>", 1), Sv = o("<div class=\"mention-option svelte-9gj0md\" part=\"mention-option\" role=\"option\" tabindex=\"-1\"><!></div>"), Cv = o("<div class=\"mention-group\" role=\"group\"><!> <!></div>"), wv = o("<div class=\"af-kit editor svelte-9gj0md\"><!> <div class=\"surface svelte-9gj0md\"><!> <div part=\"content\" class=\"content svelte-9gj0md\"></div></div> <div part=\"mention-menu\" class=\"af-overlay mention-menu svelte-9gj0md\" popover=\"manual\" role=\"listbox\"><!> <!></div></div>"), Tv = {
	hash: "svelte-9gj0md",
	code: ".editor.svelte-9gj0md {display:flex;flex-direction:column;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);}.editor.svelte-9gj0md:focus-within {outline:2px solid var(--k-ring);outline-offset:1px;}.editor[data-readonly].svelte-9gj0md {border-color:transparent;background:transparent;}.toolbar.svelte-9gj0md {display:flex;gap:2px;padding:4px;border-bottom:1px solid var(--k-line);}.tool.svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool {min-width:28px;height:28px;padding:0 6px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;cursor:pointer;}.tool.svelte-9gj0md:not(:disabled):hover, [data-scope='popover'][data-part='trigger'].tool:hover {background:color-mix(in oklab, var(--k-fg) 6%, transparent);}.tool.svelte-9gj0md:not(:disabled):active {background:color-mix(in oklab, var(--k-fg) 10%, transparent);}.tool[aria-pressed='true'].svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool[aria-pressed='true'] {background:color-mix(in oklab, var(--k-primary) 14%, transparent);}.tool.svelte-9gj0md:disabled {opacity:0.55;cursor:default;}.tool.svelte-9gj0md:focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}.surface.svelte-9gj0md {position:relative;}.placeholder.svelte-9gj0md {position:absolute;inset:8px 12px auto;color:var(--k-muted);pointer-events:none;}.content.svelte-9gj0md > [contenteditable] {min-height:4.5em;padding:8px 12px;outline:none;white-space:pre-wrap;word-wrap:break-word;font-variant-ligatures:none;}.editor[data-readonly].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:0;}.content.svelte-9gj0md p {margin:0 0 0.5em;}.content.svelte-9gj0md > [contenteditable] > :last-child {margin-bottom:0;}.content.svelte-9gj0md ul, .content.svelte-9gj0md ol {margin:0 0 0.5em;padding-left:1.5em;}.content.svelte-9gj0md a {color:var(--k-primary);}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:4px 8px;white-space:nowrap;overflow:hidden;}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) p {margin:0;}.content.svelte-9gj0md .af-mention-holder {display:inline;}.content.svelte-9gj0md .af-mention {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:baseline;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;line-height:1.5;}.content.svelte-9gj0md .af-mention[data-state='restricted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] .af-mention-label {text-decoration:line-through;}.content.svelte-9gj0md .af-mention-link {color:inherit;text-decoration:none;}.content.svelte-9gj0md .af-mention-link:hover {text-decoration:underline;}.content.svelte-9gj0md .af-mention-avatar {width:16px;height:16px;font-size:10px;}.content.svelte-9gj0md table {border-collapse:collapse;}.content.svelte-9gj0md th, .content.svelte-9gj0md td {border:1px solid var(--k-line);padding:4px 8px;}.content.svelte-9gj0md ul[data-type='taskList'] {list-style:none;padding-left:0.25em;}.content.svelte-9gj0md ul[data-type='taskList'] li {display:flex;gap:6px;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}.mention-menu.svelte-9gj0md {position:fixed;inset:auto;margin:0;padding:4px;min-width:240px;max-width:360px;max-height:320px;overflow:auto;}.mention-title.svelte-9gj0md {padding:6px 8px 2px;color:var(--k-muted);font-size:12px;font-weight:600;}.mention-option.svelte-9gj0md {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}.mention-option[aria-selected='true'].svelte-9gj0md {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.mention-avatar.svelte-9gj0md {flex:none;width:24px;height:24px;font-size:12px;}.mention-text.svelte-9gj0md {display:flex;flex-direction:column;min-width:0;flex:1;}.mention-name.svelte-9gj0md {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.mention-meta.svelte-9gj0md {color:var(--k-muted);font-size:12px;}.mention-side.svelte-9gj0md {flex:none;}.mention-empty.svelte-9gj0md {padding:8px;color:var(--k-muted);}.mention-scopes.svelte-9gj0md {display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px 6px;}.mention-scope.svelte-9gj0md {display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border:1px solid var(--k-line);border-radius:999px;color:var(--k-fg);font-size:12px;cursor:pointer;}.mention-scope.svelte-9gj0md svg:where(.svelte-9gj0md) {flex:none;color:var(--k-muted);}.mention-scope[aria-selected='true'].svelte-9gj0md {border-color:var(--k-primary);background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.link-form.svelte-9gj0md {display:flex;gap:6px;padding:8px;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md) {min-width:240px;min-height:32px;padding:0 8px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-bg);color:var(--k-fg);font:inherit;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}"
};
function Ev(t, r) {
	U(r, !0), ee(t, Tv);
	let a = F(r, "value", 7, ""), o = F(r, "readonly", 7, !1), c = F(r, "placeholder", 7, null), l = F(r, "label", 7, null), f = F(r, "locale", 7, null), h = F(r, "strings", 7, null), v = F(r, "mentions", 7, null), D = F(r, "singleLine", 7, !1), O = F(r, "mentionMap", 7, null), k = r.$$host, A = R(() => ru(f(), h() ?? void 0)), j = M(null), P = M(null), ne = M(!0), I = M(_({
		bold: !1,
		italic: !1,
		bulletList: !1,
		orderedList: !1,
		link: !1
	})), re = M(!1), L = M(""), ae = M(null);
	d(() => Xl(x(ae), x(re), k));
	let oe = null, z = null, se = M(null), V = M(0), ce = M(null), H = `af-mention-${Math.random().toString(36).slice(2, 9)}`;
	d(() => Xl(x(ce), x(se) !== null, k)), d(() => {
		let e = x(se)?.rect?.();
		x(ce) && e && (x(ce).style.left = `${Math.max(0, e.left)}px`, x(ce).style.top = `${e.bottom + 4}px`);
	});
	let le = R(() => {
		let e = [];
		return (x(se)?.entries ?? []).forEach((t, n) => {
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
	async function de(t) {
		let n = x(se);
		if (!n) return;
		if (t.kind === "item") {
			n.command(t);
			return;
		}
		let r = v(), i = Ce(t);
		if (!r || !i) return;
		let a = await r(n.query, i);
		if (x(se) !== n) return;
		let o = z?.(a) ?? [];
		e(se, {
			...n,
			entries: o
		}), e(V, 0);
	}
	let fe = (e) => e.some((e) => e.kind !== "scope"), pe = (e) => !fe(e.entries) && /\s/.test(e.query.trim()), me = {
		show(t) {
			e(se, pe(t) ? null : t), e(V, 0);
		},
		update(t) {
			e(se, pe(t) ? null : t), e(V, 0);
		},
		hide() {
			e(se, null);
		},
		key(t) {
			let n = x(se);
			if (!n) return !1;
			let r = n.entries.length;
			if (t.key === "Escape") return x(P) && oe?.(x(P).view), e(se, null), !0;
			if (r === 0) return !1;
			if (t.key === "ArrowDown") return e(V, (x(V) + 1) % r), !0;
			if (t.key === "ArrowUp") return e(V, (x(V) - 1 + r) % r), !0;
			if (t.key === "Enter" || t.key === "Tab") {
				let e = n.entries[x(V)];
				return e && de(e), !0;
			}
			return !1;
		}
	};
	d(() => {
		let e = x(P)?.view.dom;
		if (e) {
			if (x(se)) e.setAttribute("aria-haspopup", "listbox"), e.setAttribute("aria-expanded", "true"), e.setAttribute("aria-controls", H), x(se).entries.length > 0 ? e.setAttribute("aria-activedescendant", `${H}-${x(V)}`) : e.removeAttribute("aria-activedescendant");
			else for (let t of [
				"aria-expanded",
				"aria-controls",
				"aria-activedescendant"
			]) e.removeAttribute(t);
		}
	}), d(() => {
		x(P) && Ee(x(P), {
			map: O() ?? null,
			strings: x(A)
		});
	});
	let he, ge = null, _e = !1, ve = !1, ye = (e) => e.getMarkdown().replace(/\u00A0+$/gm, "").trimEnd();
	function be() {
		if (clearTimeout(he), he = void 0, !x(P) || !_e) return;
		_e = !1;
		let e = ye(x(P));
		e !== (a() ?? "") && e !== ge && (ge = e, Yl(k, "change", { value: e }));
	}
	function xe(e, t) {
		ve = !1, ye(e) !== t && (e.commands.setContent(t, {
			contentType: "markdown",
			emitUpdate: !1
		}), _e = !1, ge = null);
	}
	function Se(t) {
		e(ne, t.isEmpty, !0), e(I, {
			bold: t.isActive("bold"),
			italic: t.isActive("italic"),
			bulletList: t.isActive("bulletList"),
			orderedList: t.isActive("orderedList"),
			link: t.isActive("link")
		}, !0);
	}
	d(() => {
		let t = x(j);
		if (!t) return;
		let n = !!D(), r = !1, i = null;
		return import("./chunks/markdown-Dbjns2wm.js").then(({ createMarkdownEditor: s, exitSuggestion: c, flatten: l }) => {
			if (r) return;
			oe = c, z = l;
			let u = s({
				element: t,
				content: C(() => a() ?? ""),
				editable: C(() => !o()),
				singleLine: n,
				mention: {
					source: () => C(() => v()),
					controller: me,
					strings: () => C(() => x(A))
				},
				onUpdate() {
					_e = !0, clearTimeout(he), he = setTimeout(be, 600);
				},
				onBlur() {
					be(), ve && xe(u, a() ?? "");
				},
				onFocus() {}
			});
			Ee(u, {
				map: C(() => O() ?? null),
				strings: C(() => x(A))
			}), u.on("transaction", () => Se(u)), i = u, Se(u), e(P, u), k.editor = u;
		}), () => {
			r = !0, e(se, null), be(), i?.destroy(), k.editor === i && (k.editor = null), e(P, null);
		};
	}), d(() => {
		let e = a() ?? "", t = x(P);
		t && C(() => {
			t.isFocused ? ve = !0 : xe(t, e);
		});
	}), d(() => {
		let e = x(P)?.view.dom;
		e && (l() ? e.setAttribute("aria-label", l()) : e.removeAttribute("aria-label"));
	}), d(() => {
		let e = !o();
		x(P) && x(P).isEditable !== e && x(P).setEditable(e, !1);
	});
	function we(t) {
		t && x(P) && e(L, x(P).getAttributes("link").href ?? "", !0), e(re, t, !0);
	}
	function Te() {
		if (!x(P)) return;
		let t = x(L).trim(), n = x(P).chain().focus().extendMarkRange("link");
		t ? x(P).state.selection.empty && !x(P).isActive("link") ? n.insertContent({
			type: "text",
			text: t,
			marks: [{
				type: "link",
				attrs: { href: t }
			}]
		}).run() : n.setLink({ href: t }).run() : n.unsetLink().run(), e(re, !1);
	}
	let De = (e) => e.preventDefault();
	var Oe = {
		get value() {
			return a();
		},
		set value(e = "") {
			a(e), W();
		},
		get readonly() {
			return o();
		},
		set readonly(e = !1) {
			o(e), W();
		},
		get placeholder() {
			return c();
		},
		set placeholder(e = null) {
			c(e), W();
		},
		get label() {
			return l();
		},
		set label(e = null) {
			l(e), W();
		},
		get locale() {
			return f();
		},
		set locale(e = null) {
			f(e), W();
		},
		get strings() {
			return h();
		},
		set strings(e = null) {
			h(e), W();
		},
		get mentions() {
			return v();
		},
		set mentions(e = null) {
			v(e), W();
		},
		get singleLine() {
			return D();
		},
		set singleLine(e = !1) {
			D(e), W();
		},
		get mentionMap() {
			return O();
		},
		set mentionMap(e = null) {
			O(e), W();
		}
	}, ke = dv(), Ae = T(ke);
	return Jl(Ae, {}), Tr(E(Ae, 2), {
		value: () => k.shadowRoot,
		children: (t, r) => {
			var a = wv(), l = u(a), d = (t) => {
				var r = fv(), i = u(r), a = E(i, 2), o = E(a, 2), c = E(o, 2), l = E(c, 2);
				y(l, () => nv, (t, n) => {
					n(t, {
						get open() {
							return x(re);
						},
						portalled: !1,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						onOpenChange: (e) => we(e.open),
						children: (t, n) => {
							var r = dv(), i = T(r);
							{
								let e = R(() => !x(P));
								y(i, () => iv, (t, n) => {
									n(t, {
										part: "tool-link",
										class: "tool",
										get "aria-label"() {
											return x(A).link;
										},
										get title() {
											return x(A).link;
										},
										get "aria-pressed"() {
											return x(I).link;
										},
										get disabled() {
											return x(e);
										},
										children: (e, t) => {
											var n = lv();
											m(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var a = E(i, 2);
							y(a, () => N_, (t, n) => {
								n(t, {
									popover: "manual",
									get ref() {
										return x(ae);
									},
									set ref(t) {
										e(ae, t, !0);
									},
									children: (t, n) => {
										var r = g(), i = T(r);
										y(i, () => j_, (t, n) => {
											n(t, {
												class: "af-overlay link",
												part: "link-popover",
												children: (t, n) => {
													var r = uv(), i = u(r);
													te(i);
													var a = E(i, 2), o = w(a, !0);
													G(r), s(() => {
														N(i, "aria-label", x(A).link), p(o, x(A).confirm);
													}), S("submit", r, (e) => {
														e.preventDefault(), Te();
													}), ie(i, () => x(L), (t) => e(L, t)), m(t, r);
												},
												$$slots: { default: !0 }
											});
										}), m(t, r);
									},
									$$slots: { default: !0 }
								});
							}), m(t, r);
						},
						$$slots: { default: !0 }
					});
				}), G(r), s(() => {
					N(i, "aria-label", x(A).bold), N(i, "title", x(A).bold), N(i, "aria-pressed", x(I).bold), i.disabled = !x(P), N(a, "aria-label", x(A).italic), N(a, "title", x(A).italic), N(a, "aria-pressed", x(I).italic), a.disabled = !x(P), N(o, "aria-label", x(A).bulletList), N(o, "title", x(A).bulletList), N(o, "aria-pressed", x(I).bulletList), o.disabled = !x(P), N(c, "aria-label", x(A).numberedList), N(c, "title", x(A).numberedList), N(c, "aria-pressed", x(I).orderedList), c.disabled = !x(P);
				}), n("mousedown", i, De), n("click", i, () => x(P)?.chain().focus().toggleBold().run()), n("mousedown", a, De), n("click", a, () => x(P)?.chain().focus().toggleItalic().run()), n("mousedown", o, De), n("click", o, () => x(P)?.chain().focus().toggleBulletList().run()), n("mousedown", c, De), n("click", c, () => x(P)?.chain().focus().toggleOrderedList().run()), m(t, r);
			};
			i(l, (e) => {
				!o() && !D() && e(d);
			});
			var f = E(l, 2), h = u(f), _ = (e) => {
				var t = pv(), n = w(t, !0);
				s(() => p(n, c())), m(e, t);
			};
			i(h, (e) => {
				x(ne) && c() && e(_);
			});
			var v = E(h, 2);
			ue(v, (t) => e(j, t), () => x(j)), G(f);
			var C = E(f, 2), O = u(C), k = (e) => {
				var t = mv(), n = w(t, !0);
				s(() => p(n, x(A).noResults)), m(e, t);
			}, ee = R(() => !fe(x(se)?.entries ?? []));
			i(O, (e) => {
				x(ee) && e(k);
			});
			var M = E(O, 2);
			b(M, 17, () => x(le), (e) => e.key + e.title, (t, r) => {
				var a = Cv(), o = u(a), c = (e) => {
					var t = hv(), n = w(t, !0);
					s(() => p(n, x(r).title)), m(e, t);
				};
				i(o, (e) => {
					x(r).title && e(c);
				});
				var l = E(o, 2), d = (t) => {
					var i = _v();
					b(i, 21, () => x(r).rows, ({ entry: e, at: t }) => t, (t, r) => {
						let i = () => x(r).entry, a = () => x(r).at;
						var o = gv(), c = E(u(o), 2), l = w(c, !0);
						G(o), s(() => {
							N(o, "id", `${H}-${a() ?? ""}`), N(o, "aria-selected", a() === x(V)), N(o, "data-picked", a() === x(V) ? "" : void 0), N(o, "data-group", i().scope?.group), p(l, i().scope?.label);
						}), n("mousedown", o, (e) => e.preventDefault()), S("mouseenter", o, () => e(V, a(), !0)), n("click", o, () => void de(i())), n("keydown", o, () => {}), m(t, o);
					}), G(i), m(t, i);
				}, f = R(() => x(r).rows.every(({ entry: e }) => e.kind === "scope")), h = (t) => {
					var a = g(), o = T(a);
					b(o, 17, () => x(r).rows, ({ entry: e, at: t }) => t, (t, r) => {
						let a = () => x(r).entry, o = () => x(r).at;
						var c = Sv(), l = u(c), d = (e) => {
							var t = vv(), n = w(t, !0);
							s(() => p(n, a().more?.label)), m(e, t);
						}, f = (e) => {
							var t = xv(), n = T(t), r = w(n, !0), o = E(n, 2), c = u(o), l = w(c, !0), d = E(c, 2), f = (e) => {
								var t = yv(), n = w(t, !0);
								s(() => p(n, a().item.entity_label)), m(e, t);
							};
							i(d, (e) => {
								a().item.entity_label && e(f);
							}), G(o);
							var h = E(o, 2), g = (e) => {
								var t = bv(), n = w(t, !0);
								s(() => p(n, a().item.meta)), m(e, t);
							};
							i(h, (e) => {
								a().item.meta && e(g);
							}), s((e) => {
								p(r, e), p(l, a().item.label);
							}, [() => Array.from(a().item.label.trim())[0]?.toUpperCase() ?? "?"]), m(e, t);
						};
						i(l, (e) => {
							a().kind === "more" ? e(d) : a().item && e(f, 1);
						}), G(c), s(() => {
							N(c, "id", `${H}-${o() ?? ""}`), N(c, "aria-selected", o() === x(V)), N(c, "data-picked", o() === x(V) ? "" : void 0), N(c, "data-kind", a().kind);
						}), n("mousedown", c, (e) => e.preventDefault()), S("mouseenter", c, () => e(V, o(), !0)), n("click", c, () => void de(a())), n("keydown", c, () => {}), m(t, c);
					}), m(t, a);
				};
				i(l, (e) => {
					x(f) ? e(d) : e(h, -1);
				}), G(a), s(() => N(a, "aria-label", x(r).title)), m(t, a);
			}), G(C), ue(C, (t) => e(ce, t), () => x(ce)), G(a), s(() => {
				N(a, "data-readonly", o() ? "" : void 0), N(a, "data-single-line", D() ? "" : void 0), N(C, "id", H), N(C, "aria-label", x(A).mentionMenu);
			}), m(t, a);
		},
		$$slots: { default: !0 }
	}), m(t, ke), B(Oe);
}
_e([
	"mousedown",
	"click",
	"keydown"
]), H(Ev, {
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
var Dv = uc("toast").parts("group", "root", "title", "description", "actionTrigger", "closeTrigger").build(), Ov = (e) => `toast-group:${e}`, kv = (e, t) => e.getById(`toast-group:${t}`), Av = (e) => `toast:${e.id}`, jv = (e) => e.getById(Av(e)), Mv = (e) => `toast:${e.id}:title`, Nv = (e) => `toast:${e.id}:description`, Pv = (e) => `toast${e.id}:close`, Fv = {
	info: 5e3,
	error: 5e3,
	success: 2e3,
	loading: Infinity,
	warning: 5e3,
	DEFAULT: 5e3
};
function Iv(e, t) {
	return e ?? Fv[t] ?? Fv.DEFAULT;
}
var Lv = (e) => typeof e == "string" ? {
	left: e,
	right: e,
	bottom: e,
	top: e
} : e;
function Rv(e, t) {
	let { prop: n, computed: r, context: i } = e, { offsets: a, gap: o } = n("store").attrs, s = i.get("heights"), c = Lv(a), l = n("dir") === "rtl", u = t.replace("-start", l ? "-right" : "-left").replace("-end", l ? "-left" : "-right"), d = u.includes("right"), f = u.includes("left"), p = {
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
		zIndex: Ie
	}, m = "center";
	return d && (m = "flex-end"), f && (m = "flex-start"), p.alignItems = m, u.includes("top") && (p.top = `max(env(safe-area-inset-top, 0px), ${c.top})`), u.includes("bottom") && (p.bottom = `max(env(safe-area-inset-bottom, 0px), ${c.bottom})`), u.includes("left") || (p.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${c.right})`), u.includes("right") || (p.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${c.left})`), p;
}
function zv(e, t) {
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
function Bv(e, t) {
	let { computed: n } = e, r = {
		position: "absolute",
		inset: "0",
		scale: "1 2",
		pointerEvents: t ? "none" : "auto"
	};
	return n("frontmost") && !t && ((e) => Object.assign(r, e))({ height: "calc(var(--initial-height) + 80%)" }), r;
}
function Vv() {
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
function Hv(e, t) {
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
				...Dv.group.attrs,
				dir: r("dir"),
				tabIndex: -1,
				role: "region",
				"aria-label": `${s}, ${u} (${l})`,
				id: Ov(u),
				"data-placement": u,
				"data-side": d,
				"data-align": f,
				"aria-live": "polite",
				"aria-relevant": "additions text",
				"aria-atomic": "false",
				style: Rv(e, u),
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
					a.get("isFocusWithin") && !it(e.currentTarget, e.relatedTarget) && queueMicrotask(() => i({ type: "REGION.BLUR" }));
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
var { guards: Uv, createMachine: Wv } = xa(), { and: Gv } = Uv, Kv = Wv({
	props({ props: e }) {
		return {
			dir: "ltr",
			id: bi(),
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
			ignoreMouseTimer: An.create(),
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
				guard: Gv("isOverlapping", "isPointerOut"),
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
				return cn(document, "keydown", (n) => {
					let { hotkey: r } = e("store").attrs;
					r.every((e) => n[e] || n.code === e) && t({ type: "DOC.HOTKEY" });
				}, { capture: !0 });
			},
			trackDocumentVisibility({ prop: e, send: t, scope: n }) {
				let { pauseOnPageIdle: r } = e("store").attrs;
				if (!r) return;
				let i = n.getDoc();
				return cn(i, "visibilitychange", () => {
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
				let s = yl(() => kv(r, a), { defer: !0 });
				e.set("dismissableCleanup", s);
			},
			clearDismissableBranch({ refs: e }) {
				e.get("dismissableCleanup")?.();
			},
			focusRegionEl({ scope: e, computed: t }) {
				queueMicrotask(() => {
					kv(e, t("placement"))?.focus();
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
}), qv = { closeTriggerLabel: "Dismiss notification" };
function Jv(e, t) {
	let { state: n, send: r, prop: i, scope: a, context: o, computed: s } = e, c = Pi(qv, i("translations")), l = n.hasTag("visible"), u = n.hasTag("paused"), d = o.get("mounted"), f = s("frontmost"), p = i("parent").computed("placement"), m = i("type"), h = i("stacked"), g = i("title"), _ = i("description"), v = i("action"), [y, b = "center"] = p.split("-");
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
				...Dv.root.attrs,
				dir: i("dir"),
				id: Av(a),
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
				"aria-describedby": _ ? Nv(a) : void 0,
				"aria-labelledby": g ? Mv(a) : void 0,
				tabIndex: 0,
				style: zv(e, l),
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
				style: Bv(e, l)
			});
		},
		getGhostAfterProps() {
			return t.element({
				"data-ghost": "after",
				style: Vv()
			});
		},
		getTitleProps() {
			return t.element({
				...Dv.title.attrs,
				id: Mv(a)
			});
		},
		getDescriptionProps() {
			return t.element({
				...Dv.description.attrs,
				id: Nv(a)
			});
		},
		getActionTriggerProps() {
			return t.button({
				...Dv.actionTrigger.attrs,
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
				id: Pv(a),
				...Dv.closeTrigger.attrs,
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
var { not: Yv } = ya(), Xv = ba({
	props({ props: e }) {
		return Ui(e, [
			"id",
			"type",
			"parent",
			"removeDelay"
		], "toast"), {
			closable: !0,
			...e,
			duration: Iv(e.duration, e.type)
		};
	},
	initialState({ prop: e }) {
		return e("type") === "loading" || e("duration") === Infinity ? "visible:persist" : "visible";
	},
	context({ prop: e, bindable: t }) {
		return {
			remainingTime: t(() => ({ defaultValue: Iv(e("duration"), e("type")) })),
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
					guard: Yv("isLoadingType"),
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
				return zi(() => {
					t({
						type: "REMOVE",
						src: "timer"
					});
				}, e("removeDelay"));
			},
			waitForDuration({ send: e, context: t, computed: n }) {
				if (!n("shouldPersist")) return zi(() => {
					e({
						type: "DISMISS",
						src: "timer"
					});
				}, t.get("remainingTime"));
			},
			waitForNextTick({ send: e }) {
				return zi(() => {
					e({
						type: "SHOW",
						src: "timer"
					});
				}, 0);
			},
			trackHeight({ scope: e, prop: t }) {
				let n;
				return q(() => {
					let r = jv(e);
					if (!r) return;
					let i = new (e.getWin()).MutationObserver(() => {
						let e = Zv(r), n = {
							id: t("id"),
							height: e
						};
						Qv(t("parent"), n);
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
					let r = jv(e);
					if (!r) return;
					let i = Zv(r);
					n.set("initialHeight", i);
					let a = {
						id: t("id"),
						height: i
					};
					Qv(t("parent"), a);
				});
			},
			setCloseTimer({ refs: e }) {
				e.set("closeTimerStartTime", Date.now());
			},
			resetCloseTimer({ context: e, refs: t, prop: n }) {
				t.set("closeTimerStartTime", Date.now()), e.set("remainingTime", Iv(n("duration"), n("type")));
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
function Zv(e) {
	let t = e.style.height;
	e.style.height = "auto";
	let n = e.offsetHeight;
	return e.style.height = t, n;
}
function Qv(e, t) {
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
var $v = (e, t) => ({
	...t,
	...Ni(e)
}), ey = {
	error: [1, 2],
	warning: [3, 6],
	loading: [4, 5],
	success: [5, 7],
	info: [6, 8]
}, ty = "info", ny = (e, t) => {
	let [n, r] = ey[e ?? ty];
	return t ? n : r;
}, ry = (e) => e.sort((e, t) => (e.priority ?? ny(e.type, !!e.action)) - (t.priority ?? ny(t.type, !!t.action)));
function iy(e = {}) {
	let t = $v(e, {
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
		for (a = ry(a); a.length > 0 && r.length < t.max;) {
			let e = a.shift();
			e && (s(e), r.unshift(e));
		}
	}, u = (e) => {
		let n = e.id ?? `toast:${bi()}`, a = r.find((e) => e.id === n);
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
				type: ty,
				...e,
				stacked: !t.overlap,
				gap: t.gap
			}, i = r.priority ?? ny(r.type, !!r.action);
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
				Bi("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified");
				return;
			}
			let r = u({
				...n,
				...t.loading,
				promise: e,
				type: "loading"
			}), i = !0, a, o = hi(e).then(async (e) => {
				if (a = ["resolve", e], ay(e) && !e.ok) {
					i = !1;
					let a = hi(t.error, `HTTP Error! status: ${e.status}`);
					u({
						...n,
						...a,
						id: r,
						type: "error"
					});
				} else if (t.success !== void 0) {
					i = !1;
					let a = hi(t.success, e);
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
					let a = hi(t.error, e);
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
var ay = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", oy = {
	connect: Hv,
	machine: Kv
}, sy = (e) => iy(e), [cy, ly] = br({
	name: "ToastContext",
	hookName: "useToastContext",
	providerName: "<ToastProvider />"
}), uy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function dy(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, uy), i = ly(), a = R(() => J(i().getActionTriggerProps(), r));
	return Y(e, z({ as: "button" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(dy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-close-trigger.svelte
var fy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function py(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, fy), i = ly(), a = R(() => J(i().getCloseTriggerProps(), r));
	return Y(e, z({ as: "button" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(py, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-description.svelte
var my = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function hy(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, my), i = ly(), a = R(() => J(i().getDescriptionProps(), r));
	return Y(e, z({ as: "div" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(hy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-root.svelte
var gy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), _y = o("<div></div> <!> <div></div>", 1);
function vy(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, gy), i = ly(), a = R(() => J(i().getRootProps(), r));
	return Y(e, z({ as: "div" }, () => x(a), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		},
		children: (e, n) => {
			var r = _y(), a = T(r);
			fe(a, (e) => ({ ...e }), [() => i().getGhostBeforeProps()]);
			var o = E(a, 2);
			I(o, () => t.children ?? P);
			var s = E(o, 2);
			fe(s, (e) => ({ ...e }), [() => i().getGhostAfterProps()]), m(e, r);
		},
		$$slots: { default: !0 }
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(vy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster-item.svelte
function yy(e, t) {
	U(t, !0);
	let n = F(t, "children", 7), r = F(t, "value", 7), i = F(t, "parent", 7), a = F(t, "index", 7), o = Sr(), s = R(() => ({
		...r()(),
		parent: i(),
		index: a(),
		getRootNode: o().getRootNode
	})), c = za(Xv, () => x(s)), l = R(() => Jv(c, ja));
	cy(() => x(l));
	var u = {
		get children() {
			return n();
		},
		set children(e) {
			n(e), W();
		},
		get value() {
			return r();
		},
		set value(e) {
			r(e), W();
		},
		get parent() {
			return i();
		},
		set parent(e) {
			i(e), W();
		},
		get index() {
			return a();
		},
		set index(e) {
			a(e), W();
		}
	}, d = g(), f = T(d);
	return I(f, n, r), m(e, d), B(u);
}
H(yy, {
	children: {},
	value: {},
	parent: {},
	index: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster.svelte
var by = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"toaster",
	"children"
]);
function xy(e, t) {
	let n = f();
	U(t, !0);
	let r = F(t, "ref", 15, null), i = F(t, "toaster", 7), a = F(t, "children", 7), o = O(t, by), s = po(), c = Sr(), l = R(() => ({
		store: i(),
		id: n,
		dir: s().dir,
		getRootNode: c().getRootNode
	})), u = za(oy.machine, () => x(l)), d = R(() => oy.connect(u, ja)), p = R(() => x(d).getToasts()), h = R(() => J(x(d).getGroupProps(), o));
	return Y(e, z({ as: "div" }, () => x(h), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		},
		children: (e, t) => {
			var n = g(), r = T(n);
			b(r, 19, () => x(p), (e) => e.id, (e, t, n, r) => {
				let i = R(() => () => x(t));
				yy(e, {
					value: x(i),
					get parent() {
						return u;
					},
					get index() {
						return x(n);
					},
					children: (e, t) => {
						var n = g(), r = T(n);
						I(r, a, () => x(i)), m(e, n);
					},
					$$slots: { default: !0 }
				});
			}), m(e, n);
		},
		$$slots: { default: !0 }
	})), B({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), W();
		},
		get toaster() {
			return i();
		},
		set toaster(e) {
			i(e), W();
		},
		get children() {
			return a();
		},
		set children(e) {
			a(e), W();
		}
	});
}
H(xy, {
	ref: {},
	toaster: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Toast.svelte
var Sy = /* @__PURE__ */ new WeakMap();
function Cy(e) {
	let t = Sy.get(e);
	return t || Sy.set(e, t = sy({
		placement: "bottom-end",
		overlap: !1,
		gap: 8,
		hotkey: ["af-kit-no-hotkey"]
	})), t;
}
function wy(e, t) {
	return e.create({
		type: t.kind,
		description: t.text,
		duration: t.kind === "error" ? t.action ? Infinity : 8e3 : 4e3,
		meta: { action: t.action ?? null }
	});
}
var Ty = o("<p> </p>"), Ey = l("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>", 1), Dy = l("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>", 1), Oy = l("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>", 1), ky = l("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>"), Ay = l("<svg part=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><!></svg><!><!><!>", 1), jy = o("<div class=\"af-kit\"><div class=\"live svelte-e495ij\" role=\"status\"></div> <div class=\"live svelte-e495ij\" role=\"alert\"></div> <div class=\"region svelte-e495ij\" popover=\"manual\"><!></div></div>"), My = o("<!> <!>", 1), Ny = {
	hash: "svelte-e495ij",
	code: ".live.svelte-e495ij {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.region[popover].svelte-e495ij {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none;}[data-scope='toast'][data-part='root'] {position:relative;display:flex;align-items:flex-start;gap:8px;width:min(360px, calc(100vw - 32px));padding:8px 8px 8px 14px;box-sizing:border-box;overflow:hidden;font-size:14px;line-height:22px;--k-tone: var(--k-info);translate:var(--x) var(--y);scale:var(--scale, 1);z-index:var(--z-index);opacity:var(--opacity);will-change:translate, opacity, scale;transition:translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);}[data-scope='toast'][data-part='root'][data-state='closed'] {transition:translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);}[data-scope='toast'][data-part='root']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}\n  /* The kind shows in a leading bar and an icon, not only in a colour of the border. */[data-scope='toast'][data-part='root']::before {content:'';position:absolute;inset-block:0;left:0;width:3px;background:var(--k-tone);}[data-scope='toast'][data-part='root'][data-type='error'] {--k-tone: var(--k-danger);}[data-scope='toast'][data-part='root'][data-type='success'] {--k-tone: var(--k-success);}[part='icon'].svelte-e495ij {flex:none;width:16px;height:16px;margin-top:3px;color:var(--k-tone);}[data-scope='toast'][data-part='description'] {flex:1;min-width:0;padding-block:1px;overflow-wrap:anywhere;}[data-scope='toast'][data-part='action'] {flex:none;min-height:28px;padding:0 10px;font-size:12px;}[data-scope='toast'][data-part='close'] {flex:none;color:var(--k-muted);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='toast'][data-part='root'], [data-scope='toast'][data-part='root'][data-state='closed'] {transition:none;}\n  }"
};
function Py(t, n) {
	U(n, !0), ee(t, Ny);
	let r = F(n, "locale", 7, null), a = F(n, "strings", 7, null), o = n.$$host, c = R(() => ru(r(), a() ?? void 0)), l = Cy(o), f = M(null), h = M(0), S = M(_([])), C = () => queueMicrotask(() => {
		let t = l.getVisibleToasts();
		e(h, t.length, !0), e(S, t.map((e) => ({
			id: e.id,
			error: e.type === "error",
			text: String(e.description ?? "")
		})), !0);
	});
	d(() => (C(), l.subscribe(C))), d(() => Xl(x(f), x(h) > 0, o));
	var D = {
		get locale() {
			return r();
		},
		set locale(e = null) {
			r(e), W();
		},
		get strings() {
			return a();
		},
		set strings(e = null) {
			a(e), W();
		}
	}, O = My(), k = T(O);
	return Jl(k, {}), Tr(E(k, 2), {
		value: () => o.shadowRoot,
		children: (t, n) => {
			var r = jy(), a = u(r);
			b(a, 21, () => x(S).filter((e) => !e.error), (e) => e.id, (e, t) => {
				var n = Ty(), r = w(n, !0);
				s(() => p(r, x(t).text)), m(e, n);
			}), G(a);
			var d = E(a, 2);
			b(d, 21, () => x(S).filter((e) => e.error), (e) => e.id, (e, t) => {
				var n = Ty(), r = w(n, !0);
				s(() => p(r, x(t).text)), m(e, n);
			}), G(d);
			var h = E(d, 2);
			xy(u(h), {
				get toaster() {
					return l;
				},
				get "aria-label"() {
					return x(c).notifications;
				},
				"aria-live": "off",
				children: (e, t = P) => {
					let n = R(() => t()().meta?.action);
					var r = g(), a = T(r);
					y(a, () => vy, (e, r) => {
						r(e, {
							part: "toast",
							class: "af-overlay",
							"aria-live": "off",
							children: (e, r) => {
								var a = Ay(), l = T(a), d = u(l), f = (e) => {
									var t = Ey();
									L(2), m(e, t);
								}, h = R(() => t()().type === "error"), _ = (e) => {
									var t = Dy();
									L(), m(e, t);
								}, b = R(() => t()().type === "success"), S = (e) => {
									var t = Oy();
									L(2), m(e, t);
								};
								i(d, (e) => {
									x(h) ? e(f) : x(b) ? e(_, 1) : e(S, -1);
								}), G(l);
								var C = E(l);
								y(C, () => hy, (e, n) => {
									n(e, {
										part: "text",
										children: (e, n) => {
											L();
											var r = v();
											s((e) => p(r, e), [() => t()().description]), m(e, r);
										},
										$$slots: { default: !0 }
									});
								});
								var w = E(C), D = (e) => {
									var r = g(), i = T(r);
									y(i, () => dy, (e, r) => {
										r(e, {
											part: "action",
											class: "af-button secondary",
											onclick: () => Yl(o, "action", {
												toast: t()().id,
												action: x(n).id
											}),
											children: (e, t) => {
												L();
												var r = v();
												s(() => p(r, x(n).label)), m(e, r);
											},
											$$slots: { default: !0 }
										});
									}), m(e, r);
								};
								i(w, (e) => {
									x(n) && e(D);
								});
								var O = E(w);
								y(O, () => py, (e, t) => {
									t(e, {
										part: "close",
										class: "af-button ghost icon sm",
										get "aria-label"() {
											return x(c).close;
										},
										children: (e, t) => {
											var n = ky();
											m(e, n);
										},
										$$slots: { default: !0 }
									});
								}), m(e, a);
							},
							$$slots: { default: !0 }
						});
					}), m(e, r);
				},
				$$slots: { default: !0 }
			}), G(h), ue(h, (t) => e(f, t), () => x(f)), G(r), m(t, r);
		},
		$$slots: { default: !0 }
	}), m(t, O), B(D);
}
H(Py, {
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	show(e) {
		return wy(Cy(this), e);
	}
	dismiss(e) {
		Cy(this).dismiss(e);
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/use-tooltip-context.js
var [Fy, Iy] = br({ name: "TooltipContext" }), Ly = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ry(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, Ly), a = Iy(), o = no(), s = R(() => J(a().getContentProps(), o().getPresenceProps(), r));
	function c(e) {
		o().setNode(e);
	}
	var l = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, u = g(), d = T(u), f = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			[h()]: c,
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, p = R(() => !o().unmounted);
	return i(d, (e) => {
		x(p) && e(f);
	}), m(e, u), B(l);
}
H(Ry, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-context.svelte
function zy(e, t) {
	U(t, !0);
	let n = F(t, "render", 7), r = Iy();
	var i = {
		get render() {
			return n();
		},
		set render(e) {
			n(e), W();
		}
	}, a = g(), o = T(a);
	return I(o, () => n() ?? P, () => r), m(e, a), B(i);
}
H(zy, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-positioner.svelte
var By = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vy(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, By), a = Iy(), o = no(), s = R(() => J(a().getPositionerProps(), r));
	var c = {
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	}, l = g(), u = T(l), d = (e) => {
		Y(e, z({ as: "div" }, () => x(s), {
			get ref() {
				return n();
			},
			set ref(e) {
				n(e);
			}
		}));
	}, f = R(() => !o().unmounted);
	return i(u, (e) => {
		x(f) && e(d);
	}), m(e, l), B(c);
}
H(Vy, { ref: {} }, [], [], { mode: "open" });
var Hy = uc("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content").build(), Uy = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `tooltip:${e.id}:trigger:${t}` : `tooltip:${e.id}:trigger` : ai(n) ? n(t) : n;
}, Wy = (e) => e.ids?.content ?? `tooltip:${e.id}:content`, Gy = (e) => e.ids?.arrow ?? `tooltip:${e.id}:arrow`, Ky = (e) => e.ids?.positioner ?? `tooltip:${e.id}:popper`, qy = (e) => e.getById(Uy(e)), Jy = (e) => e.getById(Ky(e)), Yy = (e) => Zn(e.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${Ve(e.id)}`), Xy = (e, t) => t == null ? qy(e) ?? Yy(e)[0] : e.getById(Uy(e, t)), Zy = Fi({
	id: null,
	prevId: null,
	instant: !1
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tooltip@1.43.3/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function Qy(e, t) {
	let { state: n, context: r, send: i, scope: a, prop: o, event: s } = e, c = o("id"), l = !!o("aria-label"), u = n.matches("open", "closing"), d = r.get("triggerValue"), f = r.get("currentPlacement"), p = f ? Sd(f) : void 0, m = Wy(a), h = o("disabled"), g = Vd({
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
			let { value: n } = e, r = n != null && d === n, s = Uy(a, n);
			return t.button({
				...Hy.trigger.attrs,
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
					e.defaultPrevented || h || jp() && i({
						type: u && n != null && !r ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value: n,
						triggerId: s
					});
				},
				onBlur(e) {
					e.defaultPrevented || h || c === Zy.get("id") && ((e.relatedTarget ?? a.getDoc().activeElement)?.closest(Ve(a.id)) ?? i({
						type: "close",
						src: "trigger.blur",
						value: n,
						triggerId: s
					}));
				},
				onPointerDown(e) {
					e.defaultPrevented || h || Qt(e) && o("closeOnPointerDown") && c === Zy.get("id") && i({
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
				id: Gy(a),
				...Hy.arrow.attrs,
				dir: o("dir"),
				style: g.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...Hy.arrowTip.attrs,
				dir: o("dir"),
				style: g.arrowTip
			});
		},
		getPositionerProps() {
			return t.element({
				id: Ky(a),
				...Hy.positioner.attrs,
				dir: o("dir"),
				style: g.floating
			});
		},
		getContentProps() {
			let e = Zy.get("id") === c, n = Zy.get("prevId") === c, r = Zy.get("instant") && (u && e || n);
			return t.element({
				...Hy.content.attrs,
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
var { and: $y, not: eb } = ya(), tb = ba({
	initialState: ({ prop: e }) => e("open") || e("defaultOpen") ? "open" : "closed",
	props({ props: e }) {
		Ui(e, ["id"]);
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
					triggerElement: Xy(n, e)
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
					guard: $y("noVisibleTooltip", eb("hasPointerMoveOpened")),
					target: "opening",
					actions: ["setTriggerValue"]
				}, {
					guard: eb("hasPointerMoveOpened"),
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
			noVisibleTooltip: () => Zy.get("id") === null,
			isVisible: ({ prop: e }) => e("id") === Zy.get("id"),
			isInteractive: ({ prop: e }) => !!e("interactive"),
			hasPointerMoveOpened: ({ context: e }) => !!e.get("hasPointerMoveOpened"),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0
		},
		actions: {
			setGlobalId: ({ prop: e }) => {
				let t = Zy.get("id"), n = t !== null && t !== e("id");
				Zy.update({
					id: e("id"),
					prevId: n ? t : null,
					instant: n
				});
			},
			clearGlobalId: ({ prop: e }) => {
				e("id") === Zy.get("id") && Zy.update({
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
				t.type === "positioning.set" && zd(() => Xy(r, e.get("triggerValue")), () => Jy(r), {
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
				return zd(() => Xy(r, i), () => Jy(r), {
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
			trackFocusVisible: ({ scope: e }) => Mp({ root: e.getRootNode?.() }),
			trackPositioning: ({ context: e, prop: t, scope: n }) => (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), zd(() => Xy(n, e.get("triggerValue")), () => Jy(n), {
				...t("positioning"),
				defer: !0,
				onComplete(t) {
					e.set("currentPlacement", t.placement);
				}
			})),
			trackPointerlockChange: ({ send: e, scope: t }) => cn(t.getDoc(), "pointerlockchange", () => e({
				type: "close",
				src: "pointerlock:change"
			}), !1),
			trackScroll: ({ send: e, prop: t, scope: n, context: r }) => {
				if (!t("closeOnScroll")) return;
				let i = Xy(n, r.get("triggerValue"));
				if (!i) return;
				let a = Ln(i).map((t) => cn(t, "scroll", () => {
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
					n = Zy.subscribe(() => {
						Zy.get("id") !== e("id") && t({
							type: "close",
							src: "id.change"
						});
					});
				}), () => n?.();
			},
			trackEscapeKey: ({ send: e, prop: t }) => t("closeOnEscape") ? cn(document, "keydown", (t) => {
				Jt(t) || t.key === "Escape" && (t.stopPropagation(), e({
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
}), nb = (e) => {
	let t = Sr(), n = po(), r = R(() => {
		let r = hi(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = za(tb, () => x(r)), a = R(() => Qy(i, ja));
	return () => x(a);
}, rb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function ib(e, t) {
	let n = f();
	U(t, !0);
	let r = F(t, "open", 15), i = O(t, rb), a = R(() => eo(i)), o = R(() => V(x(a), 2)), s = R(() => x(o)[0]), c = R(() => x(o)[1]), l = R(() => x(c).children), u = R(() => j(x(c), ["children"])), d = R(() => ({
		...x(u),
		id: n,
		onOpenChange(e) {
			x(u).onOpenChange?.(e), r() !== void 0 && r(e.open);
		}
	})), p = nb(() => x(d)), h = R(() => ({
		...x(s),
		present: p().open
	})), _ = $a(() => x(h));
	Fy(p), to(_);
	var v = {
		get open() {
			return r();
		},
		set open(e) {
			r(e), W();
		}
	}, y = g(), b = T(y);
	return I(b, () => x(l) ?? P), m(e, y), B(v);
}
H(ib, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-trigger.svelte
var ab = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ob(e, t) {
	U(t, !0);
	let n = F(t, "ref", 15, null), r = O(t, ab), i = R(() => Er()(r, ["value"])), a = R(() => V(x(i), 2)), o = R(() => x(a)[0]), s = R(() => x(a)[1]), c = Iy(), l = R(() => J(c().getTriggerProps(x(o)), x(s)));
	return Y(e, z({ as: "button" }, () => x(l), {
		get ref() {
			return n();
		},
		set ref(e) {
			n(e);
		}
	})), B({
		get ref() {
			return n();
		},
		set ref(e = null) {
			n(e), W();
		}
	});
}
H(ob, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tooltip.svelte
var sb = o("<span><!></span>"), cb = o("<!> <!>", 1), lb = {
	hash: "svelte-1cq81kb",
	code: ":host {display:inline-block;}[part='anchor'].svelte-1cq81kb {display:block;}[data-scope='tooltip'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='tooltip'][data-part='content'] {max-width:280px;padding:4px 8px;border-radius:max(0px, calc(var(--k-radius) - 4px));font-size:12px;line-height:18px;overflow-wrap:anywhere;}"
};
function ub(t, n) {
	U(n, !0), ee(t, lb);
	let a = F(n, "text", 7, ""), o = n.$$host, l = M(!1), f = M(null), h = !1;
	d(() => Xl(x(f), x(l), o));
	let _ = (e) => (t) => c(t, "keydown", (t) => {
		t.key === "Escape" && e().open && e().setOpen(!1);
	});
	function b(e) {
		let t = h;
		h = !1, t || e().setOpen(!0);
	}
	function S(e, t, n) {
		let r = t.relatedTarget;
		r && (o.contains(r) || n instanceof Node && n.contains(r)) || e().setOpen(!1);
	}
	var C = {
		get text() {
			return a();
		},
		set text(e = "") {
			a(e), W();
		}
	}, w = g(), D = T(w), O = (t) => {
		var i = cb(), c = T(i);
		Jl(c, {}), Tr(E(c, 2), {
			value: () => o.shadowRoot,
			children: (t, i) => {
				var o = g(), c = T(o);
				y(c, () => ib, (t, i) => {
					i(t, {
						openDelay: 300,
						closeDelay: 0,
						closeOnEscape: !1,
						positioning: { strategy: "fixed" },
						get open() {
							return x(l);
						},
						set open(t) {
							e(l, t, !0);
						},
						children: (t, i) => {
							var o = cb(), c = T(o);
							{
								let e = (e, t = P) => {
									var i = g(), a = T(i);
									{
										let e = (e, i = P) => {
											var a = sb();
											fe(a, (e) => ({
												part: "anchor",
												...e
											}), [() => i()()], void 0, void 0, "svelte-1cq81kb");
											var o = u(a);
											r(o, n, "default", {}, null), G(a), ge(a, () => _(t())), m(e, a);
										};
										y(a, () => ob, (n, r) => {
											r(n, {
												onfocusin: () => b(t()),
												onfocusout: (e) => S(t(), e, e.currentTarget),
												onpointerdown: () => h = !0,
												onpointerleave: () => h = !1,
												asChild: e,
												$$slots: { asChild: !0 }
											});
										});
									}
									m(e, i);
								};
								y(c, () => zy, (t, n) => {
									n(t, {
										render: e,
										$$slots: { render: !0 }
									});
								});
							}
							var l = E(c, 2);
							y(l, () => Vy, (t, n) => {
								n(t, {
									popover: "manual",
									class: "af-kit",
									get ref() {
										return x(f);
									},
									set ref(t) {
										e(f, t, !0);
									},
									children: (e, t) => {
										var n = g(), r = T(n);
										y(r, () => Ry, (e, t) => {
											t(e, {
												class: "af-overlay tooltip",
												children: (e, t) => {
													L();
													var n = v();
													s(() => p(n, a())), m(e, n);
												},
												$$slots: { default: !0 }
											});
										}), m(e, n);
									},
									$$slots: { default: !0 }
								});
							}), m(t, o);
						},
						$$slots: { default: !0 }
					});
				}), m(t, o);
			},
			$$slots: { default: !0 }
		}), m(t, i);
	}, k = (e) => {
		var t = g(), i = T(t);
		r(i, n, "default", {}, null), m(e, t);
	};
	return i(D, (e) => {
		a() ? e(O) : e(k, -1);
	}), m(t, w), B(C);
}
H(ub, {
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
var db = de, fb = Symbol.for("@reflexify/agentflow-elements/kit/fonts");
function pb() {
	let e = globalThis;
	return e[fb] ??= {
		faces: /* @__PURE__ */ new Map(),
		ours: /* @__PURE__ */ new WeakSet()
	};
}
function mb(e) {
	return e.trim().replace(/^(["'])(.*)\1$/, "$2").trim().toLowerCase();
}
function hb(e) {
	let t = Object.entries(e.descriptors ?? {}).sort(([e], [t]) => e.localeCompare(t));
	return JSON.stringify([
		e.family,
		e.url,
		t
	]);
}
function gb(e, t) {
	console.warn("A font face did not load; text falls back to the module's font stack.", {
		family: e.family,
		url: e.url,
		error: String(t)
	});
}
function _b(e) {
	if (typeof document > "u" || !document.fonts || typeof FontFace > "u") return Promise.resolve();
	let { faces: t, ours: n } = pb(), r = e.map((e) => {
		let r = hb(e), i = t.get(r);
		if (i) return i;
		let a = mb(e.family);
		for (let e of document.fonts) if (!n.has(e) && mb(e.family) === a) return Promise.resolve();
		let o;
		try {
			let t = new FontFace(e.family, `url(${JSON.stringify(e.url)})`, e.descriptors);
			document.fonts.add(t), n.add(t), o = t.load().then(() => void 0, (t) => gb(e, t));
		} catch (t) {
			gb(e, t), o = Promise.resolve();
		}
		return t.set(r, o), o;
	});
	return Promise.all(r).then(() => void 0);
}
//#endregion
//#region src/kit/index.ts
var vb = {
	"af-dialog": Am,
	"af-confirm": du,
	"af-menu": Zh,
	"af-popover": cv,
	"af-tooltip": ub,
	"af-toast": Py,
	"af-date": Tm,
	"af-person-picker": T_,
	"af-rich-editor": Ev
}, yb = Object.keys(vb);
for (let e of Object.values(vb)) Object.defineProperty(e.element, "kitVersion", { value: db });
function bb(e = customElements) {
	for (let [t, n] of Object.entries(vb)) {
		let r = e.get(t);
		if (!r) e.define(t, n.element);
		else if (r !== n.element) {
			let e = r.kitVersion;
			oe(e, db) && console.warn(`An older copy of the AgentFlow UI kit registered ${t} first; this page uses it, not this copy.`, {
				tag: t,
				registered: e ?? null,
				loaded: db
			});
		}
	}
}
bb();
//#endregion
export { ql as KIT_CSS, yb as KIT_TAGS, db as KIT_VERSION, bb as defineKitElements, _b as loadFonts };
