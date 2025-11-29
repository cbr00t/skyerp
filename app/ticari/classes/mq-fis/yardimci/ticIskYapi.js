class TicIskYapi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	static get iskEtiketDict() {
		let result = this._iskEtiketDict;
		if (!result)
			result = this._iskEtiketDict = app.params.fiyatVeIsk.iskEtiketDict;
		return result
	}
	
	static *getIskYapiIter() {
		let {fiyatVeIsk: param} = app.params ?? {};
		let {iskSayi, iskOranMax} = param ?? {};
		for (let item of [
			{ key: 'sabit', selector: 'iskOranlar', belirtec: 'isk', etiket: 'İsk', maxSayi: iskSayi?.sabit || 0, maxOran: iskOranMax?.sabit },
			{ key: 'kampanya', selector: 'kamOranlar', belirtec: 'kam', etiket: 'Kam', maxSayi: iskSayi?.kampanya || 0, maxOran: iskOranMax?.kampanya }
		]) { yield item }
	}

	static *getIskKeysIter() {
		for (let item of this.getIskYapiIter())
			yield item.key
	}

	static *getIskIter() {
		let iskEtiketDict = this.iskEtiketDict || {}
		for (let item of this.getIskYapiIter()) {
			let {key, belirtec, maxSayi} = item
			let _iskEtiketDict = iskEtiketDict[key]
			for (let i = 1; i <= maxSayi; i++) {
				let bedelPrefix = key == 'sabit' ? 'iskonto' : `${belirtec}bedel`
				yield {
					tip: key, belirtec, index: i, seq: i,
					etiket: _iskEtiketDict[i] || `${item.etiket}-${i}`,
					get rowAttr() { return `${belirtec}oran${i}` },
					get ioAttr() { return `${belirtec}Oran${i}` },
					get rowAttr_bedel() { return `${bedelPrefix}${i}` },
					get ioAttr_bedel() { return `${bedelPrefix}{i}` }
				}
			}
		}
	}
	
	static get iskYapi() {
		let result = [];
		for (let item of this.getIskYapiIter())
			result.push(item);
		return result
	}
	
	static get iskKeys() {
		let result = [];
		for (let item of this.getIskKeysIter())
			result.push(item);
		return result
	}

	static get iskListe() {
		let result = [];
		for (let item of this.getIskIter())
			result.push(item);
		return result
	}
	
	
	constructor(e = {}) {
		for (let key of this.class.iskKeys)
			this[key] = e[key] || [];
	}

	getHesaplanmisIskontolarVeToplam(e) {
		let {brutBedel} = e;
		let kalan = brutBedel;
		
		let result = new this.class();
		let toplam = 0;
		for (let key of this.class.iskKeys) {
			let oranlar = this[key];
			let bedeller = result[key] = [];
			for (let i = 0; i < oranlar.length; i++) {
				let oran = oranlar[i];
				let iskBedel = oran ? roundToBedelFra(kalan * oran / 100) : 0;
				bedeller[i] = iskBedel;
				kalan -= iskBedel;
				toplam += iskBedel;
			}
		}

		return { toplam: toplam, result: result };
	}

	getTopIskBedel(e) {
		return (this.getHesaplanmisIskontolarVeToplam(e) || {}).toplam
	}

	getHesaplanmisIskontolar(e) {
		return (this.getHesaplanmisIskontolarVeToplam(e) || {}).result
	}

	// bedelsel toplam içindir
	kendineEkle(diger) {
		if (diger) {
			let {iskKeys} = this.class;
			for (let key of iskKeys) {
				let buBedeller = this[key] = this[key] || [];
				let digerBedeller = diger[key];
				for (let i = 0; i < digerBedeller.length; i++) {
					let bedel = digerBedeller[i];
					buBedeller[i] = (buBedeller[i] || 0) + bedel;
				}
			}
		}
		return this
	}
}
