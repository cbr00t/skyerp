class Posta extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['F', 'Şafak']),
			new CKodVeAdi(['S', 'Sabah']),
			new CKodVeAdi(['K', 'Kuşluk']),
			new CKodVeAdi(['O', 'Öğle']),
			new CKodVeAdi(['I', 'İkindi']),
			new CKodVeAdi(['A', 'Akşam'])
		)
	}
}
class RotaTipi extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'TN' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e; kaListe.push(
			new CKodVeAdi(['TN', 'Tnk.']),
			new CKodVeAdi(['TP', 'Toplycı']),
			new CKodVeAdi(['MS', 'Müst.'])
		)
	}
}
