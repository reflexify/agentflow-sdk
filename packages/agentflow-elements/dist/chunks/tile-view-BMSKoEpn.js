import { d as e, i as t, m as n, r } from "./FolderSource-bewtzj77.js";
import { $ as i, B as a, Ct as o, Dt as s, F as c, Ft as l, J as u, M as d, Mt as f, Nt as p, Ot as m, P as h, Q as g, St as _, T as v, U as y, V as b, X as x, Y as S, Z as C, _ as w, a as T, at as E, b as D, bt as O, c as k, d as A, dt as j, et as M, f as N, ft as P, g as F, gt as I, ht as L, i as R, j as z, l as B, lt as V, mt as H, nt as U, o as ee, p as te, pt as W, rt as G, s as ne, st as re, tt as K, u as ie, ut as ae, vt as q, y as oe } from "./version-BYLi8HwQ.js";
import { a as se, i as ce, n as le, o as ue, r as de, s as fe, t as pe } from "./Loading-BzWYrT4_.js";
import { r as me } from "./format-GenuUIkK.js";
import { t as he } from "./Scroller-CBTu_fzU.js";
import { a as ge, s as _e, t as ve } from "./mention-chip-BxnXPO1a.js";
import { t as ye } from "./mention-token-IIKQP2Tz.js";
import { n as be, t as xe } from "./prose-Uu4vU7Zl.js";
//#region ../agentflow-sdk/dist/figures/notes.js
function Se(e, t) {
	return e?.capped ? {
		kind: t === "lower" ? "at_least" : t === "upper" ? "at_most" : "sample",
		cap: e.cap ?? null
	} : null;
}
var Ce = [
	["unfiltered_by_dashboard_filter", "unfiltered"],
	["declined_dashboard_filter", "declined"],
	["emptied_by_filter_intersection", "emptied"],
	["targets_withheld", "targets_withheld"],
	["partial", "partial"]
];
function we(e) {
	return e ? Ce.filter(([t]) => e[t] === !0).map(([, e]) => e) : [];
}
function Te(e) {
	let t = [];
	return e?.advisory === "unweighted_average" && t.push({ code: "unweighted_average" }), e?.skipped != null && e.skipped > 0 && t.push({
		code: "skipped",
		count: e.skipped
	}), t;
}
var Ee = {
	violet: "oklch(0.55 0.22 285)",
	sky: "oklch(0.60 0.15 245)",
	teal: "oklch(0.64 0.12 190)",
	emerald: "oklch(0.70 0.13 120)",
	amber: "oklch(0.66 0.15 55)",
	gray: "oklch(0.68 0.02 260)",
	indigo: "oklch(0.55 0.19 275)",
	rose: "oklch(0.64 0.20 15)",
	fuchsia: "oklch(0.63 0.24 320)"
}, De = /^#[0-9a-fA-F]{6}$/, Oe = /* @__PURE__ */ new Set(["$other", "$restricted"]);
function ke(e) {
	return e ? De.test(e) ? { value: e } : Object.hasOwn(Ee, e) ? { value: Ee[e] } : null : null;
}
function Ae(e, t) {
	return ke(e.color) ?? (t >= 0 && t < 8 ? { slot: t + 1 } : { other: !0 });
}
function je(e, t) {
	let n = se(t), r = n.length <= 8, i = /* @__PURE__ */ new Set();
	if (r) for (let [e, t] of n.entries()) ke(t.color) || i.add(e + 1);
	let a = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set();
	for (let t of e) {
		if (a.has(t)) continue;
		if (t !== null && Oe.has(t)) {
			a.set(t, { other: !0 });
			continue;
		}
		let e = t === null ? -1 : n.findIndex((e) => e.value === t);
		if (e < 0) continue;
		let i = ke(n[e].color);
		i ? a.set(t, i) : r && (a.set(t, { slot: e + 1 }), o.add(e + 1));
	}
	let s = (e) => {
		for (let t = 1; t <= 8; t++) if (!e(t)) return t;
		return null;
	};
	for (let t of e) {
		if (a.has(t)) continue;
		let e = s((e) => o.has(e) || i.has(e)) ?? s((e) => o.has(e));
		if (e === null) {
			a.set(t, { other: !0 });
			continue;
		}
		a.set(t, { slot: e }), o.add(e);
	}
	return e.map((e) => a.get(e));
}
function Me(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) for (let e of n.segments ?? []) t.add(e.key);
	return [...[...t].filter((e) => e === null || !Oe.has(e)), ...["$other", "$restricted"].filter((e) => t.has(e))];
}
function Ne(e, t) {
	let n = ue(e), r = n ? [n, ...e.filter((e) => e !== n)] : [], i = /* @__PURE__ */ new Map();
	for (let e of r) {
		let n = N(te(e, A(e, t))), r = i.get(n);
		r ? r.push(e) : i.set(n, [e]);
	}
	return [...i.values()];
}
function Pe(e, t) {
	let n = e?.measures;
	if (n) return t.key && n[t.key] !== void 0 ? n[t.key] : t.id ? n[t.id] : void 0;
}
//#endregion
//#region src/kit/tile/verdict.ts
var Fe = {
	partitions: "ok",
	fans_out: "warning",
	overlaps: "info",
	not_applicable: "info"
};
function Ie(e, t) {
	let n = e.query.measures, r = ue(n);
	return r && de(r, Pe(t, r)?.metric);
}
function Le(e, n, r, i, a) {
	if (e.kind !== "chart") return null;
	let o = n.verdict;
	if (!o) return null;
	let s = Ie(e, n), c = s ? A(s, r ?? void 0) : void 0, l = (e) => s ? R(s, e, c, a) : String(e), u = (e) => ({
		kind: o.kind,
		tone: Fe[o.kind],
		text: e
	});
	switch (o.kind) {
		case "partitions": {
			let n = !!e.stack_by;
			return typeof o.total == "number" ? u(t(n ? i.tileVerdictPartitionsStacked : i.tileVerdictPartitions, { total: l(o.total) })) : u(n ? i.tileVerdictPartitionsStackedNoTotal : i.tileVerdictPartitionsNoTotal);
		}
		case "fans_out": return u(t(i.tileVerdictFansOut, {
			bucketSum: l(o.bucket_sum),
			total: l(o.total),
			gap: l(Math.abs(o.gap))
		}));
		case "overlaps": return u(i.tileVerdictOverlaps);
		case "not_applicable": return u(i.tileVerdictNotApplicable);
		default: return null;
	}
}
//#endregion
//#region src/kit/tile/frame.ts
var Re = [
	"bar",
	"column",
	"line",
	"pie",
	"donut"
], ze = (e) => e === "pie" || e === "donut", Be = [
	"share_of_total",
	"running_total",
	"rank",
	"expression"
], Ve = (e) => e.kind === "chart" ? e.transform?.derive ?? null : null, He = (e) => {
	let t = Ve(e);
	return t === null || Be.includes(t.kind);
}, Ue = (e) => He(e) ? Ve(e) : null, We = {
	unfiltered: "tileUnfiltered",
	declined: "tileDeclined",
	emptied: "tileEmptied",
	targets_withheld: "tileTargetsWithheld",
	partial: "tilePartial"
};
function Ge(e, t) {
	return "query" in e ? e.query.measures.map((e) => de(e, Pe(t, e)?.metric)) : [];
}
function Ke(e) {
	return e.key || e.id || "";
}
function qe(e, t) {
	return "text" in e ? e.text : {
		empty: t.tileBucketEmpty,
		restricted: t.tileBucketRestricted,
		other: t.tileBucketOther,
		yes: t.tileYes,
		no: t.tileNo
	}[e.code];
}
function Je(e, t) {
	return new Intl.NumberFormat(t).format(e);
}
function Ye(e, t) {
	return we(e.coverage).map((e) => t[We[e]]);
}
function Xe(e, n, r) {
	return Te(e).map((e) => e.code === "skipped" ? t(n.tileSkipped, { count: Je(e.count, r) }) : n.tileUnweightedAverage);
}
function Ze(e, n, r) {
	if (e.cap === null) return n.tileCapIncomplete;
	let i = Je(e.cap, r);
	return e.kind === "sample" ? t(n.tileCapSample, { cap: i }) : t(e.kind === "at_least" ? n.tileChartCapAtLeast : n.tileChartCapAtMost, { cap: i });
}
function Qe(e, n, r) {
	switch (e.kind) {
		case "share_of_total": return n.some((e) => e.other === !0) ? `${r.tileDerivedShare} — ${r.tileDerivedShareRemainder}` : r.tileDerivedShare;
		case "running_total": return r.tileDerivedRunning;
		case "rank": return t(r.tileDerivedRank, {
			direction: e.direction === "asc" ? r.tileRankLowest : r.tileRankHighest,
			ties: e.ties === "dense" ? r.tileTiesDense : r.tileTiesCompetition
		});
		case "expression": return e.label?.trim() || r.tileFormula;
	}
}
function $e(e, t, n, r) {
	if (!e) return { kind: "loading" };
	if (t?.outcome === "unavailable") return { kind: "unavailable" };
	if (t?.outcome === "failed") {
		let e = t.problem;
		return {
			kind: "failed",
			title: e ? e.title : n.tileFailed,
			detail: e?.detail ?? null
		};
	}
	if (e.kind === "text") return { kind: "text" };
	if (!t) return { kind: "loading" };
	if (e.kind === "number") return { kind: "number" };
	if (e.kind === "list") return r ? { kind: "list" } : { kind: "loading" };
	if (e.kind !== "chart") return { kind: "not-drawn" };
	let i = Re.find((t) => t === e.chart);
	return !i || !He(e) ? { kind: "not-drawn" } : {
		kind: "chart",
		chart: i
	};
}
function et(e, t, n, r, i, a = !1) {
	let o = n ?? void 0, s = e ? Ge(e, t) : [], c = e ? fe({
		kind: e.kind,
		label: e.label,
		query: { measures: s }
	}, o) : "", l = $e(e, t, r, a);
	if (!t || l.kind !== "number" && l.kind !== "chart" && l.kind !== "list") return {
		title: c,
		state: l,
		verdict: null,
		notes: []
	};
	let u = Ye(t, r);
	if (l.kind === "number" || l.kind === "list") return {
		title: c,
		state: l,
		verdict: null,
		notes: u
	};
	let d = ue(s), f = d ? Pe(t, d) : void 0, p = Se(t.population, f?.cap_bound), m = e ? Ue(e) : null;
	return {
		title: c,
		state: l,
		verdict: e ? Le(e, t, n, r, i) : null,
		notes: [
			...m ? [Qe(m, f?.buckets ?? [], r)] : [],
			...p ? [Ze(p, r, i)] : [],
			...u,
			...Xe(f, r, i)
		]
	};
}
//#endregion
//#region src/kit/tile/chart-model.ts
var tt = "—", nt = (e, t, n = {}) => ({
	kind: e,
	label: t,
	series: null,
	bucket: null,
	detail: null,
	color: null,
	pattern: null,
	...n
});
function rt(e, t) {
	return e === "$restricted" ? "restricted" : e === "$other" || "other" in t ? "other" : null;
}
function it(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e ?? []) t.has(n.key) || t.set(n.key, n);
	return t;
}
var at = (e) => typeof e == "number" && Number.isFinite(e) && e > 0, ot = (e) => !e.filled && at(e.values[0]);
function st(e) {
	let t = 0;
	for (let n of e.buckets) ot(n) && (t += n.values[0]);
	return e.buckets.map((e) => ot(e) ? e.values[0] / t : null);
}
var ct = {
	count: "tileUnitCount",
	ratio: "tileUnitRatio",
	percent: "tileUnitPercent",
	number: "tileUnitNumber",
	duration: "tileUnitDuration",
	rating: "tileUnitRating",
	date: "tileUnitDate"
}, lt = {
	minutes: "tileUnitMinutes",
	hours: "tileUnitHours",
	days: "tileUnitDays"
};
function ut(e, t) {
	return e.kind === "currency" ? e.code : t[e.kind === "elapsed" ? lt[e.unit] : ct[e.kind]];
}
function dt(e, t, n) {
	let r = n ?? void 0, i = e.kind === "chart" ? e : null, a = Ge(e, t);
	return {
		result: t,
		known: r,
		chart: i,
		type: Re.find((e) => e === i?.chart) ?? "bar",
		measures: a,
		groups: i ? Ne(a, r) : [],
		derive: Ue(e)
	};
}
function ft(e, t, n, r, i, a) {
	let o = dt(e, t, n), s = ze(o.type) ? 1 : Math.max(1, o.groups.length);
	return Array.from({ length: s }, (e, t) => pt(o, r, i, a, t, s));
}
function pt(e, t, n, r, i, a) {
	let { result: o, known: s, chart: c, type: l, measures: u, groups: d } = e, f = ze(l), p = d[i] ?? [], m = f ? p.slice(0, 1) : p, h = m[0], g = d[0]?.[0], _ = g && Pe(o, g)?.buckets || [], v = i === 0, y = v ? e.derive : null, b = c?.split_by, x = b && !b.via ? s?.find((e) => e.key === b.field) : void 0, S = c && a === 1 && (l === "bar" || l === "column") ? c.stack_by ?? null : null, C = S && !S.via ? s?.find((e) => e.key === S.field) : void 0, w = S !== null && h !== void 0, T;
	if (w) {
		let e = Me(_), n = je(e, C);
		T = e.map((e, r) => {
			let i = _.flatMap((e) => e.segments ?? []).find((t) => t.key === e);
			return {
				label: qe(le(i ?? { key: e }, C, S.bucket), t),
				color: n[r],
				pattern: rt(e, n[r]),
				measure: Ke(h),
				segment: e
			};
		});
	} else T = m.map((e) => {
		let t = Ae(e, u.indexOf(e));
		return {
			label: ce(e, s),
			color: t,
			pattern: rt(null, t),
			measure: Ke(e),
			segment: null
		};
	});
	let E = w ? [] : m.map((e, t) => v && t === 0 ? null : it(Pe(o, e)?.buckets)), D = r && o.outcome === "ok" && c?.drill_disabled !== !0, O = _.map((e) => {
		let n = qe(le(e, x, b?.bucket), t), r = w ? T.map((t) => e.segments?.find((e) => e.key === t.segment)) : m.map((t, n) => v && n === 0 ? e : E[n].get(e.key)), i = r.map((t, r) => !D || !t?.drill ? null : {
			drill: t.drill,
			measure: T[r].measure,
			bucket: e.key,
			segment: w ? t.key : null,
			label: w ? `${n} · ${T[r].label}` : n,
			count: t.count,
			other: t.other === !0
		}), a = v ? e.comparison ?? null : null;
		return {
			key: e.key,
			label: n,
			other: e.other === !0,
			restricted: e.key === "$restricted",
			filled: e.filled === !0,
			unmatched: v && e.unmatched === !0,
			target: v ? e.target ?? null : null,
			previous: a?.previous ?? null,
			difference: a?.difference ?? null,
			percentChange: a?.percent_change ?? null,
			compared: a !== null,
			derived: y ? e.derived ?? null : null,
			total: y ? e.value ?? null : null,
			values: r.map((e) => e?.value ?? null),
			counts: r.map((e) => e?.count ?? 0),
			drills: i
		};
	}), k = O.some((e) => e.compared), j = h ?? {}, M = A(j, s), N = B(j, M, n), P = f ? vt(O, x, n) : [], F = gt(y, l, a, O, N, _, t, n), I = e.derive?.kind === "rank" && (l === "bar" || l === "column") ? _.map((e) => typeof e.derived == "number" && Number.isFinite(e.derived) ? ht(e.derived) : null) : [], L = [];
	return f ? O.forEach((e, t) => {
		if (!ot(e)) return;
		let n = P[t];
		L.push(nt("slice", e.label, {
			bucket: t,
			detail: `${N(e.values[0])} · ${n.share}`,
			color: n.color,
			pattern: n.pattern
		}));
	}) : (T.forEach((e, t) => L.push(nt("series", e.label, {
		series: t,
		color: e.color,
		pattern: e.pattern
	}))), k && !w && L.push(nt("earlier", t.tileEarlier, {
		color: T[0]?.color ?? null,
		pattern: T[0]?.pattern ?? null
	})), O.some((e) => e.target !== null) && L.push(nt("target", t.tileTarget)), F.derive?.kind === "running_total" && L.push(nt("running", t.tileRunningTotal)), F.derive?.kind === "expression" && F.beside.length > 0 && L.push(nt("formula", F.derive.label)), O.some((e) => e.filled) && L.push(nt("filled", t.tileFilled))), {
		type: l,
		stacked: w,
		compared: k,
		series: T,
		buckets: O,
		slices: P,
		splitLabel: x?.label || b?.field || "",
		empty: O.length === 0 || o.population?.count === 0 || f && !O.some(ot),
		legend: L,
		drill: {
			enabled: D,
			disabled: r && c?.drill_disabled === !0
		},
		format: N,
		unitLabel: a > 1 && h ? ut(te(h, M), t) : null,
		...F,
		ranks: I
	};
}
var mt = () => tt, ht = (e) => `#${e}`;
function gt(e, t, n, r, i, a, o, s) {
	if (!e) return {
		derive: null,
		formatDerived: mt,
		beside: [],
		alone: []
	};
	let c, l, u = tt;
	switch (e.kind) {
		case "share_of_total": {
			let e = a.reduce((e, t) => e + (t.derived == null ? 0 : t.count), 0);
			c = (t) => ne(t, e, s), l = ze(t) ? o.tileDerivedShare : o.tileShare;
			break;
		}
		case "running_total":
			c = i, l = o.tileDerivedRunning;
			break;
		case "rank":
			c = ht, l = o.tileRank;
			break;
		case "expression": {
			let t = new Intl.NumberFormat(s, { maximumFractionDigits: 2 });
			c = (e) => t.format(e), l = e.label?.trim() || o.tileFormula, u = o.tileFormulaNoValue;
			break;
		}
	}
	let d = /* @__PURE__ */ new Map(), f = (e) => {
		let t = d.get(e);
		return t === void 0 && (t = e === null || !Number.isFinite(e) ? u : c(e), d.set(e, t)), t;
	}, p = (e.kind === "share_of_total" || e.kind === "expression" && n === 1) && (t === "bar" || t === "column");
	return {
		derive: {
			kind: e.kind,
			label: l
		},
		formatDerived: f,
		beside: p ? r.map((e) => e.derived === null ? null : `${i(e.total)} · ${f(e.derived)}`) : [],
		alone: p ? r.map((e) => e.derived === null ? null : f(e.derived)) : []
	};
}
function _t(e) {
	let [t, ...n] = e;
	return !t || n.length === 0 ? t?.legend ?? [] : [...e.flatMap((e) => e.legend.filter((e) => e.kind === "series")), ...t.legend.filter((e) => e.kind !== "series")];
}
function vt(e, t, n) {
	let r = je(e.map((e) => e.key), t), i = st({ buckets: e }), a = e.reduce((e, t) => e + (ot(t) ? t.counts[0] ?? 0 : 0), 0);
	return e.map((e, t) => ({
		color: r[t],
		pattern: e.restricted ? "restricted" : e.other ? "other" : rt(e.key, r[t]),
		share: i[t] === null ? tt : ne(i[t], a, n)
	}));
}
function yt(e) {
	return e ? "slot" in e ? `var(--k-chart-${e.slot})` : "value" in e ? e.value : "" : "";
}
function bt(e, t, n, r) {
	return e.unmatched ? n.tileUnmatched : !t && e.previous !== null ? n.tileGone : t && e.previous === null ? n.tileNew : ee(e.percentChange, r) ?? n.tileNoEarlier;
}
function xt(e, t, n, r) {
	let i = e[0];
	if (!i) return {
		head: [],
		rows: []
	};
	let a = e.map((e) => e.series.flatMap((e, n) => t.has(n) ? [] : [n])), o = i.buckets.some((e) => e.target !== null), s = (e, t) => t === null ? tt : e.format(t), c = ze(i.type), l = [i.splitLabel, ...e.flatMap((e, t) => a[t].map((t) => e.series[t].label))];
	return c && l.push(n.tileShare), i.compared && l.push(n.tileEarlier, n.tileDifference), i.derive && l.push(i.derive.label), o && l.push(n.tileTarget), {
		head: l,
		rows: i.buckets.map((t, l) => {
			let u = [t.label, ...e.flatMap((e, t) => a[t].map((t) => s(e, e.buckets[l]?.values[t] ?? null)))];
			if (c && u.push(i.slices[l]?.share ?? tt), i.compared) {
				let e = i.stacked ? t.values.some((e) => e !== null) : t.values[0] !== null && t.values[0] !== void 0;
				u.push(s(i, t.previous), bt(t, e, n, r));
			}
			return i.derive && u.push(i.formatDerived(t.derived)), o && u.push(s(i, t.target)), u;
		})
	};
}
//#endregion
//#region src/kit/tile/Axes.svelte
var St = g("<text class=\"unit svelte-1drwwxe\" dominant-baseline=\"central\"> </text>"), Ct = g("<line class=\"svelte-1drwwxe\"></line><text text-anchor=\"middle\" class=\"svelte-1drwwxe\"> </text>", 1), wt = g("<line class=\"svelte-1drwwxe\"></line><text text-anchor=\"end\" dominant-baseline=\"central\" class=\"svelte-1drwwxe\"> </text>", 1), Tt = g("<line class=\"svelte-1drwwxe\"></line>"), Et = g("<title> </title>"), Dt = g("<text text-anchor=\"end\" dominant-baseline=\"central\" class=\"svelte-1drwwxe\"><!> </text>"), Ot = g("<text text-anchor=\"middle\" class=\"svelte-1drwwxe\"><!> </text>"), kt = g("<g class=\"axes\" aria-hidden=\"true\"><!><!><!><!></g>"), At = {
	hash: "svelte-1drwwxe",
	code: "text.svelte-1drwwxe {font-size:11px;}line.svelte-1drwwxe {stroke-width:1;}"
};
function jt(e, t) {
	m(t, !0), c(e, At);
	let n = w(t, "layout", 7), r = w(t, "horizontal", 7), i = w(t, "zero", 7, null), l = o(() => n().plot), d = o(() => i() ?? E(l).y + E(l).height);
	var f = {
		get layout() {
			return n();
		},
		set layout(e) {
			n(e), _();
		},
		get horizontal() {
			return r();
		},
		set horizontal(e) {
			r(e), _();
		},
		get zero() {
			return i();
		},
		set zero(e = null) {
			i(e), _();
		}
	}, h = kt(), g = P(h), C = (e) => {
		var t = St();
		z(t, "", {}, { fill: "var(--k-muted)" });
		var r = H(t, !0);
		V(() => {
			v(t, "x", n().unit.x), v(t, "y", n().unit.y), u(r, n().unit.text);
		}), S(e, t);
	};
	y(g, (e) => {
		n().unit && e(C);
	});
	var T = L(g);
	a(T, 17, () => n().valueTicks, b, (e, t) => {
		var n = x(), i = W(n), a = (e) => {
			var n = Ct(), r = W(n);
			z(r, "", {}, { stroke: "var(--k-chart-grid)" });
			var i = L(r);
			z(i, "", {}, { fill: "var(--k-muted)" });
			var a = H(i, !0);
			V(() => {
				v(r, "x1", E(t).at), v(r, "y1", E(l).y), v(r, "x2", E(t).at), v(r, "y2", E(l).y + E(l).height), v(i, "x", E(t).at), v(i, "y", E(l).y + E(l).height + 16), u(a, E(t).label);
			}), S(e, n);
		}, o = (e) => {
			var n = wt(), r = W(n);
			z(r, "", {}, { stroke: "var(--k-chart-grid)" });
			var i = L(r);
			z(i, "", {}, { fill: "var(--k-muted)" });
			var a = H(i, !0);
			V(() => {
				v(r, "x1", E(l).x), v(r, "y1", E(t).at), v(r, "x2", E(l).x + E(l).width), v(r, "y2", E(t).at), v(i, "x", E(l).x - 8), v(i, "y", E(t).at), u(a, E(t).label);
			}), S(e, n);
		};
		y(i, (e) => {
			r() ? e(a) : e(o, -1);
		}), S(e, n);
	});
	var D = L(T), O = (e) => {
		var t = Tt();
		z(t, "", {}, { stroke: "var(--k-chart-axis)" }), V(() => {
			v(t, "x1", E(d)), v(t, "y1", E(l).y), v(t, "x2", E(d)), v(t, "y2", E(l).y + E(l).height);
		}), S(e, t);
	}, k = (e) => {
		var t = Tt();
		z(t, "", {}, { stroke: "var(--k-chart-axis)" }), V(() => {
			v(t, "x1", E(l).x), v(t, "y1", E(d)), v(t, "x2", E(l).x + E(l).width), v(t, "y2", E(d));
		}), S(e, t);
	};
	y(D, (e) => {
		r() ? e(O) : e(k, -1);
	});
	var A = L(D);
	return a(A, 17, () => n().categoryTicks, b, (e, t) => {
		var n = x(), i = W(n), a = (e) => {
			var n = Dt();
			z(n, "", {}, { fill: "var(--k-muted)" });
			var r = P(n), i = (e) => {
				var n = Et(), r = H(n, !0);
				V(() => u(r, E(t).full)), S(e, n);
			};
			y(r, (e) => {
				E(t).label !== E(t).full && e(i);
			});
			var a = L(r, 1, !0);
			p(n), V(() => {
				v(n, "x", E(l).x - 8), v(n, "y", E(t).at), u(a, E(t).label);
			}), S(e, n);
		}, o = (e) => {
			var n = Ot();
			z(n, "", {}, { fill: "var(--k-muted)" });
			var r = P(n), i = (e) => {
				var n = Et(), r = H(n, !0);
				V(() => u(r, E(t).full)), S(e, n);
			};
			y(r, (e) => {
				E(t).label !== E(t).full && e(i);
			});
			var a = L(r, 1, !0);
			p(n), V(() => {
				v(n, "x", E(t).at), v(n, "y", E(l).y + E(l).height + 16), u(a, E(t).label);
			}), S(e, n);
		};
		y(i, (e) => {
			r() ? e(a) : e(o, -1);
		}), S(e, n);
	}), p(h), S(e, h), s(f);
}
F(jt, {
	layout: {},
	horizontal: {},
	zero: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Bars.svelte
var Mt = g("<rect aria-hidden=\"true\" class=\"svelte-4g1uej\"></rect>"), Nt = g("<rect class=\"svelte-4g1uej\"></rect>"), Pt = g("<line data-kind=\"target\" aria-hidden=\"true\" stroke-width=\"2\" class=\"svelte-4g1uej\"></line>"), Ft = g("<circle data-kind=\"running-dot\" aria-hidden=\"true\" r=\"4\" stroke-width=\"1.5\" class=\"svelte-4g1uej\"></circle>"), It = g("<path data-kind=\"running\" aria-hidden=\"true\" stroke-width=\"1.5\" stroke-linejoin=\"round\" class=\"svelte-4g1uej\"></path><!>", 1), Lt = g("<text class=\"figure svelte-4g1uej\" data-kind=\"label\"> </text>"), Rt = g("<g aria-hidden=\"true\" class=\"svelte-4g1uej\"></g>"), zt = g("<!><!><!><!>", 1), Bt = {
	hash: "svelte-4g1uej",
	code: ".figure.svelte-4g1uej {font-size:11px;}rect.svelte-4g1uej {transition:opacity 120ms;}[aria-hidden='true'].svelte-4g1uej {pointer-events:none;}[tabindex].svelte-4g1uej {outline:none;-webkit-tap-highlight-color:transparent;}[role='button'].svelte-4g1uej:not([aria-disabled='true']) {cursor:pointer;}[tabindex].svelte-4g1uej:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}\n  @media (prefers-reduced-motion: reduce) {rect.svelte-4g1uej {transition:none;}\n  }"
};
function Vt(e, t) {
	m(t, !0), c(e, Bt);
	let n = w(t, "marks", 7), r = w(t, "targets", 7), i = w(t, "labels", 7), o = w(t, "running", 7), l = w(t, "ids", 7), d = w(t, "opens", 7), f = w(t, "tab", 7), h = w(t, "emphasis", 7), g = w(t, "onkey", 7), b = w(t, "onopen", 7), C = (e) => e.pattern ? `url(#${l()[e.pattern]})` : e.fill || "var(--k-chart-other)", T = (e) => h() !== null && e.series !== h() ? Math.min(e.opacity, .25) : e.opacity, D = (e) => e.pattern ? "var(--k-chart-hatch)" : e.fill || "var(--k-chart-hatch)";
	var O = {
		get marks() {
			return n();
		},
		set marks(e) {
			n(e), _();
		},
		get targets() {
			return r();
		},
		set targets(e) {
			r(e), _();
		},
		get labels() {
			return i();
		},
		set labels(e) {
			i(e), _();
		},
		get running() {
			return o();
		},
		set running(e) {
			o(e), _();
		},
		get ids() {
			return l();
		},
		set ids(e) {
			l(e), _();
		},
		get opens() {
			return d();
		},
		set opens(e) {
			d(e), _();
		},
		get tab() {
			return f();
		},
		set tab(e) {
			f(e), _();
		},
		get emphasis() {
			return h();
		},
		set emphasis(e) {
			h(e), _();
		},
		get onkey() {
			return g();
		},
		set onkey(e) {
			g(e), _();
		},
		get onopen() {
			return b();
		},
		set onopen(e) {
			b(e), _();
		}
	}, k = zt(), A = W(k);
	a(A, 17, n, (e) => `${e.bucket}:${e.series}:${e.kind}`, (e, t) => {
		var n = x(), r = W(n), i = (e) => {
			var n = Mt();
			let r;
			V((e, i) => {
				v(n, "data-kind", E(t).kind), v(n, "data-bucket", E(t).bucket), v(n, "data-series", E(t).series), v(n, "x", E(t).x), v(n, "y", E(t).y), v(n, "width", E(t).width), v(n, "height", E(t).height), r = z(n, "", r, {
					fill: e,
					opacity: i
				});
			}, [() => C(E(t)), () => T(E(t))]), S(e, n);
		}, a = (e) => {
			var n = Nt();
			let r;
			V((e, i, a) => {
				v(n, "role", d() ? "button" : "img"), v(n, "tabindex", f()?.bucket === E(t).bucket && f().series === E(t).series ? 0 : -1), v(n, "aria-label", E(t).summary), v(n, "aria-disabled", d() && !E(t).drill ? "true" : void 0), v(n, "data-kind", E(t).kind), v(n, "data-bucket", E(t).bucket), v(n, "data-series", E(t).series), v(n, "x", E(t).x), v(n, "y", E(t).y), v(n, "width", E(t).width), v(n, "height", E(t).height), v(n, "stroke-width", E(t).kind === "filled" ? 1 : void 0), v(n, "stroke-dasharray", E(t).kind === "filled" ? "3 2" : void 0), r = z(n, "", r, {
					fill: e,
					stroke: i,
					opacity: a
				});
			}, [
				() => E(t).kind === "filled" ? "none" : C(E(t)),
				() => E(t).kind === "filled" ? D(E(t)) : void 0,
				() => T(E(t))
			]), U("click", n, (e) => b()(E(t), e)), G("auxclick", n, (e) => b()(E(t), e)), U("keydown", n, (e) => g()(e, E(t))), S(e, n);
		};
		y(r, (e) => {
			E(t).kind === "previous" ? e(i) : e(a, -1);
		}), S(e, n);
	});
	var j = L(A);
	a(j, 17, r, (e) => e.bucket, (e, t) => {
		var n = Pt();
		z(n, "", {}, { stroke: "var(--k-fg)" }), V(() => {
			v(n, "data-bucket", E(t).bucket), v(n, "x1", E(t).x1), v(n, "y1", E(t).y1), v(n, "x2", E(t).x2), v(n, "y2", E(t).y2);
		}), S(e, n);
	});
	var M = L(j), N = (e) => {
		var t = It(), n = W(t);
		z(n, "", {}, {
			fill: "none",
			stroke: "var(--k-fg)",
			opacity: .7
		});
		var r = L(n);
		a(r, 17, () => o().dots, (e) => e.bucket, (e, t) => {
			var n = Ft();
			let r;
			V(() => {
				v(n, "data-bucket", E(t).bucket), v(n, "cx", E(t).cx), v(n, "cy", E(t).cy), r = z(n, "", r, {
					fill: E(t).hollow ? "var(--k-surface)" : "var(--k-fg)",
					stroke: "var(--k-fg)"
				});
			}), S(e, n);
		}), V(() => v(n, "d", o().d)), S(e, t);
	};
	y(M, (e) => {
		o() && e(N);
	});
	var P = L(M), F = (e) => {
		var t = Rt();
		a(t, 21, i, (e) => e.bucket, (e, t) => {
			var n = Lt();
			z(n, "", {}, { fill: "var(--k-fg)" });
			var r = H(n, !0);
			V(() => {
				v(n, "data-bucket", E(t).bucket), v(n, "x", E(t).x), v(n, "y", E(t).y), v(n, "text-anchor", E(t).anchor), v(n, "dominant-baseline", E(t).anchor === "start" ? "central" : void 0), u(r, E(t).text);
			}), S(e, n);
		}), p(t), S(e, t);
	};
	return y(P, (e) => {
		i().length > 0 && e(F);
	}), S(e, k), s(O);
}
K(["click", "keydown"]), F(Vt, {
	marks: {},
	targets: {},
	labels: {},
	running: {},
	ids: {},
	opens: {},
	tab: {},
	emphasis: {},
	onkey: {},
	onopen: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Hatch.svelte
var Ht = g("<defs><pattern width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\"><rect width=\"6\" height=\"6\"></rect><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"6\" stroke-width=\"2\"></line></pattern><pattern width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-45)\"><rect width=\"6\" height=\"6\"></rect><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"6\" stroke-width=\"2\" stroke-dasharray=\"2 2\"></line></pattern></defs>");
function Ut(e, t) {
	m(t, !0);
	let n = w(t, "ids", 7);
	var r = {
		get ids() {
			return n();
		},
		set ids(e) {
			n(e), _();
		}
	}, i = Ht(), a = P(i), o = P(a);
	z(o, "", {}, { fill: "var(--k-chart-other)" });
	var c = L(o);
	z(c, "", {}, { stroke: "var(--k-chart-hatch)" }), p(a);
	var l = L(a), u = P(l);
	z(u, "", {}, { fill: "var(--k-chart-other)" });
	var d = L(u);
	return z(d, "", {}, { stroke: "var(--k-chart-hatch)" }), p(l), p(i), V(() => {
		v(a, "id", n().other), v(l, "id", n().restricted);
	}), S(e, i), s(r);
}
F(Ut, { ids: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/interaction.ts
var Wt = (e) => e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey, Gt = (e) => e.type !== "auxclick" || e.button === 1;
function Kt(e) {
	e.button === 1 && e.preventDefault();
}
var qt = (e) => typeof e == "number" && Number.isFinite(e), Jt = (e, t) => e.series.flatMap((e, n) => t.has(n) ? [] : [n]);
function Yt(e, t, n, r) {
	let i = e.buckets[n];
	return !i || !e.series[r] || t.has(r) ? !1 : ze(e.type) ? ot(i) : i.filled && e.type !== "line" ? Jt(e, t)[0] === r : qt(i.values[r]);
}
var Xt = (e) => e.startsWith("Arrow") || e === "Home" || e === "End";
function Zt(e, t, n, r) {
	for (let i = e + t; i >= 0 && i < n; i += t) if (r(i)) return i;
	return null;
}
var Qt = (e) => e === "ArrowUp" ? "ArrowLeft" : e === "ArrowDown" ? "ArrowRight" : e;
function $t(e, t, n, r) {
	let i = n.type === "bar", [a, o] = i ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"], [s, c] = i ? ["ArrowLeft", "ArrowRight"] : n.stacked ? ["ArrowDown", "ArrowUp"] : ["ArrowUp", "ArrowDown"], l = n.buckets.length, u = (t) => Yt(n, r, t, e.series), d = (t) => Yt(n, r, e.bucket, t), f = (t) => t === null || t === e.bucket ? e : {
		bucket: t,
		series: e.series
	}, p = (t) => t === null || t === e.series ? e : {
		bucket: e.bucket,
		series: t
	};
	switch (ze(n.type) ? Qt(t) : t) {
		case a: return f(Zt(e.bucket, -1, l, u));
		case o: return f(Zt(e.bucket, 1, l, u));
		case s: return p(Zt(e.series, -1, n.series.length, d));
		case c: return p(Zt(e.series, 1, n.series.length, d));
		case "Home": return f(Zt(-1, 1, l, u));
		case "End": return f(Zt(l, -1, l, u));
		default: return e;
	}
}
function en(e, t, n) {
	if (e && Yt(t, n, e.bucket, e.series)) return e;
	let r = e ?? {
		bucket: 0,
		series: 0
	}, i = null, a = [Infinity, Infinity];
	for (let e = 0; e < t.buckets.length; e++) for (let o = 0; o < t.series.length; o++) {
		if (!Yt(t, n, e, o)) continue;
		let s = [Math.abs(e - r.bucket), Math.abs(o - r.series)];
		(s[0] < a[0] || s[0] === a[0] && s[1] < a[1]) && (i = {
			bucket: e,
			series: o
		}, a = s);
	}
	return i;
}
var tn = (e, t, n) => n > 1 && e.size === n - 1 && !e.has(t);
function nn(e, t, n) {
	return tn(e, t, n) ? /* @__PURE__ */ new Set() : new Set(Array.from({ length: n }, (e, t) => t).filter((e) => e !== t));
}
var rn = (e) => JSON.stringify([e.measure, e.segment]);
function an(e, t, n) {
	let r = t.series.length, i = r > 1 && e.size === r - 1 ? t.series.findIndex((t, n) => !e.has(n)) : -1, a = i < 0 || n.series.length < 2 ? -1 : n.series.findIndex((e) => rn(e) === rn(t.series[i]));
	return a < 0 ? /* @__PURE__ */ new Set() : new Set(n.series.flatMap((e, t) => t === a ? [] : [t]));
}
function on(e, t, n) {
	let r = e.buckets[t];
	if (!r || e.stacked || r.filled) return null;
	for (let t = 0; t < e.series.length; t++) if (!n.has(t) && r.drills[t]) return r.drills[t];
	return null;
}
function sn(e, n, r, i, a, o) {
	let s = e.buckets[n], c = Jt(e, r);
	if (!s) return {
		title: "",
		rows: [],
		target: null,
		earlier: null,
		change: null,
		total: null,
		share: null,
		derived: null,
		hint: null
	};
	let l = ze(e.type) ? e.slices[n] : void 0, u = c.map((t) => {
		let n = e.series[t], r = s.values[t] ?? null, a = e.stacked ? n.pattern : s.restricted ? "restricted" : s.other ? "other" : n.pattern, c = r === null ? i.tileNoData : e.stacked ? `${e.format(r)} · ${Je(s.counts[t] ?? 0, o)}` : e.format(r);
		return {
			label: n.label,
			value: c,
			color: l?.color ?? n.color,
			pattern: l ? l.pattern : a
		};
	}), d = null, f = null;
	if (e.compared || s.compared) {
		let t = e.stacked ? c.some((e) => s.values[e] != null) : s.values[0] != null;
		d = s.previous === null ? i.tileNew : e.format(s.previous), f = s.unmatched ? i.tileUnmatched : !t && s.previous !== null ? i.tileGone : ee(s.percentChange, o) ?? i.tileNoEarlier;
	}
	let p = e.stacked ? c.map((e) => s.values[e]).filter(qt) : [], m = null, h = null;
	if (e.stacked) {
		let e = c.flatMap((e) => s.drills[e] ? [s.drills[e]] : []);
		e.length > 0 && (h = e.reduce((e, t) => e + t.count, 0));
	} else h = l ? s.drills[0]?.count ?? null : on(e, n, r)?.count ?? null;
	return a.enabled && h !== null ? m = t(h === 1 ? i.tileOpenRecordsOne : i.tileOpenRecords, { count: Je(h, o) }) : a.disabled && (m = i.tileDrillOff), {
		title: s.label,
		rows: u,
		target: qt(s.target) ? e.format(s.target) : null,
		earlier: d,
		change: f,
		total: p.length > 0 ? e.format(p.reduce((e, t) => e + t, 0)) : null,
		share: l ? l.share : null,
		derived: e.derive ? {
			label: e.derive.label,
			value: e.formatDerived(s.derived)
		} : null,
		hint: m
	};
}
var cn = 8, ln = 4, un = (e, t, n) => Math.min(Math.max(ln, e), Math.max(ln, n - t - ln));
function dn(e, t, n, r) {
	let i, a;
	return r === "above" ? (i = e.left + e.width / 2 - t.width / 2, a = e.top - cn - t.height, a < ln && (a = e.top + e.height + cn)) : (i = e.left + e.width + cn, i + t.width > n.width - ln && (i = e.left - cn - t.width), a = e.top + e.height / 2 - t.height / 2), {
		left: un(i, t.width, n.width),
		top: un(a, t.height, n.height)
	};
}
//#endregion
//#region ../../node_modules/.pnpm/d3-path@3.1.1/node_modules/d3-path/dist/d3-path.mjs
var fn = Math.PI, pn = 2 * fn, mn = 1e-6, hn = pn - mn;
function gn(e) {
	this._ += e[0];
	for (let t = 1, n = e.length; t < n; ++t) this._ += arguments[t] + e[t];
}
function _n(e) {
	let t = Math.floor(e);
	if (!(t >= 0)) throw Error(`invalid digits: ${e}`);
	if (t > 15) return gn;
	let n = 10 ** t;
	return function(e) {
		this._ += e[0];
		for (let t = 1, r = e.length; t < r; ++t) this._ += Math.round(arguments[t] * n) / n + e[t];
	};
}
function vn(e, t, n, r) {
	return e === n && t === r;
}
function yn(e) {
	let t = Math.floor(e);
	if (!(t <= 15)) return vn;
	let n = 10 ** t, r = function(e) {
		return Math.round(e * n);
	};
	return function(e, t, n, i) {
		return r(e) === r(n) && r(t) === r(i);
	};
}
var bn = class {
	constructor(e) {
		this._x0 = this._y0 = this._x1 = this._y1 = null, this._ = "", this._append = e == null ? gn : _n(e), this._equal = e == null ? vn : yn(e);
	}
	moveTo(e, t) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}`;
	}
	closePath() {
		this._x1 !== null && (this._x1 = this._x0, this._y1 = this._y0, this._append`Z`);
	}
	lineTo(e, t) {
		this._append`L${this._x1 = +e},${this._y1 = +t}`;
	}
	quadraticCurveTo(e, t, n, r) {
		this._append`Q${+e},${+t},${this._x1 = +n},${this._y1 = +r}`;
	}
	bezierCurveTo(e, t, n, r, i, a) {
		this._append`C${+e},${+t},${+n},${+r},${this._x1 = +i},${this._y1 = +a}`;
	}
	arcTo(e, t, n, r, i) {
		if (e = +e, t = +t, n = +n, r = +r, i = +i, i < 0) throw Error(`negative radius: ${i}`);
		let a = this._x1, o = this._y1, s = n - e, c = r - t, l = a - e, u = o - t, d = l * l + u * u;
		if (this._x1 === null) this._append`M${this._x1 = e},${this._y1 = t}`;
		else if (d > mn) {
			if (!(Math.abs(u * s - c * l) > mn) || !i) this._append`L${this._x1 = e},${this._y1 = t}`;
			else {
				let f = n - a, p = r - o, m = s * s + c * c, h = f * f + p * p, g = Math.sqrt(m), _ = Math.sqrt(d), v = i * Math.tan((fn - Math.acos((m + d - h) / (2 * g * _))) / 2), y = v / _, b = v / g;
				Math.abs(y - 1) > mn && this._append`L${e + y * l},${t + y * u}`, this._append`A${i},${i},0,0,${+(u * f > l * p)},${this._x1 = e + b * s},${this._y1 = t + b * c}`;
			}
		}
	}
	arc(e, t, n, r, i, a) {
		if (e = +e, t = +t, n = +n, a = !!a, n < 0) throw Error(`negative radius: ${n}`);
		let o = n * Math.cos(r), s = n * Math.sin(r), c = e + o, l = t + s, u = 1 ^ a, d = a ? r - i : i - r;
		if (this._x1 === null ? this._append`M${c},${l}` : (Math.abs(this._x1 - c) > mn || Math.abs(this._y1 - l) > mn) && this._append`L${c},${l}`, n) {
			if (d < 0 && (d = d % pn + pn), d > hn) this._append`A${n},${n},0,1,${u},${e - o},${t - s}A${n},${n},0,1,${u},${this._x1 = c},${this._y1 = l}`;
			else if (d > mn) {
				let a = e + n * Math.cos(i), o = t + n * Math.sin(i);
				if (d >= fn && this._equal(c, l, a, o)) {
					d /= 2;
					let i = r + d;
					this._append`A${n},${n},0,${+(d >= fn)},${u},${e + n * Math.cos(i)},${t + n * Math.sin(i)}`;
				}
				this._append`A${n},${n},0,${+(d >= fn)},${u},${this._x1 = a},${this._y1 = o}`;
			}
		}
	}
	rect(e, t, n, r) {
		this._append`M${this._x0 = this._x1 = +e},${this._y0 = this._y1 = +t}h${n = +n}v${+r}h${-n}Z`;
	}
	toString() {
		return this._;
	}
};
bn.prototype;
//#endregion
//#region ../../node_modules/.pnpm/d3-shape@3.2.1/node_modules/d3-shape/dist/d3-shape.mjs
function J(e) {
	return function() {
		return e;
	};
}
var xn = Math.abs, Y = Math.atan2, Sn = Math.cos, Cn = Math.max, wn = Math.min, X = Math.sin, Tn = Math.sqrt, Z = 1e-12, En = Math.PI, Dn = En / 2, On = 2 * En;
function kn(e) {
	return e > 1 ? 0 : e < -1 ? En : Math.acos(e);
}
function An(e) {
	return e >= 1 ? Dn : e <= -1 ? -Dn : Math.asin(e);
}
function jn(e) {
	let t = 3;
	return e.digits = function(n) {
		if (!arguments.length) return t;
		if (n == null) t = null;
		else {
			let e = Math.floor(n);
			if (!(e >= 0)) throw RangeError(`invalid digits: ${n}`);
			t = e;
		}
		return e;
	}, () => new bn(t);
}
function Mn(e) {
	return e.innerRadius;
}
function Nn(e) {
	return e.outerRadius;
}
function Pn(e) {
	return e.startAngle;
}
function Fn(e) {
	return e.endAngle;
}
function In(e) {
	return e && e.padAngle;
}
function Ln(e, t, n, r, i, a, o, s) {
	var c = n - e, l = r - t, u = o - i, d = s - a, f = d * c - u * l;
	if (!(f * f < Z)) return f = (u * (t - a) - d * (e - i)) / f, [e + f * c, t + f * l];
}
function Rn(e, t, n, r, i, a, o) {
	var s = e - n, c = t - r, l = (o ? a : -a) / Tn(s * s + c * c), u = l * c, d = -l * s, f = e + u, p = t + d, m = n + u, h = r + d, g = (f + m) / 2, _ = (p + h) / 2, v = m - f, y = h - p, b = v * v + y * y, x = i - a, S = f * h - m * p, C = (y < 0 ? -1 : 1) * Tn(Cn(0, x * x * b - S * S)), w = (S * y - v * C) / b, T = (-S * v - y * C) / b, E = (S * y + v * C) / b, D = (-S * v + y * C) / b, O = w - g, k = T - _, A = E - g, j = D - _;
	return O * O + k * k > A * A + j * j && (w = E, T = D), {
		cx: w,
		cy: T,
		x01: -u,
		y01: -d,
		x11: w * (i / x - 1),
		y11: T * (i / x - 1)
	};
}
function zn() {
	var e = Mn, t = Nn, n = J(0), r = null, i = Pn, a = Fn, o = In, s = null, c = jn(l);
	function l() {
		var l, u, d = +e.apply(this, arguments), f = +t.apply(this, arguments), p = i.apply(this, arguments) - Dn, m = a.apply(this, arguments) - Dn, h = xn(m - p), g = m > p;
		if (s ||= l = c(), f < d && (u = f, f = d, d = u), !(f > Z)) s.moveTo(0, 0);
		else if (h > On - Z) s.moveTo(f * Sn(p), f * X(p)), s.arc(0, 0, f, p, m, !g), d > Z && (s.moveTo(d * Sn(m), d * X(m)), s.arc(0, 0, d, m, p, g));
		else {
			var _ = p, v = m, y = p, b = m, x = h, S = h, C = o.apply(this, arguments) / 2, w = C > Z && (r ? +r.apply(this, arguments) : Tn(d * d + f * f)), T = wn(xn(f - d) / 2, +n.apply(this, arguments)), E = T, D = T, O, k;
			if (w > Z) {
				var A = An(w / d * X(C)), j = An(w / f * X(C));
				(x -= A * 2) > Z ? (A *= g ? 1 : -1, y += A, b -= A) : (x = 0, y = b = (p + m) / 2), (S -= j * 2) > Z ? (j *= g ? 1 : -1, _ += j, v -= j) : (S = 0, _ = v = (p + m) / 2);
			}
			var M = f * Sn(_), N = f * X(_), P = d * Sn(b), F = d * X(b);
			if (T > Z) {
				var I = f * Sn(v), L = f * X(v), R = d * Sn(y), z = d * X(y), B;
				if (h < En) {
					if (B = Ln(M, N, R, z, I, L, P, F)) {
						var V = M - B[0], H = N - B[1], U = I - B[0], ee = L - B[1], te = 1 / X(kn((V * U + H * ee) / (Tn(V * V + H * H) * Tn(U * U + ee * ee))) / 2), W = Tn(B[0] * B[0] + B[1] * B[1]);
						E = wn(T, (d - W) / (te - 1)), D = wn(T, (f - W) / (te + 1));
					} else E = D = 0;
				}
			}
			S > Z ? D > Z ? (O = Rn(R, z, M, N, f, D, g), k = Rn(I, L, P, F, f, D, g), s.moveTo(O.cx + O.x01, O.cy + O.y01), D < T ? s.arc(O.cx, O.cy, D, Y(O.y01, O.x01), Y(k.y01, k.x01), !g) : (s.arc(O.cx, O.cy, D, Y(O.y01, O.x01), Y(O.y11, O.x11), !g), s.arc(0, 0, f, Y(O.cy + O.y11, O.cx + O.x11), Y(k.cy + k.y11, k.cx + k.x11), !g), s.arc(k.cx, k.cy, D, Y(k.y11, k.x11), Y(k.y01, k.x01), !g))) : (s.moveTo(M, N), s.arc(0, 0, f, _, v, !g)) : s.moveTo(M, N), !(d > Z) || !(x > Z) ? s.lineTo(P, F) : E > Z ? (O = Rn(P, F, I, L, d, -E, g), k = Rn(M, N, R, z, d, -E, g), s.lineTo(O.cx + O.x01, O.cy + O.y01), E < T ? s.arc(O.cx, O.cy, E, Y(O.y01, O.x01), Y(k.y01, k.x01), !g) : (s.arc(O.cx, O.cy, E, Y(O.y01, O.x01), Y(O.y11, O.x11), !g), s.arc(0, 0, d, Y(O.cy + O.y11, O.cx + O.x11), Y(k.cy + k.y11, k.cx + k.x11), g), s.arc(k.cx, k.cy, E, Y(k.y11, k.x11), Y(k.y01, k.x01), !g))) : s.arc(0, 0, d, b, y, g);
		}
		if (s.closePath(), l) return s = null, l + "" || null;
	}
	return l.centroid = function() {
		var n = (+e.apply(this, arguments) + +t.apply(this, arguments)) / 2, r = (+i.apply(this, arguments) + +a.apply(this, arguments)) / 2 - En / 2;
		return [Sn(r) * n, X(r) * n];
	}, l.innerRadius = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : J(+t), l) : e;
	}, l.outerRadius = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : J(+e), l) : t;
	}, l.cornerRadius = function(e) {
		return arguments.length ? (n = typeof e == "function" ? e : J(+e), l) : n;
	}, l.padRadius = function(e) {
		return arguments.length ? (r = e == null ? null : typeof e == "function" ? e : J(+e), l) : r;
	}, l.startAngle = function(e) {
		return arguments.length ? (i = typeof e == "function" ? e : J(+e), l) : i;
	}, l.endAngle = function(e) {
		return arguments.length ? (a = typeof e == "function" ? e : J(+e), l) : a;
	}, l.padAngle = function(e) {
		return arguments.length ? (o = typeof e == "function" ? e : J(+e), l) : o;
	}, l.context = function(e) {
		return arguments.length ? (s = e ?? null, l) : s;
	}, l;
}
Array.prototype.slice;
function Bn(e) {
	return typeof e == "object" && "length" in e ? e : Array.from(e);
}
function Vn(e) {
	this._context = e;
}
Vn.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1: this._point = 2;
			default: this._context.lineTo(e, t);
		}
	}
};
function Hn(e) {
	return new Vn(e);
}
function Un(e) {
	return e[0];
}
function Wn(e) {
	return e[1];
}
function Gn(e, t) {
	var n = J(!0), r = null, i = Hn, a = null, o = jn(s);
	e = typeof e == "function" ? e : e === void 0 ? Un : J(e), t = typeof t == "function" ? t : t === void 0 ? Wn : J(t);
	function s(s) {
		var c, l = (s = Bn(s)).length, u, d = !1, f;
		for (r ?? (a = i(f = o())), c = 0; c <= l; ++c) !(c < l && n(u = s[c], c, s)) === d && ((d = !d) ? a.lineStart() : a.lineEnd()), d && a.point(+e(u, c, s), +t(u, c, s));
		if (f) return a = null, f + "" || null;
	}
	return s.x = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : J(+t), s) : e;
	}, s.y = function(e) {
		return arguments.length ? (t = typeof e == "function" ? e : J(+e), s) : t;
	}, s.defined = function(e) {
		return arguments.length ? (n = typeof e == "function" ? e : J(!!e), s) : n;
	}, s.curve = function(e) {
		return arguments.length ? (i = e, r != null && (a = i(r)), s) : i;
	}, s.context = function(e) {
		return arguments.length ? (e == null ? r = a = null : a = i(r = e), s) : r;
	}, s;
}
function Kn(e, t) {
	return t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function qn(e) {
	return e;
}
function Jn() {
	var e = qn, t = Kn, n = null, r = J(0), i = J(On), a = J(0);
	function o(o) {
		var s, c = (o = Bn(o)).length, l, u, d = 0, f = Array(c), p = Array(c), m = +r.apply(this, arguments), h = Math.min(On, Math.max(-On, i.apply(this, arguments) - m)), g, _ = Math.min(Math.abs(h) / c, a.apply(this, arguments)), v = _ * (h < 0 ? -1 : 1), y;
		for (s = 0; s < c; ++s) (y = p[f[s] = s] = +e(o[s], s, o)) > 0 && (d += y);
		for (t == null ? n != null && f.sort(function(e, t) {
			return n(o[e], o[t]);
		}) : f.sort(function(e, n) {
			return t(p[e], p[n]);
		}), s = 0, u = d ? (h - c * v) / d : 0; s < c; ++s, m = g) l = f[s], y = p[l], g = m + (y > 0 ? y * u : 0) + v, p[l] = {
			data: o[l],
			index: s,
			value: y,
			startAngle: m,
			endAngle: g,
			padAngle: _
		};
		return p;
	}
	return o.value = function(t) {
		return arguments.length ? (e = typeof t == "function" ? t : J(+t), o) : e;
	}, o.sortValues = function(e) {
		return arguments.length ? (t = e, n = null, o) : t;
	}, o.sort = function(e) {
		return arguments.length ? (n = e, t = null, o) : n;
	}, o.startAngle = function(e) {
		return arguments.length ? (r = typeof e == "function" ? e : J(+e), o) : r;
	}, o.endAngle = function(e) {
		return arguments.length ? (i = typeof e == "function" ? e : J(+e), o) : i;
	}, o.padAngle = function(e) {
		return arguments.length ? (a = typeof e == "function" ? e : J(+e), o) : a;
	}, o;
}
Xn(Hn);
function Yn(e) {
	this._curve = e;
}
Yn.prototype = {
	areaStart: function() {
		this._curve.areaStart();
	},
	areaEnd: function() {
		this._curve.areaEnd();
	},
	lineStart: function() {
		this._curve.lineStart();
	},
	lineEnd: function() {
		this._curve.lineEnd();
	},
	point: function(e, t) {
		this._curve.point(t * Math.sin(e), t * -Math.cos(e));
	}
};
function Xn(e) {
	function t(t) {
		return new Yn(e(t));
	}
	return t._curve = e, t;
}
Tn(3), Tn(1 / 3) * 2;
var Zn = X(En / 10) / X(7 * En / 10);
X(On / 10) * Zn, -Sn(On / 10) * Zn, Tn(3), Tn(3), Tn(3) / 2, (1 / Tn(12) / 2 + 1) * 3;
function Qn() {}
function $n(e, t, n) {
	e._context.bezierCurveTo((2 * e._x0 + e._x1) / 3, (2 * e._y0 + e._y1) / 3, (e._x0 + 2 * e._x1) / 3, (e._y0 + 2 * e._y1) / 3, (e._x0 + 4 * e._x1 + t) / 6, (e._y0 + 4 * e._y1 + n) / 6);
}
function er(e) {
	this._context = e;
}
er.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 3: $n(this, this._x1, this._y1);
			case 2: this._context.lineTo(this._x1, this._y1);
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1:
				this._point = 2;
				break;
			case 2: this._point = 3, this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
			default: $n(this, e, t);
		}
		this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t;
	}
};
function tr(e, t) {
	this._basis = new er(e), this._beta = t;
}
tr.prototype = {
	lineStart: function() {
		this._x = [], this._y = [], this._basis.lineStart();
	},
	lineEnd: function() {
		var e = this._x, t = this._y, n = e.length - 1;
		if (n > 0) for (var r = e[0], i = t[0], a = e[n] - r, o = t[n] - i, s = -1, c; ++s <= n;) c = s / n, this._basis.point(this._beta * e[s] + (1 - this._beta) * (r + c * a), this._beta * t[s] + (1 - this._beta) * (i + c * o));
		this._x = this._y = null, this._basis.lineEnd();
	},
	point: function(e, t) {
		this._x.push(+e), this._y.push(+t);
	}
}, (function e(t) {
	function n(e) {
		return t === 1 ? new er(e) : new tr(e, t);
	}
	return n.beta = function(t) {
		return e(+t);
	}, n;
})(.85);
function nr(e, t, n) {
	e._context.bezierCurveTo(e._x1 + e._k * (e._x2 - e._x0), e._y1 + e._k * (e._y2 - e._y0), e._x2 + e._k * (e._x1 - t), e._y2 + e._k * (e._y1 - n), e._x2, e._y2);
}
function rr(e, t) {
	this._context = e, this._k = (1 - t) / 6;
}
rr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x2, this._y2);
				break;
			case 3: nr(this, this._x1, this._y1);
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1:
				this._point = 2, this._x1 = e, this._y1 = t;
				break;
			case 2: this._point = 3;
			default: nr(this, e, t);
		}
		this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
	}
}, (function e(t) {
	function n(e) {
		return new rr(e, t);
	}
	return n.tension = function(t) {
		return e(+t);
	}, n;
})(0);
function ir(e, t) {
	this._context = e, this._k = (1 - t) / 6;
}
ir.prototype = {
	areaStart: Qn,
	areaEnd: Qn,
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 1:
				this._context.moveTo(this._x3, this._y3), this._context.closePath();
				break;
			case 2:
				this._context.lineTo(this._x3, this._y3), this._context.closePath();
				break;
			case 3: this.point(this._x3, this._y3), this.point(this._x4, this._y4), this.point(this._x5, this._y5);
		}
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1, this._x3 = e, this._y3 = t;
				break;
			case 1:
				this._point = 2, this._context.moveTo(this._x4 = e, this._y4 = t);
				break;
			case 2:
				this._point = 3, this._x5 = e, this._y5 = t;
				break;
			default: nr(this, e, t);
		}
		this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
	}
}, (function e(t) {
	function n(e) {
		return new ir(e, t);
	}
	return n.tension = function(t) {
		return e(+t);
	}, n;
})(0);
function ar(e, t) {
	this._context = e, this._k = (1 - t) / 6;
}
ar.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		switch (e = +e, t = +t, this._point) {
			case 0:
				this._point = 1;
				break;
			case 1:
				this._point = 2;
				break;
			case 2:
				this._point = 3, this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
				break;
			case 3: this._point = 4;
			default: nr(this, e, t);
		}
		this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
	}
}, (function e(t) {
	function n(e) {
		return new ar(e, t);
	}
	return n.tension = function(t) {
		return e(+t);
	}, n;
})(0);
function or(e, t, n) {
	var r = e._x1, i = e._y1, a = e._x2, o = e._y2;
	if (e._l01_a > Z) {
		var s = 2 * e._l01_2a + 3 * e._l01_a * e._l12_a + e._l12_2a, c = 3 * e._l01_a * (e._l01_a + e._l12_a);
		r = (r * s - e._x0 * e._l12_2a + e._x2 * e._l01_2a) / c, i = (i * s - e._y0 * e._l12_2a + e._y2 * e._l01_2a) / c;
	}
	if (e._l23_a > Z) {
		var l = 2 * e._l23_2a + 3 * e._l23_a * e._l12_a + e._l12_2a, u = 3 * e._l23_a * (e._l23_a + e._l12_a);
		a = (a * l + e._x1 * e._l23_2a - t * e._l12_2a) / u, o = (o * l + e._y1 * e._l23_2a - n * e._l12_2a) / u;
	}
	e._context.bezierCurveTo(r, i, a, o, e._x2, e._y2);
}
function sr(e, t) {
	this._context = e, this._alpha = t;
}
sr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x2, this._y2);
				break;
			case 3: this.point(this._x2, this._y2);
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		if (e = +e, t = +t, this._point) {
			var n = this._x2 - e, r = this._y2 - t;
			this._l23_a = Math.sqrt(this._l23_2a = (n * n + r * r) ** +this._alpha);
		}
		switch (this._point) {
			case 0:
				this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
				break;
			case 1:
				this._point = 2;
				break;
			case 2: this._point = 3;
			default: or(this, e, t);
		}
		this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
	}
}, (function e(t) {
	function n(e) {
		return t ? new sr(e, t) : new rr(e, 0);
	}
	return n.alpha = function(t) {
		return e(+t);
	}, n;
})(.5);
function cr(e, t) {
	this._context = e, this._alpha = t;
}
cr.prototype = {
	areaStart: Qn,
	areaEnd: Qn,
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 1:
				this._context.moveTo(this._x3, this._y3), this._context.closePath();
				break;
			case 2:
				this._context.lineTo(this._x3, this._y3), this._context.closePath();
				break;
			case 3: this.point(this._x3, this._y3), this.point(this._x4, this._y4), this.point(this._x5, this._y5);
		}
	},
	point: function(e, t) {
		if (e = +e, t = +t, this._point) {
			var n = this._x2 - e, r = this._y2 - t;
			this._l23_a = Math.sqrt(this._l23_2a = (n * n + r * r) ** +this._alpha);
		}
		switch (this._point) {
			case 0:
				this._point = 1, this._x3 = e, this._y3 = t;
				break;
			case 1:
				this._point = 2, this._context.moveTo(this._x4 = e, this._y4 = t);
				break;
			case 2:
				this._point = 3, this._x5 = e, this._y5 = t;
				break;
			default: or(this, e, t);
		}
		this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
	}
}, (function e(t) {
	function n(e) {
		return t ? new cr(e, t) : new ir(e, 0);
	}
	return n.alpha = function(t) {
		return e(+t);
	}, n;
})(.5);
function lr(e, t) {
	this._context = e, this._alpha = t;
}
lr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN, this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
	},
	lineEnd: function() {
		(this._line || this._line !== 0 && this._point === 3) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		if (e = +e, t = +t, this._point) {
			var n = this._x2 - e, r = this._y2 - t;
			this._l23_a = Math.sqrt(this._l23_2a = (n * n + r * r) ** +this._alpha);
		}
		switch (this._point) {
			case 0:
				this._point = 1;
				break;
			case 1:
				this._point = 2;
				break;
			case 2:
				this._point = 3, this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
				break;
			case 3: this._point = 4;
			default: or(this, e, t);
		}
		this._l01_a = this._l12_a, this._l12_a = this._l23_a, this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a, this._x0 = this._x1, this._x1 = this._x2, this._x2 = e, this._y0 = this._y1, this._y1 = this._y2, this._y2 = t;
	}
}, (function e(t) {
	function n(e) {
		return t ? new lr(e, t) : new ar(e, 0);
	}
	return n.alpha = function(t) {
		return e(+t);
	}, n;
})(.5);
function ur(e) {
	return e < 0 ? -1 : 1;
}
function dr(e, t, n) {
	var r = e._x1 - e._x0, i = t - e._x1, a = (e._y1 - e._y0) / (r || i < 0 && -0), o = (n - e._y1) / (i || r < 0 && -0), s = (a * i + o * r) / (r + i);
	return (ur(a) + ur(o)) * Math.min(Math.abs(a), Math.abs(o), .5 * Math.abs(s)) || 0;
}
function fr(e, t) {
	var n = e._x1 - e._x0;
	return n ? (3 * (e._y1 - e._y0) / n - t) / 2 : t;
}
function pr(e, t, n) {
	var r = e._x0, i = e._y0, a = e._x1, o = e._y1, s = (a - r) / 3;
	e._context.bezierCurveTo(r + s, i + s * t, a - s, o - s * n, a, o);
}
function mr(e) {
	this._context = e;
}
mr.prototype = {
	areaStart: function() {
		this._line = 0;
	},
	areaEnd: function() {
		this._line = NaN;
	},
	lineStart: function() {
		this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN, this._point = 0;
	},
	lineEnd: function() {
		switch (this._point) {
			case 2:
				this._context.lineTo(this._x1, this._y1);
				break;
			case 3: pr(this, this._t0, fr(this, this._t0));
		}
		(this._line || this._line !== 0 && this._point === 1) && this._context.closePath(), this._line = 1 - this._line;
	},
	point: function(e, t) {
		var n = NaN;
		if (e = +e, t = +t, e !== this._x1 || t !== this._y1) {
			switch (this._point) {
				case 0:
					this._point = 1, this._line ? this._context.lineTo(e, t) : this._context.moveTo(e, t);
					break;
				case 1:
					this._point = 2;
					break;
				case 2:
					this._point = 3, pr(this, fr(this, n = dr(this, e, t)), n);
					break;
				default: pr(this, this._t0, n = dr(this, e, t));
			}
			this._x0 = this._x1, this._x1 = e, this._y0 = this._y1, this._y1 = t, this._t0 = n;
		}
	}
}, Object.create(mr.prototype).point = function(e, t) {
	mr.prototype.point.call(this, t, e);
};
function hr(e) {
	return new mr(e);
}
//#endregion
//#region ../../node_modules/.pnpm/d3-array@3.2.5/node_modules/d3-array/dist/d3-array.mjs
function gr(e, t) {
	return e == null || t == null ? NaN : e < t ? -1 : e > t ? 1 : e >= t ? 0 : NaN;
}
function _r(e, t) {
	return e == null || t == null ? NaN : t < e ? -1 : t > e ? 1 : t >= e ? 0 : NaN;
}
function vr(e) {
	let t, n, r;
	e.length === 2 ? (t = e === gr || e === _r ? e : yr, n = e, r = e) : (t = gr, n = (t, n) => gr(e(t), n), r = (t, n) => e(t) - n);
	function i(e, r, i = 0, a = e.length) {
		if (i < a) {
			if (t(r, r) !== 0) return a;
			do {
				let t = i + a >>> 1;
				n(e[t], r) < 0 ? i = t + 1 : a = t;
			} while (i < a);
		}
		return i;
	}
	function a(e, r, i = 0, a = e.length) {
		if (i < a) {
			if (t(r, r) !== 0) return a;
			do {
				let t = i + a >>> 1;
				n(e[t], r) <= 0 ? i = t + 1 : a = t;
			} while (i < a);
		}
		return i;
	}
	function o(e, t, n = 0, a = e.length) {
		let o = i(e, t, n, a - 1);
		return o > n && r(e[o - 1], t) > -r(e[o], t) ? o - 1 : o;
	}
	return {
		left: i,
		center: o,
		right: a
	};
}
function yr() {
	return 0;
}
function br(e) {
	return e === null ? NaN : +e;
}
var xr = vr(gr), Sr = xr.right;
xr.left, vr(br).center;
var Cr = class extends Map {
	constructor(e, t = Dr) {
		if (super(), Object.defineProperties(this, {
			_intern: { value: /* @__PURE__ */ new Map() },
			_key: { value: t }
		}), e != null) for (let [t, n] of e) this.set(t, n);
	}
	get(e) {
		return super.get(wr(this, e));
	}
	has(e) {
		return super.has(wr(this, e));
	}
	set(e, t) {
		return super.set(Tr(this, e), t);
	}
	delete(e) {
		return super.delete(Er(this, e));
	}
};
function wr({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : n;
}
function Tr({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) ? e.get(r) : (e.set(r, n), n);
}
function Er({ _intern: e, _key: t }, n) {
	let r = t(n);
	return e.has(r) && (n = e.get(r), e.delete(r)), n;
}
function Dr(e) {
	return typeof e == "object" && e ? e.valueOf() : e;
}
Array.prototype.slice;
var Or = Math.sqrt(50), kr = Math.sqrt(10), Ar = Math.sqrt(2);
function jr(e, t, n) {
	let r = (t - e) / Math.max(0, n), i = Math.floor(Math.log10(r)), a = r / 10 ** i, o = a >= Or ? 10 : a >= kr ? 5 : a >= Ar ? 2 : 1, s, c, l;
	return i < 0 ? (l = 10 ** -i / o, s = Math.round(e * l), c = Math.round(t * l), s / l < e && ++s, c / l > t && --c, l = -l) : (l = 10 ** i * o, s = Math.round(e / l), c = Math.round(t / l), s * l < e && ++s, c * l > t && --c), c < s && .5 <= n && n < 2 ? jr(e, t, n * 2) : [
		s,
		c,
		l
	];
}
function Mr(e, t, n) {
	if (t = +t, e = +e, n = +n, !(n > 0)) return [];
	if (e === t) return [e];
	let r = t < e, [i, a, o] = r ? jr(t, e, n) : jr(e, t, n);
	if (!(a >= i)) return [];
	let s = a - i + 1, c = Array(s);
	if (r) {
		if (o < 0) for (let e = 0; e < s; ++e) c[e] = (a - e) / -o;
		else for (let e = 0; e < s; ++e) c[e] = (a - e) * o;
	} else if (o < 0) for (let e = 0; e < s; ++e) c[e] = (i + e) / -o;
	else for (let e = 0; e < s; ++e) c[e] = (i + e) * o;
	return c;
}
function Nr(e, t, n) {
	return t = +t, e = +e, n = +n, jr(e, t, n)[2];
}
function Pr(e, t, n) {
	t = +t, e = +e, n = +n;
	let r = t < e, i = r ? Nr(t, e, n) : Nr(e, t, n);
	return (r ? -1 : 1) * (i < 0 ? 1 / -i : i);
}
function Fr(e, t, n) {
	e = +e, t = +t, n = (i = arguments.length) < 2 ? (t = e, e = 0, 1) : i < 3 ? 1 : +n;
	for (var r = -1, i = Math.max(0, Math.ceil((t - e) / n)) | 0, a = Array(i); ++r < i;) a[r] = e + r * n;
	return a;
}
//#endregion
//#region ../../node_modules/.pnpm/d3-color@3.1.1/node_modules/d3-color/dist/d3-color.mjs
function Ir(e, t, n) {
	e.prototype = t.prototype = n, n.constructor = e;
}
function Lr(e, t) {
	var n = Object.create(e.prototype);
	for (var r in t) n[r] = t[r];
	return n;
}
function Rr() {}
var zr = .7, Br = 1 / zr, Vr = "\\s*([+-]?\\d+)\\s*", Hr = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", Ur = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", Wr = /^#([0-9a-f]{3,8})$/, Gr = RegExp(`^rgb\\(${Vr},${Vr},${Vr}\\)$`), Kr = RegExp(`^rgb\\(${Ur},${Ur},${Ur}\\)$`), qr = RegExp(`^rgba\\(${Vr},${Vr},${Vr},${Hr}\\)$`), Jr = RegExp(`^rgba\\(${Ur},${Ur},${Ur},${Hr}\\)$`), Yr = RegExp(`^hsl\\(${Hr},${Ur},${Ur}\\)$`), Xr = RegExp(`^hsla\\(${Hr},${Ur},${Ur},${Hr}\\)$`), Zr = {
	aliceblue: 15792383,
	antiquewhite: 16444375,
	aqua: 65535,
	aquamarine: 8388564,
	azure: 15794175,
	beige: 16119260,
	bisque: 16770244,
	black: 0,
	blanchedalmond: 16772045,
	blue: 255,
	blueviolet: 9055202,
	brown: 10824234,
	burlywood: 14596231,
	cadetblue: 6266528,
	chartreuse: 8388352,
	chocolate: 13789470,
	coral: 16744272,
	cornflowerblue: 6591981,
	cornsilk: 16775388,
	crimson: 14423100,
	cyan: 65535,
	darkblue: 139,
	darkcyan: 35723,
	darkgoldenrod: 12092939,
	darkgray: 11119017,
	darkgreen: 25600,
	darkgrey: 11119017,
	darkkhaki: 12433259,
	darkmagenta: 9109643,
	darkolivegreen: 5597999,
	darkorange: 16747520,
	darkorchid: 10040012,
	darkred: 9109504,
	darksalmon: 15308410,
	darkseagreen: 9419919,
	darkslateblue: 4734347,
	darkslategray: 3100495,
	darkslategrey: 3100495,
	darkturquoise: 52945,
	darkviolet: 9699539,
	deeppink: 16716947,
	deepskyblue: 49151,
	dimgray: 6908265,
	dimgrey: 6908265,
	dodgerblue: 2003199,
	firebrick: 11674146,
	floralwhite: 16775920,
	forestgreen: 2263842,
	fuchsia: 16711935,
	gainsboro: 14474460,
	ghostwhite: 16316671,
	gold: 16766720,
	goldenrod: 14329120,
	gray: 8421504,
	green: 32768,
	greenyellow: 11403055,
	grey: 8421504,
	honeydew: 15794160,
	hotpink: 16738740,
	indianred: 13458524,
	indigo: 4915330,
	ivory: 16777200,
	khaki: 15787660,
	lavender: 15132410,
	lavenderblush: 16773365,
	lawngreen: 8190976,
	lemonchiffon: 16775885,
	lightblue: 11393254,
	lightcoral: 15761536,
	lightcyan: 14745599,
	lightgoldenrodyellow: 16448210,
	lightgray: 13882323,
	lightgreen: 9498256,
	lightgrey: 13882323,
	lightpink: 16758465,
	lightsalmon: 16752762,
	lightseagreen: 2142890,
	lightskyblue: 8900346,
	lightslategray: 7833753,
	lightslategrey: 7833753,
	lightsteelblue: 11584734,
	lightyellow: 16777184,
	lime: 65280,
	limegreen: 3329330,
	linen: 16445670,
	magenta: 16711935,
	maroon: 8388608,
	mediumaquamarine: 6737322,
	mediumblue: 205,
	mediumorchid: 12211667,
	mediumpurple: 9662683,
	mediumseagreen: 3978097,
	mediumslateblue: 8087790,
	mediumspringgreen: 64154,
	mediumturquoise: 4772300,
	mediumvioletred: 13047173,
	midnightblue: 1644912,
	mintcream: 16121850,
	mistyrose: 16770273,
	moccasin: 16770229,
	navajowhite: 16768685,
	navy: 128,
	oldlace: 16643558,
	olive: 8421376,
	olivedrab: 7048739,
	orange: 16753920,
	orangered: 16729344,
	orchid: 14315734,
	palegoldenrod: 15657130,
	palegreen: 10025880,
	paleturquoise: 11529966,
	palevioletred: 14381203,
	papayawhip: 16773077,
	peachpuff: 16767673,
	peru: 13468991,
	pink: 16761035,
	plum: 14524637,
	powderblue: 11591910,
	purple: 8388736,
	rebeccapurple: 6697881,
	red: 16711680,
	rosybrown: 12357519,
	royalblue: 4286945,
	saddlebrown: 9127187,
	salmon: 16416882,
	sandybrown: 16032864,
	seagreen: 3050327,
	seashell: 16774638,
	sienna: 10506797,
	silver: 12632256,
	skyblue: 8900331,
	slateblue: 6970061,
	slategray: 7372944,
	slategrey: 7372944,
	snow: 16775930,
	springgreen: 65407,
	steelblue: 4620980,
	tan: 13808780,
	teal: 32896,
	thistle: 14204888,
	tomato: 16737095,
	turquoise: 4251856,
	violet: 15631086,
	wheat: 16113331,
	white: 16777215,
	whitesmoke: 16119285,
	yellow: 16776960,
	yellowgreen: 10145074
};
Ir(Rr, ni, {
	copy(e) {
		return Object.assign(new this.constructor(), this, e);
	},
	displayable() {
		return this.rgb().displayable();
	},
	hex: Qr,
	formatHex: Qr,
	formatHex8: $r,
	formatHsl: ei,
	formatRgb: ti,
	toString: ti
});
function Qr() {
	return this.rgb().formatHex();
}
function $r() {
	return this.rgb().formatHex8();
}
function ei() {
	return mi(this).formatHsl();
}
function ti() {
	return this.rgb().formatRgb();
}
function ni(e) {
	var t, n;
	return e = (e + "").trim().toLowerCase(), (t = Wr.exec(e)) ? (n = t[1].length, t = parseInt(t[1], 16), n === 6 ? ri(t) : n === 3 ? new Q(t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, (t & 15) << 4 | t & 15, 1) : n === 8 ? ii(t >> 24 & 255, t >> 16 & 255, t >> 8 & 255, (t & 255) / 255) : n === 4 ? ii(t >> 12 & 15 | t >> 8 & 240, t >> 8 & 15 | t >> 4 & 240, t >> 4 & 15 | t & 240, ((t & 15) << 4 | t & 15) / 255) : null) : (t = Gr.exec(e)) ? new Q(t[1], t[2], t[3], 1) : (t = Kr.exec(e)) ? new Q(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, 1) : (t = qr.exec(e)) ? ii(t[1], t[2], t[3], t[4]) : (t = Jr.exec(e)) ? ii(t[1] * 255 / 100, t[2] * 255 / 100, t[3] * 255 / 100, t[4]) : (t = Yr.exec(e)) ? pi(t[1], t[2] / 100, t[3] / 100, 1) : (t = Xr.exec(e)) ? pi(t[1], t[2] / 100, t[3] / 100, t[4]) : Zr.hasOwnProperty(e) ? ri(Zr[e]) : e === "transparent" ? new Q(NaN, NaN, NaN, 0) : null;
}
function ri(e) {
	return new Q(e >> 16 & 255, e >> 8 & 255, e & 255, 1);
}
function ii(e, t, n, r) {
	return r <= 0 && (e = t = n = NaN), new Q(e, t, n, r);
}
function ai(e) {
	return e instanceof Rr || (e = ni(e)), e ? (e = e.rgb(), new Q(e.r, e.g, e.b, e.opacity)) : new Q();
}
function oi(e, t, n, r) {
	return arguments.length === 1 ? ai(e) : new Q(e, t, n, r ?? 1);
}
function Q(e, t, n, r) {
	this.r = +e, this.g = +t, this.b = +n, this.opacity = +r;
}
Ir(Q, oi, Lr(Rr, {
	brighter(e) {
		return e = e == null ? Br : Br ** +e, new Q(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? zr : zr ** +e, new Q(this.r * e, this.g * e, this.b * e, this.opacity);
	},
	rgb() {
		return this;
	},
	clamp() {
		return new Q(di(this.r), di(this.g), di(this.b), ui(this.opacity));
	},
	displayable() {
		return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
	},
	hex: si,
	formatHex: si,
	formatHex8: ci,
	formatRgb: li,
	toString: li
}));
function si() {
	return `#${fi(this.r)}${fi(this.g)}${fi(this.b)}`;
}
function ci() {
	return `#${fi(this.r)}${fi(this.g)}${fi(this.b)}${fi((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function li() {
	let e = ui(this.opacity);
	return `${e === 1 ? "rgb(" : "rgba("}${di(this.r)}, ${di(this.g)}, ${di(this.b)}${e === 1 ? ")" : `, ${e})`}`;
}
function ui(e) {
	return isNaN(e) ? 1 : Math.max(0, Math.min(1, e));
}
function di(e) {
	return Math.max(0, Math.min(255, Math.round(e) || 0));
}
function fi(e) {
	return e = di(e), (e < 16 ? "0" : "") + e.toString(16);
}
function pi(e, t, n, r) {
	return r <= 0 ? e = t = n = NaN : n <= 0 || n >= 1 ? e = t = NaN : t <= 0 && (e = NaN), new gi(e, t, n, r);
}
function mi(e) {
	if (e instanceof gi) return new gi(e.h, e.s, e.l, e.opacity);
	if (e instanceof Rr || (e = ni(e)), !e) return new gi();
	if (e instanceof gi) return e;
	e = e.rgb();
	var t = e.r / 255, n = e.g / 255, r = e.b / 255, i = Math.min(t, n, r), a = Math.max(t, n, r), o = NaN, s = a - i, c = (a + i) / 2;
	return s ? (o = t === a ? (n - r) / s + (n < r) * 6 : n === a ? (r - t) / s + 2 : (t - n) / s + 4, s /= c < .5 ? a + i : 2 - a - i, o *= 60) : s = c > 0 && c < 1 ? 0 : o, new gi(o, s, c, e.opacity);
}
function hi(e, t, n, r) {
	return arguments.length === 1 ? mi(e) : new gi(e, t, n, r ?? 1);
}
function gi(e, t, n, r) {
	this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
Ir(gi, hi, Lr(Rr, {
	brighter(e) {
		return e = e == null ? Br : Br ** +e, new gi(this.h, this.s, this.l * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? zr : zr ** +e, new gi(this.h, this.s, this.l * e, this.opacity);
	},
	rgb() {
		var e = this.h % 360 + (this.h < 0) * 360, t = isNaN(e) || isNaN(this.s) ? 0 : this.s, n = this.l, r = n + (n < .5 ? n : 1 - n) * t, i = 2 * n - r;
		return new Q(yi(e >= 240 ? e - 240 : e + 120, i, r), yi(e, i, r), yi(e < 120 ? e + 240 : e - 120, i, r), this.opacity);
	},
	clamp() {
		return new gi(_i(this.h), vi(this.s), vi(this.l), ui(this.opacity));
	},
	displayable() {
		return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
	},
	formatHsl() {
		let e = ui(this.opacity);
		return `${e === 1 ? "hsl(" : "hsla("}${_i(this.h)}, ${vi(this.s) * 100}%, ${vi(this.l) * 100}%${e === 1 ? ")" : `, ${e})`}`;
	}
}));
function _i(e) {
	return e = (e || 0) % 360, e < 0 ? e + 360 : e;
}
function vi(e) {
	return Math.max(0, Math.min(1, e || 0));
}
function yi(e, t, n) {
	return (e < 60 ? t + (n - t) * e / 60 : e < 180 ? n : e < 240 ? t + (n - t) * (240 - e) / 60 : t) * 255;
}
var bi = Math.PI / 180, xi = 180 / Math.PI, Si = 18, Ci = .96422, wi = 1, Ti = .82521, Ei = 4 / 29, Di = 6 / 29, Oi = 3 * Di * Di, ki = Di * Di * Di;
function Ai(e) {
	if (e instanceof Mi) return new Mi(e.l, e.a, e.b, e.opacity);
	if (e instanceof zi) return Bi(e);
	e instanceof Q || (e = ai(e));
	var t = Ii(e.r), n = Ii(e.g), r = Ii(e.b), i = Ni((.2225045 * t + .7168786 * n + .0606169 * r) / wi), a, o;
	return t === n && n === r ? a = o = i : (a = Ni((.4360747 * t + .3850649 * n + .1430804 * r) / Ci), o = Ni((.0139322 * t + .0971045 * n + .7141733 * r) / Ti)), new Mi(116 * i - 16, 500 * (a - i), 200 * (i - o), e.opacity);
}
function ji(e, t, n, r) {
	return arguments.length === 1 ? Ai(e) : new Mi(e, t, n, r ?? 1);
}
function Mi(e, t, n, r) {
	this.l = +e, this.a = +t, this.b = +n, this.opacity = +r;
}
Ir(Mi, ji, Lr(Rr, {
	brighter(e) {
		return new Mi(this.l + Si * (e ?? 1), this.a, this.b, this.opacity);
	},
	darker(e) {
		return new Mi(this.l - Si * (e ?? 1), this.a, this.b, this.opacity);
	},
	rgb() {
		var e = (this.l + 16) / 116, t = isNaN(this.a) ? e : e + this.a / 500, n = isNaN(this.b) ? e : e - this.b / 200;
		return t = Ci * Pi(t), e = wi * Pi(e), n = Ti * Pi(n), new Q(Fi(3.1338561 * t - 1.6168667 * e - .4906146 * n), Fi(-.9787684 * t + 1.9161415 * e + .033454 * n), Fi(.0719453 * t - .2289914 * e + 1.4052427 * n), this.opacity);
	}
}));
function Ni(e) {
	return e > ki ? e ** (1 / 3) : e / Oi + Ei;
}
function Pi(e) {
	return e > Di ? e * e * e : Oi * (e - Ei);
}
function Fi(e) {
	return 255 * (e <= .0031308 ? 12.92 * e : 1.055 * e ** (1 / 2.4) - .055);
}
function Ii(e) {
	return (e /= 255) <= .04045 ? e / 12.92 : ((e + .055) / 1.055) ** 2.4;
}
function Li(e) {
	if (e instanceof zi) return new zi(e.h, e.c, e.l, e.opacity);
	if (e instanceof Mi || (e = Ai(e)), e.a === 0 && e.b === 0) return new zi(NaN, 0 < e.l && e.l < 100 ? 0 : NaN, e.l, e.opacity);
	var t = Math.atan2(e.b, e.a) * xi;
	return new zi(t < 0 ? t + 360 : t, Math.sqrt(e.a * e.a + e.b * e.b), e.l, e.opacity);
}
function Ri(e, t, n, r) {
	return arguments.length === 1 ? Li(e) : new zi(e, t, n, r ?? 1);
}
function zi(e, t, n, r) {
	this.h = +e, this.c = +t, this.l = +n, this.opacity = +r;
}
function Bi(e) {
	if (isNaN(e.h)) return new Mi(e.l, 0, 0, e.opacity);
	var t = e.h * bi;
	return new Mi(e.l, Math.cos(t) * e.c, Math.sin(t) * e.c, e.opacity);
}
Ir(zi, Ri, Lr(Rr, {
	brighter(e) {
		return new zi(this.h, this.c, this.l + Si * (e ?? 1), this.opacity);
	},
	darker(e) {
		return new zi(this.h, this.c, this.l - Si * (e ?? 1), this.opacity);
	},
	rgb() {
		return Bi(this).rgb();
	}
}));
var Vi = -.14861, Hi = 1.78277, Ui = -.29227, Wi = -.90649, Gi = 1.97294, Ki = Gi * Wi, qi = Gi * Hi, Ji = Hi * Ui - Wi * Vi;
function Yi(e) {
	if (e instanceof Zi) return new Zi(e.h, e.s, e.l, e.opacity);
	e instanceof Q || (e = ai(e));
	var t = e.r / 255, n = e.g / 255, r = e.b / 255, i = (Ji * r + Ki * t - qi * n) / (Ji + Ki - qi), a = r - i, o = (Gi * (n - i) - Ui * a) / Wi, s = Math.sqrt(o * o + a * a) / (Gi * i * (1 - i)), c = s ? Math.atan2(o, a) * xi - 120 : NaN;
	return new Zi(c < 0 ? c + 360 : c, s, i, e.opacity);
}
function Xi(e, t, n, r) {
	return arguments.length === 1 ? Yi(e) : new Zi(e, t, n, r ?? 1);
}
function Zi(e, t, n, r) {
	this.h = +e, this.s = +t, this.l = +n, this.opacity = +r;
}
Ir(Zi, Xi, Lr(Rr, {
	brighter(e) {
		return e = e == null ? Br : Br ** +e, new Zi(this.h, this.s, this.l * e, this.opacity);
	},
	darker(e) {
		return e = e == null ? zr : zr ** +e, new Zi(this.h, this.s, this.l * e, this.opacity);
	},
	rgb() {
		var e = isNaN(this.h) ? 0 : (this.h + 120) * bi, t = +this.l, n = isNaN(this.s) ? 0 : this.s * t * (1 - t), r = Math.cos(e), i = Math.sin(e);
		return new Q(255 * (t + n * (Vi * r + Hi * i)), 255 * (t + n * (Ui * r + Wi * i)), 255 * (t + Gi * r * n), this.opacity);
	}
}));
var Qi = (e) => () => e;
function $i(e, t) {
	return function(n) {
		return e + n * t;
	};
}
function ea(e, t, n) {
	return e **= +n, t = t ** +n - e, n = 1 / n, function(r) {
		return (e + r * t) ** +n;
	};
}
function ta(e, t) {
	var n = t - e;
	return n ? $i(e, n > 180 || n < -180 ? n - 360 * Math.round(n / 360) : n) : Qi(isNaN(e) ? t : e);
}
function na(e) {
	return (e = +e) == 1 ? ra : function(t, n) {
		return n - t ? ea(t, n, e) : Qi(isNaN(t) ? n : t);
	};
}
function ra(e, t) {
	var n = t - e;
	return n ? $i(e, n) : Qi(isNaN(e) ? t : e);
}
var ia = (function e(t) {
	var n = na(t);
	function r(e, t) {
		var r = n((e = oi(e)).r, (t = oi(t)).r), i = n(e.g, t.g), a = n(e.b, t.b), o = ra(e.opacity, t.opacity);
		return function(t) {
			return e.r = r(t), e.g = i(t), e.b = a(t), e.opacity = o(t), e + "";
		};
	}
	return r.gamma = e, r;
})(1);
function aa(e, t) {
	t ||= [];
	var n = e ? Math.min(t.length, e.length) : 0, r = t.slice(), i;
	return function(a) {
		for (i = 0; i < n; ++i) r[i] = e[i] * (1 - a) + t[i] * a;
		return r;
	};
}
function oa(e) {
	return ArrayBuffer.isView(e) && !(e instanceof DataView);
}
function sa(e, t) {
	for (var n = t ? t.length : 0, r = e ? Math.min(n, e.length) : 0, i = Array(r), a = Array(n), o = 0; o < r; ++o) i[o] = ga(e[o], t[o]);
	for (; o < n; ++o) a[o] = t[o];
	return function(e) {
		for (o = 0; o < r; ++o) a[o] = i[o](e);
		return a;
	};
}
function ca(e, t) {
	var n = /* @__PURE__ */ new Date();
	return e = +e, t = +t, function(r) {
		return n.setTime(e * (1 - r) + t * r), n;
	};
}
function la(e, t) {
	return e = +e, t = +t, function(n) {
		return e * (1 - n) + t * n;
	};
}
function ua(e, t) {
	var n = {}, r = {}, i;
	for (i in (typeof e != "object" || !e) && (e = {}), (typeof t != "object" || !t) && (t = {}), t) i in e ? n[i] = ga(e[i], t[i]) : r[i] = t[i];
	return function(e) {
		for (i in n) r[i] = n[i](e);
		return r;
	};
}
var da = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, fa = new RegExp(da.source, "g");
function pa(e) {
	return function() {
		return e;
	};
}
function ma(e) {
	return function(t) {
		return e(t) + "";
	};
}
function ha(e, t) {
	var n = da.lastIndex = fa.lastIndex = 0, r, i, a, o = -1, s = [], c = [];
	for (e += "", t += ""; (r = da.exec(e)) && (i = fa.exec(t));) (a = i.index) > n && (a = t.slice(n, a), s[o] ? s[o] += a : s[++o] = a), (r = r[0]) === (i = i[0]) ? s[o] ? s[o] += i : s[++o] = i : (s[++o] = null, c.push({
		i: o,
		x: la(r, i)
	})), n = fa.lastIndex;
	return n < t.length && (a = t.slice(n), s[o] ? s[o] += a : s[++o] = a), s.length < 2 ? c[0] ? ma(c[0].x) : pa(t) : (t = c.length, function(e) {
		for (var n = 0, r; n < t; ++n) s[(r = c[n]).i] = r.x(e);
		return s.join("");
	});
}
function ga(e, t) {
	var n = typeof t, r;
	return t == null || n === "boolean" ? Qi(t) : (n === "number" ? la : n === "string" ? (r = ni(t)) ? (t = r, ia) : ha : t instanceof ni ? ia : t instanceof Date ? ca : oa(t) ? aa : Array.isArray(t) ? sa : typeof t.valueOf != "function" && typeof t.toString != "function" || isNaN(t) ? ua : la)(e, t);
}
function _a(e, t) {
	return e = +e, t = +t, function(n) {
		return Math.round(e * (1 - n) + t * n);
	};
}
var va = 1e-12;
function ya(e) {
	return ((e = Math.exp(e)) + 1 / e) / 2;
}
function ba(e) {
	return ((e = Math.exp(e)) - 1 / e) / 2;
}
function xa(e) {
	return ((e = Math.exp(2 * e)) - 1) / (e + 1);
}
(function e(t, n, r) {
	function i(e, i) {
		var a = e[0], o = e[1], s = e[2], c = i[0], l = i[1], u = i[2], d = c - a, f = l - o, p = d * d + f * f, m, h;
		if (p < va) h = Math.log(u / s) / t, m = function(e) {
			return [
				a + e * d,
				o + e * f,
				s * Math.exp(t * e * h)
			];
		};
		else {
			var g = Math.sqrt(p), _ = (u * u - s * s + r * p) / (2 * s * n * g), v = (u * u - s * s - r * p) / (2 * u * n * g), y = Math.log(Math.sqrt(_ * _ + 1) - _);
			h = (Math.log(Math.sqrt(v * v + 1) - v) - y) / t, m = function(e) {
				var r = e * h, i = ya(y), c = s / (n * g) * (i * xa(t * r + y) - ba(y));
				return [
					a + c * d,
					o + c * f,
					s * i / ya(t * r + y)
				];
			};
		}
		return m.duration = Math.abs(h) * 1e3 * t / Math.SQRT2, m;
	}
	return i.rho = function(t) {
		var n = Math.max(.001, +t), r = n * n;
		return e(n, r, r * r);
	}, i;
})(Math.SQRT2, 2, 4);
function Sa(e) {
	return (function t(n) {
		n = +n;
		function r(t, r) {
			var i = e((t = Xi(t)).h, (r = Xi(r)).h), a = ra(t.s, r.s), o = ra(t.l, r.l), s = ra(t.opacity, r.opacity);
			return function(e) {
				return t.h = i(e), t.s = a(e), t.l = o(e ** +n), t.opacity = s(e), t + "";
			};
		}
		return r.gamma = t, r;
	})(1);
}
Sa(ta), Sa(ra);
//#endregion
//#region ../../node_modules/.pnpm/d3-format@3.1.3/node_modules/d3-format/dist/d3-format.mjs
function Ca(e) {
	return Math.abs(e = Math.round(e)) >= 1e21 ? e.toLocaleString("en").replace(/,/g, "") : e.toString(10);
}
function wa(e, t) {
	if (!isFinite(e) || e === 0) return null;
	var n = (e = t ? e.toExponential(t - 1) : e.toExponential()).indexOf("e"), r = e.slice(0, n);
	return [r.length > 1 ? r[0] + r.slice(2) : r, +e.slice(n + 1)];
}
function Ta(e) {
	return e = wa(Math.abs(e)), e ? e[1] : NaN;
}
function Ea(e, t) {
	return function(n, r) {
		for (var i = n.length, a = [], o = 0, s = e[0], c = 0; i > 0 && s > 0 && (c + s + 1 > r && (s = Math.max(1, r - c)), a.push(n.substring(i -= s, i + s)), !((c += s + 1) > r));) s = e[o = (o + 1) % e.length];
		return a.reverse().join(t);
	};
}
function Da(e) {
	return function(t) {
		return t.replace(/[0-9]/g, function(t) {
			return e[+t];
		});
	};
}
var Oa = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function ka(e) {
	if (!(t = Oa.exec(e))) throw Error("invalid format: " + e);
	var t;
	return new Aa({
		fill: t[1],
		align: t[2],
		sign: t[3],
		symbol: t[4],
		zero: t[5],
		width: t[6],
		comma: t[7],
		precision: t[8] && t[8].slice(1),
		trim: t[9],
		type: t[10]
	});
}
ka.prototype = Aa.prototype;
function Aa(e) {
	this.fill = e.fill === void 0 ? " " : e.fill + "", this.align = e.align === void 0 ? ">" : e.align + "", this.sign = e.sign === void 0 ? "-" : e.sign + "", this.symbol = e.symbol === void 0 ? "" : e.symbol + "", this.zero = !!e.zero, this.width = e.width === void 0 ? void 0 : +e.width, this.comma = !!e.comma, this.precision = e.precision === void 0 ? void 0 : +e.precision, this.trim = !!e.trim, this.type = e.type === void 0 ? "" : e.type + "";
}
Aa.prototype.toString = function() {
	return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
function ja(e) {
	out: for (var t = e.length, n = 1, r = -1, i; n < t; ++n) switch (e[n]) {
		case ".":
			r = i = n;
			break;
		case "0":
			r === 0 && (r = n), i = n;
			break;
		default:
			if (!+e[n]) break out;
			r > 0 && (r = 0);
	}
	return r > 0 ? e.slice(0, r) + e.slice(i + 1) : e;
}
var Ma;
function Na(e, t) {
	var n = wa(e, t);
	if (!n) return Ma = void 0, e.toPrecision(t);
	var r = n[0], i = n[1], a = i - (Ma = Math.max(-8, Math.min(8, Math.floor(i / 3))) * 3) + 1, o = r.length;
	return a === o ? r : a > o ? r + Array(a - o + 1).join("0") : a > 0 ? r.slice(0, a) + "." + r.slice(a) : "0." + Array(1 - a).join("0") + wa(e, Math.max(0, t + a - 1))[0];
}
function Pa(e, t) {
	var n = wa(e, t);
	if (!n) return e + "";
	var r = n[0], i = n[1];
	return i < 0 ? "0." + Array(-i).join("0") + r : r.length > i + 1 ? r.slice(0, i + 1) + "." + r.slice(i + 1) : r + Array(i - r.length + 2).join("0");
}
var Fa = {
	"%": (e, t) => (e * 100).toFixed(t),
	b: (e) => Math.round(e).toString(2),
	c: (e) => e + "",
	d: Ca,
	e: (e, t) => e.toExponential(t),
	f: (e, t) => e.toFixed(t),
	g: (e, t) => e.toPrecision(t),
	o: (e) => Math.round(e).toString(8),
	p: (e, t) => Pa(e * 100, t),
	r: Pa,
	s: Na,
	X: (e) => Math.round(e).toString(16).toUpperCase(),
	x: (e) => Math.round(e).toString(16)
};
function Ia(e) {
	return e;
}
var La = Array.prototype.map, Ra = [
	"y",
	"z",
	"a",
	"f",
	"p",
	"n",
	"µ",
	"m",
	"",
	"k",
	"M",
	"G",
	"T",
	"P",
	"E",
	"Z",
	"Y"
];
function za(e) {
	var t = e.grouping === void 0 || e.thousands === void 0 ? Ia : Ea(La.call(e.grouping, Number), e.thousands + ""), n = e.currency === void 0 ? "" : e.currency[0] + "", r = e.currency === void 0 ? "" : e.currency[1] + "", i = e.decimal === void 0 ? "." : e.decimal + "", a = e.numerals === void 0 ? Ia : Da(La.call(e.numerals, String)), o = e.percent === void 0 ? "%" : e.percent + "", s = e.minus === void 0 ? "−" : e.minus + "", c = e.nan === void 0 ? "NaN" : e.nan + "";
	function l(e, l) {
		e = ka(e);
		var u = e.fill, d = e.align, f = e.sign, p = e.symbol, m = e.zero, h = e.width, g = e.comma, _ = e.precision, v = e.trim, y = e.type;
		y === "n" ? (g = !0, y = "g") : Fa[y] || (_ === void 0 && (_ = 12), v = !0, y = "g"), (m || u === "0" && d === "=") && (m = !0, u = "0", d = "=");
		var b = (l && l.prefix !== void 0 ? l.prefix : "") + (p === "$" ? n : p === "#" && /[boxX]/.test(y) ? "0" + y.toLowerCase() : ""), x = (p === "$" ? r : /[%p]/.test(y) ? o : "") + (l && l.suffix !== void 0 ? l.suffix : ""), S = Fa[y], C = /[defgprs%]/.test(y);
		_ = _ === void 0 ? 6 : /[gprs]/.test(y) ? Math.max(1, Math.min(21, _)) : Math.max(0, Math.min(20, _));
		function w(e) {
			var n = b, r = x, o, l, p;
			if (y === "c") r = S(e) + r, e = "";
			else {
				e = +e;
				var w = e < 0 || 1 / e < 0;
				if (e = isNaN(e) ? c : S(Math.abs(e), _), v && (e = ja(e)), w && +e == 0 && f !== "+" && (w = !1), n = (w ? f === "(" ? f : s : f === "-" || f === "(" ? "" : f) + n, r = (y === "s" && !isNaN(e) && Ma !== void 0 ? Ra[8 + Ma / 3] : "") + r + (w && f === "(" ? ")" : ""), C) {
					for (o = -1, l = e.length; ++o < l;) if (p = e.charCodeAt(o), 48 > p || p > 57) {
						r = (p === 46 ? i + e.slice(o + 1) : e.slice(o)) + r, e = e.slice(0, o);
						break;
					}
				}
			}
			g && !m && (e = t(e, Infinity));
			var T = n.length + e.length + r.length, E = T < h ? Array(h - T + 1).join(u) : "";
			switch (g && m && (e = t(E + e, E.length ? h - r.length : Infinity), E = ""), d) {
				case "<":
					e = n + e + r + E;
					break;
				case "=":
					e = n + E + e + r;
					break;
				case "^":
					e = E.slice(0, T = E.length >> 1) + n + e + r + E.slice(T);
					break;
				default: e = E + n + e + r;
			}
			return a(e);
		}
		return w.toString = function() {
			return e + "";
		}, w;
	}
	function u(e, t) {
		var n = Math.max(-8, Math.min(8, Math.floor(Ta(t) / 3))) * 3, r = 10 ** -n, i = l((e = ka(e), e.type = "f", e), { suffix: Ra[8 + n / 3] });
		return function(e) {
			return i(r * e);
		};
	}
	return {
		format: l,
		formatPrefix: u
	};
}
var Ba, Va, Ha;
Ua({
	thousands: ",",
	grouping: [3],
	currency: ["$", ""]
});
function Ua(e) {
	return Ba = za(e), Va = Ba.format, Ha = Ba.formatPrefix, Ba;
}
function Wa(e) {
	return Math.max(0, -Ta(Math.abs(e)));
}
function Ga(e, t) {
	return Math.max(0, Math.max(-8, Math.min(8, Math.floor(Ta(t) / 3))) * 3 - Ta(Math.abs(e)));
}
function Ka(e, t) {
	return e = Math.abs(e), t = Math.abs(t) - e, Math.max(0, Ta(t) - Ta(e)) + 1;
}
//#endregion
//#region ../../node_modules/.pnpm/d3-scale@4.0.3/node_modules/d3-scale/dist/d3-scale.mjs
function qa(e, t) {
	switch (arguments.length) {
		case 0: break;
		case 1:
			this.range(e);
			break;
		default: this.range(t).domain(e);
	}
	return this;
}
var Ja = Symbol("implicit");
function Ya() {
	var e = new Cr(), t = [], n = [], r = Ja;
	function i(i) {
		let a = e.get(i);
		if (a === void 0) {
			if (r !== Ja) return r;
			e.set(i, a = t.push(i) - 1);
		}
		return n[a % n.length];
	}
	return i.domain = function(n) {
		if (!arguments.length) return t.slice();
		t = [], e = new Cr();
		for (let r of n) e.has(r) || e.set(r, t.push(r) - 1);
		return i;
	}, i.range = function(e) {
		return arguments.length ? (n = Array.from(e), i) : n.slice();
	}, i.unknown = function(e) {
		return arguments.length ? (r = e, i) : r;
	}, i.copy = function() {
		return Ya(t, n).unknown(r);
	}, qa.apply(i, arguments), i;
}
function Xa() {
	var e = Ya().unknown(void 0), t = e.domain, n = e.range, r = 0, i = 1, a, o, s = !1, c = 0, l = 0, u = .5;
	delete e.unknown;
	function d() {
		var e = t().length, d = i < r, f = d ? i : r, p = d ? r : i;
		a = (p - f) / Math.max(1, e - c + l * 2), s && (a = Math.floor(a)), f += (p - f - a * (e - c)) * u, o = a * (1 - c), s && (f = Math.round(f), o = Math.round(o));
		var m = Fr(e).map(function(e) {
			return f + a * e;
		});
		return n(d ? m.reverse() : m);
	}
	return e.domain = function(e) {
		return arguments.length ? (t(e), d()) : t();
	}, e.range = function(e) {
		return arguments.length ? ([r, i] = e, r = +r, i = +i, d()) : [r, i];
	}, e.rangeRound = function(e) {
		return [r, i] = e, r = +r, i = +i, s = !0, d();
	}, e.bandwidth = function() {
		return o;
	}, e.step = function() {
		return a;
	}, e.round = function(e) {
		return arguments.length ? (s = !!e, d()) : s;
	}, e.padding = function(e) {
		return arguments.length ? (c = Math.min(1, l = +e), d()) : c;
	}, e.paddingInner = function(e) {
		return arguments.length ? (c = Math.min(1, e), d()) : c;
	}, e.paddingOuter = function(e) {
		return arguments.length ? (l = +e, d()) : l;
	}, e.align = function(e) {
		return arguments.length ? (u = Math.max(0, Math.min(1, e)), d()) : u;
	}, e.copy = function() {
		return Xa(t(), [r, i]).round(s).paddingInner(c).paddingOuter(l).align(u);
	}, qa.apply(d(), arguments);
}
function Za(e) {
	return function() {
		return e;
	};
}
function Qa(e) {
	return +e;
}
var $a = [0, 1];
function eo(e) {
	return e;
}
function to(e, t) {
	return (t -= e = +e) ? function(n) {
		return (n - e) / t;
	} : Za(isNaN(t) ? NaN : .5);
}
function no(e, t) {
	var n;
	return e > t && (n = e, e = t, t = n), function(n) {
		return Math.max(e, Math.min(t, n));
	};
}
function ro(e, t, n) {
	var r = e[0], i = e[1], a = t[0], o = t[1];
	return i < r ? (r = to(i, r), a = n(o, a)) : (r = to(r, i), a = n(a, o)), function(e) {
		return a(r(e));
	};
}
function io(e, t, n) {
	var r = Math.min(e.length, t.length) - 1, i = Array(r), a = Array(r), o = -1;
	for (e[r] < e[0] && (e = e.slice().reverse(), t = t.slice().reverse()); ++o < r;) i[o] = to(e[o], e[o + 1]), a[o] = n(t[o], t[o + 1]);
	return function(t) {
		var n = Sr(e, t, 1, r) - 1;
		return a[n](i[n](t));
	};
}
function ao(e, t) {
	return t.domain(e.domain()).range(e.range()).interpolate(e.interpolate()).clamp(e.clamp()).unknown(e.unknown());
}
function oo() {
	var e = $a, t = $a, n = ga, r, i, a, o = eo, s, c, l;
	function u() {
		var n = Math.min(e.length, t.length);
		return o !== eo && (o = no(e[0], e[n - 1])), s = n > 2 ? io : ro, c = l = null, d;
	}
	function d(i) {
		return i == null || isNaN(i = +i) ? a : (c ||= s(e.map(r), t, n))(r(o(i)));
	}
	return d.invert = function(n) {
		return o(i((l ||= s(t, e.map(r), la))(n)));
	}, d.domain = function(t) {
		return arguments.length ? (e = Array.from(t, Qa), u()) : e.slice();
	}, d.range = function(e) {
		return arguments.length ? (t = Array.from(e), u()) : t.slice();
	}, d.rangeRound = function(e) {
		return t = Array.from(e), n = _a, u();
	}, d.clamp = function(e) {
		return arguments.length ? (o = e ? !0 : eo, u()) : o !== eo;
	}, d.interpolate = function(e) {
		return arguments.length ? (n = e, u()) : n;
	}, d.unknown = function(e) {
		return arguments.length ? (a = e, d) : a;
	}, function(e, t) {
		return r = e, i = t, u();
	};
}
function so() {
	return oo()(eo, eo);
}
function co(e, t, n, r) {
	var i = Pr(e, t, n), a;
	switch (r = ka(r ?? ",f"), r.type) {
		case "s":
			var o = Math.max(Math.abs(e), Math.abs(t));
			return r.precision == null && !isNaN(a = Ga(i, o)) && (r.precision = a), Ha(r, o);
		case "":
		case "e":
		case "g":
		case "p":
		case "r":
			r.precision == null && !isNaN(a = Ka(i, Math.max(Math.abs(e), Math.abs(t)))) && (r.precision = a - (r.type === "e"));
			break;
		case "f":
		case "%": r.precision == null && !isNaN(a = Wa(i)) && (r.precision = a - (r.type === "%") * 2);
	}
	return Va(r);
}
function lo(e) {
	var t = e.domain;
	return e.ticks = function(e) {
		var n = t();
		return Mr(n[0], n[n.length - 1], e ?? 10);
	}, e.tickFormat = function(e, n) {
		var r = t();
		return co(r[0], r[r.length - 1], e ?? 10, n);
	}, e.nice = function(n) {
		n ??= 10;
		var r = t(), i = 0, a = r.length - 1, o = r[i], s = r[a], c, l, u = 10;
		for (s < o && (l = o, o = s, s = l, l = i, i = a, a = l); u-- > 0;) {
			if (l = Nr(o, s, n), l === c) return r[i] = o, r[a] = s, t(r);
			if (l > 0) o = Math.floor(o / l) * l, s = Math.ceil(s / l) * l;
			else if (l < 0) o = Math.ceil(o * l) / l, s = Math.floor(s * l) / l;
			else break;
			c = l;
		}
		return e;
	}, e;
}
function uo() {
	var e = so();
	return e.copy = function() {
		return ao(e, uo());
	}, qa.apply(e, arguments), lo(e);
}
//#endregion
//#region src/kit/tile/layout.ts
var fo = 6.2, po = 8, mo = 24, ho = 14, go = 11, _o = 14, vo = 120, yo = 3, bo = .35, xo = .4, So = 8, Co = 4, wo = 14, To = .7, Eo = 12, Do = 8, Oo = 20, $ = (e) => e != null && Number.isFinite(e), ko = (e, t, n) => Math.min(n, Math.max(t, e)), Ao = (e) => [...e].length, jo = (e, t, n) => Math.min(n - t, Math.max(t, e)), Mo = (e, t) => e.stacked ? t.size < e.series.length : !t.has(0), No = (e, t) => e.compared && e.series.length > 0 && !t.has(0) && (e.type === "line" || !e.stacked);
function Po(e, t) {
	let n = e.type === "line", r = Infinity, i = -Infinity, a = (e) => {
		$(e) && (e < r && (r = e), e > i && (i = e));
	};
	n || a(0);
	let o = e.series.map((e, t) => t).filter((e) => !t.has(e)), s = No(e, t), c = e.derive?.kind === "running_total" && Mo(e, t);
	for (let t of e.buckets) {
		if (e.stacked && !n) {
			let e = 0, n = 0;
			for (let r of o) {
				let i = t.values[r];
				$(i) && (i >= 0 ? e += i : n += i);
			}
			a(e), a(n);
		} else for (let e of o) a(t.values[e]);
		s && a(t.previous), a(t.target), c && a(t.derived);
	}
	if (!Number.isFinite(r)) return [0, 1];
	let [l, u] = uo().domain([r, i]).nice().domain();
	return l === 0 && u === 0 ? [0, 1] : [l, u];
}
function Fo(e, t) {
	let n = Math.max(1, Math.floor(t / fo + 1e-9)), r = [...e];
	return r.length <= n ? e : `${r.slice(0, n - 1).join("")}…`;
}
function Io(e, t) {
	let n = e - 1, r = [];
	for (let e = 0; e <= n; e += t) r.push(e);
	return r[r.length - 1] !== n && (r.length > 1 && n - r[r.length - 1] < t && r.pop(), r.push(n)), r;
}
function Lo(e, t, n = null, r = null) {
	let [i, a] = Po(e, t), o = uo().domain([i, a]), s = r === null ? Infinity : Math.max(2, Math.floor(r / Oo));
	for (let t = 5;; t--) {
		let c = o.ticks(t);
		if (r !== null && i !== a && (c.length > s || c.length < 2)) {
			if (t > 1) continue;
			c = [i, a];
		}
		let l = c.map((t) => e.format(t)), u = Math.max(0, ...l.map(Ao)), d = {
			lo: i,
			hi: a,
			ticks: c,
			labels: l,
			widest: u
		};
		if (!n || t <= 1 || c.length < 2 || Math.abs(c[1] - c[0]) / (a - i) * Math.max(0, n(u)) >= fo * u + Do) return d;
	}
}
var Ro = (e) => ko(fo * e + _o, 56, vo);
function zo(e, t) {
	let n = -1;
	for (let r of e) r.type !== "bar" && (n = Math.max(n, Lo(r, t).widest));
	return n < 0 ? 0 : Ro(n);
}
var Bo = (e) => po + (e?.unitLabel ? ho : 0), Vo = (e, t) => e?.unitLabel ? {
	x: t.x,
	y: go,
	text: e.unitLabel
} : null, Ho = (e) => Math.max(po, Math.ceil(fo * e / 2)), Uo = (e) => Math.min(Ao(e[e.length - 1] ?? ""), Math.floor(106 / fo)), Wo = (e, t) => Xa().domain(Array.from({ length: e }, (e, t) => t)).range(t).paddingInner(.2).paddingOuter(.1);
function Go(e, t) {
	let n = t.step(), r = Math.min(fo * Math.max(0, ...e.map(Ao)), 106), i = n > 0 ? Math.max(1, Math.ceil(r / n)) : Math.max(1, e.length), a = e.length > 0 ? Io(e.length, i) : [], o = (e) => {
		let t = [i];
		return e > 0 && t.push(a[e] - a[e - 1]), e < a.length - 1 && t.push(a[e + 1] - a[e]), Math.min(...t) * n;
	};
	return a.map((n, r) => ({
		at: (t(n) ?? 0) + t.bandwidth() / 2,
		label: Fo(e[n], o(r)),
		full: e[n]
	}));
}
function Ko(e, t, n, r) {
	let i = e.step(), a = (i - e.bandwidth()) / 2;
	return Array.from({ length: t }, (t, o) => {
		let s = (e(o) ?? 0) - a;
		return r ? {
			x: n.x,
			y: s,
			width: n.width,
			height: i
		} : {
			x: s,
			y: n.y,
			width: i,
			height: n.height
		};
	});
}
var qo = Gn().defined((e) => e !== null).x((e) => e[0]).y((e) => e[1]).digits(3);
function Jo(e) {
	let t = 0;
	for (let n of e) n !== null && (t = Math.max(t, Ao(n)));
	return t;
}
function Yo(e, t, n, i = r.en, a) {
	let o = e.type === "bar", s = $(t.width) ? Math.max(0, t.width) : 0, c = $(t.height) ? Math.max(0, t.height) : 0, l = e.buckets.map((t, n) => e.ranks[n] ? `${e.ranks[n]} ${t.label}` : t.label), u = ko(fo * Math.max(0, ...l.map(Ao)) + _o, 48, vo), d = Jo(e.beside), f = d > 0, p = f && o ? Math.min(vo, Co + Math.ceil(fo * d)) : 0, m = o || a?.categoryLabels !== !1, h = Bo(a) + (f && !o ? wo : 0), g = Math.max(0, c - h - (m ? mo : po)), { lo: _, hi: v, ticks: y, labels: b, widest: x } = Lo(e, n, o ? (e) => s - u - Math.max(Ho(e), p) : null, o ? null : g), S = o ? u : a?.valueGutter ?? Ro(x), C = Math.max(Ho(o ? x : Uo(l)), p), w = {
		x: S,
		y: h,
		width: Math.max(0, s - S - C),
		height: g
	}, T = uo().domain([_, v]).range(o ? [w.x, w.x + w.width] : [w.y + w.height, w.y]), E = Wo(e.buckets.length, o ? [w.y, w.y + w.height] : [w.x, w.x + w.width]), D = E.bandwidth(), O = T(0), k = !o && fo * d + Co > E.step() ? e.alone : e.beside, A = e.series.map((e, t) => t).filter((e) => !n.has(e)), j = [];
	if (e.stacked) j.push({
		series: -1,
		kind: "value"
	});
	else for (let t of A) j.push({
		series: t,
		kind: "value"
	}), t === 0 && No(e, n) && j.push({
		series: 0,
		kind: "previous"
	});
	let M = Xa().domain(j.map((e, t) => t)).range([0, D]).paddingInner(.1), N = (e, t, n, r, i) => {
		let a = T(e), s = T(t), c = Math.max(1, i), l = n + r - (c - i) / 2, u = Math.min(a, s), d = Math.abs(s - a);
		return o ? {
			x: u,
			y: l,
			width: d,
			height: c
		} : {
			x: l,
			y: u,
			width: c,
			height: d
		};
	}, P = (e) => j.length === 1 ? {
		offset: 0,
		across: D
	} : {
		offset: M(e) ?? 0,
		across: M.bandwidth()
	}, F = (t, n, r) => `${t.label}, ${n}: ${e.format(r)}`, I = (t, n) => e.stacked ? n : t.restricted ? "restricted" : t.other ? "other" : n, L = Mo(e, n), R = [], z = [], B = [];
	e.buckets.forEach((t, n) => {
		let r = E(n) ?? 0, a = R.length;
		if (t.filled && A.length > 0) {
			let a = e.series[A[0]], s = j.length > 1 && j.some((e) => e.kind === "previous") ? P(0) : {
				offset: 0,
				across: D
			}, c = o ? {
				x: O,
				y: r + s.offset,
				width: yo,
				height: Math.max(1, s.across)
			} : {
				x: r + s.offset,
				y: O - yo,
				width: Math.max(1, s.across),
				height: yo
			};
			R.push({
				...c,
				series: A[0],
				bucket: n,
				kind: "filled",
				fill: yt(a.color),
				opacity: 1,
				pattern: null,
				drill: null,
				summary: `${t.label}, ${a.label}: ${i.tileFilled}`
			});
		}
		if (e.stacked) {
			let i = 0, a = 0, { offset: o, across: s } = P(0);
			if (!t.filled) for (let c of A) {
				let l = t.values[c];
				if (!$(l)) continue;
				let u = e.series[c], [d, f] = l >= 0 ? [i, i + l] : [a + l, a];
				l >= 0 ? i += l : a += l, R.push({
					...N(d, f, r, o, s),
					series: c,
					bucket: n,
					kind: "value",
					fill: yt(u.color),
					opacity: 1,
					pattern: u.pattern,
					drill: t.drills[c] ?? null,
					summary: F(t, u.label, l)
				});
			}
		} else j.forEach((a, o) => {
			let { offset: s, across: c } = P(o), l = e.series[a.series];
			if (a.kind === "previous") {
				let o = t.previous;
				if (!$(o)) return;
				let u = `${t.label}, ${l.label} (${i.tileEarlier}): ${e.format(o)}`;
				R.push({
					...N(Math.min(0, o), Math.max(0, o), r, s, c),
					series: a.series,
					bucket: n,
					kind: "previous",
					fill: yt(l.color),
					opacity: bo,
					pattern: I(t, l.pattern),
					drill: null,
					summary: u
				});
				return;
			}
			let u = t.values[a.series];
			$(u) && !t.filled && R.push({
				...N(Math.min(0, u), Math.max(0, u), r, s, c),
				series: a.series,
				bucket: n,
				kind: "value",
				fill: yt(l.color),
				opacity: 1,
				pattern: I(t, l.pattern),
				drill: t.drills[a.series] ?? null,
				summary: F(t, l.label, u)
			});
		});
		if ($(t.target)) {
			let e = T(t.target), i = r + D * .1, a = r + D * .9;
			z.push(o ? {
				bucket: n,
				x1: e,
				y1: i,
				x2: e,
				y2: a
			} : {
				bucket: n,
				x1: i,
				y1: e,
				x2: a,
				y2: e
			});
		}
		let c = k[n];
		if (c && L) {
			let t = O, i = r + D / 2;
			for (let n = a; n < R.length; n++) {
				let r = R[n];
				r.kind !== "previous" && (e.stacked || r.series === 0) && (t = o ? Math.max(t, r.x + r.width) : Math.min(t, r.y), e.stacked || (i = o ? r.y + r.height / 2 : r.x + r.width / 2));
			}
			B.push(o ? {
				bucket: n,
				x: t + Co,
				y: i,
				text: Fo(c, s - (t + Co)),
				anchor: "start"
			} : {
				bucket: n,
				x: jo(i, fo * Ao(c) / 2, s),
				y: t - Co,
				text: c,
				anchor: "middle"
			});
		}
	});
	let V = null;
	if (e.derive?.kind === "running_total" && L) {
		let t = (e) => (E(e) ?? 0) + D / 2, n = e.buckets.flatMap((e, n) => $(e.derived) ? [{
			bucket: n,
			cx: o ? T(e.derived) : t(n),
			cy: o ? t(n) : T(e.derived),
			hollow: e.filled
		}] : []);
		if (n.length > 0) {
			let t = Array.from({ length: e.buckets.length }, () => null);
			for (let e of n) t[e.bucket] = [e.cx, e.cy];
			V = {
				d: qo(t) ?? "",
				dots: n
			};
		}
	}
	let H = o ? l.map((e, t) => ({
		at: (E(t) ?? 0) + D / 2,
		label: Fo(e, S - _o),
		full: e
	})) : m ? Go(l, E) : [];
	return {
		plot: w,
		marks: R,
		targets: z,
		labels: B,
		running: V,
		valueTicks: y.map((e, t) => ({
			at: T(e),
			label: b[t],
			full: b[t]
		})),
		categoryTicks: H,
		zero: O,
		hits: Ko(E, e.buckets.length, w, o),
		unit: Vo(a, w)
	};
}
var Xo = "var(--k-chart-other)", Zo = (e) => Math.round(e * 1e3) / 1e3, Qo = (e) => e.length >= 2 && e.length <= 4;
function $o(e, t, n, i = r.en, a) {
	let o = $(t.width) ? Math.max(0, t.width) : 0, s = $(t.height) ? Math.max(0, t.height) : 0, c = a?.categoryLabels !== !1, l = Bo(a), u = Math.max(0, s - l - (c ? mo : po)), d = Lo(e, n, null, u), f = e.buckets.map((e) => e.label), p = e.buckets.length, m = e.series.map((e, t) => t).filter((e) => !n.has(e)), h = (t, n) => {
		let r = e.buckets[t].values[n];
		return $(r) ? r : null;
	}, g = (e) => {
		for (let t = p - 1; t >= 0; t--) if (h(t, e) !== null) return t;
		return -1;
	}, _ = !a && Qo(m) ? m.filter((e) => g(e) >= 0) : [], v = _.length > 0 ? ko(fo * Math.max(..._.map((t) => Ao(e.series[t].label))) + So, 0, vo) : 0, y = a?.valueGutter ?? Ro(d.widest), b = Math.max(Ho(Uo(f)), v), x = {
		x: y,
		y: l,
		width: Math.max(0, o - y - b),
		height: u
	}, S = uo().domain([d.lo, d.hi]).range([x.y + x.height, x.y]), C = Wo(p, [x.x, x.x + x.width]), w = e.buckets.map((e, t) => (C(t) ?? 0) + C.bandwidth() / 2), T = (t) => yt(e.series[t].color) || Xo, E = Array.from({ length: p }, (e, t) => t), D = ko(C.bandwidth() * .4, 3, 24), O = (e, t, n = hr) => {
		let r = (t) => e[t] !== null && e[t] !== void 0, i = (e) => t && r(e) && !r(e - 1) && !r(e + 1), a = Gn().defined((e) => r(e) && !i(e)).x((e) => w[e]).y((t) => S(e[t])).curve(n)(E), o = E.filter(i).map((t) => {
			let n = Zo(S(e[t]));
			return `M${Zo(w[t] - D)},${n}L${Zo(w[t] + D)},${n}`;
		});
		return `${a ?? ""}${o.join("")}`;
	}, k = (e) => $(e) ? e : null, A = [];
	if (No(e, n)) {
		let t = O(e.buckets.map((e) => k(e.previous)), !0);
		t && A.push({
			series: 0,
			kind: "previous",
			d: t,
			stroke: T(0),
			opacity: xo,
			dashed: !1
		});
	}
	let j = O(e.buckets.map((e) => k(e.target)), !0);
	j && A.push({
		series: -1,
		kind: "target",
		d: j,
		stroke: "var(--k-fg)",
		opacity: 1,
		dashed: !0
	});
	let M = [];
	for (let t of m) {
		let n = O(e.buckets.map((e, n) => h(n, t)), !1);
		n && A.push({
			series: t,
			kind: "value",
			d: n,
			stroke: T(t),
			opacity: 1,
			dashed: !1
		});
		let r = e.series[t];
		e.buckets.forEach((n, a) => {
			let o = h(a, t);
			o !== null && M.push({
				series: t,
				bucket: a,
				cx: w[a],
				cy: S(o),
				hollow: n.filled,
				stroke: T(t),
				drill: n.filled ? null : n.drills[t] ?? null,
				summary: `${n.label}, ${r.label}: ${n.filled ? i.tileFilled : e.format(o)}`
			});
		});
	}
	if (e.derive?.kind === "running_total" && Mo(e, n)) {
		let t = O(e.buckets.map((e) => k(e.derived)), !0, Hn);
		t && A.push({
			series: -1,
			kind: "running",
			d: t,
			stroke: "var(--k-fg)",
			opacity: To,
			dashed: !1
		});
	}
	let N = _.map((t) => {
		let n = g(t);
		return {
			series: t,
			x: w[n] + So,
			y: S(h(n, t)),
			text: Fo(e.series[t].label, v - So)
		};
	}), P = [...N].sort((e, t) => e.y - t.y || e.series - t.series);
	for (let e = 1; e < P.length; e++) P[e].y = Math.max(P[e].y, P[e - 1].y + Eo);
	let F = x.y + x.height;
	for (let e = P.length - 1; e >= 0; e--) P[e].y = Math.min(P[e].y, F), F = P[e].y - Eo;
	return {
		plot: x,
		paths: A,
		dots: M,
		labels: N,
		valueTicks: d.ticks.map((e, t) => ({
			at: S(e),
			label: d.labels[t],
			full: d.labels[t]
		})),
		categoryTicks: c ? Go(f, C) : [],
		bucketX: w,
		zero: d.lo < 0 && d.hi > 0 ? S(0) : null,
		hits: Ko(C, p, x, !1),
		unit: Vo(a, x)
	};
}
var es = 8, ts = .55, ns = Jn().sort(null);
function rs(e, t) {
	let n = $(t.width) ? Math.max(0, t.width) : 0, r = $(t.height) ? Math.max(0, t.height) : 0, i = Math.max(0, Math.min(n, r) / 2 - es), a = e.type === "donut" ? ts * i : 0, o = zn().innerRadius(a).outerRadius(i), s = [];
	for (let t = 0; t < e.buckets.length; t++) ot(e.buckets[t]) && s.push(t);
	let c = ns(s.map((t) => e.buckets[t].values[0])).map((t, n) => {
		let r = s[n], i = e.buckets[r], a = e.slices[r];
		return {
			bucket: r,
			d: o(t) ?? "",
			fill: yt(a.color),
			pattern: a.pattern,
			drill: i.drills[0] ?? null,
			summary: `${i.label}: ${e.format(i.values[0])} (${a.share})`
		};
	});
	return {
		cx: n / 2,
		cy: r / 2,
		outer: i,
		inner: a,
		slices: c
	};
}
//#endregion
//#region src/kit/tile/Lines.svelte
var is = g("<line part=\"zero\" aria-hidden=\"true\" stroke-width=\"1.5\" class=\"svelte-1klqngy\"></line>"), as = g("<path aria-hidden=\"true\" stroke-linejoin=\"round\" class=\"svelte-1klqngy\"></path>"), os = g("<circle data-kind=\"dot\" r=\"3.5\" stroke-width=\"2\" class=\"svelte-1klqngy\"></circle>"), ss = g("<text class=\"name svelte-1klqngy\" dominant-baseline=\"central\"> </text>"), cs = g("<!><!><!><g aria-hidden=\"true\" class=\"svelte-1klqngy\"></g>", 1), ls = {
	hash: "svelte-1klqngy",
	code: ".name.svelte-1klqngy {font-size:11px;font-weight:500;}path.svelte-1klqngy, circle.svelte-1klqngy, .name.svelte-1klqngy {transition:opacity 120ms;}[aria-hidden='true'].svelte-1klqngy {pointer-events:none;}[tabindex].svelte-1klqngy {outline:none;-webkit-tap-highlight-color:transparent;}[role='button'].svelte-1klqngy:not([aria-disabled='true']) {cursor:pointer;}[tabindex].svelte-1klqngy:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}\n  @media (prefers-reduced-motion: reduce) {path.svelte-1klqngy, circle.svelte-1klqngy, .name.svelte-1klqngy {transition:none;}\n  }"
};
function us(e, t) {
	m(t, !0), c(e, ls);
	let n = w(t, "layout", 7), r = w(t, "opens", 7), i = w(t, "tab", 7), o = w(t, "emphasis", 7), l = w(t, "onkey", 7), d = w(t, "onopen", 7), f = (e, t = 1) => o() !== null && e >= 0 && e !== o() ? Math.min(t, .25) : t;
	var h = {
		get layout() {
			return n();
		},
		set layout(e) {
			n(e), _();
		},
		get opens() {
			return r();
		},
		set opens(e) {
			r(e), _();
		},
		get tab() {
			return i();
		},
		set tab(e) {
			i(e), _();
		},
		get emphasis() {
			return o();
		},
		set emphasis(e) {
			o(e), _();
		},
		get onkey() {
			return l();
		},
		set onkey(e) {
			l(e), _();
		},
		get onopen() {
			return d();
		},
		set onopen(e) {
			d(e), _();
		}
	}, g = cs(), b = W(g), x = (e) => {
		var t = is();
		z(t, "", {}, { stroke: "var(--k-chart-axis)" }), V(() => {
			v(t, "x1", n().plot.x), v(t, "y1", n().zero), v(t, "x2", n().plot.x + n().plot.width), v(t, "y2", n().zero);
		}), S(e, t);
	};
	y(b, (e) => {
		n().zero !== null && e(x);
	});
	var C = L(b);
	a(C, 17, () => n().paths, (e) => `${e.kind}:${e.series}`, (e, t) => {
		var n = as();
		let r;
		V((e) => {
			v(n, "data-kind", E(t).kind), v(n, "data-series", E(t).series), v(n, "d", E(t).d), v(n, "stroke-width", E(t).kind === "target" || E(t).kind === "running" ? 1.5 : 2), v(n, "stroke-linecap", E(t).dashed ? "butt" : "round"), v(n, "stroke-dasharray", E(t).dashed ? "4 3" : void 0), r = z(n, "", r, {
				fill: "none",
				stroke: E(t).stroke,
				opacity: e
			});
		}, [() => f(E(t).series, E(t).opacity)]), S(e, n);
	});
	var T = L(C);
	a(T, 17, () => n().dots, (e) => `${e.series}:${e.bucket}`, (e, t) => {
		var n = os();
		let a;
		V((e) => {
			v(n, "role", r() ? "button" : "img"), v(n, "tabindex", i()?.bucket === E(t).bucket && i().series === E(t).series ? 0 : -1), v(n, "aria-label", E(t).summary), v(n, "aria-disabled", r() && !E(t).drill ? "true" : void 0), v(n, "data-bucket", E(t).bucket), v(n, "data-series", E(t).series), v(n, "cx", E(t).cx), v(n, "cy", E(t).cy), a = z(n, "", a, {
				fill: E(t).hollow ? "var(--k-surface)" : E(t).stroke,
				stroke: E(t).stroke,
				opacity: e
			});
		}, [() => f(E(t).series)]), U("click", n, (e) => d()(E(t), e)), G("auxclick", n, (e) => d()(E(t), e)), U("keydown", n, (e) => l()(e, E(t))), S(e, n);
	});
	var D = L(T);
	return a(D, 21, () => n().labels, (e) => e.series, (e, t) => {
		var n = ss();
		let r;
		var i = H(n, !0);
		V((e) => {
			v(n, "x", E(t).x), v(n, "y", E(t).y), r = z(n, "", r, {
				fill: "var(--k-fg)",
				opacity: e
			}), u(i, E(t).text);
		}, [() => f(E(t).series)]), S(e, n);
	}), p(D), S(e, g), s(h);
}
K(["click", "keydown"]), F(us, {
	layout: {},
	opens: {},
	tab: {},
	emphasis: {},
	onkey: {},
	onopen: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Pie.svelte
var ds = g("<path part=\"slice\" data-kind=\"slice\" data-series=\"0\" stroke-width=\"2\" stroke-linejoin=\"round\" class=\"svelte-11o6kon\"></path>"), fs = g("<g></g>"), ps = {
	hash: "svelte-11o6kon",
	code: "path.svelte-11o6kon {outline:none;-webkit-tap-highlight-color:transparent;}path[role='button'].svelte-11o6kon:not([aria-disabled='true']) {cursor:pointer;}path.svelte-11o6kon:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}"
};
function ms(e, t) {
	m(t, !0), c(e, ps);
	let n = w(t, "layout", 7), r = w(t, "ids", 7), i = w(t, "opens", 7), o = w(t, "tab", 7), l = w(t, "onkey", 7), u = w(t, "onopen", 7), d = (e) => e.pattern ? `url(#${r()[e.pattern]})` : e.fill || "var(--k-chart-other)", f = (e) => ({
		bucket: e.bucket,
		series: 0,
		drill: e.drill
	});
	var h = {
		get layout() {
			return n();
		},
		set layout(e) {
			n(e), _();
		},
		get ids() {
			return r();
		},
		set ids(e) {
			r(e), _();
		},
		get opens() {
			return i();
		},
		set opens(e) {
			i(e), _();
		},
		get tab() {
			return o();
		},
		set tab(e) {
			o(e), _();
		},
		get onkey() {
			return l();
		},
		set onkey(e) {
			l(e), _();
		},
		get onopen() {
			return u();
		},
		set onopen(e) {
			u(e), _();
		}
	}, g = fs();
	return a(g, 21, () => n().slices, (e) => e.bucket, (e, t) => {
		var n = ds();
		let r;
		V((e) => {
			v(n, "role", i() ? "button" : "img"), v(n, "tabindex", o()?.bucket === E(t).bucket ? 0 : -1), v(n, "aria-label", E(t).summary), v(n, "aria-disabled", i() && !E(t).drill ? "true" : void 0), v(n, "data-bucket", E(t).bucket), v(n, "d", E(t).d), r = z(n, "", r, {
				fill: e,
				stroke: "var(--k-surface)"
			});
		}, [() => d(E(t))]), U("click", n, (e) => u()(f(E(t)), e)), G("auxclick", n, (e) => u()(f(E(t)), e)), U("keydown", n, (e) => l()(e, f(E(t)))), S(e, n);
	}), p(g), V(() => v(g, "transform", `translate(${n().cx ?? ""} ${n().cy ?? ""})`)), S(e, g), s(h);
}
K(["click", "keydown"]), F(ms, {
	layout: {},
	ids: {},
	opens: {},
	tab: {},
	onkey: {},
	onopen: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/ChartPlot.svelte
var hs = g("<rect class=\"strip svelte-1ycirdq\" aria-hidden=\"true\"></rect>"), gs = g("<line class=\"crosshair svelte-1ycirdq\"></line>"), _s = g("<!><!>", 1), vs = C("<div class=\"panel svelte-1ycirdq\"><svg class=\"svelte-1ycirdq\"><!><!><g part=\"plot\" role=\"group\"><!><!></g></svg></div>"), ys = {
	hash: "svelte-1ycirdq",
	code: ".panel.svelte-1ycirdq {position:relative;flex:1 1 0;min-width:0;min-height:0;}svg.svelte-1ycirdq {position:absolute;inset:0;display:block;width:100%;height:100%;}.strip.svelte-1ycirdq {fill:transparent;}.crosshair.svelte-1ycirdq {stroke-width:1;pointer-events:none;}"
};
function bs(t, n) {
	let r = i();
	m(n, !0), c(t, ys);
	let l = w(n, "model", 7), u = w(n, "size", 7), d = w(n, "options", 7), f = w(n, "hidden", 7), g = w(n, "emphasis", 7), x = w(n, "active", 7), C = w(n, "text", 7), T = w(n, "label", 7), k = w(n, "host", 7), A = w(n, "ontip", 7), M = {
		other: `${r}-other`,
		restricted: `${r}-restricted`
	}, N = O(void 0), F = O(null), I = null, R = o(() => ze(l().type)), B = o(() => l().type === "bar" || l().type === "column" ? Yo(l(), u(), f(), C(), d()) : null), H = o(() => l().type === "line" ? $o(l(), u(), f(), C(), d()) : null), ee = o(() => E(R) ? rs(l(), u()) : null), te = o(() => (E(H) ?? E(B))?.hits ?? []), ne = o(() => en(E(F), l(), f())), K = o(() => l().drill.enabled), ie = o(() => l().unitLabel ? `${T() || l().splitLabel} · ${l().unitLabel}` : T() || l().splitLabel);
	j(() => {
		let e = l(), t = I;
		e !== t && (I = e, t && re(() => {
			q(F, t.type === e.type ? en(E(F), e, f()) : null);
		}));
	});
	let ae = "[data-bucket][tabindex]", oe = (e) => e.target?.closest(ae) ?? null;
	function se(e) {
		let t = (e) => {
			let t = e.getBoundingClientRect();
			return l().type === "bar" ? t.right : -t.top;
		}, n = null;
		for (let r of E(N)?.querySelectorAll(`${ae}[data-bucket="${e}"]`) ?? []) (!n || t(r) > t(n)) && (n = r);
		return n;
	}
	function ce(t, n) {
		n instanceof MouseEvent && !Gt(n) || t?.drill && e(k(), "af-drill", {
			...t.drill,
			newTab: Wt(n)
		});
	}
	function le(t, n) {
		let r = Gt(n) ? on(l(), t, f()) : null;
		r && e(k(), "af-drill", {
			...r,
			newTab: Wt(n)
		});
	}
	function ue(e) {
		let t = (e) => {
			E(K) && Kt(e);
		};
		return e.addEventListener("mousedown", t), () => e.removeEventListener("mousedown", t);
	}
	function de(e) {
		let t = e.target?.closest("[data-bucket]");
		if (!t) return;
		let n = Number(t.dataset.bucket);
		x() !== n && A()({
			bucket: n,
			anchor: se(n) ?? t
		});
	}
	function fe(e) {
		let t = oe(e);
		if (!t) return;
		let n = Number(t.dataset.bucket);
		q(F, {
			bucket: n,
			series: Number(t.dataset.series)
		}), A()({
			bucket: n,
			anchor: t
		});
	}
	function pe(e) {
		E(N) && e.relatedTarget instanceof Node && E(N).contains(e.relatedTarget) || A()(null);
	}
	function me(e, t) {
		if (!e.altKey) {
			if (e.key === "Enter" || e.key === " ") e.preventDefault(), ce(t, e);
			else if (Xt(e.key) && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				let n = {
					bucket: t.bucket,
					series: t.series
				}, r = $t(n, e.key, l(), f());
				r !== n && E(N)?.querySelector(`${ae}[data-bucket="${r.bucket}"][data-series="${r.series}"]`)?.focus();
			}
		}
	}
	var he = {
		get model() {
			return l();
		},
		set model(e) {
			l(e), _();
		},
		get size() {
			return u();
		},
		set size(e) {
			u(e), _();
		},
		get options() {
			return d();
		},
		set options(e) {
			d(e), _();
		},
		get hidden() {
			return f();
		},
		set hidden(e) {
			f(e), _();
		},
		get emphasis() {
			return g();
		},
		set emphasis(e) {
			g(e), _();
		},
		get active() {
			return x();
		},
		set active(e) {
			x(e), _();
		},
		get text() {
			return C();
		},
		set text(e) {
			C(e), _();
		},
		get label() {
			return T();
		},
		set label(e) {
			T(e), _();
		},
		get host() {
			return k();
		},
		set host(e) {
			k(e), _();
		},
		get ontip() {
			return A();
		},
		set ontip(e) {
			A(e), _();
		}
	}, ge = vs(), _e = P(ge), ve = P(_e);
	Ut(ve, { get ids() {
		return M;
	} });
	var ye = L(ve), be = (e) => {
		jt(e, {
			get layout() {
				return E(H);
			},
			horizontal: !1
		});
	}, xe = (e) => {
		{
			let t = o(() => l().type === "bar");
			jt(e, {
				get layout() {
					return E(B);
				},
				get zero() {
					return E(B).zero;
				},
				get horizontal() {
					return E(t);
				}
			});
		}
	};
	y(ye, (e) => {
		E(H) ? e(be) : E(B) && e(xe, 1);
	});
	var Se = L(ye), Ce = P(Se);
	a(Ce, 17, () => E(te), b, (e, t, n) => {
		var r = hs();
		v(r, "data-bucket", n), V(() => {
			v(r, "x", E(t).x), v(r, "y", E(t).y), v(r, "width", E(t).width), v(r, "height", E(t).height);
		}), U("click", r, (e) => le(n, e)), G("auxclick", r, (e) => le(n, e)), S(e, r);
	});
	var we = L(Ce), Te = (e) => {
		var t = _s(), n = W(t), r = (e) => {
			var t = gs();
			z(t, "", {}, { stroke: "var(--k-chart-axis)" }), V(() => {
				v(t, "x1", E(H).bucketX[x()]), v(t, "y1", E(H).plot.y), v(t, "x2", E(H).bucketX[x()]), v(t, "y2", E(H).plot.y + E(H).plot.height);
			}), S(e, t);
		};
		y(n, (e) => {
			x() !== null && e(r);
		}), us(L(n), {
			get layout() {
				return E(H);
			},
			get opens() {
				return E(K);
			},
			get tab() {
				return E(ne);
			},
			get emphasis() {
				return g();
			},
			onkey: me,
			onopen: ce
		}), S(e, t);
	}, Ee = (e) => {
		Vt(e, {
			get marks() {
				return E(B).marks;
			},
			get targets() {
				return E(B).targets;
			},
			get labels() {
				return E(B).labels;
			},
			get running() {
				return E(B).running;
			},
			get ids() {
				return M;
			},
			get opens() {
				return E(K);
			},
			get tab() {
				return E(ne);
			},
			get emphasis() {
				return g();
			},
			onkey: me,
			onopen: ce
		});
	}, De = (e) => {
		ms(e, {
			get layout() {
				return E(ee);
			},
			get ids() {
				return M;
			},
			get opens() {
				return E(K);
			},
			get tab() {
				return E(ne);
			},
			onkey: me,
			onopen: ce
		});
	};
	return y(we, (e) => {
		E(H) ? e(Te) : E(B) ? e(Ee, 1) : E(ee) && e(De, 2);
	}), p(Se), D(Se, (e) => q(N, e), () => E(N)), h(Se, () => ue), p(_e), p(ge), V(() => {
		v(_e, "viewBox", `0 0 ${u().width ?? ""} ${u().height ?? ""}`), v(Se, "aria-label", E(ie));
	}), U("pointerover", Se, de), G("pointerleave", Se, () => A()(null)), U("focusin", Se, fe), U("focusout", Se, pe), S(t, ge), s(he);
}
K([
	"pointerover",
	"focusin",
	"focusout",
	"click"
]), F(bs, {
	model: {},
	size: {},
	options: {},
	hidden: {},
	emphasis: {},
	active: {},
	text: {},
	label: {},
	host: {},
	ontip: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Swatch.svelte
var xs = C("<span class=\"run svelte-1etllxt\"></span><span class=\"point svelte-1etllxt\"></span>", 1), Ss = C("<span aria-hidden=\"true\"><!></span>"), Cs = {
	hash: "svelte-1etllxt",
	code: ".swatch.svelte-1etllxt {display:inline-block;flex:none;width:10px;height:10px;border-radius:2px;background:var(--tone);}.swatch.faint.svelte-1etllxt {opacity:0.4;}.box.other.svelte-1etllxt {background:repeating-linear-gradient(45deg, var(--k-chart-hatch) 0 2px, var(--k-chart-other) 2px 6px);}.box.restricted.svelte-1etllxt {background:repeating-linear-gradient(-45deg, var(--k-chart-hatch) 0 2px, var(--k-chart-other) 2px 6px);}.line.svelte-1etllxt {width:14px;height:2px;border-radius:1px;}\n  /* The running total as the chart draws it: a line at 0.7 with a dot on it. A target's rule has neither. */.ink.svelte-1etllxt {position:relative;width:14px;height:2px;border-radius:0;background:none;}.run.svelte-1etllxt {position:absolute;inset:0;border-radius:1px;background:var(--k-fg);opacity:0.7;}.point.svelte-1etllxt {position:absolute;top:50%;left:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--k-fg);}.rule.svelte-1etllxt {width:14px;height:2px;border-radius:0;background:var(--k-fg);}.dashed.svelte-1etllxt {width:14px;height:0;border-top:2px dashed var(--k-fg);border-radius:0;background:none;}.outline.svelte-1etllxt {box-sizing:border-box;border:1px dashed var(--tone);background:none;}.hollow.svelte-1etllxt {box-sizing:border-box;width:8px;height:8px;border:2px solid var(--tone);border-radius:50%;background:none;}"
};
function ws(e, t) {
	m(t, !0), c(e, Cs);
	let n = w(t, "color", 7, null), r = w(t, "pattern", 7, null), i = w(t, "shape", 7, "box"), a = w(t, "faint", 7, !1);
	var o = {
		get color() {
			return n();
		},
		set color(e = null) {
			n(e), _();
		},
		get pattern() {
			return r();
		},
		set pattern(e = null) {
			r(e), _();
		},
		get shape() {
			return i();
		},
		set shape(e = "box") {
			i(e), _();
		},
		get faint() {
			return a();
		},
		set faint(e = !1) {
			a(e), _();
		}
	}, l = Ss();
	let u, h;
	var g = P(l), v = (e) => {
		var t = xs();
		f(), S(e, t);
	};
	return y(g, (e) => {
		i() === "ink" && e(v);
	}), p(l), V((e) => {
		u = d(l, 1, `swatch ${i() ?? ""}`, "svelte-1etllxt", u, {
			other: r() === "other",
			restricted: r() === "restricted",
			faint: a()
		}), h = z(l, "", h, { "--tone": e });
	}, [() => yt(n()) || "var(--k-chart-other)"]), S(e, l), s(o);
}
F(ws, {
	color: {},
	pattern: {},
	shape: {},
	faint: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/ChartTooltip.svelte
var Ts = C("<div class=\"row svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"><!> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), Es = C("<div class=\"row svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), Ds = C("<div class=\"row muted svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), Os = C("<div class=\"row muted svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div> <div class=\"row muted svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>", 1), ks = C("<div class=\"row strong svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), As = C("<div class=\"hint svelte-10zvhfs\"> </div>"), js = C("<div class=\"body af-overlay svelte-10zvhfs\"><div class=\"title svelte-10zvhfs\"> </div> <!> <!> <!> <!> <!> <!> <!></div>"), Ms = C("<div class=\"tip svelte-10zvhfs\" part=\"tooltip\" role=\"tooltip\" popover=\"manual\"><!></div>"), Ns = {
	hash: "svelte-10zvhfs",
	code: ".tip.svelte-10zvhfs {width:max-content;max-width:min(320px, calc(100vw - 8px));pointer-events:none;font-size:12px;line-height:18px;}.body.svelte-10zvhfs {padding:6px 10px;}.title.svelte-10zvhfs {margin-bottom:2px;font-weight:600;overflow-wrap:anywhere;}.row.svelte-10zvhfs {display:flex;align-items:center;justify-content:space-between;gap:16px;}.name.svelte-10zvhfs {display:inline-flex;align-items:center;gap:6px;min-width:0;overflow-wrap:anywhere;}.value.svelte-10zvhfs {font-variant-numeric:tabular-nums;text-align:end;white-space:nowrap;}.muted.svelte-10zvhfs {color:var(--k-muted);}.strong.svelte-10zvhfs {font-weight:600;}.hint.svelte-10zvhfs {margin-top:4px;padding-top:4px;border-top:1px solid var(--k-line);color:var(--k-muted);}"
};
function Ps(e, t) {
	m(t, !0), c(e, Ns);
	let r = w(t, "model", 7), i = w(t, "anchor", 7), l = w(t, "side", 7), d = w(t, "line", 7), f = w(t, "text", 7), h = w(t, "host", 7), g = O(void 0), v = O(I({
		left: 0,
		top: 0
	})), x = !1;
	ae(() => () => {
		x && (h().dataset.raised = "false");
	}), ae(() => {
		let e = E(g), t = r() !== null && !!i()?.isConnected;
		if (n(e, t, h()), x = t && !!e?.isConnected, e && t && i()) {
			let t = {
				width: document.documentElement.clientWidth,
				height: document.documentElement.clientHeight
			};
			q(v, dn(i().getBoundingClientRect(), {
				width: e.offsetWidth,
				height: e.offsetHeight
			}, t, l()), !0);
		}
	});
	var C = {
		get model() {
			return r();
		},
		set model(e) {
			r(e), _();
		},
		get anchor() {
			return i();
		},
		set anchor(e) {
			i(e), _();
		},
		get side() {
			return l();
		},
		set side(e) {
			l(e), _();
		},
		get line() {
			return d();
		},
		set line(e) {
			d(e), _();
		},
		get text() {
			return f();
		},
		set text(e) {
			f(e), _();
		},
		get host() {
			return h();
		},
		set host(e) {
			h(e), _();
		}
	}, T = Ms();
	let k;
	var A = P(T), j = (e) => {
		var t = js(), n = P(t), i = H(n, !0), s = L(n, 2);
		a(s, 17, () => r().rows, b, (e, t) => {
			var n = Ts(), r = P(n), i = P(r);
			{
				let e = o(() => d() ? "line" : "box");
				ws(i, {
					get color() {
						return E(t).color;
					},
					get pattern() {
						return E(t).pattern;
					},
					get shape() {
						return E(e);
					}
				});
			}
			var a = L(i, 1, !0);
			p(r);
			var s = L(r), c = H(s, !0);
			p(n), V(() => {
				u(a, E(t).label), u(c, E(t).value);
			}), S(e, n);
		});
		var c = L(s, 2), l = (e) => {
			var t = Es(), n = P(t), i = H(n, !0), a = L(n), o = H(a, !0);
			p(t), V(() => {
				u(i, f().tileShare), u(o, r().share);
			}), S(e, t);
		};
		y(c, (e) => {
			r().share !== null && e(l);
		});
		var m = L(c, 2), h = (e) => {
			var t = Ds(), n = P(t), i = H(n, !0), a = L(n), o = H(a, !0);
			p(t), V(() => {
				u(i, f().tileTarget), u(o, r().target);
			}), S(e, t);
		};
		y(m, (e) => {
			r().target !== null && e(h);
		});
		var g = L(m, 2), _ = (e) => {
			var t = Ds(), n = P(t), i = H(n, !0), a = L(n), o = H(a, !0);
			p(t), V(() => {
				u(i, r().derived.label), u(o, r().derived.value);
			}), S(e, t);
		};
		y(g, (e) => {
			r().derived !== null && e(_);
		});
		var v = L(g, 2), x = (e) => {
			var t = Os(), n = W(t), i = P(n), a = H(i, !0), o = L(i), s = H(o, !0);
			p(n);
			var c = L(n, 2), l = P(c), d = H(l, !0), m = L(l), h = H(m, !0);
			p(c), V(() => {
				u(a, f().tileEarlier), u(s, r().earlier), u(d, f().tileDifference), u(h, r().change);
			}), S(e, t);
		};
		y(v, (e) => {
			r().earlier !== null && e(x);
		});
		var C = L(v, 2), w = (e) => {
			var t = ks(), n = P(t), i = H(n, !0), a = L(n), o = H(a, !0);
			p(t), V(() => {
				u(i, f().tileBarTotal), u(o, r().total);
			}), S(e, t);
		};
		y(C, (e) => {
			r().total !== null && e(w);
		});
		var T = L(C, 2), D = (e) => {
			var t = As(), n = H(t, !0);
			V(() => u(n, r().hint)), S(e, t);
		};
		y(T, (e) => {
			r().hint && e(D);
		}), p(t), V(() => u(i, r().title)), S(e, t);
	};
	return y(A, (e) => {
		r() && e(j);
	}), p(T), D(T, (e) => q(g, e), () => E(g)), V(() => k = z(T, "", k, {
		left: `${E(v).left ?? ""}px`,
		top: `${E(v).top ?? ""}px`
	})), S(e, T), s(C);
}
F(Ps, {
	model: {},
	anchor: {},
	side: {},
	line: {},
	text: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/DataTable.svelte
var Fs = C("<caption class=\"sr svelte-1rlplzt\"> </caption>"), Is = C("<th scope=\"col\" class=\"svelte-1rlplzt\"> </th>"), Ls = C("<th scope=\"row\" class=\"svelte-1rlplzt\"> </th>"), Rs = C("<td class=\"svelte-1rlplzt\"> </td>"), zs = C("<tr class=\"svelte-1rlplzt\"></tr>"), Bs = C("<table part=\"table\" class=\"svelte-1rlplzt\"><!><thead><tr></tr></thead><tbody class=\"svelte-1rlplzt\"></tbody></table>"), Vs = C("<div class=\"box svelte-1rlplzt\"><!></div>"), Hs = {
	hash: "svelte-1rlplzt",
	code: ".box.svelte-1rlplzt {display:flex;flex:0 1 auto;flex-direction:column;min-height:0;max-width:100%;}.sr.svelte-1rlplzt {position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}table.svelte-1rlplzt {width:100%;border-collapse:collapse;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;}th.svelte-1rlplzt, td.svelte-1rlplzt {padding:4px 8px;border-bottom:1px solid var(--k-line);text-align:end;white-space:nowrap;}th.svelte-1rlplzt {color:var(--k-muted);font-weight:600;}tbody.svelte-1rlplzt th:where(.svelte-1rlplzt) {color:var(--k-fg);font-weight:400;}td.svelte-1rlplzt {color:var(--k-fg);}th.svelte-1rlplzt:first-child {text-align:start;}tbody.svelte-1rlplzt tr:where(.svelte-1rlplzt):last-child > :where(.svelte-1rlplzt) {border-bottom:0;}"
};
function Us(e, t) {
	m(t, !0), c(e, Hs);
	let n = w(t, "head", 7), r = w(t, "rows", 7), i = w(t, "label", 7);
	var l = {
		get head() {
			return n();
		},
		set head(e) {
			n(e), _();
		},
		get rows() {
			return r();
		},
		set rows(e) {
			r(e), _();
		},
		get label() {
			return i();
		},
		set label(e) {
			i(e), _();
		}
	}, d = Vs(), f = P(d);
	{
		let e = o(() => i() || null);
		he(f, {
			axis: "both",
			get label() {
				return E(e);
			},
			children: (e, t) => {
				var o = Bs(), s = P(o), c = (e) => {
					var t = Fs(), n = H(t, !0);
					V(() => u(n, i())), S(e, t);
				};
				y(s, (e) => {
					i() && e(c);
				});
				var l = L(s), d = P(l);
				a(d, 21, n, b, (e, t) => {
					var n = Is(), r = H(n, !0);
					V(() => u(r, E(t))), S(e, n);
				}), p(d), p(l);
				var f = L(l);
				a(f, 21, r, b, (e, t) => {
					var n = zs();
					a(n, 21, () => E(t), b, (e, t, n) => {
						var r = x(), i = W(r), a = (e) => {
							var n = Ls(), r = H(n, !0);
							V(() => u(r, E(t))), S(e, n);
						}, o = (e) => {
							var n = Rs(), r = H(n, !0);
							V(() => u(r, E(t))), S(e, n);
						};
						y(i, (e) => {
							n === 0 ? e(a) : e(o, -1);
						}), S(e, r);
					}), p(n), S(e, n);
				}), p(f), p(o), S(e, o);
			},
			$$slots: { default: !0 }
		});
	}
	return p(d), S(e, d), s(l);
}
F(Us, {
	head: {},
	rows: {},
	label: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Legend.svelte
var Ws = C("<button type=\"button\" part=\"legend-item\"><!> </button>"), Gs = C("<span class=\"item slice svelte-1kw4d6\" part=\"legend-item\"><!> <span class=\"detail svelte-1kw4d6\"> </span></span>"), Ks = C("<span class=\"item plain svelte-1kw4d6\" part=\"legend-item\"><!> </span>"), qs = C("<div class=\"legend svelte-1kw4d6\" part=\"legend\"></div>"), Js = {
	hash: "svelte-1kw4d6",
	code: ".legend.svelte-1kw4d6 {display:flex;flex-wrap:wrap;gap:0 12px;font-size:12px;line-height:18px;}.item.svelte-1kw4d6 {display:inline-flex;align-items:center;gap:6px;min-height:24px;min-width:0;margin:0;padding:0 4px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;}.plain.svelte-1kw4d6, .detail.svelte-1kw4d6 {color:var(--k-muted);}.detail.svelte-1kw4d6 {font-variant-numeric:tabular-nums;white-space:nowrap;}\n  /* A figure that does not fit beside its slice's name goes under it whole, not broken between its value and its share. */.slice.svelte-1kw4d6 {flex-wrap:wrap;}button.item.svelte-1kw4d6 {cursor:pointer;-webkit-tap-highlight-color:transparent;}button.item.svelte-1kw4d6:hover {background:var(--k-hover);}button.item.svelte-1kw4d6:focus-visible {outline:2px solid var(--k-primary);outline-offset:1px;}.off.svelte-1kw4d6 {color:var(--k-muted);}"
};
function Ys(e, n) {
	m(n, !0), c(e, Js);
	let r = w(n, "model", 7), i = w(n, "items", 7), l = w(n, "plain", 7), f = w(n, "hidden", 7), h = w(n, "text", 7), g = w(n, "onisolate", 7), C = w(n, "onemphasis", 7), T = o(() => r().type === "line"), D = o(() => r().series.length);
	function O(e) {
		switch (e.kind) {
			case "target": return { shape: E(T) ? "dashed" : "rule" };
			case "running": return { shape: "ink" };
			case "filled": return {
				shape: E(T) ? "hollow" : "outline",
				color: r().series[0]?.color ?? null
			};
			case "earlier": return {
				shape: E(T) ? "line" : "box",
				color: e.color,
				pattern: e.pattern,
				faint: !0
			};
			default: return {
				shape: E(T) ? "line" : "box",
				color: e.color,
				pattern: e.pattern,
				faint: e.series !== null && f().has(e.series)
			};
		}
	}
	var k = {
		get model() {
			return r();
		},
		set model(e) {
			r(e), _();
		},
		get items() {
			return i();
		},
		set items(e) {
			i(e), _();
		},
		get plain() {
			return l();
		},
		set plain(e) {
			l(e), _();
		},
		get hidden() {
			return f();
		},
		set hidden(e) {
			f(e), _();
		},
		get text() {
			return h();
		},
		set text(e) {
			h(e), _();
		},
		get onisolate() {
			return g();
		},
		set onisolate(e) {
			g(e), _();
		},
		get onemphasis() {
			return C();
		},
		set onemphasis(e) {
			C(e), _();
		}
	}, A = qs();
	return a(A, 21, i, b, (e, n) => {
		var r = x(), i = W(r), a = (e) => {
			let r = o(() => E(n).series), i = o(() => tn(f(), E(r), E(D)));
			var a = Ws();
			let s;
			var c = P(a);
			{
				let e = o(() => O(E(n)));
				ws(c, oe(() => E(e)));
			}
			var l = L(c, 1, !0);
			p(a), V((e, t) => {
				s = d(a, 1, "item svelte-1kw4d6", null, s, { off: e }), v(a, "aria-pressed", E(i)), v(a, "aria-label", t), v(a, "title", E(i) ? h().tileShowAll : void 0), u(l, E(n).label);
			}, [() => f().has(E(r)), () => t(h().tileIsolate, { series: E(n).label })]), U("click", a, () => g()(E(r))), G("pointerenter", a, () => C()(E(r))), G("pointerleave", a, () => C()(null)), G("focus", a, () => C()(E(r))), G("blur", a, () => C()(null)), S(e, a);
		}, s = (e) => {
			var t = Gs(), r = P(t);
			{
				let e = o(() => O(E(n)));
				ws(r, oe(() => E(e)));
			}
			var i = L(r), a = L(i), s = H(a, !0);
			p(t), V(() => {
				u(i, `${E(n).label ?? ""} `), u(s, E(n).detail);
			}), S(e, t);
		}, c = (e) => {
			var t = Ks(), r = P(t), i = (e) => {
				{
					let t = o(() => O(E(n)));
					ws(e, oe(() => E(t)));
				}
			};
			y(r, (e) => {
				E(n).kind !== "formula" && e(i);
			});
			var a = L(r, 1, !0);
			p(t), V(() => u(a, E(n).label)), S(e, t);
		};
		y(i, (e) => {
			!l() && E(n).kind === "series" && E(n).series !== null && E(D) > 1 ? e(a) : E(n).kind === "slice" ? e(s, 1) : e(c, -1);
		}), S(e, r);
	}), p(A), S(e, A), s(k);
}
K(["click"]), F(Ys, {
	model: {},
	items: {},
	plain: {},
	hidden: {},
	text: {},
	onisolate: {},
	onemphasis: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/ChartView.svelte
var Xs = C("<div class=\"state svelte-9uxzig\" part=\"state\"><p class=\"lead svelte-9uxzig\"> </p></div>"), Zs = C("<div class=\"chart svelte-9uxzig\"></div>"), Qs = C("<!> <!> <!>", 1), $s = {
	hash: "svelte-9uxzig",
	code: ".state.svelte-9uxzig {position:relative;display:grid;gap:4px;padding:16px 0;}.state.svelte-9uxzig p:where(.svelte-9uxzig) {margin:0;}.lead.svelte-9uxzig {font-weight:500;}.chart.svelte-9uxzig {position:relative;display:flex;flex-grow:1;flex-shrink:1;flex-direction:column;min-width:0;}"
};
function ec(e, t) {
	m(t, !0), c(e, $s);
	let n = w(t, "panels", 7), r = w(t, "table", 7), i = w(t, "text", 7), l = w(t, "locale", 7), d = w(t, "label", 7), f = w(t, "host", 7), h = /* @__PURE__ */ new Set(), g = O(void 0), v = O(null), b = O(h), C = O(null), T = O(null), k = null, A = o(() => n()[0]), M = o(() => n().length > 1), N = o(() => ze(E(A).type)), F = o(() => E(A).type === "bar"), I = o(() => E(M) ? E(F) ? Math.max(120, 28 * E(A).buckets.length + 40) : 160 : E(F) ? Math.max(160, 28 * E(A).buckets.length + 40) : 240), R = o(() => Math.max(64, E(F) ? 16 * E(A).buckets.length + 24 : 0)), B = o(() => E(v) ? {
		width: E(v).width,
		height: Math.max(E(R), E(v).height / n().length)
	} : {
		width: 480,
		height: E(I)
	}), U = o(() => E(M) ? zo(n(), E(b)) : void 0), ee = o(() => n().map((e, t) => E(M) ? {
		valueGutter: E(U),
		categoryLabels: E(F) || t === n().length - 1,
		unitLabel: e.unitLabel
	} : void 0)), te = o(() => _t(n())), G = o(() => r() ? xt(n(), E(b), i(), l() ?? void 0) : null), ne = o(() => E(C) ? n()[E(C).panel] : void 0), K = o(() => E(C) && E(ne) ? sn(E(ne), E(C).bucket, E(b), i(), E(ne).drill, l() ?? void 0) : null);
	j(() => {
		let e = n(), t = k;
		e !== t && (k = e, t && re(() => {
			q(b, e.length > 1 ? h : an(E(b), t[0], e[0])), q(C, null), q(T, null);
		}));
	}), j(() => {
		r() && q(C, null);
	}), ae(() => {
		let e = E(g);
		if (!e || typeof ResizeObserver > "u") return;
		let t = new ResizeObserver((e) => {
			let t = e[e.length - 1]?.contentRect;
			q(v, t && t.width > 0 ? {
				width: t.width,
				height: t.height
			} : null, !0);
		});
		return t.observe(e), () => t.disconnect();
	});
	function ie(e, t) {
		t ? q(C, {
			panel: e,
			...t
		}) : E(C)?.panel === e && q(C, null);
	}
	var oe = {
		get panels() {
			return n();
		},
		set panels(e) {
			n(e), _();
		},
		get table() {
			return r();
		},
		set table(e) {
			r(e), _();
		},
		get text() {
			return i();
		},
		set text(e) {
			i(e), _();
		},
		get locale() {
			return l();
		},
		set locale(e) {
			l(e), _();
		},
		get label() {
			return d();
		},
		set label(e) {
			d(e), _();
		},
		get host() {
			return f();
		},
		set host(e) {
			f(e), _();
		}
	}, se = x(), ce = W(se), le = (e) => {
		var t = Xs(), n = P(t), r = H(n, !0);
		p(t), V(() => u(r, i().tileNoBuckets)), S(e, t);
	}, ue = (e) => {
		var t = Qs(), r = W(t), s = (e) => {
			{
				let t = o(() => d() || E(A).splitLabel);
				Us(e, {
					get head() {
						return E(G).head;
					},
					get rows() {
						return E(G).rows;
					},
					get label() {
						return E(t);
					}
				});
			}
		}, c = (e) => {
			var t = Zs();
			let r;
			a(t, 23, n, (e, t) => `${n().length}:${t}`, (e, t, n) => {
				{
					let r = o(() => E(C)?.panel === E(n) ? E(C).bucket : null);
					bs(e, {
						get model() {
							return E(t);
						},
						get size() {
							return E(B);
						},
						get options() {
							return E(ee)[E(n)];
						},
						get hidden() {
							return E(b);
						},
						get emphasis() {
							return E(T);
						},
						get active() {
							return E(r);
						},
						get text() {
							return i();
						},
						get label() {
							return d();
						},
						get host() {
							return f();
						},
						ontip: (e) => ie(E(n), e)
					});
				}
			}), p(t), D(t, (e) => q(g, e), () => E(g)), V(() => r = z(t, "", r, {
				"flex-basis": `${E(I) * n().length}px`,
				"min-height": `${E(R) * n().length}px`
			})), S(e, t);
		};
		y(r, (e) => {
			E(G) ? e(s) : e(c, -1);
		});
		var l = L(r, 2), u = (e) => {
			Ys(e, {
				get model() {
					return E(A);
				},
				get items() {
					return E(te);
				},
				get plain() {
					return E(M);
				},
				get hidden() {
					return E(b);
				},
				get text() {
					return i();
				},
				onisolate: (e) => q(b, nn(E(b), e, E(A).series.length)),
				onemphasis: (e) => q(T, e, !0)
			});
		};
		y(l, (e) => {
			E(te).length > +!E(N) && e(u);
		});
		var m = L(l, 2);
		{
			let e = o(() => E(C)?.anchor ?? null), t = o(() => E(F) ? "beside" : "above"), n = o(() => E(A).type === "line");
			Ps(m, {
				get model() {
					return E(K);
				},
				get anchor() {
					return E(e);
				},
				get side() {
					return E(t);
				},
				get line() {
					return E(n);
				},
				get text() {
					return i();
				},
				get host() {
					return f();
				}
			});
		}
		S(e, t);
	};
	return y(ce, (e) => {
		E(A).empty ? e(le) : e(ue, -1);
	}), S(e, se), s(oe);
}
F(ec, {
	panels: {},
	table: {},
	text: {},
	locale: {},
	label: {},
	host: {}
}, [], [], { mode: "open" });
var tc = /\[((?:\\[\s\S]|[^\]\\[\r\n])*)\]\(mention:[^)]*\)/g, nc = /^\d{4}-\d{2}-\d{2}T/, rc = 8, ic = /* @__PURE__ */ new Map([
	["approved", "emerald"],
	["active", "emerald"],
	["draft", "amber"],
	["pending", "amber"],
	["suspended", "rose"],
	["inactive", "rose"]
]), ac = /* @__PURE__ */ new Map();
function oc(e, t, n) {
	let r = `${e}|${t ?? ""}`, i = ac.get(r);
	return i || ac.set(r, i = n()), i;
}
var sc = (e) => oc("day", e, () => new Intl.DateTimeFormat(e, { dateStyle: "medium" })), cc = (e) => oc("moment", e, () => new Intl.DateTimeFormat(e, {
	dateStyle: "medium",
	timeStyle: "short"
})), lc = (e) => oc("digits", e, () => new Intl.NumberFormat(e, { maximumSignificantDigits: 15 })), uc = (e) => oc("count", e, () => new Intl.NumberFormat(e));
function dc(e) {
	let t = e?.format_options;
	if (typeof t != "object" || !t || Array.isArray(t) || t.bar !== !0) return null;
	let n = t.bar_bands, r = [];
	if (Array.isArray(n)) for (let e of n) {
		if (typeof e != "object" || !e) continue;
		let { at: t, color: n } = e;
		typeof t == "number" && Number.isFinite(t) && r.push({
			at: t,
			color: ke(typeof n == "string" ? n : null)?.value ?? null
		});
	}
	return r;
}
function fc(e, t) {
	let n = t ? ie(t) : void 0, r = null, i = null;
	if (t && (n === "enum" || n === "multi_select")) {
		r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
		for (let e of se(t)) {
			e.label && r.set(e.value, e.label);
			let t = ke(e.color);
			t && i.set(e.value, t.value);
		}
	}
	return {
		key: e,
		field: t,
		type: n,
		labels: r,
		colors: i,
		bands: n === "number" ? dc(t) : null,
		rating: n === "number" && t?.format === "rating"
	};
}
var pc = (e) => Array.isArray(e) ? e : [e];
function mc(e) {
	try {
		return JSON.stringify(e) ?? String(e);
	} catch {
		return String(e);
	}
}
function hc(e, t, n) {
	if (e == null) return "";
	if (typeof e == "string") return e;
	if (typeof e == "number") return lc(n).format(e);
	if (typeof e == "boolean") return e ? t.tileYes : t.tileNo;
	if (Array.isArray(e)) return e.map((e) => hc(e, t, n)).join(", ");
	let r = typeof e == "object" ? mc(e) : String(e);
	return r.length > 80 ? `${r.slice(0, 79)}…` : r;
}
var gc = (e) => e.replace(/\\([\s\S])/g, "$1"), _c = (e) => e.includes("](mention:") ? e.replace(tc, (e, t) => gc(t)) : e;
function vc(e, t) {
	return e && Object.hasOwn(e, t) ? e[t] : void 0;
}
function yc(e, t, n, r) {
	return typeof e == "string" ? t?.get(e) ?? e : hc(e, n, r);
}
function bc(e, t) {
	let n = vc(t, e);
	return typeof n == "string" && n !== "" ? {
		label: n,
		resolved: !0
	} : {
		label: e,
		resolved: !1
	};
}
function xc(e, t, n, r) {
	return typeof e == "string" ? bc(e, t).label : hc(e, n, r);
}
function Sc(e, t, n, r) {
	let i = pc(n), a = i[0];
	if (typeof a != "string") return null;
	let o = vc(e.file_labels, t), s = vc(o, a), c = vc(e.file_counts, t), l = typeof c == "number" && Number.isFinite(c) ? c : i.length, u = l > 1 ? l - 1 : 0;
	return typeof s == "string" && s !== "" ? {
		name: s,
		unavailable: !1,
		more: u
	} : o ? {
		name: r.tileFileUnavailable,
		unavailable: !0,
		more: u
	} : {
		name: a.length > rc ? `${a.slice(0, rc)}…` : a,
		unavailable: !1,
		more: u
	};
}
function Cc(e, t, n, r, i) {
	let a = Sc(e, t, n, r);
	return a ? a.more > 0 ? `${a.name} +${a.more}` : a.name : hc(n, r, i);
}
function wc(e, t, n) {
	if (!e.includes("](mention:")) return null;
	let r = [], i = "", a = 0, o = (t) => {
		let n = _c(e.slice(a, t));
		n !== "" && (r.push({ text: n }), i += n);
	}, s = e.indexOf("@[");
	for (; s >= 0;) {
		let c = ye(e.slice(s));
		if (!c) {
			s = e.indexOf("@[", s + 1);
			continue;
		}
		o(s);
		let l = _e(c.ref, c.label, t.mentions, n);
		r.push({ mention: l }), i += `@${l.label}`, a = s + c.raw.length, s = e.indexOf("@[", a);
	}
	return r.length === 0 ? null : (o(e.length), {
		text: i,
		parts: r
	});
}
function Tc(e, n, r, i) {
	let { key: a, field: o, labels: s } = n, c = vc(e.body, a);
	if (c == null || c === "" || Array.isArray(c) && c.length === 0) return "";
	switch (n.type) {
		case "number": return typeof c == "number" ? T(c, o?.format, o?.format_options, i) : hc(c, r, i);
		case "boolean": return typeof c == "boolean" ? c ? r.tileYes : r.tileNo : hc(c, r, i);
		case "date": {
			let e = typeof c == "string" ? me(c.charAt(10) === "T" ? c.slice(0, 10) : c) : null;
			return e ? sc(i).format(e) : hc(c, r, i);
		}
		case "datetime": {
			let e = typeof c == "string" && nc.test(c) ? new Date(c) : null;
			return e && !Number.isNaN(e.getTime()) ? cc(i).format(e) : hc(c, r, i);
		}
		case "enum": return yc(c, s, r, i);
		case "multi_select": return pc(c).map((e) => yc(e, s, r, i)).join(", ");
		case "reference": return xc(c, vc(e.ref_labels, a), r, i);
		case "reference_list": {
			let t = vc(e.ref_labels, a);
			return pc(c).map((e) => xc(e, t, r, i)).join(", ");
		}
		case "file": return Cc(e, a, c, r, i);
		case "list": return Array.isArray(c) ? t(c.length === 1 ? r.tileItemsOne : r.tileItems, { count: uc(i).format(c.length) }) : hc(c, r, i);
		default: return typeof c == "string" ? wc(c, e, r)?.text ?? _c(c) : hc(c, r, i);
	}
}
var Ec = /\S/;
function Dc(e, t) {
	let n = t.colors?.get(e);
	if (n) return n;
	let r = ic.get(e);
	return r ? Ee[r] : null;
}
function Oc(e, t) {
	let n = t.type === "multi_select" ? pc(e) : [e];
	if (!n.every((e) => typeof e == "string")) return null;
	let r = n.map((e) => ({
		label: t.labels?.get(e) ?? e,
		color: Dc(e, t)
	})).filter((e) => Ec.test(e.label));
	return r.length ? r : null;
}
function kc(e, t) {
	return !t || !Number.isFinite(e) ? null : {
		percent: Math.min(Math.max(e, 0), 100),
		color: t.find((t) => e >= t.at)?.color ?? null
	};
}
function Ac(e, t, n) {
	let r = pc(n);
	if (!r.every((e) => typeof e == "string")) return null;
	let i = vc(e.ref_labels, t), a = r.map((e) => bc(e, i)).filter((e) => Ec.test(e.label));
	return a.length ? a : null;
}
function jc(e, t, n, r) {
	let i = Tc(e, t, n, r);
	if (!Ec.test(i)) return {
		kind: "text",
		text: "—"
	};
	let a = vc(e.body, t.key);
	switch (t.type) {
		case "enum":
		case "multi_select": {
			let e = Oc(a, t);
			return e ? {
				kind: "options",
				text: i,
				options: e
			} : {
				kind: "text",
				text: i
			};
		}
		case "boolean": return typeof a == "boolean" ? {
			kind: "boolean",
			text: i,
			value: a
		} : {
			kind: "text",
			text: i
		};
		case "number": return typeof a == "number" ? {
			kind: "number",
			text: i,
			bar: t.rating ? null : kc(a, t.bands),
			rating: t.rating
		} : {
			kind: "text",
			text: i
		};
		case "reference":
		case "reference_list": {
			let n = Ac(e, t.key, a);
			return n ? {
				kind: "refs",
				text: i,
				refs: n
			} : {
				kind: "text",
				text: i
			};
		}
		case "file": {
			let r = Sc(e, t.key, a, n);
			return r ? {
				kind: "file",
				text: i,
				...r
			} : {
				kind: "text",
				text: i
			};
		}
		default: {
			let t = typeof a == "string" ? wc(a, e, n) : null;
			return t ? {
				kind: "rich",
				text: i,
				parts: t.parts
			} : {
				kind: "text",
				text: i
			};
		}
	}
}
function Mc(e, t, n, r, i) {
	let a = new Map((n ?? []).map((e) => [e.key, e])), o = t.map((e) => fc(e.key, a.get(e.key))), s = /* @__PURE__ */ new Set(), c = [];
	return e.forEach((e, t) => {
		let n = typeof e.id == "string" ? e.id : "", a = n === "" ? `#${t}` : n;
		if (s.has(a)) return;
		s.add(a);
		let l = typeof e.entity_id == "string" ? e.entity_id : "";
		c.push({
			key: a,
			record: n,
			entity: l,
			cells: o.map((t) => jc(e, t, r, i))
		});
	}), {
		head: t.map((e) => e.label),
		rows: c
	};
}
//#endregion
//#region src/kit/tile/ListTable.svelte
var Nc = C("<span part=\"badge\" class=\"af-chip svelte-17ihsrp\"> </span>"), Pc = C("<span part=\"badge\" class=\"af-chip neutral svelte-17ihsrp\"> </span>"), Fc = C("<span class=\"chips svelte-17ihsrp\"></span>"), Ic = g("<svg class=\"mark check svelte-17ihsrp\" viewBox=\"0 0 16 16\" width=\"14\" height=\"14\" role=\"img\"><path d=\"M3 8.5l3.2 3.2L13 4.5\"></path></svg>"), Lc = C("<span class=\"mark none svelte-17ihsrp\" role=\"img\">—</span>"), Rc = C("<span part=\"ref\"> </span>"), zc = C("<span class=\"more svelte-17ihsrp\"> </span>"), Bc = C("<span class=\"chips svelte-17ihsrp\"><span part=\"file\"><svg class=\"icon clip svelte-17ihsrp\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48\"></path></svg> <span class=\"name\"> </span></span> <!></span>"), Vc = C("<span class=\"af-avatar mention-avatar svelte-17ihsrp\" aria-hidden=\"true\"> </span>"), Hc = g("<svg part=\"mention-icon\" class=\"icon svelte-17ihsrp\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg>"), Uc = C("<span part=\"mention\" class=\"mention svelte-17ihsrp\"><!> <span class=\"label svelte-17ihsrp\"> </span></span>"), Wc = C("<span class=\"bar svelte-17ihsrp\"><span class=\"track svelte-17ihsrp\" aria-hidden=\"true\"><span class=\"fill svelte-17ihsrp\"></span></span> <span class=\"figure svelte-17ihsrp\"> </span></span>"), Gc = C("<span class=\"rating svelte-17ihsrp\"> </span>"), Kc = C("<caption class=\"sr svelte-17ihsrp\"> </caption>"), qc = C("<th scope=\"col\" class=\"svelte-17ihsrp\"> </th>"), Jc = C("<button type=\"button\" class=\"svelte-17ihsrp\"><!></button>"), Yc = C("<td class=\"svelte-17ihsrp\"><!></td>"), Xc = C("<tr class=\"svelte-17ihsrp\"></tr>"), Zc = C("<table part=\"list\"><!><thead><tr></tr></thead><tbody class=\"svelte-17ihsrp\"></tbody></table>"), Qc = C("<div class=\"ring svelte-17ihsrp\"><!></div>"), $c = {
	hash: "svelte-17ihsrp",
	code: "\n  /* The region's focus ring is drawn over it by a box that does not scroll, inside the region's edge. Outside the edge, a\n     host that takes the frame's padding away, as a dashboard card does, leaves it no room, and the frame scrolls, so it\n     would be cut off; as the viewport's own outline, inset, the sticky header row paints over its top, isolated viewport or\n     not. Isolated, so the ring rises above nothing outside the tile. */.ring.svelte-17ihsrp {position:relative;isolation:isolate;display:flex;flex:1 1 auto;flex-direction:column;min-height:0;min-width:0;max-width:100%;}.ring.svelte-17ihsrp > [data-scope='scroll-area'][data-part='root'] > [data-part='viewport']:focus-visible {outline:none;box-shadow:none;}.ring.svelte-17ihsrp:has([data-scope='scroll-area'][data-part='viewport']:focus-visible)::after {content:'';position:absolute;inset:0;z-index:1;border:2px solid var(--k-primary);pointer-events:none;}.sr.svelte-17ihsrp {position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}table.svelte-17ihsrp {width:100%;border-collapse:collapse;font-size:12px;line-height:18px;}th.svelte-17ihsrp, td.svelte-17ihsrp {padding:4px 8px;border-bottom:1px solid var(--k-line);text-align:start;white-space:nowrap;}th.svelte-17ihsrp {position:sticky;top:0;border-bottom:0;background:var(--k-surface);box-shadow:inset 0 -1px 0 var(--k-line);color:var(--k-muted);font-weight:600;}td.svelte-17ihsrp {color:var(--k-fg);}tbody.svelte-17ihsrp tr:where(.svelte-17ihsrp):last-child > td:where(.svelte-17ihsrp) {border-bottom:0;}.open.svelte-17ihsrp tbody:where(.svelte-17ihsrp) tr[data-record]:where(.svelte-17ihsrp) {cursor:pointer;}.open.svelte-17ihsrp tbody:where(.svelte-17ihsrp) tr[data-record]:where(.svelte-17ihsrp):hover {background:var(--k-hover);}button.svelte-17ihsrp {margin:0;padding:0;border:0;border-radius:2px;background:none;color:inherit;font:inherit;text-align:start;cursor:pointer;-webkit-tap-highlight-color:transparent;}button.svelte-17ihsrp:hover {text-decoration:underline;text-decoration-color:var(--k-muted);text-underline-offset:3px;}button.svelte-17ihsrp:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}.chips.svelte-17ihsrp {display:inline-flex;align-items:center;gap:4px;vertical-align:middle;}\n  /* A badge at the table's own density, so a row with one is no taller than a row with none. */.af-chip.svelte-17ihsrp {padding-block:0;}.mark.svelte-17ihsrp {display:inline-block;vertical-align:middle;}.check.svelte-17ihsrp {fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;color:var(--k-success);}.none.svelte-17ihsrp {color:var(--k-muted);}.bar.svelte-17ihsrp {display:flex;align-items:center;gap:8px;min-width:7.5rem;}.track.svelte-17ihsrp {flex:1 1 auto;height:5px;overflow:hidden;border-radius:999px;background:color-mix(in oklab, var(--k-fg) 12%, var(--k-surface));}.fill.svelte-17ihsrp {display:block;height:100%;border-radius:999px;background:color-mix(in oklab, var(--k-fg) 40%, var(--k-surface));}.figure.svelte-17ihsrp {flex:none;min-width:3.5rem;text-align:end;font-variant-numeric:tabular-nums;}.rating.svelte-17ihsrp {color:var(--k-warning);}\n  /* An id the server named no record for, and a file it named no file for, are chips in the muted ink. */.af-chip.raw.svelte-17ihsrp, .af-chip.unavailable.svelte-17ihsrp {--k-chip-fg: var(--k-muted);}.icon.svelte-17ihsrp {flex:none;width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;}.clip.svelte-17ihsrp {stroke-linecap:round;stroke-linejoin:round;}.more.svelte-17ihsrp {flex:none;color:var(--k-muted);font-size:11px;font-variant-numeric:tabular-nums;}\n  /* The chip the editor draws for a mention, at the table's density. */.mention.svelte-17ihsrp {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:middle;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;}.mention[data-state='restricted'].svelte-17ihsrp, .mention[data-state='deleted'].svelte-17ihsrp {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.mention[data-state='deleted'].svelte-17ihsrp .label:where(.svelte-17ihsrp) {text-decoration:line-through;}.mention-avatar.svelte-17ihsrp {width:16px;height:16px;font-size:10px;line-height:16px;}"
};
function el(n, r) {
	m(r, !0), c(n, $c);
	let i = (e, t = l) => {
		var n = x(), r = W(n), i = (e) => {
			var n = Fc();
			a(n, 21, () => t().options, b, (e, t) => {
				var n = x(), r = W(n), i = (e) => {
					var n = Nc();
					let r;
					var i = H(n, !0);
					V((e, a, o) => {
						r = z(n, "", r, {
							"background-color": e,
							color: a,
							"border-color": o
						}), u(i, E(t).label);
					}, [
						() => k(E(t).color, 14, "var(--k-surface)"),
						() => k(E(t).color, 70, "var(--k-fg)"),
						() => k(E(t).color, 35, "var(--k-surface)")
					]), S(e, n);
				}, a = (e) => {
					var n = Pc(), r = H(n, !0);
					V(() => u(r, E(t).label)), S(e, n);
				};
				y(r, (e) => {
					E(t).color ? e(i) : e(a, -1);
				}), S(e, n);
			}), p(n), S(e, n);
		}, o = (e) => {
			var n = x(), r = W(n), i = (e) => {
				var n = Ic();
				V(() => v(n, "aria-label", t().text)), S(e, n);
			}, a = (e) => {
				var n = Lc();
				V(() => v(n, "aria-label", t().text)), S(e, n);
			};
			y(r, (e) => {
				t().value ? e(i) : e(a, -1);
			}), S(e, n);
		}, s = (e) => {
			var n = Fc();
			a(n, 21, () => t().refs, b, (e, t) => {
				var n = Rc();
				let r;
				var i = H(n, !0);
				V(() => {
					r = d(n, 1, "af-chip neutral svelte-17ihsrp", null, r, { raw: !E(t).resolved }), u(i, E(t).label);
				}), S(e, n);
			}), p(n), S(e, n);
		}, c = (e) => {
			var n = Bc(), r = P(n);
			let i;
			var a = L(P(r), 2), o = H(a, !0);
			p(r);
			var s = L(r, 2), c = (e) => {
				var n = zc(), r = H(n);
				V(() => u(r, `+${t().more ?? ""}`)), S(e, n);
			};
			y(s, (e) => {
				t().more > 0 && e(c);
			}), p(n), V(() => {
				i = d(r, 1, "af-chip outline svelte-17ihsrp", null, i, { unavailable: t().unavailable }), u(o, t().name);
			}), S(e, n);
		}, f = (e) => {
			var n = x(), r = W(n);
			a(r, 17, () => t().parts, b, (e, t) => {
				var n = x(), r = W(n), i = (e) => {
					var n = Uc(), r = P(n), i = (e) => {
						var n = Vc(), r = H(n, !0);
						V((e) => u(r, e), [() => ge(E(t).mention.label)]), S(e, n);
					}, a = (e) => {
						var t = Hc(), n = H(t);
						V(() => v(n, "d", ve)), S(e, t);
					};
					y(r, (e) => {
						E(t).mention.state !== "restricted" && E(t).mention.kind === "user" ? e(i) : E(t).mention.state !== "restricted" && E(t).mention.kind === "record" && e(a, 1);
					});
					var o = L(r, 2), s = H(o, !0);
					p(n), V(() => {
						v(n, "data-kind", E(t).mention.kind), v(n, "data-state", E(t).mention.state), u(s, E(t).mention.label);
					}), S(e, n);
				}, a = (e) => {
					var n = M();
					V(() => u(n, E(t).text)), S(e, n);
				};
				y(r, (e) => {
					"mention" in E(t) ? e(i) : e(a, -1);
				}), S(e, n);
			}), S(e, n);
		}, m = (e) => {
			var n = Wc(), r = P(n), i = P(r);
			let a;
			p(r);
			var o = L(r, 2), s = H(o, !0);
			p(n), V(() => {
				a = z(i, "", a, {
					width: `${t().bar.percent ?? ""}%`,
					"background-color": t().bar.color ?? void 0
				}), u(s, t().text);
			}), S(e, n);
		}, h = (e) => {
			var n = Gc(), r = H(n, !0);
			V(() => u(r, t().text)), S(e, n);
		}, g = (e) => {
			var n = M();
			V(() => u(n, t().text)), S(e, n);
		};
		y(r, (e) => {
			t().kind === "options" ? e(i) : t().kind === "boolean" ? e(o, 1) : t().kind === "refs" ? e(s, 2) : t().kind === "file" ? e(c, 3) : t().kind === "rich" ? e(f, 4) : t().kind === "number" && t().bar ? e(m, 5) : t().kind === "number" && t().rating ? e(h, 6) : e(g, -1);
		}), S(e, n);
	}, f = w(r, "model", 7), g = w(r, "drill", 7), C = w(r, "text", 7), T = w(r, "label", 7), D = w(r, "host", 7);
	function O(t) {
		let n = (e) => e.target instanceof Element ? e.target.closest("tr[data-record]") : null, r = (t) => {
			let r = Gt(t) ? n(t) : null;
			r?.dataset.record && r.dataset.entity && e(D(), "af-open-record", {
				record: r.dataset.record,
				entity: r.dataset.entity,
				newTab: Wt(t)
			});
		}, i = (e) => {
			e.button === 1 && n(e) && e.preventDefault();
		};
		return t.addEventListener("click", r), t.addEventListener("auxclick", r), t.addEventListener("mousedown", i), () => {
			t.removeEventListener("click", r), t.removeEventListener("auxclick", r), t.removeEventListener("mousedown", i);
		};
	}
	let k = (e, t, n) => `color-mix(in oklab, ${e} ${t}%, ${n})`, A = o(() => t(C().tileOpenRecord, { label: f().head[0] ?? "" }));
	var j = {
		get model() {
			return f();
		},
		set model(e) {
			f(e), _();
		},
		get drill() {
			return g();
		},
		set drill(e) {
			g(e), _();
		},
		get text() {
			return C();
		},
		set text(e) {
			C(e), _();
		},
		get label() {
			return T();
		},
		set label(e) {
			T(e), _();
		},
		get host() {
			return D();
		},
		set host(e) {
			D(e), _();
		}
	}, N = Qc(), F = P(N);
	{
		let e = o(() => T() || null);
		he(F, {
			axis: "both",
			get label() {
				return E(e);
			},
			children: (e, t) => {
				var n = Zc();
				let r;
				var s = P(n), c = (e) => {
					var t = Kc(), n = H(t, !0);
					V(() => u(n, T())), S(e, t);
				};
				y(s, (e) => {
					T() && e(c);
				});
				var l = L(s), m = P(l);
				a(m, 21, () => f().head, b, (e, t) => {
					var n = qc(), r = H(n, !0);
					V(() => u(r, E(t))), S(e, n);
				}), p(m), p(l);
				var _ = L(l);
				a(_, 21, () => f().rows, (e) => e.key, (e, t) => {
					let n = o(() => g() && E(t).record !== "" && E(t).entity !== "");
					var r = Xc();
					a(r, 21, () => E(t).cells, b, (e, t, r) => {
						var a = Yc(), o = P(a), s = (e) => {
							var n = Jc(), r = P(n);
							i(r, () => E(t)), p(n), V(() => v(n, "aria-label", E(t).text === "—" ? E(A) : void 0)), S(e, n);
						}, c = (e) => {
							i(e, () => E(t));
						};
						y(o, (e) => {
							E(n) && r === 0 ? e(s) : e(c, -1);
						}), p(a), S(e, a);
					}), p(r), V(() => {
						v(r, "data-record", E(n) ? E(t).record : void 0), v(r, "data-entity", E(n) ? E(t).entity : void 0);
					}), S(e, r);
				}), p(_), h(_, () => g() ? O : void 0), p(n), V(() => r = d(n, 1, "svelte-17ihsrp", null, r, { open: g() })), S(e, n);
			},
			$$slots: { default: !0 }
		});
	}
	return p(N), S(n, N), s(j);
}
F(el, {
	model: {},
	drill: {},
	text: {},
	label: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/number.ts
var tl = 3;
function nl(e, n, r, i) {
	let a = Se(n.population, e.cap_bound);
	if (a?.kind === "sample") return [a.cap === null ? r.tileCapIncomplete : t(r.tileCapSample, { cap: Je(a.cap, i) })];
	let o = t(e.population === 1 ? r.tileRecordsOne : r.tileRecords, { count: Je(e.population, i) });
	return a ? [o, a.kind === "at_least" ? r.tileCapAtLeast : r.tileCapAtMost] : [o];
}
function rl(e, n, r, i, a, o) {
	let s = e.kind === "number" || e.kind === "chart" ? e.transform?.target : null, c = r?.target ?? (s?.kind === "constant" ? s.value : null);
	if (c == null) return null;
	let l = t(a.tileGoal, { target: R(n, c, i, o) }), u = k(n, i, r?.value ?? null, c, o);
	if (!u) return {
		text: l,
		tone: "none"
	};
	if (u.met) return {
		text: `${l} · ${a.tileGoalMet}`,
		tone: "met"
	};
	let d = u.points ? t(a.tilePoints, { value: u.distance }) : u.distance;
	return {
		text: `${l} · ${t(u.short ? a.tileGoalShort : a.tileGoalOver, { distance: d })}`,
		tone: u.short ? "short" : "over"
	};
}
function il(e, t, n, r, i) {
	let a = t?.comparison;
	if (!a) return null;
	let o = `${r.tileVsEarlier}: `;
	if (a.previous == null) return o + r.tileNoEarlier;
	let s = [R(e, a.previous, n, i)];
	if (a.difference != null) {
		let t = a.difference < 0 ? "−" : "+";
		s.push(t + R(e, Math.abs(a.difference), n, i));
	}
	let c = ee(a.percent_change, i);
	return c !== null && s.push(c), o + s.join(" · ");
}
function al(e, t, n, r, i) {
	let a = (e.kind === "number" || e.kind === "chart") && e.drill_disabled === !0, o = t.population;
	return !i || a || t.outcome !== "ok" || !o?.drill ? null : {
		drill: o.drill,
		measure: Ke(n),
		bucket: null,
		segment: null,
		label: ce(n, r),
		count: o.count,
		other: !1
	};
}
function ol(e, t, n, r, i, a) {
	let o = n ?? void 0, s = Ge(e, t), c = ue(s) ?? {}, l = (n, c) => {
		let l = Pe(t, n), u = A(n, o), d = l?.value ?? null;
		return {
			measure: Ke(n),
			label: s.length > 1 ? ce(n, o) : null,
			value: R(n, d, u, i),
			muted: d === null,
			meta: [...l && d !== null ? nl(l, t, r, i) : [r.tileNoValue], ...Xe(l, r, i)],
			goal: c ? rl(e, n, l, u, r, i) : null,
			comparison: il(n, l, u, r, i),
			drill: c ? al(e, t, n, o, a) : null
		};
	};
	return {
		primary: l(c, !0),
		secondaries: s.filter((e) => e !== c).slice(0, tl).map((e) => l(e, !1))
	};
}
//#endregion
//#region src/kit/tile/NumberFigure.svelte
var sl = C("<div class=\"label svelte-184f7i6\" part=\"label\"> </div>"), cl = C("<button type=\"button\" part=\"value\"> </button>"), ll = C("<div part=\"value\"> </div>"), ul = C("<div class=\"goal svelte-184f7i6\" part=\"goal\"> </div>"), dl = C("<div class=\"comparison svelte-184f7i6\" part=\"comparison\"> </div>"), fl = C("<!> <!> <div class=\"meta svelte-184f7i6\" part=\"meta\"> </div> <!> <!>", 1), pl = C("<div class=\"figure svelte-184f7i6\" part=\"secondary\"><!></div>"), ml = C("<div class=\"secondaries svelte-184f7i6\"></div>"), hl = C("<div class=\"figure svelte-184f7i6\" part=\"figure\"><!></div> <!>", 1), gl = {
	hash: "svelte-184f7i6",
	code: ".figure.svelte-184f7i6 {display:grid;align-content:start;gap:2px;min-width:0;}.label.svelte-184f7i6, .meta.svelte-184f7i6, .comparison.svelte-184f7i6 {color:var(--k-muted);font-size:12px;line-height:18px;overflow-wrap:anywhere;}.goal.svelte-184f7i6 {font-size:12px;line-height:18px;overflow-wrap:anywhere;}.value.svelte-184f7i6 {margin:0;padding:0;border:0;background:none;color:var(--k-fg);font:inherit;font-size:32px;font-weight:600;line-height:38px;font-variant-numeric:tabular-nums;text-align:start;overflow-wrap:anywhere;}.value.small.svelte-184f7i6 {font-size:20px;line-height:26px;}.value.muted.svelte-184f7i6 {color:var(--k-muted);}button.value.svelte-184f7i6 {justify-self:start;border-radius:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;}button.value.svelte-184f7i6:hover {text-decoration:underline;text-decoration-color:var(--k-muted);text-underline-offset:4px;}button.value.svelte-184f7i6:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}.secondaries.svelte-184f7i6 {display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px 16px;padding-top:12px;border-top:1px solid var(--k-line);}"
};
function _l(n, r) {
	m(r, !0), c(n, gl);
	let i = (e, t = l, n = l) => {
		var r = fl(), i = W(r), a = (e) => {
			var n = sl(), r = H(n, !0);
			V(() => u(r, t().label)), S(e, n);
		};
		y(i, (e) => {
			t().label && e(a);
		});
		var o = L(i, 2), s = (e) => {
			var r = cl();
			let i;
			var a = H(r, !0);
			V((e) => {
				i = d(r, 1, "value svelte-184f7i6", null, i, {
					muted: t().muted,
					small: n()
				}), v(r, "title", e), u(a, t().value);
			}, [() => x(t())]), U("click", r, (e) => C(t(), e)), G("auxclick", r, (e) => C(t(), e)), U("mousedown", r, function(...e) {
				Kt?.apply(this, e);
			}), S(e, r);
		}, c = (e) => {
			var r = ll();
			let i;
			var a = H(r, !0);
			V(() => {
				i = d(r, 1, "value svelte-184f7i6", null, i, {
					muted: t().muted,
					small: n()
				}), u(a, t().value);
			}), S(e, r);
		};
		y(o, (e) => {
			t().drill ? e(s) : e(c, -1);
		});
		var f = L(o, 2), p = H(f, !0), m = L(f, 2), h = (e) => {
			var n = ul(), r = H(n, !0);
			V(() => {
				v(n, "data-tone", t().goal.tone), u(r, t().goal.text);
			}), S(e, n);
		};
		y(m, (e) => {
			t().goal && e(h);
		});
		var g = L(m, 2), _ = (e) => {
			var n = dl(), r = H(n, !0);
			V(() => u(r, t().comparison)), S(e, n);
		};
		y(g, (e) => {
			t().comparison && e(_);
		}), V((e) => u(p, e), [() => t().meta.join(" · ")]), S(e, r);
	}, o = w(r, "model", 7), f = w(r, "text", 7), h = w(r, "locale", 7), g = w(r, "host", 7);
	function x(e) {
		let n = e.drill?.count ?? 0;
		return t(n === 1 ? f().tileOpenRecordsOne : f().tileOpenRecords, { count: Je(n, h() ?? void 0) });
	}
	function C(t, n) {
		t.drill && Gt(n) && e(g(), "af-drill", {
			...t.drill,
			newTab: Wt(n)
		});
	}
	var T = {
		get model() {
			return o();
		},
		set model(e) {
			o(e), _();
		},
		get text() {
			return f();
		},
		set text(e) {
			f(e), _();
		},
		get locale() {
			return h();
		},
		set locale(e) {
			h(e), _();
		},
		get host() {
			return g();
		},
		set host(e) {
			g(e), _();
		}
	}, D = hl(), O = W(D);
	i(P(O), () => o().primary, () => !1), p(O);
	var k = L(O, 2), A = (e) => {
		var t = ml();
		a(t, 21, () => o().secondaries, b, (e, t) => {
			var n = pl(), r = P(n);
			i(r, () => E(t), () => !0), p(n), S(e, n);
		}), p(t), S(e, t);
	};
	return y(k, (e) => {
		o().secondaries.length && e(A);
	}), S(n, D), s(T);
}
K(["click", "mousedown"]), F(_l, {
	model: {},
	text: {},
	locale: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Verdict.svelte
var vl = g("<path d=\"M3 8.5 6.5 12 13 4.5\"></path>"), yl = g("<path d=\"M8 2.5 14.5 13.5H1.5Z\"></path><path d=\"M8 6.5v3.2M8 11.8v.01\"></path>", 1), bl = g("<circle cx=\"8\" cy=\"8\" r=\"6.25\"></circle><path d=\"M8 7.25V11.5M8 4.8v.01\"></path>", 1), xl = C("<div class=\"verdict svelte-dr6ch4\" part=\"verdict\"><svg class=\"icon svelte-dr6ch4\" viewBox=\"0 0 16 16\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><!></svg> <span class=\"words svelte-dr6ch4\"> </span></div>"), Sl = {
	hash: "svelte-dr6ch4",
	code: ".verdict.svelte-dr6ch4 {display:flex;align-items:flex-start;gap:6px;min-width:0;color:var(--k-muted);font-size:12px;line-height:18px;}.verdict[data-tone='warning'].svelte-dr6ch4 {color:var(--k-fg);}.icon.svelte-dr6ch4 {flex:none;margin-top:2px;}.words.svelte-dr6ch4 {min-width:0;overflow-wrap:anywhere;}"
};
function Cl(e, t) {
	m(t, !0), c(e, Sl);
	let n = w(t, "model", 7);
	var r = {
		get model() {
			return n();
		},
		set model(e) {
			n(e), _();
		}
	}, i = xl(), a = P(i);
	let o;
	var l = P(a), d = (e) => {
		var t = vl();
		S(e, t);
	}, h = (e) => {
		var t = yl();
		f(), S(e, t);
	}, g = (e) => {
		var t = bl();
		f(), S(e, t);
	};
	y(l, (e) => {
		n().kind === "partitions" ? e(d) : n().kind === "fans_out" ? e(h, 1) : e(g, -1);
	}), p(a);
	var b = L(a, 2), x = H(b, !0);
	return p(i), V(() => {
		v(i, "data-verdict", n().kind), v(i, "data-tone", n().tone), o = z(a, "", o, { color: n().tone === "warning" ? "var(--k-warning)" : void 0 }), u(x, n().text);
	}), S(e, i), s(r);
}
F(Cl, { model: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/TileView.svelte
var wl = C("<div class=\"title svelte-m2ey2a\" part=\"title\"> </div>"), Tl = C("<button type=\"button\" class=\"af-button secondary sm toggle svelte-m2ey2a\" part=\"table-toggle\"> </button>"), El = C("<div class=\"head svelte-m2ey2a\" part=\"head\"><!> <!></div>"), Dl = C("<div class=\"state svelte-m2ey2a\" part=\"state\"><p class=\"lead svelte-m2ey2a\"> </p> <p class=\"hint svelte-m2ey2a\"> </p></div>"), Ol = C("<p class=\"hint svelte-m2ey2a\"> </p>"), kl = C("<div class=\"state svelte-m2ey2a\" part=\"state\"><p class=\"lead svelte-m2ey2a\"> </p> <!></div>"), Al = C("<div class=\"doc\"><!></div>"), jl = C("<div class=\"prose svelte-m2ey2a\" part=\"prose\"><!></div>"), Ml = C("<div class=\"state svelte-m2ey2a\" part=\"state\"><p class=\"lead svelte-m2ey2a\"> </p></div>"), Nl = C("<nav class=\"pager svelte-m2ey2a\" part=\"pager\"><button type=\"button\" class=\"af-button secondary sm\"> </button> <button type=\"button\" class=\"af-button secondary sm\"> </button></nav>"), Pl = C("<!> <!>", 1), Fl = C("<li> </li>"), Il = C("<ul class=\"notes svelte-m2ey2a\" part=\"notes\"></ul>"), Ll = C("<div class=\"frame svelte-m2ey2a\" part=\"frame\"><!> <!> <!> <!></div>"), Rl = {
	hash: "svelte-m2ey2a",
	code: ".frame.svelte-m2ey2a {display:flex;flex-direction:column;gap:8px;box-sizing:border-box;height:100%;min-height:0;min-width:0;overflow:auto;padding:12px 16px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);font-size:14px;line-height:20px;scrollbar-width:thin;scrollbar-color:var(--k-line) transparent;}\n  /* The frame's last-resort scroll, for a host card shorter than the figure's floors, is the browser's own, drawn thin in the\n     kit's line colour: the kit's scroller on every tile cost WebKit about six seconds more to draw a page of forty tiles (9.0 s\n     against 3.0 s in the gallery), for a case a page rarely meets. It is the one exception test/kit/no-plain-scroll.test.ts names. */.frame.svelte-m2ey2a::-webkit-scrollbar {width:10px;height:10px;}.frame.svelte-m2ey2a::-webkit-scrollbar-thumb {border:1px solid transparent;border-radius:999px;background-clip:padding-box;background-color:var(--k-line);}.head.svelte-m2ey2a {display:flex;align-items:center;gap:8px;min-width:0;}.title.svelte-m2ey2a {flex:1 1 auto;min-width:0;overflow:hidden;font-size:13px;font-weight:600;line-height:18px;text-overflow:ellipsis;white-space:nowrap;}.toggle.svelte-m2ey2a {flex:none;margin-inline-start:auto;}.pager.svelte-m2ey2a {display:flex;flex:none;justify-content:flex-end;gap:8px;}.state.svelte-m2ey2a {position:relative;display:grid;gap:4px;padding:16px 0;}.state.svelte-m2ey2a p:where(.svelte-m2ey2a) {margin:0;}.lead.svelte-m2ey2a {font-weight:500;}.hint.svelte-m2ey2a {color:var(--k-muted);font-size:12px;line-height:18px;}.prose.svelte-m2ey2a {display:flex;flex:1 1 auto;flex-direction:column;min-height:0;overflow-wrap:anywhere;}.frame.svelte-m2ey2a [data-scope='scroll-area'][data-part='viewport']:focus-visible {outline:2px solid var(--k-primary);outline-offset:-2px;box-shadow:none;}.notes.svelte-m2ey2a {display:grid;gap:2px;margin:0;padding:8px 0 0;border-top:1px solid var(--k-line);list-style:none;color:var(--k-muted);font-size:12px;line-height:18px;}"
};
function zl(t, n) {
	m(n, !0), c(t, Rl);
	let r = w(n, "spec", 7), i = w(n, "result", 7), l = w(n, "fields", 7), d = w(n, "rows", 7), f = w(n, "columns", 7), h = w(n, "paging", 7), g = w(n, "table", 7), x = w(n, "drill", 7), C = w(n, "text", 7), T = w(n, "locale", 7), D = w(n, "host", 7), k = o(() => !!d() && !!f()), A = o(() => et(r(), i(), l(), C(), T() ?? void 0, E(k))), j = o(() => r() && i() && E(A).state.kind === "number" ? ol(r(), i(), l(), C(), T() ?? void 0, x()) : null), M = o(() => r() && i() && E(A).state.kind === "chart" ? ft(r(), i(), l(), C(), T() ?? void 0, x()) : null), N = o(() => E(A).state.kind === "text" && r()?.kind === "text" ? r().body : null), F = o(() => E(N) === null ? null : xe(E(N))), I = o(() => E(A).state.kind === "list" && !!f() && f().length === 0), R = o(() => E(A).state.kind === "list" && d() && f()?.length ? Mc(d(), f(), l(), C(), T() ?? void 0) : null), z = o(() => typeof g() == "boolean"), B = O(!1), ee = o(() => E(z) ? g() === !0 : E(B)), te = o(() => !!E(M) && !E(M)[0].empty && !E(z));
	function G(t) {
		h() && !h().busy && h()[t] && e(D(), "af-page", { direction: t });
	}
	var ne = {
		get spec() {
			return r();
		},
		set spec(e) {
			r(e), _();
		},
		get result() {
			return i();
		},
		set result(e) {
			i(e), _();
		},
		get fields() {
			return l();
		},
		set fields(e) {
			l(e), _();
		},
		get rows() {
			return d();
		},
		set rows(e) {
			d(e), _();
		},
		get columns() {
			return f();
		},
		set columns(e) {
			f(e), _();
		},
		get paging() {
			return h();
		},
		set paging(e) {
			h(e), _();
		},
		get table() {
			return g();
		},
		set table(e) {
			g(e), _();
		},
		get drill() {
			return x();
		},
		set drill(e) {
			x(e), _();
		},
		get text() {
			return C();
		},
		set text(e) {
			C(e), _();
		},
		get locale() {
			return T();
		},
		set locale(e) {
			T(e), _();
		},
		get host() {
			return D();
		},
		set host(e) {
			D(e), _();
		}
	}, re = Ll(), K = P(re), ie = (e) => {
		var t = El(), n = P(t), r = (e) => {
			var t = wl(), n = H(t, !0);
			V(() => u(n, E(A).title)), S(e, t);
		};
		y(n, (e) => {
			E(A).title && e(r);
		});
		var i = L(n, 2), a = (e) => {
			var t = Tl(), n = H(t, !0);
			V(() => u(n, E(ee) ? C().tileShowChart : C().tileShowTable)), U("click", t, () => q(B, !E(B))), S(e, t);
		};
		y(i, (e) => {
			E(te) && e(a);
		}), p(t), S(e, t);
	};
	y(K, (e) => {
		E(A).state.kind !== "loading" && (E(A).title || E(te)) && e(ie);
	});
	var ae = L(K, 2), oe = (e) => {
		pe(e, {
			get title() {
				return E(A).title;
			},
			get text() {
				return C();
			}
		});
	}, se = (e) => {
		var t = Dl(), n = P(t), r = H(n, !0), i = L(n, 2), a = H(i, !0);
		p(t), V(() => {
			u(r, C().tileUnavailable), u(a, C().tileUnavailableHint);
		}), S(e, t);
	}, ce = (e) => {
		var t = kl(), n = P(t), r = H(n, !0), i = L(n, 2), a = (e) => {
			var t = Ol(), n = H(t, !0);
			V(() => u(n, E(A).state.detail)), S(e, t);
		};
		y(i, (e) => {
			E(A).state.detail && e(a);
		}), p(t), V(() => u(r, E(A).state.title)), S(e, t);
	}, le = (e) => {
		var t = jl(), n = P(t);
		{
			let e = o(() => E(A).title || null);
			he(n, {
				get label() {
					return E(e);
				},
				children: (e, t) => {
					var n = Al(), r = P(n);
					be(r, { get blocks() {
						return E(F);
					} }), p(n), S(e, n);
				},
				$$slots: { default: !0 }
			});
		}
		p(t), S(e, t);
	}, ue = (e) => {
		var t = Ml(), n = P(t), r = H(n, !0);
		p(t), V(() => u(r, C().tileListNoColumns)), S(e, t);
	}, de = (e) => {
		var t = Pl(), n = W(t), r = (e) => {
			el(e, {
				get model() {
					return E(R);
				},
				get drill() {
					return x();
				},
				get text() {
					return C();
				},
				get label() {
					return E(A).title;
				},
				get host() {
					return D();
				}
			});
		}, i = (e) => {
			var t = Ml(), n = P(t), r = H(n, !0);
			p(t), V(() => u(r, C().tileListEmpty)), S(e, t);
		};
		y(n, (e) => {
			E(R).rows.length ? e(r) : e(i, -1);
		});
		var a = L(n, 2), o = (e) => {
			var t = Nl(), n = P(t), r = H(n, !0), i = L(n, 2), a = H(i, !0);
			p(t), V(() => {
				v(t, "aria-label", E(A).title || void 0), v(t, "aria-busy", h().busy ? "true" : void 0), n.disabled = !h().prev || !!h().busy, u(r, C().tilePrevious), i.disabled = !h().next || !!h().busy, u(a, C().tileNext);
			}), U("click", n, () => G("prev")), U("click", i, () => G("next")), S(e, t);
		};
		y(a, (e) => {
			h() && e(o);
		}), S(e, t);
	}, fe = (e) => {
		_l(e, {
			get model() {
				return E(j);
			},
			get text() {
				return C();
			},
			get locale() {
				return T();
			},
			get host() {
				return D();
			}
		});
	}, me = (e) => {
		ec(e, {
			get panels() {
				return E(M);
			},
			get table() {
				return E(ee);
			},
			get text() {
				return C();
			},
			get locale() {
				return T();
			},
			get label() {
				return E(A).title;
			},
			get host() {
				return D();
			}
		});
	}, ge = (e) => {
		var t = Ml(), n = P(t), r = H(n, !0);
		p(t), V(() => u(r, C().tileNotDrawn)), S(e, t);
	};
	y(ae, (e) => {
		E(A).state.kind === "loading" ? e(oe) : E(A).state.kind === "unavailable" ? e(se, 1) : E(A).state.kind === "failed" ? e(ce, 2) : E(F) ? e(le, 3) : E(I) ? e(ue, 4) : E(R) ? e(de, 5) : E(j) ? e(fe, 6) : E(M) ? e(me, 7) : e(ge, -1);
	});
	var _e = L(ae, 2), ve = (e) => {
		Cl(e, { get model() {
			return E(A).verdict;
		} });
	};
	y(_e, (e) => {
		E(A).verdict && e(ve);
	});
	var ye = L(_e, 2), Se = (e) => {
		var t = Il();
		a(t, 21, () => E(A).notes, b, (e, t) => {
			var n = Fl(), r = H(n, !0);
			V(() => u(r, E(t))), S(e, n);
		}), p(t), S(e, t);
	};
	return y(ye, (e) => {
		E(A).notes.length && e(Se);
	}), p(re), S(t, re), s(ne);
}
K(["click"]), F(zl, {
	spec: {},
	result: {},
	fields: {},
	rows: {},
	columns: {},
	paging: {},
	table: {},
	drill: {},
	text: {},
	locale: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
export { zl as default };
