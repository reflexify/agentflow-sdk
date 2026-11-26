import { t as e } from "./rolldown-runtime-Dy4uBu1J.js";
import { Ct as t, D as n, F as r, H as i, I as a, It as o, M as s, Ot as c, Pt as l, Q as u, T as d, V as f, W as p, X as m, Y as h, Z as g, _, b as v, g as ee, gt as y, ht as b, it as x, kt as S, mt as C, nt as te, ot as w, pt as T, rt as E, st as D, ut as O, wt as k, xt as A, yt as j } from "./version-UUTNopEv.js";
import { i as ne, n as M, o as N, r as re } from "./text-DcfVFav3.js";
import { c as ie, i as P, t as F } from "./environment-1PeQDNCe.js";
import { t as ae } from "./time-DitxIPbv.js";
import { t as oe } from "./size-TcdSxSxX.js";
//#region src/kit/CommentThread.svelte
var I = /* @__PURE__ */ e({ default: () => B }), se = (e) => {
	var t = R();
	m(e, t);
}, ce = (e, t = o) => {
	var n = z(), r = b(n, !0);
	O(() => h(r, t())), m(e, n);
}, le = /* @__PURE__ */ new WeakMap(), L = "composer";
function ue(e) {
	let t = e.trim().split(/\s+/).filter(Boolean).map((e) => Array.from(e)[0].toUpperCase());
	return t.length === 0 ? "?" : t.length === 1 ? t[0] : t[0] + t[t.length - 1];
}
function de(e) {
	let t = 0;
	for (let n of e ?? "") t = t * 31 + n.charCodeAt(0) >>> 0;
	return t % 8;
}
function fe(e, t) {
	let n = e.shadowRoot, r = null, i = () => n?.querySelector("[contenteditable=\"true\"]") ?? null, a = (e) => {
		let r = F();
		if ((!r || r === document.body || ie(t.owner, r)) && (e.focus(), t.end)) try {
			let t = n.getSelection?.() ?? document.getSelection();
			t?.selectAllChildren(e), t?.collapseToEnd();
		} catch {}
	}, o = i();
	return o ? a(o) : n && (r = new MutationObserver(() => {
		let e = i();
		e && (r?.disconnect(), a(e));
	}), r.observe(n, {
		childList: !0,
		subtree: !0
	})), { destroy: () => r?.disconnect() };
}
var R = u("<span class=\"af-spinner\" aria-hidden=\"true\"></span>"), z = u("<p part=\"error\" class=\"fault svelte-1hgxild\" role=\"alert\"> </p>"), pe = u("<span class=\"hint svelte-1hgxild\"> </span>"), me = u("<af-file-upload></af-file-upload>", 2), he = u("<span part=\"edited\" class=\"edited svelte-1hgxild\"> </span>"), ge = u("<div class=\"fields svelte-1hgxild\"><af-rich-editor></af-rich-editor> <!></div> <div class=\"bar svelte-1hgxild\"><!> <span class=\"buttons svelte-1hgxild\"><button type=\"button\" part=\"cancel\" class=\"af-button ghost sm\"> </button> <button type=\"button\" part=\"save\" class=\"af-button primary sm\"><!> </button></span></div>", 3), _e = u("<af-markdown></af-markdown>", 2), ve = u("<span part=\"file\" class=\"af-file-chip\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48\"></path></svg> <button type=\"button\" class=\"af-file-chip-name\"> </button> <span class=\"size svelte-1hgxild\"> </span></span>"), ye = u("<div class=\"files svelte-1hgxild\"></div>"), be = u("<!> <!>", 1), xe = u("<button type=\"button\" part=\"edit\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"></path><path d=\"m15 5 4 4\"></path></svg></button>"), Se = u("<button type=\"button\" part=\"delete\" class=\"af-button ghost icon xs\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 6h18\"></path><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"></path><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"></path></svg></button>"), Ce = u("<div class=\"actions svelte-1hgxild\"><!> <!></div>"), we = u("<li part=\"comment\" class=\"comment svelte-1hgxild\"><span class=\"af-avatar sm svelte-1hgxild\" aria-hidden=\"true\"> </span> <div class=\"main svelte-1hgxild\"><div class=\"head svelte-1hgxild\"><b part=\"author\" class=\"author svelte-1hgxild\"> </b> <time part=\"time\" class=\"when svelte-1hgxild\"> </time> <!></div> <!> <!></div> <!></li>"), Te = u("<div class=\"earlier svelte-1hgxild\"><button type=\"button\" part=\"earlier\" class=\"af-button ghost xs\"> </button></div>"), Ee = u("<ol class=\"list svelte-1hgxild\"></ol>"), De = u("<p class=\"empty svelte-1hgxild\"> </p>"), Oe = u("<p part=\"unnotified\" class=\"note svelte-1hgxild\"> </p>"), ke = u("<div part=\"closed\" class=\"closed svelte-1hgxild\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" class=\"svelte-1hgxild\"><rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path></svg> <div><b class=\"svelte-1hgxild\"> </b> <span> </span></div></div>"), Ae = u("<button type=\"button\" part=\"prompt\" class=\"prompt svelte-1hgxild\"> </button>"), je = u("<div class=\"fields svelte-1hgxild\"><af-rich-editor></af-rich-editor> <!></div> <div class=\"bar svelte-1hgxild\"><!> <button type=\"button\" part=\"send\" class=\"af-button primary sm\"><!> </button></div>", 3), Me = u("<div part=\"composer\" class=\"composer svelte-1hgxild\"><!> <!></div>"), Ne = u("<af-confirm></af-confirm>", 2), Pe = u("<!> <div class=\"af-kit thread svelte-1hgxild\"><!> <!> <div class=\"live svelte-1hgxild\" role=\"status\"><!></div> <!> <!> <!></div>", 1), Fe = {
	hash: "svelte-1hgxild",
	code: ":host {display:block;}.thread.svelte-1hgxild {display:flex;flex-direction:column;gap:12px;}.earlier.svelte-1hgxild {display:flex;}.list.svelte-1hgxild {display:flex;flex-direction:column;margin:0;padding:0;list-style:none;}.empty.svelte-1hgxild {margin:0;color:var(--k-muted);font-size:12.5px;}.comment.svelte-1hgxild {position:relative;display:flex;gap:12px;margin-inline:-8px;padding:8px;border-radius:8px;}.comment.svelte-1hgxild .af-avatar:where(.svelte-1hgxild) {margin-top:2px;}.main.svelte-1hgxild {flex:1 1 0%;min-width:0;}.head.svelte-1hgxild {display:flex;align-items:baseline;gap:8px;font-size:12px;line-height:1.5;}.author.svelte-1hgxild {min-width:0;overflow:hidden;font-weight:600;text-overflow:ellipsis;white-space:nowrap;}.when.svelte-1hgxild, .edited.svelte-1hgxild {flex:none;color:var(--k-muted);}.edited.svelte-1hgxild {font-style:italic;}.body.svelte-1hgxild {display:block;margin-top:2px;font-size:13px;line-height:1.6;overflow-wrap:anywhere;}.files.svelte-1hgxild {display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;}.files.svelte-1hgxild .size:where(.svelte-1hgxild) {flex:none;color:var(--k-muted);}.actions.svelte-1hgxild {position:absolute;top:4px;inset-inline-end:8px;display:flex;gap:2px;opacity:0;}.comment.svelte-1hgxild:focus-within .actions:where(.svelte-1hgxild) {opacity:1;}\n  @media (hover: hover) {.comment.svelte-1hgxild:hover .actions:where(.svelte-1hgxild) {opacity:1;} }\n  @media (hover: none) {.actions.svelte-1hgxild {opacity:1;} }.fields.svelte-1hgxild {display:flex;flex-direction:column;gap:8px;margin-top:6px;}.fields[inert].svelte-1hgxild {opacity:0.6;}af-rich-editor.svelte-1hgxild, af-file-upload.svelte-1hgxild, af-markdown.svelte-1hgxild {display:block;}.composer.svelte-1hgxild {display:flex;flex-direction:column;}.prompt.svelte-1hgxild {box-sizing:border-box;width:100%;min-height:36px;padding:0 12px;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);color:var(--k-muted);font:inherit;font-size:13px;text-align:start;cursor:text;}.prompt.svelte-1hgxild:focus-visible {outline:none;border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring);}\n  @media (forced-colors: active) {.prompt.svelte-1hgxild:focus-visible {outline:2px solid;outline-offset:1px;} }.bar.svelte-1hgxild {display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px;}.hint.svelte-1hgxild {color:var(--k-muted);font-size:11px;}.buttons.svelte-1hgxild {display:flex;gap:8px;margin-inline-start:auto;}.fault.svelte-1hgxild {margin:6px 0 0;color:var(--k-danger);font-size:12.5px;}.live.svelte-1hgxild {display:contents;}.note.svelte-1hgxild {margin:0;color:var(--k-muted);font-size:11.5px;}.closed.svelte-1hgxild {display:flex;align-items:flex-start;gap:8px;padding:10px 12px;border:1px solid var(--k-line);border-radius:12px;background:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);color:var(--k-muted);font-size:12.5px;}.closed.svelte-1hgxild svg:where(.svelte-1hgxild) {flex:none;width:14px;height:14px;margin-top:3px;}.closed.svelte-1hgxild b:where(.svelte-1hgxild) {color:var(--k-fg);font-weight:500;}"
};
function B(e, u) {
	S(u, !0), a(e, Fe);
	let ee = (e) => {
		var t = pe(), n = b(t);
		O(() => h(n, `${U() ? `${w(J).commentHintMention} · ` : ""}${w(J).commentHintSend ?? ""}`)), m(e, t);
	}, te = (e, t = o, r = o) => {
		var i = g(), a = C(i), c = (e) => {
			var i = me();
			n(i, "multiple", !0), O(() => n(i, "items", r().files)), O(() => n(i, "label", w(J).commentAttach)), O(() => n(i, "locale", G() || void 0)), O(() => n(i, "strings", K() ?? void 0)), s(i, 1, "svelte-1hgxild"), x("files-add", i, (e) => Qe(t(), e)), x("remove", i, (e) => $e(t(), e)), m(e, i);
		};
		p(a, (e) => {
			typeof W() == "function" && e(c);
		}), m(e, i);
	}, ie = (e, t = o) => {
		let a = k(() => t().author?.name?.trim() || w(J).activityActorSomeone), c = k(() => w(Z)[t().id]), u = k(() => t().files ?? []);
		var g = we(), _ = T(g), v = b(_, !0), S = y(_, 2), D = T(S), A = T(D), ne = b(A, !0), N = y(A, 2), re = b(N, !0), ie = y(N, 2), P = (e) => {
			var n = he(), r = b(n);
			O((e) => {
				d(n, "title", e), h(r, `· ${w(J).commentEdited ?? ""}`);
			}, [() => M(w(J).commentEditedAt, { when: w(Le).moment(t().edited_at) ?? t().edited_at })]), m(e, n);
		};
		p(ie, (e) => {
			t().edited_at && e(P);
		}), l(D);
		var F = y(D, 2), ae = (e) => {
			var i = ge(), a = C(i), o = T(a);
			s(o, 1, "editor svelte-1hgxild"), O(() => n(o, "value", w(c).initial)), O(() => n(o, "mentionMap", t().mentions)), O(() => n(o, "mentions", U())), O(() => n(o, "label", w(J).commentEditLabel)), O(() => n(o, "locale", G() || void 0)), O(() => n(o, "strings", K() ?? void 0)), r(o, (e, t) => fe?.(e, t), () => ({
				owner: q,
				end: !0
			}));
			var u = y(o, 2);
			te(u, () => t().id, () => w(c)), l(a);
			var f = y(a, 2), g = T(f);
			ee(g);
			var _ = y(g, 2), v = T(_), S = b(v, !0), D = y(v, 2), k = T(D), A = (e) => {
				se(e);
			};
			p(k, (e) => {
				V() && w($)?.id === t().id && e(A);
			});
			var j = y(k, 1, !0);
			l(D), l(_), l(f), O((e) => {
				a.inert = V() || void 0, d(v, "aria-disabled", V() ? "true" : void 0), h(S, w(J).cancel), d(D, "aria-disabled", e), h(j, w(J).commentSave);
			}, [() => V() || qe(w(c)) ? "true" : void 0]), E("change", o, (e) => et(t().id, e)), x("keydown", o, (e) => dt(e, () => ot(t().id)), !0), E("click", v, () => st(t().id)), E("click", D, () => ot(t().id)), m(e, i);
		}, oe = (e) => {
			var r = be(), a = C(r), o = (e) => {
				var r = _e();
				n(r, "part", "body"), s(r, 1, "body svelte-1hgxild"), O(() => n(r, "value", t().body)), O(() => n(r, "mentions", t().mentions)), O(() => n(r, "locale", G() || void 0)), O(() => n(r, "strings", K() ?? void 0)), m(e, r);
			}, c = k(() => t().body?.trim());
			p(a, (e) => {
				w(c) && e(o);
			});
			var g = y(a, 2), _ = (e) => {
				var n = ye();
				f(n, 21, () => w(u), i, (e, n, r) => {
					var i = ve(), a = y(T(i), 2), o = b(a, !0), s = y(a, 2), c = b(s, !0);
					l(i), O((e, t) => {
						d(a, "aria-label", e), h(o, w(n).name), h(c, t);
					}, [() => M(w(J).commentOpenFile, { name: w(n).name }), () => w(Re)(w(n).byte_size)]), E("click", a, () => ut(t(), r)), m(e, i);
				}), l(n), m(e, n);
			};
			p(g, (e) => {
				w(u).length > 0 && e(_);
			}), m(e, r);
		};
		p(F, (e) => {
			w(c) ? e(ae) : e(oe, -1);
		});
		var I = y(F, 2), le = (e) => {
			ce(e, H);
		};
		p(I, (e) => {
			w(ft)?.kind === "comment" && w(ft).id === t().id && e(le);
		}), l(S);
		var L = y(S, 2), R = (e) => {
			var n = Ce(), r = T(n), i = (e) => {
				var n = xe();
				O((e) => {
					d(n, "aria-label", e), d(n, "aria-disabled", V() ? "true" : void 0);
				}, [() => M(w(J).commentEditBy, { name: w(a) })]), E("click", n, () => at(t())), m(e, n);
			};
			p(r, (e) => {
				t().can_edit && e(i);
			});
			var o = y(r, 2), s = (e) => {
				var n = Se();
				O((e) => {
					d(n, "aria-label", e), d(n, "aria-disabled", V() ? "true" : void 0);
				}, [() => M(w(J).commentDeleteBy, { name: w(a) })]), E("click", n, () => {
					V() || j(Q, t().id, !0);
				}), m(e, n);
			};
			p(o, (e) => {
				t().can_delete && e(s);
			}), l(n), m(e, n);
		};
		p(L, (e) => {
			!w(c) && (t().can_edit || t().can_delete) && e(R);
		}), l(g), O((e, n, r, i) => {
			d(g, "data-comment-id", t().id), d(_, "data-hue", e), h(v, n), h(ne, w(a)), d(N, "datetime", t().created_at), d(N, "title", r), h(re, i);
		}, [
			() => de(t().author?.id),
			() => t().author?.name?.trim() ? ue(t().author.name) : "?",
			() => w(Le).moment(t().created_at),
			() => w(Le).since(t().created_at, w(Be))
		]), m(e, g);
	}, I = _(u, "comments", 7, null), R = _(u, "canComment", 7, !1), z = _(u, "closed", 7, !1), B = _(u, "hasEarlier", 7, !1), V = _(u, "busy", 7, !1), H = _(u, "error", 7, null), Ie = _(u, "unnotified", 7, null), U = _(u, "mentions", 7, null), W = _(u, "upload", 7, null), G = _(u, "locale", 7, null), K = _(u, "strings", 7, null), q = u.$$host, J = k(() => ne(G(), K() ?? void 0)), Le = k(() => ae(G())), Re = k(() => oe(G())), ze = k(() => new Intl.ListFormat(re(G()) ? "vi" : "en", {
		style: "long",
		type: "conjunction"
	})), Y = k(() => {
		let e = /* @__PURE__ */ new Set();
		return (Array.isArray(I()) ? I() : []).filter((t) => t && typeof t == "object" && typeof t.id == "string" && !e.has(t.id) && !!e.add(t.id));
	}), Be = k(() => (w(Y), Date.now())), Ve = k(() => (Array.isArray(Ie()) ? Ie() : []).map((e) => e?.name?.trim() || w(J).activityActorSomeone)), He = k(() => w(Y).some((e) => e.can_delete)), Ue = (e = "", t = []) => ({
		initial: e,
		text: e,
		files: t
	}), We = A(!1), X = A(Ue()), Z = A({}), Q = A(null), $ = A(null), Ge = A(null), Ke = (e) => e === L ? w(X) : w(Z)[e], qe = (e) => !!e?.files.some((e) => e.status === "uploading"), Je = (e) => e.files.filter((e) => e.status === "done").map((e) => e.id);
	function Ye(e, t) {
		e === L ? j(X, {
			...w(X),
			files: t
		}) : w(Z)[e] && j(Z, {
			...w(Z),
			[e]: {
				...w(Z)[e],
				files: t
			}
		});
	}
	let Xe = 0;
	async function Ze(e, t, n) {
		let r = (n) => {
			let r = Ke(e);
			r?.files.some((e) => e.id === t) && Ye(e, r.files.map((e) => e.id === t ? n : e));
		};
		try {
			let e = await W()(n);
			if (!e || typeof e.id != "string" || !e.id) throw Error();
			r({
				id: e.id,
				name: n.name,
				size: n.size,
				status: "done"
			});
		} catch (e) {
			r({
				id: t,
				name: n.name,
				size: n.size,
				status: "failed",
				error: e instanceof Error && e.message ? e.message : null
			});
		}
	}
	function Qe(e, t) {
		let n = t.detail?.files;
		if (typeof W() == "function" && Array.isArray(n)) for (let t of n) {
			let n = `upload-${++Xe}`;
			Ye(e, [...Ke(e)?.files ?? [], {
				id: n,
				name: t.name,
				size: t.size,
				status: "uploading"
			}]), Ze(e, n, t);
		}
	}
	function $e(e, t) {
		let n = t.detail?.id, r = Ke(e);
		r && Ye(e, r.files.filter((e) => e.id !== n));
	}
	function et(e, t) {
		let n = t.detail?.value, r = Ke(e);
		typeof n == "string" && r && (r.text = n, t.currentTarget.value = n);
	}
	function tt() {
		for (let e of q.shadowRoot?.querySelectorAll("af-rich-editor") ?? []) {
			let t = e.shadowRoot?.activeElement;
			t instanceof HTMLElement && t.blur();
		}
	}
	async function nt(e) {
		await D();
		let t = F();
		t && t !== document.body || q.shadowRoot?.querySelector(e)?.focus();
	}
	function rt() {
		V() || j(We, !0);
	}
	function it() {
		if (V()) return;
		tt();
		let e = w(X);
		if (qe(e)) return;
		let t = Je(e);
		if (!e.text.trim() && t.length === 0) {
			w(Ge)?.shadowRoot?.querySelector("[contenteditable=\"true\"]")?.focus();
			return;
		}
		j($, { kind: "submit" }, !0), P(q, "af-comment-submit", {
			body: e.text,
			attachment_ids: t
		});
	}
	function at(e) {
		if (V() || w(Z)[e.id]) return;
		let t = Ue(e.body ?? "", (e.files ?? []).map((e) => ({
			id: e.id,
			name: e.name,
			size: e.byte_size,
			status: "done"
		})));
		j(Z, {
			...w(Z),
			[e.id]: {
				...t,
				version: e.edited_at ?? e.created_at
			}
		});
	}
	function ot(e) {
		if (V()) return;
		tt();
		let t = w(Z)[e];
		t && !qe(t) && (j($, {
			kind: "edit",
			id: e
		}, !0), P(q, "af-comment-edit", {
			id: e,
			body: t.text,
			attachment_ids: Je(t),
			version: t.version
		}));
	}
	function st(e) {
		if (V()) return;
		let { [e]: t, ...n } = w(Z);
		j(Z, n), nt(`[data-comment-id="${CSS.escape(e)}"] [part~="edit"]`);
	}
	function ct() {
		let e = w(Q);
		j(Q, null), e && !V() && (j($, {
			kind: "delete",
			id: e
		}, !0), P(q, "af-comment-delete", { id: e }));
	}
	function lt() {
		P(q, "af-comment-earlier", {});
	}
	function ut(e, t) {
		P(q, "af-comment-open-file", {
			files: (e.files ?? []).map((e) => ({
				file: e.id,
				filename: e.name
			})),
			start: t
		});
	}
	function dt(e, t) {
		e.key === "Enter" && (e.ctrlKey || e.metaKey) && !e.isComposing && (e.preventDefault(), e.stopPropagation(), t());
	}
	le.set(q, () => {
		let e = w($);
		if (j($, null), e?.kind === "submit") j(X, Ue()), j(We, !1), nt("[part~=\"prompt\"]");
		else if (e?.kind === "edit" && e.id) {
			let { [e.id]: t, ...n } = w(Z);
			j(Z, n), nt(`[data-comment-id="${CSS.escape(e.id)}"] [part~="edit"]`);
		}
	});
	let ft = k(() => {
		if (!H()) return null;
		let e = w($);
		return e?.id && (e.kind === "edit" || e.kind === "delete") && w(Y).some((t) => t.id === e.id) && (e.kind === "delete" || w(Z)[e.id]) ? {
			kind: "comment",
			id: e.id
		} : (!e || e.kind === "submit") && w(We) && R() && !z() ? { kind: "composer" } : { kind: "thread" };
	});
	var pt = {
		get comments() {
			return I();
		},
		set comments(e = null) {
			I(e), t();
		},
		get canComment() {
			return R();
		},
		set canComment(e = !1) {
			R(e), t();
		},
		get closed() {
			return z();
		},
		set closed(e = !1) {
			z(e), t();
		},
		get hasEarlier() {
			return B();
		},
		set hasEarlier(e = !1) {
			B(e), t();
		},
		get busy() {
			return V();
		},
		set busy(e = !1) {
			V(e), t();
		},
		get error() {
			return H();
		},
		set error(e = null) {
			H(e), t();
		},
		get unnotified() {
			return Ie();
		},
		set unnotified(e = null) {
			Ie(e), t();
		},
		get mentions() {
			return U();
		},
		set mentions(e = null) {
			U(e), t();
		},
		get upload() {
			return W();
		},
		set upload(e = null) {
			W(e), t();
		},
		get locale() {
			return G();
		},
		set locale(e = null) {
			G(e), t();
		},
		get strings() {
			return K();
		},
		set strings(e = null) {
			K(e), t();
		}
	}, mt = Pe(), ht = C(mt);
	N(ht, {});
	var gt = y(ht, 2), _t = T(gt), vt = (e) => {
		var t = Te(), n = T(t), r = b(n, !0);
		l(t), O(() => h(r, w(J).commentEarlier)), E("click", n, lt), m(e, t);
	};
	p(_t, (e) => {
		B() && e(vt);
	});
	var yt = y(_t, 2), bt = (e) => {
		var t = Ee();
		f(t, 21, () => w(Y), (e) => e.id, (e, t) => {
			ie(e, () => w(t));
		}), l(t), O(() => d(t, "aria-label", w(J).comments)), m(e, t);
	}, xt = (e) => {
		var t = De(), n = b(t, !0);
		O(() => h(n, w(J).commentsEmpty)), m(e, t);
	};
	p(yt, (e) => {
		w(Y).length > 0 ? e(bt) : e(xt, -1);
	});
	var St = y(yt, 2), Ct = T(St), wt = (e) => {
		var t = Oe(), n = b(t, !0);
		O((e) => h(n, e), [() => M(w(J).commentUnnotified, { names: w(ze).format(w(Ve)) })]), m(e, t);
	};
	p(Ct, (e) => {
		w(Ve).length > 0 && e(wt);
	}), l(St);
	var Tt = y(St, 2), Et = (e) => {
		var t = ke(), n = y(T(t), 2), r = T(n), i = b(r, !0), a = y(r, 1, !0);
		a.nodeValue = " ";
		var o = y(a), s = b(o, !0);
		l(n), l(t), O(() => {
			h(i, w(J).commentClosed), h(s, w(J).commentClosedHint);
		}), m(e, t);
	}, Dt = (e) => {
		var t = Me(), i = T(t), a = (e) => {
			var t = Ae(), n = b(t, !0);
			O(() => h(n, w(J).commentPlaceholder)), E("click", t, rt), m(e, t);
		}, o = (e) => {
			var t = je(), i = C(t), a = T(i);
			s(a, 1, "editor svelte-1hgxild"), O(() => n(a, "value", w(X).initial)), O(() => n(a, "mentions", U())), O(() => n(a, "label", w(J).commentComposerLabel)), O(() => n(a, "locale", G() || void 0)), O(() => n(a, "strings", K() ?? void 0)), v(a, (e) => j(Ge, e), () => w(Ge)), r(a, (e, t) => fe?.(e, t), () => ({
				owner: q,
				end: !1
			}));
			var o = y(a, 2);
			te(o, () => L, () => w(X)), l(i);
			var c = y(i, 2), u = T(c);
			ee(u);
			var f = y(u, 2), g = T(f), _ = (e) => {
				se(e);
			};
			p(g, (e) => {
				V() && w($)?.kind === "submit" && e(_);
			});
			var b = y(g, 1, !0);
			l(f), l(c), O((e) => {
				i.inert = V() || void 0, d(f, "aria-disabled", e), h(b, w(J).commentSend);
			}, [() => V() || qe(w(X)) ? "true" : void 0]), E("change", a, (e) => et(L, e)), x("keydown", a, (e) => dt(e, it), !0), E("click", f, it), m(e, t);
		};
		p(i, (e) => {
			w(We) ? e(o, -1) : e(a);
		});
		var c = y(i, 2), u = (e) => {
			ce(e, H);
		};
		p(c, (e) => {
			w(ft)?.kind === "composer" && e(u);
		}), l(t), m(e, t);
	};
	p(Tt, (e) => {
		z() ? e(Et) : R() && e(Dt, 1);
	});
	var Ot = y(Tt, 2), kt = (e) => {
		ce(e, H);
	};
	p(Ot, (e) => {
		w(ft)?.kind === "thread" && e(kt);
	});
	var At = y(Ot, 2), jt = (e) => {
		var t = Ne();
		O(() => n(t, "open", w(Q) !== null)), n(t, "danger", !0), O(() => n(t, "heading", w(J).commentDeleteTitle)), O(() => n(t, "message", w(J).commentDeleteBody)), O(() => n(t, "confirmLabel", w(J).commentDeleteConfirm)), O(() => n(t, "locale", G() || void 0)), O(() => n(t, "strings", K() ?? void 0)), x("confirm", t, ct), x("cancel", t, () => j(Q, null)), m(e, t);
	};
	return p(At, (e) => {
		w(He) && e(jt);
	}), l(gt), O(() => d(gt, "aria-busy", V() ? "true" : void 0)), m(e, mt), c(pt);
}
te(["change", "click"]), ee(B, {
	comments: { type: "Array" },
	canComment: {
		attribute: "can-comment",
		type: "Boolean"
	},
	closed: {
		attribute: "closed",
		type: "Boolean"
	},
	hasEarlier: {
		attribute: "has-earlier",
		type: "Boolean"
	},
	busy: {
		attribute: "busy",
		type: "Boolean"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	unnotified: { type: "Array" },
	mentions: { type: "Object" },
	upload: { type: "Object" },
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" }, (e) => class extends e {
	settle() {
		le.get(this)?.();
	}
});
//#endregion
export { I as n, B as t };
