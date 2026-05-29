class GridKolonGrup_KA extends GridKolonGrup {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultKodZorunlumu() { return true }
	get mfSinif() {
		let value = this._mfSinif;
		if (value && !value.prototype && ($.isFunction(value) || value.run)) {
			let {gridWidget} = this.gridPart, cell = gridWidget ? gridWidget.getselectedcell() : null;
			let rec = cell ? gridWidget.getrowdata(cell.rowindex, cell.datafield) : null;
			return getFuncValue.call(this, this._mfSinif, { sender: this.sender, colDef: this, rec })
		}
		return value
	}
	set mfSinif(value) { this._mfSinif = value } get kodBelirtec() { return this.kodAttr }
	get kodAttr() { let {kaKolonu} = this; return kaKolonu ? kaKolonu.belirtec : null }
	set kodAttr(value) { let {kaKolonu} = this; if (kaKolonu) kaKolonu.belirtec = value }
	get isEditable() { return this.kaKolonu.isEditable } set isEditable(value) { this.kaKolonu.isEditable = value }

	constructor(e = {}, text, genislikCh, sql, userData) {
		if (typeof e != 'object')
			e = { belirtec: e, text, genislikCh, sql, userData }
		super(e)
		this.ozelStmDuzenleyiciTriggerFlag = e.ozelStmDuzenleyiciTriggerFlag ?? e.ozelStmDuzenleyiciTrigger
	}
	readFrom_ara(e) {
		if (e.isCopy) { return true }
		extend(this, { _mfSinif: e.mfSinif, dataBlock: getFunc(e.dataBlock) }); if (!super.readFrom_ara(e)) { return false }
		if (e.kodAttr && e.kaKolonu) { e.kaKolonu.belirtec = e.kodAttr }
		extend(this, {
			/* kodAttr: e.kodAttr || `${this.belirtec}Kod`, */ adiAttr: e.adiAttr || `${this.belirtec}Adi`,
			isDropDown: e.dropDown ?? e.isDropDown ?? e.dropDownFlag, autoBindFlag: e.autoBind ?? e.autoBindFlag ?? true
		});
		let kaKolonu = this.kaKolonu = this.parseColDef(e.kaKolonu);
		kaKolonu.kodZorunlumu = this.kodZorunlumu;
		return true
	}
	readFrom_son(e) {
		if (!super.readFrom_son(e))
			return false
		
		function addHandler({ item, target } = {}) {
			item = makeArray(item)
			target?.push(...item)
		}
		;{
			let target = this.ekDegisinceHandlers = []
			let { degisince: item = e.ekDegisince } = e
			addHandler({ target, item })
		}
		;{
			let target = this.ekGelinceHandlers = []
			let { gelince: item = e.ekGelince } = e
			addHandler({ target, item })
		}
		return true
	}
	defaultTabloKolonlariDuzenle(e) {
		super.defaultTabloKolonlariDuzenle(e)
		let { kaKolonu, adiKolonu } = this
		if (!kaKolonu)
			return
		
		kaKolonu.editable()
		if (!kaKolonu.columnType)
			kaKolonu.columnType = 'custom'
		
		//if (!kaKolonu.handleKeyboardNavigation)
		//	kaKolonu.handleKeyboardNavigation = e => { debugger }
		
		if (!kaKolonu.createEditor) {
			kaKolonu.createEditor = (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
				let { gridWidget } = colDef.gridPart
				let { kaKolonu, kodAttr, adiAttr, mfSinif } = this
				let { ozelStmDuzenleyiciTriggerFlag, stmDuzenleyiciler } = this
				let { isDropDown, autoBindFlag: autoBind } = this
				let { kodGosterilmesinmi: kodsuzmu } = colDef?.tip ?? {}
				let prevValue = value
				let renderSelectedItem = isDropDown
					? undefined
					: (index, rec) => {
						let { kodSaha } = part.mfSinif ?? {}
						rec = rec.originalItem ?? rec ?? {}
						return ( rec[kodAttr] ?? rec[kodSaha] ) || ''
					}
				let part = new ModelKullanPart({
					parentPart: this, layout: editor,
					isDropDown, autoBind,
					mfSinif: e => this.mfSinif,
					value: prevValue,
					kodGosterilsinmi: !kodsuzmu,
					ozelQueryDuzenle: !ozelStmDuzenleyiciTriggerFlag || empty(stmDuzenleyiciler)
						? null
						: e => stmDuzenleyiciler.forEach(h =>
									h?.call?.(this, e)),
					argsDuzenle: e => {
						extend(e.args, {
							width: cellWidth, height: cellHeight,
							dropDownWidth: cellWidth * 2, dropDownHeight: 200, autoDropDownHeight: false,
							autoOpen: false, itemHeight: 30, renderSelectedItem
						})
					}
				})
				part.bosKodEklenir?.()
				editor.data('part', part)
				part.run()
				let tmpHandler_veriYuklenince = evt => {
					part.input.off('bindingComplete', tmpHandler_veriYuklenince)
					// setTimeout(() => part.widget.input.select(), 1)
				}
				part.input.on('bindingComplete', tmpHandler_veriYuklenince)
				part.degisince(_e => {
					let { mfSinif, adiAttr } = this
					let { adiSaha } = mfSinif
					let { value, item } = _e
					let rec = gridWidget.getrowdata(rowIndex)
					if (rec && item)
						rec[adiAttr] = item[adiAttr] || item[adiSaha] || ''
					gridWidget.setcellvalue(rowIndex, kodAttr, value)
					//kaKolonu.cellValueChanged({ args: { owner: gridWidget, datafield: kodAttr, rowindex: rowIndex, oldvalue: prevValue, newvalue: value } })
				})
				let { input, widget } = part
				input = widget?.input ?? input
				setTimeout(() => {
					input.on('keyup', ({ key }) => {
						key = key?.toLowerCase()
						if (key == 'enter' || key == 'linefeed') {
							widget.close()
							if (gridWidget.editcell)
								setTimeout(() => gridWidget.endcelledit(), 5)
						}
					})
				}, 10)
			}
		}
		if (!kaKolonu.initEditor) {
			kaKolonu.initEditor = (colDef, rowIndex, value, editor, cellText, pressedChar) => {
				let part = editor.data('part')
				let { jqxSelector, input } = part
				value = pressedChar ?? part.selectedItem?.[part.mfSinif?.adiSaha] ?? value
				input = editor[jqxSelector]('input')
				part.widget = editor[jqxSelector]('getInstance')
				editor[jqxSelector]({ width: editor.width() })
				part.val(value || '');
				editor[jqxSelector]('focus')
				setTimeout(() => {
					input.val(value || '')
					if (pressedChar) {
						input[0].setSelectionRange(value.length + 1, 1) }
					else {
						input.select()
						let handler = evt => {
							editor.off('bindingComplete', handler)
							setTimeout(() => input.select(), 5)
						};
						editor.on('bindingComplete', handler)
					}
				}, 15)
			}
		}
		if (!kaKolonu.getEditorValue) {
			kaKolonu.getEditorValue = (colDef, rowIndex, value, editor) => {
				let part = editor.data('part')
				return part?.kodGecerlimi ? part.val() : editor.val()
			}
		}
		//if (!kaKolonu.cellValueChanging)
		//	kaKolonu.cellValueChanging = (colDef, rowIndex, dataField, columnType, oldValue, newValue) => { }
		if (!kaKolonu.cellValueChanged) {
			kaKolonu.cellValueChanged = e => {
				let { mfSinif, kodAttr, adiAttr } = this
				let { kodSaha, adiSaha } = mfSinif
				if (!(kodSaha && kodAttr))
					return
				
				let { dataBlock, gridPart } = this
				let { grid, gridWidget } = gridPart
				let { args } = e, { colDef } = args
				let { datafield: dataField, rowindex: rowIndex, oldvalue: oldValue, newvalue: newValue } = args
				let gridRec = gridWidget.getrowdata(rowIndex)
				if (!gridRec || gridRec.gridKADesteklenmezmi)
					return
				
				let recPromise, rec
				let setValueYapildimi = false
				if (dataBlock) {
					recPromise = new defer()
					try {
						(async () => {
							if (!newValue) {
								gridRec[adiAttr] = ''
								if (recPromise)
									recPromise.resolve({})
							}
							else {
								let recs = await getFuncValue.call(this, dataBlock, { sender: this, gridPart, mfSinif, fis: gridPart.fis, gridRec, kod: newValue })
								rec = recs ? recs.find(rec => (rec[kodAttr] || rec[kodSaha]) == newValue) : null
								if (recPromise) {
									setTimeout(() => {
										let valDiv = grid.find(`.validation-popup[data-row=${rowIndex}][data-belirtec = ${dataField}]`).parent()
										if (valDiv.length) {
											valDiv.prev('.jqx-grid-validation-arrow-up').remove()
											valDiv.remove()
										}
										if (!rec && newValue) {
											gridWidget.showvalidationpopup(
												rowIndex, kodAttr,
												`<div class="validation-popup" data-row="${rowIndex}" data-belirtec="${dataField}"><u class="bold">${newValue}</u> değeri hatalıdır</div>`
											)
										}
									}, 10)
									let _kodDegerDurum = gridRec._kodDegerDurum = gridRec._kodDegerDurum || {}
									_kodDegerDurum[dataField] = !!rec
									if (rec) {
										gridRec[adiAttr] = rec[adiAttr] || rec[adiSaha] || ''
										recPromise?.resolve(rec)
									}
									else {
										gridRec[adiAttr] = ''
										recPromise?.reject({ isError: true, rc: 'noRecord' })
									}
									gridWidget.updaterow(gridRec.uid, gridRec)
								}
							}
							setValueYapildimi = true
						})()
					}
					catch (ex) {
						recPromise?.fail(ex)
						console.error(ex)
					}
				}
				let { ekDegisinceHandlers } = this
				if (!empty(ekDegisinceHandlers)) {
					let _e = {
						sender: this, mfSinif, kodSaha, adiSaha, kodAttr, adiAttr,
						colDef: this, rowIndex, dataField, //columnType,
						oldValue, newValue, gridPart, grid: gridPart.grid, gridWidget,
						fis: gridPart.fis, gridRec,
						tabloKolonlari: gridPart.tabloKolonlari,
						rec: recPromise,
						args: {
							sender: this.sender, owner: gridWidget,
							datafield: dataField, rowindex: rowIndex,
							oldvalue: oldValue, newvalue: newValue
						},
						setCellValue(e = {}) {
							let _rowIndex = e.rowIndex ?? rowIndex
							let _dataField = e.dataField || e.belirtec
							if (_dataField != adiAttr)
								gridWidget.setcellvalue(_rowIndex, _dataField, e.value)
						}
					}
					for (let handler of ekDegisinceHandlers) {
						handler.call(this, _e)
						newValue = _e.newValue
					}
				}
				return newValue
			}
		}
		//if (!kaKolonu.renderer) {
		//	kaKolonu.renderer = (colDef, text, align, width) => {
		//		let {gridWidget} = this.gridPart;
		//		return gridWidget._rendercolumnheader(text, align, width, gridWidget)
		//	}
		//}
		kaKolonu.cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			let { adiAttr } = this
			let kod = value, adi = rec[adiAttr]
			let { kodGosterilmesinmi: kodsuzmu } = colDef?.tip ?? {}
			let result = [
				( kod && !(adi && kodsuzmu) ? `<b>${kod}</b>` : null ),
				adi
			].filter(Boolean).join(' - ')
			if (result)
				html = changeTagContent(html, result)
			return html
		}
		if (!kaKolonu.listedenSec) {
			kaKolonu.listedenSec = e => {
				let { mfSinif, kodAttr, adiAttr } = this
				let {kodSaha, adiSaha} = mfSinif
				if (!(kodSaha && kodAttr))
					return
				
				let { dataBlock, gridPart } = this
				let { grid, gridWidget } = gridPart
				let args = e.args ?? {}
				let { rowindex: rowIndex } = args
				let dataField = args.datafield ?? kodAttr
				if (rowIndex == null) {
					let selInfo = gridWidget.getselection() ?? {}
					rowIndex = selInfo.rows[0]
					if (rowIndex == null)
						rowIndex = selInfo.cells[0]?.rowindex
				}
				if (gridWidget.editcell)
					gridWidget.endcelledit()
				
				let prevKod = args.value ?? gridWidget.getcellvalue(rowIndex, dataField)
				let part = new MasterListePart({
					mfSinif, tekilmi: false,
					bindingComplete: ({ source, gridWidget: w } = {}) => {
						let kod = prevKod
						if (kod) {
							let recs = source?.records ?? []
							let index = recs.findIndex(rec => rec[kodSaha] == kod || rec[adiSaha] == kod)
							if (index != false && index > -1)
								w?.selectrow(index)
						}
					},
					secince: ({ recs } = {}) => {
						if (gridWidget.editcell)
							gridWidget.endcelledit()
						gridWidget.beginupdate()
						// let gridRowCount = gridWidget.getrecordscount()
						if (recs.length > 1) {
							let gridRec = gridWidget.getrowdata(rowIndex)
							for (let i = 0; i < recs.length - 1; i++)
								gridWidget.addrow(null, gridPart.newRec({ rec: gridRec }), rowIndex + 1)
						}
						for (let rec of recs) {
							let gridRec = gridWidget.getrowdata(rowIndex);
							let kod = rec[kodSaha]
							gridRec[adiAttr] = rec[adiAttr] || rec[adiSaha] || ''
							
							let args = {
								owner: gridWidget, datafield: dataField, rowindex: rowIndex,
								oldvalue: prevKod, newvalue: kod
							}
							gridWidget.setcellvalue(rowIndex, kodAttr, kod)
							kaKolonu.cellValueChanged({ args })
							rowIndex++
						}
						gridWidget.endupdate(false)
						setTimeout(() => gridWidget.focus(), 50)
					},
					kapaninca: e =>
						setTimeout(() => gridWidget.focus(), 10)
				});
				setTimeout(() => part.run(), 10)
			}
		}
		if (!kaKolonu.cellClick) {
			kaKolonu.cellClick = e => {
				let { args = {} } = e
				let { rightclick: isRightClick } = args
				if (isRightClick) {
					if (kaKolonu._event_cellClick)
						return
					clearTimeout(() => kaKolonu._event_cellClick)
					kaKolonu._event_cellClick = setTimeout(() => {
						try { kaKolonu.listedenSec(e) }
						finally { delete kaKolonu._event_cellClick }
					}, 50)
				}
			}
		}

		let { tabloKolonlari } = e
		tabloKolonlari.push(kaKolonu)
	}
	getDataAdapter(e = {}) {
		let { dataBlock, mfSinif } = this
		if (!dataBlock)
			return null
		if (mfSinif)
			e.mfSinif = mfSinif
		return new $.jqx.dataAdapter({ dataType: wsDataType, url: 'empty.json', data: e }, {
			autoBind: true, 
			loadServerData: async (wsArgs, source, callback) => {
				// let _e = extend({}, e, { wsArgs: wsArgs, source: source, callback: callback });
				try {
					let _e = extend({ sender: this, callback }, wsArgs)
					let result = await getFuncValue.call(this, dataBlock, _e);
					if (result) {
						if (isArray(result)) result = { totalrecords: result.length, records: result }
						if (isObject(result)) {
							if (result.records && !result.totalrecords)
								result.totalrecords = result.records.length
							callback(result)
						}
					}
				}
				catch (ex) {
					cerr(ex)
					hConfirm(`<div class="bold firebrick" style="padding: 13px 8px;">${getErrorText(ex)}</div>`, 'Grid AutoComplete Verisi Alınamadı')
				}
			}
		})
	}
	handleKeyboardNavigation_ortak(e) {
		let result = super.handleKeyboardNavigation_ortak(e)
		let { kaKolonu } = this
		return result ?? kaKolonu?.handleKeyboardNavigation_ortak?.(e)
	}
	get attributes() { return this.kaKolonu.attributes }
	get sabitmi() { return this.kaKolonu.sabitmi } get isEditable() { return this.kaKolonu.isEditable } set isEditable(value) { this.kaKolonu.isEditable = value }
	get isHidden() { return this.kaKolonu.isHidden } set isHidden(value) { this.kaKolonu.isHidden = value }
	hidden() { this.kaKolonu.hidden(); return this } visible() { this.kaKolonu.visible(); return this }
	sabitle() { this.kaKolonu.sabitle(); return this } serbestBirak() { this.kaKolonu.serbestBirak(); return this }
	alignLeft() { this.kaKolonu.alignLeft(); return this } alignCenter() { this.kaKolonu.alignCenter(); return this } alignRight() { this.kaKolonu.alignRight(); return this }
	noSql() { this.kaKolonu.noSql(); return this } resetNoSql() { this.kaKolonu.resetNoSql(); return this }
	sifirGosterme() { this.kaKolonu.sifirGosterme(); return this } sifirGoster() { this.kaKolonu.sifirGoster(); return this }
	kodGosterilsin() { this.kaKolonu.kodGosterilsin(); return this } kodGosterilmesin() { this.kaKolonu.kodGosterilmesin(); return this } kodsuz() { return this.kodGosterilmesin() }
	dropDown() { this.isDropDown = true; return this } comboBox() { this.isDropDown = false; return this }
	autoBind() { this.autoBindFlag = true; return this } noAutoBind() { this.autoBindFlag = false; return this }
	degisince(block) { this.ekDegisinceHandlers.push(block); return this } gelince(block) { this.ekGelinceHandlers.push(block); return this }
	ozelStmDuzenleyiciTrigger(e) { this.ozelStmDuzenleyiciTriggerFlag = true; return this } ozelStmDuzenleyiciNoTrigger(e) { this.ozelStmDuzenleyiciTriggerFlag = false; return this }
}


