class TabStokFis extends TabTSFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabStokFis }
	static get kodListeTipi() { return 'TABSTOK' } static get sinifAdi() { return 'Stok' }
	static get detaySinif() { return TabStokDetay }
	// static get onlineFisSinif() { return StokTransferFis }
}
