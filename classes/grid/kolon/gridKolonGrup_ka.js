class GridKolonGrup_KA extends GridKolonGrup {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultKodZorunlumu() { return true }
	get mfSinif() {
		const value = this._mfSinif;
		if (value && !value.prototype && ($.isFunction(value) || value.run)) {
			const {gridWidget} = this.gridPart, cell = gridWidget ? gridWidget.getselectedcell() : null;
			const rec = cell ? gridWidget.getrowdata(cell.rowindex, cell.datafield) : null;
			return getFuncValue.call(this, this._mfSinif, { sender: this.sender, colDef: this, rec })
		}
		return value
	}
	set mfSinif(value) { this._mfSinif = value } get kodBelirtec() { return this.kodAttr }
	get kodAttr() { const {kaKolonu} = this; return kaKolonu ? kaKolonu.belirtec : null } set kodAttr(value) { const {kaKolonu} = this; if (kaKolonu) kaKolonu.belirtec = value }
	get isEditable() { return this.kaKolonu.isEditable } set isEditable(value) { this.kaKolonu.isEditable = value }

	static getClass(e) { return super.getClass(e) }
	constructor(e) {
		e = e || {}; super(e);
		this.ozelStmDuzenleyiciTriggerFlag = e.ozelStmDuzenleyiciTriggerFlag ?? e.ozelStmDuzenleyiciTrigger
	}
	readFrom_ara(e) {
		$.extend(this, { _mfSinif: e.mfSinif, dataBlock: getFunc(e.dataBlock) }); if (!super.readFrom_ara(e)) return false
		if (e.kodAttr && e.kaKolonu) e.kaKolonu.belirtec = e.kodAttr
		$.extend(this, { /* kodAttr: e.kodAttr || `${this.belirtec}Kod`, */ adiAttr: e.adiAttr || `${this.belirtec}Adi` });
		this.kaKolonu = this.parseColDef(e.kaKolonu); return true
	}
	readFrom_son(e) {
		if (!super.readFrom_son(e)) { return false }
		const addHandler = e => { let {item} = e; if (item) { if (!$.isArray(item)) item = [item]; e.target.push(...item) } };
		const ekDegisinceHandlers = this.ekDegisinceHandlers = [];
		addHandler({ target: ekDegisinceHandlers, item: e.degisince ?? e.ekDegisince });
		const ekGelinceHandlers = this.ekGelinceHandlers = [];
		addHandler({ target: ekGelinceHandlers, item: e.gelince ?? e.ekGelince });
		return true
	}
	defaultTabloKolonlariDuzenle(e) {
		super.defaultTabloKolonlariDuzenle(e); const {kaKolonu, adiKolonu} = this;
		if (kaKolonu) {
			kaKolonu.editable();
			if (!kaKolonu.columnType) kaKolonu.columnType = 'custom'
			/*if (!kaKolonu.handleKeyboardNavigation) {
				kaKolonu.handleKeyboardNavigation = e => { debugger }
			}*/
			if (!kaKolonu.createEditor) {
				kaKolonu.createEditor = (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
					const {gridWidget} = colDef.gridPart, {kaKolonu, kodAttr, adiAttr, mfSinif, ozelStmDuzenleyiciTriggerFlag, stmDuzenleyiciler} = this, prevValue = value;
					const part = new ModelKullanPart({
						parentPart: this, layout: editor, mfSinif: e => this.mfSinif, dropDown: false, value: prevValue,
						ozelQueryDuzenle: (
							!ozelStmDuzenleyiciTriggerFlag || $.isEmptyObject(stmDuzenleyiciler) ? null : (e => { for (const handler of stmDuzenleyiciler) getFuncValue.call(this, handler, e) })
						),
						argsDuzenle: e => {
							$.extend(e.args, {
								width: cellWidth, height: cellHeight, dropDownWidth: cellWidth * 2, dropDownHeight: 200, autoDropDownHeight: false,
								autoBind: true, autoOpen: false, itemHeight: 30, width: cellWidth, height: cellHeight,
								renderSelectedItem: (index, rec) => {
									const {kodSaha} = part.mfSinif; rec = rec.originalItem ?? rec ?? {};
									return (rec[kodAttr] ?? rec[kodSaha]) || ''
								}
							})
						}
					}).bosKodEklenir();
					editor.data('part', part); part.run();
					let tmpHandler_veriYuklenince = evt => {
						part.input.off('bindingComplete', tmpHandler_veriYuklenince);
						setTimeout(() => part.widget.input.select(), 100)
					};
					part.input.on('bindingComplete', tmpHandler_veriYuklenince);
					part.change(_e => {
						const {mfSinif, adiAttr} = this, {adiSaha} = mfSinif, {value, item} = _e, rec = gridWidget.getrowdata(rowIndex);
						if (rec && item) rec[adiAttr] = item[adiAttr] || item[adiSaha] || ''
						gridWidget.setcellvalue(rowIndex, kodAttr, value);
						kaKolonu.cellValueChanged({ args: { owner: gridWidget, datafield: kodAttr, rowindex: rowIndex, oldvalue: prevValue, newvalue: value } })
					});
					const {widget} = part;
					setTimeout(() => {
						widget.input.on('keyup', evt => {
							const key = (evt.key || '').toLowerCase();
							if (key == 'enter' || key == 'linefeed') { widget.close(); if (gridWidget.editcell) { setTimeout(() => gridWidget.endcelledit(), 5) } }
						})
					}, 500)
				}
			}
			if (!kaKolonu.initEditor) {
				kaKolonu.initEditor = (colDef, rowIndex, value, editor, cellText) => {
					const part = editor.data('part'), {jqxSelector} = part;
					if (part.input != editor) { part.input = editor; part.widget = editor[jqxSelector]('getInstance') }
					editor[jqxSelector]({ width: editor.width() }); part.val(value || '');
					setTimeout(() => { editor[jqxSelector]('focus'); editor.select() }, 100)
				}
			}
			if (!kaKolonu.getEditorValue) {
				kaKolonu.getEditorValue = (colDef, rowIndex, value, editor) => { const part = editor.data('part'); return part?.kodGecerlimi ? part.val() : editor.val() }
			}
			/*if (!kaKolonu.cellValueChanging) { kaKolonu.cellValueChanging = (colDef, rowIndex, dataField, columnType, oldValue, newValue) => { } }*/
			if (!kaKolonu.cellValueChanged) {
				kaKolonu.cellValueChanged = e => {
					const {mfSinif, kodAttr, adiAttr} = this, {kodSaha, adiSaha} = mfSinif; if (!(kodSaha && kodAttr)) return
					const {dataBlock, gridPart} = this, {grid, gridWidget} = gridPart, {args} = e, {colDef} = args;
					const dataField = args.datafield, rowIndex = args.rowindex, oldValue = args.oldvalue; let newValue = args.newvalue;
					const gridRec = gridWidget.getrowdata(rowIndex); if (!gridRec || gridRec.gridKADesteklenmezmi) return
					let recPromise, rec, setValueYapildimi = false;
					if (dataBlock) {
						recPromise = new $.Deferred();
						try {
							(async () => {
								if (!newValue) { gridRec[adiAttr] = ''; if (recPromise) recPromise.resolve({}) }
								else {
									const recs = await getFuncValue.call(this, dataBlock, { sender: this, gridPart, mfSinif, fis: gridPart.fis, gridRec, kod: newValue });
									rec = recs ? recs.find(rec => (rec[kodAttr] || rec[kodSaha]) == newValue) : null;
									if (recPromise) {
										setTimeout(() => {
											const valDiv = grid.find(`.validation-popup[data-row=${rowIndex}][data-belirtec=${dataField}]`).parent();
											if (valDiv.length) { valDiv.prev('.jqx-grid-validation-arrow-up').remove(); valDiv.remove(); }
											if (!rec && newValue) gridWidget.showvalidationpopup(rowIndex, kodAttr, `<div class="validation-popup" data-row="${rowIndex}" data-belirtec="${dataField}"><u class="bold">${newValue}</u> değeri hatalıdır</div>`)
										}, 10);
										const _kodDegerDurum = gridRec._kodDegerDurum = gridRec._kodDegerDurum || {}; _kodDegerDurum[dataField] = !!rec;
										if (rec) { gridRec[adiAttr] = rec[adiAttr] || rec[adiSaha] || ''; recPromise.resolve(rec) }
										else { gridRec[adiAttr] = ''; recPromise.reject({ isError: true, rc: 'noRecord' }) }
										gridWidget.updaterow(gridRec.uid, gridRec)
									}
								}
								setValueYapildimi = true
							})()
						}
						catch (ex) { if (recPromise) recPromise.fail(ex); console.error(ex) }
					}
					const {ekDegisinceHandlers} = this;
					if (!$.isEmptyObject(ekDegisinceHandlers)) {
						const _e = {
							sender: this, mfSinif, kodSaha, adiSaha, kodAttr, adiAttr, colDef: this, rowIndex, dataField, /*columnType,*/
							oldValue, newValue, gridPart, grid: gridPart.grid, gridWidget, fis: gridPart.fis, gridRec,
							tabloKolonlari: gridPart.tabloKolonlari, rec: recPromise,
							args: { sender: this.sender, owner: gridWidget, datafield: dataField, rowindex: rowIndex, oldvalue: oldValue, newvalue: newValue },
							setCellValue(e) {
								const _rowIndex = e.rowIndex == null ? rowIndex : e.rowIndex, _dataField = e.dataField || e.belirtec;
								if (_dataField != adiAttr) gridWidget.setcellvalue(_rowIndex, _dataField, e.value)
							}
						};
						for (const handler of ekDegisinceHandlers) { getFuncValue.call(this, handler, _e); newValue = _e.newValue }
					}
					return newValue
				}
			}
			/*if (!kaKolonu.renderer) {
				kaKolonu.renderer = (colDef, text, align, width) => {
					const {gridWidget} = this.gridPart;
					return gridWidget._rendercolumnheader(text, align, width, gridWidget)
				}
			}*/
			kaKolonu.cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
				const {adiAttr} = this, kod = value;
				if (kod) {
					let result = `<b>${kod}</b>`; const adi = rec[adiAttr];
					if (adi) { result += ` - ${adi}`; html = changeTagContent(html, result) }
				}
				return html
			}
			if (!kaKolonu.listedenSec) {
				kaKolonu.listedenSec = e => {
					const {mfSinif, kodAttr, adiAttr} = this, {kodSaha, adiSaha} = mfSinif;
					if (!(kodSaha && kodAttr)) return
					const {dataBlock, gridPart} = this, {grid, gridWidget} = gridPart, args = e.args || {};
					const dataField = args.datafield == null ? kodAttr : args.datafield; let rowIndex = args.rowindex;
					if (rowIndex == null) {
						const selInfo = gridWidget.getselection() || {}; rowIndex = selInfo.rows[0];
						if (rowIndex == null) rowIndex = (selInfo.cells[0] || {}).rowindex
					}
					if (gridWidget.editcell) gridWidget.endcelledit()
					const prevKod = args.value == null ? gridWidget.getcellvalue(rowIndex, dataField) : args.value;
					const part = new MasterListePart({
						mfSinif, tekilmi: false,
						bindingComplete: e => {
							const kod = prevKod;
							if (kod) {
								const recs = e.source?.records || [], index = recs.findIndex(rec => rec[kodSaha] == kod || rec[adiSaha] == kod);
								if (index != false && index > -1) e.gridWidget.selectrow(index)
							}
						},
						secince: e => {
							if (gridWidget.editcell) gridWidget.endcelledit()
							gridWidget.beginupdate();
							// const gridRowCount = gridWidget.getrecordscount();
							const {recs} = e;
							if (recs.length > 1) {
								const gridRec = gridWidget.getrowdata(rowIndex);
								for (let i = 0; i < recs.length - 1; i++)
									gridWidget.addrow(null, gridPart.newRec({ rec: gridRec }), rowIndex + 1)
							}
							/*let eksikSatirSayisi = recs.length - (gridRowCount - (rowIndex + 1) + 1);
							if (eksikSatirSayisi > 0) {
								const selectedRec = gridWidget.getrowdata(rowIndex);
								while (eksikSatirSayisi > 0) {
									gridWidget.addrow(selectedRec.uid, gridPart.newRec({ rec: selectedRec }), 'last');
									eksikSatirSayisi--
								}
							}*/
							for (const rec of recs) {
								const gridRec = gridWidget.getrowdata(rowIndex);
								/* gridRec[kodAttr] = rec[kodAttr] || rec[kodSaha] || ''; */ gridRec[adiAttr] = rec[adiAttr] || rec[adiSaha] || '';
								const kod = rec[kodSaha]; gridWidget.setcellvalue(rowIndex, kodAttr, kod);
								kaKolonu.cellValueChanged({ args: { owner: gridWidget, datafield: dataField, rowindex: rowIndex, oldvalue: prevKod, newvalue: kod } });
								rowIndex++
							}
							gridWidget.endupdate(false)
							setTimeout(() => gridWidget.focus(), 100)
						},
						kapaninca: e => setTimeout(() => gridWidget.focus(), 10)
					});
					setTimeout(() => part.run(), 10)
				}
			}
			if (!kaKolonu.cellClick) {
				kaKolonu.cellClick = e => {
					const {args} = e, isRightClick = args?.rightclick;
					if (isRightClick) {
						if (kaKolonu._event_cellClick) return
						clearTimeout(() => kaKolonu._event_cellClick);
						kaKolonu._event_cellClick = setTimeout(() => { try { kaKolonu.listedenSec(e) } finally { delete kaKolonu._event_cellClick } }, 50)
					}
				};
			}
			/*if (!kaKolonu.cellsRenderer) {
				kaKolonu.cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const {aciklama} = (da_stokKod.records.find(rec => rec.kod == value) || {});
					if (aciklama) html = changeTagContent(html, aciklama)
					return html
				}
			}*/
		}
		const {tabloKolonlari} = e, colDefs = [kaKolonu];
		for (const colDef of colDefs) { if (colDef) tabloKolonlari.push(colDef) }
	}
	getDataAdapter(e) {
		e = e || {}; const {dataBlock, mfSinif} = this; if (!dataBlock) return null
		if (mfSinif) e.mfSinif = mfSinif
		return new $.jqx.dataAdapter({ dataType: wsDataType, url: 'empty.json', data: e }, {
			autoBind: true, 
			loadServerData: async (wsArgs, source, callback) => {
				// const _e = $.extend({}, e, { wsArgs: wsArgs, source: source, callback: callback });
				try {
					const _e = $.extend({ sender: this, callback }, wsArgs); let result = await getFuncValue.call(this, dataBlock, _e);
					if (result) {
						if ($.isArray(result)) result = { totalrecords: result.length, records: result };
						if (typeof result == 'object') {
							if (result.records && !result.totalrecords) result.totalrecords = result.records.length
							callback(result)
						}
					}
				}
				catch (ex) {
					console.error(ex); const errorText = getErrorText(ex);
					hConfirm(`<div class="bold firebrick" style="padding: 13px 8px;">${errorText}</div>`, 'Grid AutoComplete Verisi Alınamadı')
				}
			}
		})
	}
	degisince(block) { this.ekDegisinceHandlers.push(block); return this }
	gelince(block) { this.ekGelinceHandlers.push(block); return this }
	ozelStmDuzenleyiciTrigger(e) { this.ozelStmDuzenleyiciTriggerFlag = true; return this }
	ozelStmDuzenleyiciNoTrigger(e) { this.ozelStmDuzenleyiciTriggerFlag = false; return this }
	sabitle() { this.kaKolonu.sabitle(); return this; } serbestBirak() { this.kaKolonu.serbestBirak(); return this }
}


