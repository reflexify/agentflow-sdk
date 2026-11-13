import { Dt as e, F as t, J as n, Nt as r, Ot as i, St as a, U as o, Y as s, Z as c, _ as l, ft as u, g as d, ht as f, lt as p, mt as m, pt as h } from "./version-DyshBDr6.js";
//#region ../agentflow-sdk/dist/figures/labels.js
function g(e) {
	let t = [];
	for (let n of e?.enum_values ?? []) typeof n == "string" ? t.push({ value: n }) : n && typeof n == "object" && typeof n.value == "string" && t.push(n);
	return t;
}
function _(e, t, n) {
	if (e.key === null || e.key === void 0) return { code: "empty" };
	if (e.key === "$restricted") return { code: "restricted" };
	if (e.key === "$other") return { code: "other" };
	if (e.label) return { text: e.label };
	if (t) {
		let n = g(t).find((t) => t.value === e.key);
		if (n?.label) return { text: n.label };
		if (t.type === "boolean") return { code: e.key === "true" ? "yes" : "no" };
	}
	return n ? { text: v(e.key, n) } : { text: e.key };
}
function v(e, t) {
	let [n, r, i] = e.split("-");
	if (!n || !r || !i) return e;
	switch (t) {
		case "month": return `${n}-${r}`;
		case "quarter": return `${n} Q${Math.floor((Number(r) - 1) / 3) + 1}`;
		default: return e;
	}
}
function y(e, t) {
	if (e.label) return e.label;
	let n = (e) => t?.find((t) => t.key === e)?.label ?? e;
	if (e.fn === "ratio" && e.ratio) return `${n(e.ratio.of)} / ${n(e.ratio.per)}`;
	if (!e.fn) return e.field ? n(e.field) : "";
	let r = e.fn === "percentile" && e.percentile ? `p${e.percentile.p}` : e.fn;
	return e.duration ? `${r} · ${n(e.duration.from)} → ${n(e.duration.to)}` : e.field ? `${r} · ${n(e.field)}` : r;
}
function b(e) {
	return e.find((e) => e.primary) ?? e[0];
}
function x(e, t) {
	if (e.label) return e.label;
	if (e.kind === "text" || e.kind === "list") return "";
	let n = b(e.query?.measures ?? []);
	return n ? y(n, t) : "";
}
function S(e, t) {
	if (!t) return e;
	let { id: n, ...r } = t, i = { ...r };
	return e.id !== void 0 && (i.id = e.id), e.color && (i.color = e.color), e.primary !== void 0 && (i.primary = e.primary), e.key !== void 0 && (i.key = e.key), e.entity_metric_id !== void 0 && (i.entity_metric_id = e.entity_metric_id), i;
}
//#endregion
//#region src/kit/tile/Loading.svelte
var C = c("<div class=\"head svelte-1tl74ap\" part=\"head\"><div class=\"title svelte-1tl74ap\" part=\"title\"> </div></div>"), w = c("<!> <div class=\"state svelte-1tl74ap\" part=\"state\" role=\"status\"><div class=\"af-skeleton svelte-1tl74ap\"></div> <span class=\"sr svelte-1tl74ap\"> </span></div>", 1), T = {
	hash: "svelte-1tl74ap",
	code: ".head.svelte-1tl74ap {display:flex;align-items:center;gap:8px;min-width:0;}.title.svelte-1tl74ap {flex:1 1 auto;min-width:0;overflow:hidden;font-size:13px;font-weight:600;line-height:18px;text-overflow:ellipsis;white-space:nowrap;}.state.svelte-1tl74ap {position:relative;padding:16px 0;}.state.svelte-1tl74ap .af-skeleton:where(.svelte-1tl74ap) {height:48px;}.sr.svelte-1tl74ap {position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;}"
};
function E(c, d) {
	i(d, !0), t(c, T);
	let g = l(d, "title", 7), _ = l(d, "text", 7);
	var v = {
		get title() {
			return g();
		},
		set title(e) {
			g(e), a();
		},
		get text() {
			return _();
		},
		set text(e) {
			_(e), a();
		}
	}, y = w(), b = h(y), x = (e) => {
		var t = C(), i = u(t), a = m(i, !0);
		r(t), p(() => n(a, g())), s(e, t);
	};
	o(b, (e) => {
		g() && e(x);
	});
	var S = f(b, 2), E = f(u(S), 2), D = m(E, !0);
	return r(S), p(() => n(D, _().tileLoading)), s(c, y), e(v);
}
d(E, {
	title: {},
	text: {}
}, [], [], { mode: "open" });
//#endregion
export { g as a, y as i, _ as n, b as o, S as r, x as s, E as t };
