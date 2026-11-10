//#region src/format.ts
var e = /^\d{4}-\d{2}-\d{2}$/, t = /^\d{4}-\d{2}-\d{2}T/;
function n(t) {
	if (!e.test(t)) return null;
	let [n, r, i] = t.split("-").map(Number), a = new Date(n, r - 1, i);
	return a.getFullYear() === n && a.getMonth() === r - 1 && a.getDate() === i ? a : null;
}
function r(t, r) {
	if (!t) return "";
	if (e.test(t)) {
		let e = n(t);
		return e ? new Intl.DateTimeFormat(r, { dateStyle: "medium" }).format(e) : "";
	}
	let i = new Date(t);
	return Number.isNaN(i.getTime()) ? "" : new Intl.DateTimeFormat(r, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(i);
}
function i(n, a, o) {
	if (n == null) return "";
	if (typeof n == "boolean") return o(n ? "common.yes" : "common.no");
	if (typeof n == "number") return new Intl.NumberFormat(a, { maximumSignificantDigits: 15 }).format(n);
	if (typeof n == "string") return (e.test(n) || t.test(n)) && r(n, a) || n;
	if (Array.isArray(n)) return n.map((e) => i(e, a, o)).join(", ");
	let s = JSON.stringify(n);
	return s.length > 80 ? `${s.slice(0, 79)}…` : s;
}
//#endregion
export { r as n, n as r, i as t };
