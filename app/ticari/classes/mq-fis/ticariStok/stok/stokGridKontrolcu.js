class SayimGridci extends GridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle(...arguments)
		let shKolonGrup = MQStok.getGridKolonGrup_brmli({
			belirtec: 'sh', kodAttr: 'shKod', adiAttr: 'shAdi', adiEtiket: 'Stok/Hizmet Adı'
			// mfSinif: MQStok
		}).sabitle()
		tabloKolonlari.push(...[
			shKolonGrup,
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 11,
				cellValueChanged: e => setTimeout(() => this.miktarDegisti(e), 10)
			}).tipDecimal().zorunlu(),
			new GridKolon({
				belirtec: 'miktar2', text: 'Miktar 2', genislikCh: 9,
				cellValueChanged: e => setTimeout(() => this.miktarD2egisti(e), 10)
			}).tipDecimal()
		])
		for (let item of HMRBilgi) {
			let colDefOrArray = item.asGridKolon()
			if (colDefOrArray)
				tabloKolonlari.push(...makeArray(colDefOrArray))
		}
	}
	miktarDegisti(e) { this.miktarVe2DegistiOrtak(e) }
	miktar2Degisti(e) { this.miktarVe2DegistiOrtak(e) }
	miktarVe2DegistiOrtak(e) { }
}

class StokGridKontrolcu extends TSGridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e = {}) { super(e) }
	tabloKolonlariDuzenle({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle(...arguments)
	}
}