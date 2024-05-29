class GridliGostericiWindowPart extends GridliGostericiPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return false } static get isWindowPart() { return true } static get partName() { return 'gridliGostericiWindow' }
	get secince() { return (this.secimBilgi || {}).secince } set secince(value) { (this.secimBilgi || {}).secince = value }
	get vazgecince() { return (this.secimBilgi || {}).vazgecince } set vazgecince(value) { (this.secimBilgi || {}).vazgecince = value }
	get tekilmi() { return (this.secimBilgi || {}).tekilmi } set tekilmi(value) { (this.secimBilgi || {}).tekilmi = value }
	get converter() { return (this.secimBilgi || {}).converter } set converter(value) { (this.secimBilgi || {}).converter = value }

	constructor(e) {
		super(e); e = e || {}; if ((e.tekil ?? e.tekilmi) == null) { e.tekil = false }
		$.extend(this, {
			secimBilgi: e.secimBilgi ?? new SecimBilgi(e), gridArgs: $.extend({ selectionMode: e.selectionMode }, e.gridArgs),
			islemTuslariDuzenleyici: e.islemTuslariDuzenle || e.islemTuslariDuzenleyici, secinceKontroluYapilmazmi: e.secinceKontroluYapilmazmi ?? e.secinceKontroluYapilmaz
		});
		let {secimBilgi} = this; if ($.isPlainObject(secimBilgi)) { secimBilgi = this.secimBilgi = new SecimBilgi(secimBilgi) }
		let keys = ['secince', 'vazgecince', 'tekilmi', 'converter']; for (const key of keys) { const value = e[key]; if (value !== undefined) { secimBilgi[key] = value } }
		const {gridArgs, secince, tekilmi} = this; gridArgs.selectionMode = tekilmi ? 'singlerow' : (secince ? 'checkbox' : 'singlerow')
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e);
		const {layout} = this; this.header = this.header || layout.find('.header');
		const islemTuslari = this.islemTuslari = this.islemTuslari || layout.find('.islemTuslari'); let {islemTuslariPart} = this;
		if (!islemTuslariPart && (islemTuslari?.length)) {
			islemTuslariPart = this.islemTuslariPart = new ButonlarPart({ sender: this, layout: islemTuslari, tip: 'tazeleVazgecSec', butonlarDuzenleyici: e => this.islemTuslariDuzenle(e) });
			islemTuslariPart.run()
		}
	}
	afterRun(e) {
		super.afterRun(e);
		setTimeout(() => { const {gridWidget} = this; if (!this.isDestroyed && gridWidget) { gridWidget.focus(); this.show() } }, 20)
	}
	destroyPart(e) {
		super.destroyPart(e);
		const {islemTuslariPart} = this; if (islemTuslariPart) { islemTuslariPart.destroyPart() }
		this.islemTuslariPart = null;
	}
	islemTuslariDuzenle(e) {
		const {islemTuslariDuzenleyici} = this;
		if (islemTuslariDuzenleyici) {
			let result = getFuncValue.call(this, islemTuslariDuzenleyici, e);
			if (typeof result == 'object') { e.liste = result = result.liste ?? result }
		}
		const {liste} = e, yListe = [];
		for (const item of liste) {
			const {id} = item;
			switch (id) {
				case 'tazele': item.handler = e => this.tazele($.extend({}, e, { action: 'button' })); break;
				case 'sec': item.handler = e => this.secIstendi(e); if (!this.secince) { continue } break;
				case 'vazgec': item.handler = e => this.vazgecIstendi(e); break;
			}
			yListe.push(item)
		}
		e.liste = yListe
	}
	gridArgsDuzenleDevam(e) { super.gridArgsDuzenleDevam(e); const {args} = e; $.extend(args, this.gridArgs) }
	async secIstendi(e) {
		e = e || {}; const secimBilgi = this.secimBilgi || {}; if (!secimBilgi) return false
		const {secince} = this; if (!secince) return false
		const {gridWidget} = this; const recs = e.rec ? [e.rec] : (e.recs ?? this.selectedRecs);
		if (!this.secinceKontroluYapilmazmi && $.isEmptyObject(recs)) return false
		const _e = { sender: this, grid: this.grid, gridWidget: this.gridWidget, recs, secince, tekilmi: this.tekilmi, mfSinif: this.getMFSinif(e), converter: this.converter };
		const result = await secimBilgi.sec(_e); if (result === false) return false
		this.secIstendimi = true; this.destroyPart(); return true
	}
	gridVeriYuklendi(e) {
		e = e || {}; super.gridVeriYuklendi(e);
		const {gridWidget} = e, selectionMode = gridWidget.selectionmode, sel = gridWidget.getselection();
		if (selectionMode && selectionMode != 'none' && $.isEmptyObject(sel.rows) && $.isEmptyObject(sel.cells)) {
			try { gridWidget.clearselection() } catch (ex) { }
			if (selectionMode == 'checkbox' || selectionMode.toLowerCase().includes('row')) { try { gridWidget.selectrow(0) } catch (ex) { } }
			else { const colDef = this.duzKolonTanimlari.find(_colDef => _colDef.isEditable) || {}; if (colDef) { try { gridWidget.selectcell(0, colDef.belirtec) } catch (ex) { } } }
		}
		gridWidget.focus()
	}
	gridSatirCiftTiklandi(e) {
		e = e || {}; if (super.gridSatirCiftTiklandi(e) === false) return false
		const {gridWidget} = this; if (gridWidget?._clickedcolumn == '_checkboxcolumn') return false
		const args = e.event?.args || {};
		if ((this.secimBilgi || {}).secince) { this.secIstendi($.extend({}, e, { rec: (args.row || {}).bounddata, rowIndex: args.rowindex })); return false }
		return true
	}
	/*triggerKapanincaEvent(e) { if (!this.secIstendimi) { const vazgecince = (this.secimBilgi || {}).vazgecince; const _e = { sender: this }; return getFuncValue.call(this, vazgecince, _e) } }*/
}
