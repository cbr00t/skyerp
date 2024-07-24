class DAltRapor extends DRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' } static get dAltRapormu() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { rapor: e.rapor, parentBuilder: e.parentBuilder }) }
	get width() { return null } get height() { return null }
	rootFormBuilderDuzenle(e) { }
	subFormBuilderDuzenle(e) { const {parentBuilder} = this; parentBuilder.addStyle_fullWH().onInit(e => this.onInit(e)).onBuildEk(e => this.onBuildEk(e)).onAfterRun(e => this.onAfterRun(e)) }
	onInit(e) { } onBuildEk(e) { } onAfterRun(e) { }
}