(function() {
	const anaTip2Sinif = GridKolonVeGrupOrtak.prototype.constructor._anaTip2Sinif, subClasses = [GridKolonGrup_KA];
	for (const cls of subClasses) { const {anaTip} = cls; if (anaTip) anaTip2Sinif[anaTip] = cls }

	// const {_templates} = GridKolonGrup_KA.prototype.constructor;
	/*_templates.stok = e => {
		e = e || {};
		const kodAttr = e.kodAttr || 'stokKod';
		const adiAttr = e.adiAttr || 'stokAdi';
		
		return new GridKolonGrup_KA({
			belirtec: 'stok',
			mfSinifAdi: 'PMStok',
			kaKolonu: new GridKolon({ belirtec: kodAttr, text: e.kodEtiket || 'Kod', genislikCh: e.adiGenislikCh || 50 }),
			tabloKolonlari: [],
			dataBlock: async e => {
				//let result = this._data;
				//if (!result) {
				const {kod, value} = e;
				// const value = null;
				let result = await app.wsSqlExec({
					maxRow: e.maxRow == null ? 50 : e.maxRow,
					args: {
						execTip: 'dt',
						query: (
							`SELECT kod ${kodAttr}, aciklama ${adiAttr} FROM stkmst WHERE kod > ''` +
							( kod ? ` AND (kod = '${kod}')` : '' ) +
							( value ? ` AND (kod LIKE '%${value}%' OR aciklama LIKE '%${value}%')` : '' )
						)
					}
				});
				//this._data = result;
				//}
				return result;
			}
		})
	};
	
	_templates.stokVeBrm = e => {
		const da_brm = new $.jqx.dataAdapter({
			dataType: 'array',
			localdata: [
				{ kod: '', aciklama: '' },
				{ kod: 'AD', aciklama: 'AD' },
				{ kod: 'KG', aciklama: 'KG' },
				{ kod: 'LT', aciklama: 'LT' }
			]
		}, { autoBind: true });
		
		const result =_templates.stok(e);
		if (result) {
			result.belirtec = 'stokVeBrm';
			const tabloKolonlari = result.tabloKolonlari = result.tabloKolonlari || [];
			tabloKolonlari.push(
				new GridKolon({
					belirtec: 'brm', text: 'Brm', genislikCh: 7,
					columnType: 'template',
					createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
						editor.jqxDropDownList({
							width: cellWidth, valueMember: 'kod', displayMember: 'kod',
							source: da_brm, autoDropDownHeight: true
						})
					},
					initEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
						editor.jqxDropDownList({ width: cellWidth });
						editor.val(value);
						// setTimeout(() => editor.jqxDropDownList('open'), 1);
					},
					getCellValue: (colDef, rowIndex, value, editor) =>
						editor.val(),
					cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
						const {aciklama} = (da_brm.records.find(rec => rec.kod == value) || {});
						if (aciklama)
							html = changeTagContent(html, aciklama);
						return html
					}
				}).editable()
			)
		}
		return result;
	};*/
})();