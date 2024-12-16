class SecimBilgi extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			tekilmi: e.tekilmi ?? e.tekil ?? true, secince: e.secince, vazgecince: e.vazgecince || e.kapaninca,
			converter: e.converter || (e => { const {mfSinif, rec} = e; if (!rec) { return null } const kodSaha = e.kodSaha ?? mfSinif?.kodSaha ?? 'kod'; return rec[kodSaha] })
		})
	}
	async sec(e) {
		const secince = e.secince || this.secince; if (!secince) { return null }
		const {recs, mfSinif} = e, converter = e.converter || this.converter; delete e.recs;
		let values; if (converter) { values = recs.map(rec => getFuncValue.call(this, converter, { rec, mfSinif })) }
		const tekilmi = e.tekilmi ?? this.tekilmi; $.extend(e, { tekilmi, rec: recs[0], recs, value: values[0], values })
		return await getFuncValue.call(this, secince, e)
	}
}
class GridPanelDuzenleyici extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get mfSinif() { return this.gridPart?.mfSinif } get duzTabloKolonlari() { return this.gridPart?.duzTabloKolonlari }
	get tabloKolonlari() { return this.gridPart?.tabloKolonlari } get belirtec2Kolon() { return this.gridPart?.belirtec2Kolon }
	get grid() { return this.gridPart?.grid } get gridWidget() { return this.gridPart?.gridWidget }
	get colCount() { return getFuncValue.call(this, this._colCount) || 0 } set colCount(value) { this._colCount = value }
	get rowsHeight() { return this.gridPart.getRowsHeight() } set rowsHeight(value) { this.gridPart._rowsHeight = value }
	get siraliBelirtecListe() {
		let result = undefined; /*this._siraliBelirtecListe;*/
		if (result == null) {
			const {duzKolonTanimlari} = this.gridPart; result = this._siraliBelirtecListe = [];
			for (const colDef of duzKolonTanimlari) { const {ekKolonmu} = colDef; if (ekKolonmu) { result.push(colDef.belirtec) } }
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e); const gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		let ekKolonPrefix = e.ekKolonPrefix ?? e.prefix, {colCount, ekKolonOlusturucu, ekKolonDuzenleyici_args, ekKolonDuzenleyici_son} = e, subRecsSelector = e.subRecsSelector = '_subItems';
		if (!ekKolonOlusturucu) {
			ekKolonOlusturucu = e => {
				e = e || {}; const ekKolonPrefix = e.ekKolonPrefix || this.ekKolonPrefix || '_ekKolon', {seq} = e;
				const _e = { args: { belirtec: `${ekKolonPrefix}${seq ?? ''}`, text: ' ', sortable: false, filterable: false, groupable: false } }
				if (ekKolonDuzenleyici_args) { getFuncValue.call(this, ekKolonDuzenleyici_args, _e) }
				_e.colDef = new GridKolon(_e.args); if (ekKolonDuzenleyici_son) { getFuncValue.call(this, ekKolonDuzenleyici_son, _e) }
				return _e.colDef
			}
		}
		if (!ekKolonPrefix && ekKolonOlusturucu) { const colDef = getFuncValue.call(this, ekKolonOlusturucu); if (colDef) { ekKolonPrefix = colDef.belirtec } }
		const getCellLayoutIslemi = e.getCellLayout ?? e.getCellLayoutIslemi;
		const getSubRecIslemi = e.getSubRec ?? e.getSubRecIslemi ?? (e => {
			const {parentRec} = e, subRecsSelector = e.subRecsSelector ?? this.subRecsSelector, index = e.index ?? e.seq - 1;
			return subRecsSelector ? (parentRec[subRecsSelector] || [])[index] ?? null : parentRec
		});
		let {grupAttrListe, ustSeviyeAttrListe} = e;
		$.extend(this, { gridPart, colCount, ekKolonPrefix, ekKolonOlusturucu, getCellLayoutIslemi, getSubRecIslemi, subRecsSelector, grupAttrListe, ustSeviyeAttrListe })
	}
	gridArgsDuzenle(e) {
		const {args} = e, gridPart = e.gridPart ?? e.sender, {rowsHeight} = this;
		$.extend(args, { showFilterRow: false, selectionMode: 'singlecell', adaptive: false, groupsExpandedByDefault: true, enableTooltips: false, autoShowLoadElement: false });
		let {tabloKolonlari} = e; tabloKolonlari = e.tabloKolonlari = tabloKolonlari.filter(colDef => colDef.belirtec != '_rowNumber')
		if (gridPart?.noAnimate) { gridPart.noAnimate() }
	}
	tabloKolonlariDuzenle(e) {
		const {colCount} = this; if (!colCount) { return }
		const {liste} = e, {ekKolonOlusturucu} = this, _e = $.extend({}, e, { colCount });
		const getCellClassName = (sender, rowIndex, belirtec, value, parentRec, prefix) => {
			let result = belirtec; const rec = this.getSubRec({ rowIndex, belirtec, parentRec });
			if (prefix) { if ($.isArray(prefix)) { prefix = prefix.join(' ') } if (prefix != result) { result += ` ${prefix}` } }
			if (rec) {
				let ekCSS = this.mfSinif?.getEkCSS({ sender, rowIndex, dataField: belirtec, value, rec });
				if (ekCSS) { if ($.isArray(ekCSS)) ekCSS = ekCSS.join(' ') } if (ekCSS) { result += ` ${ekCSS}` }
			}
			return result
		};
		for (let seq = 1; seq <= colCount; seq++) {
			_e.seq = seq; const colDef = getFuncValue.call(this, ekKolonOlusturucu, _e);
			if (colDef) { $.extend(colDef, { ekKolonmu: true, seq }); liste.push(colDef) }
			const savedCellClassName = colDef.cellClassName /*, savedCellsRenderer = colDef.cellsRenderer*/;
			colDef.cellClassName = (sender, rowIndex, belirtec, value, rec) => {
				const prefix = savedCellClassName ? getFuncValue.call(this, savedCellClassName, sender, rowIndex, belirtec, value, rec) : null;
				return getFuncValue.call(this, getCellClassName, sender, rowIndex, belirtec, value, rec, prefix)
			}
		}
	}
	recsDuzenle(e) {
		const {colCount, subRecsSelector, getCellLayoutIslemi} = this; if (!(colCount && subRecsSelector)) { return null }
		const gridPart = e.gridPart ?? e.sender, {duzKolonTanimlari, gridWidget} = gridPart, _recs = e.recs, mfSinif = e.mfSinif ?? this.mfSinif;
		const {args} = e, {ekKolonPrefix, siraliBelirtecListe} = this, recs = [];
		const grupAttrListe = this.grupAttrListe || [], ustSeviyeAttrListe = this.ustSeviyeAttrListe || []; let currentRec, seq = 1, anahSonGrupValues;
		const getGrupAnah = rec => grupAttrListe.map(key => rec[key]?.toString() ?? '').join('$|$');
		for (const rec of _recs) {
			if (!rec) { continue }
			let grupUygunmu = false, subRecs = (currentRec || {})[subRecsSelector];
			if (currentRec) { let anahGrupValues = getGrupAnah(rec); grupUygunmu = anahSonGrupValues != null && (anahSonGrupValues != null && anahSonGrupValues == anahGrupValues) }
			if (!grupUygunmu) { anahSonGrupValues = getGrupAnah(rec) }
			if (!currentRec || seq > colCount || !grupUygunmu) {
				currentRec = { _satirmi: true }; for (const key of ustSeviyeAttrListe) { currentRec[key] = rec[key] }
				seq = 1; subRecs = currentRec[subRecsSelector] = []; recs.push(currentRec)
			} subRecs.push(rec);
			const ekKolonBelirtec = siraliBelirtecListe[seq - 1];
			let _e = $.extend({}, e, { gridPart, mfSinif, colCount, rec, satirRec: currentRec, seq, belirtec: ekKolonBelirtec })
			let cellLayout = getFuncValue.call(this, getCellLayoutIslemi, _e); if (cellLayout) {
				if (cellLayout && typeof cellLayout != 'string') {
					if (cellLayout[0]) { cellLayout = cellLayout[0] }
					cellLayout = cellLayout?.outerHTML ?? cellLayout
				}
				currentRec[ekKolonBelirtec] = cellLayout
			} seq++
		}
		return recs
	}
	gridVeriYuklendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.part, {gridWidget, grid} = gridPart, {selectedRowIndex} = gridPart;
		if (selectedRowIndex) { gridWidget.ensurerowvisible(selectedRowIndex) }
	}
	getParentRecAtIndex(rowIndex, gridPart) { const {gridWidget} = gridPart || {}; return (rowIndex == null || rowIndex < 0 ? null : gridWidget.getrowdata(rowIndex)) ?? gridPart.selectedRec }
	getSubRecs(e) {
		const result = [], {cells} = e;
		if ($.isEmptyObject(cells)) { const rec = this.getSubRec(e); if (rec) { result.push(rec) }}
		else {
			for (const cell of cells) {
				const _e = { ...e }, belirtec = cell.belirtec ?? cell.datafield ?? cell.dataField, rowIndex = cell.rowIndex ?? cell.rowindex ?? cell.row;
				$.extend(_e, { belirtec, rowIndex }); let rec = this.getSubRec(_e); if (rec) { result.push(rec)}
			}
		}
		return result 
	}
	getSubRec(e) {
		const {gridPart, getSubRecIslemi} = this, gridWidget = e?.gridWidget ?? gridPart.gridWidget, {rowIndex} = e;
		let belirtec = e?.belirtec ?? e?.colIndex; if (typeof belirtec == 'number') { belirtec = gridWidget.getcolumnat(belirtec)?.datafield }
		let parentRec = e.parentRec = e.parentRec ?? e.rec; if (!parentRec) { if (rowIndex != null && rowIndex > -1) { parentRec = e.parentRec = gridWidget.getrowdata(rowIndex) } } if (!parentRec) { return null }
		let rec; if (!getSubRecIslemi) { return rec = e.rec = parentRec }
		const {siraliBelirtecListe, subRecsSelector} = this, index = siraliBelirtecListe.indexOf(belirtec);
		$.extend(e, { subRecsSelector, index }); rec = e.rec = getFuncValue.call(this, getSubRecIslemi, e); return rec
	}
	tazele(e) { this.gridPart?.tazele(e); return this }
	boyutlandirIstendi(e) {
		const evt = e.event, gridPart = e.parentPart, {grid, gridWidget, ozelKolonDuzenleBlock} = gridPart, title = 'Boyut Ayarları'; let wnd;
		const {mfSinif} = this, {yerelParam} = mfSinif, paramGlobals = mfSinif.paramGlobals || {}, keys = ['rowsHeight', 'colCount'];
		let {rowsHeight, colCount} = this; const maxColCount = mfSinif?.orjBaslikListesi_maxColCount || colCount || 10;
		let content = $(
			`<div class="full-wh">` +
				`<div class="rowsHeight scaler item flex-row"><label class="etiket">Grid Satır Yükseklik:</label><input class="veri" type="range" min="50" max="400" step="5" value="${rowsHeight}"></input></div>` +
				`<div class="colCount scaler item flex-row"><label class="etiket">Grid Kolon Sayısı:</label><input class="veri" type="range" min="1" max="${maxColCount}" step="1" value="${colCount}"></input></div>` +
			`</div>`
		);
		const close = e => { if (wnd) { wnd.jqxWindow('close'); wnd = null } }, rfb = new RootFormBuilder({ parentPart: gridPart, layout: content }).autoInitLayout();
		const updateLayout = e => {
			const layout = e.builder?.layout ?? e.layout ?? e;
			for (const key of keys) { layout.find(`.item.${key} > .veri`).val(this[key]) }
		}
		const updateMQUI = e => {
			e = e || {}; setTimeout(() => {
				for (const key of ['_orjBaslikListesi', '_listeBasliklari', '_standartGorunumListesi', 'tabloKolonlari']) { delete gridPart[key] }
				let tabloKolonlari = e.tabloKolonlari = []; tabloKolonlari.push(...gridPart.defaultTabloKolonlari);
				let {ekTabloKolonlari} = this; if (ekTabloKolonlari) { ekTabloKolonlari = getFuncValue.call(gridPart, ekTabloKolonlari, _e) }
				if (ekTabloKolonlari) {
					const colAttrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec));
					for (const colDef of ekTabloKolonlari) { if (!colAttrSet[colDef.belirtec]) { tabloKolonlari.push(colDef) } }
				}
				$.extend(e, { args: {}, sender: gridPart }); gridPart.gridArgsDuzenleDevam(e);
				if (ozelKolonDuzenleBlock) { let result = getFuncValue.call(this, ozelKolonDuzenleBlock, e); if (result != null) { e.tabloKolonlari = result } }
				grid.jqxGrid('rowsheight', this.rowsHeight); gridPart.updateColumns({ tabloKolonlari }); setTimeout(() => gridPart.tazele(), 1)
			}, 100)
		}
		rfb.onAfterRun(({ builder: fbd }) => {
			const {layout} = fbd; for (const key of keys) {
				layout.find(`.item.${key} > .veri`).on('change', ({ currentTarget: target }) => {
					const {value} = target; paramGlobals[key] = asInteger(value); yerelParam?.kaydetDefer(); updateMQUI() })
			}
		}).addStyle(...[
				e => `$elementCSS .item { --etiket-width: 130px; margin-inline-end: 10px } $elementCSS .item > .etiket { color: #aaa; width: var(--etiket-width) }`,
				e => `$elementCSS .item > .veri { font-weight: bold; width: calc(var(--full) - (var(--etiket-width) + 10px)) }`
			]);
		const buttons = { 'SIFIRLA': (e) => { for (const key of keys) { delete paramGlobals[key] }; yerelParam?.kaydet(); updateLayout(rfb.layout); updateMQUI() } };
		wnd = createJQXWindow({ content, title, buttons, args: { isModal: false, closeButtonAction: 'close', width: Math.min(600, $(window).width() - 50), height: Math.min(200, $(window).height() - 100) } });
		content = wnd.find('div > .content > .subContent'); rfb.run();
		wnd.on('close', evt => { $('body').removeClass('bg-modal'); wnd.jqxWindow('destroy'); wnd = null /* updateMQUI()*/ }); $('body').addClass('bg-modal')
	}
}
