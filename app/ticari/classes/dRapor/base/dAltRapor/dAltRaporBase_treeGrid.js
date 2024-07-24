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
				const showAggregates = true, showSubAggregates = true, aggregatesHeight = 55, columnsResize = true, columnsReorder = true, sortable = true, filterable = false;
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
		if (colDefs) {
			const {gridPart} = this; for (const colDef of colDefs) {
				colDef.gridPart = gridPart; for (const key of ['tip', 'cellsRenderer','cellValueChanging']) { delete colDef[key] }
				colDef.aggregatesRenderer = (colDef, aggregates, jqCol, elm) => {
					let result = []; for (const [tip, value] of Object.entries(aggregates)) {
						if (typeof value != 'number') { continue }
						result.push(`<div class="toplam-item"><span class="lightgray">T</span> <span>${value.toLocaleString()}</span></div>`)
					}
					return result.join('')
				}
			}
		}
		return colDefs
	}
}
class DAltRapor_TreeGridGruplu extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridliAltRapormu() { return true }
	static get raporClass() { return null } static get kod() { return 'main' } static get aciklama() { return this.raporClass.aciklama }
	get width() { return '85%' } get height() { return 'var(--full)' } static get gruplamaKAListe() { return [] }
	static get gridGrupAttrSet() { let result = this._gridGrupAttrSet; if (result == null) { result = this._gridGrupAttrSet = asSet(this.gridGrupAttrListe) } return result }
	static get gridGrupAttrListe() { return [] } static get kaPrefixes() { return [] } static get sortAttr() { return null }
	static get gruplama2IcerikCols() { return {} }
	gridArgsDuzenle(e) { super.gridArgsDuzenle(e) ; const {args} = e; $.extend(args, { showSubAggregates: false /*showStatusBar: true, showGroupAggregates: true , compact: true*/ }) }
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
		const {gruplama2IcerikCols} = this.class, icerikColsSet = asSet(Object.keys(gruplamalar).flatMap(key => gruplama2IcerikCols[key]));
		let grup2Recs = {}; for (const rec of recs) { const grup = rec[grupColAttr], subRecs = grup2Recs[grup] = grup2Recs[grup] || []; subRecs.push(rec) }
		let id = 1; recs = []; for (const [grup, subRecs] of Object.entries(grup2Recs)) {
			const rec_grup = { id: id++, records: [] }; rec_grup[grupTextColAttr] = grup; recs.push(rec_grup);
			for (const subRec of subRecs) {
				for (const key in icerikColsSet) { let value = subRec[key]; if (value) { rec_grup[key] = roundToFra((rec_grup[key] || 0) + value, 2) } }
				rec_grup.records.push(subRec)
			}
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
	getColumns(colDefs) {
		colDefs = super.getColumns(colDefs); if (!colDefs) { return colDefs }
		const {gridPart} = this; let icerikColsSet; for (const colDef of colDefs) {
			colDef.cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
				if (icerikColsSet == null) { const {gruplamalar} = this, {gruplama2IcerikCols} = this.class; icerikColsSet = asSet(Object.keys(gruplamalar).flatMap(key => gruplama2IcerikCols[key])) }
				const result = ['treeRow']; if (rec && !rec.leaf) { result.push('grup') }
				if (icerikColsSet && icerikColsSet[belirtec]) { result.push('icerik') }
				let {level} = rec; if (level != null) { result.push('level-' + level.toString()) }
				return result.filter(x => !!x).join(' ')
			}
		}
		return colDefs
	}
}
