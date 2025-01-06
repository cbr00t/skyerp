class BarkodluGerceklemePart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'barkodluGercekleme' } static get isWindowPart() { return true }
	get barkodRec() { return this._barkodRec } set barkodRec(value) { this._barkodRec = value }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			parentPart: e.parentPart, ekBilgiParts: {},
			title: e.title == null ? 'Barkodlu Gerçekleme Ekranı' : e.title || ''
		})
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e);
		this.initLayout(e); this.initGrid(e); this.initLayout_gridSonrasi(e);
		this.reset(e)
	}
	afterRun(e) { super.afterRun(e); this.show() }
	activated(e) {
		super.activated(e);
		setTimeout(() => {
			const {txtBarkod} = this;
			if (txtBarkod.parent().hasClass('jqx-hidden') || txtBarkod.parent().hasClass('basic-hidden')) this.ekBilgiParts.hat.widget.input.focus()
			else txtBarkod.focus()
		}, 300)
	}
	destroyPart(e) { this.gridPart.destroyPart(); super.destroyPart() }
	initLayout(e) {
		const {layout} = this, header = layout.find('#header'), divEkBilgiler = this.divEkBilgiler = layout.find('#ek-bilgiler'), barkodRec = this.getBarkodRec();
		for (const elm of [header, divEkBilgiler]) makeScrollable(elm)
		const btnEkBilgilerToggle = layout.find('#ek-bilgiler-toggle');
		divEkBilgiler.jqxResponsivePanel({ width: false, height: false, collapseBreakpoint: 100000, toggleButton: btnEkBilgilerToggle, theme, animationType, autoClose: false });
		btnEkBilgilerToggle.on('click', evt => setTimeout(() => this.txtBarkod.focus()));
		divEkBilgiler.on('open', evt => { header.addClass('open'); layout.css('--ek-bilgiler-height-current', 'calc(var(--ek-bilgiler-height) + 15px)'); setTimeout(() => this.onResize(e), 1) });
		divEkBilgiler.on('close', evt => { header.removeClass('open'); layout.css('--ek-bilgiler-height-current', '0px'); setTimeout(() => this.onResize(e), 1) });
		divEkBilgiler.jqxResponsivePanel('close');
		const btnGonder = this.btnGonder = header.find('#gonder > button').jqxButton({ theme });
		btnGonder.on('click', evt => this.secilenleriGonderIstendi({ event: evt }));
		/*new FBuilder_ModelKullan({
			parentPart: this, input: header.find('#hat .veri'), id: 'hat', placeholder: '- Üretim Hattı -', mfSinif: MQHat, value: this.getBarkodRec().hatKod,
			degisince: e => {
				const value = (e.value || '').trim(); this.getBarkodRec().hatKod = value;
				const {txtBarkod, ekBilgiParts} = this; txtBarkod.val('');
				if (value) { txtBarkod.parent().removeClass('jqx-hidden basic-hidden'); setTimeout(() => txtBarkod.focus(), 200) }
				else txtBarkod.parent().addClass('jqx-hidden')
				if (ekBilgiParts) {
					for (const id in ekBilgiParts) {
						if (id == 'hat') continue
						const part = ekBilgiParts[id]; if (part.dataBind) part.dataBind()
					}
				}
			},
			bindingComplete: e => {
				const {part} = e.builder, {widget} = part;
				setTimeout(() => { widget.input.focus(); setTimeout(() => { if (!widget.isOpened()) widget.open() }, 100) }, 200)
			},
			afterRun: e => {
				const {part} = e.builder;
				part.dataBind();
				this.ekBilgiParts[e.builder.id] = part
			}
		}).comboBox().autoBind().etiketGosterim_yok().run();*/
		const btnListedenSec_barkod = header.find('#barkod > #listedenSec').jqxButton({ theme, width: false, height: false });
		btnListedenSec_barkod.on('click', evt => this.barkod_listedenSecIstendi($.extend({}, e, { event: evt })));
		const txtBarkod = this.txtBarkod = header.find('#barkod > .veri');
		txtBarkod.on('keyup', evt => {
			const key = (evt.key || '').toLowerCase();
			if (key == 'enter' || key == 'linefeed') {
				const input = evt.currentTarget, value = (input.value || '').trim();
				if (value) { const _e = $.extend({}, e, { event: evt, input: $(input), barkod: value }); this.barkodOkutuldu(_e) }
				/*else { this.retryIstendi({ force: true, recs: [] }) }*/
			}
		});
		txtBarkod.on('focus', evt => {
			evt.currentTarget.value = null; const {gridWidget} = this.gridPart || {};
			const {editcell} = gridWidget || {}; if (editcell) gridWidget.endcelledit(editcell.rowindex, editcell.datafield, true)
			setTimeout(() => evt.currentTarget.select(), 5)
		});
		txtBarkod.on('blur', evt => {
			const input = evt.currentTarget, value = (input.value || '').trim(); if (!value) { return }
			const _e = $.extend({}, e, { event: evt, input: $(input), barkod: value }); this.barkodOkutuldu(_e)
			/*if (this._eventCalisti) { delete this._eventCalisti; return }
			const key = (evt.key || '').toLowerCase();
			if (key == 'enter' || key == 'linefeed') {
				const input = evt.currentTarget, value = (input.value || '').trim();
				const _e = $.extend({}, e, { event: evt, input: $(input), barkod: value }); this.barkodOkutuldu(_e)
			}*/
		});
		const txtMiktar = this.txtMiktar = header.find('#miktar > .veri');
		this.miktar_placeHolder = txtMiktar.attr('placeholder');
		txtMiktar.on('change', evt => { const value = asFloat(evt.currentTarget.value); this.getBarkodRec().miktar = value || null });
		txtMiktar.on('blur', evt => {
			const input = evt.currentTarget; let value = asFloat(input.value); if (!value) value = input.value = 1;
			const _e = $.extend({}, e, { event: evt, input: $(input), miktar: value }); this.miktarOkutuldu(_e)
		});
		txtMiktar.on('keyup', evt => {
			const key = (evt.key || '').toLowerCase();
			if (key == 'enter' || key == 'linefeed') {
				const input = evt.currentTarget; let value = asFloat(input.value); if (!value) value = input.value = 1;
				const _e = $.extend({}, e, { event: evt, input: $(input), miktar: value }); this.ekleIstendi(_e)
			}
		});
		const btnEkle = this.btnEkle = header.find('#ekle > button').jqxButton({ theme, width: false, height: false });
		btnEkle.on('click', evt => this.ekleIstendi($.extend({}, e, { event: evt })));
		const btnIskarta = this.btnIskarta = header.find('#iskarta > button').jqxButton({ theme });
		btnIskarta.on('click', evt => this.iskartaIstendi({ event: evt }));
		const btnKalite = this.btnKalite = header.find('#kalite > button').jqxButton({ theme });
		btnKalite.on('click', evt => this.kaliteIstendi({ event: evt }));
		const btnTopluDegistir = this.btnTopluDegistir = header.find('#topluDegistir > button').jqxButton({ theme });
		btnTopluDegistir.on('click', evt => this.topluDegistirIstendi({ event: evt }));
		const btnTopluSil = this.btnTopluSil = header.find('#topluSil > button').jqxButton({ theme, template: 'danger' });
		btnTopluSil.on('click', evt => this.topluSilIstendi({ event: evt }));
		const btnGerceklemeler = this.btnGerceklemeler = header.find('#gerceklemeler > button').jqxButton({ theme });
		btnGerceklemeler.on('click', evt => this.gerceklemelerIstendi({ event: evt }));
		
		/*const chkOtoGonder = this.chkOtoGonder = divEkBilgiler.find('#otoGonder .veri');
		chkOtoGonder.prop('checked', app.otoGonderFlag);
		chkOtoGonder.on('change', evt => {
			const flag = $(evt.currentTarget).is(':checked'); app.otoGonderFlag = flag;
			const yerelParam = app.params.yerel; if (yerelParam) { yerelParam.otoGonderFlag = flag; yerelParam.kaydet() } app.veriAktarici_startTimer()
		});*/
		const btnPaletliGiris = header.find('#paletliGiris > button');
		btnPaletliGiris.jqxButton({ theme: theme, width: false, height: false });
		btnPaletliGiris.on('click', evt => this.paletliGirisIstendi($.extend({}, e, { event: evt })));
		new FBuilder_ModelKullan({
			parentPart: this, input: divEkBilgiler.find('#tezgah .veri'), id: 'tezgah', placeholder: 'Tezgah', mfSinif: MQTezgah,
			ozelQueryDuzenle: e => {
				const barkodRec = this.barkodRec || {}, {hatKod} = barkodRec, {alias, stm} = e;
				if (hatKod) { for (const sent of stm.getSentListe()) sent.where.degerAta(hatKod, `${alias}.ismrkkod`) }
			},
			degisince: e => this.getBarkodRec().tezgahKod = (e.value || '').trim(),
			afterRun: e => this.ekBilgiParts[e.builder.id] = e.builder.part
		}).comboBox().noAutoBind().etiketGosterim_yok().run();
		new FBuilder_ModelKullan({
			parentPart: this, input: divEkBilgiler.find('#personel .veri'), id: 'personel', placeholder: 'Personel', mfSinif: MQPersonel,
			degisince: e => this.getBarkodRec().perKod = (e.value || '').trim(), afterRun: e => this.ekBilgiParts[e.builder.id] = e.builder.part
		}).comboBox().noAutoBind().etiketGosterim_yok().run();
		layout.find('.modelKullan-parent #listedenSec')
			.jqxButton({ theme: theme, width: false, height: false })
			.on('click', evt => {
				const elm = $(evt.currentTarget), parent = elm.parents('.parent'), id = parent[0].id, part = this.ekBilgiParts[id];
				if (part && part.listedenSecIstendi && !part.isDestroyed) part.listedenSecIstendi()
			});
		const suAnDegistiHandler = e => {
			const evt = e.event, target = e.target ?? $(evt?.currentTarget), value = e.value === undefined ? target?.is(':checked') : e.value;
			for (const prefix of ['bas', 'bit']) {
				const ioAttr = `${prefix}TS`, id = ioAttr, selector = `#${prefix}-zaman`;;
				let elm = divEkBilgiler.find(selector); if (elm.length) { elm[value ? 'addClass' : 'removeClass']('jqx-hidden') }
				const barkodRec = this.getBarkodRec(); barkodRec.suAnmi = value;
				if (value) { $.extend(barkodRec, { basTS: null, bitTS: null }) }
			}
		};
		let chkSuan = divEkBilgiler.find('#suan'); if (barkodRec.suAnmi) { chkSuan.prop('checked', true); suAnDegistiHandler({ value: true }) };
		chkSuan.on('change', event => suAnDegistiHandler({ event }));
		for (const prefix of ['bas', 'bit']) {
			const ioAttr = `${prefix}TS`, id = ioAttr, selector = `#${prefix}-zaman`;;
			const txtDate = divEkBilgiler.find(`${selector} input[type=date]`); if (!txtDate.length) continue
			const txtTime = divEkBilgiler.find(`${selector} input[type=time]`); if (!txtTime.length) continue
			const _barkodRec = this.getBarkodRec();
			if (_barkodRec) txtTime.val(_barkodRec[ioAttr] || '')
			txtTime.on('change', evt => tsDegistiHandler({ event: evt }));
			const {ekBilgiParts} = this; ekBilgiParts[ioAttr] = { date: null, time: txtTime };
			const tsDegistiHandler = e => {
				const evt = e.event ?? e, input = $(evt.currentTarget); parent = input?.parents('.parent');
				let value = asDate(parent.find('input[type=date]').val()) || asDate(tarihDegerDuzenlenmis(_value || 'b'));
				if (value) {
					const txtTime = parent.find('input[type=time]'), timeValue = (txtTime?.length ? asDate(txtTime.val()) : null) || asDate('00:00:00')
					if (timeValue != null) { setTime(value, timeValue.getTime()) }
				}
				this.getBarkodRec()[ioAttr] = value
			};
			txtDate.val(asDate(_barkodRec[`${id}Tarih`])); txtTime.val(asDate(_barkodRec[`${id}Saat`]));
			txtDate.on('change', tsDegistiHandler); txtTime.on('change', tsDegistiHandler)
		}
		header.find('.jqx-dropdownlist').addClass('veri');
		for (const elm of [layout.find('input[type=textbox],input[type=text],input[type=number]')]) { elm.on('focus', evt => evt.currentTarget.select()) }
	}
	initGrid(e) {
		const {layout} = this, {ozelBelirtecSet} = MQBarkodRec;
		const globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => {
			const durum = rec._durum; let result = [belirtec];
			if (!ozelBelirtecSet[belirtec]) { if (!colDef.attributes.editable) result.push('grid-readOnly') }
			switch (durum) {
				case 'new': result.push('bold', 'forestgreen'); break;
				case 'changing':
				case 'changed': result.push('bold', 'royalblue'); break;
				case 'removed': result.push('grid-readOnly', 'bold', 'red', 'bg-lightred-transparent', 'opacity-5', 'strikeout'); break;
				case 'error': result.push('bold orangered'); break;
				case 'offline': result.push('lightgray'); break;
			}
			return result.join(' ')
		};
		const gridIslemTuslari_width = 40, tabloKolonlari = [];
		tabloKolonlari.push(
			new GridKolon({
				belirtec: '_durum', text: 'Drm', filterType: 'checkedlist', minWidth: gridIslemTuslari_width - 10, maxWidth: gridIslemTuslari_width + 10, width: gridIslemTuslari_width,
				cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const durum = rec._durum; let imgName = '', color = '';
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
				cellClick: e => this.retryIstendi($.extend({}, e, { force: true, rec: e.args.row.bounddata }))*/
			}).sabitle().readOnly(),
			new GridKolon({
				belirtec: '_sil', text: ' ', minWidth: gridIslemTuslari_width, maxWidth: gridIslemTuslari_width + 10, width: gridIslemTuslari_width, filterable: false, cellClassName: globalCellsClassName
			}).tipButton({ value: 'X', onClick: e => this.silIstendi(e) }).sabitle().readOnly(),
			new GridKolon({
				belirtec: '_degistir', text: ' ', minWidth: gridIslemTuslari_width, maxWidth: gridIslemTuslari_width + 10, width: gridIslemTuslari_width, filterable: false, cellClassName: globalCellsClassName
			}).tipButton({ value: 'D', onClick: e => this.degistirIstendi(e) }).sabitle().readOnly()
		);
		if (config.dev) {
			tabloKolonlari.push(
				new GridKolon({
					belirtec: 'barkod', text: 'Barkod', genislikCh: 13, cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).readOnly(),
				new GridKolon({
					belirtec: 'gerSayac', text: 'Ger.ID', genislikCh: 6,
					/* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).tipNumerik().readOnly(),
				new GridKolon({
					belirtec: 'oemSayac', text: 'OEMID', genislikCh: 6,
					/* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
					cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
				}).tipNumerik().readOnly()
			)
		}
		tabloKolonlari.push(
			new GridKolon({
				belirtec: 'emirNox', text: 'Emir', genislikCh: 7, filterable: true, filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="kod">${rec.emirNox}</div>` +
							`<div class="ek-veri">${dateKisaString(asDate(rec.emirTarih)) || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'opAdi', text: 'Operasyon', genislikCh: 16, filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="kod">${rec.opNo}</div>` +
							`<div class="ek-veri">${rec.opAdi || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'stokAdi', text: 'Ürün', genislikCh: 25, filterType: 'input', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="kod">${rec.stokKod || ''}</div>` +
							`<div class="ek-veri">${rec.stokAdi || ''} ${rec.brm || ''}</div>`
						)
					)
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 8, /* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
			}).tipDecimal(),
			new GridKolon({
				belirtec: 'paketSayi', text: 'Palet Sayı', minWidth: 70, maxWidth: 130, width: 90, /* filterType: 'checkedlist' */ cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args)
			}).tipDecimal(),
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
				belirtec: 'basTS', text: 'Başlangıç', width: 80, editable: false, filterable: false, filterType: 'input', cellClassName: globalCellsClassName, columnType: 'template',
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					value = asDate(value);
					if (value != null && value.setSeconds) value.setSeconds(0)
					if (timeKisaString(value) == '00:00') value = ''
					return changeTagContent(html, timeKisaString(asDate(value), true) || '')
				},
				createEditor: (colDef, rowIndex, value, editor, cellText, cellWidth, cellHeight) => {
					editor.addClass(`${colDef.belirtec} ts`);
					const input = $(`<input class="editor no-secs" type="time">`); input.appendTo(editor)
				},
				initEditor: (colDef, rowIndex, value, editor, cellText, pressedChar) => {
					const input = editor.children('.editor');
					input.val(timeToString(asDate(value)) || ''); setTimeout(() => input.focus(), 10)
				},
				getEditorValue: (colDef, rowIndex, value, editor) => { const input = editor.children('.editor'); return asDate(input.val()) }
			}),
			new GridKolon({
				belirtec: 'bitTS', text: 'Bitiş', width: 110, editable: false, filterable: false, filterType: 'input', cellClassName: globalCellsClassName, columnType: 'template',
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					value = asDate(value);
					if (value != null && value.setSeconds)
						value.setSeconds(0)
					
					let bitTS = value, basTS = asDate(rec.basTS);
					let farkSn = (bitTS < basTS) ? (24 * 60 * 60) - ((basTS - bitTS) / 1000) : (bitTS - basTS) / 1000;
					if (farkSn) farkSn = asSaniyeKisaString(roundToFra(farkSn, 0), true)
					if (timeKisaString(value) == '00:00') value = ''
					return changeTagContent(
						html, (
							`<div class="kod">${timeKisaString(value, true) || ''}</div>` +
							( farkSn ? `<div class="ek-veri"><span class="title">Fark: </span><span class="veri">${farkSn || ''}</span></div>` : '' )
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
				getEditorValue: (colDef, rowIndex, value, editor) => { const input = editor.children('.editor'); return asDate(input.val()) }
			}),
			new GridKolon({
				belirtec: 'ekBilgi', text: 'Ek Bilgi', minWidth: 40, maxWidth: 500, width: '20%', filterable: false, filterType: 'input', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const htmlListe = [], ekOzellikler = rec.ekOzellikler || {};
					if (!$.isEmptyObject(ekOzellikler)) {
						let subHTMLListe = []; for (let [key, value] of Object.entries(ekOzellikler)) {
							if (!value) { continue } if (key?.toLowerCase().endsWith('kod')) { key = key.slice(0, -3) }
							subHTMLListe.push(
								`<div class="ekOzellik">
									<span class="etiket">${key}</span><span class="ek-bilgi">: </span><span class="veri">${value.toLocaleString()}</span>
								</div>`
							)
						}
						if (subHTMLListe.length) {
							htmlListe.push(
								`<li class="ekOzellikler flex-row">
									<div class="title">Ek Özellikler</div><div class="ek-bilgi">: </div>
									<div class="content flex-row">${subHTMLListe.join('')}</div>
								</li>`
							)
						}
					}
					const {paketKod, paketIcAdet} = rec; if (paketKod) {
						htmlListe.push(
							`<span class="paket"><span class="etiket">Paket:</span> <span class="veri bold royalblue">${paketKod}</span>` +
							`${paketIcAdet ? `<span class="etiket ek-bilgi" style="margin-left: 13px">İç Adet:</span> <span class="veri bold forestgreen">${numberToString(paketIcAdet)}</span>` : ''}</span>`
						)
					}
					const {iskartalar} = rec; if (!$.isEmptyObject(iskartalar)) {
						const subHTMLListe = []; for (const kod in iskartalar) {
							subHTMLListe.push(
								`<div class="iskarta">
									<span class="etiket">${kod}</span><span class="ek-bilgi">: </span><span class="veri">${(iskartalar[kod] || 0).toLocaleString()}</span>
								</div>`)
						}
						htmlListe.push(
							`<li class="iskartalar flex-row">
								<div class="title">Iskartalar</div><span class="ek-bilgi">: </span>
								<div class="content flex-row">${subHTMLListe.join('')}</div>
							</li>`
						)
					}
					return changeTagContent(html, ( htmlListe.length ? `<ul>${htmlListe.join('\r\n')}</ul>` : '' ))
				}
			}).readOnly(),
			new GridKolon({
				belirtec: 'hatKod', text: 'Hat', genislikCh: 25,
				filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="kod">${rec.hatKod || ''}</div>` +
							`<div class="ek-veri">${rec.hatAdi || ''}</div>`
						)
					)
				}
			}).readOnly()
		);
		for (const colDef of tabloKolonlari) {
			const {belirtec} = colDef; let stmDuzenleyici;
			if (belirtec == 'tezgah' || belirtec == 'per') { colDef.kaKolonu.genislik = 23 * katSayi_ch2Px }
			if (colDef.ozelStmDuzenleyiciTrigger) { colDef.ozelStmDuzenleyiciTrigger() }
			switch (belirtec) {
				case 'tezgah':
					stmDuzenleyici = e => {
						const {stm, alias} = e, barkodRec = this.barkodRec || {}, {hatKod} = barkodRec;
						if (hatKod) { for (const sent of stm.getSentListe()) { sent.where.degerAta(hatKod, `${alias}.ismrkkod`) } }
					}; break
			}
			if (stmDuzenleyici) { colDef.stmDuzenleyiciEkle(stmDuzenleyici) }
		}
		const gridPart = this.gridPart = new GridliGirisPart({
			parentPart: this, gridIDBelirtec: 'id', layout: layout.find('.grid-parent > .grid'),
			argsDuzenle: e => {
				$.extend(e.args, {
					editable: false, autoRowHeight: true, rowsHeight: 53, columnsHeight: 20, showGroupsHeader: true, /*selectionMode: 'multiplerowsextended',*/
					groupable: true, sortable: false, filterable: true, showFilterRow: true, /* filterMode: 'excel', */ autoShowLoadElement: false,
					selectionMode: 'checkbox', editMode: 'selectedRow', groupIndentWidth: 60, groupsExpandedByDefault: true
				})
			},
			tabloKolonlari: tabloKolonlari,
			loadServerData: async e => {
				await app.promise_ready; const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [];
				const recs = $.merge([], gerceklemeler).reverse().map(_rec => _rec && _rec.deepCopy ? _rec.deepCopy() : $.extend({}, _rec)); if (recs) {
					for (const rec of recs) { const {hatKod, hatAdi} = rec; rec.hatText = hatKod ? hatAdi ? `(<span class="lightgray">${hatKod}</span>) ${hatAdi}` : hatKod : '' }
				}
				return recs
			},
			gridRendered: e => this.onGridRendered(e),
			veriYuklenince: e => this.gridVeriYuklendi(e)
		}).sabit().rowNumberOlmasin();
		gridPart.run(); const {grid} = gridPart;
		grid.on('cellvaluechanged', evt => this.onCellValueChanged({ event: evt, args: evt.args }))
		/*grid.on('rowclick', evt => this.retryIstendi({ event: evt, args: evt.args }))*/
		grid.on('rowselect', evt => this.gridSecimDegisti({ event: evt, args: evt.args, flag: true }));
		grid.on('rowunselect', evt => this.gridSecimDegisti({ event: evt, args: evt.args, flag: false }));
		grid.on('rowclick', evt => this.gridSatirTiklandi({ event: evt, args: evt.args }));
		grid.on('rowdoubleclick', evt => this.gridSatirCiftTiklandi({ event: evt, args: evt.args }))
	}
	initLayout_gridSonrasi(e) { }
	tazele(e) {
		const gridPart = this.gridPart || {}, {gridWidget} = gridPart;
		if (gridWidget) gridPart.tazele()
	}
	reset(e) {
		/*const {ekBilgiParts} = this;
		if (ekBilgiParts) {
			const barkodRec = this.getBarkodRec() || {};
			for (const key in ekBilgiParts) {
				if (key == 'basTS' || key == 'bitTS') continue
				const item = ekBilgiParts[key]; if (item.length && item.val) item.val(barkodRec[key] || '');
			}
		}*/
	}
	getBarkodRec(e) {
		e = e || {}; let {barkodRec} = this; if (!barkodRec) { barkodRec = this.barkodRec = new MQBarkodRec().suAn().serbest() }
		const {barkodParser} = e; const barkod = e.barkod || barkodParser?.okunanBarkod; if (barkod != null) { barkodRec.barkod = barkod }
		if (barkodParser) {
			let suAnmi = barkodRec?.suAnmi ?? true, serbestmi = barkodRec?.serbestmi ?? true;
			barkodRec = this.barkodRec = new MQBarkodRec({ ...barkodParser, barkod })
		}
		/*if (barkodParser) {
			let {miktar, paketIcAdet} = barkodParser, carpan = barkodParser.carpan || 1;
			if (!miktar && paketIcAdet) { miktar = paketIcAdet * carpan } if (!miktar) { miktar = e.miktar || 1 }
			const oemSayac = barkodParser.oemSayac ?? barkodParser.kaysayac, shKod = barkodParser.shKod ?? barkodParser.stokkod;
			if (oemSayac) { barkodRec.oemSayac = asInteger(oemSayac) || null }
			if (shKod) { barkodRec.stokKod = shKod }
			const {numerikSahalarSet, anahtarSahalarBasit, ekOzellikSahalar} = barkodRec.class;
			for (const key of anahtarSahalarBasit) { const value = barkodParser[key]; if (value) { barkodRec[key] = numerikSahalarSet[key] ? (asInteger(value) || null) : value } }
			const ekOzellikler = barkodRec.ekOzellikler = barkodRec.ekOzellikler || {};
			for (const key of ekOzellikSahalar) { const value = barkodParser[key]; if (value) { ekOzellikler[key] = value } }
			$.extend(barkodRec, { miktar, carpan, paketIcAdet })
		}*/
		return barkodRec
	}
	barkod_listedenSecIstendi(e) {
		const mfSinif = MQOEM; mfSinif.listeEkraniAc({
			parentPart: this, secimlerDuzenle: e => {
				const {secimler} = e, {sec_hat} = secimler || {}, hatKod = this.hatKod || app.params.config.hatKod;
				if (sec_hat && hatKod) { sec_hat.basiSonu = hatKod }
			},
			secince: async e => {
				const {layout} = this, animateCSS = 'animate-wnd-content-slow'; layout.removeClass(animateCSS); layout.addClass(animateCSS);
				console.info(e); const {recs} = e; const _recs = recs.map(rec => ({ oemSayac: rec[mfSinif.sayacSaha], emirNox: rec.emirnox, emirTarih: rec.emirtarih, opNo: rec.opno, opAdi: rec.opadi, stokKod: rec.stokkod, stokAdi: rec.stokadi }));
				const barkodRecs = []; for (const rec of recs) { barkodRecs.push(new MQBarkodRec({ rec })) }
				for (const barkodRec of barkodRecs) { try { await barkodRec.ekBilgileriBelirle() } catch (ex) { console.error(ex) } }
				for (let i = 0; i < barkodRecs.length; i++) { const barkodRec = barkodRecs[i], internal = (i + 1 < barkodRecs.length); await this.ekleIstendi({ internal, barkodRec }) }
				setTimeout(() => layout.removeClass(animateCSS), 3000)
			}
		})
	}
	paletliGirisIstendi(e) { const part = new PaletliGirisPart({ parentPart: this, tamamIslemi: e => this.paletliGirisYapildi(e) }); part.run() }
	async paletliGirisYapildi(e) {
		const {recs} = e, anahStr2Rec = {};
		for (const rec of recs) {
			const {anahtarStr} = rec; let _rec = anahStr2Rec[anahtarStr];
			if (_rec) { _rec.miktar = _rec.miktar + (rec.miktar || 0); _rec.paketSayi = (_rec.paketSayi || 0) + (rec.paketSayi || 0) }
			else { _rec = anahStr2Rec[anahtarStr] = rec.deepCopy ? rec.deepCopy() : $.extend(true, {}, rec); _rec.ekBilgileriBelirle() }
		}
		await app.promise_ready;
		const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler = yerelParam.gerceklemeler || [];
		gerceklemeler.push(...(Object.values(anahStr2Rec))); yerelParam.kaydet();
		this.txtBarkod.val(null); this.getBarkodRec().reset_asil(); this.reset();
		setTimeout(() => this.txtBarkod.focus(), 100); setTimeout(() => this.tazele(), 200)
	}
	async barkodOkutuldu(e) {
		try { await this.barkodOkutulduDevam(e) }
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), `Barkod Okutma İşlemi`) }
	}
	async barkodOkutulduDevam(e) {
		e = e || {}; clearTimeout(this.timer_otoTazele);
		let barkod = (e.barkod || '').trim(); if (!barkod) { setTimeout(() => this.txtBarkod.focus(), 200); return false }
		let carpan = null; const barkodLower = barkod.toLowerCase();
		for (const separator of ['x', '*']) {
			const parts = barkod.split(separator, 2);
			if (parts.length > 1) { carpan = asFloat(parts[0]) || null; barkod = parts[1].trim(); break }
		}
		const {txtMiktar, btnEkle, btnIskarta, btnKalite, btnTopluDegistir, btnTopluSil, divEkBilgiler, txtBarkod} = this, {gridWidget} = this.gridPart;
		txtMiktar.parent().addClass('jqx-hidden'); btnEkle.parent().addClass('jqx-hidden');
		/*btnIskarta.parent().addClass('jqx-hidden'); btnKalite.parent().addClass('jqx-hidden'); btnTopluDegistir.parent().addClass('jqx-hidden');*/
		// divEkBilgiler.jqxResponsivePanel('close');
		const barkodParser = barkod ? (await app.barkodBilgiBelirleFromEOU({ barkod, carpan })) : null;
		const barkodRec = this.barkodRec = this.getBarkodRec({ barkodParser }), uygunmu = barkodParser /* && (barkodRec.emirNox && barkodRec.opNo && barkodRec.stokKod) */;
		if (!uygunmu) {
			this.reset(e); if (barkodRec) barkodRec.reset_asil(e); /* this.retryIstendi({ force: true }); */
			txtBarkod.parent().addClass('barkod-error'); txtBarkod.val(null);
			setTimeout(() => txtBarkod.parent().removeClass('barkod-error'), 400); app.playSound_barkodError();
			setTimeout(() => this.txtBarkod.focus(), 200); return false
		}
		txtBarkod.parent().addClass('barkod-success'); setTimeout(() => txtBarkod.parent().removeClass('barkod-success'), 200);
		const promise = $.Deferred(); barkodRec.ekBilgileriBelirle_force().finally(() => promise.resolve(true));
		setTimeout(() => promise.resolve(false), navigator.onLine ? 2000 : 100);
		try { await promise } catch (ex) { console.error(ex) }
		app.playSound_barkodOkundu();
		/*for (const bilgi of Object.values(this.ekBilgiParts)) { if (bilgi.dataBind) bilgi.dataBind() }*/
		// divEkBilgiler.jqxResponsivePanel('open');
		let miktar = e.miktar || barkodRec.miktar; if (e.miktar ==  null && miktar == 1) { miktar = null }
		btnEkle.parent().removeClass('jqx-hidden basic-hidden');
		/*for (const elm of [btnIskarta, btnKalite, btnTopluDegistir, btnTopluSil]) { elm?.parent()?.addClass('jqx-hidden') }*/
		if (miktar) { barkodRec.carpan = null; txtMiktar.val(miktar); setTimeout(() => btnEkle.focus(), 50) }
		else { txtMiktar.val(miktar); txtMiktar.parent().removeClass('jqx-hidden basic-hidden'); setTimeout(() => txtMiktar.focus(), 50) }
		app.veriAktarici_startTimer()
	}
	miktarOkutuldu(e) { clearTimeout(this.timer_otoTazele); setTimeout(() => this.ekBilgiParts.tezgah.widget.input.focus(), 100) }
	async ekleIstendi(e) {
		e = e || {}; clearTimeout(this.timer_otoTazele); const {txtBarkod} = this, {gridWidget} = this.gridPart, internalFlag = asBool(e.internal ?? e.internalFlag);
		try {
			let barkodRec; const {txtMiktar, btnEkle, btnIskarta, btnKalite, btnTopluDegistir, btnTopluSil, divEkBilgiler} = this;
			const _miktar = e.miktar == null ? asFloat(txtMiktar.val()) || 1 : asFloat(e.miktar);
			if (!internalFlag) {
				txtBarkod.parent().removeClass('jqx-hidden basic-hidden'); txtMiktar.val(null);
				for (const elm of [txtMiktar, btnEkle]) { elm.parent().addClass('jqx-hidden') }
				/*if (gridWidget.getselectedrowindexes().length) { for (const elm of [btnIskarta, btnKalite, btnTopluDegistir, btnTopluSil]) { elm?.parent()?.removeClass('jqx-hidden basic-hidden') } }*/
			}
			// divEkBilgiler.jqxResponsivePanel('close');
			barkodRec = e.barkodRec || this.getBarkodRec(e); if (!barkodRec || !(_miktar && _miktar > 0)) { app.playSound_barkodError(); return false }
			const miktar = (_miktar || 1) * (e.carpan || barkodRec.carpan || 1); barkodRec.miktar = miktar;
			const gridRec = $.extend(true, {}, barkodRec); await app.promise_ready;
			const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler = yerelParam.gerceklemeler || [];
			gerceklemeler.push(barkodRec); yerelParam.kaydet(); if (!internalFlag) { txtBarkod.val(null) }
			barkodRec = this.barkodRec = ( barkodRec ? ( barkodRec.deepCopy ? barkodRec.deepCopy(e) : $.extend(true, {}, barkodRec) ) : this.getBarkodRec(e) );
			if (barkodRec.suAnmi) { for (const prefix of ['bas', 'bit']) { const key = `${prefix}TS`; barkodRec[key] = now() } }
			if (!internalFlag) { barkodRec.reset_asil(e); this.reset() }
			gridWidget.addrow(null, gridRec, 'first'); if (!internalFlag) { setTimeout(() => { gridWidget.clearselection(); gridWidget.selectrow(gridRec.visibleindex) }, 10) }
			if (!internalFlag) { app.veriAktarici_startTimer() }
		}
		catch (ex) { app.playSound_barkodError(); wnd = hConfirm(getErrorText(ex), 'Barkod İşlemi').wnd; throw ex }
		finally { if (!internalFlag) { setTimeout(() => this.txtBarkod.focus(), 200) } }
	}
	async degistirIstendi(e) {
		e = e || {}; const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [];
		const {gridPart} = this, {gridWidget} = gridPart, gridRec = e.rec ?? gridPart.selectedRec;
		const gonderildimi = gridRec?._durum == 'done'; if (gonderildimi) return; let inst = gridRec; if (!inst) return
		if ($.isPlainObject(inst)) { inst = gerceklemeler.find(_rec => _rec.id == inst.id)?.deepCopy() }
		inst.serbest(); inst = inst.deepCopy ? inst.deepCopy() : $.extend(true, {}, inst); const promise_wait = new $.Deferred();
		await MQBarkodRec.tanimla({ islem: 'yeni', inst, kaydetIslemi: e => { promise_wait.resolve(e); return true }, kapaninca: e => promise_wait.resolve(null) });
		inst = (await promise_wait)?.inst; if (!inst) return false; if (inst.durum_none) inst.durum_none(); else inst._durum = ''
		if (inst.suAnmi === true) { for (const key of ['basTS', 'bitTS']) { inst[key] = now() } }
		else { for (const key of ['basTS', 'bitTS']) { let value = inst[key]; if (value != null && !hasTime(value)) { value = inst[key] = setTime(value, now()) } } }
		const ind = gerceklemeler.findIndex(_rec => _rec.id == inst.id); gerceklemeler[ind] = inst;
		/* gridWidget.updaterow(inst.uid, inst.deepCopy()); */ yerelParam.kaydetDefer(); this.tazele();
		setTimeout(() => this.txtBarkod.focus(), 200); app.veriAktarici_startTimer()
	}
	silIstendi(e) {
		const {gridWidget, rec} = e; if (!rec || rec._durum == 'processing') return false
		const gonderildimi = rec._durum == 'done', silindimi = rec._durum == 'removed';
		const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [];
		const index = gerceklemeler.findIndex(__rec => __rec.id == rec.id); if (index != -1) { gerceklemeler.splice(index, 1); yerelParam.kaydetDefer() }
		yerelParam.kaydetDefer(); gridWidget.deleterow(rec.uid);
		const {txtBarkod} = this; if (txtBarkod && txtBarkod.length) setTimeout(() => this.txtBarkod.focus(), 200)
	}
	secilenleriGonderIstendi(e) {
		const {gridPart} = this, {gridWidget} = gridPart;
		let recs = (gridPart.selectedRecs || []).filter(rec => !(rec._durum == 'done' || rec._durum == 'changing' || rec._durum == 'removed'));
		if ($.isEmptyObject(recs)) { hConfirm('Gönderilecek bilgi yok', ' '); return }
		this.retryIstendi($.extend({}, e, { force: true, recs }));
		setTimeout(() => gridWidget.clearselection(), 10); setTimeout(() => this.txtBarkod.focus(), 100)
	}
	iskartaIstendi(e) {
		const {gridWidget} = this.gridPart; let rec = gridWidget.getrowdata(gridWidget.getselectedrowindex());
		if (rec?._durum == 'removed') { hConfirm('Uygun bilgi yok', ' '); return }
		const kod2Rec = {}, {iskartalar} = rec; if (iskartalar) { for (const kod in iskartalar) { const miktar = iskartalar[kod]; if (miktar) kod2Rec[kod] = { miktar } } }
		const part = new IskartaGirisPart({ parentPart: this, parentRec: rec, kod2Rec, tamamIslemi: async e => await this.iskartaGirisYapildi(e) }); part.run()
	}
	iskartaGirisYapildi(e) {
		const {parentRec, kod2Rec} = e, gonderildimi = parentRec._durum == 'done';
		if (kod2Rec) { for (const rec of Object.values(kod2Rec)) kod2Rec[rec.kod] = rec.miktar } parentRec.iskartalar = kod2Rec;
		if (gonderildimi) { const query = parentRec.getQueryYapi_iskartalar(e); if (query) app.sqlExecSP(query) } else parentRec._durum = ''
		const yerelParam = app.params.yerel, {gerceklemeler} = yerelParam, _rec = gerceklemeler.find(rec => rec.id == parentRec.id);
		if (_rec) { for (const key of ['_durum', 'iskartalar']) { _rec[key] = parentRec[key] } yerelParam.kaydet() }
		this.tazele()
	}
	async kaliteIstendi(e) {
		const {gridWidget} = this.gridPart; let rec = gridWidget.getrowdata(gridWidget.getselectedrowindex());
		if (rec?._durum == 'removed') { hConfirm('Uygun bilgi yok', ' '); return }
		/*if (!rec?.gerSayac) { hConfirm('Seçilen satıra ait Gerçekleme ID belirlenemedi. Kalite girişi için önce merkeze gönderim yapılmalıdır', ''); return }*/
		const kaliteYapi = rec.kaliteYapi || {}, part = new KaliteGirisPart({
			parentPart: this, parentRec: rec, numuneSayisi: kaliteYapi.numuneSayisi, savedRecs: kaliteYapi.recs,
			tamamIslemi: async e => await this.kaliteGirisiYapildi(e)
		}); part.run()
	}
	kaliteGirisiYapildi(e) {
		const {parentRec, numuneSayisi, recs} = e, gonderildimi = parentRec._durum == 'done'; parentRec.kaliteYapi = { numuneSayisi, recs };
		if (gonderildimi) { const query = parentRec.getQueryYapi_kalite(e); if (query) app.sqlExecSP(query) } else parentRec._durum = ''
		const yerelParam = app.params.yerel, {gerceklemeler} = yerelParam, _rec = gerceklemeler.find(rec => rec.id == parentRec.id);
		if (_rec) { for (const key of ['_durum', 'kaliteYapi']) { _rec[key] = parentRec[key] } yerelParam.kaydet() }
		this.tazele()
	}
	async topluDegistirIstendi(e) {
		const {gridPart} = this; let recs = gridPart.selectedRecs.filter(rec => rec && rec._durum != 'done')
		if ($.isEmptyObject(recs)) { hConfirm(`Değişecek satır(lar) seçilmelidir`, ' '); return }
		const sabit_hatKod = app.params.config.hatKod; let inst = new MQBarkodRec().serbest().noCheck();
		const keys_reset = ['tezgahKod', 'tezgahAdi', 'perKod', 'perAdi', 'miktar', 'vardiyaNo']; if (!sabit_hatKod) { keys_reset.push('hatKod', 'hatAdi') }
		const keys = [...keys_reset, 'suAnmi', 'basTS', 'bitTS']; for (const key of keys_reset) { inst[key] = null }
		/*inst.hatKod = recs[0].hatKod || this.getBarkodRec().hatKod;*/ const promise_wait = new $.Deferred();
		await MQBarkodRec.tanimla({ islem: 'yeni', inst, kaydetIslemi: e => { promise_wait.resolve(e); return true }, kapaninca: e => promise_wait.resolve(null) });
		inst = (await promise_wait)?.inst; if (!inst) { return false } if (inst.durum_none) { inst.durum_none() } else { inst._durum = '' }
		if (inst.suAnmi === true) { for (const key of ['basTS', 'bitTS']) { inst[key] = now() } }
		else { for (const key of ['basTS', 'bitTS']) { let value = inst[key]; if ((value != null || (typeof value == 'string' && !!value)) && !hasTime(value)) { value = inst[key] = setTime(value, now()) } } }
		const idSet = asSet(recs.map(rec => rec.id)), yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [], gerRecs = gerceklemeler.filter(rec => idSet[rec.id]);
		for (const rec of gerRecs) {
			if (rec.durum_none) { rec.durum_none() } else { rec._durum = '' }
			for (const key of keys) { const value = inst[key]; if (value != null) { rec[key] = inst[key] } }
			/*if (rec.suAnmi === true) { if (inst.suAnmi === true) { for (const key of ['basTS', 'bitTS']) { inst[key] = now() } } }*/
		} yerelParam.kaydet(); this.tazele(); setTimeout(() => this.txtBarkod.focus(), 200); app.veriAktarici_startTimer()
	}
	async topluSilIstendi(e) {
		e = e || {}; const {gridPart} = this; let recs = gridPart.selectedRecs; if ($.isEmptyObject(recs)) { hConfirm(`Silinecek satır(lar) seçilmelidir`, ' '); return }
		let rdlg = await ehConfirm(`Seçilen <b class="darkred">${recs.length} adet</b> satır silinsin mi?`, this.title); if (rdlg) { this.topluSil($.extend({}, e, { recs })) }
	}
	async topluSil(e) {
		e = e || {}; const {gridPart} = this; let recs = e.recs ?? gridPart.selectedRecs; if ($.isEmptyObject(recs)) return
		const idSet = asSet(recs.map(rec => rec.id)), yerelParam = app.params.yerel; let gerceklemeler = yerelParam.gerceklemeler || []; const gerRecs = gerceklemeler.filter(rec => !idSet[rec.id]);
		gerceklemeler = yerelParam.gerceklemeler = gerRecs; yerelParam.kaydet(); this.tazele()
	}
	gerceklemelerIstendi(e) {
		e = e || {}; const {gridPart} = this; let recs = gridPart.selectedRecs;
		try {
			const oemSayacListe = recs?.length ? recs.map(rec => rec.oemSayac) : null;
			MQGercekleme.listeEkraniAc({ secimlerDuzenle: e => { const sec = e.secimler; sec.temizle() }, args: { oemSayacListe }, kapaninca: e => gridPart?.tazele() })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Gerçekleme Yap'); throw ex }
	}
	retryIstendi(e) {
		e = e || {}; const args = e.args || {};
		/*const rec = e.rec || (args.row || {}).bounddata; if (!rec) return*/
		const gridWidget = args.owner || this.gridPart.gridWidget; if (gridWidget.editcell) return
		const ignoreSet = asSet(['done', 'changing', 'removed']), _recs = e.recs || (e.rec ? [e.rec] : null);
		const recs = _recs || gridWidget.getboundrows(), yeniDurum = 'processing';
		gridWidget.beginupdate();
		for (const rec of recs) {
			if (ignoreSet[rec._durum]) { continue }
			if (rec._durum != yeniDurum) { rec._durum = yeniDurum; gridWidget.updaterow(rec.uid, rec) }
		}
		gridWidget.endupdate(false);
		//if (!recs) this.tazele()
		if (e.force) {
			app.veriAktarici_stopTimer();
			app.veriAktarici_timerProc({ recs: _recs }).finally(() => {
				app.veriAktarici_startTimer();
				setTimeout(() => { const {gridWidget} = this.gridPart; if (gridWidget.editcell) { return } this.tazele() }, 10)
			})
		}
		const {txtBarkod} = this; if (txtBarkod?.length) setTimeout(() => this.txtBarkod.focus(), 200)
	}
	gridVeriYuklendi(e) { const {gridPart} = this, {grid} = gridPart /*grid.jqxGrid('groups', ['hatText'])*/ }
	onGridRendered(e) {
		if (this.inEvent_gridRendered) return; this.inEvent_gridRendered = true;
		app.promise_ready
			.then(() => { const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || []; /* for (const rec of gerceklemeler) rec.ekBilgileriBelirle() */ })
			.always(() => this.inEvent_gridRendered = false)
	}
	onCellBeginEdit(colDef, rowIndex, belirtec, colType, value) {
		clearTimeout(this.timer_otoTazele); const {gridWidget} = colDef.gridPart;
		const rec = gridWidget.getrowdata(rowIndex); rec._lastDurum = rec._durum; const ignoreSet = asSet(['processing', 'done']);
		if (!rec || ignoreSet[rec._durum]) return false
		if (rec._durum != 'changing') {
			rec._durum = 'changing'; const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [];
			const _rec = gerceklemeler.find(__rec => __rec.id == rec.id);
			if (_rec) { _rec._durum = rec._durum; yerelParam.kaydet(); app.veriAktarici_stopTimer() }
		}
		return true
	}
	onCellEndEdit(colDef, rowIndex, belirtec, cellType, oldValue, newValue) {
		const {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex); let degistimi = false;
		const yeniDurum = oldValue == newValue ? rec._lastDurum : 'changed'; delete rec._lastDurum;
		if (rec._durum != yeniDurum) { rec._durum = yeniDurum; degistimi = true }
		const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [], _rec = gerceklemeler.find(__rec => __rec.id == rec.id);
		if (_rec) {
			if (_rec._durum != rec._durum) { _rec._durum = rec._durum; degistimi = true }
			if (_rec[belirtec] != newValue) { _rec[belirtec] = newValue; degistimi = true }
		}
		if (degistimi) { yerelParam.kaydet(); degistimi = false /* app.veriAktarici_startTimer() */ }
		/* setTimeout(() => gridWidget.refresh(), 10); setTimeout(() => this.txtBarkod.focus(), 200) */
		return true
	}
	onCellValueChanged(e) {
		const args = e.args || {}, gridWidget = args.owner || this.gridPart.gridWidget, rec = e.rec ?? gridWidget.getrowdata(coalesce(e.rowIndex, args.rowindex));
		const belirtec = args.datafield, yeniDurum = 'changed';
		if (belirtec == 'basTS' || belirtec == 'bitTS') { rec.suAnmi = !(rec.basTarih && rec.bitTarih) }
		if (rec._durum != yeniDurum) {
			rec._durum = yeniDurum; const yerelParam = app.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [], _rec = gerceklemeler.find(__rec => __rec.id == rec.id);
			if (_rec) { _rec._durum = rec._durum; _rec[args.datafield] = args.newvalue; gridWidget.updaterow(rec.uid, rec); yerelParam.kaydetDefer(); /*app.veriAktarici_startTimer()*/ }
		}
		gridWidget.updaterow(rec.uid, rec, true)
	}
	gridSatirTiklandi(e) { }
	gridSatirCiftTiklandi(e) { this.degistirIstendi(e) }
	gridSecimDegisti(e) {
		/*const {args} = e, gridWidget = args.owner, selectedRowIndexes = gridWidget.getselectedrowindexes();
		const {btnGonder, btnIskarta, btnKalite, btnTopluDegistir, btnTopluSil} = this;
		for (const elm of [btnGonder, btnIskarta, btnKalite, btnTopluDegistir, btnTopluSil]) {
			if (elm?.length) {
				if ($.isEmptyObject(selectedRowIndexes)) elm.parent().addClass('jqx-hidden')
				else elm.parent().removeClass('jqx-hidden basic-hidden')
			}
		}*/
	}
	onResize(e) { super.onResize(e); this.gridPart.onResize(e) }
}
