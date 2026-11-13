import { $ as e, B as t, Ct as n, Dt as r, E as i, F as a, Ft as o, It as s, J as c, Nt as l, O as u, Ot as d, Q as f, St as p, T as m, U as h, X as ee, Y as g, Z as _, _ as v, at as y, b as te, bt as b, ft as x, g as ne, ht as S, lt as C, mt as w, nt as T, ot as re, pt as ie, rt as ae, st as oe, tt as se, ut as ce, vt as E, w as le, z as D } from "./version-DyshBDr6.js";
//#region \0rolldown/runtime.js
var O = Object.defineProperty, ue = (e, t) => {
	let n = {};
	for (var r in e) O(n, r, {
		get: e[r],
		enumerable: !0
	});
	return t || O(n, Symbol.toStringTag, { value: "Module" }), n;
};
//#endregion
//#region src/kit/environment.ts
function k(e, t, n, r = {}) {
	return e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !1,
		cancelable: r.cancelable ?? !1
	}));
}
function de(e, t, n) {
	if (!e || !e.isConnected) return;
	n.dataset.raised = String(t);
	let r;
	try {
		r = e.matches(":popover-open");
	} catch {
		r = e.dataset.shown === "true";
	}
	t && !r ? e.showPopover?.() : !t && r && e.hidePopover?.();
}
function A() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e instanceof HTMLElement ? e : null;
}
function j(e, t) {
	for (let n = t; n;) {
		if (n === e) return !0;
		let t = n.getRootNode();
		n = n.parentNode ?? (t instanceof ShadowRoot ? t.host : null);
	}
	return !1;
}
var M = [];
function fe(e) {
	for (let t = M.length - 1; t >= 0; t--) {
		if (M[t].isConnected) return M[t] === e;
		M.splice(t, 1);
	}
	return !1;
}
function pe(e) {
	let t = null;
	return (n, r) => {
		if (n) {
			if (r && !n.open) t = A(), n.showModal(), M.push(e);
			else if (!r && n.open) {
				n.close();
				let r = M.lastIndexOf(e);
				r >= 0 && M.splice(r, 1);
				let i = t;
				t = null;
				let a = A();
				i?.isConnected && (!a || a === document.body || j(e, a)) && i.focus({ preventScroll: !0 });
			}
		}
	};
}
function me(e, t) {
	for (let n = t; n;) {
		if (n === e) return !0;
		n = n instanceof Element && n.assignedSlot || n.parentNode || (n instanceof ShadowRoot ? n.host : null);
	}
	return !1;
}
function N(e) {
	for (let t = e; t; t = t.parentNode ?? (t instanceof ShadowRoot ? t.host : null)) {
		if (!(t instanceof Element) || !t.hasAttribute("dir")) continue;
		let e = t.getAttribute("dir").toLowerCase();
		if (e === "rtl" || e === "ltr") return e;
		break;
	}
	return getComputedStyle(e).direction === "rtl" ? "rtl" : "ltr";
}
//#endregion
//#region src/kit/css.ts
var P = ".af-kit{--k-bg:var(--af-bg,#f8fafc);--k-surface:var(--af-surface,#fff);--k-fg:var(--af-fg,#0d1928);--k-muted:var(--af-muted-fg,#576477);--k-line:var(--af-border,#e0e6ee);--k-primary:var(--af-primary,#0c71d1);--k-primary-fg:var(--af-primary-fg,#fafcfe);--k-danger:var(--af-danger,#e40014);--k-warning:var(--af-warning,#dd7400);--k-success:var(--af-success,#009767);--k-info:oklch(calc(.55 + var(--k-dark,0) * .19) calc(.15 - var(--k-dark,0) * .03) 250);--k-secondary:var(--af-secondary,color-mix(in oklab, var(--k-fg) 4.5%, var(--k-surface)));--k-secondary-fg:var(--af-secondary-fg,var(--af-fg,#0d1928));--k-accent:var(--af-accent,color-mix(in oklab, var(--k-fg) 4.5%, var(--k-surface)));--k-accent-fg:var(--af-accent-fg,var(--af-fg,#0d1928));--k-muted-bg:var(--af-muted,color-mix(in oklab, var(--k-fg) 4.5%, var(--k-surface)));--k-input:var(--af-input,var(--af-border,#e0e6ee));--k-popover:var(--af-popover,var(--af-surface,#fff));--k-popover-fg:var(--af-popover-fg,var(--af-fg,#0d1928));--k-radius:var(--af-radius,.625rem);--k-font:var(--af-font-sans,ui-sans-serif, system-ui, sans-serif);--k-ring:var(--af-ring,#0c71d1);--k-focus-border:var(--k-ring);--k-focus-ring:color-mix(in oklab, var(--k-ring) 50%, transparent);--k-hover:color-mix(in oklab, var(--k-fg) 5%, var(--k-surface));--k-press:color-mix(in oklab, var(--k-fg) 9%, var(--k-surface));--k-chart-1:var(--af-chart-1,#2a78d6);--k-chart-2:var(--af-chart-2,#eb6834);--k-chart-3:var(--af-chart-3,#1baf7a);--k-chart-4:var(--af-chart-4,#eda100);--k-chart-5:var(--af-chart-5,#e87ba4);--k-chart-6:var(--af-chart-6,#008300);--k-chart-7:var(--af-chart-7,#6250d6);--k-chart-8:var(--af-chart-8,#e34948);--k-chart-other:var(--af-chart-other,#f0efec);--k-chart-hatch:var(--af-chart-hatch,#898781);--k-chart-grid:var(--af-chart-grid,#e1e0d9);--k-chart-axis:var(--af-chart-axis,#c3c2b7);font-family:var(--k-font);color:var(--k-fg)}@supports (color:lab(0% 0 0)){.af-kit{--k-bg:var(--af-bg,lab(98.1433% -.367165 -1.06069));--k-surface:var(--af-surface,lab(100% 0 0));--k-fg:var(--af-fg,lab(8.19431% -1.05806 -12.2385));--k-muted:var(--af-muted-fg,lab(41.8773% -1.78064 -12.648));--k-line:var(--af-border,lab(90.9248% -1.03632 -4.75875));--k-primary:var(--af-primary,lab(46.5609% 2.72214 -58.0728));--k-primary-fg:var(--af-primary-fg,lab(98.837% -.443995 -1.43219));--k-danger:var(--af-danger,lab(48.4493% 77.4328 61.5452));--k-warning:var(--af-warning,lab(60.3514% 40.5624 87.1228));--k-success:var(--af-success,lab(55.0481% -49.9246 15.93));--k-secondary-fg:var(--af-secondary-fg,var(--af-fg,lab(8.19431% -1.05806 -12.2385)));--k-accent-fg:var(--af-accent-fg,var(--af-fg,lab(8.19431% -1.05806 -12.2385)));--k-input:var(--af-input,var(--af-border,lab(90.9248% -1.03632 -4.75875)));--k-popover:var(--af-popover,var(--af-surface,lab(100% 0 0)));--k-popover-fg:var(--af-popover-fg,var(--af-fg,lab(8.19431% -1.05806 -12.2385)));--k-ring:var(--af-ring,lab(46.5609% 2.72214 -58.0728))}}:host([data-theme=dark]) .af-kit,.af-kit[data-theme=dark]{--k-dark:1;--k-bg:var(--af-bg,#0b121b);--k-surface:var(--af-surface,#131b25);--k-fg:var(--af-fg,#eff3f6);--k-muted:var(--af-muted-fg,#a9b2be);--k-line:var(--af-border,#ffffff1c);--k-primary:var(--af-primary,#63b1f9);--k-primary-fg:var(--af-primary-fg,#0a1725);--k-danger:var(--af-danger,#ff6568);--k-warning:var(--af-warning,#f99c00);--k-success:var(--af-success,#00bb7f);--k-secondary:var(--af-secondary,color-mix(in oklab, var(--k-fg) 7%, var(--k-surface)));--k-secondary-fg:var(--af-secondary-fg,var(--af-fg,#eff3f6));--k-accent:var(--af-accent,color-mix(in oklab, var(--k-fg) 8%, var(--k-surface)));--k-accent-fg:var(--af-accent-fg,var(--af-fg,#eff3f6));--k-muted-bg:var(--af-muted,color-mix(in oklab, var(--k-fg) 5.5%, var(--k-surface)));--k-input:var(--af-input,var(--af-border,#ffffff29));--k-popover:var(--af-popover,var(--af-surface,#171f2b));--k-popover-fg:var(--af-popover-fg,var(--af-fg,#eff3f6));--k-ring:var(--af-ring,#63b1f9);--k-chart-1:var(--af-chart-1,#3987e5);--k-chart-2:var(--af-chart-2,#d95926);--k-chart-3:var(--af-chart-3,#199e70);--k-chart-4:var(--af-chart-4,#c98500);--k-chart-5:var(--af-chart-5,#d55181);--k-chart-6:var(--af-chart-6,#008300);--k-chart-7:var(--af-chart-7,#9085e9);--k-chart-8:var(--af-chart-8,#e66767);--k-chart-other:var(--af-chart-other,#383835);--k-chart-hatch:var(--af-chart-hatch,#898781);--k-chart-grid:var(--af-chart-grid,#2c2c2a);--k-chart-axis:var(--af-chart-axis,#383835)}@supports (color:lab(0% 0 0)){:host([data-theme=dark]) .af-kit,.af-kit[data-theme=dark]{--k-bg:var(--af-bg,lab(5.20297% -.7421 -7.06235));--k-surface:var(--af-surface,lab(9.19901% -1.18761 -8.50037));--k-fg:var(--af-fg,lab(95.5874% -.662178 -2.14615));--k-muted:var(--af-muted-fg,lab(72.1142% -1.52099 -7.28307));--k-line:var(--af-border,lab(100% 0 0/.11));--k-primary:var(--af-primary,lab(69.4527% -8.90157 -43.6168));--k-primary-fg:var(--af-primary-fg,lab(7.09383% -1.43068 -11.9741));--k-danger:var(--af-danger,lab(63.7053% 60.745 31.3109));--k-warning:var(--af-warning,lab(72.7183% 31.8672 97.9407));--k-success:var(--af-success,lab(66.9756% -58.27 19.5419));--k-secondary-fg:var(--af-secondary-fg,var(--af-fg,lab(95.5874% -.662178 -2.14615)));--k-accent-fg:var(--af-accent-fg,var(--af-fg,lab(95.5874% -.662178 -2.14615)));--k-input:var(--af-input,var(--af-border,lab(100% 0 0/.16)));--k-popover:var(--af-popover,var(--af-surface,lab(11.5175% -1.27881 -8.86646)));--k-popover-fg:var(--af-popover-fg,var(--af-fg,lab(95.5874% -.662178 -2.14615)));--k-ring:var(--af-ring,lab(69.4527% -8.90157 -43.6168))}}:host :where(.af-kit) [popover]{color:inherit;background:0 0;border:0;margin:0;padding:0;inset:auto;overflow:visible}.af-button{--k-btn-bg:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark,0) * 100%), var(--k-bg));--k-btn-line:color-mix(in oklab, var(--k-input) calc(var(--k-dark,0) * 100%), var(--k-line));--k-btn-hover:color-mix(in oklab, color-mix(in oklab, var(--k-input) 50%, transparent) calc(var(--k-dark,0) * 100%), var(--k-accent));--k-btn-hover-fg:var(--k-accent-fg);--k-btn-ring:var(--k-focus-ring);--k-btn-focus-line:color-mix(in oklab, var(--k-input) calc(var(--k-dark,0) * 100%), var(--k-focus-border));--k-btn-shadow:0 1px 2px 0 #0000000d;box-sizing:border-box;border:1px solid var(--k-btn-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background:var(--k-btn-bg);height:36px;color:inherit;box-shadow:var(--k-btn-shadow);font:inherit;white-space:nowrap;cursor:pointer;outline:none;flex-shrink:0;justify-content:center;align-items:center;gap:8px;padding:8px 16px;font-size:14px;font-weight:500;line-height:20px;text-decoration:none;transition:background-color .1s cubic-bezier(.2,0,0,1),border-color .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1);display:inline-flex}.af-button svg{pointer-events:none;flex:none;width:16px;height:16px}.af-button.primary,.af-button.secondary,.af-button.ghost,.af-button.danger,.af-button.link{--k-btn-line:var(--k-line);--k-btn-focus-line:var(--k-focus-border);--k-btn-shadow:0 0 0 0 transparent;border-width:0}.af-button.primary{--k-btn-bg:var(--k-primary);color:var(--k-primary-fg);--k-btn-hover:color-mix(in oklab, var(--k-primary) 90%, transparent);--k-btn-hover-fg:var(--k-primary-fg)}.af-button.secondary{--k-btn-bg:var(--k-secondary);color:var(--k-secondary-fg);--k-btn-hover:color-mix(in oklab, var(--k-secondary) 80%, transparent);--k-btn-hover-fg:var(--k-secondary-fg)}.af-button.ghost{--k-btn-bg:transparent;--k-btn-hover:color-mix(in oklab, var(--k-accent) calc(100% - var(--k-dark,0) * 50%), transparent)}.af-button.danger{--k-btn-bg:color-mix(in oklab, var(--k-danger) calc(100% - var(--k-dark,0) * 40%), transparent);color:#fff;--k-btn-hover:color-mix(in oklab, var(--k-danger) calc(90% - var(--k-dark,0) * 30%), transparent);--k-btn-hover-fg:#fff;--k-btn-ring:color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark,0) * 20%), transparent)}.af-button.link{--k-btn-bg:transparent;color:var(--k-primary);--k-btn-hover:transparent;--k-btn-hover-fg:var(--k-primary);text-underline-offset:4px}.af-button:focus-visible{border-color:var(--k-btn-focus-line);box-shadow:0 0 0 3px var(--k-btn-ring), var(--k-btn-shadow)}@media (hover:hover){.af-button:not([aria-disabled=true],:disabled):hover{background:var(--k-btn-hover);color:var(--k-btn-hover-fg)}.af-button.link:not([aria-disabled=true],:disabled):hover{text-decoration-line:underline}}.af-button:not([aria-disabled=true],:disabled,.link):active{background:color-mix(in oklab, var(--k-btn-hover), var(--k-fg) 8%);transition:none}.af-button:has(>svg){padding-inline:12px}.af-button.xs{gap:4px;height:24px;padding:0 8px;font-size:12px;line-height:16px}.af-button.xs:has(>svg){padding-inline:6px}.af-button.xs svg{width:12px;height:12px}.af-button.sm{gap:6px;height:32px;padding:0 12px}.af-button.sm:has(>svg){padding-inline:10px}.af-button.lg{height:40px;padding:0 24px}.af-button.lg:has(>svg){padding-inline:16px}:is(.af-button.icon,.af-button.icon:has(>svg)){gap:8px;width:36px;padding:0;font-size:14px;line-height:20px}.af-button.icon.xs{width:24px;height:24px}.af-button.icon.sm{width:32px;height:32px}.af-button.icon.lg{width:40px;height:40px}.af-button[aria-disabled=true],.af-button:disabled{opacity:.5;cursor:not-allowed}@media (forced-colors:active){.af-button:focus-visible{outline-offset:2px;outline:2px solid}}.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch,.af-toggle{--k-fc-ring:var(--k-focus-ring);--k-fc-bad:color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark,0) * 20%), transparent);--k-fc-shadow:0 1px 2px 0 #0000000d;--k-fc-fill:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark,0) * 100%), transparent);box-sizing:border-box;font:inherit;color:inherit;outline:none;margin:0;transition:background-color .1s cubic-bezier(.2,0,0,1),border-color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1)}.af-input,.af-textarea{appearance:none;border:1px solid var(--k-input);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-fc-fill);width:100%;min-width:0;box-shadow:var(--k-fc-shadow);padding:4px 12px;font-size:16px;line-height:24px;display:flex}@media (min-width:48rem){.af-input,.af-textarea{font-size:14px;line-height:20px}}.af-input{height:36px}.af-textarea{field-sizing:fixed;resize:vertical;min-height:4rem;padding-block:8px}.af-input.sm,.af-textarea.sm{padding-inline:10px;font-size:12px;line-height:16px}.af-input.sm{height:32px}.af-textarea.sm{padding-block:6px}.af-input::placeholder,.af-textarea::placeholder{color:var(--k-muted);opacity:1}.af-input::selection{background:var(--k-primary);color:var(--k-primary-fg)}.af-input:disabled{pointer-events:none}.af-checkbox,.af-radio{appearance:none;cursor:default;border:1px solid var(--k-input);background-color:var(--k-fc-fill);width:16px;height:16px;box-shadow:var(--k-fc-shadow);flex:none;padding:0;position:relative}.af-checkbox{border-radius:4px}.af-radio{color:var(--k-primary);border-radius:3.40282e38px}.af-checkbox:before,.af-radio:before{content:\"\";pointer-events:none;background-color:currentColor;margin:auto;display:none;position:absolute;inset:0}.af-checkbox:is(:checked,:indeterminate)[type=checkbox]{border-color:var(--k-primary);background-color:var(--k-primary);color:var(--k-primary-fg)}.af-checkbox:checked:before,.af-checkbox:indeterminate:before{clip-path:polygon(19.61% 47.05%,16.67% 45.83%,13.72% 47.05%,12.5% 50%,13.72% 52.95%,34.55% 73.78%,35.91% 74.68%,37.5% 75%,39.09% 74.68%,40.45% 73.78%,86.28% 27.95%,87.5% 25%,86.28% 22.05%,83.33% 20.83%,80.39% 22.05%,37.5% 64.94%);width:14px;height:14px;display:block}.af-checkbox:indeterminate:before{clip-path:inset(45.83% 16.67% round .58px)}.af-radio:checked:before{clip-path:circle(45.83%);width:8px;height:8px;display:block}.af-switch{appearance:none;cursor:default;background-color:color-mix(in oklab, var(--k-input) calc(100% - var(--k-dark,0) * 20%), transparent);width:32px;height:1.15rem;box-shadow:var(--k-fc-shadow);border:1px solid #0000;border-radius:3.40282e38px;flex:none;align-items:center;padding:0;display:inline-flex;position:relative}.af-switch.sm{width:24px;height:14px}.af-switch:checked{background-color:var(--k-primary)}.af-switch:before{content:\"\";pointer-events:none;background-color:color-mix(in oklab, var(--k-fg) calc(var(--k-dark,0) * 100%), var(--k-bg));border-radius:3.40282e38px;width:16px;height:16px;margin-block:auto;transition:translate .15s cubic-bezier(.4,0,.2,1);position:absolute;top:0;bottom:0;left:0;translate:0}.af-switch.sm:before{width:12px;height:12px}.af-switch:checked:before{background-color:color-mix(in oklab, var(--k-primary-fg) calc(var(--k-dark,0) * 100%), var(--k-bg));translate:calc(100% - 2px)}.af-label{-webkit-user-select:none;user-select:none;align-items:center;gap:8px;font-size:14px;font-weight:500;line-height:1;display:flex}:is(.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch):disabled~.af-label,[data-disabled=true] .af-label{opacity:.5}:is(.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch):disabled~.af-label{cursor:not-allowed}[data-disabled=true] .af-label{pointer-events:none}.af-toggle{--k-fc-shadow:0 0 0 0 transparent;border:0 solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));min-width:36px;height:36px;box-shadow:var(--k-fc-shadow);white-space:nowrap;background-color:#0000;flex:none;justify-content:center;align-items:center;gap:8px;padding:0 8px;font-size:14px;font-weight:500;line-height:20px;display:inline-flex}.af-toggle svg{pointer-events:none;flex:none;width:16px;height:16px}.af-toggle.outline{--k-fc-shadow:0 1px 2px 0 #0000000d;border-width:1px;border-color:var(--k-input)}.af-toggle.sm{min-width:32px;height:32px;padding-inline:6px}.af-toggle.lg{min-width:40px;height:40px;padding-inline:10px}@media (hover:hover){.af-toggle:not([aria-pressed=true],:disabled):hover{background-color:var(--k-muted-bg);color:var(--k-muted)}.af-toggle.outline:not([aria-pressed=true],:disabled):hover{background-color:var(--k-accent);color:var(--k-accent-fg)}}.af-toggle[aria-pressed=true]{background-color:var(--k-accent);color:var(--k-accent-fg)}.af-toggle:disabled{pointer-events:none}:is(.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch,.af-toggle):focus-visible{border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-fc-ring), var(--k-fc-shadow)}:is(.af-input,.af-textarea,.af-checkbox,.af-radio,.af-toggle)[aria-invalid=true]{--k-fc-ring:var(--k-fc-bad);border-color:var(--k-danger)}:is(.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch,.af-toggle):disabled{opacity:.5}:is(.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch):disabled{cursor:not-allowed}@media (forced-colors:active){:is(.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch,.af-toggle):focus-visible{outline-offset:2px;outline:2px solid}.af-checkbox:before,.af-radio:before,.af-switch:before{forced-color-adjust:none;background-color:canvastext}.af-checkbox:is(:checked,:indeterminate)[type=checkbox]{background-color:highlight;border-color:highlight}.af-checkbox:is(:checked,:indeterminate)[type=checkbox]:before,.af-switch:checked:before{background-color:highlighttext}.af-switch{border-color:buttontext}.af-switch:checked{background-color:highlight}.af-toggle[aria-pressed=true]{forced-color-adjust:none;color:highlighttext;background-color:highlight;border-color:buttontext;outline-color:canvastext}}.af-segmented{--k-seg-track:color-mix(in oklab, var(--k-surface) calc(var(--k-dark,0) * 100%), color-mix(in oklab, var(--k-bg) 12%, var(--k-muted-bg)));--k-seg-line:color-mix(in oklab, color-mix(in oklab, var(--k-muted) 17%, var(--k-surface)) calc(var(--k-dark,0) * 100%), color-mix(in oklab, var(--k-bg) 87%, var(--k-muted)));--k-seg-quiet:color-mix(in oklab, color-mix(in oklab, var(--k-bg) 27%, var(--k-fg)) calc(var(--k-dark,0) * 100%), color-mix(in oklab, var(--k-fg) 53%, var(--k-muted-bg)));--k-seg-hover:color-mix(in oklab, color-mix(in oklab, var(--k-fg) 87%, var(--k-muted-bg)) calc(var(--k-dark,0) * 100%), color-mix(in oklab, var(--k-fg) 76%, var(--k-muted-bg)));--k-seg-fg:color-mix(in oklab, color-mix(in oklab, var(--k-muted) 21%, white) calc(var(--k-dark,0) * 100%), color-mix(in oklab, var(--k-muted) 43%, black));box-sizing:border-box;border:1px solid var(--k-seg-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-seg-track);flex-wrap:wrap;row-gap:2px;padding:2px;display:inline-flex}.af-segmented>label{display:inline-flex;position:relative}.af-segmented input{opacity:0;appearance:none;width:100%;height:100%;cursor:inherit;margin:0;position:absolute;inset:0}.af-segmented>label>span{border:0 solid var(--k-line);font-family:var(--af-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);white-space:nowrap;color:var(--k-seg-quiet);border-radius:4px;justify-content:center;align-items:center;padding:4px 10px;font-size:11px;transition:background-color .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1);display:inline-flex}@media (hover:hover){.af-segmented>label:hover>input:not(:checked,:disabled)+span{color:var(--k-seg-hover)}}.af-segmented input:checked+span{background-color:var(--k-surface);color:var(--k-seg-fg);box-shadow:0 1px 3px #0000001a,0 1px 2px -1px #0000001a}.af-segmented input:focus-visible+span{border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring)}.af-segmented input:checked:focus-visible+span{box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a}.af-segmented:not(:has(input:not(:disabled))){opacity:.6;pointer-events:none}.af-segmented:has(input:not(:disabled)) input:disabled+span{opacity:.5}@media (forced-colors:active){.af-segmented input:focus-visible+span{outline-offset:2px;outline:2px solid}.af-segmented input:checked+span{forced-color-adjust:none;color:highlighttext;background-color:highlight;outline-color:canvastext}}:where(:is(af-select,af-combobox,af-number-input,af-date,af-tree-picker):not(:defined)){vertical-align:middle;min-block-size:36px;max-inline-size:100%;display:inline-block}:where(:is(af-person-picker,af-tabs,af-menu):not(:defined)){min-block-size:36px;display:block}:where(:is(af-select[size=sm],af-tabs[variant=segmented]):not(:defined)){min-block-size:32px}:where(:is(af-popover,af-rich-editor,af-pager,af-markdown,af-tile,af-field,af-fieldset,af-form,af-scroll-area,af-file-upload,af-signature-pad,af-folder-source):not(:defined)){display:block}:where(af-tooltip:not(:defined)){display:inline-block}:where(af-copy-button:not(:defined)){vertical-align:middle;min-block-size:24px;min-inline-size:24px;display:inline-flex}:where(af-splitter:not(:defined)){min-height:0;display:flex}:where(:is(af-dialog,af-confirm,af-toast,af-bulk-bar):not(:defined)){display:contents}af-field,af-fieldset{display:block}.af-field{grid-template-columns:minmax(0,1fr) auto;row-gap:6px;min-width:0;display:grid;position:relative}.af-field>*{grid-column:1/-1}.af-field>.af-field-row{grid-area:1/1}.af-field>[slot=aside]{grid-area:1/2;align-self:center;margin-inline-start:8px}.af-field>.af-field-description{order:-1}.af-field-row{align-items:center;gap:8px;min-width:0;display:flex}.af-field-label{color:var(--k-fg);-webkit-user-select:none;user-select:none;align-items:center;gap:8px;font-size:12.5px;font-weight:500;line-height:1.5;display:flex}.af-field-required{color:var(--k-danger);margin-left:2px}.af-field-description,.af-field-error{margin:0;font-size:11px;line-height:1.5}.af-field-description{color:var(--k-muted)}.af-field-error{color:var(--k-danger)}.af-field-lock{color:var(--k-muted);margin-block:-6px}.af-field[edited]{padding-inline-start:9px}.af-field[edited]:before{content:\"\";background-color:var(--k-warning);border-radius:2px;width:3px;position:absolute;inset-block:0;inset-inline-start:0}@media (forced-colors:active){.af-field[edited]:before{forced-color-adjust:none;background-color:highlight}}.af-field [data-af-hidden]{clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}.af-fieldset,.af-fieldset>fieldset{box-sizing:border-box;border:1px solid var(--k-line);border-radius:calc(var(--k-radius) + 4px);background-color:var(--k-surface);color:var(--k-fg);grid-template-columns:minmax(0,1fr);grid-auto-flow:dense;gap:16px;margin:0;padding:20px;display:grid;box-shadow:0 1px 3px #0000001a,0 1px 2px -1px #0000001a}.af-fieldset:has(>fieldset){box-shadow:none;background-color:#0000;border:0;border-radius:0;padding:0;display:block}.af-fieldset[data-af-columns=\"2\"],.af-fieldset[data-af-columns=\"2\"]>fieldset{grid-template-columns:repeat(2,minmax(0,1fr))}.af-fieldset[data-af-columns=\"3\"],.af-fieldset[data-af-columns=\"3\"]>fieldset{grid-template-columns:repeat(3,minmax(0,1fr))}.af-fieldset[data-af-columns=\"4\"],.af-fieldset[data-af-columns=\"4\"]>fieldset{grid-template-columns:repeat(4,minmax(0,1fr))}.af-fieldset-legend{color:var(--k-fg);grid-column:1/-1;padding:0 4px;font-size:13px;font-weight:600;line-height:1.5}.af-fieldset-description{color:var(--k-muted);grid-column:1/-1;margin:0 0 -4px;font-size:12px;line-height:1.5}af-form{display:block}.af-form-summary:focus{outline:none}.af-form-summary:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-form-summary>ul{margin:0;padding-inline-start:20px;list-style:outside}.af-form-summary li{display:list-item}.af-form-summary a{color:inherit;text-underline-offset:4px;text-decoration:underline}@media (forced-colors:active){.af-form-summary:focus-visible{outline-offset:2px;outline:2px solid}}.af-chip{--k-chip-bg:var(--k-primary);--k-chip-fg:var(--k-primary-fg);--k-chip-line:transparent;--k-chip-hover:color-mix(in oklab, var(--k-primary) 90%, transparent);--k-chip-hover-fg:var(--k-primary-fg);--k-chip-ring:var(--k-focus-ring);box-sizing:border-box;border:1px solid var(--k-chip-line);background-color:var(--k-chip-bg);width:-moz-fit-content;width:fit-content;color:var(--k-chip-fg);white-space:nowrap;border-radius:3.40282e38px;outline:none;flex-shrink:0;justify-content:center;align-items:center;gap:4px;padding:2px 8px;font-size:12px;font-weight:500;line-height:16px;text-decoration:none;transition:color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1);display:inline-flex;overflow:hidden}.af-chip>svg{pointer-events:none;flex:none;width:12px;height:12px}.af-chip.secondary{--k-chip-bg:var(--k-secondary);--k-chip-fg:var(--k-secondary-fg);--k-chip-hover:color-mix(in oklab, var(--k-secondary) 90%, transparent);--k-chip-hover-fg:var(--k-secondary-fg)}.af-chip.danger{--k-chip-bg:color-mix(in oklab, var(--k-danger) calc(100% - var(--k-dark,0) * 40%), transparent);--k-chip-fg:#fff;--k-chip-hover:color-mix(in oklab, var(--k-danger) 90%, transparent);--k-chip-hover-fg:#fff;--k-chip-ring:color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark,0) * 20%), transparent)}.af-chip.outline{--k-chip-bg:transparent;--k-chip-fg:var(--k-fg);--k-chip-line:var(--k-line);--k-chip-hover:var(--k-accent);--k-chip-hover-fg:var(--k-accent-fg)}.af-chip.neutral{--k-chip-bg:color-mix(in oklab, var(--k-fg) 7%, var(--k-surface));--k-chip-fg:var(--k-fg)}.af-chip.success{--k-chip-bg:color-mix(in oklab, var(--k-success) 12%, var(--k-surface));--k-chip-fg:color-mix(in oklab, var(--k-success) 75%, var(--k-fg))}.af-chip.warning{--k-chip-bg:color-mix(in oklab, var(--k-warning) 12%, var(--k-surface));--k-chip-fg:color-mix(in oklab, var(--k-warning) 75%, var(--k-fg))}.af-chip.info{--k-chip-bg:color-mix(in oklab, var(--k-info) 12%, var(--k-surface));--k-chip-fg:color-mix(in oklab, var(--k-info) 75%, var(--k-fg))}.af-chip:is(.neutral,.success,.warning,.info){--k-chip-hover:var(--k-chip-bg);--k-chip-hover-fg:var(--k-chip-fg)}@media (hover:hover){a.af-chip:not([aria-disabled=true]):hover{background-color:var(--k-chip-hover);color:var(--k-chip-hover-fg)}}.af-chip:focus-visible{border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-chip-ring)}.af-chip[aria-invalid=true]{--k-chip-ring:color-mix(in oklab, var(--k-danger) calc(20% + var(--k-dark,0) * 20%), transparent);border-color:var(--k-danger)}.af-avatar{--k-avatar-bg:var(--k-muted-bg);--k-avatar-fg:var(--k-muted);box-sizing:border-box;-webkit-user-select:none;user-select:none;border-radius:3.40282e38px;flex:none;width:32px;height:32px;font-size:14px;line-height:20px;display:inline-flex;position:relative;overflow:hidden}.af-avatar.sm{width:24px;height:24px;font-size:12px;line-height:16px}.af-avatar.lg{width:40px;height:40px}:is(.af-avatar-initials,.af-avatar:not(:has(>.af-avatar-initials))){background-color:var(--k-avatar-bg);color:var(--k-avatar-fg);justify-content:center;align-items:center}.af-avatar-initials{border-radius:3.40282e38px;width:100%;height:100%;display:flex}.af-avatar>img{aspect-ratio:1;object-fit:cover;width:100%;height:100%;display:block;position:absolute;inset:0}.af-avatar>img:is([data-failed],:not([src]),[src=\"\"]){display:none}.af-avatar[data-hue]{--k-avatar-bg:oklch(calc(.92 - var(--k-dark,0) * .56) calc(.06 + var(--k-dark,0) * .01) var(--k-hue,255));--k-avatar-fg:oklch(calc(.38 + var(--k-dark,0) * .52) calc(.12 - var(--k-dark,0) * .06) var(--k-hue,255))}.af-avatar[data-hue=\"0\"]{--k-hue:255}.af-avatar[data-hue=\"1\"]{--k-hue:290}.af-avatar[data-hue=\"2\"]{--k-hue:330}.af-avatar[data-hue=\"3\"]{--k-hue:20}.af-avatar[data-hue=\"4\"]{--k-hue:60}.af-avatar[data-hue=\"5\"]{--k-hue:145}.af-avatar[data-hue=\"6\"]{--k-hue:180}.af-avatar[data-hue=\"7\"]{--k-hue:215}.af-progress{appearance:none;box-sizing:border-box;background-color:color-mix(in oklab, var(--k-primary) 20%, transparent);width:100%;height:8px;color:var(--k-primary);border:0;border-radius:3.40282e38px;margin:0;padding:0;display:block;position:relative;overflow:hidden}.af-progress::-webkit-progress-bar{background:0 0}.af-progress::-webkit-progress-value{background-color:var(--k-primary);transition:width .15s cubic-bezier(.4,0,.2,1)}.af-progress::-moz-progress-bar{background-color:var(--k-primary)}.af-progress.circular{background:conic-gradient(var(--k-primary) calc(clamp(0, var(--af-progress,0), 1) * 1turn), color-mix(in oklab, var(--k-primary) 20%, transparent) 0);border-radius:50%;flex:none;width:32px;height:32px;overflow:visible;-webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - 4px),#000 calc(100% - 4px));mask:radial-gradient(farthest-side,#0000 calc(100% - 4px),#000 calc(100% - 4px))}.af-progress.circular::-webkit-progress-value{background:0 0}.af-progress.circular::-moz-progress-bar{background:0 0}.af-tabs{--k-tab-fg:color-mix(in oklab, var(--k-muted) calc(var(--k-dark,0) * 100%), color-mix(in oklab, var(--k-fg) 60%, transparent));--k-tab-ring:var(--k-focus-ring);--k-tab-shadow:0 0 0 0 transparent;--k-tab-line:color-mix(in oklab, color-mix(in oklab, var(--k-primary) 90%, white) calc(var(--k-dark,0) * 100%), var(--k-primary));--k-tab-line-fg:color-mix(in oklab, var(--k-fg) calc(var(--k-dark,0) * 100%), color-mix(in oklab, var(--k-primary) 91%, black));box-sizing:border-box;border-radius:var(--k-radius);background-color:var(--k-muted-bg);width:-moz-fit-content;width:fit-content;height:36px;color:var(--k-muted);justify-content:center;align-items:center;padding:3px;display:inline-flex}.af-tabs [role=tab]{box-sizing:border-box;border-radius:max(0px, calc(var(--k-radius) - 2px));height:calc(100% - 1px);color:var(--k-tab-fg);box-shadow:var(--k-tab-shadow);font:inherit;white-space:nowrap;cursor:default;background-color:#0000;border:1px solid #0000;outline:none;flex:1;justify-content:center;align-items:center;gap:6px;padding:4px 8px;font-size:14px;font-weight:500;line-height:20px;transition:background-color .1s cubic-bezier(.2,0,0,1),border-color .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1),opacity .1s cubic-bezier(.2,0,0,1);display:inline-flex;position:relative}.af-tabs [role=tab] svg{pointer-events:none;flex:none;width:16px;height:16px}@media (hover:hover){.af-tabs [role=tab]:not(:disabled,[aria-disabled=true]):hover{color:var(--k-fg)}}.af-tabs [role=tab][aria-selected=true]{--k-tab-shadow:0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a;color:var(--k-fg);border-color:color-mix(in oklab, var(--k-input) calc(var(--k-dark,0) * 100%), transparent);background-color:color-mix(in oklab, color-mix(in oklab, var(--k-input) 30%, transparent) calc(var(--k-dark,0) * 100%), var(--k-bg))}.af-tabs [role=tab]:focus-visible{border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-tab-ring), var(--k-tab-shadow);outline-width:1px;outline-style:solid;outline-color:var(--k-focus-border)}.af-tabs [role=tab][aria-selected=true]:focus-visible{border-color:color-mix(in oklab, var(--k-input) calc(var(--k-dark,0) * 100%), var(--k-focus-border))}.af-tabs [role=tab]:disabled{pointer-events:none;opacity:.5}.af-tabs [role=tab][aria-disabled=true]{opacity:.5;cursor:not-allowed}.af-tabs.line{background-color:#0000;border-radius:0;gap:4px}.af-tabs.line [role=tab],.af-tabs.line [role=tab][aria-selected=true]{--k-tab-shadow:0 0 0 0 transparent;background-color:#0000;border-color:#0000}.af-tabs.line [role=tab][aria-selected=true]{color:var(--k-tab-line-fg)}.af-tabs.line [role=tab]:focus-visible{border-color:var(--k-focus-border)}.af-tabs.line [role=tab][aria-selected=true]:focus-visible{border-color:color-mix(in oklab, transparent calc(var(--k-dark,0) * 100%), var(--k-focus-border))}.af-tabs.line [role=tab]:after{content:\"\";background-color:var(--k-tab-line);opacity:0;height:2px;transition:opacity .1s cubic-bezier(.2,0,0,1);position:absolute;bottom:-5px;left:0;right:0}.af-tabs.line [role=tab][aria-selected=true]:after{opacity:1}.af-tabs.segmented{box-sizing:content-box;border-radius:max(0px, calc(var(--k-radius) - 2px));width:auto;height:auto;color:inherit;background:color-mix(in oklab, var(--k-bg) 94%, var(--k-fg));border:0;justify-content:normal;align-items:normal;gap:2px;padding:2px;display:inline-flex}.af-tabs.segmented [role=tab]{height:28px;box-shadow:none;border-radius:max(0px, calc(var(--k-radius) - 4px));color:var(--k-muted);white-space:nowrap;cursor:pointer;background:0 0;border:0;flex:0 auto;justify-content:normal;align-items:center;gap:6px;padding:0 12px;font-size:12px;font-weight:500;line-height:18px;display:inline-flex;position:static}.af-tabs.segmented [role=tab]:active{background:var(--k-press);transition:none}@media (hover:hover){.af-tabs.segmented [role=tab]:hover{background:color-mix(in oklab, var(--k-fg) 5%, transparent);color:var(--k-fg)}}.af-tabs.segmented [role=tab][aria-selected=true]{color:var(--k-fg);background:var(--k-surface);box-shadow:0 1px 2px #0f172a0f}.af-tabs.segmented [role=tab]:focus-visible,.af-tabs.segmented [role=tab][aria-selected=true]:focus-visible{box-shadow:0 0 0 3px var(--k-tab-ring), 0 1px 2px #0f172a0f}.af-skeleton{border-radius:var(--k-radius);background:linear-gradient(90deg, color-mix(in oklab, var(--k-fg) 6%, transparent), color-mix(in oklab, var(--k-fg) 10%, transparent), color-mix(in oklab, var(--k-fg) 6%, transparent));background-size:200% 100%;min-height:12px;animation:1.2s linear infinite af-shimmer}.af-skeleton.row{border-radius:max(0px, calc(var(--k-radius) - 2px));height:40px}.af-skeleton.card{height:96px}.af-skeleton.column{height:320px}.af-skeleton.block{height:160px}@keyframes af-shimmer{to{background-position:-200% 0}}.af-spinner{vertical-align:middle;background:conic-gradient(from 90deg, currentColor 0 284.5deg, transparent 0);flex:none;width:16px;height:16px;animation:1s linear infinite af-spin;display:inline-block;-webkit-mask:radial-gradient(closest-side,#0000 66.66%,#000 0 83.33%,#0000 0);mask:radial-gradient(closest-side,#0000 66.66%,#000 0 83.33%,#0000 0)}@keyframes af-spin{to{transform:rotate(360deg)}}.af-banner{box-sizing:border-box;border:1px solid var(--k-line);border-radius:var(--k-radius);background:var(--k-surface);width:100%;color:var(--k-fg);grid-template-columns:1fr;align-items:start;row-gap:2px;padding:12px 16px;font-size:14px;line-height:20px;display:grid;position:relative}.af-banner:has(>svg){grid-template-columns:16px 1fr;column-gap:12px}.af-banner>svg{color:currentColor;width:16px;height:16px;translate:0 2px}.af-banner:has(>svg)>:not(svg){grid-column:2}.af-banner-title{-webkit-line-clamp:1;line-clamp:1;letter-spacing:-.025em;-webkit-box-orient:vertical;min-height:16px;font-weight:500;display:-webkit-box;overflow:hidden}.af-banner-description{color:var(--k-muted);justify-items:start;gap:4px;display:grid}.af-banner.info{border-color:color-mix(in oklab, var(--k-info) 30%, var(--k-line));background:color-mix(in oklab, var(--k-info) 12%, var(--k-surface))}.af-banner.success{border-color:color-mix(in oklab, var(--k-success) 30%, var(--k-line));background:color-mix(in oklab, var(--k-success) 12%, var(--k-surface))}.af-banner.warning{border-color:color-mix(in oklab, var(--k-warning) 35%, var(--k-line));background:color-mix(in oklab, var(--k-warning) 14%, var(--k-surface))}.af-banner.danger{color:var(--k-danger)}.af-banner.danger .af-banner-description{color:color-mix(in oklab, var(--k-danger) 90%, transparent)}.af-empty{box-sizing:border-box;text-align:center;flex-direction:column;justify-content:center;align-items:center;gap:8px;padding:40px 16px;display:flex}.af-empty>svg{width:28px;height:28px;color:var(--k-muted);opacity:.5;flex:none}.af-empty-title{color:var(--k-fg);margin:0;font-size:14px;font-weight:500;line-height:20px}.af-empty-body{max-width:28rem;color:var(--k-muted);margin:0;font-size:12.5px;line-height:1.5}.af-empty>.af-button{margin-top:4px}.af-empty.boxed{border-style:dashed;border-width:2px;border-color:var(--k-line);border-radius:calc(var(--k-radius) + 4px);background-color:var(--k-surface);padding:48px}.af-empty.boxed>svg{opacity:.6;width:32px;height:32px}.af-empty.boxed>svg+.af-empty-title{margin-top:4px}.af-empty.boxed>.af-empty-title+.af-empty-body{margin-top:-4px}.af-empty.boxed>.af-button{margin-top:8px}.af-error{box-sizing:border-box;text-align:center;flex-direction:column;gap:16px;width:100%;max-width:28rem;margin-inline:auto;padding:24px;display:flex}.af-error-icon{background-color:color-mix(in oklab, var(--k-danger) 10%, var(--k-surface));width:44px;height:44px;color:var(--k-danger);border-radius:3.40282e38px;flex:none;align-self:center;place-items:center;display:grid}.af-error-icon>svg{width:20px;height:20px}.af-error-title{color:var(--k-fg);margin:0;font-size:16px;font-weight:600;line-height:24px}.af-error-body{color:var(--k-muted);margin:0;font-size:14px;line-height:20px}.af-error-title+.af-error-body{margin-top:-10px}.af-error-actions{justify-content:center;align-items:center;gap:8px;display:flex}.af-error-details{text-align:start}.af-error-details>summary{color:var(--k-muted);cursor:pointer;text-align:center;font-size:12px;line-height:16px;transition:color .1s cubic-bezier(.2,0,0,1)}@media (hover:hover){.af-error-details>summary:hover{color:var(--k-fg)}}.af-error-details af-scroll-area{border-radius:max(0px, calc(var(--k-radius) - 2px));max-height:192px;margin-top:8px}.af-error-details pre{border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-muted-bg);color:var(--k-fg);font-family:var(--af-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);overflow-wrap:break-word;white-space:pre-wrap;text-align:start;margin:0;padding:10px;font-size:11px;line-height:1.5}.af-repeater{flex-direction:column;gap:8px;display:flex}.af-repeater>.af-button{align-self:flex-start}.af-repeater-row{box-sizing:border-box;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);flex-direction:column;gap:8px;padding:12px;display:flex;box-shadow:0 1px 2px #0000000d}.af-repeater-row[data-dragging]{z-index:10;opacity:.8;position:relative}.af-repeater-head{color:var(--k-muted);align-items:center;gap:4px;font-size:11px;font-weight:500;line-height:1.5;display:flex}.af-repeater-head>.af-drag-handle{margin:-2px}.af-repeater-remove{color:var(--k-danger);font:inherit;background:0 0;border:0;border-radius:2px;outline:none;margin:0 0 0 auto;padding:0;font-weight:400}@media (hover:hover){.af-repeater-remove:hover{text-decoration-line:underline}}.af-repeater-remove:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-repeater-fields{grid-template-columns:repeat(var(--af-repeater-columns,1), minmax(0, 1fr));gap:12px;display:grid}.af-repeater-empty{border:1px dashed var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);color:var(--k-muted);margin:0;padding:12px;font-size:11.5px;font-style:italic;line-height:1.5}.af-drag-handle{box-sizing:border-box;color:var(--k-muted);cursor:grab;touch-action:none;background:0 0;border:0;border-radius:4px;outline:none;flex:none;justify-content:center;align-items:center;margin:0;padding:2px;transition:color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1);display:inline-flex}.af-drag-handle>svg{width:14px;height:14px;display:block}@media (hover:hover){.af-drag-handle:hover{color:var(--k-fg)}}.af-drag-handle:active,.af-drag-handle[aria-pressed=true]{cursor:grabbing}.af-drag-handle:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-repeater-row.line{grid-template-columns:auto minmax(0,1fr) auto;grid-auto-flow:dense;align-items:start;gap:8px 0;padding:8px;display:grid}.af-repeater-row.line>*{grid-column:2;min-width:0}.af-repeater-row.line>.af-drag-handle{border-radius:max(0px, calc(var(--k-radius) - 2px));grid-column:1;width:24px;height:24px;margin-inline-end:8px;padding:0}@media (hover:hover){.af-repeater-row.line>.af-drag-handle:hover{background-color:color-mix(in oklab, var(--k-accent) calc(100% - var(--k-dark,0) * 50%), transparent);color:var(--k-accent-fg)}}.af-repeater-row.line>:is(.af-button,.af-repeater-remove){grid-column:3;margin-inline-start:8px}.af-file-chip{box-sizing:border-box;border:1px solid var(--k-line);background-color:var(--k-muted-bg);min-width:0;max-width:240px;color:var(--k-muted);border-radius:3.40282e38px;align-items:center;gap:4px;padding:2px 6px;font-size:10.5px;line-height:1.5;display:inline-flex}.af-file-chip>svg{flex:none;width:12px;height:12px}.af-file-chip-name{min-width:0;color:inherit;font:inherit;text-align:start;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;background:0 0;border:0;outline:none;margin:0;padding:0;overflow:hidden}@media (hover:hover){.af-file-chip-name:hover{text-decoration-line:underline}}.af-file-chip-download{color:var(--k-muted);border-radius:4px;outline:none;flex:none;transition:color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1);display:inline-flex}.af-file-chip-download>svg{width:12px;height:12px}@media (hover:hover){.af-file-chip-download:hover{color:var(--k-fg)}}.af-file-chip-name:focus-visible,.af-file-chip-download:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring);border-radius:4px}.af-file-chip[data-unresolved] .af-file-chip-name,.af-file-chip-name[data-unresolved]{cursor:default;pointer-events:none;text-decoration-line:none}:where(.af-table){--af-table-head:35.75px}:where(.af-table:has(thead .check)){--af-table-head:36px}:where(.af-table.compact){--af-table-head:27.75px}:where(.af-table.compact:has(thead .check)){--af-table-head:28px}.af-table{--k-head-bg:color-mix(in oklab, var(--k-muted-bg) 70%, var(--k-surface));--k-group-bg:color-mix(in oklab, var(--k-muted-bg) 60%, var(--k-surface));box-sizing:border-box;border-collapse:collapse;width:100%;font-size:12.5px;line-height:1.5}.af-table th,.af-table td{box-sizing:border-box;white-space:nowrap;text-align:start;padding:8px 12px}.af-table.compact th,.af-table.compact td{padding-block:4px}.af-table th{font-weight:500}.af-table td{vertical-align:middle}.af-table td,.af-table tbody>tr>th{background-color:var(--k-row-bg,transparent)}.af-table th.check,.af-table td.check{width:36px}.af-table th>.af-checkbox,.af-table td>.af-checkbox{vertical-align:-1px}.af-table .num{text-align:end;font-variant-numeric:tabular-nums}.af-table thead tr{border-bottom:1px solid var(--k-line);background-color:var(--k-head-bg);color:var(--k-muted);text-align:start}.af-table tbody>tr{border-bottom:1px solid var(--k-line)}.af-table tbody:last-of-type>tr:last-child:not(.af-table-group-header,.af-table-more,.af-table-loading){border-bottom-width:0}.af-table tbody>tr[data-tone=ok]{--k-row-bg:color-mix(in oklab, var(--k-success) 8%, var(--k-surface))}.af-table tbody>tr[data-tone=warn]{--k-row-bg:color-mix(in oklab, var(--k-warning) 8%, var(--k-surface))}.af-table tbody>tr[data-tone=danger]{--k-row-bg:color-mix(in oklab, var(--k-danger) 10%, var(--k-surface))}.af-table tbody>tr:focus-within{--k-row-bg:var(--k-hover)}@media (hover:hover){.af-table tbody>tr:hover{--k-row-bg:var(--k-hover)}}.af-table tbody>tr[aria-selected=true]{--k-row-bg:color-mix(in oklab, var(--k-primary) 8%, var(--k-surface))}@media (hover:hover){.af-table tbody>tr[aria-selected=true]:hover{--k-row-bg:color-mix(in oklab, var(--k-primary) 12%, var(--k-surface))}}.af-table tbody>tr.af-table-group-header{--k-row-bg:var(--k-group-bg)}.af-table tbody>tr:is(.af-table-more,.af-table-loading,.af-table-empty){--k-row-bg:initial}.af-table-sort{color:inherit;font:inherit;cursor:pointer;background:0 0;border:0;border-radius:4px;outline:none;align-items:center;gap:4px;margin:0;padding:0;display:inline-flex}.af-table-sort svg{opacity:0;flex:none;width:12px;height:12px;transition:opacity .1s cubic-bezier(.2,0,0,1),transform .1s cubic-bezier(.2,0,0,1)}.af-table-sort:focus-visible svg,.af-table th:is([aria-sort=ascending],[aria-sort=descending]) .af-table-sort svg{opacity:1}@media (hover:hover){.af-table th:hover .af-table-sort svg{opacity:1}}@media (hover:none){.af-table-sort svg{opacity:.5}}.af-table th[aria-sort=descending] .af-table-sort svg{transform:rotate(180deg)}.af-table-sort:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-table .af-table-group-header{color:var(--k-fg)}.af-table .af-table-group-header>th{padding:0}.af-table-group-row{box-sizing:border-box;align-items:center;gap:12px;padding:6px 12px;padding-inline-start:calc(12px + var(--af-table-depth,0) * 16px);display:flex}.af-table-group-toggle{color:inherit;font:inherit;cursor:pointer;background:0 0;border:0;border-radius:4px;outline:none;align-items:center;gap:6px;margin:0;padding:0;display:inline-flex}.af-table-group-toggle svg{width:14px;height:14px;color:var(--k-muted);flex:none;transition:transform .1s cubic-bezier(.2,0,0,1)}.af-table-group-toggle[aria-expanded=true] svg{transform:rotate(90deg)}.af-table-group-toggle:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-table-group-count{background-color:color-mix(in oklab, var(--k-fg) 7%, var(--k-surface));color:var(--k-muted);border-radius:3.40282e38px;padding:0 6px;font-size:11px}.af-table-group-toggle+.af-table-group-count{margin-inline-start:-6px}.af-table-group-actions{align-items:center;gap:8px;margin-inline-start:auto;display:flex}.af-table-group[data-collapsed]>tr:not(.af-table-group-header){display:none}.af-table-group[data-empty]>.af-table-group-header{--k-row-bg:color-mix(in oklab, var(--k-group-bg) 60%, var(--k-surface))}.af-table-group[data-empty] .af-table-group-row{opacity:.6}.af-table-group[data-empty] .af-table-group-actions{pointer-events:none}.af-table .af-table-more>td,.af-table .af-table-loading>td{color:var(--k-muted);padding:8px 12px;font-size:12px}.af-table .af-table-empty>td{padding:0}.af-table.sticky{border-collapse:separate;border-spacing:0}.af-table.sticky :is(th,td){border-bottom:1px solid var(--k-line)}.af-table.sticky tbody:last-of-type>tr:last-child:not(.af-table-group-header,.af-table-more,.af-table-loading)>:is(th,td){border-bottom-width:0}.af-table.sticky thead th{z-index:3;background-color:var(--k-head-bg);position:sticky;top:0}.af-table.sticky thead th:first-child{z-index:4;inset-inline-start:0}.af-table.sticky tbody>tr:not(.af-table-group-header,.af-table-more,.af-table-loading,.af-table-empty)>:first-child{z-index:1;background-color:var(--k-row-bg,var(--k-surface));position:sticky;inset-inline-start:0}.af-table.sticky .af-table-group-header>th{top:var(--af-table-head,35.75px);z-index:2;position:sticky}.af-breadcrumb{font-size:11.5px;line-height:1.5}.af-breadcrumb ol{flex-wrap:wrap;align-items:center;gap:4px;margin:0;padding:0;list-style:none;display:flex}.af-breadcrumb li{color:var(--k-fg);align-items:center;gap:4px;display:flex}.af-breadcrumb li+li:before{--k-chevron:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E\");content:\"\";background-color:color-mix(in oklab, var(--k-muted) 60%, transparent);width:12px;height:12px;-webkit-mask:var(--k-chevron) center / contain no-repeat;-webkit-mask:var(--k-chevron) center / contain no-repeat;mask:var(--k-chevron) center / contain no-repeat;flex:none}.af-breadcrumb li+li:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)):before{transform:scaleX(-1)}.af-breadcrumb a{color:var(--k-muted);border-radius:2px;outline:none;text-decoration:none}.af-breadcrumb [aria-current=page]{color:var(--k-fg)}@media (hover:hover){.af-breadcrumb a:hover{color:var(--k-fg)}}.af-breadcrumb a:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-breadcrumb.eyebrow{letter-spacing:.05em;text-transform:uppercase;font-size:11px;font-weight:600}.af-disclosure{grid-template-columns:minmax(0,auto) minmax(0,1fr);align-items:center;column-gap:8px;display:grid}.af-disclosure:after{content:\"\";background-color:color-mix(in oklab, var(--k-line) 80%, transparent);grid-area:1/2;height:1px}.af-disclosure-toggle{min-width:0;color:var(--k-fg);cursor:pointer;font:inherit;letter-spacing:-.025em;background:0 0;border:0;border-radius:4px;outline:none;grid-area:1/1;align-items:center;gap:6px;margin:0;padding:0;font-size:12.5px;font-weight:600;line-height:1.5;display:flex}.af-disclosure-toggle>span{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.af-disclosure-toggle>svg{width:14px;height:14px;color:var(--k-muted);flex:none;transition:color .1s cubic-bezier(.2,0,0,1),transform .1s cubic-bezier(.2,0,0,1)}@media (hover:hover){.af-disclosure-toggle:hover>svg{color:var(--k-fg)}}.af-disclosure-toggle:is(:lang(ae),:lang(ar),:lang(arc),:lang(bcc),:lang(bqi),:lang(ckb),:lang(dv),:lang(fa),:lang(glk),:lang(he),:lang(ku),:lang(mzn),:lang(nqo),:lang(pnb),:lang(ps),:lang(sd),:lang(ug),:lang(ur),:lang(yi)):not([aria-expanded=true])>svg{transform:scaleX(-1)}.af-disclosure-toggle[aria-expanded=true]>svg{transform:rotate(90deg)}.af-disclosure-toggle:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-disclosure-body{grid-area:2/1/auto/-1;min-width:0;margin-top:12px}.af-disclosure-toggle[aria-expanded=false]+.af-disclosure-body{display:none}.af-disclosure.eyebrow:after{background-color:var(--k-line)}.af-disclosure.eyebrow .af-disclosure-toggle{color:var(--k-muted);letter-spacing:.05em;text-transform:uppercase;font-size:10.5px}.af-disclosure.eyebrow .af-disclosure-toggle>svg{width:12px;height:12px}.af-dl{grid-template-columns:repeat(var(--af-dl-columns,1), minmax(0, 1fr));gap:16px 40px;margin:0;display:grid}.af-dl-item{grid-column:span var(--af-dl-span,1);min-width:0}.af-dl dt{color:var(--k-muted);letter-spacing:.05em;text-transform:uppercase;align-items:center;gap:6px;margin:0;font-size:10.5px;font-weight:500;line-height:1.5;display:flex}.af-dl dd{color:var(--k-fg);margin:4px 0 0;font-size:13.5px;font-weight:500;line-height:1.5}.af-dl dd>af-copy-button{margin-block:-4px;margin-inline-start:4px;transition:opacity .1s cubic-bezier(.2,0,0,1)}@media (hover:hover){.af-dl-item:not(:hover,:focus-within) af-copy-button{opacity:0}}.af-stat{box-sizing:border-box;border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-muted-bg);min-width:0;padding:12px 14px}.af-stat-label{color:var(--k-muted);text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:600;line-height:1.5;overflow:hidden}.af-stat-dot{vertical-align:top;background-color:var(--af-stat-color,var(--k-muted));border-radius:3.40282e38px;width:6px;height:6px;margin:4px 6px 0 0;display:inline-block}.af-stat-value{color:var(--k-fg);font-variant-numeric:tabular-nums;margin-top:4px;font-size:24px;font-weight:600;line-height:32px}.af-stat-value[data-tone=success]{color:var(--k-success)}.af-stat-value[data-tone=warning]{color:var(--k-warning)}.af-stat-value[data-tone=danger]{color:var(--k-danger)}.af-stat-value[data-tone=info]{color:var(--k-info)}.af-stat-note{color:var(--k-muted);margin-top:2px;font-size:11px;line-height:1.5}.af-stat.plain{background:0 0;border-radius:0;padding:0}.af-stat.plain .af-stat-label{letter-spacing:.05em;text-transform:uppercase;font-size:10.5px}.af-stat.plain .af-stat-value{letter-spacing:-.025em;font-size:21px;line-height:1.25}.af-timeline{--k-timeline-neutral:color-mix(in oklab, var(--k-fg) 20%, var(--k-surface));margin:0;padding:0;list-style:none}.af-timeline-item{gap:12px;padding-bottom:16px;display:flex;position:relative}.af-timeline-item:last-child{padding-bottom:0}.af-timeline-item:not(:last-child):before{content:\"\";top:16px;background-color:color-mix(in oklab, var(--k-timeline-neutral) 80%, transparent);width:1px;height:100%;position:absolute;inset-inline-start:7px}.af-timeline-item[data-kind=person]{--k-kind:var(--k-info)}.af-timeline-item[data-kind=agent]{--k-kind:var(--k-primary)}.af-timeline-item[data-kind=system]{--k-kind:var(--k-muted)}.af-timeline-item[data-kind=admin]{--k-kind:var(--k-warning)}.af-timeline-item[data-kind=api]{--k-kind:var(--k-success)}.af-timeline-dot{z-index:1;box-sizing:border-box;margin:3px 0 0;background-color:var(--k-kind,var(--k-timeline-neutral));width:11px;height:11px;box-shadow:0 0 0 3px var(--k-surface);border-radius:3.40282e38px;flex:none;margin-inline-start:2px;position:relative}.af-timeline:not(.icons) .af-timeline-dot>svg{display:none}.af-timeline-body{flex:1;min-width:0;margin-top:-2px}.af-timeline-text{color:var(--k-muted);font-size:12.5px;line-height:1.375}.af-timeline-text :is(b,strong){color:var(--k-fg);font-weight:500}.af-timeline-time{color:var(--k-muted);margin-top:2px;font-size:11px;line-height:1.5;display:block}.af-timeline.icons .af-timeline-item:not(:last-child):before{top:34px;bottom:2px;height:auto;inset-inline-start:13px}.af-timeline.icons .af-timeline-dot{border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, var(--k-kind,var(--k-muted)) 12%, var(--k-surface));width:28px;height:28px;box-shadow:none;color:var(--k-kind,var(--k-muted));justify-content:center;align-items:center;margin:2px 0 0;display:flex}.af-timeline.icons .af-timeline-dot>svg{flex:none;width:14px;height:14px}.af-timeline.icons .af-timeline-body{margin-top:0}.af-steps{margin:0;padding:0;list-style:none;display:flex}.af-step{text-align:center;flex-direction:column;flex:1;align-items:center;gap:6px;min-width:0;display:flex;position:relative}.af-step:not(:first-child):before{content:\"\";top:12px;background-color:var(--k-line);height:1px;position:absolute;inset-inline:calc(16px - 50%) calc(50% + 16px)}.af-step[data-state=done]+.af-step:before{background-color:var(--k-primary)}.af-step-marker{box-sizing:border-box;border:1px solid var(--k-line);width:24px;height:24px;color:var(--k-muted);border-radius:3.40282e38px;flex:none;place-items:center;font-size:12px;font-weight:500;line-height:1;display:grid}.af-step-marker>svg{width:14px;height:14px}.af-step-label{color:var(--k-fg);font-size:12px;line-height:1.5}.af-step[data-state=done] .af-step-marker{border-color:var(--k-primary);background-color:var(--k-primary);color:var(--k-primary-fg)}.af-step:is([data-state=current],[aria-current=step]) .af-step-marker{border-width:2px;border-color:var(--k-primary);color:var(--k-primary)}.af-step[data-state=failed] .af-step-marker{border-color:var(--k-danger);background-color:var(--k-danger);color:#fff}.af-step[data-state=todo] .af-step-label{color:var(--k-muted)}.af-toolbar{flex-wrap:wrap;align-items:center;gap:8px;display:flex}.af-toolbar-lead{flex:1;align-items:center;gap:8px;min-width:0;display:flex}.af-toolbar-divider{background-color:var(--k-line);flex:none;width:1px;height:16px}.af-toolbar-trail{flex:none;align-items:center;gap:4px;margin-inline-start:auto;display:flex}.af-card-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;display:grid}.af-card{--k-card-line:var(--k-line);--k-card-bg:var(--k-surface);box-sizing:border-box;border:1px solid var(--k-card-line);border-radius:var(--k-radius);background-color:var(--k-card-bg);min-width:0;color:var(--k-fg);padding:10px;transition:border-color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1);position:relative;box-shadow:0 1px 3px #0000001a,0 1px 2px -1px #0000001a}.af-card.compact{padding:6px}.af-card[data-tone=ok]{--k-card-bg:color-mix(in oklab, var(--k-success) 8%, var(--k-surface))}.af-card[data-tone=warn]{--k-card-bg:color-mix(in oklab, var(--k-warning) 8%, var(--k-surface))}.af-card[data-tone=danger]{--k-card-bg:color-mix(in oklab, var(--k-danger) 10%, var(--k-surface))}@media (hover:hover){.af-card:hover{--k-card-line:color-mix(in oklab, var(--k-fg) 8%, var(--k-line))}}.af-card[aria-selected=true]{--k-card-line:color-mix(in oklab, var(--k-primary) 40%, var(--k-surface));--k-card-bg:color-mix(in oklab, var(--k-primary) 6%, var(--k-surface))}.af-card:has(>.af-card-link:focus-visible){border-color:var(--k-focus-border);box-shadow:0 0 0 3px var(--k-focus-ring), 0 1px 3px 0 #0000001a, 0 1px 2px -1px #0000001a}.af-card-link{z-index:1;border-radius:inherit;outline:none;position:absolute;inset:0}.af-checkbox.af-card-check{z-index:2;background-color:var(--k-surface);opacity:0;transition:opacity .1s cubic-bezier(.2,0,0,1),background-color .1s cubic-bezier(.2,0,0,1),border-color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1),color .1s cubic-bezier(.2,0,0,1);position:absolute;inset-block-start:8px;inset-inline-end:6px}.af-card-check:focus-visible,.af-card-check:checked{opacity:1}@media (hover:hover){.af-card:hover .af-card-check{opacity:1}}@media (hover:none){.af-checkbox.af-card-check{opacity:1}}.af-card-media{box-sizing:border-box;aspect-ratio:16/9;border:1px solid var(--k-line);border-radius:var(--k-radius);background-color:var(--k-muted-bg);color:var(--k-muted);justify-content:center;align-items:center;display:flex;position:relative;overflow:hidden}.af-card-media>svg{flex:none;width:24px;height:24px}.af-card-media>img{object-fit:cover;width:100%;height:100%;display:block;position:absolute;inset:0}.af-card-title{color:var(--k-fg);margin:0;font-size:12.5px;font-weight:600;line-height:1.375}.af-card-media+.af-card-title{margin-top:8px}.af-card-rows{color:var(--k-muted);font-variant-numeric:tabular-nums;flex-direction:column;gap:4px;margin:6px 0 0;padding:0;font-size:11px;line-height:1.5;display:flex}.af-card-row{align-items:center;gap:6px;display:flex}.af-card-row dt{color:color-mix(in oklab, var(--k-muted) 70%, transparent)}.af-card-row dd{margin:0}.af-board{gap:12px;padding-bottom:8px;display:flex}.af-board-column{box-sizing:border-box;border:1px solid var(--k-line);border-radius:calc(var(--k-radius) + 4px);background-color:color-mix(in oklab, var(--k-muted-bg) 60%, transparent);flex-direction:column;flex:none;width:256px;padding:8px;display:flex}.af-board-column.compact{width:224px}.af-board-column.dashed{background-color:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);border-style:dashed}.af-board-column>af-scroll-area{flex:0 auto;min-height:0;margin:-4px}.af-board-column-header{justify-content:space-between;align-items:center;padding:0 4px 8px;display:flex}.af-board-column-title{color:var(--k-fg);align-items:center;gap:6px;margin:0;font-size:12px;font-weight:500;line-height:1.5;display:flex}.af-board-column.dashed .af-board-column-title{color:var(--k-muted)}.af-board-dot{background-color:var(--af-option-color,var(--k-muted));border-radius:3.40282e38px;flex:none;width:8px;height:8px}.af-board-count{background-color:var(--k-surface);color:var(--k-muted);border-radius:3.40282e38px;padding:0 6px;font-size:10px;line-height:1.5}.af-board-cards{flex-direction:column;gap:6px;padding:4px;display:flex}.af-board-empty{color:var(--k-muted);margin:0;padding:8px 4px;font-size:11px;line-height:1.5}.af-list{outline:none;margin:0;padding:0;list-style:none}.af-list:focus-visible{box-shadow:inset 0 0 0 1px var(--k-focus-border)}.af-list-row{box-sizing:border-box;border-bottom:1px solid var(--k-line);width:100%;color:var(--k-fg);text-align:start;align-items:center;gap:8px;padding:8px 12px;font-size:12.5px;line-height:1.5;transition:background-color .1s cubic-bezier(.2,0,0,1);display:flex;position:relative}.af-list-row:last-child{border-bottom-width:0}.af-list-row.compact{padding-block:6px}.af-list-row[data-active]{background-color:var(--k-hover)}@media (hover:hover){.af-list-row:hover{background-color:var(--k-hover)}}.af-list-row[aria-selected=true],.af-list-row[aria-current=true]{background-color:color-mix(in oklab, var(--k-primary) 6%, var(--k-surface))}.af-list-row[aria-selected=true]:before,.af-list-row[aria-current=true]:before{content:\"\";z-index:1;background-color:var(--k-primary);border-start-end-radius:4px;border-end-end-radius:4px;width:3px;position:absolute;inset-block:6px;inset-inline-start:0}.af-cal{box-sizing:border-box;border:1px solid var(--k-line);border-radius:calc(var(--k-radius) + 4px);background-color:var(--k-surface);color:var(--k-fg);overflow:hidden;box-shadow:0 1px 3px #0000001a,0 1px 2px -1px #0000001a}.af-cal-header{border-bottom:1px solid var(--k-line);flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px;display:flex}.af-cal-header>.af-tabs{margin-inline-start:auto}.af-cal-period{color:var(--k-fg);letter-spacing:-.025em;margin:0;font-size:13px;font-weight:600;line-height:1.5}.af-cal-weekdays{border-bottom:1px solid var(--k-line);background-color:color-mix(in oklab, var(--k-muted-bg) 80%, transparent);grid-template-columns:repeat(7,minmax(0,1fr));display:grid}.af-cal-weekdays>*{border-inline-end:1px solid var(--k-line);color:var(--k-muted);letter-spacing:.025em;text-transform:uppercase;padding:4px 8px;font-size:11px;font-weight:500;line-height:1.5}.af-cal-weekdays>:last-child{border-inline-end-width:0}.af-cal-grid{grid-template-columns:repeat(7,minmax(0,1fr));display:grid}.af-cal-day{--k-edge:1px;box-sizing:border-box;border-inline-end:var(--k-edge) solid var(--k-line);border-bottom:1px solid var(--k-line);background-color:var(--k-surface);min-width:0;min-height:116px;position:relative}.af-cal-grid>.af-cal-day:nth-child(7n){--k-edge:0px}.af-cal-grid>.af-cal-day:nth-last-child(-n+7){border-bottom-width:0}.af-cal-day.outside{background-color:color-mix(in oklab, var(--k-muted-bg) 70%, transparent)}.af-cal-day[aria-selected=true]{background-color:color-mix(in oklab, var(--k-primary) 5%, var(--k-surface));box-shadow:inset 0 0 0 1px color-mix(in oklab, var(--k-primary) 30%, transparent)}.af-cal-day-button{cursor:pointer;background:0 0;border:0;border-radius:0;outline:none;width:100%;height:100%;margin:0;padding:0;transition:background-color .1s cubic-bezier(.2,0,0,1);position:absolute;inset:0}@media (hover:hover){.af-cal-day-button:hover{background-color:color-mix(in oklab, var(--k-fg) 5%, transparent)}}.af-cal-day-button:focus-visible{box-shadow:inset 0 0 0 2px var(--k-focus-ring)}.af-cal-date{box-sizing:border-box;width:-moz-fit-content;width:fit-content;min-width:20px;height:20px;color:var(--k-fg);pointer-events:none;border-radius:3.40282e38px;justify-content:center;align-items:center;margin:4px 6px 0 auto;padding:0 4px;font-size:11px;font-weight:500;line-height:1.5;display:flex;position:relative}.af-cal-day.outside .af-cal-date{color:var(--k-muted)}.af-cal-day .af-cal-date.today{background-color:var(--k-primary);color:var(--k-primary-fg)}.af-cal-events{z-index:1;padding-inline:2px calc(2px - var(--k-edge,0px));pointer-events:none;gap:2px;display:grid;position:relative}.af-cal-events>*{pointer-events:auto}.af-cal-more{height:21px;color:var(--k-muted);font:inherit;text-align:start;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;background:0 0;border:0;border-radius:4px;outline:none;margin:0 2px;padding:0 4px;font-size:10.5px;line-height:1.5;overflow:hidden}@media (hover:hover){.af-cal-more:hover{color:var(--k-fg)}}.af-cal-more:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-cal-week,.af-cal-hours{grid-template-columns:56px repeat(7,minmax(0,1fr));display:grid}.af-cal-hours{grid-column:1/-1;grid-auto-rows:var(--af-cal-hour,48px)}.af-cal-allday-label{box-sizing:border-box;border-inline-end:1px solid var(--k-line);border-bottom:1px solid var(--k-line);color:var(--k-muted);letter-spacing:.025em;text-align:end;text-transform:uppercase;padding:4px 6px 0 0;font-size:10px;line-height:1.5}.af-cal-hour-label,.af-cal-hour{box-sizing:border-box;border-top:1px solid color-mix(in oklab, var(--k-line) 50%, transparent);border-inline-end:1px solid var(--k-line);min-width:0}.af-cal-hours>:nth-child(-n+8){border-top-width:0}.af-cal-hour-label{color:var(--k-muted);font-variant-numeric:tabular-nums;text-align:end;padding:2px 6px 0 0;font-size:10px;line-height:1.5}.af-cal-hour{position:relative}.af-cal-hours>:nth-child(8n){border-inline-end-width:0}.af-cal-week>.af-cal-day{min-height:26px}.af-cal-week>.af-cal-day:nth-child(8){--k-edge:0px}.af-cal-week>.af-cal-day>.af-cal-events{padding-block:2px}.af-event{--k-event:var(--af-option-color,var(--k-primary));box-sizing:border-box;border:1px solid color-mix(in oklab, var(--k-event) 30%, var(--k-surface));background-color:color-mix(in oklab, var(--k-event) 12%, var(--k-surface));min-width:0;height:19px;color:color-mix(in oklab, var(--k-event) 75%, var(--k-fg));white-space:nowrap;border-radius:4px;align-items:center;gap:4px;padding:0 6px;font-size:11px;line-height:17px;text-decoration:none;display:flex;overflow:hidden}.af-event.continues{border-inline-start-width:0;border-start-start-radius:0;border-end-start-radius:0}.af-event.continued{border-inline-end-width:0;border-start-end-radius:0;border-end-end-radius:0}.af-event-time{font-variant-numeric:tabular-nums;opacity:.7;flex:none}.af-event.block{z-index:1;height:auto;padding:0 1px;font-size:10.5px;line-height:1.25;display:block;position:absolute;inset-inline:0}.af-event.block>span{text-overflow:ellipsis;padding-inline:4px;display:block;overflow:hidden}.af-filter-bar{flex-direction:column;gap:8px;display:flex}.af-filter-row{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.af-filter-chip{box-sizing:border-box;background-color:var(--k-secondary);width:-moz-fit-content;width:fit-content;max-width:288px;height:24px;color:var(--k-secondary-fg);white-space:nowrap;border:1px solid #0000;border-radius:3.40282e38px;flex:none;justify-content:center;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:11.5px;font-weight:400;line-height:1.5;display:inline-flex}.af-filter-chip.preset{background-color:color-mix(in oklab, var(--k-primary) 8%, var(--k-surface));color:var(--k-primary);padding-inline-end:8px}.af-filter-chip.aside{border-style:dashed;border-color:var(--k-line);color:var(--k-muted);background-color:#0000;padding-inline-end:8px}.af-filter-chip-edit{min-width:0;color:inherit;font:inherit;text-align:start;text-overflow:ellipsis;white-space:nowrap;background:0 0;border:0;border-radius:4px;outline:none;margin:0;padding:0;overflow:hidden}button.af-filter-chip-edit{cursor:pointer}.af-filter-chip-field{opacity:.7}.af-filter-chip b{font-weight:500}.af-filter-chip-remove{color:inherit;opacity:.6;cursor:pointer;background:0 0;border:0;border-radius:4px;outline:none;flex:none;margin:0;padding:0;display:inline-flex}@media (hover:hover){.af-filter-chip-remove:hover{opacity:1}}.af-filter-chip-remove>svg{width:12px;height:12px;display:block}.af-filter-chip-edit:focus-visible,.af-filter-chip-remove:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-filter-clear{color:var(--k-muted);font:inherit;text-underline-offset:2px;cursor:pointer;background:0 0;border:0;border-radius:2px;outline:none;margin:0 0 0 2px;padding:0;font-size:11.5px;text-decoration:underline}@media (hover:hover){.af-filter-clear:hover{color:var(--k-fg)}}.af-filter-clear:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-search{box-sizing:border-box;flex:1;min-width:128px;display:block;position:relative}@media (min-width:40rem){.af-search{max-width:20rem}}.af-search>svg{width:14px;height:14px;color:var(--k-muted);pointer-events:none;position:absolute;inset-block-start:50%;inset-inline-start:10px;translate:0 -50%}.af-search>.af-input{background-color:color-mix(in oklab, var(--k-fc-fill) calc(var(--k-dark,0) * 100%), var(--k-surface));height:32px;padding-inline:32px 28px;font-size:12px;line-height:16px}@media (min-width:48rem){.af-search>.af-input{font-size:14px;line-height:20px}}.af-search.xs>.af-input{height:28px}.af-search>.af-input::-webkit-search-cancel-button{-webkit-appearance:none;display:none}.af-search-clear{width:20px;height:20px;color:var(--k-muted);cursor:pointer;background:0 0;border:0;border-radius:4px;outline:none;justify-content:center;align-items:center;margin:0;padding:0;display:inline-flex;position:absolute;inset-block-start:50%;inset-inline-end:4px;translate:0 -50%}.af-search-clear>svg{width:12px;height:12px;display:block}@media (hover:hover){.af-search-clear:hover{color:var(--k-fg)}}.af-search-clear:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}.af-search>.af-input:placeholder-shown~.af-search-clear{display:none}.af-facet-bar{box-sizing:border-box;flex-direction:column;flex:none;gap:16px;width:240px;display:flex}.af-facet{box-sizing:border-box;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);color:var(--k-fg);padding:12px}.af-facet-header{justify-content:space-between;align-items:center;margin-bottom:8px;display:flex}.af-facet-header>h3{margin:0;font-size:12px;font-weight:500;line-height:1.5}.af-facet-note{color:var(--k-warning);letter-spacing:.025em;text-transform:uppercase;font-size:10px;line-height:1.5}.af-facet>af-scroll-area{max-height:224px}.af-facet-list{grid-template-columns:minmax(0,1fr);gap:6px;margin:0;padding:0 8px 0 0;list-style:none;display:grid}.af-facet-option{align-items:center;gap:8px;display:flex}.af-facet-dot{background-color:var(--af-option-color,var(--k-muted));border-radius:3.40282e38px;flex:none;width:8px;height:8px}.af-facet-option>label{text-overflow:ellipsis;white-space:nowrap;cursor:pointer;flex:1;font-size:12px;line-height:1.5;overflow:hidden}.af-facet-option[data-zero]>label{color:var(--k-muted)}.af-facet-count{color:var(--k-muted);font-variant-numeric:tabular-nums;font-size:11px;line-height:1.5}.af-facet-stats{color:var(--k-muted);margin:6px 0 0;padding-top:4px;font-size:11px;line-height:1.5}.af-facet-more{color:var(--k-muted);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:4px;outline:none;align-items:center;margin:4px 0 0;padding:4px;font-size:11px;font-weight:500;line-height:1.5;display:inline-flex}@media (hover:hover){.af-facet-more:hover{color:var(--k-fg)}}.af-facet-more:focus-visible{box-shadow:0 0 0 3px var(--k-focus-ring)}button.af-chip{cursor:pointer;margin:0;font-family:inherit}@media (hover:hover){button.af-chip:not([aria-disabled=true],:disabled):hover{background-color:var(--k-chip-hover);color:var(--k-chip-hover-fg)}}.af-chip[aria-disabled=true],button.af-chip:disabled{opacity:.6;cursor:not-allowed}.af-chip.toggle{--k-chip-bg:transparent;--k-chip-fg:var(--k-muted);--k-chip-hover:var(--k-muted-bg);--k-chip-hover-fg:var(--k-fg);border-radius:max(0px, calc(var(--k-radius) - 2px));border-width:0;gap:6px;height:26px;padding:0 10px;font-size:12px;font-weight:500;line-height:1.5;transition:color .1s cubic-bezier(.2,0,0,1),background-color .1s cubic-bezier(.2,0,0,1),box-shadow .1s cubic-bezier(.2,0,0,1)}.af-chip.toggle[aria-pressed=true]{--k-chip-bg:color-mix(in oklab, var(--k-primary) 8%, var(--k-surface));--k-chip-fg:var(--k-primary);--k-chip-hover:var(--k-chip-bg);--k-chip-hover-fg:var(--k-chip-fg)}.af-chip.toggle.compact{height:22px;padding:0 8px;font-size:11.5px}.af-overlay{box-sizing:border-box;background-color:var(--k-popover);color:var(--k-popover-fg);border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));box-shadow:0 4px 6px -1px #0000001a,0 2px 4px -2px #0000001a}@media (prefers-reduced-motion:reduce){.af-skeleton,.af-spinner{animation:none}.af-button,.af-chip,.af-tabs [role=tab],.af-tabs.line [role=tab]:after,.af-input,.af-textarea,.af-checkbox,.af-radio,.af-switch,.af-switch:before,.af-toggle,.af-segmented>label>span{transition:none}.af-progress::-webkit-progress-value{transition:none}.af-error-details>summary,.af-drag-handle,.af-file-chip-download,.af-table-sort svg,.af-table-group-toggle svg,.af-disclosure-toggle>svg,.af-dl dd>af-copy-button,.af-card,.af-checkbox.af-card-check,.af-list-row,.af-cal-day-button,.af-chip.toggle{transition:none}}@media (forced-colors:active){.af-chip{border-color:buttontext}.af-chip:focus-visible,.af-tabs [role=tab]:focus-visible{outline-offset:2px;outline:2px solid}.af-tabs [role=tab][aria-selected=true]{forced-color-adjust:none;color:highlighttext;background-color:highlight;border-color:buttontext;outline-color:canvastext}.af-tabs.line [role=tab][aria-selected=true]{color:canvastext;background-color:#0000;border-color:#0000}.af-tabs.line [role=tab][aria-selected=true]:after{background-color:highlight}.af-drag-handle:focus-visible,.af-repeater-remove:focus-visible,.af-file-chip-name:focus-visible,.af-file-chip-download:focus-visible,.af-table-sort:focus-visible,.af-table-group-toggle:focus-visible{outline-offset:2px;outline:2px solid}.af-table tbody>tr[aria-selected=true]{outline-offset:-2px;outline:2px solid highlight}.af-breadcrumb a:focus-visible,.af-disclosure-toggle:focus-visible{outline-offset:2px;outline:2px solid}.af-breadcrumb li+li:before,.af-disclosure:after,.af-disclosure.eyebrow:after,.af-timeline-item:not(:last-child):before,.af-step:not(:first-child):before,.af-stat-dot{forced-color-adjust:none;background-color:canvastext}.af-step[data-state=done]+.af-step:before{background-color:highlight}.af-timeline-dot{forced-color-adjust:none;background-color:canvastext;outline:1px solid canvastext}.af-timeline.icons .af-timeline-dot{color:canvastext;background-color:canvas}.af-step[data-state=done] .af-step-marker{forced-color-adjust:none;color:highlighttext;background-color:highlight;border-color:highlight}.af-step:is([data-state=current],[aria-current=step]) .af-step-marker{border-color:highlight}.af-step[data-state=failed] .af-step-marker{forced-color-adjust:none;color:canvastext;outline-offset:-4px;background-color:canvas;border-color:canvastext;outline:2px solid canvastext}.af-card-link:focus-visible,.af-cal-day-button:focus-visible,.af-cal-more:focus-visible{outline-offset:2px;outline:2px solid}.af-list:focus-visible{outline-offset:-2px;outline:2px solid}.af-list-row[data-active]{outline-offset:-2px;outline:1px dashed canvastext}.af-card[aria-selected=true]{border-color:highlight}.af-list-row[aria-selected=true]:before,.af-list-row[aria-current=true]:before{forced-color-adjust:none;background-color:highlight}.af-cal-day[aria-selected=true]{outline-offset:-2px;outline:2px solid highlight}.af-cal-date.today{forced-color-adjust:none;color:highlighttext;background-color:highlight}.af-board-dot,.af-toolbar-divider,.af-facet-dot{forced-color-adjust:none;background-color:canvastext}.af-filter-chip{border-color:buttontext}.af-filter-chip-edit:focus-visible,.af-filter-chip-remove:focus-visible,.af-filter-clear:focus-visible,.af-search-clear:focus-visible,.af-facet-more:focus-visible{outline-offset:2px;outline:2px solid}.af-chip.toggle{outline-offset:-1px;outline:1px solid buttontext}.af-chip.toggle[aria-pressed=true]{forced-color-adjust:none;color:highlighttext;background-color:highlight;outline-color:highlight}@media (hover:hover){.af-chip.toggle[aria-pressed=true]:hover{color:highlighttext;background-color:highlight}}.af-chip.toggle:focus-visible{outline-offset:2px;outline:2px solid canvastext}.af-spinner{forced-color-adjust:none}.af-progress{forced-color-adjust:none;outline-offset:-1px;background-color:canvas;outline:1px solid graytext}.af-progress::-webkit-progress-value{background-color:highlight}.af-progress::-moz-progress-bar{background-color:highlight}.af-progress.circular{background:conic-gradient(Highlight calc(clamp(0, var(--af-progress,0), 1) * 1turn), GrayText 0);outline:0}.af-progress.circular::-webkit-progress-value{background:0 0}.af-progress.circular::-moz-progress-bar{background:0 0}}";
//#endregion
//#region src/kit/KitStyles.svelte
function he(e) {
	let t = `<style>${P}</style>`;
	var n = ee(), r = ie(n);
	D(r, () => t), g(e, n);
}
ne(he, {}, [], [], { mode: "open" });
//#endregion
//#region src/kit/text.ts
var ge = {
	en: {
		close: "Close",
		cancel: "Cancel",
		confirm: "Confirm",
		today: "Today",
		clear: "Clear",
		remove: "Remove",
		unknownPerson: "Unknown person",
		noResults: "No matches",
		bold: "Bold",
		italic: "Italic",
		bulletList: "Bulleted list",
		numberedList: "Numbered list",
		link: "Link",
		mentionMenu: "Mention suggestions",
		mentionRestricted: "Restricted record",
		mentionRestrictedPerson: "Restricted person",
		mentionDeleted: "Deleted record",
		previousMonth: "Previous month",
		nextMonth: "Next month",
		notifications: "Notifications",
		openCalendar: "Open calendar",
		closeCalendar: "Close calendar",
		calendar: "Calendar",
		chooseDate: "Choose {date}",
		selectedDate: "Selected date. {date}",
		previousYear: "Previous year",
		nextYear: "Next year",
		previousDecade: "Previous decade",
		nextDecade: "Next decade",
		switchView: "Switch to {view} view",
		currentView: "{view} view",
		viewDay: "day",
		viewMonth: "month",
		viewYear: "year",
		valueMissing: "Fill in this field.",
		rangeUnderflow: "Must be {min} or later.",
		rangeOverflow: "Must be {max} or earlier.",
		badDate: "Enter a date as {format}.",
		badNumber: "Enter a number as {example}.",
		increase: "Increase",
		decrease: "Decrease",
		numberUnderflow: "Must be {min} or more.",
		numberOverflow: "Must be {max} or less.",
		noOptions: "No options",
		loading: "Loading…",
		loadMore: "Load more",
		unknownOption: "Unknown value",
		rangeStart: "Start date",
		rangeEnd: "End date",
		locked: "Locked",
		formErrors: "Some fields need attention",
		resizeHandle: "Resize panes",
		previous: "Previous",
		next: "Next",
		rowsPerPage: "Rows per page",
		pageRange: "{start}–{end} of {total}",
		pageRangeOpen: "{start}–{end}",
		shownOf: "Showing {shown} of {total}",
		shownOnly: "Showing {shown}",
		moreLoaded: "{count} more loaded",
		copy: "Copy",
		copied: "Copied",
		copyFailed: "Couldn't copy",
		archived: "Archived",
		maxPicked: "At most {max}",
		noNodes: "Nothing to choose from",
		noMatches: "No matches",
		selectedCount: "{count} selected",
		selectedOfTotal: "{count} of {total} selected",
		clearSelection: "Clear selection",
		moreActions: "More actions",
		dropFiles: "Drop files here, or",
		dropFile: "Drop a file here, or",
		browse: "browse",
		multipleAllowed: "Multiple files allowed.",
		oneFileOnly: "One file only.",
		noFiles: "No files attached.",
		uploading: "Uploading…",
		uploadFailed: "Failed",
		removeFile: "Remove file",
		fileTypeRefused: "{name} is not an allowed type.",
		fileCountRefused: "At most {max} files.",
		fileDuplicate: "{name} appears more than once; it was added once.",
		signaturePad: "Signature",
		signHint: "Use your mouse or finger to sign. Click Clear to start over.",
		folderSource: "Source",
		folderFromFiles: "Files",
		folderFromComputer: "Folder from this computer",
		folderFromWatched: "Watched folder",
		folderDrop: "Drop a folder here, or",
		folderBrowse: "choose a folder",
		folderGrainFolder: "Each folder directly inside it is one item.",
		folderGrainDeep: "Each folder {depth} levels inside it is one item.",
		folderGrainFile: "Each file is one item.",
		folderResumeHint: "Choose the same folder to continue the upload that was interrupted.",
		folderNeedsFolder: "Drop a folder here, not single files.",
		folderNeedsFiles: "Drop files here, not a folder.",
		folderUploadStarting: "Preparing the upload…",
		folderUploadProgress: "{stored} of {total} files uploaded",
		folderUploadFailed: "The upload stopped. Try again to continue where it left off.",
		folderRetry: "Try again",
		folderUploadDone: "The upload is complete.",
		folderEmpty: "That folder holds no files, so there is nothing to upload.",
		folderNoSources: "Files cannot be chosen here: nothing is connected to read them from.",
		folderRefused: "This was refused, and trying again will not change that.",
		folderWatchedRoot: "Watched folders",
		folderWatchedEmpty: "There are no watched folders you can use.",
		folderNoSubfolders: "No folders inside.",
		folderLoadFailed: "The folders could not be loaded.",
		folderOpen: "Open {name}",
		folderFileCountOne: "{count} file",
		folderFileCount: "{count} files",
		folderFilesReady: "{ready} of {count} files ready",
		folderChecking: "Checking what a launch would take…",
		folderPreviewFailed: "What a launch would take could not be checked.",
		folderPreview: "What a launch would take",
		folderGroups: "Folders",
		folderItems: "Files",
		folderLeftOut: "Left out",
		folderSample: "Starting with",
		folderRefusal: "A launch would be refused",
		folderRefusedFilesOne: "{count} file was too large to upload and is left out.",
		folderRefusedFiles: "{count} files were too large to upload and are left out.",
		folderReasonNotInAFolder: "Files that are in no folder",
		folderReasonNotSettled: "Still being copied in, so not ready",
		folderReasonNoMarker: "Not marked as complete yet",
		folderReasonTooManyFiles: "Too many files in one folder",
		folderReasonBelowMinItems: "Fewer files than this field takes",
		folderReasonAboveMaxItems: "More files than this field takes",
		folderReasonFileTooLarge: "Holds a file too large to store",
		folderReasonUploadSetIncomplete: "The upload has not finished",
		folderReasonNoReadyGroups: "Nothing in it is ready to run yet",
		folderReasonAlreadyLaunched: "A run was already started from this upload; upload the files again to start another",
		folderReasonOtherConsumers: "This workflow reads the field in a way a folder cannot be used for",
		folderReasonMarkerNeedsFolders: "This folder waits for a completion marker, and this workflow runs one file at a time",
		folderReasonInUse: "A run that has not finished is still reading it",
		folderReasonOther: "Another reason ({code})",
		tileLoading: "Loading…",
		tileLoadFailed: "This tile could not be loaded. Reload the page to try again.",
		tileUnavailable: "Not available to you",
		tileUnavailableHint: "This tile is over records you cannot list.",
		tileFailed: "This tile cannot be computed",
		tileNotDrawn: "This tile cannot be drawn here yet",
		tileNoValue: "No value over this population",
		tileNoBuckets: "No buckets over these records",
		tileNoData: "No data",
		tileRecordsOne: "{count} record",
		tileRecords: "{count} records",
		tileCapAtLeast: "at least",
		tileCapAtMost: "at most",
		tileCapSample: "a sample of the first {cap} records",
		tileCapIncomplete: "incomplete — no bound",
		tileChartCapAtLeast: "Counted up to {cap} records: each figure is at least what is shown",
		tileChartCapAtMost: "Counted up to {cap} records: each figure is at most what is shown",
		tileGoal: "goal {target}",
		tileGoalShort: "{distance} short",
		tileGoalOver: "{distance} over",
		tileGoalMet: "on goal",
		tilePoints: "{value} pts",
		tileVsEarlier: "vs earlier period",
		tileEarlier: "earlier period",
		tileNoEarlier: "no earlier figure",
		tileNew: "new",
		tileGone: "gone",
		tileUnmatched: "no matching day",
		tileDifference: "difference",
		tileTarget: "target",
		tileBarTotal: "bar total",
		tileFilled: "no records (filled)",
		tileSkipped: "{count} skipped: missing a date",
		tileUnweightedAverage: "Unweighted average of per-record rates",
		tileUnfiltered: "Not filtered by the page's filter: these records have no such field.",
		tileDeclined: "Shows everything: this tile does not follow the page's filter.",
		tileEmptied: "No records match this tile's filter together with the page's.",
		tileTargetsWithheld: "Targets come from a table you can't open",
		tilePartial: "Some records are withheld from you and not shown",
		tileBucketEmpty: "(Empty)",
		tileBucketRestricted: "(Restricted)",
		tileBucketOther: "(Other)",
		tileYes: "Yes",
		tileNo: "No",
		tileListEmpty: "No records match this view.",
		tileListNoColumns: "None of this view's columns can be shown to you.",
		tilePrevious: "Previous",
		tileNext: "Next",
		tileOpenRecord: "Open {label}",
		tileFileUnavailable: "File unavailable",
		tileItemsOne: "{count} item",
		tileItems: "{count} items",
		tileOpenRecordsOne: "Click to open {count} record",
		tileOpenRecords: "Click to open {count} records",
		tileDrillOff: "Records link is off for this tile",
		tileShowTable: "Show as table",
		tileShowChart: "Show as chart",
		tileIsolate: "Show only {series}",
		tileShowAll: "Show every series",
		tileShare: "share",
		tileUnitCount: "count",
		tileUnitRatio: "ratio",
		tileUnitPercent: "%",
		tileUnitNumber: "number",
		tileUnitDuration: "duration",
		tileUnitMinutes: "minutes",
		tileUnitHours: "hours",
		tileUnitDays: "days",
		tileUnitRating: "rating",
		tileUnitDate: "date",
		tileRunningTotal: "running total",
		tileDerivedRunning: "Running total",
		tileRank: "Rank",
		tileFormula: "Formula",
		tileFormulaNoValue: "no value",
		tileDerivedShare: "Share of the buckets shown",
		tileDerivedShareRemainder: "shares of the buckets shown, remainder included",
		tileDerivedRank: "Rank, {direction} first, {ties}",
		tileRankHighest: "highest",
		tileRankLowest: "lowest",
		tileTiesDense: "dense ties",
		tileTiesCompetition: "competition ties",
		tileVerdictPartitions: "Bars add up to {total}",
		tileVerdictPartitionsNoTotal: "Bars add up to the total",
		tileVerdictPartitionsStacked: "Segments add up to each bar; bars add up to {total}",
		tileVerdictPartitionsStackedNoTotal: "Segments add up to each bar; bars add up to the total",
		tileVerdictFansOut: "Bars sum to {bucketSum}; the population total is {total}. {gap} is counted more than once.",
		tileVerdictOverlaps: "Buckets overlap and cannot be combined",
		tileVerdictNotApplicable: "No total to reconcile against"
	},
	vi: {
		close: "Đóng",
		cancel: "Huỷ",
		confirm: "Xác nhận",
		today: "Hôm nay",
		clear: "Xoá",
		remove: "Bỏ",
		unknownPerson: "Người không rõ",
		noResults: "Không có kết quả",
		bold: "Đậm",
		italic: "Nghiêng",
		bulletList: "Danh sách",
		numberedList: "Danh sách số",
		link: "Liên kết",
		mentionMenu: "Gợi ý nhắc đến",
		mentionRestricted: "Bản ghi bị hạn chế",
		mentionRestrictedPerson: "Người bị hạn chế",
		mentionDeleted: "Bản ghi đã xoá",
		previousMonth: "Tháng trước",
		nextMonth: "Tháng sau",
		notifications: "Thông báo",
		openCalendar: "Mở lịch",
		closeCalendar: "Đóng lịch",
		calendar: "Lịch",
		chooseDate: "Chọn {date}",
		selectedDate: "Đã chọn {date}",
		previousYear: "Năm trước",
		nextYear: "Năm sau",
		previousDecade: "Thập kỷ trước",
		nextDecade: "Thập kỷ sau",
		switchView: "Chuyển sang xem {view}",
		currentView: "Xem {view}",
		viewDay: "ngày",
		viewMonth: "tháng",
		viewYear: "năm",
		valueMissing: "Vui lòng điền trường này.",
		rangeUnderflow: "Phải từ {min} trở đi.",
		rangeOverflow: "Phải từ {max} trở về trước.",
		badDate: "Nhập ngày theo dạng {format}.",
		badNumber: "Nhập số theo dạng {example}.",
		increase: "Tăng",
		decrease: "Giảm",
		numberUnderflow: "Phải từ {min} trở lên.",
		numberOverflow: "Phải từ {max} trở xuống.",
		noOptions: "Không có lựa chọn",
		loading: "Đang tải…",
		loadMore: "Tải thêm",
		unknownOption: "Giá trị không xác định",
		rangeStart: "Ngày bắt đầu",
		rangeEnd: "Ngày kết thúc",
		locked: "Đã khoá",
		formErrors: "Một số trường cần sửa",
		resizeHandle: "Thay đổi kích thước khung",
		previous: "Trước",
		next: "Sau",
		rowsPerPage: "Số dòng mỗi trang",
		pageRange: "{start}–{end} trên {total}",
		pageRangeOpen: "{start}–{end}",
		shownOf: "Đang hiện {shown} trên {total}",
		shownOnly: "Đang hiện {shown}",
		moreLoaded: "Đã tải thêm {count}",
		copy: "Sao chép",
		copied: "Đã sao chép",
		copyFailed: "Không sao chép được",
		archived: "Đã lưu trữ",
		maxPicked: "Tối đa {max}",
		noNodes: "Không có mục nào",
		noMatches: "Không có kết quả",
		selectedCount: "Đã chọn {count}",
		selectedOfTotal: "Đã chọn {count} trên {total}",
		clearSelection: "Bỏ chọn",
		moreActions: "Thêm hành động",
		dropFiles: "Thả tệp vào đây, hoặc",
		dropFile: "Thả một tệp vào đây, hoặc",
		browse: "chọn tệp",
		multipleAllowed: "Có thể thêm nhiều tệp.",
		oneFileOnly: "Chỉ một tệp.",
		noFiles: "Chưa đính kèm tệp nào.",
		uploading: "Đang tải lên…",
		uploadFailed: "Thất bại",
		removeFile: "Gỡ tệp",
		fileTypeRefused: "{name} không đúng định dạng cho phép.",
		fileCountRefused: "Tối đa {max} tệp.",
		fileDuplicate: "{name} xuất hiện nhiều lần; chỉ thêm một lần.",
		signaturePad: "Chữ ký",
		signHint: "Dùng chuột hoặc ngón tay để ký. Bấm Xoá để ký lại.",
		folderSource: "Nguồn",
		folderFromFiles: "Tệp",
		folderFromComputer: "Thư mục từ máy tính này",
		folderFromWatched: "Thư mục theo dõi",
		folderDrop: "Thả một thư mục vào đây, hoặc",
		folderBrowse: "chọn thư mục",
		folderGrainFolder: "Mỗi thư mục con trực tiếp là một mục.",
		folderGrainDeep: "Mỗi thư mục ở cấp thứ {depth} bên trong là một mục.",
		folderGrainFile: "Mỗi tệp là một mục.",
		folderResumeHint: "Chọn lại đúng thư mục đó để tiếp tục lượt tải lên bị gián đoạn.",
		folderNeedsFolder: "Hãy thả một thư mục, không phải các tệp riêng lẻ.",
		folderNeedsFiles: "Hãy thả tệp, không phải thư mục.",
		folderUploadStarting: "Đang chuẩn bị tải lên…",
		folderUploadProgress: "Đã tải lên {stored} trên {total} tệp",
		folderUploadFailed: "Việc tải lên đã dừng. Thử lại để tiếp tục từ chỗ dang dở.",
		folderRetry: "Thử lại",
		folderUploadDone: "Đã tải lên xong.",
		folderEmpty: "Thư mục đó không có tệp nào nên không có gì để tải lên.",
		folderNoSources: "Không chọn được tệp ở đây: chưa có nguồn nào được kết nối để đọc tệp.",
		folderRefused: "Yêu cầu này bị từ chối, và thử lại cũng không thay đổi được.",
		folderWatchedRoot: "Thư mục theo dõi",
		folderWatchedEmpty: "Không có thư mục theo dõi nào bạn được dùng.",
		folderNoSubfolders: "Không có thư mục con.",
		folderLoadFailed: "Không tải được danh sách thư mục.",
		folderOpen: "Mở {name}",
		folderFileCountOne: "{count} tệp",
		folderFileCount: "{count} tệp",
		folderFilesReady: "{ready} trên {count} tệp đã sẵn sàng",
		folderChecking: "Đang kiểm tra những gì sẽ được chạy…",
		folderPreviewFailed: "Không kiểm tra được những gì sẽ được chạy.",
		folderPreview: "Những gì sẽ được chạy",
		folderGroups: "Thư mục",
		folderItems: "Tệp",
		folderLeftOut: "Bị loại ra",
		folderSample: "Bắt đầu với",
		folderRefusal: "Không thể khởi chạy",
		folderRefusedFilesOne: "{count} tệp quá lớn nên không được tải lên và bị loại ra.",
		folderRefusedFiles: "{count} tệp quá lớn nên không được tải lên và bị loại ra.",
		folderReasonNotInAFolder: "Tệp không nằm trong thư mục nào",
		folderReasonNotSettled: "Đang được chép vào, chưa sẵn sàng",
		folderReasonNoMarker: "Chưa được đánh dấu là hoàn tất",
		folderReasonTooManyFiles: "Quá nhiều tệp trong một thư mục",
		folderReasonBelowMinItems: "Ít tệp hơn mức trường này nhận",
		folderReasonAboveMaxItems: "Nhiều tệp hơn mức trường này nhận",
		folderReasonFileTooLarge: "Có tệp quá lớn, không lưu được",
		folderReasonUploadSetIncomplete: "Chưa tải lên xong",
		folderReasonNoReadyGroups: "Chưa có gì trong đó sẵn sàng để chạy",
		folderReasonAlreadyLaunched: "Đã có một lượt chạy bắt đầu từ lượt tải lên này; hãy tải tệp lên lại để chạy lượt khác",
		folderReasonOtherConsumers: "Quy trình này đọc trường theo cách không dùng được thư mục",
		folderReasonMarkerNeedsFolders: "Thư mục này chờ tệp đánh dấu hoàn tất, còn quy trình này chạy từng tệp một",
		folderReasonInUse: "Một lượt chạy chưa xong vẫn đang đọc nó",
		folderReasonOther: "Lý do khác ({code})",
		tileLoading: "Đang tải…",
		tileLoadFailed: "Không tải được ô này. Hãy tải lại trang để thử lại.",
		tileUnavailable: "Không khả dụng với bạn",
		tileUnavailableHint: "Ô này tính trên các bản ghi bạn không được liệt kê.",
		tileFailed: "Không tính được ô này",
		tileNotDrawn: "Chưa vẽ được ô này ở đây",
		tileNoValue: "Không có giá trị trên tập bản ghi này",
		tileNoBuckets: "Không có nhóm nào trên các bản ghi này",
		tileNoData: "Không có dữ liệu",
		tileRecordsOne: "{count} bản ghi",
		tileRecords: "{count} bản ghi",
		tileCapAtLeast: "ít nhất",
		tileCapAtMost: "nhiều nhất",
		tileCapSample: "mẫu gồm {cap} bản ghi đầu tiên",
		tileCapIncomplete: "chưa đầy đủ — không có cận",
		tileChartCapAtLeast: "Chỉ đếm tối đa {cap} bản ghi: mỗi số liệu ít nhất bằng mức hiển thị",
		tileChartCapAtMost: "Chỉ đếm tối đa {cap} bản ghi: mỗi số liệu nhiều nhất bằng mức hiển thị",
		tileGoal: "mục tiêu {target}",
		tileGoalShort: "thiếu {distance}",
		tileGoalOver: "vượt {distance}",
		tileGoalMet: "đạt mục tiêu",
		tilePoints: "{value} điểm",
		tileVsEarlier: "so với kỳ trước",
		tileEarlier: "kỳ trước",
		tileNoEarlier: "không có số liệu kỳ trước",
		tileNew: "mới",
		tileGone: "không còn",
		tileUnmatched: "không có ngày tương ứng",
		tileDifference: "chênh lệch",
		tileTarget: "mục tiêu",
		tileBarTotal: "tổng cột",
		tileFilled: "không có bản ghi (lấp đầy)",
		tileSkipped: "{count} bản ghi bị bỏ qua: thiếu ngày",
		tileUnweightedAverage: "Trung bình không trọng số của tỷ lệ từng bản ghi",
		tileUnfiltered: "Không lọc theo bộ lọc của trang: các bản ghi này không có trường tương ứng.",
		tileDeclined: "Hiển thị toàn bộ: ô này không theo bộ lọc của trang.",
		tileEmptied: "Không bản ghi nào khớp cả bộ lọc của ô lẫn bộ lọc của trang.",
		tileTargetsWithheld: "Mục tiêu lấy từ một bảng bạn không mở được",
		tilePartial: "Một số bản ghi bị giữ lại với bạn và không hiển thị",
		tileBucketEmpty: "(Trống)",
		tileBucketRestricted: "(Bị hạn chế)",
		tileBucketOther: "(Khác)",
		tileYes: "Có",
		tileNo: "Không",
		tileListEmpty: "Không có bản ghi nào khớp chế độ xem này.",
		tileListNoColumns: "Không có cột nào của chế độ xem này hiển thị được cho bạn.",
		tilePrevious: "Trước",
		tileNext: "Sau",
		tileOpenRecord: "Mở {label}",
		tileFileUnavailable: "Tệp không khả dụng",
		tileItemsOne: "{count} mục",
		tileItems: "{count} mục",
		tileOpenRecordsOne: "Nhấn để mở {count} bản ghi",
		tileOpenRecords: "Nhấn để mở {count} bản ghi",
		tileDrillOff: "Ô này đã tắt liên kết bản ghi",
		tileShowTable: "Xem dạng bảng",
		tileShowChart: "Xem dạng biểu đồ",
		tileIsolate: "Chỉ hiện {series}",
		tileShowAll: "Hiện mọi chuỗi",
		tileShare: "tỷ trọng",
		tileUnitCount: "số lượng",
		tileUnitRatio: "tỷ lệ",
		tileUnitPercent: "%",
		tileUnitNumber: "số",
		tileUnitDuration: "thời lượng",
		tileUnitMinutes: "phút",
		tileUnitHours: "giờ",
		tileUnitDays: "số ngày",
		tileUnitRating: "đánh giá",
		tileUnitDate: "ngày",
		tileRunningTotal: "tổng luỹ kế",
		tileDerivedRunning: "Tổng luỹ kế",
		tileRank: "Xếp hạng",
		tileFormula: "Công thức",
		tileFormulaNoValue: "không có giá trị",
		tileDerivedShare: "Tỷ trọng trên các nhóm hiển thị",
		tileDerivedShareRemainder: "tỷ trọng trên các nhóm hiển thị, gồm cả phần còn lại",
		tileDerivedRank: "Xếp hạng, {direction} trước, {ties}",
		tileRankHighest: "cao nhất",
		tileRankLowest: "thấp nhất",
		tileTiesDense: "đồng hạng liền",
		tileTiesCompetition: "đồng hạng bỏ thứ",
		tileVerdictPartitions: "Các cột cộng lại bằng {total}",
		tileVerdictPartitionsNoTotal: "Các cột cộng lại bằng tổng",
		tileVerdictPartitionsStacked: "Các phân đoạn cộng lại bằng mỗi cột; các cột cộng lại bằng {total}",
		tileVerdictPartitionsStackedNoTotal: "Các phân đoạn cộng lại bằng mỗi cột; các cột cộng lại bằng tổng",
		tileVerdictFansOut: "Các cột cộng lại là {bucketSum}; tổng của tập bản ghi là {total}. {gap} được đếm nhiều hơn một lần.",
		tileVerdictOverlaps: "Các nhóm chồng lấn và không thể gộp lại",
		tileVerdictNotApplicable: "Không có tổng để đối chiếu"
	}
}, _e = (e) => /^vi(-|$)/i.test(e ?? "");
function ve(e, t) {
	let n = ge[_e(e) ? "vi" : "en"], r = Object.fromEntries(Object.entries(t ?? {}).filter(([, e]) => e !== void 0));
	return {
		...n,
		...r
	};
}
function F(e, t) {
	return e[t] || ge.en[t];
}
function I(e, t) {
	return e.replace(/\{(\w+)\}/g, (e, n) => String(t[n] ?? e));
}
//#endregion
//#region src/kit/FolderSource.svelte
var ye = /* @__PURE__ */ ue({ default: () => B }), be = (e) => {
	var t = z();
	g(e, t);
}, xe = [
	"files",
	"computer",
	"watched"
], L = {
	NOT_IN_A_FOLDER: "folderReasonNotInAFolder",
	NOT_SETTLED: "folderReasonNotSettled",
	NO_MARKER: "folderReasonNoMarker",
	TOO_MANY_FILES: "folderReasonTooManyFiles",
	BELOW_MIN_ITEMS: "folderReasonBelowMinItems",
	ABOVE_MAX_ITEMS: "folderReasonAboveMaxItems",
	FILE_TOO_LARGE: "folderReasonFileTooLarge"
}, R = {
	UPLOAD_SET_INCOMPLETE: "folderReasonUploadSetIncomplete",
	FILE_SET_NO_READY_GROUPS: "folderReasonNoReadyGroups",
	UPLOAD_SET_ALREADY_LAUNCHED: "folderReasonAlreadyLaunched",
	FILE_SET_SLOT_HAS_OTHER_CONSUMERS: "folderReasonOtherConsumers",
	FILE_SET_MARKER_NEEDS_FOLDER_GRAIN: "folderReasonMarkerNeedsFolders",
	FILE_SET_IN_USE: "folderReasonInUse"
}, Se = (e) => Object.hasOwn(L, e) ? L[e] : null, Ce = (e) => e !== null && Object.hasOwn(R, e) ? R[e] : "folderRefused", we = 200;
function Te(e) {
	let t = typeof e == "object" && e ? e : {}, n = typeof t.status == "number" ? t.status : null;
	return {
		status: n,
		code: typeof t.code == "string" && t.code !== "" ? t.code : null,
		message: [t.detail, t.message].find((e) => typeof e == "string" && e !== "") ?? String(e),
		refused: n !== null && n >= 400 && n < 500 && n !== 408 && n !== 429
	};
}
var Ee = /^(\.ds_store|thumbs\.db|desktop\.ini)$/i;
async function De(e) {
	for (let t of e) {
		if (t.isFile) {
			if (!Ee.test(t.name)) return !0;
			continue;
		}
		let e = t.createReader?.();
		if (!e) return !0;
		try {
			for (;;) {
				let t = await new Promise((t, n) => e.readEntries(t, n));
				if (!t.length) break;
				if (await De(t)) return !0;
			}
		} catch {
			return !0;
		}
	}
	return !1;
}
var Oe = (e, t) => t > 1 ? `${e.slice(0, 192)} +${t - 1}` : e.slice(0, we), z = f("<svg class=\"icon svelte-4wnjhj\" viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z\"></path></svg>"), ke = _("<li part=\"folder\" class=\"af-list-row compact svelte-4wnjhj\"><button type=\"button\" part=\"choose\" class=\"svelte-4wnjhj\"><!> <span class=\"name svelte-4wnjhj\"> </span> <span class=\"meta svelte-4wnjhj\"> </span></button> <button type=\"button\" part=\"open\" class=\"af-button ghost icon xs svelte-4wnjhj\"><svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"m9 18 6-6-6-6\"></path></svg></button></li>"), Ae = _("<label part=\"source\"><input type=\"radio\"/><span> </span></label>"), je = _("<p part=\"hint\" id=\"af-hint\" class=\"svelte-4wnjhj\"> </p>"), Me = _("<li><button type=\"button\" part=\"crumb\" class=\"svelte-4wnjhj\"> </button></li>"), Ne = _("<li><button type=\"button\" part=\"crumb\" class=\"svelte-4wnjhj\"> </button></li> <!>", 1), Pe = _("<ul part=\"list\" class=\"af-list svelte-4wnjhj\"><!></ul>"), Fe = _("<p class=\"loading svelte-4wnjhj\" role=\"status\"><span class=\"af-spinner\" aria-hidden=\"true\"></span> </p>"), Ie = _("<button type=\"button\" class=\"af-button link xs\"> </button>"), Le = _("<p class=\"failed svelte-4wnjhj\" role=\"alert\"><span> </span><!></p>"), Re = _("<p part=\"empty\" class=\"svelte-4wnjhj\"> </p>"), ze = _("<button type=\"button\" part=\"more\" class=\"af-button secondary xs\"> </button>"), Be = _("<div class=\"browser svelte-4wnjhj\"><nav part=\"path\" class=\"af-breadcrumb\"><ol><li><button type=\"button\" part=\"crumb\" class=\"svelte-4wnjhj\"> </button></li> <!></ol></nav> <!> <!></div>"), Ve = _("<input type=\"file\" webkitdirectory=\"\" hidden=\"\" tabindex=\"-1\"/>"), He = _("<input type=\"file\" multiple=\"\" hidden=\"\" tabindex=\"-1\"/>"), Ue = _("<button type=\"button\" part=\"dropzone\" class=\"svelte-4wnjhj\"><svg class=\"glyph svelte-4wnjhj\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v12\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path></svg> <span class=\"lead svelte-4wnjhj\"> <span part=\"trigger\" class=\"svelte-4wnjhj\"> </span></span></button> <!>", 1), We = _("<progress part=\"progress\" class=\"af-progress svelte-4wnjhj\"></progress>"), Ge = _("<div class=\"upload svelte-4wnjhj\"><!> <span class=\"progress-text svelte-4wnjhj\" aria-hidden=\"true\"> </span> <button type=\"button\" part=\"cancel\" class=\"af-button ghost xs\"> </button></div>"), Ke = _("<button type=\"button\" part=\"retry\" class=\"af-button secondary xs\"> </button>"), qe = _("<p part=\"chosen\" class=\"svelte-4wnjhj\"><!><span class=\"name svelte-4wnjhj\"> </span></p>"), Je = _("<div part=\"refusal\" class=\"af-banner danger\" role=\"alert\"><div class=\"af-banner-title\"> </div> <div class=\"af-banner-description\"> </div></div>"), Ye = _("<div part=\"count\" class=\"svelte-4wnjhj\"><dt class=\"svelte-4wnjhj\"> </dt> <dd class=\"svelte-4wnjhj\"> </dd></div>"), Xe = _("<dl class=\"counts svelte-4wnjhj\"></dl>"), Ze = _("<p part=\"sample\" class=\"svelte-4wnjhj\"><span class=\"label svelte-4wnjhj\"> </span> <span class=\"keys\"> </span></p>"), Qe = _("<li part=\"reason\" class=\"svelte-4wnjhj\"><span> </span> <span class=\"count svelte-4wnjhj\"> </span></li>"), $e = _("<ul class=\"reasons svelte-4wnjhj\"></ul>"), et = _("<p class=\"refused svelte-4wnjhj\"> </p>"), tt = _("<section part=\"preview\" class=\"svelte-4wnjhj\"><!> <!> <!> <!> <!></section>"), nt = _("<!> <div class=\"af-kit source svelte-4wnjhj\"><div part=\"sources\" class=\"af-segmented svelte-4wnjhj\" role=\"radiogroup\"></div> <!> <!> <!> <div class=\"status svelte-4wnjhj\"><div part=\"notice\" role=\"status\" aria-live=\"polite\" class=\"svelte-4wnjhj\"> </div> <!></div> <!> <!></div>", 1), rt = {
	hash: "svelte-4wnjhj",
	code: ":host {display:block;}.source.svelte-4wnjhj {display:flex;flex-direction:column;align-items:stretch;gap:8px;font-size:12px;line-height:1.5;--fs-edge: color-mix(in oklab, var(--k-fg) calc(15% + var(--k-dark, 0) * 6%), var(--k-surface));--fs-soft: color-mix(in oklab, var(--k-muted) calc(60% + var(--k-dark, 0) * 25%), var(--k-surface));}[part~='sources'].svelte-4wnjhj {align-self:flex-start;}[part~='hint'].svelte-4wnjhj {margin:0;color:var(--k-muted);font-size:11.5px;}[part~='dropzone'].svelte-4wnjhj {display:flex;box-sizing:border-box;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:100%;padding:16px 12px;border:2px dashed var(--fs-edge);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);color:var(--k-fg);font:inherit;text-align:center;outline:none;cursor:pointer;transition-property:color, background-color, border-color, box-shadow;transition-duration:150ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (hover: hover) {[part~='dropzone'].svelte-4wnjhj:hover {border-color:var(--fs-soft);} }[part~='dropzone'][data-dragging].svelte-4wnjhj {border-color:color-mix(in oklab, var(--k-primary) 60%, var(--k-surface));background-color:color-mix(in oklab, var(--k-primary) 4%, transparent);}[part~='dropzone'].svelte-4wnjhj:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='dropzone'][aria-disabled='true'].svelte-4wnjhj {opacity:0.5;cursor:not-allowed;}.glyph.svelte-4wnjhj {flex:none;color:var(--fs-soft);}[part~='trigger'].svelte-4wnjhj {color:var(--k-primary);font-weight:500;}\n  @media (hover: hover) {[part~='dropzone'].svelte-4wnjhj:not([aria-disabled='true']):hover [part~='trigger']:where(.svelte-4wnjhj) {text-decoration-line:underline;} }[part~='dropzone'].svelte-4wnjhj > :where(.svelte-4wnjhj) {pointer-events:none;}.browser.svelte-4wnjhj {display:flex;flex-direction:column;align-items:flex-start;gap:6px;}[part~='crumb'].svelte-4wnjhj {padding:0;border:0;border-radius:2px;background:none;color:var(--k-muted);font:inherit;outline:none;cursor:pointer;}[part~='crumb'][aria-current].svelte-4wnjhj {color:var(--k-fg);}\n  @media (hover: hover) {[part~='crumb'].svelte-4wnjhj:hover {color:var(--k-fg);} }[part~='crumb'].svelte-4wnjhj:disabled {cursor:not-allowed;}[part~='crumb'].svelte-4wnjhj:disabled:not([aria-current]) {color:var(--k-muted);}[part~='crumb'].svelte-4wnjhj:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='list'].svelte-4wnjhj {box-sizing:border-box;align-self:stretch;max-height:224px;overflow:auto;scrollbar-width:thin;scrollbar-color:var(--k-line) transparent;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);}[part~='folder'].svelte-4wnjhj {padding-block:2px;padding-inline:4px;gap:4px;}[part~='folder'][data-chosen].svelte-4wnjhj {background-color:color-mix(in oklab, var(--k-primary) 6%, var(--k-surface));}[part~='choose'].svelte-4wnjhj {display:flex;flex:1 1 0%;align-items:center;gap:8px;min-width:0;min-height:28px;padding:2px 8px;border:0;border-radius:4px;background:none;color:var(--k-fg);font:inherit;text-align:start;outline:none;cursor:pointer;}[part~='choose'].svelte-4wnjhj:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='choose'][aria-pressed='true'].svelte-4wnjhj .name:where(.svelte-4wnjhj) {color:var(--k-primary);font-weight:500;}[part~='choose'].svelte-4wnjhj:disabled {opacity:0.5;cursor:not-allowed;}.icon.svelte-4wnjhj {flex:none;width:14px;height:14px;color:var(--k-muted);}.name.svelte-4wnjhj {min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}.meta.svelte-4wnjhj {flex:none;margin-inline-start:auto;color:var(--k-muted);font-size:10.5px;font-variant-numeric:tabular-nums;}.loading.svelte-4wnjhj, .failed.svelte-4wnjhj, [part~='empty'].svelte-4wnjhj {margin:0;color:var(--k-muted);font-size:11.5px;}.loading.svelte-4wnjhj {display:flex;align-items:center;gap:6px;}.failed.svelte-4wnjhj {color:var(--k-danger);}[part~='empty'].svelte-4wnjhj {font-style:italic;}.upload.svelte-4wnjhj {display:flex;align-items:center;gap:8px;}.upload.svelte-4wnjhj [part~='progress']:where(.svelte-4wnjhj) {flex:1 1 0%;min-width:0;}.progress-text.svelte-4wnjhj {flex:none;color:var(--k-muted);font-size:11.5px;font-variant-numeric:tabular-nums;}.status.svelte-4wnjhj {display:flex;position:relative;align-items:center;gap:8px;}.status.svelte-4wnjhj:has([part~='notice']:where(.svelte-4wnjhj):empty), .status.svelte-4wnjhj:has([part~='notice'][data-spoken]:where(.svelte-4wnjhj)) {margin-top:-8px;}[part~='notice'][data-spoken].svelte-4wnjhj {position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}[part~='notice'].svelte-4wnjhj {color:var(--k-muted);font-size:11.5px;}[part~='notice'][data-tone='danger'].svelte-4wnjhj {color:var(--k-danger);}[part~='chosen'].svelte-4wnjhj {display:flex;align-items:center;gap:6px;margin:0;color:var(--k-fg);font-weight:500;}[part~='preview'].svelte-4wnjhj {display:flex;box-sizing:border-box;flex-direction:column;gap:8px;padding:10px 12px;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);}.counts.svelte-4wnjhj {display:flex;flex-wrap:wrap;gap:4px 24px;margin:0;}[part~='count'].svelte-4wnjhj {display:flex;align-items:baseline;gap:6px;}[part~='count'].svelte-4wnjhj dt:where(.svelte-4wnjhj) {color:var(--k-muted);font-size:10.5px;font-weight:500;letter-spacing:0.05em;text-transform:uppercase;}[part~='count'].svelte-4wnjhj dd:where(.svelte-4wnjhj) {margin:0;color:var(--k-fg);font-size:13.5px;font-weight:500;font-variant-numeric:tabular-nums;}[part~='sample'].svelte-4wnjhj {margin:0;color:var(--k-fg);overflow-wrap:anywhere;}.label.svelte-4wnjhj {color:var(--k-muted);}.reasons.svelte-4wnjhj {margin:0;padding:6px 0 0;border-top:1px solid var(--k-line);list-style:none;}[part~='reason'].svelte-4wnjhj {display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-block:2px;color:var(--k-fg);}.count.svelte-4wnjhj {flex:none;color:var(--k-muted);font-variant-numeric:tabular-nums;}.refused.svelte-4wnjhj {margin:0;color:var(--k-warning);}\n  @media (prefers-reduced-motion: reduce) {[part~='dropzone'].svelte-4wnjhj {transition:none;} }\n  @media (forced-colors: active) {[part~='dropzone'].svelte-4wnjhj:focus-visible, [part~='crumb'].svelte-4wnjhj:focus-visible, [part~='choose'].svelte-4wnjhj:focus-visible {outline:2px solid;outline-offset:2px;}[part~='folder'][data-chosen].svelte-4wnjhj {forced-color-adjust:none;background-color:Highlight;}[part~='folder'][data-chosen].svelte-4wnjhj [part~='choose']:where(.svelte-4wnjhj) {color:HighlightText;}\n  }"
};
function B(f, _) {
	let ne = e();
	d(_, !0), a(f, rt);
	let se = (e, t = o, n = o, r = o, i = o, a = o) => {
		var s = ke(), u = x(s), d = x(u);
		be(d);
		var f = S(d, 2), p = w(f, !0), h = S(f, 2), ee = w(h, !0);
		l(u);
		var _ = S(u, 2);
		l(s), C((e, i) => {
			m(s, "data-chosen", r() ? "" : void 0), m(u, "aria-pressed", r()), u.disabled = y(Y), c(p, t()), c(ee, n()), m(_, "aria-label", e), m(_, "title", i), _.disabled = y(Y);
		}, [() => I(y(P).folderOpen, { name: t() }), () => I(y(P).folderOpen, { name: t() })]), T("click", u, function(...e) {
			i()?.apply(this, e);
		}), T("click", _, function(...e) {
			a()?.apply(this, e);
		}), g(e, s);
	}, D = v(_, "sources", 7, null), O = v(_, "workflow", 7, null), ue = v(_, "version", 7, null), de = v(_, "field", 7, null), A = v(_, "folder", 7, null), j = v(_, "resumeSet", 7, null), M = v(_, "offer", 7, null), fe = v(_, "disabled", 7, !1), pe = v(_, "locale", 7, null), me = v(_, "strings", 7, null), N = _.$$host, P = n(() => ve(pe(), me() ?? void 0)), ge = n(() => new Intl.NumberFormat(_e(pe()) ? "vi-VN" : "en-GB")), F = (e) => y(ge).format(e), ye = n(() => {
		let e = xe.filter((e) => M()?.includes(e));
		return e.length ? e : xe;
	}), L = b(null), R = n(() => {
		if (y(L) && y(ye).includes(y(L))) return y(L);
		let e = A()?.grain === "file" ? "files" : "computer";
		return y(ye).includes(e) ? e : y(ye)[0];
	}), we = n(() => ({
		files: y(P).folderFromFiles,
		computer: y(P).folderFromComputer,
		watched: y(P).folderFromWatched
	})), z = b(null), B = b(null), it = b(""), V = b(null), H = b([]), U = b(!1), W = b(null), at = b(!1), G = b(""), K = b(""), ot = b(""), st = b(""), ct = 0, lt = 0, ut = b(!1), q = 0, dt = null, ft = null, pt = null, mt = !1, J = b([]), Y = n(() => !!fe() || y(U)), ht = !1;
	function gt() {
		let e = y(U) || y(at);
		e !== ht && (ht = e, k(N, "af-folder-busy", { busy: e }));
	}
	ce(gt);
	let _t = n(() => !!j() && !y(J).includes(j()) && y(R) !== "watched" && !y(U) && !y(z)), vt = n(() => A()?.grain === "folder" ? A().depth > 1 ? I(y(P).folderGrainDeep, { depth: A().depth }) : y(P).folderGrainFolder : A()?.grain === "file" ? y(P).folderGrainFile : ""), yt = n(() => [y(vt), y(_t) ? y(P).folderResumeHint : ""].filter(Boolean).join(" ")), bt = n(() => y(W) ? I(y(P).folderUploadProgress, {
		stored: F(y(W).stored),
		total: F(y(W).total)
	}) : y(P).folderUploadStarting), xt = n(() => y(K) ? y(P)[y(K)] : y(G) === "upload" ? y(P).folderUploadFailed : y(G) === "preview" ? y(P).folderPreviewFailed : y(ot) || (y(at) ? y(P).folderChecking : y(st))), St = n(() => !y(G) && !y(ot) && !y(at) && !!y(st)), Ct = n(() => y(H).length ? I(y(H).length === 1 ? y(P).folderRefusedFilesOne : y(P).folderRefusedFiles, { count: F(y(H).length) }) : "");
	function wt() {
		ct += 1, E(ot, ""), E(st, "");
	}
	async function X(e, t = !1) {
		wt();
		let n = ct;
		await re(), n === ct && E(t ? st : ot, e, !0);
	}
	function Tt() {
		return D() || X(y(P).folderNoSources), !!D();
	}
	function Et() {
		dt?.abort(), dt = null, q += 1, E(U, !1), E(at, !1), E(W, null), E(G, ""), E(K, ""), wt(), E(V, null), E(H, []), E(it, ""), E(z, null), y(B) && (E(B, null), k(N, "af-folder-change", {
			value: null,
			preview: null
		}));
	}
	async function Dt(e, t = "") {
		let n = ++q;
		E(G, ""), E(K, ""), wt(), E(at, !0), gt();
		let r = null;
		if (D() && O() && de()) try {
			r = await D().preview(O(), de(), e, ue() || void 0);
		} catch (e) {
			if (n !== q) return;
			E(G, "preview"), E(K, Ot("preview", e), !0);
		}
		if (n !== q || (E(at, !1), E(B, e), E(V, r), k(N, "af-folder-change", {
			value: e,
			preview: r
		}), y(G))) return;
		let i = [
			t,
			r && !r.refusal ? `${y(P).folderPreview}: ${y(nn).map(([e, t]) => `${e} ${F(t)}`).join(", ")}.` : "",
			y(Ct)
		].filter(Boolean).join(" ");
		i && X(i, !0);
	}
	function Ot(e, t) {
		let { status: n, code: r, message: i, refused: a } = Te(t);
		return k(N, "af-folder-error", {
			during: e,
			status: n,
			code: r,
			message: i
		}), a ? Ce(r) : "";
	}
	let kt = ["[part~=\"dropzone\"]", "[part~=\"source\"] input:checked"];
	async function At(e) {
		await re();
		for (let t of e) {
			let e = N.shadowRoot?.querySelector(t);
			if (e) return e.focus();
		}
	}
	let jt = () => !!N.shadowRoot?.activeElement?.matches("[part~=\"cancel\"]");
	async function Mt(e) {
		if (!D()) return;
		Et(), ft = e;
		let t = q, n = dt = new AbortController(), r = pt ?? (j() && !y(J).includes(j()) ? j() : void 0);
		mt = !1, E(U, !0), gt(), E(it, e.name, !0), lt = 0, X(y(P).folderUploadStarting, !0);
		let i = {
			name: e.name,
			resumeSetId: r,
			signal: n.signal,
			onSetCreated: (e) => {
				t === q && (pt = e, mt = !0, k(N, "af-folder-upload-started", { setId: e }));
			},
			onProgress: ({ stored: e, total: n }) => {
				if (t !== q) return;
				E(W, {
					stored: e,
					total: n
				}), k(N, "af-folder-progress", {
					stored: e,
					total: n
				});
				let r = Math.floor(e * 4 / Math.max(n, 1));
				r !== lt && (lt = r, X(y(bt), !0));
			}
		};
		try {
			let n = e.kind === "uploadFolder" ? await D().uploadFolder(e.payload, i) : await D().uploadFiles(e.payload, i);
			if (t !== q) return;
			jt() && At(kt), pt = null, E(J, [...y(J), n.value.$fileSet]), ft = null, E(U, !1), E(W, null), E(H, n.refused), E(z, n.value), await Dt(n.value, y(P).folderUploadDone);
		} catch (e) {
			if (t !== q) return;
			let n = jt();
			E(U, !1), E(W, null), E(G, "upload");
			let i = Ot("upload", e);
			if (i) {
				E(K, i, !0), ft = null, E(it, "");
				let e = pt;
				pt = null;
				let t = [e, r].filter((e) => !!e && !y(J).includes(e));
				t.length && E(J, [...y(J), ...new Set(t)]), e && D().deleteSet(e).catch(() => void 0);
			}
			n && At(["[part~=\"retry\"]", ...kt]);
		}
	}
	function Nt() {
		mt && (pt = null), Et(), At(kt);
	}
	function Pt() {
		y(G) === "upload" && ft ? Mt(ft) : y(G) === "preview" && y(z) && Dt(y(z)), At([
			"[part~=\"cancel\"]",
			"[part~=\"choose\"][aria-pressed=\"true\"]",
			...kt
		]);
	}
	ce(() => () => {
		q += 1, dt?.abort();
	}), ce(() => {
		O(), de(), ue(), oe(() => {
			y(z) && !y(U) && Dt(y(z));
		});
	});
	let Ft = b(null);
	function It() {
		!y(Y) && Tt() && y(Ft)?.click();
	}
	function Lt(e) {
		let t = e.currentTarget, n = Array.from(t.files ?? []);
		t.value = "", !y(Y) && Tt() && (y(R) === "computer" ? n.some((e) => !Ee.test(e.name)) ? Mt({
			kind: "uploadFolder",
			payload: n,
			name: Oe(n[0].webkitRelativePath.split("/")[0] || n[0].name, 1)
		}) : X(y(P).folderEmpty) : n.length && Mt({
			kind: "uploadFiles",
			payload: n,
			name: Oe(n[0].name, n.length)
		}));
	}
	async function Rt(e, t) {
		let n = q, r = await De(e);
		n !== q || y(Y) || (r ? Mt({
			kind: "uploadFolder",
			payload: e,
			name: t
		}) : X(y(P).folderEmpty));
	}
	function zt(e) {
		e.preventDefault(), E(ut, !y(Y));
	}
	function Bt(e) {
		if (e.preventDefault(), E(ut, !1), y(Y) || !Tt()) return;
		let t = Array.from(e.dataTransfer?.items ?? []).filter((e) => e.kind === "file"), n = t.map((e) => e.webkitGetAsEntry?.() ?? null), r = n.filter((e) => e?.isDirectory);
		if (y(R) === "computer") {
			r.length ? Rt(n.filter((e) => e !== null), Oe(r[0].name, r.length)) : X(y(P).folderNeedsFolder);
			return;
		}
		let i = t.map((e) => e.getAsFile()).filter((e) => e !== null);
		r.length || !i.length ? X(y(P).folderNeedsFiles) : Mt({
			kind: "uploadFiles",
			payload: i,
			name: Oe(i[0].name, i.length)
		});
	}
	let Vt = b(null), Z = b(null), Q = b([]), Ht = b(null), Ut = b(!1), Wt = b(!1), $ = b(""), Gt = 0, Kt = n(() => y(Z)?.trail.at(-1)?.path), qt = n(() => !y(Ut) && !y(Wt) && (y(Z) ? y(Q).length === 0 : y(Vt)?.length === 0));
	async function Jt(e) {
		if (!D()) return;
		let t = ++Gt, n = e ? y(Ht) : null;
		E(Ut, !0), E(Wt, !1), E($, "");
		try {
			if (y(Z)) {
				let r = await D().subfolders(y(Z).set.id, y(Kt), n);
				if (t !== Gt) return;
				E(Q, e ? [...y(Q), ...r.items] : r.items), E(Ht, r.next_cursor, !0);
			} else {
				let e = await D().watched();
				if (t !== Gt) return;
				E(Vt, e);
			}
		} catch (e) {
			if (t !== Gt) return;
			E(Wt, !0), E($, Ot("list", e), !0);
		}
		E(Ut, !1);
	}
	ce(() => {
		y(R) === "watched" && D() && oe(() => {
			!y(Vt) && !y(Ut) && !y(Wt) && Jt(!1);
		});
	});
	async function Yt(e) {
		await re();
		let t = N.shadowRoot;
		(t?.querySelectorAll("[part~=\"choose\"]")[e] ?? t?.querySelector("[part~=\"crumb\"][aria-current]"))?.focus();
	}
	async function Xt(e) {
		E(Z, e), E(Q, []), E(Ht, null), e || !y(Vt) ? await Jt(!1) : (Gt += 1, E(Ut, !1), E(Wt, !1), E($, "")), await Yt(0);
	}
	async function Zt() {
		let e = y(Q).length;
		await Jt(!0), await Yt(e);
	}
	function Qt(e, t) {
		Et();
		let n = t.at(-1)?.path, r = n === void 0 ? { $fileSet: e.id } : {
			$fileSet: e.id,
			path: n
		};
		E(z, r), E(it, [e.name, ...t.map((e) => e.name)].join(" / "), !0), Dt(r);
	}
	let $t = (e, t) => y(z)?.$fileSet === e && y(z).path === t, en = (e) => I(e === 1 ? y(P).folderFileCountOne : y(P).folderFileCount, { count: F(e) }), tn = n(() => y(V)?.grain ?? A()?.grain ?? null), nn = n(() => {
		if (!y(V)) return [];
		let e = y(tn) === "folder" ? [[y(P).folderGroups, y(V).group_count], [y(P).folderItems, y(V).item_count]] : [[y(P).folderItems, y(V).group_count]];
		return y(V).excluded_count > 0 && e.push([y(P).folderLeftOut, y(V).excluded_count]), e;
	}), rn = n(() => {
		if (!y(V)) return [];
		let e = { ...y(V).excluded_by_reason };
		return y(V).loose_file_count > 0 && (e.NOT_IN_A_FOLDER = y(V).loose_file_count), Object.entries(e).filter(([, e]) => e > 0).map(([e, t]) => ({
			code: e,
			count: t,
			label: Se(e) ? y(P)[Se(e)] : I(y(P).folderReasonOther, { code: e })
		}));
	}), an = n(() => y(V)?.refusal ? y(P)[Ce(y(V).refusal.code)] : "");
	var on = {
		get sources() {
			return D();
		},
		set sources(e = null) {
			D(e), p();
		},
		get workflow() {
			return O();
		},
		set workflow(e = null) {
			O(e), p();
		},
		get version() {
			return ue();
		},
		set version(e = null) {
			ue(e), p();
		},
		get field() {
			return de();
		},
		set field(e = null) {
			de(e), p();
		},
		get folder() {
			return A();
		},
		set folder(e = null) {
			A(e), p();
		},
		get resumeSet() {
			return j();
		},
		set resumeSet(e = null) {
			j(e), p();
		},
		get offer() {
			return M();
		},
		set offer(e = null) {
			M(e), p();
		},
		get disabled() {
			return fe();
		},
		set disabled(e = !1) {
			fe(e), p();
		},
		get locale() {
			return pe();
		},
		set locale(e = null) {
			pe(e), p();
		},
		get strings() {
			return me();
		},
		set strings(e = null) {
			me(e), p();
		}
	}, sn = nt(), cn = ie(sn);
	he(cn, {});
	var ln = S(cn, 2), un = x(ln);
	t(un, 20, () => y(ye), (e) => e, (e, t) => {
		var n = Ae(), r = x(n);
		le(r);
		var a = S(r), o = w(a, !0);
		l(n), C(() => {
			m(r, "name", `${ne}-source`), u(r, t), i(r, y(R) === t), r.disabled = y(Y), c(o, y(we)[t]);
		}), T("change", r, () => {
			E(L, t, !0), wt();
		}), g(e, n);
	}), l(un);
	var dn = S(un, 2), fn = (e) => {
		var t = je(), n = w(t, !0);
		C(() => c(n, y(yt))), g(e, t);
	};
	h(dn, (e) => {
		y(yt) && e(fn);
	});
	var pn = S(dn, 2), mn = (e) => {
		var r = Be(), i = x(r), a = x(i), o = x(a), s = x(o), u = w(s, !0);
		l(o);
		var d = S(o, 2), f = (e) => {
			let r = n(() => y(Z));
			var i = Ne(), a = ie(i), o = x(a), s = w(o, !0);
			l(a);
			var u = S(a, 2);
			t(u, 19, () => y(r).trail, (e) => e.path, (e, t, n) => {
				var i = Me(), a = x(i), o = w(a, !0);
				l(i), C(() => {
					a.disabled = y(Y), m(a, "aria-current", y(n) === y(r).trail.length - 1 ? "location" : void 0), c(o, y(t).name);
				}), T("click", a, () => Xt({
					set: y(r).set,
					trail: y(r).trail.slice(0, y(n) + 1)
				})), g(e, i);
			}), C(() => {
				o.disabled = y(Y), m(o, "aria-current", y(r).trail.length ? void 0 : "location"), c(s, y(r).set.name);
			}), T("click", o, () => Xt({
				set: y(r).set,
				trail: []
			})), g(e, i);
		};
		h(d, (e) => {
			y(Z) && e(f);
		}), l(a), l(i);
		var p = S(i, 2), _ = (e) => {
			var r = Pe(), i = x(r), a = (e) => {
				let r = n(() => y(Z));
				var i = ee(), a = ie(i);
				t(a, 17, () => y(Q), (e) => e.path, (e, t) => {
					{
						let i = n(() => y(t).settled_count < y(t).file_count ? I(y(P).folderFilesReady, {
							ready: F(y(t).settled_count),
							count: F(y(t).file_count)
						}) : en(y(t).file_count)), a = n(() => $t(y(r).set.id, y(t).path));
						se(e, () => y(t).name, () => y(i), () => y(a), () => () => Qt(y(r).set, [...y(r).trail, y(t)]), () => () => Xt({
							set: y(r).set,
							trail: [...y(r).trail, y(t)]
						}));
					}
				}), g(e, i);
			}, o = (e) => {
				var r = ee(), i = ie(r);
				t(i, 17, () => y(Vt) ?? [], (e) => e.id, (e, t) => {
					{
						let r = n(() => en(y(t).entry_count)), i = n(() => $t(y(t).id));
						se(e, () => y(t).name, () => y(r), () => y(i), () => () => Qt(y(t), []), () => () => Xt({
							set: y(t),
							trail: []
						}));
					}
				}), g(e, r);
			};
			h(i, (e) => {
				y(Z) ? e(a) : e(o, -1);
			}), l(r), g(e, r);
		};
		h(p, (e) => {
			(y(Z) ? y(Q).length : y(Vt)?.length) && e(_);
		});
		var v = S(p, 2), te = (e) => {
			var t = Fe(), n = S(x(t));
			l(t), C(() => c(n, ` ${y(P).loading ?? ""}`)), g(e, t);
		}, b = (e) => {
			var t = Le(), n = x(t), r = w(n, !0), i = S(n), a = (e) => {
				var t = Ie(), n = w(t, !0);
				C(() => {
					t.disabled = y(Y), c(n, y(P).folderRetry);
				}), T("click", t, () => Jt(!1)), g(e, t);
			};
			h(i, (e) => {
				y($) || e(a);
			}), l(t), C(() => c(r, y($) ? y(P)[y($)] : y(P).folderLoadFailed)), g(e, t);
		}, ne = (e) => {
			var t = Re(), n = w(t, !0);
			C(() => c(n, y(P).folderNoSources)), g(e, t);
		}, re = (e) => {
			var t = Re(), n = w(t, !0);
			C(() => c(n, y(Z) ? y(P).folderNoSubfolders : y(P).folderWatchedEmpty)), g(e, t);
		}, ae = (e) => {
			var t = ze(), n = w(t, !0);
			C(() => {
				t.disabled = y(Y), c(n, y(P).loadMore);
			}), T("click", t, Zt), g(e, t);
		};
		h(v, (e) => {
			y(Ut) ? e(te) : y(Wt) ? e(b, 1) : D() ? y(qt) ? e(re, 3) : y(Z) && y(Ht) && e(ae, 4) : e(ne, 2);
		}), l(r), C(() => {
			m(i, "aria-label", y(P).folderWatchedRoot), s.disabled = y(Y), m(s, "aria-current", y(Z) ? void 0 : "location"), c(u, y(P).folderWatchedRoot);
		}), T("click", s, () => Xt(null)), g(e, r);
	}, hn = (e) => {
		var t = Ue(), n = ie(t), r = S(x(n), 2), i = x(r), a = S(i), o = w(a, !0);
		l(r), l(n);
		var s = S(n, 2), u = (e) => {
			var t = Ve();
			te(t, (e) => E(Ft, e), () => y(Ft)), T("change", t, Lt), g(e, t);
		}, d = (e) => {
			var t = He();
			te(t, (e) => E(Ft, e), () => y(Ft)), T("change", t, Lt), g(e, t);
		};
		h(s, (e) => {
			y(R) === "computer" ? e(u) : e(d, -1);
		}), C(() => {
			m(n, "aria-describedby", y(yt) ? "af-hint" : void 0), m(n, "aria-disabled", y(Y) ? "true" : void 0), m(n, "data-dragging", y(ut) ? "" : void 0), c(i, `${(y(R) === "computer" ? y(P).folderDrop : y(P).dropFiles) ?? ""} `), c(o, y(R) === "computer" ? y(P).folderBrowse : y(P).browse);
		}), T("click", n, It), ae("dragenter", n, zt), ae("dragover", n, zt), ae("dragleave", n, () => E(ut, !1)), ae("drop", n, Bt), g(e, t);
	};
	h(pn, (e) => {
		y(R) === "watched" ? e(mn) : e(hn, -1);
	});
	var gn = S(pn, 2), _n = (e) => {
		var t = Ge(), n = x(t), r = (e) => {
			var t = We();
			C((e) => {
				m(t, "max", e), u(t, y(W).stored), m(t, "aria-label", y(P).uploading), m(t, "aria-valuetext", y(bt));
			}, [() => Math.max(y(W).total, 1)]), g(e, t);
		}, i = (e) => {
			var t = We();
			C(() => {
				m(t, "aria-label", y(P).uploading), m(t, "aria-valuetext", y(bt));
			}), g(e, t);
		};
		h(n, (e) => {
			y(W) ? e(r) : e(i, -1);
		});
		var a = S(n, 2), o = w(a, !0), s = S(a, 2), d = w(s, !0);
		l(t), C(() => {
			c(o, y(bt)), c(d, y(P).cancel);
		}), T("click", s, Nt), g(e, t);
	};
	h(gn, (e) => {
		y(U) && e(_n);
	});
	var vn = S(gn, 2), yn = x(vn), bn = w(yn, !0), xn = S(yn, 2), Sn = (e) => {
		var t = Ke(), n = w(t, !0);
		C(() => {
			t.disabled = !!fe(), c(n, y(P).folderRetry);
		}), T("click", t, Pt), g(e, t);
	};
	h(xn, (e) => {
		y(G) && !y(K) && e(Sn);
	}), l(vn);
	var Cn = S(vn, 2), wn = (e) => {
		var t = qe(), n = x(t);
		be(n);
		var r = S(n), i = w(r, !0);
		l(t), C(() => c(i, y(it))), g(e, t);
	};
	h(Cn, (e) => {
		y(it) && e(wn);
	});
	var Tn = S(Cn, 2), En = (e) => {
		var r = tt(), i = x(r), a = (e) => {
			var t = Je(), n = x(t), r = w(n, !0), i = S(n, 2), a = w(i, !0);
			l(t), C(() => {
				c(r, y(P).folderRefusal), c(a, y(an));
			}), g(e, t);
		};
		h(i, (e) => {
			y(V)?.refusal && e(a);
		});
		var o = S(i, 2), u = (e) => {
			var r = Xe();
			t(r, 21, () => y(nn), ([e, t]) => e, (e, t) => {
				var r = n(() => s(y(t), 2));
				let i = () => y(r)[0], a = () => y(r)[1];
				var o = Ye(), u = x(o), d = w(u, !0), f = S(u, 2), p = w(f, !0);
				l(o), C((e) => {
					c(d, i()), c(p, e);
				}, [() => F(a())]), g(e, o);
			}), l(r), g(e, r);
		};
		h(o, (e) => {
			y(nn).length && e(u);
		});
		var d = S(o, 2), f = (e) => {
			var t = Ze(), n = x(t), r = w(n, !0), i = S(n, 2), a = w(i, !0);
			l(t), C((e) => {
				c(r, y(P).folderSample), c(a, e);
			}, [() => y(V).sample_keys.join(", ")]), g(e, t);
		};
		h(d, (e) => {
			y(V)?.sample_keys.length && e(f);
		});
		var p = S(d, 2), ee = (e) => {
			var n = $e();
			t(n, 21, () => y(rn), (e) => e.code, (e, t) => {
				var n = Qe(), r = x(n), i = w(r, !0), a = S(r, 2), o = w(a, !0);
				l(n), C((e) => {
					m(n, "data-code", y(t).code), c(i, y(t).label), c(o, e);
				}, [() => F(y(t).count)]), g(e, n);
			}), l(n), C(() => m(n, "aria-label", y(P).folderLeftOut)), g(e, n);
		};
		h(p, (e) => {
			y(rn).length && e(ee);
		});
		var _ = S(p, 2), v = (e) => {
			var t = et(), n = w(t, !0);
			C(() => c(n, y(Ct))), g(e, t);
		};
		h(_, (e) => {
			y(H).length && e(v);
		}), l(r), C(() => m(r, "aria-label", y(P).folderPreview)), g(e, r);
	};
	return h(Tn, (e) => {
		y(B) && (y(V) || y(H).length) && e(En);
	}), l(ln), C(() => {
		m(un, "aria-label", y(P).folderSource), m(yn, "data-tone", y(G) || y(ot) ? "danger" : void 0), m(yn, "data-spoken", y(St) ? "" : void 0), c(bn, y(xt));
	}), g(f, sn), r(on);
}
se(["click", "change"]), ne(B, {
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
export { j as _, _e as a, he as c, N as d, me as f, de as g, pe as h, I as i, P as l, fe as m, ye as n, ve as o, k as p, ge as r, F as s, B as t, A as u };
