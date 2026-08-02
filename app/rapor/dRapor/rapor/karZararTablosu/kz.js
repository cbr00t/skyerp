class DRapor_KarZararTablosu extends DRaporMQ {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return DRapor_EldekiVarliklar.oncelik + 1 }
	static get kategoriKod() { return 'FINANLZ' }
	static get kategoriAdi() { return 'Finansal Analiz' }
	static get kod() { return 'KARZARAR' }
	static get aciklama() { return 'Kar/Zarar Tablosu' }
	static get uygunmu() { return true }
	static get secimSinif() { return DonemselSecimler }
	static get sadeceTanimmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get bulFormKullanilirmi() { return true }
	static get otoTazele_minDk() { return config.dev ? .05 : .1 }
	// static get vioAdim() { return 'MH-R' }

	constructor(e = {}) {
		super(e)
	}

	async uiGirisOncesiIslemler(e) {
		let { sender: tanimPart } = e
		let { aciklama: title } = this.class
		e.islem = tanimPart.islem = 'izle'
		extend(tanimPart, { title })
		
		this.secimlerOlustur(e)
		app.appTitleBar?.addClass('jqx-hidden')
		
		if (!(config.dev || document.fullscreen))
			requestFullScreen()
		
		return await super.uiGirisOncesiIslemler(e)
	}
	async onAfterRun({ tanimPart }) {
		await this.accDuzenle(...arguments)
		let { acc } = tanimPart
		acc.layout.addClass('together')
		delay(100).then(async () => {
			await this.acc_onExpand({ ...arguments[0], acc })
			this.acc_onCollapse({ ...arguments[0], acc })
		})
	}
	destroyPart(e = {}) {
		let { tanimPart = e.sender ?? {} } = e
		let { acc } = tanimPart
		e.sender = this
		app.appTitleBar?.removeClass('jqx-hidden')
		acc?.destroyPart?.()
		this.otoTazele_stopTimer(e)
		return super.destroyPart?.(e)
	}
	secimlerOlustur({ sender: tanimPart } = {}) {
		let { zorunlu = {}, finans = {}, ticariGenel: { kullanim: ticGenel } = {} } = app.params
		let { kzTabloMaliyetten: kzMaliyetten } = finans
		let { takipNo } = ticGenel
		let { ozelIsaret } = zorunlu

		let sec = tanimPart.secimler = new DonemselSecimler()
		;{
			let { donem: { tekSecim: donem } = {} } = sec
			donem?.buYil()
		}

		;{
			let grupKod = 'donemVeTarih'
			sec.secimTopluEkle({
				sadeceStoklar: new SecimBool({ grupKod, etiket: 'Sadece Stoklar' }),
				bekSipVeIrs: new SecimBool({ grupKod, etiket: 'Bekleyen Siparişler ve irsaliye de alınsın' })
			})
			if (kzMaliyetten)
				sec.secimEkle('stokMaliyetYontemi', new SecimTekSecim({ grupKod, etiket: 'Stok Maliyet Yöntemi', tekSecimSinif: StokMaliyetYontemi }))
			sec.secimTopluEkle({
				gruplamadaAnaGrup: new SecimBool({ grupKod, etiket: 'Gruplamada Ana Grup da olsun' }),
				gruplama: new SecimTekSecim({ grupKod, etiket: 'Gruplama', tekSecim: new BuVeDiger(['Normal Grup', 'İst. Grup']) }),
				miktar2: new SecimBool({ grupKod, etiket: 'Miktar 2 Gösterilir' })
			})
			if (ozelIsaret)
				sec.addSecim('kdvliBedel', new SecimBool({ grupKod, etiket: 'Kdvli Bedeller alınsın' }))
		}
		;{
			sec
				.addKA('sube', DMQSube)
				.addKA('yer', DMQYer)
				.addKA('stok', DMQStok)
				.addKA('stokGrup', DMQStokGrup)
				.addKA('stokAnaGrup', DMQStokAnaGrup)
				.addKA('stokIstGrup', DMQStokIstGrup)
			if (takipNo) {
				sec
					.addKA('takip', DMQTakipNo)
					.addKA('takipGrup', DMQTakipGrup)
			}
		}
	}

	stmSonIslemler({ stm, uni }) {
		uni ??= stm?.sent
		for (let sent of uni) {
			sent
				.groupByOlustur()
				.gereksizTablolariSil(['stk', 'hiz', 'dem', 'grp', 'ghak', 'fhdon'])    // ... dışında
		}
	}

	static rootFormBuilderDuzenle_islemTuslari({ sender: tanimPart, fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		fbd.addStyle(...[
			`$elementCSS {
				--width-sag: 350px !important;
				--button-width: 45px !important;
				--button-height: 40px !important;
				position: fixed !important;
				top: 3px !important;
				right: 370px !important;
				pointer-events: none !important
			}
			$elementCSS > .sag {
				pointer-events: auto !important;
				z-index: 1050 !important
			}
			@media (max-width: 550px) {
				$elementCSS { top: 63px !important }
				$elementCSS:not(:has(:focus)):not(:has(:active)) { opacity: .4 }
			}
			$elementCSS #seviyeAc.jqx-fill-state-normal { background-color: forestgreen !important }
			$elementCSS #seviyeKapat.jqx-fill-state-normal { background-color: firebrick !important }`
		])
	}
	static tanimPart_islemTuslariDuzenle(e) {
		super.tanimPart_islemTuslariDuzenle(e)
		let { sender: tanimPart, liste, part: { ekSagButonIdSet: sagSet } } = e
		let { inst } = tanimPart
		extend(e, { tanimPart, inst })
		liste = e.liste = liste.filter(_ => _.id != 'tamam')
		let items = [
			{ id: 'seviyeAc', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: true }) },
			{ id: 'seviyeKapat', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: false }) },
			{ id: 'secimler', handler: _e => inst.secimlerIstendi({ ..._e, ...e }) },
			{ id: 'tazele', handler: _e => inst.tazeleIstendi({ ..._e, ...e }) }
		]
		liste = e.liste = [...items, ...liste]
		extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static async rootFormBuilderDuzenle(e = {}) {
		await super.rootFormBuilderDuzenle(e)
		let { sender: tanimPart, islem, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm } = e
		extend(e, { tanimPart })

		rfb.addNumberInput('_otoTazeleDk', null, null, 'Tazele (dk)')
			.etiketGosterim_yok()
			.setAltInst(tanimPart)
			.setMin(0)
			.setMax(24 * 60)
			.setValue(tanimPart._otoTazeleDk || null)
			.degisince(_e => {
				let { value, builder: fbd } = _e
				let { layout, input } = fbd
				if (!value)
					input.val(null)
				layout[value ? 'addClass' : 'removeClass']('active')
				inst.otoTazele_startTimer({ ...arguments[0], ..._e, ...e })
			})
			.addStyle_wh(100, 35)
			.addStyle(...[
				`$elementCSS {
					position: fixed !important;
					top: 5px !important; right: 50px !important;
					border-radius: 13px; z-index: 1001 !important;
					pointer-events: auto !important
				}
				$elementCSS > input { height: unset !important }
				$elementCSS.active { animation: 3000ms infinite anim-pratikSatis-otoTazele }
				.part.refreshing $elementCSS > input {
					background-color: lightcyan !important;
					background-image: url(../../images/loading.gif) !important;
					background-position: center center !important;
					background-size: 32px 32px !important;
					background-repeat: no-repeat !important
				 }
				 @keyframes anim-pratikSatis-otoTazele {
					  0%, 100%  { box-shadow: 0 0 13px 3px forestgreen }
					 70%        { box-shadow: 0 0 13px 8px forestgreen }
				 }`
			])
		
		tanimForm.addAccordion('acc')
			.coklu()
			//.fullScreen()
			.addStyle_fullWH(null, 'calc(var(--full) - 30px)')
			.addStyle(...[`
				$elementCSS .accordion > .header > .collapsed-content > div {
					margin-top: 10px;
					line-height: 16px !important
				}
				@media (max-width: 600px) {
					$elementCSS .accordion > .header > .collapsed-content > div {
						margin-top: 16px;
						line-height: 18px !important
					}
				}
				$elementCSS accordion.item { }
				$elementCSS .accordion.item.expanded.has-error > .header {
					background: linear-gradient(35deg, #fc8e8e 50%, #cececeee 100%) !important;
					animation: anim-haserror 900ms ease-in-out infinite !important
				}
				$elementCSS .accordion.item > .content {
					overflow: hidden !important;
					animation: anim-acc-content 500ms ease-out 1 !important
				}
				$elementCSS .accordion.item.has-error > .content > div {
					box-shadow: 0 0px 15px 2px firebrick !important
				}
				$elementCSS .accordion.item > .content .formBuilder-element.empty {
					animation: anim-defer-warn 1000ms ease-out 1 !important
				}
				$elementCSS .secimBilgi { margin-right: 250px }
				$elementCSS .secimBilgi > * { background-color: whitesmoke !important }
				@keyframes anim-haserror {
					  0%, 100%  { filter: brightness(1) }
					 50%        { filter: brightness(1.2) saturate(1.1) }
				}
				@keyframes anim-acc-content {
					  0%       { opacity: 0.01 }
					 50%       { opacity: 0.05 }
					100%       { opacity: 1.00 }
				}
				@keyframes anim-defer-warn {
					  0%, 80%  { opacity: .01 }
					100%       { }
				}`
			])
			.onAfterRun(({ builder: { part }}) =>
				tanimPart.acc = e.acc = part)
		
		rfb.onAfterRun(() =>
			inst.onAfterRun(e))
	}

	async accDuzenle(e) {
		let { tanimPart, acc } = e
		let panels = this.panels = this.getPanels(e)
		for (let [id, item] of entries(panels)) {
			item.id ??= id
			await item.run(e)
		}
		acc.onExpand(_e => this.acc_onExpand({ ...e, ..._e }))
		acc.onCollapse(_e => this.acc_onCollapse({ ...e, ..._e }))
	}
	acc_onExpand({ tanimPart, acc, id, item }) {
		acc ??= tanimPart.acc
		;{
			let { _promises_data: promises } = tanimPart
			;promises?.flat?.()?.forEach(p =>
				p?.abort?.())
			lastAjaxObj?.abort?.()
			// delete tanimPart._promises_data
		}
		delay(50).then(() => {
			/*;{
				let { islemTuslari } = tanimPart
				let btns = islemTuslari.find('#seviyeAc, #seviyeKapat')
				let selector = id == 'satis' ? 'removeClass' : 'addClass'
				btns[selector]('jqx-hidden')
			}*/
			hideNotify()
		})
		delay(10).then(() =>
			this.acc_onExpandCollapseOrtak({ ...arguments[0], expanded: true }))
	}
	acc_onCollapse({ tanimPart, acc, id, item }) {
		acc ??= tanimPart.acc
		delay(10).then(() => {
			/*let digerId = (
				id == 'satis' ? 'diger' :
				id == 'diger' ? 'satis' :
				null
			)
			if (digerId)
				acc.expand(digerId)*/
			
			this.acc_onExpandCollapseOrtak({ ...arguments[0], expanded: false })
		})
	}
	acc_onExpandCollapseOrtak({ tanimPart, acc, id, item, expanded }) {
		acc ??= tanimPart.acc
		let { activePanels, layout } = acc
		layout[len(activePanels) == 1 ? 'addClass' : 'removeClass']('fullScreen')
		;{
			let elms = layout.find('.jqx-grid')
			if (elms.length)
				elms.jqxGrid('refresh')
		}
	}
	tanimPart_hizliBulIslemi({ sender: tanimPart, tokens }) {
		super.tanimPart_hizliBulIslemi(...arguments)
		let sender = tanimPart
		let { acc: { layout } } = tanimPart
		let elms = arrayFrom(layout.find('.grid.part'))
		;elms.forEach(elm => {
			let gridPart = $(elm).data('part')
			if (gridPart)
				gridPart.filtreTokens = tokens
		})
		this.tazeleIstendi(...arguments)
		return false
	}
	async veriYuklendi(e) {
		let lc = this.loadCount = (this.loadCount || 0) + 1
		clearTimeout(this._timer_veriYuklendi)
		this._timer_veriYuklendi = setTimeout(
			async () => {
				for (let i = 0; i < 3; i++) {
					this.acc_onExpandCollapseOrtak(e)
					await delay(30)
				}
				delete this.loadCount
			},
			50
		)
	}

	async tazeleIstendi(e = {}) {
		let { tanimPart = e.sender ?? {} } = e
		let { acc = tanimPart.acc ?? {} } = tanimPart
		let { item } = acc.activePanel ?? {}
		let layout = item?.contentLayout ?? acc.layout
		await tanimPart._promise_tazele

		extend(tanimPart, { _lastErrors: [] })
		let { panels } = this
		for (let item of values(panels))
			await item.tazele(e)
		
		acc?.render()
		tanimPart._promise_tazele = delay(3_000)
	}
	otoTazele_startTimer(e) {
		let { class: { otoTazele_minDk } } = this
		let { tanimPart = e.sender } = e
		let { _timer_otoTazele: timer, _otoTazeleDk: otoTazeleDk } = tanimPart
		if (otoTazeleDk)
			otoTazeleDk = max(otoTazeleDk, otoTazele_minDk)
		
		if (!otoTazeleDk) {
			this.otoTazele_stopTimer(e)
			return null
		}
		this.otoTazele_stopTimer(e)
		return tanimPart._timer_otoTazele = setInterval(
			_e => this.otoTazele_timerProc({ ...e, ..._e }),
			otoTazeleDk * 60_000
		)
	}
	otoTazele_stopTimer(e = {}) {
		let { tanimPart = e.sender } = e
		let { _timer_otoTazele: timer } = tanimPart
		if (timer) {
			clearInterval(timer)
			delete tanimPart._timer_otoTazele
		}
		return timer
	}
	async otoTazele_timerProc(e = {}) {
		let { class: { otoTazele_minDk } } = this
		let { tanimPart = e.sender, acc: { hasActivePanel } = {} } = e
		let { _otoTazeleDk: otoTazeleDk, _inTazeleProc, _otoTazeleDisabled } = tanimPart
		let { activeWndPart } = app, { appActivatedFlag } = window
		if (_otoTazeleDisabled || activeWndPart != tanimPart)
			return
		
		otoTazeleDk ||= max(otoTazeleDk, otoTazele_minDk)
		if (!(otoTazeleDk && window.appActivatedFlag) || _inTazeleProc /*|| !hasActivePanel*/) {
			if (_inTazeleProc)
				setTimeout(() => tanimPart._inTazeleProc = false, 1_000)
			return
		}
		
		tanimPart._inTazeleProc = true
		await tanimPart._promise_tazele
		await this.tazeleIstendi({ ...e, action: 'otoTazele' })
		setTimeout(() => tanimPart._inTazeleProc = false, 2_000)
	}

	secimlerIstendi(e) {
		let { tanimPart } = e
		let { secimler: sec } = tanimPart
		let part = sec?.duzenlemeEkraniAc({
			parentPart: tanimPart,
			tamamIslemi: _e =>
				this.tazeleIstendi({ ..._e, ...e })
		})
		let { layout } = part ?? {}
		if (layout?.length) {
			let css = 'modelTanim'
			;[layout, layout.parent()].forEach(l =>
				l?.removeClass(css))
		}
	}
	gridSeviyeAcKapatIstendi(e = {}) {
		let { tanimPart = {}, state } = e
		let { acc = tanimPart.acc ?? {} } = e

		let { layout } = acc
		let grids = arrayFrom(layout.find('.grid.part'))
		for (let grid of grids) {
			if (!grid.html)
				grid = $(grid)
			
			let p = grid.data('part') ?? {}
			let { gridWidget: w } = p
			if (!w)
				continue
			
			if (state)
				w.expandallgroups()
			else {
				w.collapseallgroups()
				p.expandedRowsSet = {}
			}
		}
		return this
	}
}
