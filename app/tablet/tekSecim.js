class TabKonsolideTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Konsolide Tip' } static get defaultChar() { return '' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi(['', 'Normal', 'normalmi']),
			new CKodVeAdi(['M', 'Merkez', 'merkezmi']),
			new CKodVeAdi(['S', 'Şube', 'subemi'])
		)
	}
}
