import { At as e, C as t, Ct as n, Dt as r, Et as i, It as a, J as o, K as s, L as c, Ot as l, Q as u, Tt as d, W as f, X as p, Z as m, _ as h, _t as g, b as _, ct as v, dt as y, ft as b, g as x, gt as S, kt as C, mt as w, ot as T, q as ee, v as te, wt as E, xt as ne, y as re, yt as ie } from "./version-CCDdag5V.js";
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/array.mjs
function D(e) {
	return e == null ? [] : Array.isArray(e) ? e : [e];
}
var ae = (e) => e[0], oe = (e) => e[e.length - 1], se = (e, t) => e.indexOf(t) !== -1, ce = (e, ...t) => e.concat(t), le = (e, ...t) => e.filter((e) => !t.includes(e)), ue = (e) => Array.from(new Set(e)), de = (e, t) => {
	let n = new Set(t);
	return e.filter((e) => !n.has(e));
}, fe = (e, t) => se(e, t) ? le(e, t) : ce(e, t);
function pe(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n, a = t + r, o = e.length, s = o - 1;
	return t === -1 ? r > 0 ? 0 : s : a < 0 ? i ? s : 0 : a >= o ? i ? 0 : t > o ? o : t : a;
}
function me(e, t, n = {}) {
	return e[pe(e, t, n)];
}
function he(e, t, n = {}) {
	let { step: r = 1, loop: i = !0 } = n;
	return pe(e, t, {
		step: -r,
		loop: i
	});
}
function ge(e, t, n = {}) {
	return e[he(e, t, n)];
}
function _e(e, t) {
	return e.reduce((e, n, r) => (r % t === 0 ? e.push([n]) : oe(e)?.push(n), e), []);
}
function ve(e) {
	return e.reduce((e, t) => Array.isArray(t) ? e.concat(ve(t)) : e.concat(t), []);
}
function ye(e, t) {
	return e.reduce(([e, n], r) => (t(r) ? e.push(r) : n.push(r), [e, n]), [[], []]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/equal.mjs
var be = (e) => e?.constructor.name === "Array", xe = (e, t) => {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (!O(e[n], t[n])) return !1;
	return !0;
}, O = (e, t) => {
	if (Object.is(e, t)) return !0;
	if (e == null && t != null || e != null && t == null) return !1;
	if (typeof e?.isEqual == "function" && typeof t?.isEqual == "function") return e.isEqual(t);
	if (typeof e == "function" && typeof t == "function") return e.toString() === t.toString();
	if (be(e) && be(t)) return xe(Array.from(e), Array.from(t));
	if (typeof e != "object" || typeof t != "object") return !1;
	let n = Object.keys(t ?? /* @__PURE__ */ Object.create(null)), r = n.length;
	for (let t = 0; t < r; t++) if (!Reflect.has(e, n[t])) return !1;
	for (let i = 0; i < r; i++) {
		let r = n[i];
		if (!O(e[r], t[r])) return !1;
	}
	return !0;
}, Se = (e) => Array.isArray(e), Ce = (e) => e === !0 || e === !1, we = (e) => typeof e == "object" && !!e, Te = (e) => we(e) && !Se(e), k = (e) => typeof e == "string", A = (e) => typeof e == "function", Ee = (e) => e == null, De = (e, t) => Object.prototype.hasOwnProperty.call(e, t), Oe = (e) => Object.prototype.toString.call(e), ke = Function.prototype.toString, Ae = ke.call(Object), je = (e) => {
	if (!we(e) || Oe(e) != "[object Object]" || Pe(e)) return !1;
	let t = Object.getPrototypeOf(e);
	if (t === null) return !0;
	let n = De(t, "constructor") && t.constructor;
	return typeof n == "function" && n instanceof n && ke.call(n) == Ae;
}, Me = (e) => typeof e == "object" && !!e && "$$typeof" in e && "props" in e, Ne = (e) => typeof e == "object" && !!e && "__v_isVNode" in e, Pe = (e) => Me(e) || Ne(e), Fe = (e, ...t) => (typeof e == "function" ? e(...t) : e) ?? void 0, Ie = (e) => e, Le = (e) => e(), Re = () => {}, j = (...e) => (...t) => {
	e.forEach(function(e) {
		e?.(...t);
	});
}, ze = /* @__PURE__ */ (() => {
	let e = 0;
	return () => (e++, e.toString(36));
})();
function Be(e, t, ...n) {
	if (e in t) {
		let r = t[e];
		return A(r) ? r(...n) : r;
	}
	let r = /* @__PURE__ */ Error(`No matching key: ${JSON.stringify(e)} in ${JSON.stringify(Object.keys(t))}`);
	throw Error.captureStackTrace?.(r, Be), r;
}
var Ve = (e) => String.fromCharCode(e + (e > 25 ? 39 : 97));
function He(e) {
	let t = "", n;
	for (n = Math.abs(e); n > 52; n = n / 52 | 0) t = Ve(n % 52) + t;
	return Ve(n % 52) + t;
}
function Ue(e, t) {
	let n = t.length;
	for (; n;) e = e * 33 ^ t.charCodeAt(--n);
	return e;
}
var We = (e) => He(Ue(5381, e) >>> 0);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/object.mjs
function M(e) {
	if (!je(e) || e === void 0) return e;
	let t = Reflect.ownKeys(e).filter((e) => typeof e == "string"), n = {};
	for (let r of t) {
		let t = e[r];
		t !== void 0 && (n[r] = M(t));
	}
	return n;
}
function Ge(e, t) {
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
function N(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	(e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production" && console.warn(t);
}
function Ke(...e) {
	let t = e.length === 1 ? e[0] : e[1];
	if ((e.length !== 2 || e[0]) && process.env.NODE_ENV !== "production") throw Error(t);
}
function P(e, t) {
	if (e == null) throw Error(t());
}
function qe(e, t, n) {
	let r = [];
	for (let n of t) e[n] ?? r.push(n);
	if (r.length > 0) throw Error(`[zag-js${n ? ` > ${n}` : ""}] missing required props: ${r.join(", ")}`);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/merge-props.mjs
var Je = (...e) => e.map((e) => e?.trim?.()).filter(Boolean).join(" "), Ye = (...e) => Array.from(new Set(Je(...e).split(/\s+/).filter(Boolean))).join(" "), Xe = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, Ze = (e) => {
	let t = {}, n;
	for (; n = Xe.exec(e);) t[n[1]] = n[2];
	return t;
}, Qe = (e, t) => {
	if (k(e)) {
		if (k(t)) return `${e};${t}`;
		e = Ze(e);
	} else k(t) && (t = Ze(t));
	return Object.assign({}, e ?? {}, t ?? {});
};
function $e(...e) {
	let t = {};
	for (let n of e) {
		if (!n) continue;
		for (let e in t) {
			if (e.startsWith("on") && typeof t[e] == "function" && typeof n[e] == "function") {
				t[e] = j(n[e], t[e]);
				continue;
			}
			if (e === "className" || e === "class") {
				t[e] = Je(t[e], n[e]);
				continue;
			}
			if (e === "style") {
				t[e] = Qe(t[e], n[e]);
				continue;
			}
			if (e === "data-ownedby") {
				t[e] = Ye(t[e], n[e]);
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
var F = ".", et = "#", tt = /* @__PURE__ */ new WeakMap(), nt = /* @__PURE__ */ new WeakMap();
function I(e) {
	return e.join(F);
}
function rt(e) {
	return e.includes(F);
}
function it(e) {
	return e.startsWith(et);
}
function at(e) {
	return e.startsWith(F);
}
function ot(e) {
	return it(e) ? e.slice(et.length) : e;
}
function L(e, t) {
	return e ? `${e}${F}${t}` : t;
}
function st(e) {
	let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), r = (e, i) => {
		t.set(e, i);
		let a = i.id;
		a && (n.has(a) && Ke(`[zag-js] Duplicate state id: "${a}"`), n.set(a, e));
		let o = i.states;
		if (o) {
			P(i.initial, () => `[zag-js] Compound state "${e}" has child states but no "initial" property`), i.initial in o || Ke(`[zag-js] Compound state "${e}" has initial "${String(i.initial)}" which is not a child state`);
			for (let [t, n] of Object.entries(o)) {
				if (!n) continue;
				let i = L(e, t);
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
function R(e) {
	let t = tt.get(e);
	if (t) return t;
	let { index: n, idIndex: r } = st(e);
	return tt.set(e, n), nt.set(e, r), n;
}
function ct(e, t) {
	return R(e), nt.get(e)?.get(t);
}
function z(e) {
	return e ? String(e).split(F).filter(Boolean) : [];
}
function B(e, t) {
	if (!t) return [];
	let n = R(e), r = z(t), i = [], a = [];
	for (let e of r) {
		a.push(e);
		let t = I(a), r = n.get(t);
		if (!r) break;
		i.push({
			path: t,
			state: r
		});
	}
	return i;
}
function V(e, t) {
	let n = R(e), r = z(t);
	if (!r.length) return t;
	let i = [];
	for (let e of r) {
		i.push(e);
		let r = I(i);
		if (!n.has(r)) return t;
	}
	let a = I(i), o = n.get(a);
	for (; o?.initial;) {
		let e = `${a}${F}${o.initial}`, t = n.get(e);
		if (!t) break;
		a = e, o = t;
	}
	return a;
}
function lt(e, t) {
	return R(e).has(t);
}
function ut(e, t, n) {
	let r = String(t);
	if (it(r)) {
		let t = ot(r), n = ct(e, t);
		return P(n, () => `[zag-js] Unknown state id: "${t}"`), V(e, n);
	}
	if (at(r) && n) return V(e, L(n, r.slice(1)));
	if (!rt(r) && n) {
		let t = z(n);
		for (let n = t.length - 1; n >= 1; n--) {
			let i = L(t.slice(0, n).join(F), r);
			if (lt(e, i)) return V(e, i);
		}
		if (lt(e, r)) return V(e, r);
	}
	return V(e, r);
}
function dt(e, t, n) {
	let r = B(e, t);
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
function ft(e, t, n, r) {
	let i = t ? B(e, t) : [], a = B(e, n), o = 0;
	for (; o < i.length && o < a.length && i[o]?.path === a[o]?.path;) o += 1;
	let s = i.slice(o).reverse(), c = a.slice(o), l = i[i.length - 1]?.path === a[a.length - 1]?.path;
	return r && l && (s = i.slice().reverse(), c = a), {
		exiting: s,
		entering: c
	};
}
function pt(e, t) {
	return e ? e === t || e.startsWith(`${t}${F}`) : !1;
}
function mt(e, t, n) {
	return B(e, t).some((e) => e.state.tags?.includes(n));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/create-machine.mjs
function ht() {
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
function gt(e) {
	return R(e), e;
}
function _t() {
	return {
		guards: ht(),
		createMachine: (e) => gt(e),
		choose: (e) => function({ choose: t }) {
			return t(e)?.actions;
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/types.mjs
var H = /* @__PURE__ */ ((e) => (e.NotStarted = "Not Started", e.Started = "Started", e.Stopped = "Stopped", e))(H || {}), vt = "__init__", yt = Object.defineProperty, bt = (e, t, n) => t in e ? yt(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, xt = (e, t, n) => bt(e, typeof t == "symbol" ? t : t + "", n), St = (e) => Math.max(0, Math.min(1, e)), Ct = (e, t) => e.map((n, r) => e[(Math.max(t, 0) + r) % e.length]), wt = () => void 0, U = (e) => typeof e == "object" && !!e, Tt = 2147483647, Et = (e) => e ? "" : void 0, Dt = (e) => e ? "true" : void 0, Ot = /\\/g, kt = /"/g, At = (e) => globalThis.CSS?.escape?.(e) ?? e.replace(Ot, "\\\\").replace(kt, "\\\""), jt = (e) => `[data-ownedby~="${At(String(e))}"]`, Mt = 1, Nt = 9, Pt = 11, W = (e) => U(e) && e.nodeType === Mt && typeof e.nodeName == "string", G = (e) => U(e) && e.nodeType === Nt, Ft = (e) => U(e) && e === e.window, It = (e) => W(e) ? e.localName || "" : "#document";
function Lt(e) {
	return [
		"html",
		"body",
		"#document"
	].includes(It(e));
}
var Rt = (e) => U(e) && e.nodeType !== void 0, K = (e) => Rt(e) && e.nodeType === Pt && "host" in e, zt = (e) => W(e) && e.localName === "input", Bt = (e) => !!e?.matches("a[href]"), Vt = (e) => W(e) ? e.offsetWidth > 0 || e.offsetHeight > 0 || e.getClientRects().length > 0 : !1;
function Ht(e) {
	return e ? Jt(e.getRootNode()) === e : !1;
}
var Ut = /(textarea|select)/;
function Wt(e) {
	if (e == null || !W(e)) return !1;
	try {
		return zt(e) && e.selectionStart != null || Ut.test(e.localName) || e.isContentEditable || e.getAttribute("contenteditable") === "true" || e.getAttribute("contenteditable") === "";
	} catch {
		return !1;
	}
}
function Gt(e, t) {
	if (!e || !t || !W(e) || !Rt(t)) return !1;
	if (W(t) && e === t || e.contains(t)) return !0;
	let n = t.getRootNode?.();
	if (n && K(n)) {
		let n = t;
		for (; n;) {
			if (e === n) return !0;
			n = n.parentNode || n.host;
		}
	}
	return !1;
}
function q(e) {
	return G(e) ? e : Ft(e) ? e.document : e?.ownerDocument ?? document;
}
function Kt(e) {
	return q(e).documentElement;
}
function qt(e) {
	return K(e) ? qt(e.host) : G(e) ? e.defaultView ?? window : W(e) ? e.ownerDocument?.defaultView ?? window : window;
}
function Jt(e) {
	let t = e.activeElement;
	for (; t?.shadowRoot;) {
		let e = t.shadowRoot.activeElement;
		if (!e || e === t) break;
		t = e;
	}
	return t;
}
function Yt(e) {
	if (It(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || K(e) && e.host || Kt(e);
	return K(t) ? t.host : t;
}
function Xt(e) {
	let t;
	try {
		if (t = e.getRootNode({ composed: !0 }), G(t) || K(t)) return t;
	} catch {}
	return e.ownerDocument ?? document;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/platform.mjs
var J = () => typeof document < "u";
function Zt() {
	return navigator.userAgentData?.platform ?? navigator.platform;
}
function Qt() {
	let e = navigator.userAgentData;
	return e && Array.isArray(e.brands) ? e.brands.map(({ brand: e, version: t }) => `${e}/${t}`).join(" ") : navigator.userAgent;
}
var $t = (e) => J() && e.test(Zt()), en = (e) => J() && e.test(Qt()), tn = (e) => J() && e.test(navigator.vendor), nn = /^iPhone/i, rn = /^iPad/i, an = /^Mac/i, on = /apple/i, sn = /Firefox/i, cn = /Android/i, ln = () => J() && !!navigator.maxTouchPoints, un = () => $t(nn), dn = () => $t(rn) || Y() && navigator.maxTouchPoints > 1, fn = () => un() || dn(), pn = () => Y() || fn(), Y = () => $t(an), mn = () => pn() && tn(on), hn = () => en(sn), gn = () => en(cn);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/event.mjs
function _n(e) {
	return e.composedPath?.() ?? e.nativeEvent?.composedPath?.();
}
function vn(e) {
	return _n(e)?.[0] ?? e.target;
}
function yn(e) {
	let t = e.currentTarget;
	if (!t || !t.matches("a[href], button[type='submit'], input[type='submit']")) return !1;
	let n = e.button === 1, r = Sn(e);
	return n || r;
}
function bn(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let n = t.localName;
	return e.altKey ? n === "a" || n === "button" && t.type === "submit" || n === "input" && t.type === "submit" : !1;
}
function xn(e) {
	return Mn(e).isComposing || e.keyCode === 229;
}
function Sn(e) {
	return Y() ? e.metaKey : e.ctrlKey;
}
function Cn(e) {
	return e.key.length === 1 && !e.ctrlKey && !e.metaKey;
}
function wn(e) {
	return e.pointerType === "" && e.isTrusted ? !0 : gn() && e.pointerType ? e.type === "click" && e.buttons === 1 : e.detail === 0 && !e.pointerType;
}
var Tn = (e) => e.button === 0, En = (e) => e.button === 2 || Y() && e.ctrlKey && e.button === 0, Dn = (e) => e.ctrlKey || e.altKey || e.metaKey, On = (e) => "touches" in e && e.touches.length > 0, kn = {
	Up: "ArrowUp",
	Down: "ArrowDown",
	Esc: "Escape",
	" ": "Space",
	",": "Comma",
	Left: "ArrowLeft",
	Right: "ArrowRight"
}, An = {
	ArrowLeft: "ArrowRight",
	ArrowRight: "ArrowLeft"
};
function jn(e, t = {}) {
	let { dir: n = "ltr", orientation: r = "horizontal" } = t, i = e.key;
	return i = kn[i] ?? i, n === "rtl" && r === "horizontal" && i in An && (i = An[i]), i;
}
function Mn(e) {
	return e.nativeEvent ?? e;
}
var Nn = /* @__PURE__ */ new Set(["PageUp", "PageDown"]), Pn = /* @__PURE__ */ new Set([
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
function Fn(e, t) {
	let { step: n, largeStep: r, smallStep: i } = t, a = Pn.has(e.key);
	return i != null && e.altKey && a ? i : Nn.has(e.key) || e.shiftKey && a ? r : n;
}
function In(e, t = "client") {
	let n = On(e) ? e.touches[0] || e.changedTouches[0] : e;
	return {
		x: n[`${t}X`],
		y: n[`${t}Y`]
	};
}
var Ln = (e, t, n, r) => {
	let i = typeof e == "function" ? e() : e;
	return i?.addEventListener(t, n, r), () => {
		i?.removeEventListener(t, n, r);
	};
}, Rn = class e {
	constructor() {
		xt(this, "id", null), xt(this, "fn_cleanup"), xt(this, "cleanup", () => {
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
function zn(e) {
	let t = Rn.create();
	return t.request(e), t.cleanup;
}
function Bn(e) {
	let t = /* @__PURE__ */ new Set();
	function n(e) {
		let n = globalThis.requestAnimationFrame(e);
		t.add(() => globalThis.cancelAnimationFrame(n));
	}
	return n(() => n(e)), function() {
		t.forEach((e) => e());
	};
}
function Vn(e, t, n) {
	let r = zn(() => {
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
//#region ../../node_modules/.pnpm/@zag-js+core@1.43.3/node_modules/@zag-js/core/dist/scope.mjs
function Hn(e) {
	let t = () => e.getRootNode?.() ?? document, n = () => q(t()), r = () => n().defaultView ?? window, i = () => Jt(t()), a = (e) => t().getElementById(e);
	return {
		...e,
		getRootNode: t,
		getDoc: n,
		getWin: r,
		getActiveElement: i,
		isActiveElement: Ht,
		getById: a
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+types@1.43.3/node_modules/@zag-js/types/dist/prop-types.mjs
function Un(e) {
	return new Proxy({}, { get(t, n) {
		return n === "style" ? (t) => e({ style: t }).style : e;
	} });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/normalize-props.js
var Wn = {
	className: "class",
	defaultChecked: "checked",
	defaultValue: "value",
	htmlFor: "for",
	onBlur: "onfocusout",
	onChange: "oninput",
	onFocus: "onfocusin",
	onDoubleClick: "ondblclick"
};
function Gn(e) {
	let t = "";
	for (let n in e) {
		let r = e[n];
		r != null && (n.startsWith("--") || (n = n.replace(/[A-Z]/g, (e) => `-${e.toLowerCase()}`)), t += `${n}:${r};`);
	}
	return t;
}
var Kn = new Set("viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(","));
function qn(e) {
	return e in Wn ? Wn[e] : Kn.has(e) ? e : e.toLowerCase();
}
function Jn(e, t) {
	return e === "style" && typeof t == "object" ? Gn(t) : t;
}
var Yn = Un((e) => {
	let t = {};
	for (let n in e) t[qn(n)] = Jn(n, e[n]);
	return t;
}), Xn = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g, Zn = (e) => {
	let t = {}, n;
	for (; n = Xn.exec(e);) t[n[1]] = n[2];
	return t;
};
function Qn(...e) {
	let t = [];
	for (let n of e) n && "class" in n && n.class != null && t.push(n.class);
	let n = $e(...e);
	return t.length > 0 && (n.class = t.length === 1 ? t[0] : t), "style" in n && (typeof n.style == "string" && (n.style = Zn(n.style)), n.style = Gn(n.style)), n;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/bindable.svelte.js
function X(e) {
	let t = e().value ?? e().defaultValue, r = e().isEqual ?? Object.is, i = ne(g(t)), a = E(() => e().value !== void 0), o = { current: v(() => T(i)) }, s = { current: void 0 };
	b(() => {
		let t = T(a) ? e().value : T(i);
		o = { current: t }, s = { current: t };
	});
	let c = (t) => {
		let n = A(t) ? t(o.current) : t, c = s.current;
		e().debug && console.log(`[bindable > ${e().debug}] setValue`, {
			next: n,
			prev: c
		}), T(a) || ie(i, n, !0), r(n, c) || e().onChange?.(n, c);
	};
	function l() {
		return T(a) ? e().value : T(i);
	}
	return {
		initial: t,
		ref: o,
		get: l,
		set(t) {
			let r = e().sync ? n : Le;
			v(() => r(() => c(t)));
		},
		invoke(t, n) {
			e().onChange?.(t, n);
		},
		hash(t) {
			return e().hash?.(t) ?? String(t);
		}
	};
}
X.cleanup = (e) => {
	s(() => e());
}, X.ref = (e) => {
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
function $n(e) {
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
var er = (e) => typeof e == "function" ? e() : e, tr = (e, t) => {
	let n = [], r = !0;
	y(() => {
		if (r) {
			n = e.map((e) => er(e)), r = !1;
			return;
		}
		let i = !1;
		for (let t = 0; t < e.length; t++) if (!O(n[t], er(e[t]))) {
			i = !0;
			break;
		}
		i && (n = e.map((e) => er(e)), t());
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+svelte@1.43.3_svelte@5.57.1/node_modules/@zag-js/svelte/dist/machine.svelte.js
function nr(e) {
	return A(e) ? e() : e;
}
function rr(e, t) {
	let n = E(() => {
		let { id: e, ids: n, getRootNode: r } = nr(t);
		return Hn({
			id: e,
			ids: n,
			getRootNode: r
		});
	}), r = (...t) => {
		e.debug && console.log(...t);
	}, i = E(() => e.props?.({
		props: M(nr(t)),
		scope: T(n)
	}) ?? nr(t)), a = ir(() => T(i)), o = e.context?.({
		prop: a,
		bindable: X,
		get scope() {
			return T(n);
		},
		flush: ar,
		getContext() {
			return c;
		},
		getComputed() {
			return x;
		},
		getRefs() {
			return h;
		},
		getEvent() {
			return p();
		}
	}), c = {
		get(e) {
			return o?.[e].get();
		},
		set(e, t) {
			o?.[e].set(t);
		},
		initial(e) {
			return o?.[e].initial;
		},
		hash(e) {
			let t = o?.[e].get();
			return o?.[e].hash(t);
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
		...S,
		hasTag(t) {
			return mt(e, S.get(), t);
		},
		matches(...e) {
			let t = S.get();
			return e.some((e) => pt(t, e));
		}
	}), h = $n(e.refs?.({
		prop: a,
		context: c
	}) ?? {}), g = () => ({
		state: m(),
		context: c,
		event: p(),
		prop: a,
		send: w,
		action: _,
		guard: v,
		track: tr,
		refs: h,
		computed: x,
		flush: ar,
		scope: T(n),
		choose: b
	}), _ = (t) => {
		let n = A(t) ? t(g()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.actions?.[t];
			return n || N(`[zag-js] No implementation found for action "${JSON.stringify(t)}"`), n;
		});
		for (let e of r) e?.(g());
	}, v = (t) => {
		if (A(t)) return t(g());
		let n = e.implementations?.guards?.[t];
		return n || N(`[zag-js] No implementation found for guard "${JSON.stringify(t)}"`), n?.(g());
	}, y = (t) => {
		let n = A(t) ? t(g()) : t;
		if (!n) return;
		let r = n.map((t) => {
			let n = e.implementations?.effects?.[t];
			return n || N(`[zag-js] No implementation found for effect "${JSON.stringify(t)}"`), n;
		}), i = [];
		for (let e of r) {
			let t = e?.(g());
			t && i.push(t);
		}
		return () => i.forEach((e) => e?.());
	}, b = (e) => D(e).find((e) => {
		let t = !e.guard;
		return k(e.guard) ? t = !!v(e.guard) : A(e.guard) && (t = e.guard(g())), t;
	}), x = (t) => {
		P(e.computed, () => "[zag-js] No computed object found on machine");
		let r = e.computed[t];
		return r({
			context: c,
			event: p(),
			prop: a,
			refs: h,
			scope: T(n),
			computed: x
		});
	}, S = X(() => ({
		defaultValue: ut(e, e.initialState({ prop: a })),
		onChange(t, n) {
			let { exiting: r, entering: i } = ft(e, n, t, u.current?.reenter);
			if (r.forEach((e) => {
				l.get(e.path)?.(), l.delete(e.path);
			}), r.forEach((e) => {
				_(e.state?.exit);
			}), _(u.current?.actions), i.forEach((e) => {
				let t = y(e.state?.effects);
				if (t) {
					let n = l.get(e.path);
					l.set(e.path, n ? j(n, t) : t);
				}
			}), n === "__init__") {
				_(e.entry);
				let t = y(e.effects);
				if (t) {
					let e = l.get(vt);
					l.set(vt, e ? j(e, t) : t);
				}
			}
			i.forEach((e) => {
				_(e.state?.entry);
			});
		}
	})), C = H.NotStarted;
	ee(() => {
		let e = C === H.Started;
		C = H.Started, r(e ? "rehydrating..." : "initializing..."), S.invoke(S.initial, vt);
	}), s(() => {
		C === H.Started && (r("unmounting..."), C = H.Stopped, l.forEach((e) => e?.()), l = /* @__PURE__ */ new Map(), u.current = null, _(e.exit));
	});
	let w = (t) => {
		if (C !== H.Started) return;
		d.current = f.current, f.current = t;
		let n = S.get(), { transitions: i, source: a } = dt(e, n, t.type), o = b(i);
		if (!o) return;
		u.current = o;
		let s = ut(e, o.target ?? n, a);
		r("transition", t.type, o.target || n, `(${o.actions})`), s === n ? o.reenter ? S.invoke(n, n) : _(o.actions) : S.set(s);
	};
	return e.watch?.(g()), {
		get state() {
			return m();
		},
		send: w,
		context: c,
		prop: a,
		get scope() {
			return T(n);
		},
		refs: h,
		computed: x,
		get event() {
			return p();
		},
		getStatus: () => C
	};
}
function ir(e) {
	return function(t) {
		return e()[t];
	};
}
function ar(e) {
	n(() => {
		queueMicrotask(() => e());
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/tags.js
var or = [
	"path",
	"rect",
	"circle",
	"ellipse",
	"line",
	"polygon",
	"polyline"
], sr = (e) => typeof e == "string" && or.includes(e), cr = [
	"area",
	"base",
	"br",
	"col",
	"embed",
	"hr",
	"img",
	"input",
	"link"
], lr = (e) => typeof e == "string" && cr.includes(e), ur = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"as",
	"ref"
]);
function dr(e, r) {
	C(r, !0);
	let i = h(r, "as", 7), a = h(r, "ref", 15, null), o = te(r, ur);
	var s = {
		get as() {
			return i();
		},
		set as(e) {
			i(e), n();
		},
		get ref() {
			return a();
		},
		set ref(e = null) {
			a(e), n();
		}
	}, u = m(), d = w(u);
	return c(d, i, !0, (e, n) => {
		_(e, (e) => a(e), () => a()), t(e, () => ({ ...o }));
	}), p(e, u), l(s);
}
x(dr, {
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/factory/factory.svelte
var fr = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"asChild",
	"children",
	"as",
	"ref"
]), pr = u("<textarea></textarea>");
function mr(e, r) {
	C(r, !0);
	let i = h(r, "asChild", 7), s = h(r, "children", 7), u = h(r, "as", 7), g = h(r, "ref", 15, null), v = te(r, fr), y = (e) => Qn(v, e ?? {});
	var b = {
		get asChild() {
			return i();
		},
		set asChild(e) {
			i(e), n();
		},
		get children() {
			return s();
		},
		set children(e) {
			s(e), n();
		},
		get as() {
			return u();
		},
		set as(e) {
			u(e), n();
		},
		get ref() {
			return g();
		},
		set ref(e = null) {
			g(e), n();
		}
	}, x = m(), S = w(x), ee = (e) => {
		var t = m(), n = w(t);
		o(n, () => i() ?? a, () => y), p(e, t);
	}, ne = (e) => {
		dr(e, re({ get as() {
			return u();
		} }, () => v, {
			get ref() {
				return g();
			},
			set ref(e) {
				g(e);
			}
		}));
	}, ie = E(() => sr(u())), D = (e) => {
		var n = m(), r = w(n);
		c(r, u, !1, (e, n) => {
			_(e, (e) => g(e), () => g()), t(e, () => ({ ...v }));
		}), p(e, n);
	}, ae = E(() => lr(u())), oe = (e) => {
		var n = pr();
		d(n), t(n, () => ({ ...v })), _(n, (e) => g(e), () => g()), p(e, n);
	}, se = (e) => {
		var n = m(), r = w(n);
		c(r, u, !1, (e, n) => {
			_(e, (e) => g(e), () => g()), t(e, () => ({ ...v }));
			var r = m(), i = w(r);
			o(i, () => s() ?? a), p(n, r);
		}), p(e, n);
	};
	return f(S, (e) => {
		i() ? e(ee) : T(ie) ? e(ne, 1) : T(ae) ? e(D, 2) : u() === "textarea" ? e(oe, 3) : e(se, -1);
	}), p(e, x), l(b);
}
x(mr, {
	asChild: {},
	children: {},
	as: {},
	ref: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/create-context.js
function hr(e, t) {
	return `${e} returned \`undefined\`. Seems you forgot to wrap component within ${t}`;
}
var Z = (t) => {
	let { name: n, strict: a = !0, hookName: o = "useContext", providerName: s = "Provider", errorMessage: c, defaultValue: l } = t, u = Symbol(n);
	return [
		(t) => e(u, t),
		() => {
			let e = r(u);
			if (a && !e) throw Error(c ?? hr(o, s));
			return e ? i(u) : l;
		},
		u
	];
}, gr = () => (e, t) => t.reduce((e, t) => {
	let [n, r] = e, i = t;
	return r[i] !== void 0 && (n[i] = r[i]), delete r[i], [n, r];
}, [{}, { ...e }]), Q = (e, t = []) => ({
	parts: (...n) => {
		if (_r(t)) return Q(e, n);
		throw Error("createAnatomy().parts(...) should only be called once. Did you mean to use .extendWith(...) ?");
	},
	extendWith: (...n) => Q(e, [...t, ...n]),
	omit: (...n) => Q(e, t.filter((e) => !n.includes(e))),
	rename: (e) => Q(e, t),
	keys: () => t,
	build: () => [...new Set(t)].reduce((t, n) => Object.assign(t, { [n]: {
		selector: [`&[data-scope="${$(e)}"][data-part="${$(n)}"]`, `& [data-scope="${$(e)}"][data-part="${$(n)}"]`].join(", "),
		attrs: {
			"data-scope": $(e),
			"data-part": $(n)
		}
	} }), {})
}), $ = (e) => e.replace(/([A-Z])([A-Z])/g, "$1-$2").replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[\s_]+/g, "-").toLowerCase(), _r = (e) => e.length === 0, vr = (e) => typeof e == "function", yr = (e, ...t) => vr(e) ? e(...t) : e, [br, xr] = Z({
	name: "EnvironmentContext",
	strict: !1,
	defaultValue: () => ({
		getRootNode: () => document,
		getDocument: () => document,
		getWindow: () => window
	})
}), Sr = u("<span hidden=\"\"></span>"), Cr = u("<!> <!>", 1);
function wr(e, t) {
	C(t, !0);
	let r = h(t, "value", 7), i = h(t, "children", 7), s = ne(null), c = () => yr(r()) ?? T(s)?.ownerDocument ?? document, u = E(() => ({
		getRootNode: c,
		getDocument: () => q(c()),
		getWindow: () => qt(c())
	}));
	br(() => T(u));
	var d = {
		get value() {
			return r();
		},
		set value(e) {
			r(e), n();
		},
		get children() {
			return i();
		},
		set children(e) {
			i(e), n();
		}
	}, m = Cr(), g = w(m);
	o(g, () => i() ?? a);
	var v = S(g, 2), y = (e) => {
		var t = Sr();
		_(t, (e) => ie(s, e), () => T(s)), p(e, t);
	};
	return f(v, (e) => {
		r() || e(y);
	}), p(e, m), l(d);
}
x(wr, {
	value: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/providers/locale/use-locale-context.js
var [Tr, Er] = Z({
	name: "LocaleContext",
	strict: !1,
	defaultValue: () => ({
		dir: "ltr",
		locale: "en-US"
	})
});
//#endregion
export { St as $, pn as A, de as At, Xt as B, En as C, A as Ct, yn as D, ce as Dt, Dn as E, O as Et, ln as F, ye as Ft, Wt as G, Ht as H, Gt as I, ge as It, zt as J, Vt as K, Jt as L, le as Lt, fn as M, ve as Mt, Y as N, oe as Nt, Cn as O, fe as Ot, mn as P, me as Pt, Dt as Q, q as R, D as Rt, xn as S, Ce as St, Tn as T, Te as Tt, Bt as U, qt as V, G as W, K as X, Lt as Y, Tt as Z, jn as _, Re as _t, Q as a, gt as at, vn as b, De as bt, mr as c, P as ct, Yn as d, M as dt, Et as et, Rn as f, Ge as ft, Ln as g, Be as gt, zn as h, We as ht, xr as i, ht as it, hn as j, ae as jt, wn as k, _e as kt, rr as l, qe as lt, Vn as m, Ie as mt, Er as n, wt as nt, gr as o, _t as ot, Bn as p, j as pt, W as q, wr as r, Ct as rt, Z as s, $e as st, Tr as t, jt as tt, Qn as u, N as ut, In as v, Fe as vt, bn as w, Ee as wt, Mn as x, Se as xt, Fn as y, ze as yt, Yt as z, ue as zt };
