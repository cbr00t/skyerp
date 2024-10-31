class PaletliGirisPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'paletliGiris' } static get isWindowPart() { return true }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			parentPart: e.parentPart, title: e.title == null ? 'Palet Giriş Ekranı' : e.title || '', recs: e.recs || [], tamamIslemi: e.tamamIslemi })
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e);
		const {layout} = this, btnTamam = layout.find('#tamam');
		btnTamam.jqxButton({ theme, width: false, height: false }); btnTamam.on('click', evt => this.tamamIstendi($.extend({}, e, { event: evt })));
		const header = layout.find('#header'), txtBarkod = this.txtBarkod = header.find('#barkodParent > #barkod');
		txtBarkod.on('keyup', evt => {
			const key = (evt.key || '').toLowerCase();
			if (key == 'enter' || key == 'linefeed') {
				const input = evt.currentTarget, value = (input.value || '').trim();
				const _e = $.extend({}, e, { event: evt, input: $(input), barkod: value }); this.barkodOkutuldu(_e)
			}
		});
		txtBarkod.on('focus', evt => {
			const {gridWidget} = this.gridPart || {}, {editcell} = gridWidget || {};
			if (editcell) { gridWidget.endcelledit(editcell.rowindex, editcell.datafield, true) }
			setTimeout(() => evt.currentTarget.select(), 5)
		});
		for (const elm of [layout.find('input[type=textbox][type=text][type=number]')]) { elm.on('focus', evt => { evt.currentTarget.select() }) }
		this.initGrid(e)
	}
	initGrid(e) {
		e = e || {}; const {layout} = this, ozelBelirtecSet = asSet(['_rowNumber', '_durum', '_sil']);
		const globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => {
			const durum = rec._durum; let result = [belirtec];
			if (!ozelBelirtecSet[belirtec]) { if (!colDef.attributes.editable) { result.push('grid-readOnly') } }
			return result.join(' ')
		};
		const gridIslemTuslari_width = 40, tabloKolonlari = [];
		tabloKolonlari.push(
			new GridKolon({ belirtec: '_sil', text: ' ', minWidth: gridIslemTuslari_width, maxWidth: gridIslemTuslari_width + 10, width: gridIslemTuslari_width, cellClassName: globalCellsClassName }).tipButton({ value: 'X', onClick: e => this.silIstendi(e) }).readOnly());
		if (config.dev) {
			tabloKolonlari.push(
				new GridKolon({ belirtec: 'barkod', text: 'Barkod', genislikCh: 13, cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly(),
				new GridKolon({ belirtec: 'gerSayac', text: 'Ger.ID', genislikCh: 6, /* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly(),
				new GridKolon({ belirtec: 'oemSayac', text: 'OEMID', genislikCh: 6, /* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly()
			)
		}
		tabloKolonlari.push(
			new GridKolon({ belirtec: 'emirNox', text: 'Emir', genislikCh: 7, filterable: true, filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => { return changeTagContent(html, `<div class="kod">${rec.emirNox}</div><div class="ek-veri">${dateKisaString(asDate(rec.emirTarih)) || ''}</div>`) }
			}).readOnly(),
			new GridKolon({ belirtec: 'opAdi', text: 'Operasyon', genislikCh: 16, filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => { return changeTagContent(html, `<div class="kod">${rec.opNo}</div><div class="ek-veri">${rec.opAdi || ''}</div>`) }
			}).readOnly(),
			new GridKolon({ belirtec: 'stokAdi', text: 'Ürün', genislikCh: 25, filterType: 'input', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => { return changeTagContent(html, `<div class="kod">${rec.stokKod || ''}</div><div class="ek-veri">${rec.stokAdi || ''} ${rec.brm || ''}</div>`) }
			}).readOnly(),
			...MQTezgah.getGridKolonlar({
				belirtec: 'tezgah', argsDuzenle: e => {
					const {kolonGrup} = e, {kaKolonu} = kolonGrup;
					$.extend(kaKolonu, { filterType: 'checkedlist', cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args) })
				}
			}),
			...MQPersonel.getGridKolonlar({
				belirtec: 'per', argsDuzenle: e => {
					const {kolonGrup} = e, {kaKolonu} = kolonGrup;
					$.extend(kaKolonu, { filterType: 'checkedlist', cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args) })
				}
			}),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', minWidth: 70, maxWidth: 130, width: 90, /* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
			}).tipDecimal(),
			new GridKolon({
				belirtec: 'ekOzellikler', text: 'Ek Özellikler', minWidth: 100, maxWidth: 400, width: '20%', filterType: 'input', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const ekOzellikler = rec.ekOzellikler || {};
					const items = [];
					for (const key in ekOzellikler) {
						const value = ekOzellikler[key];
						if (value)
							items.push(value)
					}
					return changeTagContent(
						html,
						(
							`<div class="kod">${items.join(delimWS)}</div>`
						)
					)
				}
			}).readOnly()
		)
		const gridPart = this.gridPart = new GridliGirisPart({
			parentPart: this, gridIDBelirtec: 'id', layout: layout.find('.grid-parent > .grid'),
			argsDuzenle: e => {
				$.extend(e.args, {
					autoRowHeight: true, rowsHeight: 50, columnsHeight: 20, showGroupsHeader: false, /*selectionMode: 'multiplerowsextended',*/
					groupable: true, filterable: true, showFilterRow: true /*, filterMode: 'excel'*/
				})
			},
			tabloKolonlari, loadServerData: e => { return [...this.recs].reverse().map(_rec => _rec && _rec.deepCopy ? _rec.deepCopy() : $.extend({}, _rec)) },
			gridRendered: e => this.onGridRendered(e)
		}).sabit();
		gridPart.run();
		const {grid} = gridPart; grid.on('cellvaluechanged', evt => this.onCellValueChanged({ event: evt, args: evt.args }))
	}
	afterRun(e) { super.afterRun(e); this.show() }
	activated(e) { super.activated(e); setTimeout(() => this.txtBarkod.focus(), 10) }
	destroyPart(e) { const {gridPart} = this; if (gridPart) { gridPart.destroyPart() } super.destroyPart() }
	tazele(e) { const gridPart = this.gridPart || {}, {gridWidget} = gridPart; if (gridWidget) { gridPart.tazele() } }

	tamamIstendi(e) {
		e = e || {}; const {tamamIslemi} = this;
		if (tamamIslemi) { const _e = { ...e, recs: [...this.gridPart.boundRecs || []].reverse() }; if (getFuncValue.call(this, tamamIslemi, _e) === false) { return false } }
		this.close()
	}
	async barkodOkutuldu(e) {
		const {txtBarkod} = this; let carpan = null, barkod = e.barkod?.trim();
		if (barkod) {
			const barkodLower = barkod.toLowerCase(); for (const separator of ['x', '*']) {
				const parts = barkod.split(separator, 2); if (parts.length > 1) { carpan = asFloat(parts[0]) || null;  barkod = parts[1].trim(); break } }
		}
		try {
			const barkodParser = barkod ? (await app.barkodBilgiBelirleBasit({ barkod: barkod, carpan: carpan })) : null;
			if (!barkodParser) {
				txtBarkod.addClass('barkod-error'); txtBarkod.val(null); setTimeout(() => txtBarkod.removeClass('barkod-error'), 400);
				app.playSound_barkodError(); return false
			}
			txtBarkod.addClass('barkod-success'); setTimeout(() => txtBarkod.removeClass('barkod-success'), 200); app.playSound_barkodOkundu();
            const rec = this.getBarkodRec({ barkodParser }); if (!rec) { return }
			rec.ekBilgileriBelirle().finally(() => { this.recs.push(rec); this.gridPart.tazeleDefer() })
         }
         catch (ex) {
            app.playSound_barkodError(); txtBarkod.addClass('barkod-error');
			setTimeout(() => txtBarkod.removeClass('barkod-error'), 400); throw ex
         }
         finally { txtBarkod.val(null); txtBarkod.focus() }
	}
	silIstendi(e) {
		const {gridPart} = this, {gridWidget} = gridPart; let rec = e.rec ?? gridPart.selectedRec;
		if (rec) { gridWidget.deleterow(rec.uid); this.recs = gridPart.boundRecs } setTimeout(() => this.txtBarkod.focus(), 200)
	}
	onGridRendered(e) { /* for (const rec of this.recs) { rec.ekBilgileriBelirle() } */ }
	onCellBeginEdit(colDef, rowIndex, belirtec, colType, value) { return true }
	onCellEndEdit(colDef, rowIndex, belirtec, cellType, oldValue, newValue) { setTimeout(() => this.txtBarkod.focus(), 200); return true }
	onCellValueChanged(e) {
		/*const {args} = e, gridWidget = args.owner, gridRec = gridWidget.getrowdata(args.rowindex);
		const rec = this.recs.find(_rec => _rec.id == gridRec.id); if (rec) { $.extend(rec, gridRec) }*/
	}
	getBarkodRec(e) {
		e = e || {}; const barkodRec = new MQBarkodRec(), {barkodParser} = e;
		const barkod = e.barkod || barkodParser?.okunanBarkod; if (barkod != null) { barkodRec.barkod = barkod }
		if (barkodParser) {
			let {miktar} = barkodParser; if (!miktar) { miktar = ((barkodParser.paketIcAdet || 0) * (barkodParser.carpan || 1)) }
			if (!miktar) { miktar = e.miktar || 1 }
			const {oemSayac, shKod} = barkodParser; if (oemSayac) { barkodRec.oemSayac = asInteger(oemSayac) || null }
			if (shKod) { barkodRec.stokKod = shKod }
			const {numerikSahalarSet, anahtarSahalarBasit, ekOzellikSahalar} = barkodRec.class;
			for (const key of anahtarSahalarBasit) { const value = barkodParser[key]; if (value) { barkodRec[key] = numerikSahalarSet[key] ? (asInteger(value) || null) : value } }
			const ekOzellikler = barkodRec.ekOzellikler = barkodRec.ekOzellikler || {};
			for (const key of ekOzellikSahalar) { const value = barkodParser[key]; if (value) { ekOzellikler[key] = value } }
			const {carpan} = barkodParser; $.extend(barkodRec, { miktar, carpan })
		}	
		return barkodRec
	}
	onResize(e) { super.onResize(e); this.gridPart.onResize(e) }
}
