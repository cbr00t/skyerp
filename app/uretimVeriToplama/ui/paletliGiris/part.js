class PaletliGirisPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'paletliGiris' }
	static get isWindowPart() { return true }

	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			parentPart: e.parentPart,
			title: e.title == null ? 'Palet Giriş Ekranı' : e.title || '',
			recs: e.recs || [],
			tamamIslemi: e.tamamIslemi
		})
	}

	runDevam(e) {
		e = e || {};
		super.runDevam(e);
		
		const {layout} = this;
		const btnTamam = layout.find('#tamam');
		btnTamam.jqxButton({ theme: theme, width: false, height: false });
		btnTamam.on('click', evt =>
			this.tamamIstendi($.extend({}, e, { event: evt })));
		
		const header = layout.find('#header');
		const txtBarkod = this.txtBarkod = header.find('#barkodParent > #barkod');
		txtBarkod.on('keyup', evt => {
			const key = (evt.key || '').toLowerCase();
			if (key == 'enter' || key == 'linefeed') {
				const input = evt.currentTarget;
				const value = (input.value || '').trim();
				const _e = $.extend({}, e, { event: evt, input: $(input), barkod: value });
				this.barkodOkutuldu(_e)
			}
		});
		txtBarkod.on('focus', evt => {
			// evt.currentTarget.value = null;
			const {gridWidget} = this.gridPart || {};
			const {editcell} = gridWidget || {};
			if (editcell)
				gridWidget.endcelledit(editcell.rowindex, editcell.datafield, true)
			setTimeout(() => evt.currentTarget.select(), 5)
		});
		
		for (const elm of [layout.find('input[type=textbox][type=text][type=number]')]) {
			elm.on('focus', evt =>
				evt.currentTarget.select())
		}

		this.initGrid(e)
	}

	initGrid(e) {
		e = e || {};
		const {layout} = this;
		const ozelBelirtecSet = asSet(['_rowNumber', '_durum', '_sil']);
		const globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => {
			const durum = rec._durum;
			let result = [belirtec];
			if (!ozelBelirtecSet[belirtec]) {
				if (!colDef.attributes.editable)
					result.push('grid-readOnly')
			}
			return result.join(' ')
		};
		const gridIslemTuslari_width = 40;
		const tabloKolonlari = [];
		tabloKolonlari.push(
			new GridKolon({
				belirtec: '_sil', text: ' ',
				minWidth: gridIslemTuslari_width, maxWidth: gridIslemTuslari_width + 10, width: gridIslemTuslari_width,
				cellClassName: globalCellsClassName
			}).tipButton({ value: 'X', onClick: e => this.silIstendi(e) }).readOnly()
		);
		if (config.dev) {
			tabloKolonlari.push(
				new GridKolon({
					belirtec: 'barkod', text: 'Barkod', minWidth: 100, maxWidth: 300, width: '10%', cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly(),
				new GridKolon({
					belirtec: 'oemSayac', text: 'OEM ID', minWidth: 60, maxWidth: 110, width: '4%', cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly()
			)
		}
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'emirNox', text: 'Emir', minWidth: 80, maxWidth: 130, width: '6%', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const id2Recs = (app.getMQRecs({ cacheOnly: true, mfSinif: MQEmir, idListe: [value] }) || {}).id2Recs || {};
					const _rec = id2Recs[value] || {};
					return changeTagContent(
						html,
						(
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${dateKisaString(asDate(_rec.tarih)) || ''}</div>`
						)
					)
				}
			}).tipNumerik().readOnly(),
			new GridKolon({
				belirtec: 'opNo', text: 'Operasyon', minWidth: 130, maxWidth: 300, width: '10%',
				/* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const id2Recs = (app.getMQRecs({ cacheOnly: true, mfSinif: MQOperasyon, idListe: [value] }) || {}).id2Recs || {};
					const _rec = id2Recs[value] || {};
					return changeTagContent(
						html,
						(
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'stokKod', text: 'Ürün', minWidth: 200, maxWidth: 500, width: '20%', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const id2Recs = (app.getMQRecs({ cacheOnly: true, mfSinif: MQStok, idListe: [value] }) || {}).id2Recs || {};
					const _rec = id2Recs[value] || {};
					return changeTagContent(
						html,
						(
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''} ${_rec.brm || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'tezgahKod', text: 'Tezgah', minWidth: 100, maxWidth: 300, width: '10%',
				/* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const id2Recs = (app.getMQRecs({ cacheOnly: true, mfSinif: MQTezgah, idListe: [value] }) || {}).id2Recs || {};
					const _rec = id2Recs[value] || {};
					return changeTagContent(
						html,
						(
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''}</div>`
						)
					)
				}
			}).tipTekSecim({
				source: e => {
					let result = this.parentPart.ekBilgiParts.tezgah.widget.source.getrecords();
					if (!result) {
						const id2Recs = (app.getMQRecs({ cacheOnly: false, mfSinif: MQTezgah }) || {}).id2Recs || {};
						result = Object.values(id2Recs)
					}
					return result
				}
			}),
			new GridKolon({
				belirtec: 'perKod', text: 'Personel', minWidth: 100, maxWidth: 300, width: '10%',
				/* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const id2Recs = (app.getMQRecs({ cacheOnly: true, mfSinif: MQPersonel, idListe: [value] }) || {}).id2Recs || {};
					const _rec = id2Recs[value] || {};
					return changeTagContent(
						html,
						(
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''}</div>`
						)
					)
				}
			}).tipTekSecim({
				source: e => {
					let result = this.parentPart.ekBilgiParts.personel.widget.source.getrecords();
					if (!result) {
						const id2Recs = (app.getMQRecs({ cacheOnly: false, mfSinif: MQPersonel }) || {}).id2Recs || {};
						result = Object.values(id2Recs)
					}
					return result
				}
			}),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', minWidth: 70, maxWidth: 130, width: 90,
				/* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
			}).tipDecimal(),
			new GridKolon({
				belirtec: 'ekOzellikler', text: 'Ek Özellikler', minWidth: 100, maxWidth: 400, width: '20%',
				filterType: 'input', cellClassName: globalCellsClassName,
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
			parentPart: this, gridIDBelirtec: 'id',
			layout: layout.find('.grid-parent > .grid'),
			argsDuzenle: e => {
				$.extend(e.args, {
					autoRowHeight: true, rowsHeight: 50, columnsHeight: 20, showGroupsHeader: false, /*selectionMode: 'multiplerowsextended',*/
					groupable: true, filterable: true, showFilterRow: true /*, filterMode: 'excel'*/
				})
			},
			tabloKolonlari: tabloKolonlari,
			loadServerData: e => {
				return $.merge([], this.recs).reverse().map(_rec =>
					_rec && _rec.deepCopy ? _rec.deepCopy() : $.extend({}, _rec))
			},
			gridRendered: e =>
				this.onGridRendered(e)
		}).sabit();
		gridPart.run();
		
		const {grid} = gridPart;
		grid.on('cellvaluechanged', evt =>
			this.onCellValueChanged({ event: evt, args: evt.args }))
	}

	afterRun(e) {
		super.afterRun(e);
		this.show()
	}

	activated(e) {
		super.activated(e);
		setTimeout(() => this.txtBarkod.focus(), 10)
	}

	destroyPart(e) {
		const {gridPart} = this;
		if (gridPart)
			gridPart.destroyPart()
		
		super.destroyPart()
	}

	tazele(e) {
		const gridPart = this.gridPart || {};
		const {gridWidget} = gridPart;
		if (gridWidget)
			gridPart.tazele()
	}

	tamamIstendi(e) {
		e = e || {};
		const {tamamIslemi} = this;
		if (tamamIslemi) {
			const _e = $.extend({}, e, {
				recs: $.merge([], (this.gridPart.boundRecs || [])).reverse()
			});
			if (getFuncValue.call(this, tamamIslemi, _e) === false)
				return false
		}
		this.close()
	}

	async barkodOkutuldu(e) {
		const {txtBarkod} = this;
		let carpan = null;
		let barkod = (e.barkod || '').trim();
		if (barkod) {
			const barkodLower = barkod.toLowerCase();
			for (const separator of ['x', '*']) {
				const parts = barkod.split(separator, 2);
				if (parts.length > 1) {
					carpan = asFloat(parts[0]) || null;
					barkod = parts[1].trim();
					break
				}
			}
		}
		
		try {
			const barkodParser = barkod ? (await app.barkodBilgiBelirleBasit({ barkod: barkod, carpan: carpan })) : null;
			if (!barkodParser) {
				txtBarkod.addClass('barkod-error');
				txtBarkod.val(null);
				setTimeout(() => txtBarkod.removeClass('barkod-error'), 400);
				app.playSound_barkodError();
				return false
			}

			txtBarkod.addClass('barkod-success');
			setTimeout(() => txtBarkod.removeClass('barkod-success'), 200);
            app.playSound_barkodOkundu();
			
            const rec = this.getBarkodRec({ barkodParser: barkodParser });
			if (!rec)
				return
			rec.ekBilgileriBelirle();
            this.recs.push(rec);
			setTimeout(() => this.gridPart.tazele(), 200)
            /*const {gridWidget} = this.gridPart;
			setTimeout(rec => gridWidget.addrow(null, rec, 'first'), 300, $.extend({}, rec))*/
         }
         catch (ex) {
            app.playSound_barkodError();
			txtBarkod.addClass('barkod-error');
			setTimeout(() => txtBarkod.removeClass('barkod-error'), 400);
            throw ex
         }
         finally {
            txtBarkod.val(null);
            txtBarkod.focus()
         }
	}

	silIstendi(e) {
		const {gridWidget, rec} = e;
		// gridWidget.deleterow(rec.uid);
		const {recs} = this;
		const index = recs.findIndex(_rec => _rec.uid = rec.uid);
		if (index > -1)
			recs.splice(index, 1);
		setTimeout(() => this.gridPart.tazele(), 100);
		setTimeout(() => this.txtBarkod.focus(), 200)
	}

	onGridRendered(e) {
		// const {gridWidget} = e;
		// const {table} = gridWidget;

		for (const rec of this.recs)
			rec.ekBilgileriBelirle()
	}

	onCellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
		return true
	}

	onCellEndEdit(colDef, rowIndex, belirtec, cellType, oldValue, newValue) {
		setTimeout(() => this.txtBarkod.focus(), 200);
		return true
	}

	onCellValueChanged(e) {
		const {args} = e;
		const gridWidget = args.owner;
		const gridRec = gridWidget.getrowdata(args.rowindex);
		const rec = this.recs.find(_rec => _rec.id == gridRec.id);
		if (rec)
			$.extend(rec, gridRec)
	}

	getBarkodRec(e) {
		e = e || {};
		const barkodRec = new MQBarkodRec();
		const {barkodParser} = e;
		const barkod = e.barkod || (barkodParser || {}).okunanBarkod;
		if (barkod != null)
			barkodRec.barkod = barkod
		
		if (barkodParser) {
			let {miktar} = barkodParser;
			if (!miktar)
				miktar = ((barkodParser.paketIcAdet || 0) * (barkodParser.carpan || 1))
			if (!miktar)
				miktar = e.miktar || 1
			
			const {oemSayac, shKod} = barkodParser;
			if (oemSayac)
				barkodRec.oemSayac = asInteger(oemSayac) || null
			if (shKod)
				barkodRec.stokKod = shKod
			
			const {numerikSahalarSet, anahtarSahalarBasit, ekOzellikSahalar} = barkodRec.class;
			for (const key of anahtarSahalarBasit) {
				const value = barkodParser[key];
				if (value)
					barkodRec[key] = numerikSahalarSet[key] ? (asInteger(value) || null) : value
			}
			const ekOzellikler = barkodRec.ekOzellikler = barkodRec.ekOzellikler || {};
			for (const key of ekOzellikSahalar) {
				const value = barkodParser[key];
				if (value)
					ekOzellikler[key] = value
			}
			barkodRec.miktar = miktar;
			barkodRec.carpan = barkodParser.carpan
		}	
		return barkodRec
	}
	onResize(e) {
		super.onResize(e);
		this.gridPart.onResize(e)
	}
}
