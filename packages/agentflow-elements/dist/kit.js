import { $ as e, A as t, B as n, C as r, D as i, E as a, F as o, G as s, H as c, I as l, J as u, K as d, L as f, M as p, N as m, O as h, P as g, Q as _, R as v, S as y, T as b, U as x, V as S, W as C, X as w, Y as T, Z as E, _ as D, a as O, at as k, b as A, c as j, ct as M, d as N, dt as P, et as F, f as ee, g as te, h as ne, i as I, it as L, j as R, k as z, l as re, lt as ie, n as B, nt as ae, ot as oe, q as V, r as H, rt as se, s as ce, st as U, t as W, tt as le, u as G, ut as ue, v as de, w as fe, x as pe, y as me, z as he } from "./chunks/client-ChLD-Y6I.js";
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/chunk-QZ7TP4HQ.mjs
var ge = Object.defineProperty, _e = (e, t, n) => t in e ? ge(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, ve = (e, t, n) => _e(e, typeof t == "symbol" ? t : t + "", n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/caret.mjs
function ye(e) {
	if (e) try {
		if (e.ownerDocument.activeElement !== e) return;
		let t = e.value.length;
		e.setSelectionRange(t, t);
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/shared.mjs
var be = (e, t) => e.map((n, r) => e[(Math.max(t, 0) + r) % e.length]), xe = () => void 0, Se = (e) => typeof e == "object" && !!e, Ce = 2147483647, K = (e) => e ? "" : void 0, we = (e) => e ? "true" : void 0, Te = /\\/g, Ee = /"/g, De = (e) => globalThis.CSS?.escape?.(e) ?? e.replace(Te, "\\\\").replace(Ee, "\\\""), Oe = (e) => `[data-ownedby~="${De(String(e))}"]`, ke = 1, Ae = 9, je = 11, Me = (e) => Se(e) && e.nodeType === ke && typeof e.nodeName == "string", Ne = (e) => Se(e) && e.nodeType === Ae, Pe = (e) => Se(e) && e === e.window, Fe = (e) => Me(e) ? e.localName || "" : "#document";
function Ie(e) {
	return [
		"html",
		"body",
		"#document"
	].includes(Fe(e));
}
var Le = (e) => Se(e) && e.nodeType !== void 0, Re = (e) => Le(e) && e.nodeType === je && "host" in e, ze = (e) => Me(e) && e.localName === "input", Be = (e) => !!e?.matches("a[href]"), Ve = (e) => Me(e) ? e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0 : !1;
function He(e) {
	return e ? Ye(e.getRootNode()) === e : !1;
}
var Ue = /(textarea|select)/;
function We(e) {
	if (e == null || !Me(e)) return !1;
	try {
		return ze(e) && e.selectionStart != null || Ue.test(e.localName) || e.isContentEditable || e.getAttribute("contenteditable") === "true" || e.getAttribute("contenteditable") === "";
	} catch {
		return !1;
	}
}
function Ge(e, t) {
	if (!e || !t || !Me(e) || !Le(t)) return !1;
	if (Me(t) && e === t || e.contains(t)) return !0;
	let n = t.getRootNode?.();
	if (n && Re(n)) {
		let n = t;
		for (; n;) {
			if (e === n) return !0;
			n = n.parentNode || n.host;
		}
	}
	return !1;
}
function Ke(e) {
	return Ne(e) ? e : Pe(e) ? e.document : e?.ownerDocument ?? document;
}
function qe(e) {
	return Ke(e).documentElement;
}
function Je(e) {
	return Re(e) ? Je(e.host) : Ne(e) ? e.defaultView ?? window : Me(e) ? e.ownerDocument?.defaultView ?? window : window;
}
function Ye(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (!e || e === t) break;
		t = e;
	}
	return t;
}
function Xe(e) {
	if (Fe(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Re(e) && e.host || qe(e);
	return Re(t) ? t.host : t;
}
function Ze(e) {
	let t;
	try {
		if (t = e.getRootNode({ composed: !0 }), Ne(t) || Re(t)) return t;
	} catch {}
	return e.ownerDocument ?? document;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/computed-style.mjs
var Qe = /* @__PURE__ */ new WeakMap();
function $e(e) {
	return Qe.has(e) || Qe.set(e, Je(e).getComputedStyle(e)), Qe.get(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/controller.mjs
var et = /* @__PURE__ */ new Set([
	"menu",
	"listbox",
	"dialog",
	"grid",
	"tree",
	"region",
	"application"
]), tt = (e) => et.has(e), nt = (e) => e.getAttribute("aria-controls")?.split(" ") || [];
function rt(e, t) {
	let n = /* @__PURE__ */ new Set(), r = Ze(e), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = nt(e);
			for (let e of a) {
				if (!e || n.has(e)) continue;
				n.add(e);
				let a = r.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					if (e && tt(e) && !n && (a === t || a.contains(t) || i(a))) return !0;
				}
			}
		}
		return !1;
	};
	return i(e);
}
function it(e, t) {
	let n = Ze(e), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = nt(e);
			for (let e of a) {
				if (!e || r.has(e)) continue;
				r.add(e);
				let a = n.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					e && et.has(e) && !n && (t(a), i(a));
				}
			}
		}
	};
	i(e);
}
function at(e) {
	let t = /* @__PURE__ */ new Set();
	return it(e, (n) => {
		e.contains(n) || t.add(n);
	}), Array.from(t);
}
function ot(e) {
	let t = e.getAttribute("role");
	return !!(t && et.has(t));
}
function st(e) {
	return e.hasAttribute("aria-controls") && e.getAttribute("aria-expanded") === "true";
}
function ct(e) {
	return st(e) ? !0 : !!e.querySelector?.("[aria-controls][aria-expanded=\"true\"]");
}
function lt(e) {
	if (!e.id) return !1;
	let t = Ze(e), n = CSS.escape(e.id), r = `[aria-controls~="${n}"][aria-expanded="true"], [aria-controls="${n}"][aria-expanded="true"]`;
	return !!(t.querySelector(r) && ot(e));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/platform.mjs
var ut = () => typeof document < "u";
function dt() {
	return navigator.userAgentData?.platform ?? navigator.platform;
}
function ft() {
	let e = navigator.userAgentData;
	return e && Array.isArray(e.brands) ? e.brands.map(({ brand: e, version: t }) => `${e}/${t}`).join(" ") : navigator.userAgent;
}
var pt = (e) => ut() && e.test(dt()), mt = (e) => ut() && e.test(ft()), ht = (e) => ut() && e.test(navigator.vendor), gt = /^iPhone/i, _t = /^iPad/i, vt = /^Mac/i, yt = /apple/i, bt = /Firefox/i, xt = /Android/i, St = () => ut() && !!navigator.maxTouchPoints, Ct = () => pt(gt), wt = () => pt(_t) || Dt() && navigator.maxTouchPoints > 1, Tt = () => Ct() || wt(), Et = () => Dt() || Tt(), Dt = () => pt(vt), Ot = () => Et() && ht(yt), kt = () => mt(bt), At = () => mt(xt);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/event.mjs
function jt(e) {
	return e.composedPath?.() ?? e.nativeEvent?.composedPath?.();
}
function Mt(e) {
	return jt(e)?.[0] ?? e.target;
}
function Nt(e) {
	let t = e.currentTarget;
	if (!t || !t.matches("a[href], button[type='submit'], input[type='submit']")) return !1;
	let n = e.button === 1, r = It(e);
	return n || r;
}
function Pt(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let n = t.localName;
	return e.altKey ? n === "a" || n === "button" && t.type === "submit" || n === "input" && t.type === "submit" : !1;
}
function Ft(e) {
	return Kt(e).isComposing || e.keyCode === 229;
}
function It(e) {
	return Dt() ? e.metaKey : e.ctrlKey;
}
function Lt(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function Rt(e) {
	return e.pointerType === "" && e.isTrusted ? !0 : At() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
var zt = (e) => e.button === 0, Bt = (e) => e.button === 2 || Dt() && e.ctrlKey && e.button === 0, Vt = (e) => e.ctrlKey || e.altKey || e.metaKey, Ht = (e) => "touches" in e && e.touches.length > 0, Ut = {
	Up: "ArrowUp",
	Down: "ArrowDown",
	Esc: "Escape",
	" ": "Space",
	",": "Comma",
	Left: "ArrowLeft",
	Right: "ArrowRight"
}, Wt = {
	ArrowLeft: "ArrowRight",
	ArrowRight: "ArrowLeft"
};
function Gt(e, t = {}) {
	let { dir: n = "ltr", orientation: r = "horizontal" } = t, i = e.key;
	return i = Ut[i] ?? i, n === "rtl" && r === "horizontal" && i in Wt && (i = Wt[i]), i;
}
function Kt(e) {
	return e.nativeEvent ?? e;
}
function qt(e, t = "client") {
	let n = Ht(e) ? e.touches[0] || e.changedTouches[0] : e;
	return {
		x: n[`${t}X`],
		y: n[`${t}Y`]
	};
}
var Jt = (e, t, n, r) => {
	let i = typeof e == "function" ? e() : e;
	return i?.addEventListener(t, n, r), () => {
		i?.removeEventListener(t, n, r);
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/form.mjs
function Yt(e, t) {
	let { type: n = "HTMLInputElement", property: r = "value" } = t, i = Je(e)[n].prototype;
	return Object.getOwnPropertyDescriptor(i, r) ?? {};
}
function Xt(e) {
	if (e.localName === "input") return "HTMLInputElement";
	if (e.localName === "textarea") return "HTMLTextAreaElement";
	if (e.localName === "select") return "HTMLSelectElement";
}
function Zt(e, t, n = "value") {
	if (!e) return;
	let r = Xt(e);
	r && Yt(e, {
		type: r,
		property: n
	}).set?.call(e, t), e.setAttribute(n, t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/tabbable.mjs
var Qt = (e) => Me(e) && e.tagName === "IFRAME", $t = /^(audio|video|details)$/;
function en(e) {
	let t = e.getAttribute("tabindex");
	return t ? parseInt(t, 10) : NaN;
}
var tn = (e) => !Number.isNaN(en(e)), nn = (e) => en(e) < 0;
function rn(e) {
	return ze(e) && e.type === "radio";
}
function an(e) {
	if (!rn(e) || !e.name || e.checked) return !0;
	let t = `input[type="radio"][name="${CSS.escape(e.name)}"]`, n = e.form ?? e.ownerDocument, r = Array.from(n.querySelectorAll(t)).filter((t) => t.form === e.form && un(t)), i = r.find((e) => e.checked);
	return i ? i === e : r[0] === e;
}
function on(e, t) {
	if (!t) return null;
	if (t === !0) return e.shadowRoot || null;
	let n = t(e);
	return (n === !0 ? e.shadowRoot : n) || null;
}
function sn(e, t, n) {
	let r = [...e], i = [...e], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
	e.forEach((e, t) => o.set(e, t));
	let s = 0;
	for (; s < i.length;) {
		let e = i[s++];
		if (!e || a.has(e)) continue;
		a.add(e);
		let c = on(e, t);
		if (c) {
			let t = Array.from(c.querySelectorAll(cn)).filter(n), a = o.get(e);
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
var cn = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type", ln = (e, t = {}) => {
	if (!e) return [];
	let { includeContainer: n = !1, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(cn));
	(n == 1 || n == "if-empty" && i.length === 0) && Me(e) && un(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (un(e)) {
		if (Qt(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...ln(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	return r ? sn(a, r, un) : a;
};
function un(e) {
	return !Me(e) || e.closest("[inert]") ? !1 : e.matches(cn) && Ve(e);
}
function dn(e, t = {}) {
	if (!e) return [];
	let { includeContainer: n, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(cn));
	n && fn(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (fn(e)) {
		if (Qt(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...dn(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	if (r) {
		let e = sn(a, r, fn);
		return !e.length && n ? i : e;
	}
	return !a.length && n ? i : a;
}
function fn(e) {
	return Me(e) && e.tabIndex > 0 ? !0 : !un(e) || nn(e) ? !1 : an(e);
}
function pn(e, t = {}) {
	let n = dn(e, t);
	return [n[0] || null, n[n.length - 1] || null];
}
function mn(e) {
	return e.tabIndex < 0 && ($t.test(e.localName) || We(e)) && !tn(e) ? 0 : e.tabIndex;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function hn(e) {
	let { root: t, getInitialEl: n, filter: r, enabled: i = !0 } = e;
	if (!i) return;
	let a = typeof n == "function" ? n() : n;
	return a ||= t?.querySelector("[data-autofocus],[autofocus]"), a ||= dn(t).filter((e) => !r || r(e)).find((e) => !e.hasAttribute("data-no-autofocus")), a || t || void 0;
}
function gn(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let [n, r] = pn(t);
	return !(He(n) && e.shiftKey || He(r) && !e.shiftKey || !n && !r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/raf.mjs
var _n = class e {
	constructor() {
		ve(this, "id", null), ve(this, "fn_cleanup"), ve(this, "cleanup", () => {
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
	let t = _n.create();
	return t.request(e), t.cleanup;
}
function vn(e) {
	let t = /* @__PURE__ */ new Set();
	function n(e) {
		let n = globalThis.requestAnimationFrame(e);
		t.add(() => globalThis.cancelAnimationFrame(n));
	}
	return n(() => n(e)), function() {
		t.forEach((e) => e());
	};
}
function yn(e, t, n) {
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
function bn(e, t) {
	if (!e) return;
	let { attributes: n, callback: r } = t, i = new (e.ownerDocument.defaultView || window).MutationObserver((e) => {
		for (let t of e) t.type === "attributes" && t.attributeName && n.includes(t.attributeName) && r(t);
	});
	return i.observe(e, {
		attributes: !0,
		attributeFilter: n
	}), () => i.disconnect();
}
function xn(e, t) {
	let { defer: n } = t, r = n ? q : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(bn(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/navigate.mjs
function Sn(e) {
	let t = () => {
		let t = Je(e);
		e.dispatchEvent(new t.MouseEvent("click"));
	};
	kt() ? yn(e, "keyup", t) : queueMicrotask(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/overflow.mjs
function Cn(e) {
	let t = Xe(e);
	return Ie(t) ? Ke(t).body : Me(t) && Dn(t) ? t : Cn(t);
}
function wn(e, t = []) {
	let n = Cn(e), r = n === e.ownerDocument.body, i = Je(n);
	return r ? t.concat(i, i.visualViewport || [], Dn(n) ? n : []) : t.concat(n, wn(n, []));
}
var Tn = /auto|scroll|overlay|hidden|clip/, En = /* @__PURE__ */ new Set(["inline", "contents"]);
function Dn(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Je(e).getComputedStyle(e);
	return Tn.test(t + r + n) && !En.has(i);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/text-selection.mjs
var On = "default", kn = "", An = /* @__PURE__ */ new WeakMap();
function jn(e = {}) {
	let { target: t, doc: n } = e, r = n ?? document, i = r.documentElement;
	return Tt() ? (On === "default" && (kn = i.style.webkitUserSelect, i.style.webkitUserSelect = "none"), On = "disabled") : t && (An.set(t, t.style.userSelect), t.style.userSelect = "none"), () => Mn({
		target: t,
		doc: r
	});
}
function Mn(e = {}) {
	let { target: t, doc: n } = e, r = (n ?? document).documentElement;
	if (Tt()) {
		if (On !== "disabled") return;
		On = "restoring", setTimeout(() => {
			vn(() => {
				On === "restoring" && (r.style.webkitUserSelect === "none" && (r.style.webkitUserSelect = kn || ""), kn = "", On = "default");
			});
		}, 300);
	} else if (t && An.has(t)) {
		let e = An.get(t);
		t.style.userSelect === "none" && (t.style.userSelect = e ?? ""), t.getAttribute("style") === "" && t.removeAttribute("style"), An.delete(t);
	}
}
function Nn(e = {}) {
	let { defer: t, target: n, ...r } = e, i = t ? q : (e) => e(), a = [];
	return a.push(i(() => {
		let e = typeof n == "function" ? n() : n;
		a.push(jn({
			...r,
			target: e
		}));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/proxy-tab-focus.mjs
function Pn(e) {
	return e == null ? null : typeof e == "function" ? e() : e;
}
function Fn(e, t, n) {
	if (!t) return null;
	let r = dn(e.ownerDocument.body, { getShadowRoot: n }), i = r.indexOf(t);
	if (i === -1) return null;
	for (let t = i + 1; t < r.length; t++) {
		let n = r[t];
		if (!Ge(e, n)) return n;
	}
	return null;
}
function In(e, t = {}) {
	let { triggerElement: n, onFocus: r, onFocusEnter: i, getShadowRoot: a } = t, o = (Pn(e) ?? Pn(n))?.ownerDocument || document;
	function s(t) {
		if (t.key !== "Tab") return;
		let o = Pn(e), s = Pn(n);
		if (!o) return;
		let [c, l] = pn(o, {
			includeContainer: !0,
			getShadowRoot: a
		}), u = !c && !l, d = null;
		t.shiftKey && (He(c) || u) ? d = s : !t.shiftKey && He(s) ? (i?.(), d = c) : !t.shiftKey && (He(l) || u) ? d = Fn(o, s, a) : t.shiftKey && He(Fn(o, s, a)) && (i?.(), d = l), d && (t.preventDefault(), typeof r == "function" ? r(d) : d.focus());
	}
	return Jt(o, "keydown", s, !0);
}
function Ln(e, t) {
	let { defer: n, ...r } = t, i = n ? q : (e) => e(), a = [];
	return a.push(i(() => {
		a.push(In(e, r));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/query.mjs
function Rn(e, t) {
	return Array.from(e?.querySelectorAll(t) ?? []);
}
function zn(e, t) {
	return e?.querySelector(t) ?? null;
}
var Bn = (e) => e.id;
function Vn(e, t, n = Bn) {
	return e.find((e) => n(e) === t);
}
function Hn(e, t, n = Bn) {
	let r = Vn(e, t, n);
	return r ? e.indexOf(r) : -1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/scroll.mjs
function Un(e) {
	return e.scrollHeight > e.clientHeight || e.scrollWidth > e.clientWidth;
}
function Wn(e, t) {
	let { rootEl: n, ...r } = t || {};
	e && n && Dn(n) && Un(n) && e.scrollIntoView(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/searchable.mjs
var Gn = (e) => e.split("").map((e) => {
	let t = e.charCodeAt(0);
	return t > 0 && t < 128 ? e : t >= 128 && t <= 255 ? `/x${t.toString(16)}`.replace("/", "\\") : "";
}).join("").trim(), Kn = (e) => Gn(e.dataset?.valuetext ?? e.textContent ?? ""), qn = (e, t) => e.trim().toLowerCase().startsWith(t.toLowerCase());
function Jn(e, t, n, r = Bn) {
	let i = n ? Hn(e, n, r) : -1, a = n ? be(e, i) : e;
	return t.length === 1 && (a = a.filter((e) => r(e) !== n)), a.find((e) => qn(Kn(e), t));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/set.mjs
function Yn(e, t) {
	if (!e) return xe;
	let n = Object.keys(t).reduce((t, n) => (t[n] = e.style.getPropertyValue(n), t), {});
	return Zn(n, t) ? xe : (Object.assign(e.style, t), () => {
		Object.assign(e.style, n), e.style.length === 0 && e.removeAttribute("style");
	});
}
function Xn(e, t, n) {
	if (!e) return xe;
	let r = e.style.getPropertyValue(t);
	return r === n ? xe : (e.style.setProperty(t, n), () => {
		e.style.setProperty(t, r), e.style.length === 0 && e.removeAttribute("style");
	});
}
function Zn(e, t) {
	return Object.keys(e).every((n) => e[n] === t[n]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/typeahead.mjs
function Qn(e, t) {
	let { state: n, activeId: r, key: i, timeout: a = 350, itemToId: o } = t, s = n.keysSoFar + i, c = s.length > 1 && Array.from(s).every((e) => e === s[0]) ? s[0] : s, l = Jn(e.slice(), c, r, o);
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
var $n = /* @__PURE__ */ Object.assign(Qn, {
	defaultOptions: {
		keysSoFar: "",
		timer: -1
	},
	isValidEvent: er
});
function er(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/wait-for.mjs
function tr(e, t, n) {
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
function nr(e, t) {
	let { timeout: n, rootNode: r } = t, i = Je(r), a = Ke(r), o = new i.AbortController();
	return tr(new Promise((t) => {
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
function rr(e, t, n = {}) {
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
var ir = (e) => typeof e == "function", ar = (e, ...t) => ir(e) ? e(...t) : e;
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-context.js
function or(e, t) {
	return `${e} returned \`undefined\`. Seems you forgot to wrap component within ${t}`;
}
var sr = (e) => {
	let { name: t, strict: n = !0, hookName: r = "useContext", providerName: i = "Provider", errorMessage: a, defaultValue: o } = e, s = Symbol(t);
	return [
		(e) => oe(s, e),
		() => {
			let e = se(s);
			if (n && !e) throw Error(a ?? or(r, i));
			return e ? ae(s) : o;
		},
		s
	];
}, [cr, lr] = sr({
	name: "EnvironmentContext",
	strict: !1,
	defaultValue: () => ({
		getRootNode: () => document,
		getDocument: () => document,
		getWindow: () => window
	})
}), ur = m("<span hidden=\"\"></span>"), dr = m("<!> <!>", 1);
function fr(t, n) {
	k(n, !0);
	let r = B(n, "value", 7), i = B(n, "children", 7), a = _(null), o = () => ar(r()) ?? S(a)?.ownerDocument ?? document, s = F(() => ({
		getRootNode: o,
		getDocument: () => Ke(o()),
		getWindow: () => Je(o())
	}));
	cr(() => S(s));
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
	}, l = dr(), u = V(l);
	z(u, () => i() ?? ue);
	var d = T(u, 2), f = (e) => {
		var t = ur();
		O(t, (e) => E(a, e), () => S(a)), R(e, t);
	};
	return b(d, (e) => {
		r() || e(f);
	}), R(t, l), L(c);
}
W(fr, {
	value: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-split-props.js
var pr = () => (e, t) => t.reduce((e, t) => {
	let [n, r] = e, i = t;
	return r[i] !== void 0 && (n[i] = r[i]), delete r[i], [n, r];
}, [{}, { ...e }]), [mr, hr] = sr({
	name: "RenderStrategyContext",
	hookName: "useRenderStrategyContext",
	providerName: "<RenderStrategyPropsProvider />"
}), gr = pr(), _r = (e) => gr(e, ["lazyMount", "unmountOnExit"]), vr = Object.defineProperty, yr = (e) => {
	throw TypeError(e);
}, br = (e, t, n) => t in e ? vr(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, xr = (e, t, n) => br(e, typeof t == "symbol" ? t : t + "", n), Sr = (e, t, n) => t.has(e) || yr("Cannot " + n), Cr = (e, t, n) => (Sr(e, t, "read from private field"), n ? n.call(e) : t.get(e)), wr = (e, t, n) => t.has(e) ? yr("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/array.mjs
function Tr(e) {
	return e == null ? [] : Array.isArray(e) ? e : [e];
}
var Er = (e) => e[0], Dr = (e) => e[e.length - 1], Or = (e, t) => e.indexOf(t) !== -1, kr = (e, ...t) => e.concat(t), Ar = (e, ...t) => e.filter((e) => !t.includes(e)), jr = (e) => Array.from(new Set(e)), Mr = (e, t) => Or(e, t) ? Ar(e, t) : kr(e, t);
function Nr(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n, a = t + r, o = e.length, s = o - 1;
	return t === -1 ? r > 0 ? 0 : s : a < 0 ? i ? s : 0 : a >= o ? i ? 0 : t > o ? o : t : a;
}
function Pr(e, t, n = {}) {
	return e[Nr(e, t, n)];
}
function Fr(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n;
	return Nr(e, t, {
		step: -r,
		loop: i
	});
}
function Ir(e, t, n = {}) {
	return e[Fr(e, t, n)];
}
function Lr(e, t) {
	return e.reduce((e, n, r) => (r % t === 0 ? e.push([n]) : Dr(e)?.push(n), e), []);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/equal.mjs
var Rr = (e) => e?.constructor.name === "Array", zr = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!Br(e[n], t[n])) return !1;
	return !0;
}, Br = (e, t) => {
	if (Object.is(e, t)) return !0;
	if (e == null && t != null || e != null && t == null) return !1;
	if (typeof e?.isEqual == "function" && typeof t?.isEqual == "function") return e.isEqual(t);
	if (typeof e == "function" && typeof t == "function") return e.toString() === t.toString();
	if (Rr(e) && Rr(t)) return zr(Array.from(e), Array.from(t));
	if (typeof e != "object" || typeof t != "object") return !1;
	let n = Object.keys(t ?? /* @__PURE__ */ Object.create(null)), r = n.length;
	for (let t = 0; t < r; t++) if (!Reflect.has(e, n[t])) return !1;
	for (let i = 0; i < r; i++) {
		let r = n[i];
		if (!Br(e[r], t[r])) return !1;
	}
	return !0;
}, Vr = (e) => Array.isArray(e), Hr = (e) => e === !0 || e === !1, Ur = (e) => typeof e == "object" && !!e, Wr = (e) => Ur(e) && !Vr(e), Gr = (e) => typeof e == "string", Kr = (e) => typeof e == "function", qr = (e) => e == null, Jr = (e, t) => Object.prototype.hasOwnProperty.call(e, t), Yr = (e) => Object.prototype.toString.call(e), Xr = Function.prototype.toString, Zr = Xr.call(Object), Qr = (e) => {
	if (!Ur(e) || Yr(e) != "[object Object]" || ti(e)) return !1;
	let t = Object.getPrototypeOf(e);
	if (t === null) return !0;
	let n = Jr(t, "constructor") && t.constructor;
	return typeof n == "function" && n instanceof n && Xr.call(n) == Zr;
}, $r = (e) => typeof e == "object" && !!e && "$$typeof" in e && "props" in e, ei = (e) => typeof e == "object" && !!e && "__v_isVNode" in e, ti = (e) => $r(e) || ei(e), ni = (e, ...t) => (typeof e == "function" ? e(...t) : e) ?? void 0, ri = (e) => e, ii = (e) => e(), ai = () => {}, oi = (...e) => (...t) => {
	e.forEach(function(e) {
		e?.(...t);
	});
}, si = /* @__PURE__ */ (() => {
	let e = 0;
	return () => (e++, e.toString(36));
})();
function ci(e, t, ...n) {
	if (e in t) {
		let r = t[e];
		return Kr(r) ? r(...n) : r;
	}
	let r = /* @__PURE__ */ Error(`No matching key: ${JSON.stringify(e)} in ${JSON.stringify(Object.keys(t))}`);
	throw Error.captureStackTrace?.(r, ci), r;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/number.mjs
var { floor: li, abs: ui, round: di, min: fi, max: pi, pow: mi, sign: hi } = Math, gi = (e) => Number.isNaN(e), _i = (e) => gi(e) ? 0 : e, vi = (e, t, n) => {
	let r = _i(e);
	return (t == null || r >= t) && (n == null || r <= n);
}, yi = (e, t, n) => fi(pi(_i(e), t), n);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/object.mjs
function bi(e) {
	if (!Qr(e) || e === void 0) return e;
	let t = Reflect.ownKeys(e).filter((e) => typeof e == "string"), n = {};
	for (let r of t) {
		let t = e[r];
		t !== void 0 && (n[r] = bi(t));
	}
	return n;
}
function xi(e, t) {
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
function Si(e, t = Object.is) {
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
var Ci = () => performance.now(), wi, Ti = class {
	constructor(e) {
		xr(this, "onTick", e), xr(this, "frameId", null), xr(this, "pausedAtMs", null), xr(this, "context"), xr(this, "cancelFrame", () => {
			this.frameId !== null && (cancelAnimationFrame(this.frameId), this.frameId = null);
		}), xr(this, "setStartMs", (e) => {
			this.context.startMs = e;
		}), xr(this, "start", () => {
			if (this.frameId !== null) return;
			let e = Ci();
			this.pausedAtMs === null ? this.context.startMs = e : (this.context.startMs += e - this.pausedAtMs, this.pausedAtMs = null), this.frameId = requestAnimationFrame(Cr(this, wi));
		}), xr(this, "pause", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = Ci());
		}), xr(this, "stop", () => {
			this.frameId !== null && (this.cancelFrame(), this.pausedAtMs = null);
		}), wr(this, wi, (e) => {
			if (this.context.now = e, this.context.deltaMs = e - this.context.startMs, this.onTick(this.context) === !1) {
				this.stop();
				return;
			}
			this.frameId = requestAnimationFrame(Cr(this, wi));
		}), this.context = {
			now: 0,
			startMs: Ci(),
			deltaMs: 0
		};
	}
	get elapsedMs() {
		return this.pausedAtMs === null ? Ci() - this.context.startMs : this.pausedAtMs - this.context.startMs;
	}
};
wi = /* @__PURE__ */ new WeakMap();
function Ei(e, t) {
	let n = new Ti(({ deltaMs: n }) => {
		if (n >= t) return e(), !1;
	});
	return n.start(), () => n.stop();
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/warning.mjs
function Di(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	(e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production" && console.warn(t);
}
function Oi(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	if ((e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production") throw Error(t);
}
function ki(e, t) {
	if (e == null) throw Error(t());
}
function Ai(e, t, n) {
	let r = [];
	for (let n of t) e[n] ?? r.push(n);
	if (r.length > 0) throw Error(`[zag-js${n ? ` > ${n}` : ""}] missing required props: ${r.join(", ")}`);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/merge-props.mjs
var ji = (...e) => e.map((e) => e?.trim?.()).filter(Boolean).join(" "), Mi = (...e) => Array.from(new Set(ji(...e).split(/\s+/).filter(Boolean))).join(" "), Ni = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, Pi = (e) => {
	let t = {}, n;
	for (; n = Ni.exec(e);) t[n[1]] = n[2];
	return t;
}, Fi = (e, t) => {
	if (Gr(e)) {
		if (Gr(t)) return `${e};${t}`;
		e = Pi(e);
	} else Gr(t) && (t = Pi(t));
	return Object.assign({}, e ?? {}, t ?? {});
};
function Ii(...e) {
	let t = {};
	for (let n of e) {
		if (!n) continue;
		for (let e in t) {
			if (e.startsWith("on") && typeof t[e] == "function" && typeof n[e] == "function") {
				t[e] = oi(n[e], t[e]);
				continue;
			}
			if (e === "className" || e === "class") {
				t[e] = ji(t[e], n[e]);
				continue;
			}
			if (e === "style") {
				t[e] = Fi(t[e], n[e]);
				continue;
			}
			if (e === "data-ownedby") {
				t[e] = Mi(t[e], n[e]);
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
function Li(e, t, n) {
	let r = [], i;
	return (a) => {
		let o = e(a);
		return o.length !== r.length || o.some((e, t) => !Br(r[t], e)) ? (r = o, i = t(o, a), n?.onChange?.(i), i) : i;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/state.mjs
var Ri = ".", zi = "#", Bi = /* @__PURE__ */ new WeakMap(), Vi = /* @__PURE__ */ new WeakMap();
function Hi(e) {
	return e.join(Ri);
}
function Ui(e) {
	return e.includes(Ri);
}
function Wi(e) {
	return e.startsWith(zi);
}
function Gi(e) {
	return e.startsWith(Ri);
}
function Ki(e) {
	return Wi(e) ? e.slice(zi.length) : e;
}
function qi(e, t) {
	return e ? `${e}${Ri}${t}` : t;
}
function Ji(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e, i) => {
		t.set(e, i);
		let a = i.id;
		a && (n.has(a) && Oi(`[zag-js] Duplicate state id: "${a}"`), n.set(a, e));
		let o = i.states;
		if (o) {
			ki(i.initial, () => `[zag-js] Compound state "${e}" has child states but no "initial" property`), i.initial in o || Oi(`[zag-js] Compound state "${e}" has initial "${String(i.initial)}" which is not a child state`);
			for (let [t, n] of Object.entries(o)) {
				if (!n) continue;
				let i = qi(e, t);
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
function Yi(e) {
	let t = Bi.get(e);
	if (t) return t;
	let { index: n, idIndex: r } = Ji(e);
	return Bi.set(e, n), Vi.set(e, r), n;
}
function Xi(e, t) {
	return Yi(e), Vi.get(e)?.get(t);
}
function Zi(e) {
	return e ? String(e).split(Ri).filter(Boolean) : [];
}
function Qi(e, t) {
	if (!t) return [];
	let n = Yi(e), r = Zi(t), i = [], a = [];
	for (let e of r) {
		a.push(e);
		let t = Hi(a), r = n.get(t);
		if (!r) break;
		i.push({
			path: t,
			state: r
		});
	}
	return i;
}
function $i(e, t) {
	let n = Yi(e), r = Zi(t);
	if (!r.length) return t;
	let i = [];
	for (let e of r) {
		i.push(e);
		let r = Hi(i);
		if (!n.has(r)) return t;
	}
	let a = Hi(i), o = n.get(a);
	for (; o?.initial;) {
		let e = `${a}${Ri}${o.initial}`, t = n.get(e);
		if (!t) break;
		a = e, o = t;
	}
	return a;
}
function ea(e, t) {
	return Yi(e).has(t);
}
function ta(e, t, n) {
	let r = String(t);
	if (Wi(r)) {
		let t = Ki(r), n = Xi(e, t);
		return ki(n, () => `[zag-js] Unknown state id: "${t}"`), $i(e, n);
	}
	if (Gi(r) && n) return $i(e, qi(n, r.slice(1)));
	if (!Ui(r) && n) {
		let t = Zi(n);
		for (let n = t.length - 1; n >= 1; n--) {
			let i = qi(t.slice(0, n).join(Ri), r);
			if (ea(e, i)) return $i(e, i);
		}
		if (ea(e, r)) return $i(e, r);
	}
	return $i(e, r);
}
function na(e, t, n) {
	let r = Qi(e, t);
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
function ra(e, t, n, r) {
	let i = t ? Qi(e, t) : [], a = Qi(e, n), o = 0;
	for (; o < i.length && o < a.length && i[o]?.path === a[o]?.path;) o += 1;
	let s = i.slice(o).reverse(), c = a.slice(o), l = i[i.length - 1]?.path === a[a.length - 1]?.path;
	return r && l && (s = i.slice().reverse(), c = a), {
		exiting: s,
		entering: c
	};
}
function ia(e, t) {
	return e ? e === t || e.startsWith(`${t}${Ri}`) : !1;
}
function aa(e, t, n) {
	return Qi(e, t).some((e) => e.state.tags?.includes(n));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/create-machine.mjs
function oa() {
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
function sa(e) {
	return Yi(e), e;
}
function ca() {
	return {
		guards: oa(),
		createMachine: (e) => sa(e),
		choose: (e) => function({ choose: t }) {
			return t(e)?.actions;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/types.mjs
var la = /* @__PURE__ */ ((e) => (e.NotStarted = "Not Started", e.Started = "Started", e.Stopped = "Stopped", e))(la || {}), ua = "__init__";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/scope.mjs
function da(e) {
	let t = () => e.getRootNode?.() ?? document, n = () => Ke(t()), r = () => n().defaultView ?? window, i = () => Ye(t()), a = (e) => t().getElementById(e);
	return {
		...e,
		getRootNode: t,
		getDoc: n,
		getWin: r,
		getActiveElement: i,
		isActiveElement: He,
		getById: a
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+types@1.43.3/node_modules/@zag-js/types/dist/prop-types.mjs
function fa(e) {
	return new Proxy({}, { get(t, n) {
		return n === "style" ? (t) => e({ style: t }).style : e;
	} });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/normalize-props.js
var pa = {
	className: "class",
	defaultChecked: "checked",
	defaultValue: "value",
	htmlFor: "for",
	onBlur: "onfocusout",
	onChange: "oninput",
	onFocus: "onfocusin",
	onDoubleClick: "ondblclick"
};
function ma(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		r != null && (n.startsWith("--") || (n = n.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)), t += `${n}:${r};`);
	}
	return t;
}
var ha = new Set("viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(","));
function ga(e) {
	return e in pa ? pa[e] : ha.has(e) ? e : e.toLowerCase();
}
function _a(e, t) {
	return e === "style" && typeof t == "object" ? ma(t) : t;
}
var va = fa((e) => {
	let t = {};
	for (let n in e) t[ga(n)] = _a(n, e[n]);
	return t;
}), ya = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, ba = (e) => {
	let t = {}, n;
	for (; n = ya.exec(e);) t[n[1]] = n[2];
	return t;
};
function J(...e) {
	let t = [];
	for (let n of e) n && "class" in n && n.class != null && t.push(n.class);
	let n = Ii(...e);
	return t.length > 0 && (n.class = t.length === 1 ? t[0] : t), "style" in n && (typeof n.style == "string" && (n.style = ba(n.style)), n.style = ma(n.style)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/bindable.svelte.js
function xa(t) {
	let n = t().value ?? t().defaultValue, r = t().isEqual ?? Object.is, i = _(w(n)), a = F(() => t().value !== void 0), o = { current: c(() => S(i)) }, l = { current: void 0 };
	s(() => {
		let e = S(a) ? t().value : S(i);
		o = { current: e }, l = { current: e };
	});
	let u = (e) => {
		let n = Kr(e) ? e(o.current) : e, s = l.current;
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
			let r = t().sync ? e : ii;
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
xa.cleanup = (e) => {
	i(() => e());
}, xa.ref = (e) => {
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
function Sa(e) {
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
var Ca = (e) => typeof e == "function" ? e() : e, wa = (e, t) => {
	let n = [], r = !0;
	C(() => {
		if (r) {
			n = e.map((e) => Ca(e)), r = !1;
			return;
		}
		let i = !1;
		for (let t = 0; t < e.length; t++) if (!Br(n[t], Ca(e[t]))) {
			i = !0;
			break;
		}
		i && (n = e.map((e) => Ca(e)), t());
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/machine.svelte.js
function Ta(e) {
	return Kr(e) ? e() : e;
}
function Ea(e, t) {
	let n = F(() => {
		let { id: e, ids: n, getRootNode: r } = Ta(t);
		return da({
			id: e,
			ids: n,
			getRootNode: r
		});
	}), r = (...t) => {
		e.debug && console.log(...t);
	}, a = F(() => e.props?.({
		props: bi(Ta(t)),
		scope: S(n)
	}) ?? Ta(t)), o = Da(() => S(a)), s = e.context?.({
		prop: o,
		bindable: xa,
		get scope() {
			return S(n);
		},
		flush: Oa,
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
			return aa(e, w.get(), t);
		},
		matches(...e) {
			let t = w.get();
			return e.some((e) => ia(t, e));
		}
	}), g = Sa(e.refs?.({
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
		track: wa,
		refs: g,
		computed: C,
		flush: Oa,
		scope: S(n),
		choose: x
	}), v = (t) => {
		let n = Kr(t) ? t(_()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.actions?.[t];
			return n || Di(`[zag-js] No implementation found for action "${JSON.stringify(t)}"`), n;
		});
		for (let e of r) e?.(_());
	}, y = (t) => {
		if (Kr(t)) return t(_());
		let n = e.implementations?.guards?.[t];
		return n || Di(`[zag-js] No implementation found for guard "${JSON.stringify(t)}"`), n?.(_());
	}, b = (t) => {
		let n = Kr(t) ? t(_()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.effects?.[t];
			return n || Di(`[zag-js] No implementation found for effect "${JSON.stringify(t)}"`), n;
		}), i = [];
		for (let e of r) {
			let t = e?.(_());
			t && i.push(t);
		}
		return () => i.forEach((e) => e?.());
	}, x = (e) => Tr(e).find((e) => {
		let t = !e.guard;
		return Gr(e.guard) ? t = !!y(e.guard) : Kr(e.guard) && (t = e.guard(_())), t;
	}), C = (t) => {
		ki(e.computed, () => "[zag-js] No computed object found on machine");
		let r = e.computed[t];
		return r({
			context: c,
			event: p(),
			prop: o,
			refs: g,
			scope: S(n),
			computed: C
		});
	}, w = xa(() => ({
		defaultValue: ta(e, e.initialState({ prop: o })),
		onChange(t, n) {
			let { exiting: r, entering: i } = ra(e, n, t, u.current?.reenter);
			if (r.forEach((e) => {
				l.get(e.path)?.(), l.delete(e.path);
			}), r.forEach((e) => {
				v(e.state?.exit);
			}), v(u.current?.actions), i.forEach((e) => {
				let t = b(e.state?.effects);
				if (t) {
					let n = l.get(e.path);
					l.set(e.path, n ? oi(n, t) : t);
				}
			}), n === "__init__") {
				v(e.entry);
				let t = b(e.effects);
				if (t) {
					let e = l.get(ua);
					l.set(ua, e ? oi(e, t) : t);
				}
			}
			i.forEach((e) => {
				v(e.state?.entry);
			});
		}
	})), T = la.NotStarted;
	h(() => {
		let e = T === la.Started;
		T = la.Started, r(e ? "rehydrating..." : "initializing..."), w.invoke(w.initial, ua);
	}), i(() => {
		T === la.Started && (r("unmounting..."), T = la.Stopped, l.forEach((e) => e?.()), l = /* @__PURE__ */ new Map(), u.current = null, v(e.exit));
	});
	let E = (t) => {
		if (T !== la.Started) return;
		d.current = f.current, f.current = t;
		let n = w.get(), { transitions: i, source: a } = na(e, n, t.type), o = x(i);
		if (!o) return;
		u.current = o;
		let s = ta(e, o.target ?? n, a);
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
function Da(e) {
	return function(t) {
		return e()[t];
	};
}
function Oa(t) {
	e(() => {
		queueMicrotask(() => t());
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/tags.js
var ka = [
	"path",
	"rect",
	"circle",
	"ellipse",
	"line",
	"polygon",
	"polyline"
], Aa = (e) => typeof e == "string" && ka.includes(e), ja = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link"
], Ma = (e) => typeof e == "string" && ja.includes(e), Na = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"as",
	"ref"
]);
function Pa(t, n) {
	k(n, !0);
	let r = B(n, "as", 7), i = B(n, "ref", 15, null), a = H(n, Na);
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
W(Pa, {
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/factory/factory.svelte
var Fa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"asChild",
	"children",
	"as",
	"ref"
]), Ia = m("<textarea></textarea>");
function Y(t, n) {
	k(n, !0);
	let r = B(n, "asChild", 7), i = B(n, "children", 7), a = B(n, "as", 7), o = B(n, "ref", 15, null), s = H(n, Fa), c = (e) => J(s, e ?? {});
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
		Pa(e, I({ get as() {
			return a();
		} }, () => s, {
			get ref() {
				return o();
			},
			set ref(e) {
				o(e);
			}
		}));
	}, h = F(() => Aa(a())), g = (e) => {
		var t = p(), n = V(t);
		me(n, a, !1, (e, t) => {
			O(e, (e) => o(e), () => o()), j(e, () => ({ ...s }));
		}), R(e, t);
	}, _ = F(() => Ma(a())), v = (e) => {
		var t = Ia();
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
function La(e, t) {
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
var Ra = sa({
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
				let r = new (Je(n)).CustomEvent("exitcomplete", { bubbles: !1 });
				n.dispatchEvent(r);
			},
			setupNode: ({ refs: e, event: t }) => {
				e.get("node") !== t.node && (e.set("node", t.node), e.set("styles", $e(t.node)));
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
					let i = za(t.get("styles"));
					e.set("unmountAnimationName", i), i === "none" || i === e.get("prevAnimationName") || t.get("styles")?.display === "none" || t.get("styles")?.animationDuration === "0s" ? n({
						type: "UNMOUNT",
						src: "presence.changed"
					}) : n({ type: "UNMOUNT.SUSPEND" });
				});
			},
			setPrevAnimationName: ({ context: e, refs: t }) => {
				q(() => {
					e.set("prevAnimationName", za(t.get("styles")));
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
						let r = $e(e);
						if (za(r) === "none" || r.display === "none" || r.animationDuration === "0s") {
							n("onEnterComplete")?.();
							return;
						}
						let a = (t) => {
							Mt(t) === e && n("present") && (e.removeEventListener("animationend", a), n("onEnterComplete")?.());
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
					(n.composedPath?.()?.[0] ?? n.target) === i && e.set("prevAnimationName", za(t.get("styles")));
				}, o = (a) => {
					let o = za(t.get("styles"));
					Mt(a) === i && o === e.get("unmountAnimationName") && !r("present") && n({
						type: "UNMOUNT",
						src: "animationend"
					});
				}, s = (e) => {
					Mt(e) === i && !r("present") && n({
						type: "UNMOUNT",
						src: "animationcancel"
					});
				};
				i.addEventListener("animationstart", a), i.addEventListener("animationcancel", s), i.addEventListener("animationend", o);
				let c = Yn(i, { animationFillMode: "forwards" });
				return () => {
					i.removeEventListener("animationstart", a), i.removeEventListener("animationcancel", s), i.removeEventListener("animationend", o), vn(() => c());
				};
			}
		}
	}
});
function za(e) {
	return e?.animationName || "none";
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/presence/use-presence.svelte.js
var Ba = (e) => {
	let t = F(() => ni(e)), n = F(() => _r(S(t))), r = F(() => P(S(n), 2)), i = F(() => S(r)[0]), a = F(() => S(r)[1]), o = Ea(Ra, () => S(a)), s = F(() => La(o, va)), c = _(!1);
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
}, Va = (e) => pr()(e, [
	"immediate",
	"lazyMount",
	"onEnterComplete",
	"onExitComplete",
	"present",
	"skipAnimationOnMount",
	"unmountOnExit"
]), [Ha, Ua] = sr({ name: "PresenceContext" }), [Wa, Ga] = sr({ name: "DialogContext" }), Ka = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function qa(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ka), o = Ga(), s = Ua(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
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
W(qa, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-description.svelte
var Ja = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ya(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ja), a = Ga(), o = F(() => J(a().getDescriptionProps(), i));
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
W(Ya, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-positioner.svelte
var Xa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Za(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Xa), a = Ga(), o = Ua(), s = F(() => J(a().getPositionerProps(), i));
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
W(Za, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/providers/locale/use-locale-context.js
var [Qa, $a] = sr({
	name: "LocaleContext",
	strict: !1,
	defaultValue: () => ({
		dir: "ltr",
		locale: "en-US"
	})
});
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/utils.mjs
function eo(e, t) {
	return e - t * Math.floor(e / t);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/calendars/GregorianCalendar.mjs
var to = 1721426;
function no(e, t, n, r) {
	t = io(e, t);
	let i = t - 1, a = -2;
	return n <= 2 ? a = 0 : ro(t) && (a = -1), 1721425 + 365 * i + Math.floor(i / 4) - Math.floor(i / 100) + Math.floor(i / 400) + Math.floor((367 * n - 362) / 12 + a + r);
}
function ro(e) {
	return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
}
function io(e, t) {
	return e === "BC" ? 1 - t : t;
}
function ao(e) {
	let t = "AD";
	return e <= 0 && (t = "BC", e = 1 - e), [t, e];
}
var oo = {
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
}, so = class {
	fromJulianDay(e) {
		let t = e, n = t - to, r = Math.floor(n / 146097), i = eo(n, 146097), a = Math.floor(i / 36524), o = eo(i, 36524), s = Math.floor(o / 1461), c = eo(o, 1461), l = Math.floor(c / 365), [u, d] = ao(r * 400 + a * 100 + s * 4 + l + +(a !== 4 && l !== 4)), f = t - no(u, d, 1, 1), p = 2;
		t < no(u, d, 3, 1) ? p = 0 : ro(d) && (p = 1);
		let m = Math.floor(((f + p) * 12 + 373) / 367);
		return new zs(u, d, m, t - no(u, d, m, 1) + 1);
	}
	toJulianDay(e) {
		return no(e.era, e.year, e.month, e.day);
	}
	getDaysInMonth(e) {
		return oo[ro(e.year) ? "leapyear" : "standard"][e.month - 1];
	}
	getMonthsInYear(e) {
		return 12;
	}
	getDaysInYear(e) {
		return ro(e.year) ? 366 : 365;
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
}, co = {
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
function lo(e, t) {
	return t = rs(t, e.calendar), e.era === t.era && e.year === t.year && e.month === t.month && e.day === t.day;
}
function uo(e, t) {
	return t = rs(t, e.calendar), e = ko(e), t = ko(t), e.era === t.era && e.year === t.year && e.month === t.month;
}
function fo(e, t) {
	return t = rs(t, e.calendar), e = jo(e), t = jo(t), e.era === t.era && e.year === t.year;
}
function po(e, t) {
	return go(e.calendar, t.calendar) && lo(e, t);
}
function mo(e, t) {
	return go(e.calendar, t.calendar) && uo(e, t);
}
function ho(e, t) {
	return go(e.calendar, t.calendar) && fo(e, t);
}
function go(e, t) {
	return e.isEqual?.(t) ?? t.isEqual?.(e) ?? e.identifier === t.identifier;
}
function _o(e, t) {
	return lo(e, xo(t));
}
var vo = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};
function yo(e, t, n) {
	let r = e.calendar.toJulianDay(e), i = n ? vo[n] : Ro(t), a = Math.ceil(r + 1 - i) % 7;
	return a < 0 && (a += 7), a;
}
function bo(e) {
	return es(Date.now(), e);
}
function xo(e) {
	return ts(bo(e));
}
function So(e, t) {
	return e.calendar.toJulianDay(e) - t.calendar.toJulianDay(t);
}
function Co(e, t) {
	return wo(e) - wo(t);
}
function wo(e) {
	return e.hour * 36e5 + e.minute * 6e4 + e.second * 1e3 + e.millisecond;
}
var To = null, Eo = !1;
function Do() {
	return To ??= new Intl.DateTimeFormat().resolvedOptions().timeZone, To;
}
function Oo() {
	return Eo;
}
function ko(e) {
	return e.subtract({ days: e.day - 1 });
}
function Ao(e) {
	return e.add({ days: e.calendar.getDaysInMonth(e) - e.day });
}
function jo(e) {
	return ko(e.subtract({ months: e.month - 1 }));
}
function Mo(e) {
	return Ao(e.add({ months: e.calendar.getMonthsInYear(e) - e.month }));
}
function No(e, t, n) {
	let r = yo(e, t, n);
	return e.subtract({ days: r });
}
function Po(e, t, n) {
	return No(e, t, n).add({ days: 6 });
}
var Fo = /* @__PURE__ */ new Map(), Io = /* @__PURE__ */ new Map();
function Lo(e) {
	if (Intl.Locale) {
		let t = Fo.get(e);
		return t || (t = new Intl.Locale(e).maximize().region, t && Fo.set(e, t)), t;
	}
	let t = e.split("-")[1];
	return t === "u" ? void 0 : t;
}
function Ro(e) {
	let t = Io.get(e);
	if (!t) {
		if (Intl.Locale) {
			let n = new Intl.Locale(e);
			if ("getWeekInfo" in n && (t = n.getWeekInfo(), t)) return Io.set(e, t), t.firstDay;
		}
		let n = Lo(e);
		if (e.includes("-fw-")) {
			let n = e.split("-fw-")[1].split("-")[0];
			t = n === "mon" ? { firstDay: 1 } : n === "tue" ? { firstDay: 2 } : n === "wed" ? { firstDay: 3 } : n === "thu" ? { firstDay: 4 } : n === "fri" ? { firstDay: 5 } : n === "sat" ? { firstDay: 6 } : { firstDay: 0 };
		} else t = e.includes("-ca-iso8601") ? { firstDay: 1 } : { firstDay: n && co[n] || 0 };
		Io.set(e, t);
	}
	return t.firstDay;
}
function zo(e, t, n) {
	let r = e.calendar.getDaysInMonth(e);
	return Math.ceil((yo(ko(e), t, n) + r) / 7);
}
function Bo(e, t) {
	return e && t ? e.compare(t) <= 0 ? e : t : e || t;
}
function Vo(e, t) {
	return e && t ? e.compare(t) >= 0 ? e : t : e || t;
}
var Ho = {
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
function Uo(e, t) {
	let n = e.calendar.toJulianDay(e), r = Math.ceil(n + 1) % 7;
	r < 0 && (r += 7);
	let [i, a] = Ho[Lo(t)] || [6, 0];
	return r === i || r === a;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/conversion.mjs
function Wo(e) {
	return e = rs(e, new so()), Go(io(e.era, e.year), e.month, e.day, e.hour, e.minute, e.second, e.millisecond);
}
function Go(e, t, n, r, i, a, o) {
	let s = /* @__PURE__ */ new Date();
	return s.setUTCHours(r, i, a, o), s.setUTCFullYear(e, t - 1, n), s.getTime();
}
function Ko(e, t) {
	if (t === "UTC") return 0;
	if (e > 0 && t === Do() && !Oo()) return new Date(e).getTimezoneOffset() * -6e4;
	let { year: n, month: r, day: i, hour: a, minute: o, second: s } = Jo(e, t);
	return Go(n, r, i, a, o, s, 0) - Math.floor(e / 1e3) * 1e3;
}
var qo = /* @__PURE__ */ new Map();
function Jo(e, t) {
	let n = qo.get(t);
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
	}), qo.set(t, n));
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
var Yo = 864e5;
function Xo(e, t, n, r) {
	return (n === r ? [n] : [n, r]).filter((n) => Zo(e, t, n));
}
function Zo(e, t, n) {
	let r = Jo(n, t);
	return e.year === r.year && e.month === r.month && e.day === r.day && e.hour === r.hour && e.minute === r.minute && e.second === r.second;
}
function Qo(e, t, n = "compatible") {
	let r = ns(e);
	if (t === "UTC") return Wo(r);
	if (t === Do() && n === "compatible" && !Oo()) {
		r = rs(r, new so());
		let e = /* @__PURE__ */ new Date(), t = io(r.era, r.year);
		return e.setFullYear(t, r.month - 1, r.day), e.setHours(r.hour, r.minute, r.second, r.millisecond), e.getTime();
	}
	let i = Wo(r), a = Ko(i - Yo, t), o = Ko(i + Yo, t), s = Xo(r, t, i - a, i - o);
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
function $o(e, t, n = "compatible") {
	return new Date(Qo(e, t, n));
}
function es(e, t) {
	let n = Ko(e, t), r = new Date(e + n), i = r.getUTCFullYear(), a = r.getUTCMonth() + 1, o = r.getUTCDate(), s = r.getUTCHours(), c = r.getUTCMinutes(), l = r.getUTCSeconds(), u = r.getUTCMilliseconds();
	return new Vs(i < 1 ? "BC" : "AD", i < 1 ? -i + 1 : i, a, o, t, n, s, c, l, u);
}
function ts(e) {
	return new zs(e.calendar, e.era, e.year, e.month, e.day);
}
function ns(e, t) {
	let n = 0, r = 0, i = 0, a = 0;
	if ("timeZone" in e) ({hour: n, minute: r, second: i, millisecond: a} = e);
	else if ("hour" in e && !t) return e;
	return t && ({hour: n, minute: r, second: i, millisecond: a} = t), new Bs(e.calendar, e.era, e.year, e.month, e.day, n, r, i, a);
}
function rs(e, t) {
	if (go(e.calendar, t)) return e;
	let n = t.fromJulianDay(e.calendar.toJulianDay(e)), r = e.copy();
	return r.calendar = t, r.era = n.era, r.year = n.year, r.month = n.month, r.day = n.day, ps(r), r;
}
function is(e, t, n) {
	return e instanceof Vs ? e.timeZone === t ? e : os(e, t) : es(Qo(e, t, n), t);
}
function as(e) {
	let t = Wo(e) - e.offset;
	return new Date(t);
}
function os(e, t) {
	return rs(es(Wo(e) - e.offset, t), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/manipulation.mjs
var ss = 36e5;
function cs(e, t) {
	let n = e.copy(), r = "hour" in n ? xs(n, t) : 0;
	ls(n, t.years || 0), n.calendar.balanceYearMonth && n.calendar.balanceYearMonth(n, e), n.month += t.months || 0, us(n), fs(n), n.day += (t.weeks || 0) * 7, n.day += t.days || 0, n.day += r, ds(n), n.calendar.balanceDate && n.calendar.balanceDate(n), n.year < 1 && (n.year = 1, n.month = 1, n.day = 1);
	let i = n.calendar.getYearsInEra(n);
	if (n.year > i) {
		let e = n.calendar.isInverseEra?.(n);
		n.year = i, n.month = e ? 1 : n.calendar.getMonthsInYear(n), n.day = e ? 1 : n.calendar.getDaysInMonth(n);
	}
	n.month < 1 && (n.month = 1, n.day = 1);
	let a = n.calendar.getMonthsInYear(n);
	return n.month > a && (n.month = a, n.day = n.calendar.getDaysInMonth(n)), n.day = Math.max(1, Math.min(n.calendar.getDaysInMonth(n), n.day)), n;
}
function ls(e, t) {
	e.calendar.isInverseEra?.(e) && (t = -t), e.year += t;
}
function us(e) {
	for (; e.month < 1;) ls(e, -1), e.month += e.calendar.getMonthsInYear(e);
	let t = 0;
	for (; e.month > (t = e.calendar.getMonthsInYear(e));) e.month -= t, ls(e, 1);
}
function ds(e) {
	for (; e.day < 1;) e.month--, us(e), e.day += e.calendar.getDaysInMonth(e);
	for (; e.day > e.calendar.getDaysInMonth(e);) e.day -= e.calendar.getDaysInMonth(e), e.month++, us(e);
}
function fs(e) {
	e.month = Math.max(1, Math.min(e.calendar.getMonthsInYear(e), e.month)), e.day = Math.max(1, Math.min(e.calendar.getDaysInMonth(e), e.day));
}
function ps(e) {
	e.calendar.constrainDate && e.calendar.constrainDate(e), e.year = Math.max(1, Math.min(e.calendar.getYearsInEra(e), e.year)), fs(e);
}
function ms(e) {
	let t = {};
	for (let n in e) typeof e[n] == "number" && (t[n] = -e[n]);
	return t;
}
function hs(e, t) {
	return cs(e, ms(t));
}
function gs(e, t) {
	let n = e.copy();
	return t.era != null && (n.era = t.era), t.year != null && (n.year = t.year), t.month != null && (n.month = t.month), t.day != null && (n.day = t.day), ps(n), n;
}
function _s(e, t) {
	let n = e.copy();
	return t.hour != null && (n.hour = t.hour), t.minute != null && (n.minute = t.minute), t.second != null && (n.second = t.second), t.millisecond != null && (n.millisecond = t.millisecond), ys(n), n;
}
function vs(e) {
	e.second += Math.floor(e.millisecond / 1e3), e.millisecond = bs(e.millisecond, 1e3), e.minute += Math.floor(e.second / 60), e.second = bs(e.second, 60), e.hour += Math.floor(e.minute / 60), e.minute = bs(e.minute, 60);
	let t = Math.floor(e.hour / 24);
	return e.hour = bs(e.hour, 24), t;
}
function ys(e) {
	e.millisecond = Math.max(0, Math.min(e.millisecond, 999)), e.second = Math.max(0, Math.min(e.second, 59)), e.minute = Math.max(0, Math.min(e.minute, 59)), e.hour = Math.max(0, Math.min(e.hour, 23));
}
function bs(e, t) {
	let n = e % t;
	return n < 0 && (n += t), n;
}
function xs(e, t) {
	return e.hour += t.hours || 0, e.minute += t.minutes || 0, e.second += t.seconds || 0, e.millisecond += t.milliseconds || 0, vs(e);
}
function Ss(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "era": {
			let t = e.calendar.getEras(), a = t.indexOf(e.era);
			if (a < 0) throw Error("Invalid era: " + e.era);
			a = ws(a, n, 0, t.length - 1, r?.round), i.era = t[a], ps(i);
			break;
		}
		case "year":
			i.calendar.isInverseEra?.(i) && (n = -n), i.year = ws(e.year, n, -Infinity, 9999, r?.round), i.year === -Infinity && (i.year = 1), i.calendar.balanceYearMonth && i.calendar.balanceYearMonth(i, e);
			break;
		case "month":
			i.month = ws(e.month, n, 1, e.calendar.getMonthsInYear(e), r?.round);
			break;
		case "day":
			i.day = ws(e.day, n, 1, e.calendar.getDaysInMonth(e), r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return e.calendar.balanceDate && e.calendar.balanceDate(i), ps(i), i;
}
function Cs(e, t, n, r) {
	let i = e.copy();
	switch (t) {
		case "hour": {
			let t = e.hour, a = 0, o = 23;
			if (r?.hourCycle === 12) {
				let e = t >= 12;
				a = e ? 12 : 0, o = e ? 23 : 11;
			}
			i.hour = ws(t, n, a, o, r?.round);
			break;
		}
		case "minute":
			i.minute = ws(e.minute, n, 0, 59, r?.round);
			break;
		case "second":
			i.second = ws(e.second, n, 0, 59, r?.round);
			break;
		case "millisecond":
			i.millisecond = ws(e.millisecond, n, 0, 999, r?.round);
			break;
		default: throw Error("Unsupported field " + t);
	}
	return i;
}
function ws(e, t, n, r, i = !1) {
	if (i) {
		e += Math.sign(t), e < n && (e = r);
		let i = Math.abs(t);
		e = t > 0 ? Math.ceil(e / i) * i : Math.floor(e / i) * i, e > r && (e = n);
	} else e += t, e < n ? e = r - (n - e - 1) : e > r && (e = n + (e - r - 1));
	return e;
}
function Ts(e, t) {
	let n;
	return n = t.years != null && t.years !== 0 || t.months != null && t.months !== 0 || t.weeks != null && t.weeks !== 0 || t.days != null && t.days !== 0 ? Qo(cs(ns(e), {
		years: t.years,
		months: t.months,
		weeks: t.weeks,
		days: t.days
	}), e.timeZone) : Wo(e) - e.offset, n += t.milliseconds || 0, n += (t.seconds || 0) * 1e3, n += (t.minutes || 0) * 6e4, n += (t.hours || 0) * 36e5, rs(es(n, e.timeZone), e.calendar);
}
function Es(e, t) {
	return Ts(e, ms(t));
}
function Ds(e, t, n, r) {
	switch (t) {
		case "hour": {
			let t = 0, i = 23;
			if (r?.hourCycle === 12) {
				let n = e.hour >= 12;
				t = n ? 12 : 0, i = n ? 23 : 11;
			}
			let a = ns(e), o = rs(_s(a, { hour: t }), new so()), s = [Qo(o, e.timeZone, "earlier"), Qo(o, e.timeZone, "later")].filter((t) => es(t, e.timeZone).day === o.day)[0], c = rs(_s(a, { hour: i }), new so()), l = [Qo(c, e.timeZone, "earlier"), Qo(c, e.timeZone, "later")].filter((t) => es(t, e.timeZone).day === c.day).pop(), u = Wo(e) - e.offset, d = Math.floor(u / ss), f = u % ss;
			return u = ws(d, n, Math.floor(s / ss), Math.floor(l / ss), r?.round) * ss + f, rs(es(u, e.timeZone), e.calendar);
		}
		case "minute":
		case "second":
		case "millisecond": return Cs(e, t, n, r);
		case "era":
		case "year":
		case "month":
		case "day": return rs(es(Qo(Ss(ns(e), t, n, r), e.timeZone), e.timeZone), e.calendar);
		default: throw Error("Unsupported field " + t);
	}
}
function Os(e, t, n) {
	let r = ns(e), i = _s(gs(r, t), t);
	return i.compare(r) === 0 ? e : rs(es(Qo(i, e.timeZone, n), e.timeZone), e.calendar);
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/string.mjs
var ks = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})$/, As = /^([+-]\d{6}|\d{4})-(\d{2})-(\d{2})(?:T(\d{2}))?(?::(\d{2}))?(?::(\d{2}))?(\.\d+)?(?:(?:([+-]\d{2})(?::?(\d{2}))?)|Z)$/;
function js(e) {
	let t = e.match(ks);
	if (!t) throw As.test(e) ? Error(`Invalid ISO 8601 date string: ${e}. Use parseAbsolute() instead.`) : Error("Invalid ISO 8601 date string: " + e);
	let n = new zs(Ms(t[1], 0, 9999), Ms(t[2], 1, 12), 1);
	return n.day = Ms(t[3], 1, n.calendar.getDaysInMonth(n)), n;
}
function Ms(e, t, n) {
	let r = Number(e);
	if (r < t || r > n) throw RangeError(`Value out of range: ${t} <= ${r} <= ${n}`);
	return r;
}
function Ns(e) {
	return `${String(e.hour).padStart(2, "0")}:${String(e.minute).padStart(2, "0")}:${String(e.second).padStart(2, "0")}${e.millisecond ? String(e.millisecond / 1e3).slice(1) : ""}`;
}
function Ps(e) {
	let t = rs(e, new so()), n;
	return n = t.era === "BC" ? t.year === 1 ? "0000" : "-" + String(Math.abs(1 - t.year)).padStart(6, "00") : String(t.year).padStart(4, "0"), `${n}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}
function Fs(e) {
	return `${Ps(e)}T${Ns(e)}`;
}
function Is(e) {
	let t = Math.sign(e) < 0 ? "-" : "+";
	e = Math.abs(e);
	let n = Math.floor(e / 36e5), r = Math.floor(e % 36e5 / 6e4), i = Math.floor(e % 36e5 % 6e4 / 1e3), a = `${t}${String(n).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
	return i !== 0 && (a += `:${String(i).padStart(2, "0")}`), a;
}
function Ls(e) {
	return `${Fs(e)}${Is(e.offset)}[${e.timeZone}]`;
}
//#endregion
//#region ../../node_modules/.pnpm/@internationalized+date@3.12.4/node_modules/@internationalized/date/dist/private/CalendarDate.mjs
function Rs(e) {
	let t = typeof e[0] == "object" ? e.shift() : new so(), n;
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
var zs = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Rs(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, ps(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day) : new e(this.calendar, this.year, this.month, this.day);
	}
	add(e) {
		return cs(this, e);
	}
	subtract(e) {
		return hs(this, e);
	}
	set(e) {
		return gs(this, e);
	}
	cycle(e, t, n) {
		return Ss(this, e, t, n);
	}
	toDate(e) {
		return $o(this, e);
	}
	toString() {
		return Ps(this);
	}
	compare(e) {
		return So(this, e);
	}
}, Bs = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Rs(e);
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, ps(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return cs(this, e);
	}
	subtract(e) {
		return hs(this, e);
	}
	set(e) {
		return gs(_s(this, e), e);
	}
	cycle(e, t, n) {
		switch (e) {
			case "era":
			case "year":
			case "month":
			case "day": return Ss(this, e, t, n);
			default: return Cs(this, e, t, n);
		}
	}
	toDate(e, t) {
		return $o(this, e, t);
	}
	toString() {
		return Fs(this);
	}
	compare(e) {
		let t = So(this, e);
		return t === 0 ? Co(this, ns(e)) : t;
	}
}, Vs = class e {
	constructor(...e) {
		let [t, n, r, i, a] = Rs(e), o = e.shift(), s = e.shift();
		this.calendar = t, this.era = n, this.year = r, this.month = i, this.day = a, this.timeZone = o, this.offset = s, this.hour = e.shift() || 0, this.minute = e.shift() || 0, this.second = e.shift() || 0, this.millisecond = e.shift() || 0, ps(this);
	}
	copy() {
		return this.era ? new e(this.calendar, this.era, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond) : new e(this.calendar, this.year, this.month, this.day, this.timeZone, this.offset, this.hour, this.minute, this.second, this.millisecond);
	}
	add(e) {
		return Ts(this, e);
	}
	subtract(e) {
		return Es(this, e);
	}
	set(e, t) {
		return Os(this, e, t);
	}
	cycle(e, t, n) {
		return Ds(this, e, t, n);
	}
	toDate() {
		return as(this);
	}
	toString() {
		return Ls(this);
	}
	toAbsoluteString() {
		return this.toDate().toISOString();
	}
	compare(e) {
		return this.toDate().getTime() - is(e, this.timeZone).toDate().getTime();
	}
}, Hs = /* @__PURE__ */ new Map(), Us = class {
	constructor(e, t = {}) {
		this.formatter = Gs(e, t), this.options = t;
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
		return Ys() && (this.resolvedHourCycle ||= Xs(e.locale, this.options), e.hourCycle = this.resolvedHourCycle, e.hour12 = this.resolvedHourCycle === "h11" || this.resolvedHourCycle === "h12"), e.calendar === "ethiopic-amete-alem" && (e.calendar = "ethioaa"), e;
	}
}, Ws = {
	true: { ja: "h11" },
	false: {}
};
function Gs(e, t = {}) {
	if (typeof t.hour12 == "boolean" && qs()) {
		t = { ...t };
		let n = Ws[String(t.hour12)][e.split("-")[0]], r = t.hour12 ? "h12" : "h23";
		t.hourCycle = n ?? r, delete t.hour12;
	}
	let n = e + (t ? Object.entries(t).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
	if (Hs.has(n)) return Hs.get(n);
	let r = new Intl.DateTimeFormat(e, t);
	return Hs.set(n, r), r;
}
var Ks = null;
function qs() {
	return Ks ??= new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		hour12: !1
	}).format(new Date(2020, 2, 3, 0)) === "24", Ks;
}
var Js = null;
function Ys() {
	return Js ??= new Intl.DateTimeFormat("fr", {
		hour: "numeric",
		hour12: !1
	}).resolvedOptions().hourCycle === "h12", Js;
}
function Xs(e, t) {
	if (!t.timeStyle && !t.hour) return;
	e = e.replace(/(-u-)?-nu-[a-zA-Z0-9]+/, ""), e += (e.includes("-u-") ? "" : "-u") + "-nu-latn";
	let n = Gs(e, {
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
var Zs = (e, t = []) => ({
	parts: (...n) => {
		if ($s(t)) return Zs(e, n);
		throw Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
	},
	extendWith: (...n) => Zs(e, [...t, ...n]),
	omit: (...n) => Zs(e, t.filter((e) => !n.includes(e))),
	rename: (e) => Zs(e, t),
	keys: () => t,
	build: () => [...new Set(t)].reduce((t, n) => Object.assign(t, { [n]: {
		selector: [`&[data-scope="${Qs(e)}"][data-part="${Qs(n)}"]`, `& [data-scope="${Qs(e)}"][data-part="${Qs(n)}"]`].join(", "),
		attrs: {
			"data-scope": Qs(e),
			"data-part": Qs(n)
		}
	} }), {})
}), Qs = (e) => e.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase(), $s = (e) => e.length === 0, ec = Zs("dialog").parts("trigger", "backdrop", "positioner", "content", "title", "description", "closeTrigger").build(), tc = (e) => e.ids?.positioner ?? `dialog:${e.id}:positioner`, nc = (e) => e.ids?.backdrop ?? `dialog:${e.id}:backdrop`, rc = (e) => e.ids?.content ?? `dialog:${e.id}:content`, ic = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `dialog:${e.id}:trigger:${t}` : `dialog:${e.id}:trigger` : Kr(n) ? n(t) : n;
}, ac = (e) => e.ids?.title ?? `dialog:${e.id}:title`, oc = (e) => e.ids?.description ?? `dialog:${e.id}:description`, sc = (e) => e.ids?.closeTrigger ?? `dialog:${e.id}:close`, cc = (e) => e.getById(rc(e)), lc = (e) => e.getById(tc(e)), uc = (e) => e.getById(nc(e)), dc = (e) => e.getById(ic(e)), fc = (e) => e.getById(ac(e)), pc = (e) => e.getById(oc(e)), mc = (e) => e.getById(sc(e)), hc = (e) => Rn(e.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${Oe(e.id)}`), gc = (e, t) => t == null ? dc(e) ?? hc(e)[0] : e.getById(ic(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.connect.mjs
function _c(e, t) {
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
				...ec.trigger.attrs,
				dir: a("dir"),
				id: ic(o, n),
				"data-ownedby": o.id,
				"data-value": n,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": n == null ? c : c && i,
				"data-state": c ? "open" : "closed",
				"aria-controls": rc(o),
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
				...ec.backdrop.attrs,
				dir: a("dir"),
				hidden: !c,
				id: nc(o),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...ec.positioner.attrs,
				dir: a("dir"),
				id: tc(o),
				style: bi({ pointerEvents: !c || !a("modal") ? "none" : void 0 })
			});
		},
		getContentProps() {
			let e = i.get("rendered");
			return t.element({
				...ec.content.attrs,
				dir: a("dir"),
				role: a("role"),
				hidden: !c,
				id: rc(o),
				tabIndex: -1,
				"data-state": c ? "open" : "closed",
				"aria-modal": a("modal"),
				"aria-label": s || void 0,
				"aria-labelledby": s || !e.title ? void 0 : ac(o),
				"aria-describedby": e.description ? oc(o) : void 0,
				style: bi({ pointerEvents: a("modal") ? void 0 : "auto" })
			});
		},
		getTitleProps() {
			return t.element({
				...ec.title.attrs,
				dir: a("dir"),
				id: ac(o)
			});
		},
		getDescriptionProps() {
			return t.element({
				...ec.description.attrs,
				dir: a("dir"),
				id: oc(o)
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...ec.closeTrigger.attrs,
				dir: a("dir"),
				id: sc(o),
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
var vc = /* @__PURE__ */ new WeakMap(), yc = /* @__PURE__ */ new WeakMap(), bc = {}, xc = 0, Sc = (e) => e && (e.host || Sc(e.parentNode)), Cc = (e, t) => t.map((t) => {
	if (e.contains(t)) return t;
	let n = Sc(t);
	return n && e.contains(n) ? n : (console.error("[zag-js > ariaHidden] target", t, "in not contained inside", e, ". Doing nothing"), null);
}).filter((e) => !!e), wc = /* @__PURE__ */ new Set([
	"script",
	"output",
	"status",
	"next-route-announcer"
]), Tc = (e) => wc.has(e.localName) || e.role === "status" || e.hasAttribute("aria-live") ? !0 : e.matches("[data-live-announcer]"), Ec = (e, t) => {
	let { parentNode: n, markerName: r, controlAttribute: i, explicitBooleanValue: a, followControlledElements: o = !0 } = t, s = Cc(n, Array.isArray(e) ? e : [e]);
	bc[r] || (bc[r] = /* @__PURE__ */ new WeakMap());
	let c = bc[r], l = [], u = /* @__PURE__ */ new Set(), d = new Set(s), f = (e) => {
		e && !u.has(e) && (u.add(e), f(e.parentNode));
	};
	s.forEach((e) => {
		f(e), o && Me(e) && it(e, (e) => {
			f(e);
		});
	});
	let p = (e) => {
		e && !d.has(e) && Array.prototype.forEach.call(e.children, (e) => {
			if (u.has(e)) p(e);
			else try {
				if (Tc(e)) return;
				let t = e.getAttribute(i), n = a ? t === "true" : t !== null && t !== "false", o = (vc.get(e) || 0) + 1, s = (c.get(e) || 0) + 1;
				vc.set(e, o), c.set(e, s), l.push(e), o === 1 && n && yc.set(e, !0), s === 1 && e.setAttribute(r, ""), n || e.setAttribute(i, a ? "true" : "");
			} catch (t) {
				console.error("[zag-js > ariaHidden] cannot operate on ", e, t);
			}
		});
	};
	return p(n), u.clear(), xc++, () => {
		l.forEach((e) => {
			let t = vc.get(e) - 1, n = c.get(e) - 1;
			vc.set(e, t), c.set(e, n), t || (yc.has(e) || e.removeAttribute(i), yc.delete(e)), n || e.removeAttribute(r);
		}), xc--, xc || (vc = /* @__PURE__ */ new WeakMap(), vc = /* @__PURE__ */ new WeakMap(), yc = /* @__PURE__ */ new WeakMap(), bc = {});
	};
}, Dc = (e) => (Array.isArray(e) ? e[0] : e).ownerDocument.body, Oc = (e, t = Dc(e), n = "data-aria-hidden", r = !0) => {
	if (t) return Ec(e, {
		parentNode: t,
		markerName: n,
		controlAttribute: "aria-hidden",
		explicitBooleanValue: !0,
		followControlledElements: r
	});
}, kc = (e) => {
	let t = requestAnimationFrame(() => e());
	return () => cancelAnimationFrame(t);
};
function Ac(e, t = {}) {
	let { defer: n = !0 } = t, r = n ? kc : (e) => e(), i = [];
	return i.push(r(() => {
		let t = (typeof e == "function" ? e() : e).filter(Boolean);
		t.length !== 0 && i.push(Oc(t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function jc(e) {
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
function Mc(e) {
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
var Nc = "pointerdown.outside", Pc = "focus.outside";
function Fc(e) {
	for (let t of e) if (Me(t) && un(t)) return !0;
	return !1;
}
var Ic = (e) => "clientY" in e;
function Lc(e, t) {
	if (!Ic(t) || !e) return !1;
	let n = e.getBoundingClientRect();
	return n.width === 0 || n.height === 0 ? !1 : n.top <= t.clientY && t.clientY <= n.top + n.height && n.left <= t.clientX && t.clientX <= n.left + n.width;
}
function Rc(e, t) {
	return e.y <= t.y && t.y <= e.y + e.height && e.x <= t.x && t.x <= e.x + e.width;
}
function zc(e, t) {
	if (!t || !Ic(e)) return !1;
	let n = t.scrollHeight > t.clientHeight, r = n && e.clientX > t.offsetLeft + t.clientWidth, i = t.scrollWidth > t.clientWidth, a = i && e.clientY > t.offsetTop + t.clientHeight;
	return Rc({
		x: t.offsetLeft,
		y: t.offsetTop,
		width: t.clientWidth + (n ? 16 : 0),
		height: t.clientHeight + (i ? 16 : 0)
	}, {
		x: e.clientX,
		y: e.clientY
	}) ? r || a : !1;
}
function Bc(e, t) {
	let { exclude: n, onFocusOutside: r, onPointerDownOutside: i, onInteractOutside: a, defer: o, followControlledElements: s = !0 } = t;
	if (!e) return;
	let c = Ke(e), l = Je(e), u = jc(l), d = Mc(l);
	function f(t, r) {
		if (!Me(r) || !r.isConnected || Ge(e, r) || Lc(e, t) || s && rt(e, r)) return !1;
		let i = c.querySelector(`[aria-controls="${e.id}"]`);
		return i && zc(t, Cn(i)) || zc(t, Cn(e)) ? !1 : !n?.(r);
	}
	let p = /* @__PURE__ */ new Set(), m = Re(e?.getRootNode()), h = !1;
	function g(t) {
		h = !0;
		let n = () => {
			h = !1;
		};
		c.addEventListener("pointerup", n, { once: !0 }), l.addEventListener("pointerup", n, { once: !0 });
		function r(n) {
			let r = o && !St() ? q : (e) => e(), s = n ?? t, c = s?.composedPath?.() ?? [s?.target];
			r(() => {
				let n = m ? c[0] : Mt(t);
				if (e && f(t, n)) {
					if (i || a) {
						let t = oi(i, a);
						e.addEventListener(Nc, t, { once: !0 });
					}
					Hc(e, Nc, {
						bubbles: !1,
						cancelable: !0,
						detail: {
							originalEvent: s,
							contextmenu: Bt(s),
							focusable: Fc(c),
							target: n
						}
					});
				}
			});
		}
		t.pointerType === "touch" ? (p.forEach((e) => e()), p.add(Jt(c, "click", r, { once: !0 })), p.add(d.addEventListener("click", r, { once: !0 })), p.add(u.addEventListener("click", r, { once: !0 }))) : r();
	}
	let _ = /* @__PURE__ */ new Set(), v = setTimeout(() => {
		_.add(Jt(c, "pointerdown", g, !0)), _.add(d.addEventListener("pointerdown", g, !0)), _.add(u.addEventListener("pointerdown", g, !0));
	}, 0);
	function y(t) {
		h || (o ? q : (e) => e())(() => {
			let n = t?.composedPath?.() ?? [t?.target], i = m ? n[0] : Mt(t);
			if (e && f(t, i)) {
				if (r || a) {
					let t = oi(r, a);
					e.addEventListener(Pc, t, { once: !0 });
				}
				Hc(e, Pc, {
					bubbles: !1,
					cancelable: !0,
					detail: {
						originalEvent: t,
						contextmenu: !1,
						focusable: un(i),
						target: i
					}
				});
			}
		});
	}
	return St() || (_.add(Jt(c, "focusin", y, !0)), _.add(d.addEventListener("focusin", y, !0)), _.add(u.addEventListener("focusin", y, !0))), () => {
		clearTimeout(v), p.forEach((e) => e()), _.forEach((e) => e());
	};
}
function Vc(e, t) {
	let { defer: n } = t, r = n ? q : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push(Bc(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function Hc(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, n);
	return e.dispatchEvent(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function Uc(e, t) {
	return Jt(Ke(e), "keydown", (e) => {
		e.key === "Escape" && (e.isComposing || t?.(e));
	}, { capture: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
var Wc = "layer:request-dismiss", Gc = {
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
		return !!(this.getNestedLayers(e).some((e) => Ge(e.node, t)) || this.recentlyRemoved.size > 0);
	},
	isInBranch(e) {
		return Array.from(this.branches).some((t) => Ge(t, e));
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
			t && qc(t);
		}), this.recentlyRemoved.add(e), vn(() => this.recentlyRemoved.delete(e)), t < this.count() - 1 && this.getNestedLayers(e).forEach((t) => Gc.dismiss(t.node, e)), this.layers.splice(t, 1), this.syncLayers());
	},
	removeBranch(e) {
		let t = this.branches.indexOf(e);
		t >= 0 && this.branches.splice(t, 1);
	},
	syncLayers() {
		this.layers.forEach((e, t) => {
			Kc(e, t, e.node), e.styleTargets?.forEach((n) => {
				let r = n();
				if (!r || r === e.node) return;
				Kc(e, t, r);
				let { zIndex: i } = $e(e.node);
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
		Yc(e, Wc, (e) => {
			r.requestDismiss?.(e), e.defaultPrevented || r?.dismiss();
		}), Jc(e, Wc, {
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
function Kc(e, t, n) {
	n.style.setProperty("--layer-index", `${t}`), n.removeAttribute("data-nested"), n.removeAttribute("data-has-nested"), Gc.getParentLayerOfType(e.node, e.type) && n.setAttribute("data-nested", e.type);
	let r = Gc.countNestedLayersOfType(e.node, e.type);
	r > 0 && n.setAttribute("data-has-nested", e.type), n.style.setProperty("--nested-layer-count", `${r}`);
}
function qc(e) {
	e.style.removeProperty("--layer-index"), e.style.removeProperty("--nested-layer-count"), e.style.removeProperty("--z-index"), e.removeAttribute("data-nested"), e.removeAttribute("data-has-nested");
}
function Jc(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, {
		cancelable: !0,
		bubbles: !0,
		detail: n
	});
	return e.dispatchEvent(r);
}
function Yc(e, t, n) {
	e.addEventListener(t, n, { once: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
var Xc = /* @__PURE__ */ new WeakMap(), Zc = /* @__PURE__ */ new WeakMap();
function Qc(e) {
	return Gc.isBelowPointerBlockingLayer(e) ? "none" : "auto";
}
function $c(e) {
	let t = Qc(e);
	e.style.pointerEvents !== t && (e.style.pointerEvents = t);
}
function el(e) {
	if (Zc.has(e)) return;
	let t = Je(e);
	if (t.MutationObserver === void 0) return;
	let n = new t.MutationObserver(() => {
		Zc.has(e) && $c(e);
	});
	n.observe(e, {
		attributes: !0,
		attributeFilter: ["style"]
	}), Zc.set(e, n);
}
function tl() {
	Gc.layers.forEach(({ node: e }) => {
		$c(e), el(e);
	});
}
function nl(e) {
	let t = Zc.get(e);
	t && (t.disconnect(), Zc.delete(e)), e.style.pointerEvents = "";
}
function rl(e, t) {
	let n = Ke(e), r = [];
	return Gc.hasPointerBlockingLayer() && !n.body.hasAttribute("data-inert") && (Xc.set(n.body, n.body.style.pointerEvents), queueMicrotask(() => {
		let e = n.body;
		e && (e.style.pointerEvents = "none", e.setAttribute("data-inert", ""));
	})), t?.forEach((e) => {
		let [t, n] = nr(() => {
			let t = e();
			return Me(t) ? t : null;
		}, { timeout: 1e3 });
		t.then((e) => r.push(Yn(e, { pointerEvents: "auto" }))), r.push(n);
	}), () => {
		Gc.hasPointerBlockingLayer() || (queueMicrotask(() => {
			let e = n.body;
			if (!e) return;
			let t = Xc.get(e);
			t !== void 0 && (e.style.pointerEvents = t, Xc.delete(e)), e.removeAttribute("data-inert"), e.style.length === 0 && e.removeAttribute("style");
		}), r.forEach((e) => e()));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function il(e, t) {
	let { onDismiss: n, onRequestDismiss: r, pointerBlocking: i, exclude: a, debug: o, type: s = "dialog", layerStyleTargets: c } = t, l = {
		dismiss: n,
		node: e,
		type: s,
		pointerBlocking: i,
		requestDismiss: r,
		styleTargets: c
	};
	Gc.add(l), tl();
	function u(r) {
		let i = Mt(r.detail.originalEvent);
		Gc.isBelowPointerBlockingLayer(e) || Gc.isInBranch(i) || (t.onPointerDownOutside?.(r), t.onInteractOutside?.(r), !r.defaultPrevented && (o && console.log("onPointerDownOutside:", r.detail.originalEvent), n?.()));
	}
	function d(e) {
		let r = Mt(e.detail.originalEvent);
		Gc.isInBranch(r) || (t.onFocusOutside?.(e), t.onInteractOutside?.(e), !e.defaultPrevented && (o && console.log("onFocusOutside:", e.detail.originalEvent), n?.()));
	}
	function f(r) {
		Gc.isTopMost(e) && (t.onEscapeKeyDown?.(r), !r.defaultPrevented && n && (r.preventDefault(), n()));
	}
	function p(n) {
		let r = typeof a == "function" ? a() : a, i = Array.isArray(r) ? r : [r], o = t.persistentElements?.map((e) => e()).filter(Me);
		return o && i.push(...o), i.some((e) => Ge(e, n)) || Gc.isInNestedLayer(e, n);
	}
	let m = [
		i ? rl(e, t.persistentElements) : void 0,
		Uc(e, f),
		Vc(e, {
			exclude: p,
			onFocusOutside: d,
			onPointerDownOutside: u,
			defer: t.defer
		})
	];
	return () => {
		Gc.remove(e), tl(), nl(e), m.forEach((e) => e?.());
	};
}
function al(e, t) {
	let { warnOnMissingNode: n = !0 } = t;
	return rr(e, (e) => il(e, t), {
		defer: t.defer,
		onMissing: n ? () => Di("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
	});
}
function ol(e, t = {}) {
	return rr(e, (e) => (Gc.addBranch(e), () => {
		Gc.removeBranch(e);
	}), {
		defer: t.defer,
		onMissing: () => Di("[@zag-js/dismissable] branch node is `null` or `undefined`")
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/chunk-QZ7TP4HQ.mjs
var sl = Object.defineProperty, cl = (e, t, n) => t in e ? sl(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, X = (e, t, n) => cl(e, typeof t == "symbol" ? t : t + "", n), ll = {
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
}, ul = [], dl = class {
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
			let t = Mt(e), n = this.findContainerIndex(t, e) >= 0;
			if (n || Ne(t)) n && (this.state.mostRecentlyFocusedNode = t);
			else {
				e.stopImmediatePropagation();
				let t, n = !0;
				if (this.state.mostRecentlyFocusedNode) {
					if (mn(this.state.mostRecentlyFocusedNode) > 0) {
						let e = this.findContainerIndex(this.state.mostRecentlyFocusedNode), { tabbableNodes: r } = this.state.containerGroups[e];
						if (r.length > 0) {
							let e = r.findIndex((e) => e === this.state.mostRecentlyFocusedNode);
							e >= 0 && (this.config.isKeyForward(this.state.recentNavEvent) ? e + 1 < r.length && (t = r[e + 1], n = !1) : e - 1 >= 0 && (t = r[e - 1], n = !1));
						}
					} else this.state.containerGroups.some((e) => e.tabbableNodes.some((e) => mn(e) > 0)) || (n = !1);
				} else n = !1;
				n && (t = this.findNextNavNode({
					target: this.state.mostRecentlyFocusedNode,
					isBackward: this.config.isKeyBackward(this.state.recentNavEvent)
				})), t ? this.tryFocus(t) : this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode());
			}
			this.state.recentNavEvent = void 0;
		}), X(this, "handlePointerDown", (e) => {
			this.lastInteractionType = "pointer";
			let t = Mt(e);
			if (!(this.findContainerIndex(t, e) >= 0)) {
				if (gl(this.config.clickOutsideDeactivates, e)) {
					this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
					return;
				}
				gl(this.config.allowOutsideClick, e) || e.preventDefault();
			}
		}), X(this, "handleClick", (e) => {
			let t = Mt(e);
			this.findContainerIndex(t, e) >= 0 || gl(this.config.clickOutsideDeactivates, e) || gl(this.config.allowOutsideClick, e) || (e.preventDefault(), e.stopImmediatePropagation());
		}), X(this, "handleTabKey", (e) => {
			if (this.lastInteractionType = "keyboard", this.config.isKeyForward(e) || this.config.isKeyBackward(e)) {
				this.state.recentNavEvent = e;
				let t = this.config.isKeyBackward(e), n = this.findNextNavNode({
					event: e,
					isBackward: t
				});
				if (!n) return;
				pl(e) && e.preventDefault(), this.tryFocus(n);
			}
		}), X(this, "handleEscapeKey", (e) => {
			_l(e) && gl(this.config.escapeDeactivates, e) !== !1 && (e.preventDefault(), this.deactivate());
		}), X(this, "_mutationObserver"), X(this, "setupMutationObserver", () => {
			let e = this.doc.defaultView || window;
			this._mutationObserver = new e.MutationObserver((e) => {
				e.some((e) => Array.from(e.removedNodes).some((e) => e === this.state.mostRecentlyFocusedNode)) && this.tryFocus(this.getInitialFocusNode()), e.some((e) => e.type === "attributes" && (e.attributeName === "aria-controls" || e.attributeName === "aria-expanded") || e.type === "childList" && e.addedNodes.length > 0 && Array.from(e.addedNodes).some((e) => {
					if (e.nodeType !== Node.ELEMENT_NODE) return !1;
					let t = e;
					return ct(t) ? !0 : t.id && !this.state.containers.some((e) => e.contains(t)) ? lt(t) : !1;
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
			if (e === void 0 || e && !un(e)) {
				let t = Ye(this.doc);
				if (t && this.findContainerIndex(t) >= 0) e = t;
				else {
					let t = this.state.tabbableGroups[0];
					e = t && t.firstTabbableNode || this.getNodeForOption("fallbackFocus");
				}
			} else e === null && (e = this.getNodeForOption("fallbackFocus"));
			if (!e || (e.isConnected || (e = this.getNodeForOption("fallbackFocus")), !e || !e.isConnected)) throw Error("Your focus-trap needs to have at least one focusable element");
			return e;
		}), X(this, "tryFocus", (e, t) => {
			if (e !== !1 && e !== Ye(this.doc)) {
				if (!e || !e.focus) {
					this.tryFocus(this.getInitialFocusNode());
					return;
				}
				e.focus({
					preventScroll: !!this.config.preventScroll,
					...t
				}), this.state.mostRecentlyFocusedNode = e, yl(e) && e.select();
			}
		}), X(this, "deactivate", (e) => {
			if (!this.state.active) return this;
			let t = {
				onDeactivate: this.config.onDeactivate,
				onPostDeactivate: this.config.onPostDeactivate,
				checkCanReturnFocus: this.config.checkCanReturnFocus,
				...e
			};
			clearTimeout(this.state.delayInitialFocusTimer), this.state.delayInitialFocusTimer = void 0, this.removeListeners(), this.state.active = !1, this.state.paused = !1, this.updateObservedNodes(), ll.deactivateTrap(this.trapStack, this), this.portalContainers.clear();
			let n = this.getOption(t, "onDeactivate"), r = this.getOption(t, "onPostDeactivate"), i = this.getOption(t, "checkCanReturnFocus"), a = this.getOption(t, "returnFocus", "returnFocusOnDeactivate");
			n?.();
			let o = () => {
				vl(() => {
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
			let { event: t, isBackward: n = !1 } = e, r = e.target || Mt(t);
			this.updateTabbableNodes();
			let i = null;
			if (this.state.tabbableGroups.length > 0) {
				let e = this.findContainerIndex(r, t), a = e >= 0 ? this.state.containerGroups[e] : void 0;
				if (e < 0) i = n ? this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode : this.state.tabbableGroups[0].firstTabbableNode;
				else if (n) {
					let n = this.state.tabbableGroups.findIndex(({ firstTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || un(r) && !fn(r) && !a?.nextTabbableNode(r, !1)) && (n = e), n >= 0) {
						let e = n === 0 ? this.state.tabbableGroups.length - 1 : n - 1, t = this.state.tabbableGroups[e];
						i = mn(r) >= 0 ? t.lastTabbableNode : t.lastDomTabbableNode;
					} else pl(t) || (i = a?.nextTabbableNode(r, !1));
				} else {
					let n = this.state.tabbableGroups.findIndex(({ lastTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || un(r) && !fn(r) && !a?.nextTabbableNode(r)) && (n = e), n >= 0) {
						let e = n === this.state.tabbableGroups.length - 1 ? 0 : n + 1, t = this.state.tabbableGroups[e];
						i = mn(r) >= 0 ? t.firstTabbableNode : t.firstDomTabbableNode;
					} else pl(t) || (i = a?.nextTabbableNode(r));
				}
			} else i = this.getNodeForOption("fallbackFocus");
			return i;
		}), this.trapStack = t.trapStack || ul;
		let n = {
			returnFocusOnDeactivate: !0,
			escapeDeactivates: !0,
			delayInitialFocus: !0,
			followControlledElements: !0,
			isKeyForward: ml,
			isKeyBackward: hl,
			...t
		};
		this.doc = n.document || Ke(Array.isArray(e) ? e[0] : e), this.config = n, this.updateContainerElements(e), this.setupMutationObserver();
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
			at(e).forEach((e) => {
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
		return this.config.followControlledElements ? rt(e, t) : !1;
	}
	isPersistentElement(e, t) {
		let n = this.config.persistentElements;
		if (!n || n.length === 0) return !1;
		let r = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return n.some((t) => {
			let n = t();
			return Ge(n, e) || n != null && r?.includes(n);
		});
	}
	updateTabbableNodes() {
		if (this.state.containerGroups = this.state.containers.map((e) => {
			let t = dn(e, { getShadowRoot: this.config.getShadowRoot }), n = ln(e, { getShadowRoot: this.config.getShadowRoot }), r = t[0], i = t[t.length - 1], a = r, o = i, s = !1;
			for (let e = 0; e < t.length; e++) if (mn(t[e]) > 0) {
				s = !0;
				break;
			}
			function c(e, r = !0) {
				let i = t.indexOf(e);
				if (i >= 0) return t[i + (r ? 1 : -1)];
				let a = n.indexOf(e);
				if (!(a < 0)) {
					if (r) {
						for (let e = a + 1; e < n.length; e++) if (fn(n[e])) return n[e];
					} else for (let e = a - 1; e >= 0; e--) if (fn(n[e])) return n[e];
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
		if (this.state.active) return ll.activateTrap(this.trapStack, this), this.listenerCleanups.push(Jt(this.doc, "focusin", this.handleFocus, !0), Jt(this.doc, "mousedown", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), Jt(this.doc, "touchstart", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), Jt(this.doc, "click", this.handleClick, {
			capture: !0,
			passive: !1
		}), Jt(this.doc, "keydown", this.handleTabKey, {
			capture: !0,
			passive: !1
		}), Jt(this.doc, "keydown", this.handleEscapeKey)), this;
	}
	commitInitialFocus() {
		return this.state.delayInitialFocusTimer = this.config.delayInitialFocus ? vl(() => {
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
		return this.state.containers.some((t) => Ge(t, e));
	}
	isSafeToOverrideFocus() {
		let e = Ye(this.doc);
		return !e || e === this.doc.body || this.containsElement(e) ? !0 : this.trapStack.some((t) => t !== this && t.containsElement(e));
	}
	activate(e) {
		if (this.state.active) return this;
		let t = this.getOption(e, "onActivate"), n = this.getOption(e, "onPostActivate"), r = this.getOption(e, "checkCanFocusTrap");
		r || this.updateTabbableNodes(), this.state.active = !0, this.state.paused = !1, this.state.nodeFocusedBeforeActivation = Ye(this.doc), t?.();
		let i = () => {
			r && this.updateTabbableNodes(), this.addListeners(), this.updateObservedNodes(), n?.();
		};
		return r ? (r(this.state.containers.concat()).then(i, i), this) : (i(), this);
	}
}, fl = (e) => e?.type === "keydown", pl = (e) => fl(e) && e?.key === "Tab", ml = (e) => fl(e) && e.key === "Tab" && !e?.shiftKey, hl = (e) => fl(e) && e.key === "Tab" && e?.shiftKey, gl = (e, ...t) => typeof e == "function" ? e(...t) : e, _l = (e) => !e.isComposing && e.key === "Escape", vl = (e) => setTimeout(e, 0), yl = (e) => e.localName === "input" && "select" in e && typeof e.select == "function";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/index.mjs
function bl(e, t = {}) {
	let n, r = q(() => {
		let r = (Array.isArray(e) ? e : [e]).map((e) => typeof e == "function" ? e() : e).filter((e) => e != null);
		if (r.length === 0) return;
		let i = r[0];
		n = new dl(r, {
			escapeDeactivates: !1,
			allowOutsideClick: !0,
			preventScroll: !0,
			returnFocusOnDeactivate: !0,
			delayInitialFocus: !1,
			fallbackFocus: i,
			...t,
			document: Ke(i)
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
var xl = "data-scroll-lock", Sl = /* @__PURE__ */ new WeakMap();
function Cl(e) {
	let t = e.getBoundingClientRect().left;
	return Math.round(t) + e.scrollLeft ? "paddingLeft" : "paddingRight";
}
function wl(e) {
	let t = $e(e)?.scrollbarGutter;
	return t === "stable" || t?.startsWith("stable ") === !0;
}
function Tl(e) {
	let { documentElement: t, body: n } = e;
	return Dn(t) ? t : n;
}
function El(e) {
	let t = e.defaultView ?? window, { documentElement: n, body: r } = e, i = Tl(e), a = wl(n) || wl(r), o = t.innerWidth - n.clientWidth;
	r.setAttribute(xl, "");
	let s = () => Xn(n, "--scrollbar-width", `${o}px`), c = Cl(n), l = [s(), Tt() ? (() => {
		let { scrollX: e, scrollY: n, visualViewport: i } = t, s = i?.offsetLeft ?? 0, l = i?.offsetTop ?? 0, u = {
			position: "fixed",
			overflow: "hidden",
			top: `${-(n - Math.floor(l))}px`,
			left: `${-(e - Math.floor(s))}px`,
			right: "0"
		};
		!a && o > 0 && (u[c] = `${o}px`);
		let d = Yn(r, u);
		return () => {
			d?.(), t.scrollTo({
				left: e,
				top: n,
				behavior: "instant"
			});
		};
	})() : (() => {
		let e = { overflow: "hidden" };
		return !a && o > 0 && (e[c] = `${o}px`), Yn(i, e);
	})()];
	return () => {
		l.forEach((e) => e?.()), r.removeAttribute(xl);
	};
}
function Dl(e) {
	let t = e ?? document, n = Sl.get(t);
	n || (n = {
		count: 0,
		cleanup: El(t)
	}, Sl.set(t, n)), n.count++;
	let r = n, i = !1;
	return () => {
		i || (i = !0, r.count--, r.count === 0 && (r.cleanup(), Sl.delete(t)));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.machine.mjs
var Ol = sa({
	props({ props: e, scope: t }) {
		let n = e.role === "alertdialog", r = n ? () => mc(t) : void 0, i = typeof e.modal != "boolean" || e.modal;
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
						triggerElement: gc(n, e)
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
				return al(() => cc(e), {
					type: "dialog",
					defer: !0,
					pointerBlocking: n("modal"),
					layerStyleTargets: [() => uc(e), () => lc(e)],
					exclude: [dc(e), ...hc(e)].filter(Boolean),
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
				if (t("preventScroll")) return Dl(e.getDoc());
			},
			trapFocus({ scope: e, prop: t, context: n }) {
				return t("trapFocus") ? bl(() => cc(e), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!t("restoreFocus"),
					initialFocus: () => hn({
						root: cc(e),
						getInitialEl: t("initialFocusEl")
					}),
					setReturnFocus: (r) => {
						let i = t("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let t = gc(e, a);
							if (t) return t;
						}
						return hc(e)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			},
			hideContentBelow({ scope: e, prop: t }) {
				return t("modal") ? Ac(() => [cc(e)], { defer: !0 }) : void 0;
			}
		},
		actions: {
			setInitialFocus({ prop: e, scope: t }) {
				e("trapFocus") || q(() => {
					hn({
						root: cc(t),
						getInitialEl: e("initialFocusEl")
					})?.focus({ preventScroll: !0 });
				});
			},
			checkRenderedElements({ context: e, scope: t }) {
				q(() => {
					e.set("rendered", {
						title: !!fc(t),
						description: !!pc(t)
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
}), kl = (e) => {
	let t = lr(), n = $a(), r = F(() => {
		let r = ni(e) || {};
		return {
			getRootNode: t().getRootNode,
			dir: n().dir,
			...r
		};
	}), i = Ea(Ol, () => S(r)), a = F(() => _c(i, va));
	return () => S(a);
}, Al = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function jl(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = B(n, "children", 7), s = H(n, Al), c = F(() => Va(s)), l = F(() => P(S(c), 2)), u = F(() => S(l)[0]), d = F(() => S(l)[1]), f = F(() => _r(S(u))), m = F(() => P(S(f), 1)), h = F(() => S(m)[0]), g = F(() => ({
		...S(d),
		id: S(d).id ?? r,
		open: i(),
		onOpenChange(e) {
			S(d).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), _ = kl(() => S(g)), v = F(() => ({
		...S(u),
		present: _().open
	})), y = Ba(() => S(v));
	Wa(_), mr(() => S(h)), Ha(y);
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
W(jl, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-title.svelte
var Ml = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Nl(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ml), a = Ga(), o = F(() => J(a().getTitleProps(), i));
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
W(Nl, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/css.ts
var Pl = ".af-kit{--k-bg:var(--af-bg,#f8fafc);--k-surface:var(--af-surface,#fff);--k-fg:var(--af-fg,#0d1928);--k-muted:var(--af-muted-fg,#576477);--k-line:var(--af-border,#e0e6ee);--k-primary:var(--af-primary,#0c71d1);--k-primary-fg:var(--af-primary-fg,#fafcfe);--k-danger:var(--af-danger,#e40014);--k-warning:var(--af-warning,#dd7400);--k-success:var(--af-success,#009767);--k-info:#0f74c5;--k-radius:var(--af-radius,.625rem);--k-font:var(--af-font-sans,ui-sans-serif, system-ui, sans-serif);--k-ring:var(--k-primary);--k-hover:color-mix(in oklab, var(--k-fg) 5%, var(--k-surface));--k-press:color-mix(in oklab, var(--k-fg) 9%, var(--k-surface));font-family:var(--k-font);color:var(--k-fg)}@supports (color:lab(0% 0 0)){.af-kit{--k-bg:var(--af-bg,lab(98.1433% -.367165 -1.06069));--k-surface:var(--af-surface,lab(100% 0 0));--k-fg:var(--af-fg,lab(8.19431% -1.05806 -12.2385));--k-muted:var(--af-muted-fg,lab(41.8773% -1.78064 -12.648));--k-line:var(--af-border,lab(90.9248% -1.03632 -4.75875));--k-primary:var(--af-primary,lab(46.5609% 2.72214 -58.0728));--k-primary-fg:var(--af-primary-fg,lab(98.837% -.443995 -1.43219));--k-danger:var(--af-danger,lab(48.4493% 77.4328 61.5452));--k-warning:var(--af-warning,lab(60.3514% 40.5624 87.1228));--k-success:var(--af-success,lab(55.0481% -49.9246 15.93));--k-info:lab(47.0007% -3.24479 -50.2754)}}:host([data-theme=dark]) .af-kit{--k-bg:var(--af-bg,#0b121b);--k-surface:var(--af-surface,#131b25);--k-fg:var(--af-fg,#eff3f6);--k-muted:var(--af-muted-fg,#a9b2be);--k-line:var(--af-border,#ffffff1c);--k-primary:var(--af-primary,#63b1f9);--k-primary-fg:var(--af-primary-fg,#0a1725);--k-danger:var(--af-danger,#ff6568);--k-warning:var(--af-warning,#f99c00);--k-success:var(--af-success,#00bb7f);--k-info:#6db0f4}@supports (color:lab(0% 0 0)){:host([data-theme=dark]) .af-kit{--k-bg:var(--af-bg,lab(5.20297% -.7421 -7.06235));--k-surface:var(--af-surface,lab(9.19901% -1.18761 -8.50037));--k-fg:var(--af-fg,lab(95.5874% -.662178 -2.14615));--k-muted:var(--af-muted-fg,lab(72.1142% -1.52099 -7.28307));--k-line:var(--af-border,lab(100% 0 0/.11));--k-primary:var(--af-primary,lab(69.4527% -8.90157 -43.6168));--k-primary-fg:var(--af-primary-fg,lab(7.09383% -1.43068 -11.9741));--k-danger:var(--af-danger,lab(63.7053% 60.745 31.3109));--k-warning:var(--af-warning,lab(72.7183% 31.8672 97.9407));--k-success:var(--af-success,lab(66.9756% -58.27 19.5419));--k-info:lab(69.4439% -7.35071 -40.8943)}}.af-kit [popover]{color:inherit;background:0 0;border:0;margin:0;padding:0;inset:auto;overflow:visible}.af-button{border-radius:max(0px, calc(var(--k-radius) - 2px));border:1px solid var(--k-line);background:var(--k-surface);min-height:32px;color:var(--k-fg);font:inherit;white-space:nowrap;cursor:pointer;justify-content:center;align-items:center;gap:6px;padding:0 12px;font-size:14px;font-weight:500;line-height:20px;text-decoration:none;transition:background-color .1s cubic-bezier(.2,0,0,1),border-color .1s cubic-bezier(.2,0,0,1);display:inline-flex}.af-button svg{pointer-events:none;flex:none;width:16px;height:16px}.af-button:focus-visible{outline:2px solid var(--k-ring);outline-offset:2px}.af-button.primary{background:var(--k-primary);border-color:var(--k-primary);color:var(--k-primary-fg)}.af-button.secondary{background:var(--k-surface)}.af-button.danger{background:var(--k-danger);border-color:var(--k-danger);color:var(--k-primary-fg)}.af-button.ghost{background:0 0;border-color:#0000}.af-button:not([aria-disabled=true],:disabled):hover{background:var(--k-hover)}.af-button.primary:not([aria-disabled=true],:disabled):hover{background:color-mix(in oklab, var(--k-primary) 90%, var(--k-bg));border-color:color-mix(in oklab, var(--k-primary) 90%, var(--k-bg))}.af-button.danger:not([aria-disabled=true],:disabled):hover{background:color-mix(in oklab, var(--k-danger) 90%, var(--k-bg));border-color:color-mix(in oklab, var(--k-danger) 90%, var(--k-bg))}.af-button:not([aria-disabled=true],:disabled):active{background:var(--k-press);transition:none}.af-button.primary:not([aria-disabled=true],:disabled):active{background:color-mix(in oklab, var(--k-primary) 82%, var(--k-fg));border-color:color-mix(in oklab, var(--k-primary) 82%, var(--k-fg))}.af-button.danger:not([aria-disabled=true],:disabled):active{background:color-mix(in oklab, var(--k-danger) 82%, var(--k-fg));border-color:color-mix(in oklab, var(--k-danger) 82%, var(--k-fg))}.af-button.sm{min-height:28px;padding:0 10px;font-size:12px;line-height:18px}.af-button.icon{width:32px;padding:0}.af-button.icon.sm{border-radius:max(0px, calc(var(--k-radius) - 4px));width:24px;min-height:24px}.af-button[aria-disabled=true],.af-button:disabled{opacity:.55;cursor:not-allowed}.af-chip{background:color-mix(in oklab, var(--k-primary) 12%, var(--k-surface));color:var(--k-fg);border-radius:999px;align-items:center;gap:4px;padding:1px 8px;font-size:12px;line-height:18px;display:inline-flex}.af-chip.neutral{background:color-mix(in oklab, var(--k-fg) 7%, var(--k-surface));color:var(--k-fg)}.af-chip.danger{background:color-mix(in oklab, var(--k-danger) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-danger) 75%, var(--k-fg))}.af-chip.success{background:color-mix(in oklab, var(--k-success) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-success) 75%, var(--k-fg))}.af-chip.warning{background:color-mix(in oklab, var(--k-warning) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-warning) 75%, var(--k-fg))}.af-chip.info{background:color-mix(in oklab, var(--k-info) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-info) 75%, var(--k-fg))}.af-avatar{background:color-mix(in oklab, var(--k-primary) 20%, var(--k-surface));width:24px;height:24px;color:var(--k-fg);border-radius:50%;flex:none;place-items:center;font-size:10px;font-weight:600;display:inline-grid;overflow:hidden}.af-avatar.sm{width:20px;height:20px;font-size:9px}.af-avatar.lg{width:32px;height:32px;font-size:13px}.af-avatar img{object-fit:cover;width:100%;height:100%}.af-avatar[data-hue]{background:oklch(.92 .06 var(--k-hue,255));color:oklch(.38 .12 var(--k-hue,255))}:host([data-theme=dark]) .af-avatar[data-hue]{background:oklch(.36 .07 var(--k-hue,255));color:oklch(.9 .06 var(--k-hue,255))}.af-avatar[data-hue=\"0\"]{--k-hue:255}.af-avatar[data-hue=\"1\"]{--k-hue:290}.af-avatar[data-hue=\"2\"]{--k-hue:330}.af-avatar[data-hue=\"3\"]{--k-hue:20}.af-avatar[data-hue=\"4\"]{--k-hue:60}.af-avatar[data-hue=\"5\"]{--k-hue:145}.af-avatar[data-hue=\"6\"]{--k-hue:180}.af-avatar[data-hue=\"7\"]{--k-hue:215}.af-tabs{border-bottom:1px solid var(--k-line);gap:4px;display:flex}.af-tabs>[role=tab]{border-radius:max(0px, calc(var(--k-radius) - 4px)) max(0px, calc(var(--k-radius) - 4px)) 0 0;color:var(--k-muted);font:inherit;cursor:pointer;background:0 0;border:0;padding:8px 12px;transition:background-color .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1)}.af-tabs>[role=tab]:hover{background:var(--k-hover);color:var(--k-fg)}.af-tabs>[role=tab]:active{background:var(--k-press);transition:none}.af-tabs>[role=tab]:focus-visible{outline:2px solid var(--k-ring);outline-offset:-2px}.af-tabs>[role=tab][aria-selected=true]{color:var(--k-fg);box-shadow:inset 0 -2px 0 var(--k-primary)}.af-tabs.segmented{border-radius:max(0px, calc(var(--k-radius) - 2px));background:color-mix(in oklab, var(--k-bg) 94%, var(--k-fg));border:0;gap:2px;padding:2px;display:inline-flex}.af-tabs.segmented>[role=tab]{border-radius:max(0px, calc(var(--k-radius) - 4px));white-space:nowrap;align-items:center;gap:6px;height:28px;padding:0 12px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex}.af-tabs.segmented>[role=tab]:hover{background:color-mix(in oklab, var(--k-fg) 5%, transparent)}.af-tabs.segmented>[role=tab][aria-selected=true]{background:var(--k-surface);box-shadow:0 1px 2px #0f172a0f}.af-skeleton{border-radius:var(--k-radius);background:linear-gradient(90deg, color-mix(in oklab, var(--k-fg) 6%, transparent), color-mix(in oklab, var(--k-fg) 10%, transparent), color-mix(in oklab, var(--k-fg) 6%, transparent));background-size:200% 100%;min-height:12px;animation:1.2s linear infinite af-shimmer}@keyframes af-shimmer{to{background-position:-200% 0}}.af-banner{border-radius:var(--k-radius);border:1px solid var(--k-line);background:var(--k-surface);align-items:center;gap:8px;padding:8px 12px;display:flex}.af-banner>svg{flex:none}.af-banner.info{border-color:color-mix(in oklab, var(--k-info) 30%, var(--k-line));background:color-mix(in oklab, var(--k-info) 12%, var(--k-surface))}.af-banner.warning{border-color:color-mix(in oklab, var(--k-warning) 35%, var(--k-line));background:color-mix(in oklab, var(--k-warning) 14%, var(--k-surface))}.af-banner.danger{border-color:color-mix(in oklab, var(--k-danger) 35%, var(--k-line));background:color-mix(in oklab, var(--k-danger) 12%, var(--k-surface));color:color-mix(in oklab, var(--k-danger) 78%, var(--k-fg))}.af-overlay{background:var(--k-surface);color:var(--k-fg);border:1px solid var(--k-line);border-radius:var(--k-radius);box-shadow:0 2px 6px #0f172a14,0 12px 28px -6px #0f172a38}:host([data-theme=dark]) .af-overlay{box-shadow:0 2px 6px #0006,0 12px 28px -6px #0009}@media (prefers-reduced-motion:reduce){.af-skeleton{animation:none}.af-button,.af-tabs>[role=tab]{transition:none}}";
//#endregion
//#region src/kit/KitStyles.svelte
function Fl(e) {
	let t = `<style>${Pl}</style>`;
	var n = p(), r = V(n);
	y(r, () => t), R(e, n);
}
W(Fl, {}, [], [], { mode: "open" });
//#endregion
//#region src/kit/environment.ts
function Il(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !1
	}));
}
function Ll(e, t, n) {
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
function Rl() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e instanceof HTMLElement ? e : null;
}
function zl(e, t) {
	for (let n = t; n;) {
		if (n === e) return !0;
		let t = n.getRootNode();
		n = n.parentNode ?? (t instanceof ShadowRoot ? t.host : null);
	}
	return !1;
}
var Bl = [];
function Vl(e) {
	for (let t = Bl.length - 1; t >= 0; t--) {
		if (Bl[t].isConnected) return Bl[t] === e;
		Bl.splice(t, 1);
	}
	return !1;
}
function Hl(e) {
	let t = null;
	return (n, r) => {
		if (n) {
			if (r && !n.open) t = Rl(), n.showModal(), Bl.push(e);
			else if (!r && n.open) {
				n.close();
				let r = Bl.lastIndexOf(e);
				r >= 0 && Bl.splice(r, 1);
				let i = t;
				t = null;
				let a = Rl();
				i?.isConnected && (!a || a === document.body || zl(e, a)) && i.focus({ preventScroll: !0 });
			}
		}
	};
}
//#endregion
//#region src/kit/text.ts
var Ul = {
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
function Wl(e, t) {
	let n = Ul[/^vi(-|$)/i.test(e ?? "") ? "vi" : "en"], r = Object.fromEntries(Object.entries(t ?? {}).filter(([, e]) => e !== void 0));
	return {
		...n,
		...r
	};
}
//#endregion
//#region src/kit/Confirm.svelte
var Gl = m("<p part=\"message\" class=\"svelte-1fchw0y\"> </p>"), Kl = m("<p part=\"impact\" class=\"svelte-1fchw0y\"> </p>"), ql = m("<div><!> <!></div>"), Jl = m("<!> <!> <footer part=\"actions\" class=\"svelte-1fchw0y\"><button type=\"button\" part=\"cancel\" class=\"af-button secondary\"> </button> <button type=\"button\" part=\"confirm\"> </button></footer>", 1), Yl = m("<dialog><!></dialog>"), Xl = m("<!> <!>", 1), Zl = {
	hash: "svelte-1fchw0y",
	code: "dialog.svelte-1fchw0y {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-1fchw0y::backdrop {background:rgb(0 0 0 / 0.4);}p.svelte-1fchw0y {margin:0;}footer.svelte-1fchw0y {display:flex;justify-content:flex-end;gap:8px;}[data-scope='dialog'][data-part='content'] {display:grid;gap:12px;width:min(420px, calc(100vw - 32px));padding:16px;border-radius:calc(var(--k-radius) + 4px);}[data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='dialog'][data-part='title'] {margin:0;font-size:16px;font-weight:600;line-height:24px;}.description.svelte-1fchw0y {display:grid;gap:8px;font-size:14px;line-height:22px;}[part='message'].svelte-1fchw0y {color:var(--k-muted);}[part='impact'].svelte-1fchw0y {color:var(--k-fg);font-weight:500;}"
};
function Ql(n, r) {
	k(r, !0), de(n, Zl);
	let i = B(r, "open", 7, !1), a = B(r, "heading", 7, ""), o = B(r, "message", 7, ""), s = B(r, "confirmLabel", 7, null), c = B(r, "danger", 7, !1), f = B(r, "impact", 7, null), m = B(r, "busy", 7, !1), h = B(r, "locale", 7, null), g = B(r, "strings", 7, null), y = r.$$host, w = F(() => Wl(h(), g() ?? void 0)), D = _(null), N = _(!1), P = !1, ee = Hl(y);
	C(() => ee(S(D), !!i())), C(() => {
		i() && E(N, !1);
	}), C(() => {
		let e = !!m();
		P && !e && E(N, !1), P = e;
	});
	function I() {
		S(N) || m() || (E(N, !0), Il(y, "confirm", {}));
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
	}, re = Xl(), ie = V(re);
	return Fl(ie, {}), fr(T(ie, 2), {
		value: () => y.shadowRoot,
		children: (e, n) => {
			var r = p(), h = V(r), g = () => !!i();
			A(h, () => jl, (e, n) => {
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
						e.open || Il(y, "cancel", { reason: "escape" });
					},
					children: (e, n) => {
						var r = p(), i = V(r);
						{
							let e = (e, n = ue) => {
								var r = Yl(), i = (e) => e.preventDefault();
								j(r, (e) => ({
									...e,
									class: "af-kit",
									oncancel: i
								}), [() => n()()], void 0, void 0, "svelte-1fchw0y");
								var h = d(r);
								A(h, () => qa, (e, n) => {
									n(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, n) => {
											var r = Jl(), i = V(r);
											A(i, () => Nl, (e, n) => {
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
														var r = ql();
														j(r, (e) => ({
															...e,
															class: "description"
														}), [() => n()()], void 0, void 0, "svelte-1fchw0y");
														var i = d(r), a = (e) => {
															var n = Gl(), r = u(n, !0);
															x(() => t(r, o())), R(e, n);
														};
														b(i, (e) => {
															o() && e(a);
														});
														var s = T(i, 2), c = (e) => {
															var n = Kl(), r = u(n, !0);
															x(() => t(r, f())), R(e, n);
														};
														b(s, (e) => {
															f() && e(c);
														}), M(r), R(e, r);
													};
													A(r, () => Ya, (t, n) => {
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
											}), v("click", C, () => Il(y, "cancel", { reason: "close-button" })), v("click", D, I), R(e, r);
										},
										$$slots: { default: !0 }
									});
								}), M(r), O(r, (e) => E(D, e), () => S(D)), R(e, r);
							};
							A(i, () => Za, (t, n) => {
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
f(["click"]), W(Ql, {
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
var Z = Zs("date-picker").parts("clearTrigger", "content", "control", "input", "label", "monthSelect", "nextTrigger", "positioner", "presetTrigger", "prevTrigger", "rangeText", "root", "table", "tableBody", "tableCell", "tableCellTrigger", "tableHead", "tableHeader", "tableRow", "trigger", "view", "viewControl", "viewTrigger", "yearSelect").build();
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/constrain.mjs
function $l(e, t, n, r, i) {
	let a = {};
	for (let e in t) {
		let n = e, r = t[n];
		r != null && (a[n] = Math.floor(r / 2), a[n] > 0 && r % 2 == 0 && a[n]--);
	}
	return nu(e, eu(e, t, n).subtract(a), t, n, r, i);
}
function eu(e, t, n, r, i) {
	let a = e;
	return t.years ? a = jo(e) : t.months ? a = ko(e) : t.weeks && (a = No(e, n)), nu(e, a, t, n, r, i);
}
function tu(e, t, n, r, i) {
	let a = { ...t };
	return a.days ? a.days-- : a.weeks ? a.weeks-- : a.months ? a.months-- : a.years && a.years--, nu(e, eu(e, t, n).subtract(a), t, n, r, i);
}
function nu(e, t, n, r, i, a) {
	return i && e.compare(i) >= 0 && (t = Vo(t, eu(ts(i), n, r))), a && e.compare(a) <= 0 && (t = Bo(t, tu(ts(a), n, r))), t;
}
function ru(e, t, n) {
	let r = ts(e), i = t ? ts(t) : void 0, a = n ? ts(n) : void 0, o = r;
	return i && (o = Vo(o, i)), a && (o = Bo(o, a)), o.compare(r) === 0 ? e : "hour" in e ? e.set({
		year: o.year,
		month: o.month,
		day: o.day
	}) : o;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/align.mjs
function iu(e, t, n, r, i, a) {
	switch (t) {
		case "start": return eu(e, n, r, i, a);
		case "end": return tu(e, n, r, i, a);
		default: return $l(e, n, r, i, a);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/assertion.mjs
function au(e, t) {
	return e == null || t == null ? e === t : !("hour" in e) && !("hour" in t) ? lo(e, t) : ns(e).compare(ns(t)) === 0;
}
function ou(e, t, n, r, i) {
	return e ? t?.(e, n) ? !0 : su(e, r, i) : !1;
}
function su(e, t, n) {
	return t != null && e.compare(t) < 0 || n != null && e.compare(n) > 0;
}
function cu(e, t, n) {
	let r = e.subtract({ days: 1 });
	return lo(r, e) || su(r, t, n);
}
function lu(e, t, n) {
	let r = e.add({ days: 1 });
	return lo(r, e) || su(r, t, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/duration.mjs
function uu(e) {
	let t = { ...e };
	for (let e in t) t[e] = 1;
	return t;
}
function du(e, t) {
	let n = { ...t };
	return n.days ? n.days-- : n.days = -1, e.add(n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/get-era-format.mjs
function fu(e) {
	if (!e) return;
	let t = e.calendar.identifier;
	return t === "gregory" || t === "iso8601" ? e.era === "BC" ? "short" : void 0 : "short";
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/formatter.mjs
function pu(e, t, n) {
	let r = n ?? ns(xo(t));
	return new Us(e, {
		weekday: "long",
		month: "long",
		year: "numeric",
		day: "numeric",
		era: fu(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
function mu(e, t, n) {
	let r = n ?? xo(t);
	return new Us(e, {
		month: "long",
		year: "numeric",
		era: fu(r),
		calendar: r.calendar.identifier,
		timeZone: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/format.mjs
function hu(e, t, n, r, i) {
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
function gu(e, t, n, r) {
	if (!e) return "";
	let i = e, a = t ?? e, o = pu(n, r);
	return lo(i, a) ? o.format(i.toDate(r)) : hu(i, a, o, (e, t) => `${e} \u2013 ${t}`, r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-month.mjs
var _u = [
	"sun",
	"mon",
	"tue",
	"wed",
	"thu",
	"fri",
	"sat"
];
function vu(e) {
	return e == null ? void 0 : _u[e];
}
function yu(e, t, n) {
	return No(e, t, vu(n));
}
function bu(e, t, n, r) {
	let i = t.add({ weeks: e }), a = [], o = yu(i, n, r);
	for (; a.length < 7;) {
		a.push(o);
		let e = o.add({ days: 1 });
		if (lo(o, e)) break;
		o = e;
	}
	return a;
}
function xu(e, t, n, r) {
	let i = vu(r), a = n ?? zo(e, t, i);
	return [...Array(a).keys()].map((n) => bu(n, e, t, r));
}
function Su(e, t) {
	let n = new Us(e, {
		weekday: "long",
		timeZone: t
	}), r = new Us(e, {
		weekday: "short",
		timeZone: t
	}), i = new Us(e, {
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
function Cu(e, t, n, r) {
	let i = yu(e, r, t), a = [...Array(7).keys()], o = Su(r, n);
	return a.map((e) => o(i.add({ days: e })));
}
function wu(e, t = "long", n) {
	if (!n || n.calendar.identifier === "gregory" || n.calendar.identifier === "iso8601") {
		let n = new Date(2021, 0, 1), r = [];
		for (let i = 0; i < 12; i++) r.push(n.toLocaleString(e, { month: t })), n.setMonth(n.getMonth() + 1);
		return r;
	}
	let r = n.calendar.getMonthsInYear(n), i = new Us(e, {
		month: t,
		calendar: n.calendar.identifier
	}), a = [];
	for (let e = 1; e <= r; e++) {
		let t = n.set({ month: e });
		a.push(i.format(t.toDate("UTC")));
	}
	return a;
}
function Tu(e, t) {
	let n = No(e, t, "mon"), r = n.year, i = No(n.set({
		month: 1,
		day: 4
	}), t, "mon"), a = n.calendar.toJulianDay(n), o = i.calendar.toJulianDay(i);
	if (a >= o) return 1 + Math.floor((a - o) / 7);
	let s = No(n.set({
		year: r - 1,
		month: 1,
		day: 4
	}), t, "mon"), c = s.calendar.toJulianDay(s);
	return 1 + Math.floor((a - c) / 7);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/date-year.mjs
function Eu(e) {
	let t = [];
	for (let n = e.from; n <= e.to; n += 1) t.push(n);
	return t;
}
var Du = 1900, Ou = 2099;
function ku(e, t, n) {
	let r = e.calendar;
	return {
		from: t?.year ?? rs(new zs(Du, 1, 1), r).year,
		to: n?.year ?? rs(new zs(Ou, 12, 31), r).year
	};
}
var Au = 10;
function ju(e) {
	if (e) {
		if (e.length === 3) return e.padEnd(4, "0");
		if (e.length === 2) {
			let t = (/* @__PURE__ */ new Date()).getFullYear(), n = Math.floor(t / 100) * 100 + parseInt(e.slice(-2), 10);
			return n > t + Au ? (n - 100).toString() : n.toString();
		}
		return e;
	}
}
function Mu(e, t) {
	let n = t?.strict ? 10 : 12, r = e - e % 10, i = [];
	for (let e = 0; e < n; e += 1) {
		let t = r + e;
		i.push(t);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/mutation.mjs
function Nu(e, t) {
	let n = xo(e ?? Do());
	return t ? rs(n, t) : n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/pagination.mjs
function Pu(e, t, n, r) {
	return function(i) {
		let { startDate: a, focusedDate: o } = i, s = du(a, e);
		return su(o, n, r) ? {
			startDate: a,
			focusedDate: ru(o, n, r),
			endDate: s
		} : o.compare(a) < 0 ? {
			startDate: tu(o, e, t, n, r),
			focusedDate: ru(o, n, r),
			endDate: s
		} : o.compare(s) > 0 ? {
			startDate: eu(o, e, t, n, r),
			endDate: s,
			focusedDate: ru(o, n, r)
		} : {
			startDate: a,
			endDate: s,
			focusedDate: ru(o, n, r)
		};
	};
}
function Fu(e, t, n, r, i, a) {
	let o = Pu(n, r, i, a), s = t.add(n);
	return o({
		focusedDate: e.add(n),
		startDate: eu(nu(e, s, n, r, i, a), n, r)
	});
}
function Iu(e, t, n, r, i, a) {
	let o = Pu(n, r, i, a), s = t.subtract(n);
	return o({
		focusedDate: e.subtract(n),
		startDate: eu(nu(e, s, n, r, i, a), n, r)
	});
}
function Lu(e, t, n, r, i, a, o) {
	let s = Pu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.add(uu(r)),
		startDate: t
	});
	if (r.days) return Fu(e, t, r, i, a, o);
	if (r.weeks) return s({
		focusedDate: e.add({ months: 1 }),
		startDate: t
	});
	if (r.months || r.years) return s({
		focusedDate: e.add({ years: 1 }),
		startDate: t
	});
}
function Ru(e, t, n, r, i, a, o) {
	let s = Pu(r, i, a, o);
	if (!n && !r.days) return s({
		focusedDate: e.subtract(uu(r)),
		startDate: t
	});
	if (r.days) return Iu(e, t, r, i, a, o);
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
var zu = /* @__PURE__ */ new Map();
function Bu(e) {
	let t = zu.get(e);
	return t ?? (t = "0123456789" + new Intl.NumberFormat(e, { useGrouping: !1 }).format(1234567890), zu.set(e, t), t);
}
var Vu = (e, t) => t ? Bu(t).includes(e) : /\d/.test(e), Hu = (e, t, n) => !e || e.length !== 1 || Vu(e, n) || t.includes(e), Uu = (e, t, n) => e.split("").filter((e) => Hu(e, t, n)).join(""), Wu = /* @__PURE__ */ new Map();
function Gu(e) {
	let t = Wu.get(e);
	if (t != null) return t;
	let n = new Intl.DateTimeFormat(e).formatToParts(/* @__PURE__ */ new Date()).find((e) => e.type === "literal");
	return t = n ? n.value : "/", Wu.set(e, t), t;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/parse-date.mjs
var Ku = (e) => e != null && e.length === 4, qu = (e) => e != null && parseFloat(e) <= 12, Ju = (e) => e != null && parseFloat(e) <= 31;
function Yu(e, t, n) {
	let { year: r, month: i, day: a } = Zu(Xu(t, n), e) ?? {};
	if (r != null || i != null || a != null) {
		let e = /* @__PURE__ */ new Date();
		r ||= e.getFullYear().toString(), i ||= (e.getMonth() + 1).toString(), a ||= e.getDate().toString();
	}
	if (Ku(r) || (r = ju(r)), Ku(r) && qu(i) && Ju(a)) return new zs(+r, +i, +a);
	let o = Date.parse(e);
	if (!isNaN(o)) {
		let e = new Date(o);
		return new zs(e.getFullYear(), e.getMonth() + 1, e.getDate());
	}
}
function Xu(e, t) {
	return new Us(e, {
		day: "numeric",
		month: "numeric",
		year: "numeric",
		timeZone: t
	}).formatToParts(new Date(2e3, 11, 25)).map(({ type: e, value: t }) => e === "literal" ? `${t}?` : `((?!=<${e}>)\\d+)?`).join("");
}
function Zu(e, t) {
	let n = t.match(e);
	return e.toString().match(/<(.+?)>/g)?.map((e) => {
		let t = e.match(/<(.+)>/);
		return !t || t.length <= 0 ? null : e.match(/<(.+)>/)?.[1];
	}).reduce((e, t, r) => (t && (e[t] = n && n.length > r ? n[r + 1] : null), e), {});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-utils@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-utils/dist/preset.mjs
function Qu(e, t, n) {
	let r = ts(bo(n));
	switch (e) {
		case "thisWeek": return [No(r, t), Po(r, t)];
		case "thisMonth": return [ko(r), r];
		case "thisQuarter": return [ko(r).add({ months: -((r.month - 1) % 3) }), r];
		case "thisYear": return [jo(r), r];
		case "last3Days": return [r.add({ days: -2 }), r];
		case "last7Days": return [r.add({ days: -6 }), r];
		case "last14Days": return [r.add({ days: -13 }), r];
		case "last30Days": return [r.add({ days: -29 }), r];
		case "last90Days": return [r.add({ days: -89 }), r];
		case "lastMonth": return [ko(r.add({ months: -1 })), Ao(r.add({ months: -1 }))];
		case "lastQuarter": return [ko(r.add({ months: -((r.month - 1) % 3) - 3 })), Ao(r.add({ months: -((r.month - 1) % 3) - 1 }))];
		case "lastWeek": return [No(r, t).add({ weeks: -1 }), Po(r, t).add({ weeks: -1 })];
		case "lastYear": return [jo(r.add({ years: -1 })), Mo(r.add({ years: -1 }))];
		default: throw Error(`Invalid date range preset: ${e}`);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var $u = [
	"top",
	"right",
	"bottom",
	"left"
], ed = Math.min, td = Math.max, nd = Math.round, rd = Math.floor, id = (e) => ({
	x: e,
	y: e
}), ad = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function od(e, t, n) {
	return td(e, ed(t, n));
}
function sd(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function cd(e) {
	return e.split("-")[0];
}
function ld(e) {
	return e.split("-")[1];
}
function ud(e) {
	return e === "x" ? "y" : "x";
}
function dd(e) {
	return e === "y" ? "height" : "width";
}
function fd(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function pd(e) {
	return ud(fd(e));
}
function md(e, t, n) {
	n === void 0 && (n = !1);
	let r = ld(e), i = pd(e), a = dd(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Cd(o)), [o, Cd(o)];
}
function hd(e) {
	let t = Cd(e);
	return [
		gd(e),
		t,
		gd(t)
	];
}
function gd(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var _d = ["left", "right"], vd = ["right", "left"], yd = ["top", "bottom"], bd = ["bottom", "top"];
function xd(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? vd : _d : t ? _d : vd;
		case "left":
		case "right": return t ? yd : bd;
		default: return [];
	}
}
function Sd(e, t, n, r) {
	let i = ld(e), a = xd(cd(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(gd)))), a;
}
function Cd(e) {
	let t = cd(e);
	return ad[t] + e.slice(t.length);
}
function wd(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function Td(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : wd(e);
}
function Ed(e) {
	let { x: t, y: n, width: r, height: i } = e;
	return {
		width: r,
		height: i,
		top: n,
		left: t,
		right: t + r,
		bottom: n + i,
		x: t,
		y: n
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+core@1.8.0/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function Dd(e, t, n) {
	let { reference: r, floating: i } = e, a = fd(t), o = pd(t), s = dd(o), c = cd(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
	switch (c) {
		case "top":
			p = {
				x: u,
				y: r.y - i.height
			};
			break;
		case "bottom":
			p = {
				x: u,
				y: r.y + r.height
			};
			break;
		case "right":
			p = {
				x: r.x + r.width,
				y: d
			};
			break;
		case "left":
			p = {
				x: r.x - i.width,
				y: d
			};
			break;
		default: p = {
			x: r.x,
			y: r.y
		};
	}
	let m = ld(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function Od(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = sd(t, e), p = Td(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Ed(await i.getClippingRect({
		element: await (i.isElement == null ? void 0 : i.isElement(m)) ?? !0 ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating)),
		boundary: c,
		rootBoundary: l,
		strategy: s
	})), g = u === "floating" ? {
		x: n,
		y: r,
		width: a.floating.width,
		height: a.floating.height
	} : a.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)), v = await (i.isElement == null ? void 0 : i.isElement(_)) && await (i.getScale == null ? void 0 : i.getScale(_)) || {
		x: 1,
		y: 1
	}, y = Ed(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: o,
		rect: g,
		offsetParent: _,
		strategy: s
	}) : g);
	return {
		top: (h.top - y.top + p.top) / v.y,
		bottom: (y.bottom - h.bottom + p.bottom) / v.y,
		left: (h.left - y.left + p.left) / v.x,
		right: (y.right - h.right + p.right) / v.x
	};
}
var kd = 50, Ad = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Od
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Dd(l, r, c), f = r, p = 0, m = {};
	for (let n = 0; n < a.length; n++) {
		let h = a[n];
		if (!h) continue;
		let { name: g, fn: _ } = h, { x: v, y, data: b, reset: x } = await _({
			x: u,
			y: d,
			initialPlacement: r,
			placement: f,
			strategy: i,
			middlewareData: m,
			rects: l,
			platform: s,
			elements: {
				reference: e,
				floating: t
			}
		});
		u = v ?? u, d = y ?? d, m[g] = {
			...m[g],
			...b
		}, x && p < kd && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Dd(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, jd = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = sd(e, t) || {};
		if (l == null) return {};
		let d = Td(u), f = {
			x: n,
			y: r
		}, p = pd(i), m = dd(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = ed(d[_], T), D = ed(d[v], T), O = C - h[m] - D, k = C / 2 - h[m] / 2 + w, A = od(E, k, O), j = !c.arrow && ld(i) != null && k !== A && a.reference[m] / 2 - (k < E ? E : D) - h[m] / 2 < 0, M = j ? k < E ? k - E : k - O : 0;
		return {
			[p]: f[p] + M,
			data: {
				[p]: A,
				centerOffset: k - A - M,
				...j && { alignmentOffset: M }
			},
			reset: j
		};
	}
}), Md = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = sd(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = cd(r), _ = fd(o), v = cd(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Cd(o)] : hd(o)), x = p !== "none";
			!d && x && b.push(...Sd(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = md(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === fd(t) || T.every((e) => fd(e.placement) !== _ || e.overflows[0] > 0))) return {
					data: {
						index: e,
						overflows: T
					},
					reset: { placement: t }
				};
				let n = T.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
				if (!n) switch (f) {
					case "bestFit": {
						let e = T.filter((e) => {
							if (x) {
								let t = fd(e.placement);
								return t === _ || t === "y";
							}
							return !0;
						}).map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
						e && (n = e);
						break;
					}
					case "initialPlacement": n = o;
				}
				if (r !== n) return { reset: { placement: n } };
			}
			return {};
		}
	};
};
function Nd(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Pd(e) {
	return $u.some((t) => e[t] >= 0);
}
var Fd = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = sd(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Nd(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Pd(e)
					} };
				}
				case "escaped": {
					let e = Nd(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Pd(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Id = /*#__PURE__*/ new Set(["left", "top"]);
async function Ld(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = cd(n), s = ld(n), c = fd(n) === "y", l = Id.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = sd(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
		mainAxis: d,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: d.mainAxis || 0,
		crossAxis: d.crossAxis || 0,
		alignmentAxis: d.alignmentAxis
	};
	return s && typeof m == "number" && (p = s === "end" ? m * -1 : m), c ? {
		x: p * u,
		y: f * l
	} : {
		x: f * l,
		y: p * u
	};
}
var Rd = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Ld(t, e);
			return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
				x: r + s.x,
				y: i + s.y,
				data: {
					...s,
					placement: a
				}
			};
		}
	};
}, zd = function(e) {
	return e === void 0 && (e = {}), {
		name: "shift",
		options: e,
		async fn(t) {
			let { x: n, y: r, placement: i, platform: a } = t, { mainAxis: o = !0, crossAxis: s = !1, limiter: c = { fn: (e) => {
				let { x: t, y: n } = e;
				return {
					x: t,
					y: n
				};
			} }, ...l } = sd(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = fd(i), p = ud(f), m = u[p], h = u[f], g = (e, t) => od(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
			o && (m = g(p, m)), s && (h = g(f, h));
			let _ = c.fn({
				...t,
				[p]: m,
				[f]: h
			});
			return {
				..._,
				data: {
					x: _.x - n,
					y: _.y - r,
					enabled: {
						[p]: o,
						[f]: s
					}
				}
			};
		}
	};
}, Bd = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = sd(e, t), u = {
				x: n,
				y: r
			}, d = fd(i), f = ud(d), p = u[f], m = u[d], h = sd(s, t), g = typeof h == "number" ? {
				mainAxis: h,
				crossAxis: 0
			} : {
				mainAxis: h.mainAxis ?? 0,
				crossAxis: h.crossAxis ?? 0
			};
			if (c) {
				let e = f === "y" ? "height" : "width", t = a.reference[f] - a.floating[e] + g.mainAxis, n = a.reference[f] + a.reference[e] - g.mainAxis;
				p < t ? p = t : p > n && (p = n);
			}
			if (l) {
				let e = f === "y" ? "width" : "height", t = Id.has(cd(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Vd = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = sd(e, t), c = await i.detectOverflow(t, s), l = cd(n), u = ld(n), d = fd(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = ed(p - c[m], g), y = ed(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * td(c.left, c.right) : S = p - 2 * td(c.top, c.bottom)), await o({
				...t,
				availableWidth: C,
				availableHeight: S
			});
			let w = await i.getDimensions(a.floating);
			return f !== w.width || p !== w.height ? { reset: { rects: !0 } } : {};
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function Hd() {
	return typeof window < "u";
}
function Ud(e) {
	return Kd(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Wd(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Gd(e) {
	return ((Kd(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function Kd(e) {
	return Hd() ? e instanceof Node || e instanceof Wd(e).Node : !1;
}
function qd(e) {
	return Hd() ? e instanceof Element || e instanceof Wd(e).Element : !1;
}
function Jd(e) {
	return Hd() ? e instanceof HTMLElement || e instanceof Wd(e).HTMLElement : !1;
}
function Yd(e) {
	return !Hd() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Wd(e).ShadowRoot;
}
function Xd(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = cf(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Zd(e) {
	return /^(table|td|th)$/.test(Ud(e));
}
function Qd(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var $d = /transform|translate|scale|rotate|perspective|filter/, ef = /paint|layout|strict|content/, tf = (e) => !!e && e !== "none", nf;
function rf(e) {
	let t = qd(e) ? cf(e) : e;
	return tf(t.transform) || tf(t.translate) || tf(t.scale) || tf(t.rotate) || tf(t.perspective) || !of() && (tf(t.backdropFilter) || tf(t.filter)) || $d.test(t.willChange || "") || ef.test(t.contain || "");
}
function af(e) {
	let t = uf(e);
	for (; Jd(t) && !sf(t);) {
		if (rf(t)) return t;
		if (Qd(t)) return null;
		t = uf(t);
	}
	return null;
}
function of() {
	return nf ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), nf;
}
function sf(e) {
	return /^(html|body|#document)$/.test(Ud(e));
}
function cf(e) {
	return Wd(e).getComputedStyle(e);
}
function lf(e) {
	return qd(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function uf(e) {
	if (Ud(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Yd(e) && e.host || Gd(e);
	return Yd(t) ? t.host : t;
}
function df(e) {
	let t = uf(e);
	return sf(t) ? (e.ownerDocument || e).body : Jd(t) && Xd(t) ? t : df(t);
}
function ff(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = df(e), i = r === e.ownerDocument?.body, a = Wd(r);
	if (i) {
		let e = pf(a);
		return t.concat(a, a.visualViewport || [], Xd(r) ? r : [], e && n ? ff(e) : []);
	}
	return t.concat(r, ff(r, [], n));
}
function pf(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+dom@1.8.0/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function mf(e) {
	let t = cf(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Jd(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = nd(n) !== a || nd(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function hf(e) {
	return qd(e) ? e : e.contextElement;
}
function gf(e) {
	let t = hf(e);
	if (!Jd(t)) return id(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = mf(t), o = (a ? nd(n.width) : n.width) / r, s = (a ? nd(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var _f = /*#__PURE__*/ id(0);
function vf(e) {
	let t = Wd(e);
	return !of() || !t.visualViewport ? _f : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function yf(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Wd(e);
}
function bf(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = hf(e), o = id(1);
	t && (r ? qd(r) && (o = gf(r)) : o = gf(e));
	let s = yf(a, n, r) ? vf(a) : id(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Wd(a), t = qd(r) ? Wd(r) : r, n = e, i = pf(n);
		for (; i && t !== n;) {
			let e = gf(i), t = i.getBoundingClientRect(), r = cf(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Wd(i), i = pf(n);
		}
	}
	return Ed({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function xf(e, t) {
	let n = lf(e).scrollLeft;
	return t ? t.left + n : bf(Gd(e)).left + n;
}
function Sf(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - xf(e, n),
		y: n.top + t.scrollTop
	};
}
function Cf(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Gd(r), s = t ? Qd(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = id(1), u = id(0), d = Jd(r);
	if ((d || !a) && ((Ud(r) !== "body" || Xd(o)) && (c = lf(r)), d)) {
		let e = bf(r);
		l = gf(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Sf(o, c) : id(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function wf(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Tf(e) {
	let t = lf(e), n = e.ownerDocument.body, r = td(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = td(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + xf(e), o = -t.scrollTop;
	return cf(n).direction === "rtl" && (a += td(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Ef = 25;
function Df(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Wd(e), a = Gd(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !of() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (xf(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Ef && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function Of(e, t) {
	let n = bf(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = gf(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function kf(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Df(e, n, t);
	else if (t === "document") r = Tf(Gd(e));
	else if (qd(t)) r = Of(t, n);
	else {
		let n = vf(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Ed(r);
}
function Af(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = ff(e, [], !1).filter((e) => qd(e) && Ud(e) !== "body"), i = null, a = cf(e).position === "fixed", o = a ? uf(e) : e;
	for (; qd(o) && !sf(o);) {
		let e = cf(o), t = rf(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = uf(o);
	}
	return t.set(e, r), r;
}
function jf(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Qd(t) ? [] : Af(t, this._c) : [].concat(n), r], o = kf(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = kf(t, a[e], i);
		s = td(n.top, s), c = ed(n.right, c), l = ed(n.bottom, l), u = td(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Mf(e) {
	let { width: t, height: n } = mf(e);
	return {
		width: t,
		height: n
	};
}
function Nf(e, t, n) {
	let r = Jd(t), i = Gd(t), a = n === "fixed", o = bf(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = id(0);
	if ((r || !a) && ((Ud(t) !== "body" || Xd(i)) && (s = lf(t)), r)) {
		let e = bf(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = xf(i));
	let l = i && !r && !a ? Sf(i, s) : id(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Pf(e) {
	return cf(e).position === "static";
}
function Ff(e, t) {
	if (!Jd(e) || cf(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Gd(e) === n && (n = n.ownerDocument.body), n;
}
function If(e, t) {
	let n = Wd(e);
	if (Qd(e)) return n;
	if (!Jd(e)) {
		let t = uf(e);
		for (; t && !sf(t);) {
			if (qd(t) && !Pf(t)) return t;
			t = uf(t);
		}
		return n;
	}
	let r = Ff(e, t);
	for (; r && Zd(r) && Pf(r);) r = Ff(r, t);
	return r && sf(r) && Pf(r) && !rf(r) ? n : r || af(e) || n;
}
var Lf = async function(e) {
	let t = this.getOffsetParent || If, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: Nf(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Rf(e) {
	return cf(e).direction === "rtl";
}
var zf = {
	convertOffsetParentRelativeRectToViewportRelativeRect: Cf,
	getDocumentElement: Gd,
	getClippingRect: jf,
	getOffsetParent: If,
	getElementRects: Lf,
	getClientRects: wf,
	getDimensions: Mf,
	getScale: gf,
	isElement: qd,
	isRTL: Rf
};
function Bf(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Vf(e, t, n) {
	let r = null, i, a = Gd(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = rd(d), h = rd(a.clientWidth - (u + f)), g = rd(a.clientHeight - (d + p)), _ = rd(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: td(0, ed(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!Bf(l, e.getBoundingClientRect())) return s();
			if (n !== c) {
				if (!y) return s();
				n ? s(!1, n) : i = setTimeout(() => {
					s(!1, 1e-7);
				}, 1e3);
			}
			y = !1;
		}
		try {
			r = new IntersectionObserver(b, {
				...v,
				root: a.ownerDocument
			});
		} catch {
			r = new IntersectionObserver(b, v);
		}
		r.observe(e);
	}
	let c = Wd(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function Hf(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = hf(e), u = i || a ? [...l ? ff(l) : [], ...t ? ff(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Vf(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? bf(e) : null;
	c && g();
	function g() {
		let t = bf(e);
		h && !Bf(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Uf = Rd, Wf = zd, Gf = Md, Kf = Vd, qf = Fd, Jf = jd, Yf = Bd, Xf = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...zf,
		...i.platform,
		_c: r
	};
	return Ad(e, t, {
		...i,
		platform: a
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-anchor.mjs
function Zf(e = 0, t = 0, n = 0, r = 0) {
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
function Qf(e) {
	if (!e) return Zf();
	let { x: t, y: n, width: r, height: i } = e;
	return Zf(t, n, r, i);
}
function $f(e, t) {
	return {
		contextElement: Me(e) ? e : e?.contextElement,
		getBoundingClientRect: () => {
			let n = e, r = t?.(n);
			return r || !n ? Qf(r) : n.getBoundingClientRect();
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/middleware.mjs
var ep = (e) => ({
	variable: e,
	reference: `var(${e})`
}), tp = {
	arrowSize: ep("--arrow-size"),
	arrowSizeHalf: ep("--arrow-size-half"),
	arrowBg: ep("--arrow-background"),
	transformOrigin: ep("--transform-origin"),
	arrowOffset: ep("--arrow-offset")
}, np = (e) => e === "top" || e === "bottom" ? "y" : "x";
function rp(e, t) {
	return {
		name: "transformOrigin",
		fn(n) {
			let { elements: r, middlewareData: i, placement: a, rects: o, y: s } = n, c = a.split("-")[0], l = np(c), u = i.arrow?.x || 0, d = i.arrow?.y || 0, f = t?.clientWidth || 0, p = t?.clientHeight || 0, m = u + f / 2, h = d + p / 2, g = Math.abs(i.shift?.y || 0), _ = o.reference.height / 2, v = p / 2, y = e.offset?.mainAxis ?? e.gutter, b = typeof y == "number" ? y + v : y ?? v, x = g > b, S = {
				top: `${m}px calc(100% + ${b}px)`,
				bottom: `${m}px ${-b}px`,
				left: `calc(100% + ${b}px) ${h}px`,
				right: `${-b}px ${h}px`
			}[c], C = `${m}px ${o.reference.y + _ - s}px`, w = !!e.overlap && l === "y" && x;
			return r.floating.style.setProperty(tp.transformOrigin.variable, w ? C : S), { data: { transformOrigin: w ? C : S } };
		}
	};
}
var ip = {
	name: "rects",
	fn({ rects: e }) {
		return { data: e };
	}
}, ap = (e) => {
	if (e) return {
		name: "shiftArrow",
		fn({ placement: t, middlewareData: n }) {
			if (!n.arrow) return {};
			let { x: r, y: i } = n.arrow, a = t.split("-")[0];
			return Object.assign(e.style, {
				left: r == null ? "" : `${r}px`,
				top: i == null ? "" : `${i}px`,
				[a]: `calc(100% + ${tp.arrowOffset.reference})`
			}), {};
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/placement.mjs
function op(e) {
	let [t, n] = e.split("-");
	return {
		side: t,
		align: n,
		hasAlign: n != null
	};
}
function sp(e) {
	return e.split("-")[0];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-placement.mjs
var cp = {
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
function lp(e, t) {
	let n = e.devicePixelRatio || 1;
	return Math.round(t * n) / n;
}
function up(e, t) {
	return e != null && Math.abs(e - t) < .5;
}
function dp(e) {
	return typeof e == "function" ? e() : e === "clipping-ancestors" ? "clippingAncestors" : e;
}
function fp(e, t, n) {
	return Jf({
		element: e || t.createElement("div"),
		padding: n.arrowPadding
	});
}
function pp(e, t) {
	if (!qr(t.offset ?? t.gutter)) return Uf(({ placement: n }) => {
		let r = (e?.clientHeight || 0) / 2, i = t.offset?.mainAxis ?? t.gutter, a = typeof i == "number" ? i + r : i ?? r, { hasAlign: o } = op(n), s = o ? void 0 : t.shift;
		return bi({
			crossAxis: t.offset?.crossAxis ?? s,
			mainAxis: a,
			alignmentAxis: t.shift
		});
	});
}
function mp(e) {
	if (e.flip) return Gf(() => {
		let t = dp(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			padding: e.overflowPadding,
			fallbackPlacements: e.flip === !0 ? void 0 : e.flip
		};
	});
}
function hp(e) {
	if (e.slide || e.overlap) return Wf(() => {
		let t = dp(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			mainAxis: e.slide,
			crossAxis: e.overlap,
			padding: e.overflowPadding,
			limiter: Yf()
		};
	});
}
function gp(e) {
	if (e.sizeMiddleware === !1 && !e.sameWidth && !e.fitViewport) return;
	let t, n, r, i;
	return Kf(() => {
		let a = dp(e.boundary);
		return {
			padding: e.overflowPadding,
			...a ? { boundary: a } : void 0,
			apply({ elements: e, rects: a, availableHeight: o, availableWidth: s }) {
				let c = e.floating, l = Math.round(a.reference.width), u = Math.round(a.reference.height);
				s = Math.floor(s), o = Math.floor(o), up(t, l) || (c.style.setProperty("--reference-width", `${l}px`), t = l), up(n, u) || (c.style.setProperty("--reference-height", `${u}px`), n = u), up(r, s) || (c.style.setProperty("--available-width", `${s}px`), r = s), up(i, o) || (c.style.setProperty("--available-height", `${o}px`), i = o);
			}
		};
	});
}
function _p(e) {
	if (e.hideWhenDetached) return qf(() => ({
		strategy: "referenceHidden",
		boundary: dp(e.boundary) ?? "clippingAncestors"
	}));
}
function vp(e) {
	return e ? e === !0 ? {
		ancestorResize: !0,
		ancestorScroll: !0,
		elementResize: !0,
		layoutShift: !0
	} : e : {};
}
var yp = [
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
], bp = [
	"top",
	"right",
	"bottom",
	"left"
];
function xp(e, t) {
	if (!e) return ai;
	let n = new Map(t.map((t) => [t, e.style.getPropertyValue(t)]));
	return () => {
		n.forEach((t, n) => {
			t ? e.style.setProperty(n, t) : e.style.removeProperty(n);
		}), e.style.length === 0 && e.removeAttribute("style");
	};
}
function Sp(e) {
	return e == null ? null : Me(e) ? e : typeof e == "object" && e && "contextElement" in e && e.contextElement ? e.contextElement : e;
}
function Cp(e, t, n = {}) {
	let r = () => (typeof t == "function" ? t() : t) ?? null, i = () => {
		let t = typeof e == "function" ? e() : e;
		return n.getAnchorElement?.() ?? t;
	}, a = () => {
		let e = i();
		return !e && !n.getAnchorRect ? null : $f(e, n.getAnchorRect);
	}, o = Object.assign({}, cp, n), s = [], c = null, l, u;
	function d(e) {
		l?.(), u?.(), c = e, l = o.restoreStyles ? xp(e, yp) : void 0;
		let t = e.querySelector("[data-part=arrow]");
		u = o.restoreStyles ? xp(t, bp) : void 0, s = [
			pp(t, o),
			mp(o),
			hp(o),
			fp(t, e.ownerDocument, o),
			ap(t),
			rp({
				gutter: o.gutter,
				offset: o.offset,
				overlap: o.overlap
			}, t),
			gp(o),
			_p(o),
			ip
		];
	}
	let { placement: f, strategy: p, onComplete: m, onPositioned: h } = o, g, _, v = !1, y, b, x = ai, S = vp(o.listeners);
	function C() {
		if (!o.listeners) return;
		let e = i(), t = a(), n = r();
		t && n && (Sp(e) !== Sp(y) || n !== b) && (x(), y = e, b = n, x = Hf(t, n, T, S));
	}
	async function w() {
		C();
		let e = r();
		if (!e) return;
		e !== c && (d(e), v = !1);
		let t = a();
		if (!t) return;
		let n = await Xf(t, e, {
			placement: f,
			middleware: s,
			strategy: p
		}), i = Je(e), l = lp(i, n.x), u = lp(i, n.y);
		if (m?.({
			...n,
			x: l,
			y: u
		}), o.applyStyles !== !1 && (up(g, l) || (e.style.setProperty("--x", `${l}px`), g = l), up(_, u) || (e.style.setProperty("--y", `${u}px`), _ = u), o.hideWhenDetached && (n.middlewareData.hide?.referenceHidden ? (e.style.setProperty("visibility", "hidden"), e.style.setProperty("pointer-events", "none")) : (e.style.removeProperty("visibility"), e.style.removeProperty("pointer-events"))), !v)) {
			let t = e.firstElementChild;
			t && (e.style.setProperty("--z-index", $e(t).zIndex), v = !0);
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
function wp(e, t, n = {}) {
	let { defer: r, ...i } = n, a = r ? q : (e) => e(), o = [];
	return o.push(a(() => {
		o.push(Cp(e, t, i));
	})), () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-styles.mjs
var Tp = {
	bottom: "rotate(45deg)",
	left: "rotate(135deg)",
	top: "rotate(225deg)",
	right: "rotate(315deg)"
};
function Ep(e = {}) {
	let { placement: t, sameWidth: n, fitViewport: r, strategy: i = "absolute" } = e;
	return {
		arrow: {
			position: "absolute",
			width: tp.arrowSize.reference,
			height: tp.arrowSize.reference,
			[tp.arrowSizeHalf.variable]: `calc(${tp.arrowSize.reference} / 2)`,
			[tp.arrowOffset.variable]: `calc(${tp.arrowSizeHalf.reference} * -1)`
		},
		arrowTip: {
			transform: t ? Tp[t.split("-")[0]] : void 0,
			background: tp.arrowBg.reference,
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
var Dp = (e, t) => e.ids?.label?.(t) ?? `datepicker:${e.id}:label:${t}`, Op = (e) => e.ids?.root ?? `datepicker:${e.id}`, kp = (e, t) => e.ids?.table?.(t) ?? `datepicker:${e.id}:table:${t}`, Ap = (e) => e.ids?.content ?? `datepicker:${e.id}:content`, jp = (e, t) => e.ids?.cellTrigger?.(t) ?? `datepicker:${e.id}:cell-trigger:${t}`, Mp = (e, t) => e.ids?.prevTrigger?.(t) ?? `datepicker:${e.id}:prev:${t}`, Np = (e, t) => e.ids?.nextTrigger?.(t) ?? `datepicker:${e.id}:next:${t}`, Pp = (e, t) => e.ids?.viewTrigger?.(t) ?? `datepicker:${e.id}:view:${t}`, Fp = (e) => e.ids?.clearTrigger ?? `datepicker:${e.id}:clear`, Ip = (e) => e.ids?.control ?? `datepicker:${e.id}:control`, Lp = (e, t) => e.ids?.input?.(t) ?? `datepicker:${e.id}:input:${t}`, Rp = (e) => e.ids?.trigger ?? `datepicker:${e.id}:trigger`, zp = (e) => e.ids?.positioner ?? `datepicker:${e.id}:positioner`, Bp = (e) => e.ids?.monthSelect ?? `datepicker:${e.id}:month-select`, Vp = (e) => e.ids?.yearSelect ?? `datepicker:${e.id}:year-select`, Hp = (e, t) => zn(Wp(e), `[data-part=table-cell-trigger][data-view=${t}][data-focus]:not([data-outside-range])`), Up = (e) => e.getById(Rp(e)), Wp = (e) => e.getById(Ap(e)), Gp = (e) => Rn(Xp(e), "[data-part=input]"), Kp = (e) => e.getById(Vp(e)), qp = (e) => e.getById(Bp(e)), Jp = (e) => e.getById(Fp(e)), Yp = (e) => e.getById(zp(e)), Xp = (e) => e.getById(Ip(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.utils.mjs
function Zp(e) {
	let [t, n] = e, r;
	return r = !t || !n || t.compare(n) <= 0 ? e : [n, t], r;
}
function Qp(e, t) {
	let [n, r] = t;
	return !n || !r ? !1 : n.compare(e) <= 0 && r.compare(e) >= 0;
}
function $p(e) {
	return e.slice().filter((e) => e != null).sort((e, t) => e.compare(t));
}
function em(e) {
	return ci(e, {
		year: "calendar decade",
		month: "calendar year",
		day: "calendar month"
	});
}
var tm = {
	day: "dd",
	month: "mm",
	year: "yyyy"
};
function nm(e) {
	return new Us(e).formatToParts(/* @__PURE__ */ new Date()).map((e) => tm[e.type] ?? e.value).join("");
}
var rm = (e) => !Number.isNaN(e.day) && !Number.isNaN(e.month) && !Number.isNaN(e.year), im = {
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
		return ci(e, {
			year: "Switch to previous decade",
			month: "Switch to previous year",
			day: "Switch to previous month"
		});
	},
	nextTrigger(e) {
		return ci(e, {
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
function am(e, t) {
	return e ? e === "day" ? 0 : e === "month" ? 1 : 2 : t || 0;
}
function om(e) {
	return e === 0 ? "day" : e === 1 ? "month" : "year";
}
function sm(e, t, n) {
	return om(yi(am(e, 0), am(t, 0), am(n, 2)));
}
function cm(e, t) {
	return am(e, 0) > am(t, 0);
}
function lm(e, t) {
	return am(e, 0) < am(t, 0);
}
function um(e, t, n) {
	return sm(om(am(e, 0) + 1), t, n);
}
function dm(e, t, n) {
	return sm(om(am(e, 0) - 1), t, n);
}
var fm = [
	"day",
	"month",
	"year"
];
function pm(e) {
	fm.forEach((t) => e(t));
}
var mm = Li((e) => [
	e.view,
	e.startValue.toString(),
	e.endValue.toString(),
	e.locale,
	e.timeZone,
	e.selectionMode
], ([e], t) => {
	let { startValue: n, endValue: r, locale: i, timeZone: a, selectionMode: o } = t;
	if (e === "year") {
		let e = Mu(n.year, { strict: !0 }), t = e.at(0).toString(), r = e.at(-1).toString();
		return {
			start: t,
			end: r,
			formatted: `${t} - ${r}`
		};
	}
	if (e === "month") {
		let e = new Us(i, {
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
	let s = new Us(i, {
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
function hm(e, t) {
	let { state: n, context: r, prop: i, send: a, computed: o, scope: s } = e, c = r.get("startValue"), l = o("endValue"), u = r.get("value"), d = r.get("focusedValue"), f = r.get("hoveredValue"), p = f ? Zp([u[0], f]) : [], m = !!i("disabled"), h = !!i("readOnly"), g = !!i("invalid"), _ = o("isInteractive"), v = u.length === 0, y = i("min"), b = i("max"), x = i("locale"), S = i("timeZone"), C = i("startOfWeek"), w = n.matches("focused"), T = n.matches("open"), E = i("selectionMode") === "range", D = i("selectionMode") === "multiple", O = i("isDateUnavailable"), k = i("maxSelectedDates"), A = D && k != null && u.length >= k, j = r.get("currentPlacement"), M = j ? sp(j) : void 0, N = Ep({
		...i("positioning"),
		placement: j
	}), P = Gu(x), F = xi(im, i("translations"));
	function ee(e = c) {
		let t = i("fixedWeeks") ? 6 : void 0;
		return xu(e, x, t, C);
	}
	function te(e = {}) {
		let { format: t } = e;
		return wu(x, t, d).map((e, t) => {
			let n = t + 1;
			return {
				label: e,
				value: n,
				disabled: su(d.set({ month: n }), y, b)
			};
		});
	}
	function ne() {
		return Eu(ku(d, y, b)).map((e) => ({
			label: e.toString(),
			value: e,
			disabled: !vi(e, y?.year, b?.year)
		}));
	}
	function I(e) {
		return ou(e, O, x, y, b);
	}
	function L(e) {
		let t = c ?? Nu(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ month: e })
		});
	}
	function R(e) {
		let t = c ?? Nu(S, d.calendar);
		a({
			type: "FOCUS.SET",
			value: t.set({ year: e })
		});
	}
	function z(e) {
		let { value: t, disabled: n } = e, r = d.set({ year: t }), i = !Mu(c.year, { strict: !0 }).includes(t), a = vi(t, y?.year, b?.year), o = E && Qp(r, u), s = E && u[0] && ho(r, u[0]), l = E && u[1] && ho(r, u[1]), f = E && p.length > 0, m = f && Qp(r, p), h = f && p[0] && ho(r, p[0]), g = f && p[1] && ho(r, p[1]), _ = {
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
		let { value: t, disabled: n } = e, r = d.set({ month: t }), i = mu(x, S, d), a = E && Qp(r, u), o = E && u[0] && mo(r, u[0]), s = E && u[1] && mo(r, u[1]), c = E && p.length > 0, l = c && Qp(r, p), f = c && p[0] && mo(r, p[0]), m = c && p[1] && mo(r, p[1]), h = {
			focused: d.month === e.value,
			selectable: !su(r, y, b),
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
		let { value: t, disabled: n, visibleRange: r = o("visibleRange") } = e, a = pu(x, S, d), s = uu(o("visibleDuration")), c = i("outsideDaySelectable"), l = r.start.add(s).subtract({ days: 1 }), f = su(t, r.start, l), m = E && Qp(t, u), h = E && u[0] && lo(t, u[0]), g = E && u[1] && lo(t, u[1]), _ = E && p.length > 0, v = _ && Qp(t, p), C = _ && p[0] && lo(t, p[0]), w = _ && p[1] && lo(t, p[1]), T = u.some((e) => e != null && lo(t, e)), D = {
			invalid: su(t, y, b),
			disabled: n || !c && f || su(t, y, b) || A && !T,
			selected: T,
			unavailable: ou(t, O, x, y, b) && !n,
			outsideRange: f,
			today: _o(t, S),
			weekend: Uo(t, x),
			value: t,
			valueText: a.format(t.toDate(S)),
			get focused() {
				return d != null && lo(t, d) && (!D.outsideRange || c);
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
			return Qu(e, x, S);
		},
		getWeekNumber(e) {
			let t = e[0];
			return t ? Tu(t, x) : 0;
		},
		getDaysInWeek(e, t = c) {
			return bu(e, t, x, C);
		},
		getOffset(e) {
			let t = c.add(e), n = l.add(e), r = mu(x, S, d);
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
		weekDays: Cu(c, C, S, x),
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
			let e = ru(Nu(S, d.calendar), y, b);
			a({
				type: "VALUE.SET",
				value: [e]
			});
		},
		setValue(e) {
			let t = e.map((e) => ru(e, y, b));
			a({
				type: "VALUE.SET",
				value: t
			});
		},
		setTime(e, t = 0) {
			let n = Array.from(u), r = n[t];
			r && ("hour" in r || (r = ns(r)), r = r.set({
				hour: e.hour ?? ("hour" in r ? r.hour : 0),
				minute: e.minute ?? ("minute" in r ? r.minute : 0),
				second: e.second ?? ("second" in r ? r.second : 0),
				millisecond: e.millisecond ?? ("millisecond" in r ? r.millisecond : 0)
			}), n[t] = ru(r, y, b), a({
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
			return Lr(Mu(c.year, { strict: !0 }).map((e) => ({
				label: e.toString(),
				value: e,
				disabled: !vi(e, y?.year, b?.year)
			})), t);
		},
		getDecade() {
			let e = Mu(c.year, { strict: !0 });
			return {
				start: e.at(0),
				end: e.at(-1)
			};
		},
		getMonthsGrid(e = {}) {
			let { columns: t = 1, format: n } = e;
			return Lr(te({ format: n }), t);
		},
		format(e, t = {
			month: "long",
			year: "numeric"
		}) {
			return new Us(x, {
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
				id: Op(s),
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
				id: Dp(s, n),
				dir: i("dir"),
				htmlFor: Lp(s, n),
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
				id: Ip(s),
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
				id: Ap(s),
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
				"aria-roledescription": em(n),
				id: kp(s, o),
				"aria-readonly": we(h),
				"aria-disabled": we(m),
				"aria-multiselectable": we(i("selectionMode") !== "single"),
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
					}[Gt(e, { dir: i("dir") })];
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
				"aria-disabled": we(m),
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
			let { weekIndex: n, week: r } = e, i = r[0] ? Tu(r[0], x) : 0;
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
				"aria-disabled": we(!r.selectable),
				"aria-selected": r.selected || r.inRange,
				"aria-invalid": we(r.invalid),
				"aria-current": r.today ? "date" : void 0,
				"data-value": n.toString()
			});
		},
		getDayTableCellTriggerProps(e) {
			let { value: n } = e, r = ie(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: jp(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": F.dayCell(r),
				"aria-disabled": we(!r.selectable),
				"aria-invalid": we(r.invalid),
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
					f && po(n, f) || a({
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
				"aria-selected": we(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": we(!a.selectable),
				"data-value": n
			});
		},
		getMonthTableCellTriggerProps(e) {
			let { value: n } = e, r = re(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: jp(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": we(!r.selectable),
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
					f && r.value && mo(r.value, f) || a({
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
				"aria-selected": we(a.selected || a.inRange),
				"data-selected": K(a.selected),
				"aria-disabled": we(!a.selectable),
				"data-value": n
			});
		},
		getYearTableCellTriggerProps(e) {
			let { value: n } = e, r = z(e);
			return t.element({
				...Z.tableCellTrigger.attrs,
				id: jp(s, n.toString()),
				role: "button",
				dir: i("dir"),
				tabIndex: m ? -1 : r.focused ? 0 : -1,
				"aria-label": r.valueText,
				"aria-disabled": we(!r.selectable),
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
					f && r.value && ho(r.value, f) || a({
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
				id: Np(s, n),
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
				id: Mp(s, n),
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
				id: Fp(s),
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
				id: Rp(s),
				dir: i("dir"),
				type: "button",
				"data-placement": j,
				"data-side": M,
				"aria-label": F.trigger(T),
				"aria-controls": Ap(s),
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
			let { view: n = "day" } = e, r = um(n, i("minView"), i("maxView")), o = r !== n, c = m || !o;
			return t.button({
				...Z.viewTrigger.attrs,
				"data-view": n,
				dir: i("dir"),
				id: Pp(s, n),
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
				id: Lp(s, n),
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
				"aria-invalid": we(g),
				"data-invalid": K(g),
				placeholder: i("placeholder") || nm(x),
				defaultValue: o("valueAsString")[n],
				onBeforeInput(e) {
					let { data: t } = Kt(e);
					Hu(t, P, x) || e.preventDefault();
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
						Ft(e) || I(d) || e.currentTarget.value.trim() !== "" && a({
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
						value: Uu(t, P, x),
						index: n
					});
				}
			});
		},
		getMonthSelectProps() {
			return t.select({
				...Z.monthSelect.attrs,
				id: Bp(s),
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
				id: Vp(s),
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
				id: zp(s),
				...Z.positioner.attrs,
				dir: i("dir"),
				style: N.floating
			});
		},
		getPresetTriggerProps(e) {
			let n = Array.isArray(e.value) ? e.value : Qu(e.value, x, S), r = n.filter((e) => e != null).map((e) => e.toDate(S).toDateString());
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
var gm = "__live-region__", _m = "__live-region-debug__", vm = "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;";
function ym(e = {}) {
	let { level: t = "polite", document: n = document, root: r, delay: i = 0, debug: a = !1 } = e, o = n.defaultView ?? window, s = r ?? n.body;
	function c() {
		if (!a) return;
		let e = n.getElementById(_m);
		return e || (e = n.createElement("div"), e.id = _m, e.dataset.liveAnnouncerDebug = "true", e.setAttribute("aria-hidden", "true"), e.style.cssText = vm, s.appendChild(e), e);
	}
	function l(e, r) {
		n.getElementById(gm)?.remove(), r ??= i;
		let a = n.createElement("span");
		a.id = gm, a.dataset.liveAnnouncer = "true";
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
		n.getElementById(gm)?.remove(), n.getElementById(_m)?.remove();
	}
	return {
		announce: l,
		destroy: u,
		toJSON() {
			return gm;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.machine.mjs
var { and: bm } = oa();
function xm(e, t) {
	if (e?.length !== t?.length) return !1;
	let n = Math.max(e.length, t.length);
	for (let r = 0; r < n; r++) if (!au(e[r], t[r])) return !1;
	return !0;
}
function Sm(e, t) {
	return e.map((e) => e == null ? "" : t("format")(e, {
		locale: t("locale"),
		timeZone: t("timeZone")
	}));
}
var Cm = sa({
	props({ props: e }) {
		let t = e.locale || "en-US", n = e.timeZone || "UTC", r = e.selectionMode || "single", i = e.numOfMonths || 1, a;
		if (e.createCalendar) {
			let n = new Intl.DateTimeFormat(t).resolvedOptions().calendar;
			n !== "gregory" && n !== "iso8601" && (a = e.createCalendar(n));
		}
		let o = (e) => !a || e.calendar.identifier === a.identifier ? e : rs(e, a), s = e.defaultValue ? $p(e.defaultValue).map((t) => ru(o(t), e.min, e.max)) : void 0, c = e.value ? $p(e.value).map((t) => ru(o(t), e.min, e.max)) : void 0, l = e.focusedValue || e.defaultFocusedValue || c?.[0] || s?.[0] || Nu(n, a);
		l = ru(o(l), e.min, e.max);
		let u = e.minView || "day", d = e.maxView || "year", f = sm(e.defaultView || e.view || u, u, d);
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
				return new Us(t, {
					timeZone: n,
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					calendar: a?.identifier
				}).format(e.toDate(n));
			},
			parse(e, { locale: t, timeZone: n }) {
				return Yu(e, t, n);
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
				isEqual: au,
				hash: (e) => e.toString(),
				sync: !0,
				onChange(t) {
					let r = n(), i = r.get("view"), a = r.get("value"), o = Sm(a, e);
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
				isEqual: xm,
				hash: (e) => e.map((e) => e?.toString() ?? "").join(","),
				onChange(t) {
					let r = n(), i = Sm(t, e);
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
				isEqual: au
			})),
			view: t(() => ({
				defaultValue: e("defaultView"),
				value: e("view"),
				onChange(t) {
					e("onViewChange")?.({ view: t });
				}
			})),
			startValue: t(() => ({
				defaultValue: iu(e("focusedValue") || e("defaultFocusedValue"), "start", { months: e("numOfMonths") }, e("locale")),
				isEqual: au,
				hash: (e) => e.toString()
			})),
			currentPlacement: t(() => ({ defaultValue: void 0 })),
			restoreFocus: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		isInteractive: ({ prop: e }) => !e("disabled") && !e("readOnly"),
		visibleDuration: ({ prop: e }) => ({ months: e("numOfMonths") }),
		endValue: ({ context: e, computed: t }) => du(e.get("startValue"), t("visibleDuration")),
		visibleRange: ({ context: e, computed: t }) => ({
			start: e.get("startValue"),
			end: t("endValue")
		}),
		visibleRangeText: ({ context: e, prop: t, computed: n }) => mm({
			view: e.get("view"),
			startValue: e.get("startValue"),
			endValue: n("endValue"),
			locale: t("locale"),
			timeZone: t("timeZone"),
			selectionMode: t("selectionMode")
		}),
		isPrevVisibleRangeValid: ({ context: e, prop: t }) => !cu(e.get("startValue"), t("min"), t("max")),
		isNextVisibleRangeValid: ({ prop: e, computed: t }) => !lu(t("endValue"), e("min"), e("max")),
		valueAsString: ({ context: e, prop: t }) => Sm(e.get("value"), t)
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
						guard: bm("shouldRestoreFocus", "isInteractOutsideEvent"),
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
						guard: bm("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd"
						]
					},
					{
						guard: bm("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
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
						guard: bm("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: bm("isRangePicker", "isSelectingEndDate"),
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
						guard: bm("isMultiPicker", "canSelectDate"),
						actions: ["setFocusedDate", "toggleSelectedDate"]
					},
					{
						guard: "isMultiPicker",
						actions: ["setFocusedDate"]
					},
					{
						guard: bm("closeOnSelect", "isOpenControlled"),
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
					guard: bm("isRangePicker", "isSelectingEndDate", "isDayPointerMoveOutsideVisibleMonth"),
					actions: ["setHoveredDate"]
				}, {
					guard: bm("isRangePicker", "isSelectingEndDate"),
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
						guard: bm("isRangePicker", "hasSelectedRange"),
						actions: [
							"setActiveIndexToStart",
							"resetSelection",
							"setActiveIndexToEnd",
							"focusNextDay"
						]
					},
					{
						guard: bm("isRangePicker", "isSelectingEndDate", "closeOnSelect", "isOpenControlled"),
						actions: [
							"setSelectedDate",
							"setActiveIndexToStart",
							"clearHoveredDate",
							"invokeOnClose"
						]
					},
					{
						guard: bm("isRangePicker", "isSelectingEndDate", "closeOnSelect"),
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
						guard: bm("isRangePicker", "isSelectingEndDate"),
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
						guard: bm("isMultiPicker", "canSelectDate"),
						actions: ["toggleSelectedDate"]
					},
					{ guard: "isMultiPicker" },
					{
						guard: bm("closeOnSelect", "isOpenControlled"),
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
			isAboveMinView: ({ context: e, prop: t }) => cm(e.get("view"), t("minView")),
			isDayView: ({ context: e, event: t }) => (t.view || e.get("view")) === "day",
			isMonthView: ({ context: e, event: t }) => (t.view || e.get("view")) === "month",
			isYearView: ({ context: e, event: t }) => (t.view || e.get("view")) === "year",
			isRangePicker: ({ prop: e }) => e("selectionMode") === "range",
			hasSelectedRange: ({ context: e }) => e.get("value").length === 2,
			isMultiPicker: ({ prop: e }) => e("selectionMode") === "multiple",
			canSelectDate: (e) => {
				let { context: t, prop: n, event: r } = e, i = n("maxSelectedDates");
				if (i == null) return !0;
				let a = t.get("value"), o = wm(e, r.value ?? t.get("focusedValue"));
				return a.some((e) => au(e, o)) ? !0 : a.length < i;
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
				return t("inline") ? void 0 : (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), wp(Xp(n), () => Yp(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				}));
			},
			setupLiveRegion({ scope: e, refs: t }) {
				let n = e.getDoc();
				return t.set("announcer", ym({
					level: "assertive",
					document: n
				})), () => t.get("announcer")?.destroy?.();
			},
			trackDismissableElement({ scope: e, send: t, context: n, prop: r }) {
				return r("inline") ? void 0 : al(() => Wp(e), {
					type: "popover",
					defer: !0,
					layerStyleTargets: [() => Yp(e)],
					exclude: [
						...Gp(e),
						Up(e),
						Jp(e)
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
				let n = um(e.get("view"), t("minView"), t("maxView"));
				e.set("view", n);
			},
			setPreviousView({ context: e, prop: t }) {
				let n = dm(e.get("view"), t("minView"), t("maxView"));
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
					o = e && t ? gu(e, t, i, a) : e ? gu(e, null, i, a) : t ? gu(t, null, i, a) : "";
				} else o = r.map((e) => gu(e, null, i, a)).filter(Boolean).join(",");
				n.get("announcer")?.announce(o, 3e3);
			},
			announceVisibleRange({ computed: e, refs: t }) {
				let { formatted: n } = e("visibleRangeText");
				t.get("announcer")?.announce(n);
			},
			disableTextSelection({ scope: e }) {
				Nn({
					target: Wp(e),
					doc: e.getDoc()
				});
			},
			enableTextSelection({ scope: e }) {
				Mn({
					doc: e.getDoc(),
					target: Wp(e)
				});
			},
			focusFirstSelectedDate(e) {
				let { context: t } = e;
				t.get("value").length && Q(e, t.get("value")[0]);
			},
			syncInputElement({ scope: e, computed: t }) {
				q(() => {
					Gp(e).forEach((e, n) => {
						Zt(e, t("valueAsString")[n] || "");
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
				let r = t.value.map((e) => ru(e, n("min"), n("max")));
				e.set("value", r);
			},
			clearDateValue({ context: e }) {
				e.set("value", []);
			},
			setSelectedDate(e) {
				let { context: t, event: n } = e, r = Array.from(t.get("value")), i = t.get("activeIndex"), a = r[i];
				r[i] = Tm(a, wm(e, n.value ?? t.get("focusedValue"))), t.set("value", Zp(r));
			},
			resetSelection(e) {
				let { context: t, event: n } = e, r = t.get("value")[0], i = wm(e, n.value ?? t.get("focusedValue"));
				t.set("value", [Tm(r, i)]);
			},
			toggleSelectedDate(e) {
				let { context: t, event: n } = e, r = wm(e, n.value ?? t.get("focusedValue")), i = t.get("value"), a = i.findIndex((e) => au(e, r));
				if (a === -1) {
					let e = [...i, r];
					t.set("value", $p(e));
				} else {
					let e = Array.from(i);
					e.splice(a, 1), t.set("value", $p(e));
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
				n[r] = Tm(i, e.get("focusedValue").copy()), e.set("value", Zp(n));
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
				Em(e, Fu(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
			},
			focusPreviousPage(e) {
				let { context: t, computed: n, prop: r } = e;
				Em(e, Iu(t.get("focusedValue"), t.get("startValue"), n("visibleDuration"), r("locale"), r("min"), r("max")));
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
				let { context: t, event: n, computed: r, prop: i } = e, a = Lu(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && Em(e, a);
			},
			focusPreviousSection(e) {
				let { context: t, event: n, computed: r, prop: i } = e, a = Ru(t.get("focusedValue"), t.get("startValue"), n.larger, r("visibleDuration"), i("locale"), i("min"), i("max"));
				a && Em(e, a);
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
				Q(e, Nu(n("timeZone"), r));
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
				let { context: t } = e, n = Mu(t.get("focusedValue").year);
				Q(e, t.get("focusedValue").set({ year: n[0] }));
			},
			focusLastYear(e) {
				let { context: t } = e, n = Mu(t.get("focusedValue").year);
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
					Hp(e, t.get("view"))?.focus({ preventScroll: !0 });
				});
			},
			focusActiveCellIfNeeded({ scope: e, context: t, event: n }) {
				n.focus && q(() => {
					Hp(e, t.get("view"))?.focus({ preventScroll: !0 });
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
					Up(e)?.focus({ preventScroll: !0 });
				});
			},
			focusFirstInputElement({ scope: e, event: t }) {
				t.focus !== !1 && q(() => {
					let [t] = Gp(e);
					(t ?? Up(e))?.focus({ preventScroll: !0 });
				});
			},
			focusInputElement({ scope: e }) {
				q(() => {
					let t = Gp(e);
					if (t.length === 0) {
						Up(e)?.focus({ preventScroll: !0 });
						return;
					}
					let n = t.findLastIndex((e) => e.value !== ""), r = t[Math.max(n, 0)];
					r?.focus({ preventScroll: !0 }), r?.setSelectionRange(r.value.length, r.value.length);
				});
			},
			syncMonthSelectElement({ scope: e, context: t }) {
				Zt(qp(e), t.get("startValue").month.toString());
			},
			syncYearSelectElement({ scope: e, context: t }) {
				Zt(Kp(e), t.get("startValue").year.toString());
			},
			setInputValue({ context: e, event: t }) {
				e.get("activeIndex") === t.index && e.set("inputValue", t.value);
			},
			syncInputValue({ scope: e, context: t, event: n }) {
				queueMicrotask(() => {
					Zt(Gp(e)[n.index ?? t.get("activeIndex")], t.get("inputValue"));
				});
			},
			focusParsedDate(e) {
				let { event: t, prop: n } = e;
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				r && rm(r) && Q(e, r);
			},
			selectParsedDate({ context: e, event: t, prop: n }) {
				if (t.index == null) return;
				let r = n("parse")(t.value, {
					locale: n("locale"),
					timeZone: n("timeZone")
				});
				if ((!r || !rm(r)) && t.value && (r = e.get("focusedValue").copy()), !r) return;
				r = ru(r, n("min"), n("max"));
				let i = Array.from(e.get("value"));
				i[t.index] = Tm(i[t.index], r);
				let a = Zp(i);
				e.set("value", a);
				let o = Sm(a, n);
				e.set("inputValue", o[t.index]);
			},
			resetView({ context: e }) {
				e.set("view", e.initial("view"));
			},
			setStartValue({ context: e, computed: t, prop: n }) {
				let r = e.get("focusedValue");
				if (!su(r, e.get("startValue"), t("endValue"))) return;
				let i = iu(r, "start", { months: n("numOfMonths") }, n("locale"));
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
}), wm = (e, t) => {
	let { context: n, prop: r } = e, i = n.get("view"), a = typeof t == "number" ? n.get("focusedValue").set({ [i]: t }) : t;
	return pm((e) => {
		lm(e, r("minView")) && (a = a.set({ [e]: +(e === "day") }));
	}), a;
}, Tm = (e, t) => {
	if (!e || !("hour" in e)) return t;
	let n = "timeZone" in e, r = t;
	return "hour" in t || (r = n ? is(ns(t), e.timeZone) : ns(t)), r.set({
		hour: e.hour,
		minute: e.minute,
		second: e.second,
		millisecond: e.millisecond
	});
};
function Q(e, t) {
	let { context: n, prop: r, computed: i } = e;
	if (!t) return;
	let a = wm(e, t);
	if (au(n.get("focusedValue"), a)) return;
	let o = Pu(i("visibleDuration"), r("locale"), r("min"), r("max"))({
		focusedDate: a,
		startDate: n.get("startValue")
	});
	n.set("startValue", o.startDate), n.set("focusedValue", o.focusedDate);
}
function Em(e, t) {
	let { context: n } = e;
	n.set("startValue", t.startDate), !au(n.get("focusedValue"), t.focusedDate) && n.set("focusedValue", t.focusedDate);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+date-picker@1.43.3_@internationalized+date@3.12.4/node_modules/@zag-js/date-picker/dist/date-picker.parse.mjs
function Dm(e) {
	return Array.isArray(e) ? e.map((e) => Dm(e)) : e instanceof Date ? new zs(e.getFullYear(), e.getMonth() + 1, e.getDate()) : js(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-context.js
var [Om, km] = sr({
	name: "DatePickerContext",
	hookName: "useDatePickerContext",
	providerName: "<DatePickerProvider />"
}), Am = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function jm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Am), a = km(), o = F(() => J(a().getClearTriggerProps(), i));
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
W(jm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-content.svelte
var Mm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Nm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Mm), o = km(), s = Ua(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
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
W(Nm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-context.svelte
function Pm(t, n) {
	k(n, !0);
	let r = B(n, "render", 7), i = km();
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
W(Pm, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-control.svelte
var Fm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Im(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Fm), a = km(), o = F(() => J(a().getControlProps(), i));
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
W(Im, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-view-props-context.js
var [Lm, Rm] = sr({
	name: "DatePickerViewPropsContext",
	hookName: "useDatePickerViewPropsContext",
	providerName: "<DatePickerViewPropsProvider />"
}), zm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Bm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, zm), a = km(), o = Rm(), s = F(() => J(a().getNextTriggerProps(o()), i));
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
W(Bm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-positioner.svelte
var Vm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Hm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Vm), a = km(), o = Ua(), s = F(() => J(a().getPositionerProps(), i));
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
W(Hm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-prev-trigger.svelte
var Um = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Wm(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Um), a = km(), o = Rm(), s = F(() => J(a().getPrevTriggerProps(o()), i));
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
W(Wm, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-range-text.svelte
var Gm = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Km(n, r) {
	k(r, !0);
	let i = B(r, "ref", 15, null), a = H(r, Gm), o = km(), s = F(() => J(o().getRangeTextProps(), a)), c = F(() => {
		let { start: e, end: t } = o().visibleRangeText;
		return jr([e, t]).filter(Boolean).join(" - ");
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
W(Km, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-visible@1.43.3/node_modules/@zag-js/focus-visible/dist/index.mjs
function qm(e) {
	return !(e.metaKey || !Dt() && e.altKey || e.ctrlKey || e.key === "Control" || e.key === "Shift" || e.key === "Meta");
}
var Jm = /* @__PURE__ */ new Set([
	"checkbox",
	"radio",
	"range",
	"color",
	"file",
	"image",
	"button",
	"submit",
	"reset"
]), Ym = [
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
function Xm(e, t, n) {
	let r = n ? Mt(n) : null, i = Ke(r), a = Je(r), o = Ye(i);
	return e = e || o instanceof a.HTMLInputElement && !Jm.has(o?.type) || o instanceof a.HTMLTextAreaElement || o instanceof a.HTMLElement && o.isContentEditable, !(e && t === "keyboard" && n instanceof a.KeyboardEvent && !Reflect.has(ih, n.key));
}
var Zm = null, Qm = /* @__PURE__ */ new Set(), $m = /* @__PURE__ */ new Map(), eh = !1, th = null, nh = !1, rh = null, ih = {
	Tab: !0,
	Escape: !0
};
function ah(e, t) {
	for (let n of Qm) n(e, t);
}
function oh(e) {
	th = null, eh = !0, qm(e) && (Zm = "keyboard", ah("keyboard", e));
}
function sh(e) {
	(e.type !== "pointermove" && e.type !== "mousemove" || rh?.x !== e.clientX || rh?.y !== e.clientY) && (rh = {
		x: e.clientX,
		y: e.clientY
	}, Zm = "pointer", (e.type === "mousedown" || e.type === "pointerdown") && (th = null, eh = !0, ah("pointer", e)));
}
function ch(e) {
	if (Rt(e)) {
		th = null, eh = !0, Zm = "virtual";
		return;
	}
	th = null;
	let t = Mt(e), n = t?.closest("label"), r = n?.control;
	if (!n || !r || r.matches(":disabled")) return;
	let i = t?.closest(Ym);
	i && n.contains(i) && i !== r || r !== Ye(n.ownerDocument) && (th = r);
}
function lh(e) {
	let t = Mt(e), n = t === th;
	t !== Je(t) && t !== Ke(t) && e.isTrusted && (!eh && !n && !nh && (Zm = "virtual", ah("virtual", e)), eh = !1, th = null, nh = !1);
}
function uh() {
	eh = !1, th = null, nh = !0;
}
function dh(e) {
	if (typeof window > "u" || $m.get(Je(e))) return;
	let t = Je(e), n = Ke(e), r = t.HTMLElement.prototype.focus;
	function i() {
		eh = !0, r.apply(this, arguments);
	}
	try {
		Object.defineProperty(t.HTMLElement.prototype, "focus", {
			configurable: !0,
			value: i
		});
	} catch {}
	n.addEventListener("keydown", oh, !0), n.addEventListener("keyup", oh, !0), n.addEventListener("click", ch, !0), t.addEventListener("focus", lh, !0), t.addEventListener("blur", uh, !1), t.PointerEvent === void 0 ? (n.addEventListener("mousedown", sh, !0), n.addEventListener("mousemove", sh, !0), n.addEventListener("mouseup", sh, !0)) : (n.addEventListener("pointerdown", sh, !0), n.addEventListener("pointermove", sh, !0), n.addEventListener("pointerup", sh, !0)), t.addEventListener("beforeunload", () => {
		fh(e);
	}, { once: !0 }), $m.set(t, { focus: r });
}
var fh = (e, t) => {
	let n = Je(e), r = Ke(e);
	t && r.removeEventListener("DOMContentLoaded", t);
	let i = $m.get(n);
	if (i) {
		try {
			Object.defineProperty(n.HTMLElement.prototype, "focus", {
				configurable: !0,
				value: i.focus
			});
		} catch {}
		r.removeEventListener("keydown", oh, !0), r.removeEventListener("keyup", oh, !0), r.removeEventListener("click", ch, !0), n.removeEventListener("focus", lh, !0), n.removeEventListener("blur", uh, !1), n.PointerEvent === void 0 ? (r.removeEventListener("mousedown", sh, !0), r.removeEventListener("mousemove", sh, !0), r.removeEventListener("mouseup", sh, !0)) : (r.removeEventListener("pointerdown", sh, !0), r.removeEventListener("pointermove", sh, !0), r.removeEventListener("pointerup", sh, !0)), $m.delete(n);
	}
};
function ph() {
	return Zm;
}
function mh(e) {
	Zm = e, ah(e, null);
}
function hh() {
	return Zm === "keyboard" || Zm === "virtual";
}
function gh(e = {}) {
	let { isTextInput: t, autoFocus: n, onChange: r, root: i } = e;
	dh(i), r?.({
		isFocusVisible: n || hh(),
		modality: Zm
	});
	let a = (e, n) => {
		Xm(!!t, e, n) && r?.({
			isFocusVisible: hh(),
			modality: e
		});
	};
	return Qm.add(a), () => {
		Qm.delete(a);
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker.svelte.js
var _h = (e) => {
	let t = lr(), n = $a(), r = F(() => {
		let r = ni(e);
		return {
			dir: n().dir,
			locale: n().locale,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ea(Cm, () => S(r)), a = F(() => hm(i, va));
	return () => S(a);
}, vh = /* @__PURE__ */ new Set([
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
function yh(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "ref", 15, null), a = B(n, "value", 15), s = B(n, "focusedValue", 15), c = B(n, "open", 15), l = B(n, "view", 15), u = H(n, vh), d = F(() => Va(u)), f = F(() => P(S(d), 2)), p = F(() => S(f)[0]), m = F(() => S(f)[1]), h = F(() => pr()(S(m), /* @__PURE__ */ "closeOnSelect.createCalendar.defaultFocusedValue.defaultOpen.defaultValue.defaultView.disabled.fixedWeeks.focusedValue.format.id.ids.inline.invalid.isDateUnavailable.locale.max.maxSelectedDates.maxView.min.minView.name.numOfMonths.onFocusChange.onOpenChange.onValueChange.onViewChange.onVisibleRangeChange.open.openOnClick.outsideDaySelectable.parse.placeholder.positioning.readOnly.required.selectionMode.showWeekNumbers.startOfWeek.timeZone.translations.value.view".split("."))), g = F(() => P(S(h), 2)), _ = F(() => S(g)[0]), v = F(() => S(g)[1]), y = F(() => ({
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
	})), b = _h(() => S(y)), x = Ba(() => ({
		present: b().open,
		...S(p)
	})), C = F(() => J(b().getRootProps(), S(v)));
	return Om(b), Ha(x), Y(t, I({ as: "div" }, () => S(C), {
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
W(yh, {
	ref: {},
	value: {},
	focusedValue: {},
	open: {},
	view: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-props-context.js
var [bh, xh] = sr({
	name: "DatePickerTablePropsContext",
	hookName: "useDatePickerTablePropsContext",
	providerName: "<DatePickerTablePropsProvider />"
}), Sh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"columns"
]);
function Ch(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "columns", 7), a = H(n, Sh), s = km(), c = Rm(), l = F(() => ({
		id: r,
		columns: i(),
		...c()
	})), u = F(() => J(s().getTableProps(S(l)), a));
	return bh(() => S(l)), Y(t, I({ as: "table" }, () => S(u))), L({
		get columns() {
			return i();
		},
		set columns(t) {
			i(t), e();
		}
	});
}
W(Ch, { columns: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-body.svelte
var wh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Th(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, wh), a = km(), o = F(() => J(a().getTableBodyProps(), i));
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
W(Th, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-head.svelte
var Eh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Dh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Eh), a = km(), o = xh(), s = F(() => J(a().getTableHeadProps(o()), i));
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
W(Dh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-row.svelte
var Oh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function kh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Oh), a = km(), o = xh(), s = F(() => J(a().getTableRowProps(o()), i));
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
W(kh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-trigger.svelte
var Ah = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function jh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ah), a = km(), o = F(() => J(a().getTriggerProps(), i));
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
W(jh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/use-date-picker-table-cell-props-context.js
var [Mh, Nh] = sr({
	name: "DatePickerTableCellPropsContext",
	hookName: "useDatePickerTableCellPropsContext",
	providerName: "<DatePickerTableCellPropsProvider />"
}), Ph = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Fh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ph), a = F(() => pr()(i, [
		"disabled",
		"value",
		"visibleRange",
		"columns"
	])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = km(), u = Rm(), d = F(() => () => ({
		day: l().getDayTableCellProps,
		month: l().getMonthTableCellProps,
		year: l().getYearTableCellProps
	})[u().view](S(s))), f = F(() => J(S(d), S(c)));
	return Mh(() => S(s)), Y(t, I({ as: "td" }, () => S(f), {
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
W(Fh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-cell-trigger.svelte
var Ih = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Lh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Ih), a = km(), o = Nh(), s = Rm(), c = F(() => {
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
W(Lh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-table-header.svelte
var Rh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function zh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Rh), a = km(), o = xh(), s = F(() => J(a().getTableHeaderProps(o()), i));
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
W(zh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view.svelte
var Bh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Bh), a = F(() => pr()(i, ["view"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = km(), u = F(() => J(l().getViewProps(S(s)), S(c)));
	return Lm(() => S(s)), Y(t, I({ as: "div" }, () => S(u), {
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
W(Vh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-control.svelte
var Hh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Uh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Hh), a = km(), o = Rm(), s = F(() => J(a().getViewControlProps(o()), i));
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
W(Uh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/date-picker/date-picker-view-trigger.svelte
var Wh = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Gh(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Wh), a = km(), o = Rm(), s = F(() => J(a().getViewTriggerProps(o()), i));
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
W(Gh, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/DateField.svelte
var Kh = /^(\d{4})-(\d{2})-(\d{2})$/, qh = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, Jh = (e) => String(e).padStart(2, "0");
function Yh(e, t, n) {
	let r = new Date(Date.UTC(2e3, t - 1, n));
	return r.setUTCFullYear(e), r.getUTCFullYear() !== e || r.getUTCMonth() !== t - 1 || r.getUTCDate() !== n ? null : `${String(e).padStart(4, "0")}-${Jh(t)}-${Jh(n)}`;
}
function Xh(e) {
	let t = Kh.exec(e ?? "");
	return t ? Yh(Number(t[1]), Number(t[2]), Number(t[3])) : null;
}
function Zh(e) {
	let t = e.trim(), n = qh.exec(t);
	return n ? Yh(Number(n[3]), Number(n[2]), Number(n[1])) : Xh(t);
}
var Qh = (e) => /^vi(-|$)/i.test(e ?? "");
function $h(e, t) {
	let n = Qh(t), r = n ? {
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
function eg() {
	let e = /* @__PURE__ */ new Date();
	return `${String(e.getFullYear()).padStart(4, "0")}-${Jh(e.getMonth() + 1)}-${Jh(e.getDate())}`;
}
var tg = (e, t) => e.replace(/\{(\w+)\}/g, (e, n) => t[n] ?? e), ng = g("<svg viewBox=\"0 0 16 16\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" aria-hidden=\"true\"><rect x=\"2\" y=\"3\" width=\"12\" height=\"11\" rx=\"2\"></rect><path d=\"M2 6.5h12M5.5 1.5v3M10.5 1.5v3\"></path></svg>"), rg = m("<input part=\"input\" data-scope=\"date-picker\" autocomplete=\"off\" spellcheck=\"false\" class=\"svelte-1voin8a\"/> <!>", 1), ig = m("<!> <!> <!>", 1), ag = m("<!> <!>", 1), og = m("<!> <!> <!> <footer class=\"svelte-1voin8a\"><button type=\"button\" part=\"today\" class=\"af-button ghost\"> </button> <!></footer>", 1), sg = m("<div class=\"af-kit\"><!></div>"), cg = {
	hash: "svelte-1voin8a",
	code: ":host {display:inline-block;max-width:100%;vertical-align:middle;}input.svelte-1voin8a {flex:1;min-width:0;width:8.5em;border:0;outline:none;background:transparent;color:inherit;font:inherit;}input.svelte-1voin8a::placeholder {color:var(--k-muted);}footer.svelte-1voin8a {display:flex;justify-content:space-between;gap:8px;margin-top:4px;}[data-scope='date-picker'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='date-picker'][hidden] {display:none !important;}[data-scope='date-picker'][data-part='control'] {display:flex;align-items:center;gap:2px;box-sizing:border-box;width:100%;min-height:32px;padding:0 2px 0 10px;border:1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%);border-radius:max(0px, calc(var(--k-radius) - 2px));background:var(--k-surface);}[data-scope='date-picker'][data-part='control']:focus-within {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='date-picker'][data-part='content'] {padding:8px;}[data-scope='date-picker'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='date-picker'][data-part='view-control'] {display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:4px;}[data-scope='date-picker'][data-part='range-text'] {font-weight:600;}[data-scope='date-picker'][data-part='table'] {border-collapse:collapse;}[data-scope='date-picker'][data-part='table-header'] {padding:4px 0;color:var(--k-muted);font-size:12px;font-weight:500;}[data-scope='date-picker'][data-part='table-cell'] {padding:1px;text-align:center;}[data-scope='date-picker'][data-part='table-cell-trigger'] {display:inline-grid;place-items:center;min-width:32px;min-height:32px;padding:0 4px;border:0;border-radius:6px;background:transparent;color:inherit;font:inherit;cursor:pointer;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-view='month'], [data-scope='date-picker'][data-part='table-cell-trigger'][data-view='year'] {min-width:56px;}[data-scope='date-picker'][data-part='table-cell-trigger']:hover:not([data-disabled]) {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}[data-scope='date-picker'][data-part='table-cell-trigger']:focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}[data-scope='date-picker'][data-part='table-cell-trigger'][data-today] {box-shadow:inset 0 0 0 1px var(--k-primary);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-selected] {background:var(--k-primary);color:var(--k-primary-fg);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-outside-range] {color:var(--k-muted);}[data-scope='date-picker'][data-part='table-cell-trigger'][data-disabled] {opacity:0.4;cursor:not-allowed;}"
};
function lg(n, i) {
	k(i, !0), de(n, cg);
	let a = B(i, "value", 7, null), o = B(i, "locale", 7, null), s = B(i, "min", 7, null), c = B(i, "max", 7, null), f = B(i, "clearable", 7, !1), m = B(i, "placeholder", 7, null), h = B(i, "label", 7, null), g = B(i, "disabled", 7, !1), y = B(i, "strings", 7, null), w = i.$$host, D = F(() => Wl(o(), y() ?? void 0)), j = F(() => Qh(o()) ? "vi-VN" : "en-GB"), N = F(() => Xh(a())), P = F(() => Xh(s())), te = F(() => Xh(c())), ne = F(() => S(N) ? $h(S(N), o()) : ""), z = F(() => S(N) !== null && (S(P) !== null && S(N) < S(P) || S(te) !== null && S(N) > S(te))), ie = F(() => S(N) && !S(z) ? [Dm(S(N))] : []), ae = (e) => e === "month" ? S(D).viewMonth : e === "year" ? S(D).viewYear : S(D).viewDay, oe = _(!1), H = _(null), se = _(null), ce = !1;
	C(() => Ll(S(H), S(oe), w));
	let W = (e) => S(P) !== null && e < S(P) || S(te) !== null && e > S(te);
	function le(e) {
		return e !== null && W(e) ? !1 : (e !== S(N) && Il(w, "change", { value: e }), !0);
	}
	function pe() {
		if (!S(se) || !ce) return;
		ce = !1;
		let e = S(se).value.trim(), t = e === "" ? f() ? null : void 0 : Zh(e) ?? void 0;
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
	}, _e = ag(), ve = V(_e);
	return Fl(ve, {}), fr(T(ve, 2), {
		value: () => w.shadowRoot,
		children: (e, n) => {
			var i = sg(), a = d(i), s = () => S(ie);
			{
				let e = F(() => S(P) ? Dm(S(P)) : void 0), n = F(() => S(te) ? Dm(S(te)) : void 0), i = F(() => !!g()), c = F(() => ({
					trigger: (e) => e ? S(D).closeCalendar : S(D).openCalendar,
					content: S(D).calendar,
					clearTrigger: S(D).clear,
					dayCell: (e) => tg(e.selected ? S(D).selectedDate : S(D).chooseDate, { date: e.valueText }),
					viewTrigger: (e, t) => tg(t ? S(D).switchView : S(D).currentView, { view: ae(t ?? e) }),
					prevTrigger: (e) => e === "day" ? S(D).previousMonth : e === "month" ? S(D).previousYear : S(D).previousDecade,
					nextTrigger: (e) => e === "day" ? S(D).nextMonth : e === "month" ? S(D).nextYear : S(D).nextDecade
				}));
				A(a, () => yh, (a, _) => {
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
						format: (e) => $h(e.toString(), o()),
						get translations() {
							return S(c);
						},
						onValueChange: (e) => le(e.value[0]?.toString() ?? null),
						onOpenChange: (e) => E(oe, e.open, !0),
						children: (e, n) => {
							var i = ag(), a = V(i);
							A(a, () => Im, (e, t) => {
								t(e, {
									part: "control",
									children: (e, t) => {
										var n = rg(), r = V(n);
										re(r), O(r, (e) => E(se, e), () => S(se));
										var i = T(r, 2);
										A(i, () => jh, (e, t) => {
											t(e, {
												part: "trigger",
												class: "af-button ghost",
												children: (e, t) => {
													var n = ng();
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
							A(o, () => Hm, (e, n) => {
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
										A(a, () => Nm, (e, n) => {
											n(e, {
												class: "af-overlay date",
												part: "content",
												children: (e, n) => {
													var i = p(), a = V(i);
													{
														let e = (e, n = ue) => {
															var i = og(), a = V(i);
															A(a, () => Vh, (e, i) => {
																i(e, {
																	view: "day",
																	children: (e, i) => {
																		var a = ag(), o = V(a);
																		A(o, () => Uh, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = ig(), r = V(n);
																					A(r, () => Wm, (e, t) => {
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
																					A(i, () => Gh, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = p(), r = V(n);
																								A(r, () => Km, (e, t) => {
																									t(e, {});
																								}), R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = T(i, 2);
																					A(a, () => Bm, (e, t) => {
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
																		A(s, () => Ch, (e, i) => {
																			i(e, {
																				children: (e, i) => {
																					var a = ag(), o = V(a);
																					A(o, () => Dh, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								A(o, () => kh, (e, i) => {
																									i(e, {
																										children: (e, i) => {
																											var a = p(), o = V(a);
																											r(o, 17, () => n()().weekDays, fe, (e, n) => {
																												var r = p(), i = V(r);
																												A(i, () => zh, (e, r) => {
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
																					A(s, () => Th, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								r(o, 17, () => n()().weeks, fe, (e, i, a) => {
																									var o = p(), s = V(o);
																									A(s, () => kh, (e, i) => {
																										i(e, {
																											children: (e, i) => {
																												var o = p(), s = V(o);
																												r(s, 17, () => n()().getDaysInWeek(a), (e) => e.toString(), (e, n) => {
																													var r = p(), i = V(r);
																													A(i, () => Fh, (e, r) => {
																														r(e, {
																															get value() {
																																return S(n);
																															},
																															children: (e, r) => {
																																var i = p(), a = V(i);
																																A(a, () => Lh, (e, r) => {
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
															A(o, () => Vh, (e, i) => {
																i(e, {
																	view: "month",
																	children: (e, i) => {
																		var a = ag(), o = V(a);
																		A(o, () => Uh, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = ig(), r = V(n);
																					A(r, () => Wm, (e, t) => {
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
																					A(i, () => Gh, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = p(), r = V(n);
																								A(r, () => Km, (e, t) => {
																									t(e, {});
																								}), R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = T(i, 2);
																					A(a, () => Bm, (e, t) => {
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
																		A(s, () => Ch, (e, i) => {
																			i(e, {
																				children: (e, i) => {
																					var a = p(), o = V(a);
																					A(o, () => Th, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								r(o, 17, () => n()().getMonthsGrid({
																									columns: 4,
																									format: "short"
																								}), fe, (e, n) => {
																									var i = p(), a = V(i);
																									A(a, () => kh, (e, i) => {
																										i(e, {
																											children: (e, i) => {
																												var a = p(), o = V(a);
																												r(o, 17, () => S(n), (e) => e.value, (e, n) => {
																													var r = p(), i = V(r);
																													A(i, () => Fh, (e, r) => {
																														r(e, {
																															get value() {
																																return S(n).value;
																															},
																															children: (e, r) => {
																																var i = p(), a = V(i);
																																A(a, () => Lh, (e, r) => {
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
															A(s, () => Vh, (e, i) => {
																i(e, {
																	view: "year",
																	children: (e, i) => {
																		var a = ag(), o = V(a);
																		A(o, () => Uh, (e, t) => {
																			t(e, {
																				children: (e, t) => {
																					var n = ig(), r = V(n);
																					A(r, () => Wm, (e, t) => {
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
																					A(i, () => Gh, (e, t) => {
																						t(e, {
																							class: "af-button ghost",
																							children: (e, t) => {
																								var n = p(), r = V(n);
																								A(r, () => Km, (e, t) => {
																									t(e, {});
																								}), R(e, n);
																							},
																							$$slots: { default: !0 }
																						});
																					});
																					var a = T(i, 2);
																					A(a, () => Bm, (e, t) => {
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
																		A(s, () => Ch, (e, i) => {
																			i(e, {
																				children: (e, i) => {
																					var a = p(), o = V(a);
																					A(o, () => Th, (e, i) => {
																						i(e, {
																							children: (e, i) => {
																								var a = p(), o = V(a);
																								r(o, 17, () => n()().getYearsGrid({ columns: 4 }), fe, (e, n) => {
																									var i = p(), a = V(i);
																									A(a, () => kh, (e, i) => {
																										i(e, {
																											children: (e, i) => {
																												var a = p(), o = V(a);
																												r(o, 17, () => S(n), (e) => e.value, (e, n) => {
																													var r = p(), i = V(r);
																													A(i, () => Fh, (e, r) => {
																														r(e, {
																															get value() {
																																return S(n).value;
																															},
																															children: (e, r) => {
																																var i = p(), a = V(i);
																																A(a, () => Lh, (e, r) => {
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
																A(i, () => jm, (e, r) => {
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
															}, [() => W(eg())]), v("click", m, () => {
																le(eg()) && me(n());
															}), R(e, i);
														};
														A(a, () => Pm, (t, n) => {
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
]), W(lg, {
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
var ug = m("<header class=\"svelte-gp7kvq\"><!> <button type=\"button\" part=\"close\" class=\"af-button ghost icon\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></header> <div part=\"body\" class=\"svelte-gp7kvq\"><!></div> <footer part=\"actions\" class=\"svelte-gp7kvq\"><!></footer>", 1), dg = m("<dialog><!></dialog>"), fg = m("<!> <!>", 1), pg = {
	hash: "svelte-gp7kvq",
	code: "dialog.svelte-gp7kvq {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-gp7kvq::backdrop {background:rgb(0 0 0 / 0.4);}\n  /* On a short window the body scrolls between a heading and a footer that stay in view. */header.svelte-gp7kvq {display:flex;flex:none;align-items:center;justify-content:space-between;gap:12px;margin-right:-8px;}[part='body'].svelte-gp7kvq {flex:1 1 auto;min-height:0;margin:-4px -16px;padding:4px 16px;overflow:auto;overscroll-behavior:contain;}footer.svelte-gp7kvq {display:flex;flex:none;flex-wrap:wrap;justify-content:flex-end;gap:8px;}footer[hidden].svelte-gp7kvq {display:none;}[data-scope='dialog'][data-part='content'] {display:flex;flex-direction:column;gap:12px;width:min(480px, calc(100vw - 32px));max-height:calc(100dvh - 64px);padding:16px;border-radius:calc(var(--k-radius) + 4px);box-sizing:border-box;}[data-scope='dialog'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='dialog'][data-part='title'] {margin:0;font-size:16px;font-weight:600;line-height:24px;}"
};
function mg(r, i) {
	k(i, !0), de(r, pg);
	let a = B(i, "open", 7, !1), o = B(i, "heading", 7, ""), s = B(i, "locale", 7, null), c = B(i, "strings", 7, null), u = i.$$host, f = F(() => Wl(s(), c() ?? void 0)), m = _(null), h = "escape", g = _(null), y = _(!1), b = Hl(u);
	C(() => b(S(m), !!a()));
	let w = null, D = null, N = (e) => !(e instanceof Node && zl(u, e)) && Vl(u);
	C(() => {
		if (a() && S(m)) return n(u.ownerDocument, "pointerdown", (e) => {
			e !== D && e.button === 0 && e.pointerType !== "touch" && N(e.composedPath()[0] ?? null) && (w = e, Il(u, "close", { reason: "outside" }));
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
	}, ee = fg(), te = V(ee);
	return Fl(te, {}), fr(T(te, 2), {
		value: () => u.shadowRoot,
		children: (e, n) => {
			var r = p(), s = V(r), c = () => !!a();
			A(s, () => jl, (e, n) => {
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
						e.open || (Il(u, "close", { reason: h }), h = "escape");
					},
					children: (e, n) => {
						var r = p(), a = V(r);
						{
							let e = (e, n = ue) => {
								var r = dg(), a = (e) => e.preventDefault();
								j(r, (e) => ({
									...e,
									class: "af-kit",
									oncancel: a
								}), [() => n()()], void 0, void 0, "svelte-gp7kvq");
								var s = d(r);
								A(s, () => qa, (e, n) => {
									n(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, n) => {
											var r = ug(), a = V(r), s = d(a);
											A(s, () => Nl, (e, n) => {
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
											}), v("click", c, () => Il(u, "close", { reason: "close-button" })), R(e, r);
										},
										$$slots: { default: !0 }
									});
								}), M(r), O(r, (e) => E(m, e), () => S(m)), R(e, r);
							};
							A(a, () => Za, (t, n) => {
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
f(["click"]), W(mg, {
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
var [hg, gg] = sr({
	name: "MenuContext",
	hookName: "useMenuContext",
	providerName: "<MenuProvider />",
	strict: !1
}), [_g, vg] = sr({
	name: "MenuItemContext",
	hookName: "useMenuItemContext",
	providerName: "<MenuItemProvider />"
}), [yg, bg] = sr({
	name: "MenuItemPropsContext",
	hookName: "useMenuItemPropsContext",
	providerName: "<MenuItemPropsProvider />"
}), xg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sg(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, xg), o = gg(), s = Ua(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
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
W(Sg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-context.svelte
function Cg(t, n) {
	k(n, !0);
	let r = B(n, "render", 7), i = gg();
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
W(Cg, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-item.svelte
var wg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Tg(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, wg), a = F(() => pr()(i, [
		"closeOnSelect",
		"disabled",
		"value",
		"valueText",
		"onSelect"
	])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = gg(), u = F(() => J(l().getItemProps(S(s)), S(c))), d = F(() => l().getItemState(S(s)));
	return C(() => l().addItemListener({
		id: S(d).id,
		onSelect: S(s).onSelect
	})), yg(() => S(s)), _g(() => S(d)), Y(t, I({ as: "div" }, () => S(u), {
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
W(Tg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-positioner.svelte
var Eg = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Dg(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Eg), a = gg(), o = Ua(), s = F(() => J(a().getPositionerProps(), i));
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
W(Dg, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/use-menu-machine-context.js
var [Og, kg] = sr({
	name: "MenuMachineContext",
	hookName: "useMenuMachineContext",
	providerName: "<MenuMachineProvider />",
	strict: !1
}), [Ag, jg] = sr({
	name: "MenuTriggerItemContext",
	hookName: "useMenuTriggerItemContext",
	providerName: "<MenuTriggerItemProvider />",
	strict: !1
}), Mg = Zs("menu").parts("arrow", "arrowTip", "content", "contextTrigger", "indicator", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "positioner", "separator", "trigger", "triggerItem").build(), Ng = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `menu:${e.id}:trigger:${t}` : `menu:${e.id}:trigger` : Kr(n) ? n(t) : n;
}, Pg = (e, t) => {
	let n = e.ids?.contextTrigger;
	return n == null ? t ? `menu:${e.id}:ctx-trigger:${t}` : `menu:${e.id}:ctx-trigger` : Kr(n) ? n(t) : n;
}, Fg = (e) => e.ids?.content ?? `menu:${e.id}:content`, Ig = (e) => e.ids?.arrow ?? `menu:${e.id}:arrow`, Lg = (e) => e.ids?.positioner ?? `menu:${e.id}:popper`, Rg = (e, t) => e.ids?.group?.(t) ?? `menu:${e.id}:group:${t}`, zg = (e, t) => `${e.id}/${t}`, Bg = (e) => e?.dataset.value ?? null, Vg = (e, t) => e.ids?.groupLabel?.(t) ?? `menu:${e.id}:group-label:${t}`, Hg = (e) => e.getById(Fg(e)), Ug = (e) => e.getById(Lg(e)), Wg = (e) => e.getById(Ng(e)), Gg = (e, t) => t ? e.getById(zg(e, t)) : null, Kg = (e) => e.getById(Pg(e)), qg = (e) => Rn(e.getRootNode(), `[data-scope="menu"][data-part="trigger"]${Oe(e.id)}`), Jg = (e) => Rn(e.getRootNode(), `[data-scope="menu"][data-part="context-trigger"]${Oe(e.id)}`), Yg = (e, t) => t == null ? Wg(e) ?? qg(e)[0] : e.getById(Ng(e, t)), Xg = (e) => {
	let t = `[role^="menuitem"]${Oe(Fg(e))}:not([data-disabled])`;
	return Rn(Hg(e), t);
}, Zg = (e) => Er(Xg(e)), Qg = (e) => Dr(Xg(e)), $g = (e, t) => t ? e.id === t || e.dataset.value === t : !1, e_ = (e, t) => {
	let n = Xg(e);
	return Pr(n, n.findIndex((e) => $g(e, t.value)), { loop: t.loop ?? t.loopFocus });
}, t_ = (e, t) => {
	let n = Xg(e);
	return Ir(n, n.findIndex((e) => $g(e, t.value)), { loop: t.loop ?? t.loopFocus });
}, n_ = (e, t) => {
	let n = Xg(e), r = n.find((e) => $g(e, t.value));
	return $n(n, {
		state: t.typeaheadState,
		key: t.key,
		activeId: r?.id ?? null
	});
}, r_ = (e) => Me(e) && (e.dataset.disabled === "" || e.hasAttribute("disabled")), i_ = (e) => !!e?.getAttribute("role")?.startsWith("menuitem") && !!e?.hasAttribute("data-controls"), a_ = "menu:select";
function o_(e, t) {
	if (!e) return;
	let n = new (Je(e)).CustomEvent(a_, { detail: { value: t } });
	e.dispatchEvent(n);
}
function s_(e) {
	let t = Fg(e);
	return Hg(e) ?? e.getDoc().getElementById(t);
}
function c_(e, t) {
	if (!Me(e)) return !1;
	for (let n in t) {
		let r = t[n], i = s_(r.scope);
		if (i && Ge(i, e)) return !0;
		let a = r.refs.get("children");
		if (Object.keys(a).length > 0 && c_(e, a)) return !0;
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/rect.mjs
var l_ = (e, t) => ({
	x: e,
	y: t
});
function u_(e) {
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
		center: l_(a, o)
	};
}
function d_(e) {
	return {
		top: l_(e.minX, e.minY),
		right: l_(e.maxX, e.minY),
		bottom: l_(e.maxX, e.maxY),
		left: l_(e.minX, e.maxY)
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+rect-utils@1.43.3/node_modules/@zag-js/rect-utils/dist/polygon.mjs
function f_(e, t) {
	let { top: n, right: r, left: i, bottom: a } = d_(u_(e)), [o] = t.split("-");
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
function p_(e, t) {
	let { x: n, y: r } = t, i = !1;
	for (let t = 0, a = e.length - 1; t < e.length; a = t++) {
		let o = e[t].x, s = e[t].y, c = e[a].x, l = e[a].y;
		s > r != l > r && n < (c - o) * (r - s) / (l - s) + o && (i = !i);
	}
	return i;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.utils.mjs
function m_(e) {
	let t = e.parent;
	for (; t && t.context.get("isSubmenu");) t = t.refs.get("parent");
	t?.send({ type: "CLOSE" });
}
function h_(e, t) {
	return e ? p_(e, t) : !1;
}
function g_(e, t, n) {
	let r = Object.keys(e).length > 0;
	if (!t) return null;
	if (!r) return zg(n, t);
	for (let n in e) {
		let r = e[n], i = Ng(r.scope);
		if (i === t) return i;
	}
	return zg(n, t);
}
function __(e, t) {
	e && (e.refs.set("pointerRoutingLocked", t), e.context.set("pointerRoutingMode", t ? "locked" : "interactive"));
}
function v_(e) {
	let t = e.context.get("highlightedValue");
	if (!t) return !1;
	let n = e.refs.get("children");
	for (let e in n) {
		let r = n[e];
		if (r.state.hasTag("open") && Ng(r.scope) === t) return !0;
	}
	return !1;
}
function y_(e, t) {
	e && (e.refs.get("pointerRoutingLocked") || t && v_(e) || __(e, !1));
}
function b_(e) {
	e && (v_(e) || __(e, !1));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.connect.mjs
function x_(e, t) {
	let { context: n, send: r, state: i, computed: a, prop: o, scope: s } = e, c = i.hasTag("open"), l = n.get("isSubmenu"), u = a("isTypingAhead"), d = o("composite"), f = n.get("currentPlacement"), p = f ? sp(f) : void 0, m = n.get("anchorPoint"), h = n.get("highlightedValue"), g = n.get("triggerValue"), _ = Ep({
		...o("positioning"),
		placement: f
	});
	function v(e) {
		return {
			id: zg(s, e.value),
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
		let { closeOnSelect: n, valueText: i, value: a } = e, o = v(e), c = zg(s, a);
		return t.element({
			...Mg.item.attrs,
			id: c,
			role: "menuitem",
			"aria-disabled": we(o.disabled),
			"data-disabled": K(o.disabled),
			"data-ownedby": Fg(s),
			"data-highlighted": K(o.highlighted),
			"data-value": a,
			"data-valuetext": i,
			onDragStart(e) {
				e.currentTarget.matches("a[href]") && e.preventDefault();
			},
			onPointerMove(e) {
				if (o.disabled || e.pointerType !== "mouse" || ph() !== "pointer") return;
				let t = e.currentTarget;
				if (o.highlighted) return;
				let i = qt(e);
				r({
					type: "ITEM_POINTERMOVE",
					id: c,
					target: t,
					closeOnSelect: n,
					point: i
				});
			},
			onPointerLeave(e) {
				if (o.disabled || e.pointerType !== "mouse" || ph() !== "pointer") return;
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
				if (Pt(e) || Nt(e) || o.disabled) return;
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
			return t.addEventListener(a_, n), () => t.removeEventListener(a_, n);
		},
		getContextTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && g === n, a = Pg(s, n);
			return t.element({
				...Mg.contextTrigger.attrs,
				dir: o("dir"),
				id: a,
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": K(i),
				"data-state": c ? "open" : "closed",
				onPointerDown(e) {
					if (e.pointerType === "mouse") return;
					let t = qt(e);
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
					let t = qt(e);
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
			return Ii(x({ value: t.id }), t);
		},
		getTriggerProps(n = {}) {
			let { value: i } = n, a = i != null && g === i, u = Ng(s, i);
			return t.button({
				...l ? Mg.triggerItem.attrs : Mg.trigger.attrs,
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
				"aria-controls": Fg(s),
				"data-controls": Fg(s),
				"aria-expanded": i == null ? c : c && a,
				"data-state": c ? "open" : "closed",
				onPointerMove(e) {
					if (e.pointerType !== "mouse" || r_(e.currentTarget) || !l) return;
					let t = qt(e);
					r({
						type: "TRIGGER_POINTERMOVE",
						target: e.currentTarget,
						point: t
					});
				},
				onPointerLeave(t) {
					if (r_(t.currentTarget) || t.pointerType !== "mouse" || !l) return;
					__(e.refs.get("parent"), !0);
					let n = qt(t);
					r({
						type: "TRIGGER_POINTERLEAVE",
						target: t.currentTarget,
						point: n
					});
				},
				onPointerDown(e) {
					r_(e.currentTarget) || Bt(e) || e.preventDefault();
				},
				onClick(e) {
					e.defaultPrevented || r_(e.currentTarget) || r({
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
					}[Gt(e, {
						orientation: "vertical",
						dir: o("dir")
					})];
					t && (e.preventDefault(), t(e));
				}
			});
		},
		getIndicatorProps() {
			return t.element({
				...Mg.indicator.attrs,
				dir: o("dir"),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...Mg.positioner.attrs,
				dir: o("dir"),
				id: Lg(s),
				style: _.floating
			});
		},
		getArrowProps() {
			return t.element({
				id: Ig(s),
				...Mg.arrow.attrs,
				dir: o("dir"),
				style: _.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...Mg.arrowTip.attrs,
				dir: o("dir"),
				style: _.arrowTip
			});
		},
		getContentProps() {
			return t.element({
				...Mg.content.attrs,
				id: Fg(s),
				"aria-label": o("aria-label"),
				hidden: !c,
				"data-state": c ? "open" : "closed",
				role: d ? "menu" : "dialog",
				tabIndex: 0,
				dir: o("dir"),
				"aria-activedescendant": a("highlightedId") || void 0,
				"aria-labelledby": m ? Pg(s, g ?? void 0) : Ng(s, g ?? void 0),
				"data-placement": f,
				"data-side": p,
				onPointerEnter(e) {
					e.pointerType === "mouse" && r({ type: "MENU_POINTERENTER" });
				},
				onKeyDown(e) {
					if (e.defaultPrevented || !Ge(e.currentTarget, Mt(e))) return;
					let t = Mt(e);
					if (t?.closest("[role=menu]") !== e.currentTarget && t !== e.currentTarget) return;
					if (e.key === "Tab" && !gn(e)) {
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
					}, i = n[Gt(e, { dir: o("dir") })];
					if (i) {
						i(e), e.stopPropagation(), e.preventDefault();
						return;
					}
					o("typeahead") && Lt(e) && (Vt(e) || We(t) || (r({
						type: "TYPEAHEAD",
						key: e.key
					}), e.preventDefault()));
				}
			});
		},
		getSeparatorProps() {
			return t.element({
				...Mg.separator.attrs,
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
					...Mg.item.attrs,
					dir: o("dir"),
					"data-value": s.value,
					role: `menuitem${n}`,
					"aria-checked": !!c.checked,
					"data-state": c.checked ? "checked" : "unchecked",
					onClick(e) {
						if (i || Pt(e) || Nt(e)) return;
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
			let n = b(ri(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...Mg.itemIndicator.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": Jr(e, "checked") ? r : void 0,
				hidden: Jr(e, "checked") ? !n.checked : void 0
			});
		},
		getItemTextProps(e) {
			let n = b(ri(e)), r = n.checked ? "checked" : "unchecked";
			return t.element({
				...Mg.itemText.attrs,
				dir: o("dir"),
				"data-disabled": K(n.disabled),
				"data-highlighted": K(n.highlighted),
				"data-state": Jr(e, "checked") ? r : void 0
			});
		},
		getItemGroupLabelProps(e) {
			return t.element({
				...Mg.itemGroupLabel.attrs,
				id: Vg(s, e.htmlFor),
				dir: o("dir")
			});
		},
		getItemGroupProps(e) {
			return t.element({
				id: Rg(s, e.id),
				...Mg.itemGroup.attrs,
				dir: o("dir"),
				"aria-labelledby": Vg(s, e.id),
				role: "group"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+menu@1.43.3/node_modules/@zag-js/menu/dist/menu.machine.mjs
var { not: S_, and: C_, or: w_ } = oa(), T_ = sa({
	props({ props: e }) {
		return {
			closeOnSelect: !0,
			typeahead: !0,
			composite: !0,
			loopFocus: !1,
			navigate(e) {
				Sn(e.node);
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
						triggerElement: Yg(n, e)
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
			typeaheadState: { ...$n.defaultOptions },
			positioningOverride: {}
		};
	},
	computed: {
		isRtl: ({ prop: e }) => e("dir") === "rtl",
		isTypingAhead: ({ refs: e }) => e.get("typeaheadState").keysSoFar !== "",
		highlightedId: ({ context: e, scope: t, refs: n }) => g_(n.get("children"), e.get("highlightedValue"), t)
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
					guard: S_("isSubmenu"),
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
						guard: w_("isOpenAutoFocusEvent", "isArrowDownEvent"),
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
					guard: C_(S_("isTriggerItem"), "isOpenControlled"),
					actions: ["invokeOnClose", "releaseParentRoutingLock"]
				}, {
					guard: S_("isTriggerItem"),
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
					guard: C_("isSubmenu", "isOpenControlled"),
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
					guard: S_("isPointerRoutingLocked"),
					actions: [
						"setHighlightedItem",
						"focusMenu",
						"closeSiblingMenus"
					]
				}, { actions: ["setLastHighlightedItem", "closeSiblingMenus"] }],
				ITEM_POINTERLEAVE: {
					guard: C_(S_("isPointerRoutingLocked"), S_("isTriggerItem")),
					actions: ["clearHighlightedItem"]
				},
				ITEM_CLICK: [
					{
						guard: C_(S_("isTriggerItemHighlighted"), S_("isHighlightedItemEditable"), "closeOnSelect", "isOpenControlled"),
						actions: [
							"invokeOnSelect",
							"setOptionState",
							"closeRootMenu",
							"invokeOnClose",
							"releaseParentRoutingLock"
						]
					},
					{
						guard: C_(S_("isTriggerItemHighlighted"), S_("isHighlightedItemEditable"), "closeOnSelect"),
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
						guard: C_(S_("isTriggerItemHighlighted"), S_("isHighlightedItemEditable")),
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
			isTriggerItem: ({ event: e }) => i_(e.target),
			isTriggerItemHighlighted: ({ event: e, scope: t, computed: n }) => !!(e.target ?? t.getById(n("highlightedId")))?.hasAttribute("data-controls"),
			isSubmenu: ({ context: e }) => e.get("isSubmenu"),
			isPointerRoutingLocked: ({ refs: e }) => e.get("pointerRoutingLocked"),
			isHighlightedItemEditable: ({ scope: e, computed: t }) => We(e.getById(t("highlightedId"))),
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
				return gh({ root: e.getRootNode?.() });
			},
			trackPositioning({ context: e, prop: t, scope: n, refs: r }) {
				if (Kg(n) || Jg(n).length > 0) return;
				let i = {
					...t("positioning"),
					...r.get("positioningOverride")
				};
				return e.set("currentPlacement", i.placement), wp(() => Yg(n, e.get("triggerValue")), () => Ug(n), {
					...i,
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackInteractOutside({ refs: e, scope: t, prop: n, context: r, send: i }) {
				let a = () => Hg(t), o = !0, s = (e) => Jg(t).some((t) => Ge(t, e));
				return al(a, {
					type: "menu",
					defer: !0,
					exclude: [Wg(t), ...qg(t)].filter(Boolean),
					onInteractOutside: n("onInteractOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onFocusOutside(t) {
						n("onFocusOutside")?.(t);
						let r = Mt(t.detail.originalEvent);
						if (s(r)) {
							t.preventDefault();
							return;
						}
						if (c_(r, e.get("children"))) {
							t.preventDefault();
							return;
						}
					},
					onEscapeKeyDown(t) {
						n("onEscapeKeyDown")?.(t), r.get("isSubmenu") && t.preventDefault(), m_({ parent: e.get("parent") });
					},
					onPointerDownOutside(e) {
						n("onPointerDownOutside")?.(e);
						let t = Mt(e.detail.originalEvent);
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
				return i ? (__(i, !0), Jt(t.getDoc(), "pointermove", (t) => {
					h_(e.get("intentPolygon"), {
						x: t.clientX,
						y: t.clientY
					}) || (n({ type: "POINTER_MOVED_AWAY_FROM_SUBMENU" }), __(i, !1));
				})) : void 0;
			},
			scrollToHighlightedItem({ scope: e, computed: t }) {
				let n = () => {
					ph() !== "pointer" && Wn(e.getById(t("highlightedId")), {
						rootEl: Hg(e),
						block: "nearest"
					});
				};
				return q(() => {
					mh("virtual"), n();
				}), xn(() => Hg(e), {
					defer: !0,
					attributes: ["aria-activedescendant"],
					callback: n
				});
			}
		},
		actions: {
			setAnchorPoint({ context: e, event: t }) {
				e.set("anchorPoint", (e) => Br(e, t.point) ? e : t.point);
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
				let a = () => Ug(t), o = r.point ?? e.get("anchorPoint"), s = o ? () => ({
					width: 0,
					height: 0,
					...o
				}) : void 0, c = {
					...n("positioning"),
					...i.get("positioningOverride")
				}, l = r.value ?? e.get("triggerValue");
				wp(() => Yg(t, l), a, {
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
				Be(i) ? n("navigate")?.({
					value: a,
					node: i,
					href: i.href
				}) : queueMicrotask(() => i.click());
			},
			setIntentPolygon({ context: e, scope: t, event: n }) {
				let r = Hg(t), i = e.get("currentPlacement");
				if (!r || !i) return;
				let a = f_(r.getBoundingClientRect(), i);
				if (!a) return;
				let o = sp(i) === "right" ? -5 : 5;
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
					let e = Ng(n);
					r?.send({
						type: "HIGHLIGHTED.SUGGEST",
						value: e
					});
				}
				__(r, !1);
			},
			unlockParentOnClose({ refs: e, context: t }) {
				y_(e.get("parent"), t.get("isSubmenu"));
			},
			setHighlightedItem({ context: e, event: t }) {
				let n = t.value || Bg(t.target);
				e.set("highlightedValue", n);
			},
			clearHighlightedItem({ context: e }) {
				e.set("highlightedValue", null);
			},
			focusMenu({ scope: e }) {
				q(() => {
					let t = Hg(e);
					hn({
						root: t,
						enabled: !Ge(t, e.getActiveElement()),
						filter(e) {
							return !e.role?.startsWith("menuitem");
						}
					})?.focus({ preventScroll: !0 });
				});
			},
			highlightFirstItem({ context: e, scope: t }) {
				(Hg(t) ? queueMicrotask : q)(() => {
					let n = Zg(t);
					n && e.set("highlightedValue", Bg(n));
				});
			},
			highlightLastItem({ context: e, scope: t }) {
				(Hg(t) ? queueMicrotask : q)(() => {
					let n = Qg(t);
					n && e.set("highlightedValue", Bg(n));
				});
			},
			highlightNextItem({ context: e, scope: t, event: n, prop: r }) {
				let i = e_(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", Bg(i));
			},
			highlightPrevItem({ context: e, scope: t, event: n, prop: r }) {
				let i = t_(t, {
					loop: n.loop,
					value: e.get("highlightedValue"),
					loopFocus: r("loopFocus")
				});
				e.set("highlightedValue", Bg(i));
			},
			invokeOnSelect({ context: e, prop: t, scope: n }) {
				let r = e.get("highlightedValue");
				r != null && (o_(Gg(n, r), r), t("onSelect")?.({ value: r }));
			},
			focusTrigger({ scope: e, context: t, event: n }) {
				t.get("isSubmenu") || t.get("anchorPoint") || n.restoreFocus === !1 || queueMicrotask(() => {
					Yg(e, t.get("triggerValue"))?.focus({ preventScroll: !0 });
				});
			},
			highlightMatchedItem({ scope: e, context: t, event: n, refs: r }) {
				let i = n_(e, {
					key: n.key,
					value: t.get("highlightedValue"),
					typeaheadState: r.get("typeaheadState")
				});
				i && t.set("highlightedValue", Bg(i));
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
				if (!i_(r)) return;
				let i = r?.getAttribute("data-uid"), a = e.get("children");
				for (let e in a) {
					if (e === i) continue;
					let r = a[e], o = r.context.get("intentPolygon");
					o && t.point && p_(o, t.point) || (Hg(n)?.focus({ preventScroll: !0 }), r.send({ type: "CLOSE" }));
				}
			},
			closeRootMenu({ refs: e }) {
				m_({ parent: e.get("parent") });
			},
			openSubmenu({ refs: e, scope: t, computed: n }) {
				let r = t.getById(n("highlightedId"))?.getAttribute("data-uid"), i = e.get("children");
				(r ? i[r] : null)?.send({ type: "OPEN_AUTOFOCUS" });
			},
			focusParentMenu({ refs: e }) {
				e.get("parent")?.send({ type: "FOCUS_MENU" });
			},
			setLastHighlightedItem({ context: e, event: t }) {
				e.set("lastHighlightedValue", Bg(t.target));
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
				t.get("isSubmenu") && b_(e.get("parent"));
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
}), E_ = (e) => {
	let t = lr(), n = $a(), r = F(() => {
		let r = ni(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ea(T_, () => S(r)), a = F(() => x_(i, va));
	return () => ({
		api: S(a),
		service: i
	});
}, D_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function O_(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = H(n, D_), s = F(() => Va(a)), c = F(() => P(S(s), 2)), l = F(() => S(c)[0]), u = F(() => S(c)[1]), d = F(() => pr()(S(u), [
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
	])), f = F(() => P(S(d), 2)), m = F(() => S(f)[0]), g = F(() => S(f)[1]), _ = gg(), v = kg(), y = F(() => ({
		...S(m),
		id: S(m).id ?? r,
		open: i(),
		onOpenChange(e) {
			S(m).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), b = E_(() => S(y)), x = F(() => b().api), C = F(() => b().service), w = Ba(() => ({
		present: S(x).open,
		...S(l)
	}));
	h(() => {
		let e = v?.(), t = _?.();
		e && t && (t.setChild(S(C)), S(x).setParent(e));
	});
	let T = F(() => _?.().getTriggerItemProps(S(x)));
	Ag(() => S(T)), Og(() => S(C)), hg(() => S(x)), Ha(w);
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
W(O_, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/menu/menu-trigger.svelte
var k_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function A_(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, k_), a = F(() => pr()(i, ["value"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = gg(), u = jg(), d = F(() => J(l().getTriggerProps(S(s)), u?.() || {}, S(c)));
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
W(A_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Menu.svelte
var j_ = m("<af-tooltip><!></af-tooltip>", 2), M_ = m("<!> <!>", 1), N_ = m("<div class=\"af-kit\"><!></div>"), P_ = {
	hash: "svelte-j0sh25",
	code: "af-tooltip.svelte-j0sh25 {display:block;}[data-scope='menu'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='menu'][data-part='content'] {min-width:180px;padding:4px;}[data-scope='menu'][data-part='item'] {padding:6px 10px;border-radius:max(0px, calc(var(--k-radius) - 4px));font-size:13px;line-height:20px;cursor:pointer;}[data-scope='menu'][data-part='item'][data-highlighted] {background:color-mix(in oklab, var(--k-fg) 6%, transparent);}[data-scope='menu'][data-part='item'][data-danger] {color:color-mix(in oklab, var(--k-danger) 78%, var(--k-fg));}[data-scope='menu'][data-part='item'][aria-disabled='true'] {opacity:0.55;cursor:not-allowed;}"
};
function F_(n, i) {
	k(i, !0), de(n, P_);
	let a = B(i, "items", 23, () => []), o = B(i, "label", 7, ""), s = i.$$host, c = _(!1), u = _(null);
	C(() => Ll(S(u), S(c), s));
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
	}, h = M_(), g = V(h);
	return Fl(g, {}), fr(T(g, 2), {
		value: () => s.shadowRoot,
		children: (e, n) => {
			var m = N_(), h = d(m);
			A(h, () => O_, (e, n) => {
				n(e, {
					positioning: {
						strategy: "fixed",
						placement: "bottom-end"
					},
					onSelect: (e) => {
						let t = (a() ?? []).find((t) => t.id === e.value);
						t && !t.disabled && Il(s, "select", { id: t.id });
					},
					get open() {
						return S(c);
					},
					set open(e) {
						E(c, e, !0);
					},
					children: (e, n) => {
						var s = M_(), c = V(s);
						{
							let e = F(() => o() ?? "");
							A(c, () => A_, (t, n) => {
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
						A(m, () => Dg, (e, n) => {
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
									A(o, () => Sg, (e, n) => {
										n(e, {
											class: "af-overlay menu",
											children: (e, n) => {
												var i = p(), o = V(i);
												{
													let e = (e, n = ue) => {
														var i = p(), o = V(i);
														r(o, 17, () => a() ?? [], (e) => e.id, (e, r) => {
															var i = p(), a = V(i), o = (e) => {
																var n = j_();
																x(() => N(n, "text", S(r).reason ?? "")), ne(n, 1, "svelte-j0sh25");
																var i = d(n);
																{
																	let e = F(() => f(S(r).reason)), n = F(() => S(r).danger ? "" : void 0);
																	A(i, () => Tg, (i, a) => {
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
																	A(a, () => Tg, (i, a) => {
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
													A(o, () => Cg, (t, n) => {
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
W(F_, {
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
var I_ = Object.defineProperty, L_ = (e, t, n) => t in e ? I_(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, $ = (e, t, n) => L_(e, typeof t == "symbol" ? t : t + "", n), R_ = {
	itemToValue(e) {
		return typeof e == "string" ? e : Wr(e) && Jr(e, "value") ? e.value : "";
	},
	itemToString(e) {
		return typeof e == "string" ? e : Wr(e) && Jr(e, "label") ? e.label : R_.itemToValue(e);
	},
	isItemDisabled(e) {
		return Wr(e) && Jr(e, "disabled") ? !!e.disabled : !1;
	}
}, z_ = class e {
	constructor(t) {
		$(this, "options", t), $(this, "items"), $(this, "indexMap", null), $(this, "copy", (t) => new e({
			...this.options,
			items: t ?? [...this.items]
		})), $(this, "isEqual", (e) => Br(this.items, e.items)), $(this, "setItems", (e) => this.copy(e)), $(this, "getValues", (e = this.items) => {
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
		}), $(this, "sort", (e) => [...e].sort(this.sortFn.bind(this))), $(this, "getItemValue", (e) => e == null ? null : this.options.itemToValue?.(e) ?? R_.itemToValue(e)), $(this, "getItemDisabled", (e) => e == null ? !1 : this.options.isItemDisabled?.(e) ?? R_.isItemDisabled(e)), $(this, "stringifyItem", (e) => e == null ? null : this.options.itemToString?.(e) ?? R_.itemToString(e)), $(this, "stringify", (e) => e == null ? null : this.stringifyItem(this.find(e))), $(this, "stringifyItems", (e, t = ", ") => {
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
				if (!(r && this.getItemValue(a) === t) && !this.getItemDisabled(a) && B_(this.stringifyItem(a), e)) return a;
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
		}), $(this, "insert", (e, ...t) => this.copy(V_(this.items, e, ...t))), $(this, "insertBefore", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(V_(this.items, n, ...t));
		}), $(this, "insertAfter", (e, ...t) => {
			let n = this.indexOf(e);
			if (n === -1) {
				if (this.items.length === 0) n = 0;
				else return this;
			}
			return this.copy(V_(this.items, n + 1, ...t));
		}), $(this, "prepend", (...e) => this.copy(V_(this.items, 0, ...e))), $(this, "append", (...e) => this.copy(V_(this.items, this.items.length, ...e))), $(this, "filter", (e) => {
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
			return n === -1 ? this : this.copy(H_(this.items, [n], t));
		}), $(this, "moveBefore", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(H_(this.items, r, n));
		}), $(this, "moveAfter", (e, ...t) => {
			let n = this.items.findIndex((t) => this.getItemValue(t) === e);
			if (n === -1) return this;
			let r = t.map((e) => this.items.findIndex((t) => this.getItemValue(t) === e)).sort((e, t) => e - t);
			return this.copy(H_(this.items, r, n + 1));
		}), $(this, "reorder", (e, t) => this.copy(H_(this.items, [e], t))), $(this, "compareValue", (e, t) => {
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
}, B_ = (e, t) => !!e?.toLowerCase().startsWith(t.toLowerCase());
function V_(e, t, ...n) {
	return [
		...e.slice(0, t),
		...n,
		...e.slice(t)
	];
}
function H_(e, t, n) {
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
function U_({ values: e, collection: t, selectedItemMap: n }) {
	let r = [];
	for (let i of e) {
		let e = t.find(i) ?? n.get(i);
		e != null && r.push(e);
	}
	return r;
}
function W_({ selectedItemMap: e, values: t, selectedItems: n, collection: r }) {
	let i = new Map(e);
	for (let e of n) {
		let t = r.getItemValue(e);
		t != null && i.set(t, e);
	}
	let a = new Set(t);
	for (let e of i.keys()) a.has(e) || i.delete(e);
	return i;
}
function G_({ values: e, collection: t, selectedItemMap: n }) {
	let r = U_({
		values: e,
		collection: t,
		selectedItemMap: n
	});
	return {
		selectedItems: r,
		nextSelectedItemMap: W_({
			selectedItemMap: n,
			values: e,
			selectedItems: r,
			collection: t
		})
	};
}
function K_({ selectedItems: e, collection: t }) {
	return W_({
		selectedItemMap: /* @__PURE__ */ new Map(),
		values: e.map((e) => t.getItemValue(e)).filter(Boolean),
		selectedItems: e,
		collection: t
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/collection/list-collection.js
var q_ = (e) => new z_(e), [J_, Y_] = sr({
	name: "ComboboxContext",
	hookName: "useComboboxContext",
	providerName: "<ComboboxProvider />"
}), X_ = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Z_(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, X_), o = Y_(), s = Ua(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
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
W(Z_, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.anatomy.mjs
var Q_ = Zs("combobox").parts("root", "clearTrigger", "content", "control", "input", "item", "itemGroup", "itemGroupLabel", "itemIndicator", "itemText", "label", "list", "positioner", "trigger"), $_ = Q_.build(), ev = (e) => new z_(e);
ev.empty = () => new z_({ items: [] });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.dom.mjs
var tv = (e) => e.ids?.root ?? `combobox:${e.id}`, nv = (e) => e.ids?.label ?? `combobox:${e.id}:label`, rv = (e) => e.ids?.control ?? `combobox:${e.id}:control`, iv = (e) => e.ids?.input ?? `combobox:${e.id}:input`, av = (e) => e.ids?.content ?? `combobox:${e.id}:content`, ov = (e) => e.ids?.positioner ?? `combobox:${e.id}:popper`, sv = (e) => e.ids?.trigger ?? `combobox:${e.id}:toggle-btn`, cv = (e) => e.ids?.clearTrigger ?? `combobox:${e.id}:clear-btn`, lv = (e, t) => e.ids?.itemGroup?.(t) ?? `combobox:${e.id}:optgroup:${t}`, uv = (e, t) => e.ids?.itemGroupLabel?.(t) ?? `combobox:${e.id}:optgroup-label:${t}`, dv = (e, t) => e.ids?.item?.(t) ?? `combobox:${e.id}:option:${t}`, fv = (e) => e.getById(av(e)), pv = (e) => e.getById(iv(e)), mv = (e) => e.getById(ov(e)), hv = (e) => e.getById(rv(e)), gv = (e) => e.getById(sv(e)), _v = (e) => e.getById(cv(e)), vv = (e, t) => {
	if (t == null) return null;
	let n = `[role=option][data-value="${CSS.escape(t)}"]`;
	return zn(fv(e), n);
}, yv = (e) => {
	let t = pv(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 }), ye(t);
}, bv = (e) => {
	let t = gv(e);
	e.isActiveElement(t) || t?.focus({ preventScroll: !0 });
}, xv = {
	triggerLabel: "Toggle suggestions",
	clearTriggerLabel: "Clear value"
};
function Sv(e, t) {
	let { context: n, prop: r, state: i, send: a, scope: o, computed: s } = e, c = xi(xv, r("translations")), l = r("collection"), u = !!r("disabled"), d = s("isInteractive"), f = !!r("invalid"), p = !!r("required"), m = !!r("readOnly"), h = i.hasTag("open"), g = i.hasTag("focused"), _ = r("composite"), v = n.get("highlightedValue"), y = n.get("currentPlacement"), b = y ? sp(y) : void 0, x = Ep({
		...r("positioning"),
		placement: y
	});
	function S(e) {
		let t = l.getItemDisabled(e.item), r = l.getItemValue(e.item);
		return ki(r, () => `[zag-js] No value found for item ${JSON.stringify(e.item)}`), {
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
			pv(o)?.focus();
		},
		setOpen(e, t = "script") {
			i.hasTag("open") !== e && a({
				type: e ? "OPEN" : "CLOSE",
				src: t
			});
		},
		getRootProps() {
			return t.element({
				...$_.root.attrs,
				dir: r("dir"),
				id: tv(o),
				"data-invalid": K(f),
				"data-readonly": K(m)
			});
		},
		getLabelProps() {
			return t.label({
				...$_.label.attrs,
				dir: r("dir"),
				htmlFor: iv(o),
				id: nv(o),
				"data-readonly": K(m),
				"data-disabled": K(u),
				"data-invalid": K(f),
				"data-required": K(p),
				"data-focus": K(g),
				onClick(e) {
					_ || (e.preventDefault(), gv(o)?.focus({ preventScroll: !0 }));
				}
			});
		},
		getControlProps() {
			return t.element({
				...$_.control.attrs,
				dir: r("dir"),
				id: rv(o),
				"data-state": h ? "open" : "closed",
				"data-focus": K(g),
				"data-disabled": K(u),
				"data-invalid": K(f)
			});
		},
		getPositionerProps() {
			return t.element({
				...$_.positioner.attrs,
				dir: r("dir"),
				id: ov(o),
				style: x.floating
			});
		},
		getInputProps() {
			return t.input({
				...$_.input.attrs,
				dir: r("dir"),
				"aria-invalid": we(f),
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
				id: iv(o),
				type: "text",
				role: "combobox",
				defaultValue: n.get("inputValue"),
				"aria-autocomplete": s("autoComplete") ? "both" : "list",
				"aria-controls": av(o),
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-activedescendant": v ? dv(o, v) : void 0,
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
					if (e.defaultPrevented || !d || e.ctrlKey || e.shiftKey || Ft(e)) return;
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
							let c = vv(o, v);
							Be(c) && r("navigate")?.({
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
					}[Gt(e, { dir: r("dir") })];
					i?.(e);
				}
			});
		},
		getTriggerProps(e = {}) {
			return t.button({
				...$_.trigger.attrs,
				dir: r("dir"),
				id: sv(o),
				"aria-haspopup": _ ? "listbox" : "dialog",
				type: "button",
				tabIndex: e.focusable ? void 0 : -1,
				"aria-label": c.triggerLabel,
				"aria-expanded": h,
				"data-state": h ? "open" : "closed",
				"aria-controls": h ? av(o) : void 0,
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
					e.defaultPrevented || d && zt(e) && a({
						type: "TRIGGER.CLICK",
						src: "trigger-click"
					});
				},
				onPointerDown(e) {
					d && e.pointerType !== "touch" && zt(e) && (e.preventDefault(), queueMicrotask(() => {
						yv(o);
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
					}[Gt(e, { dir: r("dir") })];
					t && (t(e), e.preventDefault());
				}
			});
		},
		getContentProps() {
			return t.element({
				...$_.content.attrs,
				dir: r("dir"),
				id: av(o),
				role: _ ? "listbox" : "dialog",
				tabIndex: -1,
				hidden: !h,
				"data-state": h ? "open" : "closed",
				"data-placement": y,
				"data-side": b,
				"aria-labelledby": nv(o),
				"aria-multiselectable": r("multiple") && _ ? !0 : void 0,
				"data-empty": K(l.size === 0),
				onPointerDown(e) {
					zt(e) && e.preventDefault();
				}
			});
		},
		getListProps() {
			return t.element({
				...$_.list.attrs,
				role: _ ? void 0 : "listbox",
				"data-empty": K(l.size === 0),
				"aria-labelledby": nv(o),
				"aria-multiselectable": r("multiple") && !_ ? !0 : void 0
			});
		},
		getClearTriggerProps() {
			return t.button({
				...$_.clearTrigger.attrs,
				dir: r("dir"),
				id: cv(o),
				type: "button",
				tabIndex: -1,
				disabled: u,
				"data-invalid": K(f),
				"aria-label": c.clearTriggerLabel,
				"aria-controls": iv(o),
				hidden: !n.get("value").length,
				onPointerDown(e) {
					zt(e) && e.preventDefault();
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
				...$_.item.attrs,
				dir: r("dir"),
				id: dv(o, i),
				role: "option",
				tabIndex: -1,
				"data-highlighted": K(n.highlighted),
				"data-state": n.selected ? "checked" : "unchecked",
				"aria-selected": we(n.selected),
				"aria-disabled": we(n.disabled),
				"data-disabled": K(n.disabled),
				"data-value": n.value,
				onPointerMove() {
					n.disabled || ph() === "pointer" && (n.highlighted || a({
						type: "ITEM.POINTER_MOVE",
						value: i
					}));
				},
				onPointerLeave() {
					e.persistFocus || n.disabled || ph() === "pointer" && a({
						type: "ITEM.POINTER_LEAVE",
						value: i
					});
				},
				onClick(e) {
					Pt(e) || Nt(e) || Bt(e) || n.disabled || a({
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
				...$_.itemText.attrs,
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
				...$_.itemIndicator.attrs,
				dir: r("dir"),
				"data-state": n.selected ? "checked" : "unchecked",
				hidden: !n.selected
			});
		},
		getItemGroupProps(e) {
			let { id: n } = e;
			return t.element({
				...$_.itemGroup.attrs,
				dir: r("dir"),
				id: lv(o, n),
				"aria-labelledby": uv(o, n),
				"data-empty": K(l.size === 0),
				role: "group"
			});
		},
		getItemGroupLabelProps(e) {
			let { htmlFor: n } = e;
			return t.element({
				...$_.itemGroupLabel.attrs,
				dir: r("dir"),
				id: uv(o, n),
				role: "presentation"
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+combobox@1.43.3/node_modules/@zag-js/combobox/dist/combobox.machine.mjs
var { guards: Cv, createMachine: wv, choose: Tv } = ca(), { and: Ev, not: Dv } = Cv, Ov = wv({
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
				Sn(e);
			},
			collection: ev.empty(),
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
				isEqual: Br,
				hash(e) {
					return e.join(",");
				},
				onChange(t) {
					let r = n(), i = e("collection"), a = G_({
						values: t,
						collection: i,
						selectedItemMap: r.get("selectedItemMap")
					}), o = e("value") ?? t, s = o === t ? a : G_({
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
					t = ci(e("selectionBehavior"), {
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
			selectedItemMap: t(() => ({ defaultValue: K_({
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
		selectedItems: ({ context: e, prop: t }) => U_({
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
	entry: Tv([{
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
								guard: Ev("isOpenControlled", "openOnChange"),
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
							guard: Ev("isCustomValue", Dv("allowCustomValue")),
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
								guard: Ev("isOpenControlled", "autoComplete"),
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
								guard: Ev("isOpenControlled", "autoComplete"),
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
						guard: Ev("isOpenControlled", "isCustomValue", Dv("hasHighlightedItem"), Dv("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Ev("isCustomValue", Dv("hasHighlightedItem"), Dv("allowCustomValue")),
						target: "closed.focused",
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Ev("isOpenControlled", "closeOnSelect"),
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
						guard: Ev("isOpenControlled", "closeOnSelect"),
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
						guard: Ev("isOpenControlled", "isCustomValue", Dv("allowCustomValue")),
						actions: ["revertInputValue", "invokeOnClose"]
					},
					{
						guard: Ev("isCustomValue", Dv("allowCustomValue")),
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
						guard: Ev("autoComplete", "isLastItemHighlighted"),
						actions: ["clearHighlightedValue", "scrollContentToTop"]
					}, { actions: ["highlightNextItem"] }],
					"INPUT.ARROW_UP": [{
						guard: Ev("autoComplete", "isFirstItemHighlighted"),
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
							guard: Ev("isOpenControlled", "autoComplete"),
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
							guard: Ev("isHighlightedItemRemoved", "hasCollectionItems", "autoHighlight"),
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
				return Hr(n) ? n : !!n?.({ inputValue: t.get("inputValue") });
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
				return gh({ root: e.getRootNode?.() });
			},
			trackDismissableLayer({ send: e, prop: t, scope: n }) {
				return t("disableLayer") ? void 0 : al(() => fv(n), {
					type: "listbox",
					defer: !0,
					exclude: () => [
						pv(n),
						gv(n),
						_v(n)
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
				let n = ym({
					level: "assertive",
					document: t.getDoc()
				});
				return e.set("liveRegion", n), () => n.destroy();
			},
			trackPlacement({ context: e, prop: t, scope: n }) {
				return e.set("currentPlacement", t("positioning").placement), wp(() => hv(n) || gv(n), () => mv(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				let r = pv(n), i = [], a = (r) => {
					if (ph() === "pointer") return;
					let a = e.get("highlightedValue");
					if (!a) return;
					let o = fv(n), s = t("scrollToIndexFn");
					if (s) {
						s({
							index: t("collection").indexOf(a),
							immediate: r,
							getElement: () => vv(n, a)
						});
						return;
					}
					let c = vv(n, a), l = q(() => {
						Wn(c, {
							rootEl: o,
							block: "nearest"
						});
					});
					i.push(l);
				}, o = q(() => {
					mh("virtual"), a(!0);
				});
				i.push(o);
				let s = xn(r, {
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
				wp(() => hv(n), () => mv(n), {
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
				let a = n("multiple") ? Mr(t.get("value"), i) : [i];
				n("onSelect")?.({
					value: a,
					itemValue: i
				}), t.set("value", a);
				let o = ci(n("selectionBehavior"), {
					preserve: t.get("inputValue"),
					replace: r.stringifyMany(a),
					clear: ""
				});
				t.set("inputValue", o);
			},
			scrollToHighlightedItem({ context: e, prop: t, scope: n }) {
				vn(() => {
					let r = e.get("highlightedValue");
					if (r == null) return;
					let i = vv(n, r), a = fv(n), o = t("scrollToIndexFn");
					if (o) {
						o({
							index: t("collection").indexOf(r),
							immediate: !0,
							getElement: () => vv(n, r)
						});
						return;
					}
					Wn(i, {
						rootEl: a,
						block: "nearest"
					});
				});
			},
			selectItem(e) {
				let { context: t, event: n, flush: r, prop: i } = e;
				n.value != null && r(() => {
					let e = i("multiple") ? Mr(t.get("value"), n.value) : [n.value];
					i("onSelect")?.({
						value: e,
						itemValue: n.value
					}), t.set("value", e);
					let r = ci(i("selectionBehavior"), {
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
					let e = Ar(t.get("value"), n.value);
					t.set("value", e);
					let r = ci(i("selectionBehavior"), {
						preserve: t.get("inputValue"),
						replace: i("collection").stringifyMany(e),
						clear: ""
					});
					t.set("inputValue", r);
				});
			},
			setInitialFocus({ scope: e }) {
				q(() => {
					yv(e);
				});
			},
			setFinalFocus({ scope: e }) {
				q(() => {
					gv(e)?.dataset.focusable == null ? yv(e) : bv(e);
				});
			},
			syncInputValue({ context: e, scope: t, event: n }) {
				let r = pv(t);
				r && (r.value = e.get("inputValue"), queueMicrotask(() => {
					n.current().type !== "INPUT.CHANGE" && ye(r);
				}));
			},
			setInputValue({ context: e, event: t }) {
				e.set("inputValue", t.value);
			},
			clearInputValue({ context: e }) {
				e.set("inputValue", "");
			},
			revertInputValue({ context: e, prop: t, computed: n }) {
				let r = ci(t("selectionBehavior"), {
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
					let e = ci(i("selectionBehavior"), {
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
					let e = ci(r("selectionBehavior"), {
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
						getElement: () => vv(t, r)
					});
				} else {
					let e = fv(t);
					if (!e) return;
					e.scrollTop = 0;
				}
			},
			invokeOnOpen({ prop: e, event: t, context: n }) {
				let r = kv(t);
				e("onOpenChange")?.({
					open: !0,
					reason: r,
					value: n.get("value")
				});
			},
			invokeOnClose({ prop: e, event: t, context: n }) {
				let r = kv(t);
				e("onOpenChange")?.({
					open: !1,
					reason: r,
					value: n.get("value")
				});
			},
			highlightFirstItem({ context: e, prop: t, scope: n }) {
				(fv(n) ? queueMicrotask : q)(() => {
					let n = t("collection").firstValue;
					n && e.set("highlightedValue", n);
				});
			},
			highlightFirstItemIfNeeded({ computed: e, action: t }) {
				e("autoHighlight") && t(["highlightFirstItem"]);
			},
			highlightLastItem({ context: e, prop: t, scope: n }) {
				(fv(n) ? queueMicrotask : q)(() => {
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
				let a = pv(i), o = n("collection");
				if (!t("autoComplete") || !a || !r.keypress) return;
				let s = o.stringify(e.get("highlightedValue"));
				q(() => {
					a.value = s || e.get("inputValue");
				});
			},
			syncSelectedItems(e) {
				queueMicrotask(() => {
					let { context: t, prop: n } = e, r = n("collection"), i = t.get("value"), a = G_({
						values: i,
						collection: r,
						selectedItemMap: t.get("selectedItemMap")
					});
					t.set("selectedItemMap", a.nextSelectedItemMap);
					let o = ci(n("selectionBehavior"), {
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
				if (!Et()) return;
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
function kv(e) {
	return (e.previousEvent || e).src;
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox.anatomy.js
var Av = Q_.extendWith("empty"), jv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Mv(t, n) {
	k(n, !0);
	let r = Av.build(), i = B(n, "ref", 15, null), a = H(n, jv), o = Y_(), s = F(() => o().collection.size === 0);
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
W(Mv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-control.svelte
var Nv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Pv(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Nv), a = Y_(), o = F(() => J(a().getControlProps(), i));
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
W(Pv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-input.svelte
var Fv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Iv(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Fv), a = Y_(), o = F(() => J(a().getInputProps(), i));
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
W(Iv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/use-combobox-item-context.js
var [Lv, Rv] = sr({
	name: "ComboboxItemContext",
	hookName: "useComboboxItemContext",
	providerName: "<ComboboxItemProvider />"
}), [zv, Bv] = sr({
	name: "ComboboxItemPropsContext",
	hookName: "useComboboxItemPropsContext",
	providerName: "<ComboboxItemPropsProvider />"
}), Vv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Hv(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Vv), a = F(() => pr()(i, ["item", "persistFocus"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = Y_(), u = F(() => l().getItemState(S(s))), d = F(() => J(l().getItemProps(S(s)), S(c)));
	return Lv(() => S(u)), zv(() => S(s)), Y(t, I({ as: "div" }, () => S(d), {
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
W(Hv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/combobox/combobox-positioner.svelte
var Uv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Wv(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Uv), a = Y_(), o = Ua(), s = F(() => J(a().getPositionerProps(), i));
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
W(Wv, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/field/use-field-context.js
var [Gv, Kv] = sr({
	name: "FieldContext",
	strict: !1
}), qv = (e) => {
	let t = lr(), n = $a(), r = Kv(), i = F(() => {
		let i = ni(e), a = ni(i.collection);
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
	}), a = Ea(Ov, () => S(i)), o = F(() => Sv(a, va));
	return () => S(o);
}, Jv = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"open",
	"value",
	"inputValue"
]);
function Yv(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "ref", 15, null), a = B(n, "open", 15), s = B(n, "value", 15), c = B(n, "inputValue", 15), l = H(n, Jv), u = F(() => Va(l)), d = F(() => P(S(u), 2)), f = F(() => S(d)[0]), p = F(() => S(d)[1]), m = F(() => pr()(S(p), /* @__PURE__ */ "allowCustomValue.alwaysSubmitOnEnter.autoFocus.closeOnSelect.collection.composite.defaultHighlightedValue.defaultInputValue.defaultOpen.defaultValue.disabled.disableLayer.form.highlightedValue.id.ids.inputBehavior.inputValue.invalid.loopFocus.multiple.name.navigate.onFocusOutside.onHighlightChange.onInputValueChange.onInteractOutside.onOpenChange.onPointerDownOutside.onSelect.onValueChange.open.openOnChange.openOnClick.openOnKeyPress.placeholder.positioning.readOnly.required.scrollToIndexFn.selectionBehavior.translations.value".split("."))), h = F(() => P(S(m), 2)), g = F(() => S(h)[0]), _ = F(() => S(h)[1]), v = F(() => ({
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
	})), y = qv(() => S(v)), b = Ba(() => ({
		present: y().open,
		...S(f)
	})), x = F(() => J(y().getRootProps(), S(_)));
	return J_(y), Ha(b), Y(t, I({ as: "div" }, () => S(x), {
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
W(Yv, {
	ref: {},
	open: {},
	value: {},
	inputValue: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/PersonPicker.svelte
var Xv = (e) => e.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
function Zv(e) {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => Array.from(e)[0].toUpperCase());
	return t.length === 0 ? "" : t.length === 1 ? t[0] : t[0] + t[t.length - 1];
}
var Qv = m("<img alt=\"\"/>"), $v = m("<span class=\"af-avatar\"><!></span>"), ey = m("<span class=\"af-chip svelte-akzd1x\" part=\"chip\"><!> <span> </span> <button type=\"button\" part=\"remove\" class=\"svelte-akzd1x\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button></span>"), ty = m("<span class=\"lead svelte-akzd1x\"><!></span>"), ny = m("<button type=\"button\" part=\"clear\" class=\"af-button ghost svelte-akzd1x\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg></button>"), ry = m("<!> <!> <!>", 1), iy = m("<span class=\"mail\"> </span>"), ay = m("<!> <span class=\"who\"><span class=\"name\"> </span> <!></span>", 1), oy = m("<!> <!>", 1), sy = m("<div class=\"af-kit\"><!></div>"), cy = {
	hash: "svelte-akzd1x",
	code: "[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x), [part='clear'].svelte-akzd1x {display:inline-grid;flex:none;place-items:center;width:24px;height:24px;min-height:0;padding:0;border:0;border-radius:max(0px, calc(var(--k-radius) - 4px));background:transparent;color:var(--k-muted);cursor:pointer;}[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x):hover:not(:disabled), [part='clear'].svelte-akzd1x:hover {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-fg);}[part='chip'].svelte-akzd1x button:where(.svelte-akzd1x):focus-visible, [part='clear'].svelte-akzd1x:focus-visible {outline:2px solid var(--k-ring);outline-offset:-2px;}[part='chip'].svelte-akzd1x {padding-right:2px;}.lead.svelte-akzd1x {display:inline-flex;}[data-scope='combobox'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='combobox'][hidden] {display:none !important;}[data-scope='combobox'][data-part='control'] {display:flex;flex-wrap:wrap;align-items:center;gap:4px;min-width:14em;min-height:32px;padding:2px 6px;border:1px solid color-mix(in oklab, var(--k-line), var(--k-fg) 40%);border-radius:max(0px, calc(var(--k-radius) - 2px));background:var(--k-surface);}[data-scope='combobox'][data-part='control']:focus-within {outline:2px solid var(--k-ring);outline-offset:2px;}[data-scope='combobox'][data-part='input'] {flex:1;min-width:6em;border:0;outline:none;background:transparent;color:inherit;font:inherit;}[data-scope='combobox'][data-part='input']::placeholder {color:var(--k-muted);}[data-scope='combobox'][data-part='content'] {max-height:280px;overflow:auto;padding:4px;}[data-scope='combobox'][data-part='item'] {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}[data-scope='combobox'][data-part='item'][data-highlighted] {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}[data-scope='combobox'][data-part='item'][data-state='checked'] {font-weight:600;}[data-scope='combobox'][data-part='item'] .who {display:flex;flex-direction:column;min-width:0;}[data-scope='combobox'][data-part='item'] .mail {color:var(--k-muted);font-size:12px;}[data-scope='combobox'][data-part='empty'] {padding:8px;color:var(--k-muted);}"
};
function ly(n, i) {
	k(i, !0), de(n, cy);
	let a = (e, n = ue) => {
		var r = $v(), i = d(r), a = (e) => {
			var t = Qv();
			x(() => G(t, "src", n().avatar)), R(e, t);
		}, o = (e) => {
			var r = l();
			x((e) => t(r, e), [() => Zv(n().name)]), R(e, r);
		}, s = F(() => S(N).has(n().id)), c = (e) => {
			var t = l("?");
			R(e, t);
		};
		b(i, (e) => {
			n().avatar ? e(a) : S(s) ? e(o, 1) : e(c, -1);
		}), M(r), R(e, r);
	}, o = B(i, "people", 23, () => []), s = B(i, "value", 7, null), c = B(i, "multiple", 7, !1), f = B(i, "placeholder", 7, null), m = B(i, "label", 7, null), h = B(i, "loading", 7, !1), g = B(i, "locale", 7, null), y = B(i, "disabled", 7, !1), w = B(i, "strings", 7, null), D = i.$$host, O = F(() => Wl(g(), w() ?? void 0)), j = F(() => {
		let e = /* @__PURE__ */ new Set();
		return (o() ?? []).filter((t) => !e.has(t.id) && !!e.add(t.id));
	}), N = F(() => new Map(S(j).map((e) => [e.id, e]))), P = F(() => [...new Set(Array.isArray(s()) ? s() : s() ? [s()] : [])]), ee = _(null), te = F(() => S(P).filter((e) => !S(N).has(e))), ne = (e) => S(N).get(e)?.name ?? (h() ? "…" : S(j).length === 0 ? "" : S(te).length > 1 ? `${S(O).unknownPerson} ${S(te).indexOf(e) + 1}` : S(O).unknownPerson), I = F(() => S(ee) ?? (c() || !S(P)[0] ? "" : S(N).has(S(P)[0]) ? S(N).get(S(P)[0]).name : h() ? "" : ne(S(P)[0]))), z = F(() => Xv((S(ee) ?? "").trim())), re = F(() => S(z) === "" ? S(j) : S(j).filter((e) => Xv(e.name).includes(S(z)) || Xv(e.email ?? "").includes(S(z)))), ie = F(() => q_({
		items: S(re),
		itemToValue: (e) => e.id,
		itemToString: (e) => e.name
	})), ae = _(!1), oe = _(null);
	C(() => Ll(S(oe), S(ae), D));
	let H = (e) => Il(D, "change", { value: c() ? e : e[0] ?? null });
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
	}, ce = oy(), W = V(ce);
	return Fl(W, {}), fr(T(W, 2), {
		value: () => D.shadowRoot,
		children: (e, n) => {
			var i = sy(), o = d(i), s = () => S(P), h = () => S(I);
			{
				let e = F(() => !!c()), n = F(() => !!y());
				A(o, () => Yv, (i, o) => {
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
							E(ee, e.inputValue, !0), Il(D, "search", { query: e.inputValue });
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
							var i = oy(), o = V(i);
							A(o, () => Pv, (e, n) => {
								n(e, {
									part: "control",
									children: (e, n) => {
										var i = ry(), o = V(i), s = (e) => {
											var n = p(), i = V(n);
											r(i, 16, () => S(P), (e) => e, (e, n) => {
												let r = F(() => S(N).get(n) ?? {
													id: n,
													name: ne(n)
												});
												var i = ey(), o = d(i);
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
											var n = ty(), r = d(n);
											a(r, () => S(t)), M(n), R(e, n);
										};
										b(o, (e) => {
											c() ? e(s) : S(P)[0] && e(l, 1);
										});
										var h = T(o, 2);
										{
											let e = F(() => f() ?? ""), t = F(() => m() || void 0);
											A(h, () => Iv, (n, r) => {
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
											var t = ny();
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
							A(s, () => Wv, (e, n) => {
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
										A(o, () => Z_, (e, n) => {
											n(e, {
												class: "af-overlay people",
												part: "content",
												children: (e, n) => {
													var i = oy(), o = V(i);
													r(o, 17, () => S(ie).items, (e) => e.id, (e, n) => {
														var r = p(), i = V(r);
														A(i, () => Hv, (e, r) => {
															r(e, {
																get item() {
																	return S(n);
																},
																part: "option",
																children: (e, r) => {
																	var i = ay(), o = V(i);
																	a(o, () => S(n));
																	var s = T(o, 2), c = d(s), l = u(c, !0), f = T(c, 2), p = (e) => {
																		var r = iy(), i = u(r, !0);
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
													A(s, () => Mv, (e, n) => {
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
f(["click"]), W(ly, {
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
var [uy, dy] = sr({ name: "PopoverContext" }), fy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function py(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, fy), a = dy(), o = F(() => J(a().getAnchorProps(), i));
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
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-content.svelte
var my = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function hy(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, my), o = dy(), s = Ua(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
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
W(hy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-positioner.svelte
var gy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function _y(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, gy), a = dy(), o = Ua(), s = F(() => J(a().getPositionerProps(), i));
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
W(_y, { ref: {} }, [], [], { mode: "open" });
var vy = Zs("popover").parts("arrow", "arrowTip", "anchor", "trigger", "indicator", "positioner", "content", "title", "description", "closeTrigger").build(), yy = (e) => e.ids?.anchor ?? `popover:${e.id}:anchor`, by = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `popover:${e.id}:trigger:${t}` : `popover:${e.id}:trigger` : Kr(n) ? n(t) : n;
}, xy = (e) => e.ids?.content ?? `popover:${e.id}:content`, Sy = (e) => e.ids?.positioner ?? `popover:${e.id}:popper`, Cy = (e) => e.ids?.arrow ?? `popover:${e.id}:arrow`, wy = (e) => e.ids?.title ?? `popover:${e.id}:title`, Ty = (e) => e.ids?.description ?? `popover:${e.id}:desc`, Ey = (e) => e.ids?.closeTrigger ?? `popover:${e.id}:close`, Dy = (e) => e.getById(yy(e)), Oy = (e) => e.getById(by(e)), ky = (e) => Rn(e.getRootNode(), `[data-scope="popover"][data-part="trigger"]${Oe(e.id)}`), Ay = (e, t) => t == null ? Oy(e) ?? ky(e)[0] : e.getById(by(e, t)), jy = (e) => e.getById(xy(e)), My = (e) => e.getById(Sy(e)), Ny = (e) => e.getById(wy(e)), Py = (e) => e.getById(Ty(e)), Fy = { closeTriggerLabel: "close" };
function Iy(e, t) {
	let { state: n, context: r, send: i, computed: a, prop: o, scope: s } = e, c = xi(Fy, o("translations")), l = n.matches("open"), u = r.get("currentPlacement"), d = u ? sp(u) : void 0, f = a("currentPortalled"), p = r.get("renderedElements"), m = r.get("triggerValue"), h = Ep({
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
				id: Cy(s),
				...vy.arrow.attrs,
				dir: o("dir"),
				style: h.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...vy.arrowTip.attrs,
				dir: o("dir"),
				style: h.arrowTip
			});
		},
		getAnchorProps() {
			return t.element({
				...vy.anchor.attrs,
				dir: o("dir"),
				id: yy(s)
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && m === n;
			return t.button({
				...vy.trigger.attrs,
				dir: o("dir"),
				type: "button",
				"data-placement": u,
				"data-side": d,
				id: by(s, n),
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": K(r),
				"aria-haspopup": "dialog",
				"aria-expanded": n == null ? l : l && r,
				"data-state": l ? "open" : "closed",
				"aria-controls": xy(s),
				onPointerDown(e) {
					zt(e) && Ot() && e.currentTarget.focus();
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
				...vy.indicator.attrs,
				dir: o("dir"),
				"data-state": l ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				id: Sy(s),
				...vy.positioner.attrs,
				dir: o("dir"),
				style: h.floating
			});
		},
		getContentProps() {
			return t.element({
				...vy.content.attrs,
				dir: o("dir"),
				id: xy(s),
				tabIndex: -1,
				role: "dialog",
				"aria-modal": we(o("modal")),
				hidden: !l,
				"data-state": l ? "open" : "closed",
				"data-expanded": K(l),
				"aria-labelledby": p.title ? wy(s) : void 0,
				"aria-describedby": p.description ? Ty(s) : void 0,
				"data-placement": u,
				"data-side": d
			});
		},
		getTitleProps() {
			return t.element({
				...vy.title.attrs,
				id: wy(s),
				dir: o("dir")
			});
		},
		getDescriptionProps() {
			return t.element({
				...vy.description.attrs,
				id: Ty(s),
				dir: o("dir")
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...vy.closeTrigger.attrs,
				dir: o("dir"),
				id: Ey(s),
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
var Ly = sa({
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
						triggerElement: Ay(n, e)
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
				let r = Dy(n);
				return wp(() => r ?? Ay(n, e.get("triggerValue")), () => My(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackDismissableElement({ send: e, prop: t, scope: n }) {
				let r = () => jy(n), i = !0;
				return al(r, {
					type: "popover",
					pointerBlocking: t("modal"),
					exclude: [Oy(n), ...ky(n)].filter(Boolean),
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
				return e("modal") || !e("portalled") ? void 0 : Ln(() => jy(t), {
					triggerElement: Ay(t, n.get("triggerValue")),
					defer: !0,
					getShadowRoot: !0,
					onFocus(e) {
						e.focus({ preventScroll: !0 });
					}
				});
			},
			hideContentBelow({ prop: e, scope: t, context: n }) {
				return e("modal") ? Ac(() => [jy(t), Ay(t, n.get("triggerValue"))], { defer: !0 }) : void 0;
			},
			preventScroll({ prop: e, scope: t }) {
				if (e("modal")) return Dl(t.getDoc());
			},
			trapFocus({ prop: e, scope: t, context: n }) {
				return e("modal") ? bl(() => jy(t), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!e("restoreFocus"),
					initialFocus: () => hn({
						root: jy(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					}),
					setReturnFocus: (r) => {
						let i = e("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let e = Ay(t, a);
							if (e) return e;
						}
						return ky(t)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			}
		},
		actions: {
			reposition({ event: e, prop: t, scope: n, context: r }) {
				let i = Dy(n);
				wp(() => i ?? Ay(n, r.get("triggerValue")), () => My(n), {
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
						title: !!Ny(t),
						description: !!Py(t)
					});
				});
			},
			setInitialFocus({ prop: e, scope: t }) {
				e("modal") || q(() => {
					hn({
						root: jy(t),
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
					Ay(n, r.get("triggerValue"))?.focus({ preventScroll: !0 });
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
}), Ry = (e) => {
	let t = lr(), n = $a(), r = F(() => {
		let r = ni(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ea(Ly, () => S(r)), a = F(() => Iy(i, va));
	return () => S(a);
}, zy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function By(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = B(n, "children", 7), s = H(n, zy), c = F(() => Va(s)), l = F(() => P(S(c), 2)), u = F(() => S(l)[0]), d = F(() => S(l)[1]), f = F(() => ({
		...S(d),
		id: S(d).id ?? r,
		open: i(),
		onOpenChange(e) {
			S(d).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), m = Ry(() => S(f)), h = F(() => ({
		...S(u),
		present: m().open
	})), g = Ba(() => S(h));
	uy(m), Ha(g);
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
W(By, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-trigger.svelte
var Vy = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Hy(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Vy), a = F(() => pr()(i, ["value"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = dy(), u = Ua(), d = F(() => {
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
W(Hy, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Popover.svelte
var Uy = m("<!> <!>", 1), Wy = m("<div class=\"af-kit\"><!></div>"), Gy = {
	hash: "svelte-1netzpl",
	code: "[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='popover'][data-part='anchor'] {display:inline-block;}[data-scope='popover'][data-part='content'] {padding:8px;}[data-scope='popover'][data-part='content']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}"
};
function Ky(t, n) {
	k(n, !0), de(t, Gy);
	let r = B(n, "open", 7, !1), i = B(n, "placement", 7, "bottom-start"), a = n.$$host, o = _(null), s = "outside";
	C(() => Ll(S(o), !!r(), a));
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
	}, l = Uy(), u = V(l);
	return Fl(u, {}), fr(T(u, 2), {
		value: () => a.shadowRoot,
		children: (e, t) => {
			var c = Wy(), l = d(c);
			{
				let e = F(() => !!r()), t = F(() => ({
					strategy: "fixed",
					placement: i() || "bottom-start"
				}));
				A(l, () => By, (r, i) => {
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
							e.open || (Il(a, "close", { reason: s }), s = "outside");
						},
						children: (e, t) => {
							var r = Uy(), i = V(r);
							A(i, () => py, (e, t) => {
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
							A(a, () => _y, (e, t) => {
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
										A(i, () => hy, (e, t) => {
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
W(Ky, {
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
var qy = g("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5\"></path><path d=\"M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5\"></path></svg>"), Jy = m("<form class=\"link-form svelte-9gj0md\" novalidate=\"\"><input part=\"link-input\" type=\"url\" inputmode=\"url\" placeholder=\"https://\" class=\"svelte-9gj0md\"/> <button type=\"submit\" class=\"af-button primary\" part=\"link-apply\"> </button></form>"), Yy = m("<!> <!>", 1), Xy = m("<div part=\"toolbar\" class=\"toolbar svelte-9gj0md\"><button type=\"button\" part=\"tool-bold\" class=\"tool svelte-9gj0md\"><b>B</b></button> <button type=\"button\" part=\"tool-italic\" class=\"tool svelte-9gj0md\"><i>I</i></button> <button type=\"button\" part=\"tool-bullet-list\" class=\"tool svelte-9gj0md\">•</button> <button type=\"button\" part=\"tool-numbered-list\" class=\"tool svelte-9gj0md\">1.</button> <!></div>"), Zy = m("<span part=\"placeholder\" class=\"placeholder svelte-9gj0md\" aria-hidden=\"true\"> </span>"), Qy = m("<div class=\"af-kit editor svelte-9gj0md\"><!> <div class=\"surface svelte-9gj0md\"><!> <div part=\"content\" class=\"content svelte-9gj0md\"></div></div></div>"), $y = {
	hash: "svelte-9gj0md",
	code: ".editor.svelte-9gj0md {display:flex;flex-direction:column;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);}.editor.svelte-9gj0md:focus-within {outline:2px solid var(--k-ring);outline-offset:1px;}.editor[data-readonly].svelte-9gj0md {border-color:transparent;background:transparent;}.toolbar.svelte-9gj0md {display:flex;gap:2px;padding:4px;border-bottom:1px solid var(--k-line);}.tool.svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool {min-width:28px;height:28px;padding:0 6px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;cursor:pointer;}.tool.svelte-9gj0md:not(:disabled):hover, [data-scope='popover'][data-part='trigger'].tool:hover {background:color-mix(in oklab, var(--k-fg) 6%, transparent);}.tool.svelte-9gj0md:not(:disabled):active {background:color-mix(in oklab, var(--k-fg) 10%, transparent);}.tool[aria-pressed='true'].svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool[aria-pressed='true'] {background:color-mix(in oklab, var(--k-primary) 14%, transparent);}.tool.svelte-9gj0md:disabled {opacity:0.55;cursor:default;}.tool.svelte-9gj0md:focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}.surface.svelte-9gj0md {position:relative;}.placeholder.svelte-9gj0md {position:absolute;inset:8px 12px auto;color:var(--k-muted);pointer-events:none;}.content.svelte-9gj0md > [contenteditable] {min-height:4.5em;padding:8px 12px;outline:none;white-space:pre-wrap;word-wrap:break-word;font-variant-ligatures:none;}.editor[data-readonly].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:0;}.content.svelte-9gj0md p {margin:0 0 0.5em;}.content.svelte-9gj0md > [contenteditable] > :last-child {margin-bottom:0;}.content.svelte-9gj0md ul, .content.svelte-9gj0md ol {margin:0 0 0.5em;padding-left:1.5em;}.content.svelte-9gj0md a {color:var(--k-primary);}.content.svelte-9gj0md table {border-collapse:collapse;}.content.svelte-9gj0md th, .content.svelte-9gj0md td {border:1px solid var(--k-line);padding:4px 8px;}.content.svelte-9gj0md ul[data-type='taskList'] {list-style:none;padding-left:0.25em;}.content.svelte-9gj0md ul[data-type='taskList'] li {display:flex;gap:6px;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}.link-form.svelte-9gj0md {display:flex;gap:6px;padding:8px;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md) {min-width:240px;min-height:32px;padding:0 8px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-bg);color:var(--k-fg);font:inherit;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:2px solid var(--k-ring);outline-offset:1px;}"
};
function eb(n, r) {
	k(r, !0), de(n, $y);
	let i = B(r, "value", 7, ""), a = B(r, "readonly", 7, !1), o = B(r, "placeholder", 7, null), s = B(r, "label", 7, null), l = B(r, "locale", 7, null), f = B(r, "strings", 7, null), m = r.$$host, h = F(() => Wl(l(), f() ?? void 0)), g = _(null), y = _(null), D = _(!0), j = _(w({
		bold: !1,
		italic: !1,
		bulletList: !1,
		orderedList: !1,
		link: !1
	})), N = _(!1), P = _(""), ee = _(null);
	C(() => Ll(S(ee), S(N), m));
	let te, ne = null, I = !1, z = !1, ie = (e) => e.getMarkdown().replace(/\u00A0+$/gm, "").trimEnd();
	function ae() {
		if (clearTimeout(te), te = void 0, !S(y) || !I) return;
		I = !1;
		let e = ie(S(y));
		e !== (i() ?? "") && e !== ne && (ne = e, Il(m, "change", { value: e }));
	}
	function oe(e, t) {
		z = !1, ie(e) !== t && (e.commands.setContent(t, {
			contentType: "markdown",
			emitUpdate: !1
		}), I = !1, ne = null);
	}
	function H(e) {
		E(D, e.isEmpty, !0), E(j, {
			bold: e.isActive("bold"),
			italic: e.isActive("italic"),
			bulletList: e.isActive("bulletList"),
			orderedList: e.isActive("orderedList"),
			link: e.isActive("link")
		}, !0);
	}
	C(() => {
		let e = S(g);
		if (!e) return;
		let t = !1, n = null;
		return import("./chunks/markdown-jzd-QUHj.js").then(({ createMarkdownEditor: r }) => {
			if (t) return;
			let o = r({
				element: e,
				content: c(() => i() ?? ""),
				editable: c(() => !a()),
				onUpdate() {
					I = !0, clearTimeout(te), te = setTimeout(ae, 600);
				},
				onBlur() {
					ae(), z && oe(o, i() ?? "");
				},
				onFocus() {}
			});
			o.on("transaction", () => H(o)), n = o, H(o), E(y, o), m.editor = o;
		}), () => {
			t = !0, ae(), n?.destroy(), m.editor === n && (m.editor = null), E(y, null);
		};
	}), C(() => {
		let e = i() ?? "", t = S(y);
		t && c(() => {
			t.isFocused ? z = !0 : oe(t, e);
		});
	}), C(() => {
		let e = S(y)?.view.dom;
		e && (s() ? e.setAttribute("aria-label", s()) : e.removeAttribute("aria-label"));
	}), C(() => {
		let e = !a();
		S(y) && S(y).isEditable !== e && S(y).setEditable(e, !1);
	});
	function se(e) {
		e && S(y) && E(P, S(y).getAttributes("link").href ?? "", !0), E(N, e, !0);
	}
	function U() {
		if (!S(y)) return;
		let e = S(P).trim(), t = S(y).chain().focus().extendMarkRange("link");
		e ? S(y).state.selection.empty && !S(y).isActive("link") ? t.insertContent({
			type: "text",
			text: e,
			marks: [{
				type: "link",
				attrs: { href: e }
			}]
		}).run() : t.setLink({ href: e }).run() : t.unsetLink().run(), E(N, !1);
	}
	let W = (e) => e.preventDefault();
	var le = {
		get value() {
			return i();
		},
		set value(t = "") {
			i(t), e();
		},
		get readonly() {
			return a();
		},
		set readonly(t = !1) {
			a(t), e();
		},
		get placeholder() {
			return o();
		},
		set placeholder(t = null) {
			o(t), e();
		},
		get label() {
			return s();
		},
		set label(t = null) {
			s(t), e();
		},
		get locale() {
			return l();
		},
		set locale(t = null) {
			l(t), e();
		},
		get strings() {
			return f();
		},
		set strings(t = null) {
			f(t), e();
		}
	}, ue = Yy(), fe = V(ue);
	return Fl(fe, {}), fr(T(fe, 2), {
		value: () => m.shadowRoot,
		children: (e, n) => {
			var r = Qy(), i = d(r), s = (e) => {
				var n = Xy(), r = d(n), i = T(r, 2), a = T(i, 2), o = T(a, 2), s = T(o, 2);
				A(s, () => By, (e, n) => {
					n(e, {
						get open() {
							return S(N);
						},
						portalled: !1,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						onOpenChange: (e) => se(e.open),
						children: (e, n) => {
							var r = Yy(), i = V(r);
							{
								let e = F(() => !S(y));
								A(i, () => Hy, (t, n) => {
									n(t, {
										part: "tool-link",
										class: "tool",
										get "aria-label"() {
											return S(h).link;
										},
										get title() {
											return S(h).link;
										},
										get "aria-pressed"() {
											return S(j).link;
										},
										get disabled() {
											return S(e);
										},
										children: (e, t) => {
											var n = qy();
											R(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var a = T(i, 2);
							A(a, () => _y, (e, n) => {
								n(e, {
									popover: "manual",
									get ref() {
										return S(ee);
									},
									set ref(e) {
										E(ee, e, !0);
									},
									children: (e, n) => {
										var r = p(), i = V(r);
										A(i, () => hy, (e, n) => {
											n(e, {
												class: "af-overlay link",
												part: "link-popover",
												children: (e, n) => {
													var r = Jy(), i = d(r);
													re(i);
													var a = T(i, 2), o = u(a, !0);
													M(r), x(() => {
														G(i, "aria-label", S(h).link), t(o, S(h).confirm);
													}), he("submit", r, (e) => {
														e.preventDefault(), U();
													}), ce(i, () => S(P), (e) => E(P, e)), R(e, r);
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
					G(r, "aria-label", S(h).bold), G(r, "title", S(h).bold), G(r, "aria-pressed", S(j).bold), r.disabled = !S(y), G(i, "aria-label", S(h).italic), G(i, "title", S(h).italic), G(i, "aria-pressed", S(j).italic), i.disabled = !S(y), G(a, "aria-label", S(h).bulletList), G(a, "title", S(h).bulletList), G(a, "aria-pressed", S(j).bulletList), a.disabled = !S(y), G(o, "aria-label", S(h).numberedList), G(o, "title", S(h).numberedList), G(o, "aria-pressed", S(j).orderedList), o.disabled = !S(y);
				}), v("mousedown", r, W), v("click", r, () => S(y)?.chain().focus().toggleBold().run()), v("mousedown", i, W), v("click", i, () => S(y)?.chain().focus().toggleItalic().run()), v("mousedown", a, W), v("click", a, () => S(y)?.chain().focus().toggleBulletList().run()), v("mousedown", o, W), v("click", o, () => S(y)?.chain().focus().toggleOrderedList().run()), R(e, n);
			};
			b(i, (e) => {
				a() || e(s);
			});
			var c = T(i, 2), l = d(c), f = (e) => {
				var n = Zy(), r = u(n, !0);
				x(() => t(r, o())), R(e, n);
			};
			b(l, (e) => {
				S(D) && o() && e(f);
			});
			var m = T(l, 2);
			O(m, (e) => E(g, e), () => S(g)), M(c), M(r), x(() => G(r, "data-readonly", a() ? "" : void 0)), R(e, r);
		},
		$$slots: { default: !0 }
	}), R(n, ue), L(le);
}
f(["mousedown", "click"]), W(eb, {
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
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	editor = null;
});
var tb = Zs("toast").parts("group", "root", "title", "description", "actionTrigger", "closeTrigger").build(), nb = (e) => `toast-group:${e}`, rb = (e, t) => e.getById(`toast-group:${t}`), ib = (e) => `toast:${e.id}`, ab = (e) => e.getById(ib(e)), ob = (e) => `toast:${e.id}:title`, sb = (e) => `toast:${e.id}:description`, cb = (e) => `toast${e.id}:close`, lb = {
	info: 5e3,
	error: 5e3,
	success: 2e3,
	loading: Infinity,
	warning: 5e3,
	DEFAULT: 5e3
};
function ub(e, t) {
	return e ?? lb[t] ?? lb.DEFAULT;
}
var db = (e) => typeof e == "string" ? {
	left: e,
	right: e,
	bottom: e,
	top: e
} : e;
function fb(e, t) {
	let { prop: n, computed: r, context: i } = e, { offsets: a, gap: o } = n("store").attrs, s = i.get("heights"), c = db(a), l = n("dir") === "rtl", u = t.replace("-start", l ? "-right" : "-left").replace("-end", l ? "-left" : "-right"), d = u.includes("right"), f = u.includes("left"), p = {
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
		zIndex: Ce
	}, m = "center";
	return d && (m = "flex-end"), f && (m = "flex-start"), p.alignItems = m, u.includes("top") && (p.top = `max(env(safe-area-inset-top, 0px), ${c.top})`), u.includes("bottom") && (p.bottom = `max(env(safe-area-inset-bottom, 0px), ${c.bottom})`), u.includes("left") || (p.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${c.right})`), u.includes("right") || (p.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${c.left})`), p;
}
function pb(e, t) {
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
function mb(e, t) {
	let { computed: n } = e, r = {
		position: "absolute",
		inset: "0",
		scale: "1 2",
		pointerEvents: t ? "none" : "auto"
	};
	return n("frontmost") && !t && ((e) => Object.assign(r, e))({ height: "calc(var(--initial-height) + 80%)" }), r;
}
function hb() {
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
function gb(e, t) {
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
				...tb.group.attrs,
				dir: r("dir"),
				tabIndex: -1,
				role: "region",
				"aria-label": `${s}, ${u} (${l})`,
				id: nb(u),
				"data-placement": u,
				"data-side": d,
				"data-align": f,
				"aria-live": "polite",
				"aria-relevant": "additions text",
				"aria-atomic": "false",
				style: fb(e, u),
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
					a.get("isFocusWithin") && !Ge(e.currentTarget, e.relatedTarget) && queueMicrotask(() => i({ type: "REGION.BLUR" }));
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
var { guards: _b, createMachine: vb } = ca(), { and: yb } = _b, bb = vb({
	props({ props: e }) {
		return {
			dir: "ltr",
			id: si(),
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
			ignoreMouseTimer: _n.create(),
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
				guard: yb("isOverlapping", "isPointerOut"),
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
				return Jt(document, "keydown", (n) => {
					let { hotkey: r } = e("store").attrs;
					r.every((e) => n[e] || n.code === e) && t({ type: "DOC.HOTKEY" });
				}, { capture: !0 });
			},
			trackDocumentVisibility({ prop: e, send: t, scope: n }) {
				let { pauseOnPageIdle: r } = e("store").attrs;
				if (!r) return;
				let i = n.getDoc();
				return Jt(i, "visibilitychange", () => {
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
				let s = ol(() => rb(r, a), { defer: !0 });
				e.set("dismissableCleanup", s);
			},
			clearDismissableBranch({ refs: e }) {
				e.get("dismissableCleanup")?.();
			},
			focusRegionEl({ scope: e, computed: t }) {
				queueMicrotask(() => {
					rb(e, t("placement"))?.focus();
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
}), xb = { closeTriggerLabel: "Dismiss notification" };
function Sb(e, t) {
	let { state: n, send: r, prop: i, scope: a, context: o, computed: s } = e, c = xi(xb, i("translations")), l = n.hasTag("visible"), u = n.hasTag("paused"), d = o.get("mounted"), f = s("frontmost"), p = i("parent").computed("placement"), m = i("type"), h = i("stacked"), g = i("title"), _ = i("description"), v = i("action"), [y, b = "center"] = p.split("-");
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
				...tb.root.attrs,
				dir: i("dir"),
				id: ib(a),
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
				"aria-describedby": _ ? sb(a) : void 0,
				"aria-labelledby": g ? ob(a) : void 0,
				tabIndex: 0,
				style: pb(e, l),
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
				style: mb(e, l)
			});
		},
		getGhostAfterProps() {
			return t.element({
				"data-ghost": "after",
				style: hb()
			});
		},
		getTitleProps() {
			return t.element({
				...tb.title.attrs,
				id: ob(a)
			});
		},
		getDescriptionProps() {
			return t.element({
				...tb.description.attrs,
				id: sb(a)
			});
		},
		getActionTriggerProps() {
			return t.button({
				...tb.actionTrigger.attrs,
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
				id: cb(a),
				...tb.closeTrigger.attrs,
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
var { not: Cb } = oa(), wb = sa({
	props({ props: e }) {
		return Ai(e, [
			"id",
			"type",
			"parent",
			"removeDelay"
		], "toast"), {
			closable: !0,
			...e,
			duration: ub(e.duration, e.type)
		};
	},
	initialState({ prop: e }) {
		return e("type") === "loading" || e("duration") === Infinity ? "visible:persist" : "visible";
	},
	context({ prop: e, bindable: t }) {
		return {
			remainingTime: t(() => ({ defaultValue: ub(e("duration"), e("type")) })),
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
					guard: Cb("isLoadingType"),
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
				return Ei(() => {
					t({
						type: "REMOVE",
						src: "timer"
					});
				}, e("removeDelay"));
			},
			waitForDuration({ send: e, context: t, computed: n }) {
				if (!n("shouldPersist")) return Ei(() => {
					e({
						type: "DISMISS",
						src: "timer"
					});
				}, t.get("remainingTime"));
			},
			waitForNextTick({ send: e }) {
				return Ei(() => {
					e({
						type: "SHOW",
						src: "timer"
					});
				}, 0);
			},
			trackHeight({ scope: e, prop: t }) {
				let n;
				return q(() => {
					let r = ab(e);
					if (!r) return;
					let i = new (e.getWin()).MutationObserver(() => {
						let e = Tb(r), n = {
							id: t("id"),
							height: e
						};
						Eb(t("parent"), n);
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
					let r = ab(e);
					if (!r) return;
					let i = Tb(r);
					n.set("initialHeight", i);
					let a = {
						id: t("id"),
						height: i
					};
					Eb(t("parent"), a);
				});
			},
			setCloseTimer({ refs: e }) {
				e.set("closeTimerStartTime", Date.now());
			},
			resetCloseTimer({ context: e, refs: t, prop: n }) {
				t.set("closeTimerStartTime", Date.now()), e.set("remainingTime", ub(n("duration"), n("type")));
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
function Tb(e) {
	let t = e.style.height;
	e.style.height = "auto";
	let n = e.offsetHeight;
	return e.style.height = t, n;
}
function Eb(e, t) {
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
var Db = (e, t) => ({
	...t,
	...bi(e)
}), Ob = {
	error: [1, 2],
	warning: [3, 6],
	loading: [4, 5],
	success: [5, 7],
	info: [6, 8]
}, kb = "info", Ab = (e, t) => {
	let [n, r] = Ob[e ?? kb];
	return t ? n : r;
}, jb = (e) => e.sort((e, t) => (e.priority ?? Ab(e.type, !!e.action)) - (t.priority ?? Ab(t.type, !!t.action)));
function Mb(e = {}) {
	let t = Db(e, {
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
		for (a = jb(a); a.length > 0 && r.length < t.max;) {
			let e = a.shift();
			e && (s(e), r.unshift(e));
		}
	}, u = (e) => {
		let n = e.id ?? `toast:${si()}`, a = r.find((e) => e.id === n);
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
				type: kb,
				...e,
				stacked: !t.overlap,
				gap: t.gap
			}, i = r.priority ?? Ab(r.type, !!r.action);
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
				Di("[zag-js > toast] toaster.promise() requires at least a 'loading' option to be specified");
				return;
			}
			let r = u({
				...n,
				...t.loading,
				promise: e,
				type: "loading"
			}), i = !0, a, o = ni(e).then(async (e) => {
				if (a = ["resolve", e], Nb(e) && !e.ok) {
					i = !1;
					let a = ni(t.error, `HTTP Error! status: ${e.status}`);
					u({
						...n,
						...a,
						id: r,
						type: "error"
					});
				} else if (t.success !== void 0) {
					i = !1;
					let a = ni(t.success, e);
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
					let a = ni(t.error, e);
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
var Nb = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", Pb = {
	connect: gb,
	machine: bb
}, Fb = (e) => Mb(e), [Ib, Lb] = sr({
	name: "ToastContext",
	hookName: "useToastContext",
	providerName: "<ToastProvider />"
}), Rb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function zb(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Rb), a = Lb(), o = F(() => J(a().getActionTriggerProps(), i));
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
W(zb, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-close-trigger.svelte
var Bb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Vb(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Bb), a = Lb(), o = F(() => J(a().getCloseTriggerProps(), i));
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
W(Vb, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-description.svelte
var Hb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ub(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Hb), a = Lb(), o = F(() => J(a().getDescriptionProps(), i));
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
W(Ub, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toast-root.svelte
var Wb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]), Gb = m("<div></div> <!> <div></div>", 1);
function Kb(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Wb), a = Lb(), o = F(() => J(a().getRootProps(), i));
	return Y(t, I({ as: "div" }, () => S(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		},
		children: (e, t) => {
			var r = Gb(), i = V(r);
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
W(Kb, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster-item.svelte
function qb(t, n) {
	k(n, !0);
	let r = B(n, "children", 7), i = B(n, "value", 7), a = B(n, "parent", 7), o = B(n, "index", 7), s = lr(), c = F(() => ({
		...i()(),
		parent: a(),
		index: o(),
		getRootNode: s().getRootNode
	})), l = Ea(wb, () => S(c)), u = F(() => Sb(l, va));
	Ib(() => S(u));
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
W(qb, {
	children: {},
	value: {},
	parent: {},
	index: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/toast/toaster.svelte
var Jb = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"toaster",
	"children"
]);
function Yb(t, n) {
	let i = o();
	k(n, !0);
	let a = B(n, "ref", 15, null), s = B(n, "toaster", 7), c = B(n, "children", 7), l = H(n, Jb), u = $a(), d = lr(), f = F(() => ({
		store: s(),
		id: i,
		dir: u().dir,
		getRootNode: d().getRootNode
	})), m = Ea(Pb.machine, () => S(f)), h = F(() => Pb.connect(m, va)), g = F(() => S(h).getToasts()), _ = F(() => J(S(h).getGroupProps(), l));
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
				qb(e, {
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
W(Yb, {
	ref: {},
	toaster: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/Toast.svelte
var Xb = /* @__PURE__ */ new WeakMap();
function Zb(e) {
	let t = Xb.get(e);
	return t || Xb.set(e, t = Fb({
		placement: "bottom-end",
		overlap: !1,
		gap: 8,
		hotkey: ["af-kit-no-hotkey"]
	})), t;
}
function Qb(e, t) {
	return e.create({
		type: t.kind,
		description: t.text,
		duration: t.kind === "error" ? t.action ? Infinity : 8e3 : 4e3,
		meta: { action: t.action ?? null }
	});
}
var $b = m("<p> </p>"), ex = g("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>", 1), tx = g("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m9 12 2 2 4-4\"></path>", 1), nx = g("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>", 1), rx = g("<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg>"), ix = g("<svg part=\"icon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-e495ij\"><!></svg><!><!><!>", 1), ax = m("<div class=\"af-kit\"><div class=\"live svelte-e495ij\" role=\"status\"></div> <div class=\"live svelte-e495ij\" role=\"alert\"></div> <div class=\"region svelte-e495ij\" popover=\"manual\"><!></div></div>"), ox = m("<!> <!>", 1), sx = {
	hash: "svelte-e495ij",
	code: ".live.svelte-e495ij {position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;}.region[popover].svelte-e495ij {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;pointer-events:none;}[data-scope='toast'][data-part='root'] {position:relative;display:flex;align-items:flex-start;gap:8px;width:min(360px, calc(100vw - 32px));padding:8px 8px 8px 14px;box-sizing:border-box;overflow:hidden;font-size:14px;line-height:22px;--k-tone: var(--k-info);translate:var(--x) var(--y);scale:var(--scale, 1);z-index:var(--z-index);opacity:var(--opacity);will-change:translate, opacity, scale;transition:translate 400ms cubic-bezier(0.21, 1.02, 0.73, 1), scale 400ms cubic-bezier(0.21, 1.02, 0.73, 1), opacity 400ms cubic-bezier(0.21, 1.02, 0.73, 1);}[data-scope='toast'][data-part='root'][data-state='closed'] {transition:translate 400ms cubic-bezier(0.06, 0.71, 0.55, 1), scale 400ms cubic-bezier(0.06, 0.71, 0.55, 1), opacity 200ms cubic-bezier(0.06, 0.71, 0.55, 1);}[data-scope='toast'][data-part='root']:focus-visible {outline:2px solid var(--k-ring);outline-offset:2px;}\n  /* The kind shows in a leading bar and an icon, not only in a colour of the border. */[data-scope='toast'][data-part='root']::before {content:'';position:absolute;inset-block:0;left:0;width:3px;background:var(--k-tone);}[data-scope='toast'][data-part='root'][data-type='error'] {--k-tone: var(--k-danger);}[data-scope='toast'][data-part='root'][data-type='success'] {--k-tone: var(--k-success);}[part='icon'].svelte-e495ij {flex:none;width:16px;height:16px;margin-top:3px;color:var(--k-tone);}[data-scope='toast'][data-part='description'] {flex:1;min-width:0;padding-block:1px;overflow-wrap:anywhere;}[data-scope='toast'][data-part='action'] {flex:none;min-height:28px;padding:0 10px;font-size:12px;}[data-scope='toast'][data-part='close'] {flex:none;color:var(--k-muted);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='toast'][data-part='root'], [data-scope='toast'][data-part='root'][data-state='closed'] {transition:none;}\n  }"
};
function cx(n, i) {
	k(i, !0), de(n, sx);
	let a = B(i, "locale", 7, null), o = B(i, "strings", 7, null), s = i.$$host, c = F(() => Wl(a(), o() ?? void 0)), f = Zb(s), m = _(null), h = _(0), g = _(w([])), v = () => queueMicrotask(() => {
		let e = f.getVisibleToasts();
		E(h, e.length, !0), E(g, e.map((e) => ({
			id: e.id,
			error: e.type === "error",
			text: String(e.description ?? "")
		})), !0);
	});
	C(() => (v(), f.subscribe(v))), C(() => Ll(S(m), S(h) > 0, s));
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
	}, D = ox(), j = V(D);
	return Fl(j, {}), fr(T(j, 2), {
		value: () => s.shadowRoot,
		children: (e, n) => {
			var i = ax(), a = d(i);
			r(a, 21, () => S(g).filter((e) => !e.error), (e) => e.id, (e, n) => {
				var r = $b(), i = u(r, !0);
				x(() => t(i, S(n).text)), R(e, r);
			}), M(a);
			var o = T(a, 2);
			r(o, 21, () => S(g).filter((e) => e.error), (e) => e.id, (e, n) => {
				var r = $b(), i = u(r, !0);
				x(() => t(i, S(n).text)), R(e, r);
			}), M(o);
			var h = T(o, 2);
			Yb(d(h), {
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
					A(a, () => Kb, (e, i) => {
						i(e, {
							part: "toast",
							class: "af-overlay",
							"aria-live": "off",
							children: (e, i) => {
								var a = ix(), o = V(a), u = d(o), f = (e) => {
									var t = ex();
									U(2), R(e, t);
								}, m = F(() => n()().type === "error"), h = (e) => {
									var t = tx();
									U(), R(e, t);
								}, g = F(() => n()().type === "success"), _ = (e) => {
									var t = nx();
									U(2), R(e, t);
								};
								b(u, (e) => {
									S(m) ? e(f) : S(g) ? e(h, 1) : e(_, -1);
								}), M(o);
								var v = T(o);
								A(v, () => Ub, (e, r) => {
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
									A(a, () => zb, (e, i) => {
										i(e, {
											part: "action",
											class: "af-button secondary",
											onclick: () => Il(s, "action", {
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
								A(w, () => Vb, (e, t) => {
									t(e, {
										part: "close",
										class: "af-button ghost icon sm",
										get "aria-label"() {
											return S(c).close;
										},
										children: (e, t) => {
											var n = rx();
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
W(cx, {
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	show(e) {
		return Qb(Zb(this), e);
	}
	dismiss(e) {
		Zb(this).dismiss(e);
	}
});
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/use-tooltip-context.js
var [lx, ux] = sr({ name: "TooltipContext" }), dx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function fx(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, dx), o = ux(), s = Ua(), c = F(() => J(o().getContentProps(), s().getPresenceProps(), i));
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
W(fx, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-context.svelte
function px(t, n) {
	k(n, !0);
	let r = B(n, "render", 7), i = ux();
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
W(px, { render: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-positioner.svelte
var mx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function hx(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, mx), a = ux(), o = Ua(), s = F(() => J(a().getPositionerProps(), i));
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
W(hx, { ref: {} }, [], [], { mode: "open" });
var gx = Zs("tooltip").parts("trigger", "arrow", "arrowTip", "positioner", "content").build(), _x = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `tooltip:${e.id}:trigger:${t}` : `tooltip:${e.id}:trigger` : Kr(n) ? n(t) : n;
}, vx = (e) => e.ids?.content ?? `tooltip:${e.id}:content`, yx = (e) => e.ids?.arrow ?? `tooltip:${e.id}:arrow`, bx = (e) => e.ids?.positioner ?? `tooltip:${e.id}:popper`, xx = (e) => e.getById(_x(e)), Sx = (e) => e.getById(bx(e)), Cx = (e) => Rn(e.getRootNode(), `[data-scope="tooltip"][data-part="trigger"]${Oe(e.id)}`), wx = (e, t) => t == null ? xx(e) ?? Cx(e)[0] : e.getById(_x(e, t)), Tx = Si({
	id: null,
	prevId: null,
	instant: !1
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+tooltip@1.43.3/node_modules/@zag-js/tooltip/dist/tooltip.connect.mjs
function Ex(e, t) {
	let { state: n, context: r, send: i, scope: a, prop: o, event: s } = e, c = o("id"), l = !!o("aria-label"), u = n.matches("open", "closing"), d = r.get("triggerValue"), f = r.get("currentPlacement"), p = f ? sp(f) : void 0, m = vx(a), h = o("disabled"), g = Ep({
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
			let { value: n } = e, r = n != null && d === n, s = _x(a, n);
			return t.button({
				...gx.trigger.attrs,
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
					e.defaultPrevented || h || hh() && i({
						type: u && n != null && !r ? "triggerValue.set" : "open",
						src: "trigger.focus",
						value: n,
						triggerId: s
					});
				},
				onBlur(e) {
					e.defaultPrevented || h || c === Tx.get("id") && ((e.relatedTarget ?? a.getDoc().activeElement)?.closest(Oe(a.id)) ?? i({
						type: "close",
						src: "trigger.blur",
						value: n,
						triggerId: s
					}));
				},
				onPointerDown(e) {
					e.defaultPrevented || h || zt(e) && o("closeOnPointerDown") && c === Tx.get("id") && i({
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
				id: yx(a),
				...gx.arrow.attrs,
				dir: o("dir"),
				style: g.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...gx.arrowTip.attrs,
				dir: o("dir"),
				style: g.arrowTip
			});
		},
		getPositionerProps() {
			return t.element({
				id: bx(a),
				...gx.positioner.attrs,
				dir: o("dir"),
				style: g.floating
			});
		},
		getContentProps() {
			let e = Tx.get("id") === c, n = Tx.get("prevId") === c, r = Tx.get("instant") && (u && e || n);
			return t.element({
				...gx.content.attrs,
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
var { and: Dx, not: Ox } = oa(), kx = sa({
	initialState: ({ prop: e }) => e("open") || e("defaultOpen") ? "open" : "closed",
	props({ props: e }) {
		Ai(e, ["id"]);
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
					triggerElement: wx(n, e)
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
					guard: Dx("noVisibleTooltip", Ox("hasPointerMoveOpened")),
					target: "opening",
					actions: ["setTriggerValue"]
				}, {
					guard: Ox("hasPointerMoveOpened"),
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
			noVisibleTooltip: () => Tx.get("id") === null,
			isVisible: ({ prop: e }) => e("id") === Tx.get("id"),
			isInteractive: ({ prop: e }) => !!e("interactive"),
			hasPointerMoveOpened: ({ context: e }) => !!e.get("hasPointerMoveOpened"),
			isOpenControlled: ({ prop: e }) => e("open") !== void 0
		},
		actions: {
			setGlobalId: ({ prop: e }) => {
				let t = Tx.get("id"), n = t !== null && t !== e("id");
				Tx.update({
					id: e("id"),
					prevId: n ? t : null,
					instant: n
				});
			},
			clearGlobalId: ({ prop: e }) => {
				e("id") === Tx.get("id") && Tx.update({
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
				t.type === "positioning.set" && wp(() => wx(r, e.get("triggerValue")), () => Sx(r), {
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
				return wp(() => wx(r, i), () => Sx(r), {
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
			trackFocusVisible: ({ scope: e }) => gh({ root: e.getRootNode?.() }),
			trackPositioning: ({ context: e, prop: t, scope: n }) => (e.get("currentPlacement") || e.set("currentPlacement", t("positioning").placement), wp(() => wx(n, e.get("triggerValue")), () => Sx(n), {
				...t("positioning"),
				defer: !0,
				onComplete(t) {
					e.set("currentPlacement", t.placement);
				}
			})),
			trackPointerlockChange: ({ send: e, scope: t }) => Jt(t.getDoc(), "pointerlockchange", () => e({
				type: "close",
				src: "pointerlock:change"
			}), !1),
			trackScroll: ({ send: e, prop: t, scope: n, context: r }) => {
				if (!t("closeOnScroll")) return;
				let i = wx(n, r.get("triggerValue"));
				if (!i) return;
				let a = wn(i).map((t) => Jt(t, "scroll", () => {
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
					n = Tx.subscribe(() => {
						Tx.get("id") !== e("id") && t({
							type: "close",
							src: "id.change"
						});
					});
				}), () => n?.();
			},
			trackEscapeKey: ({ send: e, prop: t }) => t("closeOnEscape") ? Jt(document, "keydown", (t) => {
				Ft(t) || t.key === "Escape" && (t.stopPropagation(), e({
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
}), Ax = (e) => {
	let t = lr(), n = $a(), r = F(() => {
		let r = ni(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = Ea(kx, () => S(r)), a = F(() => Ex(i, va));
	return () => S(a);
}, jx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open"
]);
function Mx(t, n) {
	let r = o();
	k(n, !0);
	let i = B(n, "open", 15), a = H(n, jx), s = F(() => Va(a)), c = F(() => P(S(s), 2)), l = F(() => S(c)[0]), u = F(() => S(c)[1]), d = F(() => S(u).children), f = F(() => ie(S(u), ["children"])), m = F(() => ({
		...S(f),
		id: r,
		onOpenChange(e) {
			S(f).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), h = Ax(() => S(m)), g = F(() => ({
		...S(l),
		present: h().open
	})), _ = Ba(() => S(g));
	lx(h), Ha(_);
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
W(Mx, { open: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/tooltip/tooltip-trigger.svelte
var Nx = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Px(t, n) {
	k(n, !0);
	let r = B(n, "ref", 15, null), i = H(n, Nx), a = F(() => pr()(i, ["value"])), o = F(() => P(S(a), 2)), s = F(() => S(o)[0]), c = F(() => S(o)[1]), l = ux(), u = F(() => J(l().getTriggerProps(S(s)), S(c)));
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
W(Px, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Tooltip.svelte
var Fx = m("<span><!></span>"), Ix = m("<!> <!>", 1), Lx = {
	hash: "svelte-1cq81kb",
	code: ":host {display:inline-block;}[part='anchor'].svelte-1cq81kb {display:block;}[data-scope='tooltip'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}[data-scope='tooltip'][data-part='content'] {max-width:280px;padding:4px 8px;border-radius:max(0px, calc(var(--k-radius) - 4px));font-size:12px;line-height:18px;overflow-wrap:anywhere;}"
};
function Rx(r, i) {
	k(i, !0), de(r, Lx);
	let a = B(i, "text", 7, ""), o = i.$$host, s = _(!1), c = _(null), u = !1;
	C(() => Ll(S(c), S(s), o));
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
		var n = Ix(), r = V(n);
		Fl(r, {}), fr(T(r, 2), {
			value: () => o.shadowRoot,
			children: (e, n) => {
				var r = p(), o = V(r);
				A(o, () => Mx, (e, n) => {
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
							var r = Ix(), o = V(r);
							{
								let e = (e, t = ue) => {
									var n = p(), r = V(n);
									{
										let e = (e, n = ue) => {
											var r = Fx();
											j(r, (e) => ({
												part: "anchor",
												...e
											}), [() => n()()], void 0, void 0, "svelte-1cq81kb");
											var a = d(r);
											pe(a, i, "default", {}, null), M(r), D(r, () => f(t())), R(e, r);
										};
										A(r, () => Px, (n, r) => {
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
								A(o, () => px, (t, n) => {
									n(t, {
										render: e,
										$$slots: { render: !0 }
									});
								});
							}
							var s = T(o, 2);
							A(s, () => hx, (e, n) => {
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
										A(i, () => fx, (e, n) => {
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
W(Rx, {
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
var zx = "0.2.0", Bx = {
	"af-dialog": mg,
	"af-confirm": Ql,
	"af-menu": F_,
	"af-popover": Ky,
	"af-tooltip": Rx,
	"af-toast": cx,
	"af-date": lg,
	"af-person-picker": ly,
	"af-rich-editor": eb
}, Vx = Object.keys(Bx);
for (let e of Object.values(Bx)) Object.defineProperty(e.element, "kitVersion", { value: zx });
function Hx(e, t) {
	if (typeof e != "string") return !0;
	let n = e.split(".").map((e) => Number.parseInt(e, 10) || 0), r = t.split(".").map((e) => Number.parseInt(e, 10) || 0);
	for (let e = 0; e < 3; e++) if ((n[e] ?? 0) !== (r[e] ?? 0)) return (n[e] ?? 0) < (r[e] ?? 0);
	return !1;
}
function Ux(e = customElements) {
	for (let [t, n] of Object.entries(Bx)) {
		let r = e.get(t);
		if (!r) e.define(t, n.element);
		else if (r !== n.element) {
			let e = r.kitVersion;
			Hx(e, "0.2.0") && console.warn(`An older copy of the AgentFlow UI kit registered ${t} first; this page uses it, not this copy.`, {
				tag: t,
				registered: e ?? null,
				loaded: zx
			});
		}
	}
}
Ux();
//#endregion
export { Pl as KIT_CSS, Vx as KIT_TAGS, zx as KIT_VERSION, Ux as defineKitElements };
