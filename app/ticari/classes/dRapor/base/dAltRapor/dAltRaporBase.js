class DAltRapor extends DRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' }
	static get dRapormu() { return false } static get dAltRapormu() { return true } static get mainmi() { return false }
	static get secimSinif() { return MQCogul.secimSinif } static get etiket() { return this.aciklama }
	get etiket() {
		let {isPanelItem, rapor, raporTanim, class: { mainmi, etiket: result, mstEtiket }} = this
		let {_baslik, main: { class: mainClass } = {}} = rapor ?? {}
		let {aciklama: raporAdi} = raporTanim ?? {}
		raporAdi ||= mstEtiket || mainClass?.aciklama
		if (_baslik) { return _baslik }
		if (!mainmi && result != raporAdi) { result = `${result} &nbsp;[<b class="bold royalblue">${result}</b>]` }
		return result
	}
	get isPanelItem() { return this.rapor?.isPanelItem } get width() { return null } get height() { return null }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			rapor: e.rapor, parentBuilder: e.parentBuilder, acilinca: e.acilinca,
			secimler: e.secimler, secimlerDuzenleBlock: e.secimlerDuzenleBlock ?? e.secimlerDuzenle
		})
	}
	rootFormBuilderDuzenle(e) { }
	subFormBuilderDuzenle(e) {
		let {rapor: { isPanelItem, panel }, parentBuilder: fbd} = this
		fbd.onInit(e => this.onInit(e)).onBuildEk(e => this.onBuildEk(e));
		fbd.addButton('fullScreen').onClick(_e => { this.toggleFullScreen({ ...e, ..._e }) })
		if (isPanelItem) { fbd.addButton('close').onClick(_e => { panel.remove(this) }) }
		fbd.onAfterRun(e => this.onAfterRun(e));
	}
	newSecimler(e) {
		let {secimSinif} = this.class; if (secimSinif == null) { return null }
		let _e = { ...e, secimler: new secimSinif() }; _e.secimler.beginUpdate();
		this.secimlerDuzenle(_e); this.secimlerDuzenleSon(_e); this.secimlerDuzenle_ozel?.(e);
		if (_e.secimler) { _e.secimler.endUpdate() }
		return _e.secimler
	}
	secimlerDuzenle(e) { } secimlerDuzenleSon(e) { } secimlerInitEvents(e) { }
	loadServerData_wsArgsDuzenle(e) { let {secimler} = this; $.extend(e, { secimler }) }
	onInit(e) { this.onInit_ozel?.(e) }
	onBuildEk(e) { this.onBuildEk_ozel?.(e) }
	onAfterRun(e) {
		/*let {fullScreen: builder} = this.parentBuilder.id2Builder, {id2AltRapor} = this.rapor;
		 if (Object.keys(id2AltRapor).length < 2) { setTimeout(() => this.toggleFullScreen({ builder }), 1) } */
		this.onAfterRun_ozel?.(e); this.acilinca?.call(this, e)
	}
	onResize(e) { }
	tazeleDiger(e) {
		let {id2AltRapor} = this.rapor;
		for (let altRapor of Object.values(id2AltRapor)) {
			if (altRapor == this) { continue }
			altRapor.tazele(e)
		}
	}
	toggleFullScreen(e) {
		let {builder} = e, {rootBuilder, parentBuilder, layout, part} = builder;
		let parentLayout = parentBuilder.layout, itemsLayout = rootBuilder.id2Builder.items.layout;
		for (let _layout of [parentLayout, itemsLayout]) { _layout.toggleClass('maximized') }
		layout.trigger('resize'); if (part?.onResize) { part.onResize(e) }
		let {id2AltRapor} = this.rapor; for (let altRapor of Object.values(id2AltRapor)) { altRapor.onResize(e) }
	}
	secimlerIstendi(e) {
		let {secimlerPart} = this; if (secimlerPart?.isDestroyed) { secimlerPart = this.secimlerPart = undefined }
		if (secimlerPart) { secimlerPart.show() }
		else {
			let {secimler} = this; if (secimler) {
				secimlerPart = this.secimlerPart = secimler.duzenlemeEkraniAc({
					parentPart: this.rapor.part,
					tamamIslemi: e => void(this.rapor.tazele())    // no async/await
				});
				if (secimlerPart)
					secimlerPart.acilinca(() => this.secimlerInitEvents(e))
			}
		}
	}
	static fixKA(rec, prefix, kodsuzmu) {
		if (rec == null) { return this }
		let kodAttr = `${prefix}kod`, adiAttr = `${prefix}adi`;
		let kod = kodsuzmu ? null : rec[kodAttr], adi = rec[adiAttr]; if (kod !== undefined) {
			rec[prefix] = kod ? `(${kod ?? ''}) ${adi ?? ''}` : ''
			/* for (let key of [kodAttr, adiAttr]) { delete rec[key] } */
		}
		return this
	}
	fixKA(rec, prefix, kodsuzmu) { return this.class.fixKA(rec, prefix, kodsuzmu) }
	secimlerDuzenleyici(handler) { this.secimlerDuzenleBlock = handler; return this }
	setBaslik(value) { this.rapor?.setBaslik(value); return this }
}
