class MQRotaliFis extends MQDetayliOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static PrefixSut = 'sut'
	static get sinifAdi() { return 'Rotalı Fiş' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return MQRotaliFisDetay } static get tanimlanabilirmi() { return true }
	static get kolonFiltreKullanilirmi() { return false } static get gridIslemTuslariKullanilirmi() { return false }
	get detaylarUyarlanmis() {
		let {detaylar} = this
		if (empty(detaylar)) {
			let {localData} = app.params
			let recs = localData.get(MQSutRota.dataKey) || []
			let {detaySinif, PrefixSut} = this.class
			let sutSiraRecs = localData.get(MQSutSira.dataKey)
			detaylar = []
			for (let rec of recs) {
				let {seq} = rec, mustKod = rec.mustkod, mustAdi = rec.mustadi
				let toplam = 0
				let det = new detaySinif({ seq, mustKod, mustAdi, toplam })
				if (sutSiraRecs) {
					for (let i = 0; i < Math.min(sutSiraRecs.length, MQSutSira.maxSayi); i++)
						det[`${PrefixSut}${i + 1}`] = 0
				}
				detaylar.push(det)
			}
			this.detaylar = detaylar
		}
		for (let det of detaylar)
			delete det._degistiSet
		return detaylar
	}

	constructor(e = {}) {
		super(e)
		this.setValues({ rec: e })
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		let {liste, part} = e
		let removeIdSet = asSet(['yeni', 'sil', 'kopya'])
		liste = e.liste = liste.filter(rec => !removeIdSet[rec.id])
		extend(part.ekSagButonIdSet = part.ekSagButonIdSet || {}, asSet(['degistir']))
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); let {secimler: sec} = e;
		sec.secimTopluEkle({
			islemDurum: new SecimTekSecim({
				etiket: 'İşlem Durumu',
				tekSecim: new BuDigerVeHepsi([`<div class="orangered full-wh">Bek leyen</div>`, `<div class="green full-wh">İşlem Gören</div>` ])
			}),
			gonderimDurum: new SecimTekSecim({
				etiket: 'Gönderim Durumu',
				tekSecim: new BuDigerVeHepsi([`<div class="orangered full-wh">Bek leyen</div>`, `<div class="green full-wh">Gönde rilen</div>` ])
			})
		})
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e)
		let {PrefixSut} = this, {rec, result} = e
		let belirtec = e.belirtec ?? e.dataField
		if (belirtec == '_rotaTipiText') {
			let {rotaTipi} = rec
			if (rotaTipi?.char !== undefined)
				rotaTipi = rotaTipi.char
			switch (rotaTipi) {
				//case 'MS': result.push('bg-lightgray'); break;
				case 'TN': result.push('bg-lightcadetblue'); break
				case 'TP': result.push('bg-lightpink'); break
			}
		}
		else if (belirtec == 'gonderimDurum' || belirtec == 'gonderimTS' || belirtec == 'islemDurum') {
			result.push('bold center')
			if (!!rec.gonderimTS)
				result.push('bg-lightgreen')
		}
		else if (rec.devreDisimi)
			result.push('grid-readOnly')
		else if (!!rec.gonderimTS)
			result.push('black', 'bg-lightgray')
		else if (belirtec == 'toplam')
			result.push('black', 'bg-lightgreen')
		else if (!!rec.toplam)
			result.push('black', 'bg-lightcyan')
		
		if (belirtec == 'toplam' || belirtec.startsWith(PrefixSut))
			result.push('bold')
		else if (belirtec == 'rotaKod')
			result.push('gray')
		
		//if (belirtec == '_rotaText')
		//	result.push('bg-lightblack')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e)
		let {liste} = e, {PrefixSut} = this
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			/*rec = rec.originalrecord ?? rec;*/
			if (value != null && belirtec == 'gonderimTS')
				html = changeTagContent(html, value = dateTimeAsKisaString(asDate(value)) ?? '')
			else if (value != null && (belirtec == 'toplam' || belirtec.startsWith(PrefixSut))) {
				if (!isNumber(value))
					value = asFloat(value)
				html = changeTagContent(html, value ? toStringWithFra(value, 1) : '')
			}
			return html
		};
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'rotaKod', text: 'Rota', genislikCh: 10, cellsRenderer, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'rotaAdi', text: 'Rota Adı', minWidth: 150, maxWidth: 300, cellsRenderer, filterType: 'checkedlist' })
			)
			/* sut1, sut2 ... için detay toplamı kolonları */
		);
		let {localData} = app.params
		let sutSiraRecs = localData.get(MQSutSira.dataKey)
		if (sutSiraRecs) {
			for (let i = 0; i < Math.min(sutSiraRecs.length, MQSutSira.maxSayi); i++) {
				let seq = i + 1, rec = sutSiraRecs[i]
				let stokAdi = rec.kisaadi || rec.stokadi
				liste.push(
					new GridKolon({
						belirtec: `${PrefixSut}${seq}`, text: stokAdi, genislikCh: 13,
						cellsRenderer, aggregates: [{ TOPLAM: gridDipIslem_sum }]
					}).tipDecimal(1)
				)
			}
			liste.push(
				new GridKolon({
					belirtec: 'toplam', text: 'TOPLAM', genislikCh: 10, filterType: 'checkedlist',
					cellsRenderer, aggregates: [{ TOPLAM: gridDipIslem_sum }]
				}).tipDecimal(1))
		}
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'gonderimDurum', text: 'Gnd?', genislikCh: 13, cellsRenderer, filterType: 'checkedlist' }),
				new GridKolon({ belirtec: 'gonderimTS', text: 'Gnd.Zaman', genislikCh: 10, cellsRenderer, filterType: 'checkedlist' })
			),
			new GridKolon({ belirtec: 'islemDurum', text: 'İşlem?', genislikCh: 13, cellsRenderer, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: '_rotaTipiText', text: 'Rt. Tip', genislikCh: 10, cellsRenderer, filterType: 'checkedlist' })
		)
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		let mini = isMiniDevice()
		extend(args, {
			rowsHeight: 40, columnsHeight: 60,
			columnsMenu: true, columnsMenuWidth: 30,
			columnsResize: !mini, columnsReorder: !mini,
			groupable: true, sortable: true, filterable: true,
			showGroupsHeader: true, groupsExpandedByDefault: true, showFilterRow: false,
			showStatusBar: true, showAggregates: true, showGroupAggregates: true,
			groupIndentWidth: 20
		})
	}
	static async loadServerData(e) {
		let recs = await super.loadServerData(e), {PrefixSut} = this;
		if (recs) {
			for (let rec of recs) {
				let toplam, { detaylar } = rec
				rec.toplam = rec.toplam ?? 0
				if (!empty(detaylar)) {
					let { localData } = app.params
					let sutSiraRecs = localData.get(MQSutSira.dataKey)
					if (!empty(sutSiraRecs)) {
						let genelToplam = 0;
						for (let i = 0; i < Math.min(sutSiraRecs.length, MQSutSira.maxSayi); i++) {
							let seq = i + 1, key = `${PrefixSut}${seq}`; toplam = 0;
							for (let det of detaylar) {
								let value = det[key]
								if (isNumber(value))
									toplam += value
							}
							rec[key] = toplam = roundToFra(toplam, 1)
							genelToplam += toplam
						}
						rec.toplam = genelToplam
					}
				};
				extend(rec, {
					gonderimDurum: !!rec.gonderimTS ? `<div class="forestgreen">Gönderildi</div>` : `<div class="red">Gönderilmedi</div>`,
					islemDurum: !!rec.toplam ? `<div class="forestgreen">İşlem Yapıldı</div>` : `<div class="orangered">Bekleyen</div>`
				})
			}
			let { secimler } = e
			let filters = []
			let { islemDurum: { tekSecim: islemDurum } } = secimler
			let { gonderimDurum: { tekSecim: gonderimDurum } } = secimler
			if (islemDurum && !islemDurum.hepsimi) {
				filters.push(rec => {
					let {toplam} = rec
					return (
						islemDurum.bumu ? !toplam :
						islemDurum.digermi ? !!toplam :
						true
					)
				})
			}
			if (gonderimDurum && !gonderimDurum.hepsimi) {
				filters.push(rec => {
					let {gonderimTS} = rec
					return gonderimDurum.bumu ? !gonderimTS : gonderimDurum.digermi ? !!gonderimTS : true
				})
			}
			let check = rec =>
				filters.every(f => f(rec))
			recs = recs.filter(check)
			recs.sort((a, b) => {
				return (
					bool2Int(!!a.gonderimTS) - bool2Int(!!b.gonderimTS)
					//(b.islemDurum?.toString() ?? '').localeCompare(a.islemDurum?.toString() ?? '')
				)
			})
		}
		return recs || []
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e)
		let { grid, sender } = e
		let { secimler, fbd_islemDurum, fbd_gonderimDurum } = sender
		// grid.jqxGrid('groups', ['gonderimDurum', 'islemDurum'])
		grid.jqxGrid('groups', ['gonderimDurum'])
		if (fbd_islemDurum)
			fbd_islemDurum.value = secimler.islemDurum.value
		if (fbd_gonderimDurum)
			fbd_gonderimDurum.value = secimler.gonderimDurum.value
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		let { rootBuilder: rfb, sender: part, sender: { secimler, islemTuslari } } = e
		let fbd_islemTuslari = rfb.addForm('islemTuslari', islemTuslari)
			.addStyle(...[
				`$elementCSS #degistir { margin-right: 15px !important }
				 $elementCSS #tazele { margin-right: 15px !important }
				 $elementCSS #degistir.jqx-fill-state-normal { background-color: royalblue !important }
				 $elementCSS #degistir.jqx-fill-state-pressed { background-color: cadgetblue !important }
				 $elementCSS #tazele.jqx-fill-state-normal { background-color: #658374 }`
			])
		let form = fbd_islemTuslari.addForm('sol', islemTuslari.children('.sol'))
			.yanYana()
		form.addForm('fisBaslikBilgi')
			.setLayout(() => $(
				`<div class="flex-row">
					<div class="item posta flex-row">
						<div class="etiket">Posta:</div>
						<div class="veri">${new Posta(app.params.config.postaKod).aciklama || '??'}</div>
					</div>
				</div>`
			))
			.addCSS('relative')
			.addStyle(...[
				`$elementCSS { font-size: 130%; color: #555; width: auto !important; margin-left: 20px }
				 $builderCSS > .item { }
				 $builderCSS > .item > * { margin-inline-end: 10px }
				 $builderCSS > .item .veri { font-weight: bold; color: royalblue }`
			])
		form.addRadioButton('islemDurum').etiketGosterim_yok()
			.setSource(secimler.islemDurum.tekSecim.kaListe)
			.onAfterRun(({ builder: fbd, builder: { rootPart } }) =>
				rootPart.fbd_islemDurum = fbd)
			.degisince(({ value, builder: { rootPart, rootPart: { secimler: sec }} }) => {
				sec.islemDurum.value = value
				rootPart.tazele()
			})
			.addStyle(...[
				`$elementCSS { width: 330px !important; height: var(--full) !important }
				 /*@media (max-width: 700px) { $elementCSS .options { display: none !important } }*/
				 $elementCSS .options > * { width: 80px; height: calc(var(--full) - 10px) !important; margin-inline-end: 2px }
				 $elementCSS .options > * > * { width: var(--full) !important; height: var(--full) !important; padding: 3px 0 !important }`
			]);
		form.addRadioButton('gonderimDurum').etiketGosterim_yok()
			.setSource(secimler.gonderimDurum.tekSecim.kaListe)
			.onAfterRun(({ builder: fbd, builder: { rootPart } }) =>
				rootPart.fbd_gonderimDurum = fbd)
			.degisince(({ value, builder: { rootPart, rootPart: { secimler: sec } } }) => {
				sec.gonderimDurum.value = value
				rootPart.tazele()
			})
			.addStyle(...[
				`$elementCSS { width: 330px !important; height: var(--full) !important }
				 @media (max-width: 900px) { $elementCSS .options { display: none !important } }
				 $elementCSS .options > * { width: 80px; height: calc(var(--full) - 10px) !important; margin-inline-end: 2px }
				 $elementCSS .options > * > * { width: var(--full) !important; height: var(--full) !important; padding: 3px 0 !important }`
			])
		form = rfb.addForm('grid', part.grid)
			.addStyle(`$elementCSS .jqx-grid-column-header > div > div { margin-top: 8px !important; line-height: 20px !important }`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let { mfSinif, inst, sender: tanimPart, rootBuilder: rfb, tanimFormBuilder: tanimForm } = e
		let width = 'var(--full)', {PrefixSut} = this, {gonderimTS} = inst
		rfb.addCSS('no-scroll')
		tanimForm.addStyle_fullWH().altAlta()
		if (!gonderimTS) {
			rfb.vazgecIstendi = async ({ parentPart: { title } = {} }) => {
				let rdlg = await ehConfirm('Ekrandan kapatılacak, emin misiniz?', title)
				if (rdlg != true)
					throw { isError: true, rc: 'userAbort' }
			}
		}
		let BaslikHeight = 50, BaslikUstKaydir = 50
		let form = tanimForm.addFormWithParent('fisBaslik')
			.yanYana(null)
			.addStyle_wh(width, BaslikHeight)
		form.addForm('fisBaslikBilgi')
			.setLayout(e => $(
				`<div class="">` +
					`<div class="item rota flex-row">` +
						`<div class="etiket">Rota:</div> ` +
						`<div class="veri">${inst.rotaAdi || ''}</div> <b class="lightgray">(${inst.rotaKod || ''})</b> ` +
						// `<div class="ek-bilgi">rotası</div>` +
					'</div>' +
					`<div class="item posta flex-row">` +
						`<div class="etiket">Posta:</div> ` +
						`<div class="veri">${new Posta(app.params.config.postaKod).aciklama || '??'}</div>` +
					'</div>' +
				'</div>'
			))
			.addStyle_fullWH()
			.addCSS('relative')
			.addStyle(...[
				`$elementCSS { font-size: 110%; color: #777; top: -${BaslikUstKaydir}px; overflow-y: auto !important }
				 $elementCSS > .item { width: auto !important; margin-inline-end: 20px }
				 $elementCSS > .item > * { margin-inline-end: 10px }
				 $elementCSS > .item .veri { font-weight: bold; color: royalblue }
				 $elementCSS > .item .ek-bilgi { color: #aaa }`
			])
		let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
			let result = [belirtec]
			rec = rec.originalrecord ?? rec
			if (belirtec == 'mustAdi' || rec.devredisi)
				result.push('grid-readOnly')
			else if (belirtec == 'toplam')
				result.push('bg-lightgreen')
			else if (rec._degistiSet && rec._degistiSet[belirtec])
				result.push('bg-lightcyan')
			if (belirtec == 'toplam' || belirtec.startsWith(PrefixSut))
				result.push(value ? 'black bold bg-forestgreen' : 'lightgray')
			if (belirtec.startsWith(PrefixSut) && (!rec._degistiSet || !rec._degistiSet[belirtec]))
				result.push('lightgray')
			return result.join(' ')
		}
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			rec = rec?.originalrecord ?? rec; if (!rec) return html
			switch (belirtec) {
				case 'mustAdi':
					html = changeTagContent(html,
						`<div class="parent flex-row"><div class="kod ek-bilgi">${rec.mustKod}</div>` +
						`<div class="aciklama asil">${getTagContent(html)}</div></div>`
					)
					break
			}
			if (belirtec == 'toplam' || belirtec.startsWith(PrefixSut) && value != null) {
				if (!isNumber(value))
					value = asFloat(value)
				html = changeTagContent(html, value ? toStringWithFra(value, 1) : '')
			}
			return html
		}
		let sutSiraRecs = app.params.localData.get(MQSutSira.dataKey)
		let sutParam = app.params.sut, sutColCount = Math.min(sutSiraRecs.length, MQSutSira.maxSayi)
		let tabloKolonlari = [
			new GridKolon({
				belirtec: 'mustAdi', text: 'Müstahsil', maxWidth: 400,
				filterType: 'checkedlist', cellClassName, cellsRenderer,
			}).readOnly()
		]
		if (sutSiraRecs) {
			for (let i = 0; i < sutColCount; i++) {
				let seq = i + 1, rec = sutSiraRecs[i]
				let stokAdi = rec.kisaadi || rec.stokadi
				tabloKolonlari.push(new GridKolon({
					belirtec: `${PrefixSut}${seq}`, text: stokAdi, genislikCh: 10,
					columnType: 'template', filterable: false,
					cellClassName, cellsRenderer,
					aggregates: [{ TOPLAM: gridDipIslem_sum }],
					validation: (colDef, info, value) => {
						if (value != null) {
							if (!isNumber(value))
								value = asFloat(value)
							if (value < 0)
								return ({ result: false, message: `Değer <b>0'dan küçük</b> olamaz` })
						}
						return true
					},
					cellEndEdit: (colDef, rowIndex, belirtec, cellType, oldValue, newValue) => {
						if (oldValue != newValue) {
							let {gridWidget} = colDef.gridPart, rec = gridWidget.getrowdata(rowIndex)
							let degistiSet = rec._degistiSet = rec._degistiSet || {}
							degistiSet[belirtec] = true
						}
					},
					cellValueChanged: e => {
						let {args} = e, gridWidget = args.owner
						let rowIndex = args.rowindex
						let rec = gridWidget.getrowdata(rowIndex)
						if (rec) {
							inst._timer_cellValueChanged = setTimeout(() => {
								try {
									let toplam = 0, value
									for (let key in rec) {
										if (key.startsWith(PrefixSut) && (value = asFloat(rec[key])))
											toplam += value
									}
									gridWidget.setcellvalue(rowIndex, 'toplam', toplam)
								}
								finally { delete inst._timer_cellValueChanged }
							}, 50)
						}
					}
				}).tipDecimal(1))
			}
			tabloKolonlari.push(
				new GridKolon({
					belirtec: 'toplam', text: 'TOPLAM', genislikCh: 10,
					filterable: false, cellClassName, cellsRenderer,
					aggregates: [{ TOPLAM: gridDipIslem_sum }]
				}).readOnly().tipDecimal(1)
			)
		}
		tanimForm[gonderimTS ? 'addGridliGosterici' : 'addGridliGiris_sabit']('grid')
			.addStyle_fullWH(null, `calc(var(--full) - ${BaslikHeight - 25}px)`)
			.addStyle(`
				$elementCSS { margin-top: -30px !important }
				$elementCSS .jqx-grid-column-header > div > div { margin-top: 5px !important; line-height: 18px !important }
			`)
			.widgetArgsDuzenleIslemi(({ args }) => {
				let mini = isMiniDevice()
				extend(args, {
					rowsHeight: 45, columnsHeight: 60, columnsMenu: true,
					columnsResize: !mini, columnsReorder: !mini,
					groupable: false, sortable: true, filterable: true,
					showGroupsHeader: false, groupsExpandedByDefault: true, showFilterRow: false,
					showStatusBar: true, showAggregates: true, showGroupAggregates: true,
					selectionMode: 'singlerow', editMode: 'click'
				})
			})
			.setTabloKolonlari(tabloKolonlari)
			.setSource(({ builder: { altInst: inst }}) =>
				inst.detaylarUyarlanmis)
			.veriYukleninceIslemi(({ builder: { altInst: inst, rootPart: { islem }, part: gridPart } }) => {
				let { detaylar } = inst, { gridWidget: w } = gridPart
				if (islem == 'degistir' || islem == 'kopya') {
					let ind = detaylar.findLastIndex(_ => _.toplam) + 1
					if (ind > -1) {
						let ekSatir = $(window).height() < 800 ? 5 : 10
						w.ensurerowvisible(Math.min(ind + ekSatir, detaylar.length - 1))
						setTimeout(() => {
							// w.selectcell(ind, `${PrefixSut}1`)
							w.selectrow(ind)
							setTimeout(() => {
								if (!gridPart.editing)
									w.begincelledit(ind, `${PrefixSut}1`)
							}, 200)
						}, 50)
					}
				}
				setTimeout(() => w.focus(), 10)
			})
	}
	static yeniInstOlustur(e) {
		let {rec} = e
		if (!rec)
			throw { isError: true, rc: 'noInst', errorText: 'Fiş kaydı belirlenemedi' }
		if (!!rec.gonderimTS && !config.dev) {
			hConfirm(`<div class="darkred">Bu belge <b>${dateTimeAsKisaString(asDate(rec.gonderimTS))}</b> tarihinde merkeze gönderilmiş ve sadece izlemeye izin verilecek!</div>`,
					 this.sinifAdi)
		}
		if (rec) {
			delete rec.parentItem
			rec = rec.deepCopy ? rec.deepCopy() : extend(true, {}, rec)
		}
		return new this(rec)
	}
	async uiGirisOncesiIslemler(e) {
		await super.uiGirisOncesiIslemler(e)
		let { islem } = e, { gonderimTS } = this
		if (gonderimTS && islem == 'degistir')
			islem = e.islem = 'izle'
	}
	async uiKaydetOncesiIslemler(e) {
		let {_timer_cellValueChanged} = this
		if (_timer_cellValueChanged)
			await delay(200)
		return await super.uiKaydetOncesiIslemler(e)
	}
	degistir(eskiInst) {
		let { params: { localData } } = app
		let { sayac } = this
		let recs = localData.get(this.class.dataKey)
		let ind = recs.findIndex(rec => rec.sayac == sayac)
		if (ind == null || ind < 0)
			throw { isError: true, rc: 'noRecordMatch', errorText: `Yerel Veritabanında (<b>sayac = ${sayac ?? '??'}</b>) için kayıt belirlenemedi` }
		if (!!this.gonderimTS && !config.dev)
			throw { isError: true, rc: 'gonderilmisBelge', errorText: `<div class="darkred">Bu belge <b>${dateTimeAsKisaString(asDate(this.gonderimTS))}</b> tarihinde merkeze gönderilmiş ve değiştirilemez!</div>` }
		// this.gonderimTS = null
		recs[ind] = this
		localData.kaydetDefer()
		return true
	}
	setValues({ rec }) {
		super.setValues(...arguments)
		let _keys = ['gonderimTS', 'devreDisimi', 'sayac', 'seq', 'rotaTipi', 'rotaKod', 'rotaAdi', '_rotaTipiText']
		for (let key of _keys) {
			let value = rec[key]
			if (value !== undefined)
				this[key] = value
		}
	}
}

class MQRotaliFisDetay extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Rotalı Fiş Detayı' }
	static get tableAlias() { return 'har' }
	constructor(e = {}) {
		super(e)
		let {seq, mustKod, mustAdi, toplam} = e
		extend(this, { seq, mustKod, mustAdi, toplam })
		let {PrefixSut} = MQRotaliFis
		for (let key in e) {
			if (key.startsWith(PrefixSut)) {
				let value = e[key]
				if (value != null)
					this[key] = e[key]
			}
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let cellsRenderer = (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
			rec = rec.originalrecord ?? rec
			return html
		};
		liste.push(
			...MQCogul.getKAKolonlar(
				new GridKolon({ belirtec: 'mustKod', text: 'Müstahsil', genislikCh: 10, cellsRenderer }),
				new GridKolon({ belirtec: 'mustAdi', text: 'Müstahsil Adı', genislikCh: 35, cellsRenderer })
			)
		)
	}
}
