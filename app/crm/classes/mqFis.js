class TicariFis extends MQGenelFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return '' }
}
class TeklifFis extends TicariFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return '' }
}
class SiparisFis extends TicariFis {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return '' }
}


/*
	ozelIsaret, bizsubekod, tarih, seri, noyil, no, baslikaciklama

	(sadece stok) stokkod, brm, miktar, kdvorani, fiyat, iskoranX, netbedel

	dip tablosu
*/
