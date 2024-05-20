class GridliGirisWindowPart extends GridliGirisPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return false }
	static get isWindowPart() { return true }
	static get partName() { return 'gridliGirisWindow' }
	
	constructor(e) {
		super(e); e = e || {};
		$.extend(this, { islemTuslariDuzenleyici: e.islemTuslariDuzenle || e.islemTuslariDuzenleyici, gridArgs: $.extend({ selectionMode: e.selectionMode }, e.gridArgs) })
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e);
		const {layout} = this; this.header = this.header || layout.find('.header');
		const islemTuslari = this.islemTuslari = this.islemTuslari || layout.find('.islemTuslari'); let {islemTuslariPart} = this;
		if (!islemTuslariPart && (islemTuslari && islemTuslari.length)) {
			islemTuslariPart = this.islemTuslariPart = new ButonlarPart({ sender: this, layout: islemTuslari, tip: 'tamamVazgec', butonlarDuzenleyici: e => this.islemTuslariDuzenle(e) });
			islemTuslariPart.run()
		}
	}
	afterRun(e) {
		super.afterRun(e);
		setTimeout(() => { const {gridWidget} = this; if (!this.isDestroyed && gridWidget) { gridWidget.focus(); this.show() } }, 150)
	}
	initWndArgsDuzenle(e) { super.initWndArgsDuzenle(e); const {wndArgs} = this; $.extend(wndArgs, { keyboardCloseKey: '' }); }
	islemTuslariDuzenle(e) {
		const {islemTuslariDuzenleyici} = this;
		if (islemTuslariDuzenleyici) { let result = getFuncValue.call(this, islemTuslariDuzenleyici, e); if (typeof result == 'object') e.liste = result = result.liste || result; }
		const {liste} = e, yListe = [];
		for (const item of liste) {
			const {id} = item; switch (id) { case 'vazgec': item.handler = e => this.vazgecIstendi(e); break }
			yListe.push(item)
		}
		e.liste = yListe
	}
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e); const {args} = e;
		$.extend(args, this.gridArgs); args.selectionMode = args.selectionMode || 'multiplecellsextended'
	}
	async gridVeriYuklendi(e) {
		e = e || {}; await super.gridVeriYuklendi(e);
		const {gridWidget} = e, selectionMode = gridWidget.selectionmode, sel = gridWidget.getselection();
		if (selectionMode && selectionMode != 'none' && $.isEmptyObject(sel.rows) && $.isEmptyObject(sel.cells)) {
			gridWidget.clearselection();
			if (selectionMode == 'checkbox' || selectionMode.toLowerCase().includes('row'))
				gridWidget.selectrow(0)
			else {
				const colDef = this.duzKolonTanimlari.find(_colDef => _colDef.isEditable) || {};
				if (colDef) gridWidget.selectcell(0, colDef.belirtec)
			}
		}
		this.focus()
	}
}
