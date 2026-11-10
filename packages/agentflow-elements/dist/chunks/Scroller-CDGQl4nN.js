import { $ as e, C as t, Ct as n, Dt as r, Et as i, F as a, Ft as o, G as s, I as c, It as l, K as u, L as d, Nt as f, Ot as p, St as m, T as h, Tt as g, U as _, X as v, Y as y, Z as b, _ as x, at as S, b as C, bt as w, dt as T, ft as E, g as D, gt as O, ht as k, j as ee, kt as A, lt as te, pt as j, q as M, st as ne, ut as re, v as N, vt as ie, wt as ae, y as P } from "./version-D1aEkxtn.js";
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/array.mjs
function oe(e) {
	return e == null ? [] : Array.isArray(e) ? e : [e];
}
var se = (e) => e[0], ce = (e) => e[e.length - 1], le = (e, t) => e.indexOf(t) !== -1, ue = (e, ...t) => e.concat(t), de = (e, ...t) => e.filter((e) => !t.includes(e)), fe = (e) => Array.from(new Set(e)), pe = (e, t) => {
	let n = new Set(t);
	return e.filter((e) => !n.has(e));
}, me = (e, t) => le(e, t) ? de(e, t) : ue(e, t);
function he(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n, a = t + r, o = e.length, s = o - 1;
	return t === -1 ? r > 0 ? 0 : s : a < 0 ? i ? s : 0 : a >= o ? i ? 0 : t > o ? o : t : a;
}
function ge(e, t, n = {}) {
	return e[he(e, t, n)];
}
function _e(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n;
	return he(e, t, {
		step: -r,
		loop: i
	});
}
function ve(e, t, n = {}) {
	return e[_e(e, t, n)];
}
function ye(e, t) {
	return e.reduce((e, n, r) => (r % t === 0 ? e.push([n]) : ce(e)?.push(n), e), []);
}
function be(e) {
	return e.reduce((e, t) => Array.isArray(t) ? e.concat(be(t)) : e.concat(t), []);
}
function xe(e, t) {
	return e.reduce(([e, n], r) => (t(r) ? e.push(r) : n.push(r), [e, n]), [[], []]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/equal.mjs
var Se = (e) => e?.constructor.name === "Array", Ce = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!F(e[n], t[n])) return !1;
	return !0;
}, F = (e, t) => {
	if (Object.is(e, t)) return !0;
	if (e == null && t != null || e != null && t == null) return !1;
	if (typeof e?.isEqual == "function" && typeof t?.isEqual == "function") return e.isEqual(t);
	if (typeof e == "function" && typeof t == "function") return e.toString() === t.toString();
	if (Se(e) && Se(t)) return Ce(Array.from(e), Array.from(t));
	if (typeof e != "object" || typeof t != "object") return !1;
	let n = Object.keys(t ?? /* @__PURE__ */ Object.create(null)), r = n.length;
	for (let t = 0; t < r; t++) if (!Reflect.has(e, n[t])) return !1;
	for (let i = 0; i < r; i++) {
		let r = n[i];
		if (!F(e[r], t[r])) return !1;
	}
	return !0;
}, we = (e) => Array.isArray(e), Te = (e) => e === !0 || e === !1, Ee = (e) => typeof e == "object" && !!e, De = (e) => Ee(e) && !we(e), Oe = (e) => typeof e == "string", I = (e) => typeof e == "function", ke = (e) => e == null, Ae = (e, t) => Object.prototype.hasOwnProperty.call(e, t), je = (e) => Object.prototype.toString.call(e), Me = Function.prototype.toString, Ne = Me.call(Object), Pe = (e) => {
	if (!Ee(e) || je(e) != "[object Object]" || Le(e)) return !1;
	let t = Object.getPrototypeOf(e);
	if (t === null) return !0;
	let n = Ae(t, "constructor") && t.constructor;
	return typeof n == "function" && n instanceof n && Me.call(n) == Ne;
}, Fe = (e) => typeof e == "object" && !!e && "$$typeof" in e && "props" in e, Ie = (e) => typeof e == "object" && !!e && "__v_isVNode" in e, Le = (e) => Fe(e) || Ie(e), Re = (e, ...t) => (typeof e == "function" ? e(...t) : e) ?? void 0, ze = (e) => e, Be = (e) => e(), Ve = () => {}, He = (...e) => (...t) => {
	e.forEach(function(e) {
		e?.(...t);
	});
}, Ue = /* @__PURE__ */ (() => {
	let e = 0;
	return () => (e++, e.toString(36));
})();
function We(e, t, ...n) {
	if (e in t) {
		let r = t[e];
		return I(r) ? r(...n) : r;
	}
	let r = /* @__PURE__ */ Error(`No matching key: ${JSON.stringify(e)} in ${JSON.stringify(Object.keys(t))}`);
	throw Error.captureStackTrace?.(r, We), r;
}
var Ge = (e) => String.fromCharCode(e + (e > 25 ? 39 : 97));
function Ke(e) {
	let t = "", n;
	for (n = Math.abs(e); n > 52; n = n / 52 | 0) t = Ge(n % 52) + t;
	return Ge(n % 52) + t;
}
function qe(e, t) {
	let n = t.length;
	for (; n;) e = e * 33 ^ t.charCodeAt(--n);
	return e;
}
var Je = (e) => Ke(qe(5381, e) >>> 0), { floor: Ye, abs: Xe, round: Ze, min: Qe, max: $e, pow: et, sign: tt } = Math, nt = (e) => Number.isNaN(e), L = (e) => nt(e) ? 0 : e, rt = (e, t) => (e % t + t) % t, it = (e, t) => L(e) >= t, at = (e, t) => L(e) <= t, ot = (e, t, n) => {
	let r = L(e);
	return (t == null || r >= t) && (n == null || r <= n);
}, R = (e, t, n) => Qe($e(L(e), t), n), st = (e, t) => typeof t == "number" ? Ye(e * t + .5) / t : Ze(e), ct = (e) => {
	if (!Number.isFinite(e)) return 0;
	let t = 1, n = 0;
	for (; Math.round(e * t) / t !== e;) t *= 10, n += 1;
	return n;
}, lt = (e, t, n) => {
	let r = t === "+" ? e + n : e - n;
	if (e % 1 != 0 || n % 1 != 0) {
		let i = 10 ** Math.max(ct(e), ct(n));
		e = Math.round(e * i), n = Math.round(n * i), r = t === "+" ? e + n : e - n, r /= i;
	}
	return r;
}, ut = (e, t) => lt(L(e), "+", t), dt = (e, t) => lt(L(e), "-", t), ft = (e) => typeof e == "number" ? `${e}px` : e;
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/object.mjs
function pt(e) {
	if (!Pe(e) || e === void 0) return e;
	let t = Reflect.ownKeys(e).filter((e) => typeof e == "string"), n = {};
	for (let r of t) {
		let t = e[r];
		t !== void 0 && (n[r] = pt(t));
	}
	return n;
}
function mt(e, t) {
	if (!t) return e;
	let n = { ...e }, r = t;
	for (let e in r) {
		let t = r[e];
		t !== void 0 && (n[e] = t);
	}
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/warning.mjs
function ht(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	(e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production" && console.warn(t);
}
function gt(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	if ((e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production") throw Error(t);
}
function _t(e, t) {
	if (e == null) throw Error(t());
}
function vt(e, t, n) {
	let r = [];
	for (let n of t) e[n] ?? r.push(n);
	if (r.length > 0) throw Error(`[zag-js${n ? ` > ${n}` : ""}] missing required props: ${r.join(", ")}`);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/merge-props.mjs
var yt = (...e) => e.map((e) => e?.trim?.()).filter(Boolean).join(" "), bt = (...e) => Array.from(new Set(yt(...e).split(/\s+/).filter(Boolean))).join(" "), xt = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, St = (e) => {
	let t = {}, n;
	for (; n = xt.exec(e);) t[n[1]] = n[2];
	return t;
}, Ct = (e, t) => {
	if (Oe(e)) {
		if (Oe(t)) return `${e};${t}`;
		e = St(e);
	} else Oe(t) && (t = St(t));
	return Object.assign({}, e ?? {}, t ?? {});
};
function wt(...e) {
	let t = {};
	for (let n of e) {
		if (!n) continue;
		for (let e in t) {
			if (e.startsWith("on") && typeof t[e] == "function" && typeof n[e] == "function") {
				t[e] = He(n[e], t[e]);
				continue;
			}
			if (e === "className" || e === "class") {
				t[e] = yt(t[e], n[e]);
				continue;
			}
			if (e === "style") {
				t[e] = Ct(t[e], n[e]);
				continue;
			}
			if (e === "data-ownedby") {
				t[e] = bt(t[e], n[e]);
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
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/state.mjs
var z = ".", Tt = "#", Et = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap();
function Ot(e) {
	return e.join(z);
}
function kt(e) {
	return e.includes(z);
}
function At(e) {
	return e.startsWith(Tt);
}
function jt(e) {
	return e.startsWith(z);
}
function Mt(e) {
	return At(e) ? e.slice(Tt.length) : e;
}
function Nt(e, t) {
	return e ? `${e}${z}${t}` : t;
}
function Pt(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e, i) => {
		t.set(e, i);
		let a = i.id;
		a && (n.has(a) && gt(`[zag-js] Duplicate state id: "${a}"`), n.set(a, e));
		let o = i.states;
		if (o) {
			_t(i.initial, () => `[zag-js] Compound state "${e}" has child states but no "initial" property`), i.initial in o || gt(`[zag-js] Compound state "${e}" has initial "${String(i.initial)}" which is not a child state`);
			for (let [t, n] of Object.entries(o)) {
				if (!n) continue;
				let i = Nt(e, t);
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
function Ft(e) {
	let t = Et.get(e);
	if (t) return t;
	let { index: n, idIndex: r } = Pt(e);
	return Et.set(e, n), Dt.set(e, r), n;
}
function It(e, t) {
	return Ft(e), Dt.get(e)?.get(t);
}
function Lt(e) {
	return e ? String(e).split(z).filter(Boolean) : [];
}
function Rt(e, t) {
	if (!t) return [];
	let n = Ft(e), r = Lt(t), i = [], a = [];
	for (let e of r) {
		a.push(e);
		let t = Ot(a), r = n.get(t);
		if (!r) break;
		i.push({
			path: t,
			state: r
		});
	}
	return i;
}
function zt(e, t) {
	let n = Ft(e), r = Lt(t);
	if (!r.length) return t;
	let i = [];
	for (let e of r) {
		i.push(e);
		let r = Ot(i);
		if (!n.has(r)) return t;
	}
	let a = Ot(i), o = n.get(a);
	for (; o?.initial;) {
		let e = `${a}${z}${o.initial}`, t = n.get(e);
		if (!t) break;
		a = e, o = t;
	}
	return a;
}
function Bt(e, t) {
	return Ft(e).has(t);
}
function Vt(e, t, n) {
	let r = String(t);
	if (At(r)) {
		let t = Mt(r), n = It(e, t);
		return _t(n, () => `[zag-js] Unknown state id: "${t}"`), zt(e, n);
	}
	if (jt(r) && n) return zt(e, Nt(n, r.slice(1)));
	if (!kt(r) && n) {
		let t = Lt(n);
		for (let n = t.length - 1; n >= 1; n--) {
			let i = Nt(t.slice(0, n).join(z), r);
			if (Bt(e, i)) return zt(e, i);
		}
		if (Bt(e, r)) return zt(e, r);
	}
	return zt(e, r);
}
function Ht(e, t, n) {
	let r = Rt(e, t);
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
function Ut(e, t, n, r) {
	let i = t ? Rt(e, t) : [], a = Rt(e, n), o = 0;
	for (; o < i.length && o < a.length && i[o]?.path === a[o]?.path;) o += 1;
	let s = i.slice(o).reverse(), c = a.slice(o), l = i[i.length - 1]?.path === a[a.length - 1]?.path;
	return r && l && (s = i.slice().reverse(), c = a), {
		exiting: s,
		entering: c
	};
}
function Wt(e, t) {
	return e ? e === t || e.startsWith(`${t}${z}`) : !1;
}
function Gt(e, t, n) {
	return Rt(e, t).some((e) => e.state.tags?.includes(n));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/create-machine.mjs
function Kt() {
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
function qt(e) {
	return Ft(e), e;
}
function Jt() {
	return {
		guards: Kt(),
		createMachine: (e) => qt(e),
		choose: (e) => function({ choose: t }) {
			return t(e)?.actions;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/types.mjs
var B = /* @__PURE__ */ ((e) => (e.NotStarted = "Not Started", e.Started = "Started", e.Stopped = "Stopped", e))(B || {}), Yt = "__init__", Xt = Object.defineProperty, Zt = (e, t, n) => t in e ? Xt(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, Qt = (e, t, n) => Zt(e, typeof t == "symbol" ? t : t + "", n), $t = (e) => Math.max(0, Math.min(1, e)), en = (e, t) => e.map((n, r) => e[(Math.max(t, 0) + r) % e.length]), tn = () => void 0, nn = (e) => typeof e == "object" && !!e, rn = 2147483647, V = (e) => e ? "" : void 0, an = (e) => e ? "true" : void 0, on = /\\/g, sn = /"/g, cn = (e) => globalThis.CSS?.escape?.(e) ?? e.replace(on, "\\\\").replace(sn, "\\\""), H = (e) => `[data-ownedby~="${cn(String(e))}"]`, ln = 1, un = 9, dn = 11, U = (e) => nn(e) && e.nodeType === ln && typeof e.nodeName == "string", fn = (e) => nn(e) && e.nodeType === un, pn = (e) => nn(e) && e === e.window, mn = (e) => U(e) ? e.localName || "" : "#document";
function hn(e) {
	return [
		"html",
		"body",
		"#document"
	].includes(mn(e));
}
var gn = (e) => nn(e) && e.nodeType !== void 0, W = (e) => gn(e) && e.nodeType === dn && "host" in e, _n = (e) => U(e) && e.localName === "input", vn = (e) => !!e?.matches("a[href]"), yn = (e) => U(e) ? e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0 : !1;
function bn(e) {
	return e ? Dn(e.getRootNode()) === e : !1;
}
var xn = /(textarea|select)/;
function Sn(e) {
	if (e == null || !U(e)) return !1;
	try {
		return _n(e) && e.selectionStart != null || xn.test(e.localName) || e.isContentEditable || e.getAttribute("contenteditable") === "true" || e.getAttribute("contenteditable") === "";
	} catch {
		return !1;
	}
}
function Cn(e, t) {
	if (!e || !t || !U(e) || !gn(t)) return !1;
	if (U(t) && e === t || e.contains(t)) return !0;
	let n = t.getRootNode?.();
	if (n && W(n)) {
		let n = t;
		for (; n;) {
			if (e === n) return !0;
			n = n.parentNode || n.host;
		}
	}
	return !1;
}
function wn(e) {
	return fn(e) ? e : pn(e) ? e.document : e?.ownerDocument ?? document;
}
function Tn(e) {
	return wn(e).documentElement;
}
function En(e) {
	return W(e) ? En(e.host) : fn(e) ? e.defaultView ?? window : U(e) ? e.ownerDocument?.defaultView ?? window : window;
}
function Dn(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (!e || e === t) break;
		t = e;
	}
	return t;
}
function On(e) {
	if (mn(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || W(e) && e.host || Tn(e);
	return W(t) ? t.host : t;
}
function kn(e) {
	let t;
	try {
		if (t = e.getRootNode({ composed: !0 }), fn(t) || W(t)) return t;
	} catch {}
	return e.ownerDocument ?? document;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/computed-style.mjs
var An = /* @__PURE__ */ new WeakMap();
function jn(e) {
	return An.has(e) || An.set(e, En(e).getComputedStyle(e)), An.get(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/platform.mjs
var Mn = () => typeof document < "u";
function Nn() {
	return navigator.userAgentData?.platform ?? navigator.platform;
}
function Pn() {
	let e = navigator.userAgentData;
	return e && Array.isArray(e.brands) ? e.brands.map(({ brand: e, version: t }) => `${e}/${t}`).join(" ") : navigator.userAgent;
}
var Fn = (e) => Mn() && e.test(Nn()), In = (e) => Mn() && e.test(Pn()), Ln = (e) => Mn() && e.test(navigator.vendor), Rn = /^iPhone/i, zn = /^iPad/i, Bn = /^Mac/i, Vn = /apple/i, Hn = /Firefox/i, Un = /Android/i, Wn = () => Mn() && !!navigator.maxTouchPoints, Gn = () => Fn(Rn), Kn = () => Fn(zn) || Yn() && navigator.maxTouchPoints > 1, qn = () => Gn() || Kn(), Jn = () => Yn() || qn(), Yn = () => Fn(Bn), Xn = () => Jn() && Ln(Vn), Zn = () => In(Hn), Qn = () => In(Un);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/event.mjs
function $n(e) {
	return e.composedPath?.() ?? e.nativeEvent?.composedPath?.();
}
function er(e) {
	return $n(e)?.[0] ?? e.target;
}
function tr(e) {
	let t = e.currentTarget;
	if (!t || !t.matches("a[href], button[type='submit'], input[type='submit']")) return !1;
	let n = e.button === 1, r = ir(e);
	return n || r;
}
function nr(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let n = t.localName;
	return e.altKey ? n === "a" || n === "button" && t.type === "submit" || n === "input" && t.type === "submit" : !1;
}
function rr(e) {
	return mr(e).isComposing || e.keyCode === 229;
}
function ir(e) {
	return Yn() ? e.metaKey : e.ctrlKey;
}
function ar(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function or(e) {
	return e.pointerType === "" && e.isTrusted ? !0 : Qn() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
var sr = (e) => e.button === 0, cr = (e) => e.button === 2 || Yn() && e.ctrlKey && e.button === 0, lr = (e) => e.ctrlKey || e.altKey || e.metaKey, ur = (e) => "touches" in e && e.touches.length > 0, dr = {
	Up: "ArrowUp",
	Down: "ArrowDown",
	Esc: "Escape",
	" ": "Space",
	",": "Comma",
	Left: "ArrowLeft",
	Right: "ArrowRight"
}, fr = {
	ArrowLeft: "ArrowRight",
	ArrowRight: "ArrowLeft"
};
function pr(e, t = {}) {
	let { dir: n = "ltr", orientation: r = "horizontal" } = t, i = e.key;
	return i = dr[i] ?? i, n === "rtl" && r === "horizontal" && i in fr && (i = fr[i]), i;
}
function mr(e) {
	return e.nativeEvent ?? e;
}
var hr = /* @__PURE__ */ new Set(["PageUp", "PageDown"]), gr = /* @__PURE__ */ new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
function _r(e, t) {
	let { step: n, largeStep: r, smallStep: i } = t, a = gr.has(e.key);
	return i != null && e.altKey && a ? i : hr.has(e.key) || e.shiftKey && a ? r : n;
}
function vr(e, t = "client") {
	let n = ur(e) ? e.touches[0] || e.changedTouches[0] : e;
	return {
		x: n[`${t}X`],
		y: n[`${t}Y`]
	};
}
var G = (e, t, n, r) => {
	let i = typeof e == "function" ? e() : e;
	return i?.addEventListener(t, n, r), () => {
		i?.removeEventListener(t, n, r);
	};
}, yr = class e {
	constructor() {
		Qt(this, "id", null), Qt(this, "fn_cleanup"), Qt(this, "cleanup", () => {
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
function br(e) {
	let t = yr.create();
	return t.request(e), t.cleanup;
}
function xr(e) {
	let t = /* @__PURE__ */ new Set();
	function n(e) {
		let n = globalThis.requestAnimationFrame(e);
		t.add(() => globalThis.cancelAnimationFrame(n));
	}
	return n(() => n(e)), function() {
		t.forEach((e) => e());
	};
}
function Sr(e, t, n) {
	let r = br(() => {
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
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/text-selection.mjs
var K = "default", Cr = "", wr = /* @__PURE__ */ new WeakMap();
function Tr(e = {}) {
	let { target: t, doc: n } = e, r = n ?? document, i = r.documentElement;
	return qn() ? (K === "default" && (Cr = i.style.webkitUserSelect, i.style.webkitUserSelect = "none"), K = "disabled") : t && (wr.set(t, t.style.userSelect), t.style.userSelect = "none"), () => Er({
		target: t,
		doc: r
	});
}
function Er(e = {}) {
	let { target: t, doc: n } = e, r = (n ?? document).documentElement;
	if (qn()) {
		if (K !== "disabled") return;
		K = "restoring", setTimeout(() => {
			xr(() => {
				K === "restoring" && (r.style.webkitUserSelect === "none" && (r.style.webkitUserSelect = Cr || ""), Cr = "", K = "default");
			});
		}, 300);
	} else if (t && wr.has(t)) {
		let e = wr.get(t);
		t.style.userSelect === "none" && (t.style.userSelect = e ?? ""), t.getAttribute("style") === "" && t.removeAttribute("style"), wr.delete(t);
	}
}
function Dr(e = {}) {
	let { defer: t, target: n, ...r } = e, i = t ? br : (e) => e(), a = [];
	return a.push(i(() => {
		let e = typeof n == "function" ? n() : n;
		a.push(Tr({
			...r,
			target: e
		}));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/pointer-move.mjs
function Or(e, t) {
	let { onPointerMove: n, onPointerUp: r } = t, i = (e) => {
		let t = vr(e);
		if (!(Math.sqrt(t.x ** 2 + t.y ** 2) < (e.pointerType === "touch" ? 10 : 5))) {
			if (e.pointerType === "mouse" && e.buttons === 0) {
				a(e);
				return;
			}
			n({
				point: t,
				event: e
			});
		}
	}, a = (e) => {
		let t = vr(e);
		r({
			point: t,
			event: e
		});
	}, o = [
		G(e, "pointermove", i, !1),
		G(e, "pointerup", a, !1),
		G(e, "pointercancel", a, !1),
		G(e, "contextmenu", a, !1),
		Dr({ doc: e })
	];
	return () => {
		o.forEach((e) => e());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/query.mjs
function kr(e, t) {
	return Array.from(e?.querySelectorAll(t) ?? []);
}
function q(e, t) {
	return e?.querySelector(t) ?? null;
}
var Ar = (e) => e.id;
function jr(e, t, n = Ar) {
	return e.find((e) => n(e) === t);
}
function Mr(e, t, n = Ar) {
	let r = jr(e, t, n);
	return r ? e.indexOf(r) : -1;
}
function Nr(e, t, n = !0) {
	let r = Mr(e, t);
	return r = n ? (r + 1) % e.length : Math.min(r + 1, e.length - 1), e[r];
}
function Pr(e, t, n = !0) {
	let r = Mr(e, t);
	return r === -1 ? n ? e[e.length - 1] : null : (r = n ? (r - 1 + e.length) % e.length : Math.max(0, r - 1), e[r]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/set.mjs
function Fr(e, t, n) {
	let r = e.getAttribute(t), i = r != null;
	return r === n ? tn : (e.setAttribute(t, n), () => {
		i ? e.setAttribute(t, r) : e.removeAttribute(t);
	});
}
function Ir(e, t) {
	if (!e) return tn;
	let n = Object.keys(t).reduce((t, n) => (t[n] = e.style.getPropertyValue(n), t), {});
	return Rr(n, t) ? tn : (Object.assign(e.style, t), () => {
		Object.assign(e.style, n), e.style.length === 0 && e.removeAttribute("style");
	});
}
function Lr(e, t, n) {
	if (!e) return tn;
	let r = e.style.getPropertyValue(t);
	return r === n ? tn : (e.style.setProperty(t, n), () => {
		e.style.setProperty(t, r), e.style.length === 0 && e.removeAttribute("style");
	});
}
function Rr(e, t) {
	return Object.keys(e).every((n) => e[n] === t[n]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/scope.mjs
function zr(e) {
	let t = () => e.getRootNode?.() ?? document, n = () => wn(t()), r = () => n().defaultView ?? window, i = () => Dn(t()), a = (e) => t().getElementById(e);
	return {
		...e,
		getRootNode: t,
		getDoc: n,
		getWin: r,
		getActiveElement: i,
		isActiveElement: bn,
		getById: a
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+types@1.43.3/node_modules/@zag-js/types/dist/prop-types.mjs
function Br(e) {
	return new Proxy({}, { get(t, n) {
		return n === "style" ? (t) => e({ style: t }).style : e;
	} });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/normalize-props.js
var Vr = {
	className: "class",
	defaultChecked: "checked",
	defaultValue: "value",
	htmlFor: "for",
	onBlur: "onfocusout",
	onChange: "oninput",
	onFocus: "onfocusin",
	onDoubleClick: "ondblclick"
};
function Hr(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		r != null && (n.startsWith("--") || (n = n.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)), t += `${n}:${r};`);
	}
	return t;
}
var Ur = new Set("viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(","));
function Wr(e) {
	return e in Vr ? Vr[e] : Ur.has(e) ? e : e.toLowerCase();
}
function Gr(e, t) {
	return e === "style" && typeof t == "object" ? Hr(t) : t;
}
var Kr = Br((e) => {
	let t = {};
	for (let n in e) t[Wr(n)] = Gr(n, e[n]);
	return t;
}), qr = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, Jr = (e) => {
	let t = {}, n;
	for (; n = qr.exec(e);) t[n[1]] = n[2];
	return t;
};
function J(...e) {
	let t = [];
	for (let n of e) n && "class" in n && n.class != null && t.push(n.class);
	let n = wt(...e);
	return t.length > 0 && (n.class = t.length === 1 ? t[0] : t), "style" in n && (typeof n.style == "string" && (n.style = Jr(n.style)), n.style = Hr(n.style)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/bindable.svelte.js
function Yr(e) {
	let t = e().value ?? e().defaultValue, r = e().isEqual ?? Object.is, i = w(O(t)), a = n(() => e().value !== void 0), o = { current: ne(() => S(i)) }, s = { current: void 0 };
	T(() => {
		let t = S(a) ? e().value : S(i);
		o = { current: t }, s = { current: t };
	});
	let c = (t) => {
		let n = I(t) ? t(o.current) : t, c = s.current;
		e().debug && console.log(`[bindable > ${e().debug}] setValue`, {
			next: n,
			prev: c
		}), S(a) || ie(i, n, !0), r(n, c) || e().onChange?.(n, c);
	};
	function l() {
		return S(a) ? e().value : S(i);
	}
	return {
		initial: t,
		ref: o,
		get: l,
		set(t) {
			let n = e().sync ? m : Be;
			ne(() => n(() => c(t)));
		},
		invoke(t, n) {
			e().onChange?.(t, n);
		},
		hash(t) {
			return e().hash?.(t) ?? String(t);
		}
	};
}
Yr.cleanup = (e) => {
	s(() => e());
}, Yr.ref = (e) => {
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
function Xr(e) {
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
var Zr = (e) => typeof e == "function" ? e() : e, Qr = (e, t) => {
	let n = [], r = !0;
	re(() => {
		if (r) {
			n = e.map((e) => Zr(e)), r = !1;
			return;
		}
		let i = !1;
		for (let t = 0; t < e.length; t++) if (!F(n[t], Zr(e[t]))) {
			i = !0;
			break;
		}
		i && (n = e.map((e) => Zr(e)), t());
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/machine.svelte.js
function $r(e) {
	return I(e) ? e() : e;
}
function ei(e, t) {
	let r = n(() => {
		let { id: e, ids: n, getRootNode: r } = $r(t);
		return zr({
			id: e,
			ids: n,
			getRootNode: r
		});
	}), i = (...t) => {
		e.debug && console.log(...t);
	}, a = n(() => e.props?.({
		props: pt($r(t)),
		scope: S(r)
	}) ?? $r(t)), o = ti(() => S(a)), c = e.context?.({
		prop: o,
		bindable: Yr,
		get scope() {
			return S(r);
		},
		flush: ni,
		getContext() {
			return l;
		},
		getComputed() {
			return w;
		},
		getRefs() {
			return _;
		},
		getEvent() {
			return h();
		}
	}), l = {
		get(e) {
			return c?.[e].get();
		},
		set(e, t) {
			c?.[e].set(t);
		},
		initial(e) {
			return c?.[e].initial;
		},
		hash(e) {
			let t = c?.[e].get();
			return c?.[e].hash(t);
		}
	}, d = /* @__PURE__ */ new Map(), f = { current: null }, p = { current: null }, m = { current: { type: "" } }, h = () => ({
		...m.current,
		current() {
			return m.current;
		},
		previous() {
			return p.current;
		}
	}), g = () => ({
		...T,
		hasTag(t) {
			return Gt(e, T.get(), t);
		},
		matches(...e) {
			let t = T.get();
			return e.some((e) => Wt(t, e));
		}
	}), _ = Xr(e.refs?.({
		prop: o,
		context: l
	}) ?? {}), v = () => ({
		state: g(),
		context: l,
		event: h(),
		prop: o,
		send: D,
		action: y,
		guard: b,
		track: Qr,
		refs: _,
		computed: w,
		flush: ni,
		scope: S(r),
		choose: C
	}), y = (t) => {
		let n = I(t) ? t(v()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.actions?.[t];
			return n || ht(`[zag-js] No implementation found for action "${JSON.stringify(t)}"`), n;
		});
		for (let e of r) e?.(v());
	}, b = (t) => {
		if (I(t)) return t(v());
		let n = e.implementations?.guards?.[t];
		return n || ht(`[zag-js] No implementation found for guard "${JSON.stringify(t)}"`), n?.(v());
	}, x = (t) => {
		let n = I(t) ? t(v()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.effects?.[t];
			return n || ht(`[zag-js] No implementation found for effect "${JSON.stringify(t)}"`), n;
		}), i = [];
		for (let e of r) {
			let t = e?.(v());
			t && i.push(t);
		}
		return () => i.forEach((e) => e?.());
	}, C = (e) => oe(e).find((e) => {
		let t = !e.guard;
		return Oe(e.guard) ? t = !!b(e.guard) : I(e.guard) && (t = e.guard(v())), t;
	}), w = (t) => {
		_t(e.computed, () => "[zag-js] No computed object found on machine");
		let n = e.computed[t];
		return n({
			context: l,
			event: h(),
			prop: o,
			refs: _,
			scope: S(r),
			computed: w
		});
	}, T = Yr(() => ({
		defaultValue: Vt(e, e.initialState({ prop: o })),
		onChange(t, n) {
			let { exiting: r, entering: i } = Ut(e, n, t, f.current?.reenter);
			if (r.forEach((e) => {
				d.get(e.path)?.(), d.delete(e.path);
			}), r.forEach((e) => {
				y(e.state?.exit);
			}), y(f.current?.actions), i.forEach((e) => {
				let t = x(e.state?.effects);
				if (t) {
					let n = d.get(e.path);
					d.set(e.path, n ? He(n, t) : t);
				}
			}), n === "__init__") {
				y(e.entry);
				let t = x(e.effects);
				if (t) {
					let e = d.get(Yt);
					d.set(Yt, e ? He(e, t) : t);
				}
			}
			i.forEach((e) => {
				y(e.state?.entry);
			});
		}
	})), E = B.NotStarted;
	u(() => {
		let e = E === B.Started;
		E = B.Started, i(e ? "rehydrating..." : "initializing..."), T.invoke(T.initial, Yt);
	}), s(() => {
		E === B.Started && (i("unmounting..."), E = B.Stopped, d.forEach((e) => e?.()), d = /* @__PURE__ */ new Map(), f.current = null, y(e.exit));
	});
	let D = (t) => {
		if (E !== B.Started) return;
		p.current = m.current, m.current = t;
		let n = T.get(), { transitions: r, source: a } = Ht(e, n, t.type), o = C(r);
		if (!o) return;
		f.current = o;
		let s = Vt(e, o.target ?? n, a);
		i("transition", t.type, o.target || n, `(${o.actions})`), s === n ? o.reenter ? T.invoke(n, n) : y(o.actions) : T.set(s);
	};
	return e.watch?.(v()), {
		get state() {
			return g();
		},
		send: D,
		context: l,
		prop: o,
		get scope() {
			return S(r);
		},
		refs: _,
		computed: w,
		get event() {
			return h();
		},
		getStatus: () => E
	};
}
function ti(e) {
	return function(t) {
		return e()[t];
	};
}
function ni(e) {
	m(() => {
		queueMicrotask(() => e());
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/tags.js
var ri = [
	"path",
	"rect",
	"circle",
	"ellipse",
	"line",
	"polygon",
	"polyline"
], ii = (e) => typeof e == "string" && ri.includes(e), ai = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link"
], oi = (e) => typeof e == "string" && ai.includes(e), si = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"as",
	"ref"
]);
function ci(e, n) {
	p(n, !0);
	let i = x(n, "as", 7), a = x(n, "ref", 15, null), o = N(n, si);
	var s = {
		get as() {
			return i();
		},
		set as(e) {
			i(e), m();
		},
		get ref() {
			return a();
		},
		set ref(e = null) {
			a(e), m();
		}
	}, l = v(), u = j(l);
	return c(u, i, !0, (e, n) => {
		C(e, (e) => a(e), () => a()), t(e, () => ({ ...o }));
	}), y(e, l), r(s);
}
D(ci, {
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/factory/factory.svelte
var li = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"asChild",
	"children",
	"as",
	"ref"
]), ui = b("<textarea></textarea>");
function Y(e, i) {
	p(i, !0);
	let a = x(i, "asChild", 7), s = x(i, "children", 7), l = x(i, "as", 7), u = x(i, "ref", 15, null), d = N(i, li), f = (e) => J(d, e ?? {});
	var h = {
		get asChild() {
			return a();
		},
		set asChild(e) {
			a(e), m();
		},
		get children() {
			return s();
		},
		set children(e) {
			s(e), m();
		},
		get as() {
			return l();
		},
		set as(e) {
			l(e), m();
		},
		get ref() {
			return u();
		},
		set ref(e = null) {
			u(e), m();
		}
	}, g = v(), b = j(g), w = (e) => {
		var t = v(), n = j(t);
		M(n, () => a() ?? o, () => f), y(e, t);
	}, T = (e) => {
		ci(e, P({ get as() {
			return l();
		} }, () => d, {
			get ref() {
				return u();
			},
			set ref(e) {
				u(e);
			}
		}));
	}, E = n(() => ii(l())), D = (e) => {
		var n = v(), r = j(n);
		c(r, l, !1, (e, n) => {
			C(e, (e) => u(e), () => u()), t(e, () => ({ ...d }));
		}), y(e, n);
	}, O = n(() => oi(l())), k = (e) => {
		var n = ui();
		ae(n), t(n, () => ({ ...d })), C(n, (e) => u(e), () => u()), y(e, n);
	}, ee = (e) => {
		var n = v(), r = j(n);
		c(r, l, !1, (e, n) => {
			C(e, (e) => u(e), () => u()), t(e, () => ({ ...d }));
			var r = v(), i = j(r);
			M(i, () => s() ?? o), y(n, r);
		}), y(e, n);
	};
	return _(b, (e) => {
		a() ? e(w) : S(E) ? e(T, 1) : S(O) ? e(D, 2) : l() === "textarea" ? e(k, 3) : e(ee, -1);
	}), y(e, g), r(h);
}
D(Y, {
	asChild: {},
	children: {},
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-context.js
function di(e, t) {
	return `${e} returned \`undefined\`. Seems you forgot to wrap component within ${t}`;
}
var fi = (e) => {
	let { name: t, strict: n = !0, hookName: r = "useContext", providerName: a = "Provider", errorMessage: o, defaultValue: s } = e, c = Symbol(t);
	return [
		(e) => A(c, e),
		() => {
			let e = i(c);
			if (n && !e) throw Error(o ?? di(r, a));
			return e ? g(c) : s;
		},
		c
	];
}, pi = () => (e, t) => t.reduce((e, t) => {
	let [n, r] = e, i = t;
	return r[i] !== void 0 && (n[i] = r[i]), delete r[i], [n, r];
}, [{}, { ...e }]), X = (e, t = []) => ({
	parts: (...n) => {
		if (hi(t)) return X(e, n);
		throw Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
	},
	extendWith: (...n) => X(e, [...t, ...n]),
	omit: (...n) => X(e, t.filter((e) => !n.includes(e))),
	rename: (e) => X(e, t),
	keys: () => t,
	build: () => [...new Set(t)].reduce((t, n) => Object.assign(t, { [n]: {
		selector: [`&[data-scope="${mi(e)}"][data-part="${mi(n)}"]`, `& [data-scope="${mi(e)}"][data-part="${mi(n)}"]`].join(", "),
		attrs: {
			"data-scope": mi(e),
			"data-part": mi(n)
		}
	} }), {})
}), mi = (e) => e.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase(), hi = (e) => e.length === 0, gi = (e) => typeof e == "function", _i = (e, ...t) => gi(e) ? e(...t) : e, [vi, yi] = fi({
	name: "EnvironmentContext",
	strict: !1,
	defaultValue: () => ({
		getRootNode: () => document,
		getDocument: () => document,
		getWindow: () => window
	})
}), bi = b("<span hidden=\"\"></span>"), xi = b("<!> <!>", 1);
function Si(e, t) {
	p(t, !0);
	let i = x(t, "value", 7), a = x(t, "children", 7), s = w(null), c = () => _i(i()) ?? S(s)?.ownerDocument ?? document, l = n(() => ({
		getRootNode: c,
		getDocument: () => wn(c()),
		getWindow: () => En(c())
	}));
	vi(() => S(l));
	var u = {
		get value() {
			return i();
		},
		set value(e) {
			i(e), m();
		},
		get children() {
			return a();
		},
		set children(e) {
			a(e), m();
		}
	}, d = xi(), f = j(d);
	M(f, () => a() ?? o);
	var h = k(f, 2), g = (e) => {
		var t = bi();
		C(t, (e) => ie(s, e), () => S(s)), y(e, t);
	};
	return _(h, (e) => {
		i() || e(g);
	}), y(e, d), r(u);
}
D(Si, {
	value: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/providers/locale/use-locale-context.js
var [Ci, wi] = fi({
	name: "LocaleContext",
	strict: !1,
	defaultValue: () => ({
		dir: "ltr",
		locale: "en-US"
	})
}), [Ti, Ei] = fi({
	name: "ScrollAreaContext",
	hookName: "useScrollAreaContext",
	providerName: "<ScrollAreaProvider />"
}), Di = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Oi(e, t) {
	p(t, !0);
	let i = x(t, "ref", 15, null), a = N(t, Di), o = Ei(), s = n(() => J(o().getContentProps(), a));
	return Y(e, P({ as: "div" }, () => S(s), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), r({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), m();
		}
	});
}
D(Oi, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/scroll-area-corner.svelte
var ki = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ai(e, t) {
	p(t, !0);
	let i = x(t, "ref", 15, null), a = N(t, ki), o = Ei(), s = n(() => J(o().getCornerProps(), a));
	return Y(e, P({ as: "div" }, () => S(s), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), r({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), m();
		}
	});
}
D(Ai, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/chunk-QZ7TP4HQ.mjs
var ji = Object.defineProperty, Mi = (e, t, n) => t in e ? ji(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, Ni = (e, t, n) => Mi(e, typeof t == "symbol" ? t : t + "", n), Pi = X("scroll-area").parts("root", "viewport", "content", "scrollbar", "thumb", "corner").build(), Z = (e) => e.ids?.root ?? `scroll-area-${e.id}`, Fi = (e) => e.ids?.viewport ?? `scroll-area-${e.id}:viewport`, Ii = (e) => e.ids?.content ?? `scroll-area-${e.id}:content`, Li = (e) => e.getById(Z(e)), Q = (e) => e.getById(Fi(e)), Ri = (e) => e.getById(Ii(e)), zi = (e) => q(Li(e), `[data-part=scrollbar][data-orientation=horizontal]${H(Z(e))}`), Bi = (e) => q(Li(e), `[data-part=scrollbar][data-orientation=vertical]${H(Z(e))}`), Vi = (e) => q(zi(e), `[data-part=thumb][data-orientation=horizontal]${H(Z(e))}`), Hi = (e) => q(Bi(e), `[data-part=thumb][data-orientation=vertical]${H(Z(e))}`), Ui = (e) => q(Li(e), `[data-part=corner]${H(Z(e))}`);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-progress.mjs
function Wi(e, t) {
	if (!e) return Gi;
	let n = 0, r = 0, i = e.scrollWidth - e.clientWidth;
	i > t && (n = Math.min(1, Math.max(0, e.scrollLeft / i)));
	let a = e.scrollHeight - e.clientHeight;
	return a > t && (r = Math.min(1, Math.max(0, e.scrollTop / a))), {
		x: n,
		y: r
	};
}
var Gi = {
	x: 0,
	y: 0
}, Ki = 300, qi = (e) => e * (2 - e);
function Ji(e, t = {}) {
	let { top: n, left: r, duration: i = Ki, easing: a = qi, onComplete: o } = t;
	if (!e) return;
	let s = {
		startTime: 0,
		startScrollTop: e.scrollTop,
		startScrollLeft: e.scrollLeft,
		targetScrollTop: n ?? e.scrollTop,
		targetScrollLeft: r ?? e.scrollLeft
	}, c = !1, l = () => {
		s.rafId &&= (cancelAnimationFrame(s.rafId), void 0), c = !0;
	}, u = (t) => {
		if (c) return;
		s.startTime === 0 && (s.startTime = t);
		let n = t - s.startTime, r = Math.min(n / i, 1), l = a(r), d = s.targetScrollTop - s.startScrollTop, f = s.targetScrollLeft - s.startScrollLeft;
		e.scrollTop = s.startScrollTop + d * l, e.scrollLeft = s.startScrollLeft + f * l, r < 1 ? s.rafId = requestAnimationFrame(u) : o?.();
	};
	return s.rafId = requestAnimationFrame(u), l;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-to.mjs
function Yi(e, t = {}) {
	if (!e) return;
	let { top: n, left: r, behavior: i = "smooth", easing: a, duration: o } = t;
	if (i === "smooth") Ji(e, {
		top: n,
		left: r,
		easing: a,
		duration: o
	});
	else {
		let t = pt({
			behavior: i,
			top: n,
			left: r
		});
		e.scrollTo(t);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-to-edge.mjs
function Xi(e, t, n, r = "smooth", i, a) {
	if (!e) return;
	let o = e.scrollWidth - e.clientWidth, s = e.scrollHeight - e.clientHeight, c = n === "rtl", l, u;
	switch (t) {
		case "top":
			l = 0;
			break;
		case "bottom":
			l = s;
			break;
		case "left":
			u = c && e.scrollLeft <= 0 ? -o : 0;
			break;
		case "right": u = c && e.scrollLeft <= 0 ? 0 : o;
	}
	if (r === "smooth") Ji(e, {
		top: l,
		left: u,
		easing: i,
		duration: a
	});
	else {
		let t = pt({
			left: u,
			top: l,
			behavior: r
		});
		e.scrollTo(t);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/scroll-area.connect.mjs
function Zi(e, t) {
	let { state: n, send: r, context: i, prop: a, scope: o } = e, s = n.matches("dragging"), c = i.get("hovering"), l = i.get("cornerSize"), u = i.get("thumbSize"), d = i.get("hiddenState"), f = i.get("atSides");
	return {
		isAtTop: f.top,
		isAtBottom: f.bottom,
		isAtLeft: f.left,
		isAtRight: f.right,
		hasOverflowX: !d.scrollbarXHidden,
		hasOverflowY: !d.scrollbarYHidden,
		getScrollProgress() {
			return Wi(Q(o), 0);
		},
		scrollToEdge(e) {
			let { edge: t, behavior: n } = e;
			return Xi(Q(o), t, a("dir"), n);
		},
		scrollTo(e) {
			return Yi(Q(o), e);
		},
		getScrollbarState(e) {
			let t = e.orientation === "horizontal";
			return {
				hovering: c,
				dragging: s,
				scrolling: i.get(t ? "scrollingX" : "scrollingY"),
				hidden: t ? d.scrollbarXHidden : d.scrollbarYHidden
			};
		},
		getRootProps() {
			return t.element({
				...Pi.root.attrs,
				id: Z(o),
				dir: a("dir"),
				role: "presentation",
				"data-overflow-x": V(!d.scrollbarXHidden),
				"data-overflow-y": V(!d.scrollbarYHidden),
				onPointerEnter(e) {
					let t = er(e);
					Cn(e.currentTarget, t) && r({
						type: "root.pointerenter",
						pointerType: e.pointerType
					});
				},
				onPointerMove(e) {
					let t = er(e);
					Cn(e.currentTarget, t) && r({
						type: "root.pointerenter",
						pointerType: e.pointerType
					});
				},
				onPointerDown({ pointerType: e }) {
					r({
						type: "root.pointerdown",
						pointerType: e
					});
				},
				onPointerLeave(e) {
					Cn(e.currentTarget, e.relatedTarget) || r({ type: "root.pointerleave" });
				},
				style: {
					position: "relative",
					"--corner-width": ft(l?.width),
					"--corner-height": ft(l?.height),
					"--thumb-width": ft(u?.width),
					"--thumb-height": ft(u?.height)
				}
			});
		},
		getViewportProps() {
			let e = () => {
				r({ type: "user.scroll" });
			};
			return t.element({
				...Pi.viewport.attrs,
				role: "presentation",
				"data-ownedby": Z(o),
				id: Fi(o),
				"data-at-top": V(f.top),
				"data-at-bottom": V(f.bottom),
				"data-at-left": V(f.left),
				"data-at-right": V(f.right),
				"data-overflow-x": V(!d.scrollbarXHidden),
				"data-overflow-y": V(!d.scrollbarYHidden),
				tabIndex: d.scrollbarXHidden || d.scrollbarYHidden ? void 0 : 0,
				style: { overflow: "auto" },
				onScroll(e) {
					r({
						type: "viewport.scroll",
						target: e.currentTarget
					});
				},
				onWheel: e,
				onTouchMove: e,
				onPointerMove: e,
				onPointerEnter: e,
				onKeyDown: e
			});
		},
		getContentProps() {
			return t.element({
				...Pi.content.attrs,
				id: Ii(o),
				role: "presentation",
				"data-overflow-x": V(!d.scrollbarXHidden),
				"data-overflow-y": V(!d.scrollbarYHidden),
				style: { minWidth: "fit-content" }
			});
		},
		getScrollbarProps(e = {}) {
			let { orientation: n = "vertical" } = e;
			return t.element({
				...Pi.scrollbar.attrs,
				"data-ownedby": Z(o),
				"data-orientation": n,
				"data-scrolling": V(i.get(n === "horizontal" ? "scrollingX" : "scrollingY")),
				"data-hover": V(c),
				"data-dragging": V(s),
				"data-overflow-x": V(!d.scrollbarXHidden),
				"data-overflow-y": V(!d.scrollbarYHidden),
				onPointerUp() {
					r({
						type: "scrollbar.pointerup",
						orientation: n
					});
				},
				onPointerDown(e) {
					if (e.button !== 0 || e.currentTarget !== e.target) return;
					let t = vr(e);
					r({
						type: "scrollbar.pointerdown",
						orientation: n,
						point: t
					}), e.stopPropagation();
				},
				style: {
					position: "absolute",
					touchAction: "none",
					WebkitUserSelect: "none",
					userSelect: "none",
					...n === "vertical" && {
						top: 0,
						bottom: "var(--corner-height)",
						insetInlineEnd: 0
					},
					...n === "horizontal" && {
						insetInlineStart: 0,
						insetInlineEnd: "var(--corner-width)",
						bottom: 0
					}
				}
			});
		},
		getThumbProps(e = {}) {
			let { orientation: n = "vertical" } = e;
			return t.element({
				...Pi.thumb.attrs,
				"data-ownedby": Z(o),
				"data-orientation": n,
				"data-hover": V(c),
				"data-dragging": V(s),
				onPointerDown(e) {
					if (e.button !== 0) return;
					let t = vr(e);
					r({
						type: "thumb.pointerdown",
						orientation: n,
						point: t
					});
				},
				style: {
					...n === "vertical" && { height: "var(--thumb-height)" },
					...n === "horizontal" && { width: "var(--thumb-width)" }
				}
			});
		},
		getCornerProps() {
			return t.element({
				...Pi.corner.attrs,
				"data-ownedby": Z(o),
				"data-hover": V(c),
				"data-state": d.cornerHidden ? "hidden" : "visible",
				"data-overflow-x": V(!d.scrollbarXHidden),
				"data-overflow-y": V(!d.scrollbarYHidden),
				style: {
					position: "absolute",
					bottom: 0,
					insetInlineEnd: 0,
					width: "var(--corner-width)",
					height: "var(--corner-height)"
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-offset.mjs
function $(e, t, n) {
	if (!e) return 0;
	let r = jn(e), i = n === "x" ? "Inline" : "Block";
	return n === "x" && t === "margin" ? parseFloat(r[`${t}InlineStart`]) * 2 : parseFloat(r[`${t}${i}Start`]) + parseFloat(r[`${t}${i}End`]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-sides.mjs
function Qi(e, t) {
	let n = e.scrollTop, r = e.scrollLeft, i = t === "rtl", a = e.scrollHeight - e.clientHeight > 1, o = e.scrollWidth - e.clientWidth > 1, s = e.scrollWidth - e.clientWidth, c = e.scrollHeight - e.clientHeight, l = !1, u = !1, d = !1, f = !1;
	return o && (i && r <= 0 ? (l = Math.abs(r) >= s - 1, u = Math.abs(r) <= 1) : (l = r <= 1, u = r >= s - 1)), a && (d = n <= 1, f = n >= c - 1), {
		top: d,
		right: u,
		bottom: f,
		left: l
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/timeout.mjs
var $i = 0, ea = class {
	constructor() {
		Ni(this, "currentId", $i), Ni(this, "clear", () => {
			this.currentId !== $i && (clearTimeout(this.currentId), this.currentId = $i);
		}), Ni(this, "disposeEffect", () => this.clear);
	}
	start(e, t) {
		this.clear(), this.currentId = setTimeout(() => {
			this.currentId = $i, t();
		}, e);
	}
	isStarted() {
		return this.currentId !== $i;
	}
}, ta = 20, na = 1e3, ra = qt({
	props({ props: e }) {
		return vt(e, ["id"]), e;
	},
	context({ bindable: e }) {
		return {
			scrollingX: e(() => ({ defaultValue: !1 })),
			scrollingY: e(() => ({ defaultValue: !1 })),
			hovering: e(() => ({ defaultValue: !1 })),
			dragging: e(() => ({ defaultValue: !1 })),
			touchModality: e(() => ({ defaultValue: !1 })),
			atSides: e(() => ({ defaultValue: {
				top: !0,
				right: !1,
				bottom: !1,
				left: !0
			} })),
			cornerSize: e(() => ({ defaultValue: {
				width: 0,
				height: 0
			} })),
			thumbSize: e(() => ({ defaultValue: {
				width: 0,
				height: 0
			} })),
			hiddenState: e(() => ({
				defaultValue: {
					scrollbarYHidden: !1,
					scrollbarXHidden: !1,
					cornerHidden: !1
				},
				hash(e) {
					return `Y:${e.scrollbarYHidden} X:${e.scrollbarXHidden} C:${e.cornerHidden}`;
				}
			}))
		};
	},
	refs() {
		return {
			orientation: "vertical",
			scrollPosition: {
				x: 0,
				y: 0
			},
			scrollYTimeout: new ea(),
			scrollXTimeout: new ea(),
			scrollEndTimeout: new ea(),
			startX: 0,
			startY: 0,
			startScrollTop: 0,
			startScrollLeft: 0,
			programmaticScroll: !0
		};
	},
	initialState() {
		return "idle";
	},
	watch({ track: e, prop: t, context: n, send: r }) {
		e([() => t("dir"), () => n.hash("hiddenState")], () => {
			r({ type: "thumb.measure" });
		});
	},
	effects: [
		"trackContentResize",
		"trackViewportVisibility",
		"trackWheelEvent"
	],
	entry: ["checkHovering"],
	exit: ["clearTimeouts"],
	on: {
		"thumb.measure": { actions: ["setThumbSize"] },
		"viewport.scroll": { actions: [
			"setThumbSize",
			"setScrolling",
			"setProgrammaticScroll"
		] },
		"root.pointerenter": { actions: ["setTouchModality", "setHovering"] },
		"root.pointerdown": { actions: ["setTouchModality"] },
		"root.pointerleave": { actions: ["clearHovering"] }
	},
	states: {
		idle: { on: {
			"scrollbar.pointerdown": {
				target: "dragging",
				actions: ["scrollToPointer", "startDragging"]
			},
			"thumb.pointerdown": {
				target: "dragging",
				actions: ["startDragging"]
			}
		} },
		dragging: {
			effects: ["trackPointerMove"],
			on: {
				"thumb.pointermove": { actions: ["setDraggingScroll"] },
				"scrollbar.pointerup": {
					target: "idle",
					actions: ["stopDragging"]
				},
				"thumb.pointerup": {
					target: "idle",
					actions: ["clearScrolling", "stopDragging"]
				}
			}
		}
	},
	implementations: {
		actions: {
			setTouchModality({ context: e, event: t }) {
				e.set("touchModality", t.pointerType === "touch");
			},
			setHovering({ context: e }) {
				e.set("hovering", !0);
			},
			clearHovering({ context: e }) {
				e.set("hovering", !1);
			},
			setProgrammaticScroll({ refs: e }) {
				e.get("scrollEndTimeout").start(100, () => {
					e.set("programmaticScroll", !0);
				});
			},
			clearScrolling({ context: e, event: t }) {
				e.set(t.orientation === "vertical" ? "scrollingY" : "scrollingX", !1);
			},
			setThumbSize({ context: e, scope: t, prop: n }) {
				let r = Q(t);
				if (!r) return;
				let i = r.scrollHeight, a = r.scrollWidth;
				if (i === 0 || a === 0) return;
				let o = Bi(t), s = zi(t), c = Hi(t), l = Vi(t), u = r.clientHeight, d = r.clientWidth, f = r.scrollTop, p = r.scrollLeft, m = u >= i, h = d >= a, g = d / a, _ = u / i, v = h ? 0 : d, y = m ? 0 : u, b = $(s, "padding", "x"), x = $(o, "padding", "y"), S = $(l, "margin", "x"), C = $(c, "margin", "y"), w = v - b - S, T = y - x - C, E = s ? Math.min(s.offsetWidth, w) : w, D = o ? Math.min(o.offsetHeight, T) : T, O = Math.max(ta, E * g), k = Math.max(ta, D * _);
				if (e.set("thumbSize", (e) => e.height === k && e.width === O ? e : {
					width: O,
					height: k
				}), o && c) {
					let e = o.offsetHeight - k - x - C, t = f / (i - u), n = Math.min(e, Math.max(0, t * e));
					c.style.transform = `translate3d(0,${n}px,0)`;
				}
				if (s && l) {
					let e = s.offsetWidth - O - b - S, t = p / (a - d), r = n("dir") === "rtl" ? R(t * e, -e, 0) : R(t * e, 0, e);
					l.style.transform = `translate3d(${r}px,0,0)`;
				}
				if (Ui(t)) {
					if (h || m) e.set("cornerSize", {
						width: 0,
						height: 0
					});
					else if (!h && !m) {
						let t = o?.offsetWidth || 0, n = s?.offsetHeight || 0;
						e.set("cornerSize", {
							width: t,
							height: n
						});
					}
				}
				e.set("hiddenState", (e) => {
					let t = m || h;
					return e.scrollbarYHidden === m && e.scrollbarXHidden === h && e.cornerHidden === t ? e : {
						scrollbarYHidden: m,
						scrollbarXHidden: h,
						cornerHidden: t
					};
				}), e.set("atSides", (e) => {
					let t = Qi(r, n("dir"));
					return F(e, t) ? e : t;
				});
				let ee = Math.max(0, i - u), A = Math.max(0, a - d), te = 0, j = 0;
				h || (te = n("dir") === "rtl" ? R(-p, 0, A) : R(p, 0, A), j = A - te);
				let M = m ? 0 : R(f, 0, ee), ne = m ? 0 : ee - M;
				Lr(r, "--scroll-area-overflow-x-start", `${te}px`), Lr(r, "--scroll-area-overflow-x-end", `${j}px`), Lr(r, "--scroll-area-overflow-y-start", `${M}px`), Lr(r, "--scroll-area-overflow-y-end", `${ne}px`);
			},
			checkHovering({ scope: e, context: t }) {
				Q(e)?.matches(":hover") && t.set("hovering", !0);
			},
			setScrolling({ event: e, refs: t, context: n, prop: r }) {
				let i = {
					x: e.target.scrollLeft,
					y: e.target.scrollTop
				}, a = t.get("scrollPosition"), o = i.x - a.x, s = i.y - a.y;
				t.set("scrollPosition", i), n.set("atSides", (t) => {
					let n = Qi(e.target, r("dir"));
					return F(t, n) ? t : n;
				}), s !== 0 && (n.set("scrollingY", !0), t.get("scrollYTimeout").start(na, () => {
					n.set("scrollingY", !1);
				})), o !== 0 && (n.set("scrollingX", !0), t.get("scrollXTimeout").start(na, () => {
					n.set("scrollingX", !1);
				}));
			},
			scrollToPointer({ event: e, scope: t, prop: n }) {
				let r = Q(t);
				if (!r) return;
				let i = Hi(t), a = Bi(t), o = Vi(t), s = zi(t), c = e.point;
				if (i && a && e.orientation === "vertical") {
					let e = $(i, "margin", "y"), t = $(a, "padding", "y"), n = i.offsetHeight, o = a.getBoundingClientRect(), s = c.y - o.top - n / 2 - t + e / 2, l = r.scrollHeight, u = r.clientHeight;
					r.scrollTop = s / (a.offsetHeight - n - t - e) * (l - u);
				}
				if (o && s && e.orientation === "horizontal") {
					let e = $(o, "margin", "x"), t = $(s, "padding", "x"), i = o.offsetWidth, a = s.getBoundingClientRect(), l = c.x - a.left - i / 2 - t + e / 2, u = r.scrollWidth, d = r.clientWidth, f = l / (s.offsetWidth - i - t - e), p;
					n("dir") === "rtl" ? (p = (1 - f) * (u - d), r.scrollLeft <= 0 && (p = -p)) : p = f * (u - d), r.scrollLeft = p;
				}
			},
			startDragging({ event: e, refs: t, scope: n }) {
				t.set("startX", e.point.x), t.set("startY", e.point.y), t.set("orientation", e.orientation);
				let r = Q(n);
				r && (t.set("startScrollTop", r.scrollTop), t.set("startScrollLeft", r.scrollLeft));
			},
			setDraggingScroll({ event: e, refs: t, scope: n, context: r }) {
				let i = t.get("startY"), a = t.get("startX"), o = t.get("startScrollTop"), s = t.get("startScrollLeft"), c = e.point, l = c.y - i, u = c.x - a, d = Q(n);
				if (!d) return;
				let f = d.scrollHeight, p = d.clientHeight, m = d.scrollWidth, h = d.clientWidth, g = t.get("orientation"), _ = Hi(n), v = Bi(n);
				if (_ && v && g === "vertical") {
					let e = $(v, "padding", "y"), n = $(_, "margin", "y"), i = _.offsetHeight;
					d.scrollTop = o + l / (v.offsetHeight - i - e - n) * (f - p), r.set("scrollingY", !0), t.get("scrollYTimeout").start(na, () => {
						r.set("scrollingY", !1);
					});
				}
				let y = Vi(n), b = zi(n);
				if (y && b && g === "horizontal") {
					let e = $(b, "padding", "x"), n = $(y, "margin", "x"), i = y.offsetWidth;
					d.scrollLeft = s + u / (b.offsetWidth - i - e - n) * (m - h), r.set("scrollingX", !0), t.get("scrollXTimeout").start(na, () => {
						r.set("scrollingX", !1);
					});
				}
			},
			stopDragging({ refs: e }) {
				e.set("orientation", null);
			},
			clearTimeouts({ refs: e }) {
				e.get("scrollYTimeout").clear(), e.get("scrollXTimeout").clear(), e.get("scrollEndTimeout").clear();
			}
		},
		effects: {
			trackContentResize({ scope: e, send: t }) {
				let n = Ri(e), r = Li(e);
				if (!n || !r) return;
				let i = new (e.getWin()).ResizeObserver(() => {
					setTimeout(() => {
						t({ type: "thumb.measure" });
					}, 1);
				});
				return i.observe(n), i.observe(r), () => {
					i.disconnect();
				};
			},
			trackViewportVisibility({ scope: e, send: t }) {
				let n = e.getWin(), r = Q(e);
				if (!r) return;
				let i = new n.IntersectionObserver((e) => {
					e.forEach((e) => {
						e.intersectionRatio > 0 && (t({ type: "thumb.measure" }), i.disconnect());
					});
				});
				return i.observe(r), () => {
					i.disconnect();
				};
			},
			trackWheelEvent({ scope: e }) {
				let t = Bi(e), n = zi(e);
				if (!t && !n) return;
				let r = (t) => {
					let n = Q(e);
					if (!n || t.ctrlKey) return;
					let r = t.currentTarget.dataset.orientation;
					if (r === "vertical") {
						let e = n.scrollHeight > n.clientHeight, r = n.scrollTop === 0 && t.deltaY < 0, i = n.scrollTop === n.scrollHeight - n.clientHeight && t.deltaY > 0;
						if (!e || t.deltaY === 0 || r || i) return;
						t.preventDefault(), n.scrollTop += t.deltaY;
					} else if (r === "horizontal") {
						let e = n.scrollWidth > n.clientWidth, r = n.scrollLeft === 0 && t.deltaX < 0, i = n.scrollLeft === n.scrollWidth - n.clientWidth && t.deltaX > 0;
						if (!e || t.deltaX === 0 || r || i) return;
						t.preventDefault(), n.scrollLeft += t.deltaX;
					}
				};
				return He(t && G(t, "wheel", r, { passive: !1 }), n && G(n, "wheel", r, { passive: !1 }));
			},
			trackPointerMove({ scope: e, send: t, refs: n }) {
				let r = e.getDoc(), i = n.get("orientation");
				return Or(r, {
					onPointerMove({ point: e }) {
						t({
							type: "thumb.pointermove",
							orientation: i,
							point: e
						});
					},
					onPointerUp() {
						t({
							type: "thumb.pointerup",
							orientation: i
						});
					}
				});
			}
		}
	}
}), ia = (e = {}) => {
	let t = yi(), r = wi(), i = n(() => {
		let n = Re(e);
		return {
			dir: r().dir,
			getRootNode: t().getRootNode,
			...n
		};
	}), a = ei(ra, () => S(i)), o = n(() => Zi(a, Kr));
	return () => S(o);
}, aa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function oa(t, i) {
	let a = e();
	p(i, !0);
	let o = x(i, "ref", 15, null), s = N(i, aa), c = n(() => pi()(s, ["id", "ids"])), u = n(() => l(S(c), 2)), d = n(() => S(u)[0]), f = n(() => S(u)[1]), h = n(() => ({
		...S(d),
		id: S(d).id ?? a
	})), g = ia(() => S(h)), _ = n(() => J(g().getRootProps(), S(f)));
	return Ti(g), Y(t, P({ as: "div" }, () => S(_), {
		get ref() {
			return o();
		},
		set ref(e) {
			o(e);
		}
	})), r({
		get ref() {
			return o();
		},
		set ref(e = null) {
			o(e), m();
		}
	});
}
D(oa, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/use-scroll-area-scrollbar-context.js
var [sa, ca] = fi({
	name: "ScrollAreaScrollbarContext",
	hookName: "useScrollAreaScrollbarContext",
	providerName: "<ScrollAreaScrollbarProvider />"
}), la = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ua(e, t) {
	p(t, !0);
	let i = x(t, "ref", 15, null), a = N(t, la), o = n(() => pi()(a, ["orientation"])), s = n(() => l(S(o), 2)), c = n(() => S(s)[0]), u = n(() => S(s)[1]), d = Ei(), f = n(() => J(d().getScrollbarProps(S(c)), S(u)));
	return sa(() => S(c)), Y(e, P({ as: "div" }, () => S(f), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), r({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), m();
		}
	});
}
D(ua, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/scroll-area-thumb.svelte
var da = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function fa(e, t) {
	p(t, !0);
	let i = x(t, "ref", 15, null), a = N(t, da), o = Ei(), s = ca(), c = n(() => J(o().getThumbProps(s()), a));
	return Y(e, P({ as: "div" }, () => S(c), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), r({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), m();
		}
	});
}
D(fa, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/scroll-area-viewport.svelte
var pa = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ma(e, t) {
	p(t, !0);
	let i = x(t, "ref", 15, null), a = N(t, pa), o = Ei(), s = n(() => J(o().getViewportProps(), a));
	return Y(e, P({ as: "div" }, () => S(s), {
		get ref() {
			return i();
		},
		set ref(e) {
			i(e);
		}
	})), r({
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), m();
		}
	});
}
D(ma, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/scroll/scroll-stop.ts
function ha(e, t) {
	let n = () => {
		let n = (e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight) && !ya(e);
		n && e.getAttribute("tabindex") !== "0" ? e.tabIndex = 0 : !n && e.hasAttribute("tabindex") && e.removeAttribute("tabindex"), t?.(n);
	};
	n(), e.addEventListener("slotchange", n);
	let r = typeof MutationObserver > "u" ? null : new MutationObserver(n);
	r?.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: ga
	});
	let i = typeof ResizeObserver > "u" ? null : new ResizeObserver(n);
	return i?.observe(e), e.firstElementChild && i?.observe(e.firstElementChild), () => {
		i?.disconnect(), r?.disconnect(), e.removeEventListener("slotchange", n);
	};
}
var ga = [
	"tabindex",
	"disabled",
	"href",
	"contenteditable",
	"inert",
	"hidden"
], _a = (e) => !(e instanceof HTMLElement || e instanceof SVGElement) || !(e instanceof HTMLElement && e.isContentEditable && !e.parentElement?.isContentEditable) && e.tabIndex < 0 || (e instanceof HTMLAnchorElement || e instanceof HTMLAreaElement) && !e.hasAttribute("href") && !e.hasAttribute("tabindex") || e.matches(":disabled") || e.closest("[inert]") ? !1 : typeof e.checkVisibility != "function" || e.checkVisibility({ visibilityProperty: !0 }), va = (e) => _a(e) || e instanceof HTMLSlotElement && e.assignedElements({ flatten: !0 }).some((e) => va(e) || ya(e)) || !!e.shadowRoot && ya(e.shadowRoot);
function ya(e) {
	for (let t of e.querySelectorAll("*")) if (va(t)) return !0;
	return !1;
}
//#endregion
//#region src/kit/scroll/Scroller.svelte
var ba = ({ getElement: e }) => {
	let t = e(), n = t?.closest("[data-scope=\"scroll-area\"][data-part=\"viewport\"]");
	if (!t || !n) return;
	let r = n.parentElement?.getAttribute("data-orientation"), i = n.getBoundingClientRect(), a = t.getBoundingClientRect(), o = (e, t, n, r) => e < n ? e - n : t > r ? Math.min(t - r, e - n) : 0;
	if (r !== "horizontal") {
		let e = o(a.top, a.bottom, i.top, i.top + n.clientHeight);
		e && (n.scrollTop += e);
	}
	if (r === "horizontal" || r === "both") {
		let e = o(a.left, a.right, i.left, i.left + n.clientWidth);
		e && (n.scrollLeft += e);
	}
}, xa = b("<!><!><!><!>", 1), Sa = b("<div data-scope=\"scroll-area\" data-part=\"root\" style=\"position: relative\"><div data-scope=\"scroll-area\" data-part=\"viewport\" part=\"viewport\"><div data-scope=\"scroll-area\" data-part=\"content\"><!></div></div></div>"), Ca = {
	hash: "svelte-1xls60m",
	code: "[data-scope='scroll-area'][data-part='root'] {display:flex;flex:1 1 auto;flex-direction:column;box-sizing:border-box;height:100%;min-width:0;min-height:0;max-height:inherit;border-radius:inherit;}[data-scope='scroll-area'][data-part='viewport'] {flex:1 1 auto;box-sizing:border-box;min-height:0;border-radius:inherit;outline:none;isolation:isolate;scrollbar-width:none;transition:box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='scroll-area'][data-part='viewport']::-webkit-scrollbar {display:none;}[data-scope='scroll-area'][data-part='content'] {--scroll-area-overflow-x-start: initial;--scroll-area-overflow-x-end: initial;--scroll-area-overflow-y-start: initial;--scroll-area-overflow-y-end: initial;}[data-scope='scroll-area'][data-part='viewport']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);outline:1px solid currentColor;}[data-scope='scroll-area'][data-part='scrollbar'] {z-index:1;display:flex;box-sizing:border-box;padding:1px;border:0 solid transparent;visibility:hidden;opacity:0;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 150ms;}[data-scope='scroll-area'][data-part='scrollbar'][data-orientation='vertical'] {width:10px;border-inline-start-width:1px;}[data-scope='scroll-area'][data-part='scrollbar'][data-orientation='horizontal'] {flex-direction:column;height:10px;border-top-width:1px;}[data-scope='scroll-area'][data-part='scrollbar']:is([data-hover], [data-scrolling], [data-dragging]) {visibility:visible;opacity:1;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s;}[data-scope='scroll-area'][data-part='scrollbar'][data-orientation='vertical']:not([data-overflow-y]),\n  [data-scope='scroll-area'][data-part='scrollbar'][data-orientation='horizontal']:not([data-overflow-x]) {display:none;}[data-scope='scroll-area'][data-part='thumb'] {position:relative;flex:1;border-radius:calc(infinity * 1px);background-color:var(--k-line);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='scroll-area'][data-part='scrollbar'] {visibility:visible;opacity:1;transition:none;}[data-scope='scroll-area'][data-part='viewport'] {transition:none;}\n  }\n  @media (forced-colors: active) {[data-scope='scroll-area'][data-part='scrollbar'] {visibility:visible;opacity:1;transition:none;}[data-scope='scroll-area'][data-part='thumb'] {background-color:CanvasText;}[data-scope='scroll-area'][data-part='viewport']:focus-visible {outline:2px solid;outline-offset:-2px;}\n  }"
};
function wa(e, t) {
	p(t, !0), a(e, Ca);
	let i = x(t, "axis", 7, "vertical"), s = x(t, "label", 7, null), c = x(t, "heading", 7, null), l = x(t, "viewport", 15, null), u = x(t, "contentPart", 7, !1), g = x(t, "tabStop", 7, !0), b = x(t, "children", 7), T = yi(), D = w(null), O = () => S(D)?.getRootNode() ?? T().getRootNode(), A = {
		vertical: "overflow-x: hidden; overflow-y: auto",
		horizontal: "overflow-x: auto; overflow-y: hidden",
		both: "overflow: auto"
	}, ne = {
		vertical: "min-width: 0",
		horizontal: void 0,
		both: void 0
	}, N = typeof IntersectionObserver < "u" && typeof ResizeObserver < "u", ae = n(() => i() !== "horizontal"), P = n(() => i() === "horizontal" || i() === "both"), oe = n(() => g() ? null : -1), se = w(!1);
	re(() => l() && g() ? ha(l(), (e) => ie(se, e, !0)) : void 0);
	let ce = n(() => c()?.text.trim() ?? ""), le = n(() => !s() && S(se) && S(ce) !== ""), ue = n(() => !!l() && "ariaLabelledByElements" in l()), de = n(() => S(le) && S(ue) && !!c()?.element), fe = n(() => s() || S(le) ? "region" : null), pe = n(() => s() || (S(le) && !S(de) ? S(ce) : null));
	re(() => {
		l() && S(ue) && l(l().ariaLabelledByElements = S(de) ? [c().element] : null, !0);
	});
	let me = (e) => e.preventDefault();
	var he = {
		get axis() {
			return i();
		},
		set axis(e = "vertical") {
			i(e), m();
		},
		get label() {
			return s();
		},
		set label(e = null) {
			s(e), m();
		},
		get heading() {
			return c();
		},
		set heading(e = null) {
			c(e), m();
		},
		get viewport() {
			return l();
		},
		set viewport(e = null) {
			l(e), m();
		},
		get contentPart() {
			return u();
		},
		set contentPart(e = !1) {
			u(e), m();
		},
		get tabStop() {
			return g();
		},
		set tabStop(e = !0) {
			g(e), m();
		},
		get children() {
			return b();
		},
		set children(e) {
			b(e), m();
		}
	}, ge = v(), _e = j(ge), ve = (e) => {
		Si(e, {
			value: O,
			children: (e, t) => {
				var r = v(), a = j(r);
				d(a, () => oa, (e, t) => {
					t(e, {
						get "data-orientation"() {
							return i();
						},
						get ref() {
							return S(D);
						},
						set ref(e) {
							ie(D, e, !0);
						},
						children: (e, t) => {
							var r = xa(), a = j(r);
							d(a, () => ma, (e, t) => {
								t(e, {
									part: "viewport",
									get style() {
										return A[i()];
									},
									get tabindex() {
										return S(oe);
									},
									get role() {
										return S(fe);
									},
									get "aria-label"() {
										return S(pe);
									},
									get ref() {
										return l();
									},
									set ref(e) {
										l(e);
									},
									children: (e, t) => {
										var r = v(), a = j(r);
										{
											let e = n(() => u() ? "content" : null);
											d(a, () => Oi, (t, n) => {
												n(t, {
													get part() {
														return S(e);
													},
													get style() {
														return ne[i()];
													},
													children: (e, t) => {
														var n = v(), r = j(n);
														M(r, () => b() ?? o), y(e, n);
													},
													$$slots: { default: !0 }
												});
											});
										}
										y(e, r);
									},
									$$slots: { default: !0 }
								});
							});
							var s = k(a), c = (e) => {
								var t = v(), n = j(t);
								d(n, () => ua, (e, t) => {
									t(e, {
										orientation: "vertical",
										part: "scrollbar",
										onmousedown: me,
										children: (e, t) => {
											var n = v(), r = j(n);
											d(r, () => fa, (e, t) => {
												t(e, { part: "thumb" });
											}), y(e, n);
										},
										$$slots: { default: !0 }
									});
								}), y(e, t);
							};
							_(s, (e) => {
								S(ae) && e(c);
							});
							var f = k(s), p = (e) => {
								var t = v(), n = j(t);
								d(n, () => ua, (e, t) => {
									t(e, {
										orientation: "horizontal",
										part: "scrollbar",
										onmousedown: me,
										children: (e, t) => {
											var n = v(), r = j(n);
											d(r, () => fa, (e, t) => {
												t(e, { part: "thumb" });
											}), y(e, n);
										},
										$$slots: { default: !0 }
									});
								}), y(e, t);
							};
							_(f, (e) => {
								S(P) && e(p);
							});
							var m = k(f), h = (e) => {
								var t = v(), n = j(t);
								d(n, () => Ai, (e, t) => {
									t(e, { part: "corner" });
								}), y(e, t);
							};
							_(m, (e) => {
								i() === "both" && e(h);
							}), y(e, r);
						},
						$$slots: { default: !0 }
					});
				}), y(e, r);
			},
			$$slots: { default: !0 }
		});
	}, ye = (e) => {
		var t = Sa(), n = E(t), r = E(n), a = E(r);
		M(a, () => b() ?? o), f(r), f(n), C(n, (e) => l(e), () => l()), f(t), te(() => {
			h(t, "data-orientation", i()), ee(n, A[i()]), h(n, "tabindex", S(oe)), h(n, "role", S(fe)), h(n, "aria-label", S(pe)), h(r, "part", u() ? "content" : null), ee(r, ne[i()]);
		}), y(e, t);
	};
	return _(_e, (e) => {
		N ? e(ve) : e(ye, -1);
	}), y(e, ge), r(he);
}
D(wa, {
	axis: {},
	label: {},
	heading: {},
	viewport: {},
	contentPart: {},
	tabStop: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
export { wn as $, pe as $t, G as A, it as At, lr as B, Ve as Bt, Or as C, vt as Ct, xr as D, R as Dt, yr as E, mt as Et, mr as F, rt as Ft, Zn as G, Te as Gt, ar as H, Ue as Ht, rr as I, He as It, Xn as J, De as Jt, qn as K, I as Kt, cr as L, ze as Lt, vr as M, ot as Mt, _r as N, st as Nt, Sr as O, dt as Ot, er as P, ft as Pt, Dn as Q, ye as Qt, nr as R, Je as Rt, kr as S, _t as St, Er as T, pt as Tt, or as U, Ae as Ut, tr as V, Re as Vt, Jn as W, we as Wt, jn as X, ue as Xt, Wn as Y, F as Yt, Cn as Z, me as Zt, Mr as _, en as _t, yi as a, ve as an, fn as at, Pr as b, Jt as bt, fi as c, fe as cn, U as ct, J as d, W as dt, se as en, On as et, Kr as f, rn as ft, Ar as g, H as gt, Lr as h, V as ht, Si as i, xe as in, vn as it, pr as j, at as jt, br as k, ut as kt, Y as l, _n as lt, Ir as m, $t as mt, ba as n, ce as nn, En as nt, X as o, de as on, Sn as ot, Fr as p, an as pt, Yn as q, ke as qt, wi as r, ge as rn, bn as rt, pi as s, oe as sn, yn as st, wa as t, be as tn, kn as tt, ei as u, hn as ut, jr as v, Kt as vt, Dr as w, ht as wt, q as x, wt as xt, Nr as y, qt as yt, sr as z, We as zt };
