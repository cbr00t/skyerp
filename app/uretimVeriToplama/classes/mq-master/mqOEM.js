class MQOEM extends MQSayacliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Operasyon Emri' } static get table() { return 'operemri' } static get tableAlias() { return 'oem' } static get detayTable() { return MQGercekleme.table } 
	static get kodListeTipi() { return 'UOEM' } static get localDataBelirtec() { return 'oem' } static get sayacSahaGosterilirmi() { return true } static get gridDetaylimi() { return true }
	static get idSaha() { return ['emirnox', 'opno', 'stokkod'] } static get idSahaDonusum() { return $.extend(super.idSahaDonusum || {}, { emirnox: 'emr.fisnox', stokkod: 'frm.formul' }) }
	static get defaultGroups() { return [] } static get islemTuslari_sagButonlar_ekMarginX() { return -20 } static get noAutoFocus() { return true }
	static get gridIslemTuslariKullanilirmi() { return false }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sabit_hatKod = app.params.config.hatKod, sec = e.secimler;
		sec.grupEkle({ kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true });
		const _liste = {
			sadeceIslenebilirOlanlarmi: new SecimBoolTrue({ etiket: 'İşlenebilir Olanlar' }),
			hatKod: new SecimString({ etiket: 'Hat', mfSinif: MQHat }).birKismi(),
			hatAdi: new SecimOzellik({ etiket: 'Hat Adı' }),
			emirTarih: new SecimDate({ etiket: 'Emir Tarih' }),
			emirNo: new SecimString({ etiket: 'Emir No' }),
			opNo: new SecimInteger({ etiket: 'Operasyon', mfSinif: MQOperasyon }).birKismi(),
			opAdi: new SecimOzellik({ etiket: 'Op. Adı' }),
			stokKod: new SecimString({ etiket: 'Ürün' }),
			stokAdi: new SecimOzellik({ etiket: 'Ürün Adı' }),
			tezgahKod: new SecimString({ etiket: 'Tezgah', mfSinif: MQTezgah }),
			tezgahAdi: new SecimOzellik({ etiket: 'Tezgah Adı' }),
			perKod: new SecimString({ etiket: 'Personel', mfSinif: MQPersonel }),
			perAdi: new SecimOzellik({ etiket: 'Personel Adı' }),
			oemSayac: new SecimNumber({ etiket: 'OEM ID', grupKod: 'teknik' })
		};
		if (sabit_hatKod) { for (const key of ['hatKod', 'hatAdi']) delete _liste[key] }
		sec.secimTopluEkle(_liste);
		sec.whereBlockEkle(e => {
			const sabit_hatKod = app.params.config.hatKod, {aliasVeNokta, sayacSaha} = this, wh = e.where, sec = e.secimler;
			if (sec.sadeceIslenebilirOlanlarmi.value) wh.add(`${aliasVeNokta}islenebilirmiktar > 0`)
			if (!sabit_hatKod) { wh.basiSonu(sec.hatKod, 'hat.kod'); wh.ozellik(sec.hatAdi, 'hat.aciklama') }
			wh.basiSonu(sec.emirTarih, 'emr.tarih');
			wh.basiSonu(sec.emirNo, 'emr.fisnox');
			wh.basiSonu(sec.opNo, `${aliasVeNokta}opno`);
			wh.ozellik(sec.opAdi, 'op.aciklama');
			wh.basiSonu(sec.stokKod, 'frm.formul');
			wh.ozellik(sec.stokAdi, 'stk.aciklama');
			wh.basiSonu(sec.tezgahKod, `${aliasVeNokta}tezgahkod`);
			wh.ozellik(sec.tezgahAdi, 'tez.aciklama');
			wh.basiSonu(sec.perKod, `${aliasVeNokta}perkod`);
			wh.ozellik(sec.perAdi, 'per.aciklama');
			wh.basiSonu(sec.oemSayac, `${aliasVeNokta}${sayacSaha}`);
			const {_ekWhere} = sec; if (_ekWhere) { wh.birlestir(_ekWhere) }
		})
	}
	static super_secimlerDuzenle(e) { super.secimlerDuzenle(e) }
	static orjBaslikListesi_gridInit(e) {
		super.orjBaslikListesi_gridInit(e); const {sender, grid, gridWidget} = e;
		grid.on('rowexpand', evt => {
			const {gridWidget} = sender, _expandedIndexes = sender._expandedIndexes = sender._expandedIndexes || {};
			const index = gridWidget.getrowboundindex(evt.args.rowindex);
			if (index != null && index > -1) _expandedIndexes[index] = true
			// setTimeout(() => gridWidget.ensurerowvisible(index > 0 ? index - 1 : index), 5)
		});
		grid.on('rowcollapse', evt => {
			const {gridWidget} = sender, _expandedIndexes = sender._expandedIndexes = sender._expandedIndexes || {};
			const index = gridWidget.getrowboundindex(evt.args.rowindex);
			if (index != null && index > -1) delete _expandedIndexes[index]
		});
		grid.on('groupschanged', evt =>
			gridWidget._groups = evt.args.groups)
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args} = e;
		$.extend(e.args, { sortMode: 'one', showGroupsHeader: true, columnsHeight: args.columnsHeight * 2.3, rowsHeight: 48, groupsExpandedByDefault: true, showFilterRow: true })
	}
	static orjBaslikListesi_argsDuzenle_detaylar(e) { super.orjBaslikListesi_argsDuzenle_detaylar(e); const {args} = e; $.extend(args, { rowsHeight: 40 }) }
	static orjBaslikListesiDuzenle(e) {
		e = e || {}; super.orjBaslikListesiDuzenle(e);
		const sabit_hatKod = e.sabit_hatKod = app.params.config.hatKod, alias = e.alias || this.tableAlias, {liste} = e;
		const globalCellsClassName = e.globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) =>
			`mq-oem ${belirtec}`;
		if (config.dev) {
			liste.push(new GridKolon({ belirtec: this.sayacSaha, text: 'OEM ID', minWidth: 60, maxWidth: 100, width: '5%', /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName }).noSql().tipNumerik())
		}
		/*if (!sabit_hatKod) { }*/
		liste.push(...[
			new GridKolon({
				belirtec: 'emirno', text: '<div class="grid-col-2">Emir Tarih/No</div>', genislikCh: 9,
				filterType: 'checkedlist', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, rec._gorevSatirimi ? '' : (
							`<div class="parent"><span class="veri">${rec.emirnox || ''}</span></div>` +
							`<div class="parent"><span class="ek-veri">${dateKisaString(asDate(rec.emirtarih)) || ''}</span></div>`
						)
					)
				}
			}).noSql().tipNumerik(),
			new GridKolon({
				belirtec: 'stokadi', text: 'Ürün', genislikCh: 40, /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, rec._gorevSatirimi ? '' : (
							`<div class="parent">` +
								`<span class="ek-veri">${rec.stokkod || ''}</span>` +
								`<span class="veri">${rec.stokadi || ''}</span>` +
							`</div>`
						)
					)
				}
			}).noSql(),
			new GridKolon({
				belirtec: 'islenebilirmiktar', text: '<div class="grid-col-2">Kalan İşl.</div>', genislikCh: 8,
				cellClassName: (colDef, rowIndex, belirtec, value, rec) => {
					let result = [belirtec]; result.push(asFloat(value) < 0 ? 'red' : 'royalblue bold');
					return result.join(' ')
				},
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, rec._gorevSatirimi ? '' : (
							`<div class="parent"><span class="ek-veri">${(rec.kalanmiktar || 0).toLocaleString()}</span></div>` +
							`<div class="parent"><span class="_veri">${(rec.islenebilirmiktar || 0).toLocaleString()}</span></div>`
						)
					)
				}
			}).noSql().tipDecimal(),
			new GridKolon({
				belirtec: 'peradi', text: 'Personel', genislikCh: 20, /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, rec._gorevSatirimi ? '' : (
							`<div class="parent">` +
								`<span class="ek-veri">${rec.perkod || ''}</span>` +
								`<span class="veri">${rec.peradi || ''}</span>` +
							`</div>`
						)
					)
				}
			}).noSql(),
			new GridKolon({
				belirtec: 'tezgahadi', text: 'Tezgah', genislikCh: 25, /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="parent">` +
								`<span class="ek-veri">${rec.tezgahkod || ''}</span>` +
								`<span class="veri">${rec.tezgahadi || ''}</span>` +
							`</div>`
						)
					)
				}
			}).noSql()
		]);
		this.orjBaslikListesiDuzenle_ara(e);
		liste.push(...[
			new GridKolon({
				belirtec: 'opadi', text: 'Operasyon', genislikCh: 23,
				/* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="parent">` +
								`<span class="ek-veri">${rec.opno || ''}</span>` +
								`<span class="veri">${rec.opadi || ''}</span>` +
							`</div>`
						)
					)
				}
			}).noSql()/*.hidden()*/,
			new GridKolon({
				belirtec: 'hatadi', text: 'Hat', genislikCh: 20, hidden: sabit_hatKod, filterType: 'checkedlist',
				cellClassName: globalCellsClassName, cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="parent">` +
								`<span class="ek-veri">${rec.hatkod || ''}</div>` +
								`<span class="veri">${rec.hatadi || ''}</div>` +
							`</div>`
						)
					)
				}
			}).noSql()/*.hidden()*/,
			new GridKolon({ belirtec: 'pdmkodu', text: 'PDM Kodu', genislikCh: 20, filterType: 'checkedlist', cellClassName: globalCellsClassName }).noSql()
		])
	}
	static orjBaslikListesiDuzenle_ara(e) { }
	static orjBaslikListesiDuzenle_detaylar(e) {
		e = e || {}; super.orjBaslikListesiDuzenle_detaylar(e);
		const {iskartaMaxSayi} = this, {liste} = e, alias = e.alias = e.alias || 'har';
		const globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => `mq-gercekleme ${belirtec}`;
		liste.push(...[
			new GridKolon({
				belirtec: 'tezgahkod', text: 'Tezgah', genislikCh: 13, /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName, sql: `${alias}.tezgahkod`,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(html, `<div class="parent"><span class="ek-veri">${rec.tezgahkod || ''}</span><span class="veri">${rec.tezgahadi || ''}</span></div>`)
				}
			}),
			new GridKolon({
				belirtec: 'perkod', text: 'Personel', genislikCh: 16, /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName, sql: `${alias}.perkod`,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(html, `<div class="parent"><span class="ek-veri">${rec.perkod || ''}</span><span class="veri">${rec.peradi || ''}</span></div>`)
				}
			}),
			new GridKolon({
				belirtec: 'detbasts', text: 'Başlangıç', genislikCh: 18, filterType: 'date', filterCondition: 'greater_than_or_equal', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					value = asDate(value); const detBitTS = asDate(rec.detbitts);
					return changeTagContent(
						html, (
							`<div class="parent">` +
								`<span class="ek-veri">${dateKisaString(detBitTS)}</span>` +
								`<span class="veri">${timeKisaString(detBitTS)}</span>` +
							`</div>` +
							`<div class="parent">` +
								`<span class="ek-bilgi">Bitiş: </span>` +
								`<span class="ek-veri">${dateKisaString(detBitTS)}</span>` +
								`<span class="veri">${timeKisaString(detBitTS)}</span>` +
							`</div>`
						)
					)
				}
			}),
			new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 8, /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName }).tipDecimal(),
			new GridKolon({
				belirtec: 'ekBilgi', text: 'Ek Bilgi', minWidth: 40, maxWidth: 400, width: '18%', filterType: 'input', cellClassName: globalCellsClassName,
				cellBeginEdit: (...args) => this.onCellBeginEdit(...args), cellEndEdit: (...args) => this.onCellEndEdit(...args),
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const htmlListe = [], ekOzellikler = rec._ekOzellikler || {};
					if (!$.isEmptyObject(ekOzellikler)) {
						const subHTMLListe = [];
						for (const [key, value] of Object.entries(ekOzellikler)) {
							if (!value) { continue }
							subHTMLListe.push(`<div class="ekOzellik"><span class="etiket">${key}</span><span class="ek-bilgi">=</span><span class="veri">${value.toLocaleString()}</span></div>`)
						}
						if (subHTMLListe.length) {
							htmlListe.push(
								`<li class="ekOzellikler flex-row">` + '\r\n' +
									`<div class="title">Ek Öz.</div>` +
									`<span class="ek-bilgi">: </span>` + '\r\n' +
									`<div class="content flex-row">` + '\r\n' +
										subHTMLListe.join('\r\n') + '\r\n' +
									`</div>` + '\r\n' +
								`</li>` + '\r\n'
							)
						}
					}
					const iskartalar = rec._iskartalar || {};
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
								`<div class="title">Iskarta</div>` +
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
			}).noSql()
		])
	}
	static digerMenuIstendi(e) {
		$.extend(e, { formDuzenleyici: _e => {
			_e = $.extend({}, e, _e); const {form, close, recs} = _e; form.altAlta();
			const tezgahVarmi = !!recs?.filter(rec => !!rec.tezgahkod)?.length;
			form.addStyle(e = `$elementCSS .formBuilder-element.parent { margin-top: 5px !important }`);
			let altForm = form.addFormWithParent().yanYana(2);
				altForm.addCheckBox('sadeceIslenebilirOlanlarmi', 'İşlenebilir Olanlar').getValueIslemi(e => e.builder.rootPart.parentPart.secimler.sadeceIslenebilirOlanlarmi.value)
					.degisince(e => this.sadeceIslenebilirOlanlarmi_secimDegisti(e)).onAfterRun(e => e.builder.rootPart.parentPart.sadeceIslenebilirOlanlarmi = e.builder);
				altForm.addCheckBox('goreviOlanlarmi', 'Görevi Olanlar').getValueIslemi(e => e.builder.rootPart.parentPart.secimler.goreviOlanlarmi.value)
					.degisince(e => this.goreviOlanlarmi_secimDegisti(e)).onAfterRun(e => e.builder.rootPart.parentPart.fbd_goreviOlanlarmi = e.builder);
				altForm.addCheckBox('sadeceBaslamismi', 'Başlamış Olanlar').getValueIslemi(e => e.builder.rootPart.parentPart.secimler.sadeceBaslamismi.value)
					.degisince(e => this.sadeceBaslamismi_secimDegisti(e)).onAfterRun(e => e.builder.rootPart.parentPart.fbd_sadeceBaslamismi = e.builder);
			altForm = form.addFormWithParent().yanYana(2);
				altForm.addButton('yeniOper', undefined, 'Yeni Operasyon').onClick(e => { close(); this.yeniOperIstendi(_e) });
				altForm.addButton('yeniGorev', undefined, 'Yeni Görev').onClick(e => { close(); this.yeniGorevIstendi(_e) });
				altForm.addButton('gerceklemeYap', undefined, 'Gerçekleme Yap').onClick(e => { close(); this.gerceklemeYapIstendi(_e) });
				altForm.addButton('gerceklemeler', undefined, 'Gerçeklemeler').onClick(e => { close(); this.gerceklemelerIstendi(_e) });
				altForm.addButton('isBaslat', undefined, 'İş Başlat').onClick(e => { close(); this.isBaslatIstendi(_e) }).onBuildEk(e => { const {input} = e.builder; if (!tezgahVarmi) { input.jqxButton({ disabled: true }) } });
				altForm.addButton('isDurdur', undefined, 'İş Durdur').onClick(e => { close(); this.isDurdurIstendi(_e) }).onBuildEk(e => { const {input} = e.builder; if (!tezgahVarmi) { input.jqxButton({ disabled: true }) } })
		} }); this.openContextMenu(e)
	}
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) {
		super.rootFormBuilderDuzenleSonrasi_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addCheckBox(rfb, {
			id: 'sadeceIslenebilirOlanlarmi', text: 'İşl.', value: e => e.builder.rootPart.secimler.sadeceIslenebilirOlanlarmi.value,
			handler: e => this.sadeceIslenebilirOlanlarmi_secimDegisti(e),
			onAfterRun: e => e.builder.rootPart.fbd_sadeceIslenebilirOlanlarmi = e.builder
		});
		let fbd = rfb.addForm({
			id: 'barkod', parent: e => e.builder.rootPart.islemTuslariPart.sol,
			layout: e => { const {builder} = e, {id} = builder; return $(`<div class="${id}-parent"><input id="${id}" name="${id}" class="full-wh" type="textbox" placeholder="Barkodu okutunuz"/></div>`) }
		}).addStyle_fullWH(180)
			.addStyle(...[
				e => `$builderCSS { display: inline-block; top: 0 !important; min-width: unset !important }`,
				e => `$builderCSS > input { font-weight: bold; font-size: 85%; text-align: center; color: lightgreen; background: #555 }`
			 ])
			.onAfterRun(e => {
				const {builder} = e, {layout} = builder, input = layout.find('input');
				input.on('focus', evt => setTimeout(() => evt.currentTarget.select(), 150));
				input.on('keyup', evt => {
					const key = evt.key?.toLowerCase();
					if (key == 'enter' || key == 'linefeed') {
						const value = evt.currentTarget.value.trim(); this.barkodOkutuldu($.extend({}, e, { event: evt, value }));
						setTimeout(() => input.focus(), 500)
					}
				});
				setTimeout(() => input.focus(), 500)
			});
		fbd.addStyle(...[
			e => `$builderCSS { position: relative; top: 10px; margin-left: 20px }`,
			e => `$builderCSS > label { font-weight: bold; color: #999; position: relative; top: -5px; margin-left: 5px }`,
			e => `$builderCSS > input:checked + label { color: royalblue }`
		])
	}
	static async barkodOkutuldu(e) {
		const {builder} = e, {part} = builder, {mfSinif, secimler} = part;
		let barkod = e.value, carpan = null; if (barkod) {
			const barkodLower = barkod.toLowerCase();
			for (const separator of ['x', '*']) { const parts = barkod.split(separator, 2); if (parts.length > 1) { carpan = asFloat(parts[0]) || null; barkod = parts[1].trim(); break } }
		}
		const parser = barkod ? await app.barkodBilgiBelirleFromEOU({ barkod, carpan }) : null;
		delete secimler._ekWhere; if (parser) {
			/* { carpan: carpan || null, miktar: carpan || null,
				emirNox: result_parts[0], opNo: result_parts[1],
				revNo: (result_parts.length == 4 ? result_parts[2] : null),
				shKod: (result_parts.length == 4 ? result_parts[3] : result_parts[2]) } */
			const opNo = asInteger(parser.opNo), {emirNox, shKod, carpan, miktar} = parser;
			const alias = mfSinif.tableAlias, wh = secimler._ekWhere = new MQWhereClause();
			if (emirNox) { wh.degerAta(emirNox, 'emr.fisnox') }
			if (opNo) { wh.degerAta(opNo, `${alias}.opno`) }
			if (shKod) { wh.like(`%${shKod}%`, 'frm.formul') }
		}
		part.tazele()
		/* barkodRec = parser ? new MQBarkodRec(parser) : null;
		try { if (barkodRec && !barkodRec.oemSayac) await barkodRec.ekBilgileriBelirle() } catch (ex) { console.error(ex) }
		const sec = secimler.oemSayac; sec.basi = sec.sonu = (barkodRec ? barkodRec.oemSayac || -1 : null); part.tazele()*/
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const part = e.sender, sec = part.secimler;
		const {fbd_sadeceIslenebilirOlanlarmi, grid, gridWidget, _expandedIndexes} = part;
		const sabit_hatKod = app.params.config.hatKod;
		if (sec && fbd_sadeceIslenebilirOlanlarmi) {
			const input = fbd_sadeceIslenebilirOlanlarmi.layout.children('input'), secValue = sec.sadeceIslenebilirOlanlarmi.value;
			if (input.is(':checked') != secValue) { input.prop('checked', secValue) }
		}
		const groups = gridWidget._groups || this.defaultGroups; let rowIndex = gridWidget.getselectedrowindexes()[0]; if (rowIndex != null && rowIndex < 0) { rowIndex = null }
		if (!$.isEmptyObject(groups)) { grid.jqxGrid('groups', groups.filter(x => !!x)) }
		if (_expandedIndexes) { for (const _rowIndex in _expandedIndexes) { gridWidget.showrowdetails(_rowIndex) } }
		if (rowIndex != null) {
			gridWidget.selectrow(rowIndex); const maxRows = gridWidget.dataview.totalrecords;
			gridWidget.ensurerowvisible(Math.max(Math.min(rowIndex + 6, maxRows - 1), 0))
		}
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		liste.push(this.sayacSaha, 'emirno', 'opadi', 'stokadi', 'islenebilirmiktar', 'peradi', 'tezgahadi', 'uretmiktar', 'hatadi')
	}
	static super_standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e) }
	static loadServerData_queryDuzenle(e) {
		e = e || {}; super.loadServerData_queryDuzenle(e); const sabit_hatKod = app.params.config.hatKod, alias = e.alias || this.tableAlias;
		const {tabletSadeceSonOperasyon} = app.params.operGenel || {}, {sent, stm} = e;
		sent.fromIliski('emirdetay edet', `${alias}.emirdetaysayac = edet.kaysayac`).fromIliski('isemri emr', 'edet.fissayac = emr.kaysayac');
		sent.fromIliski('operasyon op', `${alias}.opno = op.opno`).fromIliski('urtfrm frm', 'edet.formulsayac = frm.kaysayac');
		sent.fromIliski('stkmst stk', 'frm.formul = stk.kod').fromIliski('ismerkezi hat', `${alias}.ismrkkod = hat.kod`);
		sent.fromIliski('tekilmakina tez', `${alias}.tezgahkod = tez.kod`).fromIliski('personel per', `${alias}.perkod = per.kod`);
		sent.where.add(`emr.silindi = ''`, `emr.durumu = 'D'`); if (tabletSadeceSonOperasyon) { sent.where.add(`oem.sonasama <> ''`) }
		if (sabit_hatKod) { sent.where.degerAta(sabit_hatKod, `${alias}.ismrkkod`) }
		sent.sahalar.add(`${alias}.ismrkkod hatkod`, 'hat.aciklama hatadi').addWithAlias(alias, 'opno', 'tezgahkod', 'perkod')
			.add('emr.bizsubekod', 'emr.no emirno', 'emr.fisnox emirnox', 'emr.tarih emirtarih', `${alias}.opno`, 'op.aciklama opadi',
				 'frm.formul stokkod', 'stk.aciklama stokadi', 'stk.pdmkodu', 'tez.aciklama tezgahadi', 'per.aciklama peradi');
		stm.orderBy.add('hatkod', 'emirnox DESC')
	}
	static orjBaslikListesi_recsDuzenle(e) {
		super.orjBaslikListesi_recsDuzenle(e); const {recs} = e;
		if (recs?.length) {
			const keys = ['tezgahkod', 'perkod', 'tezgahadi', 'peradi'];
			for (const rec of recs) { for (const key of keys) { if (rec[key] == null) { rec[key] = '' } } }
		}
	}
	static super_loadServerData_queryDuzenle(e) { super.loadServerData_queryDuzenle(e) }
	static loadServerData_detaylar(e) {
		const {gridPart, sender, parentRec, secimler} = e, oemSayac = parentRec.kaysayac;
		return MQGercekleme.loadServerData({ ozelQueryDuzenle: e => { const {aliasVeNokta, stm} = e; for (const sent of stm.getSentListe()) { sent.where.degerAta(oemSayac, `${aliasVeNokta}fissayac`) } } })
	}
	static oemHTMLDuzenle(e) {
		const {rec, parent} = e; if (!(rec && parent?.length)) return this
		const getConvertedValue = value => {
			if (value) {
				if (isDate(value)) value = dateKisaString(asDate(value))
				else if (value.toLocaleString) value = value.toLocaleString()
			}
			return value
		}
		const addItem = e => {
			const {id, etiket, value} = e;
			let {ekBilgi} = e, ekBilgiGetter = $.isFunction(ekBilgi) ? ekBilgi : null; if (ekBilgiGetter) { ekBilgi = null }
			const elm = $(
				`<div id="${id}" class="item">` +
					`<div class="asil flex-row">` +
						`<div class="etiket">${etiket}:</div>` +
						`<div class="veri">${getConvertedValue(value)}</div>` +
					`</div>` +
					`<div class="ek-bilgi">` +
						(ekBilgi ?? '') +
					`</div>` +
				`</div>`
			);
			if (ekBilgiGetter) {
				const {ekBilgiAttr} = e;
				(async () => {
					const _e = $.extend({}, e, { elm }); let result = await getFuncValue.call(this, ekBilgiGetter, _e),  rec = await result; if ($.isArray(rec)) { rec = rec[0] }
					if (rec) {
						ekBilgi = rec;
						if (typeof ekBilgi == 'object') {
							if (ekBilgiAttr) {
								const attrListe = $.isArray(ekBilgiAttr) ? ekBilgiAttr : [ekBilgiAttr];
								for (const attr of attrListe) { const value = rec[attr]; if (value != null) { ekBilgi = value; break } }
							}
							else { ekBilgi = Object.values(rec)[0] }
						}
						if (ekBilgi) { elm.children('.ek-bilgi').html(getConvertedValue(ekBilgi)) }
					}
				})()
			}
			elm.appendTo(parent); return elm
		};
		parent.addClass('parentRecBilgi full-wh flex-row');
		const emirNox = rec.emirNox ?? rec.emirnox, opNo = rec.opNo ?? rec.opno, stokKod = rec.stokKod ?? rec.stokkod, {miktar} = rec;
		const hatKod = rec.hatKod ?? rec.hatkod, tezgahKod = rec.tezgahKod ?? rec.tezgahkod, perKod = rec.perKod ?? rec.perkod;
		if (hatKod) { addItem({ id: 'hatKod', etiket: 'Hat', value: hatKod, ekBilgiAttr: ['hatAdi', 'hatadi', 'aciklama'], ekBilgi: async e => ({ aciklama: await MQHat.getGloKod2Adi(e.value) }) }) }
		if (emirNox) { addItem({ id: 'emirNox', etiket: 'Emir', value: emirNox, ekBilgiAttr: ['emirTarih', 'emirtarih', 'aciklama'], ekBilgi: async e => ({ aciklama: await MQEmir.getGloKod2Adi(e.value) }) }) }
		if (opNo) { addItem({ id: 'opNo', etiket: 'Oper', value: opNo, ekBilgiAttr: ['opAdi', 'opadi', 'aciklama'], ekBilgi: async e => ({ aciklama: await MQOperasyon.getGloKod2Adi(e.value) }) }) }
		if (stokKod) { addItem({ id: 'stokKod', etiket: 'Stok', value: stokKod, ekBilgiAttr: ['stokAdi', 'stokadi', 'aciklama'], ekBilgi: async e => ({ aciklama: await MQStok.getGloKod2Adi(e.value) }) }) }
		if (miktar) { addItem({ id: 'miktar', etiket: 'Miktar', value: miktar }) }
		if (tezgahKod) { addItem({ id: 'tezgahKod', etiket: 'Tezgah', value: tezgahKod, ekBilgiAttr: ['tezgahAdi', 'tezgahadi', 'aciklama'], ekBilgi: async e => ({ aciklama: await MQTezgah.getGloKod2Adi(e.value) }) }) }
		if (perKod) { addItem({ id: 'perKod', etiket: 'Per', value: perKod, ekBilgiAttr: ['perAdi', 'peradi', 'aciklama'], ekBilgi: async e => ({ aciklama: await MQPersonel.getGloKod2Adi(e.value) }) }) }
		return this
	}
	static sadeceIslenebilirOlanlarmi_secimDegisti(e) {
		const {builder} = e; let part = e.part ?? builder.rootPart; if (!part?.secimler && part.parentPart) { part = part.parentPart }
		const sec = part.secimler, {secimlerPart} = part, input = builder.layout.children('input'), value = sec.sadeceIslenebilirOlanlarmi.value = input.is(':checked');
		if (secimlerPart) secimlerPart.secim2Info.sadeceIslenebilirOlanlarmi.element.children('.veri').val(value);
		part.tazeleDefer()
	}
}
class MQOEMVeGorev extends MQOEM {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Operasyon ve Görevler' }
	static get defaultGroups() { return [...super.defaultGroups, 'hatadi'] }
	static secimlerDuzenle(e) {
		super.super_secimlerDuzenle(e); const sabit_hatKod = app.params.config.hatKod, sec = e.secimler;
		sec.grupEkle({ kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true });
		const _liste = {
			sadeceIslenebilirOlanlarmi: new SecimBoolTrue({ etiket: 'İşlenebilir Olanlar' }),
			goreviOlanlarmi: new SecimBool({ etiket: 'Görevi Olanlar' }),
			sadeceBaslamismi: new SecimBool({ etiket: 'Sadece Başlamış' }),
			hatKod: new SecimString({ etiket: 'Hat', mfSinif: MQHat }).birKismi(),
			hatAdi: new SecimOzellik({ etiket: 'Hat Adı' }),
			emirTarih: new SecimDate({ etiket: 'Emir Tarih' }),
			emirNo: new SecimString({ etiket: 'Emir No' }),
			opNo: new SecimInteger({ etiket: 'Operasyon', mfSinif: MQOperasyon }).birKismi(),
			opAdi: new SecimOzellik({ etiket: 'Op. Adı' }),
			stokKod: new SecimString({ etiket: 'Ürün' }),
			stokAdi: new SecimOzellik({ etiket: 'Ürün Adı' }),
			pdmKod: new SecimString({ etiket: 'PDM Kodu' }),
			tezgahKod: new SecimString({ etiket: 'Tezgah', mfSinif: MQTezgah }),
			tezgahAdi: new SecimOzellik({ etiket: 'Tezgah Adı' }),
			perKod: new SecimString({ etiket: 'Personel', mfSinif: MQPersonel }),
			perAdi: new SecimOzellik({ etiket: 'Personel Adı' }),
			oemSayac: new SecimNumber({ etiket: 'OEM ID', grupKod: 'teknik' })
		};
		if (sabit_hatKod) { for (const key of ['hatKod', 'hatAdi']) delete _liste[key] }
		sec.secimTopluEkle(_liste);
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, wh = e.where, sec = e.secimler;
			/*if (sec.goreviOlanlarmi.value) wh.add('oisl.kaysayac IS NOT NULL')*/
			if (sec.sadeceIslenebilirOlanlarmi.value) wh.add(`${aliasVeNokta}islenebilirmiktar > 0`)
			if (!sabit_hatKod) { wh.basiSonu(sec.hatKod, 'hat.kod'); wh.ozellik(sec.hatAdi, 'hat.aciklama') }
			wh.basiSonu(sec.hatKod, 'hat.kod');
			wh.ozellik(sec.hatAdi, 'hat.aciklama');
			wh.basiSonu(sec.emirTarih, 'emr.tarih');
			wh.basiSonu(sec.emirNo, 'emr.fisnox');
			wh.basiSonu(sec.opNo, `${aliasVeNokta}opno`);
			wh.ozellik(sec.opAdi, 'op.aciklama');
			wh.basiSonu(sec.stokKod, 'frm.formul');
			wh.ozellik(sec.stokAdi, 'stk.aciklama');
			wh.basiSonu(sec.pdmKod, 'stk.pdmkodu');
			wh.basiSonu(sec.tezgahKod, `${aliasVeNokta}tezgahkod`);
			wh.ozellik(sec.tezgahAdi, 'tez.aciklama');
			wh.basiSonu(sec.perKod, `${aliasVeNokta}perkod`);
			wh.ozellik(sec.perAdi, 'per.aciklama');
			wh.basiSonu(sec.oemSayac, `${aliasVeNokta}${sayacSaha}`)
			const {_ekWhere} = sec; if (_ekWhere) { wh.birlestir(_ekWhere) }
		})
	}
	static orjBaslikListesi_initRowDetails(e) {
		const {parentRec} = e; if (!parentRec || parentRec._gorevSatirimi) { return false }
		return super.orjBaslikListesi_initRowDetails(e)
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args} = e, {groupsRenderer} = args;
		$.extend(e.args, {
			groupsRenderer: (text, group, expanded, groupInfo) => {
				const belirtec = groupInfo.groupcolumn?.datafield;
				if (belirtec == 'opno' || belirtec == 'opadi') {
					const allSubItems = [], fillSubItems = info => {
						if (!info) { return } let {subItems, subGroups} = info;
						if (subItems?.length) { allSubItems.push(...subItems) }
						if (subGroups?.length) { for (const subGroup of subGroups) { if (subGroup) { fillSubItems(subGroup) } } }
					};
					fillSubItems(groupInfo); const sonAsamami = allSubItems.every(rec => asBool(rec.sonasama));
					if (sonAsamami) { group += `<span class="orangered ek-bilgi" style="font-size: 90%; margin-left: 30px">(son)</span>` }
				}
				let result = getFuncValue.call(this, groupsRenderer, text, group, expanded, groupInfo);
				return result
			}
		})
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const part = e.sender, sec = part.secimler, {fbd_sadeceIslenebilirOlanlarmi, fbd_goreviOlanlarmi, fbd_sadeceBaslamismi} = part;
		if (sec) {
			if (fbd_sadeceIslenebilirOlanlarmi) {
				const input = fbd_sadeceIslenebilirOlanlarmi.layout.children('input'), secValue = sec.sadeceIslenebilirOlanlarmi.value;
				if (input.is(':checked') != secValue) { input.prop('checked', secValue) }
			}
			if (fbd_goreviOlanlarmi) {
				const input = fbd_goreviOlanlarmi.layout.children('input'), secValue = sec.goreviOlanlarmi.value;
				if (input.is(':checked') != secValue) { input.prop('checked', secValue) }
			}
			if (fbd_sadeceBaslamismi) {
				const input = fbd_sadeceBaslamismi.layout.children('input'), secValue = sec.sadeceBaslamismi.value;
				if (input.is(':checked') != secValue) { input.prop('checked', secValue) }
			}
		}
	}
	static standartGorunumListesiDuzenle(e) {
		super.super_standartGorunumListesiDuzenle(e); const {liste} = e;
		if (config.dev) { liste.push(this.sayacSaha) }
		liste.push('emirno', 'stokadi', 'islenebilirmiktar', 'peradi', 'tezgahadi', 'isuretilen', 'oemislemdurum', 'basts', 'kalansaat', 'opadi', 'hatadi', 'pdmkodu')
	}
	static orjBaslikListesiDuzenle_ara(e) {
		super.orjBaslikListesiDuzenle_ara(e); const alias = e.alias || this.tableAlias, {liste, globalCellsClassName} = e;
		liste.push(...[
			new GridKolon({
				belirtec: 'isuretilen', text: '<div class="grid-col-2">İş Mikt. Üretilen</div>', genislikCh: 8,
				cellClassName: (colDef, rowIndex, belirtec, value, rec) => {
					let result = getFuncValue.call(this, globalCellsClassName, colDef, rowIndex, belirtec, value, rec).split(' ');
					result.push(asFloat(value) < 0 ? 'red' : 'royalblue bold');
					return result.join(' ')
				},
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(
						html, (
							`<div class="parent"><span class="ek-veri">${(rec.ismiktari || 0).toLocaleString()}</span></div>` +
							`<div class="parent"><span class="_veri">${(rec.isuretilen || 0).toLocaleString()}</span></div>`
						)
					)
				}
			}).noSql().tipDecimal(),
			new GridKolon({
				belirtec: 'oemislemdurum', text: ' ', genislikCh: 4, /* filterType: 'checkedlist', */
				cellClassName: (colDef, rowIndex, belirtec, value, rec) => {
					let result = getFuncValue.call(this, globalCellsClassName, colDef, rowIndex, belirtec, value, rec).split(' ');
					result.push('bold');
					const durum = (rec.oemislemdurum || '').trim().toUpperCase();
					switch (durum) {
						case 'AT': result.push('bg-lightroyalblue'); break
						case 'DV': result.push('bg-lightgreen'); break
						case 'DR': result.push('bg-lightred'); break
						case 'PL': result.push('bg-lightroyalblue'); break
					}
					return result.join(' ')
				}
			}).noSql(),
			new GridKolon({
				belirtec: 'basts', text: 'Baş.Zaman', genislikCh: 20, cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const durum = (rec.oemislemdurum || '').toUpperCase(), durNedenAdi = rec.durnedenadi || '';
					let durumText, ts, durSn;
					switch (durum) {
						case 'PL': durumText = 'Plan'; ts = asDate(rec.tavbaszaman); break
						case 'KP': durumText = 'Kapanmış'; ts = setTime(rec.bittarih, rec.bitzaman); break
						case 'DR': durumText = `<b class="ek-veri">Dur${durNedenAdi ? `(${durNedenAdi})` : ''}:</b>`; durSn = roundToFra(asFloat(rec.duraksamasn) / 60, 1); break
						default: durumText = '';
					}
					if (!(ts || durSn))
						ts = setTime(rec.bastarih, rec.baszamants ?? rec.planbaszamants)
					const _hasTime = hasTime(ts);
					return changeTagContent(
						html, (
							`<div class="parent">` +
								( durumText ? `<span class="durum veri">${durumText}</span>` : '' ) +
								( durSn ? `<span class="veri darkred">${asSaniyeKisaString(durSn)}</span></span>` : '' ) +
							`</div>` +
							`<div class="parent">` +
								( ts ? `<span class="tarih ts ${_hasTime ? 'ek-veri' : 'veri'}">${dateKisaString(ts)}</span>` : '' ) +
								( _hasTime ? `<span class="saat ts veri">${timeKisaString(ts)}</span>` : '' ) +
							`</div>`
						)
					)
				}
			}).noSql(),
			new GridKolon({
				belirtec: 'kalansaat', text: 'Kalan Saat', genislikCh: 11, cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const durum = (rec.oemislemdurum || '').toUpperCase(), kalanSaat = rec.kalansaatsure;
					const durSn = durum == 'DR' ? roundToFra(asFloat(rec.duraksamasn) / 60, 1) : 0;
					return changeTagContent(
						html, (
							`<div class="parent">` +
								( kalanSaat ? `<span class="kalanSaat veri">${kalanSaat}</span> <span class="ek-bilgi">sa</span>` : '' ) +
							`</div>` +
							`<div class="parent">` +
								( durSn ? `<span class="duraksama"><span class="ek-veri"><b class="ek-veri">Dur:</b> </span><span class="veri darkred">${asSaniyeKisaString(durSn)}</span></span>` : '' ) +
							`</div>`
						)
					)
				}
			}).noSql()
		])
	}
	static loadServerData_queryDuzenle(e) { super.super_loadServerData_queryDuzenle(e) }
	static async loadServerData_querySonucu(e) {
		const args = e.args ?? {}, sec = e.secimler ?? e.sender?.secimler, hatKod = args.hatKod ?? app.params.config.hatKod, {tabletSadeceSonOperasyon} = app.params.operGenel || {};
		let ekClauseStr = sec ? sec.getTBWhereClause().toString_baslangicsiz() : null;
		if (ekClauseStr) {
			const donusumDict = { 'emr.': 'fis.', 'frm.formul': 'stk.kod', 'hat.': 'ismrk.' };
			for (const [search, replace] of Object.entries(donusumDict)) { ekClauseStr = ekClauseStr.replaceAll(search, replace) }
		}
		const _e = {
			query: 'opyon_bekleyenler',
			params: [
				(hatKod ? { name: '@hatKod', type: 'varchar', value: hatKod } : null),
				(ekClauseStr ? { name: '@ekClause', type: 'varchar', value: ekClauseStr } : null),
				{ name: '@sadeceIslenebilir', type: 'bit', value: bool2Int(sec?.sadeceIslenebilirOlanlarmi?.value) },
				{ name: '@goreviOlanlar', type: 'bit', value: bool2Int(sec?.goreviOlanlarmi?.value) },
				{ name: '@sadeceBaslamis', type: 'bit', value: bool2Int(sec?.sadeceBaslamismi?.value) },
				(tabletSadeceSonOperasyon ? { name: '@sadeceSonAsama', type: 'bit', value: 1 } : null)
			].filter(x => !!x)
		}
		let recs = await app.sqlExecSP(_e); if (!$.isEmptyObject(recs)) {
			const donusumDict = { oemsayac: this.sayacSaha, oemislemsayac: 'isid', oislemdurum: 'oemislemdurum', fisnox: 'emirnox', ismrkkod: 'hatkod', ismrkadi: 'hatadi' };
			const {sayacSaha} = this; let sonOEMSayac;
			for (const rec of recs) {
				for (const key in donusumDict) { const value = rec[key]; if (value !== undefined) { rec[donusumDict[key]] = value; delete rec[key] } }
				const oemSayac = rec[sayacSaha]; if ((oemSayac && sonOEMSayac) && oemSayac == sonOEMSayac) { rec._gorevSatirimi = true }
				sonOEMSayac = oemSayac; $.extend(rec, { emirno: asInteger(rec.emirnox), opno: asInteger(rec.opno), islenebilirmiktar: rec.islenebilirmiktar || 0, isuretilen: rec.isuretilen || 0 })
			}
			recs.sort((a, b) => { return (a.hatkod < b.hatkod ? 1 : a.hatkod > b.hatkod ? -1 : a.emirno < b.emirno ? 1 : a.emirno > b.emirno ? -1 : 0) } )
		}
		return recs
	}
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) {
		super.rootFormBuilderDuzenleSonrasi_listeEkrani(e); const rfb = e.rootBuilder;
		/*this.fbd_listeEkrani_addCheckBox(rfb, {
			id: 'goreviOlanlarmi', text: 'Grv.', value: e => e.builder.rootPart.secimler.goreviOlanlarmi.value,
			handler: e => this.goreviOlanlarmi_secimDegisti(e), onAfterRun: e => e.builder.rootPart.fbd_goreviOlanlarmi = e.builder
		});
		this.fbd_listeEkrani_addCheckBox(rfb, {
			id: 'sadeceBaslamismi', text: 'Baş.', value: e => e.builder.rootPart.secimler.sadeceBaslamismi.value,
			handler: e => this.sadeceBaslamismi_secimDegisti(e), onAfterRun: e => e.builder.rootPart.fbd_sadeceBaslamismi = e.builder
		});*/
		/*this.fbd_listeEkrani_addButton(rfb, 'yeniGorev', 'GRV', 70, e => this.yeniGorevIstendi(e));
		this.fbd_listeEkrani_addButton(rfb, 'isBaslat', 'BAŞ', 70, e => this.isBaslatIstendi(e));
		this.fbd_listeEkrani_addButton(rfb, 'isDurdur', 'DUR', 70, e => this.isDurdurIstendi(e));*/
		this.fbd_listeEkrani_addButton(rfb, 'gerceklemeYap', 'GER', 50, e => this.gerceklemeYapIstendi(e));
		/*this.fbd_listeEkrani_addButton(rfb, 'gerceklemeler', 'G.LST', 80, e => this.gerceklemelerIstendi(e));*/
		this.fbd_listeEkrani_addButton(rfb, 'digerMenu', '...', 50, e => this.digerMenuIstendi(e));
		/*rfb.addForm('islemTuslari').setLayout(e => e.builder.rootPart.islemTuslari)
			.addStyle(e => `$elementCSS #vazgec { margin-left: 20px }`)*/
	}
	static goreviOlanlarmi_secimDegisti(e) {
		const {builder} = e; let part = e.part ?? builder.rootPart; if (!part?.secimler && part.parentPart) { part = part.parentPart }
		const sec = part.secimler, {secimlerPart} = part, input = builder.layout.children('input'), value = sec.goreviOlanlarmi.value = input.is(':checked');
		if (secimlerPart) { secimlerPart.secim2Info.goreviOlanlarmi.element.children('.veri').val(value) }
		part.tazeleDefer()
	}
	static sadeceBaslamismi_secimDegisti(e) {
		const {builder} = e; let part = e.part ?? builder.rootPart; if (!part?.secimler && part.parentPart) { part = part.parentPart }
		const sec = part.secimler, {secimlerPart} = part, input = builder.layout.children('input'), value = sec.sadeceBaslamismi.value = input.is(':checked');
		if (secimlerPart) { secimlerPart.secim2Info.sadeceBaslamismi.element.children('.veri').val(value) }
		part.tazeleDefer()
	}
	static async isBaslatIstendi(e) {
		const gridRec = this.getGridRec(e); if (!gridRec) { return false }
		try {
			const tezgahKod = gridRec.tezgahkod; if (!tezgahKod) { throw { isError: true, errorText: `<b>Tezgah</b> belirtilmeden <u>İş Başlat</u> yapılamaz` } }
			let result = await app.sqlExecSP({
				query: 'opyon_baslat',
				params: [
					{ name: '@tezgahKod', type: 'varchar', value: tezgahKod },
					{ name: '@perKod', type: 'varchar', direction: 'output' },
					{ name: '@durumKod', type: 'char', size: 2, direction: 'output' }
				].filter(x => !!x)
			});
			this.tazeleVeYakala(e)
		}
		catch (ex) { hConfirm(getErrorText(ex), 'İş Başlat'); throw ex }
	}
	static async isDurdurIstendi(e) {
		const gridRec = this.getGridRec(e); if (!gridRec) { return false }
		try {
			const tezgahKod = gridRec.tezgahkod; if (!tezgahKod) { throw { isError: true, errorText: `<b>Tezgah</b> belirtilmeden <u>İş Durdur</u> yapılamaz` } }
			let promise = new $.Deferred(); MQDurNeden.listeEkraniAc({ secince: e => promise.resolve(e.value ?? e.kod), kapaninca: e => promise.resolve(null) })
			const durNedenKod = await promise; if (!durNedenKod) { return false }
			let result = await app.sqlExecSP({
				query: 'opyon_durdur',
				params: [
					{ name: '@tezgahKod', type: 'varchar', value: tezgahKod },
					{ name: '@durNedenKod', type: 'varchar', value: durNedenKod },
					{ name: '@durumKod', type: 'char', size: 2, direction: 'output' }
				].filter(x => !!x)
			});
			this.tazeleVeYakala(e)
		}
		catch (ex) { hConfirm(getErrorText(ex), 'İş Durdur'); throw ex }
	}
	static yeniOperIstendi(e) {
		const gridRec = this.getGridRec(e); if (!gridRec) { return false }
		try {
			const oemSayac = gridRec.kaysayac; if (!oemSayac) { return }
			const promise = new $.Deferred(), args = { tekil: false, oemSayac, urunAgacinaEkleYapilirmi: true };
			MQOperasyon.listeEkraniAc({ args, secince: async e => {
				const opNoListe = e.values; if (!opNoListe?.length) { return }
				const gridPart = e.gridPart ?? e.parentPart ?? e.sender, urunAgacinaEkleFlag = gridPart.urunAgacineEkleFlag ?? false;
				let result = await app.sqlExecSP({
					query: 'mes_yeniOperListeEkle',
					params: [
						(oemSayac ? { name: '@oemSayac', type: 'int', value: oemSayac } : null),
						{ name: '@urunAgacinaEkle', type: 'bit', value: urunAgacinaEkleFlag },
						{ name: '@opNoListe', type: 'structured', value: opNoListe.map(id => ({ id })) }
					].filter(x => !!x)
				});
				promise.resolve(result)
			} });
			promise.then(() => this.tazeleVeYakala(e))
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Operasyon Ekle'); throw ex }
	}
	static async yeniGorevIstendi(e) {
		const gridRec = this.getGridRec(e); if (!gridRec) return false
		try {
			let inst = new MQGorev(gridRec), promise_wait = new $.Deferred();
			await inst.tanimla({
				islem: 'yeni', kaydetIslemi: e => { promise_wait.resolve(e); return true },
				kapaninca: e => promise_wait.resolve(null)
			});
			inst = (await promise_wait)?.inst; if (!inst) return false
			const tezgahKod = inst.tezgahKod || gridRec.tezgahkod, perKod = inst.perKod || gridRec.perkod;
			let result = await app.sqlExecSP({
				query: 'opyon_gorevEkle',
				params: [
					( tezgahKod ? { name: '@tezgahKod', type: 'varchar', value: tezgahKod } : null ),
					{ name: '@oemSayac', type: 'int', value: gridRec[this.sayacSaha] ?? null },
					( perKod ? { name: '@perKod', type: 'varchar', value: perKod } : null ),
					( !inst.suAnmi && inst.basTS ? { name: '@ozelZamanTS', type: 'datetime', value: dateTimeToString(inst.basTS) } : null ),
					( inst.miktar ? { name: '@ozelMiktar', type: 'decimal', value: inst.miktar } : null ),
					{ name: '@islemTuru', type: 'varchar', value: inst.isBaslatilsinmi ? 'B' : 'A' },
					{ name: '@durumKod', type: 'char', size: 2, direction: 'output' }
				].filter(x => !!x)
			});
			this.tazeleVeYakala(e)
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Yeni Görev'); throw ex }
	}
	static async gerceklemeYapIstendi(e) {
		const gridRec = this.getGridRec(e); if (!gridRec) { return false }
		if ((gridRec.islenebilirmiktar || 0) <= 0) { hConfirm('İşlenebilir Miktar yok', 'Gerçekleme Yap'); return false }
		// console.warn('gerceklemeYap butona basıldı', gridRec);
		try {
			let inst = new MQBarkodRec({ rec: gridRec }).durum_new(), queryYapi;
			const promise_wait = new $.Deferred();
			await MQBarkodRec.tanimla({
				// parentPart: app.activeWndPart,
				islem: 'yeni', inst, kaydetIslemi: async e => {
					inst = e.inst; queryYapi = e.queryYapi = await inst.getQueryYapi(e); if (!queryYapi) { return false }
					promise_wait.resolve(e); return true
				},
				kapaninca: e => promise_wait.resolve(null)
			});
			inst = (await promise_wait)?.inst; if (!inst) return false
			try { if (!queryYapi) { return } await app.sqlExecSP(queryYapi) }
			finally { this.tazeleVeYakala(e) }
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Gerçekleme Yap'); throw ex }
	}
	static gerceklemelerIstendi(e) {
		const gridRecs = this.getGridRecs(e); if (!gridRecs) { return false }
		const gridPart = e.gridPart ?? e.sender ?? e.builder?.rootBuilder?.part;
		try {
			const oemSayacListe = gridRecs?.length ? gridRecs.map(rec => rec.kaysayac) : null;
			MQGercekleme.listeEkraniAc({
				secimlerDuzenle: e => { const sec = e.secimler; sec.temizle() },
				args: { oemSayacListe }, kapaninca: e => gridPart?.tazeleDefer()
			})
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Gerçekleme Yap'); throw ex }
	}
}
