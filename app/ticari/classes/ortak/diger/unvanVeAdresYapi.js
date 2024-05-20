class UnvanVeAdresYapi extends MQAlt {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get unvan() { return birlestirBosluk(this.unvan1, this.unvan2) }
	get adres() { return birlestirBosluk(this.adres1, this.adres2) }

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			unvan1: new PInstStr('unvan1'), unvan2: new PInstStr('unvan2'),
			adres1: new PInstStr('adres1'), adres2: new PInstStr('adres2'),
			yore: new PInstStr('yore'), posta: new PInstStr('posta')
		})
	}
}
