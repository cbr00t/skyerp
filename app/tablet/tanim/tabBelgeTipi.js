class MQTabBelgeTipi extends MQKAOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get tekSecimSinif() { return TabBelgeTipi } static get kodKullanilirmi() { return false } 
	static get kodListeTipi() { return this.tekSecimSinif.kodListeTipi }
	static get sinifAdi() { return this.tekSecimSinif.sinifAdi }
	static get noAutoFocus() { return true }
	
	static loadServerDataDogrudan(e) { return this.tekSecimSinif.kaListe }
}

class TabBelgeTipi extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABBELTIP' }
	static get sinifAdi() { return 'Belge Tipi' }
	
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		let { tip2Sinif } = TabFis
		let uygunFisTipler = keys(asSet(app.uygunFisTipleri))
		;uygunFisTipler.forEach(kod => {
			let ekBilgi = tip2Sinif[kod]
			if (ekBilgi) {
				let { sinifAdi: aciklama } = ekBilgi
				kaListe.push(new CKodAdiVeEkBilgi({ kod, aciklama, ekBilgi }))
			}
		})
	}
}
