class MQTestUygulanmaYeri extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultChar() { return '' }
	kaListeDuzenle(e) { super.kaListeDuzenle(e); e.kaListe.push(new CKodVeAdi(['', 'Muayenehane', 'muayenehanemi']), new CKodVeAdi(['IN', 'İnternet', 'internetmi'])) }
}

class TestSonuc extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this } static ParentKeys = ['dogru', 'yanlis'];
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
	kaydet(e) { const data = this.getWSData(e); return app.wsTestSonucKaydet({ data }) }
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
	getWSData(e) { return this.reduce(e) }
	reduce(e) {
		const result = {}, keys = [...this.class.ParentKeys];
		for (const key of keys) {
			let value = this[key]; if (value === undefined) { continue }
			if (typeof value == 'object') { value = value.deepCopy ? (value.reduce || value.deepCopy)() : $.extend(true, $.isArray(value) ? [] : {}, value) }
			result[key] = value
		}
		return result
	}
	toString() { return toJSONStr(this, ' ').replaceAll('\n', '').replaceAll('  ', ' ').replaceAll('"', '') }
}
class TestGenelSonuc extends TestSonuc {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); const {tip, id} = e; $.extend(this, { tip, id, tumSayi: e.tumSayi ?? 0, grupNo2Bilgi: e.grupNo2Bilgi || {} }) }
	reduce(e) {
		const result = super.reduce(e), keys = ['id', 'tip', 'tumSayi', 'grupNo2Bilgi'];
		for (const key of keys) {
			let value = this[key]; if (value === undefined) { continue }
			if (typeof value == 'object') { value = value.deepCopy ? (value.reduce || value.deepCopy)() : $.extend(true, $.isArray(value) ? [] : {}, value) }
			result[key] = value
		}
		return result
	}
}
