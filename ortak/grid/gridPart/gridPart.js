class GridPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get isGridPart() { return true } get isGridPart() { return this.class.isGridPart } get wndClassNames() { return $.merge(['grid'], super.wndClassNames || []) }
	get gridFormSelector() { return '.grid-parent .grid' } get defaultLayoutSelector() { return this.class.isWindowPart ? super.defaultLayoutSelector : this.gridFormSelector }
	
	static get defaultAsyncFlag() { return true } static get defaultCacheFlag() { return true }
	get asyncFlag() { return this.async == null ? this.class.defaultAsyncFlag : this.async } get cacheFlag() { return this.async == null ? this.class.defaultCacheFlag : this.cache }
	get gridRecOzelkeys() { return ['uid', 'uniqueid', 'visibleindex', 'boundindex'] } get defaultGridIDBelirtec() { return undefined }
	get defaultSabitFlag() { return null } get boundRecs() { const {gridWidget} = this; return gridWidget ? gridWidget.getboundrows() : null }
	get columns() { const {grid} = this; return grid && grid.length ? grid.jqxGrid('columns') : null } set columns(jqxCols) { const {grid} = this; if (jqxCols && grid && grid.length) grid.jqxGrid('columns', jqxCols) }
	get groups() { const {grid} = this; return grid && grid.length ? grid.jqxGrid('groups') : null } set groups(value) { const {grid} = this; if (grid && grid.length) grid.jqxGrid('groups', value || null) }
	get recs() { const {gridWidget} = this; return gridWidget ? gridWidget.getrows() : null }
	get selectedRowIndexes() {
		const {gridWidget} = this; if (!gridWidget) return []; const sel = gridWidget.getselection();
		let result = ($.isEmptyObject(sel.rows) ? Object.keys(asSet(sel.cells.map(cell => cell.rowindex))).map(x => asInteger(x)) : (sel.rows || []).filter(x => x != null));
		if ($.isEmptyObject(result)) { const rowIndex = gridWidget._lastClickedCell?.row; if (rowIndex != null && rowIndex > -1) result = [rowIndex] }
		return result
	}
	get selectedRowIndex() {
		const {selectedRowIndexes} = this; let result = selectedRowIndexes ? selectedRowIndexes[0] : null;
		if (typeof result == 'number' && result < 0) { result = null } return result
	}
	get selectedRecs() { const {gridWidget, selectedRowIndexes} = this; return selectedRowIndexes ? selectedRowIndexes.map(i => gridWidget.getrowdata(i)).filter(rec => !!rec) : [] }
	get selectedRec() { const {selectedRecs} = this; return selectedRecs ? selectedRecs[0] : null }
	get selectedBelirtec() { const sel = this.gridWidget.getselection(); return (sel?.cells || [])[0]?.datafield }
	get selectedBelirtecler() { const sel = this.gridWidget.getselection(); return asSet((sel?.cells || [])?.map(cell => cell.datafield) || []) }
	get isEditable() { const {gridWidget} = this; return gridWidget ? gridWidget.editable : null }
	get selectionMode() { const {gridWidget} = this; return gridWidget?.selectionmode }
	get clickedColumn() { const {gridWidget} = this; return gridWidget?._clickedcolumn }
	get mousePosition() { const {gridWidget} = this; return gridWidget?.mousecaptureposition }
	get isClickedColumn_checkBox() { const {clickedColumn, mousePosition} = this; return clickedColumn == '_checkboxcolumn' || (mousePosition?.clickedcell ?? 0) < 1 }
	get isClickedColumn_rowNumber() { const {clickedColumn} = this; return clickedColumn == '_rowNumber' }
	get isSelectionMode_checkBox() { const {selectionMode} = this; return (selectionMode && selectionMode.toLowerCase() == 'checkbox') }
	get isSelectionMode_rows() { const {selectionMode} = this; return (selectionMode && selectionMode.toLowerCase().includes('row')) }
	get isSelectionMode_cells() { const {selectionMode} = this; return (selectionMode && selectionMode.toLowerCase().includes('cell')) }
	get belirtec2OrjKolonState() {
		let result = this._belirtec2OrjKolonState; if (result == null) {
			const {grid, gridWidget} = this, gridCols = gridWidget.columns?.records ?? gridWidget.columns;
			result = {}; for (const jqxCol of gridCols) { const belirtec = jqxCol.datafield, {editable, hidden} = jqxCol, state = { belirtec, editable, hidden }; result[belirtec] = state }
			this._belirtec2OrjKolonState = result
		}
		return result
	}
	get kontrolcu() { return this._kontrolcu } set kontrolcu(value) { this._kontrolcu = value }
	getKontrolcu(e) { e = e || {}; let result = this.kontrolcu; if (isFunction(result)) { result = this.kontrolcu = getFuncValue.call(this, result, e) } return result }
	
	constructor(e) {
		super(e); e = e || {}; $.extend(this, {
			parentPart: e.parentPart, parentBuilder: e.parentBuilder, builder: e.builder, async: e.async == null ? null : asBool(e.async), cache: e.cache == null ? null : asBool(e.cache),
			bulPart: e.bulPart, ekTabloKolonlari: e.tabloKolonlari, ozelKolonDuzenleBlock: e.ozelKolonDuzenleBlock || e.ozelKolonDuzenle,
			argsDuzenleBlock: e.argsDuzenleBlock || e.argsDuzenle, loadServerDataBlock: e.source || e.loadServerDataBlock || e.loadServerData,
			bindingCompleteBlock: e.veriYukleninceBlock || e.veriYuklenince || e.bindingCompleteBlock || e.bindingComplete,
			gridVeriDegistiBlock: e.gridVeriDegisince || e.gridVeriDegistiBlock || e.gridVeriDegisti || e.cellValueChanged,
			gridGroupsChangedBlock: e.groupsChanged ?? e.groupsChangedBlock ?? e.gridGroupsChanged ?? e.gridGroupsChangedBlock,
			gridRenderedBlock: e.gridRenderedBlock || e.gridRendered, tusaBasilincaBlock: e.tusaBasilincaBlock || e.tusaBasilinca,
			gridHucreTiklandiBlock: e.gridHucreTiklandiBlock || e.gridHucreTiklandi, gridHucreCiftTiklandiBlock: e.gridHucreCiftTiklandiBlock || e.gridHucreCiftTiklandi,
			gridHucreTiklandiBlock: e.gridHucreTiklandiBlock || e.gridHucreTiklandi, gridHucreCiftTiklandiBlock: e.gridHucreCiftTiklandiBlock || e.gridHucreCiftTiklandi,
			gridContextMenuIstendiBlock: e.gridContextMenuIstendiBlock || e.gridContextMenuIstendi, gridIDBelirtec: e.gridIDBelirtec || this.defaultGridIDBelirtec,
			kolonFiltreDuzenleyici: e.kolonFiltreDuzenleyici || {}, sabitFlag: e.sabit ?? e.sabitmi ?? e.sabitFlag ?? this.defaultSabitFlag ?? false, detaySinif: e.detaySinif,
			_kontrolcu: e.kontrolcu, rowNumberOlmasinFlag: e.rowNumberOlmasin ?? e.rowNumberOlmasinFlag ?? ($(window).width() < 600 ? true : undefined),
			notAdaptiveFlag: e.notAdaptive ?? e.notAdaptiveFlag, noAnimateFlag: e.noAnimate ?? e.noAnimateFlag
		})
	}
	runDevam(e) {
		super.runDevam(e); let result = this.gridInit(e);
		if (this.isWindowPart) { const hasModalClass = this.hasModalClass = $('body').hasClass('bg-modal'); if (hasModalClass) { $('body').removeClass('bg-modal') } }
		return result
	}
	superRunDevam(e) { return super.runDevam(e) }
	destroyPart(e) {
		super.destroyPart(e); const {isWindowPart, hasModalClass, grid, gridWidget} = this; if (isWindowPart && hasModalClass) { $('body').addClass('bg-modal') }
		if (grid?.length && grid.parent()?.length) {
			try { grid.jqxGrid('destroy') } catch (ex) { }
			if (gridWidget) {
				const {menuitemsarray, filtermenu, filterpanel} = gridWidget;
				if (!$.isEmptyObject(menuitemsarray)) { const elm = $(menuitemsarray[0]).parents('.jqx-menu-wrapper'); if (elm?.length) elm.remove() }
				if (filterpanel?.length) { const elm = filterpanel.parents('.jqx-menu-wrapper'); if (elm?.length) { elm.remove() } }
				if (filtermenu?.length) { const elm = filtermenu.parents('.jqx-menu-wrapper'); if (elm?.length) { elm.remove() } }
				const {filterbar, gridmenu, table, gridcontent, columnsheader} = gridWidget; for (const elm of [filterbar, gridmenu, table, gridcontent, columnsheader]) { if (elm?.length) { elm.remove() } }
			}
			grid.remove()
		}
		this.grid = this.gridWidget = null
	}
	gridInit(e) {
		e = e || {}; let grid = this.grid ?? this.layout;
		if (grid.hasClass('wnd-content')) { grid = grid.find(this.gridFormSelector) } this.grid = grid;
		const {builder, tabloKolonlari, argsDuzenleBlock, gridRenderedBlock, cacheFlag, asyncFlag, notAdaptiveFlag} = this;
		const cache = cacheFlag, async = asyncFlag, _theme = theme;	/*const _theme = theme == 'metro' ? 'material' : theme;*/
		let args = {
			theme: _theme, localization: localizationObj, width: '99.9%', height: '99.6%', editMode: 'selectedcell', sortMode: 'many', autoHeight: false, autoRowHeight: false, rowsHeight: 35, autoShowLoadElement: true,
			altRows: true, enableTooltips: true, columnsHeight: 25, columnsMenuWidth: 50, columnsResize: true, columnsReorder: true, columnsMenu: true, autoShowColumnsMenuButton: true, sortable: true,
			filterable: true, filterRowHeight: 40, filterMode: 'default', showFilterRow: false, groupable: true, showGroupsHeader: false, groupIndentWidth: 40, groupsHeaderHeight: 33, groupsExpandedByDefault: false,
			enableBrowserSelection: false, selectionMode: 'multiplecellsextended', pageable: false, pagermode: 'advanced', adaptive: undefined, virtualMode: false, updatedelay: 0, scrollbarsize: 20, scrollMode: 'logical',		/* default | logical | deferred */
			renderGridRows: e => { const recs = e.data?.records || e.data; return recs  /* return recs.slice(e.startindex, e.startindex + e.endindex) */ },
			groupColumnRenderer: text => `<div style="padding: 5px 10px; float: left;">${text}</div>`,
			groupsRenderer: (text, group, expanded, groupInfo) => `<div class="grid-cell-group">${group}</div>`,
			rendered: type => { return this.gridRendered({ sender: this, builder, type, gridPart: this, grid: this.grid, gridWidget: this.gridWidget }) },
			/*rendered: type => this.gridRendered({ sender: this, builder, type: e, grid, gridWidget }), */
			handleKeyboardNavigation: evt => {
				if (this.dragDropDisabledFlag_resetTimer) { clearTimeout(this.dragDropDisabledFlag_resetTimer); delete this.dragDropDisabledFlag_resetTimer }
				const {builder, grid, gridWidget} = this; this.dragDropDisabledFlag = true;
				try { return this.gridHandleKeyboardNavigation({ sender: this, builder, event: evt, grid, gridWidget }) }
				finally {
					this.dragDropDisabledFlag_resetTimer = setTimeout(() => {
						this.dragDropDisabledFlag = false; delete this.dragDropDisabledFlag_resetTimer
						/* this.gridRendered({ sender: this, builder, type: e, grid, gridWidget }) */
					}, 100);
				}
			},
			source: new $.jqx.dataAdapter(
				{ cache, async, id: this.gridIDBelirtec, dataType: wsDataType, url: `${webRoot}/empty.php` }, {
					cache, async, addrow: (rowIndex, rec, position, commit) => { commit(true) }, updaterow: (rowIndex, rec, commit) => { rec._degisti = true; commit(true) }, deleterow: (rowIndexes, commit) => { commit(true) },
					loadServerData: (wsArgs, source, callback) => {
						let {gridWidget, grid} = this; if (!gridWidget && grid?.length) { gridWidget = this.gridWidget = grid.jqxGrid('getInstance') }
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
				})
		};
		const _e = $.extend({}, e, { sender: this, builder, grid, args }); this.gridArgsDuzenle(_e); let handler = this.gridArgsDuzenle_ek; if (handler) { getFuncValue.call(this, handler, _e) }
		args = _e.args; args.autoHeight = !args.height;
		if (args.autoRowHeight) args.autoRowHeight = args.pageable || args.autoHeight
		if (args.virtualMode && args.groupable && !args.pageable) args.groupable = false
		if (args.pageable && !args.pagesizeoptions) args.pageSizeOptions = [5, 7, 8, 9, 10, 11, 13, 14, 15, 18, 20, 25, 50, 80, 100, 200, 300, 500]
		args.pageSize = 100; args.enableOptimization = true; if (args.adaptive == null) { args.adaptive = !(notAdaptiveFlag || args.editable) }
		const firstCol = (args.columns || [])[0], secondCol = (args.columns || [])[1];
		if (firstCol && args.scrollMode == 'deferred' && $.isEmptyObject(args.deferredDataFields)) {
			/* args.scrollMode = 'deferred'; */ const deferredDataFields = args.deferredDataFields = [firstCol.dataField || firstCol.datafield];
			if (secondCol) { deferredDataFields.push(secondCol.dataField ?? secondCol.datafield) }
		}
		const initGridHeight = this.initGridHeight = args.height; if (!initGridHeight) args.height = 1
		grid.data('part', this); grid.jqxGrid(args); const gridWidget = this.gridWidget = grid.jqxGrid('getInstance'); gridWidget.gridPart = this;
		this.orjSelectionMode = gridWidget.selectionmode; /* setTimeout(() => this.onResize(), 0); */
		setTimeout(() => grid.find(`span:contains("www.jqwidgets.com")`).addClass('basic-hidden'), 50); this.gridInitFlag = true;
		grid.on('rowclick', evt => setTimeout(() => this.gridSatirTiklandi({ sender: this, builder, type: 'row', event: evt }), 10));
		grid.on('rowdoubleclick', evt => setTimeout(() => this.gridSatirCiftTiklandi({ sender: this, type: 'row', builder, event: evt }), 10));
		grid.on('cellclick', evt => setTimeout(() => this.gridHucreTiklandi({ sender: this, type: 'cell', builder, event: evt }), 10));
		grid.on('celldoubleclick', evt => setTimeout(() => this.gridHucreCiftTiklandi({ sender: this, type: 'cell', builder, event: evt }), 10));
		grid.on('bindingcomplete', event => this.gridVeriYuklendi({ ...e, sender: this, builder, event, grid, gridWidget, source: gridWidget.source }));
		grid.on('groupschanged', event => this.gridGroupsChanged({ ...e, sender: this, builder, event, grid, gridWidget, source: gridWidget.source }));
		grid.on('cellvaluechanged', evt => {
			setTimeout(() =>
				this.gridVeriDegisti($.extend({}, e, {
					sender: this, builder, event: evt, grid, gridWidget, belirtec: evt.args.datafield,
					action: 'cellValueChanged', rowIndex: evt.args.rowindex, newValue: evt.args.newvalue, oldValue: evt.args.oldvalue
				})), 10)
		});
		grid.on('contextmenu', evt => { setTimeout(() => this.gridContextMenuIstendi({ sender: this, builder: this.builder, event: evt }), 10); evt.preventDefault() });
		grid.on('sort', evt => { setTimeout(() => this.gridSortIstendi({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('rowexpand', evt => { setTimeout(() => this.gridRowExpanded({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('rowcollapse', evt => { setTimeout(() => this.gridRowCollapsed({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('groupexpand', evt => { setTimeout(() => this.gridGroupExpanded({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('groupcollapse', evt => { setTimeout(() => this.gridGroupCollapsed({ sender: this, builder: this.builder, event: evt }), 10) });
		const {globalEventNames} = GridKolon;
		for (const key of globalEventNames) {
			grid.on(key.toLowerCase(), evt => {
				const evtArgs = evt.args, belirtec = evtArgs?.datafield, colDef = this.belirtec2Kolon[belirtec]; if (!colDef) return
				let func; const {builder, gridWidget} = this, inst = this.inst ?? this.fis ?? builder?.altInst, rowIndex = evtArgs.rowindex;
				const _e = {
					sender: this, gridWidget, builder, inst, event: evt, args: evtArgs, belirtec, rowIndex,
					value: evtArgs.value ?? evtArgs.newvalue, oldValue: evtArgs.oldvalue,
					get gridRec() { return gridWidget.getrowdata(rowIndex) },
					setCellValue(e) {
						const _rowIndex = e.rowIndex ?? rowIndex, _dataField = e.dataField || e.belirtec || belirtec;
						if (_dataField) gridWidget.setcellvalue(_rowIndex, _dataField, e.value)
					}
				};
				const {tip} = colDef;
				if (tip) {
					func = tip.class[key]; if (func) _e.result = func.call(colDef, _e)
					func = tip[key]; if (func) _e.result = func.call(colDef, _e)
				}
				func = colDef[key]; if (func) _e.result = func.call(colDef, _e)
				return _e.result
			})
		}
		return grid
	}
	gridArgsDuzenle(e) {
		const {args} = e, {grid, ozelKolonDuzenleBlock, argsDuzenleBlock} = this;
		let tabloKolonlari = e.tabloKolonlari = []; tabloKolonlari.push(...this.defaultTabloKolonlari);
		let {ekTabloKolonlari} = this; if (ekTabloKolonlari) { ekTabloKolonlari = getFuncValue.call(this, ekTabloKolonlari, e) }
		if (ekTabloKolonlari) {
			const colAttrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec));
			for (const colDef of ekTabloKolonlari) { if (!colAttrSet[colDef.belirtec]) { tabloKolonlari.push(colDef) } }
		}
		this.gridArgsDuzenleDevam(e);
		if (ozelKolonDuzenleBlock) { let result = getFuncValue.call(this, ozelKolonDuzenleBlock, e); if (result != null) { e.tabloKolonlari = result } }
		tabloKolonlari = this.tabloKolonlari = e.tabloKolonlari;
		const belirtec2Kolon = this.belirtec2Kolon = e.belirtec2Kolon = {}, duzKolonTanimlari = this.duzKolonTanimlari = e.duzKolonTanimlari = [], jqxCols = [];
		for (const colDef of tabloKolonlari) { colDef.gridPart = this; jqxCols.push(...(colDef.jqxColumns || [])); colDef.belirtec2KolonDuzenle(e) }
		args.columns = jqxCols; if (argsDuzenleBlock) { getFuncValue.call(this, argsDuzenleBlock, e) }
	}
	gridArgsDuzenleDevam(e) { const kontrolcu = this.getKontrolcu(e); if (kontrolcu) { kontrolcu.gridArgsDuzenle(e) } }
	get defaultTabloKolonlari() {
		const liste = []; if (!this.rowNumberOlmasinFlag) {
			liste.push(new GridKolon({
					belirtec: '_rowNumber', text: '#', width: 55, groupable: false, draggable: false, cellClassName: '_rowNumber grid-readOnly'
					/*cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
						if (rec) { rec._rowNumber = rowIndex + 1 }
						value = (rec?.boundIndex ?? rowIndex) + 1; html = changeTagContent(html, value.toString())
						return html
					}*/
			}).tipNumerik().noSql().readOnly().sabitle())
		}
		return liste
	}
	async loadServerData(e) {
		const {parentPart, builder, grid, gridWidget, loadServerDataBlock} = this, editCell = gridWidget?.editcell;
		e = e || {}; $.extend(e, { sender: this, parentPart, builder }); const {wsArgs, source, action} = e;
		if (wsArgs && gridWidget) {
			if (gridWidget.pageable || gridWidget.virtualmode) {
				if (source) {
					const keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize'];
					for (const key of keys) { const value = source[key]; if (value != null) wsArgs[key] = value }
				}
			}
			else {
				const keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize'];
				for (const key of keys) { delete wsArgs[key] }
			}
		}
		(() => {
			const keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize'];
			for (const key of keys) { const value = qs[key]; if (value != null) wsArgs[key] = asInteger(value) }
			let _value = qs.maxRow ?? qs.maxrow; if (_value != null) { wsArgs.pagesize = asInteger(_value) }
		})();
		try {
			let secimler = parentPart?.secimler; if (parentPart?.partName == 'secimler') { secimler = null}
			const _e = $.extend({}, e, {
				action, sender: this, builder, parentPart, gridPart: this, gridWidget, inst: parentPart?.inst, fis: parentPart?.inst, secimler,
				editCell, editor: editCell?.editor, rowIndex: editCell?.row ?? gridWidget?.selectedrowindex, dataField: editCell?.datafield,
				get gridRec() {
					let result = this._gridRec; if (result === undefined) { const {gridWidget, rowIndex} = this; result = this._gridRec = gridWidget?.getrowdata(rowIndex) }
					return result
				}
			});
			let result = e.result = loadServerDataBlock ? await getFuncValue.call(this, loadServerDataBlock, _e) : await this.defaultLoadServerData(_e);
			let recs = e.recs = result ? $.isArray(result) ? result : result.records : null;
			if ($.isArray(recs)) {
				(async () => {
					for (let i = 0; i < recs.length; i++) {
						const rec = recs[i]; if (rec == null) continue; rec._rowNumber = (i + 1);
						if (this.isDestroyed) { break }
					}
				})();
				let _recs = await this.loadServerData_recsDuzenle_ilk(e); recs = e.recs; if (_recs != null) { recs = _recs }
				_recs = await this.loadServerData_recsDuzenle(e); recs = e.recs; if (_recs != null) { recs = _recs }
				_recs = await this.loadServerData_recsDuzenle_son(e); recs = e.recs; if (_recs != null) { recs = _recs }
				result = e.recs = recs
			}
			if (result && !$.isArray(result)) { const _recs = result.records = (recs?.records ?? recs); if (result.totalrecords == null) { result.totalrecords = _recs.length } }
			/*const t = recs[0]; recs[0] = recs[1]; recs[1] = t;*/
			return result
		}
		catch (ex) { const errorText = getErrorText(ex); displayMessage(`<div style="color: firebrick;">${errorText}</div>`, 'Grid Verisi Alınamadı'); /* console.error(ex); */ throw ex }
	}
	defaultLoadServerData(e) { return null }
	loadServerData_recsDuzenle_ilk(e) {
		const {filtreTokens} = this; let {recs} = e;
		if (filtreTokens?.length) { const _recs = this.loadServerData_recsDuzenle_hizliBulIslemi(e); recs = e.recs; if (_recs) { recs = e.recs = _recs } }
		return recs
	}
	loadServerData_recsDuzenle(e) { }
	loadServerData_recsDuzenle_son(e) {
		const {recs} = e; if (!recs?.length) { return }
		for (let i = 0; i < recs.length; i++) { const rec = recs[i]; rec._rowNumber = i + 1 }
	}
	loadServerData_recsDuzenle_hizliBulIslemi(e) {
		const {filtreTokens} = this; let {recs} = e; if (!recs?.length) { return } const mfSinif = e.mfSinif = this.getMFSinif ? this.getMFSinif(e) : null;
		if (mfSinif?.orjBaslikListesi_recsDuzenle_hizliBulIslemi) { if (mfSinif.orjBaslikListesi_recsDuzenle_hizliBulIslemi(e) === false) { return } }
		let attrListe = this._hizliBulFiltreAttrListe; if (!attrListe?.length) {
			attrListe = mfSinif?.orjBaslikListesi_hizliBulFiltreAttrListe;
			if (!attrListe?.length) {
				const {duzKolonTanimlari} = this; attrListe = [];
				for (const colDef of duzKolonTanimlari) { if (!(colDef.ekKolonmu || !colDef.text?.trim)) { attrListe.push(colDef.belirtec) } }
			}
			this._hizliBulFiltreAttrListe = attrListe
		}
		const orjRecs = recs; recs = [];
		for (const rec of orjRecs) {
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
	gridHandleKeyboardNavigation(e) {
		const evt = e.event, {timeStamp} = evt; let {_lastEventTimeStamp_handleKeyboardNavigation} = this;
		if (_lastEventTimeStamp_handleKeyboardNavigation && _lastEventTimeStamp_handleKeyboardNavigation == timeStamp) return
		if (!this.isSubPart && app.activePart && app.activePart != this) /*&& (evt.target == document.body || $(evt.target).parents('.jqx-grid').length)*/ return
		const activeElement = document.activeElement ? $(document.activeElement) : null;
		const gridHasFocus = activeElement.hasClass('jqx-grid') || !!activeElement.parents('.jqx-grid').length; if (!gridHasFocus) return
		const {builder, grid, gridWidget, belirtec2Kolon} = this; if (!(gridWidget && grid?.length)) return
		if (activeElement && (activeElement[0].tagName.toUpperCase() == 'TEXTAREA' || activeElement.hasClass('jqx-combobox-input'))) { /*evt.preventDefault()*/ return }
		_lastEventTimeStamp_handleKeyboardNavigation = this._lastEventTimeStamp_handleKeyboardNavigation = timeStamp;
		const eventType = evt.type?.toLowerCase(), {key} = evt;
		if (eventType == 'keydown') {
			switch (key?.toLowerCase()) { case 'enter': case 'linefeed': /* debugger; */ break }
		}
		const sender = this.sender || this, targetIsGrid = evt.target == grid, gridEditable = gridWidget.editable;
		let selectedCell = gridWidget.selectedcell;
		if (!selectedCell) { const _rowIndex = gridWidget.selectedrowindex; if (_rowIndex != null && _rowIndex > -1) selectedCell = { rowindex: _rowIndex, row: _rowIndex } }
		const editCell = gridWidget.editcell, _selectedCell = (selectedCell || {}); let rowIndex = _selectedCell.rowindex;
		const belirtec = _selectedCell.datafield, uid = rowIndex < 0 ? null : gridWidget.getrowid(rowIndex), selectedRec = rowIndex < 0 ? null : gridWidget.getrowdatabyid(uid);
		const colDef = belirtec ? belirtec2Kolon[belirtec] : null, jqxCol = belirtec ? gridWidget.getcolumn(belirtec) : null, colEditable = jqxCol?.editable;
		const modifiers = { ctrl: evt.ctrlKey, shift: evt.shiftKey, alt: evt.altKey }; const hasModifiers = modifiers.ctrl || modifiers.shift || modifiers.alt;
		let totalRecs = gridWidget.dataview.totalrecords; if (totalRecs == null) totalRecs = gridWidget.getboundrows()?.length
		if (rowIndex < 0) rowIndex = 0
		const _e = {
			sender, builder, event, eventType, key, modifiers, hasModifiers, timeStamp, targetIsGrid, grid, gridWidget, rowIndex, belirtec, colDef, jqxCol,
			selectedCell, editCell, gridEditable, colEditable, result: undefined
		};
		if (colDef?.handleKeyboardNavigation) { const _result = getFuncValue.call(colDef, colDef.handleKeyboardNavigation, _e); if (_result !== undefined) _e.result = _result }
		const {tusaBasilincaBlock} = this; if (tusaBasilincaBlock) { const _result = getFuncValue.call(this, tusaBasilincaBlock, _e); if (_result !== undefined) _e.result = _result }
		if (_e.result == null) {
			if (eventType == 'keydown' && (rowIndex != null && rowIndex > -1)) {
				const keyLower = key?.toLowerCase() || '';
				if (gridEditable) {
					if (editCell) {
						if (keyLower == 'escape') gridWidget.endcelledit(rowIndex, belirtec, false)
					}
					else {
						const _isLetterOrDigit = key && isLetterOrDigit(key);
						if (!hasModifiers && colDef && colEditable && ( _isLetterOrDigit || (keyLower == 'enter' || keyLower == 'linefeed' || keyLower == 'space'))) {
							if (_isLetterOrDigit) {
								const handler = evt => {
									setTimeout(() => {
										const {editor} = gridWidget.editcell || {}; let input = editor && editor.length ? editor : null, inputWidget;
										if (input && input.length) {
											const selectors = ['jqxComboBox', 'jqxDropDownList', 'jqxInput', 'jqxNumberInput'];
											for (const selector of selectors) { inputWidget = input[selector]('getInstance'); if (inputWidget) break }
											if (inputWidget && inputWidget.input) input = inputWidget.input
										}
										if (input?.length) {
											let promise = $.Deferred(p => {
												if (!inputWidget || inputWidget._ready === false) {
													let timerCheck, counter = 0;
													timerCheck = setInterval(() => {
														if (inputWidget && inputWidget._ready) { clearInterval(timerCheck); setTimeout(() => p.resolve(true), 50); return }
														counter++; if (counter > 50) { clearTimeout(timerCheck); promise.resolve(false); return }
													}, 10)
												}
												else { setTimeout(() => p.resolve(true), 50) }
											});
											promise.then(readyFlag => {
												let value = input.val();
												/* if (editor.jqxComboBox('getInstance') ? !value : true) { */
												if (true) {
													/*value += key;*/ value = key;
													if (editor.jqxNumberInput('getInstance')) {
														editor.val(asFloat(value) || 0); setTimeout(() => inputWidget._setSelection(1, 1), 10)
													}
													else {
														input.val(value); const tip = (input.attr('type') || '').toLowerCase();
														if (tip == 'textbox' || tip == 'text') setTimeout(() => input[0].selectionStart = -1, 100)
													}
												}
											});
										}
									}, 50); grid.off('cellbeginedit', handler);
								}; grid.on('cellbeginedit', handler);
							}
							gridWidget.begincelledit(rowIndex, belirtec); _e.result = true
						}
	
						else if (modifiers.ctrl && keyLower == ' ') {
							if (!editCell && gridEditable && colEditable && belirtec && rowIndex > 0) {
								const oldValue = gridWidget.getcellvalue(rowIndex, belirtec), newValue = gridWidget.getcellvalue(rowIndex - 1, belirtec);
								gridWidget.setcellvalue(rowIndex, belirtec, newValue);
								if (colDef?.cellValueChanged) { colDef.cellValueChanged({ args: { sender, builder, owner: gridWidget, datafield: belirtec, rowindex: rowIndex, oldvalue: oldValue, newvalue: newValue } }) }
								_e.result = true
							}
						}
	
						else if (modifiers.ctrl && keyLower == 'v') {
							if (!(gridEditable && colEditable)) { _e.result = true; return }
							if (colDef && belirtec && (rowIndex != null && rowIndex > -1)) {
								(async () => {
									let dataList = (await navigator.clipboard.readText())?.split('\n').map(x => x.trim()); if (!dataList?.length) { dataList = gridWidget._clipboardselection || [] }
									if (!$.isEmptyObject(dataList)) {
										const colIndex = gridWidget.columns.records.findIndex(col => col.datafield == belirtec);
										const firstItem = dataList[0], colCount = $.isArray(firstItem) ? firstItem.length : typeof firstItem == 'object' ? Object.keys(firstItem).length : 1;
										for (let colOffset = 0; colOffset < colCount; colOffset++) {
											for (let rowOffset = 0; rowOffset < dataList.length; rowOffset++) {
												let col = gridWidget.columns.records[colIndex]; if (!col) { debugger }
												const _rowIndex = rowIndex + rowOffset, _belirtec = colOffset ? col?.datafield : belirtec;
												let newValue = dataList[rowOffset]; if (typeof newValue == 'object') { newValue = [colOffset] }
												if (_rowIndex + 1 > gridWidget.getdatainformation().rowscount) { gridWidget.addrow(null, this.newRec(), _rowIndex) }
												gridWidget.setcellvalue(_rowIndex, _belirtec, newValue);
												if (colDef.cellValueChanged) {
													const oldValue = gridWidget.getcellvalue(_rowIndex, _belirtec); gridWidget.setcellvalue(_rowIndex, _belirtec, newValue);
													colDef.cellValueChanged({ args: { sender, builder, owner: gridWidget, datafield: _belirtec, rowindex: _rowIndex, oldvalue: oldValue, newvalue: newValue } })
												}
											}
										}
									}
									// setTimeout(() => gridWidget.endupdate(true), 100)
								})();
								_e.result = true
							} 
						}
						
						else if (!hasModifiers && keyLower == 'insert' && !this.sabitFlag) {
							const _rec = this.newRec({ rec: selectedRec }); gridWidget.addrow(null, _rec, rowIndex); /*gridWidget.endupdate(true);*/
							this.gridSatirEklendi({ sender, builder, owner: gridWidget, rowIndex, uid: _rec.uid, rowCount: { yeni: totalRecs, eski: totalRecs - 1 } });
							_e.result = true
						}
							
						else if (keyLower == 'delete') {
							const _selection = gridWidget.getselection(); let selectedRowIndexes = _selection.rows;
							if ($.isEmptyObject(selectedRowIndexes)) selectedRowIndexes = _selection.cells.map(cell => cell.rowindex);
							const selectedUids = $.isEmptyObject(selectedRowIndexes) ? null : selectedRowIndexes.map(rowIndex => gridWidget.getrowid(rowIndex));
							if (modifiers.ctrl && !this.sabitFlag) {
								if (selectedUids) {
									gridWidget.deleterow(selectedUids);
									const targetRowIndex = Math.max(rowIndex + 1 >= totalRecs ? rowIndex - 1 : rowIndex, 0); gridWidget.clearselection();
									if (this.isSelectionMode_cells) gridWidget.selectcell(targetRowIndex, belirtec)
									else gridWidget.selectrow(targetRowIndex);
									setTimeout(() => {
										this.gridSatirSilindi({
											sender, builder, owner: gridWidget, rowIndexes: selectedRowIndexes, uids: selectedUids,
											rowCount: { yeni: totalRecs, eski: totalRecs + selectedRowIndexes.length }
										});
									}, 10)
								}
								_e.result = true
							}
							else {
								if (!editCell && rowIndex != null && belirtec && gridEditable && colEditable && selectedRowIndexes) {
									const newValue = '';
									for (const _rowIndex of selectedRowIndexes) {
										const oldValue = gridWidget.getcellvalue(_rowIndex, belirtec); gridWidget.setcellvalue(_rowIndex, belirtec, '');
										if (colDef && colDef.cellValueChanged) {
											const {builder} = this, evt = e.event, inst = this.inst ?? this.fis ?? builder?.altInst;
											const evtArgs =  { sender, builder, owner: gridWidget, datafield: belirtec, rowindex: _rowIndex, oldvalue: oldValue, newvalue: newValue };
											const _e = {
												sender, gridWidget, builder, inst, event: evt, args: evtArgs, belirtec, rowIndex, value: newValue, oldValue,
												get gridRec() { return gridWidget.getrowdata(rowIndex) },
												setCellValue(e) {
													const _rowIndex = e.rowIndex ?? rowIndex, _dataField = e.dataField || e.belirtec || belirtec;
													if (_dataField) gridWidget.setcellvalue(_rowIndex, _dataField, newValue)
												}
											};
											setTimeout(() => colDef.cellValueChanged(_e), 1)
										}
									}
								}
								_e.result = true
							}
						}
						else if (!hasModifiers && keyLower == 'arrowdown' && !this.sabitFlag) {
							if (rowIndex + 1 >= totalRecs) {
								const targetRowIndex = rowIndex + 1, _rec = this.newRec({ rec: selectedRec }); gridWidget.addrow(null, _rec, 'last');
								setTimeout(() =>
									this.gridSatirEklendi({ sender, builder, owner: gridWidget, rowIndex: targetRowIndex, uid: _rec.uid, rowCount: { yeni: totalRecs, eski: totalRecs - 1 } }), 10)
							}
							_e.result = false
						}
						else if (!hasModifiers && keyLower == 'f4' && gridEditable && colDef && (rowIndex != null && rowIndex > -1)) {
							const {listedenSec} = colDef;
							if (listedenSec) {
								setTimeout(() => getFuncValue.call(this, listedenSec, $.extend({}, e, { args: {
									sender, builder, owner: gridWidget, datafield: belirtec, rowindex: rowIndex, value: gridWidget.getcellvalue(rowIndex, belirtec) } })), 10);
								_e.result = true
							}
						}
					}
				}
				if (_e.result == null) {
					if (modifiers.ctrl && keyLower == 'a') { gridWidget.selectallrows(); _e.result = true }
					else if (modifiers.ctrl && keyLower == 'f') { this.kolonFiltreIstendi(e); _e.result = false }
					else if (modifiers.ctrl && keyLower == 'v') { _e.result = true }
				}
			}
		}
		return _e.result
	}
	tazeleDefer(e) {
		e = e || {}; const deferMS = (typeof e == 'object' ? e.deferMS : e) ?? 1300; const timerKey = '_timer_tazeleDefer'; clearTimeout(this[timerKey]);
		this[timerKey] = setTimeout(() => { if (this.isDestroyed) { return } try { this.tazele(e) } finally { delete this[timerKey] } }, deferMS)
		return this
	}
	tazele(e) {
		e = e || {}; const {action} = e; if (action) { this._tazele_lastAction = action }
		this.expandedIndexes = {}; const {grid, gridWidget, noAnimateFlag} = this;
		if (gridWidget?.isbindingcompleted()) {
			if (!noAnimateFlag) {
				const animation = 'grid-open-slow'; grid.removeClass('grid-open grid-open-fast grid-open-slow'); grid.addClass(animation);
				clearTimeout(this.timer_animate); this.timer_animate = setTimeout(() => { grid.removeClass(animation); delete this.timer_animate }, 2000)
			}
			try { gridWidget.refresh() } catch (ex) { }
			try { return gridWidget.updatebounddata() } catch (ex) { setTimeout(() => gridWidget.updatebounddata(), 500); console.debug(ex); return this }
		}
		return this
	}
	updateColumns(e) {
		e = e || {}; let tabloKolonlari = (e.tabloKolonlari || e.liste || ($.isArray(e) ? e : null)) ?? this.duzKolonTanimlari;
		for (const key of ['_listeBasliklari', '_standartGorunumListesi', '_orjBaslikListesi', 'belirtec2Kolon', 'tabloKolonlari', 'duzKolonTanimlari']) { delete this[key] }
		const jqxCols = [], _e = $.extend({}, e, { belirtec2Kolon: {}, duzKolonTanimlari: [] });
		for (const colDef of tabloKolonlari || []) {
			const {belirtec} = colDef; if (!belirtec) continue; colDef.gridPart = this;
			jqxCols.push(...colDef.jqxColumns); colDef.belirtec2KolonDuzenle(_e)
		}
		$.extend(this, _e); /* const gridContent = this.grid; gridContent.addClass('fade-inout'); setTimeout(() => gridContent.removeClass('fade-inout'), 1000); */
		this.columns = jqxCols; return this
	}
	hizliBulIslemi(e) {
		e = e || {}; const {tokens} = e, {gridWidget} = this; this.filtreTokens = tokens; e.gridPart = this
		clearTimeout(this._timer_hizliBulIslemi_ozel); this._timer_hizliBulIslemi_ozel = setTimeout(() => {
			try {
				const {bulPart} = this, {input} = bulPart; this.tazele({ action: 'hizliBul' });
				for (const delayMS of [400, 1000]) { setTimeout(() => { bulPart.focus(); setTimeout(() => { input[0].selectionStart = input[0].selectionEnd = input[0].value?.length }, 205) }, delayMS) }
				setTimeout(() => FiltreFormPart.hizliBulIslemi(e), 500)
			}
			finally { delete this._timer_hizliBulIslemi_ozel }
		}, 100)
	}
	showColumn(belirtec) { const {gridWidget} = this; gridWidget.showcolumn(belirtec); return this }
	hideColumn(belirtec) { const {gridWidget} = this; gridWidget.hidecolumn(belirtec); return this }
	focus(e) { this.gridWidget.focus(); return this }
	sabit() { this.sabitFlag = true; return this } sabitDegil() { this.sabitFlag = false; return this }
	rowNumberOlsun() { this.rowNumberOlmasinFlag = false; return this } rowNumberOlmasin() { this.rowNumberOlmasinFlag = true; return this }
	adaptive() { return this.notAdaptiveFlag = false; return this } notAdaptive() { return this.notAdaptiveFlag = true; return this }
	animate() { this.noAnimateFlag = false; return this } noAnimate() { this.noAnimateFlag = true; return this }
	newRec(e) {
		e = e || {}; let {gridWidget, grid} = this; if (!gridWidget && grid?.length) { gridWidget = this.gridWidget = grid.jqxGrid('getInstance') }
		let cls = e.sinif ?? this.detaySinif; if (!cls) { const recCount = gridWidget.getrecordscount(); cls = recCount ? gridWidget.getrowdata(recCount - 1)?.class : null }
		if (!cls) {
			const {rowIndex, uid} = e; let {rec} = e;
			if (!rec) {
				if (rowIndex != null && rowIndex > -1) { rec = gridWidget.getrowdata(rowIndex) }
				else if (uid != null) { rec = gridWidget.getrowdatabyid(uid) }
			}
			if (rec) { cls = rec.class }
		}
		const {args} = e, result = cls ? new cls(args) : (args || {}); return result
	}
	async gridVeriYuklendi(e) {
		const {grid, gridWidget, bindingCompleteBlock, expandedIndexes} = this; setTimeout(() => grid.find(`span:contains("www.jqwidgets.com")`).addClass('basic-hidden'), 50);
		if ($.isEmptyObject(expandedIndexes)) { this.kolonFiltreDegisti(e) }
		if (bindingCompleteBlock) { await getFuncValue.call(this, bindingCompleteBlock, e) }
		const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridVeriYuklendi) { await kontrolcu.gridVeriYuklendi(e) }
		this.gridGroupsChanged(e); if ($.isEmptyObject(expandedIndexes)) { for (const delayMS of [500]) { setTimeout(() => this.onResize(), delayMS) } }
	}
	gridVeriDegisti(e) {
		const {gridVeriDegistiBlock} = this; if (gridVeriDegistiBlock) { getFuncValue.call(this, gridVeriDegistiBlock, e) }
		const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridVeriDegisti) { kontrolcu.gridVeriDegisti(e) }
	}
	gridGroupsChanged(e) {
		const {gridGroupsChangedBlock} = this; if (gridGroupsChangedBlock) { const result = getFuncValue.call(this, gridGroupsChangedBlock, e); if (result === false) { return } }
		const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridGroupsChanged) { const result = kontrolcu.gridGroupsChanged(e); if (result === false) { return } }
		const {gridWidget} = this, showGroupsHeaderFlag = gridWidget.showgroupsheader; if (showGroupsHeaderFlag) {
			const groups = gridWidget.groups ?? [], groupsSet = asSet(groups), belirtec2OrjKolonState = this.belirtec2OrjKolonState || {}, gridCols = gridWidget.columns?.records ?? gridWidget.columns;
			for (const jqxCol of gridCols) {
				const belirtec = jqxCol.datafield; if (!belirtec || belirtec == '_rowNumber' || belirtec == '_checkboxcolumn') { continue }
				const state = belirtec2OrjKolonState[belirtec] || {}, hasGroup = groupsSet[belirtec];
				/*if (hasGroup) { gridWidget.hidecolumn(belirtec) } else { gridWidget.showcolumn(belirtec) }*/
				if (hasGroup) { if (!jqxCol.hidden) { gridWidget.hidecolumn(belirtec) } } else { if (!state.hidden && jqxCol.hidden) { gridWidget.showcolumn(belirtec) } }
			}
		}
	}
	gridRendered(e) {
		const {gridRenderedBlock} = this; if (gridRenderedBlock) { getFuncValue.call(this, gridRenderedBlock, e) }
		const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridRendered) { kontrolcu.gridRendered(e) }
		// this.gridWidget.table.jqxSortable({ theme: theme, items: `> div` })
	}
	gridContextMenuIstendi(e) {
		e = e || {}; const evt = e.event, {gridContextMenuIstendiBlock} = this;
		if (gridContextMenuIstendiBlock) { const result = getFuncValue.call(this, gridContextMenuIstendiBlock, e); if (result === false) { return } }
		const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridContextMenuIstendi) { const result = kontrolcu.gridContextMenuIstendi(e); if (result === false) { return } }
		this.gridContextMenuIstendi_defaultAction(e)
	}
	gridContextMenuIstendi_defaultAction(e) {
		e = e || {}; if (isTouchDevice()) return; const evt = e.event;
		const fbd_islemTuslari = new FormBuilder({
			id: 'islemTuslari',
			buildEk: e => {
				const {builder} = e, {rootPart, parentBuilder} = builder, {layout} = parentBuilder; layout.addClass('basic-hidden');
				const header = $(`<div class="grid-toolbar"/>`).appendTo(layout); const islemTuslari = $(`<div id="grid-islemTuslari"/>`).appendTo(header);
				const _e = {
					sender: rootPart, layout: islemTuslari, builder,
					ekButonlarIlk: [
						/*{ id: 'html', handler: _e => this.gridExport_html($.extend({}, e, _e)) },*/
						{ id: 'yazdir', handler: _e => this.gridYazdir({ ...e, ..._e }) },
						{ id: 'excel', handler: _e => this.gridExport_excel({ ...e, ..._e }) }
					]
				};
				const islemTuslariPart = rootPart.islemTuslariPart = new ButonlarPart(_e); islemTuslariPart.run()
			},
			styles: [
				e => `$elementCSS, $elementCSS .wnd-content { width: var(--full) !important; height: var(--full) !important; margin: 0 !important; padding: 0 !important; padding-inline-end: 0 !important; background-color: transparent }`,
				e => `$elementCSS .grid-toolbar { width: var(--full) !important; margin: 0 !important; padding: 0 !important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari { text-align: center; height: var(--full) important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari > .sol { width: var(--full) important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari button { width: 60px; margin: 0 1px }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari button#html.jqx-fill-state-normal,
						$elementCSS .grid-toolbar #grid-islemTuslari button#yazdir.jqx-fill-state-normal { background-color: #c1c8dd !important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari button.jqx-fill-state-hover { background-color: cadetblue !important }
					  $elementCSS .grid-toolbar #grid-islemTuslari button.jqx-fill-state-pressed { background-color: royalblue !important }`
			]
		}).addStyle_fullWH();
		const rfb = new RootFormBuilder({
			parentPart: this, inst: e => e.builder.parentPart.inst, formDeferMS: 0, noFullHeight: true,
			afterRun: e => {
				setTimeout(() => {
					const {part} = e, {layout} = part;
					const wnd = part.wnd = createJQXWindow({
						content: rfb.layout, title: null,
						args: {
							isModal: false, showCollapseButton: false, closeButtonAction: 'close', /* width: 200, */ width: 134, height: 45, minWidth: 1, minHeight: 1,
							position: { left: Math.min(mousePos.x, $(window).width() - 200), top: Math.min(mousePos.y, $(window).height() - 100) }
						}
					});
					layout.addClass('basic-hidden'); wnd.addClass('grid-contextmenu-export grid-contextmenu basic-hidden');
					wnd.find('.buttons').remove(); wnd.css('border-radius', '10px'); wnd.css('box-shadow', '2px 2px 30px #555555cc');
					const wndContent = wnd.find('.content');
					for (const elm of [wndContent, wndContent.children('.subContent')]) { elm.css('height', 'var(--full)', true); elm.css('width', 'var(--full)', true) }
					setTimeout(() => {
						const blurHandler = evt => { if (part._timer_close) { clearTimeout(part._timer_close) } part._timer_close = setTimeout(() => wnd.jqxWindow('close'), 10) }; wnd.on('blur', blurHandler);
						wnd.on('close', evt => { if (part && !part.isDestroyed) { part.destroyPart() } if (wnd?.length) { wnd.jqxWindow('destroy'); wnd.remove() } });
						const allElms = layout.find('*'); allElms.on('blur', blurHandler); allElms.on('focus', evt => { if (part._timer_close) { clearTimeout(part._timer_close); delete part._timer_close } })
					}, 1)
					setTimeout(() => {
						wnd.css('z-index', 10000); layout.removeClass('jqx-hidden basic-hidden'); wnd.removeClass('jqx-hidden basic-hidden');
						const {builder} = e; builder.builders[0].id2Builder.islemTuslari.layout.removeClass('jqx-hidden basic-hidden');
						wnd.focus(); const btn = part.islemTuslariPart.layout.find('button').eq(0); if (btn.length) { btn.focus() }
					}, 10)
				}, 10)
			}
		});
		rfb.addStyle_fullWH().add(new FBuilderWithInitLayout().altAlta()
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { /* background-color: #555; */ text-align: center; padding-top: 3px; overflow-y: hidden !important; }`)
			.add(fbd_islemTuslari).addStyle_fullWH()
		); rfb.run()
	}
	gridExport_excel(e) {
		e = e || {}; const {gridWidget} = this; let _data = gridWidget.exportdata('html');
		let data = ''; for (const ch of _data) { data += tr2En[ch] || ch }
		downloadData(new Blob([data]), 'Grid.xls', 'application/vnd.ms-excel')
		/*e = e || {}; const {gridWidget} = this; let _data = gridWidget.exportdata('tsv'); if (!_data) { return _data }*/
		const {rootPart} = e, _wnd = rootPart?.wnd; if (_wnd?.length) { _wnd.jqxWindow('close') }
	}
	gridExport_html(e) {
		e = e || {}; const {gridWidget} = this, data = gridWidget.exportdata('html');
		const {rootPart} = e, _wnd = rootPart?.wnd; if (_wnd?.length) { _wnd.jqxWindow('close') }
		const wnd = openNewWindow(); if (!wnd) { return } const doc = wnd.document;
		doc.writeln(`<html><head><title>Grid Çıktısı</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=yes">`);
		const preReqList = [
			`<link rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jquery-ui.min.css" />`,
			`<link class="theme-base" rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jqx.base.min.css" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/cssClasses.css?${appVersion}" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/colors.css?${appVersion}" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/appBase.css?${appVersion}" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/appLayout.css?${appVersion}" />`,
			`<link rel="stylesheet" href="./app.css?${appVersion}" />`
		];
		doc.writeln(`<style>@media only screen { body { overflow-y: auto !important } } button, input { visibility: hidden }</style>`);
		for (const item of preReqList) { doc.writeln(item) } doc.writeln(`</head><body>${data}</body></html>`)
	}
	gridYazdir(e) {
		e = e || {}; const {gridWidget} = this, data = gridWidget.exportdata('html');
		const {rootPart} = e, _wnd = rootPart?.wnd; if (_wnd?.length) { _wnd.jqxWindow('close') } const wnd = openNewWindow(); if (!wnd) { return }
		const doc = wnd.document; doc.writeln(`<html><head><title>Grid Çıktısı</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=yes">`);
		const preReqList = [
			`<link rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jquery-ui.min.css" />`,
			`<link class="theme-base" rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jqx.base.min.css" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/cssClasses.css?${appVersion}" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/colors.css?${appVersion}" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/appBase.css?${appVersion}" />`,
			`<link rel="stylesheet" href="${webRoot}/lib/appBase/appLayout.css?${appVersion}" />`,
			`<link rel="stylesheet" href="./app.css?${appVersion}" />`
		];
		doc.writeln(`<style>@media only screen { body { overflow-y: auto !important } } button, input { visibility: hidden }</style>`);
		for (const item of preReqList) { doc.writeln(item) }
		doc.write(
			`<script>
			function loaded() {
				document.body.offsetHeight;
				window.addEventListener('beforeprint', evt => clearTimeout(this.timer_printDialogWait)); window.addEventListener('afterprint', evt => window.close());
				setTimeout(() => { this.timer_printDialogWait = setTimeout(() => alert("Yazdırma ekranı için lütfen TAMAM butonuna ve sonra CTRL+P tuşlarına basınız"), 2000); window.print() }, 1000)
			}
			</script>`);
		doc.writeln(`</head><body>${data}<script>loaded()</script></body></html>`);
	}
	gridSortIstendi(e) { const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridSortIstendi) kontrolcu.gridSortIstendi(e) }
	gridRowExpanded(e) { const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridRowExpanded) kontrolcu.gridRowExpanded(e) }
	gridRowCollapsed(e) { const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridRowCollapsed) kontrolcu.gridRowCollapsed(e) }
	gridGroupExpanded(e) {
		const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridGroupExpanded) { kontrolcu.gridGroupExpanded(e) }
		const type = 'groupExpanded', {event} = e, gridPart = this, {inst, builder} = gridPart, mfSinif = gridPart.mfSinif ?? inst?.class; clearTimeout(this._timer_rendered);
		this._timer_rendered = setTimeout(() => this.gridRendered({ type, builder, event, gridPart, mfSinif, inst, kontrolcu }), gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? 300);
	}
	gridGroupCollapsed(e) { const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridGroupCollapsed) { kontrolcu.gridGroupCollapsed(e) } }
	gridSatirEklendi(e) { this.gridSatirSayisiDegisti(e); const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridSatirEklendi) kontrolcu.gridSatirEklendi(e) }
	gridSatirGuncellendi(e) { const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridSatirEklendi) { kontrolcu.gridSatirGuncellendi(e) } }
	gridSatirSilindi(e) { this.gridSatirSayisiDegisti(e); const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridSatirSilindi) { kontrolcu.gridSatirSilindi(e) } }
	gridSatirSayisiDegisti(e) { const kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridSatirSayisiDegisti) { kontrolcu.gridSatirSayisiDegisti(e) } }
	gridSatirTiklandi(e) {
		e = e || {}; const {gridWidget, isClickedColumn_checkBox, isClickedColumn_rowNumber} = this, {type} = e, evt = e.event || {}, {args} = evt, belirtec = args.datafield ?? this.clickedColumn;
		let rowIndex = args.rowindex; if (rowIndex == null || rowIndex < 0) { rowIndex = gridWidget.selectedrowindex }
		if (type == 'row') {
			if (isClickedColumn_rowNumber && this.isSelectionMode_cells) {
				gridWidget.beginupdate(); gridWidget.selectionmode = 'multiplerowsextended';
				gridWidget.clearselection(); gridWidget.selectrow(rowIndex); gridWidget.endupdate(true); this.selectionModeChangedFlag = true
			}
			else {
				if (!isClickedColumn_rowNumber && this.selectionModeChangedFlag) {
					gridWidget.selectionmode = this.orjSelectionMode; delete this.selectionModeChangedFlag;
					gridWidget.clearselection(); if (this.isSelectionMode_cells) { gridWidget.selectcell(rowIndex, belirtec) } else gridWidget.selectrow(rowIndex)
				}
				if (this.isSelectionMode_checkBox) {
					if (!args.rightclick) { setTimeout(() => {
						if (this.disableClickEventsFlag) { return }
						if (rowIndex != null && rowIndex > -1) { if (!isClickedColumn_checkBox) { gridWidget.clearselection() } gridWidget.selectrow(rowIndex) }
					}, 50) }
				}
			}
		}
		const gridPart = this, {inst} = gridPart, mfSinif = gridPart.mfSinif ?? inst?.class; clearTimeout(this._timer_rendered);
		const colDef = gridPart.belirtec2Kolon[belirtec], rec = gridWidget.getrowdata(rowIndex), delayMS = (gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? MQCogul.defaultOrjBaslik_gridRenderDelayMS) / 2;
		this._timer_rendered = setTimeout(() => gridPart.gridRendered({ type, gridPart, mfSinif, inst, colDef, rec, rowIndex, belirtec }), delayMS);
		const {gridSatirTiklandiBlock} = this; if (gridSatirTiklandiBlock) { const result = getFuncValue.call(this, gridSatirTiklandiBlock, e); if (result === false) return }
		const kontrolcu = this.getKontrolcu(e); return kontrolcu?.gridSatirTiklandi ? (kontrolcu.gridSatirTiklandi(e) ?? true) : true
	}
	gridSatirCiftTiklandi(e) {
		const {gridWidget, isClickedColumn_checkBox, gridSatirCiftTiklandiBlock} = this;
		if (isClickedColumn_checkBox) {
			const selRows = gridWidget?.selectedrowindexes; setTimeout(selRows => {
				if (gridWidget && gridWidget.selectedrowindexes != selRows) { gridWidget.beginupdate(); gridWidget.selectedrowindexes = selRows; gridWidget.endupdate(true) }
			}, 10, selRows); return false
		}
		if (gridSatirCiftTiklandiBlock) { const result = getFuncValue.call(this, gridSatirCiftTiklandiBlock, e); if (result === false) return }
		const kontrolcu = this.getKontrolcu(e); return kontrolcu?.gridSatirCiftTiklandi ? (kontrolcu.gridSatirCiftTiklandi(e) ?? true) : true
	}
	gridHucreTiklandi(e) {
		e = e || {}; const {gridWidget} = this, {type} = e, evt = e.event || {}, {args} = evt, belirtec = args.datafield ?? this.clickedColumn;
		let rowIndex = args.rowindex; if (rowIndex == null || rowIndex < 0) { rowIndex = gridWidget.selectedrowindex }
		const gridPart = this, {inst} = gridPart, mfSinif = gridPart.mfSinif ?? inst?.class; clearTimeout(this._timer_rendered);
		const colDef = gridPart.belirtec2Kolon[belirtec], rec = gridWidget.getrowdata(rowIndex), delayMS = (gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? MQCogul.defaultOrjBaslik_gridRenderDelayMS) / 2;
		this._timer_rendered = setTimeout(() => gridPart.gridRendered({ type, gridPart, mfSinif, inst, colDef, rec, rowIndex, belirtec }), delayMS);
		const {gridHucreTiklandiBlock} = this; if (gridHucreTiklandiBlock) { const result = getFuncValue.call(this, gridHucreTiklandiBlock, e); if (result === false) return }
		const kontrolcu = this.getKontrolcu(e); return kontrolcu?.gridHucreTiklandi ? (kontrolcu.gridHucreTiklandi(e) ?? true) : true
	}
	gridHucreCiftTiklandi(e) {
		const {gridWidget, isClickedColumn_checkBox, gridHucreCiftTiklandiBlock} = this; if (!gridWidget) { return }
		if (isClickedColumn_checkBox) {
			const selRows = gridWidget?.selectedrowindexes; setTimeout(selRows => {
				if (gridWidget && gridWidget.selectedrowindexes != selRows) { gridWidget.beginupdate(); gridWidget.selectedrowindexes = selRows; gridWidget.endupdate(true) }
			}, 10, selRows); return false
		}
		if (gridHucreCiftTiklandiBlock) { const result = getFuncValue.call(this, gridSatirCiftTiklandiBlock, e); if (result === false) return }
		const kontrolcu = this.getKontrolcu(e); return kontrolcu?.gridHucreCiftTiklandi ? (kontrolcu.gridHucreCiftTiklandi(e) ?? true) : true
	}
	async kolonFiltreIstendi(e) {
		e = e || {}; const promise = new $.Deferred(), {kolonFiltreDuzenleyici} = this; if (!kolonFiltreDuzenleyici) { return false }
		if (!(kolonFiltreDuzenleyici.hasOwnProperty('attrKAListe') || (kolonFiltreDuzenleyici.__proto__ || {}).hasOwnProperty('attrKAListe'))) {
			const {gridWidget, duzKolonTanimlari} = this;
			kolonFiltreDuzenleyici.attrKAListe = e => {
				const result = [];
				for (const colDef of duzKolonTanimlari) {
					const {belirtec, text} = colDef; if (!text || text == ' ') { continue }
					const tip = colDef.tip ?? new GridKolonTip_String(), {anaTip, kaListe, jqxFilterAnaTip} = tip;
					result.push(new CKodAdiVeEkBilgi({ kod: belirtec, aciklama: text || belirtec, ekBilgi: { tip: anaTip, jqxFilterAnaTip: jqxFilterAnaTip, kaListe: kaListe } }))
				}
				return result
			}
		}
		const kolonFiltrePart = new GridliKolonFiltrePart({
			sender: this, parentPart: this.parentPart, duzenleyici: kolonFiltreDuzenleyici,
			tamamIslemi: e => { if (promise) promise.resolve(e) }, kapaninca: e => { if (promise) promise.reject(e) }
		}); kolonFiltrePart.run();
		const result = await promise, filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi || {};
		filtreBilgi.degistimi = true; filtreBilgi.recs = result.recs; this.kolonFiltreDegisti(e)
	}
	kolonFiltreTemizleIstendi(e) {
		const {kolonFiltreDuzenleyici} = this, filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi || {};
		filtreBilgi.degistimi = true; filtreBilgi.recs = []; this.kolonFiltreDegisti(e)
	}
	kolonFiltreDegisti(e) {
		e = e || {}; const {divKolonFiltreBilgi, kolonFiltreDuzenleyici, gridWidget} = this, filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi;
		const filtreBilgi_recs = filtreBilgi?.recs || [];
		if (divKolonFiltreBilgi?.length) {
			let {filtreText} = e; if (filtreText == null) filtreText = GridliKolonFiltrePart.getFiltreText(filtreBilgi_recs)
			divKolonFiltreBilgi.html(filtreText); divKolonFiltreBilgi.parent()[filtreBilgi_recs.length ? 'removeClass' : 'addClass']('jqx-hidden')
		}
		const filterGroups = [], attr2FiltreRecs = {}, attr2FilterGroup = {};
		for (const rec of filtreBilgi_recs) { const {attr} = rec; (attr2FiltreRecs[attr] = attr2FiltreRecs[attr] || []).push(rec) }
		const Filter_AND = 0, Filter_OR = 1;
		for (const attr in attr2FiltreRecs) {
			const filterGroup = new $.jqx.filter();
			const _recs = attr2FiltreRecs[attr]; if ($.isEmptyObject(_recs)) continue
			for (const rec of _recs) {
				const jqxFilterAnaTip = rec.jqxFilterAnaTip || 'stringfilter', {operator, value} = rec;
				filterGroup.addfilter(Filter_OR, filterGroup.createfilter(jqxFilterAnaTip, value, operator))
			}
			attr2FilterGroup[attr] = filterGroup
		}
		try {
			if (!($.isEmptyObject(attr2FilterGroup) && $.isEmptyObject(gridWidget.getfilterinformation()))) {
				setTimeout(() => {
					const {gridWidget} = this; if (!gridWidget.isbindingcompleted()) { return }
					try { gridWidget.clearfilters(false) } catch (ex) { return }
					for (const attr in attr2FilterGroup) { const filterGroup = attr2FilterGroup[attr]; gridWidget.addfilter(attr, filterGroup) }
					try { gridWidget.applyfilters() } catch (ex) { console.error(ex) }
				}, 200)
			}
		}
		catch (ex) { }
		filtreBilgi_recs.degistimi = false
	}
	onResize(e) {
		super.onResize(e); clearTimeout(this._timer_gridResize); delete this._timer_gridResize;
		this._timer_gridResize = setTimeout(() => {
			try { const {grid} = this, {activeWndPart} = app; if (grid?.length && activeWndPart == this) { grid?.trigger('resize') } }
			catch (ex) { } finally { delete this._timer_gridResize }
		}, 1000)
	}
}


/*
theme: theme, localization: localizationObj, autoshowloadelement: false,
width: '100%', altrows: true, autoheight: true, autorowheight: false,
rowsheight: 50, toolbarheight: 58, filterrowheight: 35, columnsheight: 30, pagerheight: 40, statusbarheight: 45,
selectionmode: 'multiplecellsextended', editable: true, editmode: 'click',
sortable: true, filterable: true, pageable: true, columnsresize: true,
showstatusbar: true, showaggregates: true, showtoolbar: true, showfilterrow: false,
filtermode: 'excel', filtermode: 'simple',
pagermode: 'advanced', pagesizeoptions: [5, 10, 13, 15, 20, 25, 50, 80, 100],
pagerbuttonscount: 15, pagesize: 10, pagerposition: 'top',
*/






/*
	onGridRendered(e) {
	}

	onGridRowClick(e) {
		e = e || {};
		const {gridWidget} = this.gridPart;
		const {table} = gridWidget;
		const divRows = table.children(`div[role=row]`);
		let tumIslemTuslari = divRows.find(`.db.jqx-grid-cell .islemTuslari`);
		if (tumIslemTuslari.length)
			tumIslemTuslari.addClass('basic-hidden')
		// const recs = gridWidget.getvisiblerows();
		const recs = gridWidget.getselectedcells().map(cell => gridWidget.getrowdata(gridWidget.getrowdisplayindex(cell.rowindex)));
		for (const rec of recs) {
			const boundIndex = rec.boundindex;
			const divRow = divRows.eq(rec.visibleindex);
			
			let divCell = divRow.find(`.db.jqx-grid-cell`);
			let islemTuslari = divCell.find('.islemTuslari');
			let btn = islemTuslari.find('button#vtSec');
			if (btn.length) {
				btn.jqxButton({ theme: theme, width: false, height: false });
				btn.off('click');
				btn.on('click', evt => {
					// const rowIndex = gridWidget.getrowboundindex($(evt.currentTarget).parents('div[role=row]').index());
					const rowIndex = $(evt.currentTarget).parents('div[role=row]').index();
					const rec = gridWidget.getrowdata(rowIndex);
					this.vtSecIstendi($.extend({}, e, { event: evt, rowIndex: rowIndex, rec: rec }))
				})
			}
			islemTuslari.removeClass('jqx-hidden basic-hidden')
		}
	}

	gridCreateEditor(colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) {
		if (colDef.belirtec == 'db') {
			const {gridWidget} = this.gridPart;
			const boundIndex = gridWidget.getrowboundindex(rowIndex);
			const rec = gridWidget.getrowdata(boundIndex);
			editor.html(
				`<div class="editor" data-boundindex="${boundIndex}">` +
					`<div class="item float-left"><input id="server" class="veri" type="textbox" placeholder="SQL Ana Sistem" value="${rec.server || ''}"></div>` +
					`<div class="item float-left"><span class="etiket">-</span></div>` +
					`<div class="item float-left"><input id="db" class="veri" type="textbox" placeholder="Veritabanı" value="${rec.db || ''}"></div>` +
				`</div>`
			);
			const inputs = editor.find('.veri');
			inputs.on('focus', evt =>
				evt.currentTarget.select());
			inputs.on('change', evt => {
				const elm = evt.currentTarget;
				const dataField = elm.id;
				const rowIndex = $(elm).parents('.editor').data('boundindex');
				const rec = gridWidget.getrowdata(rowIndex);
				rec[dataField] = (elm.value || '').trim()
			})
		}
	}

	gridInitEditor(colDef, rowIndex, value, editor, cellText, pressedChar) {
		setTimeout(() => editor.find('.editor > .item > #db').focus(), 10)
	}

	gridGetEditorValue(colDef, rowIndex, value, editor) {
		setTimeout(() => { this.gridPart.gridWidget.updatebounddata() }, 100);
		return null
	}

	onCellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
	}

	onCellEndEdit(colDef, rowIndex, belirtec, cellType, oldValue, newValue) {	
		return true
	}
*/
