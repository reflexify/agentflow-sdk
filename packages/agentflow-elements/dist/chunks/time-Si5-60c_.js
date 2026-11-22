import { r as e } from "./text-CDgi_cJ8.js";
//#region src/kit/time.ts
var t = [
	["year", 31536e3],
	["month", 2592e3],
	["week", 604800],
	["day", 86400],
	["hour", 3600],
	["minute", 60]
];
function n(n) {
	let r = new Intl.RelativeTimeFormat(e(n) ? "vi" : "en", { numeric: "auto" }), i = new Intl.DateTimeFormat(e(n) ? "vi-VN" : "en-GB", {
		dateStyle: "medium",
		timeStyle: "short"
	});
	return {
		since(e, n) {
			let i = new Date(e).getTime();
			if (Number.isNaN(i)) return e;
			let a = Math.min(0, (i - n) / 1e3);
			for (let [e, n] of t) if (Math.abs(a) >= n) return r.format(Math.trunc(a / n), e);
			return r.format(Math.trunc(a), "second");
		},
		moment(e) {
			let t = new Date(e);
			return Number.isNaN(t.getTime()) ? void 0 : i.format(t);
		}
	};
}
//#endregion
export { n as t };
