class GridKolonGrup_KA extends GridKolonGrup {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get defaultKodZorunlumu() { return true }
	get mfSinif() {
		let { _mfSinif: res } = this
		if (isFunction(res) || res?.run) {
			let colDef = this, { sender } = this
			let { selectedRec: rec } = this.gridPart ?? {}
			return getFuncValue.call(this, res, { sender, colDef, rec })
		}
		return value
	}
	set mfSinif(value) { this._mfSinif = value }
	get kodBelirtec() { return this.kodAttr }
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

		let { tabloKolonlari } = e
		let getCurIndex = (gp, ec, i) => {
			if (i == null || i < 0) {
				ec ??= gp?.editCell
				i = ec?.rowindex ?? gp?.selectedRowIndex
			}
			return i == null || i < 0 ? null : i
		}
		
		let getCurRec = (gp, ec, i) => {
			i = getCurIndex(gp, ec, i)
			if (i == null)
				return null
			
			let { gridWidget: w } = gp ?? {}
			return w?.getrowdata(i)
		}
		
		let getEditorPart = (gp, editor) => {
			let { editCell } = gp ?? {}
			editor ??= editCell?.editor
			let part = editor?.data?.('part')
			let { isDestroyed, input } = part ?? {}
			if (isDestroyed || !input?.length)
				part = null
			return { editCell, part, editor, input }
		}
		
		let secince = async (e = {}) => {
			let { gridPart: asilGP = this.gridPart, recs, rowIndex = e.rowindex } = e
			let { gridWidget: asilWidget } = asilGP
			let { mfSinif, kodAttr, adiAttr } = this
			let { kodSaha, adiSaha } = mfSinif ?? {}
			if (!(kodSaha && kodAttr) || empty(recs))
				return

			rowIndex = getCurIndex(asilGP, null, rowIndex)
			if (rowIndex == null || rowIndex < 0)
				return

			asilGP?.endCellEdit(false)    // endEdit: rollback
			await delay(1)
			
			let { belirtec = e.dataField ?? e.datafield, oldValue = e.prevKod } = e
			belirtec ||= kodAttr
			oldValue ??= asilWidget?.getcellvalue(rowIndex, kodAttr)
			asilWidget?.beginupdate()
			try {
				let gr = getCurRec(asilGP, null, rowIndex)
				;{
					let r = recs[0]
					let kod = r[kodSaha]
					// gr[kodAttr] = r[kodSaha]
					gr[kodAttr] = null
					gr[adiAttr] = r[adiSaha]

					let args = {
						owner: asilWidget, datafield: belirtec, rowindex: rowIndex,
						oldvalue: oldValue, newvalue: kod
					}
					this._temp_nextRec = r
					asilWidget?.setcellvalue(rowIndex, kodAttr, kod)
					if (this._temp_nextRec !== undefined) {
						kaKolonu.cellValueChanged?.({ args, rec: r })
						delete this._temp_nextRec
					}
				}
				
				if (recs.length > 1) {
					// diğer satırları toplu ekle
					let _e = { rec, after: 'cur', noEvent: true }
					;[...recs.slice(1)].reverse().forEach(rec =>
						asilGP.addRow(_e))

					// toplu ekleme sonrası 'satır sayısı değişti' için son event'i tetikle (varsa)
					let { signalEvent } = _e
					signalEvent?.()
				}
			}
			finally {
				asilWidget?.endupdate(false)
				setTimeout(() => asilWidget?.focus(), 50)
			}
		}
		
		// kaKolonu.editable()    // normalde editable gelir ama aksi belirtilmiş ise dokunma
		if (!kaKolonu.columnType)
			kaKolonu.columnType = 'custom'

