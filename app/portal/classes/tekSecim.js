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
			new CKodVeAdi(['H', 'Harcanan', 'harcananmi'])
		])
	}
}
class KontorFatDurum extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi(['', '<span class=lightgray>Açıktan</span>', 'yokmu']),
			new CKodVeAdi(['B', '<span class=orangered>Fatura Edilecek</span>', 'faturaEdilecekmi']),
			new CKodVeAdi(['X', '<span class=green>Fatura Edildi</span>', 'faturaEdildimi'])
		])
	}
}
class VIOSurum extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return app.defaultSurum }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi(['416', '4.16']),
			new CKodVeAdi(['415', '4.15']),
			new CKodVeAdi(['414', '4.14']),
			new CKodVeAdi(['413', '4.13'])
		])
	}
}
class AktHesapSekli extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments);
		kaListe.push(...[
			new CKodVeAdi(['', '', 'normalmi'])
			/* ... ?? daha belli değil */
		])
	}
}

