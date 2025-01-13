class DAltRapor_TreeGrid extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridmi() { return true } static get dTreeGridmi() { return true }
	constructor(e) { e = e || {}; super(e) }
	/*subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const {rfb} = e; rfb.addCSS('no-overflow') }*/
	onInit(e) { super.onInit(e); if (this.secimler == null) { this.secimler = this.newSecimler(e) } }
	onBuildEk(e) {
		super.onBuildEk(e); const {parentBuilder, noAutoColumns} = this, {layout} = parentBuilder;
		this.fbd_grid = parentBuilder.addForm('grid').setLayout(e => $(`<div class="${e.builder.id} part full-wh"/>`))
			.onAfterRun(async e => {
				const fbd_grid = e.builder, gridPart = this.gridPart = fbd_grid.part = {}, grid = gridPart.grid = fbd_grid.layout;
				$.extend(gridPart, { tazele: e => this.tazele(e), hizliBulIslemi: e => this.hizliBulIslemi(e) });
				await this.onGridInit(e); let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); this.tabloKolonlariDuzenle_ozel?.(_e);
				const colDefs = this.tabloKolonlari = _e.liste || [], columns = noAutoColumns ? [] : colDefs.flatMap(colDef => colDef.jqxColumns), source = [];
				const localization = localizationObj, width = '99.7%', height = 'calc(var(--full) - 10px)', autoRowHeight = true, autoShowLoadElement = true, altRows = true;
				const filterMode = 'advanced';	/* default | simple | advanced */
				const showAggregates = true, showSubAggregates = false, columnsHeight = 60, aggregatesHeight = 30, columnsResize = true, columnsReorder = false, sortable = true, filterable = false;
				let args = {
					theme, localization, width, height, autoRowHeight, autoShowLoadElement, altRows, filterMode, showAggregates, showSubAggregates,
					columnsHeight, aggregatesHeight, columnsResize, columnsReorder, sortable, filterable, columns, source
				};
				_e = { ...e, args }; this.gridArgsDuzenle(_e); this.gridArgsDuzenle_ozel?.(_e);
				args = _e.args; grid.jqxTreeGrid(args); gridPart.gridWidget = grid.jqxTreeGrid('getInstance');
				grid.on('rowExpand', event => this.gridRowExpanded({ ...e, event }));
				grid.on('rowCollapse', event => this.gridRowCollapsed({ ...e, event }));
				grid.on('rowClick', event => this.gridSatirTiklandi({ ...e, event }));
				grid.on('rowDoubleClick', event => this.gridSatirCiftTiklandi({ ...e, event }));
				grid.on('sort', event => this.gridSortIstendi({ ...e, event }));
				this.onGridRun(e)
			})
	}
	tabloKolonlariDuzenle(e) { } gridArgsDuzenle(e) { }
	onGridInit(e) { /*const {gridPart} = this*/ } onGridRun(e) { this.onGridRun_ozel?.(e); this.tazele(e) }
	gridRowExpanded(e) { const {gridPart} = this, {level, uid} = e.event.args.row || {}; gridPart.expandedRowsSet[`${level}-${uid}`] = true }
	gridRowCollapsed(e) { const {gridPart} = this, {level, uid} = e.event.args.row || {}; gridPart.expandedRowsSet[`${level}-${uid}`] = false }
	gridSatirTiklandi(e) { }
	gridSatirCiftTiklandi(e) { 
		const {gridPart} = this, {gridWidget, expandedRowsSet} = gridPart, {args} = e.event, {level, uid} = args.row || {};
		if (uid != null) { gridWidget[expandedRowsSet[`${level}-${uid}`] ? 'collapseRow' : 'expandRow'](uid) }
	}
	async tazele(e) {
		e = e || {}; await super.tazele(e); const {grid} = this.gridPart || {}; if (!grid) { return }
		let da = this.tazele_ozel?.(e); if (!da) { da = await this.getDataAdapter(e) }
		if (da) { grid.jqxTreeGrid('source', da) }
	}
	super_tazele(e) { super.tazele(e) }
	hizliBulIslemi(e) { const {gridPart} = this; gridPart.filtreTokens = e.tokens; this.tazele(e) }
	gridVeriYuklendi(e) {
		const {gridPart} = this, {grid, gridWidget} = gridPart, {boundRecs, recs} = e; gridPart.expandedRowsSet = {};
		if (boundRecs?.length) { gridWidget.expandRow(0) }
	}
	gridSortIstendi(e) {
		const {tabloYapi, gridPart} = this, {base} = gridPart.gridWidget, {sortcolumn: sortBelirtec} = base; let sortTipKod;
		if (sortBelirtec) {
			for (let {colDefs} of Object.values(tabloYapi.grupVeToplam)) {
				let tip = colDefs.find(colDef => colDef.belirtec == sortBelirtec)?.userData?.kod;
				if (tip) { sortTipKod = tip; break }
			}
		}
		if (tabloYapi.toplam[sortTipKod]) { this.tazele({ ...e, defUpdateOnly: true }) }
	}
	tabloKolonlariDuzenle(e) { }
	async getDataAdapter(e) {
		try {
			let recs = await (this.loadServerData_ozel?.(e) ?? this.loadServerData(e)), tRec = recs[0] || {}, key_items = 'detaylar';		/*key_id = 'id',*/
			return new $.jqx.dataAdapter({
				hierarchy: { root: key_items }, dataType: 'array', localData: recs, /* hierarchy: { keyDataField: { name: key_id }, parentDataField: { name: 'parentId' } }, */
				dataFields: Object.keys(tRec).map(name => ({ name, type: typeof tRec[name] == 'object' ? 'array' : (typeof tRec[name] || 'string') })),
			}, { autoBind: false, loadComplete: (boundRecs, recs) => setTimeout(() => this.gridVeriYuklendi({ ...e, boundRecs, recs }), 10) })
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Grid Verisi Yüklenemedi'); return null }
	}
	async loadServerData(e) {
		await this.loadServerData_wsArgsDuzenle(e); let recs = [];
		recs = e.recs = await this.loadServerDataInternal(e); window.progressManager?.progressStep(4); if (!recs) { return recs }
		let _recs = await this.loadServerData_recsDuzenleIlk(e); recs = e.recs = _recs == null ? e.recs : _recs; window.progressManager?.progressStep(1);
		_recs = await this.loadServerData_recsDuzenle(e); recs = e.recs = _recs == null ? e.recs : _recs; window.progressManager?.progressStep(2);
		_recs = await this.loadServerData_recsDuzenleEk(e); recs = e.recs = _recs == null ? e.recs : _recs; window.progressManager?.progressStep(1);
		_recs = await this.loadServerData_recsDuzenle_seviyelendir(e); recs = e.recs = _recs == null ? e.recs : _recs; window.progressManager?.progressStep(3);
		_recs = await this.loadServerData_recsDuzenleSon(e); recs = e.recs = _recs == null ? e.recs : _recs; window.progressManager?.progressStep(1);
		return recs
	}
	loadServerDataInternal(e) { return null }
	loadServerData_wsArgsDuzenle(e) { super.loadServerData_wsArgsDuzenle(e); let _value = qs.maxRow ?? qs.maxrow; if (_value != null) { e.maxRow = asInteger(_value) } }
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
	loadServerData_recsDuzenle(e) { this.loadServerData_recsDuzenle_ozel?.(e) }
	loadServerData_recsDuzenleEk(e) { this.loadServerData_recsDuzenleEk_ozel?.(e) }
	loadServerData_recsDuzenleSon(e) { this.loadServerData_recsDuzenleSon_ozel?.(e) }
	loadServerData_recsDuzenle_seviyelendir(e) {this.loadServerData_recsDuzenle_seviyelendir_ozel?.(e) }
	exportExcelIstendi(e) { return this.exportXIstendi({ ...e, type: 'xls', mimeType: 'application/vnd.ms-excel' }) }
	exportPDFIstendi(e) { return this.exportXIstendi({ ...e, type: 'pdf', mimeType: 'application/pdf' }) }
	exportHTMLIstendi(e) { return this.exportXIstendi({ ...e, type: 'html', mimeType: 'text/html' }) }
	exportXIstendi(e) {
		const {type, mimeType} = e, {gridPart} = this, {grid} = gridPart; showProgress();
		try {
			let data = grid.jqxTreeGrid('exportData', type); if (!data) { return this }
			let url = URL.createObjectURL(new Blob([data], { encoding: wsCharSet, type: `${mimeType}; charset=${wsCharSet}` }));
			if (this.exportXIstendi_ozel?.({ ...e, url, data }) == true) { return this }
			if (type == 'html') { openNewWindow(url) } else { let a = document.createElement('a'); a.href = url; a.download = `SkyRapor.${type}`; a.click() }
		}
		finally { setTimeout(() => hideProgress(), 100) }
		return this
	}
	getColumns(colDefs) {
		if (!colDefs) { return colDefs } colDefs = colDefs.filter(colDef => !!colDef);
		const {gridPart} = this, result = []; for (let i = 0; i < colDefs.length; i++) {
			const colDef = colDefs[i]?.deepCopy(); if (!colDef) { continue } colDef.gridPart = gridPart; const {tip} = colDef;
			for (const _colDef of colDefs) { if (!_colDef.minWidth) { _colDef.minWidth = 100 } }
			const savedHandlers = {}; for (const key of ['cellsRenderer', 'cellValueChanging']) { savedHandlers[key] = colDef[key]; delete colDef[key] }
			colDef.aggregatesRenderer = (colDef, aggregates, jqCol, elm) => {
				let result = []; for (let [tip, value] of Object.entries(aggregates)) {
					if (value != null) { value = asFloat(value) } const dipBelirtec = tip == 'sum' ? 'T' : tip == 'avg' ? 'O' : tip;
					result.push(`<div class="toplam-item"><span class="lightgray">${dipBelirtec}</span> <span>${roundToFra(value, 2).toLocaleString()}</span></div>`)
				}
				return result.join('')
			};
			if (tip instanceof GridKolonTip_Number) {
				const {fra} = tip; colDef.cellsRenderer = (colDef, rowIndex, belirtec, value, rec) =>
					this.cellsRenderer({ colDef, rowIndex, belirtec, value, rec, html: `<span class="right">${toStringWithFra(value, fra)}</span>` })
				/*if (!colDef.aggregates &&  tip instanceof GridKolonTip_Decimal) { colDef.aggregates = [(total, value) => asFloat(total) + asFloat(value)] }*/
			}
			else if (tip instanceof GridKolonTip_Date) {
				colDef.cellsRenderer = (colDef, rowIndex, belirtec, value, rec) =>
					this.cellsRenderer({ colDef, rowIndex, belirtec, value, rec, html: `<span>${dateToString(asDate(value))}</span>` }) }
			else {
				colDef.cellsRenderer = (colDef, rowIndex, belirtec, value, rec) =>
					this.cellsRenderer({ colDef, rowIndex, belirtec, value, rec, html: `<span>${value}</span>` }) }
			delete colDef.tip; result.push(colDef)
		}
		return result
	}
}
class DAltRapor_TreeGridGruplu extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridliAltRapormu() { return true } get noAutoColumns() { return true }
	static get raporClass() { return null } static get kod() { return 'main' } static get aciklama() { return this.raporClass.aciklama }
	get width() { return '70%' } get height() { return 'var(--full)' }
	get tabloYapi() {
		let result = this._tabloYapi;
		if (result == null) {
			let _e = { result: new TabloYapi() }; this.tabloYapiDuzenle(_e); this.tabloYapiDuzenle_son(_e);
			this.tabloYapiDuzenle_ozel?.(_e); result = _e.result;
			const tipSet = result.tipSet = {}, kaListe = result.kaListe = [];
			for (const selector of ['grup', 'toplam']) {
				const tip2Item = result[selector];
				for (const [kod, item] of Object.entries(tip2Item)) {
					tipSet[kod] = true; kaListe.push(item.ka); const {colDefs} = item;
					if (colDefs) { for (const colDef of colDefs) { const userData = colDef.userData = colDef.userData || {}; userData.tip = selector; userData.kod = kod }  }
				}
			}
			this._tabloYapi = result
		}
		return result
	}
	secimlerDuzenle(e) { super.secimlerDuzenle(e) } secimlerInitEvents(e) { super.secimlerInitEvents(e) }
	tabloYapiDuzenle(e) { } tabloYapiDuzenle_son(e) { }
	onGridInit(e) {
		super.onGridInit(e); this.ozetBilgi = { colDefs: null, recs: null };
		const rapor = this; this.raporTanim = DMQRapor.getDefault({ ...e, rapor })
	}
	onGridRun(e) { super.onGridRun(e); this.tazeleOncesi(e) }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e); const {liste} = e, {tabloYapi} = this, {grup, toplam} = tabloYapi;
		for (const item of [grup, toplam]) { for (const {colDefs} of Object.values(item)) { if (colDefs?.length) { liste.push(...colDefs) } } }
	}
	gridArgsDuzenle(e) {
		super.gridArgsDuzenle(e) ; const {args} = e; $.extend(args, {
			showSubAggregates: false, /*showStatusBar: true, showGroupAggregates: true , compact: true*/
			exportSettings: {
				columnsHeader: true, hiddenColumns: false, collapsedRecords: true, recordsInView: true, fileName: null,
				characterSet: 'utf-8', serverURL: app.getWSUrl({ api: 'echo', args: { stream: true, type: 'application/octet-stream' } })
			}
		})
	}
	ekCSSDuzenle(e) { this.ekCSSDuzenle_ozel?.(e) }
	cellsRenderer(e) { return this.cellsRenderer_ozel?.(e) ?? e.html }
	async loadServerData(e) {
		let recs = e.recs = this.raporTanim.secilenVarmi ? await super.loadServerData(e) : [];
		await this.ozetBilgiRecsOlustur(e); return recs
	}
	loadServerData_recsDuzenleIlk(e) {
		let {recs} = e; const {tabloYapi} = this, {kaPrefixes, sortAttr, grupVeToplam} = tabloYapi, fixKA = (rec, prefix) => {
			if (rec == null) { return } const item = grupVeToplam[prefix] ?? grupVeToplam[prefix.toUpperCase()], {kodsuzmu} = item || {};
			const kod = kodsuzmu ? null : rec[prefix + 'kod'], adi = rec[prefix + 'adi'];
			if (!kod || adi == null) { rec[prefix] = adi || kod; for (const postfix of ['kod', 'adi']) { delete rec[prefix + postfix] } }
			else { this.fixKA(rec, prefix, kodsuzmu) }
		};
		let id = 1; for (const rec of recs) { for (const prefix of kaPrefixes) { fixKA(rec, prefix) } rec.id = id++ }
		if (sortAttr) { recs.sort((a, b) => { a = a[sortAttr] || 0; b = b[sortAttr] || 0; return a > b ? -1 : a < b ? 1 : 0 }) }
		e.recs = recs; return super.loadServerData_recsDuzenleIlk(e)
	}
	loadServerData_recsDuzenle_seviyelendir(e) {
		super.loadServerData_recsDuzenle_seviyelendir(e); const {gridPart, tabloYapi, raporTanim} = this, {gridWidget} = gridPart;
		let {grup, icerik} = raporTanim, {kullanim} = raporTanim, {yatayAnaliz} = kullanim;
		let attrSet = raporTanim._ozelAttrSet ?? raporTanim.attrSet, belirtec2ColDef = [], grupColAttrListe = [], _sumAttrListe = [], _avgAttrListe = [];
		for (const kod in grup) {
			const item = tabloYapi.grup[kod]; if (!item) { continue } const {colDefs} = item; if (!colDefs) { continue }
			for (const colDef of colDefs) { const {belirtec} = colDef; belirtec2ColDef[belirtec] = colDef; grupColAttrListe.push(belirtec) }
		}
		for (const kod in attrSet) {
			if (grup[kod]) { continue } let toplammi = false, item = tabloYapi.grup[kod]; if (!item && (item = tabloYapi.toplam[kod])) { toplammi = true }
			if (!item) { continue } const {colDefs} = item; if (!colDefs) { continue }
			for (const colDef of colDefs) {
				const {belirtec} = colDef; belirtec2ColDef[belirtec] = colDef; if (toplammi) { _sumAttrListe.push(belirtec) }
				/*if (toplammi) { (colDef?.aggregates?.includes('avg') ? _avgAttrListe : _sumAttrListe).push(belirtec) } */
			}
		}
		const {records: jqxCols} = gridWidget.base.columns, grupTextColAttr = jqxCols?.[0]?.datafield;
		const formuller = []; for (const key in attrSet) { const item = tabloYapi.grupVeToplam[key]; if (item?.formulmu) { formuller.push(item) } }
		let {recs} = e; if (recs) {
			let _recs = recs; recs = []; for (let _rec of _recs) {
				if (!_rec) { continue } let rec = new DAltRapor_PanelRec({ ..._rec }); recs.push(rec);
				for (const item of formuller) { item.formulEval({ rec }) }
			} e.recs = recs
		}
		if (recs && yatayAnaliz) {
			let yatayBelirtec = tabloYapi.grup[DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod]?.colDefs?.[0]?.belirtec;
			if (yatayBelirtec) {
				let gtTip2AttrListe = { sabit: [], toplam: [] };
				for (let colDef of Object.values(belirtec2ColDef).filter(colDef => colDef.belirtec != yatayBelirtec)) {
					let toplammi = colDef?.userData?.tip == 'toplam', selector = toplammi ? 'toplam' : 'sabit';
					gtTip2AttrListe[selector].push(colDef.belirtec)
				}
				/*let orj_toplamAttrSet = asSet(gtTip2AttrListe.toplam);
				let toplamAttrListe = jqxCols.map(({ datafield }) => datafield).filter(belirtec => orj_toplamAttrSet[belirtec.split('_')[0]]);*/
				const item = grupVeToplam[prefix] ?? grupVeToplam[prefix.toUpperCase()], {kodsuzmu} = item || {};
				for (let rec of recs) { this.fixKA(rec, yatayBelirtec, kodsuzmu) }
				let toplamAttrListe = gtTip2AttrListe.toplam, sevRecs = seviyelendirAttrGruplari({
					source: recs, attrGruplari: [gtTip2AttrListe.sabit],
					getter: ({ item }) => new DAltRapor_PanelRec_Donemsel({ yatayBelirtec, toplamAttrListe, ...item })
				});
				let tumYatayAttrSet = e.tumYatayAttrSet ?? {}, _e = { ...e, tumYatayAttrSet }; for (let sev of sevRecs) { sev.donemselDuzenle(_e) }
				for (let sev of sevRecs) { sev.donemselAttrFix(_e) }
				if (!$.isEmptyObject(tumYatayAttrSet)) {
					_sumAttrListe.push(...Object.keys(tumYatayAttrSet)/*.filter(x => !x.endsWith('_TOPLAM'))*/);
					_sumAttrListe = Object.keys(asSet(_sumAttrListe))
				}
				recs = sevRecs
			}
		}
		let sevListe; if (grupColAttrListe?.length) {
			let id = 1; sevListe = seviyelendir({
				source: recs, attrListe: grupColAttrListe, getter: e => {
					const {item, sevAttr} = e, _rec = new DAltRapor_PanelGruplama({ id, _sumAttrListe, _avgAttrListe, ...item });
					id++; _rec[grupTextColAttr] = _rec[sevAttr]; return _rec
				}
			}); for (const sev of sevListe) { sev.toplamYapiOlustur?.(); for (const item of formuller) { item.formulEval({ rec: sev }) } }
		}
		/*const avgBelirtec2ColDef = {}; for (const key in attrSet) {
			if (!tabloYapi.toplam[key]) { continue }
			let avgColDefs = tabloYapi.toplam[key]?.colDefs?.filter(colDef => colDef?.aggregates?.includes('avg')); if (!avgColDefs?.length) { continue }
			for (const colDef of avgColDefs) { avgBelirtec2ColDef[colDef.belirtec] = colDef }
		}
		if (!$.isEmptyObject(avgBelirtec2ColDef)) {
			for (const rec of recs) {
				let {kayitsayisi: count} = rec; if (!count) { continue }
				for (const key in avgBelirtec2ColDef) {
					let value = rec[key]; if (!(value && typeof value == 'number')) { continue }
					let fra = avgBelirtec2ColDef[key]?.tip?.fra ?? 0;
					rec[key] = value = roundToFra(value / count, fra)
				}
			}
		}*/
		if (config.dev) { console.info({ sevListe, recs }) }
		return sevListe ?? recs
	}
	ozetBilgiRecsOlustur(e) {
		const {raporTanim, ozetBilgi} = this, {grupAttr, icerikAttr, icerikColDef} = ozetBilgi; if (!grupAttr) { return }
		const {secilenVarmi, ozetMax} = raporTanim; if (!(secilenVarmi && ozetMax)) { ozetBilgi.recs = []; return }
		const {gridWidget} = this.gridPart, sevRecs = e.recs ?? gridWidget.getRows(), deger2Bilgiler = {}; for (const sev of sevRecs) {
			const value = sev[icerikAttr]; if (value) { (deger2Bilgiler[value] = deger2Bilgiler[value] || []).push(sev) } }
		const tersSiraliDegerler = Object.keys(deger2Bilgiler).map(x => asFloat(x)).sort((a, b) => a < b ? 1 : -1);
		const sortDir = gridWidget.base.sortdirection; if (sortDir?.ascending) { tersSiraliDegerler.reverse() }
		const digerRec = {}; digerRec[grupAttr] = `<b class="royalblue">Diğer</b>`; digerRec[icerikAttr] = 0
		let result = [], digerSayi = 0; for (const deger of tersSiraliDegerler) {
			const subRecs = deger2Bilgiler[deger]; for (const subRec of subRecs) {
				if (result.length < ozetMax) { const _rec = {}; _rec[grupAttr] = subRec[grupAttr]; _rec[icerikAttr] = deger; result.push(_rec); continue }
				digerRec[icerikAttr] = (digerRec[icerikAttr] || 0) + deger; digerSayi++
			}
		}
		if (digerRec[icerikAttr]) {
			let {aggregates} = icerikColDef ?? {}; if (aggregates?.includes('avg')) {
				digerRec[icerikAttr] = digerSayi ? roundToFra((digerRec[icerikAttr] || 0) / digerSayi, icerikColDef.tip?.fra ?? 0) : 0 }
			result.push(digerRec)
		}
		ozetBilgi.recs = result
		window.progressManager?.progressStep(2);
	}
	tazeleOncesi(e) {
		const {fbd_grid, tabloYapi, raporTanim} = this, {rootBuilder} = this.parentBuilder, {secilenVarmi} = raporTanim;
		rootBuilder.layout.find('.islemTuslari > div button#tabloTanimlari')[secilenVarmi ? 'removeClass' : 'addClass']('anim-tabloTanimlari-highlight');
		if (!secilenVarmi) { if (!this._tabloTanimGosterildiFlag) { this.raporTanimIstendi(e) } return }
	}
	async tazele(e) {
		e = e ?? {}; try {
			showProgress('Rapor oluşturuluyor...', null, true); await new $.Deferred(p => setTimeout(() => p.resolve(), 50)); window.progressManager?.setProgressMax(20);
			await this.tazeleOncesi(e); window.progressManager?.progressStep(1);
			let {gridPart, raporTanim} = this, {degistimi, kullanim} = raporTanim, {yatayAnaliz} = kullanim;
			let {grid, gridWidget} = gridPart, {base} = gridWidget, {defUpdateOnly} = e;
			const {tabloKolonlari, tabloYapi, ozetBilgi} = this, {secilenVarmi, attrSet, grup, icerik} = raporTanim;
			const tip2ColDefs = {}, belirtec2Tip = {}; for (const colDef of tabloKolonlari) {
				const {belirtec, userData} = colDef, {kod: tip} = userData || {};
				if (tip) { (tip2ColDefs[tip] = tip2ColDefs[tip] || []).push(colDef); belirtec2Tip[belirtec] = tip }
			}
			let _colDefs = Object.keys(icerik).flatMap(kod => tip2ColDefs[kod]), colDefs = [
				..._colDefs.filter(colDef => !colDef?.userData?.kod), ..._colDefs.filter(colDef => colDef?.userData?.kod)
			].filter(x => !!x);
			let gtTip2ColDefs = { sabit: [], toplam: [] }; for (const colDef of colDefs) {
				let {kod} = colDef.userData ?? {}, toplammi = tabloYapi.toplam[kod], selector = toplammi ? 'toplam' : 'sabit';
				gtTip2ColDefs[selector].push(colDef); if (toplammi && !colDef?.aggregates) { colDef.aggregates = ['sum'] }
			}
			if (yatayAnaliz) {
				window.progressManager?.setProgressMax((window.progressManager?.progressMax || 0) + 5);
				let {belirtec} = DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz] ?? {}, tumYatayAttrSet = e.tumYatayAttrSet = {};
				let recs = await this.loadServerDataInternal({ attrSet: asSet([DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz]?.kod]) });
				window.progressManager?.progressStep(4); let liste = [];
				for (let rec of recs) {
					let value = rec[belirtec]?.trimEnd?.(); if (value === undefined) {
						let kod = rec[`${belirtec}kod`]?.trimEnd?.(), aciklama = rec[`${belirtec}adi`]?.trimEnd?.();
						if (!(kod == null && aciklama == null)) { this.fixKA(rec, belirtec); value = rec[belirtec] }
					}
					if (value) { liste.push(value) }
				} 
				liste.sort(); liste.unshift('TOPLAM'); colDefs = [...gtTip2ColDefs.sabit];
				for (let _colDef of gtTip2ColDefs.toplam) {
					for (let yatayText of liste) {
						let colDef = _colDef.deepCopy(); colDefs.push(colDef); colDef.belirtec += `_${yatayText}`;
						let colText = yatayText, tokens = colText.split(') '); if (tokens.length > 1) { colText = tokens[1] || colText }
						colDef.text += `<br/>[ <span class=forestgreen>${colText}</span> ]`; tumYatayAttrSet[colDef.belirtec] = true
					}
				}
			}
			_colDefs = colDefs; colDefs = []; let belirtecSet = {}; for (let colDef of _colDefs) {
				let {belirtec} = colDef; if (belirtecSet[belirtec]) { continue }
				belirtecSet[belirtec] = true; colDefs.push(colDef)
			}
			let ilkColDef = colDefs[0]; if (tabloYapi.grup[ilkColDef?.userData?.kod]) {
				let colDef = ilkColDef.deepCopy(); colDefs[0] = colDef; colDef.minWidth = Math.max(colDef.minWidth ?? 0, 300);
				colDef.text = [...(Object.keys(grup).map(kod => `<span class="royalblue">${tabloYapi.grup[kod]?.colDefs[0]?.text || ''}</span>`) || []), colDef.text].join(' + ')
			}
			if (!defUpdateOnly) { grid.jqxTreeGrid('clear') } colDefs = this.getColumns(colDefs);
			let {sortcolumn: sortBelirtec, sortdirection: sortDir} = base, sortTipKod = belirtec2Tip[sortBelirtec]; ozetBilgi.grupTipKod = ozetBilgi.icerikTipKod = null;
			if (sortTipKod) {
				if (tabloYapi.toplam[sortTipKod]) { ozetBilgi.icerikTipKod = sortTipKod }
				/*const selector = `${tabloYapi.toplam[sortTipKod] ? 'icerik' : 'grup'}TipKod`; ozetBilgi[selector] = sortTipKod*/
				/*if (tabloYapi.grup[sortTipKod]) { sortTipKod = Object.keys(icerik)[0] }
				let sortColDefs = tip2ColDefs[sortTipKod]; if (sortColDefs?.length) {
					const sortBelirtecSet = asSet(sortColDefs.map(colDef => colDef.belirtec));
					let savedColDefs = colDefs; colDefs = [savedColDefs[0], ...sortColDefs, ...savedColDefs.slice(1).filter(colDef => !sortBelirtecSet[colDef.belirtec])]
				}*/
			}
			for (const tip in attrSet) {
				if (ozetBilgi.grupTipKod && ozetBilgi.icerikTipKod) { break }
				if (!ozetBilgi.grupTipKod && !tabloYapi.toplam[tip]) { ozetBilgi.grupTipKod = tip }
				else if (!ozetBilgi.icerikTipKod && tabloYapi.toplam[tip]) { ozetBilgi.icerikTipKod = tip }
			}
			for (const prefix of ['grup', 'icerik']) {
				let colDef = ozetBilgi[`${prefix}ColDef`] = tip2ColDefs[ozetBilgi[`${prefix}TipKod`]]?.[0]; $.extend(colDef, { sortDir })
				ozetBilgi[`${prefix}Attr`] = colDef?.belirtec; ozetBilgi[`${prefix}Text`] = colDef?.text;
			}
			window.progressManager?.progressStep(1);
			try { grid.jqxTreeGrid('columns', colDefs.flatMap(colDef => colDef.jqxColumns)) } catch (ex) { console.error(ex) } window.progressManager?.progressStep(1);
			/* gridWidget.base.sortcolumn */
			const ozetBilgi_getColumns = (source, kod, colDefDuzenle) =>
				this.getColumns((source[kod]?.colDefs || [])).map(_colDef => { const colDef = _colDef/*.deepCopy()*/; if (colDefDuzenle) { getFuncValue.call(this, colDefDuzenle, colDef) } return colDef });
			ozetBilgi.colDefs = ozetBilgi.grupTipKod ? [
				...ozetBilgi_getColumns(tabloYapi.grup, ozetBilgi.grupTipKod, colDef => $.extend(colDef, { minWidth: 140, maxWidth: null, genislikCh: null })),
				...ozetBilgi_getColumns(tabloYapi.toplam, ozetBilgi.icerikTipKod, colDef => $.extend(colDef, { minWidth: null, maxWidth: null, genislikCh: 16, aggregates: ozetBilgi.icerikColDef?.aggregates || ['sum'] }))
			] : [];
			raporTanim.degistimi = false; await gridPart._promise_kaFix;
			if (defUpdateOnly) { delete e.recs; await this.gridVeriYuklendi(e); await this.ozetBilgiRecsOlustur(e) } else { await super.tazele(e) }
			window.progressManager?.progressStep(2); await this.tazeleDiger(e); window.progressManager?.progressStep(1);
			setTimeout(() => window.progressManager?.progressEnd(), 5)
		}
		catch (ex) { hideProgress(); hConfirm(getErrorText(ex), this.class.aciklama); throw ex }
		finally { setTimeout(() => hideProgress(), 300) }
	}
	raporTanimIstendi(e) {
		const {raporTanim} = this, inst = raporTanim, title = `${raporTanim.class.sinifAdi} Tanım`, ustHeight = '50px', ustEkHeight = '33px', islemTuslariHeight = '55px';
		let wnd, wRFB = new RootFormBuilder({ id: 'raporTanim' }).setInst(inst).addCSS('part')
			.addStyle(e => `$elementCSS { --islemTuslariHeight: ${islemTuslariHeight}; --ustHeight: ${ustHeight}; --ustEkHeight : ${ustEkHeight} }`);
		let fbd_ust = wRFB.addFormWithParent('ust').yanYana().addStyle_fullWH(null, 'var(--ustHeight)');
		let fbd_sablonParent = fbd_ust.addFormWithParent('sablon-parent').yanYana().addStyle_fullWH().addStyle([e =>
			`$elementCSS { position: relative; top: 5px } $elementCSS > .button { width: 50px !important; height: 45px !important; min-width: unset !important }`]);
		fbd_sablonParent.addModelKullan('sablonKod', 'Şablon').etiketGosterim_yok().dropDown().kodsuz().bosKodAlinir()
			.setMFSinif(DMQRapor).setValue(inst.sayac).addStyle_fullWH('calc(var(--full) - 350px)')
			.initArgsDuzenleHandler(e => { const {args} = e; args.args = { rapor: this } })
			.ozelQueryDuzenleHandler(e => {
				const {stm, aliasVeNokta} = e, {raporKod} = raporTanim, {encUser} = config.session, {kodSaha} = raporTanim.class;
				for (const sent of stm.getSentListe()) {
					if (encUser) { sent.where.degerAta(encUser, `${aliasVeNokta}xuserkod`) }
					sent.where.degerAta(raporKod, `${aliasVeNokta}raportip`)
				}
			}).degisince(e => {
				const sayac = e.value, {raporTanim} = this;
				if (sayac) { raporTanim.sayac = sayac; raporTanim.yukle().then(() => { this.restartWndRaporTanim(e) }) }
			});
			/* .loadServerDataHandler(e => { const {mfSinif} = e; e.args = { rapor: this }; return mfSinif.loadServerData(e) }) */
		fbd_sablonParent.addButton('sablonKaydet').addCSS('button')
			.addStyle(e => `$elementCSS > button { background-image: url('../../images/kaydet.png') !important; background-size: 32px !important }`)
			.onClick(_e => this.raporTanim_sablonKaydetIstendi({ ...e, ..._e, wnd, inst }));
		fbd_sablonParent.addButton('sablonSil').addCSS('button')
			.addStyle(e =>
				`$elementCSS > button { background-image: url('../../images/sil.png') !important; background-size: 16px !important }
				$elementCSS > button.jqx-fill-state-normal, $elementCSS > button.jqx-fill-state-hover { background-color: #a05d45 !important } `)
			.onClick(_e => this.raporTanim_sablonSilIstendi({ ...e, ..._e, wnd, inst }));
		fbd_sablonParent.addButton('temizle').addCSS('button')
			.addStyle(e =>
				`$elementCSS > button { background-image: url('../../images/temizle.png') !important; background-size: 16px !important }
				$elementCSS > button.jqx-fill-state-normal, $elementCSS > button.jqx-fill-state-hover { background-color: #8a7159 !important } `)
			.onClick(_e => this.raporTanim_temizleIstendi({ ...e, ..._e, wnd, inst }));
		let fbd_islemTuslari = fbd_ust.addFormWithParent('islemTuslari').yanYana().addStyle_wh('auto', islemTuslariHeight).addStyle(`$elementCSS { position: absolute; top: 0; right: 0; z-index: 1000 }`);
		fbd_islemTuslari.addButton('tamam').onClick(async _e => {
			try {
				const close = () => { if (wnd?.length) { wnd.jqxWindow('close') } }, {tabloYapi} = this, inst = _e.builder.rootBuilder.id2Builder.content.altInst;
				let result = await this.raporTanim_tamamIstendi({ ...e, ..._e, wnd, close, tabloYapi, inst }); if (result !== false) { close() }
			}
			catch (ex) { console.error(ex); wnd.addClass('jqx-hidden'); let {wnd: _wnd} = displayMessage(getErrorText(ex), title); _wnd.on('close', evt => wnd.removeClass('jqx-hidden')) }
		});
		fbd_islemTuslari.addButton('vazgec').onClick(e => wnd.jqxWindow('close'));
		const _e = { ...e, rootBuilder: wRFB, tanimFormBuilder: wRFB, inst }; raporTanim.class.rootFormBuilderDuzenle(_e);
		wRFB.id2Builder.content.addStyle_fullWH(null, `calc(var(--full) - (var(--islemTuslariHeight) + var(--ustHeight) + var(--ustEkHeight)))`);
		this.wnd_raporTanim = wnd = createJQXWindow({ title, args: { isModal: false, closeButtonAction: 'close', width: Math.max(800, Math.min(630, $(window).width() - 100)), height: Math.min(1000, $(window).height() - 50) } });
		wnd.on('close', evt => { wnd.jqxWindow('destroy'); $('body').removeClass('bg-modal'); delete this.wnd_raporTanim });
		wnd.prop('id', wRFB.id); wnd.addClass('dRapor part'); setTimeout(() => $('body').addClass('bg-modal'), 10);
		let parent = wnd.find('div > .subContent'); wRFB.setParent(parent); wRFB.run();
		wnd.on('resize', evt => {
			clearTimeout(this._timer_wndResize); this._timer_wndResize = setTimeout(() => {
				try {
					const wnd = this.wnd_raporTanim; if (!wnd?.length) { return }
					let elms = wnd.find('div > .content .jqx-listbox'); if (elms?.length) { elms.jqxListBox('refresh') }
				}
				finally { delete this._timer_wndResize }
			}, 50)
		})
		this._tabloTanimGosterildiFlag = true; return wRFB
	}
	raporTanim_tamamIstendi(e) {
		const {inst} = e; inst.dataDuzgunmuDevam(e); inst.degistimi = true;
		inst.setDefault(e); this.tazele(e); return true
	}
	async raporTanim_sablonKaydetIstendi(e) {
		const title = 'Rapor Tanım', {wnd_raporTanim} = this; let {raporTanim} = this, {aciklama} = raporTanim; let inEventFlag = false;
		try {
			if (!aciklama) { wnd_raporTanim.jqxWindow('collapse'); await hConfirm(`<b class="firebrick">Rapor Adı</b> belirtilmelidir`, title); wnd_raporTanim.jqxWindow('expand'); return }
			const sayac = null, {encUser} = config.session; raporTanim = raporTanim.deepCopy(); $.extend(raporTanim, { sayac, encUser });
			let degistirmi = await raporTanim.varmi(), islem = degistirmi ? 'degistir' : 'kopya';
			const _e = { islem }; await raporTanim.dataDuzgunmu(_e);
			if (degistirmi) {
				wnd_raporTanim.jqxWindow('collapse'); let rdlg = await ehConfirm(`<b class="royalblue">${aciklama}</b> isimli rapor güncellensin mi?`, title); wnd_raporTanim.jqxWindow('expand');
				if (!rdlg) { return } await raporTanim.degistir(_e); this.raporTanim = raporTanim
			}
			else { await raporTanim.yaz(_e); this.raporTanim = raporTanim }
			this.restartWndRaporTanim(e)
			
		} catch (ex) { wnd_raporTanim.jqxWindow('collapse'); await hConfirm(getErrorText(ex), title); wnd_raporTanim.jqxWindow('expand'); throw ex }
		/*if (wnd_raporTanim?.length) { wnd_raporTanim.jqxWindow('collapse') } try {
			if (degistimi)
			raporTanim.tanimla({
				islem, kapaninca: _e => {
					if (inEventFlag) { return } inEventFlag = true; if (wnd_raporTanim?.length) { wnd_raporTanim.jqxWindow('expand') }
					this.restartWndRaporTanim(e); setTimeout(() => inEventFlag = false, 100)
				}
			})
		}
		finally { $('body').removeClass('bg-modal') }*/
	}
	raporTanim_sablonSilIstendi(e) {
		const {raporTanim, wnd_raporTanim} = this, {sayac, aciklama} = raporTanim; if (!sayac) { return }
		if (wnd_raporTanim?.length) { wnd_raporTanim.jqxWindow('collapse') }
		ehConfirm(`<b class="firebrick">${aciklama || 'Seçilen'}</b> Rapor Tanımı silinsin mi?`, 'Rapor Tanım').then(rdlg => {
			if (wnd_raporTanim?.length) { wnd_raporTanim.jqxWindow('expand') }
			if (rdlg) { raporTanim.sil().then(() => this.restartWndRaporTanim(e)) }
		})
	}
	raporTanim_temizleIstendi(e) {
		const {raporTanim, wnd_raporTanim} = this; if (wnd_raporTanim?.length) { wnd_raporTanim.jqxWindow('collapse') }
		ehConfirm(`<p class="bold firebrick">Mevcut Rapor içeriği temizlenecek</p><p>Devam edilsin mi silinsin mi?</p>`, 'Rapor Tanım').then(rdlg => {
			if (wnd_raporTanim?.length) { wnd_raporTanim.jqxWindow('expand') }
			if (rdlg) { raporTanim.reset(); this.restartWndRaporTanim(e) }
		})
	}
	seviyeAcIstendi(e) { const {gridPart} = this, {gridWidget} = gridPart; gridWidget.expandAll() }
	seviyeKapatIstendi(e) { const {gridPart} = this, {gridWidget} = gridPart; gridWidget.collapseAll(); gridPart.expandedRowsSet = {} }
	restartWndRaporTanim(e) {
		const {wnd_raporTanim} = this; if (wnd_raporTanim?.length) { wnd_raporTanim.jqxWindow('close') }
		return this.raporTanimIstendi(e); return this.wnd_raporTanim
	}
	getColumns(colDefs) {
		colDefs = super.getColumns(colDefs); if (!colDefs) { return colDefs }
		const {gridPart, tabloYapi} = this; let icerikColsSet; for (const colDef of colDefs) {
			const kod = colDef.userData?.kod; if (tabloYapi.toplam[kod]) { if (!colDef.align) { colDef.alignRight() } /*if (!colDef.cellsFormat) { colDef.cellsFormat = 'd' }*/ }
			colDef.cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
				if (icerikColsSet == null) { const {raporTanim} = this; icerikColsSet = raporTanim.icerik }
				const kod = colDef.userData?.kod; let result = ['treeRow', belirtec]; if (rec) { result.push(rec.leaf ? 'leaf' : 'grup') }
				if (icerikColsSet && icerikColsSet[belirtec]) { result.push('icerik') }
				if (tabloYapi.toplam[kod]) { result.push('toplam'); if (typeof value == 'number') { result.push(!value ? 'zero' : value < 0 ? 'negative' : 'positive') } }
				let {level} = rec; if (level != null) { result.push('level-' + level.toString()) }
				const _e = { kod, raporTanim, icerikColsSet, colDefs, colDef, rowIndex, belirtec, value, rec, result }; this.ekCSSDuzenle(_e); result = _e.result;
				return result.filter(x => !!x).join(' ')
			}
		}
		return colDefs
	}
}
