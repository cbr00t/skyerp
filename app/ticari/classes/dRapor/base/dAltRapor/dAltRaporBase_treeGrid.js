class DAltRapor_TreeGrid extends DAltRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridmi() { return true } static get dTreeGridmi() { return true }
	/*subFormBuilderDuzenle(e) { super.subFormBuilderDuzenle(e); const {rfb} = e; rfb.addCSS('no-overflow') }*/
	onBuildEk(e) {
		super.onBuildEk(e); const {parentBuilder, noAutoColumns} = this, {layout} = parentBuilder;
		this.fbd_grid = parentBuilder.addForm('grid').setLayout(e => $(`<div class="grid part full-wh"/>`))
			.onAfterRun(async e => {
				const fbd_grid = e.builder, gridPart = this.gridPart = fbd_grid.part = {}, grid = gridPart.grid = fbd_grid.layout;
				$.extend(gridPart, { tazele: e => this.tazele(e), hizliBulIslemi: e => this.hizliBulIslemi(e) });
				this.onGridInit(e); let _e = { ...e, liste: [] }; this.tabloKolonlariDuzenle(_e); const colDefs = this.tabloKolonlari = _e.liste || [];				
				const columns = noAutoColumns ? [] : colDefs.flatMap(colDef => colDef.jqxColumns), source = await this.getDataAdapter(e);
				const localization = localizationObj, width = '99.7%', height = 'calc(var(--full) - 40px)', autoRowHeight = true, autoShowLoadElement = true, altRows = true;
				const filterMode = 'advanced';	/* default | simple | advanced */
				const showAggregates = false, showSubAggregates = false, aggregatesHeight = 50, columnsResize = true, columnsReorder = true, sortable = true, filterable = false;
				let args = { theme, localization, width, height, autoRowHeight, autoShowLoadElement, altRows, filterMode, showAggregates, showSubAggregates, aggregatesHeight, columnsResize, columnsReorder, sortable, filterable, columns, source };
				_e = { ...e, args }; this.gridArgsDuzenle(_e); args = _e.args; grid.jqxTreeGrid(args); gridPart.gridWidget = grid.jqxTreeGrid('getInstance');
				grid.on('rowExpand', event => this.gridRowExpanded({ ...e, event }));
				grid.on('rowCollapse', event => this.gridRowCollapsed({ ...e, event }));
				grid.on('rowClick', event => this.gridSatirTiklandi({ ...e, event }));
				grid.on('rowDoubleClick', event => this.gridSatirCiftTiklandi({ ...e, event }));
				this.onGridRun(e)
			})
	}
	tabloKolonlariDuzenle(e) { }
	gridArgsDuzenle(e) { }
	onGridInit(e) { /*const {gridPart} = this*/ }
	onGridRun(e) { }
	gridRowExpanded(e) { const {gridPart} = this, {level, uid} = e.event.args.row || {}; gridPart.expandedRowsSet[`${level}-${uid}`] = true }
	gridRowCollapsed(e) { const {gridPart} = this, {level, uid} = e.event.args.row || {}; gridPart.expandedRowsSet[`${level}-${uid}`] = false }
	gridSatirTiklandi(e) { }
	gridSatirCiftTiklandi(e) { 
		const {gridPart} = this, {gridWidget, expandedRowsSet} = gridPart, {args} = e.event, {level, uid} = args.row || {};
		if (uid != null) { gridWidget[expandedRowsSet[`${level}-${uid}`] ? 'collapseRow' : 'expandRow'](uid) }
	}
	async tazele(e) {
		e = e || {}; await super.tazele(e); const {grid} = this.gridPart || {}; if (!grid) { return }
		const da = await this.getDataAdapter(e); if (!da) { return } grid.jqxTreeGrid('source', da)
	}
	super_tazele(e) { super.tazele(e) }
	hizliBulIslemi(e) { const {gridPart} = this; gridPart.filtreTokens = e.tokens; this.tazele(e) }
	gridVeriYuklendi(e) {
		const {gridPart} = this, {grid, gridWidget} = gridPart, {boundRecs, recs} = e; gridPart.expandedRowsSet = {};
		if (boundRecs?.length) { gridWidget.expandRow(0) }
	}
	tabloKolonlariDuzenle(e) { }
	async getDataAdapter(e) {
		try {
			const recs = await this.loadServerData(e), tRec = recs[0] || {}, key_items = 'detaylar';		/*key_id = 'id',*/
			return new $.jqx.dataAdapter({
				hierarchy: { root: key_items }, dataType: 'array', localData: recs, /* hierarchy: { keyDataField: { name: key_id }, parentDataField: { name: 'parentId' } }, */
				dataFields: Object.keys(tRec).map(name => ({ name, type: typeof tRec[name] == 'object' ? 'array' : (typeof tRec[name] || 'string') })),
			}, { autoBind: false, loadComplete: (boundRecs, recs) => setTimeout(() => this.gridVeriYuklendi({ ...e, boundRecs, recs }), 10) })
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Grid Verisi Yüklenemedi'); return null }
	}
	async loadServerData(e) {
		await this.loadServerData_wsArgsDuzenle(e);
		let recs = []; showProgress('Rapor oluşturuluyor...', null, true); await new $.Deferred(p => setTimeout(() => p.resolve(), 10));
		try {
			recs = e.recs = await this.loadServerDataInternal(e); if (!recs) { return recs }
			let _recs = await this.loadServerData_recsDuzenleIlk(e); recs = e.recs = _recs == null ? e.recs : _recs;
			_recs = await this.loadServerData_recsDuzenle(e); recs = e.recs = _recs == null ? e.recs : _recs;
			_recs = await this.loadServerData_recsDuzenleSon(e); recs = e.recs = _recs == null ? e.recs : _recs;
			_recs = await this.loadServerData_recsDuzenle_seviyelendir(e); recs = e.recs = _recs == null ? e.recs : _recs;
		} finally { setTimeout(() => hideProgress(), 10) }
		return recs
	}
	loadServerDataInternal(e) { return null }
	loadServerData_wsArgsDuzenle(e) { let _value = qs.maxRow ?? qs.maxrow; if (_value != null) { e.maxRow = asInteger(_value) } }
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
	exportExcelIstendi(e) { return this.exportXIstendi({ ...e, type: 'xls', mimeType: 'application/vnd.ms-excel' }) }
	exportPDFIstendi(e) { return this.exportXIstendi({ ...e, type: 'pdf', mimeType: 'application/pdf' }) }
	exportHTMLIstendi(e) { return this.exportXIstendi({ ...e, type: 'html', mimeType: 'text/html' }) }
	exportXIstendi(e) {
		const {type, mimeType} = e, {gridPart} = this, {grid} = gridPart; showProgress();
		try {
			let data = grid.jqxTreeGrid('exportData', type); if (!data) { return }
			let url = URL.createObjectURL(new Blob([data], { encoding: wsCharSet, type: `${mimeType}; charset=${wsCharSet}` }));
			if (type == 'html') { openNewWindow(url) }
			else { let a = document.createElement('a'); a.href = url; a.download = `SkyRapor.${type}`; a.click() }
		}
		finally { setTimeout(() => hideProgress(), 100) }
	}
	getColumns(colDefs) {
		if (!colDefs) { return colDefs }
		const {gridPart} = this, result = []; for (let i = 0; i < colDefs.length; i++) {
			const colDef = colDefs[i] = colDefs[i].deepCopy(); colDef.gridPart = gridPart; const {tip} = colDef;
			for (const key of ['cellsRenderer', 'cellValueChanging']) { delete colDef[key] }
			colDef.aggregatesRenderer = (colDef, aggregates, jqCol, elm) => {
				let result = []; for (const [tip, value] of Object.entries(aggregates)) {
					if (typeof value != 'number') { continue }
					result.push(`<div class="toplam-item"><span class="lightgray">T</span> <span>${value.toLocaleString()}</span></div>`)
				}
				return result.join('')
			};
			if (tip instanceof GridKolonTip_Number) {
				const {fra} = tip; colDef.cellsRenderer = (colDef, rowIndex, belirtec, value, rec) => toStringWithFra(value, fra);
				if (!colDef.aggregates &&  tip instanceof GridKolonTip_Decimal) { colDef.aggregates = (total, value) => asFloat(total) + asFloat(value) }
			}
			else if (tip instanceof GridKolonTip_Date) { colDef.cellsRenderer = (colDef, rowIndex, belirtec, value, rec) => dateToString(asDate(value)) }
			delete colDef.tip; result.push(colDef)
		}
		return result
	}
}
class DAltRapor_TreeGridGruplu extends DAltRapor_TreeGrid {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGridliAltRapormu() { return true } get noAutoColumns() { return true }
	static get raporClass() { return null } static get kod() { return 'main' } static get aciklama() { return this.raporClass.aciklama }
	get width() { return '75%' } get height() { return 'var(--full)' }
	get tabloYapi() {
		let result = this._tabloYapi;
		if (result == null) {
			let _e = { result: { grup: {}, toplam: {}, kaPrefixes: [], sortAttr: null } }; this.tabloYapiDuzenle(_e); result = _e.result;
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
	tabloYapiDuzenle(e) { }
	onGridInit(e) {
		super.onGridInit(e); this.ozetBilgi = { colDefs: null, recs: null };
		this.secilenler = {
			grup: {}, icerik: {},
			get attrSet() { const result = {}; for (const selector of ['grup', 'icerik']) { $.extend(result, asSet(Object.keys(this[selector]))) } return result },
			get secilenVarmi() { return !!(Object.keys(this.grup).length || Object.keys(this.icerik).length) }
		}
	}
	onGridRun(e) { super.onGridRun(e); this.tazeleOncesi(e) }
	tabloKolonlariDuzenle(e) {
		super.tabloKolonlariDuzenle(e) ; const {liste} = e, {tabloYapi} = this, {grup, toplam} = tabloYapi;
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
	async loadServerData(e) { let recs = this.secilenler.secilenVarmi ? await super.loadServerData(e) : []; e.recs = recs; await this.ozetBilgiRecsOlustur(e); return recs }
	loadServerData_recsDuzenleIlk(e) {
		let {recs} = e; const {kaPrefixes, sortAttr} = this.tabloYapi, fixKA = (rec, prefix) => {
			if (rec == null) { return } const kod = rec[prefix + 'kod'], adi = rec[prefix + 'adi'];
			if (kod !== undefined) {
				let value = kod || ''; if (kod) { value = `(${value}) ` } value += adi || '';
				rec[prefix] = value; delete rec[prefix + 'kod']; delete rec[prefix + 'adi']
			}
		};
		let id = 1; for (const rec of recs) { for (const prefix of kaPrefixes) { fixKA(rec, prefix) } rec.id = id++ }
		if (sortAttr) { recs.sort((a, b) => { a = a[sortAttr] || 0; b = b[sortAttr] || 0; return a > b ? -1 : a < b ? 1 : 0 }) }
		e.recs = recs; return super.loadServerData_recsDuzenleIlk(e)
	}
	loadServerData_recsDuzenle_seviyelendir(e) {
		super.loadServerData_recsDuzenle_seviyelendir(e); const {gridPart, secilenler} = this, {gridWidget} = gridPart, {grup, icerik} = secilenler;
		const belirtec2ColDef = [], grupColAttrListe = [], _sumAttrListe = [];
		for (const colDef of this.tabloKolonlari) {
			const {belirtec} = colDef, userData = colDef.userData || {}, {tip, kod} = userData; belirtec2ColDef[belirtec] = colDef;
			if (tip == 'grup' && grup[kod]) { grupColAttrListe.push(belirtec) }
			else if (tip == 'toplam' && icerik[kod]) { _sumAttrListe.push(belirtec) }
		}
		const jqxCols = gridWidget.base.columns.records, grupTextColAttr = jqxCols[0].datafield;
		let {recs} = e; if (!grupColAttrListe) { return recs }
		let id = 1; const sevListe = seviyelendir({
			source: recs, attrListe: grupColAttrListe,
			getter: e => { const {item} = e, _rec = new DAltRapor_PanelGruplama({ id, _sumAttrListe, ...item }); id++; _rec[grupTextColAttr] = _rec[e.sevAttr]; return _rec }
		}); for (const sev of sevListe) { if (sev.toplamYapiOlustur) { sev.toplamYapiOlustur() } }
		/*topla(sev => sev[attr], sev)*/
		if (config.dev) { console.info(sevListe) } return sevListe
	}
	ozetBilgiRecsOlustur(e) {
		const {secilenler, ozetBilgi} = this, {grupAttr, icerikAttr} = ozetBilgi; if (!grupAttr) { return }
		const {secilenVarmi, ozetMax} = secilenler; if (!(secilenVarmi && ozetMax)) { ozetBilgi.recs = []; return }
		const sevRecs = e.recs, deger2Bilgiler = {}; for (const sev of sevRecs) { const value = sev[icerikAttr]; if (value) { (deger2Bilgiler[value] = deger2Bilgiler[value] || []).push(sev) } }
		const tersSiraliDegerler = Object.keys(deger2Bilgiler).map(x => asFloat(x)).sort((a, b) => a < b ? 1 : -1);
		const digerRec = {}; digerRec[grupAttr] = `<b class="royalblue">Diğer</b>`; digerRec[icerikAttr] = 0;
		const result = []; for (const deger of tersSiraliDegerler) {
			const subRecs = deger2Bilgiler[deger]; for (const subRec of subRecs) {
				if (result.length < ozetMax) { const _rec = {}; _rec[grupAttr] = subRec[grupAttr]; _rec[icerikAttr] = deger; result.push(_rec); continue }
				digerRec[icerikAttr] = (digerRec[icerikAttr] || 0) + deger
			}
		}
		if (digerRec[icerikAttr]) { result.push(digerRec) }
		ozetBilgi.recs = result
	}
	tazeleOncesi(e) {
		const {fbd_grid, tabloYapi, secilenler} = this, {rootBuilder} = this.parentBuilder, {secilenVarmi} = secilenler;
		rootBuilder.layout.find('.islemTuslari > div button#gruplamalar')[secilenVarmi ? 'removeClass' : 'addClass']('anim-gruplamalar-highlight');
		if (!secilenVarmi) { if (!this._tabloTanimGosterildiFlag) { this.tabloTanimlariGosterIstendi(e) } return }
	}
	async tazele(e) {
		await this.tazeleOncesi(e); const {gridPart, secilenler} = this, {degistimi} = secilenler, {grid, gridWidget} = gridPart, jqxCols = gridWidget.base.columns.records;
		if (degistimi || !jqxCols?.length) {
			const {tabloKolonlari, tabloYapi, ozetBilgi} = this, {secilenVarmi, grup, icerik} = secilenler;
			const tip2ColDefs = {}; for (const colDef of tabloKolonlari) { const {belirtec, userData} = colDef, {kod} = userData || {}; if (kod) { (tip2ColDefs[kod] = tip2ColDefs[kod] || []).push(colDef) } }
			let colDefs = Object.keys(icerik).flatMap(kod => tip2ColDefs[kod]); colDefs.sort((a, b) => tabloYapi.toplam[a.userData?.kod] ? 1 : -1);
			grid.jqxTreeGrid('clear'); colDefs = this.getColumns(colDefs); try { grid.jqxTreeGrid('columns', colDefs.flatMap(colDef => colDef.jqxColumns)) } catch (ex) { console.error(ex) }
			$.extend(ozetBilgi, { grupTipKod: Object.keys(grup)[0] || null, icerikTipKod: Object.keys(icerik).find(kod => !!tabloYapi.toplam[kod]) || null });
			$.extend(ozetBilgi, { grupAttr: (tip2ColDefs[ozetBilgi.grupTipKod] || [])[0]?.belirtec, icerikAttr: (tip2ColDefs[ozetBilgi.icerikTipKod] || [])[0]?.belirtec });
			const ozetBilgi_getColumns = (source, kod, colDefDuzenle) =>
				(source[kod]?.colDefs || []).map(_colDef => { const colDef = _colDef.deepCopy(); if (colDefDuzenle) { getFuncValue.call(this, colDefDuzenle, colDef) } return colDef });
			ozetBilgi.colDefs = ozetBilgi.grupTipKod ? [
				...ozetBilgi_getColumns(tabloYapi.grup, ozetBilgi.grupTipKod, colDef => $.extend(colDef, { minWidth: 250, maxWidth: null, genislikCh: null })),
				...ozetBilgi_getColumns(tabloYapi.toplam, ozetBilgi.icerikTipKod, colDef => $.extend(colDef, { minWidth: null, maxWidth: null, genislikCh: 16, aggregates: ['sum'] }))
			] : [];
			secilenler.degistimi = false
		}
		await gridPart._promise_kaFix; await super.tazele(e); await this.tazeleDiger(e)
	}
	tabloTanimlariGosterIstendi(e) {
		const {tabloYapi, secilenler} = this, {kaListe} = tabloYapi, ozetMax = secilenler.ozetMax ?? 5;
		const kaDict = {}; for (const ka of kaListe) { kaDict[ka.kod] = ka }
		const inst = { listStates: {}, ozetMax, get ozetAttr() { return this.listStates.grup[0] } };
		const tumAttrSet = asSet(Object.keys(kaDict)); for (const selector of ['grup', 'icerik']) {
			let keys = secilenler[selector]; if (keys != null) { keys = Object.keys(keys) }
			inst.listStates[selector] = keys ?? []; for (const key of keys) { delete tumAttrSet[key] }
		}
		const kalanKodlar = inst.listStates.kalanlar = Object.keys(tumAttrSet);
		const title = 'Tablo Tanımları', className_listBox = 'listBox', ustHeight = '100px', islemTuslariHeight = '55px', contentTop = '-40px';
		const solWidth = '200px', ortaWidth = '200px', sagWidth = '100px', ortaHeight = 'calc((var(--full) / 2) - 5px)';
		let wnd, wRFB = new RootFormBuilder({ id: 'tabloTanimlari' }).setInst(inst).addCSS('part').addStyle(e => `$elementCSS { --islemTuslariHeight: ${islemTuslariHeight}; --ustHeight: ${ustHeight} }`);
		let fbd_ust = wRFB.addFormWithParent('ust').yanYana().addStyle_fullWH(null, 'var(--ustHeight)');
		let fbd_sablonParent = fbd_ust.addFormWithParent('sablon-parent').yanYana().addStyle_fullWH().addStyle([e =>
			`$elementCSS { position: relative; top: 5px }
			$elementCSS > .button { width: 50px !important; height: 45px !important; min-width: unset !important }`]);
		fbd_sablonParent.addModelKullan('sablonKod', 'Şablon').etiketGosterim_yok().dropDown().noMF().kodsuz()/*.listedenSecilemez()*/.setSource([]).addStyle_fullWH('calc(var(--full) - 300px)');
		fbd_sablonParent.addButton('sablonKaydet', '+').addCSS('button').onClick(_e => this.tabloTanimlariGoster_sablonKaydetIstendi({ ...e, ..._e, wnd, inst }));
		fbd_sablonParent.addButton('sablonSil', 'x').addCSS('button').onClick(_e => this.tabloTanimlariGoster_sablonSilIstendi({ ...e, ..._e, wnd, inst }));
		let fbd_islemTuslari = fbd_ust.addFormWithParent('islemTuslari').yanYana().addStyle_wh('auto', islemTuslariHeight).addStyle(`$elementCSS { position: absolute; top: 0; right: 0; z-index: 1000 }`);
		fbd_islemTuslari.addButton('tamam').onClick(async _e => {
			try {
				const close = () => { if (wnd?.length) { wnd.jqxWindow('close') } };
				let result = await this.tabloTanimlariGoster_tamamIstendi({ ...e, ..._e, wnd, close, tabloYapi, inst });
				if (result !== false) { close() }
			}
			catch (ex) {
				console.error(ex); wnd.jqxWindow('collapse');
				let _wnd = displayMessage(getErrorText(ex), title).wnd; _wnd.on('close', evt => wnd.jqxWindow('expand'))
			}
		});
		fbd_islemTuslari.addButton('vazgec').onClick(e => wnd.jqxWindow('close'));
		let fbd_content = wRFB.addFormWithParent('content').yanYana().addStyle_fullWH(null, 'calc(var(--full) - var(--ustHeight) - var(--top) + 8px)').addStyle([e =>
			`$elementCSS { --top: ${contentTop}; position: relative; top: var(--top); z-index: 100 }
			 $elementCSS > div .${className_listBox} { --label-height: 30px; --label-margin-bottom: 20px }
			 $elementCSS > div .${className_listBox} > label { font-size: 180%; color: #999; height: var(--label-height); padding-bottom: var(--label-margin-bottom) }
			 $elementCSS > div .${className_listBox} > :not(label) { vertical-align: top; height: calc(var(--full) - var(--label-height) - var(--label-margin-bottom)) !important }
			 $elementCSS > div .${className_listBox} > .jqx-listbox .jqx-listitem-element { font-size: 130% }`]);
		const initListBox = e => {
			const {builder} = e, {id, altInst, input} = builder; let source = e.source ?? ((altInst[id] || []).map(kod => kaDict[kod]));
			if (source?.length && typeof source[0] != 'object') { source = source.map(kod => new CKodVeAdi({ kod, aciklama: kod })) }
			const width = '100%', height = width, valueMember = 'kod', displayMember = 'aciklama';
			const allowDrop = true, allowDrag = allowDrop, autoHeight = false, itemHeight = 40, filterable = true, filterHeight = 35, filterPlaceHolder = 'Bul';
			input.prop('id', id); input.jqxListBox({ theme, width, height, valueMember, displayMember, source, allowDrag, allowDrop, autoHeight, itemHeight, filterable, filterHeight, filterPlaceHolder });
			const changeHandler = evt => { const target = evt.currentTarget, {id} = target, items = $(target).jqxListBox('getItems'); inst.listStates[id] = items.map(item => item.value) };
			input.on('change', changeHandler); input.on('dragEnd', changeHandler);
		};
		let fbd_sol = fbd_content.addFormWithParent('sol').altAlta().addStyle_fullWH(solWidth);
		fbd_sol.addDiv('kalanlar').setEtiket('Kalanlar').addCSS(className_listBox).addStyle_fullWH().setAltInst(inst.listStates).onAfterRun(e => initListBox(e));
		let fbd_orta = fbd_content.addFormWithParent('orta').altAlta().addStyle_fullWH(ortaWidth);/*.addStyle(e => `$elementCSS { position: absolute; right: 0 }`);*/
		fbd_orta.addDiv('grup').setEtiket('Grup').addCSS(className_listBox).addStyle_fullWH(null, ortaHeight).setAltInst(inst.listStates).onAfterRun(e => initListBox(e));
		fbd_orta.addDiv('icerik').setEtiket('İçerik').addCSS(className_listBox).addStyle_fullWH(null, ortaHeight).setAltInst(inst.listStates).onAfterRun(e => initListBox(e));
		let fbd_sag = fbd_content.addFormWithParent('sag').altAlta().addStyle_fullWH(sagWidth); fbd_sag.addNumberInput('ozetMax', '... max');
		wnd = createJQXWindow({ title, args: { isModal: false, closeButtonAction: 'close', width: Math.min(530, Math.max(600, $(window).width() - 100)), height: Math.min(800, $(window).height() - 50) } });
		wnd.on('close', evt => { wnd.jqxWindow('destroy'); $('body').removeClass('bg-modal') });
		wnd.prop('id', wRFB.id); wnd.addClass('dRapor part'); setTimeout(() => $('body').addClass('bg-modal'), 10);
		let parent = wnd.find('div > .subContent'); wRFB.setParent(parent); wRFB.run(); this._tabloTanimGosterildiFlag = true
	}
	tabloTanimlariGoster_tamamIstendi(e) {
		const {builder, inst} = e, {listStates} = inst, {tabloYapi, secilenler} = this, {toplam} = tabloYapi;
		const secIcerik = listStates.icerik, toplanabilirVarmi = !!secIcerik.find(key => toplam[key]), normalIcerikVarmi = !!secIcerik.find(key => !toplam[key]);
		if (!(toplanabilirVarmi && normalIcerikVarmi)) { throw { isError: true, errorText: 'En az birer Toplanabilir ve Normal saha olmalıdır' } }
		for (const selector of ['grup', 'icerik']) { secilenler[selector] = asSet(listStates[selector] || []) }
		for (const key of ['ozetMax']) { secilenler[key] = inst[key] }
		secilenler.degistimi = true; this.tazele(e); return true
	}
	tabloTanimlariGoster_sablonKaydetIstendi(e) { }
	tabloTanimlariGoster_sablonSilIstendi(e) { }
	seviyeAcIstendi(e) { const {gridPart} = this, {gridWidget} = gridPart; gridWidget.expandAll() }
	seviyeKapatIstendi(e) { const {gridPart} = this, {gridWidget} = gridPart; gridWidget.collapseAll() }
	getColumns(colDefs) {
		colDefs = super.getColumns(colDefs); if (!colDefs) { return colDefs }
		const {gridPart} = this; let icerikColsSet; for (const colDef of colDefs) {
			colDef.cellClassName = (colDef, rowIndex, belirtec, value, rec) => {
				if (icerikColsSet == null) { const {secilenler} = this; icerikColsSet = secilenler.icerik }
				const result = ['treeRow']; if (rec) { result.push(rec.leaf ? 'leaf' : 'grup') }
				if (icerikColsSet && icerikColsSet[belirtec]) { result.push('icerik') }
				let {level} = rec; if (level != null) { result.push('level-' + level.toString()) }
				return result.filter(x => !!x).join(' ')
			}
		}
		return colDefs
	}
}
