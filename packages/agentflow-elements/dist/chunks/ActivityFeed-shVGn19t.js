import { t as e } from "./rolldown-runtime-Dy4uBu1J.js";
import { Ct as t, H as n, I as r, Ot as i, Pt as a, Q as o, T as s, V as c, W as l, X as u, Y as d, _ as f, b as p, ct as m, dt as h, g, gt as _, ht as v, kt as y, mt as b, nt as x, ot as S, pt as C, rt as w, st as T, tt as E, ut as D, wt as O, xt as k, yt as A } from "./version-Cw97ZDNW.js";
import { i as j, n as M, o as N } from "./text-B-lRGRNn.js";
import { t as P } from "./mention-token-0ud8ndht.js";
import { i as F, t as I } from "./environment-1PeQDNCe.js";
import { t as L } from "./time-D23lmmvi.js";
//#region src/kit/activity-labels.ts
var R = {
	"record.created": "activityRecordCreated",
	"record.updated": "activityRecordUpdated",
	"record.stage.transitioned": "activityRecordStageTransitioned",
	"record.series.raised": "activityRecordSeriesRaised",
	"instance.started": "activityInstanceStarted",
	"instance.completed": "activityInstanceCompleted",
	"instance.failed": "activityInstanceFailed",
	"instance.cancelled": "activityInstanceCancelled",
	"instance.paused": "activityInstancePaused",
	"instance.resumed": "activityInstanceResumed",
	"instance.retried": "activityInstanceRetried",
	"instance.archived": "activityInstanceArchived",
	"instance.unarchived": "activityInstanceUnarchived",
	"task.created": "activityTaskCreated",
	"task.opened": "activityTaskOpened",
	"task.claimed": "activityTaskClaimed",
	"task.reassigned": "activityTaskReassigned",
	"task.action_taken": "activityTaskActionTaken",
	"task.submitted": "activityTaskSubmitted",
	"task.rejected": "activityTaskRejected",
	"task.cancelled": "activityTaskCancelled",
	"task.escalated": "activityTaskEscalated",
	"task.signed": "activityTaskSigned",
	"task.signing_cancelled": "activityTaskSigningCancelled",
	"task.signing_failed": "activityTaskSigningFailed",
	"node_run.started": "activityNodeRunStarted",
	"node_run.completed": "activityNodeRunCompleted",
	"node_run.failed": "activityNodeRunFailed",
	"node_run.waiting": "activityNodeRunWaiting",
	"agent.started": "activityAgentStarted",
	"agent.succeeded": "activityAgentSucceeded",
	"agent.failed": "activityAgentFailed",
	"agent.mcp_call": "activityAgentMcpCall",
	"work.started": "activityWorkStarted",
	"work.assigned": "activityWorkAssigned",
	"work.claimed": "activityWorkClaimed",
	"work.released": "activityWorkReleased",
	"work.reassigned": "activityWorkReassigned",
	"work.completed": "activityWorkCompleted",
	"work.unassignable": "activityWorkUnassignable",
	"work.too_many_people": "activityWorkTooManyPeople",
	"work.clock_started": "activityWorkClockStarted",
	"work.clock_paused": "activityWorkClockPaused",
	"work.clock_resumed": "activityWorkClockResumed",
	"work.clock_breached": "activityWorkClockBreached",
	"work.clock_stopped": "activityWorkClockStopped",
	"work.clock_cancelled": "activityWorkClockCancelled",
	"work.clock_escalated": "activityWorkClockEscalated",
	"work.recipient_skipped": "activityWorkRecipientSkipped",
	"work.audience_suppressed": "activityWorkAudienceSuppressed",
	"work.cancelled": "activityWorkCancelled",
	"work.withdrawn": "activityWorkWithdrawn",
	"work.unassigned": "activityWorkUnassigned"
}, z = (e) => typeof e == "object" && !!e && !Array.isArray(e);
function B(e, t) {
	let n = z(e) ? e[t] : void 0;
	return typeof n == "string" ? n.trim() : "";
}
function ee(e) {
	return e in R || e.startsWith("work.");
}
function te(e, t, n) {
	if (e === "task.action_taken") {
		let e = B(n, "action_label") || B(n, "action");
		return e ? M(t.activityTaskActionTaken, { action: e }) : t.activityTaskActionTakenUnknown;
	}
	if (e === "task.reassigned") return M(t.activityTaskReassigned, { name: B(n, "to_user_name") || t.activityTaskReassignFallback });
	if (e === "record.series.raised") {
		let e = B(n, "name");
		return e ? M(t.activityRecordSeriesRaised, { name: e }) : t.activityRecordSeriesRaisedUnnamed;
	}
	let r = R[e];
	return r ? t[r] : e.startsWith("work.") ? t.activityWorkOther : t.activity;
}
function ne(e, t) {
	return (typeof e?.display_name == "string" ? e.display_name.trim() : "") || (e?.kind === "agent" ? t.activityActorAgent : e?.kind === "system" ? t.activityActorSystem : t.activityActorSomeone);
}
var V = {
	user: "person",
	agent: "agent",
	system: "system",
	admin: "admin",
	api_key: "api"
};
function H(e) {
	return e && V[e] || null;
}
function U(e, t) {
	if (!e.includes("](mention:")) return e;
	let n = "", r = 0;
	for (; r < e.length;) {
		let i = e.indexOf("@[", r);
		if (i < 0) return n + e.slice(r);
		n += e.slice(r, i);
		let a = P(e.slice(i));
		n += a ? `@${t.mentionRestricted}` : "@[", r = i + (a ? a.raw.length : 2);
	}
	return n;
}
function W(e, t) {
	return e === !0 ? t.activityListYes : e === !1 ? t.activityListNo : e == null || e === "" ? "—" : Array.isArray(e) ? e.map((e) => W(e, t)).join(", ") : z(e) ? "—" : U(String(e), t);
}
var G = 5;
function K(e, t, n) {
	if (!z(e)) return [];
	let r = [];
	for (let [i, a] of Object.entries(e)) {
		if (!z(a) || !Array.isArray(a.changes)) continue;
		let e = typeof a.label == "string" && a.label ? a.label : q(i, t), o = a.changes.filter(z);
		for (let t of o.slice(0, G)) {
			let i = typeof t.label == "string" ? U(t.label, n) : n.activityListUntitled;
			t.kind === "changed" ? r.push(M(n.activityListChanged, {
				field: e,
				item: i,
				column: String(t.column ?? ""),
				from: W(t.from, n),
				to: W(t.to, n)
			})) : t.kind === "added" ? r.push(M(n.activityListAdded, {
				field: e,
				item: i
			})) : t.kind === "removed" ? r.push(M(n.activityListRemoved, {
				field: e,
				item: i
			})) : t.kind === "moved" && r.push(M(n.activityListMoved, {
				field: e,
				item: i
			}));
		}
		let s = typeof a.total == "number" ? Math.max(a.total, o.length) : o.length, c = Math.min(o.length, G);
		s > c && r.push(M(n.activityListMore, { count: s - c }));
	}
	return r;
}
function q(e, t) {
	let n = Object.hasOwn(t, e) ? t[e] : void 0;
	return typeof n == "string" && n.trim() ? n : e;
}
function re(e, t, n, r) {
	if (!z(t)) return [];
	let i = z(n) ? n : {};
	if (e === "record.stage.transitioned") {
		let e = (e) => typeof e == "string" && e !== "" ? e : "—";
		return [`${e(t.from)} → ${e(t.to)}`];
	}
	if (e !== "record.updated") return [];
	let a = Array.isArray(t.changed) ? t.changed.filter((e) => typeof e == "string") : [];
	return [...a.length > 0 ? [M(r.activityChanged, { fields: a.map((e) => q(e, i)).join(", ") })] : [], ...K(t.list_changes, i, r)];
}
//#endregion
//#region src/kit/ActivityFeed.svelte
var J = /* @__PURE__ */ e({ default: () => Y }), ie = o(" <span class=\"via svelte-yqx6hb\"> </span>", 1), ae = o("<span class=\"sep svelte-yqx6hb\" aria-hidden=\"true\"></span>"), oe = o("<div> </div>"), se = o("<div part=\"changes\" class=\"changes svelte-yqx6hb\"></div>"), ce = o("<li part=\"item\" class=\"af-timeline-item\"><span class=\"af-timeline-dot\" aria-hidden=\"true\"></span> <div class=\"af-timeline-body\"><div class=\"af-timeline-text\"><b part=\"actor\"> </b><!><!><span part=\"label\"> </span></div> <!> <time part=\"time\" class=\"af-timeline-time\"> </time></div></li>"), le = o("<ol class=\"af-timeline\"></ol>"), ue = o("<p class=\"loading svelte-yqx6hb\" role=\"status\"><span class=\"af-spinner\" aria-hidden=\"true\"></span> </p>"), de = o("<div class=\"af-empty\"><p class=\"af-empty-title\"> </p></div>"), fe = o("<span class=\"af-spinner\" aria-hidden=\"true\"></span>"), pe = o("<div class=\"foot svelte-yqx6hb\"><button type=\"button\" part=\"more\" class=\"af-button ghost sm more svelte-yqx6hb\"><!> </button></div>"), me = o("<!> <div class=\"af-kit\"><!> <!></div>", 1), he = {
	hash: "svelte-yqx6hb",
	code: ":host {display:block;}.changes.svelte-yqx6hb {margin-top:2px;color:var(--k-muted);font-size:11px;line-height:1.5;overflow-wrap:anywhere;}.via.svelte-yqx6hb {display:inline-block;padding:1px 6px;border-radius:calc(infinity * 1px);vertical-align:middle;background-color:color-mix(in oklab, var(--k-fg) 8%, var(--k-surface));color:var(--k-muted);font-size:10.5px;font-weight:500;line-height:1.5;}.sep.svelte-yqx6hb {opacity:0.6;}.loading.svelte-yqx6hb {display:flex;align-items:center;gap:8px;margin:0;padding:16px 0;color:var(--k-muted);font-size:12.5px;}.foot.svelte-yqx6hb {display:flex;justify-content:center;margin-top:12px;}button.af-button.sm.more.svelte-yqx6hb {font-size:12px;line-height:16px;}"
};
function Y(e, o) {
	y(o, !0), r(e, he);
	let g = f(o, "events", 7, null), x = f(o, "fields", 7, null), M = f(o, "hasMore", 7, !1), P = f(o, "loading", 7, !1), R = f(o, "locale", 7, null), z = f(o, "strings", 7, null), B = o.$$host, V = O(() => j(R(), z() ?? void 0)), U = O(() => Array.isArray(g()) ? g() : []), W = O(() => L(R())), G = O(() => (S(U), Date.now())), K = k(null), q = k(null), J = null;
	h(() => {
		let e = S(U).length, t = !!P();
		M();
		let n = !!S(K)?.isConnected;
		m(() => {
			if (!J || t) return;
			let r = J;
			e <= r.count && n || (J = null, !n && r.focused && T().then(() => {
				let e = I();
				if (e && e !== document.body) return;
				let t = S(q)?.children[r.count] ?? S(q)?.lastElementChild;
				t instanceof HTMLElement && (t.setAttribute("tabindex", "-1"), t.focus());
			}));
		});
	});
	function Y() {
		P() || (J = {
			count: S(U).length,
			focused: !!S(K) && B.shadowRoot?.activeElement === S(K)
		}, F(B, "af-activity-more", {}));
	}
	var ge = {
		get events() {
			return g();
		},
		set events(e = null) {
			g(e), t();
		},
		get fields() {
			return x();
		},
		set fields(e = null) {
			x(e), t();
		},
		get hasMore() {
			return M();
		},
		set hasMore(e = !1) {
			M(e), t();
		},
		get loading() {
			return P();
		},
		set loading(e = !1) {
			P(e), t();
		},
		get locale() {
			return R();
		},
		set locale(e = null) {
			R(e), t();
		},
		get strings() {
			return z();
		},
		set strings(e = null) {
			z(e), t();
		}
	}, X = me(), Z = b(X);
	N(Z, {});
	var Q = _(Z, 2), $ = C(Q), _e = (e) => {
		var t = le();
		c(t, 21, () => S(U), (e) => e.id, (e, t) => {
			let r = O(() => ee(S(t).event_type)), i = O(() => re(S(t).event_type, S(t).payload, x(), S(V))), o = O(() => H(S(t).actor?.kind));
			var f = ce(), p = _(C(f), 2), m = C(p), h = C(m), g = v(h, !0), y = _(h), w = (e) => {
				var t = ie(), n = b(t, !0);
				n.nodeValue = " ";
				var r = _(n), i = v(r, !0);
				D(() => d(i, S(V).activityViaAssistant)), u(e, t);
			};
			l(y, (e) => {
				S(t).via === "assistant" && e(w);
			});
			var T = _(y), k = (e) => {
				var t = E();
				t.nodeValue = " ", u(e, t);
			}, A = (e) => {
				var t = ae();
				t.textContent = " · ", u(e, t);
			};
			l(T, (e) => {
				S(r) ? e(k) : e(A, -1);
			});
			var j = _(T), M = v(j, !0);
			a(m);
			var N = _(m, 2), P = (e) => {
				var t = se();
				c(t, 21, () => S(i), n, (e, t) => {
					var n = oe(), r = v(n, !0);
					D(() => d(r, S(t))), u(e, n);
				}), a(t), u(e, t);
			};
			l(N, (e) => {
				S(i).length > 0 && e(P);
			});
			var F = _(N, 2), I = v(F, !0);
			a(p), a(f), D((e, n, r, i) => {
				s(f, "data-kind", S(o)), s(f, "data-event-id", S(t).id), s(f, "data-event-type", S(t).event_type), d(g, e), d(M, n), s(F, "datetime", S(t).occurred_at), s(F, "title", r), d(I, i);
			}, [
				() => ne(S(t).actor, S(V)),
				() => te(S(t).event_type, S(V), S(t).payload),
				() => S(W).moment(S(t).occurred_at),
				() => S(W).since(S(t).occurred_at, S(G))
			]), u(e, f);
		}), a(t), p(t, (e) => A(q, e), () => S(q)), D(() => {
			s(t, "aria-label", S(V).activity), s(t, "aria-busy", P() ? "true" : void 0);
		}), u(e, t);
	}, ve = (e) => {
		var t = ue(), n = _(C(t));
		a(t), D(() => d(n, ` ${S(V).loading ?? ""}`)), u(e, t);
	}, ye = (e) => {
		var t = de(), n = C(t), r = v(n, !0);
		a(t), D(() => d(r, S(V).activityEmpty)), u(e, t);
	};
	l($, (e) => {
		S(U).length > 0 ? e(_e) : P() ? e(ve, 1) : M() || e(ye, 2);
	});
	var be = _($, 2), xe = (e) => {
		var t = pe(), n = C(t), r = C(n), i = (e) => {
			var t = fe();
			u(e, t);
		};
		l(r, (e) => {
			P() && e(i);
		});
		var o = _(r, 1, !0);
		a(n), p(n, (e) => A(K, e), () => S(K)), a(t), D(() => {
			s(n, "aria-disabled", P() ? "true" : void 0), d(o, S(V).loadMore);
		}), w("click", n, Y), u(e, t);
	};
	return l(be, (e) => {
		M() && e(xe);
	}), a(Q), u(e, X), i(ge);
}
x(["click"]), g(Y, {
	events: { type: "Array" },
	fields: { type: "Object" },
	hasMore: {
		attribute: "has-more",
		type: "Boolean"
	},
	loading: {
		attribute: "loading",
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
export { J as n, Y as t };
