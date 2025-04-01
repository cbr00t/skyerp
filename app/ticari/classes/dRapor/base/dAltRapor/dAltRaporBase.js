class DAltRapor extends DRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' }
	static get dRapormu() { return false } static get dAltRapormu() { return true }
	static get secimSinif() { return MQCogul.secimSinif } get width() { return null } get height() { return null }
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
		const _e = { ...e, secimler: new secimSinif() }; _e.secimler.beginUpdate();
		this.secimlerDuzenle(_e); this.secimlerDuzenleSon(_e); this.secimlerDuzenle_ozel?.(e);
		if (_e.secimler) { _e.secimler.endUpdate() }
		return _e.secimler
	}
	secimlerDuzenle(e) { } secimlerDuzenleSon(e) { } secimlerInitEvents(e) { }
	loadServerData_wsArgsDuzenle(e) { const {secimler} = this; $.extend(e, { secimler }) }
	onInit(e) { this.onInit_ozel?.(e) }
	onBuildEk(e) { this.onBuildEk_ozel?.(e) }
	onAfterRun(e) {
		let {fullScreen: builder} = this.parentBuilder.id2Builder, {id2AltRapor} = this.rapor;
		/* if (Object.keys(id2AltRapor).length < 2) { setTimeout(() => this.toggleFullScreen({ builder }), 1) } */
		this.onAfterRun_ozel?.(e)
	}
	onResize(e) { }
	tazeleDiger(e) { const {id2AltRapor} = this.rapor; for (const altRapor of Object.values(id2AltRapor)) { if (altRapor != this) { altRapor.tazele(e) } } }
	toggleFullScreen(e) {
		const {builder} = e, {rootBuilder, parentBuilder, layout, part} = builder;
		let parentLayout = parentBuilder.layout, itemsLayout = rootBuilder.id2Builder.items.layout;
		for (const _layout of [parentLayout, itemsLayout]) { _layout.toggleClass('maximized') }
		layout.trigger('resize'); if (part?.onResize) { part.onResize(e) }
		const {id2AltRapor} = this.rapor; for (const altRapor of Object.values(id2AltRapor)) { altRapor.onResize(e) }
	}
	secimlerIstendi(e) {
		let {secimlerPart} = this; if (secimlerPart?.isDestroyed) { secimlerPart = this.secimlerPart = undefined }
		if (secimlerPart) { secimlerPart.show() }
		else {
			const {secimler} = this; if (secimler) {
				secimlerPart = this.secimlerPart = secimler.duzenlemeEkraniAc({ parentPart: this.rapor.part, tamamIslemi: e => this.rapor.tazele() });
				if (secimlerPart) { secimlerPart.acilinca(() => this.secimlerInitEvents(e)) }
			}
		}
	}
	static fixKA(rec, prefix, kodsuzmu) {
		if (rec == null) { return this }
		const kodAttr = `${prefix}kod`, adiAttr = `${prefix}adi`;
		const kod = kodsuzmu ? null : rec[kodAttr], adi = rec[adiAttr]; if (kod !== undefined) {
			rec[prefix] = kod ? `(${kod ?? ''}) ${adi ?? ''}` : ''
			/* for (const key of [kodAttr, adiAttr]) { delete rec[key] } */
		}
		return this
	}
	fixKA(rec, prefix, kodsuzmu) { return this.class.fixKA(rec, prefix, kodsuzmu) }
}
