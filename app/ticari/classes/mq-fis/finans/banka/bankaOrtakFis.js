class BankaOrtakFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return BankaOrtakDetay }
	static get gridKontrolcuSinif() { return BankaOrtakGridci }
}
class BankaOrtakDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle(e) {
		super.extYapilarDuzenle(e);
		e.liste.push(Ext_DetAciklama)
	}
}
class BankaOrtakGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_son(e) {
		super.tabloKolonlariDuzenle_son(e);
		const {tabloKolonlari} = e;
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}
