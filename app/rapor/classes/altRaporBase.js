class AltRapor extends Rapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' } static get altRapormu() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { rapor: e.rapor }) }
	get width() { return null } get height() { return null }
	rootFormBuilderDuzenle(e) { } subFormBuilderDuzenle(e) { }
}
class AltRapor_Gridli extends AltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get gridlimi() { return true }
	subFormBuilderDuzenle(e) {
		super.subFormBuilderDuzenle(e); const parentBuilder = e.builder;
		let fbd = this.fbd_grid = parentBuilder.addGridliGosterici().addStyle_fullWH({ height: '90%' }).rowNumberOlmasin().notAdaptive()
			.setTabloKolonlari(e => { let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); return _e.liste })
			.setSource(e => this.loadServerData(e));
		let _e = { ...e, gridBuilder: fbd }; this.gridBuilderDuzenle(_e)
	}
	tabloKolonlariDuzenle(e) { } loadServerData(e) { }
	gridBuilderDuzenle(e) { }
}
