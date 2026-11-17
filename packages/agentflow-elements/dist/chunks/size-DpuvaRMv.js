import { r as e } from "./text-DY1VEJ9L.js";
//#region src/kit/size.ts
function t(t) {
	let n = e(t) ? "vi-VN" : "en-GB", r = (e) => new Intl.NumberFormat(n, {
		style: "unit",
		unit: e,
		unitDisplay: "short",
		maximumFractionDigits: 1
	}), i = new Intl.NumberFormat(n, { maximumFractionDigits: 0 }), a = r("kilobyte"), o = r("megabyte");
	return (e) => e == null || !Number.isFinite(e) || e < 0 ? "" : e < 1024 ? `${i.format(e)} B` : e < 1048576 ? a.format(e / 1024) : o.format(e / 1024 / 1024);
}
//#endregion
export { t };
