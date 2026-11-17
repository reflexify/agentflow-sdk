import { Ct as e, I as t, It as n, J as r, Lt as i, Ot as a, Pt as o, Q as s, R as c, T as l, W as u, X as d, Z as f, _ as p, b as m, dt as h, et as g, g as _, gt as v, j as y, kt as b, mt as x, ot as S, pt as C, ut as ee, v as w, wt as T, xt as te, y as E, yt as D } from "./version-KzierYvT.js";
import { Et as O, I as k, M as A, a as j, at as M, b as N, c as P, d as ne, dt as re, et as F, g as I, h as ie, i as ae, l as oe, lt as se, n as ce, o as le, p as ue, pt as de, r as fe, s as pe, tt as L, u as R, v as z, vt as me } from "./use-locale-context-C2kEPdyN.js";
import { d as he, l as B, r as ge } from "./set-DGbwAd8v.js";
//#region ../../node_modules/.pnpm/@zag-js+utils@1.43.3/node_modules/@zag-js/utils/dist/number.mjs
var { floor: _e, abs: ve, round: ye, min: be, max: xe, pow: Se, sign: Ce } = Math, we = (e) => Number.isNaN(e), V = (e) => we(e) ? 0 : e, Te = (e, t) => (e % t + t) % t, Ee = (e, t) => V(e) >= t, De = (e, t) => V(e) <= t, Oe = (e, t, n) => {
	let r = V(e);
	return (t == null || r >= t) && (n == null || r <= n);
}, H = (e, t, n) => be(xe(V(e), t), n), ke = (e, t) => typeof t == "number" ? _e(e * t + .5) / t : ye(e), Ae = (e) => {
	if (!Number.isFinite(e)) return 0;
	let t = 1, n = 0;
	for (; Math.round(e * t) / t !== e;) t *= 10, n += 1;
	return n;
}, je = (e, t, n) => {
	let r = t === "+" ? e + n : e - n;
	if (e % 1 != 0 || n % 1 != 0) {
		let i = 10 ** Math.max(Ae(e), Ae(n));
		e = Math.round(e * i), n = Math.round(n * i), r = t === "+" ? e + n : e - n, r /= i;
	}
	return r;
}, Me = (e, t) => je(V(e), "+", t), Ne = (e, t) => je(V(e), "-", t), U = (e) => typeof e == "number" ? `${e}px` : e, W = "default", Pe = "", Fe = /* @__PURE__ */ new WeakMap();
function Ie(e = {}) {
	let { target: t, doc: n } = e, r = n ?? document, i = r.documentElement;
	return A() ? (W === "default" && (Pe = i.style.webkitUserSelect, i.style.webkitUserSelect = "none"), W = "disabled") : t && (Fe.set(t, t.style.userSelect), t.style.userSelect = "none"), () => Le({
		target: t,
		doc: r
	});
}
function Le(e = {}) {
	let { target: t, doc: n } = e, r = (n ?? document).documentElement;
	if (A()) {
		if (W !== "disabled") return;
		W = "restoring", setTimeout(() => {
			ue(() => {
				W === "restoring" && (r.style.webkitUserSelect === "none" && (r.style.webkitUserSelect = Pe || ""), Pe = "", W = "default");
			});
		}, 300);
	} else if (t && Fe.has(t)) {
		let e = Fe.get(t);
		t.style.userSelect === "none" && (t.style.userSelect = e ?? ""), t.getAttribute("style") === "" && t.removeAttribute("style"), Fe.delete(t);
	}
}
function Re(e = {}) {
	let { defer: t, target: n, ...r } = e, i = t ? ie : (e) => e(), a = [];
	return a.push(i(() => {
		let e = typeof n == "function" ? n() : n;
		a.push(Ie({
			...r,
			target: e
		}));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/pointer-move.mjs
function ze(e, t) {
	let { onPointerMove: n, onPointerUp: r } = t, i = (e) => {
		let t = z(e);
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
		let t = z(e);
		r({
			point: t,
			event: e
		});
	}, o = [
		I(e, "pointermove", i, !1),
		I(e, "pointerup", a, !1),
		I(e, "pointercancel", a, !1),
		I(e, "contextmenu", a, !1),
		Re({ doc: e })
	];
	return () => {
		o.forEach((e) => e());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/use-scroll-area-context.js
var [Be, G] = pe({
	name: "ScrollAreaContext",
	hookName: "useScrollAreaContext",
	providerName: "<ScrollAreaProvider />"
}), Ve = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function He(t, n) {
	b(n, !0);
	let r = p(n, "ref", 15, null), i = w(n, Ve), o = G(), s = T(() => R(o().getContentProps(), i));
	return P(t, E({ as: "div" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), a({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
_(He, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/scroll-area-corner.svelte
var Ue = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function We(t, n) {
	b(n, !0);
	let r = p(n, "ref", 15, null), i = w(n, Ue), o = G(), s = T(() => R(o().getCornerProps(), i));
	return P(t, E({ as: "div" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), a({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
_(We, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/chunk-QZ7TP4HQ.mjs
var Ge = Object.defineProperty, Ke = (e, t, n) => t in e ? Ge(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, qe = (e, t, n) => Ke(e, typeof t == "symbol" ? t : t + "", n), K = j("scroll-area").parts("root", "viewport", "content", "scrollbar", "thumb", "corner").build(), q = (e) => e.ids?.root ?? `scroll-area-${e.id}`, Je = (e) => e.ids?.viewport ?? `scroll-area-${e.id}:viewport`, Ye = (e) => e.ids?.content ?? `scroll-area-${e.id}:content`, J = (e) => e.getById(q(e)), Y = (e) => e.getById(Je(e)), Xe = (e) => e.getById(Ye(e)), X = (e) => B(J(e), `[data-part=scrollbar][data-orientation=horizontal]${L(q(e))}`), Z = (e) => B(J(e), `[data-part=scrollbar][data-orientation=vertical]${L(q(e))}`), Ze = (e) => B(X(e), `[data-part=thumb][data-orientation=horizontal]${L(q(e))}`), Qe = (e) => B(Z(e), `[data-part=thumb][data-orientation=vertical]${L(q(e))}`), $e = (e) => B(J(e), `[data-part=corner]${L(q(e))}`);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-progress.mjs
function et(e, t) {
	if (!e) return tt;
	let n = 0, r = 0, i = e.scrollWidth - e.clientWidth;
	i > t && (n = Math.min(1, Math.max(0, e.scrollLeft / i)));
	let a = e.scrollHeight - e.clientHeight;
	return a > t && (r = Math.min(1, Math.max(0, e.scrollTop / a))), {
		x: n,
		y: r
	};
}
var tt = {
	x: 0,
	y: 0
}, nt = 300, rt = (e) => e * (2 - e);
function it(e, t = {}) {
	let { top: n, left: r, duration: i = nt, easing: a = rt, onComplete: o } = t;
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
function at(e, t = {}) {
	if (!e) return;
	let { top: n, left: r, behavior: i = "smooth", easing: a, duration: o } = t;
	if (i === "smooth") it(e, {
		top: n,
		left: r,
		easing: a,
		duration: o
	});
	else {
		let t = re({
			behavior: i,
			top: n,
			left: r
		});
		e.scrollTo(t);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-to-edge.mjs
function ot(e, t, n, r = "smooth", i, a) {
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
	if (r === "smooth") it(e, {
		top: l,
		left: u,
		easing: i,
		duration: a
	});
	else {
		let t = re({
			left: u,
			top: l,
			behavior: r
		});
		e.scrollTo(t);
	}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/scroll-area.connect.mjs
function st(e, t) {
	let { state: n, send: r, context: i, prop: a, scope: o } = e, s = n.matches("dragging"), c = i.get("hovering"), l = i.get("cornerSize"), u = i.get("thumbSize"), d = i.get("hiddenState"), f = i.get("atSides");
	return {
		isAtTop: f.top,
		isAtBottom: f.bottom,
		isAtLeft: f.left,
		isAtRight: f.right,
		hasOverflowX: !d.scrollbarXHidden,
		hasOverflowY: !d.scrollbarYHidden,
		getScrollProgress() {
			return et(Y(o), 0);
		},
		scrollToEdge(e) {
			let { edge: t, behavior: n } = e;
			return ot(Y(o), t, a("dir"), n);
		},
		scrollTo(e) {
			return at(Y(o), e);
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
				...K.root.attrs,
				id: q(o),
				dir: a("dir"),
				role: "presentation",
				"data-overflow-x": F(!d.scrollbarXHidden),
				"data-overflow-y": F(!d.scrollbarYHidden),
				onPointerEnter(e) {
					let t = N(e);
					k(e.currentTarget, t) && r({
						type: "root.pointerenter",
						pointerType: e.pointerType
					});
				},
				onPointerMove(e) {
					let t = N(e);
					k(e.currentTarget, t) && r({
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
					k(e.currentTarget, e.relatedTarget) || r({ type: "root.pointerleave" });
				},
				style: {
					position: "relative",
					"--corner-width": U(l?.width),
					"--corner-height": U(l?.height),
					"--thumb-width": U(u?.width),
					"--thumb-height": U(u?.height)
				}
			});
		},
		getViewportProps() {
			let e = () => {
				r({ type: "user.scroll" });
			};
			return t.element({
				...K.viewport.attrs,
				role: "presentation",
				"data-ownedby": q(o),
				id: Je(o),
				"data-at-top": F(f.top),
				"data-at-bottom": F(f.bottom),
				"data-at-left": F(f.left),
				"data-at-right": F(f.right),
				"data-overflow-x": F(!d.scrollbarXHidden),
				"data-overflow-y": F(!d.scrollbarYHidden),
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
				...K.content.attrs,
				id: Ye(o),
				role: "presentation",
				"data-overflow-x": F(!d.scrollbarXHidden),
				"data-overflow-y": F(!d.scrollbarYHidden),
				style: { minWidth: "fit-content" }
			});
		},
		getScrollbarProps(e = {}) {
			let { orientation: n = "vertical" } = e;
			return t.element({
				...K.scrollbar.attrs,
				"data-ownedby": q(o),
				"data-orientation": n,
				"data-scrolling": F(i.get(n === "horizontal" ? "scrollingX" : "scrollingY")),
				"data-hover": F(c),
				"data-dragging": F(s),
				"data-overflow-x": F(!d.scrollbarXHidden),
				"data-overflow-y": F(!d.scrollbarYHidden),
				onPointerUp() {
					r({
						type: "scrollbar.pointerup",
						orientation: n
					});
				},
				onPointerDown(e) {
					if (e.button !== 0 || e.currentTarget !== e.target) return;
					let t = z(e);
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
				...K.thumb.attrs,
				"data-ownedby": q(o),
				"data-orientation": n,
				"data-hover": F(c),
				"data-dragging": F(s),
				onPointerDown(e) {
					if (e.button !== 0) return;
					let t = z(e);
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
				...K.corner.attrs,
				"data-ownedby": q(o),
				"data-hover": F(c),
				"data-state": d.cornerHidden ? "hidden" : "visible",
				"data-overflow-x": F(!d.scrollbarXHidden),
				"data-overflow-y": F(!d.scrollbarYHidden),
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
function Q(e, t, n) {
	if (!e) return 0;
	let r = he(e), i = n === "x" ? "Inline" : "Block";
	return n === "x" && t === "margin" ? parseFloat(r[`${t}InlineStart`]) * 2 : parseFloat(r[`${t}${i}Start`]) + parseFloat(r[`${t}${i}End`]);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+scroll-area@1.43.3/node_modules/@zag-js/scroll-area/dist/utils/scroll-sides.mjs
function ct(e, t) {
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
var $ = 0, lt = class {
	constructor() {
		qe(this, "currentId", $), qe(this, "clear", () => {
			this.currentId !== $ && (clearTimeout(this.currentId), this.currentId = $);
		}), qe(this, "disposeEffect", () => this.clear);
	}
	start(e, t) {
		this.clear(), this.currentId = setTimeout(() => {
			this.currentId = $, t();
		}, e);
	}
	isStarted() {
		return this.currentId !== $;
	}
}, ut = 20, dt = 1e3, ft = M({
	props({ props: e }) {
		return se(e, ["id"]), e;
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
			scrollYTimeout: new lt(),
			scrollXTimeout: new lt(),
			scrollEndTimeout: new lt(),
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
				let r = Y(t);
				if (!r) return;
				let i = r.scrollHeight, a = r.scrollWidth;
				if (i === 0 || a === 0) return;
				let o = Z(t), s = X(t), c = Qe(t), l = Ze(t), u = r.clientHeight, d = r.clientWidth, f = r.scrollTop, p = r.scrollLeft, m = u >= i, h = d >= a, g = d / a, _ = u / i, v = h ? 0 : d, y = m ? 0 : u, b = Q(s, "padding", "x"), x = Q(o, "padding", "y"), S = Q(l, "margin", "x"), C = Q(c, "margin", "y"), ee = v - b - S, w = y - x - C, T = s ? Math.min(s.offsetWidth, ee) : ee, te = o ? Math.min(o.offsetHeight, w) : w, E = Math.max(ut, T * g), D = Math.max(ut, te * _);
				if (e.set("thumbSize", (e) => e.height === D && e.width === E ? e : {
					width: E,
					height: D
				}), o && c) {
					let e = o.offsetHeight - D - x - C, t = f / (i - u), n = Math.min(e, Math.max(0, t * e));
					c.style.transform = `translate3d(0,${n}px,0)`;
				}
				if (s && l) {
					let e = s.offsetWidth - E - b - S, t = p / (a - d), r = n("dir") === "rtl" ? H(t * e, -e, 0) : H(t * e, 0, e);
					l.style.transform = `translate3d(${r}px,0,0)`;
				}
				if ($e(t)) {
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
					let t = ct(r, n("dir"));
					return O(e, t) ? e : t;
				});
				let k = Math.max(0, i - u), A = Math.max(0, a - d), j = 0, M = 0;
				h || (j = n("dir") === "rtl" ? H(-p, 0, A) : H(p, 0, A), M = A - j);
				let N = m ? 0 : H(f, 0, k), P = m ? 0 : k - N;
				ge(r, "--scroll-area-overflow-x-start", `${j}px`), ge(r, "--scroll-area-overflow-x-end", `${M}px`), ge(r, "--scroll-area-overflow-y-start", `${N}px`), ge(r, "--scroll-area-overflow-y-end", `${P}px`);
			},
			checkHovering({ scope: e, context: t }) {
				Y(e)?.matches(":hover") && t.set("hovering", !0);
			},
			setScrolling({ event: e, refs: t, context: n, prop: r }) {
				let i = {
					x: e.target.scrollLeft,
					y: e.target.scrollTop
				}, a = t.get("scrollPosition"), o = i.x - a.x, s = i.y - a.y;
				t.set("scrollPosition", i), n.set("atSides", (t) => {
					let n = ct(e.target, r("dir"));
					return O(t, n) ? t : n;
				}), s !== 0 && (n.set("scrollingY", !0), t.get("scrollYTimeout").start(dt, () => {
					n.set("scrollingY", !1);
				})), o !== 0 && (n.set("scrollingX", !0), t.get("scrollXTimeout").start(dt, () => {
					n.set("scrollingX", !1);
				}));
			},
			scrollToPointer({ event: e, scope: t, prop: n }) {
				let r = Y(t);
				if (!r) return;
				let i = Qe(t), a = Z(t), o = Ze(t), s = X(t), c = e.point;
				if (i && a && e.orientation === "vertical") {
					let e = Q(i, "margin", "y"), t = Q(a, "padding", "y"), n = i.offsetHeight, o = a.getBoundingClientRect(), s = c.y - o.top - n / 2 - t + e / 2, l = r.scrollHeight, u = r.clientHeight;
					r.scrollTop = s / (a.offsetHeight - n - t - e) * (l - u);
				}
				if (o && s && e.orientation === "horizontal") {
					let e = Q(o, "margin", "x"), t = Q(s, "padding", "x"), i = o.offsetWidth, a = s.getBoundingClientRect(), l = c.x - a.left - i / 2 - t + e / 2, u = r.scrollWidth, d = r.clientWidth, f = l / (s.offsetWidth - i - t - e), p;
					n("dir") === "rtl" ? (p = (1 - f) * (u - d), r.scrollLeft <= 0 && (p = -p)) : p = f * (u - d), r.scrollLeft = p;
				}
			},
			startDragging({ event: e, refs: t, scope: n }) {
				t.set("startX", e.point.x), t.set("startY", e.point.y), t.set("orientation", e.orientation);
				let r = Y(n);
				r && (t.set("startScrollTop", r.scrollTop), t.set("startScrollLeft", r.scrollLeft));
			},
			setDraggingScroll({ event: e, refs: t, scope: n, context: r }) {
				let i = t.get("startY"), a = t.get("startX"), o = t.get("startScrollTop"), s = t.get("startScrollLeft"), c = e.point, l = c.y - i, u = c.x - a, d = Y(n);
				if (!d) return;
				let f = d.scrollHeight, p = d.clientHeight, m = d.scrollWidth, h = d.clientWidth, g = t.get("orientation"), _ = Qe(n), v = Z(n);
				if (_ && v && g === "vertical") {
					let e = Q(v, "padding", "y"), n = Q(_, "margin", "y"), i = _.offsetHeight;
					d.scrollTop = o + l / (v.offsetHeight - i - e - n) * (f - p), r.set("scrollingY", !0), t.get("scrollYTimeout").start(dt, () => {
						r.set("scrollingY", !1);
					});
				}
				let y = Ze(n), b = X(n);
				if (y && b && g === "horizontal") {
					let e = Q(b, "padding", "x"), n = Q(y, "margin", "x"), i = y.offsetWidth;
					d.scrollLeft = s + u / (b.offsetWidth - i - e - n) * (m - h), r.set("scrollingX", !0), t.get("scrollXTimeout").start(dt, () => {
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
				let n = Xe(e), r = J(e);
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
				let n = e.getWin(), r = Y(e);
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
				let t = Z(e), n = X(e);
				if (!t && !n) return;
				let r = (t) => {
					let n = Y(e);
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
				return de(t && I(t, "wheel", r, { passive: !1 }), n && I(n, "wheel", r, { passive: !1 }));
			},
			trackPointerMove({ scope: e, send: t, refs: n }) {
				let r = e.getDoc(), i = n.get("orientation");
				return ze(r, {
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
}), pt = (e = {}) => {
	let t = ae(), n = ce(), r = T(() => {
		let r = me(e);
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = oe(ft, () => S(r)), a = T(() => st(i, ne));
	return () => S(a);
}, mt = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ht(t, n) {
	let r = g();
	b(n, !0);
	let o = p(n, "ref", 15, null), s = w(n, mt), c = T(() => le()(s, ["id", "ids"])), l = T(() => i(S(c), 2)), u = T(() => S(l)[0]), d = T(() => S(l)[1]), f = T(() => ({
		...S(u),
		id: S(u).id ?? r
	})), m = pt(() => S(f)), h = T(() => R(m().getRootProps(), S(d)));
	return Be(m), P(t, E({ as: "div" }, () => S(h), {
		get ref() {
			return o();
		},
		set ref(e) {
			o(e);
		}
	})), a({
		get ref() {
			return o();
		},
		set ref(t = null) {
			o(t), e();
		}
	});
}
_(ht, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/use-scroll-area-scrollbar-context.js
var [gt, _t] = pe({
	name: "ScrollAreaScrollbarContext",
	hookName: "useScrollAreaScrollbarContext",
	providerName: "<ScrollAreaScrollbarProvider />"
}), vt = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function yt(t, n) {
	b(n, !0);
	let r = p(n, "ref", 15, null), o = w(n, vt), s = T(() => le()(o, ["orientation"])), c = T(() => i(S(s), 2)), l = T(() => S(c)[0]), u = T(() => S(c)[1]), d = G(), f = T(() => R(d().getScrollbarProps(S(l)), S(u)));
	return gt(() => S(l)), P(t, E({ as: "div" }, () => S(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), a({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
_(yt, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/scroll-area-thumb.svelte
var bt = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function xt(t, n) {
	b(n, !0);
	let r = p(n, "ref", 15, null), i = w(n, bt), o = G(), s = _t(), c = T(() => R(o().getThumbProps(s()), i));
	return P(t, E({ as: "div" }, () => S(c), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), a({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
_(xt, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/scroll-area/scroll-area-viewport.svelte
var St = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Ct(t, n) {
	b(n, !0);
	let r = p(n, "ref", 15, null), i = w(n, St), o = G(), s = T(() => R(o().getViewportProps(), i));
	return P(t, E({ as: "div" }, () => S(s), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), a({
		get ref() {
			return r();
		},
		set ref(t = null) {
			r(t), e();
		}
	});
}
_(Ct, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/scroll/scroll-stop.ts
function wt(e, t) {
	let n = () => {
		let n = (e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight) && !Ot(e);
		n && e.getAttribute("tabindex") !== "0" ? e.tabIndex = 0 : !n && e.hasAttribute("tabindex") && e.removeAttribute("tabindex"), t?.(n);
	};
	n(), e.addEventListener("slotchange", n);
	let r = typeof MutationObserver > "u" ? null : new MutationObserver(n);
	r?.observe(e, {
		subtree: !0,
		childList: !0,
		attributes: !0,
		attributeFilter: Tt
	});
	let i = typeof ResizeObserver > "u" ? null : new ResizeObserver(n);
	return i?.observe(e), e.firstElementChild && i?.observe(e.firstElementChild), () => {
		i?.disconnect(), r?.disconnect(), e.removeEventListener("slotchange", n);
	};
}
var Tt = [
	"tabindex",
	"disabled",
	"href",
	"contenteditable",
	"inert",
	"hidden"
], Et = (e) => !(e instanceof HTMLElement || e instanceof SVGElement) || !(e instanceof HTMLElement && e.isContentEditable && !e.parentElement?.isContentEditable) && e.tabIndex < 0 || (e instanceof HTMLAnchorElement || e instanceof HTMLAreaElement) && !e.hasAttribute("href") && !e.hasAttribute("tabindex") || e.matches(":disabled") || e.closest("[inert]") ? !1 : typeof e.checkVisibility != "function" || e.checkVisibility({ visibilityProperty: !0 }), Dt = (e) => Et(e) || e instanceof HTMLSlotElement && e.assignedElements({ flatten: !0 }).some((e) => Dt(e) || Ot(e)) || !!e.shadowRoot && Ot(e.shadowRoot);
function Ot(e) {
	for (let t of e.querySelectorAll("*")) if (Dt(t)) return !0;
	return !1;
}
//#endregion
//#region src/kit/scroll/Scroller.svelte
var kt = ({ getElement: e }) => {
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
}, At = s("<!><!><!><!>", 1), jt = s("<div data-scope=\"scroll-area\" data-part=\"root\" style=\"position: relative\"><div data-scope=\"scroll-area\" data-part=\"viewport\" part=\"viewport\"><div data-scope=\"scroll-area\" data-part=\"content\"><!></div></div></div>"), Mt = {
	hash: "svelte-1xls60m",
	code: "[data-scope='scroll-area'][data-part='root'] {display:flex;flex:1 1 auto;flex-direction:column;box-sizing:border-box;height:100%;min-width:0;min-height:0;max-height:inherit;border-radius:inherit;}[data-scope='scroll-area'][data-part='viewport'] {flex:1 1 auto;box-sizing:border-box;min-height:0;border-radius:inherit;outline:none;isolation:isolate;scrollbar-width:none;transition:box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);}[data-scope='scroll-area'][data-part='viewport']::-webkit-scrollbar {display:none;}[data-scope='scroll-area'][data-part='content'] {--scroll-area-overflow-x-start: initial;--scroll-area-overflow-x-end: initial;--scroll-area-overflow-y-start: initial;--scroll-area-overflow-y-end: initial;}[data-scope='scroll-area'][data-part='viewport']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);outline:1px solid currentColor;}[data-scope='scroll-area'][data-part='scrollbar'] {z-index:1;display:flex;box-sizing:border-box;padding:1px;border:0 solid transparent;visibility:hidden;opacity:0;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s linear 150ms;}[data-scope='scroll-area'][data-part='scrollbar'][data-orientation='vertical'] {width:10px;border-inline-start-width:1px;}[data-scope='scroll-area'][data-part='scrollbar'][data-orientation='horizontal'] {flex-direction:column;height:10px;border-top-width:1px;}[data-scope='scroll-area'][data-part='scrollbar']:is([data-hover], [data-scrolling], [data-dragging]) {visibility:visible;opacity:1;transition:opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), visibility 0s;}[data-scope='scroll-area'][data-part='scrollbar'][data-orientation='vertical']:not([data-overflow-y]),\n  [data-scope='scroll-area'][data-part='scrollbar'][data-orientation='horizontal']:not([data-overflow-x]) {display:none;}[data-scope='scroll-area'][data-part='thumb'] {position:relative;flex:1;border-radius:calc(infinity * 1px);background-color:var(--k-line);}\n  @media (prefers-reduced-motion: reduce) {[data-scope='scroll-area'][data-part='scrollbar'] {visibility:visible;opacity:1;transition:none;}[data-scope='scroll-area'][data-part='viewport'] {transition:none;}\n  }\n  @media (forced-colors: active) {[data-scope='scroll-area'][data-part='scrollbar'] {visibility:visible;opacity:1;transition:none;}[data-scope='scroll-area'][data-part='thumb'] {background-color:CanvasText;}[data-scope='scroll-area'][data-part='viewport']:focus-visible {outline:2px solid;outline-offset:-2px;}\n  }"
};
function Nt(i, s) {
	b(s, !0), t(i, Mt);
	let g = p(s, "axis", 7, "vertical"), _ = p(s, "label", 7, null), w = p(s, "heading", 7, null), E = p(s, "viewport", 15, null), O = p(s, "contentPart", 7, !1), k = p(s, "tabStop", 7, !0), A = p(s, "children", 7), j = ae(), M = te(null), N = () => S(M)?.getRootNode() ?? j().getRootNode(), P = {
		vertical: "overflow-x: hidden; overflow-y: auto",
		horizontal: "overflow-x: auto; overflow-y: hidden",
		both: "overflow: auto"
	}, ne = {
		vertical: "min-width: 0",
		horizontal: void 0,
		both: void 0
	}, re = typeof IntersectionObserver < "u" && typeof ResizeObserver < "u", F = T(() => g() !== "horizontal"), I = T(() => g() === "horizontal" || g() === "both"), ie = T(() => k() ? null : -1), oe = te(!1);
	h(() => E() && k() ? wt(E(), (e) => D(oe, e, !0)) : void 0);
	let se = T(() => w()?.text.trim() ?? ""), ce = T(() => !_() && S(oe) && S(se) !== ""), le = T(() => !!E() && "ariaLabelledByElements" in E()), ue = T(() => S(ce) && S(le) && !!w()?.element), de = T(() => _() || S(ce) ? "region" : null), pe = T(() => _() || (S(ce) && !S(ue) ? S(se) : null));
	h(() => {
		E() && S(le) && E(E().ariaLabelledByElements = S(ue) ? [w().element] : null, !0);
	});
	let L = (e) => e.preventDefault();
	var R = {
		get axis() {
			return g();
		},
		set axis(t = "vertical") {
			g(t), e();
		},
		get label() {
			return _();
		},
		set label(t = null) {
			_(t), e();
		},
		get heading() {
			return w();
		},
		set heading(t = null) {
			w(t), e();
		},
		get viewport() {
			return E();
		},
		set viewport(t = null) {
			E(t), e();
		},
		get contentPart() {
			return O();
		},
		set contentPart(t = !1) {
			O(t), e();
		},
		get tabStop() {
			return k();
		},
		set tabStop(t = !0) {
			k(t), e();
		},
		get children() {
			return A();
		},
		set children(t) {
			A(t), e();
		}
	}, z = f(), me = x(z), he = (e) => {
		fe(e, {
			value: N,
			children: (e, t) => {
				var i = f(), a = x(i);
				c(a, () => ht, (e, t) => {
					t(e, {
						get "data-orientation"() {
							return g();
						},
						get ref() {
							return S(M);
						},
						set ref(e) {
							D(M, e, !0);
						},
						children: (e, t) => {
							var i = At(), a = x(i);
							c(a, () => Ct, (e, t) => {
								t(e, {
									part: "viewport",
									get style() {
										return P[g()];
									},
									get tabindex() {
										return S(ie);
									},
									get role() {
										return S(de);
									},
									get "aria-label"() {
										return S(pe);
									},
									get ref() {
										return E();
									},
									set ref(e) {
										E(e);
									},
									children: (e, t) => {
										var i = f(), a = x(i);
										{
											let e = T(() => O() ? "content" : null);
											c(a, () => He, (t, i) => {
												i(t, {
													get part() {
														return S(e);
													},
													get style() {
														return ne[g()];
													},
													children: (e, t) => {
														var i = f(), a = x(i);
														r(a, () => A() ?? n), d(e, i);
													},
													$$slots: { default: !0 }
												});
											});
										}
										d(e, i);
									},
									$$slots: { default: !0 }
								});
							});
							var o = v(a), s = (e) => {
								var t = f(), n = x(t);
								c(n, () => yt, (e, t) => {
									t(e, {
										orientation: "vertical",
										part: "scrollbar",
										onmousedown: L,
										children: (e, t) => {
											var n = f(), r = x(n);
											c(r, () => xt, (e, t) => {
												t(e, { part: "thumb" });
											}), d(e, n);
										},
										$$slots: { default: !0 }
									});
								}), d(e, t);
							};
							u(o, (e) => {
								S(F) && e(s);
							});
							var l = v(o), p = (e) => {
								var t = f(), n = x(t);
								c(n, () => yt, (e, t) => {
									t(e, {
										orientation: "horizontal",
										part: "scrollbar",
										onmousedown: L,
										children: (e, t) => {
											var n = f(), r = x(n);
											c(r, () => xt, (e, t) => {
												t(e, { part: "thumb" });
											}), d(e, n);
										},
										$$slots: { default: !0 }
									});
								}), d(e, t);
							};
							u(l, (e) => {
								S(I) && e(p);
							});
							var m = v(l), h = (e) => {
								var t = f(), n = x(t);
								c(n, () => We, (e, t) => {
									t(e, { part: "corner" });
								}), d(e, t);
							};
							u(m, (e) => {
								g() === "both" && e(h);
							}), d(e, i);
						},
						$$slots: { default: !0 }
					});
				}), d(e, i);
			},
			$$slots: { default: !0 }
		});
	}, B = (e) => {
		var t = jt(), i = C(t), a = C(i), s = C(a);
		r(s, () => A() ?? n), o(a), o(i), m(i, (e) => E(e), () => E()), o(t), ee(() => {
			l(t, "data-orientation", g()), y(i, P[g()]), l(i, "tabindex", S(ie)), l(i, "role", S(de)), l(i, "aria-label", S(pe)), l(a, "part", O() ? "content" : null), y(a, ne[g()]);
		}), d(e, t);
	};
	return u(me, (e) => {
		re ? e(he) : e(B, -1);
	}), d(i, z), a(R);
}
_(Nt, {
	axis: {},
	label: {},
	heading: {},
	viewport: {},
	contentPart: {},
	tabStop: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/mention-chip.ts
var Pt = (e) => e.more?.group ?? e.scope?.group ?? null;
function Ft(e) {
	let t = Array.from(e.trim())[0];
	return t ? t.toUpperCase() : "?";
}
var It = "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5", Lt = "http://www.w3.org/2000/svg";
function Rt() {
	let e = document.createElementNS(Lt, "svg");
	e.setAttribute("viewBox", "0 0 24 24"), e.setAttribute("width", "12"), e.setAttribute("height", "12"), e.setAttribute("fill", "none"), e.setAttribute("stroke", "currentColor"), e.setAttribute("stroke-width", "2"), e.setAttribute("aria-hidden", "true"), e.setAttribute("part", "mention-icon");
	let t = document.createElementNS(Lt, "path");
	return t.setAttribute("d", It), e.append(t), e;
}
function zt(e, t, n, r) {
	let i = e.split("/")[0];
	return n ? n.state === "ok" ? {
		state: "ok",
		text: n.label,
		href: n.kind === "record" ? n.href : null
	} : n.state === "deleted" ? {
		state: "deleted",
		text: i === "record" ? "" : t,
		href: null
	} : {
		state: "restricted",
		text: "",
		href: null
	} : r === "own" ? {
		state: "ok",
		text: t,
		href: null
	} : {
		state: r,
		text: r === "unresolved" ? t : "",
		href: null
	};
}
function Bt(e, t, n) {
	return t.state === "restricted" ? e === "user" ? n.mentionRestrictedPerson : n.mentionRestricted : t.state === "deleted" && t.text === "" ? n.mentionDeleted : t.text;
}
function Vt(e, t, n, r, i = !1) {
	let a = e.split("/")[0], o = zt(e, t, n?.[e], i ? "own" : "restricted");
	return {
		kind: a,
		state: o.state === "unresolved" ? "restricted" : o.state,
		label: Bt(a, o, r),
		href: o.href
	};
}
function Ht(e, t, n, r = document) {
	let i = e.split("/")[0], { state: a, text: o, href: s } = t, c = r.createElement("span");
	c.className = "af-mention", c.setAttribute("part", "mention"), c.setAttribute("data-mention", e), c.setAttribute("data-kind", i), c.setAttribute("data-state", a);
	let l = r.createElement("span");
	if (l.className = "af-mention-label", l.textContent = Bt(i, t, n), a === "restricted") return c.append(l), c;
	if (i === "user") {
		let e = r.createElement("span");
		return e.className = "af-avatar af-mention-avatar", e.setAttribute("aria-hidden", "true"), e.textContent = Ft(o), c.append(e, l), c;
	}
	if (i === "record" && c.append(Rt()), s && a === "ok") {
		let e = r.createElement("a");
		e.className = "af-mention-link", e.setAttribute("href", s), e.append(l), c.append(e);
	} else c.append(l);
	return c;
}
function Ut(e, t, n, r = document) {
	let i = Ht(e, zt(e, t, n.map?.[e], n.inserted.has(e) ? "own" : "restricted"), n.strings, r);
	return i.contentEditable = "false", i;
}
var Wt = (e) => e.storage.mention;
function Gt(e, t) {
	let n = Wt(e);
	if (n) {
		n.map = t.map, n.strings = t.strings;
		for (let e of n.views) e.render();
	}
}
//#endregion
export { Te as C, U as S, Me as _, Ft as a, Oe as b, Gt as c, kt as d, ze as f, Ne as g, H as h, Pt as i, Wt as l, Le as m, Ht as n, zt as o, Re as p, Ut as r, Vt as s, It as t, Nt as u, Ee as v, ke as x, De as y };
