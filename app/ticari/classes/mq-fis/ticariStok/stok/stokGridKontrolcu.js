class StokGridKontrolcu extends TSGridKontrolcu {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {};
		super(e);
	}

	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e);

		const {tabloKolonlari} = e;
	}
}