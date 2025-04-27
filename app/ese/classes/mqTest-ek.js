class MQTestUygulanmaYeri extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); e.kaListe.push(new CKodVeAdi(['', 'Muayenehane', 'muayenehanemi']), new CKodVeAdi(['IN', 'İnternet', 'internetmi'])) }
}

class TestSonuc extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return null } static get genelSonucmu() { return false }
	static get reduceKeys() { return this.genelSonucmu ? ['id', 'belirtec', 'tip', 'tumSayi', 'cevapSayi', 'cevapsizSayi'] : [] }
	get cevapSayi() { return 0 } get cevapsizSayi() { return Math.max((this.tumSayi || 0) - (this.cevapSayi || 0), 0) }
	constructor(e) {
		e = e || {}; super(e);
		if (this.class.genelSonucmu) { const {tip} = this.class, {belirtec} = e, id = e.testId ?? e.id; $.extend(this, { tip, belirtec, id, tumSayi: e.tumSayi ?? 0 }) }
	}
	reduce(e) {
		const {reduceKeys} = this.class, result = {}; for (const key of reduceKeys) {
			let value = this[key]; if (value === undefined) { continue }
			if (typeof value == 'object') { value = value.deepCopy ? (value.reduce || value.deepCopy)() : $.extend(true, $.isArray(value) ? [] : {}, value) }
			result[key] = value
		}
		return result
	}
	async kaydet(e) {
		try {
			if (!this.class.genelSonucmu) { throw { isError: true, errorText: `Bu Test Sonuç sınıfı için <b>kaydet()</b> işlemi yapılamaz` } }
			let data = this.getWSData(e); let result = await app.wsTestSonucKaydet({ data });
			if (result) {
				let {tip} = this.class, mfSinif = MQTest.tip2Sinif[tip] ?? {}, {table: from, idSaha: saha} = mfSinif; if (from) {
					let {id} = this, where = { degerAta: id, saha }, sent = new MQSent({ from, where, sahalar: '*' });
					let rec = await app.sqlExecTekil(sent); if (rec) {
						let dehbmi = app.dehbmi(rec); if (dehbmi != null) {
							let upd = new MQIliskiliUpdate({ from, where, set: { degerAta: dehbmi, saha: 'bdehbvarmi' } });
							await app.sqlExecNone(upd)
						}
					}
				}
			}
			return result
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Test Kayıt Sorunu'); throw ex }
	}
	getWSData(e) { return this.reduce(e) }
	toString() { return toJSONStr(this, ' ').replaceAll('\n', '').replaceAll('  ', ' ').replaceAll('"', '') }
}
class TestSonucCPT extends TestSonuc {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return MQTestCPT.tip }
	static get parentKeys() { return ['dogru', 'yanlis'] } static get reduceKeys() { return [...super.reduceKeys, ...this.parentKeys] }
	constructor(e) {
		e = e || {}; super(e); 
		let {parentKeys} = this.class; for (let parentKey of parentKeys) {
			let parent = this[parentKey] = e[parentKey] ?? {};
			for (let key of ['toplamSayi', 'sayi', 'adat']) { parent[key] = parent[key] ?? 0 }
		}
		console.info('test', 'new', this)
	}
	tiklamaEkle(dogrumu, sureMS) {
		let parent = this[dogrumu ? 'dogru' : 'yanlis']; parent.sayi++;
		parent.adat = roundToFra(parent.adat + sureMS /*/ (config.dev ? MQTestCPT.intervalKatSayi : 1)*/, 1);
		/*console.info('test', this, dogrumu, sureMS, parent);*/ return this
	}
	ortalamaOlustur() {
		let {parentKeys} = this.class;
		for (let parentKey of parentKeys) {
			let parent = this[parentKey], {toplamSayi, sayi, adat} = parent;
			parent.secimSure = toplamSayi ? roundToFra(adat / sayi, 1) : 0
		}
		return this
	}
}
class TestGenelSonucCPT extends TestSonucCPT {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get genelSonucmu() { return true }
	static get reduceKeys() { return [...super.reduceKeys, 'grupNo2Bilgi', 'secilmeyenDogruSayi'] }
	constructor(e) { e = e || {}; super(e); $.extend(this, { grupNo2Bilgi: e.grupNo2Bilgi || {}, secilmeyenDogruSayi: 0 }) }
	totalEkle(diger) {
		if (!diger) { return this }
		let {parentKeys} = this.class; for (let parentKey of parentKeys) {
			let parent = this[parentKey], digerParent = diger[parentKey];
			for (let [key, value] of Object.entries(digerParent)) {
				parent[key] = roundToFra(parent[key] + value, 1) }
		}
		return this
	}
}
class TestSonucAnket extends TestSonuc {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return MQTestAnket.tip }
}
class TestGenelSonucAnket extends TestSonucAnket {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get genelSonucmu() { return true }
	static get reduceKeys() { return [...super.reduceKeys, 'soruId2Cevap'] } get cevapSayi() { return Object.keys(this.soruId2Cevap).length }
	constructor(e) { e = e || {}; super(e); $.extend(this, { soruId2Cevap: e.soruId2Cevap || {}, toplamPuan: 0 }) }
	totalEkle(diger) {
		if (diger) { this.toplamPuan += diger.puan || 0 }
		return this
	}
}
