import { Lt as e, dt as t, ot as n, wt as r, xt as i, yt as a } from "./version-Cw97ZDNW.js";
import { B as o, C as s, F as c, G as l, H as u, I as d, J as f, K as p, L as m, M as h, R as g, V as _, W as v, X as ee, Y as y, at as b, b as x, d as S, g as C, h as w, l as T, o as E, p as D, pt as te, q as O, s as ne, ut as re, vt as ie, z as ae } from "./use-locale-context-9YfTvPVv.js";
import { d as k, n as A, r as oe } from "./set-D-tgyRvb.js";
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/controller.mjs
var j = /* @__PURE__ */ new Set([
	"menu",
	"listbox",
	"dialog",
	"grid",
	"tree",
	"region",
	"application"
]), se = (e) => j.has(e), ce = (e) => e.getAttribute("aria-controls")?.split(" ") || [];
function le(e, t) {
	let n = /* @__PURE__ */ new Set(), r = o(e), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = ce(e);
			for (let e of a) {
				if (!e || n.has(e)) continue;
				n.add(e);
				let a = r.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					if (e && se(e) && !n && (a === t || a.contains(t) || i(a))) return !0;
				}
			}
		}
		return !1;
	};
	return i(e);
}
function ue(e, t) {
	let n = o(e), r = /* @__PURE__ */ new Set(), i = (e) => {
		let a = e.querySelectorAll("[aria-controls]");
		for (let e of a) {
			if (e.getAttribute("aria-expanded") !== "true") continue;
			let a = ce(e);
			for (let e of a) {
				if (!e || r.has(e)) continue;
				r.add(e);
				let a = n.getElementById(e);
				if (a) {
					let e = a.getAttribute("role"), n = a.getAttribute("aria-modal") === "true";
					e && j.has(e) && !n && (t(a), i(a));
				}
			}
		}
	};
	i(e);
}
function de(e) {
	let t = /* @__PURE__ */ new Set();
	return ue(e, (n) => {
		e.contains(n) || t.add(n);
	}), Array.from(t);
}
function fe(e) {
	let t = e.getAttribute("role");
	return !!(t && j.has(t));
}
function pe(e) {
	return e.hasAttribute("aria-controls") && e.getAttribute("aria-expanded") === "true";
}
function me(e) {
	return pe(e) ? !0 : !!e.querySelector?.("[aria-controls][aria-expanded=\"true\"]");
}
function he(e) {
	if (!e.id) return !1;
	let t = o(e), n = CSS.escape(e.id), r = `[aria-controls~="${n}"][aria-expanded="true"], [aria-controls="${n}"][aria-expanded="true"]`;
	return !!(t.querySelector(r) && fe(e));
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/tabbable.mjs
var ge = (e) => O(e) && e.tagName === "IFRAME", _e = /^(audio|video|details)$/;
function ve(e) {
	let t = e.getAttribute("tabindex");
	return t ? parseInt(t, 10) : NaN;
}
var ye = (e) => !Number.isNaN(ve(e)), be = (e) => ve(e) < 0;
function xe(e) {
	return f(e) && e.type === "radio";
}
function Se(e) {
	if (!xe(e) || !e.name || e.checked) return !0;
	let t = `input[type="radio"][name="${CSS.escape(e.name)}"]`, n = e.form ?? e.ownerDocument, r = Array.from(n.querySelectorAll(t)).filter((t) => t.form === e.form && P(t)), i = r.find((e) => e.checked);
	return i ? i === e : r[0] === e;
}
function Ce(e, t) {
	if (!t) return null;
	if (t === !0) return e.shadowRoot || null;
	let n = t(e);
	return (n === !0 ? e.shadowRoot : n) || null;
}
function we(e, t, n) {
	let r = [...e], i = [...e], a = /* @__PURE__ */ new Set(), o = /* @__PURE__ */ new Map();
	e.forEach((e, t) => o.set(e, t));
	let s = 0;
	for (; s < i.length;) {
		let e = i[s++];
		if (!e || a.has(e)) continue;
		a.add(e);
		let c = Ce(e, t);
		if (c) {
			let t = Array.from(c.querySelectorAll(M)).filter(n), a = o.get(e);
			if (a !== void 0) {
				let e = a + 1;
				r.splice(e, 0, ...t), t.forEach((t, n) => {
					o.set(t, e + n);
				});
				for (let n = e + t.length; n < r.length; n++) o.set(r[n], n);
			} else {
				let e = r.length;
				r.push(...t), t.forEach((t, n) => {
					o.set(t, e + n);
				});
			}
			i.push(...t);
		}
	}
	return r;
}
var M = "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], iframe, object, embed, area[href], audio[controls], video[controls], [contenteditable]:not([contenteditable='false']), details > summary:first-of-type", N = (e, t = {}) => {
	if (!e) return [];
	let { includeContainer: n = !1, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(M));
	(n == 1 || n == "if-empty" && i.length === 0) && O(e) && P(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (P(e)) {
		if (ge(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...N(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	return r ? we(a, r, P) : a;
};
function P(e) {
	return !O(e) || e.closest("[inert]") ? !1 : e.matches(M) && p(e);
}
function F(e, t = {}) {
	if (!e) return [];
	let { includeContainer: n, getShadowRoot: r } = t, i = Array.from(e.querySelectorAll(M));
	n && I(e) && i.unshift(e);
	let a = [];
	for (let e of i) if (I(e)) {
		if (ge(e) && e.contentDocument) {
			let t = e.contentDocument.body;
			a.push(...F(t, { getShadowRoot: r }));
			continue;
		}
		a.push(e);
	}
	if (r) {
		let e = we(a, r, I);
		return !e.length && n ? i : e;
	}
	return !a.length && n ? i : a;
}
function I(e) {
	return O(e) && e.tabIndex > 0 ? !0 : !P(e) || be(e) ? !1 : Se(e);
}
function Te(e, t = {}) {
	let n = F(e, t);
	return [n[0] || null, n[n.length - 1] || null];
}
function L(e) {
	return e.tabIndex < 0 && (_e.test(e.localName) || l(e)) && !ye(e) ? 0 : e.tabIndex;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/initial-focus.mjs
function Ee(e) {
	let { root: t, getInitialEl: n, filter: r, enabled: i = !0 } = e;
	if (!i) return;
	let a = typeof n == "function" ? n() : n;
	return a ||= t?.querySelector("[data-autofocus],[autofocus]"), a ||= F(t).filter((e) => !r || r(e)).find((e) => !e.hasAttribute("data-no-autofocus")), a || t || void 0;
}
function De(e) {
	let t = e.currentTarget;
	if (!t) return !1;
	let [n, r] = Te(t);
	return !(u(n) && e.shiftKey || u(r) && !e.shiftKey || !n && !r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/overflow.mjs
function R(e) {
	let t = ae(e);
	return y(t) ? g(t).body : O(t) && z(t) ? t : R(t);
}
function Oe(e, t = []) {
	let n = R(e), r = n === e.ownerDocument.body, i = _(n);
	return r ? t.concat(i, i.visualViewport || [], z(n) ? n : []) : t.concat(n, Oe(n, []));
}
var ke = /auto|scroll|overlay|hidden|clip/, Ae = /* @__PURE__ */ new Set(["inline", "contents"]);
function z(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = _(e).getComputedStyle(e);
	return ke.test(t + r + n) && !Ae.has(i);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/wait-for.mjs
function je(e, t, n) {
	let { signal: r } = t;
	return [new Promise((t, i) => {
		let a = setTimeout(() => {
			i(/* @__PURE__ */ Error(`Timeout of ${n}ms exceeded`));
		}, n);
		r.addEventListener("abort", () => {
			clearTimeout(a), i(new DOMException("Promise aborted", "AbortError"));
		}), e.then((e) => {
			r.aborted || (clearTimeout(a), t(e));
		}).catch((e) => {
			r.aborted || (clearTimeout(a), i(e));
		});
	}), () => t.abort()];
}
function Me(e, t) {
	let { timeout: n, rootNode: r } = t, i = _(r), a = g(r), o = new i.AbortController();
	return je(new Promise((t) => {
		let n = e();
		if (n) {
			t(n);
			return;
		}
		let r = new i.MutationObserver(() => {
			let n = e();
			n && n.isConnected && (r.disconnect(), t(n));
		});
		r.observe(a.body, {
			childList: !0,
			subtree: !0
		});
	}), o, n);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/when-node.mjs
function Ne(e, t, n = {}) {
	let { defer: r, onMissing: i } = n, a = () => typeof e == "function" ? e() : e, o = [], s = (e) => {
		if (!e) return i?.();
		o.push(t(e));
	}, c = a();
	if (!r || c) s(c);
	else {
		let e = !1;
		o.push(() => {
			e = !0;
		}), queueMicrotask(() => {
			if (e) return;
			let t = a();
			if (t) {
				s(t);
				return;
			}
			o.push(w(() => {
				e || s(a());
			}));
		});
	}
	return () => {
		o.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/utils/render-strategy.js
var [Pe, Fe] = ne({
	name: "RenderStrategyContext",
	hookName: "useRenderStrategyContext",
	providerName: "<RenderStrategyPropsProvider />"
}), Ie = E(), Le = (e) => Ie(e, ["lazyMount", "unmountOnExit"]);
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+presence@1.43.3/node_modules/@zag-js/presence/dist/presence.connect.mjs
function Re(e, t) {
	let { state: n, send: r, context: i } = e, a = n.matches("mounted", "unmountSuspended");
	return {
		skip: !i.get("initial"),
		present: a,
		setNode(e) {
			e && r({
				type: "NODE.SET",
				node: e
			});
		},
		unmount() {
			r({ type: "UNMOUNT" });
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+presence@1.43.3/node_modules/@zag-js/presence/dist/presence.machine.mjs
var ze = b({
	props({ props: e }) {
		return {
			...e,
			present: !!e.present
		};
	},
	initialState({ prop: e }) {
		return e("present") ? "mounted" : "unmounted";
	},
	refs() {
		return {
			node: null,
			styles: null
		};
	},
	context({ bindable: e }) {
		return {
			unmountAnimationName: e(() => ({ defaultValue: null })),
			prevAnimationName: e(() => ({ defaultValue: null })),
			present: e(() => ({ defaultValue: !1 })),
			initial: e(() => ({
				sync: !0,
				defaultValue: !1
			}))
		};
	},
	exit: ["cleanupNode"],
	watch({ track: e, prop: t, send: n }) {
		e([() => t("present")], () => {
			n({ type: "PRESENCE.CHANGED" });
		});
	},
	on: {
		"NODE.SET": { actions: ["setupNode"] },
		"PRESENCE.CHANGED": { actions: ["setInitial", "syncPresence"] }
	},
	states: {
		mounted: {
			effects: ["trackEnterAnimation"],
			on: {
				UNMOUNT: {
					target: "unmounted",
					actions: ["clearPrevAnimationName", "invokeOnExitComplete"]
				},
				"UNMOUNT.SUSPEND": { target: "unmountSuspended" }
			}
		},
		unmountSuspended: {
			effects: ["trackExitAnimation"],
			on: {
				MOUNT: {
					target: "mounted",
					actions: ["setPrevAnimationName"]
				},
				UNMOUNT: {
					target: "unmounted",
					actions: ["clearPrevAnimationName", "invokeOnExitComplete"]
				}
			}
		},
		unmounted: { on: { MOUNT: {
			target: "mounted",
			actions: ["setPrevAnimationName"]
		} } }
	},
	implementations: {
		actions: {
			setInitial: ({ context: e }) => {
				e.get("initial") || queueMicrotask(() => {
					e.set("initial", !0);
				});
			},
			invokeOnExitComplete: ({ prop: e, refs: t }) => {
				e("onExitComplete")?.();
				let n = t.get("node");
				if (!n) return;
				let r = new (_(n)).CustomEvent("exitcomplete", { bubbles: !1 });
				n.dispatchEvent(r);
			},
			setupNode: ({ refs: e, event: t }) => {
				e.get("node") !== t.node && (e.set("node", t.node), e.set("styles", k(t.node)));
			},
			cleanupNode: ({ refs: e }) => {
				e.set("node", null), e.set("styles", null);
			},
			syncPresence: ({ context: e, refs: t, send: n, prop: r }) => {
				let i = r("present");
				if (i) return n({
					type: "MOUNT",
					src: "presence.changed"
				});
				let a = t.get("node");
				if (!i && a?.ownerDocument.visibilityState === "hidden") return n({
					type: "UNMOUNT",
					src: "visibilitychange"
				});
				w(() => {
					if (r("present")) return;
					let i = B(t.get("styles"));
					e.set("unmountAnimationName", i), i === "none" || i === e.get("prevAnimationName") || t.get("styles")?.display === "none" || t.get("styles")?.animationDuration === "0s" ? n({
						type: "UNMOUNT",
						src: "presence.changed"
					}) : n({ type: "UNMOUNT.SUSPEND" });
				});
			},
			setPrevAnimationName: ({ context: e, refs: t }) => {
				w(() => {
					e.set("prevAnimationName", B(t.get("styles")));
				});
			},
			clearPrevAnimationName: ({ context: e }) => {
				e.set("prevAnimationName", null);
			}
		},
		effects: {
			trackEnterAnimation: ({ context: e, refs: t, prop: n }) => {
				if (!n("onEnterComplete") || !e.get("initial")) return;
				let r, i = () => {
					r = w(() => {
						let e = t.get("node");
						if (!e || !e.isConnected) {
							i();
							return;
						}
						let r = k(e);
						if (B(r) === "none" || r.display === "none" || r.animationDuration === "0s") {
							n("onEnterComplete")?.();
							return;
						}
						let a = (t) => {
							x(t) === e && n("present") && (e.removeEventListener("animationend", a), n("onEnterComplete")?.());
						};
						return e.addEventListener("animationend", a), () => {
							e.removeEventListener("animationend", a);
						};
					});
				};
				return i(), () => r?.();
			},
			trackExitAnimation: ({ context: e, refs: t, send: n, prop: r }) => {
				let i = t.get("node");
				if (!i) return;
				let a = (n) => {
					(n.composedPath?.()?.[0] ?? n.target) === i && e.set("prevAnimationName", B(t.get("styles")));
				}, o = (a) => {
					let o = B(t.get("styles"));
					x(a) === i && o === e.get("unmountAnimationName") && !r("present") && n({
						type: "UNMOUNT",
						src: "animationend"
					});
				}, s = (e) => {
					x(e) === i && !r("present") && n({
						type: "UNMOUNT",
						src: "animationcancel"
					});
				};
				i.addEventListener("animationstart", a), i.addEventListener("animationcancel", s), i.addEventListener("animationend", o);
				let c = A(i, { animationFillMode: "forwards" });
				return () => {
					i.removeEventListener("animationstart", a), i.removeEventListener("animationcancel", s), i.removeEventListener("animationend", o), D(() => c());
				};
			}
		}
	}
});
function B(e) {
	return e?.animationName || "none";
}
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/presence/use-presence.svelte.js
var Be = (o) => {
	let s = r(() => ie(o)), c = r(() => Le(n(s))), l = r(() => e(n(c), 2)), u = r(() => n(l)[0]), d = r(() => n(l)[1]), f = T(ze, () => n(d)), p = r(() => Re(f, S)), m = i(!1);
	t(() => {
		n(p).present && a(m, !0);
	});
	let h = (e) => {
		e && f.send({
			type: "NODE.SET",
			node: e
		});
	}, g = r(() => !n(p).present && !n(m) && n(u).lazyMount || n(u).unmountOnExit && !n(p).present && n(m)), _ = r(() => ({
		getPresenceProps: () => ({
			"data-state": n(p).skip && n(s).skipAnimationOnMount ? void 0 : n(s).present ? "open" : "closed",
			hidden: !n(p).present
		}),
		present: n(p).present,
		setNode: h,
		unmounted: n(g)
	}));
	return () => n(_);
}, Ve = (e) => E()(e, [
	"immediate",
	"lazyMount",
	"onEnterComplete",
	"onExitComplete",
	"present",
	"skipAnimationOnMount",
	"unmountOnExit"
]), [He, Ue] = ne({ name: "PresenceContext" });
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/frame-utils.mjs
function We(e) {
	let t = {
		each(t) {
			for (let n = 0; n < e.frames?.length; n += 1) {
				let r = e.frames[n];
				r && t(r);
			}
		},
		addEventListener(e, n, r) {
			return t.each((t) => {
				try {
					t.document.addEventListener(e, n, r);
				} catch {}
			}), () => {
				try {
					t.removeEventListener(e, n, r);
				} catch {}
			};
		},
		removeEventListener(e, n, r) {
			t.each((t) => {
				try {
					t.document.removeEventListener(e, n, r);
				} catch {}
			});
		}
	};
	return t;
}
function Ge(e) {
	let t = e.frameElement == null ? null : e.parent;
	return {
		addEventListener: (e, n, r) => {
			try {
				t?.addEventListener(e, n, r);
			} catch {}
			return () => {
				try {
					t?.removeEventListener(e, n, r);
				} catch {}
			};
		},
		removeEventListener: (e, n, r) => {
			try {
				t?.removeEventListener(e, n, r);
			} catch {}
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+interact-outside@1.43.3/node_modules/@zag-js/interact-outside/dist/index.mjs
var Ke = "pointerdown.outside", qe = "focus.outside";
function Je(e) {
	for (let t of e) if (O(t) && P(t)) return !0;
	return !1;
}
var Ye = (e) => "clientY" in e;
function Xe(e, t) {
	if (!Ye(t) || !e) return !1;
	let n = e.getBoundingClientRect();
	return n.width === 0 || n.height === 0 ? !1 : n.top <= t.clientY && t.clientY <= n.top + n.height && n.left <= t.clientX && t.clientX <= n.left + n.width;
}
function Ze(e, t) {
	return e.y <= t.y && t.y <= e.y + e.height && e.x <= t.x && t.x <= e.x + e.width;
}
function Qe(e, t) {
	if (!t || !Ye(e)) return !1;
	let n = t.scrollHeight > t.clientHeight, r = n && e.clientX > t.offsetLeft + t.clientWidth, i = t.scrollWidth > t.clientWidth, a = i && e.clientY > t.offsetTop + t.clientHeight;
	return Ze({
		x: t.offsetLeft,
		y: t.offsetTop,
		width: t.clientWidth + (n ? 16 : 0),
		height: t.clientHeight + (i ? 16 : 0)
	}, {
		x: e.clientX,
		y: e.clientY
	}) ? r || a : !1;
}
function $e(e, t) {
	let { exclude: n, onFocusOutside: r, onPointerDownOutside: i, onInteractOutside: a, defer: o, followControlledElements: l = !0 } = t;
	if (!e) return;
	let u = g(e), f = _(e), p = We(f), m = Ge(f);
	function h(t, r) {
		if (!O(r) || !r.isConnected || d(e, r) || Xe(e, t) || l && le(e, r)) return !1;
		let i = u.querySelector(`[aria-controls="${e.id}"]`);
		return i && Qe(t, R(i)) || Qe(t, R(e)) ? !1 : !n?.(r);
	}
	let v = /* @__PURE__ */ new Set(), y = ee(e?.getRootNode()), b = !1;
	function S(t) {
		b = !0;
		let n = () => {
			b = !1;
		};
		u.addEventListener("pointerup", n, { once: !0 }), f.addEventListener("pointerup", n, { once: !0 });
		function r(n) {
			let r = o && !c() ? w : (e) => e(), l = n ?? t, u = l?.composedPath?.() ?? [l?.target];
			r(() => {
				let n = y ? u[0] : x(t);
				if (e && h(t, n)) {
					if (i || a) {
						let t = te(i, a);
						e.addEventListener(Ke, t, { once: !0 });
					}
					tt(e, Ke, {
						bubbles: !1,
						cancelable: !0,
						detail: {
							originalEvent: l,
							contextmenu: s(l),
							focusable: Je(u),
							target: n
						}
					});
				}
			});
		}
		t.pointerType === "touch" ? (v.forEach((e) => e()), v.add(C(u, "click", r, { once: !0 })), v.add(m.addEventListener("click", r, { once: !0 })), v.add(p.addEventListener("click", r, { once: !0 }))) : r();
	}
	let T = /* @__PURE__ */ new Set(), E = setTimeout(() => {
		T.add(C(u, "pointerdown", S, !0)), T.add(m.addEventListener("pointerdown", S, !0)), T.add(p.addEventListener("pointerdown", S, !0));
	}, 0);
	function D(t) {
		b || (o ? w : (e) => e())(() => {
			let n = t?.composedPath?.() ?? [t?.target], i = y ? n[0] : x(t);
			if (e && h(t, i)) {
				if (r || a) {
					let t = te(r, a);
					e.addEventListener(qe, t, { once: !0 });
				}
				tt(e, qe, {
					bubbles: !1,
					cancelable: !0,
					detail: {
						originalEvent: t,
						contextmenu: !1,
						focusable: P(i),
						target: i
					}
				});
			}
		});
	}
	return c() || (T.add(C(u, "focusin", D, !0)), T.add(m.addEventListener("focusin", D, !0)), T.add(p.addEventListener("focusin", D, !0))), () => {
		clearTimeout(E), v.forEach((e) => e()), T.forEach((e) => e());
	};
}
function et(e, t) {
	let { defer: n } = t, r = n ? w : (e) => e(), i = [];
	return i.push(r(() => {
		let n = typeof e == "function" ? e() : e;
		i.push($e(n, t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
function tt(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, n);
	return e.dispatchEvent(r);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/escape-keydown.mjs
function nt(e, t) {
	return C(g(e), "keydown", (e) => {
		e.key === "Escape" && (e.isComposing || t?.(e));
	}, { capture: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/layer-stack.mjs
var rt = "layer:request-dismiss", V = {
	layers: [],
	branches: [],
	recentlyRemoved: /* @__PURE__ */ new Set(),
	count() {
		return this.layers.length;
	},
	pointerBlockingLayers() {
		return this.layers.filter((e) => e.pointerBlocking);
	},
	topMostPointerBlockingLayer() {
		return [...this.pointerBlockingLayers()].slice(-1)[0];
	},
	hasPointerBlockingLayer() {
		return this.pointerBlockingLayers().length > 0;
	},
	isBelowPointerBlockingLayer(e) {
		return this.indexOf(e) < (this.topMostPointerBlockingLayer() ? this.indexOf(this.topMostPointerBlockingLayer()?.node) : -1);
	},
	isTopMost(e) {
		return this.layers[this.count() - 1]?.node === e;
	},
	getNestedLayers(e) {
		return Array.from(this.layers).slice(this.indexOf(e) + 1);
	},
	getLayersByType(e) {
		return this.layers.filter((t) => t.type === e);
	},
	getNestedLayersByType(e, t) {
		let n = this.indexOf(e);
		return n === -1 ? [] : this.layers.slice(n + 1).filter((e) => e.type === t);
	},
	getParentLayerOfType(e, t) {
		let n = this.indexOf(e);
		if (!(n <= 0)) return this.layers.slice(0, n).reverse().find((e) => e.type === t);
	},
	countNestedLayersOfType(e, t) {
		return this.getNestedLayersByType(e, t).length;
	},
	isInNestedLayer(e, t) {
		return !!(this.getNestedLayers(e).some((e) => d(e.node, t)) || this.recentlyRemoved.size > 0);
	},
	isInBranch(e) {
		return Array.from(this.branches).some((t) => d(t, e));
	},
	add(e) {
		let t = this.indexOf(e.node);
		t !== -1 && this.layers.splice(t, 1), this.layers.push(e), this.syncLayers();
	},
	addBranch(e) {
		this.branches.push(e);
	},
	remove(e) {
		let t = this.indexOf(e);
		t < 0 || (this.layers[t].styleTargets?.forEach((e) => {
			let t = e();
			t && at(t);
		}), this.recentlyRemoved.add(e), D(() => this.recentlyRemoved.delete(e)), t < this.count() - 1 && this.getNestedLayers(e).forEach((t) => V.dismiss(t.node, e)), this.layers.splice(t, 1), this.syncLayers());
	},
	removeBranch(e) {
		let t = this.branches.indexOf(e);
		t >= 0 && this.branches.splice(t, 1);
	},
	syncLayers() {
		this.layers.forEach((e, t) => {
			it(e, t, e.node), e.styleTargets?.forEach((n) => {
				let r = n();
				if (!r || r === e.node) return;
				it(e, t, r);
				let { zIndex: i } = k(e.node);
				r.style.setProperty("--z-index", i);
			});
		});
	},
	indexOf(e) {
		return this.layers.findIndex((t) => t.node === e);
	},
	dismiss(e, t) {
		let n = this.indexOf(e);
		if (n === -1) return;
		let r = this.layers[n];
		st(e, rt, (e) => {
			r.requestDismiss?.(e), e.defaultPrevented || r?.dismiss();
		}), ot(e, rt, {
			originalLayer: e,
			targetLayer: t,
			originalIndex: n,
			targetIndex: t ? this.indexOf(t) : -1
		}), this.syncLayers();
	},
	clear() {
		this.remove(this.layers[0].node);
	}
};
function it(e, t, n) {
	n.style.setProperty("--layer-index", `${t}`), n.removeAttribute("data-nested"), n.removeAttribute("data-has-nested"), V.getParentLayerOfType(e.node, e.type) && n.setAttribute("data-nested", e.type);
	let r = V.countNestedLayersOfType(e.node, e.type);
	r > 0 && n.setAttribute("data-has-nested", e.type), n.style.setProperty("--nested-layer-count", `${r}`);
}
function at(e) {
	e.style.removeProperty("--layer-index"), e.style.removeProperty("--nested-layer-count"), e.style.removeProperty("--z-index"), e.removeAttribute("data-nested"), e.removeAttribute("data-has-nested");
}
function ot(e, t, n) {
	let r = new (e.ownerDocument.defaultView || window).CustomEvent(t, {
		cancelable: !0,
		bubbles: !0,
		detail: n
	});
	return e.dispatchEvent(r);
}
function st(e, t, n) {
	e.addEventListener(t, n, { once: !0 });
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/pointer-event-outside.mjs
var H = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap();
function ct(e) {
	return V.isBelowPointerBlockingLayer(e) ? "none" : "auto";
}
function lt(e) {
	let t = ct(e);
	e.style.pointerEvents !== t && (e.style.pointerEvents = t);
}
function ut(e) {
	if (U.has(e)) return;
	let t = _(e);
	if (t.MutationObserver === void 0) return;
	let n = new t.MutationObserver(() => {
		U.has(e) && lt(e);
	});
	n.observe(e, {
		attributes: !0,
		attributeFilter: ["style"]
	}), U.set(e, n);
}
function dt() {
	V.layers.forEach(({ node: e }) => {
		lt(e), ut(e);
	});
}
function ft(e) {
	let t = U.get(e);
	t && (t.disconnect(), U.delete(e)), e.style.pointerEvents = "";
}
function pt(e, t) {
	let n = g(e), r = [];
	return V.hasPointerBlockingLayer() && !n.body.hasAttribute("data-inert") && (H.set(n.body, n.body.style.pointerEvents), queueMicrotask(() => {
		let e = n.body;
		e && (e.style.pointerEvents = "none", e.setAttribute("data-inert", ""));
	})), t?.forEach((e) => {
		let [t, n] = Me(() => {
			let t = e();
			return O(t) ? t : null;
		}, { timeout: 1e3 });
		t.then((e) => r.push(A(e, { pointerEvents: "auto" }))), r.push(n);
	}), () => {
		V.hasPointerBlockingLayer() || (queueMicrotask(() => {
			let e = n.body;
			if (!e) return;
			let t = H.get(e);
			t !== void 0 && (e.style.pointerEvents = t, H.delete(e)), e.removeAttribute("data-inert"), e.style.length === 0 && e.removeAttribute("style");
		}), r.forEach((e) => e()));
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dismissable@1.43.3/node_modules/@zag-js/dismissable/dist/dismissable-layer.mjs
function mt(e, t) {
	let { onDismiss: n, onRequestDismiss: r, pointerBlocking: i, exclude: a, debug: o, type: s = "dialog", layerStyleTargets: c } = t, l = {
		dismiss: n,
		node: e,
		type: s,
		pointerBlocking: i,
		requestDismiss: r,
		styleTargets: c
	};
	V.add(l), dt();
	function u(r) {
		let i = x(r.detail.originalEvent);
		V.isBelowPointerBlockingLayer(e) || V.isInBranch(i) || (t.onPointerDownOutside?.(r), t.onInteractOutside?.(r), !r.defaultPrevented && (o && console.log("onPointerDownOutside:", r.detail.originalEvent), n?.()));
	}
	function f(e) {
		let r = x(e.detail.originalEvent);
		V.isInBranch(r) || (t.onFocusOutside?.(e), t.onInteractOutside?.(e), !e.defaultPrevented && (o && console.log("onFocusOutside:", e.detail.originalEvent), n?.()));
	}
	function p(r) {
		V.isTopMost(e) && (t.onEscapeKeyDown?.(r), !r.defaultPrevented && n && (r.preventDefault(), n()));
	}
	function m(n) {
		let r = typeof a == "function" ? a() : a, i = Array.isArray(r) ? r : [r], o = t.persistentElements?.map((e) => e()).filter(O);
		return o && i.push(...o), i.some((e) => d(e, n)) || V.isInNestedLayer(e, n);
	}
	let h = [
		i ? pt(e, t.persistentElements) : void 0,
		nt(e, p),
		et(e, {
			exclude: m,
			onFocusOutside: f,
			onPointerDownOutside: u,
			defer: t.defer
		})
	];
	return () => {
		V.remove(e), dt(), ft(e), h.forEach((e) => e?.());
	};
}
function ht(e, t) {
	let { warnOnMissingNode: n = !0 } = t;
	return Ne(e, (e) => mt(e, t), {
		defer: t.defer,
		onMissing: n ? () => re("[@zag-js/dismissable] node is `null` or `undefined`") : void 0
	});
}
function gt(e, t = {}) {
	return Ne(e, (e) => (V.addBranch(e), () => {
		V.removeBranch(e);
	}), {
		defer: t.defer,
		onMissing: () => re("[@zag-js/dismissable] branch node is `null` or `undefined`")
	});
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+aria-hidden@1.43.3/node_modules/@zag-js/aria-hidden/dist/walk-tree-outside.mjs
var W = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new WeakMap(), K = {}, q = 0, _t = (e) => e && (e.host || _t(e.parentNode)), vt = (e, t) => t.map((t) => {
	if (e.contains(t)) return t;
	let n = _t(t);
	return n && e.contains(n) ? n : (console.error("[zag-js > ariaHidden] target", t, "in not contained inside", e, ". Doing nothing"), null);
}).filter((e) => !!e), yt = /* @__PURE__ */ new Set([
	"script",
	"output",
	"status",
	"next-route-announcer"
]), bt = (e) => yt.has(e.localName) || e.role === "status" || e.hasAttribute("aria-live") ? !0 : e.matches("[data-live-announcer]"), xt = (e, t) => {
	let { parentNode: n, markerName: r, controlAttribute: i, explicitBooleanValue: a, followControlledElements: o = !0 } = t, s = vt(n, Array.isArray(e) ? e : [e]);
	K[r] || (K[r] = /* @__PURE__ */ new WeakMap());
	let c = K[r], l = [], u = /* @__PURE__ */ new Set(), d = new Set(s), f = (e) => {
		e && !u.has(e) && (u.add(e), f(e.parentNode));
	};
	s.forEach((e) => {
		f(e), o && O(e) && ue(e, (e) => {
			f(e);
		});
	});
	let p = (e) => {
		e && !d.has(e) && Array.prototype.forEach.call(e.children, (e) => {
			if (u.has(e)) p(e);
			else try {
				if (bt(e)) return;
				let t = e.getAttribute(i), n = a ? t === "true" : t !== null && t !== "false", o = (W.get(e) || 0) + 1, s = (c.get(e) || 0) + 1;
				W.set(e, o), c.set(e, s), l.push(e), o === 1 && n && G.set(e, !0), s === 1 && e.setAttribute(r, ""), n || e.setAttribute(i, a ? "true" : "");
			} catch (t) {
				console.error("[zag-js > ariaHidden] cannot operate on ", e, t);
			}
		});
	};
	return p(n), u.clear(), q++, () => {
		l.forEach((e) => {
			let t = W.get(e) - 1, n = c.get(e) - 1;
			W.set(e, t), c.set(e, n), t || (G.has(e) || e.removeAttribute(i), G.delete(e)), n || e.removeAttribute(r);
		}), q--, q || (W = /* @__PURE__ */ new WeakMap(), W = /* @__PURE__ */ new WeakMap(), G = /* @__PURE__ */ new WeakMap(), K = {});
	};
}, St = (e) => (Array.isArray(e) ? e[0] : e).ownerDocument.body, Ct = (e, t = St(e), n = "data-aria-hidden", r = !0) => {
	if (t) return xt(e, {
		parentNode: t,
		markerName: n,
		controlAttribute: "aria-hidden",
		explicitBooleanValue: !0,
		followControlledElements: r
	});
}, wt = (e) => {
	let t = requestAnimationFrame(() => e());
	return () => cancelAnimationFrame(t);
};
function Tt(e, t = {}) {
	let { defer: n = !0 } = t, r = n ? wt : (e) => e(), i = [];
	return i.push(r(() => {
		let t = (typeof e == "function" ? e() : e).filter(Boolean);
		t.length !== 0 && i.push(Ct(t));
	})), () => {
		i.forEach((e) => e?.());
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/chunk-QZ7TP4HQ.mjs
var Et = Object.defineProperty, Dt = (e, t, n) => t in e ? Et(e, t, {
	enumerable: !0,
	configurable: !0,
	writable: !0,
	value: n
}) : e[t] = n, J = (e, t, n) => Dt(e, typeof t == "symbol" ? t : t + "", n), Ot = {
	activateTrap(e, t) {
		if (e.length > 0) {
			let n = e[e.length - 1];
			n !== t && n.pause();
		}
		let n = e.indexOf(t);
		n === -1 || e.splice(n, 1), e.push(t);
	},
	deactivateTrap(e, t) {
		let n = e.indexOf(t);
		n !== -1 && e.splice(n, 1), e.length > 0 && e[e.length - 1].unpause();
	}
}, kt = [], At = class {
	constructor(e, t) {
		J(this, "trapStack"), J(this, "config"), J(this, "doc"), J(this, "state", {
			containers: [],
			containerGroups: [],
			tabbableGroups: [],
			nodeFocusedBeforeActivation: null,
			mostRecentlyFocusedNode: null,
			active: !1,
			paused: !1,
			delayInitialFocusTimer: void 0,
			recentNavEvent: void 0
		}), J(this, "lastInteractionType", "keyboard"), J(this, "portalContainers", /* @__PURE__ */ new Set()), J(this, "listenerCleanups", []), J(this, "handleFocus", (e) => {
			let t = x(e), n = this.findContainerIndex(t, e) >= 0;
			if (n || v(t)) n && (this.state.mostRecentlyFocusedNode = t);
			else {
				e.stopImmediatePropagation();
				let t, n = !0;
				if (this.state.mostRecentlyFocusedNode) {
					if (L(this.state.mostRecentlyFocusedNode) > 0) {
						let e = this.findContainerIndex(this.state.mostRecentlyFocusedNode), { tabbableNodes: r } = this.state.containerGroups[e];
						if (r.length > 0) {
							let e = r.findIndex((e) => e === this.state.mostRecentlyFocusedNode);
							e >= 0 && (this.config.isKeyForward(this.state.recentNavEvent) ? e + 1 < r.length && (t = r[e + 1], n = !1) : e - 1 >= 0 && (t = r[e - 1], n = !1));
						}
					} else this.state.containerGroups.some((e) => e.tabbableNodes.some((e) => L(e) > 0)) || (n = !1);
				} else n = !1;
				n && (t = this.findNextNavNode({
					target: this.state.mostRecentlyFocusedNode,
					isBackward: this.config.isKeyBackward(this.state.recentNavEvent)
				})), t ? this.tryFocus(t) : this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode());
			}
			this.state.recentNavEvent = void 0;
		}), J(this, "handlePointerDown", (e) => {
			this.lastInteractionType = "pointer";
			let t = x(e);
			if (!(this.findContainerIndex(t, e) >= 0)) {
				if (Z(this.config.clickOutsideDeactivates, e)) {
					this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate });
					return;
				}
				Z(this.config.allowOutsideClick, e) || e.preventDefault();
			}
		}), J(this, "handleClick", (e) => {
			let t = x(e);
			this.findContainerIndex(t, e) >= 0 || Z(this.config.clickOutsideDeactivates, e) || Z(this.config.allowOutsideClick, e) || (e.preventDefault(), e.stopImmediatePropagation());
		}), J(this, "handleTabKey", (e) => {
			if (this.lastInteractionType = "keyboard", this.config.isKeyForward(e) || this.config.isKeyBackward(e)) {
				this.state.recentNavEvent = e;
				let t = this.config.isKeyBackward(e), n = this.findNextNavNode({
					event: e,
					isBackward: t
				});
				if (!n) return;
				X(e) && e.preventDefault(), this.tryFocus(n);
			}
		}), J(this, "handleEscapeKey", (e) => {
			Nt(e) && Z(this.config.escapeDeactivates, e) !== !1 && (e.preventDefault(), this.deactivate());
		}), J(this, "_mutationObserver"), J(this, "setupMutationObserver", () => {
			let e = this.doc.defaultView || window;
			this._mutationObserver = new e.MutationObserver((e) => {
				e.some((e) => Array.from(e.removedNodes).some((e) => e === this.state.mostRecentlyFocusedNode)) && this.tryFocus(this.getInitialFocusNode()), e.some((e) => e.type === "attributes" && (e.attributeName === "aria-controls" || e.attributeName === "aria-expanded") || e.type === "childList" && e.addedNodes.length > 0 && Array.from(e.addedNodes).some((e) => {
					if (e.nodeType !== Node.ELEMENT_NODE) return !1;
					let t = e;
					return me(t) ? !0 : t.id && !this.state.containers.some((e) => e.contains(t)) ? he(t) : !1;
				})) && this.state.active && !this.state.paused && (this.updateTabbableNodes(), this.updatePortalContainers());
			});
		}), J(this, "updateObservedNodes", () => {
			this._mutationObserver?.disconnect(), this.state.active && !this.state.paused && (this.state.containers.map((e) => {
				this._mutationObserver?.observe(e, {
					subtree: !0,
					childList: !0,
					attributes: !0,
					attributeFilter: ["aria-controls", "aria-expanded"]
				});
			}), this.portalContainers.forEach((e) => {
				this.observePortalContainer(e);
			}));
		}), J(this, "getInitialFocusNode", () => {
			let e = this.getNodeForOption("initialFocus", { hasFallback: !0 });
			if (e === !1) return !1;
			if (e === void 0 || e && !P(e)) {
				let t = m(this.doc);
				if (t && this.findContainerIndex(t) >= 0) e = t;
				else {
					let t = this.state.tabbableGroups[0];
					e = t && t.firstTabbableNode || this.getNodeForOption("fallbackFocus");
				}
			} else e === null && (e = this.getNodeForOption("fallbackFocus"));
			if (!e || (e.isConnected || (e = this.getNodeForOption("fallbackFocus")), !e || !e.isConnected)) throw Error("Your focus-trap needs to have at least one focusable element");
			return e;
		}), J(this, "tryFocus", (e, t) => {
			if (e !== !1 && e !== m(this.doc)) {
				if (!e || !e.focus) {
					this.tryFocus(this.getInitialFocusNode());
					return;
				}
				e.focus({
					preventScroll: !!this.config.preventScroll,
					...t
				}), this.state.mostRecentlyFocusedNode = e, Pt(e) && e.select();
			}
		}), J(this, "deactivate", (e) => {
			if (!this.state.active) return this;
			let t = {
				onDeactivate: this.config.onDeactivate,
				onPostDeactivate: this.config.onPostDeactivate,
				checkCanReturnFocus: this.config.checkCanReturnFocus,
				...e
			};
			clearTimeout(this.state.delayInitialFocusTimer), this.state.delayInitialFocusTimer = void 0, this.removeListeners(), this.state.active = !1, this.state.paused = !1, this.updateObservedNodes(), Ot.deactivateTrap(this.trapStack, this), this.portalContainers.clear();
			let n = this.getOption(t, "onDeactivate"), r = this.getOption(t, "onPostDeactivate"), i = this.getOption(t, "checkCanReturnFocus"), a = this.getOption(t, "returnFocus", "returnFocusOnDeactivate");
			n?.();
			let o = () => {
				Q(() => {
					if (a && this.isSafeToOverrideFocus()) {
						let e = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation), t = this.lastInteractionType === "keyboard" ? { focusVisible: !0 } : void 0;
						this.tryFocus(e, t);
					}
					r?.();
				});
			};
			return a && i ? (i(this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation)).then(o, o), this) : (o(), this);
		}), J(this, "pause", (e) => {
			if (this.state.paused || !this.state.active) return this;
			let t = this.getOption(e, "onPause"), n = this.getOption(e, "onPostPause");
			return this.state.paused = !0, t?.(), this.removeListeners(), this.updateObservedNodes(), n?.(), this;
		}), J(this, "unpause", (e) => {
			if (!this.state.paused || !this.state.active) return this;
			let t = this.getOption(e, "onUnpause"), n = this.getOption(e, "onPostUnpause");
			this.state.paused = !1, t?.();
			try {
				this.updateTabbableNodes();
			} catch {}
			this.attachListeners();
			try {
				this.commitInitialFocus();
			} catch {}
			return this.updateObservedNodes(), n?.(), this;
		}), J(this, "updateContainerElements", (e) => (this.state.containers = Array.isArray(e) ? e.filter(Boolean) : [e].filter(Boolean), this.state.active && this.updateTabbableNodes(), this.updateObservedNodes(), this)), J(this, "getReturnFocusNode", (e) => {
			let t = this.getNodeForOption("setReturnFocus", { params: [e] });
			return t || t !== !1 && e;
		}), J(this, "getOption", (e, t, n) => e && e[t] !== void 0 ? e[t] : this.config[n || t]), J(this, "getNodeForOption", (e, { hasFallback: t = !1, params: n = [] } = {}) => {
			let r = this.config[e];
			if (typeof r == "function" && (r = r(...n)), r === !0 && (r = void 0), !r) {
				if (r === void 0 || r === !1) return r;
				throw Error(`\`${e}\` was specified but was not a node, or did not return a node`);
			}
			let i = r;
			if (typeof r == "string") {
				try {
					i = this.doc.querySelector(r);
				} catch (t) {
					throw Error(`\`${e}\` appears to be an invalid selector; error="${t.message}"`);
				}
				if (!i && !t) throw Error(`\`${e}\` as selector refers to no known node`);
			}
			return i;
		}), J(this, "findNextNavNode", (e) => {
			let { event: t, isBackward: n = !1 } = e, r = e.target || x(t);
			this.updateTabbableNodes();
			let i = null;
			if (this.state.tabbableGroups.length > 0) {
				let e = this.findContainerIndex(r, t), a = e >= 0 ? this.state.containerGroups[e] : void 0;
				if (e < 0) i = n ? this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode : this.state.tabbableGroups[0].firstTabbableNode;
				else if (n) {
					let n = this.state.tabbableGroups.findIndex(({ firstTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || P(r) && !I(r) && !a?.nextTabbableNode(r, !1)) && (n = e), n >= 0) {
						let e = n === 0 ? this.state.tabbableGroups.length - 1 : n - 1, t = this.state.tabbableGroups[e];
						i = L(r) >= 0 ? t.lastTabbableNode : t.lastDomTabbableNode;
					} else X(t) || (i = a?.nextTabbableNode(r, !1));
				} else {
					let n = this.state.tabbableGroups.findIndex(({ lastTabbableNode: e }) => r === e);
					if (n < 0 && (a?.container === r || P(r) && !I(r) && !a?.nextTabbableNode(r)) && (n = e), n >= 0) {
						let e = n === this.state.tabbableGroups.length - 1 ? 0 : n + 1, t = this.state.tabbableGroups[e];
						i = L(r) >= 0 ? t.firstTabbableNode : t.firstDomTabbableNode;
					} else X(t) || (i = a?.nextTabbableNode(r));
				}
			} else i = this.getNodeForOption("fallbackFocus");
			return i;
		}), this.trapStack = t.trapStack || kt;
		let n = {
			returnFocusOnDeactivate: !0,
			escapeDeactivates: !0,
			delayInitialFocus: !0,
			followControlledElements: !0,
			isKeyForward: jt,
			isKeyBackward: Mt,
			...t
		};
		this.doc = n.document || g(Array.isArray(e) ? e[0] : e), this.config = n, this.updateContainerElements(e), this.setupMutationObserver();
	}
	addPortalContainer(e) {
		let t = e.parentElement;
		t && !this.portalContainers.has(t) && (this.portalContainers.add(t), this.state.active && !this.state.paused && this.observePortalContainer(t));
	}
	observePortalContainer(e) {
		this._mutationObserver?.observe(e, {
			subtree: !0,
			childList: !0,
			attributes: !0,
			attributeFilter: ["aria-controls", "aria-expanded"]
		});
	}
	updatePortalContainers() {
		this.config.followControlledElements && this.state.containers.forEach((e) => {
			de(e).forEach((e) => {
				this.addPortalContainer(e);
			});
		});
	}
	get active() {
		return this.state.active;
	}
	get paused() {
		return this.state.paused;
	}
	findContainerIndex(e, t) {
		let n = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return this.state.containerGroups.findIndex(({ container: r, tabbableNodes: i }) => r.contains(e) || n?.includes(r) || i.find((t) => t === e) || this.isControlledElement(r, e) || this.isPersistentElement(e, t));
	}
	isControlledElement(e, t) {
		return this.config.followControlledElements ? le(e, t) : !1;
	}
	isPersistentElement(e, t) {
		let n = this.config.persistentElements;
		if (!n || n.length === 0) return !1;
		let r = typeof t?.composedPath == "function" ? t.composedPath() : void 0;
		return n.some((t) => {
			let n = t();
			return d(n, e) || n != null && r?.includes(n);
		});
	}
	updateTabbableNodes() {
		if (this.state.containerGroups = this.state.containers.map((e) => {
			let t = F(e, { getShadowRoot: this.config.getShadowRoot }), n = N(e, { getShadowRoot: this.config.getShadowRoot }), r = t[0], i = t[t.length - 1], a = r, o = i, s = !1;
			for (let e = 0; e < t.length; e++) if (L(t[e]) > 0) {
				s = !0;
				break;
			}
			function c(e, r = !0) {
				let i = t.indexOf(e);
				if (i >= 0) return t[i + (r ? 1 : -1)];
				let a = n.indexOf(e);
				if (!(a < 0)) {
					if (r) {
						for (let e = a + 1; e < n.length; e++) if (I(n[e])) return n[e];
					} else for (let e = a - 1; e >= 0; e--) if (I(n[e])) return n[e];
				}
			}
			return {
				container: e,
				tabbableNodes: t,
				focusableNodes: n,
				posTabIndexesFound: s,
				firstTabbableNode: r,
				lastTabbableNode: i,
				firstDomTabbableNode: a,
				lastDomTabbableNode: o,
				nextTabbableNode: c
			};
		}), this.state.tabbableGroups = this.state.containerGroups.filter((e) => e.tabbableNodes.length > 0), this.state.tabbableGroups.length <= 0 && !this.getNodeForOption("fallbackFocus")) throw Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
		if (this.state.containerGroups.find((e) => e.posTabIndexesFound) && this.state.containerGroups.length > 1) throw Error("At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.");
	}
	attachListeners() {
		if (this.state.active) return Ot.activateTrap(this.trapStack, this), this.listenerCleanups.push(C(this.doc, "focusin", this.handleFocus, !0), C(this.doc, "mousedown", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), C(this.doc, "touchstart", this.handlePointerDown, {
			capture: !0,
			passive: !1
		}), C(this.doc, "click", this.handleClick, {
			capture: !0,
			passive: !1
		}), C(this.doc, "keydown", this.handleTabKey, {
			capture: !0,
			passive: !1
		}), C(this.doc, "keydown", this.handleEscapeKey)), this;
	}
	commitInitialFocus() {
		return this.state.delayInitialFocusTimer = this.config.delayInitialFocus ? Q(() => {
			this.tryFocus(this.getInitialFocusNode());
		}) : this.tryFocus(this.getInitialFocusNode()), this;
	}
	addListeners() {
		if (this.state.active) return this.attachListeners(), this.commitInitialFocus(), this;
	}
	removeListeners() {
		if (this.state.active) return this.listenerCleanups.forEach((e) => e()), this.listenerCleanups = [], this;
	}
	containsElement(e) {
		return this.state.containers.some((t) => d(t, e));
	}
	isSafeToOverrideFocus() {
		let e = m(this.doc);
		return !e || e === this.doc.body || this.containsElement(e) ? !0 : this.trapStack.some((t) => t !== this && t.containsElement(e));
	}
	activate(e) {
		if (this.state.active) return this;
		let t = this.getOption(e, "onActivate"), n = this.getOption(e, "onPostActivate"), r = this.getOption(e, "checkCanFocusTrap");
		r || this.updateTabbableNodes(), this.state.active = !0, this.state.paused = !1, this.state.nodeFocusedBeforeActivation = m(this.doc), t?.();
		let i = () => {
			r && this.updateTabbableNodes(), this.addListeners(), this.updateObservedNodes(), n?.();
		};
		return r ? (r(this.state.containers.concat()).then(i, i), this) : (i(), this);
	}
}, Y = (e) => e?.type === "keydown", X = (e) => Y(e) && e?.key === "Tab", jt = (e) => Y(e) && e.key === "Tab" && !e?.shiftKey, Mt = (e) => Y(e) && e.key === "Tab" && e?.shiftKey, Z = (e, ...t) => typeof e == "function" ? e(...t) : e, Nt = (e) => !e.isComposing && e.key === "Escape", Q = (e) => setTimeout(e, 0), Pt = (e) => e.localName === "input" && "select" in e && typeof e.select == "function";
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+focus-trap@1.43.3/node_modules/@zag-js/focus-trap/dist/index.mjs
function Ft(e, t = {}) {
	let n, r = w(() => {
		let r = (Array.isArray(e) ? e : [e]).map((e) => typeof e == "function" ? e() : e).filter((e) => e != null);
		if (r.length === 0) return;
		let i = r[0];
		n = new At(r, {
			escapeDeactivates: !1,
			allowOutsideClick: !0,
			preventScroll: !0,
			returnFocusOnDeactivate: !0,
			delayInitialFocus: !1,
			fallbackFocus: i,
			...t,
			document: g(i)
		});
		try {
			n.activate();
		} catch {}
	});
	return function() {
		n?.deactivate(), r();
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+remove-scroll@1.43.3/node_modules/@zag-js/remove-scroll/dist/index.mjs
var It = "data-scroll-lock", $ = /* @__PURE__ */ new WeakMap();
function Lt(e) {
	let t = e.getBoundingClientRect().left;
	return Math.round(t) + e.scrollLeft ? "paddingLeft" : "paddingRight";
}
function Rt(e) {
	let t = k(e)?.scrollbarGutter;
	return t === "stable" || t?.startsWith("stable ") === !0;
}
function zt(e) {
	let { documentElement: t, body: n } = e;
	return z(t) ? t : n;
}
function Bt(e) {
	let t = e.defaultView ?? window, { documentElement: n, body: r } = e, i = zt(e), a = Rt(n) || Rt(r), o = t.innerWidth - n.clientWidth;
	r.setAttribute(It, "");
	let s = () => oe(n, "--scrollbar-width", `${o}px`), c = Lt(n), l = [s(), h() ? (() => {
		let { scrollX: e, scrollY: n, visualViewport: i } = t, s = i?.offsetLeft ?? 0, l = i?.offsetTop ?? 0, u = {
			position: "fixed",
			overflow: "hidden",
			top: `${-(n - Math.floor(l))}px`,
			left: `${-(e - Math.floor(s))}px`,
			right: "0"
		};
		!a && o > 0 && (u[c] = `${o}px`);
		let d = A(r, u);
		return () => {
			d?.(), t.scrollTo({
				left: e,
				top: n,
				behavior: "instant"
			});
		};
	})() : (() => {
		let e = { overflow: "hidden" };
		return !a && o > 0 && (e[c] = `${o}px`), A(i, e);
	})()];
	return () => {
		l.forEach((e) => e?.()), r.removeAttribute(It);
	};
}
function Vt(e) {
	let t = e ?? document, n = $.get(t);
	n || (n = {
		count: 0,
		cleanup: Bt(t)
	}, $.set(t, n)), n.count++;
	let r = n, i = !1;
	return () => {
		i || (i = !0, r.count--, r.count === 0 && (r.cleanup(), $.delete(t)));
	};
}
//#endregion
export { N as _, ht as a, Ve as c, Le as d, Fe as f, De as g, Ee as h, gt as i, Be as l, z as m, Ft as n, He as o, Oe as p, Tt as r, Ue as s, Vt as t, Pe as u, Te as v, F as y };
