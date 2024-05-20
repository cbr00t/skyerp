class MQSeriNo extends MQMasterOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Seri Bilgileri' } static get tableAlias() { return 'sr' } static get kodListeTipi() { return 'USERI' }
	static get localDataBelirtec() { return 'seriNo' } static get secimSinif() { return null } static get gridDetaylimi() { return true }
	static orjBaslikListesi_gridInit(e) {
		super.orjBaslikListesi_gridInit(e); const {sender, grid, gridWidget} = e;
		for (const key of ['rowexpand', 'rowcollapse']) grid.off(key)
		grid.on('rowexpand', evt => {
			const {gridWidget} = sender, _expandedIndexes = sender._expandedIndexes = sender._expandedIndexes || {};
			const index = gridWidget.getrowboundindex(evt.args.rowindex);
			if (index != null && index > -1) _expandedIndexes[index] = true
			gridWidget.clearselection(); gridWidget.selectrow(index)
		});
		grid.on('rowcollapse', evt => {
			const {gridWidget} = sender, _expandedIndexes = sender._expandedIndexes = sender._expandedIndexes || {};
			const index = gridWidget.getrowboundindex(evt.args.rowindex);
			if (index != null && index > -1) { delete _expandedIndexes[index]; setTimeout(() => /*gridWidget.render()*/ gridWidget.updatebounddata(), 10) }
		});
		grid.off('rowdoubleclick')
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args} = e, {rowDetails, rowDetailsTemplate} = args;
		$.extend(args, { columnsHeight: args.columnsHeight * 2.3, rowsHeight: 45, groupIndentWidth: 50, selectionMode: 'singlerow', showFilterRow: true });
		if (rowDetails && rowDetailsTemplate) {
			args.rowDetailsTemplate = rowIndex => {
				const result = getFuncValue.call(this, rowDetailsTemplate, rowIndex);
				if (result) { result.rowdetailsheight = 200 } return result
			}
		}
	}
	static orjBaslikListesi_argsDuzenle_detaylar(e) {
		super.orjBaslikListesi_argsDuzenle_detaylar(e); const {args} = e;
		$.extend(args, { rowsHeight: 38, columnsHeight: args.columnsHeight - 5, selectionMode: 'multiplerows' })
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		liste.push('stokadi', 'opadi', 'miktar', 'serino', 'seriBilgi')
	}
	static orjBaslikListesiDuzenle(e) {
		e = e || {}; super.orjBaslikListesiDuzenle(e);
		/* const sabit_hatKod = e.sabit_hatKod = app.params.config.hatKod; */ const {liste} = e; 
		const globalCellsClassName = e.globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => `mq-seriNo ${belirtec}`;
		liste.push(...[
			new GridKolon({
				belirtec: 'stokadi', text: 'Malzeme', genislikCh: 35,
				/* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(html,
						`<div class="parent">
							<span class="ek-veri">${(rec.stokKod ?? rec.stokkod) || ''}</span>
							<span class="veri">${(rec.stokAdi ?? rec.stokadi) || ''}</span>
						</div>`)
				}
			}).noSql(),
			new GridKolon({
				belirtec: 'opadi', text: 'Önce. Oper.', genislikCh: 25,
				/* filterType: 'checkedlist', */ cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					return changeTagContent(html,
						`<div class="parent">
							<span class="ek-veri">${(rec.opNo ?? rec.opno) || ''}</span>
							<span class="veri">${(rec.opAdi ?? rec.opadi) || ''}</span>
						</div>`)
				}
			}).noSql(),
			new GridKolon({
				belirtec: 'miktar', text: 'Miktar', genislikCh: 8,
				cellClassName: (colDef, rowIndex, belirtec, value, rec) => {
					let result = getFuncValue.call(this, globalCellsClassName, colDef, rowIndex, belirtec, value, rec).split(' ');
					result.push(asFloat(value) < 0 ? 'red' : 'royalblue bold'); return result.join(' ')
				},
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) =>
					changeTagContent(html, `<div class="parent"><span class="_veri">${(rec.miktar || 0).toLocaleString()}</span></div>`)
			}).noSql().tipDecimal(),
			new GridKolon({
				belirtec: 'seriBilgi', text: 'Seçilenler', cellClassName: globalCellsClassName,
				cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
					const part = colDef.gridPart, {uid} = rec;
					const seriNoRecs = Object.values(part.key2SeriNoRecs || {}).filter(recBilgi => recBilgi.parentRec.uid == uid);
					let recsHTML = (
						`<div class="items full-wh">
							${seriNoRecs.map(recInfo => {
								const {rec, parentRec} = recInfo, yerKod = rec.yerkod ?? parentRec?.yerKod, seriNo = rec?.serino;
								let stokAdi = parentRec?.stokAdi ?? parentRec.stokadi; const stokKod = (parentRec?.stokKod ?? parentRec?.stokkod);
								let stokText = stokAdi || stokKod; if (!stokAdi && stokKod) { stokAdi = stokKod2Adi[stokKod]; if (stokAdi) { stokText = stokAdi } }
								return (
									`<div class="item float-left">
										<span class="seriNo">${seriNo || ''}</span>
										${stokText ? `<span class="ek-bilgi">: </span><span class="urunAdi">${stokText || ''}</span>` : ''}
									</div>`
								)
							}).join('')}
						</div>`);
					return changeTagContent(html, `<div class="parent">${recsHTML}</div>`)
				}
			}).noSql(),
			new GridKolon({ belirtec: 'motorText', text: ' ', genislikCh: 3, cellClassName: globalCellsClassName }).noSql()
		])
	}
	static orjBaslikListesiDuzenle_detaylar(e) {
		e = e || {}; super.orjBaslikListesiDuzenle_detaylar(e); const {liste} = e;
		const globalCellsClassName = (colDef, rowIndex, belirtec, value, rec) => `mq-seriNo-detay ${belirtec}`;
		liste.push(...[
			new GridKolon({ belirtec: 'yerkod', text: 'Yer', genislikCh: 16, /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName }).noSql(),
			new GridKolon({ belirtec: 'serino', text: 'Seri', width: '80%', /* filterType: 'checkedlist', */ cellClassName: globalCellsClassName }).noSql()
		])
	}
	static rootFormBuilderDuzenleSonrasi_listeEkrani(e) {
		super.rootFormBuilderDuzenleSonrasi_listeEkrani(e); const rfb = e.rootBuilder;
		rfb.onAfterRun(async e => {
			const {builder} = e, {part} = builder, gerInst = part.args.parentRec, {subeKod, hatKod} = gerInst;
			const sent = new MQSent({
				from: 'subeismrk2depo',
				where: [ { degerAta: subeKod, saha: 'bizsubekod' }, { degerAta: hatKod, saha: 'ismrkkod' } ],
				sahalar: ['depokod', 'hamdepokod', 'ambdepokod']
			});
			gerInst._depoRec = (await app.sqlExecTekil(sent)) || {}
		});
		const fbd_header = rfb.addForm('header')
			.setLayout(e => e.builder.rootPart.header)
			.onAfterRun(e => {
				const {builder} = e, {rootPart} = builder, {layout, islemTuslari} = rootPart;
				layout.css('--header-ek-height', '70px');
				let btn = islemTuslari.find('#tazele');
				btn.prop('id', 'temizle');
				btn.off('click'); btn.on('click', async evt => {
					if (await ehConfirm('<span class="bold darkred">Seri seçimi sıfırlanacak</span><span>, devam edilsin mi?</span>', rootPart.title))
						rootPart.tazele()
				})
				// btn.css('background-image',btn.css('background-image').replace('tazele', 'temizle'));
				// btn.css('background-color', 'lightred')
			});
		const fbd_oemBilgi = fbd_header.addFormWithParent('oemBilgi')
			.onAfterRun(e => {
				const {builder} = e, {layout, rootPart} = builder;
				rootPart.fbd_oemBilgi = builder; MQOEM.oemHTMLDuzenle({ parent: layout, rec: rootPart.args?.parentRec })
			})
			.addStyle(e => `$elementCSS { padding-top: 18px }`)
	}
	static orjBaslikListesi_initRowDetails_son(e) {
		super.orjBaslikListesi_initRowDetails_son(e); const {sender, parentRec} = e, {args} = sender;
		const gerInst = args.parentRec, {subeKod, hatKod, _depoRec} = gerInst;
		const grid = e.parent, gridParent = grid.parent(), parent = gridParent.parent();
		const fbd = new FormBuilder({ parent }).autoAppend().autoAppendMode_prepend()
			.setLayout(e => $(`<div class="header" style="height: auto; background-color: whitesmoke"/>`))
			.onAfterRun(e => sender.onResize());
			/*.addStyle(e =>
				`$elementCSS + .detay-grid-parent > .jqx-grid div[role=row] > .jqx-grid-cell-selected:not(._rowNumber) { border: 1px solid #aaa; background: #5274d7 !important }`,
				`$elementCSS + .detay-grid-parent > .jqx-grid div[role=row] > .jqx-grid-cell-selected:not(._rowNumber) * { font-weight: bold; color: white !important }`
			);*/
		if (false) {
			fbd.addModelKullan('yerKod', 'Yer').dropDown()
				.setAltInst(e => parentRec).setMFSinif(MQStokYer)
				.setEkDuzenleyici(async e => {
					let {recs} = e; const depoKodSet = asSet(Object.values(_depoRec).filter(x => !!x));
					if (depoKodSet != null) recs = recs.filter(rec => !!depoKodSet[rec.kod])
					return recs
				})
				.setValue(e => _depoRec.depokod)
				.addStyle(...[
					e => `$elementCSS { --label-width: 60px; --margin-right: 20px }`,
					e => `$elementCSS > label { font-weight: bold; color: #ccc; width: var(--label-width) !important; min-width: unset !important; margin-right: var(--margin-right); padding-top: 10px }`,
					e => `$elementCSS > div { width: calc(var(--full) - (var(--label-width) + var(--margin-right) + 5px)) !important }`,
					e => `$elementCSS > div .jqx-dropdownlist-content { padding-top: 8px !important }`
				])
			fbd.run()
		}
		const key2SeriNoRecs = sender.key2SeriNoRecs = sender.key2SeriNoRecs || {};
		const getKey = (parentRec, rec) => `${parentRec?.uid ?? ''}|${rec?.uid ?? ''}`;
		grid.on('rowselect', evt => { const rec = evt.args.row, key = getKey(parentRec, rec); key2SeriNoRecs[key] = { parentRec, rec } });
		grid.on('rowunselect', evt => { const rec = evt.args.row, key = getKey(parentRec, rec); delete key2SeriNoRecs[key] })
	}
	static async loadServerData_querySonucu(e) {
		const {sender} = e, {args} = sender, gerInst = args.parentRec, gerMiktar = asFloat(gerInst.miktar);
		if (gerMiktar <= 0) return []
		const {_formulSeriDurumu} = gerInst, gridRecs = [];
		const formulBaz = _formulSeriDurumu.formul?.carpan || 1, stokKod2HammaddeRec = _formulSeriDurumu.hammadde;
		const mq2Kod2Adi = { MQStok: {}, MQOperasyon: {} };
		for (const [stokKod, rec] of Object.entries(stokKod2HammaddeRec)) {
			const hammMiktar = Math.trunc(rec.carpan * gerMiktar / formulBaz), motormu = false, opNo = rec.opNo ?? rec.opno;
			const gridRec = { stokKod, opNo, miktar: hammMiktar, motormu, motorText: (motormu ? 'M' : ''), yer2Seriler: {} }
			mq2Kod2Adi.MQStok[stokKod] = null; if (opNo) mq2Kod2Adi.MQOperasyon[opNo] = null
			gridRecs.push(gridRec)
		}
		for (let [mfSinif, kod2Adi] of Object.entries(mq2Kod2Adi)) {
			if ($.isEmptyObject(kod2Adi)) continue
			mfSinif = typeof mfSinif == 'string' ? getFunc(mfSinif) : mfSinif;
			try {
				const {idSaha, adiSaha} = mfSinif, _recs = await mfSinif.loadServerData({ idListe: Object.keys(kod2Adi) });
				for (const _rec of _recs) {
					const kod = _rec[idSaha];
					if (kod2Adi[kod] == null) kod2Adi[kod] = _rec.aciklama
				}
			}
			catch (ex) { console.error(ex) }
		}
		for (const gridRec of gridRecs) {
			const stokKod = gridRec.stokKod ?? gridRec.stokkod, opNo = gridRec.opNo ?? gridRec.opno;
			let aciklama = mq2Kod2Adi.MQStok[stokKod]; if (aciklama) gridRec.stokAdi = aciklama
			aciklama = mq2Kod2Adi.MQOperasyon[opNo]; if (aciklama) gridRec.opAdi = aciklama
		}
		return gridRecs
	}
	static async loadServerData_detaylar_querySonucu(e) {
		const {parentRec, sender, args} = e, gerInst = args.parentRec, stokKod = parentRec.stokKod ?? parentRec.stokkod, opNo = parentRec.opNo ?? parentRec.opno;
		const {_depoRec} = gerInst, depoKodlari = Object.values(_depoRec).filter(x => !!x);
		const params = [
			{ name: '@stokKod', type: 'varchar', value: stokKod },
			( opNo ? { name: '@opNo', type: 'int', value: opNo } : null ),
			{ name: '@yerListe', type: 'structured', typeName: 'type_charList', value: depoKodlari.map(kod => ({ kod })) }
		].filter(x => !!x);
		const recs = await app.sqlExecSP({ query: 'ou_seriListe', params }); return recs
		// return [{yerkod:'UR',serino:'BLABLA'},{yerkod:'UR',serino:'BLABLA'},{yerkod:'UR',serino:'BLABLA'}]
	}
	static async gridVeriYuklendi_detaylar(e) {
		await super.gridVeriYuklendi_detaylar(e); const part = e.sender, {parentPart, gridWidget} = part, _parentRec = parentPart.selectedRecs[0];
		const seriNoRecs = Object.values(parentPart.key2SeriNoRecs || {}), uidSet = asSet(seriNoRecs.map(recBilgi => recBilgi.rec.uid));
		if (!_parentRec) return
		for (const {parentRec, rec} of seriNoRecs) {
			if (!(parentRec && parentRec.uid == _parentRec.uid)) continue
			if (uidSet[rec?.uid]) gridWidget.selectrow(rec.uid)
		}
	}
}
