//#region src/kit/escape.ts
var e = Symbol.for("af-kit.escape-claimed"), t = /* @__PURE__ */ new Set([
	"af-menu",
	"af-popover",
	"af-select",
	"af-combobox",
	"af-date",
	"af-person-picker",
	"af-tree-picker",
	"af-rich-editor"
]), n = /* @__PURE__ */ new Set(["af-dialog", "af-confirm"]);
function r(e, r) {
	let i = e.localName;
	return n.has(i) ? e.open === !0 : e.getAttribute("data-raised") === "true" ? i === "af-tooltip" ? r.includes(e) : t.has(i) : !1;
}
function i(e, t) {
	for (let n of e.querySelectorAll("*")) if (r(n, t) || n.shadowRoot && i(n.shadowRoot, t)) return !0;
	return !1;
}
function a(t, n) {
	if (t.key !== "Escape" || t.isComposing) return !1;
	let r = t.composedPath(), a = n ? !!n.shadowRoot && i(n.shadowRoot, r) || i(n, r) : i(t.target?.ownerDocument ?? document, r);
	return a && Object.defineProperty(t, e, {
		value: !0,
		configurable: !0
	}), a;
}
function o(t) {
	return t[e] === !0;
}
//#endregion
export { a as claimEscape, o as isClaimed };
