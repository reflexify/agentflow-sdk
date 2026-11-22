//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/constants.js
var e = {}, t = Symbol("uninitialized"), n = "http://www.w3.org/1999/xhtml", r = "http://www.w3.org/2000/svg", i = "http://www.w3.org/1998/Math/MathML", a = "@attach", o = Array.isArray, s = Array.prototype.indexOf, c = Array.prototype.includes, l = Array.from, u = Object.keys, d = Object.defineProperty, f = Object.getOwnPropertyDescriptor, p = Object.getOwnPropertyDescriptors, m = Object.prototype, h = Array.prototype, g = Object.getPrototypeOf, _ = Object.isExtensible;
function v(e) {
	return typeof e == "function";
}
var y = () => {};
function b(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function x() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
function S(e, t) {
	if (Array.isArray(e)) return e;
	if (t === void 0 || !(Symbol.iterator in e)) return Array.from(e);
	let n = [];
	for (let r of e) if (n.push(r), n.length === t) break;
	return n;
}
function ee(e, t) {
	var n = {};
	for (var r in e) t.includes(r) || (n[r] = e[r]);
	for (var i of Object.getOwnPropertySymbols(e)) Object.propertyIsEnumerable.call(e, i) && !t.includes(i) && (n[i] = e[i]);
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/constants.js
var te = 1 << 24, C = 1024, w = 2048, ne = 4096, re = 8192, ie = 16384, ae = 32768, oe = 1 << 25, se = 65536, T = 1 << 19, E = 1 << 20, ce = 1 << 25, le = 1 << 21, ue = 1 << 22, de = 1 << 23, fe = Symbol("$state"), pe = Symbol("component"), me = Symbol("legacy props"), he = Symbol(""), ge = Symbol("proxy path"), _e = Symbol("attributes"), ve = Symbol("class"), ye = Symbol("style"), be = Symbol("text"), xe = Symbol("form reset"), Se = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Ce = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function we() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Te(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ee() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function De() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/hydration.js
var D = !1;
function O(e) {
	D = e;
}
var k;
function A(t) {
	if (t === null) throw Te(), e;
	return k = t;
}
function j() {
	return A(/* @__PURE__ */ B(k));
}
function Oe(t) {
	if (D) {
		if (/* @__PURE__ */ B(k) !== null) throw Te(), e;
		k = t;
	}
}
function ke(e = 1) {
	if (D) {
		for (var t = e, n = k; t--;) n = /* @__PURE__ */ B(n);
		k = n;
	}
}
function Ae(e = !0) {
	for (var t = 0, n = k;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ B(n);
		e && n.remove(), n = i;
	}
}
function je(t) {
	if (!t || t.nodeType !== 8) throw Te(), e;
	return t.data;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/equality.js
function Me(e) {
	return e === this.v;
}
function Ne(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Pe(e) {
	return !Ne(e, this.v);
}
function Fe(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/errors.js
function Ie() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function Le(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function Re(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ze() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Be(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function Ve() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function He() {
	throw Error("https://svelte.dev/e/hydration_failed");
}
function Ue(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function We() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Ge() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ke() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function qe() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
function Je(e, t) {
	return e.label = t, Ye(e.v, t), e;
}
function Ye(e, t) {
	return e?.[ge]?.(t), e;
}
function Xe(e) {
	return typeof e == "symbol" ? `Symbol(${e.description})` : typeof e == "function" ? "<function>" : typeof e == "object" && e ? "<object>" : String(e);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/shared/context.js
function Ze(e) {
	let t = e.p;
	for (; t !== null && t.c === null;) t = t.p;
	return t?.c ?? null;
}
function Qe(e, t) {
	return e === null && Fe(t), e.c ??= new Map(Ze(e) || void 0);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/context.js
var M = null;
function $e(e) {
	M = e;
}
function et(e) {
	return Qe(M, "getContext").get(e);
}
function tt(e, t) {
	return Qe(M, "setContext").set(e, t), t;
}
function nt(e) {
	return Qe(M, "hasContext").has(e);
}
function rt(e, t = !1, n) {
	M = {
		p: M,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: q,
		l: null
	};
}
function it(e) {
	var t = M, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Nn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, M = t.p, at(e);
}
function at(e = {}) {
	return d(e, pe, { value: !0 }), e;
}
function ot() {
	return !0;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/task.js
var st = [];
function ct() {
	var e = st;
	st = [], b(e);
}
function N(e) {
	if (st.length === 0 && !It) {
		var t = st;
		queueMicrotask(() => {
			t === st && ct();
		});
	}
	st.push(e);
}
function lt() {
	for (; st.length > 0;) ct();
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/status.js
var ut = ~(w | ne | C);
function P(e, t) {
	e.f = e.f & ut | t;
}
function dt(e) {
	e.f & 512 || e.deps === null ? P(e, C) : P(e, ne);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/utils.js
function ft(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), P(e, C);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/misc.js
function pt(e, t) {
	if (t) {
		let t = document.body;
		e.autofocus = !0, N(() => {
			document.activeElement === t && e.focus();
		});
	}
}
function mt(e) {
	D && /* @__PURE__ */ z(e) !== null && Sn(e);
}
var ht = !1;
function gt() {
	ht || (ht = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[xe]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function _t(e) {
	var t = W, n = q;
	K(null), J(null);
	try {
		return e();
	} finally {
		K(t), J(n);
	}
}
function vt(e, t, n, r = n) {
	e.addEventListener(t, () => _t(n));
	let i = e[xe];
	e[xe] = i ? () => {
		i(), r(!0);
	} : () => r(!0), gt();
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/async.js
function yt(e, t, n, r) {
	let i = ot() ? Ct : Dt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = q, c = bt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Dn(e, s);
			}
			xt();
		}
	}
	var d = St();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ Tt(e))).then(u).catch((e) => Dn(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), xt();
	}) : f();
}
function bt() {
	var e = q, t = W, n = M, r = F;
	return function(i = !0) {
		J(e), K(t), $e(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function xt(e = !0) {
	J(null), K(null), $e(null), e && F?.deactivate();
}
function St() {
	var e = q, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ct(e) {
	var n = 2 | w;
	return q !== null && (q.f |= T), {
		ctx: M,
		deps: null,
		effects: null,
		equals: Me,
		f: n,
		fn: e,
		reactions: null,
		rv: 0,
		v: t,
		wv: 0,
		parent: q,
		ac: null
	};
}
var wt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Tt(e, n, r) {
	let i = q;
	i === null && Ie();
	var a = void 0, o = $t(t), s = !W, c = /* @__PURE__ */ new Set();
	return Rn(() => {
		var t = q, n = x();
		a = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== Se && n.reject(e);
			}).finally(xt);
		} catch (e) {
			n.reject(e), xt();
		}
		var r = F;
		if (s) {
			if (t.f & 32768) var l = St();
			if (i.b?.is_rendered()) r.async_deriveds.get(t)?.reject(wt);
			else for (let e of c.values()) e.reject(wt);
			c.add(n), r.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), c.delete(n), t !== wt && (r.activate(), t ? (o.f |= de, an(o, t)) : (o.f & 8388608 && (o.f ^= de), an(o, e)), r.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), jn(() => {
		for (let e of c) e.reject(wt);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === a ? e(o) : t(a);
			}
			n.then(r, r);
		}
		t(a);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Et(e) {
	let t = /* @__PURE__ */ Ct(e);
	return ir(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function Dt(e) {
	let t = /* @__PURE__ */ Ct(e);
	return t.equals = Pe, t;
}
function Ot(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) U(t[n]);
	}
}
function kt(e) {
	var n, r = q, i = e.parent;
	if (!tr && i !== null && e.v !== t && i.f & 24576) return we(), e.v;
	J(i);
	try {
		Ot(e), n = pr(e);
	} finally {
		J(r);
	}
	return n;
}
function At(e) {
	var t = kt(e);
	if (!e.equals(t) && (e.wv = ur(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), Pt?.capture(e, t, !0)), e.deps === null))) {
		P(e, C);
		return;
	}
	tr || (I === null ? dt(e) : (An() || F?.is_fork) && I.set(e, t));
}
function jt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && _t(() => {
		t.ac.abort(Se), t.ac = null;
	}), t.fn !== null && (t.teardown = y), gr(t, 0), Wn(t));
}
function Mt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && _r(t);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/batch.js
var Nt = null, F = null, Pt = null, I = null, Ft = null, It = !1, Lt = !1, Rt = null, zt = null, Bt = 0, Vt = 1, Ht = class e {
	id = Vt++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		Nt === null ? Nt = this : (Nt.#n = this, this.#t = Nt), Nt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) P(r, w), t(r);
			for (r of n.m) P(r, ne), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		var e = [];
		for (let i of this.#c) if (!(i.f & 16384 || !(i.f & 6144))) {
			for (var t = i, n = !1; t.parent !== null;) {
				t = t.parent;
				var r = t.f;
				if (r & 96) {
					if (!(r & 1024)) {
						n = !0;
						break;
					}
					t.f ^= C;
				}
			}
			n || e.push(t);
		}
		return this.#c = [], e;
	}
	#_() {
		this.#e = !0;
		for (let e of this.#u) this.#d.delete(e), P(e, w), this.schedule(e);
		for (let e of this.#d) P(e, ne), this.schedule(e);
		this.apply();
		for (var t = Rt = [], n = [], r = zt = []; this.#c.length > 0;) {
			Bt++ > 1e3 && (this.#S(), Wt());
			for (let e of this.#g()) try {
				this.#v(e, t, n);
			} catch (t) {
				throw Yt(e), this.#h() || this.discard(), t;
			}
		}
		if (F = null, r.length > 0) {
			var i = e.ensure();
			for (let e of r) i.schedule(e);
		}
		if (Rt = null, zt = null, this.#h()) {
			this.#x(n), this.#x(t);
			for (let [e, t] of this.#f) Jt(e, t);
			r.length > 0 && F.#_();
			return;
		}
		let a = this.#y();
		if (a) {
			this.#x(n), this.#x(t), a.#b(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Pt = this, Kt(n), Kt(t), Pt = null, this.#s?.resolve();
		var o = F;
		if (this.#a === 0 && (this.#c.length === 0 || o !== null) && this.#S(), this.#c.length > 0) {
			if (o !== null) {
				for (let e of this.#c) o.#c.push(e);
				this.#c = [];
			} else o = this;
		}
		o !== null && (Zt.clear(), o.#_());
	}
	#v(e, t, n) {
		e.f ^= C;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= C : i & 4 ? t.push(r) : dr(r) && (i & 16 && this.#d.add(r), _r(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#y() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#b(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), P(i, w), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#S(), F = this, this.#_();
	}
	#x(e) {
		for (var t = 0; t < e.length; t += 1) ft(e[t], this.#u, this.#d);
	}
	capture(e, n, r = !1) {
		e.v !== t && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [n, r]), I?.set(e, n)), this.is_fork || (e.v = n);
	}
	activate() {
		F = this;
	}
	deactivate() {
		F = null, I = null;
	}
	flush() {
		try {
			Lt = !0, F = this, this.#_();
		} finally {
			Bt = 0, Ft = null, Rt = null, zt = null, Lt = !1, F = null, I = null, Zt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(wt);
		this.#S(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, N(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= x()).promise;
	}
	static ensure() {
		if (F === null) {
			let t = F = new e();
			!Lt && !It && N(() => {
				t.#e || t.flush();
			});
		}
		return F;
	}
	apply() {
		I = null;
	}
	schedule(e) {
		if (Ft = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		this.#c.push(e);
	}
	#S() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? Nt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Ut(e) {
	var t = It;
	It = !0;
	try {
		var n;
		for (e && (F !== null && !F.is_fork && F.flush(), n = e());;) {
			if (lt(), F === null) return n;
			F.flush();
		}
	} finally {
		It = t;
	}
}
function Wt() {
	try {
		Ve();
	} catch (e) {
		Dn(e, Ft);
	}
}
var Gt = null;
function Kt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && dr(r) && (Gt = /* @__PURE__ */ new Set(), _r(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && qn(r), Gt?.size > 0)) {
				Zt.clear();
				for (let e of Gt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Gt.has(n) && (Gt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || _r(n);
					}
				}
				Gt.clear();
			}
		}
		Gt = null;
	}
}
function qt(e) {
	F.schedule(e);
}
function Jt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), P(e, C);
		for (var n = e.first; n !== null;) Jt(n, t), n = n.next;
	}
}
function Yt(e) {
	P(e, C);
	for (var t = e.first; t !== null;) Yt(t), t = t.next;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/sources.js
var Xt = /* @__PURE__ */ new Set(), Zt = /* @__PURE__ */ new Map(), Qt = !1;
function $t(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Me,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function en(e, t) {
	let n = $t(e, t);
	return ir(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function tn(e, t = !1, n = !0) {
	let r = $t(e);
	return t || (r.equals = Pe), r;
}
function L(e, t, n = !1) {
	return W !== null && (!G || W.f & 131072) && ot() && W.f & 4325394 && (rr === null || !rr.has(e)) && Ke(), an(e, n ? un(t) : t, zt);
}
var nn = null, rn = 0;
function an(e, t, n = null) {
	if (!e.equals(t)) {
		tr ? Zt.set(e, t) : Zt.has(e) || Zt.set(e, e.v);
		var r = Ht.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && kt(t), I === null && dt(t);
		}
		e.wv = ur(), nn = null, rn = 0, ln(e, w, n), nn = null, ot() && q !== null && q.f & 1024 && !(q.f & 96) && (Z === null ? ar([e]) : Z.push(e)), !r.is_fork && Xt.size > 0 && !Qt && on();
	}
	return t;
}
function on() {
	Qt = !1;
	for (let e of Xt) {
		e.f & 1024 && P(e, ne);
		let t;
		try {
			t = dr(e);
		} catch {
			t = !0;
		}
		t && _r(e);
	}
	Xt.clear();
}
function sn(e, t = 1) {
	var n = Q(e), r = t === 1 ? n++ : n--;
	return L(e, n), r;
}
function cn(e) {
	L(e, e.v + 1);
}
function ln(e, t, n) {
	var r = e.reactions;
	if (r !== null) {
		var i = ot(), a = r.length;
		if (rn += a, rn > 1e5 && nn === null && (nn = /* @__PURE__ */ new Set()), nn !== null) {
			if (nn.has(e)) return;
			nn.add(e);
		}
		for (var o = 0; o < a; o++) {
			var s = r[o], c = s.f;
			if (i || s !== q) {
				var l = (c & w) === 0;
				if (l && P(s, t), c & 131072) Xt.add(s);
				else if (c & 2) {
					var u = s;
					I?.delete(u), ln(u, ne, n);
				} else if (l) {
					var d = s;
					c & 16 && Gt !== null && Gt.add(d), n === null ? qt(d) : n.push(d);
				}
			}
		}
	}
}
function un(e) {
	if (typeof e != "object" || !e || fe in e || pe in e) return e;
	let n = g(e);
	if (n !== m && n !== h) return e;
	var r = /* @__PURE__ */ new Map(), i = o(e), a = /* @__PURE__ */ en(0), s = null, c = cr, l = (e) => {
		if (cr === c) return e();
		var t = W, n = cr;
		K(null), lr(c);
		var r = e();
		return K(t), lr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ en(e.length, s)), new Proxy(e, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && We();
			var i = r.get(t);
			return i === void 0 ? l(() => {
				var e = /* @__PURE__ */ en(n.value, s);
				return r.set(t, e), e;
			}) : L(i, n.value, !0), !0;
		},
		deleteProperty(e, n) {
			var i = r.get(n);
			if (i === void 0) {
				if (n in e) {
					let e = l(() => /* @__PURE__ */ en(t, s));
					r.set(n, e), cn(a);
				}
			} else L(i, t), cn(a);
			return !0;
		},
		get(n, i, a) {
			if (i === fe) return e;
			var o = r.get(i), c = i in n;
			if (o === void 0 && (!c || f(n, i)?.writable) && (o = l(() => /* @__PURE__ */ en(un(c ? n[i] : t), s)), r.set(i, o)), o !== void 0) {
				var u = Q(o);
				return u === t ? void 0 : u;
			}
			return Reflect.get(n, i, a);
		},
		getOwnPropertyDescriptor(e, n) {
			this.has?.(e, n);
			var i = Reflect.getOwnPropertyDescriptor(e, n), a = r.get(n);
			if (a !== void 0) {
				var o = Q(a);
				if (o === t) return;
				if (i && "value" in i) i.value = o;
				else return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return i;
		},
		has(e, n) {
			if (n === fe) return !0;
			var i = r.get(n), a = i !== void 0 && i.v !== t || Reflect.has(e, n);
			return (i !== void 0 || q !== null && (!a || f(e, n)?.writable)) && (i === void 0 && (i = l(() => /* @__PURE__ */ en(a ? un(e[n]) : t, s)), r.set(n, i)), Q(i) === t) ? !1 : a;
		},
		set(e, n, o, c) {
			var u = r.get(n), d = n in e;
			if (i && n === "length") for (var p = o; p < u.v; p += 1) {
				var m = r.get(p + "");
				m === void 0 ? p in e && (m = l(() => /* @__PURE__ */ en(t, s)), r.set(p + "", m)) : L(m, t);
			}
			if (u === void 0) (!d || f(e, n)?.writable) && (u = l(() => /* @__PURE__ */ en(void 0, s)), L(u, un(o)), r.set(n, u));
			else {
				d = u.v !== t;
				var h = l(() => un(o));
				L(u, h);
			}
			var g = Reflect.getOwnPropertyDescriptor(e, n);
			if (g?.set && g.set.call(c, o), !d) {
				if (i && typeof n == "string") {
					var _ = r.get("length"), v = Number(n);
					Number.isInteger(v) && v >= _.v && L(_, v + 1);
				}
				cn(a);
			}
			return !0;
		},
		ownKeys(e) {
			Q(a);
			var n = Reflect.ownKeys(e).filter((e) => {
				var n = r.get(e);
				return n === void 0 || n.v !== t;
			});
			for (var [i, o] of r) o.v !== t && !(i in e) && n.push(i);
			return n;
		},
		setPrototypeOf() {
			Ge();
		}
	});
}
function dn(e) {
	try {
		if (typeof e == "object" && e && fe in e) return e[fe];
	} catch {}
	return e;
}
function fn(e, t) {
	return Object.is(dn(e), dn(t));
}
var pn, mn, hn, gn;
function _n() {
	if (pn === void 0) {
		pn = window, mn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		hn = f(t, "firstChild").get, gn = f(t, "nextSibling").get, _(e) && (e[ve] = void 0, e[_e] = null, e[ye] = void 0, e.__e = void 0), _(n) && (n[be] = void 0);
	}
}
function R(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function z(e) {
	return hn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function B(e) {
	return gn.call(e);
}
function vn(e, t) {
	if (!D) return /* @__PURE__ */ z(e);
	var n = /* @__PURE__ */ z(k);
	if (n === null) n = k.appendChild(R());
	else if (t && n.nodeType !== 3) {
		var r = R();
		return n?.before(r), A(r), r;
	}
	return t && Tn(n), A(n), n;
}
function yn(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ z(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ B(n) : n;
	}
	if (t) {
		if (k?.nodeType !== 3) {
			var r = R();
			return k?.before(r), A(r), r;
		}
		Tn(k);
	}
	return k;
}
function bn(e, t = !1) {
	if (!D) return /* @__PURE__ */ z(e);
	var n = vn(e, t);
	return Oe(e), n;
}
function xn(e, t = 1, n = !1) {
	let r = D ? k : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ B(r);
	if (!D) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = R();
			return r === null ? i?.after(a) : r.before(a), A(a), a;
		}
		Tn(r);
	}
	return A(r), r;
}
function Sn(e) {
	e.textContent = "";
}
function Cn() {
	return !1;
}
function wn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function Tn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
function En(e) {
	var t = q;
	if (t === null) return W.f |= de, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Dn(e, t);
}
function Dn(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128 && !(t.f & 33570816)) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/effects.js
function On(e) {
	q === null && (W === null && Be(e), ze()), tr && Re(e);
}
function kn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function V(e, t) {
	var n = q;
	n !== null && n.f & 8192 && (e |= re);
	var r = {
		ctx: M,
		deps: null,
		nodes: null,
		f: e | w | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	F?.register_created_effect(r);
	var i = r;
	if (e & 4) Rt === null ? Ht.ensure().schedule(r) : Rt.push(r);
	else if (t !== null) {
		try {
			_r(r);
		} catch (e) {
			throw U(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= se));
	}
	if (i !== null && (i.parent = n, n !== null && kn(i, n), W !== null && W.f & 2 && !(e & 64))) {
		var a = W;
		(a.effects ??= []).push(i);
	}
	return r;
}
function An() {
	return W !== null && !G;
}
function jn(e) {
	let t = V(8, null);
	return P(t, C), t.teardown = e, t;
}
function Mn(e) {
	On("$effect");
	var t = q.f;
	if (!W && t & 32 && M !== null && !M.i) {
		var n = M;
		(n.e ??= []).push(e);
	} else return Nn(e);
}
function Nn(e) {
	return V(4 | E, e);
}
function Pn(e) {
	return On("$effect.pre"), V(8 | E, e);
}
function Fn(e) {
	Ht.ensure();
	let t = V(64 | T, e);
	return () => {
		U(t);
	};
}
function In(e) {
	Ht.ensure();
	let t = V(64 | T, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Jn(t, () => {
			U(t), n(void 0);
		}) : (U(t), n(void 0));
	});
}
function Ln(e) {
	return V(4, e);
}
function Rn(e) {
	return V(ue | T, e);
}
function zn(e, t = 0) {
	return V(8 | t, e);
}
function Bn(e, t = [], n = [], r = []) {
	yt(r, t, n, (t) => {
		V(8, () => {
			e(...t.map(Q));
		});
	});
}
function Vn(e, t = 0) {
	return V(16 | t, e);
}
function Hn(e, t = 0) {
	return V(te | t, e);
}
function H(e) {
	return V(32 | T, e);
}
function Un(e) {
	var t = e.teardown;
	if (t !== null) {
		let n = tr, r = W;
		nr(!0), K(null);
		try {
			t.call(null);
		} catch (t) {
			Dn(t, e.parent);
		} finally {
			nr(n), K(r);
		}
	}
}
function Wn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && _t(() => {
			e.abort(Se);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : U(n, t), n = r;
	}
}
function Gn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || U(t), t = n;
	}
}
function U(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Kn(e.nodes.start, e.nodes.end), n = !0), e.f |= oe, Wn(e, t && !n), gr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Un(e), e.f ^= oe, e.f |= ie;
	var i = e.parent;
	i !== null && i.first !== null && qn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Kn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ B(e);
		e.remove(), e = n;
	}
}
function qn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Jn(e, t, n = !0) {
	var r = [];
	e.f |= 256, Yn(e, r, !0);
	var i = () => {
		n && U(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Yn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= re;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Yn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Xn(e) {
	e.f &= -257, Zn(e, !0);
}
function Zn(e, t) {
	if (!(e.f & 256) && e.f & 8192) {
		e.f ^= re, e.f & 1024 || (P(e, w), Ht.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Zn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Qn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ B(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/legacy.js
var $n = null, er = !1, tr = !1;
function nr(e) {
	tr = e;
}
var W = null, G = !1;
function K(e) {
	W = e;
}
var q = null;
function J(e) {
	q = e;
}
var rr = null;
function ir(e) {
	W !== null && (W.f & 2097152 || W.f & 2) && (rr ??= /* @__PURE__ */ new Set()).add(e);
}
var Y = null, X = 0, Z = null;
function ar(e) {
	Z = e;
}
var or = 1, sr = 0, cr = sr;
function lr(e) {
	cr = e;
}
function ur() {
	return ++or;
}
function dr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (dr(a) && At(a), a.wv > e.wv) return !0;
		}
		t & 512 && I === null && P(e, C);
	}
	return !1;
}
function fr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(rr !== null && rr.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? fr(a, t, !1) : t === a && (n ? P(a, w) : a.f & 1024 && P(a, ne), qt(a));
	}
}
function pr(e) {
	var t = Y, n = X, r = Z, i = W, a = rr, o = M, s = G, c = cr, l = e.f;
	Y = null, X = 0, Z = null, W = l & 96 ? null : e, rr = null, $e(e.ctx), G = !1, cr = ++sr, e.ac !== null && (_t(() => {
		e.ac.abort(Se);
	}), e.ac = null);
	try {
		e.f |= le;
		var u = e.fn, d = u();
		e.f |= ae;
		var f = mr(e);
		if (ot() && Z !== null && !G && f !== null && !(e.f & 6146)) for (var p = 0; p < Z.length; p++) fr(Z[p], e);
		if (i !== null && i !== e) {
			if (sr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = sr;
			if (t !== null) for (let e of t) e.rv = sr;
			Z !== null && (r === null ? r = Z : r.push(...Z));
		}
		return e.f & 8388608 && (e.f ^= de), d;
	} catch (t) {
		return mr(e), En(t);
	} finally {
		e.f ^= le, Y = t, X = n, Z = r, W = i, rr = a, $e(o), G = s, cr = c;
	}
}
function mr(e) {
	var t = e.deps, n = F?.is_fork;
	if (Y !== null) {
		var r;
		if (n || gr(e, X), t !== null && X > 0) for (t.length = X + Y.length, r = 0; r < Y.length; r++) t[X + r] = Y[r];
		else e.deps = t = Y;
		if (An() && e.f & 512) for (r = X; r < t.length; r++) (t[r].reactions ??= []).push(e);
	} else !n && t !== null && X < t.length && (gr(e, X), t.length = X);
	return t;
}
function hr(e, n) {
	let r = n.reactions;
	if (r !== null) {
		var i = s.call(r, e);
		if (i !== -1) {
			var a = r.length - 1;
			a === 0 ? r = n.reactions = null : (r[i] = r[a], r.pop());
		}
	}
	if (r === null && n.f & 2 && (Y === null || !c.call(Y, n))) {
		var o = n;
		o.f & 512 && (o.f ^= 512), o.v !== t && dt(o), o.ac !== null && _t(() => {
			o.ac.abort(Se), o.ac = null, P(o, w);
		}), jt(o), gr(o, 0);
	}
}
function gr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) hr(e, n[r]);
}
function _r(e) {
	var t = e.f;
	if (!(t & 16384)) {
		P(e, C);
		var n = q, r = er;
		q = e, er = !(t & 96);
		try {
			t & 16777232 ? Gn(e) : Wn(e), Un(e);
			var i = pr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = or;
		} finally {
			er = r, q = n;
		}
	}
}
async function vr() {
	await Promise.resolve(), Ut();
}
function Q(e) {
	var t = !!(e.f & 2);
	if ($n?.add(e), W !== null && !G && !(q !== null && q.f & 16384) && (rr === null || !rr.has(e))) {
		var n = W.deps;
		if (W.f & 2097152) e.rv < sr && (e.rv = sr, Y === null && n !== null && n[X] === e ? X++ : Y === null ? Y = [e] : Y.push(e));
		else {
			W.deps ??= [], c.call(W.deps, e) || W.deps.push(e);
			var r = e.reactions;
			r === null ? e.reactions = [W] : c.call(r, W) || r.push(W);
		}
	}
	if (tr && Zt.has(e)) return Zt.get(e);
	if (t) {
		var i = e;
		if (tr) {
			var a = i.v;
			return (!(i.f & 1024) && i.reactions !== null || br(i)) && (a = kt(i)), Zt.set(i, a), a;
		}
		var o = !(i.f & 512) && !G && W !== null && (er || !!(W.f & 512)), s = (i.f & ae) === 0;
		dr(i) && (o && (i.f |= 512), At(i)), o && !s && (Mt(i), yr(i));
	}
	if (I?.has(e)) return I.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function yr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Mt(t), yr(t));
}
function br(e) {
	if (e.v === t) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Zt.has(t) || t.f & 2 && br(t)) return !0;
	return !1;
}
function xr(e) {
	var t = G;
	try {
		return G = !0, e();
	} finally {
		G = t;
	}
}
function Sr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (fe in e) Cr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && fe in n && Cr(n);
		}
	}
}
function Cr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			Cr(e[n], t);
		} catch {}
		let n = g(e);
		if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
			let t = p(n);
			for (let n in t) {
				let r = t[n].get;
				if (r) try {
					r.call(e);
				} catch {}
			}
		}
	}
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/events.js
var wr = Symbol("events"), Tr = /* @__PURE__ */ new Set(), Er = /* @__PURE__ */ new Set();
function Dr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Pr.call(t, e), !e.cancelBubble) return _t(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? (i.__removed = !1, N(() => {
		i.__removed || t.addEventListener(e, i, r);
	})) : t.addEventListener(e, i, r), i;
}
function Or(e, t, n, r = {}) {
	var i = Dr(t, e, n, r);
	return () => {
		i.__removed = !0, e.removeEventListener(t, i, r);
	};
}
function kr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = Dr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && jn(() => {
		o.__removed = !0, t.removeEventListener(e, o, a);
	});
}
function Ar(e, t, n) {
	(t[wr] ??= {})[e] = n;
}
function jr(e) {
	for (var t = 0; t < e.length; t++) Tr.add(e[t]);
	for (var n of Er) n(e);
}
var Mr = null, Nr = !1;
function Pr(e) {
	var t = this, n = t.ownerDocument, r = e.type, i = e.composedPath?.() || [], a = i[0] || e.target;
	Mr = e, Nr || (Nr = !0, setTimeout(() => {
		Nr = !1, Mr = null;
	}));
	var o = 0, s = Mr === e && e[wr];
	if (s) {
		var c = i.indexOf(s);
		if (c !== -1 && (t === document || t === window)) {
			e[wr] = t;
			return;
		}
		var l = i.indexOf(t);
		if (l === -1) return;
		c <= l && (o = c);
	}
	if (a = i[o] || e.target, a !== t) {
		d(e, "currentTarget", {
			configurable: !0,
			get() {
				return a || n;
			}
		});
		var u = W, f = q;
		K(null), J(null);
		try {
			for (var p, m = []; a !== null && a !== t;) {
				try {
					var h = a[wr]?.[r];
					h != null && (!a.disabled || e.target === a) && h.call(a, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				o++, a = o < i.length ? i[o] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[wr] = t, delete e.currentTarget, K(u), J(f);
		}
	}
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/reconciler.js
var Fr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Ir(e) {
	return Fr?.createHTML(e) ?? e;
}
function Lr(e) {
	var t = wn("template");
	return t.innerHTML = Ir(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/template.js
function $(e, t) {
	var n = q;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function Rr(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (D) return $(k, null), k;
		i === void 0 && (i = Lr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ z(i)));
		var t = r || mn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ z(t), s = t.lastChild;
			$(o, s);
		} else $(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function zr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (D) return $(k, null), k;
		if (!o) {
			var e = /* @__PURE__ */ z(Lr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ z(e);) o.appendChild(/* @__PURE__ */ z(e));
			else o = /* @__PURE__ */ z(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ z(t), r = t.lastChild;
			$(n, r);
		} else $(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Br(e, t) {
	return /* @__PURE__ */ zr(e, t, "svg");
}
function Vr(e = "") {
	if (!D) {
		var t = R(e + "");
		return $(t, t), t;
	}
	var n = k;
	return n.nodeType === 3 ? Tn(n) : (n.before(n = R()), A(n)), $(n, n), n;
}
function Hr() {
	if (D) return $(k, null), k;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = R();
	return e.append(t, n), $(t, n), e;
}
function Ur(e, t) {
	if (D) {
		var n = q;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = k), j();
		return;
	}
	e !== null && e.before(t);
}
function Wr() {
	if (D && k && k.nodeType === 8 && k.textContent?.startsWith("$")) {
		let e = k.textContent.substring(1);
		return j(), e;
	}
	return (window.__svelte ??= {}).uid ??= 1, `c${window.__svelte.uid++}`;
}
function Gr(e) {
	return e.endsWith("capture") && e !== "gotpointercapture" && e !== "lostpointercapture";
}
var Kr = [
	"beforeinput",
	"click",
	"change",
	"dblclick",
	"contextmenu",
	"focusin",
	"focusout",
	"input",
	"keydown",
	"keyup",
	"mousedown",
	"mousemove",
	"mouseout",
	"mouseover",
	"mouseup",
	"pointerdown",
	"pointermove",
	"pointerout",
	"pointerover",
	"pointerup",
	"touchend",
	"touchmove",
	"touchstart"
];
function qr(e) {
	return Kr.includes(e);
}
var Jr = /* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split("."), Yr = {
	formnovalidate: "formNoValidate",
	ismap: "isMap",
	nomodule: "noModule",
	playsinline: "playsInline",
	readonly: "readOnly",
	defaultvalue: "defaultValue",
	defaultchecked: "defaultChecked",
	srcobject: "srcObject",
	novalidate: "noValidate",
	allowfullscreen: "allowFullscreen",
	disablepictureinpicture: "disablePictureInPicture",
	disableremoteplayback: "disableRemotePlayback"
};
function Xr(e) {
	return e = e.toLowerCase(), Yr[e] ?? e;
}
[...Jr];
var Zr = ["touchstart", "touchmove"];
function Qr(e) {
	return Zr.includes(e);
}
var $r = [
	"textarea",
	"script",
	"style",
	"title"
];
function ei(e) {
	return $r.includes(e);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/reactivity/create-subscriber.js
function ti(e) {
	let t = 0, n = $t(0), r;
	return () => {
		An() && (Q(n), zn(() => (t === 0 && (r = xr(() => e(() => cn(n)))), t += 1, () => {
			N(() => {
				--t, t === 0 && (r?.(), r = void 0, cn(n));
			});
		})));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ni = se | T;
function ri(e, t, n, r) {
	new ii(e, t, n, r);
}
var ii = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = D ? k : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = ti(() => (this.#m = $t(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = q;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = q.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Vn(() => {
			if (D) {
				let e = this.#t;
				j();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ni), D && (this.#e = k);
	}
	#g() {
		try {
			this.#a = H(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		N(r), t && (this.#s = H(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				De();
				return;
			}
			t = !0, n && qe(), this.#s !== null && Jn(this.#s, () => {
				this.#s = null;
			}), this.#S(() => {
				this.#b();
			});
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					Dn(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = H(() => e(this.#e)), N(() => {
			var e = this.#c = document.createDocumentFragment(), t = R(), n = !1;
			if (e.append(t), this.#a = this.#S(() => {
				try {
					return H(() => this.#r(t));
				} catch (e) {
					try {
						this.error(e), n = !0;
					} catch (e) {
						Dn(e, this.#i.parent);
					}
					return null;
				}
			}), this.#a === null) {
				this.#c = null, n && this.#x(F);
				return;
			}
			this.#u === 0 && (this.#e.before(e), this.#c = null, Jn(this.#o, () => {
				this.#o = null;
			}), this.#x(F));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = H(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Qn(this.#a, e);
				let t = this.#n.pending;
				this.#o = H(() => t(this.#e));
			} else this.#x(F);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		ft(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = q, n = W, r = M;
		J(this.#i), K(this.#i), $e(this.#i.ctx);
		try {
			return Ht.ensure(), e();
		} finally {
			J(t), K(n), $e(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Jn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, N(() => {
			this.#d = !1, this.#m && an(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), Q(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		F?.is_fork ? (this.#a && F.skip_effect(this.#a), this.#o && F.skip_effect(this.#o), this.#s && F.skip_effect(this.#s), F.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (U(this.#a), null), this.#o &&= (U(this.#o), null), this.#s &&= (U(this.#s), null), D && (A(this.#t), ke(), A(Ae()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return H(() => {
						var r = q;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Dn(e, this.#i.parent), null;
				}
			}));
		};
		N(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Dn(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Dn(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
function ai(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[be] ??= e.nodeValue) && (e[be] = n, e.nodeValue = `${n}`);
}
function oi(e, t) {
	return li(e, t);
}
function si(t, n) {
	_n(), n.intro = n.intro ?? !1;
	let r = n.target, i = D, a = k;
	try {
		for (var o = /* @__PURE__ */ z(r); o && (o.nodeType !== 8 || o.data !== "[");) o = /* @__PURE__ */ B(o);
		if (!o) throw e;
		O(!0), A(o);
		let i = li(t, {
			...n,
			anchor: o
		});
		return O(!1), i;
	} catch (i) {
		if (i instanceof Error && i.message.split("\n").some((e) => e.startsWith("https://svelte.dev/e/"))) throw i;
		return i !== e && console.warn("Failed to hydrate: ", i), n.recover === !1 && He(), _n(), Sn(r), O(!1), oi(t, n);
	} finally {
		O(i), A(a);
	}
}
var ci = /* @__PURE__ */ new Map();
function li(t, { target: n, anchor: r, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	_n();
	var u = void 0, d = In(() => {
		var s = r ?? n.appendChild(R());
		ri(s, { pending: () => {} }, (n) => {
			rt({});
			var r = M;
			if (o && (r.c = o), a && (i.$$events = a), D && $(n, null), u = t(n, i) || at(), D && (q.nodes.end = k, k === null || k.nodeType !== 8 || k.data !== "]")) throw Te(), e;
			it();
		}, c);
		var d = /* @__PURE__ */ new Set(), f = (e) => {
			for (var t = 0; t < e.length; t++) {
				var r = e[t];
				if (!d.has(r)) {
					d.add(r);
					var i = Qr(r);
					for (let e of [n, document]) {
						var a = ci.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), ci.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Pr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return f(l(Tr)), Er.add(f), () => {
			for (var e of d) for (let r of [n, document]) {
				var t = ci.get(r), i = t.get(e);
				--i == 0 ? (r.removeEventListener(e, Pr), t.delete(e), t.size === 0 && ci.delete(r)) : t.set(e, i);
			}
			Er.delete(f), s !== r && s.parentNode?.removeChild(s);
		};
	});
	return ui.set(u, d), u;
}
var ui = /* @__PURE__ */ new WeakMap();
function di(e, t) {
	let n = ui.get(e);
	return n ? (ui.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var fi = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) Xn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Xn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (U(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Qn(r, t), t.append(R()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else U(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Jn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (U(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = F, r = Cn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = R();
				i.append(a), this.#n.set(e, {
					effect: H(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, H(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else D && (this.anchor = k), this.#a(n);
	}
};
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function pi(e, t, ...n) {
	var r = new fi(e);
	Vn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, se);
}
function mi(e) {
	M === null && Fe("onMount"), Mn(() => {
		let t = xr(e);
		if (typeof t == "function") return t;
	});
}
function hi(e) {
	M === null && Fe("onDestroy"), mi(() => () => xr(e));
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/attachments/index.js
function gi() {
	return Symbol(a);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/if.js
function _i(e, t, n = !1) {
	var r;
	D && (r = k, j());
	var i = new fi(e), a = n ? se : 0;
	function o(e, t) {
		if (D) {
			var n = je(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ae();
				A(a), i.anchor = a, O(!1), i.ensure(e, t), O(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Vn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/key.js
var vi = Symbol("NaN");
function yi(e, t, n) {
	D && j();
	var r = new fi(e), i = !ot();
	Vn(() => {
		var e = t();
		e !== e && (e = vi), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/each.js
function bi(e, t) {
	return t;
}
function xi(e, t, n) {
	for (var r = [], i = t.length, a, o = t.length, s = 0; s < i; s++) {
		let n = t[s];
		Jn(n, () => {
			if (a) {
				if (a.pending.delete(n), a.done.add(n), a.pending.size === 0) {
					var t = e.outrogroups;
					Si(e, l(a.done)), t.delete(a), t.size === 0 && (e.outrogroups = null);
				}
			} else --o;
		}, !1);
	}
	if (o === 0) {
		var c = r.length === 0 && n !== null && e.pending.size === 0;
		if (c) {
			var u = n, d = u.parentNode;
			Sn(d), d.append(u), e.items.clear();
		}
		Si(e, t, !c);
	} else a = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(a);
}
function Si(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= ce, Qn(a, document.createDocumentFragment())) : U(t[i], n);
	}
}
var Ci;
function wi(e, t, n, r, i, a = null) {
	var s = e, c = /* @__PURE__ */ new Map();
	if (t & 4) {
		var u = e;
		s = D ? A(/* @__PURE__ */ z(u)) : u.appendChild(R());
	}
	D && j();
	var d = null, f = /* @__PURE__ */ Dt(() => {
		var e = n();
		return o(e) ? e : e == null ? [] : l(e);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Ei(v, p, s, t, r), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= ce, Oi(d, null, s)) : Xn(d) : Jn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Vn(() => {
			p = Q(f);
			var e = p.length;
			let o = !1;
			D && je(s) === "[!" != (e === 0) && (s = Ae(), A(s), O(!1), o = !0);
			for (var l = /* @__PURE__ */ new Set(), u = F, v = Cn(), y = 0; y < e; y += 1) {
				D && k.nodeType === 8 && k.data === "]" && (s = k, o = !0, O(!1));
				var b = p[y], x = r(b, y), S = h ? null : c.get(x);
				S ? (S.v && an(S.v, b), S.i && an(S.i, y), v && u.unskip_effect(S.e)) : (S = Di(c, h ? s : Ci ??= R(), b, x, y, i, t, n), h || (S.e.f |= ce), c.set(x, S)), l.add(x);
			}
			if (e === 0 && a && !d && (h ? d = H(() => a(s)) : (d = H(() => a(Ci ??= R())), d.f |= ce)), e > l.size && Le("", "", ""), D && e > 0 && A(Ae()), !h) {
				if (m.set(u, l), v) {
					for (let [e, t] of c) l.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			o && O(!0), Q(f);
		}),
		flags: t,
		items: c,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, D && (s = k);
}
function Ti(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Ei(e, t, n, r, i) {
	var a = !!(r & 8), o = t.length, s = e.items, c = Ti(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (a) for (v = 0; v < o; v += 1) h = t[v], g = i(h, v), _ = s.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < o; v += 1) {
		if (h = t[v], g = i(h, v), _ = s.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Xn(_), a && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= ce, _ === c) Oi(_, null, n);
			else {
				var y = d ? d.next : c;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), ki(e, d, _), ki(e, _, y), Oi(_, y, n), d = _, p = [], m = [], c = Ti(d.next);
				continue;
			}
		}
		if (_ !== c) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], ee = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Oi(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					ki(e, S.prev, ee.next), ki(e, d, S), ki(e, ee, b), c = b, d = ee, --v, p = [], m = [];
				} else u.delete(_), Oi(_, c, n), ki(e, _.prev, _.next), ki(e, _, d === null ? e.effect.first : d.next), ki(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; c !== null && c !== _;) (u ??= /* @__PURE__ */ new Set()).add(c), m.push(c), c = Ti(c.next);
			if (c === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, c = Ti(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Si(e, l(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (c !== null || u !== void 0) {
		var te = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || te.push(_);
		for (; c !== null;) !(c.f & 8192) && c !== e.fallback && te.push(c), c = Ti(c.next);
		var C = te.length;
		if (C > 0) {
			var w = r & 4 && o === 0 ? n : null;
			if (a) {
				for (v = 0; v < C; v += 1) te[v].nodes?.a?.measure();
				for (v = 0; v < C; v += 1) te[v].nodes?.a?.fix();
			}
			xi(e, te, w);
		}
	}
	a && N(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Di(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? $t(n) : /* @__PURE__ */ tn(n, !1, !1) : null, l = o & 2 ? $t(i) : null;
	return {
		v: c,
		i: l,
		e: H(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Oi(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ B(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function ki(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Ai(t, n, a = !1, o = !1, s = !1, c = !1) {
	var l = t, u = "";
	if (a) {
		var d = t;
		D && (l = A(/* @__PURE__ */ z(d)));
	}
	Bn(() => {
		var t = q;
		if (u === (u = n() ?? "")) {
			D && j();
			return;
		}
		if (a && !D) {
			t.nodes = null, d.innerHTML = u, u !== "" && $(/* @__PURE__ */ z(d), d.lastChild);
			return;
		}
		if (t.nodes !== null && (Kn(t.nodes.start, t.nodes.end), t.nodes = null), u !== "") {
			if (D) {
				for (var c = k.data, f = j(), p = f; f !== null && (f.nodeType !== 8 || f.data !== "");) p = f, f = /* @__PURE__ */ B(f);
				if (f === null) throw Te(), e;
				$(k, p), l = A(f);
				return;
			}
			var m = wn(o ? "svg" : s ? "math" : "template", o ? r : s ? i : void 0);
			m.innerHTML = u;
			var h = o || s ? m : m.content;
			if ($(/* @__PURE__ */ z(h), h.lastChild), o || s) for (; /* @__PURE__ */ z(h);) l.before(/* @__PURE__ */ z(h));
			else l.before(h);
		}
	});
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/slot.js
function ji(e, t, n, r, i) {
	if (D && j(), t.$$host?.$$shadowRoot) {
		let t = wn("slot");
		if (n !== "default" && (t.name = n), Ur(e, t), i !== null) {
			let e = R();
			t.append(e), i(e);
		}
		return;
	}
	var a = t.$$slots?.[n], o = !1;
	a === !0 && (a = t[n === "default" ? "children" : n], o = !0), a === void 0 ? i !== null && i(e) : a(e, o ? () => r : r);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/svelte-component.js
function Mi(e, t, n) {
	var r;
	D && (r = k, j());
	var i = new fi(e);
	Vn(() => {
		var e = t() ?? null;
		if (D && je(r) === "[" != (e !== null)) {
			var a = Ae();
			A(a), i.anchor = a, O(!1), i.ensure(e, e && ((t) => n(t, e))), O(!0);
			return;
		}
		i.ensure(e, e && ((t) => n(t, e)));
	}, se);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/blocks/svelte-element.js
function Ni(e, t, n, i, a, o) {
	let s = D;
	D && j();
	var c = null;
	D && k.nodeType === 1 && (c = k, j());
	var l = D ? k : e, u = new fi(l, !1);
	Vn(() => {
		let e = t() || null;
		var o = a ? a() : n || e === "svg" ? r : void 0;
		if (e === null) {
			u.ensure(null, null);
			return;
		}
		return u.ensure(e, (t) => {
			if (e) {
				if (c = D ? c : wn(e, o), $(c, c), i) {
					var n = null;
					D && ei(e) && c.append(n = document.createComment(""));
					var r = D ? /* @__PURE__ */ z(c) : c.appendChild(R());
					D && (r === null ? O(!1) : A(r)), i(c, r), n?.remove();
				}
				q.nodes.end = c, t.before(c);
			}
			D && A(t);
		}), () => {};
	}, se), jn(() => {}), s && (O(!0), A(l));
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/css.js
function Pi(e, t) {
	Ln(() => {
		e = q?.parent?.nodes?.start ?? e;
		var n = e.getRootNode(), r = n.host ? n : n.head ?? n.ownerDocument.head;
		if (!r.querySelector("#" + t.hash)) {
			let e = wn("style");
			e.id = t.hash, e.textContent = t.code, r.appendChild(e);
		}
	});
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/actions.js
function Fi(e, t, n) {
	Ln(() => {
		var r = xr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			zn(() => {
				var e = n();
				Sr(e), i && Ne(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/attachments.js
function Ii(e, t) {
	var n = void 0, r;
	Hn(() => {
		n !== (n = t()) && (r &&= (U(r), null), n && (r = H(() => {
			Ln(() => n(e));
		})));
	});
}
//#endregion
//#region ../../node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function Li(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Li(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Ri() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Li(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/shared/attributes.js
function zi(e) {
	return typeof e == "object" ? Ri(e) : e ?? "";
}
var Bi = [..." 	\n\r\f\xA0\v﻿"];
function Vi(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Bi.includes(r[o - 1])) && (s === r.length || Bi.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Hi(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Ui(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Wi(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\/\*.*?\*\//g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Ui)), i && c.push(...Object.keys(i).map(Ui));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Ui(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += Hi(r)), i && (n += Hi(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/class.js
function Gi(e, t, n, r, i, a) {
	var o = e[ve];
	if (D || o !== n || o === void 0) {
		var s = Vi(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ve] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/style.js
function Ki(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function qi(e, t, n, r) {
	var i = e[ye];
	if (D || i !== t) {
		var a = Wi(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ye] = t;
	} else r && (Array.isArray(r) ? (Ki(e, n?.[0], r[0]), Ki(e, n?.[1], r[1], "important")) : Ki(e, n, r));
	return r;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function Ji(e, t) {
	t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function Yi(e, t) {
	var n = !("__defaultValue" in e);
	(n || e.__defaultValue !== t) && (e.__defaultValue = t, Xi(e, !n || "__value" in e));
}
function Xi(e, t) {
	var n = e.__defaultValue, r = e.multiple, i = r ? n ?? [] : null;
	if (!r || o(i)) {
		var a = e.selectedIndex, s = t && r ? new Set(e.selectedOptions) : null;
		for (var c of e.options) {
			var l = ea(c);
			Ji(c, r ? i.includes(l) : fn(l, n));
		}
		if (t) {
			if (s !== null) for (c of e.options) {
				var u = s.has(c);
				c.selected !== u && (c.selected = u);
			}
			else e.selectedIndex !== a && (e.selectedIndex = a);
		}
	}
}
function Zi(e, t, n = !1) {
	if (e.multiple) {
		if (t == null) return;
		if (!o(t)) return Ee();
		for (var r of e.options) r.selected = t.includes(ea(r));
		return;
	}
	for (r of e.options) if (fn(ea(r), t)) {
		r.selected = !0;
		return;
	}
	(!n || t !== void 0) && (e.selectedIndex = -1);
}
function Qi(e) {
	var t = new MutationObserver((t) => {
		t.every(ta) || ("__defaultValue" in e && Xi(e, !1), "__value" in e && Zi(e, e.__value));
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), jn(() => {
		t.disconnect();
	});
}
function $i(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	vt(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ea);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ea(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), Ln(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
			if (r.has(o)) return;
		}
		if (Zi(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ea(s), n(a));
		}
		e.__value = a, i = !1;
	});
}
function ea(e) {
	return "__value" in e ? e.__value : e.value;
}
function ta(e) {
	if (e.target.closest("selectedcontent") !== null) return !0;
	if (e.type === "childList") {
		var t = [...e.addedNodes, ...e.removedNodes];
		return t.length > 0 && t.every((e) => e.nodeName === "SELECTEDCONTENT");
	}
	return !1;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/attributes.js
var na = Symbol("class"), ra = Symbol("style"), ia = Symbol("is custom element"), aa = Symbol("is html"), oa = Ce ? "link" : "LINK", sa = Ce ? "input" : "INPUT", ca = Ce ? "option" : "OPTION", la = Ce ? "select" : "SELECT", ua = Ce ? "progress" : "PROGRESS";
function da(e) {
	if (D) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					ma(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					ma(e, "checked", null), e.checked = r;
				}
			}
		};
		e[xe] = n, N(n), gt();
	}
}
function fa(e, t) {
	var n = va(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === ua) && (e.value = t ?? "");
}
function pa(e, t) {
	var n = va(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function ma(e, t, n, r) {
	var i = va(e);
	D && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === oa) || i[t] !== (i[t] = n) && (t === "loading" && (e[he] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && ba(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function ha(e, t, n) {
	var r = W, i = q;
	let a = D;
	D && O(!1), K(null), J(null);
	try {
		t !== "style" && (ya.has(e.getAttribute("is") || e.nodeName) || !customElements || customElements.get(e.getAttribute("is") || e.nodeName.toLowerCase()) ? ba(e).has(t) : n && typeof n == "object") ? e[t] = n : ma(e, t, n == null ? n : String(n));
	} finally {
		K(r), J(i), a && O(!0);
	}
}
function ga(e, n, r, i, a = !1, o = !1) {
	D && a && e.nodeName === sa && ("defaultValue" in r || "defaultChecked" in r || da(e));
	var s = va(e), c = s[ia], l = !s[aa];
	let u = D && c;
	u && O(!1);
	var d = n || {}, f = e.nodeName === ca, p = e.nodeName === la;
	for (var m in n) !(m in r) && m[0] + m[1] !== "$$" && (r[m] = null);
	r.class ? r.class = zi(r.class) : (i || r[na]) && (r.class = null), r[ra] && (r.style ??= null);
	var h = ba(e);
	if (e.nodeName === sa && "type" in r && ("value" in r || "__value" in r)) {
		var g = r.type;
		(g !== d.type || g === void 0 && e.hasAttribute("type")) && (d.type = g, ma(e, "type", g, o));
	}
	for (let a in r) {
		let u = r[a];
		if (f && a === "value" && u == null) {
			e.value = e.__value = "", d[a] = u;
			continue;
		}
		if (a === "class") {
			Gi(e, e.namespaceURI === "http://www.w3.org/1999/xhtml", u, i, n?.[na], r[na]), d[a] = u, d[na] = r[na];
			continue;
		}
		if (a === "style") {
			qi(e, u, n?.[ra], r[ra]), d[a] = u, d[ra] = r[ra];
			continue;
		}
		var _ = d[a];
		if (u !== _ || u === void 0 && e.hasAttribute(a)) {
			d[a] = u;
			var v = a[0] + a[1];
			if (v !== "$$") {
				if (v === "on") {
					let t = {}, n = "$$" + a, r = a.slice(2);
					var y = qr(r);
					if (Gr(r) && (r = r.slice(0, -7), t.capture = !0), !y && _) {
						if (u != null) continue;
						e.removeEventListener(r, d[n], t), d[n] = null;
					}
					if (y) Ar(r, e, u), jr([r]);
					else if (u != null) {
						function i(e) {
							d[a].call(this, e);
						}
						d[n] = Dr(r, e, i, t);
					}
				} else if (a === "style") ma(e, a, u);
				else if (a === "autofocus") pt(e, !!u);
				else if (!c && (a === "__value" || a === "value" && u != null)) e.value = e.__value = u;
				else if (a === "selected" && f) Ji(e, u);
				else {
					var b = a;
					l || (b = Xr(b));
					var x = b === "defaultValue" || b === "defaultChecked";
					if (p && b === "defaultValue") continue;
					if (u == null && !c && !x) {
						if (s[a] = null, b === "value" || b === "checked") {
							let t = e, r = n === void 0;
							if (b === "value") {
								let e = t.defaultValue;
								t.removeAttribute(b), t.defaultValue = e, t.value = t.__value = r ? e : null;
							} else {
								let e = t.defaultChecked;
								t.removeAttribute(b), t.defaultChecked = e, t.checked = r ? e : !1;
							}
						} else e.removeAttribute(a);
					} else x || (c || typeof u != "string") && h.has(b) ? (e[b] = u, b in s && (s[b] = t)) : typeof u != "function" && ma(e, b, u, o);
				}
			}
		}
	}
	return u && O(!0), d;
}
function _a(e, t, n = [], r = [], i = [], a, o = !1, s = !1) {
	yt(i, n, r, (n) => {
		var r = void 0, i = {}, c = e.nodeName === la, l = !1;
		if (Hn(() => {
			var u = t(...n.map(Q)), d = ga(e, r, u, a, o, s);
			if (l && c) {
				var f = e;
				"defaultValue" in u && Yi(f, u.defaultValue), "value" in u && Zi(f, u.value);
			}
			for (let e of Object.getOwnPropertySymbols(i)) u[e] || U(i[e]);
			for (let t of Object.getOwnPropertySymbols(u)) {
				var p = u[t];
				t.description === "@attach" && (!r || p !== r[t]) && (i[t] && U(i[t]), i[t] = H(() => Ii(e, () => p))), d[t] = p;
			}
			r = d;
		}), c) {
			var u = e;
			Ln(() => {
				var e = r;
				"defaultValue" in e && Yi(u, e.defaultValue), Zi(u, e.value, !0), Qi(u);
			});
		}
		l = !0;
	});
}
function va(e) {
	return e[_e] ??= {
		[ia]: e.nodeName.includes("-"),
		[aa]: e.namespaceURI === n
	};
}
var ya = /* @__PURE__ */ new Map();
function ba(e) {
	var t = e.getAttribute("is") || e.nodeName, n = ya.get(t);
	if (n) return n;
	ya.set(t, n = /* @__PURE__ */ new Set());
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var o in r = p(i), r) r[o].set && o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.add(o);
		i = g(i);
	}
	return n;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function xa(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	vt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Ca(e) ? wa(a) : a, n(a), F !== null && r.add(F), await vr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || xr(t) == null && e.value) && (n(Ca(e) ? wa(e.value) : e.value), F !== null && r.add(F)), zn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
			if (r.has(i)) return;
		}
		Ca(e) && n === wa(e.value) || (e.type !== "date" || n || e.value) && n !== e.value && (e.value = n ?? "");
	});
}
function Sa(e, t, n = t) {
	vt(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (D && e.defaultChecked !== e.checked || xr(t) == null) && n(e.checked), zn(() => {
		e.checked = !!t();
	});
}
function Ca(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function wa(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ta(e, t) {
	return e === t || e?.[fe] === t;
}
function Ea(e = at(), t, n, r) {
	var i = M.r, a = q;
	return Ln(() => {
		var o, s;
		return zn(() => {
			o = s, s = r?.() || [], xr(() => {
				Ta(n(...s), e) || (t(e, ...s), o && Ta(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Ta(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/store.js
var Da = !1;
function Oa(e) {
	var t = Da;
	try {
		return Da = !1, [e(), Da];
	} finally {
		Da = t;
	}
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/internal/client/reactivity/props.js
var ka = {
	get(e, t) {
		if (!e.exclude.has(t)) return e.props[t];
	},
	set(e, t) {
		return !1;
	},
	getOwnPropertyDescriptor(e, t) {
		if (!e.exclude.has(t) && t in e.props) return {
			enumerable: !0,
			configurable: !0,
			value: e.props[t]
		};
	},
	has(e, t) {
		return !e.exclude.has(t) && t in e.props;
	},
	ownKeys(e) {
		return Reflect.ownKeys(e.props).filter((t) => !e.exclude.has(t));
	}
};
/*#__NO_SIDE_EFFECTS__*/
function Aa(e, t, n) {
	return new Proxy({
		props: e,
		exclude: t
	}, ka);
}
var ja = {
	get(e, t) {
		let n = e.props.length;
		for (; n--;) {
			let r = e.props[n];
			if (v(r) && (r = r()), typeof r == "object" && r && t in r) return r[t];
		}
	},
	set(e, t, n) {
		let r = e.props.length;
		for (; r--;) {
			let i = e.props[r];
			v(i) && (i = i());
			let a = f(i, t);
			if (a && a.set) return a.set(n), !0;
		}
		return !1;
	},
	getOwnPropertyDescriptor(e, t) {
		let n = e.props.length;
		for (; n--;) {
			let r = e.props[n];
			if (v(r) && (r = r()), typeof r == "object" && r && t in r) {
				let e = f(r, t);
				return e && !e.configurable && (e.configurable = !0), e;
			}
		}
	},
	has(e, t) {
		if (t === fe || t === me) return !1;
		for (let n of e.props) if (v(n) && (n = n()), n != null && t in n) return !0;
		return !1;
	},
	ownKeys(e) {
		let t = [];
		for (let n of e.props) if (v(n) && (n = n()), n) {
			for (let e in n) t.includes(e) || t.push(e);
			for (let e of Object.getOwnPropertySymbols(n)) t.includes(e) || t.push(e);
		}
		return t;
	}
};
function Ma(...e) {
	return new Proxy({ props: e }, ja);
}
function Na(e, t, n, r) {
	var i = !0, a = !!(n & 8), o = !!(n & 16), s = r, c = !0, l = void 0, u = () => o && i ? (l ??= /* @__PURE__ */ Ct(r), Q(l)) : (c && (c = !1, s = o ? xr(r) : r), s);
	let d;
	if (a) {
		var p = fe in e || me in e;
		d = f(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	a ? [m, h] = Oa(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = u(), d && (i && Ue(t), d(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? u() : (c = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (s = void 0), n === void 0 ? s : n;
	};
	if (i && !(n & 4)) return g;
	if (d) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && d(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? Ct : Dt)(() => (v = !1, g()));
	a && Q(y);
	var b = q;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? Q(y) : i && a ? un(e) : e;
			return L(y, n), v = !0, s !== void 0 && (s = n), e;
		}
		return tr && v || b.f & 16384 ? y.v : Q(y);
	});
}
//#endregion
//#region ../../node_modules/.pnpm/svelte@5.57.1/node_modules/svelte/src/legacy/legacy-client.js
function Pa(e) {
	return new Fa(e);
}
var Fa = class {
	#e;
	#t;
	constructor(e) {
		var t = /* @__PURE__ */ new Map(), n = (e, n) => {
			var r = /* @__PURE__ */ tn(n, !1, !1);
			return t.set(e, r), r;
		};
		let r = new Proxy({
			...e.props || {},
			$$events: {}
		}, {
			get(e, r) {
				return Q(t.get(r) ?? n(r, Reflect.get(e, r)));
			},
			has(e, r) {
				return r === me || (Q(t.get(r) ?? n(r, Reflect.get(e, r))), Reflect.has(e, r));
			},
			set(e, r, i) {
				return L(t.get(r) ?? n(r, i), i), Reflect.set(e, r, i);
			}
		});
		this.#t = (e.hydrate ? si : oi)(e.component, {
			target: e.target,
			anchor: e.anchor,
			props: r,
			context: e.context,
			intro: e.intro ?? !1,
			recover: e.recover,
			transformError: e.transformError
		}), (!e?.props?.$$host || e.sync === !1) && Ut(), this.#e = r.$$events;
		for (let e of Object.keys(this.#t)) e !== "$set" && e !== "$destroy" && e !== "$on" && d(this, e, {
			get() {
				return this.#t[e];
			},
			set(t) {
				this.#t[e] = t;
			},
			enumerable: !0
		});
		this.#t.$set = (e) => {
			Object.assign(r, e);
		}, this.#t.$destroy = () => {
			di(this.#t);
		};
	}
	$set(e) {
		this.#t.$set(e);
	}
	$on(e, t) {
		this.#e[e] = this.#e[e] || [];
		let n = (...e) => t.call(this, ...e);
		return this.#e[e].push(n), () => {
			this.#e[e] = this.#e[e].filter((e) => e !== n);
		};
	}
	$destroy() {
		this.#t.$destroy();
	}
}, Ia;
typeof HTMLElement == "function" && (Ia = class extends HTMLElement {
	$$ctor;
	$$s;
	$$c;
	$$cn = !1;
	$$d = {};
	$$r = !1;
	$$p_d = {};
	$$l = {};
	$$l_u = /* @__PURE__ */ new Map();
	$$me;
	$$shadowRoot = null;
	constructor(e, t, n) {
		super(), this.$$ctor = e, this.$$s = t, n && (this.$$shadowRoot = this.attachShadow(n));
	}
	addEventListener(e, t, n) {
		if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(t), this.$$c) {
			let n = this.$$c.$on(e, t);
			this.$$l_u.set(t, n);
		}
		super.addEventListener(e, t, n);
	}
	removeEventListener(e, t, n) {
		if (super.removeEventListener(e, t, n), this.$$c) {
			let e = this.$$l_u.get(t);
			e && (e(), this.$$l_u.delete(t));
		}
	}
	async connectedCallback() {
		if (this.$$cn = !0, !this.$$c) {
			if (await Promise.resolve(), !this.$$cn || this.$$c) return;
			function e(e) {
				return (t) => {
					let n = wn("slot");
					e !== "default" && (n.name = e), Ur(t, n);
				};
			}
			let t = {}, n = Ra(this);
			for (let r of this.$$s) r in n && (r === "default" && !this.$$d.children ? (this.$$d.children = e(r), t.default = !0) : t[r] = e(r));
			for (let e of this.attributes) {
				let t = this.$$g_p(e.name);
				t in this.$$d || (this.$$d[t] = La(t, e.value, this.$$p_d, "toProp"));
			}
			for (let e in this.$$p_d) !(e in this.$$d) && this[e] !== void 0 && (this.$$d[e] = this[e], delete this[e]);
			this.$$c = Pa({
				component: this.$$ctor,
				target: this.$$shadowRoot || this,
				props: {
					...this.$$d,
					$$slots: t,
					$$host: this
				}
			}), this.$$me = Fn(() => {
				zn(() => {
					this.$$r = !0;
					for (let e of u(this.$$c)) {
						if (!this.$$p_d[e]?.reflect) continue;
						this.$$d[e] = this.$$c[e];
						let t = La(e, this.$$d[e], this.$$p_d, "toAttribute");
						t == null ? this.removeAttribute(this.$$p_d[e].attribute || e) : this.setAttribute(this.$$p_d[e].attribute || e, t);
					}
					this.$$r = !1;
				});
			});
			for (let e in this.$$l) for (let t of this.$$l[e]) {
				let n = this.$$c.$on(e, t);
				this.$$l_u.set(t, n);
			}
			this.$$l = {};
		}
	}
	attributeChangedCallback(e, t, n) {
		this.$$r || (e = this.$$g_p(e), this.$$d[e] = La(e, n, this.$$p_d, "toProp"), this.$$c?.$set({ [e]: this.$$d[e] }));
	}
	disconnectedCallback() {
		this.$$cn = !1, Promise.resolve().then(() => {
			!this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
		});
	}
	$$g_p(e) {
		return u(this.$$p_d).find((t) => this.$$p_d[t].attribute === e || !this.$$p_d[t].attribute && t.toLowerCase() === e) || e;
	}
});
function La(e, t, n, r) {
	let i = n[e]?.type;
	if (t = i === "Boolean" && typeof t != "boolean" ? t != null : t, !r || !n[e]) return t;
	if (r === "toAttribute") switch (i) {
		case "Object":
		case "Array": return t == null ? null : JSON.stringify(t);
		case "Boolean": return t ? "" : null;
		case "Number": return t ?? null;
		default: return t;
	}
	else switch (i) {
		case "Object":
		case "Array": return t && JSON.parse(t);
		case "Boolean": return t;
		case "Number": return t == null ? t : +t;
		default: return t;
	}
}
function Ra(e) {
	let t = {};
	return e.childNodes.forEach((e) => {
		t[e.slot || "default"] = !0;
	}), t;
}
function za(e, t, n, r, i, a) {
	let o = class extends Ia {
		constructor() {
			super(e, n, i), this.$$p_d = t;
		}
		static get observedAttributes() {
			return u(t).map((e) => (t[e].attribute || e).toLowerCase());
		}
	};
	return u(t).forEach((e) => {
		d(o.prototype, e, {
			get() {
				return this.$$c && e in this.$$c ? this.$$c[e] : this.$$d[e];
			},
			set(n) {
				n = La(e, n, t), this.$$d[e] = n;
				var r = this.$$c;
				r && (f(r, e)?.get ? r[e] = n : r.$set({ [e]: n }));
			}
		});
	}), r.forEach((e) => {
		d(o.prototype, e, { get() {
			return this.$$c?.[e];
		} });
	}), a && (o = a(o)), e.element = o, o;
}
//#endregion
//#region ../../node_modules/.pnpm/openapi-fetch@0.17.0/node_modules/openapi-fetch/dist/index.mjs
var Ba = /\{[^{}]+\}/g, Va = () => typeof process == "object" && Number.parseInt(process?.versions?.node?.substring(0, 2)) >= 18 && process.versions.undici;
function Ha() {
	return Math.random().toString(36).slice(2, 11);
}
function Ua(e) {
	let { baseUrl: t = "", Request: n = globalThis.Request, fetch: r = globalThis.fetch, querySerializer: i, bodySerializer: a, pathSerializer: o, headers: s, requestInitExt: c = void 0, ...l } = { ...e };
	c = Va() ? c : void 0, t = Qa(t);
	let u = [];
	async function d(e, d) {
		let { baseUrl: f, fetch: p = r, Request: m = n, headers: h, params: g = {}, parseAs: _ = "json", querySerializer: v, bodySerializer: y = a ?? Ya, pathSerializer: b, body: x, middleware: S = [], ...ee } = d || {}, te = t;
		f && (te = Qa(f) ?? t);
		let C = typeof i == "function" ? i : qa(i);
		v && (C = typeof v == "function" ? v : qa({
			...typeof i == "object" ? i : {},
			...v
		}));
		let w = b || o || Ja, ne = x === void 0 ? void 0 : y(x, Za(s, h, g.header)), re = Za(ne === void 0 || ne instanceof FormData ? {} : { "Content-Type": "application/json" }, s, h, g.header), ie = [...u, ...S], ae = {
			redirect: "follow",
			...l,
			...ee,
			body: ne,
			headers: re
		}, oe, se, T = new m(Xa(e, {
			baseUrl: te,
			params: g,
			querySerializer: C,
			pathSerializer: w
		}), ae), E;
		for (let e in ee) e in T || (T[e] = ee[e]);
		if (ie.length) {
			oe = Ha(), se = Object.freeze({
				baseUrl: te,
				fetch: p,
				parseAs: _,
				querySerializer: C,
				bodySerializer: y,
				pathSerializer: w
			});
			for (let t of ie) if (t && typeof t == "object" && typeof t.onRequest == "function") {
				let n = await t.onRequest({
					request: T,
					schemaPath: e,
					params: g,
					options: se,
					id: oe
				});
				if (n) {
					if (n instanceof m) T = n;
					else if (n instanceof Response) {
						E = n;
						break;
					} else throw Error("onRequest: must return new Request() or Response() when modifying the request");
				}
			}
		}
		if (!E) {
			try {
				E = await p(T, c);
			} catch (t) {
				let n = t;
				if (ie.length) for (let t = ie.length - 1; t >= 0; t--) {
					let r = ie[t];
					if (r && typeof r == "object" && typeof r.onError == "function") {
						let t = await r.onError({
							request: T,
							error: n,
							schemaPath: e,
							params: g,
							options: se,
							id: oe
						});
						if (t) {
							if (t instanceof Response) {
								n = void 0, E = t;
								break;
							}
							if (t instanceof Error) {
								n = t;
								continue;
							}
							throw Error("onError: must return new Response() or instance of Error");
						}
					}
				}
				if (n) throw n;
			}
			if (ie.length) for (let t = ie.length - 1; t >= 0; t--) {
				let n = ie[t];
				if (n && typeof n == "object" && typeof n.onResponse == "function") {
					let t = await n.onResponse({
						request: T,
						response: E,
						schemaPath: e,
						params: g,
						options: se,
						id: oe
					});
					if (t) {
						if (!(t instanceof Response)) throw Error("onResponse: must return new Response() when modifying the response");
						E = t;
					}
				}
			}
		}
		let ce = E.headers.get("Content-Length");
		if (E.status === 204 || T.method === "HEAD" || ce === "0" && !E.headers.get("Transfer-Encoding")?.includes("chunked")) return E.ok ? {
			data: void 0,
			response: E
		} : {
			error: void 0,
			response: E
		};
		if (E.ok) return {
			data: await (async () => {
				if (_ === "stream") return E.body;
				if (_ === "json" && !ce) {
					let e = await E.text();
					return e ? JSON.parse(e) : void 0;
				}
				return await E[_]();
			})(),
			response: E
		};
		let le = await E.text();
		try {
			le = JSON.parse(le);
		} catch {}
		return {
			error: le,
			response: E
		};
	}
	return {
		request(e, t, n) {
			return d(t, {
				...n,
				method: e.toUpperCase()
			});
		},
		GET(e, t) {
			return d(e, {
				...t,
				method: "GET"
			});
		},
		PUT(e, t) {
			return d(e, {
				...t,
				method: "PUT"
			});
		},
		POST(e, t) {
			return d(e, {
				...t,
				method: "POST"
			});
		},
		DELETE(e, t) {
			return d(e, {
				...t,
				method: "DELETE"
			});
		},
		OPTIONS(e, t) {
			return d(e, {
				...t,
				method: "OPTIONS"
			});
		},
		HEAD(e, t) {
			return d(e, {
				...t,
				method: "HEAD"
			});
		},
		PATCH(e, t) {
			return d(e, {
				...t,
				method: "PATCH"
			});
		},
		TRACE(e, t) {
			return d(e, {
				...t,
				method: "TRACE"
			});
		},
		use(...e) {
			for (let t of e) if (t) {
				if (typeof t != "object" || !("onRequest" in t || "onResponse" in t || "onError" in t)) throw Error("Middleware must be an object with one of `onRequest()`, `onResponse() or `onError()`");
				u.push(t);
			}
		},
		eject(...e) {
			for (let t of e) {
				let e = u.indexOf(t);
				e !== -1 && u.splice(e, 1);
			}
		}
	};
}
function Wa(e, t, n) {
	if (t == null) return "";
	if (typeof t == "object") throw Error("Deeply-nested arrays/objects aren’t supported. Provide your own `querySerializer()` to handle these.");
	return `${e}=${n?.allowReserved === !0 ? t : encodeURIComponent(t)}`;
}
function Ga(e, t, n) {
	if (!t || typeof t != "object") return "";
	let r = [], i = {
		simple: ",",
		label: ".",
		matrix: ";"
	}[n.style] || "&";
	if (n.style !== "deepObject" && n.explode === !1) {
		for (let e in t) r.push(e, n.allowReserved === !0 ? t[e] : encodeURIComponent(t[e]));
		let i = r.join(",");
		switch (n.style) {
			case "form": return `${e}=${i}`;
			case "label": return `.${i}`;
			case "matrix": return `;${e}=${i}`;
			default: return i;
		}
	}
	for (let i in t) {
		let a = n.style === "deepObject" ? `${e}[${i}]` : i;
		r.push(Wa(a, t[i], n));
	}
	let a = r.join(i);
	return n.style === "label" || n.style === "matrix" ? `${i}${a}` : a;
}
function Ka(e, t, n) {
	if (!Array.isArray(t)) return "";
	if (n.explode === !1) {
		let r = {
			form: ",",
			spaceDelimited: "%20",
			pipeDelimited: "|"
		}[n.style] || ",", i = (n.allowReserved === !0 ? t : t.map((e) => encodeURIComponent(e))).join(r);
		switch (n.style) {
			case "simple": return i;
			case "label": return `.${i}`;
			case "matrix": return `;${e}=${i}`;
			default: return `${e}=${i}`;
		}
	}
	let r = {
		simple: ",",
		label: ".",
		matrix: ";"
	}[n.style] || "&", i = [];
	for (let r of t) n.style === "simple" || n.style === "label" ? i.push(n.allowReserved === !0 ? r : encodeURIComponent(r)) : i.push(Wa(e, r, n));
	return n.style === "label" || n.style === "matrix" ? `${r}${i.join(r)}` : i.join(r);
}
function qa(e) {
	return function(t) {
		let n = [];
		if (t && typeof t == "object") for (let r in t) {
			let i = t[r];
			if (i != null) {
				if (Array.isArray(i)) {
					if (i.length === 0) continue;
					n.push(Ka(r, i, {
						style: "form",
						explode: !0,
						...e?.array,
						allowReserved: e?.allowReserved || !1
					}));
					continue;
				}
				if (typeof i == "object") {
					n.push(Ga(r, i, {
						style: "deepObject",
						explode: !0,
						...e?.object,
						allowReserved: e?.allowReserved || !1
					}));
					continue;
				}
				n.push(Wa(r, i, e));
			}
		}
		return n.join("&");
	};
}
function Ja(e, t) {
	let n = e;
	for (let r of e.match(Ba) ?? []) {
		let e = r.substring(1, r.length - 1), i = !1, a = "simple";
		if (e.endsWith("*") && (i = !0, e = e.substring(0, e.length - 1)), e.startsWith(".") ? (a = "label", e = e.substring(1)) : e.startsWith(";") && (a = "matrix", e = e.substring(1)), !t || t[e] === void 0 || t[e] === null) continue;
		let o = t[e];
		if (Array.isArray(o)) {
			n = n.replace(r, Ka(e, o, {
				style: a,
				explode: i
			}));
			continue;
		}
		if (typeof o == "object") {
			n = n.replace(r, Ga(e, o, {
				style: a,
				explode: i
			}));
			continue;
		}
		if (a === "matrix") {
			n = n.replace(r, `;${Wa(e, o)}`);
			continue;
		}
		n = n.replace(r, a === "label" ? `.${encodeURIComponent(o)}` : encodeURIComponent(o));
	}
	return n;
}
function Ya(e, t) {
	return e instanceof FormData ? e : t && (t.get instanceof Function ? t.get("Content-Type") ?? t.get("content-type") : t["Content-Type"] ?? t["content-type"]) === "application/x-www-form-urlencoded" ? new URLSearchParams(e).toString() : JSON.stringify(e);
}
function Xa(e, t) {
	let n = `${t.baseUrl}${e}`;
	t.params?.path && (n = t.pathSerializer(n, t.params.path));
	let r = t.querySerializer(t.params.query ?? {});
	return r.startsWith("?") && (r = r.substring(1)), r && (n += `?${r}`), n;
}
function Za(...e) {
	let t = new Headers();
	for (let n of e) {
		if (!n || typeof n != "object") continue;
		let e = n instanceof Headers ? n.entries() : Object.entries(n);
		for (let [n, r] of e) if (r === null) t.delete(n);
		else if (Array.isArray(r)) for (let e of r) t.append(n, e);
		else r !== void 0 && t.set(n, r);
	}
	return t;
}
function Qa(e) {
	return e.endsWith("/") ? e.substring(0, e.length - 1) : e;
}
//#endregion
//#region ../agentflow-sdk/dist/app/revision.js
var $a = class {
	#e = /* @__PURE__ */ new Set();
	observe(e) {
		if (e === null) return;
		let t = Number(e.trim());
		if (!(!Number.isSafeInteger(t) || t < 0)) for (let e of this.#e) e(t);
	}
	listen(e) {
		return this.#e.add(e), () => this.#e.delete(e);
	}
}, eo = /* @__PURE__ */ new WeakMap(), to = (e, t) => eo.set(e, t), no = (e) => eo.get(e), ro = [
	{
		method: "POST",
		path: "/analytics/tiles/compute",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-catalog/submissions",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app-catalog/submissions/{submission_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-catalog/withdrawals",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app-deployments",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/app-deployments/{deployment_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments/{deployment_id}/approve",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments/{deployment_id}/cancel",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-deployments/{deployment_id}/plan",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-installations/{installation_id}/arm",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app-installations/{installation_id}/attention",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app-installations/{installation_id}/objects",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-packages",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/app-packages/lint",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app/agents/activity",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app/notification-preferences",
		idempotent: !1
	},
	{
		method: "PUT",
		path: "/app/notification-preferences",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/app/objects",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/attachments",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/attachments/{attachment_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/attachments/{attachment_id}/download",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/caller",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/dashboards",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/dashboards/{dashboard_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/dashboards/{dashboard_id}/compute",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/create-form",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/presence",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !1
	},
	{
		method: "PATCH",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !0
	},
	{
		method: "PUT",
		path: "/entities/{entity_id}/records/{record_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/activity",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/comments",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/comments",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/entities/{entity_id}/records/{record_id}/comments/{comment_id}",
		idempotent: !1
	},
	{
		method: "PATCH",
		path: "/entities/{entity_id}/records/{record_id}/comments/{comment_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/list-ops",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/mentioned-in",
		idempotent: !1
	},
	{
		method: "DELETE",
		path: "/entities/{entity_id}/records/{record_id}/presence",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/presence",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/provenance",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/runs",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/{record_id}/step",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/step/submit",
		idempotent: !0
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/assign",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/claim",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/reassign",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/{record_id}/work/release",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/batch-runs",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/batch-runs/{batch_run_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/entities/{entity_id}/records/batch-runs/{batch_run_id}/members",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/count",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/query",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/entities/{entity_id}/records/stats",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/events",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/events/stream",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/groups",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/groups/{group_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/identities",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/instances",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/instances/{instance_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/authorization/resume",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/cancel",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/pause",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/resume",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/instances/{instance_id}/retry",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/instances/{instance_id}/trace",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/instances/counts",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/me/units",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/mentions",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/mentions/people",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/notifications",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/notifications/{notification_id}/read",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/notifications/read-all",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/notifications/unread-count",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/platform",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/sandboxes",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes",
		idempotent: !1
	},
	{
		method: "DELETE",
		path: "/sandboxes/{sandbox_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/sandboxes/{sandbox_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/inbound",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/messages",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/messages-out",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/records",
		idempotent: !1
	},
	{
		method: "DELETE",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/records-out",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/records-out",
		idempotent: !1
	},
	{
		method: "PATCH",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/records-out",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/sandboxes/{sandbox_id}/connections/{connection_id}/sent",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes/{sandbox_id}/sign-in-links",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/sandboxes/{sandbox_id}/triggers/{trigger_id}/fire",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/search",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/units",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/units/{unit_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/upload-sets",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/upload-sets/{file_set_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/upload-sets/{file_set_id}/complete",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/upload-sets/{file_set_id}/files",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/upload-sets/{file_set_id}/files",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/users",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/users/{user_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/watched-folders",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/watched-folders/{file_set_id}/subfolders",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-event-types",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions",
		idempotent: !0
	},
	{
		method: "DELETE",
		path: "/webhook-subscriptions/{subscription_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}",
		idempotent: !1
	},
	{
		method: "PATCH",
		path: "/webhook-subscriptions/{subscription_id}",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}/deliveries",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/deliveries/{delivery_id}/redeliver",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/webhook-subscriptions/{subscription_id}/history",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/pause",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/resume",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/webhook-subscriptions/{subscription_id}/rotate-secret",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/work",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/workflow-versions/{version_id}/start-form",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/workflows/{workflow_id}/folder-preview",
		idempotent: !1
	},
	{
		method: "GET",
		path: "/workflows/{workflow_id}/input-contract",
		idempotent: !1
	},
	{
		method: "POST",
		path: "/workflows/{workflow_id}/instances",
		idempotent: !0
	},
	{
		method: "GET",
		path: "/workflows/startable",
		idempotent: !1
	}
], io = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", ao = ro.map((e) => ({
	op: e,
	re: RegExp("^" + e.path.replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/\{[^}]+\}/g, io) + "$")
}));
function oo(e, t) {
	let n = e.toUpperCase();
	return ao.find((e) => e.op.method === n && e.re.test(t))?.op;
}
//#endregion
//#region ../agentflow-sdk/dist/fetch.js
var so = /* @__PURE__ */ new Set([429, 503]), co = /* @__PURE__ */ new Set([
	"GET",
	"HEAD",
	"OPTIONS"
]), lo = 1e3, uo = 30;
function fo(e) {
	let t = e.headers.get("retry-after")?.trim();
	if (!t) return lo;
	let n = Number(t);
	return Number.isFinite(n) && n >= 0 ? Math.min(n, uo) * 1e3 : lo;
}
function po(e) {
	let t = new URL(e.baseUrl), n = e.fetch;
	return async (r) => {
		let i = new URL(r.url).pathname.slice(t.pathname.replace(/\/$/, "").length), a = oo(r.method, i), o = new Headers(r.headers);
		for (let [t, n] of Object.entries(await e.auth.headers())) o.set(t, n);
		a?.idempotent && !o.has("idempotency-key") && o.set("idempotency-key", crypto.randomUUID());
		let s = new Request(r, {
			headers: o,
			credentials: e.auth.credentials
		}), c = co.has(s.method) || o.has("idempotency-key");
		for (let t = 0;; t++) {
			let r = await n(s.clone());
			if (!(so.has(r.status) || r.status === 409 && (await r.clone().json().catch(() => ({})))?.type === "IDEMPOTENCY_KEY_IN_PROGRESS") || !c || t >= e.maxRetries) return e.onRevision?.(r.headers.get("agentflow-app-revision")), r;
			await new Promise((e) => setTimeout(e, fo(r)));
		}
	};
}
//#endregion
//#region ../agentflow-sdk/dist/client.js
function mo(e) {
	let t = new $a(), n = Ua({
		baseUrl: e.baseUrl,
		fetch: po({
			baseUrl: e.baseUrl,
			auth: e.auth,
			fetch: e.fetch ?? globalThis.fetch,
			maxRetries: e.maxRetries ?? 3,
			onRevision: (e) => t.observe(e)
		})
	});
	return to(n, t), n;
}
//#endregion
//#region ../agentflow-sdk/dist/figures/units.js
function ho(e) {
	return e === "count" || e === "count_distinct" || e === "count_filled" || e === "count_empty";
}
function go(e) {
	return e.type === "formula" ? e.formula_result_type ?? e.type : e.type === "auto_number" ? e.auto_number_format == null ? "number" : "text" : e.type;
}
function _o(e, t) {
	if (e.fn === "ratio") return { kind: "ratio" };
	if (e.duration) return {
		kind: "elapsed",
		unit: e.duration.unit
	};
	if (!e.fn) return { kind: "number" };
	if (ho(e.fn)) return { kind: "count" };
	if (!t) return { kind: "number" };
	let n = go(t);
	if ((n === "date" || n === "datetime") && (e.fn === "min" || e.fn === "max")) return { kind: "date" };
	switch (t.format) {
		case "currency": {
			let e = t.format_options?.currency_code;
			return {
				kind: "currency",
				code: typeof e == "string" ? e : "XXX"
			};
		}
		case "percent": return { kind: "percent" };
		case "duration": return { kind: "duration" };
		case "rating": return { kind: "rating" };
		default: return { kind: "number" };
	}
}
function vo(e) {
	return e.kind === "currency" ? `currency:${e.code}` : e.kind === "elapsed" ? `elapsed:${e.unit}` : e.kind;
}
function yo(e, t) {
	let n = e.field ?? e.ratio?.of;
	return n ? t?.find((e) => e.key === n) : void 0;
}
//#endregion
//#region ../agentflow-sdk/dist/figures/format.js
var bo = {
	comma_dot: "en-US",
	dot_comma: "de-DE",
	space_comma: "fr-FR"
};
function xo(e) {
	let t = e?.format_options;
	return typeof t == "object" && t && !Array.isArray(t) ? t : {};
}
var So = /* @__PURE__ */ new Map(), Co = 256;
function wo(e, t) {
	let n = JSON.stringify([e, t]), r = So.get(n);
	return r || (r = new Intl.NumberFormat(e, t), So.size >= Co && So.clear(), So.set(n, r)), r;
}
function To(e, t = {}, n, r) {
	let i = e?.separators ?? "locale", a = { ...t };
	return i === "none" && (a.useGrouping = !1), e?.decimal_places == null ? r !== void 0 && r !== 0 && Math.abs(r) < 1 && (a.maximumSignificantDigits = 3) : (a.minimumFractionDigits = e.decimal_places, a.maximumFractionDigits = e.decimal_places), wo(bo[i] ?? n, a);
}
var Eo = (e) => String(e).padStart(2, "0"), Do = (e) => String(e).padStart(4, "0");
function Oo(e, t) {
	let n = e < 0 ? "-" : "", r = Math.abs(Math.round(e)), i = Math.floor(r / 3600), a = Math.floor(r % 3600 / 60), o = r % 60;
	if (t === "hh_mm") return `${n}${i}:${Eo(a)}`;
	if (t === "hh_mm_ss") return `${n}${i}:${Eo(a)}:${Eo(o)}`;
	let s = [];
	return i && s.push(`${i}h`), a && s.push(`${a}m`), o && !i && s.push(`${o}s`), s.length === 0 && s.push("0s"), n + s.join(" ");
}
function ko(e, t, n, r) {
	if (!Number.isFinite(e)) return String(e);
	switch (t) {
		case "currency": try {
			return To(n, {
				style: "currency",
				currency: n?.currency_code ?? "USD"
			}, r).format(e);
		} catch {
			return To(n, {}, r).format(e);
		}
		case "percent": return `${To(n, {}, r, e).format(e)}%`;
		case "duration": {
			let t = n?.duration_unit ?? "seconds";
			return Oo(e * (t === "hours" ? 3600 : t === "minutes" ? 60 : 1), n?.duration_format ?? "human");
		}
		case "rating": {
			let t = Math.min(Math.max(Math.round(n?.rating_max ?? 5), 1), 10), r = Math.min(Math.max(Math.round(e), 0), t);
			return "★".repeat(r) + "☆".repeat(t - r);
		}
		default: return To(n, {}, r, e).format(e);
	}
}
var Ao = {
	minutes: "minute",
	hours: "hour",
	days: "day"
};
function jo(e, t, n) {
	let r = Ao[t];
	return r ? wo(n, {
		style: "unit",
		unit: r,
		unitDisplay: "short",
		maximumFractionDigits: 2
	}).format(e) : ko(e, void 0, void 0, n);
}
function Mo(e, t) {
	let n = (/* @__PURE__ */ new Date(e * 1e3)).toISOString();
	return t === "datetime" ? n : n.slice(0, 10);
}
var No = /^(\d{4})-(\d{2})-(\d{2})$/;
function Po(e, t) {
	let n = e.trim(), r = No.exec(n.slice(0, 10));
	if (!r || !(t || n.length === 10)) return new Date(e);
	let [i, a, o] = [
		Number(r[1]),
		Number(r[2]),
		Number(r[3])
	], s = new Date(i, a - 1, o);
	return s.setFullYear(i), s.getFullYear() === i && s.getMonth() === a - 1 && s.getDate() === o ? s : /* @__PURE__ */ new Date(NaN);
}
function Fo(e, t, n) {
	let r = (e.getTime() - t.getTime()) / 1e3, i = Math.abs(r);
	for (let [e, t] of [
		["year", 31536e3],
		["month", 2592e3],
		["week", 604800],
		["day", 86400],
		["hour", 3600],
		["minute", 60]
	]) if (i >= t) return n.format(Math.trunc(r / t), e);
	return n.format(Math.trunc(r), "second");
}
var Io = new Date(Date.UTC(2026, 0, 1)), Lo = new Date(Date.UTC(2026, 6, 1)), Ro = () => Io.getTimezoneOffset() * 2048 + Lo.getTimezoneOffset();
function zo(e, t, n, r, i) {
	let a = /* @__PURE__ */ new Map(), o = Ro(), s = (e, t) => {
		let n = a.get(e);
		return n || (n = t(), a.set(e, n)), n;
	}, c = () => s("time", () => n.time_style === "12h" ? new Intl.DateTimeFormat(r ?? "en-US", {
		hour: "numeric",
		minute: "2-digit",
		hour12: !0
	}) : new Intl.DateTimeFormat(r ?? "en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: !1
	})), l = () => s("long", () => new Intl.DateTimeFormat(r, {
		day: "numeric",
		month: "short",
		year: "numeric"
	})), u = () => s("month", () => new Intl.DateTimeFormat(r, {
		month: "short",
		year: "numeric"
	})), d = () => s("relative", () => new Intl.RelativeTimeFormat(r, { numeric: "auto" })), f = () => s("day", () => new Intl.DateTimeFormat(r ?? "en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric"
	}));
	return (n) => {
		let r = Ro();
		r !== o && (o = r, a.clear());
		let s = Po(n, i);
		if (Number.isNaN(s.getTime())) return n;
		let p = Eo(s.getDate()), m = Eo(s.getMonth() + 1), h = Do(s.getFullYear()), g;
		switch (t) {
			case "dd_mm_yyyy":
				g = `${p}/${m}/${h}`;
				break;
			case "mm_dd_yyyy":
				g = `${m}/${p}/${h}`;
				break;
			case "iso":
				g = `${h}-${m}-${p}`;
				break;
			case "long":
				g = l().format(s);
				break;
			case "month_year": return u().format(s);
			case "relative": return Fo(s, /* @__PURE__ */ new Date(), d());
			default: {
				let t = f().format(s);
				return e ? `${t} · ${c().format(s)}` : t;
			}
		}
		return e ? `${g} ${c().format(s)}` : g;
	};
}
function Bo(e, t, n, r) {
	return t == null ? "—" : Ho(e, n, r)(t);
}
function Vo(e, t, n) {
	let r = Ho(e, t, n);
	return (e) => e == null ? "—" : r(e);
}
function Ho(e, t, n) {
	if (e.fn === "ratio") {
		let e = xo(t);
		return (t) => ko(t, void 0, e, n);
	}
	let r = e.duration;
	if (r) return (e) => jo(e, r.unit, n);
	if (!e.fn || !t || ho(e.fn)) return (e) => ko(e, void 0, void 0, n);
	let i = go(t), a = xo(t);
	if ((i === "date" || i === "datetime") && (e.fn === "min" || e.fn === "max")) {
		let e = zo(i === "datetime", t.format, a, n, i === "date");
		return (t) => e(Mo(t, i));
	}
	let o = t.format;
	return (e) => ko(e, o, a, n);
}
function Uo(e, t) {
	return e == null || !Number.isFinite(e) ? null : wo(t, {
		style: "percent",
		maximumFractionDigits: 1,
		signDisplay: "exceptZero"
	}).format(e).replace("-", "−");
}
var Wo = 1e3;
function Go(e, t, n) {
	return e == null || !Number.isFinite(e) ? "—" : wo(n, {
		style: "percent",
		maximumFractionDigits: t != null && t < Wo ? 0 : 1
	}).format(e);
}
function Ko(e, t, n, r, i) {
	if (n == null || r == null) return null;
	let a = n - r;
	return _o(e, t).kind === "percent" ? {
		distance: ko(Math.abs(a), void 0, { decimal_places: 1 }, i),
		short: a < 0,
		met: a === 0,
		points: !0
	} : {
		distance: Bo(e, Math.abs(a), t, i),
		short: a < 0,
		met: a === 0,
		points: !1
	};
}
//#endregion
//#region ../agentflow-sdk/dist/modules/tokens.js
var qo = {
	"--af-warning": "oklch(0.666 0.179 58.318)",
	"--af-success": "oklch(0.596 0.145 163.225)",
	"--af-radius": "0.625rem",
	"--af-font-sans": "ui-sans-serif, system-ui, sans-serif",
	"--af-font-mono": "ui-monospace, SFMono-Regular, Menlo, monospace"
}, Jo = {
	light: {
		"--af-chart-1": "#2a78d6",
		"--af-chart-2": "#eb6834",
		"--af-chart-3": "#1baf7a",
		"--af-chart-4": "#eda100",
		"--af-chart-5": "#e87ba4",
		"--af-chart-6": "#008300",
		"--af-chart-7": "#6250d6",
		"--af-chart-8": "#e34948",
		"--af-chart-other": "#f0efec",
		"--af-chart-hatch": "#898781",
		"--af-chart-grid": "#e1e0d9",
		"--af-chart-axis": "#c3c2b7"
	},
	dark: {
		"--af-chart-1": "#3987e5",
		"--af-chart-2": "#d95926",
		"--af-chart-3": "#199e70",
		"--af-chart-4": "#c98500",
		"--af-chart-5": "#d55181",
		"--af-chart-6": "#008300",
		"--af-chart-7": "#9085e9",
		"--af-chart-8": "#e66767",
		"--af-chart-other": "#383835",
		"--af-chart-hatch": "#898781",
		"--af-chart-grid": "#2c2c2a",
		"--af-chart-axis": "#383835"
	}
};
({
	...qo,
	...Jo.light
}), {
	...qo,
	...Jo.dark
};
//#endregion
//#region src/version.ts
var Yo = "0.15.0";
function Xo(e, t) {
	if (typeof e != "string") return !0;
	let n = e.split(".").map((e) => Number.parseInt(e, 10) || 0), r = t.split(".").map((e) => Number.parseInt(e, 10) || 0);
	for (let e = 0; e < 3; e++) if ((n[e] ?? 0) !== (r[e] ?? 0)) return (n[e] ?? 0) < (r[e] ?? 0);
	return !1;
}
//#endregion
//#region src/kit/version.ts
var Zo = Yo;
//#endregion
export { Br as $, Qi as A, tt as At, Ai as B, _a as C, Ut as Ct, ha as D, nt as Dt, pa as E, et as Et, Fi as F, ee as Ft, gi as G, bi as H, Pi as I, y as It, pi as J, hi as K, Ni as L, S as Lt, Gi as M, Je as Mt, zi as N, ke as Nt, fa as O, it as Ot, Ii as P, Oe as Pt, Rr as Q, Mi as R, xa as S, sn as St, ma as T, mt as Tt, yi as U, wi as V, _i as W, Ur as X, ai as Y, Hr as Z, Na as _, un as _t, ko as a, Or as at, Ea as b, $t as bt, Ko as c, xr as ct, yo as d, Mn as dt, Wr as et, vo as f, Pn as ft, za as g, xn as gt, no as h, bn as ht, Bo as i, kr as it, qi as j, Xe as jt, $i as k, rt as kt, Vo as l, cr as lt, mo as m, yn as mt, Yo as n, jr as nt, Uo as o, Q as ot, _o as p, vn as pt, mi as q, Xo as r, Ar as rt, Go as s, vr as st, Zo as t, Vr as tt, go as u, Bn as ut, Aa as v, cn as vt, da as w, Et as wt, Sa as x, en as xt, Ma as y, L as yt, ji as z };
