class DRapor_PratikSatis_Eski extends DRaporMQ {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return PratikSatisHareketci }
	static get oncelik() { return this.hareketciSinif.oncelik }
	static get kategoriKod() { return this.hareketciSinif.kategoriKod }
	static get kategoriAdi() { return this.hareketciSinif.kategoriAdi }
	//static get kod() { return this.hareketciSinif.kod }
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
		mergeInto(this.class, this, 'Panel', 'PanelDetay', 'PanelGrid')
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
		e.sender = this
		app.appTitleBar?.removeClass('jqx-hidden')
		this.otoTazele_stopTimer(e)
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

	async accDuzenle(e) {
		let { tanimPart, acc } = e
		let panels = this.getPanels(e)
		for (let [id, item] of entries(panels)) {
			item.id ??= id
			await item.run(e)
		}
		
		panels = {
			ozet: { title: 'Özet', expanded: true },
			tahsilat: { title: 'Tahsilat' },
			kdv: { title: 'KDV' },
			kasiyer: { title: 'Kasiyer' },
			sube: { title: 'Şube' },
			satis: { title: 'Ürün Satışı' }
		}
		for (let [id, item] of entries(panels))
			this.addPanel({ ...e, id, ...item })
		acc.onCollapse(_e => this.acc_onCollapse({ ...e, ..._e }))
		acc.onExpand(_e => this.acc_onExpand({ ...e, ..._e }))
	}
	async acc_initContent_ozet({ tanimPart, islem, acc, item, layout, rfb }) {
		// rfb.addStyle_fullWH()
		let form = rfb.addFormWithParent().yanYana()
			.addStyle(`$elementCSS { overflow: hidden !important }`)
		
		// özet
		;{
			let altForm = form.addFormWithParent().altAlta()
				.addStyle_fullWH(null, 'auto')
				.addStyle(`$elementCSS { overflow-x: hidden !important }`)
			altForm.addBaslik().setEtiket('TOPLAM')
			;{
				altForm.addGridliGosterici('ozet')
					.addStyle_fullWH(null, 240)
					.noAnimate()
					.setUserData({ keyFields: ['tipText'], noSort: true })
					.rowNumberOlmasin().notAdaptive()
					.setToplamYapi({ etiket: { belirtec: 'tipText' } })
					.widgetArgsDuzenleIslemi(({ args }) =>
						extend(args, {
							...this.getGridOrtakArgs({ ...arguments[0], args }),
							autoHeight: true, showStatusBar: false,
							showAggregates: false, showGroupAggregates: false
						})
					)
					.setTabloKolonlari(e => {
						let cellClassName = (...rest) =>
							this.gridCSSHandler(...rest)
						return [
							new GridKolon({ belirtec: 'tipText', text: `<span class=darkviolet>ÖZET</span>`, genislikCh: 16, filterType: 'checkedlist', cellClassName }),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10, filterType: 'checkedlist', aggregates: ['sum'], cellClassName }).tipNumerik(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 17, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
						]
					})
					.setSource(async e => {
						let uni = new MQUnionAll()
						;{
							let sent = new MQSent(), { where: wh, sahalar } = sent
							this.baslikSentDuzele({ ...arguments[0], ...e, sent })
							sahalar.add(
								`(case` +
									` when fis.efayrimtipi = 'E' then 1` +
									` when fis.efayrimtipi = 'A' then 2` +
									` when fis.fisanatipi = 'YM' then 4` +
									` when fis.ozelisaret = '*' then 10` +
									` else 3` +
								` end) oncelik`,
								`(case` +
									` when fis.efayrimtipi = 'E' then 'EFAT'` +
									` when fis.efayrimtipi = 'A' then 'EARS'` +
									` when fis.fisanatipi = 'YM' then 'YMK'` +
									` when fis.ozelisaret = '*' then '*'` +
									` else 'DIG'` +
								` end) tip`,
								`(case` +
									` when fis.efayrimtipi = 'E' then 'e-Fatura'` +
									` when fis.efayrimtipi = 'A' then 'e-Arşiv'` +
									` when fis.fisanatipi = 'YM' then 'Yemek Kartı'` +
									` when fis.ozelisaret = '*' then 'Fiili Fiş'` +
									` else 'Diğer'` +
								` end) tipText`,
								`'' almaText`,
								`COUNT(*) fisSayi`, `SUM(fis.fissonuc) bedel`
							)
							sent.groupByOlustur()
							uni.add(sent)
						}
						let stm = new MQStm({ sent: uni, orderBy: ['oncelik'] })
						let recs = await this.getGridData({ ...arguments[0], ...e, query: stm })
						recs = recs.filter(r => r.fisSayi)
						return recs
					})
			}
			;{
				altForm.addGridliGosterici('ozetEk')
					.addStyle_fullWH(null, 200)
					.noAnimate()
					.setUserData({ keyFields: ['tipText'], noSort: true })
					.rowNumberOlmasin().notAdaptive()
					.widgetArgsDuzenleIslemi(({ args }) =>
						extend(args, {
							...this.getGridOrtakArgs({ ...arguments[0], args }),
							showGroupsHeader: false, columnsHeight: 25
							// showStatusBar: true, showAggregates: false, showGroupAggregates: false
						})
					)
					.setTabloKolonlari(e => {
						let cellClassName = (...rest) =>
							this.gridCSSHandler(...rest)
						return [
							new GridKolon({ belirtec: 'tipText', text: `<span class=violet>ÖZET-EK</span>`, genislikCh: 16, filterType: 'checkedlist', cellClassName }),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10, filterType: 'checkedlist', aggregates: ['sum'], cellClassName }).tipNumerik(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 17, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
						]
					})
					.setSource(async e => {
					let uni = new MQUnionAll()
					;{
						let sent = new MQSent(), { where: wh, sahalar } = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, iptalAlma: true, sent })
						sahalar.add(
							`11 oncelik`,
							`'IPT' tip`,
							`'İptal Fiş' tipText`,
							`'X' almaText`,
							`COUNT(*) fisSayi`, `SUM(fis.fissonuc) bedel`
						)
						wh.add(`fis.biptalmi > 0`)
						sent.groupByOlustur()
						uni.add(sent)
					}
					;{
						let sent = new MQSent(), { where: wh, sahalar } = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
						wh.add(new MQOrClause([
							`har.biptalmi > 0`, `har.bikrammi > 0`]))
						sahalar.add(
							`(case when har.biptalmi > 0 then 20 else 22 end) oncelik`,
							`(case when har.biptalmi > 0 then 'IHAR' when har.bikrammi > 0 then 'IKR' else '' end) tip`,
							`(case when har.biptalmi > 0 then 'İPTAL Satırı' when har.bikrammi > 0 then 'İkram Satırı' else '??' end) tipText`,
							`'X' almaText`, `COUNT(*) fisSayi`, `SUM(ROUND(har.miktar * har.kdvlifiyat, 2)) bedel`
						)
						sent.groupByOlustur()
						uni.add(sent)
					}
					;{
						let sent = new MQSent(), { where: wh, sahalar } = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
						wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
						wh.inDizi(['MS', 'DG'], 'fis.fisanatipi')          // 'YM' alınmaz
						sahalar.add(
							`(case fis.fisanatipi when 'MS' then 24 when 'DG' then 25 else 28 end) oncelik`,
							`(case fis.fisanatipi when 'MS' then 'MUS' when 'DG' then 'DADR' else '' end) tip`,
							`(case fis.fisanatipi when 'MS' then 'Müşterili' when 'DG' then 'Değişken Adres' else '??' end) tipText`,
							`'X' almaText`, `COUNT(*) fisSayi`, `SUM(ROUND(har.miktar * har.kdvlifiyat, 2)) bedel`
						)
						sent.groupByOlustur()
						uni.add(sent)
					}
					let stm = new MQStm({ sent: uni, orderBy: ['oncelik'] })
					let recs = await this.getGridData({ ...arguments[0], ...e, query: stm })
					recs = recs.filter(r => r.fisSayi)
					return recs
				})
			}
			//altForm.addBaslik().setEtiket('sube 1')
			//altForm.addBaslik().setEtiket('sube 2')
		}

		// özel aralık
		;{
			form.addGridliGosterici('ozelAralik')
				.addStyle_fullWH(null, 180)
				.addStyle(`$elementCSS { min-width: 200px !important; max-width: 440px !important }`)
				.noAnimate()
				.setUserData({ noSort: true })
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'text' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						...this.getGridOrtakArgs({ ...arguments[0], args }),
						showStatusBar: true, showAggregates: true, showGroupAggregates: true
					})
				)
				.setTabloKolonlari(e => {
					let cellClassName = (...rest) =>
						this.gridCSSHandler(...rest)
					return [
						new GridKolon({ belirtec: 'text', text: 'Özel Aralık', genislikCh: 13, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'hasilat', text: 'Hasılat (Kdvli)', genislikCh: 20, aggregates: ['sum'], cellClassName }).tipDecimal_bedel(),
						new GridKolon({ belirtec: 'oran', text: '%', genislikCh: 8, cellClassName }).tipNumerik()
					]
				})
				.setSource(async ({ builder: { layout }}) => {
					let recs
					layout[empty(recs) ? 'addClass' : 'removeClass']('jqx-hidden')
					return recs ?? []
				})
		}
		
		rfb.run()
	}
	async acc_initContent_tahsilat({ tanimPart, islem, acc, item, layout, rfb }) {
		// rfb.addStyle_fullWH()
		let form = rfb.addFormWithParent().altAlta()
			.addStyle_fullWH(null, 'calc(var(--full) - var(--acc-header-height) - 35px)')
			.addStyle(`$elementCSS { overflow: hidden !important }`)
		
		// tahsilat
		;{
			form.addGridliGosterici('tahsilat')
				.addStyle_fullWH(null)
				.noAnimate()
				.rowNumberOlmasin().notAdaptive()
				.setUserData({ sortFields: ['oncelik', 'aciklama'] })
				.setToplamYapi({ etiket: { belirtec: 'aciklama' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						...this.getGridOrtakArgs({ ...arguments[0], args }),
						showStatusBar: false, showAggregates: false, showGroupAggregates: false
					})
				)
				.setTabloKolonlari(e => {
					let cellClassName = (...rest) =>
						this.gridCSSHandler(...rest)
					return [
						new GridKolon({ belirtec: 'aciklama', text: `<span class=limegreen>TAHSİLAT</span>`, genislikCh: 25, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
				.setSource(async e => {
					let sent = new MQSent(), { where: wh, sahalar } = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorantahsil' })
					sent.har2TahSekliBagla()
					sahalar.add(
						'har.tahseklino kod', 'tsek.aciklama aciklama',
						`(case tsek.tahsiltipi when 'NK' then 1 when 'PS' then 2 else 9 end) oncelik`,
						'SUM(har.bedel) bedel'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['oncelik', 'bedel DESC'] })
					let recs = await this.getGridData({ ...arguments[0], ...e, query: stm })
					return recs
				})
		}
		
		rfb.run()
	}
	async acc_initContent_kdv({ tanimPart, islem, acc, item, layout, rfb }) {
		// rfb.addStyle_fullWH()
		let form = rfb.addFormWithParent().yanYana()
			.addStyle(`$elementCSS { overflow: hidden !important }`)

		// matrah ve kdv
		;{
			form.addGridliGosterici('matrahKdv')
				.addStyle_fullWH(null, 230)
				.noAnimate()
				.setUserData({ keyFields: ['oran'], noSort: true })
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'text' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						...this.getGridOrtakArgs({ ...arguments[0], args }),
						showStatusBar: false, showAggregates: false, showGroupAggregates: false
					})
				)
				.setTabloKolonlari(e => {
					let cellClassName = (...rest) =>
						this.gridCSSHandler(...rest)
					return [
						new GridKolon({ belirtec: 'text', text: `<span class=orangered>KDV</span>`, genislikCh: 10, filterType: 'checkedlist', cellClassName }).alignRight(),
						new GridKolon({ belirtec: 'matrah', text: 'Matrah', genislikCh: 16, aggregates: ['sum'], cellClassName }).tipDecimal_bedel(),
						new GridKolon({ belirtec: 'kdv', text: 'Kdv', genislikCh: 16, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
				.setSource(async e => {
					let sent = new MQSent(), { where: wh, sahalar } = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
					wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
					sahalar.add(
						`fis.ozelisaret ozelIsaret`, 'har.kdvorani oran',
						'SUM(har.kdvsizbedel) matrah', 'SUM(har.kdv) kdv'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['oran', 'ozelIsaret'] })
					let recs = await this.getGridData({ ...arguments[0], ...e, query: stm })
					recs.forEach(r =>
						r.text = `%${r.oran}`)
					return recs
				})
		}
		
		rfb.run()
	}
	async acc_initContent_kasiyer({ tanimPart, islem, acc, item, layout, rfb }) {
		// rfb.addStyle_fullWH()
		let form = rfb.addFormWithParent().yanYana()
			.addStyle_fullWH(null, 'calc(var(--full) - var(--acc-header-height) - 35px)')
			.addStyle(`$elementCSS { overflow: hidden !important }`)

		// kasiyer
		;{
			form.addGridliGosterici('kasiyer')
				.noAnimate()
				.addStyle_fullWH()
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'aciklama' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						...this.getGridOrtakArgs({ ...arguments[0], args }),
						showStatusBar: false, showAggregates: false, showGroupAggregates: false
					})
				)
				.setTabloKolonlari(e => {
					let cellClassName = (...rest) =>
						this.gridCSSHandler(...rest)
					return [
						new GridKolon({ belirtec: 'aciklama', text: `<span class=orange>KASİYER</span>`, genislikCh: 25, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
				.setSource(async e => {
					let sent = new MQSent(), { where: wh, sahalar } = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent })
					sent.fromIliski('kasiyer ksy', 'fis.kasiyerkod = ksy.kod')
					sahalar.add(
						'fis.kasiyerkod kod', 'ksy.aciklama aciklama',
						'SUM(fis.fissonuc) bedel'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['bedel DESC', 'aciklama'] })
					let recs = await this.getGridData({ ...arguments[0], ...e, query: stm })
					return recs
				})
		}
		
		rfb.run()
	}
	async acc_initContent_sube({ tanimPart, islem, acc, item, layout, rfb }) {
		// rfb.addStyle_fullWH()
		let form = rfb.addFormWithParent().yanYana()
			.addStyle_fullWH(null, 'calc(var(--full) - var(--acc-header-height) - 35px)')
			.addStyle(`$elementCSS { overflow-x: hidden !important }`)

		// şube
		;{
			form.addGridliGosterici('sube')
				.noAnimate()
				.addStyle_fullWH()
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'aciklama' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						...this.getGridOrtakArgs({ ...arguments[0], args }),
						showStatusBar: false, showAggregates: false, showGroupAggregates: false
					})
				)
				.setTabloKolonlari(e => {
					let cellClassName = (sender, rowIndex, belirtec, value, rec, prefix) => {
						let result = [belirtec]
						if (rec._toplam)
							result.push('_toplam')
						return result.join(' ')
					}
					return [
						...MQCogul.getKAKolonlar(
							new GridKolon({ belirtec: 'subeKod', text: 'Kod', genislikCh: 6, filterType: 'checkedlist', cellClassName }),
							new GridKolon({ belirtec: 'subeAdi', text: `<span class=orange>ŞUBE</span>`, genislikCh: 25, filterType: 'checkedlist', cellClassName })
						),
						new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
				.setSource(async e => {
					let sent = new MQSent(), { where: wh, sahalar } = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent })
					sent.fromIliski('isyeri sub', 'fis.bizsubekod = sub.kod')
					sahalar.add(
						'fis.bizsubekod subeKod', 'sub.aciklama subeAdi',
						'SUM(fis.fissonuc) bedel'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['bedel DESC', 'subeAdi'] })
					let recs = await this.getGridData({ ...arguments[0], ...e, query: stm })
					return recs
				})
		}
		
		rfb.run()
	}
	async acc_initContent_satis({ tanimPart, islem, acc, item, layout, rfb }) {
		let { secimler: sec } = this
		let { sqlNull, sqlEmpty } = Hareketci_UniBilgi.ortakArgs
		;{
			rfb.addGridliGosterici('satis')
				.addStyle_fullWH(null, 'calc(var(--full) - var(--acc-header-height) + 35px)')
				.noAnimate()
				.setUserData({ keyFields: ['stokKod', 'stokAdi', 'grupKod', 'grupAdi'] })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						...this.getGridOrtakArgs({ ...arguments[0], args }),
						showGroupsHeader: true, rowsHeight: 50, showStatusBar: true,
						showAggregates: true, showGroupAggregates: true
					})
				)
				.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
					grid.jqxGrid('groups', ['grupAdi']))
				.setTabloKolonlari(e => {
					let cellClassName = (...rest) =>
						this.gridCSSHandler(...rest)
					return [
						new GridKolon({ belirtec: 'stokAdi', text: 'Stok', filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 11, filterType: 'checkedlist', aggregates: ['sum'], cellClassName }).tipDecimal(),
						new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 4, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'hasilat', text: 'Hasılat (Kdvli)', genislikCh: 13, aggregates: ['sum'], cellClassName }).tipDecimal_bedel(),
						new GridKolon({ belirtec: 'grupAdi', text: 'Grup', genislikCh: 20, filterType: 'checkedlist', cellClassName })
					]
				})
				.setSource(async e => {
					let getSatisStm = iade => {
						let sent = new MQSent(), { where: wh, sahalar } = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, sent, iade, harTable: 'restorandetay' })
						sent
							.har2StokBagla()
							.stok2GrupBagla()
						wh.add('har.biptalmi = 0')
						sahalar.add(
							'har.stokkod stokKod', 'stk.aciklama stokAdi', 'stk.brm',
							'SUM(har.kdvlinetbedel) hasilat', 'SUM(har.miktar) miktar',
							`${iade ? sqlEmpty : 'stk.grupkod'} grupKod`,
							`${iade ? `'<İade>'` : 'grp.aciklama'} grupAdi`,
						)
						sent.groupByOlustur()
						let stm = new MQStm({ sent, orderBy: ['grupAdi', 'stokAdi'] })
						return stm
					}
					let _e = { ...arguments[0], ...e }
					let recs = [
						...await this.getGridData({ ..._e, query: getSatisStm(false) }),
						...await this.getGridData({ ..._e, query: getSatisStm(true) })
					]
					/*;{
						let t = { _toplam: true, stokAdi: 'TOPLAM', hasilat: 0, miktar: 0 }
						for (let rec of recs) {
							t.hasilat += rec.hasilat
							t.miktar += rec.miktar
						}
						t.hasilat = roundToBedelFra(t.hasilat)
						recs.unshift(t)
					}*/
					return recs
				})
		}
		rfb.run()
	}

	_acc_initCollapsedContent_ortak(e = {}) {
		let { dbListe } = app
		let { tanimPart = {}, layout, rfb = {}, item = {}, islem } = e
		let { inst = {}, acc = tanimPart.acc, id2SubeResult = {} } = tanimPart
		let { secimler = {} } = inst
		let { id, collapsed = {} } = item ?? {}
		let { sonTS, success, error } = id2SubeResult[id] ?? {}

		let container = $(`<div/>`)
		//let parent = $(`<div class="flex-row"/>`)
		if ((secimler && !collapsed) || sonTS || !empty(success)) {
			let parent = $(`<div class="parent flex-row full-height" style="gap: 10px"/>`)
			if (sonTS) {
				$(
					`<div class="sonTS fs-90">` + 
						`<span class="etiket lightgray">Son: </span>` +
						`<b class="royalblue">${timeToString(sonTS)}</b>` +
						`</div>`
				).appendTo(parent)
			}
			if (!empty(success)) {
				let liste = values(success)?.map(_ => _.aciklama) ?? []
				$(`<div class="subeler success fs-90">Gelen: [ <b class="forestgreen">${liste.join(', ') ?? ''}</b> ]</div>`)
					.appendTo(parent)
			}

			if (secimler && !collapsed) {
				let e = { liste: [] }
				for (let [k, s] of secimler) {
					if (k != 'tarihAralik')        // 'donem' ozetBilgi gösteriminde zaten gerekirse tarihAralık bilgisi de var)
						s.ozetBilgiHTMLOlustur(e)
				}
				let ozetBilgiHTML = e.liste?.filter(x => !!x).join(' ')
				if (ozetBilgiHTML) {
					let elmSecimBilgi = $(`<div class="absolute parent secimBilgi" style="top: -5px; right: 0; margin: 0"/>`)
					$(ozetBilgiHTML).appendTo(elmSecimBilgi)
					elmSecimBilgi.appendTo(parent)
				}
			}
			
			if (!empty(parent.children()))
				parent.appendTo(container)
		}
		
		if (!empty(error)) {
			let liste = values(error)?.map(_ => _.aciklama) ?? []
			$(`<div class="subeler error fs-90"><u class="orangered"><b>HATALI</b>:</u> [ <b class="firebrick">${liste.join(', ') ?? ''}</b> ]</div>`)
				.appendTo(container)
		}
		
		return container
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

	gridSeviyeAcKapatIstendi({ tanimPart, state } = {}) {
		let {acc: { layout }} = tanimPart
		let grids = arrayFrom(layout.find('.grid.part'))
		for (let grid of grids) {
			if (!grid.html)
				grid = $(grid)
			let p = grid.data('part') ?? {}
			let {gridWidget: w} = p
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
	secimlerIstendi(e) {
		let { tanimPart: parentPart } = e, { secimler } = this
		let part = secimler?.duzenlemeEkraniAc({
			parentPart,
			tamamIslemi: _e =>
				this.tazeleIstendi({ ..._e, ...e })
		})
		if (part?.layout?.length) {
			let {layout} = part, css = 'modelTanim'
			;[layout, layout.parent()].forEach(l =>
				l?.removeClass(css))
		}
	}
	async tazeleIstendi({ tanimPart, sender } = {}) {
		tanimPart ??= sender
		let { acc = {} } = tanimPart ?? {}
		let { layout } = acc
		let { activePanel: { item } = {} } = acc
		layout = item?.contentLayout ?? layout
		// let { contentLayout: layout } = item ?? {}

		let elms = arrayFrom(layout?.find('.grid.part'))
		await tanimPart._promise_tazele
		for (let elm of elms) {
			let part = $(elm).data('part')
			if (!part?.tazele)
				continue
			await part.tazele()
			await delay(10)
		}
		acc?.render()
		tanimPart._promise_tazele = promise(resolve =>
			setTimeout(() => resolve(), 5_000))
	}

	otoTazele_startTimer(e) {
		let { class: { otoTazele_minDk } } = this
		let { tanimPart = e.sender } = e
		let {_timer_otoTazele: timer, _otoTazeleDk: otoTazeleDk } = tanimPart
		if (otoTazeleDk)
			otoTazeleDk = Math.max(otoTazeleDk, otoTazele_minDk)
		
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
		let { inst } = tanimPart
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
		await inst.tazeleIstendi({ ...e, action: 'otoTazele' })
		setTimeout(() => tanimPart._inTazeleProc = false, 2_000)
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

	getPanels(e) {
		let { class: { Panel, PanelGrid } } = this
		return {
			ozet: new Panel()
				.setTitle('Özet').setExpanded()
				.add(...[
					new PanelGrid()
						.setId('ozet').setTitle('Özet').setHeight(240)
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
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10, filterType: 'checkedlist' }).tipNumerik().sum().checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18 }).tipDecimal_bedel().sum()
						]),
						//.setQuery(...)
					new PanelGrid()
						.setId('ozetEk').setTitle('Özet Ek').setHeight(200)
						.setUserData({ keyFields: ['tipText'], noSort: true })
						.setToplamBelirtec('tipText')
						.widgetArgsDuzenleIslemi(({ args }) =>
							extend(args, { showGroupsHeader: false, columnsHeight: 25 }))
						.setTabloKolonlari([
							new GridKolon({ belirtec: 'tipText', text: `<span class=violet>ÖZET-EK</span>`, genislikCh: 16 }).checkedList(),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10, filterType: 'checkedlist' }).tipNumerik().sum().checkedList(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18 }).tipDecimal_bedel().sum()
						])
						//.setQuery(...)
				]),
			tahsilat: new Panel()
				.setTitle('Tahsilat').fullHeight()
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
						//.setQuery(...)
				])
		}
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

	addPanel(e) {
		let { tanimPart = e.sender, id, title = e.etiket } = e
		let { acc = tanimPart.acc } = e
		let { content, expanded = false } = e
		let getRFB = layout => {
			return new RootFormBuilder()
				.setPart(tanimPart)
				.setLayout(layout)
		}
		acc.add({
			id, title, expanded,
			content: ({ item }) => {
				let { contentLayout: layout } = item
				let rfb = getRFB(layout)
				let func = isFunction(content) ? content : this[`acc_initContent_${id}`]
				func ??= this.panelInitContent
				let args = { ...e, item, layout, rfb }
				setTimeout(() => func.call(this, args), 100)
			},
			collapsedContent: ({ sender: acc, item }) =>  {
				let { contentLayout: layout } = item
				let rfb = getRFB(layout)
				let args = { ...e, item, layout, rfb }
				let func = (
					this[`acc_initCollapsedContent_${id}`] ??
					this._acc_initCollapsedContent_ortak
				)
				return func?.call(this, args)
			}
		})
		return this
	}
	async panelInitContent(e) {
		let { dRapor: { praUzakSubeVerisi } } = app.params ?? {}
		let { tanimPart = e.sender, acc, item, layout, rfb } = e
		let { duzenleIlk, duzenleAra, duzenleSon, height } = e
		acc ??= tanimPart.acc

		// rfb.addStyle_fullWH()
		let form = e.form = rfb.addFormWithParent().altAlta()
			.addStyle(`$elementCSS { overflow: hidden !important }`)
		if (height) {
			if (height == 'full')
				height = 'calc(var(--full) - var(--acc-header-height) - 35px)'
			form.addStyle_fullWH(null, height)
		}
		await duzenleIlk?.call?.(this, e)
		altForm.addBaslik()
			.setEtiket(`<b class="royalblue">TOPLAM</b>`)
		await duzenleAra?.call?.(this, e)
		if (praUzakSubeVerisi)
			await this.panelInitContent_subeYapilar(e)
		await duzenleSon?.call?.(this, e)
		rfb.run()
		return this
	}
	async panelInitContent_subeYapilar(e) {
		let { tanimPart = e.sender, acc, item, layout, rfb, form, duzenleAra } = e
		acc ??= tanimPart.acc
		
		await tanimPart?._promise_getSubeTanimlari
		let db2Kod2Def = await this.getSubeTanimlari(...arguments)
		if (empty(db2Kod2Def))
			return false

		for (let [db, kod2Def] of entries(db2Kod2Def))
		for (let [subeKod, def] of entries(kod2Def)) {
			let subeText = def.aciklama || def.kod
			altForm.addBaslik()
				.setEtiket(`<b class="forestgreen" style="padding-left: 13px">${subeText}</b>`)
			await duzenleAra?.call?.(this, { ...e, subeKod })
		}
		return true
	}
	addGrid(e) {
		let { id, tanimPart = e.sender, acc, item, layout, form, rfb } = e
		let { subeKod, toplamBelirtec, userData, widgetArgsDuzenle } = e
		let { cssDuzenle, tabloKolonlari, source, query } = e
		acc ??= tanimPart.acc

		let subemi = e.subemi = subeKod != null
		let gridId = [id, subeKod].filter(Boolean).join('_')
		let cellClassName = (...rest) => {
			let result = this.gridCSSHandler(...rest) ?? []
			cssDuzenle?.call(this, { ...e, ...rest, result })
			return result
		}
		let fbd_grid = form.addGridliGosterici(gridId)
			.addStyle_fullWH(null)
			.noAnimate()
			.rowNumberOlmasin().notAdaptive()
			.setUserData(userData)
			.setToplamYapi({ etiket: { belirtec: toplamBelirtec } })
			.widgetArgsDuzenleIslemi(({ args }) => {
				extend(args, this.getGridOrtakArgs({ ...arguments[0], args }))
				widgetArgsDuzenle?.call(this, { ...e, args })
			})
			.setTabloKolonlari(_e => {
				_e = { ...e, ..._e }
				let defs = getFuncValue.call(this, tabloKolonlari, _e)?.filter(Boolean) ?? []
				;defs.forEach(def =>
					def.cellClassName ??= cellClassName)
				return defs
			})
			.setSource(async _e => {
				_e = { ...e, ..._e }
				let recs
				if (subemi) {
					let { layout: gridLayout } = fbd_grid
					let { sube2Recs = {} } = tanimPart.id2Sube2Recs?.[id]
					recs = sube2Recs[subeKod]
					let uygunmu = recs != null
					gridLayout?.(uygunmu ? 'removeClass' : 'addClass')('jqx-hidden')
				}
				else {
					recs = await getFuncValue.call(this, source, _e)
					if (recs == null) {
						let stm = await getFuncValue.call(this, query, _e)
						recs = await this.getGridData({ ..._e, query: stm })
					}
				}
				return recs ?? []
			})

		rfb.run()
		return fbd_grid
	}
	getGridOrtakArgs() {
		return {
			rowsHeight: 30, columnsMenu: false, showGroupsHeader: true,
			columnsReorder: false, selectionMode: 'multiplerowsextended',
			autoShowLoadElement: false,
			groupsRenderer: (text, group, expanded, groupInfo) => {
				let { subItems = [] } = groupInfo ?? {}
				subItems = subItems?.filter(r => !r.totalsrow)
				let topBedel = topla(r => r.hasilat ?? r.bedel, subItems)
				return (
					`<div class="grid-cell-group full-wh relative">` +
						`<div class="aciklama float-left">${group}</div>` +
						`<div class="bedel fs-100 bold royalblue float-right" style="margin-right: 23px">${bedelToString(topBedel)}</div>` +
					`</div>`
				)
			}
		}
	}
	async gridCSSHandler(sender, rowIndex, belirtec, value, rec, prefix) {
		let result = [belirtec]
		if (rec._toplam)
			result.push('_toplam')
		return result.join(' ')
	}
	async getGridData({ tanimPart, acc, query, params, tabloKolonlari, builder: fbd, gridPart } = {}) {
		let { buDB, dbListe } = app
		let { class: { timeout } } = this, { layout } = tanimPart
		let { id: gridId, layout: gridLayout } = fbd
		gridPart ??= fbd?.part
		let accItem = acc?.id2Panel[gridLayout.parents('.accordion.item').data('id')] ?? {}
		let { id: panelId, layout: panelLayout } = accItem
		let userData = accItem.userData ??= {}
		let id2Sube2Recs = tanimPart.id2Sube2Recs ??= {}

		panelLayout?.removeClass('has-error')
		let id2SubeResult = tanimPart.id2SubeResult ??= {}
		let subeResult = id2SubeResult[panelId] ??= {}
		;['success', 'error'].forEach(k =>
			subeResult[k] = {})

		clearTimeout(tanimPart._timer_tazeleIndicatorClear)
		layout?.addClass('refreshing')
		
		try {
			if (query?.sentDo) {
				let e = { ...arguments[0], stm: query }
				delete e.query
				this.stmSonIslemler(e)
				query = e.query = e.stm
				params = e.params = e.params
			}
	
			await tanimPart?._promise_getSubeTanimlari
			let { dRapor: { praUzakSubeVerisi } } = app.params ?? {}
			if (!praUzakSubeVerisi)
				return await query.execSelect({ timeout, params })
	
			let db2Kod2Def = await this.getSubeTanimlari(...arguments)
			if (empty(db2Kod2Def))
				return await query.execSelect({ timeout, params })
	
			let { userData: { keyFields, sortFields, noSort } = {} } = fbd ?? {}
			tabloKolonlari ??= fbd?.tabloKolonlari ?? gridPart?.tabloKolonlari
			let cd = { sabit: {}, toplam: {} }
			if (tabloKolonlari) {
				;tabloKolonlari.forEach(c => {
					let { belirtec, aggregates } = c
					let agg = makeArray(aggregates)
					let selector = agg?.includes('sum') ? 'toplam' : 'sabit'
					cd[selector][belirtec] = c
				})
			}
			
			let { _promise_getGridData } = tanimPart
			// try { await _promise_getGridData } catch (ex) { }
			_promise_getGridData = tanimPart._promise_getGridData = defer()
			
			try {
				;{
					let { _promises_uzakVeri: promises } = tanimPart
					if (!empty(promises))
						await delay(5_000)
				}
				/*;{
					let { _promises_uzakVeri: promises } = tanimPart
					;promises?.flat?.()?.forEach(p =>
						p?.abort?.())
					lastAjaxObj?.abort?.()
					delete tanimPart._promises_uzakVeri
				}*/
		
				if (query?.sentDo) {
					for (let { where: wh } of query) {
						;wh.liste = wh.liste.filter(v =>
							!(v?.startsWith?.('sub.') || v?.saha?.endsWith?.('bizsubekod')))
					}
				}
				
				let delayMS = 100
				let promises = []
				let _promises_uzakVeri = tanimPart._promises_uzakVeri = []
				for (let [db, kod2Def] of entries(db2Kod2Def))
				for (let [subeKod, def] of entries(kod2Def)) {
					let pr = (async () => {
						if (delayMS)
							await delay(delayMS)
						delayMS *= 2.5
						try {
							let _pr = remoteProc({
								...def,
								proc: () =>
									query.execSelect({ timeout, params })
							})
							_promises_uzakVeri.push(_pr)
							
							let { aciklama: subeAdi, port, db } = def
							let recs = await _pr
							;recs?.forEach(r => {
								if (r.subeKod !== undefined)
									extend(r, { subeKod, subeAdi })
							})
							subeResult.success[subeKod] ??= def
							
							if (config.dev) {
								console.group(`${port}: ${db}`)
								console.table(recs)
								console.info(query?.getQueryYapi() ?? query)
								console.groupEnd()
							}
							
							return { def, recs }
						}
						catch (error) {
							subeResult.error[subeKod] ??= def
							throw { def, error }
						}
					})()
					;promises.push(pr)
				}
	
				let getKey = (r, keyFields, sortFields) => {
					if (keyFields)
						keyFields = makeArray(keyFields)
					if (sortFields)
						sortFields = makeArray(sortFields)
					
					if (empty(keyFields))
						keyFields = sortFields
					if (empty(keyFields))
						keyFields = keys(cd.sabit)
					
					return keyFields
						.map(k => String(r[k]))
						.join('\t')
				}
	
				let { DefaultWSHostName_SkyServer: defHost } = config.class
				let all = ( await promiseAllSet(promises) )
				subeResult.sonTS = now()                           // bu panel item için son veri çekme zamanı

				let key2Rec = new Map()
				let errors = tanimPart._errors ??= []
				let sube2Recs = id2Sube2Recs[gridId] ??= {}
				for (let { status: s, reason, value: result } of all) {
					if (s == 'rejected') {
						let { def = {}, error: err } = reason
						let { https, host, port, url, sql, db = {} } = def
						db ??= sql?.db
						url ??= `${https ? 'https' : 'http'}://${host}:${port}`
						let origin = !host || host == defHost ? String(port) : `${host}:${port}`
						let title = `${origin} | ${db}`
						let content = getErrorText(err, url)
						errors.push({ title, content, err })
						continue
					}

					let { recs, def = {} } = result
					if (empty(recs))
						continue

					let { kod: subeKod } = def
					sube2Recs[subeKod] = extend(true, [], recs)    // bu grid, bu şube için orj recs (deepCopy)
					;recs.forEach(bu => {
						let k = getKey(bu, keyFields)
						if (!key2Rec.has(k))
							key2Rec.set(k, bu)
						else {
							let diger = key2Rec.get(k)
							;keys(cd.toplam).forEach(b =>
								diger[b] = Number(diger[b]) + Number(bu[b]))
						}
					})
				}
				delete tanimPart._promises_uzakVeri
	
				let recs = arrayFrom(key2Rec.values())
				if (!noSort) {
					recs.sort((a, b) =>
						getKey(a, keyFields, sortFields).localeCompare(getKey(b, keyFields, sortFields)))
				}

				let e = { ...arguments[0], subeResult, recs }
				setTimeout(() => {
					acc?.render()
					;{
						let hasErr = !empty(errors)
						let { item: { layout } = {} } = acc?.activePanel ?? {}
						setTimeout(() =>
							layout?.[hasErr ? 'addClass' : 'removeClass']('has-error'),
							10)
					}
				}, 100)
				return recs
			}
			finally { _promise_getGridData?.resolve() }
		}
		finally {
			tanimPart._timer_tazeleIndicatorClear = setTimeout(() =>
				layout?.removeClass('refreshing'), 100)
		}
	}


	static {
		this.Panel = class Panel extends CKodVeAdi {
			get id() { return this.kod } set id(v) { this.kod = v }
			get title() { return this.aciklama } set title(v) { this.aciklama = v }
			get length() { return len(this.id2Item) }
	
			constructor(e = {}) {
				super(e)
				mergeInto(e, this,
					'id', 'title', 'expanded', 'height', 'content', 'collapsedContent',
					'duzenleIlk', 'duzenleSon', 'initContentIlk', 'initContentSon'
				 )
				let { id2Item = e.items ?? e.detaylar } = e
				if (isArray(id2Item))
					id2Item = fromEntries(id2Item.map(r => [r.id, r]))
				id2Item ??= {}
				this.id2Item ??= {}
				for (let [id, item] of entries(id2Item))
					this.set(id, item)
			}
	
			run() {
				let e = { ...arguments[0], panel: this }
				let { id2Item = {}, id, title = e.etiket, expanded = false } = this
				let { duzenleIlk, duzenleSon, content, collapsedContent } = this
				let { tanimPart = e.sender ?? {} } = e
				let { inst = tanimPart.inst ?? {}, acc = tanimPart.acc ?? {} } = e

				let getRFB = e.getRFB = layout => {
					return new RootFormBuilder()
						.setPart(tanimPart)
						.setLayout(layout)
				}
				duzenleIlk?.call?.(this, e)
				acc.add({
					id, title, expanded,
					content: ({ item }) => {
						let { contentLayout: layout } = item
						let rfb = getRFB(layout)
						let func = content
						if (!isFunction(func))
							func = inst[`acc_initContent_${id}`] ?? this._initDefaultContent
						let _e = { ...e, item, layout, rfb }
						setTimeout(() => func.call(this, _e), 100)
					},
					collapsedContent: ({ sender: acc, item }) =>  {
						let { contentLayout: layout } = item
						let rfb = getRFB(layout)
						let args = { ...e, item, layout, rfb }
						let func = collapsedContent
						if (!isFunction(func))
							func = this[`acc_initCollapsedContent_${id}`] ?? this._initDefaultCollapsedContent
						return func?.call(this, args)
					}
				})
				duzenleSon?.call?.(this, e)
				return this
			}

			async _initDefaultContent(e) {
				let { dRapor: { praUzakSubeVerisi } } = app.params ?? {}
				let { tanimPart = e.sender ?? {}, rfb = {} } = e
				let { height, initContentIlk, initContentSon } = e
				let { acc = {} } = tanimPart

				// rfb.addStyle_fullWH()
				let form = e.form = rfb.addFormWithParent().altAlta()
					.addStyle(`$elementCSS { overflow: hidden !important }`)
				if (height) {
					if (height == 'full')
						height = 'calc(var(--full) - var(--acc-header-height) - 35px)'
					form.addStyle_fullWH(null, height)
				}
				
				await initContentIlk?.call?.(this, e)
				
				e.fbd_baslik = altForm.addBaslik()
					.setEtiket(`<b class="royalblue">TOPLAM</b>`)
				for (let item of this)
					await item.run(e)
				if (praUzakSubeVerisi)
					await this.initContent_subeYapilar(e)
				
				await initContentSon?.call?.(this, e)
				rfb.run()
				return this
			}
			async initContent_subeYapilar(e) {
				let { tanimPart = e.sender ?? {} } = e
				await tanimPart?._promise_getSubeTanimlari
				let db2Kod2Def = await this.getSubeTanimlari(...arguments)
				if (empty(db2Kod2Def))
					return false
		
				for (let [db, kod2Def] of entries(db2Kod2Def))
				for (let [subeKod, def] of entries(kod2Def)) {
					let subeText = def.aciklama || def.kod
					altForm.addBaslik()
						.setEtiket(`<b class="forestgreen" style="padding-left: 13px">${subeText}</b>`)
					for (let item of this)
						await item.run({ ...e, subeKod })
				}
				return true
			}
			_initDefaultCollapsedContent(e = {}) {
				let { dbListe } = app
				let { tanimPart = {}, layout, rfb = {}, item = {}, islem } = e
				let { inst = {}, acc = tanimPart.acc, id2SubeResult = {} } = tanimPart
				let { secimler = {} } = inst
				let { id, collapsed = {} } = item ?? {}
				let { sonTS, success, error } = id2SubeResult[id] ?? {}
		
				let container = $(`<div/>`)
				//let parent = $(`<div class="flex-row"/>`)
				if ((secimler && !collapsed) || sonTS || !empty(success)) {
					let parent = $(`<div class="parent flex-row full-height" style="gap: 10px"/>`)
					if (sonTS) {
						$(
							`<div class="sonTS fs-90">` + 
								`<span class="etiket lightgray">Son: </span>` +
								`<b class="royalblue">${timeToString(sonTS)}</b>` +
								`</div>`
						).appendTo(parent)
					}
					if (!empty(success)) {
						let liste = values(success)?.map(_ => _.aciklama) ?? []
						$(`<div class="subeler success fs-90">Gelen: [ <b class="forestgreen">${liste.join(', ') ?? ''}</b> ]</div>`)
							.appendTo(parent)
					}
		
					if (secimler && !collapsed) {
						let e = { liste: [] }
						for (let [k, s] of secimler) {
							if (k != 'tarihAralik')        // 'donem' ozetBilgi gösteriminde zaten gerekirse tarihAralık bilgisi de var)
								s.ozetBilgiHTMLOlustur(e)
						}
						let ozetBilgiHTML = e.liste?.filter(x => !!x).join(' ')
						if (ozetBilgiHTML) {
							let elmSecimBilgi = $(`<div class="absolute parent secimBilgi" style="top: -5px; right: 0; margin: 0"/>`)
							$(ozetBilgiHTML).appendTo(elmSecimBilgi)
							elmSecimBilgi.appendTo(parent)
						}
					}
					
					if (!empty(parent.children()))
						parent.appendTo(container)
				}
				
				if (!empty(error)) {
					let liste = values(error)?.map(_ => _.aciklama) ?? []
					$(`<div class="subeler error fs-90"><u class="orangered"><b>HATALI</b>:</u> [ <b class="firebrick">${liste.join(', ') ?? ''}</b> ]</div>`)
						.appendTo(container)
				}
				
				return container
			}

			add(...items) {
				;items.forEach(v =>
					this.set(null, v))
				return this
			}
			get(idOrItem) {
				id = idOrItem?.id ?? idOrItem
				return this.id2Item[id]
			}
			set(id, idOrItem) {
				if (idOrItem == null)
					return this.delete(id)
				
				id ??= idOrItem.id ?? newGUID()
				idOrItem.id ??= id
				this.id2Item[id] = idOrItem
				return this
			}
			delete(idOrItem) {
				let { id2Item: d } = this
				id ??= idOrItem?.id
				if (id == null)
					return undefined
				let v = d[id]
				delete d[id]
				return v
			}
			clear() {
				this.id2Item = {}
				return this
			}
			keys() { return keys(this.id2Item) }
			values() { return values(this.id2Item) }
			entries() { return entries(this.id2Item) }
			[Symbol.iterator]() { return entries(this.id2Item)[Symbol.iterator] }

			setId(v) { this.id = v; return this }
			setTitle(v) { this.title = v; return this }
			setExpanded() { this.expanded = true; return this }
			setCollapsed() { this.expanded = false; return this }
			setContent(v) { this.content = v; return this }
			setCollapsedContent(v) { this.collapsedContent = v; return this }
			duzenleIlkIslemi(v) { this.duzenleIlk = v; return this }
			duzenleSonIslemi(v) { this.duzenleSon = v; return this }
			initContentIlkIslemi(v) { this.initContentIlk = v; return this }
			initContentSonIslemi(v) { this.initContentSon = v; return this }
			setHeight(v) { this.height = v; return this }
			fullHeight() { return this.setHeight('full') }
		}
	
		this.PanelDetay = class PanelDetay extends CKodVeAdi {
			get id() { return this.kod } set id(v) { this.kod = v }
			get title() { return this.aciklama } set title(v) { this.aciklama = v }
			
			constructor(e = {}) {
				super(e)
				mergeInto(e, this,
					'id', 'title', 'userData', 'height', 'widgetArgsDuzenle')
			}
			run() { return this }

			setId(v) { this.id = v; return this }
			setTitle(v) { this.title = v; return this }
			setUserData(v) { this.userData = v; return this }
			setHeight(v) { this.height = v; return this }
			fullHeight() { return this.setHeight('full') }
			widgetArgsDuzenleIslemi(v) { this.widgetArgsDuzenle = v; return this }
		}
		
		this.PanelGrid = class PanelGrid extends this.PanelDetay {
			static get timeout() { return DRapor_PratikSatis.timeout }

			constructor(e = {}) {
				super(e)
				mergeInto(e, this,
					'toplamBelirtec', 'cssDuzenle', 'tabloKolonlari')
				;['source', 'query'].forEach(k => {
					let v = e[k]
					v = getFunc(v)
					if (isFunction(v))
						e[k] = v
						// e[k] = v.bind(this)
				})
				
			}
			run(e = {}) {
				super.run(e)
				let { id, userData, widgetArgsDuzenle, toplamBelirtec } = this
				let { cssDuzenle, tabloKolonlari, source, query } = this
				let { subeKod, tanimPart = e.sender, rfb, form } = e
				let subemi = subeKod != null		
				let gridId = [id, subeKod]
					.filter(Boolean)
					.join('_')

				let cellClassName = (...rest) => {
					let result = this.class.gridCSSHandler(...rest) ?? []
					cssDuzenle?.call(this, { ...e, ...rest, result })
					return result
				}
				
				let fbd_grid = form.addGridliGosterici(gridId)
					.addStyle_fullWH(null)
					.noAnimate().setUserData(userData)
					.rowNumberOlmasin().notAdaptive()
					.setToplamYapi({ etiket: { belirtec: toplamBelirtec } })
					.widgetArgsDuzenleIslemi(_e => {
						let { args } = _e
						_e = { ...e, ..._e, args }
						extend(args, this.class.getGridOrtakArgs(_e))
						widgetArgsDuzenle?.call(this, _e)
					})
					.setTabloKolonlari(_e => {
						_e = { ...e, ..._e }
						let defs = getFuncValue.call(this, tabloKolonlari, _e)
							?.filter(Boolean) ?? []
						;defs.forEach(def =>
							def.cellClassName ??= cellClassName)
						return defs
					})
					.setSource(async _e => {
						let { layout } = _e.builder ?? fbd_grid ?? {}
						_e = { ...e, ..._e }
						
						let recs
						if (subemi) {
							let { layout: gridLayout } = fbd_grid
							let { sube2Recs = {} } = tanimPart.id2Sube2Recs?.[id]
							recs = sube2Recs[subeKod]
							let uygunmu = recs != null
							gridLayout?.(uygunmu ? 'removeClass' : 'addClass')('jqx-hidden')
						}
						else {
							recs = await getFuncValue.call(this, source, _e)
							if (recs == null) {
								let stm = await getFuncValue.call(this, query, _e)
								recs = await this.getGridData({ ..._e, query: stm })
							}
						}

						return recs ?? []
					})
				
				return fbd_grid
			}

			static getGridOrtakArgs() {
				return {
					rowsHeight: 30, columnsMenu: false, showGroupsHeader: true,
					columnsReorder: false, selectionMode: 'multiplerowsextended',
					autoShowLoadElement: false,
					groupsRenderer: (text, group, expanded, groupInfo) => {
						let { subItems = [] } = groupInfo ?? {}
						subItems = subItems?.filter(r => !r.totalsrow)
						let topBedel = topla(r => r.hasilat ?? r.bedel, subItems)
						return (
							`<div class="grid-cell-group full-wh relative">` +
								`<div class="aciklama float-left">${group}</div>` +
								`<div class="bedel fs-100 bold royalblue float-right" style="margin-right: 23px">${bedelToString(topBedel)}</div>` +
							`</div>`
						)
					}
				}
			}
			static gridCSSHandler(sender, rowIndex, belirtec, value, rec, prefix) {
				let result = [belirtec]
				if (rec._toplam)
					result.push('_toplam')
				return result.join(' ')
			}
			async getGridData(e = {}) {
				let { buDB, dbListe } = app
				let { DefaultWSHostName_SkyServer: defHost } = config.class
				let { class: { timeout } } = this
				let { tanimPart = {}, builder: fbd = {} } = e
				let { inst = tanimPart.inst ?? {}, acc = tanimPart.acc ?? {} } = e
				let { gridPart = fbd.part ?? {}, query, params } = e
				let { tabloKolonlari = fbd.tabloKolonlari ?? gridPart.tabloKolonlari } = e
				let { layout: rootLayout } = tanimPart
				let { id: gridId, layout: gridLayout } = fbd
				let { id2Panel = {} } = acc

				let panelId = gridLayout?.parents('.accordion.item').data('id')
				let accItem = id2Panel[panelId] ?? {}
				let { layout: panelLayout } = accItem ?? {}
				//if (accItem)
				//	accItem.userData ??= {}

				let id2Sube2Recs = tanimPart.id2Sube2Recs ??= {}
				let id2SubeResult = tanimPart.id2SubeResult ??= {}
				let subeResult = id2SubeResult[panelId] ??= {}
				;['success', 'error'].forEach(k =>
					subeResult[k] = {})
		
				clearTimeout(tanimPart._timer_tazeleIndicatorClear)
				rootLayout?.addClass('refreshing')
				panelLayout?.removeClass('has-error')
				try {
					if (query?.sentDo) {
						let e = { ...arguments[0], stm: query }
						delete e.query
						inst.stmSonIslemler?.(e)
						query = e.query = e.stm
						params = e.params = e.params
					}
			
					await tanimPart?._promise_getSubeTanimlari
					let { praUzakSubeVerisi } = app.params?.dRapor ?? {}
					if (!praUzakSubeVerisi)
						return await query.execSelect({ timeout, params })
			
					let db2Kod2Def = await this.getSubeTanimlari(...arguments)
					if (empty(db2Kod2Def))
						return await query.execSelect({ timeout, params })
			
					let { keyFields, sortFields, noSort } = fbd.userData ?? {}
					let cd = { sabit: {}, toplam: {} }
					;{
						if (tabloKolonlari) {
							;tabloKolonlari.forEach(c => {
								let { belirtec, aggregates } = c
								let agg = makeArray(aggregates)
								let selector = agg?.includes('sum') ? 'toplam' : 'sabit'
								cd[selector][belirtec] = c
							})
						}
					}
					
					tanimPart._promise_getGridData = defer()
					try {
						;{
							let { _promises_uzakVeri: promises } = tanimPart
							if (!empty(promises))
								await delay(5_000)
						}
						/*;{
							let { _promises_uzakVeri: promises } = tanimPart
							;promises?.flat?.()?.forEach(p =>
								p?.abort?.())
							lastAjaxObj?.abort?.()
							delete tanimPart._promises_uzakVeri
						}*/
				
						if (query?.sentDo) {
							for (let { where: wh } of query) {
								;wh.liste = wh.liste.filter(v =>
									!( v?.startsWith?.('sub.') || v?.saha?.endsWith?.('bizsubekod')) )
							}
						}
						
						let delayMS = 100
						let promises = []
						let _promises_uzakVeri = tanimPart._promises_uzakVeri = []
						for (let [db, kod2Def] of entries(db2Kod2Def))
						for (let [subeKod, def] of entries(kod2Def)) {
							let pr = (async () => {
								if (delayMS)
									await delay(delayMS)
								delayMS *= 2.5
								try {
									let _pr = remoteProc({
										...def,
										proc: () =>
											query.execSelect({ timeout, params })
									})
									_promises_uzakVeri.push(_pr)
									
									let { aciklama: subeAdi, port, db } = def
									let recs = await _pr
									;recs?.forEach(r => {
										if (r.subeKod !== undefined)
											extend(r, { subeKod, subeAdi })
									})
									subeResult.success[subeKod] ??= def
									
									if (config.dev) {
										console.group(`${port}: ${db}`)
										console.table(recs)
										console.info(query?.getQueryYapi() ?? query)
										console.groupEnd()
									}
									
									return { def, recs }
								}
								catch (error) {
									subeResult.error[subeKod] ??= def
									throw { def, error }
								}
							})()
							;promises.push(pr)
						}
			
						let getKey = (r, keyFields, sortFields) => {
							if (keyFields)
								keyFields = makeArray(keyFields)
							if (sortFields)
								sortFields = makeArray(sortFields)
							
							if (empty(keyFields))
								keyFields = sortFields
							if (empty(keyFields))
								keyFields = keys(cd.sabit)
							
							return keyFields
								.map(k => String(r[k]))
								.join('\t')
						}
						let all = ( await promiseAllSet(promises) )
						subeResult.sonTS = now()                           // bu panel item için son veri çekme zamanı
		
						let key2Rec = new Map()
						let errors = tanimPart._errors ??= []
						let sube2Recs = id2Sube2Recs[gridId] ??= {}
						for (let { status: s, reason, value: result } of all) {
							if (s == 'rejected') {
								let { def = {}, error: err } = reason
								let { https, host, port, url, sql, db = {} } = def
								db ??= sql?.db
								url ??= `${https ? 'https' : 'http'}://${host}:${port}`
								let origin = !host || host == defHost ? String(port) : `${host}:${port}`
								let title = `${origin} | ${db}`
								let content = getErrorText(err, url)
								errors.push({ title, content, err })
								continue
							}
		
							let { recs, def } = result
							if (empty(recs))
								continue

							let { kod: subeKod } = def ?? {}
							sube2Recs[subeKod] = extend(true, [], recs)    // bu grid, bu şube için orj recs (deepCopy)
							;recs.forEach(bu => {
								let k = getKey(bu, keyFields)
								if (!key2Rec.has(k))
									key2Rec.set(k, bu)
								else {
									let diger = key2Rec.get(k)
									;keys(cd.toplam).forEach(b =>
										diger[b] = Number(diger[b]) + Number(bu[b]))
								}
							})
						}
						delete tanimPart._promises_uzakVeri
			
						let recs = arrayFrom(key2Rec.values())
						if (!noSort) {
							recs.sort((a, b) =>
								getKey(a, keyFields, sortFields).localeCompare(
									getKey(b, keyFields, sortFields))
							)
						}
		
						let e = { ...arguments[0], subeResult, recs }
						setTimeout(() => {
							acc?.render()
							;{
								let hasErr = !empty(errors)
								let { layout } = acc.activePanel?.item ?? {}
								setTimeout(() => layout?.[hasErr ? 'addClass' : 'removeClass']('has-error'), 10)
							}
						}, 100)
						return recs
					}
					finally { tanimPart._promise_getGridData?.resolve() }
				}
				finally {
					tanimPart._timer_tazeleIndicatorClear = setTimeout(() =>
						rootLayout?.removeClass('refreshing'), 100)
				}
			}

			setToplamBelirtec(v) { this.toplamBelirtec = v; return this }
			cssDuzenleIslemi(v) { this.cssDuzenle = v; return this }
			setTabloKolonlari(v) { this.tabloKolonlari = v; return this }
			setSource(v) { this.source = v; return this }
			setQuery(v) { this.query = v; return this }
		}
	}
}
