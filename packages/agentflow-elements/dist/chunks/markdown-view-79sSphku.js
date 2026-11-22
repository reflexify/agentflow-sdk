import { Ct as e, I as t, Ot as n, Pt as r, Q as i, X as a, _ as o, g as s, kt as c, ot as l, pt as u, wt as d } from "./version-CCDdag5V.js";
import { i as f } from "./environment-1PeQDNCe.js";
import { n as p, o as m } from "./mention-chip-CSmBskyF.js";
import { n as h, r as g, t as _ } from "./prose-0W8fxjNG.js";
//#region src/kit/prose/MarkdownView.svelte
var v = i("<div class=\"md svelte-12pgfae\" part=\"content\"><!></div>"), y = {
	hash: "svelte-12pgfae",
	code: ".md.svelte-12pgfae {color:var(--k-fg);font-size:12.5px;line-height:1.625;}.md.svelte-12pgfae p {margin:4px 0;line-height:1.625;}.md.svelte-12pgfae p:first-child {margin-top:0;}.md.svelte-12pgfae p:last-child {margin-bottom:0;}.md.svelte-12pgfae :is(h1, h2, h3, h4, h5, h6) {font-weight:600;line-height:1.625;}.md.svelte-12pgfae h1 {margin:8px 0 6px;font-size:1.12em;}.md.svelte-12pgfae h2 {margin:8px 0 4px;font-size:1.04em;}.md.svelte-12pgfae :is(h3, h4, h5, h6) {margin:6px 0 4px;font-size:1em;}.md.svelte-12pgfae :is(ul, ol) {margin:4px 0 4px 16px;padding:0;line-height:1.625;}.md.svelte-12pgfae li {padding-inline-start:2px;}.md.svelte-12pgfae li + li {margin-top:0;}.md.svelte-12pgfae li:not(:last-child) {margin-bottom:2px;}.md.svelte-12pgfae strong {font-weight:600;}.md.svelte-12pgfae a {color:var(--k-primary);text-decoration:underline;}.md.svelte-12pgfae code {padding:2px 4px;border-radius:4px;background:var(--k-muted-bg);font-family:var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);font-size:0.92em;}.md.svelte-12pgfae pre {margin:6px 0;padding:8px;border-radius:4px;background:var(--k-muted-bg);font-family:var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);font-size:0.88em;line-height:1.375;}.md.svelte-12pgfae pre code {padding:0;border-radius:0;background:none;font-size:1em;}.md.svelte-12pgfae blockquote {margin:4px 0;padding-inline-start:8px;border-inline-start:2px solid var(--k-line);font-style:italic;}.md.svelte-12pgfae hr {margin:8px 0;}.md.svelte-12pgfae .scroll {margin:8px 0;}.md.svelte-12pgfae table {font-size:0.92em;}.md.svelte-12pgfae table code {font-size:1em;}.md.svelte-12pgfae thead {background:var(--k-muted-bg);}.md.svelte-12pgfae :is(th, td) {padding:6px 8px;}.md.svelte-12pgfae button.mention {display:inline;margin:0;padding:0;border:0;border-radius:999px;background:none;color:inherit;font:inherit;cursor:pointer;}.md.svelte-12pgfae button.mention:focus-visible {outline:2px solid var(--k-primary);outline-offset:1px;}.md.svelte-12pgfae .af-mention {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:baseline;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;line-height:1.5;}.md.svelte-12pgfae .af-mention:is([data-state='restricted'], [data-state='deleted'], [data-state='unresolved']) {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.md.svelte-12pgfae .af-mention[data-state='deleted'] .af-mention-label {text-decoration:line-through;}.md.svelte-12pgfae .af-mention-avatar {width:16px;height:16px;font-size:10px;}"
};
function b(i, s) {
	c(s, !0), t(i, y);
	let b = o(s, "value", 7), x = o(s, "mentions", 7), S = o(s, "schemes", 7), C = o(s, "text", 7), w = o(s, "host", 7), T = d(() => _(b() ?? "", S() ?? []));
	g({
		activate(e, t) {
			f(w(), "af-link", { href: e }, { cancelable: !0 }) || t.preventDefault();
		},
		chip: (e, t) => (n) => {
			n.replaceChildren(p(e, {
				...m(e, t, x()?.[e], "unresolved"),
				href: null
			}, C()));
		}
	});
	var E = {
		get value() {
			return b();
		},
		set value(t) {
			b(t), e();
		},
		get mentions() {
			return x();
		},
		set mentions(t) {
			x(t), e();
		},
		get schemes() {
			return S();
		},
		set schemes(t) {
			S(t), e();
		},
		get text() {
			return C();
		},
		set text(t) {
			C(t), e();
		},
		get host() {
			return w();
		},
		set host(t) {
			w(t), e();
		}
	}, D = v(), O = u(D);
	return h(O, { get blocks() {
		return l(T);
	} }), r(D), a(i, D), n(E);
}
s(b, {
	value: {},
	mentions: {},
	schemes: {},
	text: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
export { b as default };
