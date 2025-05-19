class GridKolonGrup_KA extends GridKolonGrup {
	static get defaultKodZorunlumu() { return true }
	get isEditable() { return this.kodKolonu.isEditable }
	get kodBelirtec() { return this.kodKolonu.belirtec }
	get adiBelirtec() { return (this.adiKolonu || {}).belirtec }

	static getClass(e) {
		return super.getClass(e);
	}

	readFrom(e) {
		$.extend(this, {
			kodKolonu: this.parseColDef(e.kodKolonu),
			adiKolonu: this.parseColDef(e.adiKolonu),
			mfSinif: e.mfSinif,
			dataBlock: getFunc(e.dataBlock)
		});

		const addHandler = e => {
			let {item} = e;
			if (item) {
				if (!$.isArray(item))
					item = [item];
				e.target.push(...item);
			}
		}
		const ekDegisinceHandlers = this.ekDegisinceHandlers = [];
		addHandler({ target: ekDegisinceHandlers, item: e.degisince || e.ekDegisince });
		const ekGelinceHandlers = this.ekGelinceHandlers = [];
		addHandler({ target: ekGelinceHandlers, item: e.gelince || e.ekGelince });
		

		return super.readFrom(e);
	}

	degisince(block) {
		this.ekDegisinceHandlers.push(block);
		return this;
	}

	gelince(block) {
		this.ekGelinceHandlers.push(block);
		return this;
	}

	defaultTabloKolonlariDuzenle(e) {
		super.defaultTabloKolonlariDuzenle(e);
		
		const {kodKolonu, adiKolonu} = this;
		if (kodKolonu) {
			kodKolonu.editable();
			if (!kodKolonu.columnType)
				kodKolonu.columnType = 'custom';

			/*if (!kodKolonu.handleKeyboardNavigation) {
				kodKolonu.handleKeyboardNavigation = e => { debugger }
			}*/
			
			if (!kodKolonu.createEditor) {
				kodKolonu.createEditor = (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
					const {gridWidget} = colDef.gridPart;
					const {mfSinif, belirtec, kodKolonu, adiKolonu} = this;
					const {kodSaha} = mfSinif;
					const kodAttr = kodKolonu.belirtec;
					const adiAttr = adiKolonu.belirtec;

					const prevKod = value;
					const part = new ModelKullanPart({
						layout: editor, 
						mfSinif: mfSinif,
						dropDown: false,
						kod: prevKod,
						argsDuzenle: e => {
							$.extend(e.args, {
								itemHeight: 30, width: cellWidth * 2, height: cellHeight,
								dropDownWidth: cellWidth * 3, dropDownHeight: 410,
								renderSelectedItem: (index, rec) => {
									rec = rec.originalItem || rec || {};
									return rec[kodAttr] || rec[kodSaha] || ''
								}
							})
						}
					});
					editor.data('part', part);
					part.run();
					part.change(_e => {
						const {editing} = (gridWidget.editcell || {});
						if (!editing) {
							const {kod, item} = _e;
							gridWidget.setcellvalue(rowIndex, kodAttr, kod);
							kodKolonu.cellValueChanged({
								args: {
									datafield: kodAttr,
									rowindex: rowIndex,
									oldvalue: prevKod,
									newvalue: kod
								}
							});
						}
					});
					
					const {widget} = part;
					setTimeout(() => {
						widget.input.on('keyup', evt => {
							const key = (evt.key || '').toLowerCase();
							if (key == 'enter' || key == 'linefeed') {
								widget.close();
								const editCell = gridWidget.editcell;
								if (editCell) {
									setTimeout(() =>
										gridWidget.endcelledit(),
										5);
								}
							}
						})
					}, 1000);
				}
			}
			
			if (!kodKolonu.initEditor) {
				kodKolonu.initEditor = (colDef, rowIndex, value, editor, cellText) => {
					const part = editor.data('part');
					part.input.jqxComboBox({
						width: editor.width() * 2
					});
					part.val(value || '');
					setTimeout(() => {
						editor.jqxComboBox('focus');
						editor.select();
					}, 100);
				}
			}
			
			if (!kodKolonu.getEditorValue) {
				kodKolonu.getEditorValue = (colDef, rowIndex, value, editor) => {
					const part = editor.data('part');
					return (part && part.kodGecerlimi) ? part.val() : editor.val();
				}
			}
			
			if (!kodKolonu.cellValueChanging) {
				kodKolonu.cellValueChanging = (colDef, rowIndex, dataField, columnType, oldValue, newValue) => {
				}
			}

			if (!kodKolonu.cellValueChanged) {
				kodKolonu.cellValueChanged = e => {
					const {mfSinif} = this;
					const {kodSaha, adiSaha} = mfSinif;
					const kodAttr = kodKolonu.belirtec;
					
					if (!(kodSaha && kodAttr))
						return;

					const adiAttr = adiKolonu ? adiKolonu.belirtec : null;
					const {dataBlock, gridPart} = this;
					const {grid, gridWidget} = gridPart;
					const {args} = e;
					const {colDef} = args;
					const dataField = args.datafield;
					const rowIndex = args.rowindex;
					const oldValue = args.oldvalue;
					let newValue = args.newvalue;

					let recPromise, rec, timerSetValue;
					let setValueYapildimi = false;
					if (dataBlock) {
						recPromise = new $.Deferred();
						try {
							(async () => {
								if (!newValue) {
									if (recPromise)
										recPromise.resolve({});
								}
								else {
									const recs = await getFuncValue.call(this, dataBlock, { sender: this, kod: newValue });
									rec = recs ? recs.find(rec => (rec[kodAttr] || rec[kodSaha]) == newValue) : null;
									if (recPromise) {
										setTimeout(() => {
											const valDiv = grid.find(`.validation-popup[data-row=${rowIndex}][data-belirtec=${dataField}]`).parent();
											if (valDiv.length) {
												valDiv.prev('.jqx-grid-validation-arrow-up').remove();
												valDiv.remove();
											}
											
											if (!rec && newValue)
												gridWidget.showvalidationpopup(rowIndex, kodAttr, `<div class="validation-popup" data-row="${rowIndex}" data-belirtec="${dataField}"><u class="bold">${newValue}</u> değeri hatalıdır</div>`);
										}, 10);
		
										const det = gridWidget.getrowdata(rowIndex, dataField);
										const _kodDegerDurum = det._kodDegerDurum = det._kodDegerDurum || {};
										_kodDegerDurum[dataField] = !!rec;
		
										if (rec)
											recPromise.resolve(rec);
										else
											recPromise.reject({ isError: true, rc: 'noRecord' })
									}
								}
								
								if (adiAttr && !setValueYapildimi) {
									timerSetValue = setTimeout(() => {
										try { gridWidget.setcellvalue(rowIndex, adiAttr, ((rec || {})[adiAttr]) || '') }
										finally { timerSetValue = null }
									}, 1);
								}
							})()
						}
						catch (ex) {
							if (recPromise)
								recPromise.fail(ex);
							console.error(ex);
						}
					}

					const {ekDegisinceHandlers} = this;
					if (!$.isEmptyObject(ekDegisinceHandlers)) {
						const _e = {
							sender: this, mfSinif: mfSinif, kodSaha: kodSaha, adiSaha: adiSaha,
							kodAttr: kodAttr, adiAttr: adiAttr, colDef: colDef,
							rowIndex: rowIndex, dataField: dataField,
							/*columnType: columnType,*/ oldValue: oldValue, newValue: newValue,
							gridPart: gridPart, grid: gridPart.grid, gridWidget: gridWidget,
							tabloKolonlari: gridPart.tabloKolonlari, rec: recPromise,
							setCellValue(e) {
								const _rowIndex = e.rowIndex == null ? rowIndex : e.rowIndex;
								const _dataField = e.dataField || e.belirtec;
								if (dataField == adiAttr) {
									setValueYapildimi = true;
									if (timerSetValue)
										clearTimeout(timerSetValue);
								}
								timerSetValue = setTimeout(() => {
									try { gridWidget.setcellvalue(_rowIndex, _dataField, e.value) }
									finally { timerSetValue = null }
								}, 5);
							}
						};
						for (const i in ekDegisinceHandlers) {
							const handler = ekDegisinceHandlers[i];
							getFuncValue.call(this, handler, _e);
							newValue = _e.newValue;
						}
					}

					return newValue;
				}
			}

			if (!kodKolonu.listedenSec) {
				kodKolonu.listedenSec = e => {
					const {mfSinif} = this;
					const {kodSaha, adiSaha} = mfSinif;
					const kodAttr = kodKolonu.belirtec;
					
					if (!(kodSaha && kodAttr))
						return;

					const adiAttr = adiKolonu ? adiKolonu.belirtec : null;
					const {dataBlock, gridPart} = this;
					const {grid, gridWidget} = gridPart;
					const args = e.args || {};
					const dataField = args.datafield == null ? kodAttr : args.datafield;
					let rowIndex = args.rowindex;
					if (rowIndex == null) {
						const selInfo = gridWidget.getselection() || {};
						rowIndex = selInfo.rows[0];
						if (rowIndex == null)
							rowIndex = (selInfo.cells[0] || {}).rowindex;
					}
					const prevKod = args.value == null ? gridWidget.getcellvalue(rowIndex, dataField) : args.value;

					const part = new MasterListePart({
						mfSinif: mfSinif,
						bindingComplete: e => {
							const {kod} = prevKod;
							if (kod) {
								const recs = (e.source || {}).records || [];
								const index = recs.findIndex(rec => rec[kodSaha] == kod || rec[adiSaha] == kod);
								if (index != false && index > -1)
									e.gridWidget.selectrow(index);
							}
						},
						secince: e => {
							const {rec} = e;
							const kod = rec[kodSaha];
							// const aciklama = rec[adiSaha];
							setTimeout(() => {
								gridWidget.setcellvalue(rowIndex, kodAttr, kod);
								kodKolonu.cellValueChanged({
									args: {
										datafield: dataField,
										rowindex: rowIndex,
										oldvalue: prevKod,
										newvalue: kod
									}
								});
							}, 20);
						}
					});
					setTimeout(() => part.run(), 100);
				};
			}

			if (!kodKolonu.cellClick) {
				kodKolonu.cellClick = e => {
					const {args} = e;
					const isRightClick = (args || {}).rightclick;
					if (isRightClick)
						kodKolonu.listedenSec(e);
				};
			}
			
			/*if (!kodKolonu.cellsRenderer) {
				kodKolonu.cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const {aciklama} = (da_stokKod.records.find(rec => rec.kod == value) || {});
					if (aciklama)
						html = changeTagContent(html, aciklama);
					return html
				}
			}*/
		}

		if (adiKolonu) {
			adiKolonu.readOnly();
		}
		
		const {tabloKolonlari} = e;
		const colDefs = [kodKolonu, adiKolonu];
		for (const i in colDefs) {
			const colDef = colDefs[i];
			if (colDef)
				tabloKolonlari.push(colDef);
		}	
	}

	getDataAdapter(e) {
		const {dataBlock, mfSinif} = this;
		if (!dataBlock)
			return null;

		e = e || {};
		if (mfSinif)
			e.mfSinif = mfSinif;
		
		return new $.jqx.dataAdapter({
			dataType: wsDataType,
			url: 'empty.json',
			data: e
		}, {
			autoBind: true, 
			loadServerData: async (wsArgs, source, callback) => {
				// const _e = $.extend({}, e, { wsArgs: wsArgs, source: source, callback: callback });
				try {
					const _e = $.extend({ sender: this, callback: callback }, wsArgs);
					let result = await getFuncValue.call(this, dataBlock, _e);
					if (result) {
						if ($.isArray(result))
							result = { totalrecords: result.length, records: result };
						if (typeof result == 'object') {
							if (result.records && !result.totalrecords)
								result.totalrecords = result.records.length;
							callback(result);
						}
					}
				}
				catch (ex) {
					console.error(ex);
					
					const errorText = getErrorText(ex);
					hConfirm({
						title: 'Grid AutoComplete Verisi Alınamadı',
						content: (
							`<div class="bold firebrick" style="padding: 13px 8px;">` +
								errorText +
							`</div>`
						)
					});
				}
			}
		})
	}
}


(function() {
	const anaTip2Sinif = GridKolonVeGrupOrtak.prototype.constructor._anaTip2Sinif;
	const subClasses = [GridKolonGrup_KA];
	for (const i in subClasses) {
		const cls = subClasses[i];
		const {anaTip} = cls;
		if (anaTip)
			anaTip2Sinif[anaTip] = cls;
	}

	// const {_templates} = GridKolonGrup_KA.prototype.constructor;
	/*_templates.stok = e => {
		e = e || {};
		const kodAttr = e.kodAttr || 'stokKod';
		const adiAttr = e.adiAttr || 'stokAdi';
		
		return new GridKolonGrup_KA({
			belirtec: 'stok',
			mfSinifAdi: 'PMStok',
			kodKolonu: new GridKolon({ belirtec: kodAttr, text: e.kodEtiket || 'Kod', genislikCh: e.kodGenislikCh || 25 }),
			adiKolonu: new GridKolon({ belirtec: adiAttr, text: e.adiEtiket || 'Açıklama', genislikCh: e.adiGenislikCh }),
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
