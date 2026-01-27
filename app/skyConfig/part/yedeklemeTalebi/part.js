class YedeklemeTalebiPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'yedeklemeTalebi' } static get isWindowPart() { return true } static get recClass() { return YedeklemeTalebiRec }

	constructor(e = {}) {
		super(e)
		$.extend(this, { islem: e.islem, tanitim: e.tanitim, tamamIslemi: e.tamamIslemi, title: e.title == null ? 'Yedekleme Talebi' : e.title || '' });
		this.orjTanitim = this.tanitim;
		let {islem} = this; if (islem) { let islemText = islem[0].toUpperCase() + islem.slice(1); this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]` }
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let {layout, islem} = this
		let btnTamam = this.btnTamam = layout.children('#tamam')
		btnTamam.jqxButton({ theme: theme, width: false, height: false })
		btnTamam.on('click', evt =>
			this.tamamIstendi({ ...e, event: evt }))
		let header = this.header = layout.children('#header')
		let txtTanitim = this.txtTanitim = header.find('.tanitim-parent > #tanitim')
		txtTanitim.on('focus', evt =>
			setTimeout(() => evt.currentTarget.select(), 50))
		; (async () => {
			let tanitim = await this.tanitim
			if (!tanitim) {
				let result = await app.promise_vioConfig
				tanitim = result?.tanitim
			}
			if (tanitim) {
				this.orjTanitim = tanitim
				txtTanitim.val(tanitim)
			}
		})();
		this.initGrid(e)
		let {yetki} = config.session
		if (!(islem == 'degistir' || islem == 'sil') && (yetki == 'developer' || yetki == 'admin')) {
			txtTanitim.removeAttr('readonly disabled');
			txtTanitim.on('change', ({ currentTarget: target }) => {
				delete this.recs
				let tanitim = this.tanitim = target.value?.trim() || this.orjTanitim
				if (target.value != tanitim)
					target.value = tanitim
				this.gridPart.tazele()
			})
		}
	}
	activated(e) {
		super.activated(e)
		setTimeout(() => this.gridPart.grid.focus(), 100)
	}
	initGrid(e = {}) {
		let {layout} = this
		let gridPart = this.gridPart = new GridliGirisPart({
			parentPart: this, gridIDBelirtec: 'id', layout: layout.find('.grid-parent > .grid'),
			argsDuzenle: e => {
				$.extend(e.args, {
					autoRowHeight: false, rowsHeight: 45, columnsHeight: 20, showGroupsHeader: false,
					sortable: true, groupable: true, filterable: true, showFilterRow: true, filterMode: 'excel'
					/* selectionMode: 'multiplerowsextended' */
				})
			},
			tabloKolonlari: this.getGridTabloKolonlari(e),
			loadServerData: e => this.gridLoadServerData(e),
			bindingComplete: e => this.gridBindingComplete(e),
			gridRendered: e => this.gridRendered(e)
		})
		gridPart.run()
		let {grid} = gridPart
		grid.on('cellvaluechanged', evt =>
			this.gridCellValueChanged({ event: evt, args: evt.args }))
	}
	afterRun(e) { super.afterRun(e); this.show() }
	activated(e) {
		super.activated(e)
		setTimeout(() => this.gridPart.grid.focus(), 100)
	}
	destroyPart(e) {
		this.gridPart.destroyPart()
		super.destroyPart()
	}
	async tamamIstendi(e = {}) {
		try {
			let {boundRecs} = this.gridPart
			let recs = boundRecs.filter(_ => _.db && _.zaman1?.toString())
			let _e = { ...e, recs }
			let args = { tanitim: this.tanitim || '' }, data = { recs: _e.recs.map(rec => rec.asObject(e)) }
			let {result} = await app.wsYedeklemeTalebiOlustur({ args, data }) ?? {}
			if (!result)
				return false
			let {tamamIslemi} = this
			if (tamamIslemi) {
				result = await tamamIslemi.call(this, _e)
				if (result === false)
					return false
			}
			this.close()
		}
		catch (ex) {
			cerr(ex)
			hConfirm(getErrorText(ex), 'Yedekleme Talebi')
			throw ex
		}
	}
	getGridTabloKolonlari(e = {}) {
		let getGlobalCellsClassName = (...args) => 
			(colDef, rowIndex, belirtec, value, rec) => {
				let result = [belirtec]
				if (args?.length)
					result.push(...args)
				if (rec.durum)
					result.push(rec.durum)
				/*if (result.includes('button') && rec.onaylimi)
					result.push('disabled')*/
				return result.join(' ')
			};
		let liste = [
			new GridKolon({
				belirtec: 'iptal', text: ' ', width: 40, filterable: false, sortable: false, groupable: false,
				cellClassName: getGlobalCellsClassName('button')
			}).readOnly().tipButton({ value: 'X', onClick: e => this.iptalIstendi(e) }),
			new GridKolon({
				belirtec: 'vtSec', text: ' ', width: 40, filterable: false, sortable: false, groupable: false,
				cellClassName: getGlobalCellsClassName('button')
			}).readOnly().tipButton({ value: 'L', onClick: e => { this.vtSecIstendi(e) } }),
			new GridKolon({
				belirtec: 'server', text: 'Ana Sistem', genislikCh: 20,
				filterType: 'checkedlist', cellClassName: getGlobalCellsClassName()
			}),
			new GridKolon({
				belirtec: 'db', text: 'Veritabanı', width: '20%', minWidth: 200, maxWidth: 500,
				filterType: 'checkedlist', cellClassName: getGlobalCellsClassName()
			})
		];
		let {recClass} = this.class;
		for (let i = 1; i <= recClass.zamanSayi; i++) {
			liste.push(new GridKolon({
				belirtec: `zaman${i}`, text: `Zaman ${i}`, width: 70, filterable: false, sortable: false, groupable: false,
				cellClassName: getGlobalCellsClassName('zaman'), filterType: 'input', columnType: 'template',
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, timeToString(asDate(value) || '', true)),
				createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
					editor.addClass(`${colDef.belirtec} zaman`)
					$(`<input class="editor no-secs" type="time">`)
						.appendTo(editor)
				},
				initEditor: (colDef, rowIndex, value, editor, cellText, pressedChar) => {
					let input = editor.children('.editor')
					input.val(timeToString(asDate(value)) || '')
					setTimeout(() => input.focus(), 10)
				},
				getEditorValue: (colDef, rowIndex, value, editor) => {
					let input = editor.children('.editor')
					return asDate(input.val())
				}
			}).alignCenter())
		}
		for (let colDef of liste) {
			if (!colDef.cellBeginEdit)
				colDef.cellBeginEdit = (...args) => this.gridCellBeginEdit(...args)
			if (!colDef.cellEndEdit)
				colDef.cellEndEdit = (...args) => this.gridCellEndEdit(...args)
		}
		return liste
	}
	async gridLoadServerData(e) {
		let {gridPart, recs} = this
		if (!recs) {
			let {tanitim, class: { recClass }} = this
			tanitim ??= ''
			recs = this.recs = []
			try {
				let {promise_vioConfig} = app
				if (promise_vioConfig)
					await promise_vioConfig
				let result = await app.wsYedeklemeTalebiListesi({ args: { tanitim } }) || {}
				let _recs = result.rows ?? result.recs ?? result
				if (!empty(_recs))
					recs.push(..._recs.map(rec => new recClass(rec)))
			}
			catch (ex) {
				if (ex.statusText?.toLowerCase() != 'parsererror') {
					cerr(ex)
					hConfirm(getErrorText(ex), 'Sky Yedekleme Listesi')
				}
			}
			//if (!recs.length)
			//	recs.push(this.newRec(e))
			 for (let i = 0; i < 10; i++)
				 recs.push(this.newRec(e))
		}
		return recs
	}
	gridBindingComplete(e) {
		let {gridWidget} = this.gridPart, recs = gridWidget.getrows()
		let ind = recs.findIndex(rec => rec.yenimi)
		if (ind > -1)
			setTimeout(() => gridWidget.selectcell(ind, 'db'), 10)
	}
	gridRendered(e) {
		let {gridWidget: { table }} = this.gridPart
		let buttons = table.find('div[role=row] .disabled.jqx-grid-cell button, div[role=row] .disabled.jqx-grid-cell input[type=button]')
		if (buttons.length)
			setButonEnabled(buttons, false)
	}
	gridCellBeginEdit(colDef, rowIndex, belirtec, columnType, value) {
		let {gridWidget} = this.gridPart
		let rec = gridWidget.getrowdata(rowIndex)
		return !!rec
	}
	gridCellEndEdit(colDef, rowIndex, belirtec, columnType, oldValue, newValue) {
		return true
	}
	gridCellValueChanged(e) {
		let {args} = e, {gridWidget} = this.gridPart
		let rec = gridWidget.getrowdata(args.rowindex)
		if (!rec.yenimi)
			rec.yeni?.()
		gridWidget.updaterow(rec.uid, rec, true)
	}
	iptalIstendi({ rec } = {}) {
		if (!rec)
			return false
		if (rec.silindimi)
			return false
		if (rec.onaylimi && rec.silindi)
			rec.silindi?.()
		else
			rec.reset?.()
		let {gridWidget} = this.gridPart
		gridWidget.updaterow(rec.uid, rec, true)
	}
	vtSecIstendi({ rec: selRec }) {
		let {gridPart} = this, {gridWidget} = gridPart
		let part = new MasterListePart({
			tekilmi: false, parentPart: this, gridIDBelirtec: 'db',
			argsDuzenle: ({ args }) =>
				extend(args, { showFilterRow: true }),
			tabloKolonlari: [
				new GridKolon({ belirtec: 'db', text: 'Veritabanı' })
			],
			loadServerData: async ({ sender: { server }} = {}) => {
				try {
					let _e = {}
					if (server)
						_e.args = { sql: { server, db: 'master' } }
					let result = await app.wsDBListe(_e)
					return result.map(db => ({ db }))
				}
				catch (ex) {
					cerr(ex)
					hConfirm(getErrorText(ex), 'Veritabanı Seçimi')
					return []
				}
			},
			bindingComplete: ({ gridWidget: w }) => {
				let {db} = selRec
				if (db) {
					let rec = w.getrowdatabyid(db)
					if (rec) {
						w.clearselection()
						w.selectrow(rec.visibleindex)
					}
				}
			},
			acilinca: e => {
				let {sender: part} = e, {header} = part
				new FormBuilder({
					part, layout: header,
					builders: [
						new FBuilder_ModelKullan({
							id: 'server', placeholder: 'SQL Ana Sistem',
							source: async e => {
								let recs = await app.wsSqlServerListe();
								if (empty(recs)) {
									recs = [
										'(local)', '(local)\\SQL2019', '(local)\\SQL2017', '(local)\\SQL2014', '(local)\\SQL2012',
										'(local)\\SQL2008', '(local)\\SQLEXPRESS', '(local)\\VIO', '(local)\\DEMO', '(local)\\VIODEMO'
									]
								}
								return recs.map(kod => ({ kod, aciklama: kod }))
							},
							degisince: e => {
								let {part} = e.builder.parentBuilder
								let {server: oldValue} = part
								let value = part.server = (e.value ?? e.sender.input.val())?.trim() ?? ''
								if (value != oldValue)
									part.tazele()
							},
							widgetArgsDuzenle: e => {
								let {args, builder: { input }} = e
								extend(args, {
									rendererEk: e => {
										let search = 'modelKullan list-item'
										e.result = e.result
											.replace(search, `${search} ${builder.getElementId(input)}`)
									}
								})
							},
							afterRun: e => {
								let {builder: fbd, builder: { parentBuilder }} = e, {parent, layout, part} = fbd
								parent.css('--header-height', `${parent.height() + layout.height() - 5}px`)
								let {server} = gridRec
								if (server) {
									part.val(server)
									parentBuilder.part.server = server
								}
							},
							styles: [
								`$elementCSS .jqx-combobox-input, $elementCSS .jqx-dropdownlist-content { font-size: 100% !important; font-weight: bold }`,
								`.${e.builder.getElementId(e.builder.input)} { font-size: 110% !important; font-weight: bold }`
							]
						}).comboBox().kodsuz().bosKodAlinir()
							.bosKodEklenir().etiketGosterim_yok().noAutoWidth()
					]
				}).run()
			},
			secince: e => {
				let recs = e.recs.filter(rec => !!rec.db) || [];
				if (recs.length) {
					let {server} = e.sender
					for (let i = 0; i < recs.length; i++) {
						let rec = recs[i], {db} = rec
						if (!i) {
							$.extend(gridRec, { server: server || '', db: db || '' })
							if (!gridRec.yenimi)
								gridRec.yeni()
							gridWidget.updaterow(gridRec.uid, gridRec, true)
						}
						else {
							let _gridRec = this.newRec()
							extend(_gridRec, { server: server || '', db: db || '' });
							if (!_gridRec.yenimi)
								_gridRec.yeni()
							gridWidget.addrow(null, _gridRec, gridRec.boundindex + 1)
						}
					}
					let _recs = gridWidget.getboundrows()
					if (_recs[_recs.length - 1]?.db)
						gridWidget.addrow(null, this.newRec(), 'last')
				}
				setTimeout(() => gridPart.grid.focus(), 100)
			},
			vazgecince: e => { setTimeout(() => gridPart.grid.focus(), 100) }
		});
		part.run()
	}
	newRec(e = {}) {
		let {gridPart} = this
		return gridPart.newRec({ sinif: this.class.recClass, ...e })
	}
}
