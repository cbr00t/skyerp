class HTMLDokum extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get doc() {
	    if (!this._doc && this.sablon)
			this._doc = this.parser.parseFromString(this.sablon, 'text/html')
	    return this._doc ?? null;
	}
	set doc(value) { this._doc = value }
	get sablon() { return this._sablon }
	set sablon(value) { this._sablon = value; this.doc = null }
	get style() { return getTagContent(this.sablon, 'style') }
	get body() { return getTagContent(this.sablon, 'body') }

    constructor(e = {}, _tabloNo, _baslikSayisi) {
		super(e)
		let isObj = isObject(e)
		let { tip = e.tipKod } = e
		let tabloNo = _tabloNo ?? e.tabloNo
		let headerRowCount = _baslikSayisi ?? e.baslikSayisi ?? e.headerRowCount
		extend(this, {
			tip, tabloNo, headerRowCount,
			parser: new DOMParser()
		})
		
		let sablon = isObj ? e.sablon ?? e.sablonHTML ?? e.sablonText ?? e.html ?? e.text ?? e.elm : e
		if (isFunction(sablon) || sablon?.run)
			sablon = getFuncValue.call(this, sablon, { ...e, sender: this })
		if (sablon?.html)
			sablon = sablon[0]
		this.sablon = sablon?.outerHTML ?? sablon
    }
	static async FromTip(e) {
		let inst = new this()
		await inst.fromTip(e)
		return inst
	}
    async fromTip(e = {}) {
		if (!isObject(e))
			e = { tip: e }
		let { tip } = e
		tanim = await this.getTanim({ ...e, tip })
		if (!tanim)
			throw new Error(`<b class=red>${tip}</b> tipi için tanım belirlenemedi`)
		return await this.fromDosyaAdi({ ...tanim, tip, ...e })		
	}
	static async FromDosyaAdi(e) {
		let inst = new this()
		await inst.fromDosyaAdi(e)
		return inst
	}
	static async FromDosya(e) {
		let inst = new this()
		await inst.fromDosya(e)
		return inst
	}
    async fromDosyaAdi(e = {}, _tabloNo) {
		let isObj = isObject(e)
		let dosyaAdi = isObj ? e.dosyaAdi ?? e.fileName ?? e.name : e
		if (!dosyaAdi)
			throw new Error(`<b>${tip}</b> tip'ine ait Word Dokuman Tanımı'nda <b class=red>Dosya Adı</b> belirtilmelidir`)
		
		let { wordGenelBolum: rootDir } = app.params?.ticariGenel ?? {}
		if (!rootDir)
			throw new Error(`<b>Ticari Genel Parametreler</b> adımında <b class=red>Word Ana Bölüm</b> belirtilmelidir`)
		
		let sablonDosya = `${rootDir?.trimEnd_slashes()}/${dosyaAdi}`
		if (isFunction(sablonDosya))
			sablonDosya = sablonDosya.call(this, ...arguments)
		
		let _e = { ...e, sablonDosya }
		deleteKeys(_e, 'dosya', 'dosya', 'file', 'path', 'dosyaAdi', 'fileName')
		return await this.fromDosya(_e)
	}
	async fromDosya(e = {}, _tabloNo) {
		let isObj = isObject(e)
		let sablonDosya = isObj ? e.sablonDosya ?? e.dosya ?? e.file ?? e.path ?? e : e
		if (isFunction(sablonDosya))
			sablonDosya = sablonDosya.call(this, ...arguments)
		if (!sablonDosya)
			throw new Error(`<b>Şablon Dosyası</b> belirtilmelidir`)
		
		let tabloNo = _tabloNo ?? e.tabloNo
		if (isFunction(tabloNo))
			tabloNo = tabloNo.call(this, ...arguments)
		
		let sablon = await app.wsDownloadAsStream({ remoteFile: sablonDosya, contentType: 'text/html' })
		extend(this, { tabloNo, sablon, sablonDosya })
		return this
	}
	static async getTanimlar(e) {
		let { wordGenelBolum: rootDir } = app.params?.ticariGenel ?? {}
		if (!rootDir)
			throw new Error(`<b>Ticari Genel Parametreler</b> adımındaki <b class=royalblue>Word Ana Bölüm</b> belirtilmelidir`)

		let tip = makeArray(isObject(e) ? e.tip ?? e.tipListe : e)
		let sent = new MQSent(), { where: wh, sahalar } = sent
		sent.fromAdd('whdokbilgi dok')
		if (tip)
			wh.inDizi(tip, 'dok.tipkod')
		sahalar.add(
			'dok.kaysayac id', 'RTRIM(dok.tipkod) tip', 'dok.aciklama',
			'dok.dosyaadi dosyaAdi', 'dok.wordtablono tabloNo', 'dok.refsayac refId'
		)
		let result = {}
		for (let rec of await sent.execSelect())
			result[rec.tip] = rec
		return result
	}
	static getTanim(e) {
		return this.getTanimlar(e).then(d =>
			values(d)[0])
	}
	getTanimlar(e = {}) {
		let { tip = this.tip } = e
		return this.class.getTanimlar({ ...e, tip })
	}
	getTanim(e) {
		let { tip = this.tip } = e
		return this.class.getTanim(({ ...e, tip }))
	}
	/** HTML içerisinde geçen tüm köşeli parantez içindeki ifadeleri tarar. Bunları bir liste halinde döndürür */
    extractKeys() {
		let doc = this.getDocWithError()
		let { outerHTML: htmlText } = doc.documentElement
        let matches = [...htmlText.matchAll(/\[([A-Z0-9-_]+)\]/g)]
		let keys = asSet([...new Set(matches.map(m => m[1]))])    // Tekrar edenleri kaldır
        return keys
    }
    /** Belirtilen map içeriğine göre şablondaki değişkenleri değiştirir */
    searchAndReplace(dict = {}, rootElement) {
		rootElement ??= this.getDocWithError()
		rootElement = rootElement?.documentElement ?? rootElement
        let elms = [...rootElement.querySelectorAll(':not(script, style)')]
		for (let [key, value] of entries(dict)) {
			value ??= ''
			value = (
				isNumber(value) ? numberToString(value) :
				isDate(value) ? globalThis[hasTime(value) ? 'dateTimeToString' : 'dateToString'](value) :
				String(value)
			)
			let regex = new RegExp(`\\[${key}\\]`, 'g')
			;elms.forEach(elm =>
				elm.innerHTML = elm.innerHTML.replace(regex, value))
        }
		return this
    }
    /** Detay tablosunu güncelleyerek belirtilen detayları ekler */
    updateDetayTable(tabloNo, headerRowCount, detaylar, dip) {
		if (!detaylar)
			return false
		
		tabloNo ??= 1
		if (tabloNo < 1)
			return false 
        
		headerRowCount ??= 1
		let doc = this.getDocWithError()
		let table = doc.querySelectorAll('table')?.[tabloNo - 1]
		if (!table)
			return false
		
	    let rows = [...table.querySelectorAll('tr')]
		if ((rows?.length ?? 0) < headerRowCount + 1)
			throw new Error('Tabloda yeterli satır bulunmuyor')
		
	    let { outerHTML: detayRowTemplate } = rows[headerRowCount]
	    let detayHTML = detaylar?.map(rec => {
		    let template = detayRowTemplate
			for (let [key, value] of entries(rec)) {
		        value ??= ''
				value = (
					isNumber(value) ? numberToString(value) :
					isDate(value) ? globalThis[hasTime(value) ? 'dateTimeToString' : 'dateToString'](value) :
					String(value)
				)
				let regex = new RegExp(`\\[${key}\\]`, 'g')
				template = template.replace(regex, value)
		    }
		    return template
		})?.join('\n') ?? ''
	    rows[headerRowCount].outerHTML = detayHTML

		if (dip && rows[headerRowCount + 1]) {
			let rows = [...table.querySelectorAll('tr')]    // !! güncel tr liste		
			let dipRow = rows.at(-1)
			for (let [key, value] of entries(dip)) {
				value ??= ''
				value = (
					isNumber(value) ? numberToString(value) :
					isDate(value) ? globalThis[hasTime(value) ? 'dateTimeToString' : 'dateToString'](value) :
					String(value)
				)
				dipRow.innerHTML = dipRow.innerHTML
					.replace(new RegExp(`\\[${key}\\]`, 'g'), value)
			}
	    }
    }
    /** Tüm işlemleri yürütüp güncellenmiş HTML çıktısını döndürür */
    process(e = {}) {
		let doc = this.getDocWithError()
		let data = e.data ?? e.rec ?? e
		if (isFunction(data) || data?.run) {
			let keys = this.extractKeys(e)
			data = getFuncValue.call(this, data, { ...e, sender: this, keys })
		}
		let sender = this, { tabloNo, headerRowCount } = this
		let { baslik = data, detaylar, dip } = data
		this.searchAndReplace(baslik)
		this.updateDetayTable(tabloNo, headerRowCount, detaylar, dip)
        let { outerHTML: result } = doc.documentElement
		return { sender, doc, data, result }
    }
	setTip(value) { this.tip = value; return this }
	setSablon(value) { this.sablon = value; return this }
	setTabloNo(value) { this.tabloNo = value; return this }
	setBaslikSayisi(value) { this.baslikSayisi = value; return this }

	getDocWithError() {
		let { doc } = this
		if (!doc)
			throw new Error('Şablon HTML belirsizdir')
		return doc
	}

	static async test() {
		// Kullanım:
		let dokumcu = await this.FromTip('SSIP');
		let data = ({ keys }) => ({
		    baslik: { SABLONADI: 'Unlu Mamuller', KLFIRMAADI: 'FALANCA A.Ş.' },
		    detaylar: [
		        { STOKKOD: 's1', STOKADI: 'Börek', MIKTAR: 1.3, BRM: 'KG' },
		        { STOKKOD: 's2', STOKADI: 'Yaş Pasta', MIKTAR: 2, BRM: 'AD' },
		        { STOKKOD: 's3', STOKADI: 'Baklava', MIKTAR: 1, BRM: 'KG' }
		    ],
		    dip: { TOPMIKTAR: '2.3\r\n2', BRM: 'KG\r\nAD' }
		});
		let result = dokumcu.process(data), url = URL.createObjectURL(new Blob([result.result], { type: 'text/html' }));
		openNewWindow(url, 'htmlDokumcu'); return result
	}
	sablon_bodyOnly() { let {body} = this; if (body) { this.sablon = body } return this }
}


