class MQTabBelgeTipi extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get tekSecimSinif() { return TabBelgeTipi } static get kodKullanilirmi() { return false } 
	static get kodListeTipi() { return this.tekSecimSinif.kodListeTipi }
	static get sinifAdi() { return this.tekSecimSinif.sinifAdi }
	static loadServerDataDogrudan(e) { return this.tekSecimSinif.kaListe }
}

class TabBelgeTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABBELTIP' } static get sinifAdi() { return 'Belge Tipi' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			...entries(TabFis.tip2Sinif)
				.map(([kod, cls]) => new CKodAdiVeEkBilgi({ kod, aciklama: cls.sinifAdi, ekBilgi: cls }))
		)
	}
}
