class TicIskYapi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	static get iskEtiketDict() {
		let result = this._iskEtiketDict;
		if (!result)
			result = this._iskEtiketDict = app.params.fiyatVeIsk.iskEtiketDict;
		return result
	}
	
	static *getIskYapiIter() {
		const param = app.params.fiyatVeIsk;
		const {iskSayi, iskOranMax} = param;
		for (const item of [
			{ key: 'sabit', selector: 'iskOranlar', belirtec: 'isk', etiket: 'İsk', maxSayi: iskSayi.sabit || 0, maxOran: iskOranMax.sabit },
			{ key: 'kampanya', selector: 'kamOranlar', belirtec: 'kam', etiket: 'Kam', maxSayi: iskSayi.kampanya || 0, maxOran: iskOranMax.kampanya }
		]) { yield item }
	}

	static *getIskKeysIter() {
		for (const item of this.getIskYapiIter())
			yield item.key
	}

	static *getIskIter() {
		const iskEtiketDict = this.iskEtiketDict || {};
		for (const item of this.getIskYapiIter()) {
			const {key, belirtec, maxSayi} = item;
			const _iskEtiketDict = iskEtiketDict[key];
			for (let i = 1; i <= maxSayi; i++) {
				yield {
					tip: key, belirtec: belirtec, index: i,
					etiket: _iskEtiketDict[i] || `${item.etiket}-${i}`,
					get rowAttr() { return `${belirtec}oran${i}` },
					get ioAttr() { return `${belirtec}Oran${i}` }
				}
			}
		}
	}
	
	static get iskYapi() {
		const result = [];
		for (const item of this.getIskYapiIter())
			result.push(item);
		return result
	}
	
	static get iskKeys() {
		const result = [];
		for (const item of this.getIskKeysIter())
			result.push(item);
		return result
	}

	static get iskListe() {
		const result = [];
		for (const item of this.getIskIter())
			result.push(item);
		return result
	}
	
	
	constructor(e) {
		e = e || {};
		super(e);

		for (const key of this.class.iskKeys)
			this[key] = e[key] || [];
	}

	getHesaplanmisIskontolarVeToplam(e) {
		const {brutBedel} = e;
		let kalan = brutBedel;
		
		const result = new this.class();
		let toplam = 0;
		for (const key of this.class.iskKeys) {
			const oranlar = this[key];
			const bedeller = result[key] = [];
			for (let i = 0; i < oranlar.length; i++) {
				const oran = oranlar[i];
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
			const {iskKeys} = this.class;
			for (const key of iskKeys) {
				const buBedeller = this[key] = this[key] || [];
				const digerBedeller = diger[key];
				for (let i = 0; i < digerBedeller.length; i++) {
					const bedel = digerBedeller[i];
					buBedeller[i] = (buBedeller[i] || 0) + bedel;
				}
			}
		}
		return this;
	}
}
