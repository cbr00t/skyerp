class SecerekGerceklemePart extends GridliGostericiWindowPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'secerekGercekleme' }
	/*static get isWindowPart() { return true }*/

	constructor(e) {
		e = e || {};
		super(e);
		$.extend(this, {
			parentPart: e.parentPart,
			title: e.title == null ? 'Seçerek Gerçekleme Ekranı' : e.title || '',
			hatKod: e.hatKod
		})
	}
	runDevam(e) {
		e = e || {};
		super.runDevam(e);
		this.initLayout(e)
	}
	afterRun(e) {
		super.afterRun(e)
		//this.show()
	}
	initLayout(e) {
		const {layout} = this;
		const header = this.header = layout.find('#header');
		this.islemTuslari = header.find('#islemTuslari');
		
		const butonlar = header.find('button');
		butonlar.jqxButton({ theme: theme });
		butonlar.on('click', evt =>
			this.butonaTiklandi({ event: evt, id: evt.currentTarget.id }));

		const rfb = new RootFormBuilder({ part: this, layout: layout });
		rfb.addModelKullan({ id: 'hat', placeholder: '- Üretim Hattı -', mfSinif: MQHat })
			.comboBox().autoBind().etiketGosterim_yok()
			.setParent(e =>
				e.builder.rootPart.header.find('#hat > .veri'))
			.degisince(e => {
				const value = (e.value || '').trim();
				this.hatKod = value
			})
			.veriYukleninceBlock(e => {
				const {part} = e.builder;
				const {widget} = part;
				setTimeout(() => {
					widget.input.focus();
					setTimeout(() => {
						if (!widget.isOpened())
							widget.open()
					}, 100)
				}, 200)
			})
			.onAfterRun(e => {
				const {builder} = e;
				const part = builder.rootPart;
				part.fbd_hat = builder
			});
		rfb.run();
		
		header.find('.jqx-dropdownlist').addClass('veri');
		for (const elm of [layout.find('input[type=textbox],input[type=text],input[type=number]')]) {
			elm.on('focus', evt =>
				evt.currentTarget.select())
		}
	}
	gridInit(e) {
		super.gridInit(e);
		const {grid} = this;
		grid.on('rowselect', evt =>
			this.gridSecimDegisti({ event: evt, args: evt.args, flag: true }));
		grid.on('rowunselect', evt =>
			this.gridSecimDegisti({ event: evt, args: evt.args, flag: false }))
	}
	gridArgsDuzenleDevam(e) {
		super.gridArgsDuzenleDevam(e);
		const {args} = e;
		$.extend(e.args, {
			autoRowHeight: true, rowsHeight: 55, columnsHeight: 18, showGroupsHeader: true, /*selectionMode: 'multiplerowsextended',*/
			groupable: true, sortable: false, filterable: true, showFilterRow: true, /* filterMode: 'excel', */
			autoShowLoadElement: false, selectionMode: 'checkbox'
		})
	}
	get defaultTabloKolonlari() {
		const liste = this.defaultTabloKolonlariDogrudan;
		for (const colDef of liste) {
			if (colDef.filterType === undefined)
				colDef.filterType = 'checkedlist'
			colDef.cellClassName = colDef.cellClassNameEk ?? ((...args) => this.grid_globalCellClassNameHandler(...args));
			delete colDef.cellClassNameEk;
			if (colDef.isEditable) {
				if (colDef.cellBeginEdit === undefined)
					colDef.cellBeginEdit = (...args) => this.onCellBeginEdit(...args)
				if (colDef.cellEndEdit === undefined)
					colDef.cellEndEdit = (...args) => this.onCellEndEdit(...args)
			}
		}
		return liste
	}
	get defaultTabloKolonlariDogrudan() {
		const ozelBelirtecSet = asSet(['_rowNumber', '_durum', '_sil']);
		const globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => {
			const durum = rec._durum;
			let result = [belirtec];
			if (!ozelBelirtecSet[belirtec]) {
				if (!colDef.attributes.editable)
					result.push('grid-readOnly')
			}
			switch (durum) {
				case 'new':
					result.push('bold', 'forestgreen');
					break;
				case 'changing':
				case 'changed':
					result.push('bold', 'royalblue');
					break;
				case 'removed':
					result.push('grid-readOnly', 'bold', 'red', 'bg-lightred-transparent', 'opacity-5', 'strikeout');
					break;
				case 'error':
					result.push('bold orangered');
					break;
				case 'offline':
					result.push('lightgray');
					break;
			}
			return result.join(' ')
		};
		const tabloKolonlari = super.defaultTabloKolonlari || [];
		tabloKolonlari.push(
			new GridKolon({
				belirtec: '_durum', text: 'D', width: 50, cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const durum = rec._durum;
					let imgName = '';
					let color = '';
					switch (durum) {
						case 'changing': imgName = 'degistir.png'; break;
						// case 'processing': imgName = 'iletisim.png'; break;
						case 'processing': imgName = 'loading.gif'; break;
						case 'done': imgName = 'tamam_blue.png'; color = 'red'; break;
						case 'error': imgName = 'uyari.png'; break;
						case 'removed': imgName = 'x.png'; break;
						case 'offline': imgName = 'graydot.png'; break;
					}
					return `<div class="full-wh" style="${color ? `color: ${color} !important; ` : ''}background-size: 24px; background-repeat: no-repeat; background-position: center; background-image: url(../../images/${imgName})" />`
				}/*,
				cellClick: e =>
					this.retryIstendi($.extend({}, e, { force: true, rec: e.args.row.bounddata }))*/
			}).sabitle().readOnly()
		);
		if (config.dev) {
			tabloKolonlari.push(
				new GridKolon({
					belirtec: 'gerSayac', text: 'Ger. ID', minWidth: 60, maxWidth: 110, width: '4%',
					filterType: 'checkedlist', cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly(),
				new GridKolon({
					belirtec: 'oemSayac', text: 'OEM ID', minWidth: 60, maxWidth: 110, width: '4%',
					filterType: 'checkedlist', cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly()
			)
		}
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'emirNox', text: 'Emir', minWidth: 80, maxWidth: 130, width: '6%',
				filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const {recs} = app.getMQRecs({ cacheOnly: true, mfSinif: MQEmir, idListe: [value] }) || {};
					const _rec = (recs || [])[0] || {};
					return changeTagContent(
						html, (
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${dateKisaString(asDate(_rec.tarih)) || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'opNo', text: 'Operasyon', minWidth: 130, maxWidth: 300, width: '10%',
				filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const {recs} = app.getMQRecs({ cacheOnly: true, mfSinif: MQOperasyon, idListe: [value] }) || {};
					const _rec = (recs || [])[0] || {};
					return changeTagContent(
						html, (
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'stokKod', text: 'Ürün', minWidth: 200, maxWidth: 500, width: '20%',
				/* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const {recs} = app.getMQRecs({ cacheOnly: true, mfSinif: MQStok, idListe: [value] }) || {};
					const _rec = (recs || [])[0] || {};
					return changeTagContent(
						html, (
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''} ${_rec.brm || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'tezgahKod', text: 'Tezgah', minWidth: 100, maxWidth: 300, width: '10%',
				/* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const {recs} = app.getMQRecs({ cacheOnly: true, mfSinif: MQTezgah, idListe: [value] }) || {};
					const _rec = (recs || [])[0] || {};
					return changeTagContent(
						html, (
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''}</div>`
						)
					)
				}
			}).tipTekSecim({
				source: e =>
					app.getMQRecs({ cacheOnly: false, mfSinif: MQTezgah }) || {}
			}),
			new GridKolon({
				belirtec: 'perKod', text: 'Personel', minWidth: 100, maxWidth: 300, width: '10%',
				/* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const {recs} = app.getMQRecs({ cacheOnly: true, mfSinif: MQPersonel, idListe: [value] }) || {};
					const _rec = (recs || [])[0] || {};
					return changeTagContent(
						html, (
							`<div class="kod">${value}</div>` +
							`<div class="ek-veri">${_rec.aciklama || ''}</div>`
						)
					)
				}
			}).tipTekSecim({
				source: e =>
					app.getMQRecs({ cacheOnly: false, mfSinif: MQPersonel }) || {}
			}),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', minWidth: 70, maxWidth: 130, width: 90,
				/* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
			}).tipDecimal(),
			new GridKolon({
				belirtec: 'basTS', text: 'Başlangıç', width: 80,
				filterable: false, filterType: 'input',
				cellClassName: globalCellsClassName, columnType: 'template',
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					value = asDate(value);
					if (value != null && value.setSeconds)
						value.setSeconds(0)
					if (timeKisaString(value) == '00:00')
						value = ''
					return changeTagContent(html, timeKisaString(asDate(value), true) || '')
				},
				createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
					editor.addClass(`${colDef.belirtec} ts`);
					const input = $(`<input class="editor no-secs" type="time">`);
					input.appendTo(editor)
				},
				initEditor: (colDef, rowIndex, value, editor, cellText, pressedChar) => {
					const input = editor.children('.editor');
					input.val(timeToString(asDate(value)) || '');
					setTimeout(() => input.focus(), 10)
				},
				getEditorValue: (colDef, rowIndex, value, editor) => {
					const input = editor.children('.editor');
					return asDate(input.val())
				}
			}),
			new GridKolon({
				belirtec: 'bitTS', text: 'Bitiş', width: 110,
				filterable: false, filterType: 'input', cellClassName: globalCellsClassName, columnType: 'template',
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					value = asDate(value);
					if (value != null && value.setSeconds)
						value.setSeconds(0)
					
					let bitTS = value;
					let basTS = asDate(rec.basTS);
					let farkSn = (bitTS < basTS)
									? (24 * 60 * 60) - ((basTS - bitTS) / 1000)
									: (bitTS - basTS) / 1000;
					if (farkSn)
						farkSn = asSaniyeKisaString(roundToFra(farkSn, 0), true)
					
					if (timeKisaString(value) == '00:00')
						value = ''
					
					return changeTagContent(
						html,
						(
							`<div class="kod">${timeKisaString(value, true) || ''}</div>` +
							( farkSn
								? `<div class="ek-veri"><span class="title">Fark: </span><span class="veri">${farkSn || ''}</span></div>`
								: ''
							)
						)
					)
					return 
				},
				createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
					editor.addClass(`${colDef.belirtec} ts`);
					const input = $(`<input class="editor no-secs" type="time">`);
					input.appendTo(editor)
				},
				initEditor: (colDef, rowIndex, value, editor, cellText, pressedChar) => {
					const input = editor.children('.editor');
					input.val(timeToString(asDate(value)) || '');
					setTimeout(() => input.focus(), 10)
				},
				getEditorValue: (colDef, rowIndex, value, editor) => {
					const input = editor.children('.editor');
					return asDate(input.val())
				}
			}),
			new GridKolon({
				belirtec: 'ekBilgi', text: 'Ek Bilgi', minWidth: 40, maxWidth: 500, width: '20%',
				filterType: 'input', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const htmlListe = [];
					const ekOzellikler = rec.ekOzellikler || {};
					if (!$.isEmptyObject(ekOzellikler)) {
						const subHTMLListe = [];
						for (const key in ekOzellikler) {
							const value = ekOzellikler[key];
							if (value) {
								subHTMLListe.push(
									`<div class="ekOzellik">` +
										`<span class="etiket">${key}</span>` +
										`<span class="ek-bilgi">=</span>` +
										`<span class="veri">${value.toLocaleString()}</span>` +
									`</div>`
								)
							}
						}
						if (subHTMLListe.length) {
							htmlListe.push(
								`<li class="ekOzellikler flex-row">` + '\r\n' +
									`<div class="title">Ek Özellikler</div>` +
									`<span class="ek-bilgi">: </span>` + '\r\n' +
									`<div class="content flex-row">` + '\r\n' +
										subHTMLListe.join('\r\n') + '\r\n' +
									`</div>` + '\r\n' +
								`</li>` + '\r\n'
							)
						}
					}

					const {iskartalar} = rec;
					if (!$.isEmptyObject(iskartalar)) {
						const subHTMLListe = [];
						for (const kod in iskartalar) {
							subHTMLListe.push(
								`<div class="iskarta">` +
									`<span class="etiket">${kod}</span>` +
									`<span class="ek-bilgi">: </span>` +
									`<span class="veri">${(iskartalar[kod] || 0).toLocaleString()}</span>` +
								`</div>`
							)
						}
						htmlListe.push(
							`<li class="iskartalar flex-row">` + '\r\n' +
								`<div class="title">Iskartalar</div>` +
								`<span class="ek-bilgi">: </span>` + '\r\n' +
								`<div class="content flex-row">` + '\r\n' +
									subHTMLListe.join('\r\n') + '\r\n' +
								`</div>` + '\r\n' +
							`</li>` + '\r\n'
						)
					}
					
					return changeTagContent(
						html,
						( htmlListe.length ? '\r\n' + `<ul>${htmlListe.join('\r\n')}</ul>` : '' )
					)
				}
			}).readOnly()
		);
		return tabloKolonlari
	}
	async defaultLoadServerData(e) {
		await app.promise_ready;
		const yerelParam = app.params.yerel;
		const gerceklemeler = yerelParam.gerceklemeler || [];
		return $.merge([], gerceklemeler).reverse().map(_rec =>
			_rec && _rec.deepCopy ? _rec.deepCopy() : $.extend({}, _rec))
	}
	grid_globalCellClassNameHandler(colDef, rowIndex, belirtec, value, rec) {
		let result = [belirtec];
		let _result = this.grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec);
		if (!$.isEmptyObject(_result))
			result.push(..._result)
		return result.join(' ')
	}
	grid_globalCellClassNameHandler_ek(colDef, rowIndex, belirtec, value, rec) {
		const {ozelBelirtecSet} = MQBarkodRec;
		const durum = rec._durum;
		let result = [belirtec];
		if (!ozelBelirtecSet[belirtec]) {
			if (!colDef.attributes.editable)
				result.push('grid-readOnly')
		}
		switch (durum) {
			case 'new':
				result.push('bold', 'forestgreen');
				break;
			case 'changing':
			case 'changed':
				result.push('bold', 'royalblue');
				break;
			case 'removed':
				result.push('grid-readOnly', 'bold', 'red', 'bg-lightred-transparent', 'opacity-5', 'strikeout');
				break;
			case 'error':
				result.push('bold orangered');
				break;
			case 'offline':
				result.push('lightgray');
				break;
		}
		return result
	}

	getBarkodRec(e) {
		e = e || {};
		let rec = e.rec ?? new MQBarkodRec();
		rec.hatKod = this.hatKod;
		return rec
	}
	focusToDefault(e) { }

	butonaTiklandi(e) {
		const {id} = e;
		console.debug('butonaTiklandi', e);
		switch (id) {
			case 'listedenSec': return this.listedenSecIstendi(e)
			case 'ekle': return this.ekleIstendi(e)
			case 'degistir': return this.degistirIstendi(e)
			case 'sil': return this.silIstendi(e)
			case 'gonder': return this.gonderIstendi(e)
		}
	}
	listedenSecIstendi(e) {
		const btn = $(e.event.currentTarget);
		const elmNext = btn.next();
		let part = elmNext.data('part') || elmNext.find('.formBuilder-element').data('part');
		if (part.listedenSecIstendi)
			part.listedenSecIstendi(e)
	}
	async ekleIstendi(e) {
		e = e || {};
		const {gridWidget} = this;
		try {
			let gridRec = this.getBarkodRec();
			const promise_wait = new $.Deferred();
			await MQBarkodRec.tanimla({
				islem: 'yeni', inst: gridRec,
				kaydetIslemi: e => {
					gridRec = e.inst;
					console.debug('tanimPart', 'kaydetIslemi', e);
					promise_wait.resolve(e);
					return true
				},
				kapaninca: e =>
					promise_wait.resolve(null)
			});
			let rdlg = await promise_wait;
			if (!rdlg)
				return false
			
			await app.promise_ready;
			const yerelParam = app.params.yerel;
			const gerceklemeler = yerelParam.gerceklemeler = yerelParam.gerceklemeler || [];
			gerceklemeler.push(gridRec);
			yerelParam.kaydet();
			
			gridWidget.addrow(null, gridRec, 'first');
			setTimeout(() => {
				gridWidget.clearselection();
				gridWidget.selectrow(gridRec.visibleindex)
			}, 10);
			return true
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Ekle İşlemi'); throw ex }
		finally { setTimeout(() => this.focusToDefault(), 50) }
	}
	async degistirIstendi(e) {
		e = e || {};
		const {gridWidget} = this;
		try {
			const selectedRowIndexes = gridWidget.getselectedrowindexes();
			let gridRecs = e.recs || (e.rec ? [e.rec] : null) || selectedRowIndexes.map(index => gridWidget.getrowdata(index));
			gridRecs = gridRecs.filter(rec => rec && rec._durum != 'processing');
			if ($.isEmptyObject(gridRecs))
				return false
			
			let gridRec = gridRecs[0];
			const promise_wait = new $.Deferred();
			MQBarkodRec.tanimla({
				islem: 'degistir', inst: gridRec,
				kaydetIslemi: e => {
					gridRec = e.inst;
					console.debug('tanimPart', 'kaydetIslemi', e);
					promise_wait.resolve(e);
					return true
				},
				kapaninca: e =>
					promise_wait.resolve(null)
			});
			let rdlg = await promise_wait;
			if (!rdlg)
				return false

			await app.promise_ready;
			const yerelParam = app.params.yerel;
			const gerceklemeler = yerelParam.gerceklemeler || [];
			let index = gerceklemeler.findIndex(rec => rec.id == gridRec.id);
			if (index != -1) {
				const localRec = gerceklemeler.splice(index, 1)[0];
				if (localRec) {
					localRec._durum = gridRec._durum;
					yerelParam.kaydet()
				}
			}
			gridWidget.updaterow(gridRec.uid, gridRec);
			setTimeout(() => {
				gridWidget.clearselection();
				gridWidget.selectrow(gridRec.visibleindex)
			}, 10);
			return true
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Ekle İşlemi'); throw ex }
		finally { setTimeout(() => this.focusToDefault(), 50) }
	}
	async silIstendi(e) {
		e = e || {};
		const {gridWidget} = this;
		try {
			const selectedRowIndexes = gridWidget.getselectedrowindexes();
			let gridRecs = e.recs || (e.rec ? [e.rec] : null) || selectedRowIndexes.map(index => gridWidget.getrowdata(index));
			gridRecs = gridRecs.filter(rec => rec && rec._durum != 'processing');
			if ($.isEmptyObject(gridRecs))
				return false

			await app.promise_ready;
			const yerelParam = app.params.yerel;
			const gerceklemeler = yerelParam.gerceklemeler || [];
			let yerelParamDegistimi = false;
			const silinen_gridRecs = [];
			for (const gridRec of gridRecs) {
				let index = gerceklemeler.findIndex(rec => rec.id == gridRec.id);
				if (index != -1) {
					const localRec = gerceklemeler.splice(index, 1)[0];
					if (localRec) {
						yerelParamDegistimi = true;
						localRec._durum = gridRec._durum
					}
				}
				silinen_gridRecs.push(gridRec)
			}
			if (yerelParamDegistimi)
				yerelParam.kaydet()
			
			if (!$.isEmptyObject(silinen_gridRecs)) {
				const coklumu = silinen_gridRecs.length > 1;
				if (coklumu)
					gridWidget.beginupdate()
				try {
					for (const rec of silinen_gridRecs)
						gridWidget.deleterow(rec.uid)
				}
				finally {
					if (coklumu)
						gridWidget.endupdate(false)
				}
			}
			setTimeout(() => {
				gridWidget.clearselection();
				gridWidget.selectrow(gridRec.visibleindex)
			}, 10);
			return true
		}
		catch (ex) { hConfirm(getErrorText(ex), 'SİL İşlemi'); throw ex }
		finally { setTimeout(() => this.focusToDefault(), 50) }
	}
	async gonderIstendi(e) {
		e = e || {}
		const args = e.args || {};
		const gridWidget = args.owner || this.gridPart.gridWidget;
		const selectedRowIndexes = gridWidget.getselectedrowindexes();
		let recs = e.recs || (e.rec ? [e.rec] : null) || selectedRowIndexes.map(index => gridWidget.getrowdata(index));
		if ($.isEmptyObject(recs))
			recs = gridWidget.getboundrows()
		if (recs)
			recs = recs.filter(rec => !(rec._durum == 'done' || rec._durum == 'changing' || rec._durum == 'removed'))
		if ($.isEmptyObject(recs)) {
			displayMessage('Gönderilecek bilgi yok', ' ');
			return
		}
		const ignoreSet = asSet(['done', 'changing', 'removed']);
		const yeniDurum = 'processing';
		gridWidget.beginupdate();
		for (const rec of recs) {
			if (ignoreSet[rec._durum])
				continue
			if (rec._durum != yeniDurum) {
				rec._durum = yeniDurum;
				gridWidget.updaterow(rec.uid, rec)
			}
		}
		gridWidget.endupdate(false);
		
		try { await app.veriAktarici_timerProc({ recs: _recs }) }
		finally { this.tazele() }

		setTimeout(() => {
			gridWidget.clearselection();
			this.focusToDefault(e)
		}, 10)
	}
	async gridRendered(e) {
		await super.gridRendered(e);
		if (this.inEvent_gridRendered)
			return
		const timerKey = '_timer_eventReset_gridRendered';
		clearTimeout(this[timerKey]);
		delete this[timerKey];
		this.inEvent_gridRendered = true;
		try {
			await app.promise_ready;
			const yerelParam = app.params.yerel;
			const gerceklemeler = yerelParam.gerceklemeler || [];
			for (const rec of gerceklemeler)
				rec.ekBilgileriBelirle()
		}
		finally {
			this[timerKey] = setTimeout(() => {
				this.inEvent_gridRendered = false;
				delete this[timerKey]
			}, 10)
		}
	}
	gridSecimDegisti(e) {
		/*const {args} = e;
		const gridWidget = args.owner;
		const selectedRowIndexes = gridWidget.getselectedrowindexes()*/
	}
}
