class HatTezgah extends TekSecim {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultChar() { return 'HT' } get hatmi() { return this.char == 'HT' } get tezgahmi() { return this.char == 'TZ' }
	kaListeDuzenle(e) {
		super.kaListeDuzenle(e); const {kaListe} = e;
		kaListe.push(
			{ kod: 'HT', aciklama: 'Hat' },
			{ kod: 'TZ', aciklama: 'Tezgah' }
		)
	}
	hatYap() { this.char = 'HT'; return this }
	tezgahYap() { this.char = 'TZ'; return this }
}
