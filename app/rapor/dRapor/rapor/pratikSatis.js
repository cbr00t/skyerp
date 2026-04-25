class DRapor_PratikSatis extends DRaporMQ {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return PratikSatisHareketci }
	static get oncelik() { return this.hareketciSinif.oncelik }
	static get kategoriKod() { return this.hareketciSinif.kategoriKod }
	static get kategoriAdi() { return this.hareketciSinif.kategoriAdi }
	static get kod() { return this.hareketciSinif.kod }
	static get aciklama() { return this.hareketciSinif.aciklama }
	static get uygunmu() { return this.hareketciSinif.uygunmu }
	get uygunmu() { return this.class.uygunmu }
	static get secimSinif() { return DonemselSecimler }
	static get sadeceTanimmi() { return true }
	static get kolonFiltreKullanilirmi() { return false }
	static get bulFormKullanilirmi() { return true }
	static get timeout() { return config.dev ? 1_500 : 5_000 }
	static get otoTazele_minDk() { return config.dev ? .05 : .1 }
	// static get vioAdim() { return 'MH-R' }

	constructor(e = {}) {
		super(e)
		// mergeInto(this.class, this, 'Panel', 'PanelDetay', 'PanelGrid')
	}
	getPanels(e = {}) {
		let { class: { Panel, PanelGrid } } = this
		return {
			ozet: new Panel()
				.setTitle('Özet')
				.setExpanded()
				.add(...[
					new PanelGrid()
						.setId('ozet').setTitle('Özet')//.setHeight(240)
						.setUserData({ keyFields: ['tipText'], noSort: true })
						.setToplamBelirtec('tipText')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, {
								autoHeight: true, showStatusBar: false,
								showAggregates: false, showGroupAggregates: false
							})
						)
						.setTabloKolonlari([
							new GridKolon({ belirtec: 'tipText', text: `<span class=darkviolet>ÖZET</span>`, genislikCh: 16 }).checkedList(),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10 }).tipNumerik().sum().checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18 }).tipDecimal_bedel().sum()
						]),
						//.setQuery(...)
					new PanelGrid()
						.setId('ozetEk').setTitle('Özet Ek')//.setHeight(200)
						.setUserData({ keyFields: ['tipText'], noSort: true })
						.setToplamBelirtec('tipText')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showGroupsHeader: false, columnsHeight: 25 }))
						.setTabloKolonlari([
							new GridKolon({ belirtec: 'tipText', text: `<span class=violet>ÖZET-EK</span>`, genislikCh: 16 }).checkedList(),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10 }).tipNumerik().sum().checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18 }).tipDecimal_bedel().sum()
						])
						//.setQuery(...)
				]),
			tahsilat: new Panel()
				.setTitle('Tahsilat')
				.add(...[
					new PanelGrid()
						.setId('tahsilat').setTitle('Tahsilat')
						.setUserData({ sortFields: ['oncelik', 'aciklama'] })
						.setToplamBelirtec('aciklama')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showStatusBar: false, showAggregates: false, showGroupAggregates: false }))
						.setTabloKolonlari([
							new GridKolon({ belirtec: 'aciklama', text: `<span class=limegreen>TAHSİLAT</span>`, genislikCh: 25 }).checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18 }).tipDecimal_bedel().sum()
						])
						.setQuery(_e => {
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorantahsil' })
							sent.har2TahSekliBagla()
							sahalar.add(
								'har.tahseklino kod', 'tsek.aciklama aciklama',
								`(case tsek.tahsiltipi when 'NK' then 1 when 'PS' then 2 else 9 end) oncelik`,
								'SUM(har.bedel) bedel'
							)
							sent.groupByOlustur()
							return sent
						})
				])
		}
	}

	async uiGirisOncesiIslemler(e) {
		let { sender: tanimPart } = e, { sinifAdi: title } = this.class
		e.islem = tanimPart.islem = 'izle'
		extend(tanimPart, { title })
		
		this.secimlerOlustur(e)
		//let { dRapor: { praUzakSubeVerisi } } = app.params ?? {}
		//if (praUzakSubeVerisi)
		
		tanimPart._promise_getSubeTanimlari = this.getSubeTanimlari({ ...e, tanimPart })
		app.appTitleBar?.addClass('jqx-hidden')
		
		return await super.uiGirisOncesiIslemler(e)
	}
	destroyPart(e = {}) {
		let { tanimPart = e.sender } = e
		e.sender = this
		app.appTitleBar?.removeClass('jqx-hidden')
		tanimPart?.acc?.destroyPart?.()
		this.otoTazele_stopTimer(e)
		super.destroyPart?.(e)
	}
	secimlerOlustur({ sender: tanimPart } = {}) {
		let secimler = new DonemselSecimler()
		secimler
			.addKA('sube', DMQSube, 'fis.bizsubekod', 'sub.aciklama')
			.addKA('kasiyer', DMQKasiyer, 'fis.kasiyerkod', 'kas.aciklama')
		;{
			let { donem: { tekSecim: donem } = {} } = secimler
			donem?.bugun()
		}
		extend(this, { secimler })
		secimler.whereBlockEkle(({ secimler: sec, sent, where: wh }) => {
			let {tarihBS} = sec
			sent
				.fromIliski('isyeri sub', 'fis.bizsubekod = sub.kod')
				.fromIliski('kasiyer kas', 'fis.kasiyerkod = kas.kod')
			wh
				.fisSilindiEkle()
				//.add(new MQOrClause([`fis.ozelisaret <> '*'`, `fis.fisanatipi = 'YM'`]))
			if (tarihBS)
				wh.basiSonu(tarihBS, 'fis.tarih')
		})
	}

	static rootFormBuilderDuzenle_islemTuslari({ sender: tanimPart, fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		fbd.addStyle(...[
			`$elementCSS {
				--width-sag: 250px !important;
				--button-width: 40px !important;
				--button-height: 35px !important;
				position: fixed !important;
				top: 110px !important;
				right: 15px !important;
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
		let { otoTazele_minDk } = this
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
			.fullScreen()
			.addStyle_fullWH()
			.addStyle(...[`
				$elementCSS .accordion > .header > .collapsed-content > div {
					margin-top: 14px;
					line-height: 16px !important
				}
				@media (max-width: 600px) {
					$elementCSS .accordion > .header > .collapsed-content > div {
						margin-top: 18px;
						line-height: 18px !important
					}
				}
				$elementCSS .accordion.item.expanded.has-error > .header {
					background: linear-gradient(35deg, #fc8e8e 50%, #cececeee 100%) !important;
					animation: anim-haserror 900ms ease-in-out infinite !important
				}
				$elementCSS .accordion.item > .content { overflow: hidden !important }
				$elementCSS .accordion.item.has-error > .content > div {
					box-shadow: 0 0px 15px 2px firebrick !important
				}
				$elementCSS .secimBilgi { margin-right: 250px }
				$elementCSS .secimBilgi > * { background-color: whitesmoke !important }
				@keyframes anim-haserror {
					  0%, 100%  { filter: brightness(1) }
					 50%        { filter: brightness(1.2) saturate(1.1) }
				 }`
			])
			.onAfterRun(({ builder: { part }}) =>
				tanimPart.acc = e.acc = part)
		
		rfb.onAfterRun(() =>
			inst.onAfterRun(e))
	}

	async onAfterRun({ tanimPart }) {
		await this.accDuzenle(...arguments)
		let { acc } = tanimPart
		await this.acc_onCollapse({ ...arguments[0], acc })
		await this.acc_onExpand({ ...arguments[0], acc })
	}

	async accDuzenle(e) {
		let { tanimPart, acc } = e
		let panels = this.panels = this.getPanels(e)
		for (let [id, item] of entries(panels)) {
			item.id ??= id
			await item.run(e)
		}
		acc.onCollapse(_e => this.acc_onCollapse({ ...e, ..._e }))
		acc.onExpand(_e => this.acc_onExpand({ ...e, ..._e }))
	}
	acc_onCollapse({ tanimPart, acc }) {
		/*let {activePanelId: id} = acc
		let targetId = id == 'genel' ? 'satis' : 'genel'
		acc.expand(targetId)*/
		setTimeout(() => hideNotify(), 10)
	}
	acc_onExpand({ tanimPart, acc }) {
		;{
			let { _promises_uzakVeri: promises } = tanimPart
			;promises?.flat?.()?.forEach(p =>
				p?.abort?.())
			lastAjaxObj?.abort?.()
			delete tanimPart._promises_uzakVeri
		}
		setTimeout(() => {
			let { activePanelId: id } = acc, { islemTuslari } = tanimPart
			let btns = islemTuslari.find('#seviyeAc, #seviyeKapat')
			let selector = id == 'satis' ? 'removeClass' : 'addClass'
			btns[selector]('jqx-hidden')
			hideNotify()
		}, 10)
	}

	async tazeleIstendi(e = {}) {
		let { tanimPart = e.sender ?? {} } = e
		let { acc = tanimPart.acc ?? {} } = tanimPart
		let { item } = acc.activePanel ?? {}

		//let layout = acc.layout
		let layout = item?.contentLayout ?? acc.layout
		//let elms = arrayFrom(layout?.find('.grid-container:not(.sube) .grid.part'))
		await tanimPart._promise_tazele

		let { panels } = this
		for (let item of values(panels))
			await item.tazele(e)
		/*for (let elm of elms) {
			let part = $(elm).data('part')
			if (part?.tazele) {
				await part.tazele()
				await delay(10)
			}
		}*/
		acc?.render()
		tanimPart._promise_tazele = delay(5_000)
	}
	otoTazele_startTimer(e) {
		let { class: { otoTazele_minDk } } = this
		let { tanimPart = e.sender } = e
		let {_timer_otoTazele: timer, _otoTazeleDk: otoTazeleDk } = tanimPart
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
		if (!otoTazeleDk)
			otoTazeleDk = Math.max(otoTazeleDk, otoTazele_minDk)
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
		let { tanimPart: parentPart } = e
		let { secimler } = this
		let part = secimler?.duzenlemeEkraniAc({
			parentPart,
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

	baslikSentDuzele(e = {}) {
		let { sent, sent: { where: wh, sahalar }, harTable, iptalAlma, iade = e.iademi } = e
		let { secimler } = this
		if (harTable)
			sent.fisHareket('restoranfis', harTable)
		else
			sent.fromAdd('restoranfis fis')
		wh
			.add(`fis.kapanmazamani IS NOT NULL`)
			.degerAta(iade ? 'I' : '', 'fis.iade')
			.birlestir(secimler.getTBWhereClause(e))
		if (!iptalAlma)
			wh.add('fis.biptalmi = 0')
		return this
	}
	stmSonIslemler({ stm }) {
		/*let { buDB, dbListe } = app
		if (konsolideCikti && !empty(ekDBListe)) {
			;stm.forEach(sent => {
				let { from, where: wh, sahalar } = sent
			})
		}*/
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

	async getSubeTanimlari({ tanimPart = {} } = {}) {
		let { buDB, dbListe } = app
		let { db2SubeKod2Param: result, secimler = {} } = tanimPart
		if (!result) {
			let { sube: { value: kodListe } = {} } = secimler
			let uni = new MQUnionAll()
			;dbListe.forEach(db => {
				let fromPrefix = db == buDB ? '' : `${db}..`
				let sent = new MQSent(), { where: wh, sahalar } = sent
				sent
					.fromAdd(`${fromPrefix}marsubeparam par`)
					.innerJoin('par', 'isyeri sub', 'par.bizsubekod = sub.kod')
				wh.add(`par.bizsubekod <> ''`, `par.offsubeipadres <> ''`)
				if (!empty(kodListe))
					wh.inDizi(kodListe, 'par.bizsubekod')
				sahalar.add(
					`'${db}' merkezDB`,
					'par.bizsubekod kod', 'sub.aciklama', 'par.offsubebhttpsmi https', 'par.offsubeipadres host', 'par.offsubeportno port',
					'par.offsubesqlserver server', 'par.offsubevtadi db', 'par.offsubesqluser wsUser', 'par.offsubesqlpasswd wsPass'
				)
				uni.add(sent)
			})
			let stm = new MQStm({ sent: uni })
			result = {}
			let recs = await stm.execSelect()
			for (let r of recs) {
				let kod2Param = result[r.db] ??= {}
				kod2Param[r.kod] = r
			}
			tanimPart.db2SubeKod2Param = result
		}

		if (empty(result))
			debugger

		return result
	}
}