/*
let { localData } = app.params
let mustBilgi = values( localData.get('mustBilgi') )[0]
let { cariEkstre: recs } = mustBilgi
let d = new HTMLDokum({
	sablon: `
		<div class="dokum">
			<style>
				.dokum table { width: 200px; box-shadow: 0 0 5px 1px royalblue }
				.dokum table tr { border-bottom: 1px solid #eee }
				.dokum table tr:not(.header):not(.dip):hover { background: #88ccff33; cursor: pointer }
				.dokum table tr > * { padding: 5px 10px }
				.dokum table tr.header { border-bottom: 3px solid #aaa }
				.dokum table tr.dip { border-top: 2px solid #ccc; background: #eee }
				
			</style>
			<table border="1">
				<tr class="header">
					<th>VALUE</th>
				</tr>
				<tr class="content">
					<td>[REPLACE]</td>
				</tr>
				<tr class="dip">
					<td>[DIP-REPLACE]</td>
				</tr>
			</table>
		</div>
	`
})
let data = {
	baslik: {},
	detaylar: [
		{ REPLACE: 'replace me', 'DIP-REPLACE': 'dip bilgi' },
		{ REPLACE: 'replace me 2', 'DIP-REPLACE': 'dip bilgi 2' }
	],
	dip: {}
}
let result = d.process({ data })
let { result: content } = result
displayMessage(content)
//let url = URL.createObjectURL(new Blob([content], { type: 'text/html' }))
//openNewWindow(url)
//setTimeout(() => URL.revokeObjectURL(url), 5_000)
*/




