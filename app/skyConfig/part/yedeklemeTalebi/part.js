class YedeklemeTalebiPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'yedeklemeTalebi' } static get isWindowPart() { return true } static get recClass() { return YedeklemeTalebiRec }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { islem: e.islem, tanitim: e.tanitim, tamamIslemi: e.tamamIslemi, title: e.title == null ? 'Yedekleme Talebi' : e.title || '' });
		this.orjTanitim = this.tanitim;
		const {islem} = this; if (islem) { const islemText = islem[0].toUpperCase() + islem.slice(1); this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]` }
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e); const {layout, islem} = this;
		const btnTamam = this.btnTamam = layout.children('#tamam');
		btnTamam.jqxButton({ theme: theme, width: false, height: false });
		btnTamam.on('click', evt => this.tamamIstendi($.extend({}, e, { event: evt })));
		const header = this.header = layout.children('#header');
		const txtTanitim = this.txtTanitim = header.find('.tanitim-parent > #tanitim');
		txtTanitim.on('focus', evt => setTimeout(() => evt.currentTarget.select(), 50));
		(async () => {
			let tanitim = await this.tanitim; if (!tanitim) { let result = await app.promise_vioConfig; tanitim = result?.tanitim }
			if (tanitim) { this.orjTanitim = tanitim; txtTanitim.val(tanitim) }
		})();
		this.initGrid(e);
		const {yetki} = config.session;
		if (!(islem == 'degistir' || islem == 'sil') && (yetki == 'developer' || yetki == 'admin')) {
			txtTanitim.removeAttr('readonly disabled');
			txtTanitim.on('change', evt => {
				const target = evt.currentTarget; delete this.recs;
				let tanitim = this.tanitim = (target.value || '').trim() || this.orjTanitim; if (target.value != tanitim) { target.value = tanitim }
				this.gridPart.tazele()
			})
		}
	}
	activated(e) { super.activated(e); setTimeout(() => this.gridPart.grid.focus(), 100) }
	initGrid(e) {
		e = e || {}; const {layout} = this;
		const gridPart = this.gridPart = new GridliGirisPart({
			parentPart: this, gridIDBelirtec: 'id', layout: layout.find('.grid-parent > .grid'),
			argsDuzenle: e => {
				$.extend(e.args, {
					autoRowHeight: false, rowsHeight: 45, columnsHeight: 20, showGroupsHeader: false, /*selectionMode: 'multiplerowsextended',*/
					sortable: true, groupable: true, filterable: true, showFilterRow: true, filterMode: 'excel'
				})
			},
			tabloKolonlari: this.getGridTabloKolonlari(e), loadServerData: e => this.gridLoadServerData(e),
			bindingComplete: e => this.gridBindingComplete(e), gridRendered: e => this.gridRendered(e)
		});
		gridPart.run();
		const {grid} = gridPart; grid.on('cellvaluechanged', evt => this.gridCellValueChanged({ event: evt, args: evt.args }))
	}
	afterRun(e) { super.afterRun(e); this.show() }
	activated(e) { super.activated(e); setTimeout(() => this.gridPart.grid.focus(), 100) }
	destroyPart(e) { this.gridPart.destroyPart(); super.destroyPart() }
	async tamamIstendi(e) {
		e = e || {};
		try {
			let recs = (this.gridPart.boundRecs || []).filter(rec => !!rec.db && !!(rec.zaman1 || '').toString() /* (rec.durum == 'yeni' || rec.durum == 'silindi') */);
			const _e = $.extend({}, e, { recs: recs });
			let wsResult = await app.wsYedeklemeTalebiOlustur({ args: { tanitim: this.tanitim || '' }, data: { recs: _e.recs.map(rec => rec.asObject(e)) } });
			let result = (wsResult || {}).result; if (!result) return false
			const {tamamIslemi} = this;
			if (tamamIslemi) { result = await getFuncValue.call(this, tamamIslemi, _e); if (result === false) return false }
			this.close()
		}
		catch (ex) { console.error(ex); displayMessage(getErrorText(ex), 'Yedekleme Talebi'); throw ex }
	}
	getGridTabloKolonlari(e) {
		e = e || {};
		const getGlobalCellsClassName = (...args) => 
			(colDef, rowIndex, belirtec, value, rec) => {
				const result = [belirtec];
				if (args?.length) result.push(...args)
				if (rec.durum) result.push(rec.durum)
				/*if (result.includes('button')) { if (rec.onaylimi) result.push('disabled') }*/
				return result.join(' ')
			};
		const liste = [
			new GridKolon({ belirtec: 'iptal', text: ' ', width: 40, filterable: false, sortable: false, groupable: false, cellClassName: getGlobalCellsClassName('button') }).readOnly
				().tipButton({ value: 'X', onClick: e => { this.iptalIstendi(e) } }),
			new GridKolon({ belirtec: 'vtSec', text: ' ', width: 40, filterable: false, sortable: false, groupable: false, cellClassName: getGlobalCellsClassName('button') }).readOnly()
			.tipButton({ value: 'L', onClick: e => { this.vtSecIstendi(e) } }),
			new GridKolon({ belirtec: 'server', text: 'Ana Sistem', genislikCh: 20, filterType: 'checkedlist', cellClassName: getGlobalCellsClassName() }),
			new GridKolon({ belirtec: 'db', text: 'Veritabanı', width: '20%', minWidth: 200, maxWidth: 500, filterType: 'checkedlist', cellClassName: getGlobalCellsClassName() })
		];
		const {recClass} = this.class;
		for (let i = 1; i <= recClass.zamanSayi; i++) {
			liste.push(new GridKolon({
				belirtec: `zaman${i}`, text: `Zaman ${i}`, width: 70, filterable: false, sortable: false, groupable: false, cellClassName: getGlobalCellsClassName('zaman'), filterType: 'input', columnType: 'template',
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => { return changeTagContent(html, timeToString(asDate(value) || '', true)) },
				createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => { editor.addClass(`${colDef.belirtec} zaman`); const input = $(`<input class="editor no-secs" type="time">`); input.appendTo(editor) },
				initEditor: (colDef, rowIndex, value, editor, cellText, pressedChar) => { const input = editor.children('.editor'); input.val(timeToString(asDate(value)) || ''); setTimeout(() => input.focus(), 10) },
				getEditorValue: (colDef, rowIndex, value, editor) => { const input = editor.children('.editor'); return asDate(input.val()) }
			}).alignCenter())
		}
		for (const colDef of liste) {
			if (!colDef.cellBeginEdit) { colDef.cellBeginEdit = (...args) => this.gridCellBeginEdit(...args) }
			if (!colDef.cellEndEdit) { colDef.cellEndEdit = (...args) => this.gridCellEndEdit(...args) }
		}
		return liste
	}
	async gridLoadServerData(e) {
		const {gridPart} = this; let {recs} = this;
		if (!recs) {
			const {recClass} = this.class; recs = this.recs = [];
			try {
				const {promise_vioConfig} = app; if (promise_vioConfig) await promise_vioConfig
				const result = await app.wsYedeklemeTalebiListesi({ args: { tanitim: this.tanitim || '' } }) || {}; let _recs = result.rows || result.recs || result;
				if (_recs && _recs.length) { _recs = _recs.map(rec => new recClass(rec)); recs.push(..._recs) }
			}
			catch (ex) { if (ex.statusText?.toLowerCase() != 'parsererror') { console.error(ex); displayMessage(getErrorText(ex), 'Sky Yedekleme Listesi') } }
			//if (!recs.length)
			//	recs.push(this.newRec(e))
			 for (let i = 0; i < 10; i++) { recs.push(this.newRec(e)) }
		}
		return recs
	}
	gridBindingComplete(e) {
		const {gridWidget} = this.gridPart, recs = gridWidget.getrows(), ind = recs.findIndex(rec => rec.yenimi);
		if (ind > -1) { setTimeout(() => gridWidget.selectcell(ind, 'db'), 10) }
	}
	gridRendered(e) {
		const {gridWidget} = this.gridPart, {table} = gridWidget;
		const buttons = table.find('div[role=row] .disabled.jqx-grid-cell button, div[role=row] .disabled.jqx-grid-cell input[type=button]');
		if (buttons.length) { setButonEnabled(buttons, false) }
	}
	gridCellBeginEdit(colDef, rowIndex, belirtec, columnType, value) { const {gridWidget} = this.gridPart, rec = gridWidget.getrowdata(rowIndex); return !!rec }
	gridCellEndEdit(colDef, rowIndex, belirtec, columnType, oldValue, newValue) { return true }
	gridCellValueChanged(e) {
		const {args} = e, {gridWidget} = this.gridPart, rec = gridWidget.getrowdata(args.rowindex);
		if (!rec.yenimi && rec.yeni) { rec.yeni() } gridWidget.updaterow(rec.uid, rec, true)
	}
	iptalIstendi(e) {
		const gridRec = e.rec; if (gridRec.silindimi) { return false } /* if (gridRec.onaylimi) return false */
		const {gridWidget} = this.gridPart, {rec} = e;
		if (rec.onaylimi) { if (rec.silindi) rec.silindi() }
		else { if (rec.reset) { rec.reset() } }
		gridWidget.updaterow(rec.uid, rec, true)
	}
	vtSecIstendi(e) {
		const gridRec = e.rec, {gridPart} = this, {gridWidget} = gridPart;
		const part = new MasterListePart({
			tekilmi: false, parentPart: this, gridIDBelirtec: 'db', argsDuzenle: e => { $.extend(e.args, { showFilterRow: true }) },
			tabloKolonlari: [ new GridKolon({ belirtec: 'db', text: 'Veritabanı' }) ],
			loadServerData: async e => {
				try {
					const _e = {}, {server} = e.sender;
					if (server) { _e.args = { sql: { server: server, db: 'master' } } }
					const result = await app.wsDBListe(_e); return result.map(db => { return { db } })
				}
				catch (ex) { console.error(ex); displayMessage(getErrorText(ex), 'Veritabanı Seçimi'); return [] }
			},
			bindingComplete: e => { const {db} = gridRec; if (db) { const {gridWidget} = e, rec = gridWidget.getrowdatabyid(db); if (rec) { gridWidget.clearselection(); gridWidget.selectrow(rec.visibleindex) } } },
			acilinca: e => {
				const part = e.sender;
				const {header} = part;
				new FormBuilder({
					part: part, layout: header, builders: [
						new FBuilder_ModelKullan({
							id: 'server', placeholder: 'SQL Ana Sistem',
							source: async e => {
								let recs = await app.wsSqlServerListe();
								if ($.isEmptyObject(recs)) {
									recs = [
										'(local)', '(local)\\SQL2019', '(local)\\SQL2017', '(local)\\SQL2014', '(local)\\SQL2012',
										'(local)\\SQL2008', '(local)\\SQLEXPRESS', '(local)\\VIO', '(local)\\DEMO', '(local)\\VIODEMO'
									]
								}
								return recs.map(kod => { return { kod, aciklama: kod } })
							},
							degisince: e => {
								const {part} = e.builder.parentBuilder, oldValue = part.server, value = part.server = ((e.value ?? e.sender.input.val()) || '').trim();
								if (value != oldValue) { part.tazele() }
							},
							widgetArgsDuzenle: e => { const {builder} = e; $.extend(e.args, { rendererEk: e => { const search = 'modelKullan list-item'; e.result = e.result.replace(search, `${search} ${builder.getElementId(builder.input)}`) } }) },
							afterRun: e => {
								const {builder} = e, {parent, layout, part} = builder;
								parent.css('--header-height', `${parent.height() + layout.height() - 5}px`)
								const {server} = gridRec; if (server) { part.val(server); builder.parentBuilder.part.server = server }
							},
							styles: [
								e => `$elementCSS .jqx-combobox-input, $elementCSS .jqx-dropdownlist-content { font-size: 100% !important; font-weight: bold; }`,
								e => `.${e.builder.getElementId(e.builder.input)} { font-size: 110% !important; font-weight: bold; }`
							]
						}).comboBox().kodsuz().bosKodAlinir().bosKodEklenir().etiketGosterim_yok().noAutoWidth()
					]
				}).run()
			},
			secince: e => {
				const recs = e.recs.filter(rec => !!rec.db) || [];
				if (recs.length) {
					const {server} = e.sender;
					for (let i = 0; i < recs.length; i++) {
						const rec = recs[i], {db} = rec;
						if (!i) {
							$.extend(gridRec, { server: server || '', db: db || '' });
							if (!gridRec.yenimi) { gridRec.yeni() } gridWidget.updaterow(gridRec.uid, gridRec, true)
						}
						else {
							const _gridRec = this.newRec(); $.extend(_gridRec, { server: server || '', db: db || '' });
							if (!_gridRec.yenimi) { _gridRec.yeni() } gridWidget.addrow(null, _gridRec, gridRec.boundindex + 1)
						}
					}
					const _recs = gridWidget.getboundrows();
					if (_recs[_recs.length - 1]?.db) { gridWidget.addrow(null, this.newRec(), 'last') }
				}
				setTimeout(() => gridPart.grid.focus(), 100)
			},
			vazgecince: e => { setTimeout(() => gridPart.grid.focus(), 100) }
		});
		part.run()
	}
	newRec(e) { e = e || {}; return this.gridPart.newRec($.extend({}, { sinif: this.class.recClass }, e)) }
}
