//#region src/kit/mention-token.ts
var e = [
	"record",
	"dashboard",
	"entity",
	"user"
], t = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function n(e) {
	let t = "";
	for (let n of e) t += n === "\\" || n === "[" || n === "]" ? `\\${n}` : n === "\n" || n === "\r" ? " " : n;
	return t;
}
var r = (e, t) => `@[${n(t)}](mention:${e})`;
function i(n) {
	let [r = "", ...i] = n.split("/");
	return !e.includes(r) || i.length !== (r === "record" ? 2 : 1) || !i.every((e) => t.test(e)) ? null : [r, ...i.map((e) => e.toLowerCase())].join("/");
}
function a(e) {
	let t = "";
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		if (r === "\\") {
			if (n += 1, n >= e.length) return null;
			let r = e[n];
			if (r === "\n" || r === "\r") return null;
			t += r;
		} else if (r === "]") return {
			label: t,
			end: n + 1
		};
		else if (r === "[" || r === "\n" || r === "\r") return null;
		else t += r;
	}
	return null;
}
function o(e) {
	if (!e.startsWith("@[")) return null;
	let t = a(e.slice(2));
	if (!t) return null;
	let n = 2 + t.end;
	if (!e.startsWith("(mention:", n)) return null;
	let r = n + 9, o = e.indexOf(")", r);
	if (o < 0) return null;
	let s = i(e.slice(r, o));
	return s ? {
		raw: e.slice(0, o + 1),
		ref: s,
		label: t.label
	} : null;
}
//#endregion
export { r as n, o as t };
