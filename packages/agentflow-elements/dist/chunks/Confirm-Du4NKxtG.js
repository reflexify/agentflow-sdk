import { t as e } from "./rolldown-runtime-Dy4uBu1J.js";
import { C as t, Ct as n, G as r, I as i, It as a, J as o, Lt as s, M as c, N as l, Nt as u, Ot as d, Pt as f, Q as p, R as m, T as ee, W as h, X as g, Y as _, Z as v, _ as y, b, dt as x, et as S, g as C, gt as w, ht as T, kt as E, mt as D, nt as O, ot as k, pt as A, rt as te, tt as ne, ut as j, v as M, wt as N, xt as re, y as P, yt as F } from "./version-KzierYvT.js";
import { i as ie, o as ae } from "./text-DY1VEJ9L.js";
import { i as I, o as oe } from "./environment-1PeQDNCe.js";
import { Ct as L, a as R, at as se, c as z, d as B, dt as V, et as ce, h as le, i as ue, l as H, n as de, r as fe, s as pe, tt as me, u as U, vt as he } from "./use-locale-context-C2kEPdyN.js";
import { u as ge } from "./set-DGbwAd8v.js";
import { a as _e, c as ve, d as ye, h as be, l as xe, n as Se, o as Ce, r as we, s as Te, t as Ee, u as De } from "./dist-BtXib5dr.js";
import { isClaimed as Oe } from "../escape.js";
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/use-dialog-context.js
var [ke, W] = pe({ name: "DialogContext" }), Ae = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function G(e, t) {
	E(t, !0);
	let i = y(t, "ref", 15, null), a = M(t, Ae), o = W(), s = Te(), c = N(() => U(o().getContentProps(), s().getPresenceProps(), a));
	function l(e) {
		s().setNode(e);
	}
	var u = {
		get ref() {
			return i();
		},
		set ref(e = null) {
			i(e), n();
		}
	}, f = v(), p = D(f), m = (e) => {
		z(e, P({ as: "div" }, () => k(c), {
			[r()]: l,
			get ref() {
				return i();
			},
			set ref(e) {
				i(e);
			}
		}));
	}, ee = N(() => !s().unmounted);
	return h(p, (e) => {
		k(ee) && e(m);
	}), g(e, f), d(u);
}
C(G, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-description.svelte
var je = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Me(e, t) {
	E(t, !0);
	let r = y(t, "ref", 15, null), i = M(t, je), a = W(), o = N(() => U(a().getDescriptionProps(), i));
	return z(e, P({ as: "p" }, () => k(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), d({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		}
	});
}
C(Me, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-positioner.svelte
var Ne = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function K(e, t) {
	E(t, !0);
	let r = y(t, "ref", 15, null), i = M(t, Ne), a = W(), o = Te(), s = N(() => U(a().getPositionerProps(), i));
	var c = {
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		}
	}, l = v(), u = D(l), f = (e) => {
		z(e, P({ as: "div" }, () => k(s), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}, p = N(() => !o().unmounted);
	return h(u, (e) => {
		k(p) && e(f);
	}), g(e, l), d(c);
}
C(K, { ref: {} }, [], [], { mode: "open" });
var q = R("dialog").parts("trigger", "backdrop", "positioner", "content", "title", "description", "closeTrigger").build(), Pe = (e) => e.ids?.positioner ?? `dialog:${e.id}:positioner`, Fe = (e) => e.ids?.backdrop ?? `dialog:${e.id}:backdrop`, J = (e) => e.ids?.content ?? `dialog:${e.id}:content`, Y = (e, t) => {
	let n = e.ids?.trigger;
	return n == null ? t ? `dialog:${e.id}:trigger:${t}` : `dialog:${e.id}:trigger` : L(n) ? n(t) : n;
}, X = (e) => e.ids?.title ?? `dialog:${e.id}:title`, Z = (e) => e.ids?.description ?? `dialog:${e.id}:description`, Ie = (e) => e.ids?.closeTrigger ?? `dialog:${e.id}:close`, Q = (e) => e.getById(J(e)), Le = (e) => e.getById(Pe(e)), Re = (e) => e.getById(Fe(e)), ze = (e) => e.getById(Y(e)), Be = (e) => e.getById(X(e)), Ve = (e) => e.getById(Z(e)), He = (e) => e.getById(Ie(e)), $ = (e) => ge(e.getRootNode(), `[data-scope="dialog"][data-part="trigger"]${me(e.id)}`), Ue = (e, t) => t == null ? ze(e) ?? $(e)[0] : e.getById(Y(e, t));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.connect.mjs
function We(e, t) {
	let { state: n, send: r, context: i, prop: a, scope: o } = e, s = a("aria-label"), c = n.matches("open"), l = i.get("triggerValue");
	return {
		open: c,
		setOpen(e) {
			n.matches("open") !== e && r({ type: e ? "OPEN" : "CLOSE" });
		},
		triggerValue: l,
		setTriggerValue(e) {
			r({
				type: "TRIGGER_VALUE.SET",
				value: e
			});
		},
		getTriggerProps(e = {}) {
			let { value: n } = e, i = n != null && l === n;
			return t.button({
				...q.trigger.attrs,
				dir: a("dir"),
				id: Y(o, n),
				"data-ownedby": o.id,
				"data-value": n,
				"aria-haspopup": "dialog",
				type: "button",
				"aria-expanded": n == null ? c : c && i,
				"data-state": c ? "open" : "closed",
				"aria-controls": J(o),
				"data-current": ce(i),
				onClick(e) {
					e.defaultPrevented || r({
						type: c && n != null && !i ? "TRIGGER_VALUE.SET" : "TOGGLE",
						value: n
					});
				}
			});
		},
		getBackdropProps() {
			return t.element({
				...q.backdrop.attrs,
				dir: a("dir"),
				hidden: !c,
				id: Fe(o),
				"data-state": c ? "open" : "closed"
			});
		},
		getPositionerProps() {
			return t.element({
				...q.positioner.attrs,
				dir: a("dir"),
				id: Pe(o),
				style: V({ pointerEvents: !c || !a("modal") ? "none" : void 0 })
			});
		},
		getContentProps() {
			let e = i.get("rendered");
			return t.element({
				...q.content.attrs,
				dir: a("dir"),
				role: a("role"),
				hidden: !c,
				id: J(o),
				tabIndex: -1,
				"data-state": c ? "open" : "closed",
				"aria-modal": a("modal"),
				"aria-label": s || void 0,
				"aria-labelledby": s || !e.title ? void 0 : X(o),
				"aria-describedby": e.description ? Z(o) : void 0,
				style: V({ pointerEvents: a("modal") ? void 0 : "auto" })
			});
		},
		getTitleProps() {
			return t.element({
				...q.title.attrs,
				dir: a("dir"),
				id: X(o)
			});
		},
		getDescriptionProps() {
			return t.element({
				...q.description.attrs,
				dir: a("dir"),
				id: Z(o)
			});
		},
		getCloseTriggerProps() {
			return t.button({
				...q.closeTrigger.attrs,
				dir: a("dir"),
				id: Ie(o),
				type: "button",
				onClick(e) {
					e.defaultPrevented || (e.stopPropagation(), r({ type: "CLOSE" }));
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dialog@1.43.3/node_modules/@zag-js/dialog/dist/dialog.machine.mjs
var Ge = se({
	props({ props: e, scope: t }) {
		let n = e.role === "alertdialog", r = n ? () => He(t) : void 0, i = typeof e.modal != "boolean" || e.modal;
		return {
			role: "dialog",
			modal: i,
			trapFocus: i,
			preventScroll: i,
			closeOnInteractOutside: i && !n,
			closeOnEscape: !0,
			restoreFocus: !0,
			initialFocusEl: r,
			...e
		};
	},
	initialState({ prop: e }) {
		return e("open") || e("defaultOpen") ? "open" : "closed";
	},
	context({ bindable: e, prop: t, scope: n }) {
		return {
			rendered: e(() => ({ defaultValue: {
				title: !0,
				description: !0
			} })),
			triggerValue: e(() => ({
				defaultValue: t("defaultTriggerValue") ?? null,
				value: t("triggerValue"),
				onChange(e) {
					let r = t("onTriggerValueChange");
					r && r({
						value: e,
						triggerElement: Ue(n, e)
					});
				}
			}))
		};
	},
	watch({ track: e, action: t, prop: n }) {
		e([() => n("open")], () => {
			t(["toggleVisibility"]);
		});
	},
	states: {
		open: {
			entry: ["checkRenderedElements", "setInitialFocus"],
			effects: [
				"trackDismissableElement",
				"trapFocus",
				"preventScroll",
				"hideContentBelow"
			],
			on: {
				"CONTROLLED.CLOSE": { target: "closed" },
				CLOSE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				TOGGLE: [{
					guard: "isOpenControlled",
					actions: ["invokeOnClose"]
				}, {
					target: "closed",
					actions: ["invokeOnClose"]
				}],
				"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] }
			}
		},
		closed: { on: {
			"CONTROLLED.OPEN": { target: "open" },
			OPEN: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}],
			TOGGLE: [{
				guard: "isOpenControlled",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}, {
				target: "open",
				actions: ["invokeOnOpen", "setTriggerValue"]
			}],
			"TRIGGER_VALUE.SET": { actions: ["setTriggerValue"] }
		} }
	},
	implementations: {
		guards: { isOpenControlled: ({ prop: e }) => e("open") != null },
		effects: {
			trackDismissableElement({ scope: e, send: t, prop: n }) {
				return _e(() => Q(e), {
					type: "dialog",
					defer: !0,
					pointerBlocking: n("modal"),
					layerStyleTargets: [() => Re(e), () => Le(e)],
					exclude: [ze(e), ...$(e)].filter(Boolean),
					onInteractOutside(e) {
						n("onInteractOutside")?.(e), n("closeOnInteractOutside") || e.preventDefault();
					},
					persistentElements: n("persistentElements"),
					onFocusOutside: n("onFocusOutside"),
					onPointerDownOutside: n("onPointerDownOutside"),
					onRequestDismiss: n("onRequestDismiss"),
					onEscapeKeyDown(e) {
						n("onEscapeKeyDown")?.(e), n("closeOnEscape") || e.preventDefault();
					},
					onDismiss() {
						t({
							type: "CLOSE",
							src: "interact-outside"
						});
					}
				});
			},
			preventScroll({ scope: e, prop: t }) {
				if (t("preventScroll")) return Ee(e.getDoc());
			},
			trapFocus({ scope: e, prop: t, context: n }) {
				return t("trapFocus") ? Se(() => Q(e), {
					preventScroll: !0,
					returnFocusOnDeactivate: !!t("restoreFocus"),
					initialFocus: () => be({
						root: Q(e),
						getInitialEl: t("initialFocusEl")
					}),
					setReturnFocus: (r) => {
						let i = t("finalFocusEl")?.();
						if (i) return i;
						let a = n.get("triggerValue");
						if (a) {
							let t = Ue(e, a);
							if (t) return t;
						}
						return $(e)[0] || r;
					},
					getShadowRoot: !0
				}) : void 0;
			},
			hideContentBelow({ scope: e, prop: t }) {
				return t("modal") ? we(() => [Q(e)], { defer: !0 }) : void 0;
			}
		},
		actions: {
			setInitialFocus({ prop: e, scope: t }) {
				e("trapFocus") || le(() => {
					be({
						root: Q(t),
						getInitialEl: e("initialFocusEl")
					})?.focus({ preventScroll: !0 });
				});
			},
			checkRenderedElements({ context: e, scope: t }) {
				le(() => {
					e.set("rendered", {
						title: !!Be(t),
						description: !!Ve(t)
					});
				});
			},
			invokeOnClose({ prop: e }) {
				e("onOpenChange")?.({ open: !1 });
			},
			invokeOnOpen({ prop: e }) {
				e("onOpenChange")?.({ open: !0 });
			},
			setTriggerValue({ context: e, event: t }) {
				t.value !== void 0 && e.set("triggerValue", t.value);
			},
			toggleVisibility({ prop: e, send: t, event: n }) {
				t({
					type: e("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE",
					previousEvent: n
				});
			}
		}
	}
}), Ke = (e) => {
	let t = ue(), n = de(), r = N(() => {
		let r = he(e) || {};
		return {
			getRootNode: t().getRootNode,
			dir: n().dir,
			...r
		};
	}), i = H(Ge, () => k(r)), a = N(() => We(i, B));
	return () => k(a);
}, qe = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"open",
	"children"
]);
function Je(e, t) {
	let r = S();
	E(t, !0);
	let i = y(t, "open", 15), c = y(t, "children", 7), l = M(t, qe), u = N(() => ve(l)), f = N(() => s(k(u), 2)), p = N(() => k(f)[0]), m = N(() => k(f)[1]), ee = N(() => ye(k(p))), h = N(() => s(k(ee), 1)), _ = N(() => k(h)[0]), b = N(() => ({
		...k(m),
		id: k(m).id ?? r,
		open: i(),
		onOpenChange(e) {
			k(m).onOpenChange?.(e), i() !== void 0 && i(e.open);
		}
	})), x = Ke(() => k(b)), C = N(() => ({
		...k(p),
		present: x().open
	})), w = xe(() => k(C));
	ke(x), De(() => k(_)), Ce(w);
	var T = {
		get open() {
			return i();
		},
		set open(e) {
			i(e), n();
		},
		get children() {
			return c();
		},
		set children(e) {
			c(e), n();
		}
	}, O = v(), A = D(O);
	return o(A, () => c() ?? a), g(e, O), d(T);
}
C(Je, {
	open: {},
	children: {}
}, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/dialog/dialog-title.svelte
var Ye = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Xe(e, t) {
	E(t, !0);
	let r = y(t, "ref", 15, null), i = M(t, Ye), a = W(), o = N(() => U(a().getTitleProps(), i));
	return z(e, P({ as: "h2" }, () => k(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), d({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		}
	});
}
C(Xe, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region src/kit/Confirm.svelte
var Ze = /* @__PURE__ */ e({ default: () => at }), Qe = p("<p part=\"message\" class=\"svelte-1fchw0y\"> </p>"), $e = p("<p part=\"impact\" class=\"svelte-1fchw0y\"> </p>"), et = p("<div><!> <!></div>"), tt = p("<!> <!> <footer part=\"actions\" class=\"svelte-1fchw0y\"><button type=\"button\" part=\"cancel\" class=\"af-button\"> </button> <button type=\"button\" part=\"confirm\"> </button></footer>", 1), nt = p("<dialog><!></dialog>"), rt = p("<!> <!>", 1), it = {
	hash: "svelte-1fchw0y",
	code: ":host {display:contents;}dialog.svelte-1fchw0y {border:0;padding:0;background:transparent;max-width:calc(100vw - 32px);overflow:visible;}dialog.svelte-1fchw0y::backdrop {background:rgb(0 0 0 / 0.5);}p.svelte-1fchw0y {margin:0;}footer.svelte-1fchw0y {display:flex;justify-content:flex-end;gap:8px;}[data-scope='dialog'][data-part='content'] {box-sizing:border-box;display:grid;gap:16px;width:calc(100vw - 32px);padding:24px;border-radius:var(--k-radius);background-color:var(--k-bg);color:var(--k-fg);box-shadow:0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);}[data-scope='dialog'][data-part='title'] {margin:0;font-size:18px;font-weight:600;line-height:28px;}.description.svelte-1fchw0y {display:grid;gap:8px;margin-top:-10px;font-size:14px;line-height:20px;}[part='message'].svelte-1fchw0y {color:var(--k-muted);}[part='impact'].svelte-1fchw0y {color:var(--k-fg);font-weight:500;}\n  @media (min-width: 40rem) {[data-scope='dialog'][data-part='content'] {max-width:512px;} }\n  @media not (min-width: 40rem) {footer.svelte-1fchw0y {flex-direction:column-reverse;} }"
};
function at(e, r) {
	E(r, !0), i(e, it);
	let o = y(r, "open", 7, !1), s = y(r, "heading", 7, ""), p = y(r, "message", 7, ""), S = y(r, "confirmLabel", 7, null), C = y(r, "danger", 7, !1), O = y(r, "impact", 7, null), M = y(r, "busy", 7, !1), P = y(r, "locale", 7, null), L = y(r, "strings", 7, null), R = r.$$host, se = N(() => ie(P(), L() ?? void 0)), z = re(null), B = re(!1), V = !1, ce = oe(R);
	x(() => ce(k(z), !!o())), x(() => {
		o() && F(B, !1);
	}), x(() => {
		let e = !!M();
		V && !e && F(B, !1), V = e;
	});
	function le() {
		k(B) || M() || (F(B, !0), I(R, "confirm", {}));
	}
	var ue = {
		get open() {
			return o();
		},
		set open(e = !1) {
			o(e), n();
		},
		get heading() {
			return s();
		},
		set heading(e = "") {
			s(e), n();
		},
		get message() {
			return p();
		},
		set message(e = "") {
			p(e), n();
		},
		get confirmLabel() {
			return S();
		},
		set confirmLabel(e = null) {
			S(e), n();
		},
		get danger() {
			return C();
		},
		set danger(e = !1) {
			C(e), n();
		},
		get impact() {
			return O();
		},
		set impact(e = null) {
			O(e), n();
		},
		get busy() {
			return M();
		},
		set busy(e = !1) {
			M(e), n();
		},
		get locale() {
			return P();
		},
		set locale(e = null) {
			P(e), n();
		},
		get strings() {
			return L();
		},
		set strings(e = null) {
			L(e), n();
		}
	}, H = rt(), de = D(H);
	ae(de, {});
	var pe = w(de, 2);
	return fe(pe, {
		value: () => R.shadowRoot,
		children: (e, n) => {
			var r = v(), i = D(r), d = () => !!o();
			m(i, () => Je, (e, n) => {
				n(e, {
					get open() {
						return d();
					},
					set open(e) {},
					modal: !1,
					preventScroll: !0,
					closeOnInteractOutside: !1,
					role: "alertdialog",
					onEscapeKeyDown: (e) => {
						Oe(e) && e.defaultPrevented && I(R, "cancel", { reason: "escape" });
					},
					onOpenChange: (e) => {
						e.open || I(R, "cancel", { reason: "escape" });
					},
					children: (e, n) => {
						var r = v(), i = D(r);
						{
							let e = (e, n = a) => {
								var r = nt(), i = (e) => e.preventDefault();
								t(r, (e) => ({
									...e,
									class: "af-kit",
									oncancel: i
								}), [() => n()()], void 0, void 0, "svelte-1fchw0y");
								var o = A(r);
								m(o, () => G, (e, n) => {
									n(e, {
										part: "content",
										class: "af-overlay dialog",
										"aria-modal": "true",
										children: (e, n) => {
											var r = tt(), i = D(r);
											m(i, () => Xe, (e, t) => {
												t(e, {
													part: "heading",
													children: (e, t) => {
														u();
														var n = ne();
														j(() => _(n, s() ?? "")), g(e, n);
													},
													$$slots: { default: !0 }
												});
											});
											var o = w(i, 2), d = (e) => {
												var n = v(), r = D(n);
												{
													let e = (e, n = a) => {
														var r = et();
														t(r, (e) => ({
															...e,
															class: "description"
														}), [() => n()()], void 0, void 0, "svelte-1fchw0y");
														var i = A(r), o = (e) => {
															var t = Qe(), n = T(t, !0);
															j(() => _(n, p())), g(e, t);
														};
														h(i, (e) => {
															p() && e(o);
														});
														var s = w(i, 2), c = (e) => {
															var t = $e(), n = T(t, !0);
															j(() => _(n, O())), g(e, t);
														};
														h(s, (e) => {
															O() && e(c);
														}), f(r), g(e, r);
													};
													m(r, () => Me, (t, n) => {
														n(t, {
															asChild: e,
															$$slots: { asChild: !0 }
														});
													});
												}
												g(e, n);
											};
											h(o, (e) => {
												(p() || O()) && e(d);
											});
											var y = w(o, 2), b = A(y), x = T(b, !0), E = w(b, 2), N = T(E, !0);
											f(y), j(() => {
												_(x, k(se).cancel), c(E, 1, l(C() ? "af-button danger" : "af-button primary")), ee(E, "aria-disabled", k(B) || M() ? "true" : void 0), _(N, S() || k(se).confirm);
											}), te("click", b, () => I(R, "cancel", { reason: "close-button" })), te("click", E, le), g(e, r);
										},
										$$slots: { default: !0 }
									});
								}), f(r), b(r, (e) => F(z, e), () => k(z)), g(e, r);
							};
							m(i, () => K, (t, n) => {
								n(t, {
									asChild: e,
									$$slots: { asChild: !0 }
								});
							});
						}
						g(e, r);
					},
					$$slots: { default: !0 }
				});
			}), g(e, r);
		},
		$$slots: { default: !0 }
	}), g(e, H), d(ue);
}
O(["click"]), C(at, {
	open: { type: "Boolean" },
	heading: {
		attribute: "heading",
		type: "String"
	},
	message: {
		attribute: "message",
		type: "String"
	},
	confirmLabel: {
		attribute: "confirm-label",
		type: "String"
	},
	danger: {
		attribute: "danger",
		type: "Boolean"
	},
	impact: {
		attribute: "impact",
		type: "String"
	},
	busy: { type: "Boolean" },
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" }
}, [], [], { mode: "open" });
//#endregion
export { K as a, Je as i, Ze as n, G as o, Xe as r, at as t };
