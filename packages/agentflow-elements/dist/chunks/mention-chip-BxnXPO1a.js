//#region src/kit/mention-chip.ts
var e = (e) => e.more?.group ?? e.scope?.group ?? null;
function t(e) {
	let t = Array.from(e.trim())[0];
	return t ? t.toUpperCase() : "?";
}
var n = "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5", r = "http://www.w3.org/2000/svg";
function i() {
	let e = document.createElementNS(r, "svg");
	e.setAttribute("viewBox", "0 0 24 24"), e.setAttribute("width", "12"), e.setAttribute("height", "12"), e.setAttribute("fill", "none"), e.setAttribute("stroke", "currentColor"), e.setAttribute("stroke-width", "2"), e.setAttribute("aria-hidden", "true"), e.setAttribute("part", "mention-icon");
	let t = document.createElementNS(r, "path");
	return t.setAttribute("d", n), e.append(t), e;
}
function a(e, t, n, r) {
	let i = e.split("/")[0];
	return n ? n.state === "ok" ? {
		state: "ok",
		text: n.label,
		href: n.kind === "record" ? n.href : null
	} : n.state === "deleted" ? {
		state: "deleted",
		text: i === "record" ? "" : t,
		href: null
	} : {
		state: "restricted",
		text: "",
		href: null
	} : r === "own" ? {
		state: "ok",
		text: t,
		href: null
	} : {
		state: r,
		text: r === "unresolved" ? t : "",
		href: null
	};
}
function o(e, t, n) {
	return t.state === "restricted" ? e === "user" ? n.mentionRestrictedPerson : n.mentionRestricted : t.state === "deleted" && t.text === "" ? n.mentionDeleted : t.text;
}
function s(e, t, n, r, i = !1) {
	let s = e.split("/")[0], c = a(e, t, n?.[e], i ? "own" : "restricted");
	return {
		kind: s,
		state: c.state === "unresolved" ? "restricted" : c.state,
		label: o(s, c, r),
		href: c.href
	};
}
function c(e, n, r, a = document) {
	let s = e.split("/")[0], { state: c, text: l, href: u } = n, d = a.createElement("span");
	d.className = "af-mention", d.setAttribute("part", "mention"), d.setAttribute("data-mention", e), d.setAttribute("data-kind", s), d.setAttribute("data-state", c);
	let f = a.createElement("span");
	if (f.className = "af-mention-label", f.textContent = o(s, n, r), c === "restricted") return d.append(f), d;
	if (s === "user") {
		let e = a.createElement("span");
		return e.className = "af-avatar af-mention-avatar", e.setAttribute("aria-hidden", "true"), e.textContent = t(l), d.append(e, f), d;
	}
	if (s === "record" && d.append(i()), u && c === "ok") {
		let e = a.createElement("a");
		e.className = "af-mention-link", e.setAttribute("href", u), e.append(f), d.append(e);
	} else d.append(f);
	return d;
}
function l(e, t, n, r = document) {
	let i = c(e, a(e, t, n.map?.[e], n.inserted.has(e) ? "own" : "restricted"), n.strings, r);
	return i.contentEditable = "false", i;
}
var u = (e) => e.storage.mention;
function d(e, t) {
	let n = u(e);
	if (n) {
		n.map = t.map, n.strings = t.strings;
		for (let e of n.views) e.render();
	}
}
//#endregion
export { t as a, d as c, e as i, u as l, c as n, a as o, l as r, s, n as t };
