class EIslMusRefDetayTip extends TekSecim {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'A' }
	get barkodmu() { return this.char == 'B' }
	get kodmu() { return this.char == ' ' }
	get adimi() { return this.char == 'A' }
	
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e);
		const {kaListe} = e;
		kaListe.push(
			new CKodVeAdi({ kod: 'B', aciklama: 'Barkod', question: 'barkodmu' }),
			new CKodVeAdi({ kod: ' ', aciklama: 'Kod', question: 'kodmu' }),
			new CKodVeAdi({ kod: 'A', aciklama: 'Adı', question: 'adimi' })
		)
	}
}