		kaKolonu.createEditor ??= (cd, i, v, editor, text, w, h) => {
			let { gridPart: gp, belirtec: k, tip: { kodGosterilmesinmi: kodsuzmu } = {} } = cd
			i = getCurIndex(gp, null, i)
			
			// içeriğinde eski editor varsa temizle
			let { part: ep } = getEditorPart(gp, editor)
			ep?.destroyPart?.()
			editor.empty()

			;{
				let parentPart = this, layout = editor, colDef = cd
				let { dataBlock: gridSource } = this
				let source = gridSource
					? async _e => {
						let sender = this
						let gridPart = gp
						let { fis = gp.inst } = gridPart
						let { mfSinif } = this    // block ise sonucu
						let { kodSaha: kodAttr, adiSaha: adiAttr } = mfSinif
						let gridRec = getCurRec(gp, null, i)
						let { zorunluKod: kod, term: value } = _e    // sadece autocomplete için filtrelenir
						// let { kod = _e.value } = _e
						// let { value = _e.term ?? _e.text } = _e
						return await getFuncValue.call(this, gridSource, {
							sender, gridPart,
							mfSinif, fis, gridRec,
							kodAttr, adiAttr,
							kod, value
						})
					}
					: null
				let args = {
					parentPart, colDef, layout,
					mfSinif: e =>
						this.mfSinif,
					value: v, kodsuzmu,
					argsDuzenle: ({ input }) =>
						input.css({ width: w, height: h })
				}
				if (source) {
					let listSource = source
					extend(args, { source, listSource })
				}
				ep = new SimpleComboBoxPart(args)
					.noQueue()
					.noInitCommit()
				ep.run()
				editor.data('part', ep)
				
				let { input } = ep
				input.on('input.gridKA', () => {
					ep._dirtyInput = true
					deleteKeys(ep, '_gridPendingValue', '_gridPendingItem')
				})
				
				ep.onChange(async _e => {
					let { type, item, value = _e.kod, recs } = _e
					type = type || (
						_e.select ? 'select' :
						_e.commit ? 'commit' :
						_e.trigger ? 'trigger' :
						null
					)
					if (type == 'batch')
						return

					if (type == 'list') {
						let gridPart = gp    // asıl gridPart
						let belirtec = k, oldValue = v
						recs ??= makeArray(item)
						extend(ep, { _gridListApplied: true, _dirtyInput: false })
						deleteKeys(ep, '_gridPendingValue', '_gridPendingItem')
						secince({ gridPart, recs, belirtec, oldValue })
						return
					}

					if (type == 'select' || type == 'commit') {
						if (ep) {
							value ??= ep.val()
							if (value != null) {
								let { mfSinif } = this
								let { kodSaha, adiSaha } = mfSinif ?? {}
								let recs = await source?.({ zorunluKod: value })
								let aciklama = recs?.find(r => r[kodSaha] == value)?.[adiSaha]
								if (aciklama === undefined) {
									ep.val(null)
									value = null
									item = ep.item
								}
								ep.aciklama = aciklama
								
								let { kodAttr, adiAttr } = this
								let gr = getCurRec(gp), { gridWidget: w } = gp
								gr[kodAttr] = null
								gr[adiAttr] = aciklama
								w.setcellvalue(i, kodAttr, value)
							}
							extend(ep, {
								_gridPendingValue: value,
								_gridPendingItem: item,
								_dirtyInput: false
							})
						}
					}
				})

				input.on('keydown.gridKA', evt => {
					let key = evt.key?.toLowerCase()
					if (key == 'f4') {
						evt.preventDefault()
						kaKolonu.listedenSec?.({
							event: evt,
							args: {
								owner: w, datafield: k,
								rowindex: i, value: v
							}
						})
						return
					}
					if (key == 'enter' || key == 'linefeed' || key == 'tab') {
						setTimeout(() => gp.endCellEdit(true), 10)    // commit & end edit
						// let { gridWidget: w } = gp
						// w.setcellvalue(i, k, ep?._gridPendingValue)
					}
				})
			}
		}

		kaKolonu.initEditor ??= (cd, i, v, editor, text, pressedChar) => {
			let { gridPart: gp, belirtec: k } = cd
			let { part: ep } = getEditorPart(gp, editor)
			if (!ep)
				return

			let { gridWidget: w } = gp
			i = getCurIndex(gp, null, i)
			let gr = getCurRec(gp, null, i)
			
			let { mfSinif } = this                                  // block ise sonucu
			let { kodSaha, adiSaha } = mfSinif ?? ep                // mfSinif'a ait
			let { kodAttr, adiAttr } = this                         // grid colDef'e ait
			extend(ep, { _dirtyInput: !!pressedChar, _gridListApplied: false })
			deleteKeys(gp, '_gridPendingValue', '_gridPendingItem')
			ep.setItem({
				[ kodSaha ]: v ?? '',
				[ adiSaha ]: gr?.[adiAttr] ?? ''
			})

			let { input } = ep
			text ??= (pressedChar ?? '').toString() ?? ''
			input.val(text)
			setTimeout(() => {
				ep.focus()
				if (pressedChar) {
					let { length: len } = text
					input[0]?.setSelectionRange?.(len, len)
				}
				else
					input.select()

				ep.onResize()
			}, 1)
		}

