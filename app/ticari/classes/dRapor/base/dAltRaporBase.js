class DAltRapor extends DRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'altRapor' } static get dAltRapormu() { return true }
	constructor(e) { e = e || {}; super(e); $.extend(this, { rapor: e.rapor, parentBuilder: e.parentBuilder }) }
	get width() { return null } get height() { return null }
	rootFormBuilderDuzenle(e) { }
	subFormBuilderDuzenle(e) { const {parentBuilder} = this; parentBuilder.addStyle_fullWH().onInit(e => this.onInit(e)).onBuildEk(e => this.onBuildEk(e)).onAfterRun(e => this.onAfterRun(e)) }
	onInit(e) { } onBuildEk(e) { } onAfterRun(e) { }
}
class DAltRapor_Grid extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridmi() { return true }
	subFormBuilderDuzenle(e) {
		super.subFormBuilderDuzenle(e); const {parentBuilder} = this;
		let fbd = this.fbd_grid = parentBuilder.addGridliGosterici('grid').rowNumberOlmasin().notAdaptive()
			.addStyle_fullWH(null, 'calc(var(--full) - 0px)').widgetArgsDuzenleIslemi(e => this.gridArgsDuzenle(e) ).onBuildEk(e => this.onGridInit(e))
			.veriYukleninceIslemi(e => this.gridVeriYuklendi(e)).setSource(e => this.loadServerData(e))
			.setTabloKolonlari(e => { let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); return _e.liste })
			.onAfterRun(e => this.onGridRun(e));
		let _e = { ...e, gridBuilder: fbd }; this.gridBuilderDuzenle(_e)
	}
	super_subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e) }
	gridBuilderDuzenle(e) { }
	gridArgsDuzenle(e) { const {args} = e; $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: true, showGroupsHeader: true, groupsExpandedByDefault: false }) }
	onGridInit(e) { this.gridPart = e.builder.part } onGridRun(e) { const {gridPart} = this, {grid, gridWidget} = gridPart; $.extend(this, { grid, gridWidget }) }
	tabloKolonlariDuzenle(e) { } loadServerData(e) { } gridVeriYuklendi(e) { }
	tazele(e) { super.tazele(e); this.gridPart?.tazele(e) }
	super_tazele(e) { super.tazele(e) }
}
class DAltRapor_Pivot extends DAltRapor_Grid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dPivotmu() { return true } static get dGridmi() { return false }
	subFormBuilderDuzenle(e) {
		super.super_subFormBuilderDuzenle(e); const parentBuilder = e.builder;
		let fbd = this.fbd_grid = parentBuilder.addForm('pivot').setLayout(e => $(`<div id="${e.builder.id}" class="part"></div>`)).addStyle_fullWH(null, 'calc(var(--full) - 0px)')
			.onInit(e => this.gridArgsDuzenle({ ...e, args: {} })).onBuildEk(e => this.onGridInit(e)).onAfterRun(e => this.onGridRun(e));
		let _e = { ...e, gridBuilder: fbd }; this.gridBuilderDuzenle(_e)
	}
	onGridInit(e) {
		const {builder} = e, {layout} = builder, pivot = builder.input = layout;
		builder.part = this.pivotPart = { pivot }; super.onGridInit(e)
	}
	onGridRun(e) {
		super.onGridRun(e); const {parentBuilder, fbd_grid, pivotPart} = this; let {pivot, pivotWidget} = pivotPart;
		const localization = localizationObj, autoResize = true, cache = false, async = true, autoBind = true, pivotValuesOnRows = false;
		let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); const tabloKolonlari = this.tabloKolonlari = _e.liste;
		const asFieldList = (arr, args) => (arr || []).map(colDefOrBelirtec => {
			const dataField = colDefOrBelirtec?.belirtec ?? colDefOrBelirtec;
			return { dataField, text: dataField, width: 200, ...(args || {}) }
		});
		const rows = asFieldList(tabloKolonlari.slice(0, 1)), columns = asFieldList(tabloKolonlari.slice(2, 3));
		const filters = asFieldList([]), values = asFieldList(tabloKolonlari.slice(-2, -1), { text: 'Toplam', function: 'sum' });
		const dataAdapter = new $.jqx.dataAdapter(
			{ autoBind, cache, async, id: '', dataType: wsDataType, url: `${webRoot}/empty.php` },
			{ autoBind, cache, async, loadServerData: (wsArgs, source, callback) => {
				let {pivotWidget, pivot} = pivotPart; if (!pivotWidget && pivot?.length) { pivotWidget = pivotPart.pivotWidget = pivot.jqxPivotGrid('getInstance') }
				setTimeout(async () => {
					const action = this._tazele_lastAction; let result = await this.loadServerData({ wsArgs, source, callback, action });
					if (result) {
						if ($.isArray(result)) { result = { totalrecords: result.length, records: result } } result = result ?? { totalrecords: 0, records: [] };
						if (typeof result == 'object') {
							if (result.records && !result.totalrecords) { result.totalrecords = result.records.length }
							try { callback(result) } catch (ex) { console.error(ex) }
						}
					}
				}, 0)
			}
		});
		const source = new $.jqx.pivot(dataAdapter, { pivotValuesOnRows, rows, columns, filters, values });
		pivot.jqxPivotGrid({ theme, localization, autoResize, source });
		pivotWidget = pivotPart.pivotWidget = pivot.jqxPivotGrid('getInstance')
	}
	gridArgsDuzenle(e) { }
	tazele(e) { super.super_tazele(e); const {pivotWidget} = this.pivotPart || {}; if (pivotWidget) { pivotWidget.dataBind() } }
}
class DAltRapor_GridGruplu extends DAltRapor_Grid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridliAltRapormu() { return true }
	static get raporClass() { return null } static get kod() { return 'main' } static get aciklama() { return this.raporClass.aciklama }
	get width() { return '75%' } get height() { return 'var(--full)' } static get gruplamaKAListe() { return [] }
	static get gridGrupAttrSet() { let result = this._gridGrupAttrSet; if (result == null) { result = this._gridGrupAttrSet = asSet(this.gridGrupAttrListe) } return result }
	static get gridGrupAttrListe() { return [] } static get kaPrefixes() { return [] } static get sortAttr() { return null }
	static get gruplama2IcerikCols() { return {} }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e); const {args} = e; $.extend(args, { /* showStatusBar: true, showGroupAggregates: true , compact: true */ }) }
	onGridInit(e) { super.onGridInit(e); const {gridPart} = this; gridPart.gruplamalar = {} }
	async loadServerData(e) {
		super.loadServerData(e); const {gridPart} = this; let {gruplamalar} = gridPart;
		if ($.isEmptyObject(gruplamalar)) { return [] } /*if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(this.class.gruplamaKAListe.map(x => x.kod)) } */
		e.gruplamalar = gruplamalar; let recs = (await this.loadServerDataInternal(e)) || [];
		const {kaPrefixes} = this.class, fixKA = (rec, prefix) => {
			if (rec == null) { return } const kod = rec[prefix + 'kod'], adi = rec[prefix + 'adi'];
			if (kod !== undefined) {
				rec[prefix] = kod ? `<b>(${kod ?? ''})</b> ${adi ?? ''}` : '';
				delete rec[prefix + 'kod']; delete rec[prefix + 'adi']
			}
		};
		gridPart._promise_kaFix = (async () => { for (const rec of recs) { for (const prefix of kaPrefixes) { fixKA(rec, prefix) } } })();
		const {sortAttr} = this.class; if (sortAttr) { recs.sort((a, b) => { a = a[sortAttr] || 0; b = b[sortAttr] || 0; return a > b ? -1 : a < b ? 1 : 0 }) }
		return recs
	}
	loadServerDataInternal(e) { return null }
	async gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const {fbd_grid, gridPart} = this, {grid, gridWidget} = this; let {_lastGruplamalar} = gridPart;
		let {gruplamalar} = gridPart, gruplamaVarmi = !$.isEmptyObject(gruplamalar), colDefs = fbd_grid.tabloKolonlari; const {gridGrupAttrSet, gruplamaKAListe} = this.class;
		/*if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(gruplamaKAListe.map(x => x.kod)) }*/
		fbd_grid.rootBuilder.layout.find('.islemTuslari > div button#gruplamalar')[gruplamaVarmi ? 'removeClass' : 'addClass']('anim-gruplamalar-highlight');
		if (!gruplamaVarmi) { if (!this._gruplamalarGosterildiFlag) { this.gruplamalarIstendi(e) } return }
		const belirtec2Kolon = {}; for (const colDef of colDefs) { belirtec2Kolon[colDef.belirtec] = colDef }
		const icerikColsSet = {}, tip2Belirtecler = {}; let count = 0; for (const colDef of colDefs) {
			const {belirtec} = colDef, grup = colDef.userData?.grup; if (!grup) { icerikColsSet[belirtec] = colDef }
			if (grup != null && gridGrupAttrSet[grup] && gruplamalar[grup]) { (tip2Belirtecler[grup] = tip2Belirtecler[grup] || []).push(belirtec); count++ }
		}
		for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length > 1) { belirtecler.splice(0, -1) } }
		let anahGruplamalar = Object.keys(gruplamalar).join(delimWS), anahLastGruplamalar = _lastGruplamalar ? Object.keys(_lastGruplamalar).join(delimWS) : null;
		await gridPart._promise_kaFix; gridWidget.beginupdate(); try {
			if (anahLastGruplamalar == null || anahGruplamalar != anahLastGruplamalar) {
				let tabloKolonlari = colDefs.filter(colDef => { const {belirtec} = colDef, grup = colDef.userData?.grup; return !icerikColsSet[belirtec] && (grup == null || !!gruplamalar[grup]) });
				const attrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec));
				const {gruplama2IcerikCols} = this.class; for (const [gruplama, belirtecler] of Object.entries(gruplama2IcerikCols)) {
					const gruplamaVarmi = gruplamalar[gruplama]; if (!gruplamaVarmi) { continue }
					for (const belirtec of belirtecler) {
						if (attrSet[belirtec]) { continue } const colDef = belirtec2Kolon[belirtec]; if (colDef == null) { continue }
						attrSet[belirtec] = true; tabloKolonlari.push(colDef)
					}
				}
				try { gridPart.updateColumns({ tabloKolonlari }) } catch (ex) { console.error(ex) }
				_lastGruplamalar = gridPart._lastGruplamalar = $.extend({}, gruplamalar)
			}
		}
		finally { gridWidget.endupdate(false) }
		const groups = []; if (Object.keys(gruplamalar).length >= 2) {
			for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length) { const belirtec = belirtecler[1] || belirtecler[0]; groups.push(belirtec) } } }
		if (groups.length) { grid.jqxGrid('groups', groups) } /*if (groups.length) { for (const belirtec of groups) { gridWidget.hidecolumn(belirtec) } }*/
	}
	gruplamalarIstendi(e) {
		const {gridPart} = this, {gruplamalar} = gridPart, {gruplamaKAListe} = this.class;
		let wRFB = new RootFormBuilder('gruplamalar').addCSS('part');
		wRFB.addIslemTuslari('islemTuslari').setTip('tamam').setId2Handler({ tamam: e => wnd.jqxWindow('close') })
			.addStyle(e => `$elementCSS .butonlar.part > .sol { z-index: -1; background-color: unset !important; background: transparent !important }`);
		let fbd_content = wRFB.addFormWithParent('content').yanYana()
			.addStyle(e => `$elementCSS { position: relative; top: 10px; z-index: 100 } $elementCSS > button { margin: 0 0 10px 10px }
			$elementCSS > button.jqx-fill-state-normal { background-color: whitesmoke !important } $elementCSS > button.jqx-fill-state-pressed { background-color: royalblue !important }`);
		for (const {kod, aciklama} of gruplamaKAListe) {
			let btn = fbd_content.addForm(kod).setLayout(e => {
				const {builder} = e, {id} = builder;
				return builder.input = $(`<button id="${id}">${aciklama}</button>`).jqxToggleButton({ theme, width: '45%', height: 50, toggled: gruplamalar[id] })
			});
			btn.onAfterRun(e => e.builder.input.on('click', evt => this.gruplamalar_butonTiklandi({ ...e, evt, id: evt.currentTarget.id, gridPart, gruplamalar })) )
		}
		let wnd = createJQXWindow({ title: 'Gruplamalar', args: { isModal: true, width: 500, height: 430, closeButtonAction: 'close' } });
		wnd.on('close', evt => { wnd.jqxWindow('destroy'); this.tazele(); $('body').removeClass('bg-modal') });
		wnd.prop('id', 'gruplamalar'); wnd.addClass('part'); $('body').addClass('bg-modal');
		let parent = wnd.find('div > .subContent'); wRFB.setParent(parent); wRFB.run(); this._gruplamalarGosterildiFlag = true
	}
	gruplamalar_butonTiklandi(e) {
		const {id, evt, gruplamalar} = e, target = $(evt.currentTarget), flag = target.jqxToggleButton('toggled');
		if (flag) { gruplamalar[id] = true } else { delete gruplamalar[id] }
	}
}
