class Yaslandirma extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get orjBaslikListesi() {
		const cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
			const result = [belirtec]; if (rec.toplammi) { result.push('bold bg-lightgreen') }
			return result.join(' ')
		}
		return [
			new GridKolon({ belirtec: 'kademeText', text: 'Kademe', genislikCh: 10, cellClassName }),
			new GridKolon({ belirtec: 'gecmis', text: 'Geçmiş', genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }], cellClassName }).tipDecimal_bedel().sifirGosterme(),
			new GridKolon({ belirtec: 'gelecek', text: 'Gelecek', genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }], cellClassName }).tipDecimal_bedel().sifirGosterme()
		]
	}
	static get yaslandirmaDizi() {
		return [
			new this({ toplam: true, kademeText: 'TOPLAM' }),
			...['0 -> 15', '16 -> 30', '31 -> 45', '46 -> 60', 'Sonrası'].map(kademeText => new this({ kademeText }))
		]
	}
	constructor(e) { e = e || {}; super(e); $.extend(this, { toplammi: e.toplam ?? e.toplammi, kademeText: e.kademeText ?? '', gecmis: e.gecmis ?? 0, gelecek: e.gelecek ?? 0 }) }
	static dilimSonucu(gunFarki, sifirIse) {
		if (!gunFarki) { return null }
		else if (gunFarki >= 1 && gunFarki <= 15) { return 1 } else if (gunFarki <= 30) { return 2 }
		else if (gunFarki <= 45) { return 3 } else if (gunFarki <= 60) { return 4 }
		return 5
	}
	toplamEkle(liste) { for (const item of liste) { this.gecmisEkle(item.gecmis).gelecekEkle(item.gelecek) } return this }
	gecmisEkle(value) { return this.xEkle('gecmis', value) } gelecekEkle(value) { return this.xEkle('gelecek', value) }
	xEkle(selector, value) { this[selector] = (this[selector] || 0) + value; return this }
}
