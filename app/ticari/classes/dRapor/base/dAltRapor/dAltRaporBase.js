class DAltRapor extends DRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' } static get dAltRapormu() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { rapor: e.rapor, parentBuilder: e.parentBuilder }) }
	get width() { return null } get height() { return null }
	rootFormBuilderDuzenle(e) { }
	subFormBuilderDuzenle(e) {
		const {parentBuilder} = this; parentBuilder.onInit(e => this.onInit(e)).onBuildEk(e => this.onBuildEk(e)).onAfterRun(e => this.onAfterRun(e));
		parentBuilder.addButton('fullScreen').onClick(_e => { this.toggleFullScreen({ ...e, ..._e }) })
	}
	onInit(e) { } onBuildEk(e) { } onAfterRun(e) { }
	tazeleDiger(e) { const {id2AltRapor} = this.rapor; for (const rapor of Object.values(id2AltRapor)) { if (rapor != this) { rapor.tazele(e) } } }
	toggleFullScreen(e) {
		const {builder} = e, {rootBuilder, parentBuilder, layout, part} = builder, parentLayout = parentBuilder.layout, itemsLayout = rootBuilder.id2Builder.items.layout, CSSClass_Maximized = 'maximized';
		for (const _layout of [parentLayout, itemsLayout]) { _layout.toggleClass('maximized') }
		layout.trigger('resize'); if (part?.onResize) { part.onResize(e) }
	}
}
