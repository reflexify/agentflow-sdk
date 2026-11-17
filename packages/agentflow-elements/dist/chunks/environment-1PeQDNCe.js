//#region src/kit/environment.ts
function e(e, t, n, r = {}) {
	return e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0,
		composed: !1,
		cancelable: r.cancelable ?? !1
	}));
}
function t(e, t, n) {
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
function n() {
	let e = document.activeElement;
	for (; e?.shadowRoot?.activeElement;) e = e.shadowRoot.activeElement;
	return e instanceof HTMLElement ? e : null;
}
function r(e, t) {
	for (let n = t; n;) {
		if (n === e) return !0;
		let t = n.getRootNode();
		n = n.parentNode ?? (t instanceof ShadowRoot ? t.host : null);
	}
	return !1;
}
var i = [];
function a(e) {
	for (let t = i.length - 1; t >= 0; t--) {
		if (i[t].isConnected) return i[t] === e;
		i.splice(t, 1);
	}
	return !1;
}
function o(e) {
	let t = null;
	return (a, o) => {
		if (a) {
			if (o && !a.open) t = n(), a.showModal(), i.push(e);
			else if (!o && a.open) {
				a.close();
				let o = i.lastIndexOf(e);
				o >= 0 && i.splice(o, 1);
				let s = t;
				t = null;
				let c = n();
				s?.isConnected && (!c || c === document.body || r(e, c)) && s.focus({ preventScroll: !0 });
			}
		}
	};
}
function s(e, t) {
	for (let n = t; n;) {
		if (n === e) return !0;
		n = n instanceof Element && n.assignedSlot || n.parentNode || (n instanceof ShadowRoot ? n.host : null);
	}
	return !1;
}
function c(e) {
	for (let t = e; t; t = t.parentNode ?? (t instanceof ShadowRoot ? t.host : null)) {
		if (!(t instanceof Element) || !t.hasAttribute("dir")) continue;
		let e = t.getAttribute("dir").toLowerCase();
		if (e === "rtl" || e === "ltr") return e;
		break;
	}
	return getComputedStyle(e).direction === "rtl" ? "rtl" : "ltr";
}
//#endregion
export { a, r as c, e as i, c as n, o, s as r, t as s, n as t };