(function() {
	let anaTip2Sinif = GridKolonVeGrupOrtak.prototype.constructor._anaTip2Sinif, subClasses = [GridKolonGrup_KA];
	for (let cls of subClasses) { let {anaTip} = cls; if (anaTip) anaTip2Sinif[anaTip] = cls }

	// let {_templates} = GridKolonGrup_KA.prototype.constructor;
	/*_templates.stok = e => {
		e = e || {};
		let kodAttr = e.kodAttr || 'stokKod';
		let adiAttr = e.adiAttr || 'stokAdi';
		
		return new GridKolonGrup_KA({
			belirtec: 'stok',
			mfSinifAdi: 'PMStok',
			kaKolonu: new GridKolon({ belirtec: kodAttr, text: e.kodEtiket || 'Kod', genislikCh: e.adiGenislikCh || 50 }),
			tabloKolonlari: [],
			dataBlock: async e => {
				//let result = this._data;
				//if (!result) {
				let {kod, value} = e;
				// let value = null;
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
		let da_brm = new $.jqx.dataAdapter({
			dataType: 'array',
			localdata: [
				{ kod: '', aciklama: '' },
				{ kod: 'AD', aciklama: 'AD' },
				{ kod: 'KG', aciklama: 'KG' },
				{ kod: 'LT', aciklama: 'LT' }
			]
		}, { autoBind: true });
		
		let result =_templates.stok(e);
		if (result) {
			result.belirtec = 'stokVeBrm';
			let tabloKolonlari = result.tabloKolonlari = result.tabloKolonlari || [];
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
						let {aciklama} = (da_brm.records.find(rec => rec.kod == value) || {});
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
