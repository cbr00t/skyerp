class DPanelTip extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Panel Tip' } static get defaultChar() { return ' ' }
	kaListeDuzenle({ kaListe }) {
		super.kaListeDuzenle(...arguments)
		kaListe.push(
			new CKodVeAdi([' ', 'Rapor', 'rapormu']),
			new CKodVeAdi(['WB', 'Web Sitesi (URL)', 'webmi']),
			new CKodVeAdi(['JS', 'JavaScript Kodu', 'evalmi'])
		)
	}
}
