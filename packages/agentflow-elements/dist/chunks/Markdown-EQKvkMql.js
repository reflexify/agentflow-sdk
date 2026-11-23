import { t as e } from "./rolldown-runtime-Dy4uBu1J.js";
import { Ct as t, I as n, Ot as r, Pt as i, Q as a, R as o, W as s, X as c, Y as l, Z as u, _ as d, dt as f, g as p, gt as m, ht as h, kt as g, mt as _, ot as v, pt as y, ut as b, wt as x, xt as S, yt as C } from "./version-Cw97ZDNW.js";
import { i as w, o as T } from "./text-B-lRGRNn.js";
//#region src/kit/Markdown.svelte
var E = /* @__PURE__ */ e({ default: () => j }), D = a("<div part=\"content\" class=\"plain svelte-y87xpv\"> </div>"), O = a("<div part=\"content\" aria-busy=\"true\"></div>"), k = a("<!> <div class=\"af-kit\"><!></div>", 1), A = {
	hash: "svelte-y87xpv",
	code: ":host {display:block;}.plain.svelte-y87xpv {white-space:pre-wrap;overflow-wrap:anywhere;}"
};
function j(e, a) {
	g(a, !0), n(e, A);
	let p = d(a, "value", 7, null), E = d(a, "mentions", 7, null), j = d(a, "schemes", 7, null), M = d(a, "locale", 7, null), N = d(a, "strings", 7, null), P = a.$$host, F = x(() => w(M(), N() ?? void 0)), I = S(null), L = S(!1);
	f(() => {
		let e = !0;
		return import("./markdown-view-CtEiWAk_.js").then((t) => {
			e && C(I, t.default);
		}, () => {
			e && C(L, !0);
		}), () => {
			e = !1;
		};
	});
	var R = {
		get value() {
			return p();
		},
		set value(e = null) {
			p(e), t();
		},
		get mentions() {
			return E();
		},
		set mentions(e = null) {
			E(e), t();
		},
		get schemes() {
			return j();
		},
		set schemes(e = null) {
			j(e), t();
		},
		get locale() {
			return M();
		},
		set locale(e = null) {
			M(e), t();
		},
		get strings() {
			return N();
		},
		set strings(e = null) {
			N(e), t();
		}
	}, z = k(), B = _(z);
	T(B, {});
	var V = m(B, 2), H = y(V), U = (e) => {
		var t = u(), n = _(t);
		o(n, () => v(I), (e, t) => {
			t(e, {
				get value() {
					return p();
				},
				get mentions() {
					return E();
				},
				get schemes() {
					return j();
				},
				get text() {
					return v(F);
				},
				get host() {
					return P;
				}
			});
		}), c(e, t);
	}, W = (e) => {
		var t = D(), n = h(t, !0);
		b(() => l(n, p() ?? "")), c(e, t);
	}, G = (e) => {
		var t = O();
		c(e, t);
	};
	return s(H, (e) => {
		v(I) ? e(U) : v(L) ? e(W, 1) : e(G, -1);
	}), i(V), c(e, z), r(R);
}
p(j, {
	value: {
		attribute: "value",
		type: "String"
	},
	mentions: { type: "Object" },
	schemes: { type: "Array" },
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
export { E as n, j as t };
