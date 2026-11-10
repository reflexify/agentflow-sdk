import { d as e } from "./FolderSource-BFwYWdDp.js";
import { Ct as t, Dt as n, F as r, Nt as i, Ot as a, St as o, Y as s, Z as c, _ as l, at as u, ft as d, g as f } from "./version-D1aEkxtn.js";
import { n as p, o as m } from "./mention-chip-BxnXPO1a.js";
import { n as h, r as g, t as _ } from "./prose-pAEDGpU8.js";
//#region src/kit/prose/MarkdownView.svelte
var v = c("<div class=\"md svelte-12pgfae\" part=\"content\"><!></div>"), y = {
	hash: "svelte-12pgfae",
	code: ".md.svelte-12pgfae {color:var(--k-fg);font-size:12.5px;line-height:1.625;}.md.svelte-12pgfae p {margin:4px 0;line-height:1.625;}.md.svelte-12pgfae p:first-child {margin-top:0;}.md.svelte-12pgfae p:last-child {margin-bottom:0;}.md.svelte-12pgfae :is(h1, h2, h3, h4, h5, h6) {font-weight:600;line-height:1.625;}.md.svelte-12pgfae h1 {margin:8px 0 6px;font-size:1.12em;}.md.svelte-12pgfae h2 {margin:8px 0 4px;font-size:1.04em;}.md.svelte-12pgfae :is(h3, h4, h5, h6) {margin:6px 0 4px;font-size:1em;}.md.svelte-12pgfae :is(ul, ol) {margin:4px 0 4px 16px;padding:0;line-height:1.625;}.md.svelte-12pgfae li {padding-inline-start:2px;}.md.svelte-12pgfae li + li {margin-top:0;}.md.svelte-12pgfae li:not(:last-child) {margin-bottom:2px;}.md.svelte-12pgfae strong {font-weight:600;}.md.svelte-12pgfae a {color:var(--k-primary);text-decoration:underline;}.md.svelte-12pgfae code {padding:2px 4px;border-radius:4px;background:var(--k-muted-bg);font-family:var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);font-size:0.92em;}.md.svelte-12pgfae pre {margin:6px 0;padding:8px;border-radius:4px;background:var(--k-muted-bg);font-family:var(--af-font-mono, ui-monospace, SFMono-Regular, Menlo, monospace);font-size:0.88em;line-height:1.375;}.md.svelte-12pgfae pre code {padding:0;border-radius:0;background:none;font-size:1em;}.md.svelte-12pgfae blockquote {margin:4px 0;padding-inline-start:8px;border-inline-start:2px solid var(--k-line);font-style:italic;}.md.svelte-12pgfae hr {margin:8px 0;}.md.svelte-12pgfae .scroll {margin:8px 0;}.md.svelte-12pgfae table {font-size:0.92em;}.md.svelte-12pgfae table code {font-size:1em;}.md.svelte-12pgfae thead {background:var(--k-muted-bg);}.md.svelte-12pgfae :is(th, td) {padding:6px 8px;}.md.svelte-12pgfae button.mention {display:inline;margin:0;padding:0;border:0;border-radius:999px;background:none;color:inherit;font:inherit;cursor:pointer;}.md.svelte-12pgfae button.mention:focus-visible {outline:2px solid var(--k-primary);outline-offset:1px;}.md.svelte-12pgfae .af-mention {display:inline-flex;align-items:center;gap:4px;padding:0 6px;border-radius:999px;vertical-align:baseline;background:color-mix(in oklab, var(--k-primary) 12%, transparent);color:var(--k-fg);font-size:0.95em;line-height:1.5;}.md.svelte-12pgfae .af-mention:is([data-state='restricted'], [data-state='deleted'], [data-state='unresolved']) {background:color-mix(in oklab, var(--k-fg) 7%, transparent);color:var(--k-muted);}.md.svelte-12pgfae .af-mention[data-state='deleted'] .af-mention-label {text-decoration:line-through;}.md.svelte-12pgfae .af-mention-avatar {width:16px;height:16px;font-size:10px;}"
};
function b(c, f) {
	a(f, !0), r(c, y);
	let b = l(f, "value", 7), x = l(f, "mentions", 7), S = l(f, "schemes", 7), C = l(f, "text", 7), w = l(f, "host", 7), T = t(() => _(b() ?? "", S() ?? []));
	g({
		activate(t, n) {
			e(w(), "af-link", { href: t }, { cancelable: !0 }) || n.preventDefault();
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
		set value(e) {
			b(e), o();
		},
		get mentions() {
			return x();
		},
		set mentions(e) {
			x(e), o();
		},
		get schemes() {
			return S();
		},
		set schemes(e) {
			S(e), o();
		},
		get text() {
			return C();
		},
		set text(e) {
			C(e), o();
		},
		get host() {
			return w();
		},
		set host(e) {
			w(e), o();
		}
	}, D = v(), O = d(D);
	return h(O, { get blocks() {
		return u(T);
	} }), i(D), s(c, D), n(E);
}
f(b, {
	value: {},
	mentions: {},
	schemes: {},
	text: {},
	host: {}
}, [], [], { mode: "open" });
//#endregion
export { b as default };
