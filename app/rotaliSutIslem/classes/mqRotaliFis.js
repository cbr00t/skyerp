class MQRotaliFis extends MQDetayliOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static PrefixSut = 'sut'; static get sinifAdi() { return 'Rotalı Fiş' } static get tableAlias() { return 'fis' } static get detaySinif() { return MQRotaliFisDetay }
	static get tanimlanabilirmi() { return true }
	get detaylarUyarlanmis() {
		let {detaylar} = this; if ($.isEmptyObject(detaylar)) {
			const {localData} = app.params, recs = localData.getData(MQSutRota.dataKey) || [], {detaySinif, PrefixSut} = this.class, sutSiraRecs = localData.getData(MQSutSira.dataKey);
			detaylar = []; for (const rec of recs) {
				const {seq} = rec, mustKod = rec.mustkod, mustAdi = rec.mustadi, toplam = 0, det = new detaySinif({ seq, mustKod, mustAdi, toplam });
				if (sutSiraRecs) { for (let i = 0; i < Math.min(sutSiraRecs.length, MQSutSira.maxSayi); i++) { const seq = i + 1; det[`${PrefixSut}${seq}`] = 0 } }
				detaylar.push(det)
			}
			this.detaylar = detaylar
		}
		for (const det of detaylar) { delete det._degistiSet } return detaylar
	}
	constructor(e) { e = e || {}; super(e); this.setValues({ rec: e }) }
	static islemTuslariDuzenle_listeEkrani(e) {
		let {liste, part} = e; const removeIdSet = asSet(['yeni', 'sil', 'kopya']);
		liste = e.liste = liste.filter(rec => !removeIdSet[rec.id]);
		$.extend(part.ekSagButonIdSet = part.ekSagButonIdSet || {}, asSet(['degistir']))
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler
		sec.secimTopluEkle({
			islemDurum: new SecimTekSecim({
				etiket: 'İşlem Durumu',
				tekSecim: new BuDigerVeHepsi([
					`<div class="orangered full-wh">Bekleyen</div>`,
					`<div class="green full-wh">İşlem Gören</div>`
				])/*.bu()*/
			})
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {PrefixSut} = this, {rec, result} = e, belirtec = e.belirtec ?? e.dataField;
		if (belirtec == '_rotaTipiText') {
			let {rotaTipi} = rec; if (rotaTipi?.char !== undefined) rotaTipi = rotaTipi.char
			switch (rotaTipi) { /* case 'MS': result.push('bg-lightgray'); break; */ case 'TN': result.push('bg-lightcadetblue'); break; case 'TP': result.push('bg-lightpink'); break }
		}
		else if (belirtec == 'gonderimDurum' || belirtec == 'gonderimTS' || belirtec == 'islemDurum') { result.push('bold center'); if (!!rec.gonderimTS) result.push('bg-lightgreen') }
		else if (rec.devreDisimi) result.push('grid-readOnly')
		else if (!!rec.gonderimTS) result.push('bg-lightred-transparent')
		else if (belirtec == 'toplam') { result.push('bg-lightgreen') }
		else if (!!rec.toplam) { result.push('bg-lightcyan') }
		if (belirtec == 'toplam' || belirtec.startsWith(PrefixSut)) { result.push('bold') }
		else if (belirtec == 'rotaKod') { result.push('gray') }
		/*if (belirtec == '_rotaText') result.push('bg-lightblack')*/
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {PrefixSut} = this;
		const cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			/*rec = rec.originalrecord ?? rec;*/
			if (value != null && belirtec == 'gonderimTS') { html = changeTagContent(html, value = dateTimeAsKisaString(asDate(value))) }
			else if (value != null && (belirtec == 'toplam' || belirtec.startsWith(PrefixSut))) {
				if (typeof value != 'number') { value = asFloat(value) }
				html = changeTagContent(html, value ? toStringWithFra(value, 1) : '')
			}
			return html
		};
		liste.push(
			new GridKolon({ belirtec: '_rotaTipiText', text: 'Rota Tipi', genislikCh: 8, cellsRenderer }),
			new GridKolon({ belirtec: 'rotaKod', text: 'Rota', genislikCh: 11, cellsRenderer }),
			new GridKolon({ belirtec: 'rotaAdi', text: 'Rota Adı', genislikCh: 30, cellsRenderer })
			/* sut1, sut2 ... için detay toplamı kolonları */
		);
		const {localData} = app.params, sutSiraRecs = localData.getData(MQSutSira.dataKey); if (sutSiraRecs) {
			for (let i = 0; i < Math.min(sutSiraRecs.length, MQSutSira.maxSayi); i++) {
				const seq = i + 1, rec = sutSiraRecs[i], stokAdi = rec.kisaadi || rec.stokadi;
				liste.push(new GridKolon({ belirtec: `${PrefixSut}${seq}`, text: stokAdi, genislikCh: 16, cellsRenderer, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).tipDecimal(1))
			}
			liste.push(new GridKolon({ belirtec: 'toplam', text: 'TOPLAM', genislikCh: 16, cellsRenderer, aggregates: [{ TOPLAM: gridDipIslem_sum }]} ).tipDecimal(1))
		}
		liste.push(
			new GridKolon({ belirtec: 'gonderimDurum', text: 'Gönderildi?', genislikCh: 13, cellsRenderer, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'gonderimTS', text: 'Gönderim Zamanı', genislikCh: 16, cellsRenderer }),
			new GridKolon({ belirtec: 'islemDurum', text: 'İşlem?', genislikCh: 13, cellsRenderer, filterType: 'checkedlist' })
		)
	}
	static orjBaslikListesi_argsDuzenle(e) { $.extend(e.args, { rowsHeight: 40, columnsHeight: 65, rowsHeight: 50, showGroupsHeader: false, groupsExpandedByDefault: true, showFilterRow: true, showStatusBar: true, showAggregates: true }) }
	static async loadServerData(e) {
		let recs = await super.loadServerData(e), {PrefixSut} = this;
		if (recs) {
			for (const rec of recs) {
				rec.gonderimDurum = !!rec.gonderimTS ? `<div class="darkgreen">Gönderildi</div>` : `<div class="darkred">Gönderilmedi</div>`; const {detaylar} = rec; let toplam;
				rec.toplam = rec.toplam ?? 0; if (!$.isEmptyObject(detaylar)) {
					const {localData} = app.params, sutSiraRecs = localData.getData(MQSutSira.dataKey);
					if (!$.isEmptyObject(sutSiraRecs)) {
						let genelToplam = 0;
						for (let i = 0; i < Math.min(sutSiraRecs.length, MQSutSira.maxSayi); i++) {
							const seq = i + 1, key = `${PrefixSut}${seq}`; toplam = 0;
							for (const det of detaylar) { const value = det[key]; if (typeof value == 'number') toplam += value }
							toplam = roundToFra(toplam, 1); rec[key] = toplam; genelToplam += toplam
						}
						rec.toplam = genelToplam
					}
				};
				rec.islemDurum = !!rec.toplam ? `<div class="black bg-lightgreen">İşlem Yapıldı</div>` : `<div class="black bg-lightred-transparent">Bekleyen</div>`;
			}
			const {secimler} = e, islemDurum = secimler.islemDurum.tekSecim, filters = [];
			if (islemDurum && !islemDurum.hepsimi) { filters.push(rec => { const {toplam} = rec; return islemDurum.bumu ? !toplam : islemDurum.digermi ? !!toplam : true })};
			const applyFilters = rec => { for (const filter of filters) { if (!filter(rec)) return false } return true };
			const _recs = recs; recs = [];
			for (const rec of _recs) { if (!rec.gonderimTS && applyFilters(rec)) { recs.push(rec) } }
			for (const rec of _recs) { if (rec.gonderimTS && applyFilters(rec)) { recs.push(rec) } }
		}
		return recs || []
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const {grid, sender} = e, {secimler} = sender, {fbd_islemDurum} = sender;
		grid.jqxGrid('groups', ['gonderimDurum', 'islemDurum']);
		if (fbd_islemDurum) { fbd_islemDurum.value = secimler.islemDurum.value }
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		const rfb = e.rootBuilder, part = e.sender, {secimler} = part;
		let form = rfb.addForm('islemTuslari', part.islemTuslari).addStyle(...[
			e => `$elementCSS #degistir { margin-right: 45px !important }`,
			e => `$elementCSS #tazele { margin-right: 13px !important }`,
			e => `$elementCSS #degistir.jqx-fill-state-normal { background-color: royalblue !important }`,
			e => `$elementCSS #degistir.jqx-fill-state-pressed { background-color: cadgetblue !important }`,
			e => `$elementCSS #tazele.jqx-fill-state-normal { background-color: #658374 }`
		]);
		form.addForm('fisBaslikBilgi', e => { return $(`<div class="flex-row"><div class="item posta flex-row"><div class="etiket">Posta:</div> <div class="veri">${new Posta(app.params.config.postaKod).aciklama || '??'}</div></div></div>`) })
			.addStyle(...[
				e => `$elementCSS { font-size: 150%; color: #555; position: absolute; top: 3px; left: 250px; width: auto !important }`,
				e => `$builderCSS > .item { min-content !important; margin-inline-end: 30px }`,
				e => `$builderCSS > .item > * { margin-inline-end: 15px }`,
				e => `$builderCSS > .item .veri { font-weight: bold; color: royalblue }`
			]);
		form.addRadioButton('islemDurum').etiketGosterim_yok().setSource(e => secimler.islemDurum.tekSecim.kaListe)
			.onAfterRun(e => { const {builder} = e, {rootPart} = builder; rootPart.fbd_islemDurum = builder })
			.degisince(e => { const {builder} = e, {rootPart, value} = builder, {secimler} = rootPart; secimler.islemDurum.value = value; rootPart.tazele() })
			.addStyle(...[
				e => `$elementCSS { position: absolute; top: 3px; left: 430px; width: auto !important; height: auto !important }`,
				e => `$elementCSS .options > * { width: 130px; height: calc(var(--full) - 15px) !important; margin-inline-end: 3px; padding: 0 3px !important }`,
				e => `$elementCSS .options > * > * { width: var(--full) !important; height: var(--full) !important; padding: 5px 0 !important }`
			])
		form = rfb.addForm('grid', part.grid).addStyle(e => `$elementCSS .jqx-grid-column-header > div > div { margin-top: 8px !important; line-height: 23px !important }`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder, {mfSinif, inst} = e, tanimPart = e.sender;
		rfb.addCSS('no-scroll'); tanimForm.addStyle_fullWH().altAlta();
		const width = 'var(--full)', {PrefixSut} = this, {gonderimTS} = inst; if (!gonderimTS) {
			rfb.vazgecIstendi = async e => {
				const {parentPart} = e, {title} = parentPart; let rdlg = await ehConfirm('Ekrandan kapatılacak, emin misiniz?', title);
				if (rdlg != true) { throw { isError: true, rc: 'userAbort' } }
			}
		}
		const BaslikHeight = 60; let form = tanimForm.addFormWithParent('fisBaslik').yanYana(null).addStyle_wh(width, BaslikHeight);
		form.addForm('fisBaslikBilgi', e => { return $(
			`<div class="flex-row">` +
				`<div class="item rota flex-row"><div class="etiket">Rota:</div> <div class="veri"><b>(${inst.rotaKod || ''})</b> ${inst.rotaAdi || ''}</div> <div class="ek-bilgi">rotası</div></div>` +
				`<div class="item posta flex-row"><div class="etiket">Posta:</div> <div class="veri">${new Posta(app.params.config.postaKod).aciklama || '??'}</div></div>` +
			`</div>`
		) }).addStyle_fullWH().addStyle(...[
			e => `$builderCSS { font-size: 150%; color: #555 }`,
			e => `$builderCSS > .item { min-content !important; margin-inline-end: 30px }`,
			e => `$builderCSS > .item > * { margin-inline-end: 15px }`,
			e => `$builderCSS > .item .veri { font-weight: bold; color: royalblue }`
		]);
		const cellClassName = (sender, rowIndex, belirtec, value, rec) => {
			const result = [belirtec]; rec = rec.originalrecord ?? rec;
			if (belirtec == 'mustAdi' || rec.devredisi) result.push('grid-readOnly')
			else if (belirtec == 'toplam') { result.push('bg-lightgreen') }
			else if (rec._degistiSet && rec._degistiSet[belirtec]) result.push('bg-lightcyan')
			if (belirtec == 'toplam' || belirtec.startsWith(PrefixSut)) { result.push(!!value ? 'bold' : 'lightgray') }
			if (belirtec.startsWith(PrefixSut) && (!rec._degistiSet || !rec._degistiSet[belirtec])) result.push('lightgray')
			return result.join(' ')
		};
		const cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			rec = rec?.originalrecord ?? rec; if (!rec) return html
			switch (belirtec) { case 'mustAdi': html = changeTagContent(html, `<div class="parent flex-row"><div class="kod ek-bilgi">${rec.mustKod}</div><div class="aciklama asil">${getTagContent(html)}</div></div>`); break }
			if (belirtec == 'toplam' || belirtec.startsWith(PrefixSut) && value != null) {
				if (typeof value != 'number') { value = asFloat(value) }
				html = changeTagContent(html, value ? toStringWithFra(value, 1) : '')
			}
			return html
		};
		let sutSiraRecs = app.params.localData.getData(MQSutSira.dataKey); const sutParam = app.params.sut, sutColCount = Math.min(sutSiraRecs.length, MQSutSira.maxSayi);
		const tabloKolonlari = [new GridKolon({ belirtec: 'mustAdi', text: 'Müstahsil', genislikCh: 30, cellClassName, cellsRenderer }).readOnly()];
		if (sutSiraRecs) {
			for (let i = 0; i < sutColCount; i++) {
				const seq = i + 1, rec = sutSiraRecs[i], stokAdi = rec.kisaadi || rec.stokadi;
				tabloKolonlari.push(new GridKolon({
					belirtec: `${PrefixSut}${seq}`, text: stokAdi, genislikCh: 18, columnType: 'template', cellClassName, cellsRenderer,
					aggregates: [{ TOPLAM: gridDipIslem_sum }], validation: (colDef, info, value) => {
						if (value != null) {
							if (typeof value != 'number') value = asFloat(value)
							if (value < 0) return ({ result: false, message: `Değer <b>0'dan küçük</b> olamaz` })
						}
						return true
					},
					cellEndEdit: (colDef, rowIndex, belirtec, cellType, oldValue, newValue) => {
						if (oldValue != newValue) {
							const {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex);
							const degistiSet = rec._degistiSet = rec._degistiSet || {}; degistiSet[belirtec] = true
						}
					},
					cellValueChanged: e => {
						const {args} = e, gridWidget = args.owner, rowIndex = args.rowindex, rec = gridWidget.getrowdata(rowIndex);
						if (rec) {
							inst._timer_cellValueChanged = setTimeout(() => {
								try {
									const {PrefixSut} = this; let toplam = 0;
									for (const key in rec) { let value; if (key.startsWith(PrefixSut) && (value = asFloat(rec[key]))) { toplam += value } }
									gridWidget.setcellvalue(rowIndex, 'toplam', toplam)
								}
								finally { delete inst._timer_cellValueChanged }
							}, 50)
						}
					}
				}).tipDecimal(1))
			}
			tabloKolonlari.push(new GridKolon({ belirtec: 'toplam', text: 'TOPLAM', genislikCh: 18, cellClassName, cellsRenderer, aggregates: [{ TOPLAM: gridDipIslem_sum }] }).readOnly().tipDecimal(1))
		}
		tanimForm[gonderimTS ? 'addGridliGosterici' : 'addGridliGiris_sabit']('grid').addStyle_fullWH(null, `calc(var(--full) - ${BaslikHeight + 5}px)`)
			.widgetArgsDuzenleIslemi(e => $.extend(e.args, { columnsHeight: 65, rowsHeight: 50, groupable: false, sortable: true, showStatusBar: true, showAggregates: true, editMode: 'click' }))
			.setTabloKolonlari(tabloKolonlari).setSource(e => e.builder.altInst.detaylarUyarlanmis)
			/* .onAfterRun(e => { setTimeout(e => e.builder.part.onResize(e), 200, e) }) */
			.addStyle(e => `$elementCSS .jqx-grid-column-header > div > div { margin-top: 8px !important; line-height: 23px !important }`)
	}
	static yeniInstOlustur(e) {
		let {rec} = e; if (!rec) { throw { isError: true, rc: 'noInst', errorText: 'Fiş kaydı belirlenemedi' } }
		if (!!rec.gonderimTS && !config.dev) { hConfirm(`<div class="darkred">Bu belge <b>${dateTimeAsKisaString(asDate(rec.gonderimTS))}</b> tarihinde merkeze gönderilmiş ve sadece izlemeye izin verilecek!</div>`, this.sinifAdi) }
		if (rec) { delete rec.parentItem; rec = rec.deepCopy ? rec.deepCopy() : $.extend(true, {}, rec) }
		return new this(rec)
	}
	async uiKaydetOncesiIslemler(e) {
		const {_timer_cellValueChanged} = this; if (_timer_cellValueChanged) { await new $.Deferred(p => setTimeout(() => p.resolve(), 200)) }
		return await super.uiKaydetOncesiIslemler(e)
	}
	degistir(eskiInst) {
		const {localData} = app.params, {sayac} = this, recs = localData.getData(this.class.dataKey), ind = recs.findIndex(rec => rec.sayac == sayac);
		if (ind == null || ind < 0) { throw { isError: true, rc: 'noRecordMatch', errorText: `Yerel Veritabanında (<b>sayac = ${sayac ?? '??'}</b>) için kayıt belirlenemedi` }}
		if (!!this.gonderimTS && !config.dev) { throw { isError: true, rc: 'gonderilmisBelge', errorText: `<div class="darkred">Bu belge <b>${dateTimeAsKisaString(asDate(this.gonderimTS))}</b> tarihinde merkeze gönderilmiş ve değiştirilemez!</div>` } }
		this.gonderimTS = null; recs[ind] = this; localData.kaydetDefer(); return true
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, keys = ['gonderimTS', 'devreDisimi', 'sayac', 'seq', 'rotaTipi', 'rotaKod', 'rotaAdi', '_rotaTipiText']
		for (const key of keys) { const value = rec[key]; if (value !== undefined) { this[key] = value } }
	}
}
class MQRotaliFisDetay extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rotalı Fiş Detayı' } static get tableAlias() { return 'har' }
	constructor(e) {
		e = e || {}; super(e); const {seq, mustKod, mustAdi, toplam} = e; $.extend(this, { seq, mustKod, mustAdi, toplam });
		const {PrefixSut} = MQRotaliFis; for (const key in e) { if (key.startsWith(PrefixSut)) { const value = e[key]; if (value != null) this[key] = e[key] } }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e;
		const cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => { rec = rec.originalrecord ?? rec; return html };
		liste.push(
			new GridKolon({ belirtec: 'mustKod', text: 'Müstahsil', genislikCh: 10, cellsRenderer }),
			new GridKolon({ belirtec: 'mustAdi', text: 'Müstahsil Adı', genislikCh: 35, cellsRenderer })
		)
	}
}
