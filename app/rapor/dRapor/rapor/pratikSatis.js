class DRapor_PratikSatis extends DRaporMQ {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return PratikSatisHareketci }
	// static get kategoriKod() { return '' } static get kategoriAdi() { return '' }
	static get oncelik() { return this.hareketciSinif.oncelik }
	static get kategoriKod() { return this.hareketciSinif.kategoriKod } static get kategoriAdi() { return this.hareketciSinif.kategoriAdi }
	static get kod() { return this.hareketciSinif.kod } static get aciklama() { return this.hareketciSinif.aciklama }
	get uygunmu() { return this.class.uygunmu } static get uygunmu() { return this.hareketciSinif.uygunmu }
	static get secimSinif() { return DonemselSecimler } static get sadeceTanimmi() { return true }
	static get kolonFiltreKullanilirmi() { return false } static get bulFormKullanilirmi() { return true }
	get timeout() { return config.dev ? 5_000 : 13_000 }
	static get otoTazele_minDk() { return config.dev ? .05 : .1 }
	// static get vioAdim() { return 'MH-R' }

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
		fbd.addStyle(
			`$elementCSS {
				position: fixed;
				top: 80px !important;
				right: 5px !important;
				pointer-events: none !important
			}
			$elementCSS > .sag {
				pointer-events: auto !important;
				z-index: 1050 !important
			}
			@media (max-width: 700px) {
				$elementCSS { right: -5px !important }
			}
			@media (max-width: 550px) {
				$elementCSS { top: 63px !important; right: -5px !important }
				$elementCSS:not(:has(:focus)):not(:has(:active)) { opacity: .4 }
			}
			$elementCSS #seviyeAc.jqx-fill-state-normal { background-color: forestgreen !important }
			$elementCSS #seviyeKapat.jqx-fill-state-normal { background-color: firebrick !important }`
		)
	}
	static tanimPart_islemTuslariDuzenle(e) {
		super.tanimPart_islemTuslariDuzenle(e)
		let { sender: tanimPart, liste, part: { ekSagButonIdSet: sagSet } } = e
		let { inst } = tanimPart
		extend(e, { tanimPart, inst })
		liste = e.liste = liste.filter(_ => _.id != 'tamam')
		let items = [
			{ id: 'seviyeAc', text: 'Sev. Aç', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: true }) },
			{ id: 'seviyeKapat', text: 'Sev. Kapat', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: false }) },
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
			.addStyle(`
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
			)
			.onAfterRun(({ builder: { part }}) =>
				tanimPart.acc = e.acc = part)
		
		rfb.onAfterRun(() =>
			inst.onAfterRun(e))
	}
	async onAfterRun({ tanimPart }) {
		await this.accDuzenle(...arguments)
		let {acc} = tanimPart
		await this.acc_onCollapse({ ...arguments[0], acc })
		await this.acc_onExpand({ ...arguments[0], acc })
	}
	tanimPart_hizliBulIslemi({ sender: tanimPart, tokens }) {
		super.tanimPart_hizliBulIslemi(...arguments)
		let sender = tanimPart, {acc: { layout }} = tanimPart
		let elms = Array.from(layout.find('.grid.part'))
		elms.forEach(elm => {
			let gridPart = $(elm).data('part')
			if (gridPart) {
				gridPart.filtreTokens = tokens
				gridPart.tazele(...arguments)
			}
		})
		return false
	}
	async accDuzenle(e) {
		let { tanimPart, acc } = e
		let getRFB = layout => {
			return new RootFormBuilder()
				.setPart(tanimPart)
				.setLayout(layout)
				/*.addStyle(
					`$elementCSS .jqx-grid [role = row] > .toplam { font-size: 110% !important; font-weight: bold !important }
					 $elementCSS .jqx-grid [role = row] > .toplam:not(.jqx-grid-cell-selected) { background-color: lightpink !important }`
				)*/
		}
		acc
			.add({
				id: 'ozet', title: 'Özet', expanded: true,
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_ozet({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this._acc_initCollapsedContent_ortak({ ...e, item, layout, rfb: getRFB(layout) })
			})
			.add({
				id: 'tahsilat', title: 'Tahsilat', expanded: false,
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_tahsilat({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this._acc_initCollapsedContent_ortak({ ...e, item, layout, rfb: getRFB(layout) })
			})
			.add({
				id: 'kdv', title: 'KDV', expanded: false,
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_kdv({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this._acc_initCollapsedContent_ortak({ ...e, item, layout, rfb: getRFB(layout) })
			})
			.add({
				id: 'kasiyer', title: 'Kasiyer', expanded: false,
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_kasiyer({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this._acc_initCollapsedContent_ortak({ ...e, item, layout, rfb: getRFB(layout) })
			})
			.add({
				id: 'sube', title: 'Şube', expanded: false,
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_sube({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this._acc_initCollapsedContent_ortak({ ...e, item, layout, rfb: getRFB(layout) })
			})
			.add({
				id: 'satis', title: 'Ürün Satışı', expanded: false,
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_satis({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this._acc_initCollapsedContent_ortak({ ...e, item, layout, rfb: getRFB(layout) })
			})
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
			;{
				altForm.addGridliGosterici('ozet')
					.noAnimate()
					.setUserData({ noSort: true })
					.addStyle_fullWH(null, 240)
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
					.noAnimate()
					.setUserData({ noSort: true })
					.addStyle_fullWH(null, 200)
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
		}

		// özel aralık
		;{
			form.addGridliGosterici('ozel')
				.noAnimate()
				.setUserData({ noSort: true })
				.addStyle_fullWH(null, 180)
				.addStyle(`$elementCSS { min-width: 200px !important; max-width: 440px !important }`)
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
				.noAnimate()
				.setUserData({ sortFields: ['oncelik', 'aciklama'] })
				.addStyle_fullWH(null)
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
				.noAnimate()
				.setUserData({ keyFields: ['oran'], noSort: true })
				.addStyle_fullWH(null, 230)
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
				.noAnimate()
				.addStyle_fullWH(null, 'calc(var(--full) - var(--acc-header-height) + 35px)')
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
	_acc_initCollapsedContent_ortak({ tanimPart, islem, acc, item, layout, rfb }) {
		let { secimler } = this, { collapsed, userData = {} } = item
		let { subeDefs = {} } = userData
		let { dbListe } = app
		let container = $(`<div/>`)
		if (!collapsed) {
			//let parent = $(`<div class="flex-row"/>`)
			if (!empty(subeDefs.success)) {
				let liste = subeDefs.success?.map(_ => _.aciklama) ?? []
				$(`<div class="subeler success fs-90">Mevcut: [ <b class="forestgreen">${liste.join(', ') ?? ''}</b> ]</div>`)
					.appendTo(container)
			}
			if (!empty(subeDefs.error)) {
				let liste = subeDefs.error?.map(_ => _.aciklama) ?? []
				$(`<div class="subeler error fs-90"><u class="orangered"><b>HATALI</b>:</u> [ <b class="firebrick">${liste.join(', ') ?? ''}</b> ]</div>`)
					.appendTo(container)
			}
			/*if (parent.children().length) {
				$(`<span class="separator lightgray"> | </span>`).appendTo(parent)
				parent.appendTo(container)
			}*/
		}
		
		if (secimler && !collapsed) {
			let e = { liste: [] }
			for (let [k, s] of secimler) {
				if (k != 'tarihAralik')        // 'donem' ozetBilgi gösteriminde zaten gerekirse tarihAralık bilgisi de var)
					s.ozetBilgiHTMLOlustur(e)
			}
			let ozetBilgiHTML = e.liste?.filter(x => !!x).join(' ')
			if (ozetBilgiHTML) {
				let container = $(`<div class="secimBilgi"/>`)
				$(ozetBilgiHTML).appendTo(container)
			}
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
		let grids = Array.from(layout.find('.grid.part'))
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
	tazeleIstendi({ tanimPart } = {}) {
		let { acc = {} } = tanimPart ?? {}
		let { activePanel: { item } = {} } = acc
		if (item) {
			let { contentLayout: layout } = item
			let elms = Array.from(layout.find('.grid.part'))
			elms.forEach(elm =>
				$(elm).data('part')?.tazele())
		}
		acc?.render()
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
	otoTazele_timerProc(e = {}) {
		let { class: { otoTazele_minDk } } = this
		let { tanimPart = e.sender, acc: { hasActivePanel } = {} } = e, { inst } = tanimPart
		let { _otoTazeleDk: otoTazeleDk, _inTazeleProc, _otoTazeleDisabled } = tanimPart
		let { activeWndPart } = app, { appActivatedFlag } = window
		if (_otoTazeleDisabled || activeWndPart != tanimPart)
			return
		if (!otoTazeleDk)
			otoTazeleDk = Math.max(otoTazeleDk, otoTazele_minDk)
		if (!(otoTazeleDk && window.appActivatedFlag) || _inTazeleProc || !hasActivePanel) {
			if (_inTazeleProc)
				setTimeout(() => tanimPart._inTazeleProc = false, 1_000)
			return
		}
		tanimPart._inTazeleProc = true
		inst.tazeleIstendi({ ...e, action: 'otoTazele' })
		setTimeout(() => tanimPart._inTazeleProc = false, 1_000)
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

	async getGridData({ tanimPart, acc, query, params, tabloKolonlari, builder: fbd, gridPart } = {}) {
		let { timeout } = this
		let { layout } = tanimPart
		let { buDB, dbListe } = app

		let { activePanel: { item: accItem = {} } = {} } = acc ?? {}
		let { layout: panelLayout } = accItem
		let userData = accItem.userData ??= {}
		panelLayout?.removeClass('has-error')
		let ud_subeDefs = userData.subeDefs = { success: [], error: [] }

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
					let selector = (
						agg?.includes('sum') ? 'toplam' :
						empty(agg) ? 'sabit' : null
					)
					if (selector)
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
						await delay(1_000)
				}
				;{
					let { _promises_uzakVeri: promises } = tanimPart
					;promises?.flat?.()?.forEach(p =>
						p?.abort?.())
					lastAjaxObj?.abort?.()
					delete tanimPart._promises_uzakVeri
				}
		
				if (query?.sentDo) {
					for (let { where: wh } of query) {
						;wh.liste = wh.liste.filter(v =>
							!(v?.startsWith?.('sub.') || v?.saha?.endsWith?.('bizsubekod')))
					}
				}
				
				let delayMS = 50
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
							let recs = await _pr
							
							let { aciklama: subeAdi, port, db } = def
							;recs?.forEach(r => {
								if (r.subeKod !== undefined)
									extend(r, { subeKod, subeAdi })
							})
							ud_subeDefs.success.push(def)
							
							if (config.dev) {
								console.group(`${port}: ${db}`)
								console.table(recs)
								console.info(query?.getQueryYapi() ?? query)
								console.groupEnd()
							}
							
							return recs
						}
						catch (error) {
							ud_subeDefs.error.push(def)
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
				let key2Rec = new Map()
				let errors = tanimPart._errors ??= []
				for (let { status: s, reason, value: recs } of all) {
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
					
					if (empty(recs))
						continue
		
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
	
				let recs
				;{
					recs = Array.from(key2Rec.values())
					if (!noSort) {
						recs.sort((a, b) =>
							getKey(a, keyFields, sortFields).localeCompare(getKey(b, keyFields, sortFields)))
					}
				}
				
				/*clearTimeout(tanimPart._timer_errors)
				tanimPart._timer_errors = setTimeout(() => {
					let { _errors: errors } = tanimPart
					if (!empty(errors)) {
						let inner = errors.map(({ title, content }) =>
							`<li><span class="firebrick bold">${title}</span>: <span>${content}</span></li>`)
						let html = `<ul>${inner.join('<br/>\n')}</ul>`
						hConfirm(html, 'Uzak Şube Servis Erişim Sorunu')
					}
					delete tanimPart._errors
				}, 500)*/
	
				acc?.render()
				;{
					let hasErr = !empty(errors)
					let { item: { layout } = {} } = acc?.activePanel ?? {}
					layout?.[hasErr ? 'addClass' : 'removeClass']('has-error')
				}
				
				return recs
			}
			finally { _promise_getGridData?.resolve() }
		}
		finally {
			tanimPart._timer_tazeleIndicatorClear = setTimeout(() =>
				layout?.removeClass('refreshing'), 100)
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
	

	/*
		try { ctable(await `
			select bizsubekod kod, offsubebhttpsmi https, offsubeipadres host, offsubeportno port,
					offsubesqlserver server, offsubevtadi db,
					offsubesqluser wsUser, offsubesqlpasswd wsPass
				from marsubeparam
				where bizsubekod <> '' and offsubeipadres <> ''`.execSelect()) }
		catch (ex) { cerr(ex) }

		let port = ??, user = '??', pass = '??'
		let sql = { db: '??' }
		let session = user || pass ? { user, pass } : undefined
		
		let query = `select name from sys.databases`
		try {
			ctable(remoteProc(
				{ port, pass, sql, session },
				({ args }) => query.execSelect(args)
			))
		}
		catch (ex) { cerr(ex) }
	*/
}
