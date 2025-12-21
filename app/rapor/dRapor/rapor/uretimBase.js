class DRapor_UretimBase extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 105 }
	static get kategoriKod() { return 'URETIM' } static get kategoriAdi() { return 'Üretim' }
	static get uygunmu() { return app.params.ticariGenel?.kullanim?.uretim }
}
class DRapor_UretimBase_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
