class TabFaturaFis extends TabTicariFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabFaturaFis }
	static get faturami() { return true }
}
class TabSatisFaturaFis extends TabFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TF' } static get sinifAdi() { return 'Satış Fatura' }
	static get onlineFisSinif() { return SatisFaturaFis }
	static get almSat() { return 'T' }
}
class TabSatisIadeFaturaFis extends TabSatisFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TFI' } static get sinifAdi() { return 'Satış İADE Fatura' }
	static get onlineFisSinif() { return SatisIadeFaturaFis }
	static get iademi() { return true }
}
class TabAlimFaturaFis extends TabFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AF' } static get sinifAdi() { return 'Alım Fatura' }
	static get onlineFisSinif() { return AlimFaturaFis }
	static get almSat() { return 'A' }
}
class TabAlimIadeFaturaFis extends TabAlimFaturaFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AFI' } static get sinifAdi() { return 'Alım İADE Fatura' }
	static get onlineFisSinif() { return AlimIadeFaturaFis }
	static get iademi() { return true }
}

class TabIrsaliyeFis extends TabTicariFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabIrsaliyeFis }
	static get irsaliyemi() { return true }
}
class TabSatisIrsaliyeFis extends TabIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TI' } static get sinifAdi() { return 'Satış İrsaliye' }
	static get onlineFisSinif() { return SatisIrsaliyeFis }
	static get almSat() { return 'T' }
}
class TabSatisIadeIrsaliyeFis extends TabSatisIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TII' } static get sinifAdi() { return 'Alım İADE İrsaliye' }
	static get onlineFisSinif() { return SatisIadeIrsaliyeFis }
	static get iademi() { return true }
}
class TabAlimIrsaliyeFis extends TabIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AI' } static get sinifAdi() { return 'Alım İrsaliye' }
	static get onlineFisSinif() { return AlimIrsaliyeFis }
	static get almSat() { return 'A' }
}
class TabAlimIadeIrsaliyeFis extends TabAlimIrsaliyeFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AII' } static get sinifAdi() { return 'Alım İADE İrsaliye' }
	static get onlineFisSinif() { return AlimIadeIrsaliyeFis }
	static get iademi() { return true }
}

class TabSiparisFis extends TabTicariFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabSiparisFis }
	static get siparismi() { return true }
}
class TabSatisSiparisFis extends TabSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TS' } static get sinifAdi() { return 'Satış Sipariş' }
	static get onlineFisSinif() { return SatisSiparisFis }
	static get almSat() { return 'T' }
}
class TabAlimSiparisFis extends TabSiparisFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'AS' } static get sinifAdi() { return 'Alım Sipariş' }
	static get onlineFisSinif() { return AlimSiparisFis }
	static get almSat() { return 'A' }
}
