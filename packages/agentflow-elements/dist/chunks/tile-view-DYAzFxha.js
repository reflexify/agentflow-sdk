import { $ as e, Ct as t, H as n, I as r, It as i, M as a, Nt as o, Ot as s, P as c, Pt as l, Q as u, T as d, V as f, W as p, X as m, Y as h, Z as g, _, _t as v, a as y, b, c as x, ct as S, d as C, dt as w, et as T, f as E, ft as D, g as O, gt as k, ht as A, i as j, it as M, j as N, kt as P, l as F, mt as I, nt as L, o as R, ot as z, p as B, pt as V, rt as H, s as ee, tt as te, u as ne, ut as U, wt as W, xt as re, y as G, yt as K } from "./version-CCDdag5V.js";
import { a as ie, i as ae, n as oe, o as se, r as ce, s as le, t as ue } from "./Loading-B3QyjI_k.js";
import { r as de } from "./format-GenuUIkK.js";
import { n as q, t as fe } from "./text-CDgi_cJ8.js";
import { t as pe } from "./mention-token-0ud8ndht.js";
import { i as me, s as he } from "./environment-1PeQDNCe.js";
import { a as ge, s as _e, t as ve, u as ye } from "./mention-chip-CSmBskyF.js";
import { n as be, t as xe } from "./prose-0W8fxjNG.js";
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
	let n = ie(t), r = n.length <= 8, i = /* @__PURE__ */ new Set();
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
	let n = se(e), r = n ? [n, ...e.filter((e) => e !== n)] : [], i = /* @__PURE__ */ new Map();
	for (let e of r) {
		let n = E(B(e, C(e, t))), r = i.get(n);
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
	let n = e.query.measures, r = se(n);
	return r && ce(r, Pe(t, r)?.metric);
}
function Le(e, t, n, r, i) {
	if (e.kind !== "chart") return null;
	let a = t.verdict;
	if (!a) return null;
	let o = Ie(e, t), s = o ? C(o, n ?? void 0) : void 0, c = (e) => o ? j(o, e, s, i) : String(e), l = (e) => ({
		kind: a.kind,
		tone: Fe[a.kind],
		text: e
	});
	switch (a.kind) {
		case "partitions": {
			let t = !!e.stack_by;
			return typeof a.total == "number" ? l(q(t ? r.tileVerdictPartitionsStacked : r.tileVerdictPartitions, { total: c(a.total) })) : l(t ? r.tileVerdictPartitionsStackedNoTotal : r.tileVerdictPartitionsNoTotal);
		}
		case "fans_out": return l(q(r.tileVerdictFansOut, {
			bucketSum: c(a.bucket_sum),
			total: c(a.total),
			gap: c(Math.abs(a.gap))
		}));
		case "overlaps": return l(r.tileVerdictOverlaps);
		case "not_applicable": return l(r.tileVerdictNotApplicable);
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
	return "query" in e ? e.query.measures.map((e) => ce(e, Pe(t, e)?.metric)) : [];
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
function Xe(e, t, n) {
	return Te(e).map((e) => e.code === "skipped" ? q(t.tileSkipped, { count: Je(e.count, n) }) : t.tileUnweightedAverage);
}
function Ze(e, t, n) {
	if (e.cap === null) return t.tileCapIncomplete;
	let r = Je(e.cap, n);
	return e.kind === "sample" ? q(t.tileCapSample, { cap: r }) : q(e.kind === "at_least" ? t.tileChartCapAtLeast : t.tileChartCapAtMost, { cap: r });
}
function Qe(e, t, n) {
	switch (e.kind) {
		case "share_of_total": return t.some((e) => e.other === !0) ? `${n.tileDerivedShare} — ${n.tileDerivedShareRemainder}` : n.tileDerivedShare;
		case "running_total": return n.tileDerivedRunning;
		case "rank": return q(n.tileDerivedRank, {
			direction: e.direction === "asc" ? n.tileRankLowest : n.tileRankHighest,
			ties: e.ties === "dense" ? n.tileTiesDense : n.tileTiesCompetition
		});
		case "expression": return e.label?.trim() || n.tileFormula;
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
	let o = n ?? void 0, s = e ? Ge(e, t) : [], c = e ? le({
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
	let d = se(s), f = d ? Pe(t, d) : void 0, p = Se(t.population, f?.cap_bound), m = e ? Ue(e) : null;
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
	let { result: o, known: s, chart: c, type: l, measures: u, groups: d } = e, f = ze(l), p = d[i] ?? [], m = f ? p.slice(0, 1) : p, h = m[0], g = d[0]?.[0], _ = g && Pe(o, g)?.buckets || [], v = i === 0, y = v ? e.derive : null, b = c?.split_by, x = b && !b.via ? s?.find((e) => e.key === b.field) : void 0, S = c && a === 1 && (l === "bar" || l === "column") ? c.stack_by ?? null : null, w = S && !S.via ? s?.find((e) => e.key === S.field) : void 0, T = S !== null && h !== void 0, E;
	if (T) {
		let e = Me(_), n = je(e, w);
		E = e.map((e, r) => {
			let i = _.flatMap((e) => e.segments ?? []).find((t) => t.key === e);
			return {
				label: qe(oe(i ?? { key: e }, w, S.bucket), t),
				color: n[r],
				pattern: rt(e, n[r]),
				measure: Ke(h),
				segment: e
			};
		});
	} else E = m.map((e) => {
		let t = Ae(e, u.indexOf(e));
		return {
			label: ae(e, s),
			color: t,
			pattern: rt(null, t),
			measure: Ke(e),
			segment: null
		};
	});
	let D = T ? [] : m.map((e, t) => v && t === 0 ? null : it(Pe(o, e)?.buckets)), O = r && o.outcome === "ok" && c?.drill_disabled !== !0, k = _.map((e) => {
		let n = qe(oe(e, x, b?.bucket), t), r = T ? E.map((t) => e.segments?.find((e) => e.key === t.segment)) : m.map((t, n) => v && n === 0 ? e : D[n].get(e.key)), i = r.map((t, r) => !O || !t?.drill ? null : {
			drill: t.drill,
			measure: E[r].measure,
			bucket: e.key,
			segment: T ? t.key : null,
			label: T ? `${n} · ${E[r].label}` : n,
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
	}), A = k.some((e) => e.compared), j = h ?? {}, M = C(j, s), N = F(j, M, n), P = f ? vt(k, x, n) : [], I = gt(y, l, a, k, N, _, t, n), L = e.derive?.kind === "rank" && (l === "bar" || l === "column") ? _.map((e) => typeof e.derived == "number" && Number.isFinite(e.derived) ? ht(e.derived) : null) : [], R = [];
	return f ? k.forEach((e, t) => {
		if (!ot(e)) return;
		let n = P[t];
		R.push(nt("slice", e.label, {
			bucket: t,
			detail: `${N(e.values[0])} · ${n.share}`,
			color: n.color,
			pattern: n.pattern
		}));
	}) : (E.forEach((e, t) => R.push(nt("series", e.label, {
		series: t,
		color: e.color,
		pattern: e.pattern
	}))), A && !T && R.push(nt("earlier", t.tileEarlier, {
		color: E[0]?.color ?? null,
		pattern: E[0]?.pattern ?? null
	})), k.some((e) => e.target !== null) && R.push(nt("target", t.tileTarget)), I.derive?.kind === "running_total" && R.push(nt("running", t.tileRunningTotal)), I.derive?.kind === "expression" && I.beside.length > 0 && R.push(nt("formula", I.derive.label)), k.some((e) => e.filled) && R.push(nt("filled", t.tileFilled))), {
		type: l,
		stacked: T,
		compared: A,
		series: E,
		buckets: k,
		slices: P,
		splitLabel: x?.label || b?.field || "",
		empty: k.length === 0 || o.population?.count === 0 || f && !k.some(ot),
		legend: R,
		drill: {
			enabled: O,
			disabled: r && c?.drill_disabled === !0
		},
		format: N,
		unitLabel: a > 1 && h ? ut(B(h, M), t) : null,
		...I,
		ranks: L
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
			c = (t) => ee(t, e, s), l = ze(t) ? o.tileDerivedShare : o.tileShare;
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
		share: i[t] === null ? tt : ee(i[t], a, n)
	}));
}
function yt(e) {
	return e ? "slot" in e ? `var(--k-chart-${e.slot})` : "value" in e ? e.value : "" : "";
}
function bt(e, t, n, r) {
	return e.unmatched ? n.tileUnmatched : !t && e.previous !== null ? n.tileGone : t && e.previous === null ? n.tileNew : R(e.percentChange, r) ?? n.tileNoEarlier;
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
var St = e("<text class=\"unit svelte-1drwwxe\" dominant-baseline=\"central\"> </text>"), Ct = e("<line class=\"svelte-1drwwxe\"></line><text text-anchor=\"middle\" class=\"svelte-1drwwxe\"> </text>", 1), wt = e("<line class=\"svelte-1drwwxe\"></line><text text-anchor=\"end\" dominant-baseline=\"central\" class=\"svelte-1drwwxe\"> </text>", 1), Tt = e("<line class=\"svelte-1drwwxe\"></line>"), Et = e("<title> </title>"), Dt = e("<text text-anchor=\"end\" dominant-baseline=\"central\" class=\"svelte-1drwwxe\"><!> </text>"), Ot = e("<text text-anchor=\"middle\" class=\"svelte-1drwwxe\"><!> </text>"), kt = e("<g class=\"axes\" aria-hidden=\"true\"><!><!><!><!></g>"), At = {
	hash: "svelte-1drwwxe",
	code: "text.svelte-1drwwxe {font-size:11px;}line.svelte-1drwwxe {stroke-width:1;}"
};
function jt(e, i) {
	P(i, !0), r(e, At);
	let a = _(i, "layout", 7), o = _(i, "horizontal", 7), c = _(i, "zero", 7, null), u = W(() => a().plot), v = W(() => c() ?? z(u).y + z(u).height);
	var y = {
		get layout() {
			return a();
		},
		set layout(e) {
			a(e), t();
		},
		get horizontal() {
			return o();
		},
		set horizontal(e) {
			o(e), t();
		},
		get zero() {
			return c();
		},
		set zero(e = null) {
			c(e), t();
		}
	}, b = kt(), x = V(b), S = (e) => {
		var t = St();
		N(t, "", {}, { fill: "var(--k-muted)" });
		var n = A(t, !0);
		U(() => {
			d(t, "x", a().unit.x), d(t, "y", a().unit.y), h(n, a().unit.text);
		}), m(e, t);
	};
	p(x, (e) => {
		a().unit && e(S);
	});
	var C = k(x);
	f(C, 17, () => a().valueTicks, n, (e, t) => {
		var n = g(), r = I(n), i = (e) => {
			var n = Ct(), r = I(n);
			N(r, "", {}, { stroke: "var(--k-chart-grid)" });
			var i = k(r);
			N(i, "", {}, { fill: "var(--k-muted)" });
			var a = A(i, !0);
			U(() => {
				d(r, "x1", z(t).at), d(r, "y1", z(u).y), d(r, "x2", z(t).at), d(r, "y2", z(u).y + z(u).height), d(i, "x", z(t).at), d(i, "y", z(u).y + z(u).height + 16), h(a, z(t).label);
			}), m(e, n);
		}, a = (e) => {
			var n = wt(), r = I(n);
			N(r, "", {}, { stroke: "var(--k-chart-grid)" });
			var i = k(r);
			N(i, "", {}, { fill: "var(--k-muted)" });
			var a = A(i, !0);
			U(() => {
				d(r, "x1", z(u).x), d(r, "y1", z(t).at), d(r, "x2", z(u).x + z(u).width), d(r, "y2", z(t).at), d(i, "x", z(u).x - 8), d(i, "y", z(t).at), h(a, z(t).label);
			}), m(e, n);
		};
		p(r, (e) => {
			o() ? e(i) : e(a, -1);
		}), m(e, n);
	});
	var w = k(C), T = (e) => {
		var t = Tt();
		N(t, "", {}, { stroke: "var(--k-chart-axis)" }), U(() => {
			d(t, "x1", z(v)), d(t, "y1", z(u).y), d(t, "x2", z(v)), d(t, "y2", z(u).y + z(u).height);
		}), m(e, t);
	}, E = (e) => {
		var t = Tt();
		N(t, "", {}, { stroke: "var(--k-chart-axis)" }), U(() => {
			d(t, "x1", z(u).x), d(t, "y1", z(v)), d(t, "x2", z(u).x + z(u).width), d(t, "y2", z(v));
		}), m(e, t);
	};
	p(w, (e) => {
		o() ? e(T) : e(E, -1);
	});
	var D = k(w);
	return f(D, 17, () => a().categoryTicks, n, (e, t) => {
		var n = g(), r = I(n), i = (e) => {
			var n = Dt();
			N(n, "", {}, { fill: "var(--k-muted)" });
			var r = V(n), i = (e) => {
				var n = Et(), r = A(n, !0);
				U(() => h(r, z(t).full)), m(e, n);
			};
			p(r, (e) => {
				z(t).label !== z(t).full && e(i);
			});
			var a = k(r, 1, !0);
			l(n), U(() => {
				d(n, "x", z(u).x - 8), d(n, "y", z(t).at), h(a, z(t).label);
			}), m(e, n);
		}, a = (e) => {
			var n = Ot();
			N(n, "", {}, { fill: "var(--k-muted)" });
			var r = V(n), i = (e) => {
				var n = Et(), r = A(n, !0);
				U(() => h(r, z(t).full)), m(e, n);
			};
			p(r, (e) => {
				z(t).label !== z(t).full && e(i);
			});
			var a = k(r, 1, !0);
			l(n), U(() => {
				d(n, "x", z(t).at), d(n, "y", z(u).y + z(u).height + 16), h(a, z(t).label);
			}), m(e, n);
		};
		p(r, (e) => {
			o() ? e(i) : e(a, -1);
		}), m(e, n);
	}), l(b), m(e, b), s(y);
}
O(jt, {
	layout: {},
	horizontal: {},
	zero: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Bars.svelte
var Mt = e("<rect aria-hidden=\"true\" class=\"svelte-4g1uej\"></rect>"), Nt = e("<rect class=\"svelte-4g1uej\"></rect>"), Pt = e("<line data-kind=\"target\" aria-hidden=\"true\" stroke-width=\"2\" class=\"svelte-4g1uej\"></line>"), Ft = e("<circle data-kind=\"running-dot\" aria-hidden=\"true\" r=\"4\" stroke-width=\"1.5\" class=\"svelte-4g1uej\"></circle>"), It = e("<path data-kind=\"running\" aria-hidden=\"true\" stroke-width=\"1.5\" stroke-linejoin=\"round\" class=\"svelte-4g1uej\"></path><!>", 1), Lt = e("<text class=\"figure svelte-4g1uej\" data-kind=\"label\"> </text>"), Rt = e("<g aria-hidden=\"true\" class=\"svelte-4g1uej\"></g>"), zt = e("<!><!><!><!>", 1), Bt = {
	hash: "svelte-4g1uej",
	code: ".figure.svelte-4g1uej {font-size:11px;}rect.svelte-4g1uej {transition:opacity 120ms;}[aria-hidden='true'].svelte-4g1uej {pointer-events:none;}[tabindex].svelte-4g1uej {outline:none;-webkit-tap-highlight-color:transparent;}[role='button'].svelte-4g1uej:not([aria-disabled='true']) {cursor:pointer;}[tabindex].svelte-4g1uej:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}\n  @media (prefers-reduced-motion: reduce) {rect.svelte-4g1uej {transition:none;}\n  }"
};
function Vt(e, n) {
	P(n, !0), r(e, Bt);
	let i = _(n, "marks", 7), a = _(n, "targets", 7), o = _(n, "labels", 7), c = _(n, "running", 7), u = _(n, "ids", 7), v = _(n, "opens", 7), y = _(n, "tab", 7), b = _(n, "emphasis", 7), x = _(n, "onkey", 7), S = _(n, "onopen", 7), C = (e) => e.pattern ? `url(#${u()[e.pattern]})` : e.fill || "var(--k-chart-other)", w = (e) => b() !== null && e.series !== b() ? Math.min(e.opacity, .25) : e.opacity, T = (e) => e.pattern ? "var(--k-chart-hatch)" : e.fill || "var(--k-chart-hatch)";
	var E = {
		get marks() {
			return i();
		},
		set marks(e) {
			i(e), t();
		},
		get targets() {
			return a();
		},
		set targets(e) {
			a(e), t();
		},
		get labels() {
			return o();
		},
		set labels(e) {
			o(e), t();
		},
		get running() {
			return c();
		},
		set running(e) {
			c(e), t();
		},
		get ids() {
			return u();
		},
		set ids(e) {
			u(e), t();
		},
		get opens() {
			return v();
		},
		set opens(e) {
			v(e), t();
		},
		get tab() {
			return y();
		},
		set tab(e) {
			y(e), t();
		},
		get emphasis() {
			return b();
		},
		set emphasis(e) {
			b(e), t();
		},
		get onkey() {
			return x();
		},
		set onkey(e) {
			x(e), t();
		},
		get onopen() {
			return S();
		},
		set onopen(e) {
			S(e), t();
		}
	}, D = zt(), O = I(D);
	f(O, 17, i, (e) => `${e.bucket}:${e.series}:${e.kind}`, (e, t) => {
		var n = g(), r = I(n), i = (e) => {
			var n = Mt();
			let r;
			U((e, i) => {
				d(n, "data-kind", z(t).kind), d(n, "data-bucket", z(t).bucket), d(n, "data-series", z(t).series), d(n, "x", z(t).x), d(n, "y", z(t).y), d(n, "width", z(t).width), d(n, "height", z(t).height), r = N(n, "", r, {
					fill: e,
					opacity: i
				});
			}, [() => C(z(t)), () => w(z(t))]), m(e, n);
		}, a = (e) => {
			var n = Nt();
			let r;
			U((e, i, a) => {
				d(n, "role", v() ? "button" : "img"), d(n, "tabindex", y()?.bucket === z(t).bucket && y().series === z(t).series ? 0 : -1), d(n, "aria-label", z(t).summary), d(n, "aria-disabled", v() && !z(t).drill ? "true" : void 0), d(n, "data-kind", z(t).kind), d(n, "data-bucket", z(t).bucket), d(n, "data-series", z(t).series), d(n, "x", z(t).x), d(n, "y", z(t).y), d(n, "width", z(t).width), d(n, "height", z(t).height), d(n, "stroke-width", z(t).kind === "filled" ? 1 : void 0), d(n, "stroke-dasharray", z(t).kind === "filled" ? "3 2" : void 0), r = N(n, "", r, {
					fill: e,
					stroke: i,
					opacity: a
				});
			}, [
				() => z(t).kind === "filled" ? "none" : C(z(t)),
				() => z(t).kind === "filled" ? T(z(t)) : void 0,
				() => w(z(t))
			]), H("click", n, (e) => S()(z(t), e)), M("auxclick", n, (e) => S()(z(t), e)), H("keydown", n, (e) => x()(e, z(t))), m(e, n);
		};
		p(r, (e) => {
			z(t).kind === "previous" ? e(i) : e(a, -1);
		}), m(e, n);
	});
	var j = k(O);
	f(j, 17, a, (e) => e.bucket, (e, t) => {
		var n = Pt();
		N(n, "", {}, { stroke: "var(--k-fg)" }), U(() => {
			d(n, "data-bucket", z(t).bucket), d(n, "x1", z(t).x1), d(n, "y1", z(t).y1), d(n, "x2", z(t).x2), d(n, "y2", z(t).y2);
		}), m(e, n);
	});
	var F = k(j), L = (e) => {
		var t = It(), n = I(t);
		N(n, "", {}, {
			fill: "none",
			stroke: "var(--k-fg)",
			opacity: .7
		});
		var r = k(n);
		f(r, 17, () => c().dots, (e) => e.bucket, (e, t) => {
			var n = Ft();
			let r;
			U(() => {
				d(n, "data-bucket", z(t).bucket), d(n, "cx", z(t).cx), d(n, "cy", z(t).cy), r = N(n, "", r, {
					fill: z(t).hollow ? "var(--k-surface)" : "var(--k-fg)",
					stroke: "var(--k-fg)"
				});
			}), m(e, n);
		}), U(() => d(n, "d", c().d)), m(e, t);
	};
	p(F, (e) => {
		c() && e(L);
	});
	var R = k(F), B = (e) => {
		var t = Rt();
		f(t, 21, o, (e) => e.bucket, (e, t) => {
			var n = Lt();
			N(n, "", {}, { fill: "var(--k-fg)" });
			var r = A(n, !0);
			U(() => {
				d(n, "data-bucket", z(t).bucket), d(n, "x", z(t).x), d(n, "y", z(t).y), d(n, "text-anchor", z(t).anchor), d(n, "dominant-baseline", z(t).anchor === "start" ? "central" : void 0), h(r, z(t).text);
			}), m(e, n);
		}), l(t), m(e, t);
	};
	return p(R, (e) => {
		o().length > 0 && e(B);
	}), m(e, D), s(E);
}
L(["click", "keydown"]), O(Vt, {
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
var Ht = e("<defs><pattern width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(45)\"><rect width=\"6\" height=\"6\"></rect><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"6\" stroke-width=\"2\"></line></pattern><pattern width=\"6\" height=\"6\" patternUnits=\"userSpaceOnUse\" patternTransform=\"rotate(-45)\"><rect width=\"6\" height=\"6\"></rect><line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"6\" stroke-width=\"2\" stroke-dasharray=\"2 2\"></line></pattern></defs>");
function Ut(e, n) {
	P(n, !0);
	let r = _(n, "ids", 7);
	var i = {
		get ids() {
			return r();
		},
		set ids(e) {
			r(e), t();
		}
	}, a = Ht(), o = V(a), c = V(o);
	N(c, "", {}, { fill: "var(--k-chart-other)" });
	var u = k(c);
	N(u, "", {}, { stroke: "var(--k-chart-hatch)" }), l(o);
	var f = k(o), p = V(f);
	N(p, "", {}, { fill: "var(--k-chart-other)" });
	var h = k(p);
	return N(h, "", {}, { stroke: "var(--k-chart-hatch)" }), l(f), l(a), U(() => {
		d(o, "id", r().other), d(f, "id", r().restricted);
	}), m(e, a), s(i);
}
O(Ut, { ids: {} }, [], [], { mode: "open" });
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
function sn(e, t, n, r, i, a) {
	let o = e.buckets[t], s = Jt(e, n);
	if (!o) return {
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
	let c = ze(e.type) ? e.slices[t] : void 0, l = s.map((t) => {
		let n = e.series[t], i = o.values[t] ?? null, s = e.stacked ? n.pattern : o.restricted ? "restricted" : o.other ? "other" : n.pattern, l = i === null ? r.tileNoData : e.stacked ? `${e.format(i)} · ${Je(o.counts[t] ?? 0, a)}` : e.format(i);
		return {
			label: n.label,
			value: l,
			color: c?.color ?? n.color,
			pattern: c ? c.pattern : s
		};
	}), u = null, d = null;
	if (e.compared || o.compared) {
		let t = e.stacked ? s.some((e) => o.values[e] != null) : o.values[0] != null;
		u = o.previous === null ? r.tileNew : e.format(o.previous), d = o.unmatched ? r.tileUnmatched : !t && o.previous !== null ? r.tileGone : R(o.percentChange, a) ?? r.tileNoEarlier;
	}
	let f = e.stacked ? s.map((e) => o.values[e]).filter(qt) : [], p = null, m = null;
	if (e.stacked) {
		let e = s.flatMap((e) => o.drills[e] ? [o.drills[e]] : []);
		e.length > 0 && (m = e.reduce((e, t) => e + t.count, 0));
	} else m = c ? o.drills[0]?.count ?? null : on(e, t, n)?.count ?? null;
	return i.enabled && m !== null ? p = q(m === 1 ? r.tileOpenRecordsOne : r.tileOpenRecords, { count: Je(m, a) }) : i.disabled && (p = r.tileDrillOff), {
		title: o.label,
		rows: l,
		target: qt(o.target) ? e.format(o.target) : null,
		earlier: u,
		change: d,
		total: f.length > 0 ? e.format(f.reduce((e, t) => e + t, 0)) : null,
		share: c ? c.share : null,
		derived: e.derive ? {
			label: e.derive.label,
			value: e.formatDerived(o.derived)
		} : null,
		hint: p
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
						var V = M - B[0], H = N - B[1], ee = I - B[0], te = L - B[1], ne = 1 / X(kn((V * ee + H * te) / (Tn(V * V + H * H) * Tn(ee * ee + te * te))) / 2), U = Tn(B[0] * B[0] + B[1] * B[1]);
						E = wn(T, (d - U) / (ne - 1)), D = wn(T, (f - U) / (ne + 1));
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
function Yo(e, t, n, r = fe.en, i) {
	let a = e.type === "bar", o = $(t.width) ? Math.max(0, t.width) : 0, s = $(t.height) ? Math.max(0, t.height) : 0, c = e.buckets.map((t, n) => e.ranks[n] ? `${e.ranks[n]} ${t.label}` : t.label), l = ko(fo * Math.max(0, ...c.map(Ao)) + _o, 48, vo), u = Jo(e.beside), d = u > 0, f = d && a ? Math.min(vo, Co + Math.ceil(fo * u)) : 0, p = a || i?.categoryLabels !== !1, m = Bo(i) + (d && !a ? wo : 0), h = Math.max(0, s - m - (p ? mo : po)), { lo: g, hi: _, ticks: v, labels: y, widest: b } = Lo(e, n, a ? (e) => o - l - Math.max(Ho(e), f) : null, a ? null : h), x = a ? l : i?.valueGutter ?? Ro(b), S = Math.max(Ho(a ? b : Uo(c)), f), C = {
		x,
		y: m,
		width: Math.max(0, o - x - S),
		height: h
	}, w = uo().domain([g, _]).range(a ? [C.x, C.x + C.width] : [C.y + C.height, C.y]), T = Wo(e.buckets.length, a ? [C.y, C.y + C.height] : [C.x, C.x + C.width]), E = T.bandwidth(), D = w(0), O = !a && fo * u + Co > T.step() ? e.alone : e.beside, k = e.series.map((e, t) => t).filter((e) => !n.has(e)), A = [];
	if (e.stacked) A.push({
		series: -1,
		kind: "value"
	});
	else for (let t of k) A.push({
		series: t,
		kind: "value"
	}), t === 0 && No(e, n) && A.push({
		series: 0,
		kind: "previous"
	});
	let j = Xa().domain(A.map((e, t) => t)).range([0, E]).paddingInner(.1), M = (e, t, n, r, i) => {
		let o = w(e), s = w(t), c = Math.max(1, i), l = n + r - (c - i) / 2, u = Math.min(o, s), d = Math.abs(s - o);
		return a ? {
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
	}, N = (e) => A.length === 1 ? {
		offset: 0,
		across: E
	} : {
		offset: j(e) ?? 0,
		across: j.bandwidth()
	}, P = (t, n, r) => `${t.label}, ${n}: ${e.format(r)}`, F = (t, n) => e.stacked ? n : t.restricted ? "restricted" : t.other ? "other" : n, I = Mo(e, n), L = [], R = [], z = [];
	e.buckets.forEach((t, n) => {
		let i = T(n) ?? 0, s = L.length;
		if (t.filled && k.length > 0) {
			let o = e.series[k[0]], s = A.length > 1 && A.some((e) => e.kind === "previous") ? N(0) : {
				offset: 0,
				across: E
			}, c = a ? {
				x: D,
				y: i + s.offset,
				width: yo,
				height: Math.max(1, s.across)
			} : {
				x: i + s.offset,
				y: D - yo,
				width: Math.max(1, s.across),
				height: yo
			};
			L.push({
				...c,
				series: k[0],
				bucket: n,
				kind: "filled",
				fill: yt(o.color),
				opacity: 1,
				pattern: null,
				drill: null,
				summary: `${t.label}, ${o.label}: ${r.tileFilled}`
			});
		}
		if (e.stacked) {
			let r = 0, a = 0, { offset: o, across: s } = N(0);
			if (!t.filled) for (let c of k) {
				let l = t.values[c];
				if (!$(l)) continue;
				let u = e.series[c], [d, f] = l >= 0 ? [r, r + l] : [a + l, a];
				l >= 0 ? r += l : a += l, L.push({
					...M(d, f, i, o, s),
					series: c,
					bucket: n,
					kind: "value",
					fill: yt(u.color),
					opacity: 1,
					pattern: u.pattern,
					drill: t.drills[c] ?? null,
					summary: P(t, u.label, l)
				});
			}
		} else A.forEach((a, o) => {
			let { offset: s, across: c } = N(o), l = e.series[a.series];
			if (a.kind === "previous") {
				let o = t.previous;
				if (!$(o)) return;
				let u = `${t.label}, ${l.label} (${r.tileEarlier}): ${e.format(o)}`;
				L.push({
					...M(Math.min(0, o), Math.max(0, o), i, s, c),
					series: a.series,
					bucket: n,
					kind: "previous",
					fill: yt(l.color),
					opacity: bo,
					pattern: F(t, l.pattern),
					drill: null,
					summary: u
				});
				return;
			}
			let u = t.values[a.series];
			$(u) && !t.filled && L.push({
				...M(Math.min(0, u), Math.max(0, u), i, s, c),
				series: a.series,
				bucket: n,
				kind: "value",
				fill: yt(l.color),
				opacity: 1,
				pattern: F(t, l.pattern),
				drill: t.drills[a.series] ?? null,
				summary: P(t, l.label, u)
			});
		});
		if ($(t.target)) {
			let e = w(t.target), r = i + E * .1, o = i + E * .9;
			R.push(a ? {
				bucket: n,
				x1: e,
				y1: r,
				x2: e,
				y2: o
			} : {
				bucket: n,
				x1: r,
				y1: e,
				x2: o,
				y2: e
			});
		}
		let c = O[n];
		if (c && I) {
			let t = D, r = i + E / 2;
			for (let n = s; n < L.length; n++) {
				let i = L[n];
				i.kind !== "previous" && (e.stacked || i.series === 0) && (t = a ? Math.max(t, i.x + i.width) : Math.min(t, i.y), e.stacked || (r = a ? i.y + i.height / 2 : i.x + i.width / 2));
			}
			z.push(a ? {
				bucket: n,
				x: t + Co,
				y: r,
				text: Fo(c, o - (t + Co)),
				anchor: "start"
			} : {
				bucket: n,
				x: jo(r, fo * Ao(c) / 2, o),
				y: t - Co,
				text: c,
				anchor: "middle"
			});
		}
	});
	let B = null;
	if (e.derive?.kind === "running_total" && I) {
		let t = (e) => (T(e) ?? 0) + E / 2, n = e.buckets.flatMap((e, n) => $(e.derived) ? [{
			bucket: n,
			cx: a ? w(e.derived) : t(n),
			cy: a ? t(n) : w(e.derived),
			hollow: e.filled
		}] : []);
		if (n.length > 0) {
			let t = Array.from({ length: e.buckets.length }, () => null);
			for (let e of n) t[e.bucket] = [e.cx, e.cy];
			B = {
				d: qo(t) ?? "",
				dots: n
			};
		}
	}
	let V = a ? c.map((e, t) => ({
		at: (T(t) ?? 0) + E / 2,
		label: Fo(e, x - _o),
		full: e
	})) : p ? Go(c, T) : [];
	return {
		plot: C,
		marks: L,
		targets: R,
		labels: z,
		running: B,
		valueTicks: v.map((e, t) => ({
			at: w(e),
			label: y[t],
			full: y[t]
		})),
		categoryTicks: V,
		zero: D,
		hits: Ko(T, e.buckets.length, C, a),
		unit: Vo(i, C)
	};
}
var Xo = "var(--k-chart-other)", Zo = (e) => Math.round(e * 1e3) / 1e3, Qo = (e) => e.length >= 2 && e.length <= 4;
function $o(e, t, n, r = fe.en, i) {
	let a = $(t.width) ? Math.max(0, t.width) : 0, o = $(t.height) ? Math.max(0, t.height) : 0, s = i?.categoryLabels !== !1, c = Bo(i), l = Math.max(0, o - c - (s ? mo : po)), u = Lo(e, n, null, l), d = e.buckets.map((e) => e.label), f = e.buckets.length, p = e.series.map((e, t) => t).filter((e) => !n.has(e)), m = (t, n) => {
		let r = e.buckets[t].values[n];
		return $(r) ? r : null;
	}, h = (e) => {
		for (let t = f - 1; t >= 0; t--) if (m(t, e) !== null) return t;
		return -1;
	}, g = !i && Qo(p) ? p.filter((e) => h(e) >= 0) : [], _ = g.length > 0 ? ko(fo * Math.max(...g.map((t) => Ao(e.series[t].label))) + So, 0, vo) : 0, v = i?.valueGutter ?? Ro(u.widest), y = Math.max(Ho(Uo(d)), _), b = {
		x: v,
		y: c,
		width: Math.max(0, a - v - y),
		height: l
	}, x = uo().domain([u.lo, u.hi]).range([b.y + b.height, b.y]), S = Wo(f, [b.x, b.x + b.width]), C = e.buckets.map((e, t) => (S(t) ?? 0) + S.bandwidth() / 2), w = (t) => yt(e.series[t].color) || Xo, T = Array.from({ length: f }, (e, t) => t), E = ko(S.bandwidth() * .4, 3, 24), D = (e, t, n = hr) => {
		let r = (t) => e[t] !== null && e[t] !== void 0, i = (e) => t && r(e) && !r(e - 1) && !r(e + 1), a = Gn().defined((e) => r(e) && !i(e)).x((e) => C[e]).y((t) => x(e[t])).curve(n)(T), o = T.filter(i).map((t) => {
			let n = Zo(x(e[t]));
			return `M${Zo(C[t] - E)},${n}L${Zo(C[t] + E)},${n}`;
		});
		return `${a ?? ""}${o.join("")}`;
	}, O = (e) => $(e) ? e : null, k = [];
	if (No(e, n)) {
		let t = D(e.buckets.map((e) => O(e.previous)), !0);
		t && k.push({
			series: 0,
			kind: "previous",
			d: t,
			stroke: w(0),
			opacity: xo,
			dashed: !1
		});
	}
	let A = D(e.buckets.map((e) => O(e.target)), !0);
	A && k.push({
		series: -1,
		kind: "target",
		d: A,
		stroke: "var(--k-fg)",
		opacity: 1,
		dashed: !0
	});
	let j = [];
	for (let t of p) {
		let n = D(e.buckets.map((e, n) => m(n, t)), !1);
		n && k.push({
			series: t,
			kind: "value",
			d: n,
			stroke: w(t),
			opacity: 1,
			dashed: !1
		});
		let i = e.series[t];
		e.buckets.forEach((n, a) => {
			let o = m(a, t);
			o !== null && j.push({
				series: t,
				bucket: a,
				cx: C[a],
				cy: x(o),
				hollow: n.filled,
				stroke: w(t),
				drill: n.filled ? null : n.drills[t] ?? null,
				summary: `${n.label}, ${i.label}: ${n.filled ? r.tileFilled : e.format(o)}`
			});
		});
	}
	if (e.derive?.kind === "running_total" && Mo(e, n)) {
		let t = D(e.buckets.map((e) => O(e.derived)), !0, Hn);
		t && k.push({
			series: -1,
			kind: "running",
			d: t,
			stroke: "var(--k-fg)",
			opacity: To,
			dashed: !1
		});
	}
	let M = g.map((t) => {
		let n = h(t);
		return {
			series: t,
			x: C[n] + So,
			y: x(m(n, t)),
			text: Fo(e.series[t].label, _ - So)
		};
	}), N = [...M].sort((e, t) => e.y - t.y || e.series - t.series);
	for (let e = 1; e < N.length; e++) N[e].y = Math.max(N[e].y, N[e - 1].y + Eo);
	let P = b.y + b.height;
	for (let e = N.length - 1; e >= 0; e--) N[e].y = Math.min(N[e].y, P), P = N[e].y - Eo;
	return {
		plot: b,
		paths: k,
		dots: j,
		labels: M,
		valueTicks: u.ticks.map((e, t) => ({
			at: x(e),
			label: u.labels[t],
			full: u.labels[t]
		})),
		categoryTicks: s ? Go(d, S) : [],
		bucketX: C,
		zero: u.lo < 0 && u.hi > 0 ? x(0) : null,
		hits: Ko(S, f, b, !1),
		unit: Vo(i, b)
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
var is = e("<line part=\"zero\" aria-hidden=\"true\" stroke-width=\"1.5\" class=\"svelte-1klqngy\"></line>"), as = e("<path aria-hidden=\"true\" stroke-linejoin=\"round\" class=\"svelte-1klqngy\"></path>"), os = e("<circle data-kind=\"dot\" r=\"3.5\" stroke-width=\"2\" class=\"svelte-1klqngy\"></circle>"), ss = e("<text class=\"name svelte-1klqngy\" dominant-baseline=\"central\"> </text>"), cs = e("<!><!><!><g aria-hidden=\"true\" class=\"svelte-1klqngy\"></g>", 1), ls = {
	hash: "svelte-1klqngy",
	code: ".name.svelte-1klqngy {font-size:11px;font-weight:500;}path.svelte-1klqngy, circle.svelte-1klqngy, .name.svelte-1klqngy {transition:opacity 120ms;}[aria-hidden='true'].svelte-1klqngy {pointer-events:none;}[tabindex].svelte-1klqngy {outline:none;-webkit-tap-highlight-color:transparent;}[role='button'].svelte-1klqngy:not([aria-disabled='true']) {cursor:pointer;}[tabindex].svelte-1klqngy:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}\n  @media (prefers-reduced-motion: reduce) {path.svelte-1klqngy, circle.svelte-1klqngy, .name.svelte-1klqngy {transition:none;}\n  }"
};
function us(e, n) {
	P(n, !0), r(e, ls);
	let i = _(n, "layout", 7), a = _(n, "opens", 7), o = _(n, "tab", 7), c = _(n, "emphasis", 7), u = _(n, "onkey", 7), g = _(n, "onopen", 7), v = (e, t = 1) => c() !== null && e >= 0 && e !== c() ? Math.min(t, .25) : t;
	var y = {
		get layout() {
			return i();
		},
		set layout(e) {
			i(e), t();
		},
		get opens() {
			return a();
		},
		set opens(e) {
			a(e), t();
		},
		get tab() {
			return o();
		},
		set tab(e) {
			o(e), t();
		},
		get emphasis() {
			return c();
		},
		set emphasis(e) {
			c(e), t();
		},
		get onkey() {
			return u();
		},
		set onkey(e) {
			u(e), t();
		},
		get onopen() {
			return g();
		},
		set onopen(e) {
			g(e), t();
		}
	}, b = cs(), x = I(b), S = (e) => {
		var t = is();
		N(t, "", {}, { stroke: "var(--k-chart-axis)" }), U(() => {
			d(t, "x1", i().plot.x), d(t, "y1", i().zero), d(t, "x2", i().plot.x + i().plot.width), d(t, "y2", i().zero);
		}), m(e, t);
	};
	p(x, (e) => {
		i().zero !== null && e(S);
	});
	var C = k(x);
	f(C, 17, () => i().paths, (e) => `${e.kind}:${e.series}`, (e, t) => {
		var n = as();
		let r;
		U((e) => {
			d(n, "data-kind", z(t).kind), d(n, "data-series", z(t).series), d(n, "d", z(t).d), d(n, "stroke-width", z(t).kind === "target" || z(t).kind === "running" ? 1.5 : 2), d(n, "stroke-linecap", z(t).dashed ? "butt" : "round"), d(n, "stroke-dasharray", z(t).dashed ? "4 3" : void 0), r = N(n, "", r, {
				fill: "none",
				stroke: z(t).stroke,
				opacity: e
			});
		}, [() => v(z(t).series, z(t).opacity)]), m(e, n);
	});
	var w = k(C);
	f(w, 17, () => i().dots, (e) => `${e.series}:${e.bucket}`, (e, t) => {
		var n = os();
		let r;
		U((e) => {
			d(n, "role", a() ? "button" : "img"), d(n, "tabindex", o()?.bucket === z(t).bucket && o().series === z(t).series ? 0 : -1), d(n, "aria-label", z(t).summary), d(n, "aria-disabled", a() && !z(t).drill ? "true" : void 0), d(n, "data-bucket", z(t).bucket), d(n, "data-series", z(t).series), d(n, "cx", z(t).cx), d(n, "cy", z(t).cy), r = N(n, "", r, {
				fill: z(t).hollow ? "var(--k-surface)" : z(t).stroke,
				stroke: z(t).stroke,
				opacity: e
			});
		}, [() => v(z(t).series)]), H("click", n, (e) => g()(z(t), e)), M("auxclick", n, (e) => g()(z(t), e)), H("keydown", n, (e) => u()(e, z(t))), m(e, n);
	});
	var T = k(w);
	return f(T, 21, () => i().labels, (e) => e.series, (e, t) => {
		var n = ss();
		let r;
		var i = A(n, !0);
		U((e) => {
			d(n, "x", z(t).x), d(n, "y", z(t).y), r = N(n, "", r, {
				fill: "var(--k-fg)",
				opacity: e
			}), h(i, z(t).text);
		}, [() => v(z(t).series)]), m(e, n);
	}), l(T), m(e, b), s(y);
}
L(["click", "keydown"]), O(us, {
	layout: {},
	opens: {},
	tab: {},
	emphasis: {},
	onkey: {},
	onopen: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Pie.svelte
var ds = e("<path part=\"slice\" data-kind=\"slice\" data-series=\"0\" stroke-width=\"2\" stroke-linejoin=\"round\" class=\"svelte-11o6kon\"></path>"), fs = e("<g></g>"), ps = {
	hash: "svelte-11o6kon",
	code: "path.svelte-11o6kon {outline:none;-webkit-tap-highlight-color:transparent;}path[role='button'].svelte-11o6kon:not([aria-disabled='true']) {cursor:pointer;}path.svelte-11o6kon:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}"
};
function ms(e, n) {
	P(n, !0), r(e, ps);
	let i = _(n, "layout", 7), a = _(n, "ids", 7), o = _(n, "opens", 7), c = _(n, "tab", 7), u = _(n, "onkey", 7), p = _(n, "onopen", 7), h = (e) => e.pattern ? `url(#${a()[e.pattern]})` : e.fill || "var(--k-chart-other)", g = (e) => ({
		bucket: e.bucket,
		series: 0,
		drill: e.drill
	});
	var v = {
		get layout() {
			return i();
		},
		set layout(e) {
			i(e), t();
		},
		get ids() {
			return a();
		},
		set ids(e) {
			a(e), t();
		},
		get opens() {
			return o();
		},
		set opens(e) {
			o(e), t();
		},
		get tab() {
			return c();
		},
		set tab(e) {
			c(e), t();
		},
		get onkey() {
			return u();
		},
		set onkey(e) {
			u(e), t();
		},
		get onopen() {
			return p();
		},
		set onopen(e) {
			p(e), t();
		}
	}, y = fs();
	return f(y, 21, () => i().slices, (e) => e.bucket, (e, t) => {
		var n = ds();
		let r;
		U((e) => {
			d(n, "role", o() ? "button" : "img"), d(n, "tabindex", c()?.bucket === z(t).bucket ? 0 : -1), d(n, "aria-label", z(t).summary), d(n, "aria-disabled", o() && !z(t).drill ? "true" : void 0), d(n, "data-bucket", z(t).bucket), d(n, "d", z(t).d), r = N(n, "", r, {
				fill: e,
				stroke: "var(--k-surface)"
			});
		}, [() => h(z(t))]), H("click", n, (e) => p()(g(z(t)), e)), M("auxclick", n, (e) => p()(g(z(t)), e)), H("keydown", n, (e) => u()(e, g(z(t)))), m(e, n);
	}), l(y), U(() => d(y, "transform", `translate(${i().cx ?? ""} ${i().cy ?? ""})`)), m(e, y), s(v);
}
L(["click", "keydown"]), O(ms, {
	layout: {},
	ids: {},
	opens: {},
	tab: {},
	onkey: {},
	onopen: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/ChartPlot.svelte
var hs = e("<rect class=\"strip svelte-1ycirdq\" aria-hidden=\"true\"></rect>"), gs = e("<line class=\"crosshair svelte-1ycirdq\"></line>"), _s = e("<!><!>", 1), vs = u("<div class=\"panel svelte-1ycirdq\"><svg class=\"svelte-1ycirdq\"><!><!><g part=\"plot\" role=\"group\"><!><!></g></svg></div>"), ys = {
	hash: "svelte-1ycirdq",
	code: ".panel.svelte-1ycirdq {position:relative;flex:1 1 0;min-width:0;min-height:0;}svg.svelte-1ycirdq {position:absolute;inset:0;display:block;width:100%;height:100%;}.strip.svelte-1ycirdq {fill:transparent;}.crosshair.svelte-1ycirdq {stroke-width:1;pointer-events:none;}"
};
function bs(e, i) {
	let a = T();
	P(i, !0), r(e, ys);
	let o = _(i, "model", 7), u = _(i, "size", 7), h = _(i, "options", 7), g = _(i, "hidden", 7), v = _(i, "emphasis", 7), y = _(i, "active", 7), x = _(i, "text", 7), C = _(i, "label", 7), w = _(i, "host", 7), E = _(i, "ontip", 7), O = {
		other: `${a}-other`,
		restricted: `${a}-restricted`
	}, A = re(void 0), j = re(null), F = null, L = W(() => ze(o().type)), R = W(() => o().type === "bar" || o().type === "column" ? Yo(o(), u(), g(), x(), h()) : null), B = W(() => o().type === "line" ? $o(o(), u(), g(), x(), h()) : null), ee = W(() => z(L) ? rs(o(), u()) : null), te = W(() => (z(B) ?? z(R))?.hits ?? []), ne = W(() => en(z(j), o(), g())), G = W(() => o().drill.enabled), ie = W(() => o().unitLabel ? `${C() || o().splitLabel} · ${o().unitLabel}` : C() || o().splitLabel);
	D(() => {
		let e = o(), t = F;
		e !== t && (F = e, t && S(() => {
			K(j, t.type === e.type ? en(z(j), e, g()) : null);
		}));
	});
	let ae = "[data-bucket][tabindex]", oe = (e) => e.target?.closest(ae) ?? null;
	function se(e) {
		let t = (e) => {
			let t = e.getBoundingClientRect();
			return o().type === "bar" ? t.right : -t.top;
		}, n = null;
		for (let r of z(A)?.querySelectorAll(`${ae}[data-bucket="${e}"]`) ?? []) (!n || t(r) > t(n)) && (n = r);
		return n;
	}
	function ce(e, t) {
		t instanceof MouseEvent && !Gt(t) || e?.drill && me(w(), "af-drill", {
			...e.drill,
			newTab: Wt(t)
		});
	}
	function le(e, t) {
		let n = Gt(t) ? on(o(), e, g()) : null;
		n && me(w(), "af-drill", {
			...n,
			newTab: Wt(t)
		});
	}
	function ue(e) {
		let t = (e) => {
			z(G) && Kt(e);
		};
		return e.addEventListener("mousedown", t), () => e.removeEventListener("mousedown", t);
	}
	function de(e) {
		let t = e.target?.closest("[data-bucket]");
		if (!t) return;
		let n = Number(t.dataset.bucket);
		y() !== n && E()({
			bucket: n,
			anchor: se(n) ?? t
		});
	}
	function q(e) {
		let t = oe(e);
		if (!t) return;
		let n = Number(t.dataset.bucket);
		K(j, {
			bucket: n,
			series: Number(t.dataset.series)
		}), E()({
			bucket: n,
			anchor: t
		});
	}
	function fe(e) {
		z(A) && e.relatedTarget instanceof Node && z(A).contains(e.relatedTarget) || E()(null);
	}
	function pe(e, t) {
		if (!e.altKey) {
			if (e.key === "Enter" || e.key === " ") e.preventDefault(), ce(t, e);
			else if (Xt(e.key) && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				let n = {
					bucket: t.bucket,
					series: t.series
				}, r = $t(n, e.key, o(), g());
				r !== n && z(A)?.querySelector(`${ae}[data-bucket="${r.bucket}"][data-series="${r.series}"]`)?.focus();
			}
		}
	}
	var he = {
		get model() {
			return o();
		},
		set model(e) {
			o(e), t();
		},
		get size() {
			return u();
		},
		set size(e) {
			u(e), t();
		},
		get options() {
			return h();
		},
		set options(e) {
			h(e), t();
		},
		get hidden() {
			return g();
		},
		set hidden(e) {
			g(e), t();
		},
		get emphasis() {
			return v();
		},
		set emphasis(e) {
			v(e), t();
		},
		get active() {
			return y();
		},
		set active(e) {
			y(e), t();
		},
		get text() {
			return x();
		},
		set text(e) {
			x(e), t();
		},
		get label() {
			return C();
		},
		set label(e) {
			C(e), t();
		},
		get host() {
			return w();
		},
		set host(e) {
			w(e), t();
		},
		get ontip() {
			return E();
		},
		set ontip(e) {
			E(e), t();
		}
	}, ge = vs(), _e = V(ge), ve = V(_e);
	Ut(ve, { get ids() {
		return O;
	} });
	var ye = k(ve), be = (e) => {
		jt(e, {
			get layout() {
				return z(B);
			},
			horizontal: !1
		});
	}, xe = (e) => {
		{
			let t = W(() => o().type === "bar");
			jt(e, {
				get layout() {
					return z(R);
				},
				get zero() {
					return z(R).zero;
				},
				get horizontal() {
					return z(t);
				}
			});
		}
	};
	p(ye, (e) => {
		z(B) ? e(be) : z(R) && e(xe, 1);
	});
	var Se = k(ye), Ce = V(Se);
	f(Ce, 17, () => z(te), n, (e, t, n) => {
		var r = hs();
		d(r, "data-bucket", n), U(() => {
			d(r, "x", z(t).x), d(r, "y", z(t).y), d(r, "width", z(t).width), d(r, "height", z(t).height);
		}), H("click", r, (e) => le(n, e)), M("auxclick", r, (e) => le(n, e)), m(e, r);
	});
	var we = k(Ce), Te = (e) => {
		var t = _s(), n = I(t), r = (e) => {
			var t = gs();
			N(t, "", {}, { stroke: "var(--k-chart-axis)" }), U(() => {
				d(t, "x1", z(B).bucketX[y()]), d(t, "y1", z(B).plot.y), d(t, "x2", z(B).bucketX[y()]), d(t, "y2", z(B).plot.y + z(B).plot.height);
			}), m(e, t);
		};
		p(n, (e) => {
			y() !== null && e(r);
		}), us(k(n), {
			get layout() {
				return z(B);
			},
			get opens() {
				return z(G);
			},
			get tab() {
				return z(ne);
			},
			get emphasis() {
				return v();
			},
			onkey: pe,
			onopen: ce
		}), m(e, t);
	}, Ee = (e) => {
		Vt(e, {
			get marks() {
				return z(R).marks;
			},
			get targets() {
				return z(R).targets;
			},
			get labels() {
				return z(R).labels;
			},
			get running() {
				return z(R).running;
			},
			get ids() {
				return O;
			},
			get opens() {
				return z(G);
			},
			get tab() {
				return z(ne);
			},
			get emphasis() {
				return v();
			},
			onkey: pe,
			onopen: ce
		});
	}, De = (e) => {
		ms(e, {
			get layout() {
				return z(ee);
			},
			get ids() {
				return O;
			},
			get opens() {
				return z(G);
			},
			get tab() {
				return z(ne);
			},
			onkey: pe,
			onopen: ce
		});
	};
	return p(we, (e) => {
		z(B) ? e(Te) : z(R) ? e(Ee, 1) : z(ee) && e(De, 2);
	}), l(Se), b(Se, (e) => K(A, e), () => z(A)), c(Se, () => ue), l(_e), l(ge), U(() => {
		d(_e, "viewBox", `0 0 ${u().width ?? ""} ${u().height ?? ""}`), d(Se, "aria-label", z(ie));
	}), H("pointerover", Se, de), M("pointerleave", Se, () => E()(null)), H("focusin", Se, q), H("focusout", Se, fe), m(e, ge), s(he);
}
L([
	"pointerover",
	"focusin",
	"focusout",
	"click"
]), O(bs, {
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
var xs = u("<span class=\"run svelte-1etllxt\"></span><span class=\"point svelte-1etllxt\"></span>", 1), Ss = u("<span aria-hidden=\"true\"><!></span>"), Cs = {
	hash: "svelte-1etllxt",
	code: ".swatch.svelte-1etllxt {display:inline-block;flex:none;width:10px;height:10px;border-radius:2px;background:var(--tone);}.swatch.faint.svelte-1etllxt {opacity:0.4;}.box.other.svelte-1etllxt {background:repeating-linear-gradient(45deg, var(--k-chart-hatch) 0 2px, var(--k-chart-other) 2px 6px);}.box.restricted.svelte-1etllxt {background:repeating-linear-gradient(-45deg, var(--k-chart-hatch) 0 2px, var(--k-chart-other) 2px 6px);}.line.svelte-1etllxt {width:14px;height:2px;border-radius:1px;}\n  /* The running total as the chart draws it: a line at 0.7 with a dot on it. A target's rule has neither. */.ink.svelte-1etllxt {position:relative;width:14px;height:2px;border-radius:0;background:none;}.run.svelte-1etllxt {position:absolute;inset:0;border-radius:1px;background:var(--k-fg);opacity:0.7;}.point.svelte-1etllxt {position:absolute;top:50%;left:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:var(--k-fg);}.rule.svelte-1etllxt {width:14px;height:2px;border-radius:0;background:var(--k-fg);}.dashed.svelte-1etllxt {width:14px;height:0;border-top:2px dashed var(--k-fg);border-radius:0;background:none;}.outline.svelte-1etllxt {box-sizing:border-box;border:1px dashed var(--tone);background:none;}.hollow.svelte-1etllxt {box-sizing:border-box;width:8px;height:8px;border:2px solid var(--tone);border-radius:50%;background:none;}"
};
function ws(e, n) {
	P(n, !0), r(e, Cs);
	let i = _(n, "color", 7, null), c = _(n, "pattern", 7, null), u = _(n, "shape", 7, "box"), d = _(n, "faint", 7, !1);
	var f = {
		get color() {
			return i();
		},
		set color(e = null) {
			i(e), t();
		},
		get pattern() {
			return c();
		},
		set pattern(e = null) {
			c(e), t();
		},
		get shape() {
			return u();
		},
		set shape(e = "box") {
			u(e), t();
		},
		get faint() {
			return d();
		},
		set faint(e = !1) {
			d(e), t();
		}
	}, h = Ss();
	let g, v;
	var y = V(h), b = (e) => {
		var t = xs();
		o(), m(e, t);
	};
	return p(y, (e) => {
		u() === "ink" && e(b);
	}), l(h), U((e) => {
		g = a(h, 1, `swatch ${u() ?? ""}`, "svelte-1etllxt", g, {
			other: c() === "other",
			restricted: c() === "restricted",
			faint: d()
		}), v = N(h, "", v, { "--tone": e });
	}, [() => yt(i()) || "var(--k-chart-other)"]), m(e, h), s(f);
}
O(ws, {
	color: {},
	pattern: {},
	shape: {},
	faint: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/ChartTooltip.svelte
var Ts = u("<div class=\"row svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"><!> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), Es = u("<div class=\"row svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), Ds = u("<div class=\"row muted svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), Os = u("<div class=\"row muted svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div> <div class=\"row muted svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>", 1), ks = u("<div class=\"row strong svelte-10zvhfs\"><span class=\"name svelte-10zvhfs\"> </span><span class=\"value svelte-10zvhfs\"> </span></div>"), As = u("<div class=\"hint svelte-10zvhfs\"> </div>"), js = u("<div class=\"body af-overlay svelte-10zvhfs\"><div class=\"title svelte-10zvhfs\"> </div> <!> <!> <!> <!> <!> <!> <!></div>"), Ms = u("<div class=\"tip svelte-10zvhfs\" part=\"tooltip\" role=\"tooltip\" popover=\"manual\"><!></div>"), Ns = {
	hash: "svelte-10zvhfs",
	code: ".tip.svelte-10zvhfs {width:max-content;max-width:min(320px, calc(100vw - 8px));pointer-events:none;font-size:12px;line-height:18px;}.body.svelte-10zvhfs {padding:6px 10px;}.title.svelte-10zvhfs {margin-bottom:2px;font-weight:600;overflow-wrap:anywhere;}.row.svelte-10zvhfs {display:flex;align-items:center;justify-content:space-between;gap:16px;}.name.svelte-10zvhfs {display:inline-flex;align-items:center;gap:6px;min-width:0;overflow-wrap:anywhere;}.value.svelte-10zvhfs {font-variant-numeric:tabular-nums;text-align:end;white-space:nowrap;}.muted.svelte-10zvhfs {color:var(--k-muted);}.strong.svelte-10zvhfs {font-weight:600;}.hint.svelte-10zvhfs {margin-top:4px;padding-top:4px;border-top:1px solid var(--k-line);color:var(--k-muted);}"
};
function Ps(e, i) {
	P(i, !0), r(e, Ns);
	let a = _(i, "model", 7), o = _(i, "anchor", 7), c = _(i, "side", 7), u = _(i, "line", 7), d = _(i, "text", 7), g = _(i, "host", 7), y = re(void 0), x = re(v({
		left: 0,
		top: 0
	})), S = !1;
	w(() => () => {
		S && (g().dataset.raised = "false");
	}), w(() => {
		let e = z(y), t = a() !== null && !!o()?.isConnected;
		if (he(e, t, g()), S = t && !!e?.isConnected, e && t && o()) {
			let t = {
				width: document.documentElement.clientWidth,
				height: document.documentElement.clientHeight
			};
			K(x, dn(o().getBoundingClientRect(), {
				width: e.offsetWidth,
				height: e.offsetHeight
			}, t, c()), !0);
		}
	});
	var C = {
		get model() {
			return a();
		},
		set model(e) {
			a(e), t();
		},
		get anchor() {
			return o();
		},
		set anchor(e) {
			o(e), t();
		},
		get side() {
			return c();
		},
		set side(e) {
			c(e), t();
		},
		get line() {
			return u();
		},
		set line(e) {
			u(e), t();
		},
		get text() {
			return d();
		},
		set text(e) {
			d(e), t();
		},
		get host() {
			return g();
		},
		set host(e) {
			g(e), t();
		}
	}, T = Ms();
	let E;
	var D = V(T), O = (e) => {
		var t = js(), r = V(t), i = A(r, !0), o = k(r, 2);
		f(o, 17, () => a().rows, n, (e, t) => {
			var n = Ts(), r = V(n), i = V(r);
			{
				let e = W(() => u() ? "line" : "box");
				ws(i, {
					get color() {
						return z(t).color;
					},
					get pattern() {
						return z(t).pattern;
					},
					get shape() {
						return z(e);
					}
				});
			}
			var a = k(i, 1, !0);
			l(r);
			var o = k(r), s = A(o, !0);
			l(n), U(() => {
				h(a, z(t).label), h(s, z(t).value);
			}), m(e, n);
		});
		var s = k(o, 2), c = (e) => {
			var t = Es(), n = V(t), r = A(n, !0), i = k(n), o = A(i, !0);
			l(t), U(() => {
				h(r, d().tileShare), h(o, a().share);
			}), m(e, t);
		};
		p(s, (e) => {
			a().share !== null && e(c);
		});
		var g = k(s, 2), _ = (e) => {
			var t = Ds(), n = V(t), r = A(n, !0), i = k(n), o = A(i, !0);
			l(t), U(() => {
				h(r, d().tileTarget), h(o, a().target);
			}), m(e, t);
		};
		p(g, (e) => {
			a().target !== null && e(_);
		});
		var v = k(g, 2), y = (e) => {
			var t = Ds(), n = V(t), r = A(n, !0), i = k(n), o = A(i, !0);
			l(t), U(() => {
				h(r, a().derived.label), h(o, a().derived.value);
			}), m(e, t);
		};
		p(v, (e) => {
			a().derived !== null && e(y);
		});
		var b = k(v, 2), x = (e) => {
			var t = Os(), n = I(t), r = V(n), i = A(r, !0), o = k(r), s = A(o, !0);
			l(n);
			var c = k(n, 2), u = V(c), f = A(u, !0), p = k(u), g = A(p, !0);
			l(c), U(() => {
				h(i, d().tileEarlier), h(s, a().earlier), h(f, d().tileDifference), h(g, a().change);
			}), m(e, t);
		};
		p(b, (e) => {
			a().earlier !== null && e(x);
		});
		var S = k(b, 2), C = (e) => {
			var t = ks(), n = V(t), r = A(n, !0), i = k(n), o = A(i, !0);
			l(t), U(() => {
				h(r, d().tileBarTotal), h(o, a().total);
			}), m(e, t);
		};
		p(S, (e) => {
			a().total !== null && e(C);
		});
		var w = k(S, 2), T = (e) => {
			var t = As(), n = A(t, !0);
			U(() => h(n, a().hint)), m(e, t);
		};
		p(w, (e) => {
			a().hint && e(T);
		}), l(t), U(() => h(i, a().title)), m(e, t);
	};
	return p(D, (e) => {
		a() && e(O);
	}), l(T), b(T, (e) => K(y, e), () => z(y)), U(() => E = N(T, "", E, {
		left: `${z(x).left ?? ""}px`,
		top: `${z(x).top ?? ""}px`
	})), m(e, T), s(C);
}
O(Ps, {
	model: {},
	anchor: {},
	side: {},
	line: {},
	text: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/DataTable.svelte
var Fs = u("<caption class=\"sr svelte-1rlplzt\"> </caption>"), Is = u("<th scope=\"col\" class=\"svelte-1rlplzt\"> </th>"), Ls = u("<th scope=\"row\" class=\"svelte-1rlplzt\"> </th>"), Rs = u("<td class=\"svelte-1rlplzt\"> </td>"), zs = u("<tr class=\"svelte-1rlplzt\"></tr>"), Bs = u("<table part=\"table\" class=\"svelte-1rlplzt\"><!><thead><tr></tr></thead><tbody class=\"svelte-1rlplzt\"></tbody></table>"), Vs = u("<div class=\"box svelte-1rlplzt\"><!></div>"), Hs = {
	hash: "svelte-1rlplzt",
	code: ".box.svelte-1rlplzt {display:flex;flex:0 1 auto;flex-direction:column;min-height:0;max-width:100%;}.sr.svelte-1rlplzt {position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}table.svelte-1rlplzt {width:100%;border-collapse:collapse;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;}th.svelte-1rlplzt, td.svelte-1rlplzt {padding:4px 8px;border-bottom:1px solid var(--k-line);text-align:end;white-space:nowrap;}th.svelte-1rlplzt {color:var(--k-muted);font-weight:600;}tbody.svelte-1rlplzt th:where(.svelte-1rlplzt) {color:var(--k-fg);font-weight:400;}td.svelte-1rlplzt {color:var(--k-fg);}th.svelte-1rlplzt:first-child {text-align:start;}tbody.svelte-1rlplzt tr:where(.svelte-1rlplzt):last-child > :where(.svelte-1rlplzt) {border-bottom:0;}"
};
function Us(e, i) {
	P(i, !0), r(e, Hs);
	let a = _(i, "head", 7), o = _(i, "rows", 7), c = _(i, "label", 7);
	var u = {
		get head() {
			return a();
		},
		set head(e) {
			a(e), t();
		},
		get rows() {
			return o();
		},
		set rows(e) {
			o(e), t();
		},
		get label() {
			return c();
		},
		set label(e) {
			c(e), t();
		}
	}, d = Vs(), v = V(d);
	{
		let e = W(() => c() || null);
		ye(v, {
			axis: "both",
			get label() {
				return z(e);
			},
			children: (e, t) => {
				var r = Bs(), i = V(r), s = (e) => {
					var t = Fs(), n = A(t, !0);
					U(() => h(n, c())), m(e, t);
				};
				p(i, (e) => {
					c() && e(s);
				});
				var u = k(i), d = V(u);
				f(d, 21, a, n, (e, t) => {
					var n = Is(), r = A(n, !0);
					U(() => h(r, z(t))), m(e, n);
				}), l(d), l(u);
				var _ = k(u);
				f(_, 21, o, n, (e, t) => {
					var r = zs();
					f(r, 21, () => z(t), n, (e, t, n) => {
						var r = g(), i = I(r), a = (e) => {
							var n = Ls(), r = A(n, !0);
							U(() => h(r, z(t))), m(e, n);
						}, o = (e) => {
							var n = Rs(), r = A(n, !0);
							U(() => h(r, z(t))), m(e, n);
						};
						p(i, (e) => {
							n === 0 ? e(a) : e(o, -1);
						}), m(e, r);
					}), l(r), m(e, r);
				}), l(_), l(r), m(e, r);
			},
			$$slots: { default: !0 }
		});
	}
	return l(d), m(e, d), s(u);
}
O(Us, {
	head: {},
	rows: {},
	label: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Legend.svelte
var Ws = u("<button type=\"button\" part=\"legend-item\"><!> </button>"), Gs = u("<span class=\"item slice svelte-1kw4d6\" part=\"legend-item\"><!> <span class=\"detail svelte-1kw4d6\"> </span></span>"), Ks = u("<span class=\"item plain svelte-1kw4d6\" part=\"legend-item\"><!> </span>"), qs = u("<div class=\"legend svelte-1kw4d6\" part=\"legend\"></div>"), Js = {
	hash: "svelte-1kw4d6",
	code: ".legend.svelte-1kw4d6 {display:flex;flex-wrap:wrap;gap:0 12px;font-size:12px;line-height:18px;}.item.svelte-1kw4d6 {display:inline-flex;align-items:center;gap:6px;min-height:24px;min-width:0;margin:0;padding:0 4px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;}.plain.svelte-1kw4d6, .detail.svelte-1kw4d6 {color:var(--k-muted);}.detail.svelte-1kw4d6 {font-variant-numeric:tabular-nums;white-space:nowrap;}\n  /* A figure that does not fit beside its slice's name goes under it whole, not broken between its value and its share. */.slice.svelte-1kw4d6 {flex-wrap:wrap;}button.item.svelte-1kw4d6 {cursor:pointer;-webkit-tap-highlight-color:transparent;}\n  @media (hover: hover) {button.item.svelte-1kw4d6:hover {background:var(--k-hover);} }button.item.svelte-1kw4d6:focus-visible {outline:2px solid var(--k-primary);outline-offset:1px;}.off.svelte-1kw4d6 {color:var(--k-muted);}"
};
function Ys(e, i) {
	P(i, !0), r(e, Js);
	let o = _(i, "model", 7), c = _(i, "items", 7), u = _(i, "plain", 7), v = _(i, "hidden", 7), y = _(i, "text", 7), b = _(i, "onisolate", 7), x = _(i, "onemphasis", 7), S = W(() => o().type === "line"), C = W(() => o().series.length);
	function w(e) {
		switch (e.kind) {
			case "target": return { shape: z(S) ? "dashed" : "rule" };
			case "running": return { shape: "ink" };
			case "filled": return {
				shape: z(S) ? "hollow" : "outline",
				color: o().series[0]?.color ?? null
			};
			case "earlier": return {
				shape: z(S) ? "line" : "box",
				color: e.color,
				pattern: e.pattern,
				faint: !0
			};
			default: return {
				shape: z(S) ? "line" : "box",
				color: e.color,
				pattern: e.pattern,
				faint: e.series !== null && v().has(e.series)
			};
		}
	}
	var T = {
		get model() {
			return o();
		},
		set model(e) {
			o(e), t();
		},
		get items() {
			return c();
		},
		set items(e) {
			c(e), t();
		},
		get plain() {
			return u();
		},
		set plain(e) {
			u(e), t();
		},
		get hidden() {
			return v();
		},
		set hidden(e) {
			v(e), t();
		},
		get text() {
			return y();
		},
		set text(e) {
			y(e), t();
		},
		get onisolate() {
			return b();
		},
		set onisolate(e) {
			b(e), t();
		},
		get onemphasis() {
			return x();
		},
		set onemphasis(e) {
			x(e), t();
		}
	}, E = qs();
	return f(E, 21, c, n, (e, t) => {
		var n = g(), r = I(n), i = (e) => {
			let n = W(() => z(t).series), r = W(() => tn(v(), z(n), z(C)));
			var i = Ws();
			let o;
			var s = V(i);
			{
				let e = W(() => w(z(t)));
				ws(s, G(() => z(e)));
			}
			var c = k(s, 1, !0);
			l(i), U((e, n) => {
				o = a(i, 1, "item svelte-1kw4d6", null, o, { off: e }), d(i, "aria-pressed", z(r)), d(i, "aria-label", n), d(i, "title", z(r) ? y().tileShowAll : void 0), h(c, z(t).label);
			}, [() => v().has(z(n)), () => q(y().tileIsolate, { series: z(t).label })]), H("click", i, () => b()(z(n))), M("pointerenter", i, () => x()(z(n))), M("pointerleave", i, () => x()(null)), M("focus", i, () => x()(z(n))), M("blur", i, () => x()(null)), m(e, i);
		}, o = (e) => {
			var n = Gs(), r = V(n);
			{
				let e = W(() => w(z(t)));
				ws(r, G(() => z(e)));
			}
			var i = k(r), a = k(i), o = A(a, !0);
			l(n), U(() => {
				h(i, `${z(t).label ?? ""} `), h(o, z(t).detail);
			}), m(e, n);
		}, s = (e) => {
			var n = Ks(), r = V(n), i = (e) => {
				{
					let n = W(() => w(z(t)));
					ws(e, G(() => z(n)));
				}
			};
			p(r, (e) => {
				z(t).kind !== "formula" && e(i);
			});
			var a = k(r, 1, !0);
			l(n), U(() => h(a, z(t).label)), m(e, n);
		};
		p(r, (e) => {
			!u() && z(t).kind === "series" && z(t).series !== null && z(C) > 1 ? e(i) : z(t).kind === "slice" ? e(o, 1) : e(s, -1);
		}), m(e, n);
	}), l(E), m(e, E), s(T);
}
L(["click"]), O(Ys, {
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
var Xs = u("<div class=\"state svelte-9uxzig\" part=\"state\"><p class=\"lead svelte-9uxzig\"> </p></div>"), Zs = u("<div class=\"chart svelte-9uxzig\"></div>"), Qs = u("<!> <!> <!>", 1), $s = {
	hash: "svelte-9uxzig",
	code: ".state.svelte-9uxzig {position:relative;display:grid;gap:4px;padding:16px 0;}.state.svelte-9uxzig p:where(.svelte-9uxzig) {margin:0;}.lead.svelte-9uxzig {font-weight:500;}.chart.svelte-9uxzig {position:relative;display:flex;flex-grow:1;flex-shrink:1;flex-direction:column;min-width:0;}"
};
function ec(e, n) {
	P(n, !0), r(e, $s);
	let i = _(n, "panels", 7), a = _(n, "table", 7), o = _(n, "text", 7), c = _(n, "locale", 7), u = _(n, "label", 7), d = _(n, "host", 7), v = /* @__PURE__ */ new Set(), y = re(void 0), x = re(null), C = re(v), T = re(null), E = re(null), O = null, j = W(() => i()[0]), M = W(() => i().length > 1), F = W(() => ze(z(j).type)), L = W(() => z(j).type === "bar"), R = W(() => z(M) ? z(L) ? Math.max(120, 28 * z(j).buckets.length + 40) : 160 : z(L) ? Math.max(160, 28 * z(j).buckets.length + 40) : 240), B = W(() => Math.max(64, z(L) ? 16 * z(j).buckets.length + 24 : 0)), H = W(() => z(x) ? {
		width: z(x).width,
		height: Math.max(z(B), z(x).height / i().length)
	} : {
		width: 480,
		height: z(R)
	}), ee = W(() => z(M) ? zo(i(), z(C)) : void 0), te = W(() => i().map((e, t) => z(M) ? {
		valueGutter: z(ee),
		categoryLabels: z(L) || t === i().length - 1,
		unitLabel: e.unitLabel
	} : void 0)), ne = W(() => _t(i())), G = W(() => a() ? xt(i(), z(C), o(), c() ?? void 0) : null), ie = W(() => z(T) ? i()[z(T).panel] : void 0), ae = W(() => z(T) && z(ie) ? sn(z(ie), z(T).bucket, z(C), o(), z(ie).drill, c() ?? void 0) : null);
	D(() => {
		let e = i(), t = O;
		e !== t && (O = e, t && S(() => {
			K(C, e.length > 1 ? v : an(z(C), t[0], e[0])), K(T, null), K(E, null);
		}));
	}), D(() => {
		a() && K(T, null);
	}), w(() => {
		let e = z(y);
		if (!e || typeof ResizeObserver > "u") return;
		let t = new ResizeObserver((e) => {
			let t = e[e.length - 1]?.contentRect;
			K(x, t && t.width > 0 ? {
				width: t.width,
				height: t.height
			} : null, !0);
		});
		return t.observe(e), () => t.disconnect();
	});
	function oe(e, t) {
		t ? K(T, {
			panel: e,
			...t
		}) : z(T)?.panel === e && K(T, null);
	}
	var se = {
		get panels() {
			return i();
		},
		set panels(e) {
			i(e), t();
		},
		get table() {
			return a();
		},
		set table(e) {
			a(e), t();
		},
		get text() {
			return o();
		},
		set text(e) {
			o(e), t();
		},
		get locale() {
			return c();
		},
		set locale(e) {
			c(e), t();
		},
		get label() {
			return u();
		},
		set label(e) {
			u(e), t();
		},
		get host() {
			return d();
		},
		set host(e) {
			d(e), t();
		}
	}, ce = g(), le = I(ce), ue = (e) => {
		var t = Xs(), n = V(t), r = A(n, !0);
		l(t), U(() => h(r, o().tileNoBuckets)), m(e, t);
	}, de = (e) => {
		var t = Qs(), n = I(t), r = (e) => {
			{
				let t = W(() => u() || z(j).splitLabel);
				Us(e, {
					get head() {
						return z(G).head;
					},
					get rows() {
						return z(G).rows;
					},
					get label() {
						return z(t);
					}
				});
			}
		}, a = (e) => {
			var t = Zs();
			let n;
			f(t, 23, i, (e, t) => `${i().length}:${t}`, (e, t, n) => {
				{
					let r = W(() => z(T)?.panel === z(n) ? z(T).bucket : null);
					bs(e, {
						get model() {
							return z(t);
						},
						get size() {
							return z(H);
						},
						get options() {
							return z(te)[z(n)];
						},
						get hidden() {
							return z(C);
						},
						get emphasis() {
							return z(E);
						},
						get active() {
							return z(r);
						},
						get text() {
							return o();
						},
						get label() {
							return u();
						},
						get host() {
							return d();
						},
						ontip: (e) => oe(z(n), e)
					});
				}
			}), l(t), b(t, (e) => K(y, e), () => z(y)), U(() => n = N(t, "", n, {
				"flex-basis": `${z(R) * i().length}px`,
				"min-height": `${z(B) * i().length}px`
			})), m(e, t);
		};
		p(n, (e) => {
			z(G) ? e(r) : e(a, -1);
		});
		var s = k(n, 2), c = (e) => {
			Ys(e, {
				get model() {
					return z(j);
				},
				get items() {
					return z(ne);
				},
				get plain() {
					return z(M);
				},
				get hidden() {
					return z(C);
				},
				get text() {
					return o();
				},
				onisolate: (e) => K(C, nn(z(C), e, z(j).series.length)),
				onemphasis: (e) => K(E, e, !0)
			});
		};
		p(s, (e) => {
			z(ne).length > +!z(F) && e(c);
		});
		var h = k(s, 2);
		{
			let e = W(() => z(T)?.anchor ?? null), t = W(() => z(L) ? "beside" : "above"), n = W(() => z(j).type === "line");
			Ps(h, {
				get model() {
					return z(ae);
				},
				get anchor() {
					return z(e);
				},
				get side() {
					return z(t);
				},
				get line() {
					return z(n);
				},
				get text() {
					return o();
				},
				get host() {
					return d();
				}
			});
		}
		m(e, t);
	};
	return p(le, (e) => {
		z(j).empty ? e(ue) : e(de, -1);
	}), m(e, ce), s(se);
}
O(ec, {
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
	let n = t ? ne(t) : void 0, r = null, i = null;
	if (t && (n === "enum" || n === "multi_select")) {
		r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
		for (let e of ie(t)) {
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
		let c = pe(e.slice(s));
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
function Tc(e, t, n, r) {
	let { key: i, field: a, labels: o } = t, s = vc(e.body, i);
	if (s == null || s === "" || Array.isArray(s) && s.length === 0) return "";
	switch (t.type) {
		case "number": return typeof s == "number" ? y(s, a?.format, a?.format_options, r) : hc(s, n, r);
		case "boolean": return typeof s == "boolean" ? s ? n.tileYes : n.tileNo : hc(s, n, r);
		case "date": {
			let e = typeof s == "string" ? de(s.charAt(10) === "T" ? s.slice(0, 10) : s) : null;
			return e ? sc(r).format(e) : hc(s, n, r);
		}
		case "datetime": {
			let e = typeof s == "string" && nc.test(s) ? new Date(s) : null;
			return e && !Number.isNaN(e.getTime()) ? cc(r).format(e) : hc(s, n, r);
		}
		case "enum": return yc(s, o, n, r);
		case "multi_select": return pc(s).map((e) => yc(e, o, n, r)).join(", ");
		case "reference": return xc(s, vc(e.ref_labels, i), n, r);
		case "reference_list": {
			let t = vc(e.ref_labels, i);
			return pc(s).map((e) => xc(e, t, n, r)).join(", ");
		}
		case "file": return Cc(e, i, s, n, r);
		case "list": return Array.isArray(s) ? q(s.length === 1 ? n.tileItemsOne : n.tileItems, { count: uc(r).format(s.length) }) : hc(s, n, r);
		default: return typeof s == "string" ? wc(s, e, n)?.text ?? _c(s) : hc(s, n, r);
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
var Nc = u("<span part=\"badge\" class=\"af-chip svelte-17ihsrp\"> </span>"), Pc = u("<span part=\"badge\" class=\"af-chip neutral svelte-17ihsrp\"> </span>"), Fc = u("<span class=\"chips svelte-17ihsrp\"></span>"), Ic = e("<svg class=\"mark check svelte-17ihsrp\" viewBox=\"0 0 16 16\" width=\"14\" height=\"14\" role=\"img\"><path d=\"M3 8.5l3.2 3.2L13 4.5\"></path></svg>"), Lc = u("<span class=\"mark none svelte-17ihsrp\" role=\"img\">—</span>"), Rc = u("<span part=\"ref\"> </span>"), zc = u("<span class=\"more svelte-17ihsrp\"> </span>"), Bc = u("<span class=\"chips svelte-17ihsrp\"><span part=\"file\"><svg class=\"icon clip svelte-17ihsrp\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48\"></path></svg> <span class=\"name\"> </span></span> <!></span>"), Vc = u("<span class=\"af-avatar mention-avatar svelte-17ihsrp\" aria-hidden=\"true\"> </span>"), Hc = e("<svg part=\"mention-icon\" class=\"icon svelte-17ihsrp\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path></path></svg>"), Uc = u("<span part=\"mention\" class=\"mention svelte-17ihsrp\"><!> <span class=\"label svelte-17ihsrp\"> </span></span>"), Wc = u("<span class=\"bar svelte-17ihsrp\"><span class=\"track svelte-17ihsrp\" aria-hidden=\"true\"><span class=\"fill svelte-17ihsrp\"></span></span> <span class=\"figure svelte-17ihsrp\"> </span></span>"), Gc = u("<span class=\"rating svelte-17ihsrp\"> </span>"), Kc = u("<caption class=\"sr svelte-17ihsrp\"> </caption>"), qc = u("<th scope=\"col\" class=\"svelte-17ihsrp\"> </th>"), Jc = u("<button type=\"button\" class=\"svelte-17ihsrp\"><!></button>"), Yc = u("<td class=\"svelte-17ihsrp\"><!></td>"), Xc = u("<tr class=\"svelte-17ihsrp\"></tr>"), Zc = u("<table part=\"list\"><!><thead><tr></tr></thead><tbody class=\"svelte-17ihsrp\"></tbody></table>"), Qc = u("<div class=\"ring svelte-17ihsrp\"><!></div>"), $c = {
	hash: "svelte-17ihsrp",
	code: "\n  /* The region's focus ring is drawn over it by a box that does not scroll, inside the region's edge. Outside the edge, a\n     host that takes the frame's padding away, as a dashboard card does, leaves it no room, and the frame scrolls, so it\n     would be cut off; as the viewport's own outline, inset, the sticky header row paints over its top, isolated viewport or\n     not. Isolated, so the ring rises above nothing outside the tile. */.ring.svelte-17ihsrp {position:relative;isolation:isolate;display:flex;flex:1 1 auto;flex-direction:column;min-height:0;min-width:0;max-width:100%;}.ring.svelte-17ihsrp > [data-scope='scroll-area'][data-part='root'] > [data-part='viewport']:focus-visible {outline:none;box-shadow:none;}.ring.svelte-17ihsrp:has([data-scope='scroll-area'][data-part='viewport']:focus-visible)::after {content:'';position:absolute;inset:0;z-index:1;border:2px solid var(--k-primary);pointer-events:none;}.sr.svelte-17ihsrp {position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}table.svelte-17ihsrp {width:100%;border-collapse:collapse;font-size:12px;line-height:18px;}th.svelte-17ihsrp, td.svelte-17ihsrp {padding:4px 8px;border-bottom:1px solid var(--k-line);text-align:start;white-space:nowrap;}th.svelte-17ihsrp {position:sticky;top:0;border-bottom:0;background:var(--k-surface);box-shadow:inset 0 -1px 0 var(--k-line);color:var(--k-muted);font-weight:600;}td.svelte-17ihsrp {color:var(--k-fg);}tbody.svelte-17ihsrp tr:where(.svelte-17ihsrp):last-child > td:where(.svelte-17ihsrp) {border-bottom:0;}.open.svelte-17ihsrp tbody:where(.svelte-17ihsrp) tr[data-record]:where(.svelte-17ihsrp) {cursor:pointer;}\n  @media (hover: hover) {.open.svelte-17ihsrp tbody:where(.svelte-17ihsrp) tr[data-record]:where(.svelte-17ihsrp):hover {background:var(--k-hover);} }button.svelte-17ihsrp {margin:0;padding:0;border:0;border-radius:2px;background:none;color:inherit;font:inherit;text-align:start;cursor:pointer;-webkit-tap-highlight-color:transparent;}\n  @media (hover: hover) {button.svelte-17ihsrp:hover {text-decoration:underline;text-decoration-color:var(--k-muted);text-underline-offset:3px;} }button.svelte-17ihsrp:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}.chips.svelte-17ihsrp {display:inline-flex;align-items:center;gap:4px;vertical-align:middle;}\n  /* A badge at the table's own density, so a row with one is no taller than a row with none. */.af-chip.svelte-17ihsrp {padding-block:0;}.mark.svelte-17ihsrp {display:inline-block;vertical-align:middle;}.check.svelte-17ihsrp {fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;color:var(--k-success);}.none.svelte-17ihsrp {color:var(--k-muted);}.bar.svelte-17ihsrp {display:flex;align-items:center;gap:8px;min-width:7.5rem;}.track.svelte-17ihsrp {flex:1 1 auto;height:5px;overflow:hidden;border-radius:999px;background:color-mix(in oklab, var(--k-fg) 12%, var(--k-surface));}.fill.svelte-17ihsrp {display:block;height:100%;border-radius:999px;background:color-mix(in oklab, var(--k-fg) 40%, var(--k-surface));}.figure.svelte-17ihsrp {flex:none;min-width:3.5rem;text-align:end;font-variant-numeric:tabular-nums;}.rating.svelte-17ihsrp {color:var(--k-warning);}\n  /* An id the server named no record for, and a file it named no file for, are chips in the muted ink. */.af-chip.raw.svelte-17ihsrp, .af-chip.unavailable.svelte-17ihsrp {--k-chip-fg: var(--k-muted);}.icon.svelte-17ihsrp {flex:none;width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;}.clip.svelte-17ihsrp {stroke-linecap:round;stroke-linejoin:round;}.more.svelte-17ihsrp {flex:none;color:var(--k-muted);font-size:11px;font-variant-numeric:tabular-nums;}\n  /* The chip the editor draws for a mention, at the table's density. */.mention.svelte-17ihsrp {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:middle;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;}.mention[data-state='restricted'].svelte-17ihsrp, .mention[data-state='deleted'].svelte-17ihsrp {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.mention[data-state='deleted'].svelte-17ihsrp .label:where(.svelte-17ihsrp) {text-decoration:line-through;}.mention-avatar.svelte-17ihsrp {width:16px;height:16px;font-size:10px;line-height:16px;}"
};
function el(e, o) {
	P(o, !0), r(e, $c);
	let u = (e, t = i) => {
		var r = g(), o = I(r), s = (e) => {
			var r = Fc();
			f(r, 21, () => t().options, n, (e, t) => {
				var n = g(), r = I(n), i = (e) => {
					var n = Nc();
					let r;
					var i = A(n, !0);
					U((e, a, o) => {
						r = N(n, "", r, {
							"background-color": e,
							color: a,
							"border-color": o
						}), h(i, z(t).label);
					}, [
						() => w(z(t).color, 14, "var(--k-surface)"),
						() => w(z(t).color, 70, "var(--k-fg)"),
						() => w(z(t).color, 35, "var(--k-surface)")
					]), m(e, n);
				}, a = (e) => {
					var n = Pc(), r = A(n, !0);
					U(() => h(r, z(t).label)), m(e, n);
				};
				p(r, (e) => {
					z(t).color ? e(i) : e(a, -1);
				}), m(e, n);
			}), l(r), m(e, r);
		}, c = (e) => {
			var n = g(), r = I(n), i = (e) => {
				var n = Ic();
				U(() => d(n, "aria-label", t().text)), m(e, n);
			}, a = (e) => {
				var n = Lc();
				U(() => d(n, "aria-label", t().text)), m(e, n);
			};
			p(r, (e) => {
				t().value ? e(i) : e(a, -1);
			}), m(e, n);
		}, u = (e) => {
			var r = Fc();
			f(r, 21, () => t().refs, n, (e, t) => {
				var n = Rc();
				let r;
				var i = A(n, !0);
				U(() => {
					r = a(n, 1, "af-chip neutral svelte-17ihsrp", null, r, { raw: !z(t).resolved }), h(i, z(t).label);
				}), m(e, n);
			}), l(r), m(e, r);
		}, _ = (e) => {
			var n = Bc(), r = V(n);
			let i;
			var o = k(V(r), 2), s = A(o, !0);
			l(r);
			var c = k(r, 2), u = (e) => {
				var n = zc(), r = A(n);
				U(() => h(r, `+${t().more ?? ""}`)), m(e, n);
			};
			p(c, (e) => {
				t().more > 0 && e(u);
			}), l(n), U(() => {
				i = a(r, 1, "af-chip outline svelte-17ihsrp", null, i, { unavailable: t().unavailable }), h(s, t().name);
			}), m(e, n);
		}, v = (e) => {
			var r = g(), i = I(r);
			f(i, 17, () => t().parts, n, (e, t) => {
				var n = g(), r = I(n), i = (e) => {
					var n = Uc(), r = V(n), i = (e) => {
						var n = Vc(), r = A(n, !0);
						U((e) => h(r, e), [() => ge(z(t).mention.label)]), m(e, n);
					}, a = (e) => {
						var t = Hc(), n = A(t);
						U(() => d(n, "d", ve)), m(e, t);
					};
					p(r, (e) => {
						z(t).mention.state !== "restricted" && z(t).mention.kind === "user" ? e(i) : z(t).mention.state !== "restricted" && z(t).mention.kind === "record" && e(a, 1);
					});
					var o = k(r, 2), s = A(o, !0);
					l(n), U(() => {
						d(n, "data-kind", z(t).mention.kind), d(n, "data-state", z(t).mention.state), h(s, z(t).mention.label);
					}), m(e, n);
				}, a = (e) => {
					var n = te();
					U(() => h(n, z(t).text)), m(e, n);
				};
				p(r, (e) => {
					"mention" in z(t) ? e(i) : e(a, -1);
				}), m(e, n);
			}), m(e, r);
		}, y = (e) => {
			var n = Wc(), r = V(n), i = V(r);
			let a;
			l(r);
			var o = k(r, 2), s = A(o, !0);
			l(n), U(() => {
				a = N(i, "", a, {
					width: `${t().bar.percent ?? ""}%`,
					"background-color": t().bar.color ?? void 0
				}), h(s, t().text);
			}), m(e, n);
		}, b = (e) => {
			var n = Gc(), r = A(n, !0);
			U(() => h(r, t().text)), m(e, n);
		}, x = (e) => {
			var n = te();
			U(() => h(n, t().text)), m(e, n);
		};
		p(o, (e) => {
			t().kind === "options" ? e(s) : t().kind === "boolean" ? e(c, 1) : t().kind === "refs" ? e(u, 2) : t().kind === "file" ? e(_, 3) : t().kind === "rich" ? e(v, 4) : t().kind === "number" && t().bar ? e(y, 5) : t().kind === "number" && t().rating ? e(b, 6) : e(x, -1);
		}), m(e, r);
	}, v = _(o, "model", 7), y = _(o, "drill", 7), b = _(o, "text", 7), x = _(o, "label", 7), S = _(o, "host", 7);
	function C(e) {
		let t = (e) => e.target instanceof Element ? e.target.closest("tr[data-record]") : null, n = (e) => {
			let n = Gt(e) ? t(e) : null;
			n?.dataset.record && n.dataset.entity && me(S(), "af-open-record", {
				record: n.dataset.record,
				entity: n.dataset.entity,
				newTab: Wt(e)
			});
		}, r = (e) => {
			e.button === 1 && t(e) && e.preventDefault();
		};
		return e.addEventListener("click", n), e.addEventListener("auxclick", n), e.addEventListener("mousedown", r), () => {
			e.removeEventListener("click", n), e.removeEventListener("auxclick", n), e.removeEventListener("mousedown", r);
		};
	}
	let w = (e, t, n) => `color-mix(in oklab, ${e} ${t}%, ${n})`, T = W(() => q(b().tileOpenRecord, { label: v().head[0] ?? "" }));
	var E = {
		get model() {
			return v();
		},
		set model(e) {
			v(e), t();
		},
		get drill() {
			return y();
		},
		set drill(e) {
			y(e), t();
		},
		get text() {
			return b();
		},
		set text(e) {
			b(e), t();
		},
		get label() {
			return x();
		},
		set label(e) {
			x(e), t();
		},
		get host() {
			return S();
		},
		set host(e) {
			S(e), t();
		}
	}, D = Qc(), O = V(D);
	{
		let e = W(() => x() || null);
		ye(O, {
			axis: "both",
			get label() {
				return z(e);
			},
			children: (e, t) => {
				var r = Zc();
				let i;
				var o = V(r), s = (e) => {
					var t = Kc(), n = A(t, !0);
					U(() => h(n, x())), m(e, t);
				};
				p(o, (e) => {
					x() && e(s);
				});
				var g = k(o), _ = V(g);
				f(_, 21, () => v().head, n, (e, t) => {
					var n = qc(), r = A(n, !0);
					U(() => h(r, z(t))), m(e, n);
				}), l(_), l(g);
				var b = k(g);
				f(b, 21, () => v().rows, (e) => e.key, (e, t) => {
					let r = W(() => y() && z(t).record !== "" && z(t).entity !== "");
					var i = Xc();
					f(i, 21, () => z(t).cells, n, (e, t, n) => {
						var i = Yc(), a = V(i), o = (e) => {
							var n = Jc(), r = V(n);
							u(r, () => z(t)), l(n), U(() => d(n, "aria-label", z(t).text === "—" ? z(T) : void 0)), m(e, n);
						}, s = (e) => {
							u(e, () => z(t));
						};
						p(a, (e) => {
							z(r) && n === 0 ? e(o) : e(s, -1);
						}), l(i), m(e, i);
					}), l(i), U(() => {
						d(i, "data-record", z(r) ? z(t).record : void 0), d(i, "data-entity", z(r) ? z(t).entity : void 0);
					}), m(e, i);
				}), l(b), c(b, () => y() ? C : void 0), l(r), U(() => i = a(r, 1, "svelte-17ihsrp", null, i, { open: y() })), m(e, r);
			},
			$$slots: { default: !0 }
		});
	}
	return l(D), m(e, D), s(E);
}
O(el, {
	model: {},
	drill: {},
	text: {},
	label: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/number.ts
var tl = 3;
function nl(e, t, n, r) {
	let i = Se(t.population, e.cap_bound);
	if (i?.kind === "sample") return [i.cap === null ? n.tileCapIncomplete : q(n.tileCapSample, { cap: Je(i.cap, r) })];
	let a = q(e.population === 1 ? n.tileRecordsOne : n.tileRecords, { count: Je(e.population, r) });
	return i ? [a, i.kind === "at_least" ? n.tileCapAtLeast : n.tileCapAtMost] : [a];
}
function rl(e, t, n, r, i, a) {
	let o = e.kind === "number" || e.kind === "chart" ? e.transform?.target : null, s = n?.target ?? (o?.kind === "constant" ? o.value : null);
	if (s == null) return null;
	let c = q(i.tileGoal, { target: j(t, s, r, a) }), l = x(t, r, n?.value ?? null, s, a);
	if (!l) return {
		text: c,
		tone: "none"
	};
	if (l.met) return {
		text: `${c} · ${i.tileGoalMet}`,
		tone: "met"
	};
	let u = l.points ? q(i.tilePoints, { value: l.distance }) : l.distance;
	return {
		text: `${c} · ${q(l.short ? i.tileGoalShort : i.tileGoalOver, { distance: u })}`,
		tone: l.short ? "short" : "over"
	};
}
function il(e, t, n, r, i) {
	let a = t?.comparison;
	if (!a) return null;
	let o = `${r.tileVsEarlier}: `;
	if (a.previous == null) return o + r.tileNoEarlier;
	let s = [j(e, a.previous, n, i)];
	if (a.difference != null) {
		let t = a.difference < 0 ? "−" : "+";
		s.push(t + j(e, Math.abs(a.difference), n, i));
	}
	let c = R(a.percent_change, i);
	return c !== null && s.push(c), o + s.join(" · ");
}
function al(e, t, n, r, i) {
	let a = (e.kind === "number" || e.kind === "chart") && e.drill_disabled === !0, o = t.population;
	return !i || a || t.outcome !== "ok" || !o?.drill ? null : {
		drill: o.drill,
		measure: Ke(n),
		bucket: null,
		segment: null,
		label: ae(n, r),
		count: o.count,
		other: !1
	};
}
function ol(e, t, n, r, i, a) {
	let o = n ?? void 0, s = Ge(e, t), c = se(s) ?? {}, l = (n, c) => {
		let l = Pe(t, n), u = C(n, o), d = l?.value ?? null;
		return {
			measure: Ke(n),
			label: s.length > 1 ? ae(n, o) : null,
			value: j(n, d, u, i),
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
var sl = u("<div class=\"label svelte-184f7i6\" part=\"label\"> </div>"), cl = u("<button type=\"button\" part=\"value\"> </button>"), ll = u("<div part=\"value\"> </div>"), ul = u("<div class=\"goal svelte-184f7i6\" part=\"goal\"> </div>"), dl = u("<div class=\"comparison svelte-184f7i6\" part=\"comparison\"> </div>"), fl = u("<!> <!> <div class=\"meta svelte-184f7i6\" part=\"meta\"> </div> <!> <!>", 1), pl = u("<div class=\"figure svelte-184f7i6\" part=\"secondary\"><!></div>"), ml = u("<div class=\"secondaries svelte-184f7i6\"></div>"), hl = u("<div class=\"figure svelte-184f7i6\" part=\"figure\"><!></div> <!>", 1), gl = {
	hash: "svelte-184f7i6",
	code: ".figure.svelte-184f7i6 {display:grid;align-content:start;gap:2px;min-width:0;}.label.svelte-184f7i6, .meta.svelte-184f7i6, .comparison.svelte-184f7i6 {color:var(--k-muted);font-size:12px;line-height:18px;overflow-wrap:anywhere;}.goal.svelte-184f7i6 {font-size:12px;line-height:18px;overflow-wrap:anywhere;}.value.svelte-184f7i6 {margin:0;padding:0;border:0;background:none;color:var(--k-fg);font:inherit;font-size:32px;font-weight:600;line-height:38px;font-variant-numeric:tabular-nums;text-align:start;overflow-wrap:anywhere;}.value.small.svelte-184f7i6 {font-size:20px;line-height:26px;}.value.muted.svelte-184f7i6 {color:var(--k-muted);}button.value.svelte-184f7i6 {justify-self:start;border-radius:4px;cursor:pointer;-webkit-tap-highlight-color:transparent;}\n  @media (hover: hover) {button.value.svelte-184f7i6:hover {text-decoration:underline;text-decoration-color:var(--k-muted);text-underline-offset:4px;} }button.value.svelte-184f7i6:focus-visible {outline:2px solid var(--k-primary);outline-offset:2px;}.secondaries.svelte-184f7i6 {display:grid;grid-template-columns:repeat(2, minmax(0, 1fr));gap:12px 16px;padding-top:12px;border-top:1px solid var(--k-line);}"
};
function _l(e, o) {
	P(o, !0), r(e, gl);
	let c = (e, t = i, n = i) => {
		var r = fl(), o = I(r), s = (e) => {
			var n = sl(), r = A(n, !0);
			U(() => h(r, t().label)), m(e, n);
		};
		p(o, (e) => {
			t().label && e(s);
		});
		var c = k(o, 2), l = (e) => {
			var r = cl();
			let i;
			var o = A(r, !0);
			U((e) => {
				i = a(r, 1, "value svelte-184f7i6", null, i, {
					muted: t().muted,
					small: n()
				}), d(r, "title", e), h(o, t().value);
			}, [() => b(t())]), H("click", r, (e) => x(t(), e)), M("auxclick", r, (e) => x(t(), e)), H("mousedown", r, function(...e) {
				Kt?.apply(this, e);
			}), m(e, r);
		}, u = (e) => {
			var r = ll();
			let i;
			var o = A(r, !0);
			U(() => {
				i = a(r, 1, "value svelte-184f7i6", null, i, {
					muted: t().muted,
					small: n()
				}), h(o, t().value);
			}), m(e, r);
		};
		p(c, (e) => {
			t().drill ? e(l) : e(u, -1);
		});
		var f = k(c, 2), g = A(f, !0), _ = k(f, 2), v = (e) => {
			var n = ul(), r = A(n, !0);
			U(() => {
				d(n, "data-tone", t().goal.tone), h(r, t().goal.text);
			}), m(e, n);
		};
		p(_, (e) => {
			t().goal && e(v);
		});
		var y = k(_, 2), S = (e) => {
			var n = dl(), r = A(n, !0);
			U(() => h(r, t().comparison)), m(e, n);
		};
		p(y, (e) => {
			t().comparison && e(S);
		}), U((e) => h(g, e), [() => t().meta.join(" · ")]), m(e, r);
	}, u = _(o, "model", 7), g = _(o, "text", 7), v = _(o, "locale", 7), y = _(o, "host", 7);
	function b(e) {
		let t = e.drill?.count ?? 0;
		return q(t === 1 ? g().tileOpenRecordsOne : g().tileOpenRecords, { count: Je(t, v() ?? void 0) });
	}
	function x(e, t) {
		e.drill && Gt(t) && me(y(), "af-drill", {
			...e.drill,
			newTab: Wt(t)
		});
	}
	var S = {
		get model() {
			return u();
		},
		set model(e) {
			u(e), t();
		},
		get text() {
			return g();
		},
		set text(e) {
			g(e), t();
		},
		get locale() {
			return v();
		},
		set locale(e) {
			v(e), t();
		},
		get host() {
			return y();
		},
		set host(e) {
			y(e), t();
		}
	}, C = hl(), w = I(C);
	c(V(w), () => u().primary, () => !1), l(w);
	var T = k(w, 2), E = (e) => {
		var t = ml();
		f(t, 21, () => u().secondaries, n, (e, t) => {
			var n = pl(), r = V(n);
			c(r, () => z(t), () => !0), l(n), m(e, n);
		}), l(t), m(e, t);
	};
	return p(T, (e) => {
		u().secondaries.length && e(E);
	}), m(e, C), s(S);
}
L(["click", "mousedown"]), O(_l, {
	model: {},
	text: {},
	locale: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/Verdict.svelte
var vl = e("<path d=\"M3 8.5 6.5 12 13 4.5\"></path>"), yl = e("<path d=\"M8 2.5 14.5 13.5H1.5Z\"></path><path d=\"M8 6.5v3.2M8 11.8v.01\"></path>", 1), bl = e("<circle cx=\"8\" cy=\"8\" r=\"6.25\"></circle><path d=\"M8 7.25V11.5M8 4.8v.01\"></path>", 1), xl = u("<div class=\"verdict svelte-dr6ch4\" part=\"verdict\"><svg class=\"icon svelte-dr6ch4\" viewBox=\"0 0 16 16\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><!></svg> <span class=\"words svelte-dr6ch4\"> </span></div>"), Sl = {
	hash: "svelte-dr6ch4",
	code: ".verdict.svelte-dr6ch4 {display:flex;align-items:flex-start;gap:6px;min-width:0;color:var(--k-muted);font-size:12px;line-height:18px;}.verdict[data-tone='warning'].svelte-dr6ch4 {color:var(--k-fg);}.icon.svelte-dr6ch4 {flex:none;margin-top:2px;}.words.svelte-dr6ch4 {min-width:0;overflow-wrap:anywhere;}"
};
function Cl(e, n) {
	P(n, !0), r(e, Sl);
	let i = _(n, "model", 7);
	var a = {
		get model() {
			return i();
		},
		set model(e) {
			i(e), t();
		}
	}, c = xl(), u = V(c);
	let f;
	var g = V(u), v = (e) => {
		var t = vl();
		m(e, t);
	}, y = (e) => {
		var t = yl();
		o(), m(e, t);
	}, b = (e) => {
		var t = bl();
		o(), m(e, t);
	};
	p(g, (e) => {
		i().kind === "partitions" ? e(v) : i().kind === "fans_out" ? e(y, 1) : e(b, -1);
	}), l(u);
	var x = k(u, 2), S = A(x, !0);
	return l(c), U(() => {
		d(c, "data-verdict", i().kind), d(c, "data-tone", i().tone), f = N(u, "", f, { color: i().tone === "warning" ? "var(--k-warning)" : void 0 }), h(S, i().text);
	}), m(e, c), s(a);
}
O(Cl, { model: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/tile/TileView.svelte
var wl = u("<div class=\"title svelte-m2ey2a\" part=\"title\"> </div>"), Tl = u("<button type=\"button\" class=\"af-button secondary sm toggle svelte-m2ey2a\" part=\"table-toggle\"> </button>"), El = u("<div class=\"head svelte-m2ey2a\" part=\"head\"><!> <!></div>"), Dl = u("<div class=\"state svelte-m2ey2a\" part=\"state\"><p class=\"lead svelte-m2ey2a\"> </p> <p class=\"hint svelte-m2ey2a\"> </p></div>"), Ol = u("<p class=\"hint svelte-m2ey2a\"> </p>"), kl = u("<div class=\"state svelte-m2ey2a\" part=\"state\"><p class=\"lead svelte-m2ey2a\"> </p> <!></div>"), Al = u("<div class=\"doc\"><!></div>"), jl = u("<div class=\"prose svelte-m2ey2a\" part=\"prose\"><!></div>"), Ml = u("<div class=\"state svelte-m2ey2a\" part=\"state\"><p class=\"lead svelte-m2ey2a\"> </p></div>"), Nl = u("<nav class=\"pager svelte-m2ey2a\" part=\"pager\"><button type=\"button\" class=\"af-button secondary sm\"> </button> <button type=\"button\" class=\"af-button secondary sm\"> </button></nav>"), Pl = u("<!> <!>", 1), Fl = u("<li> </li>"), Il = u("<ul class=\"notes svelte-m2ey2a\" part=\"notes\"></ul>"), Ll = u("<div class=\"frame svelte-m2ey2a\" part=\"frame\"><!> <!> <!> <!></div>"), Rl = {
	hash: "svelte-m2ey2a",
	code: ".frame.svelte-m2ey2a {display:flex;flex-direction:column;gap:8px;box-sizing:border-box;height:100%;min-height:0;min-width:0;overflow:auto;padding:12px 16px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);font-size:14px;line-height:20px;scrollbar-width:thin;scrollbar-color:var(--k-line) transparent;}\n  /* The frame's last-resort scroll, for a host card shorter than the figure's floors, is the browser's own, drawn thin in the\n     kit's line colour: the kit's scroller on every tile cost WebKit about six seconds more to draw a page of forty tiles (9.0 s\n     against 3.0 s in the gallery), for a case a page rarely meets. It is the one exception test/kit/no-plain-scroll.test.ts names. */.frame.svelte-m2ey2a::-webkit-scrollbar {width:10px;height:10px;}.frame.svelte-m2ey2a::-webkit-scrollbar-thumb {border:1px solid transparent;border-radius:999px;background-clip:padding-box;background-color:var(--k-line);}.head.svelte-m2ey2a {display:flex;align-items:center;gap:8px;min-width:0;}.title.svelte-m2ey2a {flex:1 1 auto;min-width:0;overflow:hidden;font-size:13px;font-weight:600;line-height:18px;text-overflow:ellipsis;white-space:nowrap;}.toggle.svelte-m2ey2a {flex:none;margin-inline-start:auto;}.pager.svelte-m2ey2a {display:flex;flex:none;justify-content:flex-end;gap:8px;}.state.svelte-m2ey2a {position:relative;display:grid;gap:4px;padding:16px 0;}.state.svelte-m2ey2a p:where(.svelte-m2ey2a) {margin:0;}.lead.svelte-m2ey2a {font-weight:500;}.hint.svelte-m2ey2a {color:var(--k-muted);font-size:12px;line-height:18px;}.prose.svelte-m2ey2a {display:flex;flex:1 1 auto;flex-direction:column;min-height:0;overflow-wrap:anywhere;}.frame.svelte-m2ey2a [data-scope='scroll-area'][data-part='viewport']:focus-visible {outline:2px solid var(--k-primary);outline-offset:-2px;box-shadow:none;}.notes.svelte-m2ey2a {display:grid;gap:2px;margin:0;padding:8px 0 0;border-top:1px solid var(--k-line);list-style:none;color:var(--k-muted);font-size:12px;line-height:18px;}"
};
function zl(e, i) {
	P(i, !0), r(e, Rl);
	let a = _(i, "spec", 7), o = _(i, "result", 7), c = _(i, "fields", 7), u = _(i, "rows", 7), g = _(i, "columns", 7), v = _(i, "paging", 7), y = _(i, "table", 7), b = _(i, "drill", 7), x = _(i, "text", 7), S = _(i, "locale", 7), C = _(i, "host", 7), w = W(() => !!u() && !!g()), T = W(() => et(a(), o(), c(), x(), S() ?? void 0, z(w))), E = W(() => a() && o() && z(T).state.kind === "number" ? ol(a(), o(), c(), x(), S() ?? void 0, b()) : null), D = W(() => a() && o() && z(T).state.kind === "chart" ? ft(a(), o(), c(), x(), S() ?? void 0, b()) : null), O = W(() => z(T).state.kind === "text" && a()?.kind === "text" ? a().body : null), j = W(() => z(O) === null ? null : xe(z(O))), M = W(() => z(T).state.kind === "list" && !!g() && g().length === 0), N = W(() => z(T).state.kind === "list" && u() && g()?.length ? Mc(u(), g(), c(), x(), S() ?? void 0) : null), F = W(() => typeof y() == "boolean"), L = re(!1), R = W(() => z(F) ? y() === !0 : z(L)), B = W(() => !!z(D) && !z(D)[0].empty && !z(F));
	function ee(e) {
		v() && !v().busy && v()[e] && me(C(), "af-page", { direction: e });
	}
	var te = {
		get spec() {
			return a();
		},
		set spec(e) {
			a(e), t();
		},
		get result() {
			return o();
		},
		set result(e) {
			o(e), t();
		},
		get fields() {
			return c();
		},
		set fields(e) {
			c(e), t();
		},
		get rows() {
			return u();
		},
		set rows(e) {
			u(e), t();
		},
		get columns() {
			return g();
		},
		set columns(e) {
			g(e), t();
		},
		get paging() {
			return v();
		},
		set paging(e) {
			v(e), t();
		},
		get table() {
			return y();
		},
		set table(e) {
			y(e), t();
		},
		get drill() {
			return b();
		},
		set drill(e) {
			b(e), t();
		},
		get text() {
			return x();
		},
		set text(e) {
			x(e), t();
		},
		get locale() {
			return S();
		},
		set locale(e) {
			S(e), t();
		},
		get host() {
			return C();
		},
		set host(e) {
			C(e), t();
		}
	}, ne = Ll(), G = V(ne), ie = (e) => {
		var t = El(), n = V(t), r = (e) => {
			var t = wl(), n = A(t, !0);
			U(() => h(n, z(T).title)), m(e, t);
		};
		p(n, (e) => {
			z(T).title && e(r);
		});
		var i = k(n, 2), a = (e) => {
			var t = Tl(), n = A(t, !0);
			U(() => h(n, z(R) ? x().tileShowChart : x().tileShowTable)), H("click", t, () => K(L, !z(L))), m(e, t);
		};
		p(i, (e) => {
			z(B) && e(a);
		}), l(t), m(e, t);
	};
	p(G, (e) => {
		z(T).state.kind !== "loading" && (z(T).title || z(B)) && e(ie);
	});
	var ae = k(G, 2), oe = (e) => {
		ue(e, {
			get title() {
				return z(T).title;
			},
			get text() {
				return x();
			}
		});
	}, se = (e) => {
		var t = Dl(), n = V(t), r = A(n, !0), i = k(n, 2), a = A(i, !0);
		l(t), U(() => {
			h(r, x().tileUnavailable), h(a, x().tileUnavailableHint);
		}), m(e, t);
	}, ce = (e) => {
		var t = kl(), n = V(t), r = A(n, !0), i = k(n, 2), a = (e) => {
			var t = Ol(), n = A(t, !0);
			U(() => h(n, z(T).state.detail)), m(e, t);
		};
		p(i, (e) => {
			z(T).state.detail && e(a);
		}), l(t), U(() => h(r, z(T).state.title)), m(e, t);
	}, le = (e) => {
		var t = jl(), n = V(t);
		{
			let e = W(() => z(T).title || null);
			ye(n, {
				get label() {
					return z(e);
				},
				children: (e, t) => {
					var n = Al(), r = V(n);
					be(r, { get blocks() {
						return z(j);
					} }), l(n), m(e, n);
				},
				$$slots: { default: !0 }
			});
		}
		l(t), m(e, t);
	}, de = (e) => {
		var t = Ml(), n = V(t), r = A(n, !0);
		l(t), U(() => h(r, x().tileListNoColumns)), m(e, t);
	}, q = (e) => {
		var t = Pl(), n = I(t), r = (e) => {
			el(e, {
				get model() {
					return z(N);
				},
				get drill() {
					return b();
				},
				get text() {
					return x();
				},
				get label() {
					return z(T).title;
				},
				get host() {
					return C();
				}
			});
		}, i = (e) => {
			var t = Ml(), n = V(t), r = A(n, !0);
			l(t), U(() => h(r, x().tileListEmpty)), m(e, t);
		};
		p(n, (e) => {
			z(N).rows.length ? e(r) : e(i, -1);
		});
		var a = k(n, 2), o = (e) => {
			var t = Nl(), n = V(t), r = A(n, !0), i = k(n, 2), a = A(i, !0);
			l(t), U(() => {
				d(t, "aria-label", z(T).title || void 0), d(t, "aria-busy", v().busy ? "true" : void 0), n.disabled = !v().prev || !!v().busy, h(r, x().tilePrevious), i.disabled = !v().next || !!v().busy, h(a, x().tileNext);
			}), H("click", n, () => ee("prev")), H("click", i, () => ee("next")), m(e, t);
		};
		p(a, (e) => {
			v() && e(o);
		}), m(e, t);
	}, fe = (e) => {
		_l(e, {
			get model() {
				return z(E);
			},
			get text() {
				return x();
			},
			get locale() {
				return S();
			},
			get host() {
				return C();
			}
		});
	}, pe = (e) => {
		ec(e, {
			get panels() {
				return z(D);
			},
			get table() {
				return z(R);
			},
			get text() {
				return x();
			},
			get locale() {
				return S();
			},
			get label() {
				return z(T).title;
			},
			get host() {
				return C();
			}
		});
	}, he = (e) => {
		var t = Ml(), n = V(t), r = A(n, !0);
		l(t), U(() => h(r, x().tileNotDrawn)), m(e, t);
	};
	p(ae, (e) => {
		z(T).state.kind === "loading" ? e(oe) : z(T).state.kind === "unavailable" ? e(se, 1) : z(T).state.kind === "failed" ? e(ce, 2) : z(j) ? e(le, 3) : z(M) ? e(de, 4) : z(N) ? e(q, 5) : z(E) ? e(fe, 6) : z(D) ? e(pe, 7) : e(he, -1);
	});
	var ge = k(ae, 2), _e = (e) => {
		Cl(e, { get model() {
			return z(T).verdict;
		} });
	};
	p(ge, (e) => {
		z(T).verdict && e(_e);
	});
	var ve = k(ge, 2), Se = (e) => {
		var t = Il();
		f(t, 21, () => z(T).notes, n, (e, t) => {
			var n = Fl(), r = A(n, !0);
			U(() => h(r, z(t))), m(e, n);
		}), l(t), m(e, t);
	};
	return p(ve, (e) => {
		z(T).notes.length && e(Se);
	}), l(ne), m(e, ne), s(te);
}
L(["click"]), O(zl, {
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
