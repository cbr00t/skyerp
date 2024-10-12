class MQTestUygulanmaYeri extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); e.kaListe.push(new CKodVeAdi(['', 'Muayenehane', 'muayenehanemi']), new CKodVeAdi(['IN', 'İnternet', 'internetmi'])) }
}

class TestSonuc extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get reduceKeys() { return [] }
	reduce(e) {
		const {reduceKeys} = this.class, result = {};
		for (const key of reduceKeys) {
			let value = this[key]; if (value === undefined) { continue }
			if (typeof value == 'object') { value = value.deepCopy ? (value.reduce || value.deepCopy)() : $.extend(true, $.isArray(value) ? [] : {}, value) }
			result[key] = value
		}
		return result
	}
	toString() { return toJSONStr(this, ' ').replaceAll('\n', '').replaceAll('  ', ' ').replaceAll('"', '') }
}
class TestSonucCPT extends TestSonuc {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	get toplam() {
		let result = {}; for (const parentKey of this.class.ParentKeys) {
			let parent = this[parentKey]; for (const [key, value] of Object.entries(parent)) { result[key] = (result[key] || 0) + (value || 0) } }
		return result
	}
	constructor(e) {
		e = e || {}; super(e); for (const parentKey of this.class.ParentKeys) {
			let parent = this[parentKey] = e[parentKey] ?? {};
			for (const key of ['sayi', 'adat', 'secimSure']) { parent[key] = parent[key] ?? 0 }
		}
		console.info('test', 'new', this)
	}
	tiklamaEkle(dogrumu, sureSn) {
		let parent = this[dogrumu ? 'dogru' : 'yanlis']; parent.sayi++; parent.adat = roundToFra(parent.adat + sureSn, 1);
		/*console.info('test', this, dogrumu, sureSn, parent);*/ return this
	}
	ortalamaOlustur() {
		for (const parentKey of this.class.ParentKeys) {
			let parent = this[parentKey]; let {sayi, adat} = parent;
			parent.secimSure = sayi ? roundToFra(adat / sayi, 1) : 0;
			/*console.info('test', this, parentKey, parent)*/
		}
		return this
	}
	totalEkle(diger) {
		if (!diger) { return this }
		for (const parentKey of this.class.ParentKeys) {
			let parent = this[parentKey], digerParent = diger[parentKey];
			for (const [key, value] of Object.entries(digerParent)) { parent[key] = roundToFra(parent[key] + value, 1) }
		}
		return this
	}
}
class TestSonucAnket extends CObject { static { window[this.name] = this; this._key2Class[this.name] = this } }

class TestGenelSonuc extends TestSonuc {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return null }
	static get reduceKeys() { return [...super.reduceKeys, 'id', 'tip', 'tumSayi'] }
	constructor(e) { e = e || {}; super(e); const {tip} = this.class, id = e.testId ?? e.id; $.extend(this, { tip, id, tumSayi: e.tumSayi ?? 0 }) }
	kaydet(e) { const data = this.getWSData(e); return app.wsTestSonucKaydet({ data }) } getWSData(e) { return this.reduce(e) }
}
class TestGenelSonucCPT extends TestGenelSonuc {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return MQTestCPT.tip }
	static get reduceKeys() { return [...super.reduceKeys, 'grupNo2Bilgi'] }
	constructor(e) { e = e || {}; super(e); $.extend(this, { grupNo2Bilgi: e.grupNo2Bilgi || {} }) }
}
class TestGenelSonucAnket extends TestGenelSonuc {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get tip() { return MQTestAnket.tip }
	static get reduceKeys() { return [...super.reduceKeys, 'soruId2CevapIndex'] }
	constructor(e) { e = e || {}; super(e); $.extend(this, { soruId2CevapIndex: e.soruId2CevapIndex || {} }) }
}
