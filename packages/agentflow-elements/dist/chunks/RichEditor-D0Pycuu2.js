import { t as e } from "./rolldown-runtime-Dy4uBu1J.js";
import { $ as t, Ct as n, G as r, I as i, It as a, J as o, Lt as s, Ot as c, Pt as l, Q as u, R as d, S as f, T as p, V as m, W as h, X as g, Y as _, Z as v, _ as y, _t as b, at as x, b as S, ct as C, dt as w, et as T, g as E, gt as D, ht as O, it as k, kt as ee, mt as A, nt as j, ot as M, pt as N, rt as P, ut as F, v as te, w as ne, wt as I, xt as L, y as R, yt as z } from "./version-KzierYvT.js";
import { i as re, o as ie } from "./text-DY1VEJ9L.js";
import { i as ae, s as oe } from "./environment-1PeQDNCe.js";
import { Ct as B, H as se, I as V, P as ce, Q as le, T as ue, V as de, _t as fe, a as pe, at as me, c as H, d as U, dt as he, et as ge, ft as _e, g as ve, h as ye, i as be, l as xe, n as Se, o as Ce, q as we, r as Te, s as Ee, tt as De, u as Oe, vt as ke, wt as Ae } from "./use-locale-context-C2kEPdyN.js";
import { c as je, i as Me, u as Ne } from "./mention-chip-DwjboGcq.js";
import { d as Pe, u as Fe } from "./set-DGbwAd8v.js";
import { a as Ie, c as Le, h as Re, l as ze, n as Be, o as Ve, r as He, s as Ue, t as We, v as Ge, y as Ke } from "./dist-BtXib5dr.js";
import { isClaimed as qe } from "../escape.js";
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/proxy-tab-focus.mjs
function Je(e) {
	return e == null ? null : typeof e == "function" ? e() : e;
}
function Ye(e, t, n) {
	if (!t) return null;
	let r = Ke(e.ownerDocument.body, { getShadowRoot: n }), i = r.indexOf(t);
	if (i === -1) return null;
	for (let t = i + 1; t < r.length; t++) {
		let n = r[t];
		if (!V(e, n)) return n;
	}
	return null;
}
function Xe(e, t = {}) {
	let { triggerElement: n, onFocus: r, onFocusEnter: i, getShadowRoot: a } = t, o = (Je(e) ?? Je(n))?.ownerDocument || document;
	function s(t) {
		if (t.key !== "Tab") return;
		let o = Je(e), s = Je(n);
		if (!o) return;
		let [c, l] = Ge(o, {
			includeContainer: !0,
			getShadowRoot: a
		}), u = !c && !l, d = null;
		if (t.shiftKey && (se(c) || u)) d = s;
		else if (!t.shiftKey && se(s)) i?.(), d = c;
		else if (!t.shiftKey && (se(l) || u)) d = Ye(o, s, a);
		else if (t.shiftKey) {
			let e = Ye(o, s, a);
			se(e) && (i?.(), d = l);
		}
		d && (t.preventDefault(), typeof r == "function" ? r(d) : d.focus());
	}
	return ve(o, "keydown", s, !0);
}
function Ze(e, t) {
	let { defer: n, ...r } = t, i = n ? ye : (e) => e(), a = [];
	return a.push(i(() => {
		a.push(Xe(e, r));
	})), () => {
		a.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var Qe = [
	"top",
	"right",
	"bottom",
	"left"
], $e = Math.min, W = Math.max, et = Math.round, tt = Math.floor, G = (e) => ({
	x: e,
	y: e
}), nt = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function rt(e, t, n) {
	return W(e, $e(t, n));
}
function K(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function it(e) {
	return e.split("-")[0];
}
function at(e) {
	return e.split("-")[1];
}
function ot(e) {
	return e === "x" ? "y" : "x";
}
function st(e) {
	return e === "y" ? "height" : "width";
}
function q(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function ct(e) {
	return ot(q(e));
}
function lt(e, t, n) {
	n === void 0 && (n = !1);
	let r = at(e), i = ct(e), a = st(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = vt(o)), [o, vt(o)];
}
function ut(e) {
	let t = vt(e);
	return [
		dt(e),
		t,
		dt(t)
	];
}
function dt(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var ft = ["left", "right"], pt = ["right", "left"], mt = ["top", "bottom"], ht = ["bottom", "top"];
function gt(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? pt : ft : t ? ft : pt;
		case "left":
		case "right": return t ? mt : ht;
		default: return [];
	}
}
function _t(e, t, n, r) {
	let i = at(e), a = gt(it(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(dt)))), a;
}
function vt(e) {
	let t = it(e);
	return nt[t] + e.slice(t.length);
}
function yt(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function bt(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : yt(e);
}
function xt(e) {
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
function St(e, t, n) {
	let { reference: r, floating: i } = e, a = q(t), o = ct(t), s = st(o), c = it(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
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
	let m = at(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function Ct(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = K(t, e), p = bt(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = xt(await i.getClippingRect({
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
	}, y = xt(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
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
var wt = 50, Tt = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Ct
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = St(l, r, c), f = r, p = 0, m = {};
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
		}, x && p < wt && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = St(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Et = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = K(e, t) || {};
		if (l == null) return {};
		let d = bt(u), f = {
			x: n,
			y: r
		}, p = ct(i), m = st(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = $e(d[_], T), D = $e(d[v], T), O = C - h[m] - D, k = C / 2 - h[m] / 2 + w, ee = rt(E, k, O), A = !c.arrow && at(i) != null && k !== ee && a.reference[m] / 2 - (k < E ? E : D) - h[m] / 2 < 0, j = A ? k < E ? k - E : k - O : 0;
		return {
			[p]: f[p] + j,
			data: {
				[p]: ee,
				centerOffset: k - ee - j,
				...A && { alignmentOffset: j }
			},
			reset: A
		};
	}
}), Dt = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = K(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = it(r), _ = q(o), v = it(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [vt(o)] : ut(o)), x = p !== "none";
			!d && x && b.push(..._t(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = lt(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (u !== "alignment" || _ === q(t) || T.every((e) => q(e.placement) !== _ || e.overflows[0] > 0))) return {
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
								let t = q(e.placement);
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
function Ot(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function kt(e) {
	return Qe.some((t) => e[t] >= 0);
}
var At = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = K(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Ot(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: kt(e)
					} };
				}
				case "escaped": {
					let e = Ot(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: kt(e)
					} };
				}
				default: return {};
			}
		}
	};
}, jt = /*#__PURE__*/ new Set(["left", "top"]);
async function Mt(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = it(n), s = at(n), c = q(n) === "y", l = jt.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = K(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
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
var Nt = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Mt(t, e);
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
}, Pt = function(e) {
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
			} }, ...l } = K(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = q(i), p = ot(f), m = u[p], h = u[f], g = (e, t) => rt(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
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
}, Ft = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = K(e, t), u = {
				x: n,
				y: r
			}, d = q(i), f = ot(d), p = u[f], m = u[d], h = K(s, t), g = typeof h == "number" ? {
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
				let e = f === "y" ? "width" : "height", t = jt.has(it(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, It = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = K(e, t), c = await i.detectOverflow(t, s), l = it(n), u = at(n), d = q(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = $e(p - c[m], g), y = $e(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * W(c.left, c.right) : S = p - 2 * W(c.top, c.bottom)), await o({
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
function Lt() {
	return typeof window < "u";
}
function Rt(e) {
	return zt(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function J(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Y(e) {
	return ((zt(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function zt(e) {
	return Lt() ? e instanceof Node || e instanceof J(e).Node : !1;
}
function X(e) {
	return Lt() ? e instanceof Element || e instanceof J(e).Element : !1;
}
function Bt(e) {
	return Lt() ? e instanceof HTMLElement || e instanceof J(e).HTMLElement : !1;
}
function Vt(e) {
	return !Lt() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof J(e).ShadowRoot;
}
function Ht(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = Z(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function Ut(e) {
	return /^(table|td|th)$/.test(Rt(e));
}
function Wt(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var Gt = /transform|translate|scale|rotate|perspective|filter/, Kt = /paint|layout|strict|content/, qt = (e) => !!e && e !== "none", Jt;
function Yt(e) {
	let t = X(e) ? Z(e) : e;
	return qt(t.transform) || qt(t.translate) || qt(t.scale) || qt(t.rotate) || qt(t.perspective) || !Zt() && (qt(t.backdropFilter) || qt(t.filter)) || Gt.test(t.willChange || "") || Kt.test(t.contain || "");
}
function Xt(e) {
	let t = en(e);
	for (; Bt(t) && !Qt(t);) {
		if (Yt(t)) return t;
		if (Wt(t)) return null;
		t = en(t);
	}
	return null;
}
function Zt() {
	return Jt ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), Jt;
}
function Qt(e) {
	return /^(html|body|#document)$/.test(Rt(e));
}
function Z(e) {
	return J(e).getComputedStyle(e);
}
function $t(e) {
	return X(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function en(e) {
	if (Rt(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || Vt(e) && e.host || Y(e);
	return Vt(t) ? t.host : t;
}
function tn(e) {
	let t = en(e);
	return Qt(t) ? (e.ownerDocument || e).body : Bt(t) && Ht(t) ? t : tn(t);
}
function nn(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = tn(e), i = r === e.ownerDocument?.body, a = J(r);
	if (i) {
		let e = rn(a);
		return t.concat(a, a.visualViewport || [], Ht(r) ? r : [], e && n ? nn(e) : []);
	}
	return t.concat(r, nn(r, [], n));
}
function rn(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region ../../node_modules/.pnpm/@floating-ui+dom@1.8.0/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function an(e) {
	let t = Z(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = Bt(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = et(n) !== a || et(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function on(e) {
	return X(e) ? e : e.contextElement;
}
function sn(e) {
	let t = on(e);
	if (!Bt(t)) return G(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = an(t), o = (a ? et(n.width) : n.width) / r, s = (a ? et(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var cn = /*#__PURE__*/ G(0);
function ln(e) {
	let t = J(e);
	return !Zt() || !t.visualViewport ? cn : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function un(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === J(e);
}
function dn(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = on(e), o = G(1);
	t && (r ? X(r) && (o = sn(r)) : o = sn(e));
	let s = un(a, n, r) ? ln(a) : G(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = J(a), t = X(r) ? J(r) : r, n = e, i = rn(n);
		for (; i && t !== n;) {
			let e = sn(i), t = i.getBoundingClientRect(), r = Z(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = J(i), i = rn(n);
		}
	}
	return xt({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function fn(e, t) {
	let n = $t(e).scrollLeft;
	return t ? t.left + n : dn(Y(e)).left + n;
}
function pn(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - fn(e, n),
		y: n.top + t.scrollTop
	};
}
function mn(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Y(r), s = t ? Wt(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = G(1), u = G(0), d = Bt(r);
	if ((d || !a) && ((Rt(r) !== "body" || Ht(o)) && (c = $t(r)), d)) {
		let e = dn(r);
		l = sn(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? pn(o, c) : G(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function hn(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function gn(e) {
	let t = $t(e), n = e.ownerDocument.body, r = W(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = W(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + fn(e), o = -t.scrollTop;
	return Z(n).direction === "rtl" && (a += W(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var _n = 25;
function vn(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = J(e), a = Y(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !Zt() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (fn(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= _n && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function yn(e, t) {
	let n = dn(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = sn(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function bn(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = vn(e, n, t);
	else if (t === "document") r = gn(Y(e));
	else if (X(t)) r = yn(t, n);
	else {
		let n = ln(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return xt(r);
}
function xn(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = nn(e, [], !1).filter((e) => X(e) && Rt(e) !== "body"), i = null, a = Z(e).position === "fixed", o = a ? en(e) : e;
	for (; X(o) && !Qt(o);) {
		let e = Z(o), t = Yt(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = en(o);
	}
	return t.set(e, r), r;
}
function Sn(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? Wt(t) ? [] : xn(t, this._c) : [].concat(n), r], o = bn(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = bn(t, a[e], i);
		s = W(n.top, s), c = $e(n.right, c), l = $e(n.bottom, l), u = W(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Cn(e) {
	let { width: t, height: n } = an(e);
	return {
		width: t,
		height: n
	};
}
function wn(e, t, n) {
	let r = Bt(t), i = Y(t), a = n === "fixed", o = dn(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = G(0);
	if ((r || !a) && ((Rt(t) !== "body" || Ht(i)) && (s = $t(t)), r)) {
		let e = dn(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = fn(i));
	let l = i && !r && !a ? pn(i, s) : G(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Tn(e) {
	return Z(e).position === "static";
}
function En(e, t) {
	if (!Bt(e) || Z(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Y(e) === n && (n = n.ownerDocument.body), n;
}
function Dn(e, t) {
	let n = J(e);
	if (Wt(e)) return n;
	if (!Bt(e)) {
		let t = en(e);
		for (; t && !Qt(t);) {
			if (X(t) && !Tn(t)) return t;
			t = en(t);
		}
		return n;
	}
	let r = En(e, t);
	for (; r && Ut(r) && Tn(r);) r = En(r, t);
	return r && Qt(r) && Tn(r) && !Yt(r) ? n : r || Xt(e) || n;
}
var On = async function(e) {
	let t = this.getOffsetParent || Dn, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: wn(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function kn(e) {
	return Z(e).direction === "rtl";
}
var An = {
	convertOffsetParentRelativeRectToViewportRelativeRect: mn,
	getDocumentElement: Y,
	getClippingRect: Sn,
	getOffsetParent: Dn,
	getElementRects: On,
	getClientRects: hn,
	getDimensions: Cn,
	getScale: sn,
	isElement: X,
	isRTL: kn
};
function jn(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function Mn(e, t, n) {
	let r = null, i, a = Y(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = tt(d), h = tt(a.clientWidth - (u + f)), g = tt(a.clientHeight - (d + p)), _ = tt(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: W(0, $e(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!jn(l, e.getBoundingClientRect())) return s();
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
	let c = J(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function Nn(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = on(e), u = i || a ? [...l ? nn(l) : [], ...t ? nn(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? Mn(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? dn(e) : null;
	c && g();
	function g() {
		let t = dn(e);
		h && !jn(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Pn = Nt, Fn = Pt, In = Dt, Ln = It, Rn = At, zn = Et, Bn = Ft, Vn = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...An,
		...i.platform,
		_c: r
	};
	return Tt(e, t, {
		...i,
		platform: a
	});
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-anchor.mjs
function Hn(e = 0, t = 0, n = 0, r = 0) {
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
function Un(e) {
	if (!e) return Hn();
	let { x: t, y: n, width: r, height: i } = e;
	return Hn(t, n, r, i);
}
function Wn(e, t) {
	return {
		contextElement: we(e) ? e : e?.contextElement,
		getBoundingClientRect: () => {
			let n = e, r = t?.(n);
			return r || !n ? Un(r) : n.getBoundingClientRect();
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/middleware.mjs
var Gn = (e) => ({
	variable: e,
	reference: `var(${e})`
}), Q = {
	arrowSize: Gn("--arrow-size"),
	arrowSizeHalf: Gn("--arrow-size-half"),
	arrowBg: Gn("--arrow-background"),
	transformOrigin: Gn("--transform-origin"),
	arrowOffset: Gn("--arrow-offset")
}, Kn = (e) => e === "top" || e === "bottom" ? "y" : "x";
function qn(e, t) {
	return {
		name: "transformOrigin",
		fn(n) {
			let { elements: r, middlewareData: i, placement: a, rects: o, y: s } = n, c = a.split("-")[0], l = Kn(c), u = i.arrow?.x || 0, d = i.arrow?.y || 0, f = t?.clientWidth || 0, p = t?.clientHeight || 0, m = u + f / 2, h = d + p / 2, g = Math.abs(i.shift?.y || 0), _ = o.reference.height / 2, v = p / 2, y = e.offset?.mainAxis ?? e.gutter, b = typeof y == "number" ? y + v : y ?? v, x = g > b, S = {
				top: `${m}px calc(100% + ${b}px)`,
				bottom: `${m}px ${-b}px`,
				left: `calc(100% + ${b}px) ${h}px`,
				right: `${-b}px ${h}px`
			}[c], C = `${m}px ${o.reference.y + _ - s}px`, w = !!e.overlap && l === "y" && x;
			return r.floating.style.setProperty(Q.transformOrigin.variable, w ? C : S), { data: { transformOrigin: w ? C : S } };
		}
	};
}
var Jn = {
	name: "rects",
	fn({ rects: e }) {
		return { data: e };
	}
}, Yn = (e) => {
	if (e) return {
		name: "shiftArrow",
		fn({ placement: t, middlewareData: n }) {
			if (!n.arrow) return {};
			let { x: r, y: i } = n.arrow, a = t.split("-")[0];
			return Object.assign(e.style, {
				left: r == null ? "" : `${r}px`,
				top: i == null ? "" : `${i}px`,
				[a]: `calc(100% + ${Q.arrowOffset.reference})`
			}), {};
		}
	};
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/placement.mjs
function Xn(e) {
	let [t, n] = e.split("-");
	return {
		side: t,
		align: n,
		hasAlign: n != null
	};
}
function Zn(e) {
	return e.split("-")[0];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-placement.mjs
var Qn = {
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
function $n(e, t) {
	let n = e.devicePixelRatio || 1;
	return Math.round(t * n) / n;
}
function er(e, t) {
	return e != null && Math.abs(e - t) < .5;
}
function tr(e) {
	return typeof e == "function" ? e() : e === "clipping-ancestors" ? "clippingAncestors" : e;
}
function nr(e, t, n) {
	return zn({
		element: e || t.createElement("div"),
		padding: n.arrowPadding
	});
}
function rr(e, t) {
	if (!Ae(t.offset ?? t.gutter)) return Pn(({ placement: n }) => {
		let r = (e?.clientHeight || 0) / 2, i = t.offset?.mainAxis ?? t.gutter, a = typeof i == "number" ? i + r : i ?? r, { hasAlign: o } = Xn(n), s = o ? void 0 : t.shift, c = t.offset?.crossAxis ?? s;
		return he({
			crossAxis: c,
			mainAxis: a,
			alignmentAxis: t.shift
		});
	});
}
function ir(e) {
	if (e.flip) return In(() => {
		let t = tr(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			padding: e.overflowPadding,
			fallbackPlacements: e.flip === !0 ? void 0 : e.flip
		};
	});
}
function ar(e) {
	if (e.slide || e.overlap) return Fn(() => {
		let t = tr(e.boundary);
		return {
			...t ? { boundary: t } : void 0,
			mainAxis: e.slide,
			crossAxis: e.overlap,
			padding: e.overflowPadding,
			limiter: Bn()
		};
	});
}
function or(e) {
	if (e.sizeMiddleware === !1 && !e.sameWidth && !e.fitViewport) return;
	let t, n, r, i;
	return Ln(() => {
		let a = tr(e.boundary);
		return {
			padding: e.overflowPadding,
			...a ? { boundary: a } : void 0,
			apply({ elements: e, rects: a, availableHeight: o, availableWidth: s }) {
				let c = e.floating, l = Math.round(a.reference.width), u = Math.round(a.reference.height);
				s = Math.floor(s), o = Math.floor(o), er(t, l) || (c.style.setProperty("--reference-width", `${l}px`), t = l), er(n, u) || (c.style.setProperty("--reference-height", `${u}px`), n = u), er(r, s) || (c.style.setProperty("--available-width", `${s}px`), r = s), er(i, o) || (c.style.setProperty("--available-height", `${o}px`), i = o);
			}
		};
	});
}
function sr(e) {
	if (e.hideWhenDetached) return Rn(() => ({
		strategy: "referenceHidden",
		boundary: tr(e.boundary) ?? "clippingAncestors"
	}));
}
function cr(e) {
	return e ? e === !0 ? {
		ancestorResize: !0,
		ancestorScroll: !0,
		elementResize: !0,
		layoutShift: !0
	} : e : {};
}
var lr = [
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
], ur = [
	"top",
	"right",
	"bottom",
	"left"
];
function dr(e, t) {
	if (!e) return fe;
	let n = new Map(t.map((t) => [t, e.style.getPropertyValue(t)]));
	return () => {
		n.forEach((t, n) => {
			t ? e.style.setProperty(n, t) : e.style.removeProperty(n);
		}), e.style.length === 0 && e.removeAttribute("style");
	};
}
function fr(e) {
	return e == null ? null : we(e) ? e : typeof e == "object" && e && "contextElement" in e && e.contextElement ? e.contextElement : e;
}
function pr(e, t, n = {}) {
	let r = () => (typeof t == "function" ? t() : t) ?? null, i = () => {
		let t = typeof e == "function" ? e() : e;
		return n.getAnchorElement?.() ?? t;
	}, a = () => {
		let e = i();
		return !e && !n.getAnchorRect ? null : Wn(e, n.getAnchorRect);
	}, o = Object.assign({}, Qn, n), s = [], c = null, l, u;
	function d(e) {
		l?.(), u?.(), c = e, l = o.restoreStyles ? dr(e, lr) : void 0;
		let t = e.querySelector("[data-part=arrow]");
		u = o.restoreStyles ? dr(t, ur) : void 0, s = [
			rr(t, o),
			ir(o),
			ar(o),
			nr(t, e.ownerDocument, o),
			Yn(t),
			qn({
				gutter: o.gutter,
				offset: o.offset,
				overlap: o.overlap
			}, t),
			or(o),
			sr(o),
			Jn
		];
	}
	let { placement: f, strategy: p, onComplete: m, onPositioned: h } = o, g, _, v = !1, y, b, x = fe, S = cr(o.listeners);
	function C() {
		if (!o.listeners) return;
		let e = i(), t = a(), n = r();
		t && n && (fr(e) !== fr(y) || n !== b) && (x(), y = e, b = n, x = Nn(t, n, T, S));
	}
	async function w() {
		C();
		let e = r();
		if (!e) return;
		e !== c && (d(e), v = !1);
		let t = a();
		if (!t) return;
		let n = await Vn(t, e, {
			placement: f,
			middleware: s,
			strategy: p
		}), i = de(e), l = $n(i, n.x), u = $n(i, n.y);
		if (m?.({
			...n,
			x: l,
			y: u
		}), o.applyStyles !== !1 && (er(g, l) || (e.style.setProperty("--x", `${l}px`), g = l), er(_, u) || (e.style.setProperty("--y", `${u}px`), _ = u), o.hideWhenDetached && (n.middlewareData.hide?.referenceHidden ? (e.style.setProperty("visibility", "hidden"), e.style.setProperty("pointer-events", "none")) : (e.style.removeProperty("visibility"), e.style.removeProperty("pointer-events"))), !v)) {
			let t = e.firstElementChild;
			t && (e.style.setProperty("--z-index", Pe(t).zIndex), v = !0);
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
function mr(e, t, n = {}) {
	let { defer: r, ...i } = n, a = r ? ye : (e) => e(), o = [];
	return o.push(a(() => {
		o.push(pr(e, t, i));
	})), () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+popper@1.43.3/node_modules/@zag-js/popper/dist/get-styles.mjs
var hr = {
	bottom: "rotate(45deg)",
	left: "rotate(135deg)",
	top: "rotate(225deg)",
	right: "rotate(315deg)"
};
function gr(e = {}) {
	let { placement: t, sameWidth: n, fitViewport: r, strategy: i = "absolute" } = e;
	return {
		arrow: {
			position: "absolute",
			width: Q.arrowSize.reference,
			height: Q.arrowSize.reference,
			[Q.arrowSizeHalf.variable]: `calc(${Q.arrowSize.reference} / 2)`,
			[Q.arrowOffset.variable]: `calc(${Q.arrowSizeHalf.reference} * -1)`
		},
		arrowTip: {
			transform: t ? hr[t.split("-")[0]] : void 0,
			background: Q.arrowBg.reference,
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
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/use-popover-context.js
var [_r, vr] = Ee({ name: "PopoverContext" }), yr = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function br(e, t) {
	ee(t, !0);
	let i = y(t, "ref", 15, null), a = te(t, yr), o = vr(), s = Ue(), l = I(() => Oe(o().getContentProps(), s().getPresenceProps(), a));
	function u(e) {
		s().setNode(e);
	}
	var d = {
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), n();
		}
	}, f = v(), p = A(f), m = (e) => {
		H(e, R({ as: "div" }, () => M(l), {
			[r()]: u,
			get ref() {
				return i();
			},
			set ref(e) {
				i(e);
			}
		}));
	}, _ = I(() => !s().unmounted);
	return h(p, (e) => {
		M(_) && e(m);
	}), g(e, f), c(d);
}
E(br, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-positioner.svelte
var xr = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Sr(e, t) {
	ee(t, !0);
	let r = y(t, "ref", 15, null), i = te(t, xr), a = vr(), o = Ue(), s = I(() => Oe(a().getPositionerProps(), i));
	var l = {
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		}
	}, u = v(), d = A(u), f = (e) => {
		H(e, R({ as: "div" }, () => M(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, p = I(() => !o().unmounted);
	return h(d, (e) => {
		M(p) && e(f);
	}), g(e, u), c(l);
}
E(Sr, { ref: {} }, [], [], { mode: "open" });
var $ = pe("popover").parts("arrow", "arrowTip", "anchor", "trigger", "indicator", "positioner", "content", "title", "description", "closeTrigger").build(), Cr = (e) => e.ids?.anchor ?? `popover:${e.id}:anchor`, wr = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `popover:${e.id}:trigger:${t}` : `popover:${e.id}:trigger` : B(n) ? n(t) : n;
}, Tr = (e) => e.ids?.content ?? `popover:${e.id}:content`, Er = (e) => e.ids?.positioner ?? `popover:${e.id}:popper`, Dr = (e) => e.ids?.arrow ?? `popover:${e.id}:arrow`, Or = (e) => e.ids?.title ?? `popover:${e.id}:title`, kr = (e) => e.ids?.description ?? `popover:${e.id}:desc`, Ar = (e) => e.ids?.closeTrigger ?? `popover:${e.id}:close`, jr = (e) => e.getById(Cr(e)), Mr = (e) => e.getById(wr(e)), Nr = (e) => Fe(e.getRootNode(), `[data-scope="popover"][data-part="trigger"]${De(e.id)}`), Pr = (e, t) => t == null ? Mr(e) ?? Nr(e)[0] : e.getById(wr(e, t)), Fr = (e) => e.getById(Tr(e)), Ir = (e) => e.getById(Er(e)), Lr = (e) => e.getById(Or(e)), Rr = (e) => e.getById(kr(e)), zr = { closeTriggerLabel: "close" };
function Br(e, t) {
	let { state: n, context: r, send: i, computed: a, prop: o, scope: s } = e, c = _e(zr, o("translations")), l = n.matches("open"), u = r.get("currentPlacement"), d = u ? Zn(u) : void 0, f = a("currentPortalled"), p = r.get("renderedElements"), m = r.get("triggerValue"), h = gr({
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
				id: Dr(s),
				...$.arrow.attrs,
				dir: o("dir"),
				style: h.arrow
			});
		},
		getArrowTipProps() {
			return t.element({
				...$.arrowTip.attrs,
				dir: o("dir"),
				style: h.arrowTip
			});
		},
		getAnchorProps() {
			return t.element({
				...$.anchor.attrs,
				dir: o("dir"),
				id: Cr(s)
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, r = n != null && m === n;
			return t.button({
				...$.trigger.attrs,
				dir: o("dir"),
				type: "button",
				"data-placement": u,
				"data-side": d,
				id: wr(s, n),
				"data-ownedby": s.id,
				"data-value": n,
				"data-current": ge(r),
				"aria-haspopup": "dialog",
				"aria-expanded": n == null ? l : l && r,
				"data-state": l ? "open" : "closed",
				"aria-controls": Tr(s),
				onPointerDown(e) {
					ue(e) && ce() && e.currentTarget.focus();
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
				...$.indicator.attrs,
				dir: o("dir"),
				"data-state": l ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				id: Er(s),
				...$.positioner.attrs,
				dir: o("dir"),
				style: h.floating
			});
		},
		getContentProps() {
			return t.element({
				...$.content.attrs,
				dir: o("dir"),
				id: Tr(s),
				tabIndex: -1,
				role: "dialog",
				"aria-modal": le(o("modal")),
				hidden: !l,
				"data-state": l ? "open" : "closed",
				"data-expanded": ge(l),
				"aria-labelledby": p.title ? Or(s) : void 0,
				"aria-describedby": p.description ? kr(s) : void 0,
				"data-placement": u,
				"data-side": d
			});
		},
		getTitleProps() {
			return t.element({
				...$.title.attrs,
				id: Or(s),
				dir: o("dir")
			});
		},
		getDescriptionProps() {
			return t.element({
				...$.description.attrs,
				id: kr(s),
				dir: o("dir")
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...$.closeTrigger.attrs,
				dir: o("dir"),
				id: Ar(s),
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
var Vr = me({
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
						triggerElement: Pr(n, e)
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
				let r = jr(n);
				return mr(() => r ?? Pr(n, e.get("triggerValue")), () => Ir(n), {
					...t("positioning"),
					defer: !0,
					onComplete(t) {
						e.set("currentPlacement", t.placement);
					}
				});
			},
			trackDismissableElement({ send: e, prop: t, scope: n }) {
				let r = () => Fr(n), i = !0;
				return Ie(r, {
					type: "popover",
					pointerBlocking: t("modal"),
					exclude: [Mr(n), ...Nr(n)].filter(Boolean),
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
				return e("modal") || !e("portalled") ? void 0 : Ze(() => Fr(t), {
					triggerElement: Pr(t, n.get("triggerValue")),
					defer: !0,
					getShadowRoot: !0,
					onFocus(e) {
						e.focus({ preventScroll: !0 });
					}
				});
			},
			hideContentBelow({ prop: e, scope: t, context: n }) {
				return e("modal") ? He(() => [Fr(t), Pr(t, n.get("triggerValue"))], { defer: !0 }) : void 0;
			},
			preventScroll({ prop: e, scope: t }) {
				if (e("modal")) return We(t.getDoc());
			},
			trapFocus({ prop: e, scope: t, context: n }) {
				return e("modal") ? Be(() => Fr(t), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!e("restoreFocus"),
					initialFocus: () => Re({
						root: Fr(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					}),
					setReturnFocus: (r) => {
						let i = e("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let e = Pr(t, a);
							if (e) return e;
						}
						return Nr(t)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			}
		},
		actions: {
			reposition({ event: e, prop: t, scope: n, context: r }) {
				let i = jr(n);
				mr(() => i ?? Pr(n, r.get("triggerValue")), () => Ir(n), {
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
				ye(() => {
					Object.assign(e.get("renderedElements"), {
						title: !!Lr(t),
						description: !!Rr(t)
					});
				});
			},
			setInitialFocus({ prop: e, scope: t }) {
				e("modal") || ye(() => {
					Re({
						root: Fr(t),
						getInitialEl: e("initialFocusEl"),
						enabled: e("autoFocus")
					})?.focus({ preventScroll: !0 });
				});
			},
			setFinalFocus({ event: e, prop: t, scope: n, context: r }) {
				let i = e.restoreFocus ?? e.previousEvent?.restoreFocus;
				(i == null || i) && t("restoreFocus") && ye(() => {
					let e = t("finalFocusEl")?.();
					if (e) {
						e.focus({ preventScroll: !0 });
						return;
					}
					Pr(n, r.get("triggerValue"))?.focus({ preventScroll: !0 });
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
}), Hr = (e) => {
	let t = be(), n = Se(), r = I(() => {
		let r = ke(e) || {};
		return {
			dir: n().dir,
			getRootNode: t().getRootNode,
			...r
		};
	}), i = xe(Vr, () => M(r)), a = I(() => Br(i, U));
	return () => M(a);
}, Ur = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function Wr(e, t) {
	let r = T();
	ee(t, !0);
	let i = y(t, "open", 15), l = y(t, "children", 7), u = te(t, Ur), d = I(() => Le(u)), f = I(() => s(M(d), 2)), p = I(() => M(f)[0]), m = I(() => M(f)[1]), h = I(() => ({
		...M(m),
		id: M(m).id ?? r,
		open: i(),
		onOpenChange(e) {
			M(m).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), _ = Hr(() => M(h)), b = I(() => ({
		...M(p),
		present: _().open
	})), x = ze(() => M(b));
	_r(_), Ve(x);
	var S = {
		get open() {
			return i();
		},
		set open(e) {
			i(e), n();
		},
		get children() {
			return l();
		},
		set children(e) {
			l(e), n();
		}
	}, C = v(), w = A(C);
	return o(w, () => l() ?? a), g(e, C), c(S);
}
E(Wr, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/popover/popover-trigger.svelte
var Gr = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Kr(e, t) {
	ee(t, !0);
	let r = y(t, "ref", 15, null), i = te(t, Gr), a = I(() => Ce()(i, ["value"])), o = I(() => s(M(a), 2)), l = I(() => M(o)[0]), u = I(() => M(o)[1]), d = vr(), f = Ue(), p = I(() => {
		let e = d().getTriggerProps(M(l));
		return Oe({
			...e,
			"aria-controls": f().unmounted ? void 0 : e["aria-controls"]
		}, M(u));
	});
	return H(e, R({ as: "button" }, () => M(p), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), c({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		}
	});
}
E(Kr, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/RichEditor.svelte
var qr = /* @__PURE__ */ e({ default: () => di }), Jr = t("<svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5\"></path><path d=\"M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5\"></path></svg>"), Yr = u("<form class=\"link-form svelte-9gj0md\" novalidate=\"\"><input part=\"link-input\" type=\"url\" inputmode=\"url\" placeholder=\"https://\" class=\"svelte-9gj0md\"/> <button type=\"submit\" class=\"af-button primary\" part=\"link-apply\"> </button></form>"), Xr = u("<!> <!>", 1), Zr = u("<div part=\"toolbar\" class=\"toolbar svelte-9gj0md\"><button type=\"button\" part=\"tool-bold\" class=\"tool svelte-9gj0md\"><b>B</b></button> <button type=\"button\" part=\"tool-italic\" class=\"tool svelte-9gj0md\"><i>I</i></button> <button type=\"button\" part=\"tool-bullet-list\" class=\"tool svelte-9gj0md\">•</button> <button type=\"button\" part=\"tool-numbered-list\" class=\"tool svelte-9gj0md\">1.</button> <!></div>"), Qr = u("<span part=\"placeholder\" class=\"placeholder svelte-9gj0md\" aria-hidden=\"true\"> </span>"), $r = u("<div class=\"mention-empty svelte-9gj0md\"> </div>"), ei = u("<div class=\"mention-title svelte-9gj0md\" part=\"mention-title\" aria-hidden=\"true\"> </div>"), ti = u("<div class=\"mention-scope svelte-9gj0md\" part=\"mention-scope\" role=\"option\" tabindex=\"-1\" data-kind=\"scope\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" aria-hidden=\"true\" class=\"svelte-9gj0md\"><circle cx=\"11\" cy=\"11\" r=\"7\"></circle><path d=\"m20 20-3.5-3.5\"></path></svg> <span class=\"mention-name svelte-9gj0md\"> </span></div>"), ni = u("<div class=\"mention-scopes svelte-9gj0md\"></div>"), ri = u("<span class=\"mention-name svelte-9gj0md\"> </span>"), ii = u("<span class=\"mention-meta svelte-9gj0md\"> </span>"), ai = u("<span class=\"mention-meta mention-side svelte-9gj0md\"> </span>"), oi = u("<span class=\"af-avatar mention-avatar svelte-9gj0md\" aria-hidden=\"true\"> </span> <span class=\"mention-text svelte-9gj0md\"><span class=\"mention-name svelte-9gj0md\"> </span> <!></span> <!>", 1), si = u("<div class=\"mention-option svelte-9gj0md\" part=\"mention-option\" role=\"option\" tabindex=\"-1\"><!></div>"), ci = u("<div class=\"mention-group\" role=\"group\"><!> <!></div>"), li = u("<div class=\"af-kit editor svelte-9gj0md\"><!> <div class=\"surface svelte-9gj0md\"><!> <div part=\"content\" class=\"content svelte-9gj0md\"></div></div> <div part=\"mention-menu\" class=\"af-overlay mention-menu svelte-9gj0md\" popover=\"manual\" role=\"listbox\"><!></div></div>"), ui = {
	hash: "svelte-9gj0md",
	code: ".editor.svelte-9gj0md {display:flex;flex-direction:column;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);}.editor.svelte-9gj0md:focus-within {border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}.editor[data-readonly].svelte-9gj0md {border-color:transparent;background:transparent;}.toolbar.svelte-9gj0md {display:flex;gap:2px;padding:4px;border-bottom:1px solid var(--k-line);}.tool.svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool {min-width:28px;height:28px;padding:0 6px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;cursor:pointer;}\n  @media (hover: hover) {.tool.svelte-9gj0md:not(:disabled):hover, [data-scope='popover'][data-part='trigger'].tool:hover {background:color-mix(in oklab, var(--k-fg) 6%, transparent);} }.tool.svelte-9gj0md:not(:disabled):active {background:color-mix(in oklab, var(--k-fg) 10%, transparent);}.tool[aria-pressed='true'].svelte-9gj0md, [data-scope='popover'][data-part='trigger'].tool[aria-pressed='true'] {background:color-mix(in oklab, var(--k-primary) 14%, transparent);}.tool.svelte-9gj0md:disabled {opacity:0.55;cursor:default;}.tool.svelte-9gj0md:focus-visible {outline:none;box-shadow:0 0 0 3px var(--k-focus-ring);}.surface.svelte-9gj0md {position:relative;}.placeholder.svelte-9gj0md {position:absolute;inset:8px 12px auto;color:var(--k-muted);pointer-events:none;}.content.svelte-9gj0md > [contenteditable] {min-height:4.5em;padding:8px 12px;outline:none;white-space:pre-wrap;word-wrap:break-word;font-variant-ligatures:none;}.editor[data-readonly].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:0;}.content.svelte-9gj0md p {margin:0 0 0.5em;}.content.svelte-9gj0md > [contenteditable] > :last-child {margin-bottom:0;}.content.svelte-9gj0md ul, .content.svelte-9gj0md ol {margin:0 0 0.5em;padding-left:1.5em;}.content.svelte-9gj0md a {color:var(--k-primary);}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) > [contenteditable] {min-height:0;padding:4px 8px;white-space:nowrap;overflow:hidden;}.editor[data-single-line].svelte-9gj0md .content:where(.svelte-9gj0md) p {margin:0;}.content.svelte-9gj0md .af-mention-holder {display:inline;}.content.svelte-9gj0md .af-mention {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:baseline;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;line-height:1.5;}.content.svelte-9gj0md .af-mention[data-state='restricted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.content.svelte-9gj0md .af-mention[data-state='deleted'] .af-mention-label {text-decoration:line-through;}.content.svelte-9gj0md .af-mention-link {color:inherit;text-decoration:none;}\n  @media (hover: hover) {.content.svelte-9gj0md .af-mention-link:hover {text-decoration:underline;} }.content.svelte-9gj0md .af-mention-avatar {width:16px;height:16px;font-size:10px;}.content.svelte-9gj0md table {border-collapse:collapse;}.content.svelte-9gj0md th, .content.svelte-9gj0md td {border:1px solid var(--k-line);padding:4px 8px;}.content.svelte-9gj0md ul[data-type='taskList'] {list-style:none;padding-left:0.25em;}.content.svelte-9gj0md ul[data-type='taskList'] li {display:flex;gap:6px;}[data-scope='popover'][data-part='positioner'][popover] {inset:auto;margin:0;padding:0;border:0;background:transparent;overflow:visible;}.mention-menu.svelte-9gj0md {position:fixed;inset:auto;margin:0;padding:4px;min-width:240px;max-width:360px;max-height:320px;}.mention-menu.svelte-9gj0md:popover-open {display:flex;flex-direction:column;}.mention-title.svelte-9gj0md {padding:6px 8px 2px;color:var(--k-muted);font-size:12px;font-weight:600;}.mention-option.svelte-9gj0md {display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:4px;cursor:pointer;}.mention-option[aria-selected='true'].svelte-9gj0md {background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.mention-avatar.svelte-9gj0md {flex:none;width:24px;height:24px;font-size:12px;}.mention-text.svelte-9gj0md {display:flex;flex-direction:column;min-width:0;flex:1;}.mention-name.svelte-9gj0md {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.mention-meta.svelte-9gj0md {color:var(--k-muted);font-size:12px;}.mention-side.svelte-9gj0md {flex:none;}.mention-empty.svelte-9gj0md {padding:8px;color:var(--k-muted);}.mention-scopes.svelte-9gj0md {display:flex;flex-wrap:wrap;gap:4px;padding:4px 8px 6px;}.mention-scope.svelte-9gj0md {display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 8px;border:1px solid var(--k-line);border-radius:999px;color:var(--k-fg);font-size:12px;cursor:pointer;}.mention-scope.svelte-9gj0md svg:where(.svelte-9gj0md) {flex:none;color:var(--k-muted);}.mention-scope[aria-selected='true'].svelte-9gj0md {border-color:var(--k-primary);background:color-mix(in oklab, var(--k-primary) 10%, transparent);}.link-form.svelte-9gj0md {display:flex;gap:6px;padding:8px;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md) {min-width:240px;min-height:32px;padding:0 8px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-bg);color:var(--k-fg);font:inherit;}.link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:none;border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (forced-colors: active) {.editor.svelte-9gj0md:focus-within {outline:2px solid;outline-offset:1px;}.tool.svelte-9gj0md:focus-visible, .link-form.svelte-9gj0md input:where(.svelte-9gj0md):focus-visible {outline:2px solid;outline-offset:1px;}\n  }"
};
function di(e, t) {
	ee(t, !0), i(e, ui);
	let r = y(t, "value", 7, ""), a = y(t, "readonly", 7, !1), o = y(t, "placeholder", 7, null), s = y(t, "label", 7, null), u = y(t, "locale", 7, null), T = y(t, "strings", 7, null), E = y(t, "mentions", 7, null), j = y(t, "singleLine", 7, !1), te = y(t, "mentionMap", 7, null), R = t.$$host, B = I(() => re(u(), T() ?? void 0)), se = L(null), V = L(null), ce = L(!0), le = L(b({
		bold: !1,
		italic: !1,
		bulletList: !1,
		orderedList: !1,
		link: !1
	})), ue = L(!1), de = L(""), fe = L(null);
	w(() => oe(M(fe), M(ue), R));
	let pe = null, me = null, H = L(null), U = L(0), he = L(null), ge = `af-mention-${Math.random().toString(36).slice(2, 9)}`;
	w(() => oe(M(he), M(H) !== null, R)), w(() => x(R, "keydown", (e) => {
		e.key === "Escape" && qe(e) && e.defaultPrevented && M(H) && (M(V) && pe?.(M(V).view), z(H, null));
	})), w(() => {
		let e = M(H)?.rect?.();
		M(he) && e && (M(he).style.left = `${Math.max(0, e.left)}px`, M(he).style.top = `${e.bottom + 4}px`);
	});
	let _e = I(() => {
		let e = [];
		return (M(H)?.entries ?? []).forEach((t, n) => {
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
	async function ve(e) {
		let t = M(H);
		if (!t) return;
		if (e.kind === "item") {
			t.command(e);
			return;
		}
		let n = E(), r = Me(e);
		if (!n || !r) return;
		let i = await n(t.query, r);
		if (M(H) !== t) return;
		let a = me?.(i) ?? [];
		z(H, {
			...t,
			entries: a
		}), z(U, 0);
	}
	let ye = (e) => e.some((e) => e.kind !== "scope"), be = (e) => !ye(e.entries) && /\s/.test(e.query.trim()), xe = {
		show(e) {
			z(H, be(e) ? null : e), z(U, 0);
		},
		update(e) {
			z(H, be(e) ? null : e), z(U, 0);
		},
		hide() {
			z(H, null);
		},
		key(e) {
			let t = M(H);
			if (!t) return !1;
			let n = t.entries.length;
			if (e.key === "Escape") return M(V) && pe?.(M(V).view), z(H, null), !0;
			if (n === 0) return !1;
			if (e.key === "ArrowDown") return z(U, (M(U) + 1) % n), !0;
			if (e.key === "ArrowUp") return z(U, (M(U) - 1 + n) % n), !0;
			if (e.key === "Enter" || e.key === "Tab") {
				let e = t.entries[M(U)];
				return e && ve(e), !0;
			}
			return !1;
		}
	};
	w(() => {
		let e = M(V)?.view.dom;
		if (e) {
			if (M(H)) e.setAttribute("aria-haspopup", "listbox"), e.setAttribute("aria-expanded", "true"), e.setAttribute("aria-controls", ge), M(H).entries.length > 0 ? e.setAttribute("aria-activedescendant", `${ge}-${M(U)}`) : e.removeAttribute("aria-activedescendant");
			else for (let t of [
				"aria-expanded",
				"aria-controls",
				"aria-activedescendant"
			]) e.removeAttribute(t);
		}
	}), w(() => {
		M(V) && je(M(V), {
			map: te() ?? null,
			strings: M(B)
		});
	});
	let Se, Ce = null, we = !1, Ee = !1, De = (e) => e.getMarkdown().replace(/\u00A0+$/gm, "").trimEnd();
	function Oe() {
		if (clearTimeout(Se), Se = void 0, !M(V) || !we) return;
		we = !1;
		let e = De(M(V));
		e !== (r() ?? "") && e !== Ce && (Ce = e, ae(R, "change", { value: e }));
	}
	function ke(e, t) {
		Ee = !1, De(e) !== t && (e.commands.setContent(t, {
			contentType: "markdown",
			emitUpdate: !1
		}), we = !1, Ce = null);
	}
	function Ae(e) {
		z(ce, e.isEmpty, !0), z(le, {
			bold: e.isActive("bold"),
			italic: e.isActive("italic"),
			bulletList: e.isActive("bulletList"),
			orderedList: e.isActive("orderedList"),
			link: e.isActive("link")
		}, !0);
	}
	w(() => {
		let e = M(se);
		if (!e) return;
		let t = !!j(), n = !1, i = null;
		return import("./markdown-5ERcSjIp.js").then(({ createMarkdownEditor: o, exitSuggestion: s, flatten: c }) => {
			if (n) return;
			pe = s, me = c;
			let l = o({
				element: e,
				content: C(() => r() ?? ""),
				editable: C(() => !a()),
				singleLine: t,
				mention: {
					source: () => C(() => E()),
					controller: xe,
					strings: () => C(() => M(B))
				},
				onUpdate() {
					we = !0, clearTimeout(Se), Se = setTimeout(Oe, 600);
				},
				onBlur() {
					Oe(), Ee && ke(l, r() ?? "");
				},
				onFocus() {}
			});
			je(l, {
				map: C(() => te() ?? null),
				strings: C(() => M(B))
			}), l.on("transaction", () => Ae(l)), i = l, Ae(l), z(V, l), R.editor = l;
		}), () => {
			n = !0, z(H, null), Oe(), i?.destroy(), R.editor === i && (R.editor = null), z(V, null);
		};
	}), w(() => {
		let e = r() ?? "", t = M(V);
		t && C(() => {
			t.isFocused ? Ee = !0 : ke(t, e);
		});
	}), w(() => {
		let e = M(V)?.view.dom;
		e && (s() ? e.setAttribute("aria-label", s()) : e.removeAttribute("aria-label"));
	}), w(() => {
		let e = !a();
		M(V) && M(V).isEditable !== e && M(V).setEditable(e, !1);
	});
	function Pe(e) {
		e && M(V) && z(de, M(V).getAttributes("link").href ?? "", !0), z(ue, e, !0);
	}
	function Fe() {
		if (!M(V)) return;
		let e = M(de).trim(), t = M(V).chain().focus().extendMarkRange("link");
		e ? M(V).state.selection.empty && !M(V).isActive("link") ? t.insertContent({
			type: "text",
			text: e,
			marks: [{
				type: "link",
				attrs: { href: e }
			}]
		}).run() : t.setLink({ href: e }).run() : t.unsetLink().run(), z(ue, !1);
	}
	let Ie = (e) => e.preventDefault();
	var Le = {
		get value() {
			return r();
		},
		set value(e = "") {
			r(e), n();
		},
		get readonly() {
			return a();
		},
		set readonly(e = !1) {
			a(e), n();
		},
		get placeholder() {
			return o();
		},
		set placeholder(e = null) {
			o(e), n();
		},
		get label() {
			return s();
		},
		set label(e = null) {
			s(e), n();
		},
		get locale() {
			return u();
		},
		set locale(e = null) {
			u(e), n();
		},
		get strings() {
			return T();
		},
		set strings(e = null) {
			T(e), n();
		},
		get mentions() {
			return E();
		},
		set mentions(e = null) {
			E(e), n();
		},
		get singleLine() {
			return j();
		},
		set singleLine(e = !1) {
			j(e), n();
		},
		get mentionMap() {
			return te();
		},
		set mentionMap(e = null) {
			te(e), n();
		}
	}, Re = Xr(), ze = A(Re);
	ie(ze, {});
	var Be = D(ze, 2);
	return Te(Be, {
		value: () => R.shadowRoot,
		children: (e, t) => {
			var n = li(), r = N(n), i = (e) => {
				var t = Zr(), n = N(t), r = D(n, 2), i = D(r, 2), a = D(i, 2), o = D(a, 2);
				d(o, () => Wr, (e, t) => {
					t(e, {
						get open() {
							return M(ue);
						},
						portalled: !1,
						positioning: {
							strategy: "fixed",
							placement: "bottom-start"
						},
						onOpenChange: (e) => Pe(e.open),
						onEscapeKeyDown: (e) => {
							qe(e) && e.defaultPrevented && Pe(!1);
						},
						children: (e, t) => {
							var n = Xr(), r = A(n);
							{
								let e = I(() => !M(V));
								d(r, () => Kr, (t, n) => {
									n(t, {
										part: "tool-link",
										class: "tool",
										get "aria-label"() {
											return M(B).link;
										},
										get title() {
											return M(B).link;
										},
										get "aria-pressed"() {
											return M(le).link;
										},
										get disabled() {
											return M(e);
										},
										children: (e, t) => {
											var n = Jr();
											g(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							var i = D(r, 2);
							d(i, () => Sr, (e, t) => {
								t(e, {
									popover: "manual",
									get ref() {
										return M(fe);
									},
									set ref(e) {
										z(fe, e, !0);
									},
									children: (e, t) => {
										var n = v(), r = A(n);
										d(r, () => br, (e, t) => {
											t(e, {
												class: "af-overlay link",
												part: "link-popover",
												children: (e, t) => {
													var n = Yr(), r = N(n);
													ne(r);
													var i = D(r, 2), a = O(i, !0);
													l(n), F(() => {
														p(r, "aria-label", M(B).link), _(a, M(B).confirm);
													}), k("submit", n, (e) => {
														e.preventDefault(), Fe();
													}), f(r, () => M(de), (e) => z(de, e)), g(e, n);
												},
												$$slots: { default: !0 }
											});
										}), g(e, n);
									},
									$$slots: { default: !0 }
								});
							}), g(e, n);
						},
						$$slots: { default: !0 }
					});
				}), l(t), F(() => {
					p(n, "aria-label", M(B).bold), p(n, "title", M(B).bold), p(n, "aria-pressed", M(le).bold), n.disabled = !M(V), p(r, "aria-label", M(B).italic), p(r, "title", M(B).italic), p(r, "aria-pressed", M(le).italic), r.disabled = !M(V), p(i, "aria-label", M(B).bulletList), p(i, "title", M(B).bulletList), p(i, "aria-pressed", M(le).bulletList), i.disabled = !M(V), p(a, "aria-label", M(B).numberedList), p(a, "title", M(B).numberedList), p(a, "aria-pressed", M(le).orderedList), a.disabled = !M(V);
				}), P("mousedown", n, Ie), P("click", n, () => M(V)?.chain().focus().toggleBold().run()), P("mousedown", r, Ie), P("click", r, () => M(V)?.chain().focus().toggleItalic().run()), P("mousedown", i, Ie), P("click", i, () => M(V)?.chain().focus().toggleBulletList().run()), P("mousedown", a, Ie), P("click", a, () => M(V)?.chain().focus().toggleOrderedList().run()), g(e, t);
			};
			h(r, (e) => {
				!a() && !j() && e(i);
			});
			var s = D(r, 2), c = N(s), u = (e) => {
				var t = Qr(), n = O(t, !0);
				F(() => _(n, o())), g(e, t);
			};
			h(c, (e) => {
				M(ce) && o() && e(u);
			});
			var y = D(c, 2);
			S(y, (e) => z(se, e), () => M(se)), l(s);
			var b = D(s, 2), x = N(b);
			Ne(x, {
				tabStop: !1,
				children: (e, t) => {
					var n = Xr(), r = A(n), i = (e) => {
						var t = $r(), n = O(t, !0);
						F(() => _(n, M(B).noResults)), g(e, t);
					}, a = I(() => !ye(M(H)?.entries ?? []));
					h(r, (e) => {
						M(a) && e(i);
					});
					var o = D(r, 2);
					m(o, 17, () => M(_e), (e) => e.key + e.title, (e, t) => {
						var n = ci(), r = N(n), i = (e) => {
							var n = ei(), r = O(n, !0);
							F(() => _(r, M(t).title)), g(e, n);
						};
						h(r, (e) => {
							M(t).title && e(i);
						});
						var a = D(r, 2), o = (e) => {
							var n = ni();
							m(n, 21, () => M(t).rows, ({ entry: e, at: t }) => t, (e, t) => {
								let n = () => M(t).entry, r = () => M(t).at;
								var i = ti(), a = D(N(i), 2), o = O(a, !0);
								l(i), F(() => {
									p(i, "id", `${ge}-${r() ?? ""}`), p(i, "aria-selected", r() === M(U)), p(i, "data-picked", r() === M(U) ? "" : void 0), p(i, "data-group", n().scope?.group), _(o, n().scope?.label);
								}), P("mousedown", i, (e) => e.preventDefault()), k("mouseenter", i, () => z(U, r(), !0)), P("click", i, () => void ve(n())), P("keydown", i, () => {}), g(e, i);
							}), l(n), g(e, n);
						}, s = I(() => M(t).rows.every(({ entry: e }) => e.kind === "scope")), c = (e) => {
							var n = v(), r = A(n);
							m(r, 17, () => M(t).rows, ({ entry: e, at: t }) => t, (e, t) => {
								let n = () => M(t).entry, r = () => M(t).at;
								var i = si(), a = N(i), o = (e) => {
									var t = ri(), r = O(t, !0);
									F(() => _(r, n().more?.label)), g(e, t);
								}, s = (e) => {
									var t = oi(), r = A(t), i = O(r, !0), a = D(r, 2), o = N(a), s = O(o, !0), c = D(o, 2), u = (e) => {
										var t = ii(), r = O(t, !0);
										F(() => _(r, n().item.entity_label)), g(e, t);
									};
									h(c, (e) => {
										n().item.entity_label && e(u);
									}), l(a);
									var d = D(a, 2), f = (e) => {
										var t = ai(), r = O(t, !0);
										F(() => _(r, n().item.meta)), g(e, t);
									};
									h(d, (e) => {
										n().item.meta && e(f);
									}), F((e) => {
										_(i, e), _(s, n().item.label);
									}, [() => Array.from(n().item.label.trim())[0]?.toUpperCase() ?? "?"]), g(e, t);
								};
								h(a, (e) => {
									n().kind === "more" ? e(o) : n().item && e(s, 1);
								}), l(i), F(() => {
									p(i, "id", `${ge}-${r() ?? ""}`), p(i, "aria-selected", r() === M(U)), p(i, "data-picked", r() === M(U) ? "" : void 0), p(i, "data-kind", n().kind);
								}), P("mousedown", i, (e) => e.preventDefault()), k("mouseenter", i, () => z(U, r(), !0)), P("click", i, () => void ve(n())), P("keydown", i, () => {}), g(e, i);
							}), g(e, n);
						};
						h(a, (e) => {
							M(s) ? e(o) : e(c, -1);
						}), l(n), F(() => p(n, "aria-label", M(t).title)), g(e, n);
					}), g(e, n);
				},
				$$slots: { default: !0 }
			}), l(b), S(b, (e) => z(he, e), () => M(he)), l(n), F(() => {
				p(n, "data-readonly", a() ? "" : void 0), p(n, "data-single-line", j() ? "" : void 0), p(b, "id", ge), p(b, "aria-label", M(B).mentionMenu);
			}), g(e, n);
		},
		$$slots: { default: !0 }
	}), g(e, Re), c(Le);
}
j([
	"mousedown",
	"click",
	"keydown"
]), E(di, {
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
export { br as a, mr as c, Vn as d, In as f, Sr as i, Zn as l, qr as n, vr as o, Pn as p, Wr as r, gr as s, di as t, Nn as u };
