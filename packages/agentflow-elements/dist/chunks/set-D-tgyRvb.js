import { V as e, nt as t } from "./use-locale-context-9YfTvPVv.js";
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/computed-style.mjs
var n = /* @__PURE__ */ new WeakMap();
function r(t) {
	return n.has(t) || n.set(t, e(t).getComputedStyle(t)), n.get(t);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/query.mjs
function i(e, t) {
	return Array.from(e?.querySelectorAll(t) ?? []);
}
function a(e, t) {
	return e?.querySelector(t) ?? null;
}
var o = (e) => e.id;
function s(e, t, n = o) {
	return e.find((e) => n(e) === t);
}
function c(e, t, n = o) {
	let r = s(e, t, n);
	return r ? e.indexOf(r) : -1;
}
function l(e, t, n = !0) {
	let r = c(e, t);
	return r = n ? (r + 1) % e.length : Math.min(r + 1, e.length - 1), e[r];
}
function u(e, t, n = !0) {
	let r = c(e, t);
	return r === -1 ? n ? e[e.length - 1] : null : (r = n ? (r - 1 + e.length) % e.length : Math.max(0, r - 1), e[r]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/set.mjs
function d(e, n, r) {
	let i = e.getAttribute(n), a = i != null;
	return i === r ? t : (e.setAttribute(n, r), () => {
		a ? e.setAttribute(n, i) : e.removeAttribute(n);
	});
}
function f(e, n) {
	if (!e) return t;
	let r = Object.keys(n).reduce((t, n) => (t[n] = e.style.getPropertyValue(n), t), {});
	return m(r, n) ? t : (Object.assign(e.style, n), () => {
		Object.assign(e.style, r), e.style.length === 0 && e.removeAttribute("style");
	});
}
function p(e, n, r) {
	if (!e) return t;
	let i = e.style.getPropertyValue(n);
	return i === r ? t : (e.style.setProperty(n, r), () => {
		e.style.setProperty(n, i), e.style.length === 0 && e.removeAttribute("style");
	});
}
function m(e, t) {
	return Object.keys(e).every((n) => e[n] === t[n]);
}
//#endregion
export { c as a, u as c, r as d, o as i, a as l, f as n, s as o, p as r, l as s, d as t, i as u };
