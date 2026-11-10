import { B as e, C as t, Dt as n, E as r, F as i, I as a, J as o, M as s, Nt as c, Ot as l, P as u, St as d, T as f, Tt as p, U as m, V as h, X as g, Y as _, Z as v, _ as y, at as b, et as x, ft as S, g as C, ht as w, j as T, kt as E, lt as D, mt as O, nt as k, pt as A, rt as ee, tt as te, w as ne } from "./version-D1aEkxtn.js";
import { t as j } from "./Scroller-CDGQl4nN.js";
import { a as re, r as ie, t as M } from "./mention-token-IIKQP2Tz.js";
//#region src/kit/prose/links.ts
var N = Symbol("prose-links"), ae = (e) => E(N, e), oe = () => p(N), se = v("<br/>"), ce = v("<code class=\"svelte-3boxds\"> </code>"), le = v("<a target=\"_blank\" rel=\"noreferrer noopener\" class=\"svelte-3boxds\"><!></a>"), ue = v("<a target=\"_blank\" rel=\"noreferrer\" class=\"svelte-3boxds\"><!></a>"), de = v("<button type=\"button\" class=\"mention\"></button>"), fe = v("<strong class=\"svelte-3boxds\"><!></strong>"), pe = v("<em><!></em>"), me = v("<del><!></del>"), he = {
	hash: "svelte-3boxds",
	code: "strong.svelte-3boxds {font-weight:600;}a.svelte-3boxds {color:var(--k-primary);text-decoration:underline;}a.svelte-3boxds:focus-visible {border-radius:2px;outline:2px solid var(--k-primary);outline-offset:1px;}code.svelte-3boxds {padding:0 0.25em;border-radius:0.25em;background:var(--k-hover);font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;font-size:0.92em;}"
};
function P(t, r) {
	l(r, !0), i(t, he);
	let a = y(r, "runs", 7), s = oe();
	var p = {
		get runs() {
			return a();
		},
		set runs(e) {
			a(e), d();
		}
	}, v = g(), C = A(v);
	return e(C, 17, a, h, (e, t) => {
		var n = g(), r = A(n), i = (e) => {
			var n = x();
			D(() => o(n, b(t).text)), _(e, n);
		}, a = (e) => {
			var t = se();
			_(e, t);
		}, l = (e) => {
			var n = ce(), r = O(n, !0);
			D(() => o(r, b(t).text)), _(e, n);
		}, d = (e) => {
			var n = g(), r = A(n), i = (e) => {
				var n = le();
				P(S(n), { get runs() {
					return b(t).children;
				} }), c(n), D(() => f(n, "href", b(t).href)), k("click", n, (e) => s.activate(b(t).href, e)), ee("auxclick", n, (e) => e.button === 1 && s.activate(b(t).href, e)), _(e, n);
			}, a = (e) => {
				var n = ue();
				P(S(n), { get runs() {
					return b(t).children;
				} }), c(n), D(() => f(n, "href", b(t).href)), _(e, n);
			};
			m(r, (e) => {
				s ? e(i) : e(a, -1);
			}), _(e, n);
		}, p = (e) => {
			var n = g(), r = A(n), i = (e) => {
				var n = de();
				u(n, () => s.chip(b(t).ref, b(t).label)), k("click", n, (e) => s.activate(`mention:${b(t).ref}`, e)), _(e, n);
			}, a = (e) => {
				var n = x();
				D(() => o(n, `@${b(t).label ?? ""}`)), _(e, n);
			};
			m(r, (e) => {
				s ? e(i) : e(a, -1);
			}), _(e, n);
		}, h = (e) => {
			var n = fe();
			P(S(n), { get runs() {
				return b(t).children;
			} }), c(n), _(e, n);
		}, v = (e) => {
			var n = pe();
			P(S(n), { get runs() {
				return b(t).children;
			} }), c(n), _(e, n);
		}, y = (e) => {
			var n = me();
			P(S(n), { get runs() {
				return b(t).children;
			} }), c(n), _(e, n);
		};
		m(r, (e) => {
			b(t).kind === "text" ? e(i) : b(t).kind === "break" ? e(a, 1) : b(t).kind === "code" ? e(l, 2) : b(t).kind === "link" ? e(d, 3) : b(t).kind === "mention" ? e(p, 4) : b(t).kind === "strong" ? e(h, 5) : b(t).kind === "em" ? e(v, 6) : e(y, -1);
		}), _(e, n);
	}), _(t, v), n(p);
}
te(["click"]), C(P, { runs: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/prose/Prose.svelte
var F = v("<p class=\"svelte-8827q7\"><!></p>"), I = v("<input type=\"checkbox\" disabled=\"\" class=\"svelte-8827q7\"/>"), L = v("<li><!><!></li>"), R = v("<blockquote class=\"svelte-8827q7\"><!></blockquote>"), ge = v("<code class=\"svelte-8827q7\"> </code>"), _e = v("<pre class=\"svelte-8827q7\"><!></pre>"), ve = v("<hr class=\"svelte-8827q7\"/>"), ye = v("<div class=\"plain svelte-8827q7\"> </div>"), be = v("<th scope=\"col\" class=\"svelte-8827q7\"><!></th>"), xe = v("<td class=\"svelte-8827q7\"><!></td>"), Se = v("<tr class=\"svelte-8827q7\"></tr>"), Ce = v("<table class=\"svelte-8827q7\"><thead><tr></tr></thead><tbody class=\"svelte-8827q7\"></tbody></table>"), we = v("<div class=\"scroll svelte-8827q7\"><!></div>"), Te = {
	hash: "svelte-8827q7",
	code: "p.svelte-8827q7 {margin:4px 0;}h1.svelte-8827q7, h2.svelte-8827q7, h3.svelte-8827q7, h4.svelte-8827q7, h5.svelte-8827q7, h6.svelte-8827q7 {margin:0.5em 0 0.375em;font-weight:600;line-height:1.3;}h1.svelte-8827q7 {font-size:1.12em;}h2.svelte-8827q7 {font-size:1.04em;}h3.svelte-8827q7, h4.svelte-8827q7, h5.svelte-8827q7, h6.svelte-8827q7 {font-size:1em;}ul.svelte-8827q7, ol.svelte-8827q7 {margin:4px 0;padding-inline-start:1.25em;}ul.svelte-8827q7 {list-style:disc;}ol.svelte-8827q7 {list-style:decimal;}li.svelte-8827q7 {padding-inline-start:2px;}li.svelte-8827q7 + li:where(.svelte-8827q7) {margin-top:2px;}li.task.svelte-8827q7 {list-style:none;}li.svelte-8827q7 > p:first-child, blockquote.svelte-8827q7 > p:first-child {margin-top:0;}li.svelte-8827q7 > p:last-child, blockquote.svelte-8827q7 > p:last-child {margin-bottom:0;}li.task.svelte-8827q7 > p:first-of-type {display:inline;}input.svelte-8827q7 {margin:0 0.4em 0 0;vertical-align:-1px;}blockquote.svelte-8827q7 {margin:4px 0;padding-inline-start:0.5em;border-inline-start:2px solid var(--k-line);font-style:italic;}.plain.svelte-8827q7 {margin:4px 0;white-space:pre-wrap;}hr.svelte-8827q7 {margin:0.5em 0;border:0;border-top:1px solid var(--k-line);}\n  /* The code keeps its own line breaks; the scroller's boxes inside the pre do not add any. */pre.svelte-8827q7 {margin:6px 0;padding:0.5em;border-radius:4px;background:var(--k-hover);font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;font-size:0.88em;line-height:1.4;white-space:normal;}code.svelte-8827q7 {white-space:pre;}\n  /* The tile breaks a long word anywhere. A table keeps its words whole instead and scrolls, as one with a long cell would. */.scroll.svelte-8827q7 {max-width:100%;margin:8px 0;overflow-wrap:normal;}table.svelte-8827q7 {width:100%;border-collapse:collapse;font-size:0.92em;}th.svelte-8827q7, td.svelte-8827q7 {padding:0.375em 0.5em;border-bottom:1px solid var(--k-line);text-align:start;vertical-align:top;}th.svelte-8827q7 {font-weight:600;}tbody.svelte-8827q7 tr:where(.svelte-8827q7):last-child > :where(.svelte-8827q7) {border-bottom:0;}"
};
function z(u, f) {
	l(f, !0), i(u, Te);
	let p = y(f, "blocks", 7);
	var v = {
		get blocks() {
			return p();
		},
		set blocks(e) {
			p(e), d();
		}
	}, x = g(), C = A(x);
	return e(C, 17, p, h, (n, i) => {
		var l = g(), u = A(l), d = (e) => {
			var t = F();
			P(S(t), { get runs() {
				return b(i).children;
			} }), c(t), _(e, t);
		}, f = (e) => {
			var t = g(), n = A(t);
			a(n, () => `h${b(i).level}`, !1, (e, t) => {
				s(e, 0, "svelte-8827q7"), P(t, { get runs() {
					return b(i).children;
				} });
			}), _(e, t);
		}, p = (n) => {
			var o = g(), l = A(o);
			a(l, () => b(i).ordered ? "ol" : "ul", !1, (n, a) => {
				t(n, () => ({
					start: b(i).ordered ? b(i).start : void 0,
					class: ""
				}), void 0, void 0, void 0, "svelte-8827q7");
				var o = g(), l = A(o);
				e(l, 17, () => b(i).items, h, (e, t) => {
					var n = L();
					let i;
					var a = S(n), o = (e) => {
						var n = I();
						ne(n), D(() => r(n, b(t).checked)), _(e, n);
					};
					m(a, (e) => {
						b(t).checked !== null && e(o);
					}), z(w(a), { get blocks() {
						return b(t).children;
					} }), c(n), D(() => i = s(n, 1, "svelte-8827q7", null, i, { task: b(t).checked !== null })), _(e, n);
				}), _(a, o);
			}), _(n, o);
		}, v = (e) => {
			var t = R();
			z(S(t), { get blocks() {
				return b(i).children;
			} }), c(t), _(e, t);
		}, y = (e) => {
			var t = _e(), n = S(t);
			j(n, {
				axis: "horizontal",
				children: (e, t) => {
					var n = ge(), r = O(n, !0);
					D(() => o(r, b(i).text)), _(e, n);
				},
				$$slots: { default: !0 }
			}), c(t), _(e, t);
		}, x = (e) => {
			var t = ve();
			_(e, t);
		}, C = (e) => {
			var t = ye(), n = O(t, !0);
			D(() => o(n, b(i).text)), _(e, t);
		}, E = (t) => {
			var n = we(), r = S(n);
			j(r, {
				axis: "horizontal",
				children: (t, n) => {
					var r = Ce(), a = S(r), o = S(a);
					e(o, 21, () => b(i).head, h, (e, t, n) => {
						var r = be();
						let a;
						P(S(r), { get runs() {
							return b(t);
						} }), c(r), D(() => a = T(r, "", a, { "text-align": b(i).align[n] ?? void 0 })), _(e, r);
					}), c(o), c(a);
					var s = w(a);
					e(s, 21, () => b(i).rows, h, (t, n) => {
						var r = Se();
						e(r, 21, () => b(n), h, (e, t, n) => {
							var r = xe();
							let a;
							P(S(r), { get runs() {
								return b(t);
							} }), c(r), D(() => a = T(r, "", a, { "text-align": b(i).align[n] ?? void 0 })), _(e, r);
						}), c(r), _(t, r);
					}), c(s), c(r), _(t, r);
				},
				$$slots: { default: !0 }
			}), c(n), _(t, n);
		};
		m(u, (e) => {
			b(i).kind === "paragraph" ? e(d) : b(i).kind === "heading" ? e(f, 1) : b(i).kind === "list" ? e(p, 2) : b(i).kind === "quote" ? e(v, 3) : b(i).kind === "code" ? e(y, 4) : b(i).kind === "rule" ? e(x, 5) : b(i).kind === "plain" ? e(C, 6) : e(E, -1);
		}), _(n, l);
	}), _(u, x), n(v);
}
C(z, { blocks: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/prose/prose.ts
var B = 24, V = 2e4, Ee = 16e6, De = 1, Oe = 16, ke = 96, Ae = 42, je = 95, Me = 126, Ne = 91, Pe = 33, Fe = 40;
function Ie(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) {
		let r = e.charCodeAt(n);
		r === Ae || r === je || r === Me ? t += Oe : (r === Ne || r === Pe || r === Fe || r === ke) && (t += De);
	}
	return t * e.length;
}
var Le = class extends re {
	#e = 0;
	tableCells = 0;
	hasMentions = !1;
	inlineTokens(e, t = []) {
		let n = Ie(e);
		return this.#e + n > Ee ? (t.push({
			type: "verbatim",
			raw: e,
			text: e
		}), t) : (this.#e += n, super.inlineTokens(e, t));
	}
}, Re = 2e3, ze = 1e4;
function Be(e) {
	let t = 0, n = 0, r = 0, i = 0;
	for (let a = 0; a < e.length; a++) {
		let o = e[a];
		o === "|" && i % 2 == 0 && (t === 0 && (n = a), t++, r = a + 1), i = o === "\\" ? i + 1 : 0;
	}
	let a = t + 1;
	return (t === 0 ? e : e.slice(0, n)).trim() === "" && a--, a > 0 && e.slice(r).trim() === "" && a--, a;
}
function Ve(e) {
	if (!e) return 0;
	let t = 0;
	for (let n = e.indexOf("\n"); n !== -1; n = e.indexOf("\n", n + 1)) t++;
	return e.endsWith("\n") ? t : t + 1;
}
function He(e) {
	let t = e.indexOf("\n") + 1;
	if (t === 0) return !1;
	let n = e.indexOf("\n", t), r = n === -1 ? e.slice(t) : e.slice(t, n);
	return r.includes("|") || r.includes(":");
}
var Ue = new ie({
	gfm: !0,
	breaks: !0,
	extensions: [{
		name: "mention",
		level: "inline",
		start(e) {
			if (!this.lexer.hasMentions) return;
			let t = e.indexOf("@[");
			return t === -1 ? void 0 : t;
		},
		tokenizer(e) {
			let t = M(e);
			return t ? {
				type: "mention",
				raw: t.raw,
				text: `@${t.label}`,
				ref: t.ref,
				label: t.label
			} : void 0;
		}
	}],
	tokenizer: { table(e) {
		if (!He(e)) return;
		let t = this.rules.block.table.exec(e);
		if (!t || !this.rules.other.tableDelimiter.test(t[2])) return;
		let n = t[2].replace(this.rules.other.tableAlignChars, "").split("|").length;
		if (n === Be(t[1])) {
			let e = this.lexer, r = n * (Ve(t[3]) + 1);
			if (r <= Re && e.tableCells + r <= ze) return e.tableCells += r, !1;
		}
		let r = t[0].trimEnd();
		return {
			type: "paragraph",
			raw: t[0],
			text: r,
			tokens: this.lexer.inline(r)
		};
	} }
}), H = (e) => e === " " || e === "	", U = (e) => e !== void 0 && e >= "0" && e <= "9";
function We(e, t, n) {
	if (t >= n) return -1;
	let r = e[t];
	if (r === ">") return t;
	if (r === "-" || r === "*" || r === "+") return t + 1 >= n || H(e[t + 1]) ? t : -1;
	if (!U(r)) return -1;
	let i = t;
	for (; i < n && U(e[i]);) i++;
	let a = e[i], o = i < n && (a === "." || a === ")") && (i + 1 >= n || H(e[i + 1]));
	return i - t <= 9 && o ? i : -1;
}
function Ge(e, t, n) {
	let r = "";
	for (let i = t; i < n; i++) {
		let t = e[i];
		if (!H(t)) {
			if (t !== "-" && t !== "*" || r && t !== r) return !1;
			r = t;
		}
	}
	return r !== "";
}
function Ke(e, t, n) {
	let r = t;
	for (let i = 1;; i++) {
		for (; r < n && H(e[r]);) r++;
		let a = We(e, r, n);
		if (a === -1) return -1;
		if (i > B) return Ge(e, t, n) ? -1 : a;
		r = a + 1;
	}
}
function qe(e) {
	let t = [], n = 0;
	for (let r = 0; r < e.length;) {
		let i = e.indexOf("\n", r), a = i === -1 ? e.length : i, o = Ke(e, r, a);
		o !== -1 && (t.push(e.slice(n, o), "\\"), n = o), r = a + 1;
	}
	return t.length === 0 ? e : (t.push(e.slice(n)), t.join(""));
}
var Je = /^(https?|ircs?|mailto|xmpp)$/i;
function Ye(e) {
	let t = e.indexOf(":"), n = e.indexOf("/"), r = e.indexOf("?"), i = e.indexOf("#");
	return t === -1 || n !== -1 && t > n || r !== -1 && t > r || i !== -1 && t > i || Je.test(e.slice(0, t)) ? e : null;
}
var Xe = /^(javascript|vbscript|data):/i;
function Ze(e, t) {
	let n = Ye(e);
	if (n !== null || t.length === 0 || Xe.test(e)) return n;
	let r = e.toLowerCase();
	return t.some((e) => e.endsWith(":") && r.startsWith(e.toLowerCase())) ? e : null;
}
var Qe = 1e3;
function W(e) {
	let t = e.indexOf("@[");
	if (t === -1) return e;
	let n = "", r = 0;
	for (; t !== -1;) {
		let i = M(e.slice(t, t + Qe));
		i ? (n += `${e.slice(r, t)}@${i.label}`, r = t + i.raw.length, t = e.indexOf("@[", r)) : t = e.indexOf("@[", t + 2);
	}
	return n + e.slice(r);
}
var $e = /* @__PURE__ */ new Map([
	["amp", "&"],
	["lt", "<"],
	["gt", ">"],
	["quot", "\""],
	["apos", "'"],
	["nbsp", "\xA0"],
	["copy", "©"],
	["reg", "®"],
	["trade", "™"],
	["hellip", "…"],
	["mdash", "—"],
	["ndash", "–"],
	["lsquo", "‘"],
	["rsquo", "’"],
	["ldquo", "“"],
	["rdquo", "”"],
	["laquo", "«"],
	["raquo", "»"],
	["middot", "·"],
	["times", "×"],
	["deg", "°"],
	["euro", "€"]
]), et = /&(?:#(\d{1,7})|#[xX]([0-9a-fA-F]{1,6})|([a-zA-Z]+));/g;
function G(e) {
	return e.includes("&") ? e.replace(et, (e, t, n, r) => {
		if (r !== void 0) return $e.get(r) ?? e;
		let i = t === void 0 ? parseInt(n, 16) : Number(t);
		return i === 0 || i > 1114111 || i >= 55296 && i <= 57343 ? "�" : String.fromCodePoint(i);
	}) : e;
}
function K(e, t) {
	if (!t) return;
	let n = W(t), r = e.at(-1);
	r?.kind === "text" ? r.text += n : e.push({
		kind: "text",
		text: n
	});
}
function q(e, t) {
	for (let n = 0;;) {
		let r = t.indexOf("\n", n);
		if (K(e, t.slice(n, r === -1 ? void 0 : r)), r === -1) return;
		e.push({ kind: "break" }), n = r + 1;
	}
}
var J = (e) => e.map((e) => e.raw).join("");
function Y(e, t) {
	if (t > B) return J(e);
	let n = "";
	for (let r of e) r.type === "html" ? n += r.raw : r.tokens ? n += Y(r.tokens, t + 1) : typeof r.text == "string" && (n += r.type === "text" ? G(r.text) : r.text);
	return n;
}
function X(e, t, n, r, i) {
	if (n > B) {
		K(e, J(t));
		return;
	}
	for (let a of t) switch (a.type) {
		case "text": {
			let { text: t, tokens: o } = a;
			o ? X(e, o, n + 1, r, i) : K(e, G(t));
			break;
		}
		case "verbatim":
			q(e, a.raw);
			break;
		case "escape":
			K(e, a.text);
			break;
		case "br":
			e.push({ kind: "break" });
			break;
		case "codespan":
			e.push({
				kind: "code",
				text: a.text
			});
			break;
		case "strong":
		case "em":
		case "del": {
			let t = [];
			X(t, a.tokens, n + 1, r, i), e.push({
				kind: a.type,
				children: t
			});
			break;
		}
		case "link": {
			let t = a, o = Ze(G(t.href), i);
			if (o === null || o === "" || r) {
				X(e, t.tokens, n + 1, r, i);
				break;
			}
			let s = [];
			X(s, t.tokens, n + 1, !0, i), e.push({
				kind: "link",
				href: o,
				children: s
			});
			break;
		}
		case "image":
			K(e, Y(a.tokens, n + 1));
			break;
		case "mention": {
			let { ref: t, label: n } = a;
			r ? K(e, `@${n}`) : e.push({
				kind: "mention",
				ref: t,
				label: n
			});
			break;
		}
		case "checkbox": break;
		default: K(e, a.raw);
	}
}
function Z(e, t, n) {
	let r = [];
	return X(r, e, t, !1, n), r;
}
var tt = [
	1,
	2,
	3,
	4,
	5,
	6
];
function Q(e, t) {
	let n = W(t.trim());
	n && e.push({
		kind: "paragraph",
		children: [{
			kind: "text",
			text: n
		}]
	});
}
function $(e, t, n, r) {
	for (let i of t) switch (i.type) {
		case "space":
		case "def":
		case "checkbox": break;
		case "paragraph":
		case "text": {
			let { tokens: t, text: n } = i, a = [];
			t ? X(a, t, 0, !1, r) : K(a, n), a.length && e.push({
				kind: "paragraph",
				children: a
			});
			break;
		}
		case "heading": {
			let t = i;
			e.push({
				kind: "heading",
				level: tt[Math.min(Math.max(t.depth, 1), 6) - 1],
				children: Z(t.tokens, 0, r)
			});
			break;
		}
		case "code":
			e.push({
				kind: "code",
				text: i.text
			});
			break;
		case "hr":
			e.push({ kind: "rule" });
			break;
		case "blockquote": {
			if (n >= B) {
				Q(e, i.raw);
				break;
			}
			let t = [];
			$(t, i.tokens, n + 1, r), e.push({
				kind: "quote",
				children: t
			});
			break;
		}
		case "list": {
			if (n >= B) {
				Q(e, i.raw);
				break;
			}
			let t = i;
			e.push({
				kind: "list",
				ordered: t.ordered,
				start: typeof t.start == "number" ? t.start : 1,
				items: t.items.map((e) => {
					let t = [];
					return $(t, e.tokens, n + 1, r), {
						checked: e.task ? e.checked === !0 : null,
						children: t
					};
				})
			});
			break;
		}
		case "table": {
			let t = i;
			e.push({
				kind: "table",
				align: t.align,
				head: t.header.map((e) => Z(e.tokens, 0, r)),
				rows: t.rows.map((e) => e.map((e) => Z(e.tokens, 0, r)))
			});
			break;
		}
		default: Q(e, i.raw);
	}
}
function nt(e) {
	if (e.length <= V) return e.length;
	let t = e.lastIndexOf("\n", V);
	return t > 0 ? t : V;
}
function rt(e, t = []) {
	let n = nt(e), r;
	try {
		let t = new Le(Ue.defaults), i = qe(e.slice(0, n));
		t.hasMentions = i.includes("@["), r = t.lex(i);
	} catch {
		return [{
			kind: "code",
			text: e
		}];
	}
	let i = [];
	if ($(i, r, 0, t), n < e.length) {
		let t = e.slice(n).replaceAll("\r\n", "\n").replace(/^\n+/, "").trimEnd();
		t && i.push({
			kind: "plain",
			text: W(t)
		});
	}
	return i;
}
//#endregion
export { z as n, ae as r, rt as t };