/*
case void 0:
	return Mt();
case "save":
	y.save(t.filename);
	break;
case "arraybuffer":
	return le(Mt());
case "blob":
	return Dt(Mt());
case "bloburi":
case "bloburl":
	if (void 0 !== o.URL && "function" == typeof o.URL.createObjectURL)
		return o.URL && o.URL.createObjectURL(Dt(Mt())) || void 0;
	i.warn("bloburl is not supported by your system, because URL.createObjectURL is not supported by your browser.");
	break;
case "datauristring":
case "dataurlstring":
	var r = ""
	  , n = Mt();
	try {
		r = l(n)
	} catch (e) {
		r = l(unescape(encodeURIComponent(n)))
	}
	return "data:application/pdf;filename=" + t.filename + ";base64," + r;
case "pdfobjectnewwindow":
	if ("[object Window]" === Object.prototype.toString.call(o)) {
		var s = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><script src="' + (t.pdfObjectUrl || "https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js") + '"><\/script><script >PDFObject.embed("' + this.output("dataurlstring") + '", ' + JSON.stringify(t) + ");<\/script></body></html>"
		  , a = o.open();
		return null !== a && a.document.write(s),
		a
	}
	throw new Error("The option pdfobjectnewwindow just works in a browser-environment.");
case "pdfjsnewwindow":
	if ("[object Window]" === Object.prototype.toString.call(o)) {
		var A = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><iframe id="pdfViewer" src="' + (t.pdfJsUrl || "examples/PDF.js/web/viewer.html") + "?file=&downloadName=" + t.filename + '" width="500px" height="400px" /></body></html>'
		  , u = o.open();
		if (null !== u) {
			u.document.write(A);
			var c = this;
			u.document.documentElement.querySelector("#pdfViewer").onload = function() {
				u.document.title = t.filename,
				u.document.documentElement.querySelector("#pdfViewer").contentWindow.PDFViewerApplication.open(c.output("bloburl"))
			}
		}
		return u
	}
	throw new Error("The option pdfjsnewwindow just works in a browser-environment.");
case "dataurlnewwindow":
	if ("[object Window]" !== Object.prototype.toString.call(o))
		throw new Error("The option dataurlnewwindow just works in a browser-environment.");
	var d = '<html><style>html, body { padding: 0; margin: 0; } iframe { width: 100%; height: 100%; border: 0;}  </style><body><iframe src="' + this.output("datauristring", t) + '"></iframe></body></html>'
	  , f = o.open();
	if (null !== f && (f.document.write(d),
	f.document.title = t.filename),
	f || "undefined" == typeof safari)
		return f;
	break;
case "datauri":
case "dataurl":
	return o.document.location.href = this.output("datauristring", t);
*/
