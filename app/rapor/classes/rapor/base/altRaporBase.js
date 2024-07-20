class AltRapor extends Rapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' } static get altRapormu() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { rapor: e.rapor }) }
	get width() { return null } get height() { return null }
	rootFormBuilderDuzenle(e) { }
	subFormBuilderDuzenle(e) {
		const parentBuilder = e.builder; parentBuilder.addStyle_fullWH()
			.onInit(e => this.onInit({ ...e, parentBuilder: e.builder }))
			.onBuildEk(e => this.onBuildEk({ ...e, parentBuilder: e.builder }))
			.onAfterRun(e => this.onAfterRun({ ...e, parentBuilder: e.builder }));
	}
	onInit(e) { } onBuildEk(e) { } onAfterRun(e) { }
}
class AltRapor_Gridli extends AltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get gridlimi() { return true }
	subFormBuilderDuzenle(e) {
		super.subFormBuilderDuzenle(e); const parentBuilder = e.builder;
		let fbd = this.fbd_grid = parentBuilder.addGridliGosterici().addStyle_fullWH({ height: '90%' }).rowNumberOlmasin().notAdaptive()
			.addStyle_fullWH(null, 'calc(var(--full) - 55px)').widgetArgsDuzenleIslemi(e => this.gridArgsDuzenle(e) ).onBuildEk(e => this.onGridInit(e))
			.veriYukleninceIslemi(e => this.gridVeriYuklendi(e)).setSource(e => this.loadServerData(e))
			.setTabloKolonlari(e => { let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); return _e.liste })
			.onAfterRun(e => this.onGridRun(e));
		let _e = { ...e, gridBuilder: fbd }; this.gridBuilderDuzenle(_e)
	}
	gridBuilderDuzenle(e) { }
	gridArgsDuzenle(e) { const {args} = e; $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: false, showGroupsHeader: true }) }
	onGridInit(e) { this.gridPart = e.builder.part } onGridRun(e) { const {gridPart} = this, {grid, gridWidget} = gridPart; $.extend(this, { grid, gridWidget }) }
	tabloKolonlariDuzenle(e) { } loadServerData(e) { } gridVeriYuklendi(e) { }
	tazele(e) { super.tazele(e); this.gridPart?.tazele(e) }
}
