class KontorYonetimPart extends SimplePart {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'KNT' }
	static get sinifAdi() { return 'Kontör Yönetim' }
	static get title() { return this.sinifAdi }
	static get isWindow() { return true }
	static get islemTuslariVarmi() { return true }

	constructor(e = {}) {
		super(e)
		this.grids = {}
	}
	async run(e) { return await super.run(e) }
	async afterRun(e) { await super.afterRun(e) }
	rfbDuzenle() {
		let { content, islemTuslari, grids } = this
		;{
			islemTuslari
				.setButonlarIlk([
					{ id: 'tazele', handler: e => this.tazele(e) }
				])
				.addStyle_wh(null, 60)
				.addStyle(`
					$elementCSS .sag { padding: 10px 20px 0 0 }
					$elementCSS button:not(:last-child) { margin-right: 15px }`
				)
		}
		
		;{
			let form = content.addFormWithParent()
				.addCSS('relative')
				.addStyle(
					`$elementCSS { margin-top: -25px; left: 25px }
					 $elementCSS button.jqx-fill-state-normal { background-color: transparent !important }`
				)
			form.addButton('faturalastir', 'Faturalaştır')
				.setPlaceholder('Faturalaştır')
				.addCSS('jqx-success relative')
				.addStyle_wh(200, 55)
				.addStyle(`$elementCSS { left: 100px }`)
				.onClick(async () => {
					try { await this.faturalastir() }
					catch (ex) { cerr(ex); hConfirm(getErrorText(ex), 'Faturalaştır') }
				})
			let bulForm = form.addForm('bulForm')
				.setLayout($(
					`<div
							class="relative filtreForm bulForm part no-expand fs-80"
							style="
								/*--expanded-input-width: 300px;*/
								position: relative; left: 380px; top: -5px;
								width: 250px !important; height: 50px; padding: 10px; z-index: 1009
							"
					>
						<input class="input full-wh" type="text" placeholder="Aranacak metni buraya giriniz">
					</div>`
				))
				.onAfterRun(({ builder: fbd }) => {
					let { layout } = fbd
					let part = fbd.part = new FiltreFormPart({
						layout,
						degisince: ({ tokens }) => {
							;values(this.grids).forEach(p => {
								p.filtreTokens = tokens
								p.tazele()
							})
						}
					})
					part.run()
				})
		}

		;{
			let mfSinif = MQLogin_Musteri, { sinifAdi: etiket } = mfSinif
			content.addSimpleComboBox('mustKod', etiket, etiket)
				.etiketGosterim_yok()
				.setMFSinif(mfSinif)
				.degisince(({ type, events }) => {
					if (type != 'batch')
						return
					
					let { value: v } = events.at(-1)
					this.mustKod = v
					delay(1).then(() =>
						this.tazele({ action: 'change' }))
				})
				.onAfterRun(({ builder: { id, part } }) => {
					this.ddMustKod = part
					part.focus()
				})
				.addCSS('relative')
				.addStyle_wh(900, 50)
				.addStyle(`$elementCSS { top: 8px; left: 30px; z-index: 1010 !important }`)
		}
		
		;{
			let fbd_grids = content.addFormWithParent('subContent').yanYana()
				.addCSS('relative')
				.addStyle(`$elementCSS { top: 0; padding: 10px 20px }`)
			
			let gridOrtakDuzenle = (fbd, argsEkDuzenle, ekIslem) => {
				let rowsHeight = 75
				return fbd
					.rowNumberOlmasin().notAdaptive()
					.widgetArgsDuzenleIslemi(({ args, ...rest }) => {
						extend(args, {
							rowsHeight, enableHover: true,
							enableTooltips: false,
							columnsResize: false, filterable: false,
							columnsMenu: false
						})
						argsEkDuzenle?.call?.(this, { args, ...rest })
					})
					.veriYukleninceIslemi(({ builder: { part } }) => {
						let { grid, gridWidget: w } = part
						let height = this.mustKod ? rowsHeight - 15 : rowsHeight
						delay(1).then(() =>
							grid.jqxGrid('rowsheight', height))
					})
					.onAfterRun(e => {
						let { id, part } = e.builder
						grids[id] = part
						ekIslem?.call?.(this, e)
					})
					.addStyle(`$elementCSS [role = row] > div > div { font-size: 80%; margin-top: 0 !important; padding: 5px 10px }`)
			}
			/*gridOrtakDuzenle(
				fbd_grids.addGridliGosterici('ozet')
					.setTabloKolonlari([ gridKolon('_text', 'ÖZET') ])
					.setSource(e => this.getData_ozet(e))
					.addStyle_wh(300, 400)
			)*/
			gridOrtakDuzenle(
				fbd_grids.addGridliGosterici('har')
					.setTabloKolonlari([ gridKolon('_text', 'KONTÖR SATIŞLARI') ])
					.setSource(e => this.getData_har(e))
					.addStyle_wh(900, 550),
					//.addStyle_wh(700, 700),
				null,
				({ builder: { part: { grid } } }) =>
					delay(1).then(() =>
						grid.jqxGrid('selectionmode', 'multiplerows'))
			)
		}
	}

	tazele({ action } = {}) {
		;values(this.grids).forEach(p =>
			p.tazele())
	}
	async faturalastir() {
		let islemAdi = 'Faturalaştır'
		let { har } = this.grids
		let { selectedRecs: recs } = har
		if (empty(recs)) {
			hConfirm('Faturalaştırılacak kayıtlar seçilmelidir', islemAdi)
			return false
		}
		
		let tip2Recs = {}
		;recs.forEach(r =>
			(tip2Recs[r.tip] ??= []).push(r))

		let tip2Sinif = fromEntries(
			keys(tip2Recs)
				.map(tip => [tip, new KontorTip(tip)?.ekBilgi])
				.filter(([, cls]) => cls)
		)

		;{
			let desteklenmeyenTipAdlari = []
			for (let [tip, recs] of entries(tip2Recs)) {
				let cls = tip2Sinif[tip]
				if (cls?.faturalastirmaYapilirmi)
					continue
				delete tip2Recs[tip]
				desteklenmeyenTipAdlari.push(`<b>${cls?.sinifAdi ?? new KontorTip(tip)?.aciklama ?? tip}</b>`)
			}
			if (!empty(desteklenmeyenTipAdlari))
				wConfirm(getMergedText('Bazı Kontör tipleri desteklenmiyor:', desteklenmeyenTipAdlari), islemAdi)
		}

		if (empty(tip2Recs))
			return

		let mevcutTipAdlari = [], count = 0
		for (let [tip, recs] of entries(tip2Recs)) {
			mevcutTipAdlari.push(tip2Sinif[tip]?.sinifAdi || tip)
			count += recs.length
		}

		let res = await ehConfirm(
			(
				`<div><b>${mevcutTipAdlari.join(', ')}</b> için <b class=forestgreen>${count}</b> adet Kontör Belgesi faturalaştırılacak</div>` +
				`<div class="bold mt-2">Devam edilsin mi?</div>`
			),
			islemAdi
		)
		if (!res)
			return

		try {
			for (let [tip, recs] of entries(tip2Recs)) {
				let cls = tip2Sinif[tip]
				let args = {
					silent: false, noConfirm: true,
					part: this, tumFisler: [],
					recs: recs.map(r => ({ fissayac: r.fisID }))
				}
				await cls.kontor_topluFaturalastirIstendi(args)
			}
		}
		finally { hideProgress() }
	}
	
	async getData_ozet(e = {}) {
		let { mustKod } = this
		/*let recs = await promise(() => {
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd('muskontordetay har')
				.innerJoin('har', 'muskontor fis', 'har.fissayac = fis.kaysayac')
				.innerJoin('fis', 'musteri mus', 'fis.mustkod = mus.kod')
			wh.degerAta('A', 'har.ahtipi')
			if (mustKod)
				wh.degerAta(mustKod, 'fis.mustkod')
			sahalar
				.addWithAlias('har',
					'kaysayac id', 'tarih', 'fisnox fisNox',
					'kontorsayi miktar', 'btamamlandi ok', 'fatdurum fatDurum'
				)
				.addWithAlias('fis',
					'kaysayac fisID', 'tip', 'mustkod mustKod'
				)
				.add('mus.aciklama mustUnvan')
			let stm = new MQStm({
				sent,
				orderBy: ['btamamlandi', 'tarih DESC']
			})
			return stm.execSelect()
		}) ?? []*/
		
		return []
	}
	async getData_har(e = {}) {
		let { mustKod } = this
		let recs = await promise(() => {
			let sent = new MQSent(), { where: wh, sahalar } = sent
			sent
				.fromAdd('muskontordetay har')
				.innerJoin('har', 'muskontor fis', 'har.fissayac = fis.kaysayac')
				.innerJoin('fis', 'musteri mus', 'fis.mustkod = mus.kod')
			wh.degerAta('A', 'har.ahtipi')
			if (mustKod)
				wh.degerAta(mustKod, 'fis.mustkod')
			sahalar
				.addWithAlias('har',
					'kaysayac id', 'tarih', 'fisnox fisNox',
					'kontorsayi miktar', 'btamamlandi ok', 'fatdurum fatDurum'
				)
				.addWithAlias('fis',
					'kaysayac fisID', 'tip', 'mustkod mustKod'
				)
				.add('mus.aciklama mustUnvan')
			let stm = new MQStm({
				sent,
				orderBy: ['btamamlandi', 'tarih DESC']
			})
			return stm.execSelect()
		}) ?? []

		let gap = '20px'
		let { kaDict: kontorTip2KA } = KontorTip
		return recs.map(r => ({
			...r,
			_text: (
				`<div class="full-wh">
					${mustKod ? '' : `<div style="gap: ${gap}">
						<div>
							<div>
								<span class="royalblue fs-85">${r.mustUnvan}</span>
								<b class="gray">${r.mustKod}</b>
							</div>
						</div>
					</div>`}
					<div class="flex-row full-width" style="${r.ok ? 'background-color: lightgreen;' : ''}">
						<div style="width: calc(var(--full) - 230px); gap: ${gap}">
							<div>
								<div class="mb-1">
									<b class="purple">${kontorTip2KA[r.tip || ' ']?.aciklama ?? r.tip}</b>
								</div>
								<div>
									<b class="royalblue">${asDateAndToKisaString(r.tarih)}</b>
									<span class="gray fs-95">${r.fisNox}</span>
								</div>
							</div>
						</div>
						<div>
							<div>
								<span><b class="forestgreen fs-110">${numberToString(r.miktar)}</b> kontör</span>
								<b class="forestgreen fs-95">${KontorFatDurum.kaDict[r.fatDurum || ' ']?.aciklama ?? r.fatDurum}</b>
							</div>
						</div>
					</div>
					<div class="absolute" style="top: 10px; right: 5px">
						<span class="fs-180${r.ok ? '' : ' jqx-hidden'}"> ✅ </span>
					</div>
				</div>`
			)
		}))
	}
}
