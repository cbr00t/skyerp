class DAltRapor extends DRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' }
	static get dAltRapormu() { return true } static get secimSinif() { return MQCogul.secimSinif }
	get width() { return null } get height() { return null }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { rapor: e.rapor, parentBuilder: e.parentBuilder, secimler: e.secimler, secimlerDuzenleBlock: e.secimlerDuzenleBlock ?? e.secimlerDuzenle })
	}
	rootFormBuilderDuzenle(e) { }
	subFormBuilderDuzenle(e) {
		const {parentBuilder} = this; parentBuilder.onInit(e => this.onInit(e)).onBuildEk(e => this.onBuildEk(e)).onAfterRun(e => this.onAfterRun(e));
		parentBuilder.addButton('fullScreen').onClick(_e => { this.toggleFullScreen({ ...e, ..._e }) })
	}
	newSecimler(e) {
		const {secimSinif} = this.class; if (secimSinif == null) { return null }
		const _e = { ...e, secimler: new secimSinif() }; _e.secimler.beginUpdate(); this.secimlerDuzenle(_e); this.secimlerDuzenleSon(_e);
		if (_e.secimler) { _e.secimler.endUpdate() }
		return _e.secimler
	}
	secimlerDuzenle(e) { } secimlerDuzenleSon(e) { } secimlerInitEvents(e) { }
	loadServerData_wsArgsDuzenle(e) { const {secimler} = this; $.extend(e, { secimler }); secimler?.getTBWhereClause(e) }
	onInit(e) { } onBuildEk(e) { } onAfterRun(e) { }
	
	tazeleDiger(e) { const {id2AltRapor} = this.rapor; for (const rapor of Object.values(id2AltRapor)) { if (rapor != this) { rapor.tazele(e) } } }
	toggleFullScreen(e) {
		const {builder} = e, {rootBuilder, parentBuilder, layout, part} = builder, parentLayout = parentBuilder.layout, itemsLayout = rootBuilder.id2Builder.items.layout, CSSClass_Maximized = 'maximized';
		for (const _layout of [parentLayout, itemsLayout]) { _layout.toggleClass('maximized') }
		layout.trigger('resize'); if (part?.onResize) { part.onResize(e) }
	}
	secimlerIstendi(e) {
		let {secimlerPart} = this; if (secimlerPart) { secimlerPart.show() }
		else {
			const {secimler} = this; if (secimler) {
				secimlerPart = this.secimlerPart = secimler.duzenlemeEkraniAc({ parentPart: this, tamamIslemi: e => this.rapor.tazele() });
				if (secimlerPart) { secimlerPart.acilinca(() => this.secimlerInitEvents(e)) }
			}
		}
	}
}
