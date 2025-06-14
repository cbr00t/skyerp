class KontorTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'BL' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi(['BL', 'e-Belge', 'eBelgemi']),
			new CKodVeAdi(['TR', 'Turmob', 'turmobmu'])
		])
	}
}
class KontorAHTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'A' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi(['A', 'Alınan', 'alinanmi']),
			new CKodVeAdi(['H', 'Haracanan', 'harcananmi'])
		])
	}
}
class KontorFatDurum extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi(['', '', 'yokmu']),
			new CKodVeAdi(['B', 'Fatura Edilecek', 'faturaEdilecekmi']),
			new CKodVeAdi(['X', 'Fatura Edildi', 'faturaEdildimi'])
		])
	}
}
