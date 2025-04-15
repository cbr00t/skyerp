class BankaOrtakFis extends FinansFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get detaySinif() { return BankaOrtakDetay } static get gridKontrolcuSinif() { return BankaOrtakGridci }
}
class BankaOrtakDetay extends FinansDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static extYapilarDuzenle({ liste }) {
		super.extYapilarDuzenle(...arguments);
		liste.push(Ext_DetAciklama)
	}
}
class BankaOrtakGridci extends FinansGridci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloKolonlariDuzenle_son({ tabloKolonlari }) {
		super.tabloKolonlariDuzenle_son(...arguments);
		tabloKolonlari.push(new GridKolon({ belirtec: 'detAciklama', text: 'Açıklama', genislikCh: 50 }))
	}
}
