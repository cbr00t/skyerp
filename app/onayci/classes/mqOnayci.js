class MQOnayci extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'ONAYCI' } static get sinifAdi() { return 'Onay İşlemleri' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get secimSinif() { return null } static get kolonDuzenlemeYapilirmi() { return false }
	static islemTuslariDuzenle_listeEkrani(e) { this.forAltYapiClassesDo('islemTuslariDuzenle_listeEkrani', e) }
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {tableAlias: alias} = this
		liste.push(...[
			new GridKolon({ belirtec: 'tipText', text: 'Tip', genislikCh: 20 }),
			new GridKolon({ belirtec: 'tarih', text: 'Tarih', genislikCh: 10 }).tipDate(),
			new GridKolon({ belirtec: 'belgeNox', text: 'Belge No', genislikCh: 20 }),
			...this.getKAKolonlar([
				new GridKolon({ belirtec: 'mustKod', text: 'Müşteri', genislikCh: 18 }),
				new GridKolon({ belirtec: 'mustUnvan', text: 'Müşteri Ünvan', genislikCh: 18 })
			]),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 17 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'ekBilgi', text: 'Ek Bilgi' })
		])
	}
	static loadServerDataDogrudan(e) {
		super.loadServerDataDogrudan(...arguments)
		return []
	}
}
