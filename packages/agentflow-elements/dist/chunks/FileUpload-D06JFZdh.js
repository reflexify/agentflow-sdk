import { t as e } from "./rolldown-runtime-Dy4uBu1J.js";
import { $ as t, Ct as n, I as r, It as i, Lt as a, Nt as o, Ot as s, Pt as c, Q as l, R as u, T as d, V as f, W as p, X as m, Y as h, Z as g, _, dt as v, et as ee, g as y, gt as b, ht as x, j as te, kt as S, mt as C, nt as w, ot as T, pt as E, rt as ne, st as re, tt as ie, ut as D, v as O, wt as k, xt as ae, y as A, yt as j } from "./version-Cw97ZDNW.js";
import { a as oe, i as se, n as ce, o as le, t as M } from "./text-B-lRGRNn.js";
import { i as ue } from "./environment-1PeQDNCe.js";
import { I as N, Mt as de, V as fe, a as P, at as F, b as I, c as L, d as R, et as z, ft as B, g as V, h as H, ht as pe, i as me, l as he, n as ge, o as U, pt as _e, r as ve, s as W, u as G, ut as K, vt as ye } from "./use-locale-context-9YfTvPVv.js";
import { t as be } from "./size-6kmdTn6U.js";
//#region src/kit/form/associate.ts
var q = /* @__PURE__ */ new WeakMap(), J = /* @__PURE__ */ new WeakMap(), xe = /* @__PURE__ */ new WeakMap();
function Se(e) {
	let t = e;
	return class extends t {
		static formAssociated = !0;
		internals;
		constructor() {
			super(), this.internals = this.attachInternals(), q.set(this, this.internals);
		}
		get form() {
			return this.internals.form ?? null;
		}
		get validity() {
			return this.internals.validity;
		}
		get validationMessage() {
			return this.internals.validationMessage;
		}
		get willValidate() {
			return this.internals.willValidate;
		}
		checkValidity() {
			return this.internals.checkValidity();
		}
		reportValidity() {
			return this.internals.reportValidity();
		}
		focus(e) {
			let t = this.shadowRoot?.querySelector("[part~=\"input\"]");
			t ? t.focus(e) : super.focus(e);
		}
		formResetCallback() {
			J.get(this)?.reset();
		}
		formDisabledCallback(e) {
			xe.set(this, e), J.get(this)?.disabled(e);
		}
	};
}
function Ce(e, t) {
	let n = q.get(e);
	if (!n || typeof n.setFormValue != "function") return;
	let { name: r, value: i } = t;
	if (Array.isArray(i)) {
		if (r) {
			let e = new FormData();
			for (let t of i) e.append(r, t);
			n.setFormValue(e);
		} else n.setFormValue(null);
	} else n.setFormValue(i);
	Object.values(t.validity).some(Boolean) ? n.setValidity(t.validity, t.message || M.en.valueMissing, t.anchor ?? void 0) : n.setValidity({});
}
function we(e, t) {
	J.set(e, t), xe.get(e) && t.disabled(!0);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+dom-query@1.43.3/node_modules/@zag-js/dom-query/dist/visually-hidden.mjs
var Te = {
	border: "0",
	clip: "rect(0 0 0 0)",
	height: "1px",
	margin: "-1px",
	overflow: "hidden",
	padding: "0",
	position: "absolute",
	width: "1px",
	whiteSpace: "nowrap",
	wordWrap: "normal"
};
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/cache.mjs
function Ee(e) {
	let t = /* @__PURE__ */ new Map();
	return function(n, r) {
		let i = n + (r ? Object.entries(r).sort((e, t) => e[0] < t[0] ? -1 : 1).join() : "");
		if (t.has(i)) return t.get(i);
		let a = new e(n, r);
		return t.set(i, a), a;
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/format-number.mjs
var De = Ee(Intl.NumberFormat);
function Oe(e, t, n = {}) {
	return De(t, n).format(e);
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+i18n-utils@1.43.3/node_modules/@zag-js/i18n-utils/dist/format-bytes.mjs
var ke = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera"
], Ae = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera",
	"peta"
], je = (e, t = "en-US", n = {}) => {
	if (Number.isNaN(e)) return "";
	if (e === 0) return "0 B";
	let { unitSystem: r = "decimal", precision: i = 3, unit: a = "byte", unitDisplay: o = "short" } = n, s = r === "binary" ? 1024 : 1e3, c = a === "bit" ? ke : Ae, l = e < 0, u = Math.abs(e), d = 0;
	for (; u >= s && d < c.length - 1;) u /= s, d++;
	let f = parseFloat(u.toPrecision(i));
	return Oe(l ? -f : f, t, {
		style: "unit",
		unit: c[d] + a,
		unitDisplay: o
	});
}, [Me, Ne] = W({
	name: "FieldContext",
	strict: !1
}), [Pe, Fe] = W({ name: "FileUploadContext" }), Ie = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function Le(e, t) {
	S(t, !0);
	let r = _(t, "ref", 15, null), i = O(t, Ie), o = Fe(), c = k(() => U()(i, ["disableClick"])), l = k(() => a(T(c), 2)), u = k(() => T(l)[0]), d = k(() => T(l)[1]), f = k(() => G(o().getDropzoneProps(T(u)), T(d)));
	return L(e, A({ as: "div" }, () => T(f), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), s({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		}
	});
}
y(Le, { ref: {} }, [], [], { mode: "open" });
//#endregion
//#region ../../node_modules/.pnpm/@ark-ui+svelte@5.24.2_svelte@5.57.1/node_modules/@ark-ui/svelte/dist/components/file-upload/file-upload-hidden-input.svelte
var Re = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref"
]);
function ze(e, t) {
	S(t, !0);
	let r = _(t, "ref", 15, null), i = O(t, Re), a = Fe(), o = Ne(), c = k(() => G(a().getHiddenInputProps(), i));
	var l = {
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		}
	};
	{
		let t = k(() => o?.()?.ariaDescribedby);
		L(e, A({
			as: "input",
			get "aria-describedby"() {
				return T(t);
			}
		}, () => T(c), {
			get ref() {
				return r();
			},
			set ref(e) {
				r(e);
			}
		}));
	}
	return s(l);
}
y(ze, { ref: {} }, [], [], { mode: "open" });
var Y = P("file-upload").parts("root", "dropzone", "item", "itemDeleteTrigger", "itemGroup", "itemName", "itemPreview", "itemPreviewImage", "itemSizeText", "label", "trigger", "clearTrigger").build(), Be = (e) => typeof e.getAsEntry == "function" ? e.getAsEntry() : typeof e.webkitGetAsEntry == "function" ? e.webkitGetAsEntry() : null, Ve = (e) => e.isDirectory, He = (e) => e.isFile, Ue = (e, t) => (Object.defineProperty(e, "relativePath", { value: t ? `${t}/${e.name}` : e.name }), e), We = (e, t) => Promise.all(Array.from(e).filter((e) => e.kind === "file").map((e) => {
	let n = Be(e);
	if (!n) return null;
	if (Ve(n) && t) return Ge(n.createReader(), `${n.name}`);
	if (He(n) && typeof e.getAsFile == "function") {
		let t = e.getAsFile();
		return Promise.resolve(t ? Ue(t, "") : null);
	}
	if (He(n)) return new Promise((e) => {
		n.file((t) => {
			e(Ue(t, ""));
		});
	});
}).filter((e) => e)), Ge = (e, t = "") => new Promise((n) => {
	let r = [], i = () => {
		e.readEntries((e) => {
			if (e.length === 0) {
				n(Promise.all(r).then((e) => e.flat()));
				return;
			}
			let a = e.map((e) => {
				if (!e) return null;
				if (Ve(e)) return Ge(e.createReader(), `${t}${e.name}`);
				if (He(e)) return new Promise((n) => {
					e.file((e) => {
						n(Ue(e, t));
					});
				});
			}).filter((e) => e);
			r.push(Promise.all(a)), i();
		});
	};
	i();
});
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/get-accept-attr.mjs
function Ke(e) {
	return e === "audio/*" || e === "video/*" || e === "image/*" || e === "text/*" || /\w+\/[-+.\w]+/g.test(e);
}
function qe(e) {
	return /^.*\.[\w]+$/.test(e);
}
var Je = (e) => Ke(e) || qe(e);
function Ye(e) {
	if (e != null) return typeof e == "string" ? e : Array.isArray(e) ? e.filter(Je).join(",") : Object.entries(e).reduce((e, [t, n]) => [
		...e,
		t,
		...n
	], []).filter(Je).join(",");
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/is-file-equal.mjs
var X = (e, t) => e.name === t.name && e.size === t.size && e.type === t.type, Z = (e) => e != null;
function Xe(e, t, n) {
	if (Z(e.size)) {
		if (Z(t) && Z(n)) {
			if (e.size > n) return [!1, "FILE_TOO_LARGE"];
			if (e.size < t) return [!1, "FILE_TOO_SMALL"];
		} else if (Z(t) && e.size < t) return [!1, "FILE_TOO_SMALL"];
		else if (Z(n) && e.size > n) return [!1, "FILE_TOO_LARGE"];
	}
	return [!0, null];
}
var Ze = new Map("3g2_video/3gpp2[3gp,3gpp_video/3gpp[3mf_model/3mf[7z_application/x-7z-compressed[aac_audio/aac[ac_application/pkix-attr-cert[adp_audio/adpcm[adts_audio/aac[ai_application/postscript[aml_application/automationml-aml+xml[amlx_application/automationml-amlx+zip[amr_audio/amr[apk_application/vnd.android.package-archive[apng_image/apng[appcache,manifest_text/cache-manifest[appinstaller_application/appinstaller[appx_application/appx[appxbundle_application/appxbundle[asc_application/pgp-keys[atom_application/atom+xml[atomcat_application/atomcat+xml[atomdeleted_application/atomdeleted+xml[atomsvc_application/atomsvc+xml[au,snd_audio/basic[avi_video/x-msvideo[avci_image/avci[avcs_image/avcs[avif_image/avif[aw_application/applixware[bdoc_application/bdoc[bin,bpk,buffer,deb,deploy,dist,distz,dll,dmg,dms,dump,elc,exe,img,iso,lrf,mar,msi,msm,msp,pkg,so_application/octet-stream[bmp,dib_image/bmp[btf,btif_image/prs.btif[bz2_application/x-bzip2[c_text/x-c[ccxml_application/ccxml+xml[cdfx_application/cdfx+xml[cdmia_application/cdmi-capability[cdmic_application/cdmi-container[cdmid_application/cdmi-domain[cdmio_application/cdmi-object[cdmiq_application/cdmi-queue[cer_application/pkix-cert[cgm_image/cgm[cjs_application/node[class_application/java-vm[coffee,litcoffee_text/coffeescript[conf,def,in,ini,list,log,text,txt_text/plain[cpp,cxx,cc_text/x-c++src[cpl_application/cpl+xml[cpt_application/mac-compactpro[crl_application/pkix-crl[css_text/css[csv_text/csv[cu_application/cu-seeme[cwl_application/cwl[cww_application/prs.cww[davmount_application/davmount+xml[dbk_application/docbook+xml[doc_application/msword[docx_application/vnd.openxmlformats-officedocument.wordprocessingml.document[dsc_text/prs.lines.tag[dssc_application/dssc+der[dtd_application/xml-dtd[dwd_application/atsc-dwd+xml[ear,jar,war_application/java-archive[ecma_application/ecmascript[emf_image/emf[eml,mime_message/rfc822[emma_application/emma+xml[emotionml_application/emotionml+xml[eot_application/vnd.ms-fontobject[eps,ps_application/postscript[epub_application/epub+zip[exi_application/exi[exp_application/express[exr_image/aces[ez_application/andrew-inset[fdf_application/fdf[fdt_application/fdt+xml[fits_image/fits[flac_audio/flac[flv_video/x-flv[g3_image/g3fax[geojson_application/geo+json[gif_image/gif[glb_model/gltf-binary[gltf_model/gltf+json[gml_application/gml+xml[go_text/x-go[gpx_application/gpx+xml[gz_application/gzip[h_text/x-h[h261_video/h261[h263_video/h263[h264_video/h264[heic_image/heic[heics_image/heic-sequence[heif_image/heif[heifs_image/heif-sequence[htm,html,shtml_text/html[ico_image/x-icon[icns_image/x-icns[ics,ifb_text/calendar[iges,igs_model/iges[ink,inkml_application/inkml+xml[ipa_application/octet-stream[java_text/x-java-source[jp2,jpg2_image/jp2[jpeg,jpe,jpg_image/jpeg[jpf,jpx_image/jpx[jpm,jpgm_image/jpm[jpgv_video/jpeg[jph_image/jph[js,mjs_text/javascript[json_application/json[json5_application/json5[jsonld_application/ld+json[jsx_text/jsx[jxl_image/jxl[jxr_image/jxr[ktx_image/ktx[ktx2_image/ktx2[less_text/less[m1v,m2v,mpe,mpeg,mpg_video/mpeg[m4a_audio/mp4[m4v_video/x-m4v[md,markdown_text/markdown[mid,midi,kar,rmi_audio/midi[mkv_video/x-matroska[mp2,mp2a,mp3,mpga,m3a,m2a_audio/mpeg[mp4,mp4v,mpg4_video/mp4[mp4a_audio/mp4[mp4s,m4p_application/mp4[odp_application/vnd.oasis.opendocument.presentation[oda_application/oda[ods_application/vnd.oasis.opendocument.spreadsheet[odt_application/vnd.oasis.opendocument.text[oga,ogg,opus,spx_audio/ogg[ogv_video/ogg[ogx_application/ogg[otf_font/otf[p12,pfx_application/x-pkcs12[pdf_application/pdf[pem_application/x-pem-file[php_text/x-php[png_image/png[ppt_application/vnd.ms-powerpoint[pptx_application/vnd.openxmlformats-officedocument.presentationml.presentation[pskcxml_application/pskc+xml[psd_image/vnd.adobe.photoshop[py_text/x-python[qt,mov_video/quicktime[rar_application/vnd.rar[rdf_application/rdf+xml[rtf_text/rtf[sass_text/x-sass[scss_text/x-scss[sgm,sgml_text/sgml[sh_application/x-sh[svg,svgz_image/svg+xml[swf_application/x-shockwave-flash[tar_application/x-tar[tif,tiff_image/tiff[toml_application/toml[ts_video/mp2t[tsx_text/tsx[tsv_text/tab-separated-values[ttc_font/collection[ttf_font/ttf[vtt_text/vtt[wasm_application/wasm[wav_audio/wav[weba_audio/webm[webm_video/webm[webmanifest_application/manifest+json[webp_image/webp[wma_audio/x-ms-wma[wmv_video/x-ms-wmv[woff_font/woff[woff2_font/woff2[xls_application/vnd.ms-excel[xlsx_application/vnd.openxmlformats-officedocument.spreadsheetml.sheet[xml_application/xml[xz_application/x-xz[yaml,yml_text/yaml[zip_application/zip".split("[").flatMap((e) => {
	let [t, n] = e.split("_");
	return t.split(",").map((e) => [e, n]);
}));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/get-file-mime-type.mjs
function Qe(e) {
	let t = e.split(".").pop();
	return t && Ze.get(t) || null;
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-utils@1.43.3/node_modules/@zag-js/file-utils/dist/is-valid-file-type.mjs
function $e(e, t) {
	if (e && t) {
		let n = Array.isArray(t) ? t : typeof t == "string" ? t.split(",") : [];
		if (n.length === 0) return !0;
		let r = e.name || "", i = (e.type || Qe(r) || "").toLowerCase(), a = i.replace(/\/.*$/, "");
		return n.some((e) => {
			let t = e.trim().toLowerCase();
			return t.charAt(0) === "." ? r.toLowerCase().endsWith(t) : t.endsWith("/*") ? a === t.replace(/\/.*$/, "") : i === t;
		});
	}
	return !0;
}
function et(e, t) {
	let n = e.type === "application/x-moz-file" || $e(e, t);
	return [n, n ? null : "FILE_INVALID_TYPE"];
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.dom.mjs
var tt = (e) => e.ids?.root ?? `file:${e.id}`, nt = (e) => e.ids?.dropzone ?? `file:${e.id}:dropzone`, rt = (e) => e.ids?.hiddenInput ?? `file:${e.id}:input`, it = (e) => e.ids?.trigger ?? `file:${e.id}:trigger`, at = (e) => e.ids?.label ?? `file:${e.id}:label`, ot = (e, t) => e.ids?.item?.(t) ?? `file:${e.id}:item:${t}`, st = (e, t) => e.ids?.itemName?.(t) ?? `file:${e.id}:item-name:${t}`, ct = (e, t) => e.ids?.itemSizeText?.(t) ?? `file:${e.id}:item-size:${t}`, lt = (e, t) => e.ids?.itemPreview?.(t) ?? `file:${e.id}:item-preview:${t}`, ut = (e, t) => e.ids?.itemDeleteTrigger?.(t) ?? `file:${e.id}:item-delete:${t}`, Q = (e) => pe(`${e.name}-${e.size}`), dt = (e) => e.getById(tt(e)), ft = (e) => e.getById(rt(e)), pt = (e) => e.getById(nt(e));
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.utils.mjs
function mt(e) {
	let t = I(e);
	return e.dataTransfer ? e.dataTransfer.types.some((e) => e === "Files" || e === "application/x-moz-file") : !!t && "files" in t;
}
function ht(e, t, n) {
	let { prop: r, computed: i } = e;
	return !i("multiple") && t > 1 ? !1 : !i("multiple") && t + n.length === 2 || !(t + n.length > r("maxFiles"));
}
function gt(e, t, n = [], r = []) {
	let { prop: i, computed: a } = e, o = [], s = [], c = {
		acceptedFiles: n,
		rejectedFiles: r
	};
	return t.forEach((e) => {
		let [t, r] = et(e, a("acceptAttr")), [l, u] = Xe(e, i("minFileSize"), i("maxFileSize")), d = n.some((t) => X(t, e)) || o.some((t) => X(t, e)), f = i("validate")?.(e, c), p = !f || f.length === 0;
		if (t && l && p && !d) o.push(e);
		else {
			let t = [r, u];
			d && t.push("FILE_EXISTS"), p || t.push(...f ?? []), s.push({
				file: e,
				errors: t.filter(Boolean)
			});
		}
	}), ht(e, o.length, n) || (o.forEach((e) => {
		s.push({
			file: e,
			errors: ["TOO_MANY_FILES"]
		});
	}), o.splice(0)), {
		acceptedFiles: o,
		rejectedFiles: s
	};
}
function _t(e, t) {
	let n = fe(e);
	try {
		if ("DataTransfer" in n) {
			let r = new n.DataTransfer();
			t.forEach((e) => {
				r.items.add(e);
			}), e.files = r.files;
		}
	} catch {}
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.connect.mjs
var vt = {
	dropzone: "dropzone",
	itemPreview: (e) => `preview of ${e.name}`,
	deleteFile: (e) => `delete file ${e.name}`
}, $ = "accepted", yt = "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";
function bt(e, t) {
	if (!e || e.getAttribute("type") === "file") return !1;
	let n = e.closest(yt);
	return n != t && N(t, n);
}
function xt(e, t) {
	let { state: n, send: r, prop: i, computed: a, scope: o, context: s } = e, c = !!i("disabled"), l = !!i("readOnly"), u = !!i("required"), d = i("allowDrop"), f = B(vt, i("translations")), p = n.matches("dragging"), m = n.matches("focused") && !c, h = s.get("acceptedFiles"), g = i("maxFiles");
	return {
		dragging: p,
		focused: m,
		disabled: c,
		readOnly: l,
		transforming: s.get("transforming"),
		maxFilesReached: h.length >= g,
		remainingFiles: Math.max(0, g - h.length),
		openFilePicker() {
			c || l || r({ type: "OPEN" });
		},
		deleteFile(e, t = $) {
			c || l || r({
				type: "FILE.DELETE",
				file: e,
				itemType: t
			});
		},
		acceptedFiles: h,
		rejectedFiles: s.get("rejectedFiles"),
		setFiles(e) {
			c || l || r({
				type: "FILES.SET",
				files: e,
				count: e.length
			});
		},
		clearRejectedFiles() {
			c || l || r({ type: "REJECTED_FILES.CLEAR" });
		},
		clearFiles() {
			c || l || r({ type: "FILES.CLEAR" });
		},
		getFileSize(e) {
			return je(e.size, i("locale"));
		},
		createFileUrl(e, t) {
			let n = o.getWin(), r = n.URL.createObjectURL(e);
			return t(r), () => n.URL.revokeObjectURL(r);
		},
		setClipboardFiles(e) {
			if (c || l) return !1;
			let t = Array.from(e?.items ?? []).reduce((e, t) => {
				if (t.kind !== "file") return e;
				let n = t.getAsFile();
				return n ? [...e, n] : e;
			}, []);
			return t.length ? (r({
				type: "FILE.SELECT",
				files: t
			}), !0) : !1;
		},
		getRootProps() {
			return t.element({
				...Y.root.attrs,
				dir: i("dir"),
				id: tt(o),
				"data-disabled": z(c),
				"data-readonly": z(l),
				"data-dragging": z(p)
			});
		},
		getDropzoneProps(e = {}) {
			return t.element({
				...Y.dropzone.attrs,
				dir: i("dir"),
				id: nt(o),
				tabIndex: c || l || e.disableClick ? void 0 : 0,
				role: e.disableClick ? "application" : "button",
				"aria-label": f.dropzone,
				"aria-disabled": c || l || void 0,
				"data-invalid": z(i("invalid")),
				"data-disabled": z(c),
				"data-readonly": z(l),
				"data-dragging": z(p),
				onKeyDown(t) {
					if (c || l || t.defaultPrevented) return;
					let n = I(t);
					N(t.currentTarget, n) && (bt(n, t.currentTarget) || e.disableClick || (t.key === "Enter" || t.key === " ") && r({
						type: "DROPZONE.CLICK",
						src: "keydown"
					}));
				},
				onClick(t) {
					if (c || l || t.defaultPrevented || e.disableClick) return;
					let n = I(t);
					N(t.currentTarget, n) && (bt(n, t.currentTarget) || (t.currentTarget.localName === "label" && t.preventDefault(), r({ type: "DROPZONE.CLICK" })));
				},
				onDragOver(e) {
					if (c || l || !d) return;
					e.preventDefault(), e.stopPropagation();
					try {
						e.dataTransfer.dropEffect = "copy";
					} catch {}
					if (!mt(e)) return;
					let t = e.dataTransfer.items.length;
					r({
						type: "DROPZONE.DRAG_OVER",
						count: t
					});
				},
				onDragLeave(e) {
					c || l || d && (N(e.currentTarget, e.relatedTarget) || r({ type: "DROPZONE.DRAG_LEAVE" }));
				},
				onDrop(e) {
					c || l || (d && (e.preventDefault(), e.stopPropagation()), mt(e) && We(e.dataTransfer.items, i("directory")).then((e) => {
						r({
							type: "DROPZONE.DROP",
							files: de(e)
						});
					}));
				},
				onFocus() {
					c || l || r({ type: "DROPZONE.FOCUS" });
				},
				onBlur() {
					c || l || r({ type: "DROPZONE.BLUR" });
				}
			});
		},
		getTriggerProps() {
			return t.button({
				...Y.trigger.attrs,
				dir: i("dir"),
				id: it(o),
				disabled: c || l,
				"data-disabled": z(c),
				"data-readonly": z(l),
				"data-invalid": z(i("invalid")),
				type: "button",
				onClick(e) {
					c || l || (N(pt(o), e.currentTarget) && e.stopPropagation(), r({ type: "OPEN" }));
				}
			});
		},
		getHiddenInputProps() {
			return t.input({
				id: rt(o),
				tabIndex: -1,
				disabled: c || l,
				type: "file",
				required: i("required"),
				capture: i("capture"),
				name: i("name"),
				accept: a("acceptAttr"),
				webkitdirectory: i("directory") ? "" : void 0,
				multiple: a("multiple") || i("maxFiles") > 1,
				"aria-hidden": !0,
				onClick(e) {
					e.stopPropagation(), e.currentTarget.value = "";
				},
				onInput(e) {
					if (c || l) return;
					let { files: t } = e.currentTarget;
					r({
						type: "FILE.SELECT",
						files: t ? Array.from(t) : []
					});
				},
				style: Te
			});
		},
		getItemGroupProps(e = {}) {
			let { type: n = $ } = e;
			return t.element({
				...Y.itemGroup.attrs,
				dir: i("dir"),
				"data-disabled": z(c),
				"data-type": n
			});
		},
		getItemProps(e) {
			let { file: n, type: r = $ } = e;
			return t.element({
				...Y.item.attrs,
				dir: i("dir"),
				id: ot(o, Q(n)),
				"data-disabled": z(c),
				"data-type": r
			});
		},
		getItemNameProps(e) {
			let { file: n, type: r = $ } = e;
			return t.element({
				...Y.itemName.attrs,
				dir: i("dir"),
				id: st(o, Q(n)),
				"data-disabled": z(c),
				"data-type": r
			});
		},
		getItemSizeTextProps(e) {
			let { file: n, type: r = $ } = e;
			return t.element({
				...Y.itemSizeText.attrs,
				dir: i("dir"),
				id: ct(o, Q(n)),
				"data-disabled": z(c),
				"data-type": r
			});
		},
		getItemPreviewProps(e) {
			let { file: n, type: r = $ } = e;
			return t.element({
				...Y.itemPreview.attrs,
				dir: i("dir"),
				id: lt(o, Q(n)),
				"data-disabled": z(c),
				"data-type": r
			});
		},
		getItemPreviewImageProps(e) {
			let { file: n, url: r, type: i = $ } = e;
			if (!n.type.startsWith("image/")) throw Error("Preview Image is only supported for image files");
			return t.img({
				...Y.itemPreviewImage.attrs,
				alt: f.itemPreview?.(n),
				src: r,
				"data-disabled": z(c),
				"data-type": i
			});
		},
		getItemDeleteTriggerProps(e) {
			let { file: n, type: a = $ } = e;
			return t.button({
				...Y.itemDeleteTrigger.attrs,
				dir: i("dir"),
				id: ut(o, Q(n)),
				type: "button",
				disabled: c || l,
				"data-disabled": z(c),
				"data-readonly": z(l),
				"data-type": a,
				"aria-label": f.deleteFile?.(n),
				onClick() {
					c || l || r({
						type: "FILE.DELETE",
						file: n,
						itemType: a
					});
				}
			});
		},
		getLabelProps() {
			return t.label({
				...Y.label.attrs,
				dir: i("dir"),
				id: at(o),
				htmlFor: rt(o),
				"data-disabled": z(c),
				"data-invalid": z(i("invalid")),
				"data-required": z(u)
			});
		},
		getClearTriggerProps() {
			return t.button({
				...Y.clearTrigger.attrs,
				dir: i("dir"),
				type: "button",
				disabled: c || l,
				hidden: h.length === 0,
				"data-disabled": z(c),
				"data-readonly": z(l),
				onClick(e) {
					e.defaultPrevented || c || l || r({ type: "FILES.CLEAR" });
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.pnpm/@zag-js+file-upload@1.43.3/node_modules/@zag-js/file-upload/dist/file-upload.machine.mjs
var St = F({
	props({ props: e }) {
		return {
			minFileSize: 0,
			maxFileSize: Infinity,
			maxFiles: 1,
			allowDrop: !0,
			preventDocumentDrop: !0,
			defaultAcceptedFiles: [],
			...e
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop: e, bindable: t, getContext: n }) {
		return {
			acceptedFiles: t(() => ({
				defaultValue: e("defaultAcceptedFiles"),
				value: e("acceptedFiles"),
				isEqual: (e, t) => e.length === t?.length && e.every((e, n) => X(e, t[n])),
				hash(e) {
					return e.map((e) => `${e.name}-${e.size}`).join(",");
				},
				onChange(t) {
					let r = n();
					e("onFileAccept")?.({ files: t }), e("onFileChange")?.({
						acceptedFiles: t,
						rejectedFiles: r.get("rejectedFiles")
					});
				}
			})),
			rejectedFiles: t(() => ({
				defaultValue: [],
				isEqual: (e, t) => e.length === t?.length && e.every((e, n) => X(e.file, t[n].file)),
				onChange(t) {
					let r = n();
					e("onFileReject")?.({ files: t }), e("onFileChange")?.({
						acceptedFiles: r.get("acceptedFiles"),
						rejectedFiles: t
					});
				}
			})),
			transforming: t(() => ({ defaultValue: !1 }))
		};
	},
	computed: {
		acceptAttr: ({ prop: e }) => Ye(e("accept")),
		multiple: ({ prop: e }) => e("maxFiles") > 1
	},
	watch({ track: e, context: t, action: n }) {
		e([() => t.hash("acceptedFiles")], () => {
			n(["syncInputElement"]);
		});
	},
	on: {
		"FILES.SET": { actions: ["setFiles"] },
		"FILE.SELECT": { actions: ["setEventFiles"] },
		"FILE.DELETE": { actions: ["removeFile"] },
		"FILES.CLEAR": { actions: ["clearFiles"] },
		"REJECTED_FILES.CLEAR": { actions: ["clearRejectedFiles"] }
	},
	effects: ["preventDocumentDrop"],
	states: {
		idle: { on: {
			OPEN: { actions: ["openFilePicker"] },
			"DROPZONE.CLICK": { actions: ["openFilePicker"] },
			"DROPZONE.FOCUS": { target: "focused" },
			"DROPZONE.DRAG_OVER": { target: "dragging" }
		} },
		focused: { on: {
			"DROPZONE.BLUR": { target: "idle" },
			OPEN: { actions: ["openFilePicker"] },
			"DROPZONE.CLICK": { actions: ["openFilePicker"] },
			"DROPZONE.DRAG_OVER": { target: "dragging" }
		} },
		dragging: { on: {
			"DROPZONE.DROP": {
				target: "idle",
				actions: ["setEventFiles"]
			},
			"DROPZONE.DRAG_LEAVE": { target: "idle" }
		} }
	},
	implementations: {
		effects: { preventDocumentDrop({ prop: e, scope: t }) {
			if (!e("preventDocumentDrop") || !e("allowDrop") || e("disabled")) return;
			let n = t.getDoc();
			return _e(V(n, "dragover", (e) => {
				e?.preventDefault();
			}, !1), V(n, "drop", (e) => {
				N(dt(t), I(e)) || e.preventDefault();
			}, !1));
		} },
		actions: {
			syncInputElement({ scope: e, context: t }) {
				queueMicrotask(() => {
					let n = ft(e);
					if (!n) return;
					_t(n, t.get("acceptedFiles"));
					let r = e.getWin();
					n.dispatchEvent(new r.Event("change", { bubbles: !0 }));
				});
			},
			openFilePicker({ scope: e }) {
				H(() => {
					ft(e)?.click();
				});
			},
			setFiles(e) {
				let { computed: t, context: n, event: r } = e, { acceptedFiles: i, rejectedFiles: a } = gt(e, r.files);
				n.set("acceptedFiles", t("multiple") ? i : i.length > 0 ? [i[0]] : []), n.set("rejectedFiles", a);
			},
			setEventFiles(e) {
				let { computed: t, context: n, event: r, prop: i } = e, a = n.get("acceptedFiles"), o = n.get("rejectedFiles"), { acceptedFiles: s, rejectedFiles: c } = gt(e, r.files, a, o), l = (e) => {
					if (t("multiple")) {
						n.set("acceptedFiles", (t) => [...t, ...e]), n.set("rejectedFiles", c);
						return;
					}
					if (e.length) {
						n.set("acceptedFiles", [e[0]]), n.set("rejectedFiles", c);
						return;
					}
					c.length && (n.set("acceptedFiles", n.get("acceptedFiles")), n.set("rejectedFiles", c));
				}, u = i("transformFiles");
				u ? (n.set("transforming", !0), u(s).then(l).catch((e) => {
					K(`[zag-js/file-upload] error transforming files
${e}`);
				}).finally(() => {
					n.set("transforming", !1);
				})) : l(s);
			},
			removeFile({ context: e, event: t }) {
				if (t.itemType === "rejected") {
					let n = e.get("rejectedFiles").filter((e) => !X(e.file, t.file));
					e.set("rejectedFiles", n);
				} else {
					let n = e.get("acceptedFiles").filter((e) => !X(e, t.file));
					e.set("acceptedFiles", n);
				}
			},
			clearRejectedFiles({ context: e }) {
				e.set("rejectedFiles", []);
			},
			clearFiles({ context: e }) {
				e.set("acceptedFiles", []), e.set("rejectedFiles", []);
			}
		}
	}
}), Ct = (e) => {
	let t = me(), n = ge(), r = Ne(), i = k(() => {
		let i = ye(e);
		return {
			ids: {
				label: r?.()?.ids.label,
				hiddenInput: r?.()?.ids.control
			},
			dir: n().dir,
			locale: n().locale,
			disabled: r?.()?.disabled,
			invalid: r?.()?.invalid,
			required: r?.()?.required,
			getRootNode: t().getRootNode,
			...i
		};
	}), a = he(St, () => T(i)), o = k(() => xt(a, R));
	return () => T(o);
}, wt = /* @__PURE__ */ new Set([
	"$$slots",
	"$$events",
	"$$legacy",
	"$$host",
	"ref",
	"value"
]);
function Tt(e, t) {
	S(t, !0);
	let r = _(t, "ref", 15, null), i = _(t, "value", 7), a = O(t, wt), o = k(() => G(i()().getRootProps(), a));
	return Pe(() => i()()), L(e, A({ as: "div" }, () => T(o), {
		get ref() {
			return r();
		},
		set ref(e) {
			r(e);
		}
	})), s({
		get ref() {
			return r();
		},
		set ref(e = null) {
			r(e), n();
		},
		get value() {
			return i();
		},
		set value(e) {
			i(e), n();
		}
	});
}
y(Tt, {
	ref: {},
	value: {}
}, [], [], { mode: "open" });
//#endregion
//#region src/kit/FileUpload.svelte
var Et = /* @__PURE__ */ e({ default: () => Qt }), Dt = (e, t = i) => {
	var n = Pt(), r = E(n), a = (e) => {
		var t = jt();
		o(2), m(e, t);
	}, s = (e) => {
		var n = Nt(), r = b(C(n), 2), i = (e) => {
			var t = Mt();
			o(2), m(e, t);
		};
		p(r, (e) => {
			t() === "text" && e(i);
		}), m(e, n);
	};
	p(r, (e) => {
		t() === "image" ? e(a) : e(s, -1);
	}), c(n), m(e, n);
}, Ot = [], kt = 5e3;
function At(e) {
	let t = e.split(".").pop()?.toLowerCase() ?? "";
	return [
		"pdf",
		"doc",
		"docx",
		"txt"
	].includes(t) ? "text" : [
		"jpg",
		"jpeg",
		"png",
		"gif",
		"webp"
	].includes(t) ? "image" : "file";
}
var jt = t("<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"></rect><circle cx=\"9\" cy=\"9\" r=\"2\"></circle><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"></path>", 1), Mt = t("<path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>", 1), Nt = t("<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"></path><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"></path><!>", 1), Pt = t("<svg part=\"icon\" viewBox=\"0 0 24 24\" width=\"14\" height=\"14\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><!></svg>"), Ft = l("<span id=\"af-described\" hidden=\"\"> </span>"), It = l("<span id=\"af-lead\" hidden=\"\"> </span>"), Lt = l("<svg class=\"glyph svelte-19e4ssx\" viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 3v12\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path></svg> <span class=\"lead svelte-19e4ssx\"> <span part=\"trigger\"> </span><!></span> <span part=\"hint\" id=\"af-hint\"> </span>", 1), Rt = l("<a class=\"thumb svelte-19e4ssx\" target=\"_blank\" rel=\"noopener\" tabindex=\"-1\" aria-hidden=\"true\"><img part=\"preview\" alt=\"\"/></a>"), zt = l("<img part=\"preview\" alt=\"\"/>"), Bt = l("<a part=\"name\" class=\"name svelte-19e4ssx\" target=\"_blank\" rel=\"noopener\"> </a>"), Vt = l("<span part=\"name\" class=\"name svelte-19e4ssx\"> </span>"), Ht = l("<span part=\"size\"> </span>"), Ut = l("<div part=\"progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><div class=\"fill svelte-19e4ssx\"></div></div>"), Wt = l("<span part=\"status\"> </span>"), Gt = l("<button type=\"button\" part=\"remove\"><svg viewBox=\"0 0 24 24\" width=\"12\" height=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M3 6h18\"></path><path d=\"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6\"></path><path d=\"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2\"></path><line x1=\"10\" x2=\"10\" y1=\"11\" y2=\"17\"></line><line x1=\"14\" x2=\"14\" y1=\"11\" y2=\"17\"></line></svg></button>"), Kt = l("<li part=\"item\"><!> <!> <!> <!> <!></li>"), qt = l("<ul part=\"list\"></ul>"), Jt = l("<p class=\"none svelte-19e4ssx\"> </p>"), Yt = l("<div class=\"af-kit upload svelte-19e4ssx\"><!> <!> <!> <div part=\"notice\" role=\"status\" aria-live=\"polite\"><!></div> <!></div>"), Xt = l("<!> <!>", 1), Zt = {
	hash: "svelte-19e4ssx",
	code: ":host {display:block;}.upload.svelte-19e4ssx {display:flex;flex-direction:column;gap:8px;font-size:12px;line-height:1.5;--fu-edge: color-mix(in oklab, var(--k-fg) calc(15% + var(--k-dark, 0) * 6%), var(--k-surface));--fu-soft: color-mix(in oklab, var(--k-muted) calc(60% + var(--k-dark, 0) * 25%), var(--k-surface));}.upload.svelte-19e4ssx > .root {display:contents;}[part~='dropzone'] {display:flex;box-sizing:border-box;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:16px 12px;border:2px dashed var(--fu-edge);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:color-mix(in oklab, var(--k-muted-bg) 40%, transparent);text-align:center;outline:none;cursor:pointer;transition-property:color, background-color, border-color, box-shadow;transition-duration:150ms;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1);}\n  @media (hover: hover) {[part~='dropzone']:hover {border-color:var(--fu-soft);} }[part~='dropzone'][data-dragging] {border-color:color-mix(in oklab, var(--k-primary) 60%, var(--k-surface));background-color:color-mix(in oklab, var(--k-primary) 4%, transparent);}[part~='dropzone'][data-invalid] {border-color:var(--k-danger);}[part~='dropzone']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='dropzone'][data-disabled] {opacity:0.5;cursor:not-allowed;}.glyph.svelte-19e4ssx {flex:none;color:var(--fu-soft);}.lead.svelte-19e4ssx {color:var(--k-fg);}[part~='trigger'] {margin-left:4px;color:var(--k-primary);font-weight:500;}\n  @media (hover: hover) {[part~='dropzone']:not([data-disabled]) [part~='trigger']:hover {text-decoration-line:underline;} }[part~='hint'] {color:var(--k-muted);font-size:10px;}[part~='notice'] {color:var(--k-danger);font-size:11.5px;}[part~='notice']:empty {margin-top:-8px;}[part~='list'] {box-sizing:border-box;margin:0;padding:0;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);list-style:none;}[part~='item'] {display:flex;box-sizing:border-box;align-items:center;gap:8px;padding:8px 12px;}[part~='item'] + [part~='item'] {border-top:1px solid var(--k-line);}[part~='icon'] {flex:none;width:14px;height:14px;color:var(--k-muted);}.thumb.svelte-19e4ssx {display:block;flex:none;}[part~='preview'] {display:block;box-sizing:border-box;flex:none;width:32px;height:32px;border:1px solid var(--k-line);border-radius:0.25rem;background-color:var(--k-surface);object-fit:cover;}.name.svelte-19e4ssx {flex:1 1 0%;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}a.name.svelte-19e4ssx {color:var(--k-primary);font-weight:500;text-decoration-line:none;border-radius:2px;outline:none;}\n  @media (hover: hover) {a.name.svelte-19e4ssx:hover {text-decoration-line:underline;} }a.name.svelte-19e4ssx:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='size'] {flex:none;color:var(--fu-soft);font-size:10px;}[part~='progress'] {position:relative;flex:none;width:64px;height:6px;overflow:hidden;border-radius:calc(infinity * 1px);background-color:color-mix(in oklab, var(--k-primary) 20%, transparent);}.fill.svelte-19e4ssx {width:100%;height:100%;background-color:var(--k-primary);transition:transform 150ms cubic-bezier(0.4, 0, 0.2, 1);}[part~='status'] {flex:none;color:var(--k-danger);font-size:10px;}[part~='remove'] {display:flex;box-sizing:border-box;flex:none;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:0;border-radius:0.25rem;background:none;color:var(--fu-soft);outline:none;cursor:pointer;}\n  @media (hover: hover) {[part~='remove']:not(:disabled):hover {background-color:color-mix(in oklab, var(--k-danger) 6%, var(--k-surface));color:var(--k-danger);} }[part~='remove']:focus-visible {box-shadow:0 0 0 3px var(--k-focus-ring);}[part~='remove']:disabled {opacity:0.5;cursor:not-allowed;}.none.svelte-19e4ssx {box-sizing:border-box;margin:0;padding:8px 12px;border:1px solid var(--k-line);border-radius:max(0px, calc(var(--k-radius) - 2px));background-color:var(--k-surface);color:var(--fu-soft);font-size:11.5px;font-style:italic;}\n  @media (prefers-reduced-motion: reduce) {[part~='dropzone'], .fill.svelte-19e4ssx {transition:none;} }\n  @media (forced-colors: active) {[part~='dropzone']:focus-visible, a.name.svelte-19e4ssx:focus-visible, [part~='remove']:focus-visible {outline:2px solid;outline-offset:2px;}\n  }"
};
function Qt(e, t) {
	let i = ee();
	S(t, !0), r(e, Zt);
	let a = _(t, "items", 23, () => []), o = _(t, "accept", 7, null), l = _(t, "multiple", 7, !1), y = _(t, "replace", 7, !1), w = _(t, "label", 7, null), O = _(t, "maxFiles", 7, null), A = _(t, "disabled", 7, !1), M = _(t, "locale", 7, null), N = _(t, "strings", 7, null), de = _(t, "name", 7, null), fe = _(t, "required", 7, !1), P = _(t, "readonly", 7, !1), F = _(t, "description", 7, null), I = _(t, "error", 7, null), L = _(t, "invalid", 7, !1), R = t.$$host, z = k(() => se(M(), N() ?? void 0)), B = k(() => a() ?? []), V = k(() => O() != null && Number(O()) >= 1), H = k(() => T(V) ? Math.floor(Number(O())) : l() ? Infinity : 1), pe = k(() => T(H) > 1 ? T(z).dropFiles : T(z).dropFile), me = k(() => !!y() && T(H) === 1), he = k(() => `${T(pe)} ${T(z).browse}`), ge = ae(!1), U = k(() => !!A() || T(ge)), _e = k(() => [F(), I()].filter(Boolean).join(" ")), W = ae(null), G = ae(null), K = ae(""), ye;
	async function q(e) {
		clearTimeout(ye), T(K) === e && (j(K, ""), await re()), j(K, e, !0), ye = setTimeout(() => j(K, ""), kt);
	}
	v(() => () => clearTimeout(ye));
	let J = null;
	function xe() {
		return J || (J = {
			accepted: [],
			rejected: []
		}, queueMicrotask(Se)), J;
	}
	function Se() {
		let { accepted: e, rejected: t } = J;
		if (J = null, T(G) && (T(G).value = ""), t.length && Te().clearRejectedFiles(), (T(V) && !T(me) ? T(B).filter((e) => e.status !== "failed").length : 0) + (e.length + t.filter((e) => !e.errors.includes("FILE_EXISTS")).length) > T(H)) {
			q(T(H) === 1 ? T(z).oneFileOnly : ce(T(z).fileCountRefused, { max: T(H) }));
			return;
		}
		let n = t.find((e) => e.errors.includes("FILE_INVALID_TYPE"));
		if (n) {
			q(ce(T(z).fileTypeRefused, { name: n.file.name }));
			return;
		}
		let r = t.find((e) => e.errors.includes("FILE_EXISTS"));
		r && q(ce(T(z).fileDuplicate, { name: r.file.name })), e.length && ue(R, "files-add", { files: e });
	}
	let Te = Ct(() => ({
		id: i,
		getRootNode: () => R.shadowRoot,
		accept: o() || void 0,
		maxFiles: T(H),
		disabled: T(U),
		readOnly: !!P(),
		invalid: !!L(),
		acceptedFiles: Ot,
		preventDocumentDrop: !1,
		translations: { dropzone: w() || T(he) },
		onFileAccept: (e) => {
			e.files.length && xe().accepted.push(...e.files);
		},
		onFileReject: (e) => {
			e.files.length && xe().rejected.push(...e.files);
		}
	}));
	v(() => {
		let e = T(W);
		if (!e || !(T(U) || P())) return;
		let t = (e) => e.preventDefault();
		return e.addEventListener("dragover", t), e.addEventListener("drop", t), () => {
			e.removeEventListener("dragover", t), e.removeEventListener("drop", t);
		};
	});
	let Ee = k(() => be(M())), De = (e) => Math.min(100, Math.max(0, Number(e.progress) || 0));
	v(() => {
		let e = T(B).filter((e) => e.status === "done").map((e) => e.id), t = !!fe() && e.length === 0;
		Ce(R, {
			name: de(),
			value: e,
			validity: t ? { valueMissing: !0 } : {},
			message: t ? oe(T(z), "valueMissing") : "",
			anchor: T(W)
		});
	}), we(R, {
		reset() {},
		disabled(e) {
			j(ge, e, !0);
		}
	});
	var Oe = {
		get items() {
			return a();
		},
		set items(e = []) {
			a(e), n();
		},
		get accept() {
			return o();
		},
		set accept(e = null) {
			o(e), n();
		},
		get multiple() {
			return l();
		},
		set multiple(e = !1) {
			l(e), n();
		},
		get replace() {
			return y();
		},
		set replace(e = !1) {
			y(e), n();
		},
		get label() {
			return w();
		},
		set label(e = null) {
			w(e), n();
		},
		get maxFiles() {
			return O();
		},
		set maxFiles(e = null) {
			O(e), n();
		},
		get disabled() {
			return A();
		},
		set disabled(e = !1) {
			A(e), n();
		},
		get locale() {
			return M();
		},
		set locale(e = null) {
			M(e), n();
		},
		get strings() {
			return N();
		},
		set strings(e = null) {
			N(e), n();
		},
		get name() {
			return de();
		},
		set name(e = null) {
			de(e), n();
		},
		get required() {
			return fe();
		},
		set required(e = !1) {
			fe(e), n();
		},
		get readonly() {
			return P();
		},
		set readonly(e = !1) {
			P(e), n();
		},
		get description() {
			return F();
		},
		set description(e = null) {
			F(e), n();
		},
		get error() {
			return I();
		},
		set error(e = null) {
			I(e), n();
		},
		get invalid() {
			return L();
		},
		set invalid(e = !1) {
			L(e), n();
		}
	}, ke = Xt(), Ae = C(ke);
	le(Ae, {});
	var je = b(Ae, 2);
	return ve(je, {
		value: () => R.shadowRoot,
		children: (e, t) => {
			var n = Yt(), r = E(n), i = (e) => {
				var t = Ft(), n = x(t, !0);
				D(() => h(n, T(_e))), m(e, t);
			};
			p(r, (e) => {
				T(_e) && e(i);
			});
			var a = b(r, 2), o = (e) => {
				var t = It(), n = x(t, !0);
				D(() => h(n, T(he))), m(e, t);
			};
			p(a, (e) => {
				w() && e(o);
			});
			var s = b(a, 2);
			u(s, () => Tt, (e, t) => {
				t(e, {
					get value() {
						return Te;
					},
					class: "root",
					children: (e, t) => {
						var n = g(), r = C(n), i = (e) => {
							var t = g(), n = C(t);
							{
								let e = k(() => [
									w() ? "af-lead" : "",
									"af-hint",
									T(_e) ? "af-described" : ""
								].filter(Boolean).join(" "));
								u(n, () => Le, (t, n) => {
									n(t, {
										part: "dropzone",
										get "aria-describedby"() {
											return T(e);
										},
										get ref() {
											return T(W);
										},
										set ref(e) {
											j(W, e, !0);
										},
										children: (e, t) => {
											var n = Lt(), r = b(C(n), 2), i = E(r, !0), a = b(i), o = x(a, !0), s = b(a);
											u(s, () => ze, (e, t) => {
												t(e, {
													get ref() {
														return T(G);
													},
													set ref(e) {
														j(G, e, !0);
													}
												});
											}), c(r);
											var l = b(r, 2), d = x(l, !0);
											D(() => {
												h(i, T(pe)), h(o, T(z).browse), h(d, T(H) > 1 ? T(z).multipleAllowed : T(z).oneFileOnly);
											}), m(e, n);
										},
										$$slots: { default: !0 }
									});
								});
							}
							m(e, t);
						};
						p(r, (e) => {
							P() || e(i);
						}), m(e, n);
					},
					$$slots: { default: !0 }
				});
			});
			var l = b(s, 2), _ = E(l), v = (e) => {
				var t = ie();
				D(() => h(t, T(K))), m(e, t);
			};
			p(_, (e) => {
				T(K) && e(v);
			}), c(l);
			var ee = b(l, 2), y = (e) => {
				var t = qt();
				f(t, 21, () => T(B), (e) => e.id, (e, t) => {
					let n = k(() => T(Ee)(T(t).size));
					var r = Kt(), i = E(r), a = (e) => {
						var n = g(), r = C(n), i = (e) => {
							var n = Rt(), r = x(n);
							D(() => {
								d(n, "href", T(t).href), d(r, "src", T(t).preview);
							}), m(e, n);
						}, a = (e) => {
							var n = zt();
							D(() => d(n, "src", T(t).preview)), m(e, n);
						};
						p(r, (e) => {
							T(t).href ? e(i) : e(a, -1);
						}), m(e, n);
					}, o = (e) => {
						{
							let n = k(() => At(T(t).name));
							Dt(e, () => T(n));
						}
					};
					p(i, (e) => {
						T(t).preview ? e(a) : e(o, -1);
					});
					var s = b(i, 2), l = (e) => {
						var n = Bt(), r = x(n, !0);
						D(() => {
							d(n, "href", T(t).href), h(r, T(t).name);
						}), m(e, n);
					}, u = (e) => {
						var n = Vt(), r = x(n, !0);
						D(() => h(r, T(t).name)), m(e, n);
					};
					p(s, (e) => {
						T(t).href ? e(l) : e(u, -1);
					});
					var f = b(s, 2), _ = (e) => {
						var t = Ht(), r = x(t, !0);
						D(() => h(r, T(n))), m(e, t);
					};
					p(f, (e) => {
						T(n) && e(_);
					});
					var v = b(f, 2), ee = (e) => {
						var n = Ut(), r = x(n);
						D((e, t) => {
							d(n, "aria-valuenow", e), d(n, "aria-label", T(z).uploading), te(r, `transform: translateX(-${t ?? ""}%)`);
						}, [() => De(T(t)), () => 100 - De(T(t))]), m(e, n);
					}, y = (e) => {
						var n = Wt(), r = x(n, !0);
						D(() => {
							d(n, "title", T(t).error || void 0), h(r, T(z).uploadFailed);
						}), m(e, n);
					};
					p(v, (e) => {
						T(t).status === "uploading" ? e(ee) : T(t).status === "failed" && e(y, 1);
					});
					var S = b(v, 2), w = (e) => {
						var n = Gt();
						D(() => {
							d(n, "aria-label", `${T(z).removeFile ?? ""}: ${T(t).name ?? ""}`), n.disabled = T(U) || T(t).status === "uploading";
						}), ne("click", n, () => ue(R, "remove", { id: T(t).id })), m(e, n);
					};
					p(S, (e) => {
						P() || e(w);
					}), c(r), D(() => d(r, "data-status", T(t).status)), m(e, r);
				}), c(t), m(e, t);
			}, S = (e) => {
				var t = Jt(), n = x(t, !0);
				D(() => h(n, T(z).noFiles)), m(e, t);
			};
			p(ee, (e) => {
				T(B).length ? e(y) : P() && e(S, 1);
			}), c(n), m(e, n);
		},
		$$slots: { default: !0 }
	}), m(e, ke), s(Oe);
}
w(["click"]), y(Qt, {
	items: { type: "Array" },
	accept: {
		attribute: "accept",
		type: "String"
	},
	multiple: {
		attribute: "multiple",
		type: "Boolean"
	},
	replace: {
		attribute: "replace",
		type: "Boolean"
	},
	label: {
		attribute: "label",
		type: "String"
	},
	maxFiles: {
		attribute: "max-files",
		type: "Number"
	},
	disabled: {
		attribute: "disabled",
		reflect: !0,
		type: "Boolean"
	},
	locale: {
		attribute: "locale",
		type: "String"
	},
	strings: { type: "Object" },
	name: {
		attribute: "name",
		reflect: !0,
		type: "String"
	},
	required: {
		attribute: "required",
		type: "Boolean"
	},
	readonly: {
		attribute: "readonly",
		reflect: !0,
		type: "Boolean"
	},
	description: {
		attribute: "description",
		type: "String"
	},
	error: {
		attribute: "error",
		type: "String"
	},
	invalid: {
		attribute: "invalid",
		type: "Boolean"
	}
}, [], [], { mode: "open" }, (e) => class extends Se(e) {
	focus(e) {
		let t = this.shadowRoot?.querySelector("[part~=\"dropzone\"]");
		t ? t.focus(e) : super.focus(e);
	}
});
//#endregion
export { Se as a, Te as i, Et as n, we as o, Ne as r, Ce as s, Qt as t };
