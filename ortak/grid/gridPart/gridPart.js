class GridPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'grid' } static get isGridPart() { return true } get isGridPart() { return this.class.isGridPart }
	static get wndClassNames() { return [this.partName, ...super.wndClassNames] } get gridFormSelector() { return '.grid-parent .grid' }
	get defaultLayoutSelector() { return this.class.isWindowPart ? super.defaultLayoutSelector : this.gridFormSelector }
	static get defaultAsyncFlag() { return true } static get defaultCacheFlag() { return true }
	get asyncFlag() { return this.async == null ? this.class.defaultAsyncFlag : this.async } get cacheFlag() { return this.cache == null ? this.class.defaultCacheFlag : this.cache }
	get gridRecOzelkeys() { return ['uid', 'uniqueid', 'visibleindex', 'boundindex'] } get defaultGridIDBelirtec() { return undefined }
	get defaultSabitFlag() { return null } get boundRecs() { let {gridWidget} = this; return gridWidget ? gridWidget.getboundrows() : null }
	get columns() { let {grid} = this; return grid?.length ? grid.jqxGrid('columns') : null }
	set columns(jqxCols) { let {grid} = this; if (jqxCols && grid?.length) { grid.jqxGrid('columns', jqxCols) } }
	get groups() { let {grid} = this; return grid?.length ? grid.jqxGrid('groups') : null }
	set groups(value) { let {grid} = this; if (grid?.length) { grid.jqxGrid('groups', value || null) } }
	get recs() { let {gridWidget} = this; return gridWidget ? gridWidget.getrows() : null }
	get dataView() { return this.gridWidget?.dataview }
	get totalRecs() { return this.dataView?.totalrecords ?? this.boundRecs?.length }
	get totalCols() { return this.gridWidget.columns.records.length }
	get selectedRowIndexes() {
		let {gridWidget} = this; if (!gridWidget) return []; let sel = gridWidget.getselection();
		let result = (empty(sel.rows) ? keys(asSet(sel.cells.map(cell => cell.rowindex))).map(x => asInteger(x)) : (sel.rows || []).filter(x => x != null));
		if (empty(result)) { let rowIndex = gridWidget._lastClickedCell?.row; if (rowIndex != null && rowIndex > -1) result = [rowIndex] }
		return result
	}
	get selectedRowIndex() {
		let {selectedRowIndexes, selectedCell: cell} = this;
		let result = cell?.rowindex ?? cell?.row ?? selectedRowIndexes?.[0];
		if (typeof result == 'number' && result < 0) { result = null }
		return result
	}
	get selectedRecs() { let {gridWidget, selectedRowIndexes} = this; return selectedRowIndexes ? selectedRowIndexes.map(i => gridWidget.getrowdata(i)).filter(rec => !!rec) : [] }
	get selectedRec() { let {selectedRecs} = this; return selectedRecs ? selectedRecs[0] : null }
	get selectedBelirtec() { return this.selectedCell?.datafield || this.gridWidget._clickedcolumn }
	get selectedBelirtecler() { let sel = this.gridWidget.getselection(); return asSet((sel?.cells || [])?.map(cell => cell.datafield) || []) }
	get selectedCell() {
		let {editCell, gridWidget} = this
		let result = editCell ?? gridWidget.selectedcell
		if (!result) {
			let {selectedrowindex: rowIndex, _clickedcolumn: belirtec} = gridWidget
			if (rowIndex != null && rowIndex > -1)
				result = { rowindex: rowIndex, row: rowIndex, datafield: belirtec }
		}
		return result
	}
	get selectedColIndex() { return this.gridWidget.getcolumnindex(this.selectedBelirtec) }
	get editCell() { return this.gridWidget.editcell }
	get editing() { return !!this.editCell?.datafield }
	get isEditable() { let {gridWidget} = this; return gridWidget ? gridWidget.editable : null }
	set isEditable(value) { let {gridWidget} = this; if (gridWidget) { gridWidget.editable = value } }
	get selectionMode() { let {gridWidget} = this; return gridWidget?.selectionmode }
	get clickedColumn() { let {gridWidget} = this; return gridWidget?._clickedcolumn }
	get mousePosition() { let {gridWidget} = this; return gridWidget?.mousecaptureposition }
	get isClickedColumn_checkBox() {
		let {isSelectionMode_checkBox, clickedColumn, mousePosition} = this
		if (!isSelectionMode_checkBox)
			return false
		return clickedColumn == '_checkboxcolumn' || (mousePosition?.clickedcell ?? 0) < 1
	}
	get isClickedColumn_rowNumber() {
		let {clickedColumn} = this
		return clickedColumn == '_rowNumber'
	}
	get isSelectionMode_checkBox() { let {selectionMode} = this; return (selectionMode && selectionMode.toLowerCase() == 'checkbox') }
	get isSelectionMode_rows() { let {selectionMode} = this; return (selectionMode && selectionMode.toLowerCase().includes('row')) }
	get isSelectionMode_cells() { let {selectionMode} = this; return (selectionMode && selectionMode.toLowerCase().includes('cell')) }
	get belirtec2OrjKolonState() {
		let result = this._belirtec2OrjKolonState; if (result == null) {
			let {grid, gridWidget} = this, gridCols = gridWidget.columns?.records ?? gridWidget.columns;
			result = {}; for (let jqxCol of gridCols) { let belirtec = jqxCol.datafield, {editable, hidden} = jqxCol, state = { belirtec, editable, hidden }; result[belirtec] = state }
			this._belirtec2OrjKolonState = result
		}
		return result
	}
	get kontrolcu() { return this._kontrolcu } set kontrolcu(value) { this._kontrolcu = value }
	getKontrolcu(e) { e = e || {}; let result = this.kontrolcu; if (isFunction(result)) { result = this.kontrolcu = getFuncValue.call(this, result, e) } return result }
	
	constructor(e = {}) {
		super(e)
		$.extend(this, {
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
			kolonFiltreDuzenleyici: e.kolonFiltreDuzenleyici ?? new GridKolonFiltreDuzenleyici(), sabitFlag: e.sabit ?? e.sabitmi ?? e.sabitFlag ?? this.defaultSabitFlag ?? false, detaySinif: e.detaySinif,
			_kontrolcu: e.kontrolcu, rowNumberOlmasinFlag: e.rowNumberOlmasin ?? e.rowNumberOlmasinFlag ?? (isMiniDevice() ? true : undefined),
			notAdaptiveFlag: e.notAdaptive ?? e.notAdaptiveFlag, noAnimateFlag: e.noAnimate ?? e.noAnimateFlag
		});
		let {kolonFiltreDuzenleyici} = this; if ($.isPlainObject(kolonFiltreDuzenleyici)) {
			kolonFiltreDuzenleyici = this.kolonFiltreDuzenleyici = new GridKolonFiltreDuzenleyici(kolonFiltreDuzenleyici) }
	}
	runDevam(e) {
		super.runDevam(e); let result = this.gridInit(e);
		if (this.isWindowPart) { let hasModalClass = this.hasModalClass = $('body').hasClass('bg-modal'); if (hasModalClass) { $('body').removeClass('bg-modal') } }
		return result
	}
	superRunDevam(e) { return super.runDevam(e) }
	destroyPart(e) {
		super.destroyPart(e); let {isWindowPart, hasModalClass, grid, gridWidget} = this; if (isWindowPart && hasModalClass) { $('body').addClass('bg-modal') }
		if (grid?.length && grid.parent()?.length) {
			try { grid.jqxGrid('destroy') } catch (ex) { }
			if (gridWidget) {
				let {menuitemsarray, filtermenu, filterpanel} = gridWidget;
				if (!empty(menuitemsarray)) { let elm = $(menuitemsarray[0]).parents('.jqx-menu-wrapper'); if (elm?.length) elm.remove() }
				if (filterpanel?.length) { let elm = filterpanel.parents('.jqx-menu-wrapper'); if (elm?.length) { elm.remove() } }
				if (filtermenu?.length) { let elm = filtermenu.parents('.jqx-menu-wrapper'); if (elm?.length) { elm.remove() } }
				let {filterbar, gridmenu, table, gridcontent, columnsheader} = gridWidget; for (let elm of [filterbar, gridmenu, table, gridcontent, columnsheader]) { if (elm?.length) { elm.remove() } }
			}
			grid.remove()
		}
		this.grid = this.gridWidget = null
	}
	gridInit(e = {}) {
		let grid = this.grid ?? this.layout
		if (grid.hasClass('wnd-content')) { grid = grid.find(this.gridFormSelector) }
		this.grid = grid
		let {builder, tabloKolonlari, argsDuzenleBlock, gridRenderedBlock, cacheFlag, asyncFlag, notAdaptiveFlag} = this
		let mini = isMiniDevice(), micro = isMicroDevice()
		let cache = cacheFlag, async = asyncFlag, _theme = theme;	/*let _theme = theme == 'metro' ? 'material' : theme;*/
		let args = {
			theme: _theme, localization: localizationObj, width: '99.9%', height: '99.6%', editMode: 'selectedcell', sortMode: 'many', autoHeight: false,
			autoShowLoadElement: true, altRows: true, enableTooltips: true,
			columnsMenuWidth: 60, columnsResize: true, columnsReorder: !mini, columnsMenu: true,
			autoRowHeight: false, rowsHeight: mini ? 60 : 50, columnsHeight: mini ? 25 : 30,
			autoShowColumnsMenuButton: true, sortable: true, /* compact: false, */ filterable: true,
			filterRowHeight: 40, filterMode: 'default', showFilterRow: false, groupable: true, columnsResize: true,
			showGroupsHeader: false, groupIndentWidth: 30, groupsHeaderHeight: 33, groupsExpandedByDefault: false,
			enableBrowserSelection: false, selectionMode: 'multiplecellsextended', pageable: false, pagermode: 'advanced', adaptive: undefined, virtualMode: false, updatedelay: 0,
			scrollbarsize: 13, scrollMode: 'logical',		/* default | logical | deferred */
			renderGridRows: e => { let recs = e.data?.records || e.data; return recs  /* return recs.slice(e.startindex, e.startindex + e.endindex) */ },
			groupColumnRenderer: text => `<div style="padding: 5px 10px; float: left;">${text}</div>`,
			groupsRenderer: (text, group, expanded, groupInfo) => `<div class="grid-cell-group">${group}</div>`,
			rendered: type => { return this.gridRendered({ sender: this, builder, type, gridPart: this, grid: this.grid, gridWidget: this.gridWidget }) },
			/*rendered: type => this.gridRendered({ sender: this, builder, type: e, grid, gridWidget }), */
			handleKeyboardNavigation: evt => {
				if (this.dragDropDisabledFlag_resetTimer) { clearTimeout(this.dragDropDisabledFlag_resetTimer); delete this.dragDropDisabledFlag_resetTimer }
				let {builder, grid, gridWidget} = this; this.dragDropDisabledFlag = true;
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
					cache, async,
					addrow: (rowIndex, rec, position, commit) => { commit(true) },
					updaterow: (rowIndex, rec, commit) => { rec._degisti = true; commit(true) },
					deleterow: (rowIndexes, commit) => { commit(true) },
					loadServerData: async (wsArgs, source, callback) => {
						let {gridWidget, grid} = this; if (!gridWidget && grid?.length) { gridWidget = this.gridWidget = grid.jqxGrid('getInstance') }
						let {_tazele_lastAction: action} = this
						let result = await this.loadServerData({ ...e, wsArgs, source, callback, action })
						if (result) {
							if ($.isArray(result)) { result = { totalrecords: result.length, records: result } } result = result ?? { totalrecords: 0, records: [] };
							if (typeof result == 'object' && result.records && !result.totalrecords) { result.totalrecords = result.records.length }
							if (typeof result != 'object') { return }
							if (result.records?.length) {
								let fields = source.datafields = [], ilkRec = result.records?.[0];
								if (ilkRec) {
									for (let name of Reflect.ownKeys(ilkRec)) {
										let value = ilkRec[name];
										let type = value == null || typeof value == 'object' ? 'string' : typeof value;
										fields.push({ name, type })
									}
								}
							}
							setTimeout(() => { try { callback(result) } catch (ex) { console.error(ex) } }, 1)
						}
					}
				})
		};
		let _e = { ...e, sender: this, builder, grid, args }
		this.gridArgsDuzenle(_e)
		this.gridArgsDuzenle_ek?.call(this, _e)
		args = _e.args; args.autoHeight = !args.height;
		if (args.autoRowHeight)
			args.autoRowHeight = args.pageable || args.autoHeight
		if (args.virtualMode && args.groupable && !args.pageable)
			args.groupable = false
		if (args.pageable && !args.pagesizeoptions)
			args.pageSizeOptions = [5, 7, 8, 9, 10, 11, 13, 14, 15, 18, 20, 25, 50, 80, 100, 200, 300, 500]
		args.pageSize = 100; args.enableOptimization = true
		if (args.adaptive == null)
			args.adaptive = !(notAdaptiveFlag || args.editable || mini)
		let firstCol = args.columns?.[0], secondCol = args.columns?.[1]
		if (firstCol && args.scrollMode == 'deferred' && empty(args.deferredDataFields)) {
			/* args.scrollMode = 'deferred'; */ let deferredDataFields = args.deferredDataFields = [firstCol.dataField || firstCol.datafield]
			if (secondCol)
				deferredDataFields.push(secondCol.dataField ?? secondCol.datafield)
		}
		{
			if (firstCol && !micro)
				firstCol.pinned = true
			if (!this.rowNumberOlmasinFlag && secondCol)
				secondCol.pinned = true
		}
		/*if (mini) {
			$.extend(args, {
				cardview: true, cardsize: 1, selectionmode: 'singlerow'
				cardviewcolumns: [
					{
						width: 'auto',
						datafield: firstCol?.dataField
					}
				]
			})
		}*/
		let initGridHeight = this.initGridHeight = args.height
		if (!initGridHeight)
			args.height = 1
		grid.data('part', this)
		grid.jqxGrid(args)
		let gridWidget = this.gridWidget = grid.jqxGrid('getInstance')
		gridWidget.gridPart = this
		this.orjSelectionMode = gridWidget.selectionmode /* setTimeout(() => this.onResize(), 0); */
		setTimeout(() =>
			grid.find(`span:contains("www.jqwidgets.com")`).addClass('basic-hidden'), 50)
		this.gridInitFlag = true
		grid.on('rowclick', evt => setTimeout(() => this.gridSatirTiklandi({ sender: this, builder, type: 'row', event: evt }), 10));
		grid.on('rowdoubleclick', evt => setTimeout(() => this.gridSatirCiftTiklandi({ sender: this, type: 'row', builder, event: evt }), 10));
		grid.on('cellclick', evt => setTimeout(() => this.gridHucreTiklandi({ sender: this, type: 'cell', builder, event: evt }), 10));
		grid.on('celldoubleclick', evt => setTimeout(() => this.gridHucreCiftTiklandi({ sender: this, type: 'cell', builder, event: evt }), 10));
		grid.on('bindingcomplete', event => this.gridVeriYuklendi({ ...e, sender: this, builder, event, grid, gridWidget, source: gridWidget.source }));
		grid.on('groupschanged', event => this.gridGroupsChanged({ ...e, sender: this, builder, event, grid, gridWidget, source: gridWidget.source }));
		grid.on('cellvaluechanged', evt => {
			let _e = {
				...e, sender: this, builder, event: evt, grid, gridWidget, belirtec: evt.args.datafield,
				action: 'cellValueChanged', rowIndex: evt.args.rowindex, newValue: evt.args.newvalue, oldValue: evt.args.oldvalue
			};
			setTimeout(() => this.gridVeriDegisti(_e), 10)
		});
		grid.on('contextmenu', evt => { setTimeout(() => this.gridContextMenuIstendi({ sender: this, builder: this.builder, event: evt }), 10); evt.preventDefault() });
		grid.on('sort', evt => { setTimeout(() => this.gridSortIstendi({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('rowexpand', evt => { setTimeout(() => this.gridRowExpanded({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('rowcollapse', evt => { setTimeout(() => this.gridRowCollapsed({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('groupexpand', evt => { setTimeout(() => this.gridGroupExpanded({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('groupcollapse', evt => { setTimeout(() => this.gridGroupCollapsed({ sender: this, builder: this.builder, event: evt }), 10) });
		grid.on('cellbeginedit', evt => this.gridCellBeginEdit({ sender: this, builder: this.builder, event: evt }));
		grid.on('cellendedit', evt => this.gridCellEndEdit({ sender: this, builder: this.builder, event: evt }));
		let {globalEventNames} = GridKolon;
		for (let key of globalEventNames) {
			grid.on(key.toLowerCase(), evt => {
				let evtArgs = evt.args, belirtec = evtArgs?.datafield, colDef = this.belirtec2Kolon[belirtec]; if (!colDef) return
				let func; let {builder, gridWidget} = this, inst = this.inst ?? this.fis ?? builder?.altInst, rowIndex = evtArgs.rowindex;
				let _e = {
					sender: this, gridWidget, builder, inst, event: evt, args: evtArgs, belirtec, rowIndex,
					value: evtArgs.value ?? evtArgs.newvalue, oldValue: evtArgs.oldvalue,
					get gridRec() { return gridWidget.getrowdata(rowIndex) },
					setCellValue(e) {
						let _rowIndex = e.rowIndex ?? rowIndex, _dataField = e.dataField || e.belirtec || belirtec;
						if (_dataField) gridWidget.setcellvalue(_rowIndex, _dataField, e.value)
					}
				};
				let {tip} = colDef;
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
		let {args} = e, {grid, ozelKolonDuzenleBlock, argsDuzenleBlock} = this
		let tabloKolonlari = e.tabloKolonlari = [...this.defaultTabloKolonlari]
		let {ekTabloKolonlari} = this
		if (ekTabloKolonlari)
			ekTabloKolonlari = getFuncValue.call(this, ekTabloKolonlari, e)
		if (ekTabloKolonlari) {
			let colAttrSet = asSet(tabloKolonlari.map(colDef => colDef.belirtec))
			for (let colDef of ekTabloKolonlari) {
				if (!colAttrSet[colDef.belirtec])
					tabloKolonlari.push(colDef)
			}
		}
		this.gridArgsDuzenleDevam(e)
		if (ozelKolonDuzenleBlock) {
			let result = getFuncValue.call(this, ozelKolonDuzenleBlock, e)
			if (result != null)
				e.tabloKolonlari = result
		}
		tabloKolonlari = this.tabloKolonlari = e.tabloKolonlari
		let belirtec2Kolon = this.belirtec2Kolon = e.belirtec2Kolon = {}
		let duzKolonTanimlari = this.duzKolonTanimlari = e.duzKolonTanimlari = []
		let jqxCols = []
		for (let colDef of tabloKolonlari) {
			colDef.gridPart = this
			jqxCols.push(...(colDef.jqxColumns || []))
			colDef.belirtec2KolonDuzenle(e)
		}
		args.columns = jqxCols
		if (argsDuzenleBlock)
			getFuncValue.call(this, argsDuzenleBlock, e)
	}
	gridArgsDuzenleDevam(e) {
		let kontrolcu = this.getKontrolcu(e)
		kontrolcu?.gridArgsDuzenle(e)
	}
	get defaultTabloKolonlari() {
		let liste = []
		if (!this.rowNumberOlmasinFlag) {
			liste.push(new GridKolon({
					belirtec: '_rowNumber', text: '#', width: 45, groupable: false, filterable: false, draggable: false, exportable: false,
					filterType: 'input', cellClassName: '_rowNumber grid-readOnly',
					cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
						if (rec && rowIndex != null) { rec._rowNumber = rowIndex + 1 }
						value = (rec?.boundIndex ?? rowIndex) + 1
						if (isNaN(value)) { return value = '' }
						html = changeTagContent(html, value.toString())
						return html
					}
			}).tipNumerik().noSql().readOnly().sabitle())
		}
		return liste
	}
	async loadServerData(e) {
		let {parentPart, builder, grid, gridWidget, loadServerDataBlock} = this, editCell = gridWidget?.editcell;
		e = e || {}; $.extend(e, { sender: this, gridPart: this, parentPart, builder }); let {wsArgs, source, action} = e;
		if (wsArgs && gridWidget) {
			if (gridWidget.pageable || gridWidget.virtualmode) {
				if (source) {
					let keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize'];
					for (let key of keys) { let value = source[key]; if (value != null) { wsArgs[key] = value } }
				}
			}
			else {
				let keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize'];
				for (let key of keys) { delete wsArgs[key] }
			}
		}
		(() => {
			let keys = ['recordstartindex', 'recordendindex', 'pagenum', 'pageindex', 'pagesize'];
			for (let key of keys) { let value = qs[key]; if (value != null) { wsArgs[key] = asInteger(value) } }
			let _value = qs.maxRow ?? qs.maxrow; if (_value != null) { wsArgs.pagesize = asInteger(_value) }
		})();
		try {
			let secimler = parentPart?.secimler; if (parentPart?.partName == 'secimler') { secimler = null}
			let _e = {
				...e,
				action, sender: this, builder, parentPart, gridPart: this, gridWidget, inst: parentPart?.inst, fis: parentPart?.inst, secimler,
				editCell, editor: editCell?.editor, rowIndex: editCell?.row ?? gridWidget?.selectedrowindex, dataField: editCell?.datafield,
				get gridRec() {
					let result = this._gridRec; if (result === undefined) { let {gridWidget, rowIndex} = this; result = this._gridRec = gridWidget?.getrowdata(rowIndex) }
					return result
				}
			}
			// deleteKeys(_e, 'stm', 'sent', 'uni')
			let result = e.result = loadServerDataBlock ? await getFuncValue.call(this, loadServerDataBlock, _e) : await this.defaultLoadServerData(_e)
			let recs = e.recs = result ? $.isArray(result) ? result : result.records : null;
			if ($.isArray(recs)) {
				(async () => {
					for (let i = 0; i < recs.length; i++) {
						let rec = recs[i]; if (rec == null) continue; rec._rowNumber = (i + 1);
						if (this.isDestroyed) { break }
					}
				})();
				let _recs = await this.loadServerData_recsDuzenle_ilk(e); recs = e.recs; if (_recs != null) { recs = _recs }
				_recs = await this.loadServerData_recsDuzenle(e); recs = e.recs; if (_recs != null) { recs = _recs }
				_recs = await this.loadServerData_recsDuzenle_son(e); recs = e.recs; if (_recs != null) { recs = _recs }
				result = e.recs = recs
			}
			if (result && !$.isArray(result)) { let _recs = result.records = (recs?.records ?? recs); if (result.totalrecords == null) { result.totalrecords = _recs?.length } }
			/*let t = recs[0]; recs[0] = recs[1]; recs[1] = t;*/
			this.kolonFiltreDuzenleyici?.degismedi(); return result
		}
		catch (ex) { let errorText = getErrorText(ex); displayMessage(`<div style="color: firebrick;">${errorText}</div>`, 'Grid Verisi Alınamadı'); /* console.error(ex); */ throw ex }
	}
	defaultLoadServerData(e) { return null }
	loadServerData_recsDuzenle_ilk(e) {
		let {filtreTokens} = this; let {recs} = e;
		if (filtreTokens?.length) { let _recs = this.loadServerData_recsDuzenle_hizliBulIslemi(e); recs = e.recs; if (_recs) { recs = e.recs = _recs } }
		{ let _recs = this.loadServerData_recsDuzenle_kolonFiltre(e); recs = e.recs; if (_recs) { recs = e.recs = _recs } }
		return recs
	}
	loadServerData_recsDuzenle(e) { }
	loadServerData_recsDuzenle_son(e) {
		let {recs} = e; if (!recs?.length) { return }
		for (let i = 0; i < recs.length; i++) { let rec = recs[i]; rec._rowNumber = i + 1 }
	}
	loadServerData_recsDuzenle_hizliBulIslemi(e) {
		let {recs} = e; if (!recs?.length) { return } let mfSinif = e.mfSinif = this.getMFSinif ? this.getMFSinif(e) : null;
		if (mfSinif?.orjBaslikListesi_recsDuzenle_hizliBulIslemi) { if (mfSinif.orjBaslikListesi_recsDuzenle_hizliBulIslemi(e) === false) { return } }
		let {filtreTokens} = this, attrListe = this._hizliBulFiltreAttrListe; if (!attrListe?.length) {
			attrListe = mfSinif?.orjBaslikListesi_getHizliBulFiltreAttrListe({ ...e, gridPart: this, filtreTokens });
			if (!attrListe?.length) {
				let {duzKolonTanimlari} = this; attrListe = [];
				for (let colDef of duzKolonTanimlari) {
					if (!(colDef.ekKolonmu || !colDef.text?.trim)) { attrListe.push(colDef.belirtec) } }
			}
			this._hizliBulFiltreAttrListe = attrListe
		}
		let orjRecs = recs; recs = []; for (let rec of orjRecs) {
			let uygunmu = true; let values = attrListe.map(key => typeof rec[key] == 'object' ? toJSONStr(rec[key]) : rec[key]?.toString()).filter(value => !!value);
			for (let token of filtreTokens) {
				let _uygunmu = false; for (let value of values) {
					if (value == null) { continue } value = value.toString();
					if (value.toUpperCase().includes(token.toUpperCase()) || value.toLocaleUpperCase(culture).includes(token.toLocaleUpperCase(culture))) { _uygunmu = true; break }
				} if (!_uygunmu) { uygunmu = false; break }
			} if (!uygunmu) { continue }
			recs.push(rec)
		}
		return recs
	}
	loadServerData_recsDuzenle_kolonFiltre(e) {
		let {recs} = e; if (!recs?.length) { return } let mfSinif = e.mfSinif = this.getMFSinif ? this.getMFSinif(e) : null;
		if (mfSinif?.loadServerData_recsDuzenle_kolonFiltre) { if (mfSinif.loadServerData_recsDuzenle_kolonFiltre(e) === false) { return } }
		let {kolonFiltreDuzenleyici} = this, filtreRecs = kolonFiltreDuzenleyici?.recs ?? {}; if (!filtreRecs?.length) { return }
		let orjRecs = recs; recs = []; for (let rec of orjRecs) {
			let uygunmu = true; for (let {attr, operator, value: _value} of filtreRecs) {
				let value = rec[attr]; if (value === undefined) { continue } if (typeof value == 'string') { value = value.toLocaleUpperCase() }
				_value = _value?.toString()?.toLocaleUpperCase(); switch (operator) {
					case 'CONTAINS': uygunmu = value?.includes?.(_value); break; case 'NOT_CONTAINS': uygunmu = !value?.includes?.(_value); break
					case 'EQUAL': uygunmu = value == _value; break; case 'NOT_EQUAL': uygunmu = value != _value; break
					case 'LESS_THAN_OR_EQUAL': uygunmu = value <= _value; break; case 'LESS_THAN': uygunmu = value < _value; break
					case 'GREATER_THAN_OR_EQUAL': uygunmu = value >= _value; break; case 'GREATER_THAN': uygunmu = value > _value; break
					case 'STARTS_WITH': uygunmu = value?.startsWith?.(_value); break; case 'ENDS_WITH': uygunmu = value?.endsWith?.(_value); break
					case 'EMPTY': uygunmu = !value; break; case 'NOT_EMPTY': uygunmu = !!value; break
				}
				if (!uygunmu) { break }
			}
			if (uygunmu) { recs.push(rec) }
		}
		return recs
	}
	gridHandleKeyboardNavigation(e) {
		let gridPart = this, {event} = e, {gridKeyState: state} = this;
		if (!state) { state = this.gridKeyState = new GridKeyState({ gridPart }) };
		let result = state.setEvent(event).run(e); if (result != null) {
			// if (result === false) { event.preventDefault() }
			return result
		}

		if (true) { return null }
		
		let evt = event, {timeStamp} = evt, {_lastEventTimeStamp_handleKeyboardNavigation} = this;
		if (_lastEventTimeStamp_handleKeyboardNavigation && _lastEventTimeStamp_handleKeyboardNavigation == timeStamp) { return }
		if (!this.isSubPart && app.activePart && app.activePart != this) { return }
		let activeElement = document.activeElement ? $(document.activeElement) : null;
		let gridHasFocus = activeElement.hasClass('jqx-grid') || !!activeElement.parents('.jqx-grid').length; if (!gridHasFocus) { return }
		let {builder, grid, gridWidget, belirtec2Kolon} = this; if (!(gridWidget && grid?.length)) return
		if (activeElement && (activeElement[0].tagName.toUpperCase() == 'TEXTAREA' || activeElement.hasClass('jqx-combobox-input'))) { return }
		_lastEventTimeStamp_handleKeyboardNavigation = this._lastEventTimeStamp_handleKeyboardNavigation = timeStamp;
		let eventType = evt.type?.toLowerCase(), {key} = evt;
		if (eventType == 'keydown') {
			switch (key?.toLowerCase()) { case 'enter': case 'linefeed': break }
		}
		let sender = this.sender || this, targetIsGrid = evt.target == grid, gridEditable = gridWidget.editable;
		let selectedCell = gridWidget.selectedcell;
		if (!selectedCell) { let _rowIndex = gridWidget.selectedrowindex; if (_rowIndex != null && _rowIndex > -1) selectedCell = { rowindex: _rowIndex, row: _rowIndex } }
		let editCell = gridWidget.editcell, _selectedCell = (selectedCell || {}); let rowIndex = _selectedCell.rowindex;
		let belirtec = _selectedCell.datafield, uid = rowIndex < 0 ? null : gridWidget.getrowid(rowIndex), selectedRec = rowIndex < 0 ? null : gridWidget.getrowdatabyid(uid);
		let colDef = belirtec ? belirtec2Kolon[belirtec] : null, jqxCol = belirtec ? gridWidget.getcolumn(belirtec) : null, colEditable = jqxCol?.editable;
		let modifiers = { ctrl: evt.ctrlKey, shift: evt.shiftKey, alt: evt.altKey }; let hasModifiers = modifiers.ctrl || modifiers.shift || modifiers.alt;
		let totalRecs = gridWidget.dataview.totalrecords; if (totalRecs == null) { totalRecs = gridWidget.getboundrows()?.length }
		if (rowIndex < 0) { rowIndex = 0 }
		let _e = {
			sender, builder, event, eventType, key, modifiers, hasModifiers, timeStamp, targetIsGrid,
			grid, gridWidget, rowIndex, belirtec, colDef, jqxCol, selectedCell, editCell, gridEditable, colEditable, result: undefined
		};
		if (colDef?.handleKeyboardNavigation) { let _result = getFuncValue.call(colDef, colDef.handleKeyboardNavigation, _e); if (_result !== undefined) { _e.result = _result } }
		let {tusaBasilincaBlock} = this; if (tusaBasilincaBlock) { let _result = getFuncValue.call(this, tusaBasilincaBlock, _e); if (_result !== undefined) { _e.result = _result } }
		if (colDef?.handleKeyboardNavigation_ortak) { let _result = getFuncValue.call(colDef, colDef.handleKeyboardNavigation_ortak, _e); if (_result !== undefined) { _e.result = _result } }
		if (_e.result == null) {
			if (eventType == 'keydown' && (rowIndex != null && rowIndex > -1)) {
				let keyLower = key?.toLowerCase() || '';
				if (gridEditable) {
					if (editCell) {
						if (keyLower == 'escape') { gridWidget.endcelledit(rowIndex, belirtec, false) }
					}
					else {
						let _isLetterOrDigit = key && isLetterOrDigit(key);
						if (!hasModifiers && colDef && colEditable && ( _isLetterOrDigit || (keyLower == 'enter' || keyLower == 'linefeed' || keyLower == 'space'))) {
							if (_isLetterOrDigit) {
								let handler = evt => {
									setTimeout(() => {
										let {editor} = gridWidget.editcell || {}; let input = editor && editor.length ? editor : null, inputWidget;
										if (input?.length) { let _input = input.children('input'); if (_input?.length) { input = _input } }
										if (input?.length) {
											let selectors = ['jqxComboBox', 'jqxDropDownList', 'jqxInput', 'jqxNumberInput'];
											for (let selector of selectors) { inputWidget = input[selector]('getInstance'); if (inputWidget) break }
											if (inputWidget && inputWidget.input) { input = inputWidget.input }
										}
										if (input?.length) {
											let promise = $.Deferred(p => {
												if (!inputWidget || inputWidget._ready === false) {
													let timerCheck, counter = 0;
													timerCheck = setInterval(() => {
														if (!inputWidget || inputWidget._ready) { clearInterval(timerCheck); setTimeout(() => p.resolve(true), 10); return }
														counter++; if (counter > 50) { clearTimeout(timerCheck); promise.resolve(false); return }
													}, 10)
												}
												else { setTimeout(() => p.resolve(true), 10) }
											});
											promise.then(readyFlag => {
												let value = input.val();
												/* if (editor.jqxComboBox('getInstance') ? !value : true) { */
												if (true) {
													/*value += key;*/ value = key;
													if (editor.jqxNumberInput('getInstance')) {
														editor.val(asFloat(value) || 0);
														setTimeout(() => input[0].selectionStart = -1, 10)
														/* setTimeout(() => inputWidget._setSelection(1, 1), 10) */
													}
													else {
														input.val(value); let tip = (input.attr('type') || '').toLowerCase();
														if (tip == 'textbox' || tip == 'text') setTimeout(() => input[0].selectionStart = -1, 10)
													}
												}
											});
										}
									}, 10); grid.off('cellbeginedit', handler)
								}; grid.on('cellbeginedit', handler)
							}
							gridWidget.begincelledit(rowIndex, belirtec); _e.result = true
						}
	
						else if (modifiers.ctrl && keyLower == ' ') {
							if (!editCell && gridEditable && colEditable && belirtec && rowIndex > 0) {
								let oldValue = gridWidget.getcellvalue(rowIndex, belirtec), newValue = gridWidget.getcellvalue(rowIndex - 1, belirtec);
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
									if (!empty(dataList)) {
										let colIndex = gridWidget.columns.records.findIndex(col => col.datafield == belirtec);
										let firstItem = dataList[0], colCount = $.isArray(firstItem) ? firstItem.length : typeof firstItem == 'object' ? keys(firstItem).length : 1;
										for (let colOffset = 0; colOffset < colCount; colOffset++) {
											for (let rowOffset = 0; rowOffset < dataList.length; rowOffset++) {
												let col = gridWidget.columns.records[colIndex]; if (!col) { debugger }
												let _rowIndex = rowIndex + rowOffset, _belirtec = colOffset ? col?.datafield : belirtec;
												let newValue = dataList[rowOffset]; if (typeof newValue == 'object') { newValue = [colOffset] }
												if (_rowIndex + 1 > gridWidget.getdatainformation().rowscount) { gridWidget.addrow(null, this.newRec(), _rowIndex) }
												gridWidget.setcellvalue(_rowIndex, _belirtec, newValue);
												if (colDef.cellValueChanged) {
													let oldValue = gridWidget.getcellvalue(_rowIndex, _belirtec); gridWidget.setcellvalue(_rowIndex, _belirtec, newValue);
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
							let _rec = this.newRec({ rec: selectedRec }); gridWidget.addrow(null, _rec, rowIndex); /*gridWidget.endupdate(true);*/
							this.gridSatirEklendi({ sender, builder, owner: gridWidget, rowIndex, uid: _rec.uid, rowCount: { yeni: totalRecs, eski: totalRecs - 1 } });
							_e.result = true
						}
							
						else if (keyLower == 'delete') {
							let _selection = gridWidget.getselection(); let selectedRowIndexes = _selection.rows;
							if (empty(selectedRowIndexes)) selectedRowIndexes = _selection.cells.map(cell => cell.rowindex);
							let selectedUids = empty(selectedRowIndexes) ? null : selectedRowIndexes.map(rowIndex => gridWidget.getrowid(rowIndex));
							if (modifiers.ctrl && !this.sabitFlag) {
								if (selectedUids) {
									gridWidget.deleterow(selectedUids);
									let targetRowIndex = Math.max(rowIndex + 1 >= totalRecs ? rowIndex - 1 : rowIndex, 0);
									gridWidget.clearselection();
									if (this.isSelectionMode_cells) { gridWidget.selectcell(targetRowIndex, belirtec) }
									else { gridWidget.selectrow(targetRowIndex) }
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
									let newValue = '';
									for (let _rowIndex of selectedRowIndexes) {
										let oldValue = gridWidget.getcellvalue(_rowIndex, belirtec); gridWidget.setcellvalue(_rowIndex, belirtec, '');
										if (colDef && colDef.cellValueChanged) {
											let {builder} = this, evt = e.event, inst = this.inst ?? this.fis ?? builder?.altInst;
											let evtArgs =  { sender, builder, owner: gridWidget, datafield: belirtec, rowindex: _rowIndex, oldvalue: oldValue, newvalue: newValue };
											let _e = {
												sender, gridWidget, builder, inst, event: evt, args: evtArgs, belirtec, rowIndex, value: newValue, oldValue,
												get gridRec() { return gridWidget.getrowdata(rowIndex) },
												setCellValue(e) {
													let _rowIndex = e.rowIndex ?? rowIndex, _dataField = e.dataField || e.belirtec || belirtec;
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
								let targetRowIndex = rowIndex + 1, _rec = this.newRec({ rec: selectedRec }); gridWidget.addrow(null, _rec, 'last');
								setTimeout(() =>
									this.gridSatirEklendi({ sender, builder, owner: gridWidget, rowIndex: targetRowIndex, uid: _rec.uid, rowCount: { yeni: totalRecs, eski: totalRecs - 1 } }), 10)
							}
							_e.result = false
						}
						else if (!hasModifiers && keyLower == 'f4' && gridEditable && colDef && (rowIndex != null && rowIndex > -1)) {
							let {listedenSec} = colDef;
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
		e = e || {}; let deferMS = (typeof e == 'object' ? e.deferMS : e) ?? 500; let timerKey = '_timer_tazeleDefer'; clearTimeout(this[timerKey]);
		this[timerKey] = setTimeout(() => { if (this.isDestroyed) { return } try { this.tazele(e) } finally { delete this[timerKey] } }, deferMS)
		return this
	}
	tazele(e) {
		e = e || {}; let {action} = e; if (action) { this._tazele_lastAction = action }
		this.expandedIndexes = {}; let {grid, gridWidget, noAnimateFlag} = this;
		if (gridWidget?.isbindingcompleted()) {
			if (!noAnimateFlag) {
				let animation = 'grid-open-slow'; grid.removeClass('grid-open grid-open-fast grid-open-slow'); grid.addClass(animation);
				clearTimeout(this.timer_animate); this.timer_animate = setTimeout(() => { grid.removeClass(animation); delete this.timer_animate }, 2000)
			}
			try { gridWidget.refresh() } catch (ex) { }
			try { return gridWidget.updatebounddata() } catch (ex) { setTimeout(() => gridWidget.updatebounddata(), 500); console.debug(ex); return this }
		}
		return this
	}
	updateColumns(e) {
		e = e || {}; let tabloKolonlari = (e.tabloKolonlari || e.liste || ($.isArray(e) ? e : null)) ?? this.duzKolonTanimlari;
		for (let key of ['_listeBasliklari', '_standartGorunumListesi', '_orjBaslikListesi', 'belirtec2Kolon', 'tabloKolonlari', 'duzKolonTanimlari']) { delete this[key] }
		let jqxCols = [], _e = $.extend({}, e, { belirtec2Kolon: {}, duzKolonTanimlari: [] });
		for (let colDef of tabloKolonlari || []) {
			let {belirtec} = colDef; if (!belirtec) continue; colDef.gridPart = this;
			jqxCols.push(...colDef.jqxColumns); colDef.belirtec2KolonDuzenle(_e)
		}
		$.extend(this, _e); /* let gridContent = this.grid; gridContent.addClass('fade-inout'); setTimeout(() => gridContent.removeClass('fade-inout'), 1000); */
		this.columns = jqxCols; return this
	}
	hizliBulIslemi(e = {}) {
		let {tokens} = e, {gridWidget, parentPart} = this
		this.filtreTokens = tokens
		e.gridPart = this
		clearTimeout(this._timer_hizliBulIslemi_ozel)
		this._timer_hizliBulIslemi_ozel = setTimeout(() => {
			try {
				let {bulPart = parentPart?.bulPart} = this, {input} = bulPart
				this.tazele({ action: 'hizliBul' })
				for (let delayMS of [400, 1000]) {
					setTimeout(() => {
						bulPart.focus();
						setTimeout(() =>
							input[0].selectionStart = input[0].selectionEnd = input[0].value?.length,
							205)
					}, delayMS)
				}
				setTimeout(() =>
					FiltreFormPart.hizliBulIslemi(e), 500)
			}
			finally { delete this._timer_hizliBulIslemi_ozel }
		}, 100)
	}
	showColumn(belirtec) { let {gridWidget} = this; gridWidget.showcolumn(belirtec); return this }
	hideColumn(belirtec) { let {gridWidget} = this; gridWidget.hidecolumn(belirtec); return this }
	focus(e) { this.gridWidget.focus(); return this }
	sabit() { this.sabitFlag = true; return this } sabitDegil() { this.sabitFlag = false; return this }
	rowNumberOlsun() { this.rowNumberOlmasinFlag = false; return this } rowNumberOlmasin() { this.rowNumberOlmasinFlag = true; return this }
	adaptive() { return this.notAdaptiveFlag = false; return this } notAdaptive() { return this.notAdaptiveFlag = true; return this }
	animate() { this.noAnimateFlag = false; return this } noAnimate() { this.noAnimateFlag = true; return this }
	async gridVeriYuklendi(e) {
		let {grid, gridWidget, bindingCompleteBlock, expandedIndexes} = this
		setTimeout(() => grid.find(`span:contains("www.jqwidgets.com")`).addClass('basic-hidden'), 50)
		if (empty(expandedIndexes))
			await this.kolonFiltreDegisti(e)
		if (bindingCompleteBlock)
			await getFuncValue.call(this, bindingCompleteBlock, e)
		let kontrolcu = this.getKontrolcu(e)
		await kontrolcu?.gridVeriYuklendi?.(e)
		this.gridGroupsChanged(e)
		if (empty(expandedIndexes)) {
			for (let delayMS of [100])
				setTimeout(() => this.onResize(), delayMS)
		}
	}
	gridVeriDegisti(e) {
		this.gridVeriDegistiBlock?.call(this, e); this.getKontrolcu(e)?.gridVeriDegisti?.(e);
		let gridWidget = e.event?.args.owner ?? this.gridWidget, {rowIndex, belirtec} = e;
		if (rowIndex != null && belirtec) {
			let cell = gridWidget.getselectedcell();
			let rec = gridWidget.getrowdata(cell?.rowindex);
			if (rec) { setTimeout(() => gridWidget.updaterow(rec.uid, rec), 0) }
		}
	}
	gridGroupsChanged(e) {
		let {gridGroupsChangedBlock} = this; if (gridGroupsChangedBlock) { let result = getFuncValue.call(this, gridGroupsChangedBlock, e); if (result === false) { return } }
		let kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridGroupsChanged) { let result = kontrolcu.gridGroupsChanged(e); if (result === false) { return } }
		let {gridWidget} = this, showGroupsHeaderFlag = gridWidget.showgroupsheader; if (showGroupsHeaderFlag) {
			let groups = gridWidget.groups ?? [], groupsSet = asSet(groups), belirtec2OrjKolonState = this.belirtec2OrjKolonState || {}, gridCols = gridWidget.columns?.records ?? gridWidget.columns;
			for (let jqxCol of gridCols) {
				let belirtec = jqxCol.datafield; if (!belirtec || belirtec == '_rowNumber' || belirtec == '_checkboxcolumn') { continue }
				let state = belirtec2OrjKolonState[belirtec] || {}, hasGroup = groupsSet[belirtec];
				/*if (hasGroup) { gridWidget.hidecolumn(belirtec) } else { gridWidget.showcolumn(belirtec) }*/
				if (hasGroup) { if (!jqxCol.hidden) { gridWidget.hidecolumn(belirtec) } } else { if (!state.hidden && jqxCol.hidden) { gridWidget.showcolumn(belirtec) } }
			}
		}
	}
	gridRendered(e) {
		let {gridRenderedBlock} = this; if (gridRenderedBlock) { getFuncValue.call(this, gridRenderedBlock, e) }
		let kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridRendered) { kontrolcu.gridRendered(e) }
		// this.gridWidget.table.jqxSortable({ theme: theme, items: `> div` })
	}
	gridContextMenuIstendi(e) {
		e = e || {}; let evt = e.event, {gridContextMenuIstendiBlock} = this;
		if (gridContextMenuIstendiBlock) { let result = getFuncValue.call(this, gridContextMenuIstendiBlock, e); if (result === false) { return } }
		let kontrolcu = this.getKontrolcu(e); if (kontrolcu?.gridContextMenuIstendi) { let result = kontrolcu.gridContextMenuIstendi(e); if (result === false) { return } }
		this.gridContextMenuIstendi_defaultAction(e)
	}
	gridContextMenuIstendi_defaultAction(e) {
		if (isTouchDevice())
			return
		let {event: evt} = e
		let fbd_islemTuslari = new FormBuilder({
			id: 'islemTuslari',
			buildEk: e => {
				let {builder} = e, {rootPart, parentBuilder} = builder, {layout} = parentBuilder; layout.addClass('basic-hidden');
				let header = $(`<div class="grid-toolbar"/>`).appendTo(layout); let islemTuslari = $(`<div id="grid-islemTuslari"/>`).appendTo(header);
				let _e = {
					sender: rootPart, layout: islemTuslari, builder,
					ekButonlarIlk: [
						/*{ id: 'html', handler: _e => this.gridExport_html($.extend({}, e, _e)) },*/
						{ id: 'yazdir', handler: _e => this.gridYazdir({ ...e, ..._e }) },
						{ id: 'excel', handler: _e => this.gridExport_excel({ ...e, ..._e }) }
					]
				};
				let islemTuslariPart = rootPart.islemTuslariPart = new ButonlarPart(_e); islemTuslariPart.run()
			},
			styles: [
				e => `$elementCSS, $elementCSS .wnd-content { width: var(--full) !important; height: var(--full) !important;
						margin: 0 !important; padding: 0 !important; padding-inline-end: 0 !important; background-color: transparent }`,
				e => `$elementCSS .grid-toolbar { width: var(--full) !important; margin: 0 !important; padding: 0 !important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari { text-align: center; height: var(--full) important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari > .sol { width: var(--full) important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari button { width: 75px; margin: 0 1px }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari button#html.jqx-fill-state-normal,
						$elementCSS .grid-toolbar #grid-islemTuslari button#yazdir.jqx-fill-state-normal { background-color: #c1c8dd !important }`,
				e => `$elementCSS .grid-toolbar #grid-islemTuslari button.jqx-fill-state-hover { background-color: cadetblue !important }
					  $elementCSS .grid-toolbar #grid-islemTuslari button.jqx-fill-state-pressed { background-color: royalblue !important }`
			]
		}).addStyle_fullWH();
		let rfb = new RootFormBuilder({
			parentPart: this, inst: e => e.builder.parentPart.inst,
			formDeferMS: 0, noFullHeight: true,
			afterRun: e => {
				setTimeout(() => {
					let {part} = e, {layout} = part;
					let wnd = part.wnd = createJQXWindow({
						content: rfb.layout, title: null,
						args: {
							isModal: false, showCollapseButton: false, closeButtonAction: 'close',
							/* width: 200, */ width: 200, height: 45, minWidth: 1, minHeight: 1,
							position: { left: Math.min(mousePos.x, $(window).width() - 200), top: Math.min(mousePos.y, $(window).height() - 100) }
						}
					});
					layout.addClass('basic-hidden'); wnd.addClass('grid-contextmenu-export grid-contextmenu basic-hidden');
					wnd.find('.buttons').remove(); wnd.css('border-radius', '10px'); wnd.css('box-shadow', '2px 2px 30px #555555cc');
					let wndContent = wnd.find('.content');
					for (let elm of [wndContent, wndContent.children('.subContent')]) { elm.css('height', 'var(--full)', true); elm.css('width', 'var(--full)', true) }
					setTimeout(() => {
						let blurHandler = evt => {
							if (part._timer_close) { clearTimeout(part._timer_close) }
							part._timer_close = setTimeout(() => wnd.jqxWindow('close'), 10)
						};
						wnd.on('blur', blurHandler);
						wnd.on('close', evt => {
							if (part && !part.isDestroyed) { part.destroyPart() }
							if (wnd?.length) { wnd.jqxWindow('destroy'); wnd.remove() }
						});
						let allElms = layout.find('*'); allElms.on('blur', blurHandler);
						allElms.on('focus', evt => { if (part._timer_close) { clearTimeout(part._timer_close); delete part._timer_close } })
					}, 1)
					setTimeout(() => {
						wnd.css('z-index', 10000); layout.removeClass('jqx-hidden basic-hidden'); wnd.removeClass('jqx-hidden basic-hidden');
						let {builder} = e; builder.builders[0].id2Builder.islemTuslari.layout.removeClass('jqx-hidden basic-hidden');
						wnd.focus(); let btn = part.islemTuslariPart.layout.find('button').eq(0); if (btn.length) { btn.focus() }
					}, 10)
				}, 10)
			}
		});
		rfb.addStyle_fullWH().add(new FBuilderWithInitLayout().altAlta()
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { /* background-color: #555; */ text-align: center; padding-top: 3px; overflow-y: hidden !important; }`)
			.add(fbd_islemTuslari).addStyle_fullWH()
		); rfb.run()
	}
	gridExport_excel(e = {}) {
		try { this.grid.jqxGrid('exportview', 'xlsx', 'jqxGrid') }
		catch (ex) {
			console.error(ex)
			let {gridWidget} = this, _data = gridWidget.exportdata('html');
			let data = ''; for (let ch of _data) { data += tr2En[ch] || ch }
			downloadData(new Blob([data]), 'Grid.xls', 'application/vnd.ms-excel')
			/*e = e || {}; let {gridWidget} = this; let _data = gridWidget.exportdata('tsv'); if (!_data) { return _data }*/
			let {rootPart} = e, _wnd = rootPart?.wnd; if (_wnd?.length) { _wnd.jqxWindow('close') }
		}
	}
	gridExport_html(e = {}) {
		try { this.grid.jqxGrid('exportview', 'html', 'jqxGrid') }
		catch (ex) {
			console.error(ex)
			let {gridWidget} = this, data = gridWidget.exportdata('html');
			let {rootPart} = e, _wnd = rootPart?.wnd; if (_wnd?.length) { _wnd.jqxWindow('close') }
			let wnd = openNewWindow(); if (!wnd) { return }
			let doc = wnd.document; doc.writeln(
				`<html><head><title>Grid Çıktısı</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=yes">`);
			let preReqList = [
				`<link rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jquery-ui.min.css" />`,
				`<link class="theme-base" rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jqx.base.min.css" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/cssClasses.css?${appVersion}" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/colors.css?${appVersion}" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/appBase.css?${appVersion}" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/appLayout.css?${appVersion}" />`,
				`<link rel="stylesheet" href="./app.css?${appVersion}" />`
			];
			doc.writeln(`<style>@media only screen { body { overflow-y: auto !important } } button, input { visibility: hidden }</style>`);
			for (let item of preReqList) { doc.writeln(item) } doc.writeln(`</head><body>${data}</body></html>`)
		}
	}
	gridYazdir(e = {}) {
		try { this.grid.jqxGrid('exportview', 'html', 'jqxGrid') }
		catch (ex) {
			console.error(ex)
			let {gridWidget} = this, data = gridWidget.exportdata('html');
			let {rootPart} = e, _wnd = rootPart?.wnd; if (_wnd?.length) { _wnd.jqxWindow('close') }
			let wnd = openNewWindow(); if (!wnd) { return }
			let doc = wnd.document; doc.writeln(
				`<html><head><title>Grid Çıktısı</title><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=yes">`);
			let preReqList = [
				`<link rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jquery-ui.min.css" />`,
				`<link class="theme-base" rel="stylesheet" href="${webRoot}/lib_external/jqx/css/jqx.base.min.css" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/cssClasses.css?${appVersion}" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/colors.css?${appVersion}" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/appBase.css?${appVersion}" />`,
				`<link rel="stylesheet" href="${webRoot}/lib/appBase/appLayout.css?${appVersion}" />`,
				`<link rel="stylesheet" href="./app.css?${appVersion}" />`
			];
			doc.writeln(`<style>@media only screen { body { overflow-y: auto !important } } button, input { visibility: hidden }</style>`);
			for (let item of preReqList) { doc.writeln(item) }
			doc.write(
				`<script>
				function loaded() {
					document.body.offsetHeight;
					window.addEventListener('beforeprint', evt => clearTimeout(this.timer_printDialogWait)); window.addEventListener('afterprint', evt => window.close());
					setTimeout(() => { this.timer_printDialogWait = setTimeout(() => alert("Yazdırma ekranı için lütfen TAMAM butonuna ve sonra CTRL+P tuşlarına basınız"), 2000); window.print() }, 1000)
				}
				</script>`);
			doc.writeln(`</head><body>${data}<script>loaded()</script></body></html>`)
		}
	}
	gridSortIstendi(e) { this.getKontrolcu(e)?.gridSortIstendi?.(e) }
	gridRowExpanded(e) { this.getKontrolcu(e)?.gridRowExpanded?.(e) }
	gridRowCollapsed(e) { this.getKontrolcu(e)?.gridRowCollapsed?.(e) }
	gridGroupExpanded(e) {
		let kontrolcu = this.getKontrolcu(e); kontrolcu?.gridGroupExpanded?.(e);
		let type = 'groupExpanded', {event} = e, gridPart = this, {inst, builder} = gridPart, mfSinif = gridPart.mfSinif ?? inst?.class;
		clearTimeout(this._timer_rendered);
		this._timer_rendered = setTimeout(() =>
			this.gridRendered({ type, builder, event, gridPart, mfSinif, inst, kontrolcu }),
			gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? 300)
	}
	gridGroupCollapsed(e) { this.getKontrolcu(e)?.gridGroupCollapsed?.(e) }
	gridCellBeginEdit(e) {
		let {gridKeyState: state, gridWidget} = this, result; try {
			result = this.getKontrolcu(e)?.gridCellBeginEdit?.(e) ?? true;
			if (result === false) { e.event?.preventDefault(); gridWidget.endcelledit() }
		}
		finally { state?.resetResult() }
		return result
	}
	gridCellEndEdit(e) {
		let {gridKeyState: state, gridWidget} = this, result; try {
			result = this.getKontrolcu(e)?.gridCellEndEdit?.(e) ?? true;
			if (result === false) { e.event?.preventDefault() }
		}
		finally { state?.resetResult() }
		return result
	}
	gridSatirEklendi(e) {
		this.gridSatirSayisiDegisti(e); this.getKontrolcu(e)?.gridSatirEklendi?.(e);
		return this.signalColumnEvents('satirEklendi', null, e)
	}
	gridSatirGuncellendi(e) {
		this.getKontrolcu(e)?.gridSatirGuncellendi?.(e);
		return this.signalColumnEvents('satirGuncellendi', null, e)
	}
	gridSatirSilinecek(e) {
		let result = this.getKontrolcu(e)?.gridSatirSilinecek?.(e);
		return this.signalColumnEvents('satirSilinecek', null, e) ?? result
	}
	gridSatirSilindi(e) {
		this.gridSatirSayisiDegisti(e); this.getKontrolcu(e)?.gridSatirSilindi?.(e);
		this.signalColumnEvents('satirSilindi', null, e)
	}
	gridSatirSayisiDegisti(e) {
		this.getKontrolcu(e)?.gridSatirSayisiDegisti?.(e);
		this.signalColumnEvents('satirSayisiDegisti', null, e)
	}
	gridSatirTiklandi(e = {}) {
		let {type, event: evt = {}, event: { args = {} } = {}} = e
		let {gridWidget, isClickedColumn_checkBox, isClickedColumn_rowNumber} = this
		let {rowindex: rowIndex} = args
		let belirtec = args.datafield ?? this.clickedColumn
		if (rowIndex == null || rowIndex < 0)
			rowIndex = gridWidget.selectedrowindex
		if (type == 'row') {
			if (isClickedColumn_rowNumber && this.isSelectionMode_cells) {
				gridWidget.beginupdate()
				gridWidget.selectionmode = 'multiplerowsextended'
				gridWidget.clearselection()
				gridWidget.selectrow(rowIndex)
				gridWidget.endupdate(true)
				this.selectionModeChangedFlag = true
			}
			else {
				if (!isClickedColumn_rowNumber && this.selectionModeChangedFlag) {
					gridWidget.selectionmode = this.orjSelectionMode
					delete this.selectionModeChangedFlag
					gridWidget.clearselection()
					if (this.isSelectionMode_cells)
						gridWidget.selectcell(rowIndex, belirtec)
					else
						gridWidget.selectrow(rowIndex)
				}
				if (this.isSelectionMode_checkBox) {
					if (!args.rightclick) {
						setTimeout(() => {
							if (this.disableClickEventsFlag)
								return
							if (rowIndex != null && rowIndex > -1) {
								if (!isClickedColumn_checkBox)
									gridWidget.clearselection()
								gridWidget.selectrow(rowIndex)
							}
						}, 50)
					}
				}
			}
		}
		let gridPart = this, {inst} = gridPart
		let mfSinif = gridPart.mfSinif ?? inst?.class
		clearTimeout(this._timer_rendered)
		let colDef = gridPart.belirtec2Kolon[belirtec], rec = gridWidget.getrowdata(rowIndex)
		let delayMS = (gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? MQCogul.defaultOrjBaslik_gridRenderDelayMS) / 2
		this._timer_rendered = setTimeout(() => gridPart.gridRendered({ type, gridPart, mfSinif, inst, colDef, rec, rowIndex, belirtec }), delayMS)
		if (this.gridSatirTiklandiBlock?.(e) === false)
			return false
		let result = this.getKontrolcu(e)?.gridSatirTiklandi?.(e)
		result = this.signalColumnEvents('gridSatirTiklandi', e, e) ?? result
		return result ?? true
	}
	gridSatirCiftTiklandi(e) {
		let {gridWidget, isClickedColumn_checkBox} = this;
		if (isClickedColumn_checkBox) {
			let selRows = gridWidget?.selectedrowindexes
			setTimeout(selRows => {
				if (gridWidget && gridWidget.selectedrowindexes == selRows)
					return
				gridWidget.beginupdate()
				gridWidget.selectedrowindexes = selRows
				gridWidget.endupdate(true)
			}, 10, selRows)
			return false
		}
		if (this.gridSatirCiftTiklandiBlock?.(e) === false)
			return false
		let result = this.getKontrolcu(e)?.gridSatirCiftTiklandi?.(e)
		result = this.signalColumnEvents('gridSatirCiftTiklandi', e, e) ?? result
		return result ?? true
	}
	gridHucreTiklandi(e) {
		e = e || {}; let {gridWidget} = this, {type} = e, evt = e.event || {}, {args} = evt, belirtec = args.datafield ?? this.clickedColumn;
		let rowIndex = args.rowindex; if (rowIndex == null || rowIndex < 0) { rowIndex = gridWidget.selectedrowindex }
		let gridPart = this, {inst} = gridPart, mfSinif = gridPart.mfSinif ?? inst?.class; clearTimeout(this._timer_rendered);
		let colDef = gridPart.belirtec2Kolon[belirtec], rec = gridWidget.getrowdata(rowIndex), delayMS = (gridPart.renderDelayMS ?? mfSinif?.orjBaslik_gridRenderDelayMS ?? MQCogul.defaultOrjBaslik_gridRenderDelayMS) / 2;
		this._timer_rendered = setTimeout(() => gridPart.gridRendered({ type, gridPart, mfSinif, inst, colDef, rec, rowIndex, belirtec }), delayMS);
		let {gridHucreTiklandiBlock} = this; if (gridHucreTiklandiBlock) { let result = getFuncValue.call(this, gridHucreTiklandiBlock, e); if (result === false) return }
		let kontrolcu = this.getKontrolcu(e); return kontrolcu?.gridHucreTiklandi ? (kontrolcu.gridHucreTiklandi(e) ?? true) : true
	}
	gridHucreCiftTiklandi(e) {
		let {gridWidget, isClickedColumn_checkBox, gridHucreCiftTiklandiBlock} = this; if (!gridWidget) { return }
		if (isClickedColumn_checkBox) {
			let selRows = gridWidget?.selectedrowindexes; setTimeout(selRows => {
				if (gridWidget && gridWidget.selectedrowindexes != selRows) { gridWidget.beginupdate(); gridWidget.selectedrowindexes = selRows; gridWidget.endupdate(true) }
			}, 10, selRows); return false
		}
		if (gridHucreCiftTiklandiBlock) { let result = getFuncValue.call(this, gridSatirCiftTiklandiBlock, e); if (result === false) return }
		let kontrolcu = this.getKontrolcu(e); return kontrolcu?.gridHucreCiftTiklandi ? (kontrolcu.gridHucreCiftTiklandi(e) ?? true) : true
	}
	async kolonFiltreIstendi(e) {
		e = e || {}; let {kolonFiltreDuzenleyici} = this; if (!kolonFiltreDuzenleyici) { return false }
		if (kolonFiltreDuzenleyici.attrKAListe === undefined) {
			let {gridWidget, duzKolonTanimlari} = this, attrKAListe = kolonFiltreDuzenleyici.attrKAListe = [];
			for (let colDef of duzKolonTanimlari) {
				let {belirtec: kod, text} = colDef; if (!text || text == ' ') { continue }
				let tip = colDef.tip ?? new GridKolonTip_String(), {anaTip, kaListe, jqxFilterAnaTip} = tip;
				attrKAListe.push(new CKodAdiVeEkBilgi({ kod, aciklama: text || kod, ekBilgi: { tip: anaTip, jqxFilterAnaTip, kaListe } }))
			}
		}
		let sender = this, {parentPart} = this, promise = new $.Deferred(), kolonFiltrePart = new GridliKolonFiltrePart({
			sender, parentPart, duzenleyici: kolonFiltreDuzenleyici, tamamIslemi: e => { if (promise) promise.resolve(e) }, kapaninca: e => promise?.reject(e) });
		kolonFiltrePart.run(); let result = await promise; kolonFiltreDuzenleyici.degisti().recs = result.recs; this.kolonFiltreDegisti(e)
	}
	kolonFiltreTemizleIstendi(e) { let {kolonFiltreDuzenleyici} = this; kolonFiltreDuzenleyici.degisti().recs = []; this.kolonFiltreDegisti(e) }
	kolonFiltreDegisti(e) {
		e = e || {}; let {divKolonFiltreBilgi, kolonFiltreDuzenleyici, gridWidget} = this;
		let recs = kolonFiltreDuzenleyici?.recs ?? []; if (divKolonFiltreBilgi?.length) {
			let filtreText = e.filtreText ?? GridliKolonFiltrePart.getFiltreText(recs);
			divKolonFiltreBilgi.html(filtreText); divKolonFiltreBilgi.parent()[recs.length ? 'removeClass' : 'addClass']('jqx-hidden')
		}
		if (kolonFiltreDuzenleyici.degistimi) { this.tazele({ action: 'kolonFiltre' }) }
		/*let attr2FiltreRecs = {}; for (let rec of filtreBilgi_recs) { let {attr} = rec; (attr2FiltreRecs[attr] = attr2FiltreRecs[attr] ?? []).push(rec) }
		let Filter_AND = 0, Filter_OR = 1, attr2FilterGroup = {}; for (let attr in attr2FiltreRecs) {
			let filterGroup = new $.jqx.filter(); let _recs = attr2FiltreRecs[attr]; if (empty(_recs)) { continue }
			for (let rec of _recs) {
				let jqxFilterAnaTip = rec.jqxFilterAnaTip || 'stringfilter', {operator, value} = rec;
				filterGroup.addfilter(Filter_OR, filterGroup.createfilter(jqxFilterAnaTip, value, operator))
			}
			attr2FilterGroup[attr] = filterGroup
		}
		try {
			if (!(empty(attr2FilterGroup) && empty(gridWidget.getfilterinformation()))) {
				setTimeout(() => {
					let {gridWidget} = this; if (!gridWidget.isbindingcompleted()) { return }
					try { gridWidget.clearfilters(false) } catch (ex) { return }
					for (let attr in attr2FilterGroup) { let filterGroup = attr2FilterGroup[attr]; gridWidget.addfilter(attr, filterGroup) }
					try { gridWidget.applyfilters() } catch (ex) { console.error(ex) }
				}, 200)
			}
		}
		catch (ex) { }
		filtreBilgi.degistimi = false*/
	}
	endCellEdit(e) {
		let commit = typeof e == 'object' ? e.commit : e, rollback = commit == null ? null : !commit;
		let {editing, editCell, grid, gridWidget} = this, {datafield: belirtec, row: rowIndex} = editCell ?? {};
		if (editing) {
			gridWidget.endcelledit(rowIndex, belirtec, rollback ?? false)
		}
		else {
			let {_last_beginEditHandler: beginEditHandler} = this; if (!beginEditHandler) {
				beginEditHandler = this._last_beginEditHandler = evt => {
					grid.off('cellbeginedit', beginEditHandler); delete this._last_beginEditHandler;
					let {editCell} = this, {datafield: belirtec, row: rowIndex} = editCell ?? {};
					setTimeout(() => gridWidget.endcelledit(rowIndex, belirtec, rollback ?? false), 0)
					
				};
				grid.on('cellbeginedit', beginEditHandler);
				setTimeout(() => { delete this._last_beginEditHandler; grid.off('cellbeginedit', beginEditHandler) }, 2)    /* önlem - event eklenmiş kalmasın */
			}
		}
		return this
	}
	selectEditableCell(e) {
		e = e ?? {}; let {prev, before} = e;
		if (!this.isSelectionMode_cells) { return this }
		let {gridWidget, selectedBelirtec: belirtec, selectedRowIndex: rowIndex, duzKolonTanimlari: colDefs} = this;
		colDefs = colDefs.filter(colDef => colDef.isEditable && gridWidget.iscolumnvisible(colDef.belirtec));
		if (!colDefs?.length) { return this }
		let colInd = colDefs.findIndex(colDef => colDef.belirtec == belirtec) ?? -1; if (colInd < 0) { return this }
		let {event: evt, modifiers} = e, ctrl = modifiers?.ctrl ?? evt?.isControlKeyDown;
		let selectCell = (rowIndex, belirtec) => {
			if (!belirtec) { return false }
			gridWidget.clearselection(); gridWidget.selectcell(rowIndex, belirtec);
			return true
		};
		if (!(!prev && ctrl) && (prev ? colInd : colInd + 1 < colDefs.length)) {
			/* kolon snırda DEĞİL, kolonlar arası geçiş */
			let {belirtec: newBelirtec} = colDefs[prev ? colInd - 1 : colInd + 1] ?? {};
			if (selectCell(rowIndex, newBelirtec)) { return this }
		}
		/* kolon sınırda veya sınır aşıldı, satırlar arası geçiş */
		let {totalRecs: count, sabitFlag} = this;
		let newRowIndex = prev ? rowIndex - 1 : rowIndex + 1; if (newRowIndex < 0) { return this }
		if ((!prev && ctrl) || newRowIndex >= count) {
			if (sabitFlag) { return this }
			this.addRow({ offset: before ? newRowIndex - 1 : newRowIndex })
		}
		let tersColInd = (prev ? colDefs.length - 1 : 0), {belirtec: tersColBelirtec} = colDefs[tersColInd];
		selectCell(newRowIndex, tersColBelirtec); return this
	}
	selectNextEditableCell(e) {
		e = typeof e == 'object' ? { ...e  } : {};
		e.prev = false; return this.selectEditableCell(e)
	}
	selectPrevEditableCell(e) {
		e = typeof e == 'object' ? { ...e  } : {};
		e.prev = true; return this.selectEditableCell(e)
	}
	addRow(e) {
		e = e ?? {}; let {gridWidget, builder, totalRecs} = this, sender = this, owner = gridWidget, {rec} = e;
		let rowIndex = (e.rowIndex ?? this.selectedRowIndex) + 1, offset = e.after ?? e.afterIndex ?? e.offset;
		let gridRec = this.newRec({ rec: e.rec }); gridWidget.addrow(null, gridRec, offset ?? 'last');
		let {uid} = gridRec, rowCount = { yeni: totalRecs, eski: totalRecs - 1 };
		setTimeout(() => this.gridSatirEklendi({ sender, builder, owner, rowIndex, uid, rowCount }), 5)
		return rec
	}
	deleteRow(e) {
		e = e ?? {}; let {gridWidget, builder, totalRecs, selectedRowIndexes, selectedBelirtec: belirtec} = this;
		let gridPart = this, sender = gridPart, owner = gridWidget, {uids, recs, rowIndexes} = e;
		rowIndexes = (rowIndexes ?? selectedRowIndexes)?.filter(x => x >= 0);
		recs = (recs ?? rowIndexes?.map(i => gridWidget.getrowdata(i))).filter(x => x != null);
		uids = (uids ?? recs?.map(rec => rec?.uid)).filter(x => x != null);
		if (!uids?.length) { return [] }
		let rowIndex = selectedRowIndexes[0] ?? 0, {length: deleteCount} = uids;
		let targetRowIndex = Math.max(rowIndex + 1 >= totalRecs ? rowIndex - 1 : rowIndex, 0);
		let _e = {
			...e, sender, owner, builder, gridPart, gridWidget, totalRecs, selectedRowIndexes, belirtec,
			deleteCount, targetRowIndex, uids, recs, rowIndexes, rowCount: { yeni: totalRecs - deleteCount, eski: totalRecs }
		};
		if (this.gridSatirSilinecek(_e) === false) { return [] }
		gridWidget.deleterow(uids); gridWidget.clearselection();
		if (this.isSelectionMode_cells) { gridWidget.selectcell(targetRowIndex, belirtec) }
		else { gridWidget.selectrow(targetRowIndex) }
		setTimeout(() => { this.gridSatirSilindi(_e) }, 10)
		return recs
	}
	newRec(e) {
		e = e || {}; let {gridWidget, grid} = this; if (!gridWidget && grid?.length) { gridWidget = this.gridWidget = grid.jqxGrid('getInstance') }
		let cls = e.sinif ?? this.detaySinif; if (!cls) { let recCount = gridWidget.getrecordscount(); cls = recCount ? gridWidget.getrowdata(recCount - 1)?.class : null }
		if (!cls) {
			let {rowIndex, uid, rec} = e;
			if (!rec) {
				if (rowIndex != null && rowIndex > -1) { rec = gridWidget.getrowdata(rowIndex) }
				else if (uid != null) { rec = gridWidget.getrowdatabyid(uid) }
			}
			if (rec) { cls = rec.class }
		}
		let {args} = e, result = cls ? new cls(args) : (args || {}); return result
	}
	signalColumnEvents(eventName, colNames, ...args) {
		let {gridWidget, belirtec2Kolon} = this;
		colNames = colNames
			? $.makeArray(colNames?.belirtec || (colNames?.datafield ?? colNames))
			: this.duzKolonTanimlari.filter(colDef => colDef.isEditable && gridWidget.iscolumnvisible(colDef.belirtec)).map(colDef => colDef.belirtec);
		if (!colNames?.length) { return null }
		let result; for (let belirtec of colNames) {
			result = (belirtec2Kolon[belirtec]?.[eventName]?.(...args)) ?? result }
		return result
	}
	onResize(e) {
		super.onResize(e); clearTimeout(this._timer_gridResize); delete this._timer_gridResize;
		this._timer_gridResize = setTimeout(() => {
			try { let {grid} = this, {activeWndPart} = app; if (grid?.length && activeWndPart == this) { grid?.trigger('resize') } }
			catch (ex) { } finally { delete this._timer_gridResize }
		}, 500)
	}
	veriYuklenince(handler) { this.bindingCompleteBlock = handler; return this }
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
		let {gridWidget} = this.gridPart;
		let {table} = gridWidget;
		let divRows = table.children(`div[role=row]`);
		let tumIslemTuslari = divRows.find(`.db.jqx-grid-cell .islemTuslari`);
		if (tumIslemTuslari.length)
			tumIslemTuslari.addClass('basic-hidden')
		// let recs = gridWidget.getvisiblerows();
		let recs = gridWidget.getselectedcells().map(cell => gridWidget.getrowdata(gridWidget.getrowdisplayindex(cell.rowindex)));
		for (let rec of recs) {
			let boundIndex = rec.boundindex;
			let divRow = divRows.eq(rec.visibleindex);
			
			let divCell = divRow.find(`.db.jqx-grid-cell`);
			let islemTuslari = divCell.find('.islemTuslari');
			let btn = islemTuslari.find('button#vtSec');
			if (btn.length) {
				btn.jqxButton({ theme: theme, width: false, height: false });
				btn.off('click');
				btn.on('click', evt => {
					// let rowIndex = gridWidget.getrowboundindex($(evt.currentTarget).parents('div[role=row]').index());
					let rowIndex = $(evt.currentTarget).parents('div[role=row]').index();
					let rec = gridWidget.getrowdata(rowIndex);
					this.vtSecIstendi($.extend({}, e, { event: evt, rowIndex: rowIndex, rec: rec }))
				})
			}
			islemTuslari.removeClass('jqx-hidden basic-hidden')
		}
	}

	gridCreateEditor(colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) {
		if (colDef.belirtec == 'db') {
			let {gridWidget} = this.gridPart;
			let boundIndex = gridWidget.getrowboundindex(rowIndex);
			let rec = gridWidget.getrowdata(boundIndex);
			editor.html(
				`<div class="editor" data-boundindex="${boundIndex}">` +
					`<div class="item float-left"><input id="server" class="veri" type="textbox" placeholder="SQL Ana Sistem" value="${rec.server || ''}"></div>` +
					`<div class="item float-left"><span class="etiket">-</span></div>` +
					`<div class="item float-left"><input id="db" class="veri" type="textbox" placeholder="Veritabanı" value="${rec.db || ''}"></div>` +
				`</div>`
			);
			let inputs = editor.find('.veri');
			inputs.on('focus', evt =>
				evt.currentTarget.select());
			inputs.on('change', evt => {
				let elm = evt.currentTarget;
				let dataField = elm.id;
				let rowIndex = $(elm).parents('.editor').data('boundindex');
				let rec = gridWidget.getrowdata(rowIndex);
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