		kaKolonu.getEditorValue ??= (cd, i, v, editor) => {
			let { gridPart: gp, belirtec: k } = cd
			let { part: ep } = getEditorPart(gp, editor)
			if (!ep)
				return editor.val?.() ?? v ?? null
			
			let { gridWidget: w } = gp
			let { kodAttr, adiAttr } = this                         // grid colDef'e ait
			i = getCurIndex(gp, null, i)
			
			if (ep._gridListApplied)
				return gridWidget.getcellvalue(rowIndex, kodAttr) ?? null

			let { input, _gridPendingValue: penVal, _gridPendingItem: item, _dirtyInput: dirty } = ep
			if (penVal !== undefined && item) {
				let { mfSinif } = this
				let { adiSaha } = mfSinif ?? ep
				let gr = getCurRec(gp, null, i)
				if (gr)
					gr[adiAttr] = item[adiAttr] ?? item[adiSaha] ?? gr[adiAttr] ?? null
				return penVal ?? null
			}

			let inputVal = input?.val()
			if (dirty)
				return inputVal
			
			return ep.val() ?? inputVal ?? null
		}

		kaKolonu.cellValueChanged ??= ({ args, rec }) => {
			rec ??= this._temp_nextRec
			delete this._temp_nextRec
			args ??= {}
			let { colDef: cd, owner: w, rowindex: i, datafield: k, oldvalue: oldValue, newvalue: newValue } = args
			let gp = cd?.gridPart ?? w?.gridPart
			cd ??= gp?.belirtec2Kolon?.[k]
			if (cd == null)
				return

			let gr = getCurRec(gp, null, i)
			if (!gr || gr.gridKADesteklenmezmi)
				return

			let { ekDegisinceHandlers: handlers } = this
			if (!empty(handlers)) {
				let sender = this, owner = w, colDef = this
				let { mfSinif, kodAttr, adiAttr } = this
				let { kodSaha, adiSaha } = mfSinif
				let { fis = gp.inst } = gp
				let e = {
					sender, mfSinif, kodAttr, adiAttr, kodSaha, adiSaha,
					colDef, rowIndex: i, dataField: k,
					oldValue, newValue, gridPart: gp,
					grid: gp.grid, gridWidget: w,
					fis, gridRec: gr,
					get tabloKolonlari() {
						return gp.tabloKolonlari
					},
					rec,
					args: {
						sender, owner,
						datafield: k, rowindex: i,
						oldvalue: oldValue, newvalue: newValue
					},
					setCellValue(e = {}) {
						let { rowIndex = i, belirtec = e.dataField ?? e.datafield ?? k, value } = e
						if (belirtec != adiAttr)
							w.setcellvalue(rowIndex, belirtec, value)
					}
				}

				newValue = promise(async () => {
					let v = newValue
					for (let h of handlers) {
						await h.call(this, e)
						v = e.newValue
					}
					return v
				})
			}

			return newValue
		}

		kaKolonu.cellsRenderer = (cd, i, b, v, html, jqxCol, gr) => {
			let { adiAttr } = this
			let kod = v, adi = gr[adiAttr]
			let { kodGosterilmesinmi: kodsuzmu } = cd?.tip ?? {}
			let result = [
				( kod && !(adi && kodsuzmu) ? `<b>${kod}</b>` : null ),
				adi
			].filter(Boolean).join(' - ')
			if (result)
				html = changeTagContent(html, result)
			return html
		}
		
		kaKolonu.cellClick = e => {
			let { rightclick: right } = e?.args ?? {}
			if (right)
				return kaKolonu.listedenSec(e)
		}

		kaKolonu.listedenSec = e => {
			let { sender: gp, args = {} } = e
			gp ??= kaKolonu?.gridPart
			let { gridWidget: w } = gp
			if (w == null)
				return

			/*let { part: ep } = getEditorPart(gp)
			if (ep)
				return ep.listeIstendi(e)*/
			
			let { mfSinif, kodAttr } = this
			if (!mfSinif)
				return
			
			let { rowIndex: i = args.rowindex, belirtec: k = args.datafield, gridRec: gr, value: v, setCellValue: callback } = e
			if (v == null) {
				gr ??= getCurRec(gp, null, i)
				v = gr?.[kodAttr] ?? null
			}
			mfSinif.listeEkraniAc({
				// value: v,
				secince
			})
		}

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
