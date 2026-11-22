import { t as e } from "./rolldown-runtime-Dy4uBu1J.js";
import { $ as t, Ct as n, E as r, I as i, It as a, Lt as o, O as s, Ot as c, Pt as l, Q as u, T as d, V as f, W as p, X as m, Y as h, Z as ee, _ as g, b as _, ct as te, dt as ne, et as re, g as ie, gt as v, ht as y, it as ae, kt as oe, mt as se, nt as b, ot as x, pt as S, rt as C, st as ce, ut as w, w as le, wt as T, xt as E, yt as D } from "./version-CCDdag5V.js";
import { i as ue, n as O, o as de, r as fe } from "./text-CDgi_cJ8.js";
import { i as k } from "./environment-1PeQDNCe.js";
//#region src/kit/FolderSource.svelte
var A = /* @__PURE__ */ e({ default: () => P }), pe = (e) => {
	var t = N();
	m(e, t);
}, me = [
	"files",
	"computer",
	"watched"
], he = {
	NOT_IN_A_FOLDER: "folderReasonNotInAFolder",
	NOT_SETTLED: "folderReasonNotSettled",
	NO_MARKER: "folderReasonNoMarker",
	TOO_MANY_FILES: "folderReasonTooManyFiles",
	BELOW_MIN_ITEMS: "folderReasonBelowMinItems",
	ABOVE_MAX_ITEMS: "folderReasonAboveMaxItems",
	FILE_TOO_LARGE: "folderReasonFileTooLarge"
}, j = {
	UPLOAD_SET_INCOMPLETE: "folderReasonUploadSetIncomplete",
	FILE_SET_NO_READY_GROUPS: "folderReasonNoReadyGroups",
	UPLOAD_SET_ALREADY_LAUNCHED: "folderReasonAlreadyLaunched",
	FILE_SET_SLOT_HAS_OTHER_CONSUMERS: "folderReasonOtherConsumers",
	FILE_SET_MARKER_NEEDS_FOLDER_GRAIN: "folderReasonMarkerNeedsFolders",
	FILE_SET_IN_USE: "folderReasonInUse"
}, ge = (e) => Object.hasOwn(he, e) ? he[e] : null, _e = (e) => e !== null && Object.hasOwn(j, e) ? j[e] : "folderRefused", M = 200;
function ve(e) {
	let t = typeof e == "object" && e ? e : {}, n = typeof t.status == "number" ? t.status : null;
	return {
		status: n,
		code: typeof t.code == "string" && t.code !== "" ? t.code : null,
		message: [t.detail, t.message].find((e) => typeof e == "string" && e !== "") ?? String(e),
		refused: n !== null && n >= 400 && n < 500 && n !== 408 && n !== 429
	};
}
var ye = /^(\.ds_store|thumbs\.db|desktop\.ini)$/i;
async function be(e) {
	for (let t of e) {
		if (t.isFile) {
			if (!ye.test(t.name)) return !0;
			continue;
		}
		let e = t.createReader?.();
		if (!e) return !0;
		try {
			for (;;) {
				let t = await new Promise((t, n) => e.readEntries(t, n));
				if (!t.length) break;
				if (await be(t)) return !0;
			}
		} catch {
			return !0;
		}
	}
	return !1;
}
var xe = (e, t) => t > 1 ? `${e.slice(0, 192)} +${t - 1}` : e.slice(0, M), N = t("<svg class=\"icon svelte-4wnjhj\" viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"></path></svg>"), Se = u("<li part=\"folder\" class=\"af-list-row compact svelte-4wnjhj\"><button type=\"button\" part=\"choose\" class=\"svelte-4wnjhj\"><!> <span class=\"name svelte-4wnjhj\"> </span> <span class=\"meta svelte-4wnjhj\"> </span></button> <button type=\"button\" part=\"open\" class=\"af-button ghost icon xs svelte-4wnjhj\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg></button></li>"), Ce = u("<label part=\"source\"><input type=\"radio\"/><span> </span></label>"), we = u("<p part=\"hint\" id=\"af-hint\" class=\"svelte-4wnjhj\"> </p>"), Te = u("<li><button type=\"button\" part=\"crumb\" class=\"svelte-4wnjhj\"> </button></li>"), Ee = u("<li><button type=\"button\" part=\"crumb\" class=\"svelte-4wnjhj\"> </button></li> <!>", 1), De = u("<ul part=\"list\" class=\"af-list svelte-4wnjhj\"><!></ul>"), Oe = u("<p class=\"loading svelte-4wnjhj\" role=\"status\"><span class=\"af-spinner\" aria-hidden=\"true\"></span> </p>"), ke = u("<button type=\"button\" class=\"af-button link xs\"> </button>"), Ae = u("<p class=\"failed svelte-4wnjhj\" role=\"alert\"><span> </span><!></p>"), je = u("<p part=\"empty\" class=\"svelte-4wnjhj\"> </p>"), Me = u("<button type=\"button\" part=\"more\" class=\"af-button secondary xs\"> </button>"), Ne = u("<div class=\"browser svelte-4wnjhj\"><nav part=\"path\" class=\"af-breadcrumb\"><ol><li><button type=\"button\" part=\"crumb\" class=\"svelte-4wnjhj\"> </button></li> <!></ol></nav> <!> <!></div>"), Pe = u("<input type=\"file\" webkitdirectory=\"\" hidden=\"\" tabindex=\"-1\"/>"), Fe = u("<input type=\"file\" multiple=\"\" hidden=\"\" tabindex=\"-1\"/>"), Ie = u("<button type=\"button\" part=\"dropzone\" class=\"svelte-4wnjhj\"><svg class=\"glyph svelte-4wnjhj\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v12\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path></svg> <span class=\"lead svelte-4wnjhj\"> <span part=\"trigger\" class=\"svelte-4wnjhj\"> </span></span></button> <!>", 1), Le = u("<progress part=\"progress\" class=\"af-progress svelte-4wnjhj\"></progress>"), Re = u("<div class=\"upload svelte-4wnjhj\"><!> <span class=\"progress-text svelte-4wnjhj\" aria-hidden=\"true\"> </span> <button type=\"button\" part=\"cancel\" class=\"af-button ghost xs\"> </button></div>"), ze = u("<button type=\"button\" part=\"retry\" class=\"af-button secondary xs\"> </button>"), Be = u("<p part=\"chosen\" class=\"svelte-4wnjhj\"><!><span class=\"name svelte-4wnjhj\"> </span></p>"), Ve = u("<div part=\"refusal\" class=\"af-banner danger\" role=\"alert\"><div class=\"af-banner-title\"> </div> <div class=\"af-banner-description\"> </div></div>"), He = u("<div part=\"count\" class=\"svelte-4wnjhj\"><dt class=\"svelte-4wnjhj\"> </dt> <dd class=\"svelte-4wnjhj\"> </dd></div>"), Ue = u("<dl class=\"counts svelte-4wnjhj\"></dl>"), We = u("<p part=\"sample\" class=\"svelte-4wnjhj\"><span class=\"label svelte-4wnjhj\"> </span> <span class=\"keys\"> </span></p>"), Ge = u("<li part=\"reason\" class=\"svelte-4wnjhj\"><span> </span> <span class=\"count svelte-4wnjhj\"> </span></li>"), Ke = u("<ul class=\"reasons svelte-4wnjhj\"></ul>"), qe = u("<p class=\"refused svelte-4wnjhj\"> </p>"), Je = u("<section part=\"preview\" class=\"svelte-4wnjhj\"><!> <!> <!> <!> <!></section>"), Ye = u("<!> <div class=\"af-kit source svelte-4wnjhj\"><div part=\"sources\" class=\"af-segmented svelte-4wnjhj\" role=\"radiogroup\"></div> <!> <!> <!> <div class=\"status svelte-4wnjhj\"><div part=\"notice\" role=\"status\" aria-live=\"polite\" class=\"svelte-4wnjhj\"> </div> <!></div> <!> <!></div>", 1), Xe = {
	hash: "svelte-4wnjhj",
	code: ":host {display:block;}.source.svelte-4wnjhj {display:flex;flex-direction:column;align-items:stretch;gap:8px;font-size:12px;line-height:1.5;--fs-edge: color-mix(in oklab, var(--k-fg) calc(15% + var(--k-dark, 0) * 6%), var(--k-surface));--fs-soft: color-mix(in oklab, var(--k-muted) calc(60% + var(--k-dark, 0) * 25%), var(--k-surface));}[part~='sources'].svelte-4wnjhj {align-self:flex-start;}[part~='hint'].svelte-4wnjhj {margin:0;color:var(--k-muted);font-size:11.5px;}[part~='dropzone'].svelte-4wnjhj {display:flex;box-sizing:border-box;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:100%;padding:16px 12px;border:2px dashed var(--fs-edge);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);color:var(--k-fg);font:inherit;text-align:center;outline:none;cursor:pointer;transition-property:color, background-color, border-color, box-shadow;transition-duration:150ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (hover: hover) {[part~='dropzone'].svelte-4wnjhj:hover {border-color:var(--fs-soft);} }[part~='dropzone'][data-dragging].svelte-4wnjhj {border-color:color-mix(in oklab, var(--k-primary) 60%, var(--k-surface));background-color:color-mix(in oklab, var(--k-primary) 4%, transparent);}[part~='dropzone'].svelte-4wnjhj:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='dropzone'][aria-disabled='true'].svelte-4wnjhj {opacity:0.5;cursor:not-allowed;}.glyph.svelte-4wnjhj {flex:none;color:var(--fs-soft);}[part~='trigger'].svelte-4wnjhj {color:var(--k-primary);font-weight:500;}\n  @media (hover: hover) {[part~='dropzone'].svelte-4wnjhj:not([aria-disabled='true']):hover [part~='trigger']:where(.svelte-4wnjhj) {text-decoration-line:underline;} }[part~='dropzone'].svelte-4wnjhj > :where(.svelte-4wnjhj) {pointer-events:none;}.browser.svelte-4wnjhj {display:flex;flex-direction:column;align-items:flex-start;gap:6px;}[part~='crumb'].svelte-4wnjhj {padding:0;border:0;border-radius:2px;background:none;color:var(--k-muted);font:inherit;outline:none;cursor:pointer;}[part~='crumb'][aria-current].svelte-4wnjhj {color:var(--k-fg);}\n  @media (hover: hover) {[part~='crumb'].svelte-4wnjhj:hover {color:var(--k-fg);} }[part~='crumb'].svelte-4wnjhj:disabled {cursor:not-allowed;}[part~='crumb'].svelte-4wnjhj:disabled:not([aria-current]) {color:var(--k-muted);}[part~='crumb'].svelte-4wnjhj:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='list'].svelte-4wnjhj {box-sizing:border-box;align-self:stretch;max-height:224px;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--k-line) transparent;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);}[part~='folder'].svelte-4wnjhj {padding-block:2px;padding-inline:4px;gap:4px;}[part~='folder'][data-chosen].svelte-4wnjhj {background-color:color-mix(in oklab, var(--k-primary) 6%, var(--k-surface));}[part~='choose'].svelte-4wnjhj {display:flex;flex:1 1 0%;align-items:center;gap:8px;min-width:0;min-height:28px;padding:2px 8px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;text-align:start;outline:none;cursor:pointer;}[part~='choose'].svelte-4wnjhj:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='choose'][aria-pressed='true'].svelte-4wnjhj .name:where(.svelte-4wnjhj) {color:var(--k-primary);font-weight:500;}[part~='choose'].svelte-4wnjhj:disabled {opacity:0.5;cursor:not-allowed;}.icon.svelte-4wnjhj {flex:none;width:14px;height:14px;color:var(--k-muted);}.name.svelte-4wnjhj {min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.meta.svelte-4wnjhj {flex:none;margin-inline-start:auto;color:var(--k-muted);font-size:10.5px;font-variant-numeric:tabular-nums;}.loading.svelte-4wnjhj, .failed.svelte-4wnjhj, [part~='empty'].svelte-4wnjhj {margin:0;color:var(--k-muted);font-size:11.5px;}.loading.svelte-4wnjhj {display:flex;align-items:center;gap:6px;}.failed.svelte-4wnjhj {color:var(--k-danger);}[part~='empty'].svelte-4wnjhj {font-style:italic;}.upload.svelte-4wnjhj {display:flex;align-items:center;gap:8px;}.upload.svelte-4wnjhj [part~='progress']:where(.svelte-4wnjhj) {flex:1 1 0%;min-width:0;}.progress-text.svelte-4wnjhj {flex:none;color:var(--k-muted);font-size:11.5px;font-variant-numeric:tabular-nums;}.status.svelte-4wnjhj {display:flex;position:relative;align-items:center;gap:8px;}.status.svelte-4wnjhj:has([part~='notice']:where(.svelte-4wnjhj):empty), .status.svelte-4wnjhj:has([part~='notice'][data-spoken]:where(.svelte-4wnjhj)) {margin-top:-8px;}[part~='notice'][data-spoken].svelte-4wnjhj {position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}[part~='notice'].svelte-4wnjhj {color:var(--k-muted);font-size:11.5px;}[part~='notice'][data-tone='danger'].svelte-4wnjhj {color:var(--k-danger);}[part~='chosen'].svelte-4wnjhj {display:flex;align-items:center;gap:6px;margin:0;color:var(--k-fg);font-weight:500;}[part~='preview'].svelte-4wnjhj {display:flex;box-sizing:border-box;flex-direction:column;gap:8px;padding:10px 12px;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);}.counts.svelte-4wnjhj {display:flex;flex-wrap:wrap;gap:4px 24px;margin:0;}[part~='count'].svelte-4wnjhj {display:flex;align-items:baseline;gap:6px;}[part~='count'].svelte-4wnjhj dt:where(.svelte-4wnjhj) {color:var(--k-muted);font-size:10.5px;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;}[part~='count'].svelte-4wnjhj dd:where(.svelte-4wnjhj) {margin:0;color:var(--k-fg);font-size:13.5px;font-weight:500;font-variant-numeric:tabular-nums;}[part~='sample'].svelte-4wnjhj {margin:0;color:var(--k-fg);overflow-wrap:anywhere;}.label.svelte-4wnjhj {color:var(--k-muted);}.reasons.svelte-4wnjhj {margin:0;padding:6px 0 0;border-top:1px solid var(--k-line);list-style:none;}[part~='reason'].svelte-4wnjhj {display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-block:2px;color:var(--k-fg);}.count.svelte-4wnjhj {flex:none;color:var(--k-muted);font-variant-numeric:tabular-nums;}.refused.svelte-4wnjhj {margin:0;color:var(--k-warning);}\n  @media (prefers-reduced-motion: reduce) {[part~='dropzone'].svelte-4wnjhj {transition:none;} }\n  @media (forced-colors: active) {[part~='dropzone'].svelte-4wnjhj:focus-visible, [part~='crumb'].svelte-4wnjhj:focus-visible, [part~='choose'].svelte-4wnjhj:focus-visible {outline:2px solid;outline-offset:2px;}[part~='folder'][data-chosen].svelte-4wnjhj {forced-color-adjust:none;background-color:Highlight;}[part~='folder'][data-chosen].svelte-4wnjhj [part~='choose']:where(.svelte-4wnjhj) {color:HighlightText;}\n  }"
};
function P(e, t) {
	let u = re();
	oe(t, !0), i(e, Xe);
	let ie = (e, t = a, n = a, r = a, i = a, o = a) => {
		var s = Se(), c = S(s), u = S(c);
		pe(u);
		var f = v(u, 2), p = y(f, !0), ee = v(f, 2), g = y(ee, !0);
		l(c);
		var _ = v(c, 2);
		l(s), w((e, i) => {
			d(s, "data-chosen", r() ? "" : void 0), d(c, "aria-pressed", r()), c.disabled = x(Y), h(p, t()), h(g, n()), d(_, "aria-label", e), d(_, "title", i), _.disabled = x(Y);
		}, [() => O(x(I).folderOpen, { name: t() }), () => O(x(I).folderOpen, { name: t() })]), C("click", c, function(...e) {
			i()?.apply(this, e);
		}), C("click", _, function(...e) {
			o()?.apply(this, e);
		}), m(e, s);
	}, b = g(t, "sources", 7, null), A = g(t, "workflow", 7, null), he = g(t, "version", 7, null), j = g(t, "field", 7, null), M = g(t, "folder", 7, null), N = g(t, "resumeSet", 7, null), P = g(t, "offer", 7, null), Ze = g(t, "disabled", 7, !1), Qe = g(t, "locale", 7, null), $e = g(t, "strings", 7, null), F = t.$$host, I = T(() => ue(Qe(), $e() ?? void 0)), et = T(() => new Intl.NumberFormat(fe(Qe()) ? "vi-VN" : "en-GB")), L = (e) => x(et).format(e), tt = T(() => {
		let e = me.filter((e) => P()?.includes(e));
		return e.length ? e : me;
	}), nt = E(null), R = T(() => {
		if (x(nt) && x(tt).includes(x(nt))) return x(nt);
		let e = M()?.grain === "file" ? "files" : "computer";
		return x(tt).includes(e) ? e : x(tt)[0];
	}), rt = T(() => ({
		files: x(I).folderFromFiles,
		computer: x(I).folderFromComputer,
		watched: x(I).folderFromWatched
	})), z = E(null), it = E(null), B = E(""), V = E(null), H = E([]), U = E(!1), W = E(null), at = E(!1), G = E(""), K = E(""), ot = E(""), st = E(""), ct = 0, lt = 0, ut = E(!1), q = 0, dt = null, ft = null, pt = null, mt = !1, J = E([]), Y = T(() => !!Ze() || x(U)), ht = !1;
	function gt() {
		let e = x(U) || x(at);
		e !== ht && (ht = e, k(F, "af-folder-busy", { busy: e }));
	}
	ne(gt);
	let _t = T(() => !!N() && !x(J).includes(N()) && x(R) !== "watched" && !x(U) && !x(z)), vt = T(() => M()?.grain === "folder" ? M().depth > 1 ? O(x(I).folderGrainDeep, { depth: M().depth }) : x(I).folderGrainFolder : M()?.grain === "file" ? x(I).folderGrainFile : ""), yt = T(() => [x(vt), x(_t) ? x(I).folderResumeHint : ""].filter(Boolean).join(" ")), bt = T(() => x(W) ? O(x(I).folderUploadProgress, {
		stored: L(x(W).stored),
		total: L(x(W).total)
	}) : x(I).folderUploadStarting), xt = T(() => x(K) ? x(I)[x(K)] : x(G) === "upload" ? x(I).folderUploadFailed : x(G) === "preview" ? x(I).folderPreviewFailed : x(ot) || (x(at) ? x(I).folderChecking : x(st))), St = T(() => !x(G) && !x(ot) && !x(at) && !!x(st)), Ct = T(() => x(H).length ? O(x(H).length === 1 ? x(I).folderRefusedFilesOne : x(I).folderRefusedFiles, { count: L(x(H).length) }) : "");
	function wt() {
		ct += 1, D(ot, ""), D(st, "");
	}
	async function X(e, t = !1) {
		wt();
		let n = ct;
		await ce(), n === ct && D(t ? st : ot, e, !0);
	}
	function Tt() {
		return b() || X(x(I).folderNoSources), !!b();
	}
	function Et() {
		dt?.abort(), dt = null, q += 1, D(U, !1), D(at, !1), D(W, null), D(G, ""), D(K, ""), wt(), D(V, null), D(H, []), D(B, ""), D(z, null), x(it) && (D(it, null), k(F, "af-folder-change", {
			value: null,
			preview: null
		}));
	}
	async function Dt(e, t = "") {
		let n = ++q;
		D(G, ""), D(K, ""), wt(), D(at, !0), gt();
		let r = null;
		if (b() && A() && j()) try {
			r = await b().preview(A(), j(), e, he() || void 0);
		} catch (e) {
			if (n !== q) return;
			D(G, "preview"), D(K, Ot("preview", e), !0);
		}
		if (n !== q || (D(at, !1), D(it, e), D(V, r), k(F, "af-folder-change", {
			value: e,
			preview: r
		}), x(G))) return;
		let i = [
			t,
			r && !r.refusal ? `${x(I).folderPreview}: ${x(nn).map(([e, t]) => `${e} ${L(t)}`).join(", ")}.` : "",
			x(Ct)
		].filter(Boolean).join(" ");
		i && X(i, !0);
	}
	function Ot(e, t) {
		let { status: n, code: r, message: i, refused: a } = ve(t);
		return k(F, "af-folder-error", {
			during: e,
			status: n,
			code: r,
			message: i
		}), a ? _e(r) : "";
	}
	let kt = ["[part~=\"dropzone\"]", "[part~=\"source\"] input:checked"];
	async function At(e) {
		await ce();
		for (let t of e) {
			let e = F.shadowRoot?.querySelector(t);
			if (e) return e.focus();
		}
	}
	let jt = () => !!F.shadowRoot?.activeElement?.matches("[part~=\"cancel\"]");
	async function Mt(e) {
		if (!b()) return;
		Et(), ft = e;
		let t = q, n = dt = new AbortController(), r = pt ?? (N() && !x(J).includes(N()) ? N() : void 0);
		mt = !1, D(U, !0), gt(), D(B, e.name, !0), lt = 0, X(x(I).folderUploadStarting, !0);
		let i = {
			name: e.name,
			resumeSetId: r,
			signal: n.signal,
			onSetCreated: (e) => {
				t === q && (pt = e, mt = !0, k(F, "af-folder-upload-started", { setId: e }));
			},
			onProgress: ({ stored: e, total: n }) => {
				if (t !== q) return;
				D(W, {
					stored: e,
					total: n
				}), k(F, "af-folder-progress", {
					stored: e,
					total: n
				});
				let r = Math.floor(e * 4 / Math.max(n, 1));
				r !== lt && (lt = r, X(x(bt), !0));
			}
		};
		try {
			let n = e.kind === "uploadFolder" ? await b().uploadFolder(e.payload, i) : await b().uploadFiles(e.payload, i);
			if (t !== q) return;
			jt() && At(kt), pt = null, D(J, [...x(J), n.value.$fileSet]), ft = null, D(U, !1), D(W, null), D(H, n.refused), D(z, n.value), await Dt(n.value, x(I).folderUploadDone);
		} catch (e) {
			if (t !== q) return;
			let n = jt();
			D(U, !1), D(W, null), D(G, "upload");
			let i = Ot("upload", e);
			if (i) {
				D(K, i, !0), ft = null, D(B, "");
				let e = pt;
				pt = null;
				let t = [e, r].filter((e) => !!e && !x(J).includes(e));
				t.length && D(J, [...x(J), ...new Set(t)]), e && b().deleteSet(e).catch(() => void 0);
			}
			n && At(["[part~=\"retry\"]", ...kt]);
		}
	}
	function Nt() {
		mt && (pt = null), Et(), At(kt);
	}
	function Pt() {
		x(G) === "upload" && ft ? Mt(ft) : x(G) === "preview" && x(z) && Dt(x(z)), At([
			"[part~=\"cancel\"]",
			"[part~=\"choose\"][aria-pressed=\"true\"]",
			...kt
		]);
	}
	ne(() => () => {
		q += 1, dt?.abort();
	}), ne(() => {
		A(), j(), he(), te(() => {
			x(z) && !x(U) && Dt(x(z));
		});
	});
	let Ft = E(null);
	function It() {
		!x(Y) && Tt() && x(Ft)?.click();
	}
	function Lt(e) {
		let t = e.currentTarget, n = Array.from(t.files ?? []);
		t.value = "", !x(Y) && Tt() && (x(R) === "computer" ? n.some((e) => !ye.test(e.name)) ? Mt({
			kind: "uploadFolder",
			payload: n,
			name: xe(n[0].webkitRelativePath.split("/")[0] || n[0].name, 1)
		}) : X(x(I).folderEmpty) : n.length && Mt({
			kind: "uploadFiles",
			payload: n,
			name: xe(n[0].name, n.length)
		}));
	}
	async function Rt(e, t) {
		let n = q, r = await be(e);
		n !== q || x(Y) || (r ? Mt({
			kind: "uploadFolder",
			payload: e,
			name: t
		}) : X(x(I).folderEmpty));
	}
	function zt(e) {
		e.preventDefault(), D(ut, !x(Y));
	}
	function Bt(e) {
		if (e.preventDefault(), D(ut, !1), x(Y) || !Tt()) return;
		let t = Array.from(e.dataTransfer?.items ?? []).filter((e) => e.kind === "file"), n = t.map((e) => e.webkitGetAsEntry?.() ?? null), r = n.filter((e) => e?.isDirectory);
		if (x(R) === "computer") {
			r.length ? Rt(n.filter((e) => e !== null), xe(r[0].name, r.length)) : X(x(I).folderNeedsFolder);
			return;
		}
		let i = t.map((e) => e.getAsFile()).filter((e) => e !== null);
		r.length || !i.length ? X(x(I).folderNeedsFiles) : Mt({
			kind: "uploadFiles",
			payload: i,
			name: xe(i[0].name, i.length)
		});
	}
	let Vt = E(null), Z = E(null), Q = E([]), Ht = E(null), Ut = E(!1), Wt = E(!1), $ = E(""), Gt = 0, Kt = T(() => x(Z)?.trail.at(-1)?.path), qt = T(() => !x(Ut) && !x(Wt) && (x(Z) ? x(Q).length === 0 : x(Vt)?.length === 0));
	async function Jt(e) {
		if (!b()) return;
		let t = ++Gt, n = e ? x(Ht) : null;
		D(Ut, !0), D(Wt, !1), D($, "");
		try {
			if (x(Z)) {
				let r = await b().subfolders(x(Z).set.id, x(Kt), n);
				if (t !== Gt) return;
				D(Q, e ? [...x(Q), ...r.items] : r.items), D(Ht, r.next_cursor, !0);
			} else {
				let e = await b().watched();
				if (t !== Gt) return;
				D(Vt, e);
			}
		} catch (e) {
			if (t !== Gt) return;
			D(Wt, !0), D($, Ot("list", e), !0);
		}
		D(Ut, !1);
	}
	ne(() => {
		x(R) === "watched" && b() && te(() => {
			!x(Vt) && !x(Ut) && !x(Wt) && Jt(!1);
		});
	});
	async function Yt(e) {
		await ce();
		let t = F.shadowRoot;
		(t?.querySelectorAll("[part~=\"choose\"]")[e] ?? t?.querySelector("[part~=\"crumb\"][aria-current]"))?.focus();
	}
	async function Xt(e) {
		D(Z, e), D(Q, []), D(Ht, null), e || !x(Vt) ? await Jt(!1) : (Gt += 1, D(Ut, !1), D(Wt, !1), D($, "")), await Yt(0);
	}
	async function Zt() {
		let e = x(Q).length;
		await Jt(!0), await Yt(e);
	}
	function Qt(e, t) {
		Et();
		let n = t.at(-1)?.path, r = n === void 0 ? { $fileSet: e.id } : {
			$fileSet: e.id,
			path: n
		};
		D(z, r), D(B, [e.name, ...t.map((e) => e.name)].join(" / "), !0), Dt(r);
	}
	let $t = (e, t) => x(z)?.$fileSet === e && x(z).path === t, en = (e) => O(e === 1 ? x(I).folderFileCountOne : x(I).folderFileCount, { count: L(e) }), tn = T(() => x(V)?.grain ?? M()?.grain ?? null), nn = T(() => {
		if (!x(V)) return [];
		let e = x(tn) === "folder" ? [[x(I).folderGroups, x(V).group_count], [x(I).folderItems, x(V).item_count]] : [[x(I).folderItems, x(V).group_count]];
		return x(V).excluded_count > 0 && e.push([x(I).folderLeftOut, x(V).excluded_count]), e;
	}), rn = T(() => {
		if (!x(V)) return [];
		let e = { ...x(V).excluded_by_reason };
		return x(V).loose_file_count > 0 && (e.NOT_IN_A_FOLDER = x(V).loose_file_count), Object.entries(e).filter(([, e]) => e > 0).map(([e, t]) => ({
			code: e,
			count: t,
			label: ge(e) ? x(I)[ge(e)] : O(x(I).folderReasonOther, { code: e })
		}));
	}), an = T(() => x(V)?.refusal ? x(I)[_e(x(V).refusal.code)] : "");
	var on = {
		get sources() {
			return b();
		},
		set sources(e = null) {
			b(e), n();
		},
		get workflow() {
			return A();
		},
		set workflow(e = null) {
			A(e), n();
		},
		get version() {
			return he();
		},
		set version(e = null) {
			he(e), n();
		},
		get field() {
			return j();
		},
		set field(e = null) {
			j(e), n();
		},
		get folder() {
			return M();
		},
		set folder(e = null) {
			M(e), n();
		},
		get resumeSet() {
			return N();
		},
		set resumeSet(e = null) {
			N(e), n();
		},
		get offer() {
			return P();
		},
		set offer(e = null) {
			P(e), n();
		},
		get disabled() {
			return Ze();
		},
		set disabled(e = !1) {
			Ze(e), n();
		},
		get locale() {
			return Qe();
		},
		set locale(e = null) {
			Qe(e), n();
		},
		get strings() {
			return $e();
		},
		set strings(e = null) {
			$e(e), n();
		}
	}, sn = Ye(), cn = se(sn);
	de(cn, {});
	var ln = v(cn, 2), un = S(ln);
	f(un, 20, () => x(tt), (e) => e, (e, t) => {
		var n = Ce(), i = S(n);
		le(i);
		var a = v(i), o = y(a, !0);
		l(n), w(() => {
			d(i, "name", `${u}-source`), s(i, t), r(i, x(R) === t), i.disabled = x(Y), h(o, x(rt)[t]);
		}), C("change", i, () => {
			D(nt, t, !0), wt();
		}), m(e, n);
	}), l(un);
	var dn = v(un, 2), fn = (e) => {
		var t = we(), n = y(t, !0);
		w(() => h(n, x(yt))), m(e, t);
	};
	p(dn, (e) => {
		x(yt) && e(fn);
	});
	var pn = v(dn, 2), mn = (e) => {
		var t = Ne(), n = S(t), r = S(n), i = S(r), a = S(i), o = y(a, !0);
		l(i);
		var s = v(i, 2), c = (e) => {
			let t = T(() => x(Z));
			var n = Ee(), r = se(n), i = S(r), a = y(i, !0);
			l(r);
			var o = v(r, 2);
			f(o, 19, () => x(t).trail, (e) => e.path, (e, n, r) => {
				var i = Te(), a = S(i), o = y(a, !0);
				l(i), w(() => {
					a.disabled = x(Y), d(a, "aria-current", x(r) === x(t).trail.length - 1 ? "location" : void 0), h(o, x(n).name);
				}), C("click", a, () => Xt({
					set: x(t).set,
					trail: x(t).trail.slice(0, x(r) + 1)
				})), m(e, i);
			}), w(() => {
				i.disabled = x(Y), d(i, "aria-current", x(t).trail.length ? void 0 : "location"), h(a, x(t).set.name);
			}), C("click", i, () => Xt({
				set: x(t).set,
				trail: []
			})), m(e, n);
		};
		p(s, (e) => {
			x(Z) && e(c);
		}), l(r), l(n);
		var u = v(n, 2), g = (e) => {
			var t = De(), n = S(t), r = (e) => {
				let t = T(() => x(Z));
				var n = ee(), r = se(n);
				f(r, 17, () => x(Q), (e) => e.path, (e, n) => {
					{
						let r = T(() => x(n).settled_count < x(n).file_count ? O(x(I).folderFilesReady, {
							ready: L(x(n).settled_count),
							count: L(x(n).file_count)
						}) : en(x(n).file_count)), i = T(() => $t(x(t).set.id, x(n).path));
						ie(e, () => x(n).name, () => x(r), () => x(i), () => () => Qt(x(t).set, [...x(t).trail, x(n)]), () => () => Xt({
							set: x(t).set,
							trail: [...x(t).trail, x(n)]
						}));
					}
				}), m(e, n);
			}, i = (e) => {
				var t = ee(), n = se(t);
				f(n, 17, () => x(Vt) ?? [], (e) => e.id, (e, t) => {
					{
						let n = T(() => en(x(t).entry_count)), r = T(() => $t(x(t).id));
						ie(e, () => x(t).name, () => x(n), () => x(r), () => () => Qt(x(t), []), () => () => Xt({
							set: x(t),
							trail: []
						}));
					}
				}), m(e, t);
			};
			p(n, (e) => {
				x(Z) ? e(r) : e(i, -1);
			}), l(t), m(e, t);
		};
		p(u, (e) => {
			(x(Z) ? x(Q).length : x(Vt)?.length) && e(g);
		});
		var _ = v(u, 2), te = (e) => {
			var t = Oe(), n = v(S(t));
			l(t), w(() => h(n, ` ${x(I).loading ?? ""}`)), m(e, t);
		}, ne = (e) => {
			var t = Ae(), n = S(t), r = y(n, !0), i = v(n), a = (e) => {
				var t = ke(), n = y(t, !0);
				w(() => {
					t.disabled = x(Y), h(n, x(I).folderRetry);
				}), C("click", t, () => Jt(!1)), m(e, t);
			};
			p(i, (e) => {
				x($) || e(a);
			}), l(t), w(() => h(r, x($) ? x(I)[x($)] : x(I).folderLoadFailed)), m(e, t);
		}, re = (e) => {
			var t = je(), n = y(t, !0);
			w(() => h(n, x(I).folderNoSources)), m(e, t);
		}, ae = (e) => {
			var t = je(), n = y(t, !0);
			w(() => h(n, x(Z) ? x(I).folderNoSubfolders : x(I).folderWatchedEmpty)), m(e, t);
		}, oe = (e) => {
			var t = Me(), n = y(t, !0);
			w(() => {
				t.disabled = x(Y), h(n, x(I).loadMore);
			}), C("click", t, Zt), m(e, t);
		};
		p(_, (e) => {
			x(Ut) ? e(te) : x(Wt) ? e(ne, 1) : b() ? x(qt) ? e(ae, 3) : x(Z) && x(Ht) && e(oe, 4) : e(re, 2);
		}), l(t), w(() => {
			d(n, "aria-label", x(I).folderWatchedRoot), a.disabled = x(Y), d(a, "aria-current", x(Z) ? void 0 : "location"), h(o, x(I).folderWatchedRoot);
		}), C("click", a, () => Xt(null)), m(e, t);
	}, hn = (e) => {
		var t = Ie(), n = se(t), r = v(S(n), 2), i = S(r), a = v(i), o = y(a, !0);
		l(r), l(n);
		var s = v(n, 2), c = (e) => {
			var t = Pe();
			_(t, (e) => D(Ft, e), () => x(Ft)), C("change", t, Lt), m(e, t);
		}, u = (e) => {
			var t = Fe();
			_(t, (e) => D(Ft, e), () => x(Ft)), C("change", t, Lt), m(e, t);
		};
		p(s, (e) => {
			x(R) === "computer" ? e(c) : e(u, -1);
		}), w(() => {
			d(n, "aria-describedby", x(yt) ? "af-hint" : void 0), d(n, "aria-disabled", x(Y) ? "true" : void 0), d(n, "data-dragging", x(ut) ? "" : void 0), h(i, `${(x(R) === "computer" ? x(I).folderDrop : x(I).dropFiles) ?? ""} `), h(o, x(R) === "computer" ? x(I).folderBrowse : x(I).browse);
		}), C("click", n, It), ae("dragenter", n, zt), ae("dragover", n, zt), ae("dragleave", n, () => D(ut, !1)), ae("drop", n, Bt), m(e, t);
	};
	p(pn, (e) => {
		x(R) === "watched" ? e(mn) : e(hn, -1);
	});
	var gn = v(pn, 2), _n = (e) => {
		var t = Re(), n = S(t), r = (e) => {
			var t = Le();
			w((e) => {
				d(t, "max", e), s(t, x(W).stored), d(t, "aria-label", x(I).uploading), d(t, "aria-valuetext", x(bt));
			}, [() => Math.max(x(W).total, 1)]), m(e, t);
		}, i = (e) => {
			var t = Le();
			w(() => {
				d(t, "aria-label", x(I).uploading), d(t, "aria-valuetext", x(bt));
			}), m(e, t);
		};
		p(n, (e) => {
			x(W) ? e(r) : e(i, -1);
		});
		var a = v(n, 2), o = y(a, !0), c = v(a, 2), u = y(c, !0);
		l(t), w(() => {
			h(o, x(bt)), h(u, x(I).cancel);
		}), C("click", c, Nt), m(e, t);
	};
	p(gn, (e) => {
		x(U) && e(_n);
	});
	var vn = v(gn, 2), yn = S(vn), bn = y(yn, !0), xn = v(yn, 2), Sn = (e) => {
		var t = ze(), n = y(t, !0);
		w(() => {
			t.disabled = !!Ze(), h(n, x(I).folderRetry);
		}), C("click", t, Pt), m(e, t);
	};
	p(xn, (e) => {
		x(G) && !x(K) && e(Sn);
	}), l(vn);
	var Cn = v(vn, 2), wn = (e) => {
		var t = Be(), n = S(t);
		pe(n);
		var r = v(n), i = y(r, !0);
		l(t), w(() => h(i, x(B))), m(e, t);
	};
	p(Cn, (e) => {
		x(B) && e(wn);
	});
	var Tn = v(Cn, 2), En = (e) => {
		var t = Je(), n = S(t), r = (e) => {
			var t = Ve(), n = S(t), r = y(n, !0), i = v(n, 2), a = y(i, !0);
			l(t), w(() => {
				h(r, x(I).folderRefusal), h(a, x(an));
			}), m(e, t);
		};
		p(n, (e) => {
			x(V)?.refusal && e(r);
		});
		var i = v(n, 2), a = (e) => {
			var t = Ue();
			f(t, 21, () => x(nn), ([e, t]) => e, (e, t) => {
				var n = T(() => o(x(t), 2));
				let r = () => x(n)[0], i = () => x(n)[1];
				var a = He(), s = S(a), c = y(s, !0), u = v(s, 2), d = y(u, !0);
				l(a), w((e) => {
					h(c, r()), h(d, e);
				}, [() => L(i())]), m(e, a);
			}), l(t), m(e, t);
		};
		p(i, (e) => {
			x(nn).length && e(a);
		});
		var s = v(i, 2), c = (e) => {
			var t = We(), n = S(t), r = y(n, !0), i = v(n, 2), a = y(i, !0);
			l(t), w((e) => {
				h(r, x(I).folderSample), h(a, e);
			}, [() => x(V).sample_keys.join(", ")]), m(e, t);
		};
		p(s, (e) => {
			x(V)?.sample_keys.length && e(c);
		});
		var u = v(s, 2), ee = (e) => {
			var t = Ke();
			f(t, 21, () => x(rn), (e) => e.code, (e, t) => {
				var n = Ge(), r = S(n), i = y(r, !0), a = v(r, 2), o = y(a, !0);
				l(n), w((e) => {
					d(n, "data-code", x(t).code), h(i, x(t).label), h(o, e);
				}, [() => L(x(t).count)]), m(e, n);
			}), l(t), w(() => d(t, "aria-label", x(I).folderLeftOut)), m(e, t);
		};
		p(u, (e) => {
			x(rn).length && e(ee);
		});
		var g = v(u, 2), _ = (e) => {
			var t = qe(), n = y(t, !0);
			w(() => h(n, x(Ct))), m(e, t);
		};
		p(g, (e) => {
			x(H).length && e(_);
		}), l(t), w(() => d(t, "aria-label", x(I).folderPreview)), m(e, t);
	};
	return p(Tn, (e) => {
		x(it) && (x(V) || x(H).length) && e(En);
	}), l(ln), w(() => {
		d(un, "aria-label", x(I).folderSource), d(yn, "data-tone", x(G) || x(ot) ? "danger" : void 0), d(yn, "data-spoken", x(St) ? "" : void 0), h(bn, x(xt));
	}), m(e, sn), c(on);
}
b(["click", "change"]), ie(P, {
	sources: { type: "Object" },
	workflow: {
		attribute: "workflow",
		type: "String"
	},
	version: {
		attribute: "version",
		type: "String"
	},
	field: {
		attribute: "field",
		type: "String"
	},
	folder: { type: "Object" },
	resumeSet: {
		attribute: "resume-set",
		type: "String"
	},
	offer: { type: "Array" },
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
export { A as n, P as t };
