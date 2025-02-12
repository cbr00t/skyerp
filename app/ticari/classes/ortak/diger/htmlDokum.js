class HTMLDokum extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get doc() {
	    if (!this._doc && this.sablon) { this._doc = this.parser.parseFromString(this.sablon, 'text/html') }
	    return this._doc ?? null;
	}
	set doc(value) { this._doc = value }
	get sablon() { return this._sablon } set sablon(value) { this._sablon = value; this.doc = null }
    constructor(e, _tabloNo, _baslikSayisi) {
		e = e ?? {}; super(e); if (typeof e != 'object') { e = { sablon: e } }
		$.extend(this, {
			tip: e.tip ?? e.tipKod, tabloNo: e.tabloNo ?? _tabloNo,
			headerRowCount: e.baslikSayisi ?? _baslikSayisi, parser: new DOMParser()
		})
		let sablon = e.sablon ?? e.html ?? e.elm;
		if (isFunction(sablon) || sablon?.run) { sablon = getFuncValue.call(this, sablon, { ...e, sender: this }) }
		if (sablon?.html) { sablon = sablon[0] } this.sablon = sablon?.outerHTML ?? sablon
    }
	static async FromTip(e) { let inst = new this(); await inst.fromTip(e); return inst }
    async fromTip(e) {
		if (typeof e != 'object') { e = { tip: e } }
		let {tip} = e, tanim = await this.getTanim({ ...e, tip }); if (!tanim) { throw new Error(`<b class=red>${tip}</b> tipi için tanım belirlenemedi`) }
		let {tabloNo, dosyaAdi} = tanim; if (!dosyaAdi) { throw new Error(`<b>${tip}</b> tip'ine ait Word Dokuman Tanımı'nda <b class=red>Dosya Adı</b> belirtilmelidir`) }
		let {wordGenelBolum: rootDir} = app.params.ticariGenel, sablonDosya = `${rootDir.trimEnd_slashes()}/${dosyaAdi}`;
		let sablon = await app.wsDownloadAsStream({ remoteFile: sablonDosya, contentType: 'text/html' }); $.extend(this, { tabloNo, sablon, sablonDosya });
		return this
	}
	static async getTanimlar(e) {
		let {wordGenelBolum: rootDir} = app?.params.ticariGenel;
		if (!rootDir) { throw new Error(`<b>Ticari Genel Parametreler</b> adımındaki <b class=royalblue>Word Ana Bölüm</b> belirtilmelidir`) }
		if (typeof e != 'object') { e = { tip: e } }
		let tip = $.makeArray(e.tip ?? e.tipListe), sent  = new MQSent({
			from: 'whdokbilgi',
			sahalar: ['kaysayac id', 'RTRIM(tipkod) tip', 'aciklama', 'dosyaadi dosyaAdi', 'wordtablono tabloNo', 'refsayac refId']
		}), {where: wh} = sent;
		if (tip) { wh.inDizi(tip, 'tipkod') }
		let result = {}; for (const rec of await app.sqlExecSelect(sent)) { result[rec.tip] = rec }
		return result
	}
	static getTanim(e) { return this.getTanimlar(e).then(d => Object.values(d)[0]) }
	getTanimlar(e) { const tip = e?.tip ?? this.tip; return this.class.getTanimlar({ ...e, tip }) }
	getTanim(e) { const tip = e?.tip ?? this.tip; return this.class.getTanim(({ ...e, tip })) }
	/** HTML içerisinde geçen tüm köşeli parantez içindeki ifadeleri tarar. Bunları bir liste halinde döndürür */
    extractKeys() {
		let doc = this.getDocWithError(), htmlText = this.doc.documentElement.outerHTML;
        let matches = [...htmlText.matchAll(/\[([A-Z0-9-_]+)\]/g)], keys = asSet([...new Set(matches.map(m => m[1]))]); /* Tekrar edenleri kaldır */
        return keys
    }
    /** Belirtilen map içeriğine göre şablondaki değişkenleri değiştirir */
    searchAndReplace(dict, rootElement) {
		rootElement = rootElement ?? this.getDocWithError(); rootElement = rootElement?.documentElement ?? rootElement;
        let elms = [...rootElement.querySelectorAll(':not(script, style)')]; for (let key in dict) {
			let regex = new RegExp(`\\[${key}\\]`, 'g');
			for (let elm of elms) { let {childNodes} = elm;
				if (childNodes.length == 1 && childNodes[0].nodeType == Node.TEXT_NODE) { elm.textContent = elm.textContent.replace(regex, dict[key]) }
				else { elm.innerHTML = elm.innerHTML.replace(regex, dict[key]) }
			}
        }
		return this
    }
    /** Detay tablosunu güncelleyerek belirtilen detayları ekler */
    updateDetayTable(tabloNo, headerRowCount, detaylar, dip) {
		tabloNo = tabloNo ?? 1; headerRowCount = headerRowCount ?? 1; if (tabloNo < 1) { return false } 
        let doc = this.getDocWithError(), table = doc.querySelectorAll('table')?.[tabloNo - 1]; if (!table) { throw new Error('Geçersiz tablo numarası') }
	    let rows = [...table.querySelectorAll('tr')]; if ((rows?.length ?? 0) < headerRowCount + 1) { throw new Error('Tabloda yeterli satır bulunmuyor') }
	    let detayRowTemplate = rows[headerRowCount].outerHTML, detayHTML = detaylar.map(rec => {
		    let template = detayRowTemplate; for (const key in rec) {
		        let regex = new RegExp(`\\[${key}\\]`, 'g');
		        template = template.replace(regex, rec[key])
		    }
		    return template
		}).join('');
	    rows[headerRowCount].outerHTML = detayHTML;
	    if (dip && rows[headerRowCount + 1]) {
	        let dipRow = rows[headerRowCount + 1]; for (const key in dip) {
				dipRow.innerHTML = dipRow.innerHTML.replace(new RegExp(`\\[${key}\\]`, 'g'), dip[key]) }
	    }
    }
    /** Tüm işlemleri yürütüp güncellenmiş HTML çıktısını döndürür */
    process(e) {
		e = e ?? {}; let doc = this.getDocWithError();
		let data = e.data ?? e.rec ?? e;
		if (isFunction(data) || data?.run) { let keys = this.extractKeys(e); data = getFuncValue.call(this, data, { ...e, sender: this, keys }) }
		let {baslik, detaylar, dip} = data, {tabloNo, headerRowCount} = this, sender = this;
		this.searchAndReplace(baslik); this.updateDetayTable(tabloNo, headerRowCount, detaylar, dip);
        let {outerHTML: result} = doc.documentElement; return { sender, doc, data, result }
    }
	setTip(value) { this.tip = value; return this } setSablon(value) { this.sablon = value; return this }
	setTabloNo(value) { this.tabloNo = value; return this } setBaslikSayisi(value) { this.baslikSayisi = value; return this }
	getDocWithError() { let {doc} = this; if (!doc) { throw new Error('Şablon HTML belirsizdir') } return doc }
	static async test() {
		// Kullanım:
		let dokumcu = await this.FromTip('SSIP');
		let data = ({ keys }) => ({
		    baslik: { SABLONADI: 'Unlu Mamüller', KLFIRMAADI: 'FALANCA A.Ş.' },
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
}
