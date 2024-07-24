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
class DAltRapor_TreeGrid extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridmi() { return true }
	tabloKolonlariDuzenle(e) { }
	onBuildEk(e) {
		super.onBuildEk(e); const {parentBuilder} = this, {layout} = parentBuilder;
		this.fbd_grid = parentBuilder.addForm(`<div class="grid part full-wh"/>`)
			.onAfterRun(async e => {
				const fbd_grid = e.builder, gridPart = this.gridPart = fbd_grid.part = {}, grid = gridPart.grid = fbd_grid.layout;
				$.extend(gridPart, { tazele: e => this.tazele(e), hizliBulIslemi: e => this.hizliBulIslemi(e) });
				let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); const colDefs = this.tabloKolonlari = this.getColumns(_e.liste || []);
				gridPart.expandedRowsSet = {}; this.onGridInit(e); const {gruplamaKAListe} = this.class; const gruplamalar = this._gruplamalar = gruplamaKAListe.map(ka => ka.kod);
				const columns = colDefs.filter(colDef => colDef.belirtec != 'grup').flatMap(colDef => colDef.jqxColumns), source = await this.getDataAdapter(e);
				const localization = localizationObj, width = '99.7%', height = width, autoRowHeight = true, autoShowLoadElement = true, altRows = true;
				const filterMode = 'advanced';	/* default | simple | advanced */
				const showAggregates = true, showSubAggregates = true, aggregatesHeight = 55, columnsResize = true, columnsReorder = true, sortable = true, filterable = true;
				let args = { theme, localization, width, height, autoRowHeight, autoShowLoadElement, altRows, filterMode, showAggregates, showSubAggregates, aggregatesHeight, columnsResize, columnsReorder, sortable, filterable, columns, source };
				_e = { ...e, args }; this.gridArgsDuzenle(_e); args = _e.args; grid.jqxTreeGrid(args); gridPart.gridWidget = grid.jqxTreeGrid('getInstance');
				grid.on('rowExpand', event => this.gridRowExpanded({ ...e, event }));
				grid.on('rowCollapse', event => this.gridRowCollapsed({ ...e, event }));
				grid.on('rowClick', event => this.gridSatirTiklandi({ ...e, event }));
				grid.on('rowDoubleClick', event => this.gridSatirCiftTiklandi({ ...e, event }));
				this.onGridRun(e)
			})
	}
	gridArgsDuzenle(e) { } onGridInit(e) { } onGridRun(e) { }
	gridRowExpanded(e) { const {gridPart} = this; gridPart.expandedRowsSet[e.event.args.row?.uid] = true }
	gridRowCollapsed(e) { const {gridPart} = this; gridPart.expandedRowsSet[e.event.args.row?.uid] = false }
	gridSatirTiklandi(e) { }
	gridSatirCiftTiklandi(e) { 
		const {gridPart} = this, {gridWidget, expandedRowsSet} = gridPart, {args} = e.event, {uid} = args.row || {};
		if (uid != null) { gridWidget[expandedRowsSet[uid] ? 'collapseRow' : 'expandRow'](uid) }
	}
	async tazele(e) {
		e = e || {}; await super.tazele(e); const {grid} = this.gridPart || {}; if (!grid) { return }
		const da = await this.getDataAdapter(e); if (!da) { return } grid.jqxTreeGrid('source', da)
	}
	super_tazele(e) { super.tazele(e) }
	hizliBulIslemi(e) { const {gridPart} = this; gridPart.filtreTokens = e.tokens; this.tazele(e) }
	gridVeriYuklendi(e) {
		const {grid, gridWidget} = this.gridPart, {boundRecs, recs} = e;
		if (boundRecs?.length) { gridWidget.expandRow(0) }
	}
	tabloKolonlariDuzenle(e) { }
	async getDataAdapter(e) {
		const recs = await this.loadServerData(e), tRec = recs[0] || {}, key_items = 'records';		/*key_id = 'id',*/
		return new $.jqx.dataAdapter({
			hierarchy: { root: key_items }, dataType: 'array', localData: recs, /* hierarchy: { keyDataField: { name: key_id }, parentDataField: { name: 'parentId' } }, */
			dataFields: Object.keys(tRec).map(name => ({ name, type: typeof tRec[name] == 'object' ? 'array' : (typeof tRec[name] || 'string') })),
		}, { autoBind: false, loadComplete: (boundRecs, recs) => setTimeout(() => this.gridVeriYuklendi({ ...e, boundRecs, recs }), 10) });
	}
	async loadServerData(e) {
		let gruplamalar = this._gruplamalar; if (gruplamalar && !$.isArray(gruplamalar)) { gruplamalar = Object.values(gruplamalar) } e.gruplamalar = gruplamalar;
		let recs = e.recs = await this.loadServerDataInternal(e); if (!recs) { return recs }
		let _recs = await this.loadServerData_recsDuzenleIlk(e); recs = e.recs = _recs == null ? e.recs : _recs;
		_recs = await this.loadServerData_recsDuzenle(e); recs = e.recs = _recs == null ? e.recs : _recs;
		_recs = await this.loadServerData_recsDuzenleSon(e); recs = e.recs = _recs == null ? e.recs : _recs;
		_recs = await this.loadServerData_recsDuzenle_seviyelendir(e); recs = e.recs = _recs == null ? e.recs : _recs;
		return recs
	}
	loadServerDataInternal(e) { return null }
	loadServerData_recsDuzenleIlk(e) {
		let {recs} = e; const {gridPart} = this, {filtreTokens} = gridPart;
		if (filtreTokens?.length) { const _recs = this.loadServerData_recsDuzenle_hizliBulIslemi(e); recs = _recs == null ? e.recs : _recs }
		return recs
	}
	loadServerData_recsDuzenle_hizliBulIslemi(e) {
		const {fbd_grid, gridPart} = this; const {filtreTokens} = gridPart; if (!filtreTokens?.length) { return }
		const colDefs = this.tabloKolonlari; const attrListe = []; for (const colDef of colDefs) { if (!(colDef.ekKolonmu || !colDef.text?.trim)) { attrListe.push(colDef.belirtec) } }
		let orjRecs = e.recs, recs = []; for (const rec of orjRecs) {
			let uygunmu = true; const values = attrListe.map(key => rec[key]?.toString()).filter(value => !!value);
			for (const token of filtreTokens) {
				let _uygunmu = false; for (let value of values) {
					if (value == null) { continue } value = value.toString();
					if (value.toUpperCase().includes(token.toUpperCase()) || value.toLocaleUpperCase(culture).includes(token.toLocaleUpperCase(culture))) { _uygunmu = true; break }
				} if (!_uygunmu) { uygunmu = false; break }
			} if (!uygunmu) { continue }
			recs.push(rec)
		}
		return recs
	}
	loadServerData_recsDuzenle(e) { } loadServerData_recsDuzenleSon(e) { } loadServerData_recsDuzenle_seviyelendir(e) { }
	getColumns(colDefs) {
		if (colDefs) { const {gridPart} = this; for (const colDef of colDefs) { colDef.gridPart = gridPart; for (const key of ['tip', 'cellsRenderer','cellValueChanging']) { delete colDef[key] } } }
		return colDefs
	}
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
		let {gruplamalar} = gridPart, gruplamaVarmi = !$.isEmptyObject(gruplamalar), colDefs = this.tabloKolonlari; const {gridGrupAttrSet, gruplamaKAListe} = this.class;
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
				_lastGruplamalar = this._lastGruplamalar = $.extend({}, gruplamalar)
			}
		}
		finally { gridWidget.endupdate(false) }
		const groups = []; if (Object.keys(gruplamalar).length >= 2) {
			for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length) { const belirtec = belirtecler[1] || belirtecler[0]; groups.push(belirtec) } } }
		if (groups.length) { grid.jqxGrid('groups', groups) } /*if (groups.length) { for (const belirtec of groups) { gridWidget.hidecolumn(belirtec) } }*/
	}
	gruplamalarIstendi(e) {
		const {gridPart, gruplamalar} = this, {gruplamaKAListe} = this.class;
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
class DAltRapor_TreeGridGruplu extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridliAltRapormu() { return true }
	static get raporClass() { return null } static get kod() { return 'main' } static get aciklama() { return this.raporClass.aciklama }
	get width() { return '85%' } get height() { return 'var(--full)' } static get gruplamaKAListe() { return [] }
	static get gridGrupAttrSet() { let result = this._gridGrupAttrSet; if (result == null) { result = this._gridGrupAttrSet = asSet(this.gridGrupAttrListe) } return result }
	static get gridGrupAttrListe() { return [] } static get kaPrefixes() { return [] } static get sortAttr() { return null }
	static get gruplama2IcerikCols() { return {} }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e) /*; const {args} = e; $.extend(args, { showStatusBar: true, showGroupAggregates: true , compact: true })*/ }
	onGridInit(e) { this.gruplamalar = {}; super.onGridInit(e) }
	onGridRun(e) { super.onGridRun(e); this.tazeleOncesi(e) }
	loadServerData(e) {
		const {gridPart, gruplamalar} = this; if ($.isEmptyObject(gruplamalar)) { return [] }
		return super.loadServerData(e)
	}
	loadServerData_recsDuzenleIlk(e) {
		let {recs} = e; const {kaPrefixes, sortAttr} = this.class, fixKA = (rec, prefix) => {
			if (rec == null) { return } const kod = rec[prefix + 'kod'], adi = rec[prefix + 'adi'];
			if (kod !== undefined) {
				rec[prefix] = kod ? `<b>(${kod ?? ''})</b> ${adi ?? ''}` : '';
				delete rec[prefix + 'kod']; delete rec[prefix + 'adi']
			}
		};
		let id = 1; for (const rec of recs) { for (const prefix of kaPrefixes) { fixKA(rec, prefix) } rec.id = id++ }
		if (sortAttr) { recs.sort((a, b) => { a = a[sortAttr] || 0; b = b[sortAttr] || 0; return a > b ? -1 : a < b ? 1 : 0 }) }
		e.recs = recs; return super.loadServerData_recsDuzenleIlk(e)
	}
	loadServerData_recsDuzenle_seviyelendir(e) {
		super.loadServerData_recsDuzenle_seviyelendir(e); const {gridPart, gruplamalar} = this, {gridWidget} = gridPart;
		const colDefs = this.tabloKolonlari, jqxCols = gridWidget.base.columns.records, gridGrupAttrSet = asSet(this.class.gridGrupAttrListe || []);
		let grupColAttr = colDefs.find(colDef => !!gridGrupAttrSet[colDef.userData?.grup] && !!gruplamalar[colDef.userData?.grup])?.belirtec, grupTextColAttr = jqxCols[0].datafield;
		let {recs} = e; if (!grupColAttr) { return recs }
		let grup2Recs = {}; for (const rec of recs) { const grup = rec[grupColAttr], subRecs = grup2Recs[grup] = grup2Recs[grup] || []; subRecs.push(rec) }
		recs = []; let id = 1; for (const [grup, subRecs] of Object.entries(grup2Recs)) {
			const rec_grup = { id: id++, records: [] }; rec_grup[grupTextColAttr] = grup; recs.push(rec_grup);
			for (const subRec of subRecs) { rec_grup.records.push(subRec) }
		}
		return recs
	}
	async tazele(e) {
		const {fbd_grid, gridPart} = this, {grid, gridWidget} = gridPart; let {_lastGruplamalar, gruplamalar} = this, gruplamaVarmi = !$.isEmptyObject(gruplamalar);
		let colDefs = this.tabloKolonlari; const {gridGrupAttrSet, gruplamaKAListe} = this.class;
		/*if ($.isEmptyObject(gruplamalar)) { gruplamalar = asSet(gruplamaKAListe.map(x => x.kod)) }*/
		await this.tazeleOncesi(e); const belirtec2Kolon = {}; for (const colDef of colDefs) { belirtec2Kolon[colDef.belirtec] = colDef }
		const icerikColsSet = {}, tip2Belirtecler = {}; let count = 0;
		for (const colDef of colDefs) {
			const {belirtec} = colDef, grup = colDef.userData?.grup; if (!grup) { icerikColsSet[belirtec] = colDef }
			if (grup != null && gridGrupAttrSet[grup] && gruplamalar[grup]) { (tip2Belirtecler[grup] = tip2Belirtecler[grup] || []).push(belirtec); count++ }
		}
		for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length > 1) { belirtecler.splice(0, -1) } }
		let anahGruplamalar = Object.keys(gruplamalar).join(delimWS), anahLastGruplamalar = _lastGruplamalar ? Object.keys(_lastGruplamalar).join(delimWS) : null;
		await gridPart._promise_kaFix; if (anahLastGruplamalar == null || anahGruplamalar != anahLastGruplamalar) {
			let tabloKolonlari = colDefs.filter(colDef => { const {belirtec} = colDef, grup = colDef.userData?.grup; return !icerikColsSet[belirtec] && (grup == null || !!gruplamalar[grup]) });
			const attrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec));
			const {gruplama2IcerikCols} = this.class; for (const [gruplama, belirtecler] of Object.entries(gruplama2IcerikCols)) {
				const gruplamaVarmi = gruplamalar[gruplama]; if (!gruplamaVarmi) { continue }
				for (const belirtec of belirtecler) {
					if (attrSet[belirtec]) { continue } const colDef = belirtec2Kolon[belirtec]; if (colDef == null) { continue }
					attrSet[belirtec] = true; tabloKolonlari.push(colDef)
				}
			} grid.jqxTreeGrid('clear'); tabloKolonlari = this.getColumns(tabloKolonlari);
			let ind = tabloKolonlari.findIndex(colDef => !!gruplamalar[colDef.userData?.grup] && !!gridGrupAttrSet[colDef.userData?.grup]);
			if (ind != -1) { tabloKolonlari.splice(ind, 1) }
			try { grid.jqxTreeGrid('columns', tabloKolonlari.flatMap(colDef => colDef.jqxColumns)) } catch (ex) { console.error(ex) }
			_lastGruplamalar = this._lastGruplamalar = $.extend({}, gruplamalar)
		}
		/*const groups = []; if (Object.keys(gruplamalar).length >= 2) {
			for (const belirtecler of Object.values(tip2Belirtecler)) { if (belirtecler?.length) { const belirtec = belirtecler[1] || belirtecler[0]; groups.push(belirtec) } } }
		if (groups.length) { grid.jqxGrid('groups', groups) }*/
		return await super.tazele(e)
	}
	tazeleOncesi(e) {
		const {fbd_grid, gruplamalar} = this, {rootBuilder} = this.parentBuilder, gruplamaVarmi = !$.isEmptyObject(gruplamalar);
		rootBuilder.layout.find('.islemTuslari > div button#gruplamalar')[gruplamaVarmi ? 'removeClass' : 'addClass']('anim-gruplamalar-highlight');
		if (!gruplamaVarmi) { if (!this._gruplamalarGosterildiFlag) { this.gruplamalarIstendi(e) } return }
	}
	gruplamalarIstendi(e) {
		const {gridPart} = this, {gruplamalar} = this, {gruplamaKAListe} = this.class;
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

