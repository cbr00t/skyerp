
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
	// static get vioAdim() { return 'MH-R' }

	uiGirisOncesiIslemler(e) {
		let {sender: tanimPart} = e, {sinifAdi: title} = this.class
		e.islem = tanimPart.islem = 'izle'
		extend(tanimPart, { title })
		this.secimlerOlustur(e)
		return super.uiGirisOncesiIslemler(e)
	}
	secimlerOlustur({ sender: tanimPart } = {}) {
		let secimler = new DonemselSecimler()
		secimler
			.addKA('sube', DMQSube, 'fis.bizsubekod', 'sub.aciklama')
			.addKA('kasiyer', DMQKasiyer, 'fis.kasiyerkod', 'kas.aciklama')
		extend(this, { secimler })
		secimler.whereBlockEkle(({ secimler: sec, sent, where: wh }) => {
			sent
				.fromIliski('bizsubekod sub', 'fis.bizsubekod = sub.kod')
				.fromIliski('kasiyer kas', 'fis.kasiyerkod = kas.kod')
			wh
				.fisSilindiEkle()
				.add(new MQOrClause([`fis.ozelisaret <> '*'`, `fis.fisanatipi = 'YM'`]))
		})
	}
	static rootFormBuilderDuzenle_islemTuslari({ fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		fbd.addStyle(
			`$elementCSS { pointer-events: none !important }
			 $elementCSS > .sag { pointer-events: auto !important }
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
			{ id: 'seviyeAc', text: 'Seviye Aç', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: true }) },
			{ id: 'seviyeKapat', text: 'Seviye Kapat', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: false }) },
			{ id: 'secimler', handler: _e => inst.secimlerIstendi({ ..._e, ...e }) },
			{ id: 'tazele', handler: _e => inst.tazeleIstendi({ ..._e, ...e }) }
		]
		liste = e.liste = [...items, ...liste]
		extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static rootFormBuilderDuzenle(e = {}) {
		super.rootFormBuilderDuzenle(e)
		let { sender: tanimPart, islem, inst, rootBuilder: rfb, tanimFormBuilder: tanimForm } = e
		extend(e, { tanimPart })
		tanimForm.addAccordion('acc')
			.addStyle_fullWH()
			.addStyle(
				`$elementCSS .secimBilgi { margin-right: 250px }
				 $elementCSS .secimBilgi > * { background-color: whitesmoke !important }`
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
		}
		acc
			.add({
				id: 'genel', title: 'Genel', expanded: true,
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_genel({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this.acc_initCollapsedContent_genel({ ...e, item, layout, rfb: getRFB(layout) })
			})
			.add({
				id: 'satis', title: 'Ürün Satışı',
				content: ({ item, item: { contentLayout: layout } }) =>
					setTimeout(() => this.acc_initContent_satis({ ...e, item, layout, rfb: getRFB(layout) }), 100),
				collapsedContent: ({ sender: acc, item, item: { contentLayout: layout } }) => 
					this.acc_initCollapsedContent_satis({ ...e, item, layout, rfb: getRFB(layout) })
			})
		acc.onCollapse(_e => this.acc_onCollapse({ ...e, ..._e }))
		acc.onExpand(_e => this.acc_onExpand({ ...e, ..._e }))
	}
	async acc_initContent_genel({ tanimPart, islem, acc, item, layout, rfb }) {
		rfb.addStyle_fullWH()
		;{
			let form = rfb.addFormWithParent().yanYana()
				.addStyle_fullWH(null, 250)
			form.addGridliGosterici('ozet')
				.addStyle_fullWH(500)
				.rowNumberOlmasin().notAdaptive()
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, { rowsHeight: 35 })
				)
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'tipText', text: ' ', genislikCh: 16, filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 11, filterType: 'checkedlist' }).tipNumerik(),
					new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 20 }).tipDecimal_bedel()
				])
				.setSource(async e => {
					let uni = new MQUnionAll()
					;{
						let sent = new MQSent(), {where: wh, sahalar} = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
						wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
						sahalar.add(
							`(case` +
								` when fis.biptalmi > 0 then 11` +
								` when fis.efayrimtipi = 'E' then 1` +
								` when fis.efayrimtipi = 'A' then 2` +
								` when fis.fisanatipi = 'YM' then 4` +
								` when fis.ozelisaret = '*' then 10` +
								` else 3` +
							` end) oncelik`,
							`(case` +
								` when fis.biptalmi > 0 then 'IPT'` +
								` when fis.efayrimtipi = 'E' then 'EFAT'` +
								` when fis.efayrimtipi = 'A' then 'EARS'` +
								` when fis.fisanatipi = 'YM' then 'YMK'` +
								` when fis.ozelisaret = '*' then '*'` +
								` else 'DIG'` +
							` end) tip`,
							`(case` +
								` when fis.biptalmi > 0 then 'İptal Fiş'` +
								` when fis.efayrimtipi = 'E' then 'e-Fatura'` +
								` when fis.efayrimtipi = 'A' then 'e-Arşiv'` +
								` when fis.fisanatipi = 'YM' then 'Yemek Kartı'` +
								` when fis.ozelisaret = '*' then 'İşaretli'` +
								` else 'Diğer'` +
							` end) tipText`,
							`(case when fis.biptalmi > 0 then 'X' else '' end) almaText`,
							`COUNT(*) fisSayi`, `SUM(fis.fissonuc) bedel`
						)
						sent.groupByOlustur()
						uni.add(sent)
					}
					;{
						let sent = new MQSent(), {where: wh, sahalar} = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
						wh.add(new MQOrClause([
							`har.biptalmi > 0`, `har.bikrammi > 0`]))
						sahalar.add(
							`(case when har.biptalmi > 0 then 1 else 99 end) oncelik`,
							`(case when har.biptalmi > 0 then 'IHAR' when har.bikrammi > 0 then 'IKR' else '' end) tip`,
							`(case when har.biptalmi > 0 then 'İPTAL Satırı' when har.bikrammi > 0 then 'İkram Satırı' else '??' end) tipText`,
							`'X' almaText`, `COUNT(*) fisSayi`, `SUM(ROUND(har.miktar * har.kdvlifiyat, 2)) bedel`
						)
						sent.groupByOlustur()
						uni.add(sent)
					}
					;{
						let sent = new MQSent(), {where: wh, sahalar} = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
						wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
						wh.inDizi(['MS', 'DG'], 'fis.fisanatipi')          // 'YM' alınmaz
						sahalar.add(
							`(case fis.fisanatipi when 'MS' then 1 when 'DG' then 2 else 99 end) oncelik`,
							`(case fis.fisanatipi when 'MS' then 'MUS' when 'DG' then 'DADR' else '' end) tip`,
							`(case fis.fisanatipi when 'MS' then 'Müşterili' when 'DG' then 'Değişken Adres' else '??' end) tipText`,
							`'X' almaText`, `COUNT(*) fisSayi`, `SUM(ROUND(har.miktar * har.kdvlifiyat, 2)) bedel`
						)
						sent.groupByOlustur()
						uni.add(sent)
					}
					let stm = new MQStm({ sent: uni, orderBy: ['oncelik'] })
					return await app.sqlExecSelect(stm)
				})
			form.addGridliGosterici('ozel')
				.addStyle_fullWH(430, 130)
				.addStyle(`$elementCSS { min-width: 200px !important; max-width: 450px !important }`)
				.rowNumberOlmasin().notAdaptive()
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, { rowsHeight: 30 })
				)
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'text', text: 'Özel Aralık', genislikCh: 13, filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'hasilat', text: 'Hasılat (Kdvli)', genislikCh: 20 }).tipDecimal_bedel(),
					new GridKolon({ belirtec: 'oran', text: '%', genislikCh: 8 }).tipNumerik()
				])
				.setSource([])
		}
		;{
			let form = rfb.addFormWithParent().yanYana()
				.addStyle_fullWH(null, 350)
			form.addGridliGosterici('tahsilat')
				.addStyle_fullWH(500)
				.rowNumberOlmasin().notAdaptive()
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, { rowsHeight: 30 })
				)
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'tahSekliAdi', text: 'Tahsilat', genislikCh: 26, filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 23 }).tipDecimal_bedel()
				])
				.setSource(async e => {
					let sent = new MQSent(), {where: wh, sahalar} = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorantahsil' })
					sent.har2TahSekliBagla()
					sahalar.add(
						'har.tahseklino tahSekliNo', 'tsek.aciklama tahSekliAdi',
						`(case tsek.tahsiltipi when 'NK' then 1 when 'PS' then 2 else 9 end) oncelik`,
						'SUM(har.bedel) bedel'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['oncelik', 'tahSekliAdi'] })
					return await app.sqlExecSelect(stm)
				})
			form.addGridliGosterici('matrahKdv')
				.addStyle_fullWH(430, 180)
				.rowNumberOlmasin().notAdaptive()
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, { rowsHeight: 30 })
				)
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'text', text: ' ', genislikCh: 8, filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'matrah', text: 'Matrah', genislikCh: 18 }).tipDecimal_bedel(),
					new GridKolon({ belirtec: 'kdv', text: 'Kdv', genislikCh: 15 }).tipDecimal_bedel()
				])
				.setSource(async e => {
					let sent = new MQSent(), {where: wh, sahalar} = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
					wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
					sahalar.add(
						`fis.ozelisaret ozelIsaret`, 'har.kdvorani oran',
						'SUM(har.kdvsizbedel) matrah', 'SUM(har.kdv) kdv'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['oran', 'ozelIsaret'] })
					let recs = await app.sqlExecSelect(stm)
					recs.forEach(rec =>
						rec.text = `%${rec.oran}`)
					return recs
				})
		}
		rfb.run()
	}
	acc_initCollapsedContent_genel({ tanimPart, islem, acc, item, layout, rfb }) {
		return this._acc_initCollapsedContent_ortak(...arguments)
	}
	async acc_initContent_satis({ tanimPart, islem, acc, item, layout, rfb }) {
		let {secimler: sec} = this
		let {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs
		;{
			rfb.addGridliGosterici('satisGrid')
				.addStyle_fullWH()
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, { showGroupsHeader: true, rowsHeight: 50 })
				)
				.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
					grid.jqxGrid('groups', ['grupAdi']))
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'stokAdi', text: 'Stok', filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 13, filterType: 'checkedlist' }).tipDecimal(),
					new GridKolon({ belirtec: 'brm', text: ' ', genislikCh: 5, filterType: 'checkedlist' }),
					new GridKolon({ belirtec: 'hasilat', text: 'Hasılat (Kdvli)', genislikCh: 19 }).tipDecimal_bedel(),
					new GridKolon({ belirtec: 'grupAdi', text: 'Grup', genislikCh: 20, filterType: 'checkedlist' })
				])
				.setSource(async e => {
					let getSatisStm = iade => {
						let sent = new MQSent(), {where: wh, sahalar} = sent
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
					return [
						...await app.sqlExecSelect(getSatisStm(false)),
						...await app.sqlExecSelect(getSatisStm(true))
					]
				})
		}
		rfb.run()
	}
	acc_initCollapsedContent_satis({ tanimPart, islem, acc, item, layout, rfb }) {
		return this._acc_initCollapsedContent_ortak(...arguments)
	}
	_acc_initCollapsedContent_ortak({ tanimPart, islem, acc, item, layout, rfb }) {
		let {secimler} = this, {collapsed} = item
		if (secimler && !collapsed) {
			let e = { liste: [] }
			for (let [k, s] of secimler) {
				if (k != 'tarihAralik')        // 'donem' ozetBilgi gösteriminde zaten gerekirse tarihAralık bilgisi de var)
					s.ozetBilgiHTMLOlustur(e)
			}
			let ozetBilgiHTML = e.liste?.filter(x => !!x).join(' ')
			if (ozetBilgiHTML) {
				let container = $(`<div class="secimBilgi"/>`)
				container.html(ozetBilgiHTML)
				return container
			}
		}
	}
	acc_onCollapse({ tanimPart, acc }) {
		let {activePanelId: id} = acc
		let targetId = id == 'genel' ? 'satis' : 'genel'
		acc.expand(targetId)
	}
	acc_onExpand({ tanimPart, acc }) {
		setTimeout(() => {
			let {activePanelId: id} = acc, {islemTuslari} = tanimPart
			let btns = islemTuslari.find('#seviyeAc, #seviyeKapat')
			let selector = id == 'satis' ? 'removeClass' : 'addClass'
			btns[selector]('jqx-hidden')
		}, 1)
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
	tazeleIstendi({ tanimPart }) {
		let {acc, acc: { layout }} = tanimPart
		let elms = Array.from(layout.find('.grid.part'))
		elms.forEach(elm =>
			$(elm).data('part')?.tazele())
		acc.render()
	}

	baslikSentDuzele(e = {}) {
		let { sent, sent: { where: wh, sahalar }, harTable, iade = e.iademi } = e
		sent.fisHareket('restoranfis', harTable)
		wh
			.add(`fis.kapanmazamani IS NOT NULL`, 'fis.biptalmi = 0')
			.degerAta(iade ? 'I' : '', 'fis.iade')
		return this
	}
	

	/*async onAfterRun({ gridPart, builder: rfb }) {
		await super.onAfterRun(...arguments)
		if (!this.isPanelItem)
			setTimeout(() => gridPart.secimlerIstendi(), 50)
	}
	static islemTuslariDuzenle_listeEkrani({ sender: gridPart, liste, part: { ekSagButonIdSet: sagSet } }) {
		super.islemTuslariDuzenle_listeEkrani(...arguments)
		let items = [
			// { id: 'eIslemXMLOlustur', handler: e => this.eIslemIzleIstendi({ ...arguments[0], ...e, recs: gridPart.selectedRecs }) }
		]
		liste.push(...items)
		extend(sagSet, asSet(items.map(_ => _.id)))
	}
	static orjBaslikListesi_argsDuzenle({ sender: gridPart, args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		gridPart.tekil()
		$.extend(args, { showStatusBar: true, showAggregates: true, selectionMode: 'multiplerowsextended' })
	}
	static orjBaslikListesi_groupsDuzenle({ liste }) {
		super.orjBaslikListesi_groupsDuzenle(...arguments)
	}
	static secimlerDuzenle({ secimler: sec }) {
		let {liste: l, donem: { tekSecim: donem }} = sec
		donem.buAy()
		sec.addKA('muhHesap', DMQMuhHesap, null, null, false)
		$.extend(l.muhHesapKod, { birKismimi: false, basi: '7', sonu: '7z' })
		delete l.muhHesapAdi
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, value, result }) {
		super.ekCSSDuzenle(...arguments)
		if (value) {
			if (belirtec.endsWith('borc') || belirtec.endsWith('bakiye'))
				result.push('bold', value > 0 ? 'forestgreen' : 'orangered')
			if (belirtec.endsWith('alacak'))
				result.push('bold', value > 0 ? 'firebrick' : 'orangered')
		}
		else if (belirtec.endsWith('borc') || belirtec.endsWith('alacak') || belirtec.endsWith('bakiye'))
			result.push('lightgray')
		if (belirtec == 'bakiye')
			result.push('fs-120')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			...this.getKAKolonlar(
				new GridKolon({ belirtec: 'muhHesapKod', text: 'Muh Hesap', genislikCh: 15 }),
				new GridKolon({ belirtec: 'muhHesapAdi', text: 'Hesap Adı', maxWidth: 60 * katSayi_ch2Px })
			),
			new GridKolon({ belirtec: 'muh_borc', text: 'Muh.Borç', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'muh_alacak', text: 'Muh.Alacak', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'hiz_borc', text: 'Hiz.Borç', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'hiz_alacak', text: 'Hiz.Alacak', genislikCh: 15, aggregates: ['sum'] }).tipDecimal_bedel(),
			new GridKolon({ belirtec: 'bakiye', text: '(Muh - Hiz) Fark', genislikCh: 21, aggregates: ['sum'] }).tipDecimal_bedel()
		)
	}
	static async loadServerDataDogrudan({ gridPart, secimler: sec, secimler: { tarihBSVeyaCariDonem: tarihBS } }) {
		let {hizmetVeMuhKarsilastirma_ozelIsaret: ozelIsaretBakilirmi} = app.params?.dRapor ?? {}
		let {muhHesapKod: sec_muhHesapKod, muhHesapAdi: sec_muhHesapAdi} = sec
		let recs
		{
			let har = new HizmetHareketci()
			har.withAttrs('hizmetkod', 'bedel', 'ba')
			har.addEkDuzenleyici(null, ({ har, hv, sent, where: wh }) => {
				wh.basiSonu(tarihBS, hv.tarih)
				wh.basiSonu(sec_muhHesapKod, 'hiz.muhhesap')
				// hareketci wh.fisSilindiEkle() kendisi yapıyor olabilir
				if (ozelIsaretBakilirmi)
					wh.add(`${hv.ozelisaret} <> '*'`)                                                      // sadece muhasebeleşenler
				sent.sahalarVeGroupByVeHavingReset()
				let {sahalar} = sent, {ba, bedel} = hv
				sahalar.add(...[
					'hiz.muhhesap muhHesapKod',
					`SUM(case when ${ba} = 'B' then ${bedel} else 0 end) hiz_borc`,
					`SUM(case when ${ba} = 'A' then ${bedel} else 0 end) hiz_alacak`,
					`0 muh_borc`,
					`0 muh_alacak`
				])
				sent.groupByOlustur()
				sent.gereksizTablolariSilDogrudan(['hiz'])
			})
			let uni = har.uniOlustur()
			{
				let sent = new MQSent(), {where: wh, sahalar} = sent
				sent.fisHareket('muhfis', 'muhhar')
				wh.fisSilindiEkle()
				if (ozelIsaretBakilirmi)
					wh.add(`fis.ozelisaret <> '*'`)
				wh.basiSonu(tarihBS, 'fis.tarih')
				wh.basiSonu(sec_muhHesapKod, 'har.hesapkod')
				sahalar.add(...[
					'har.hesapkod muhHesapKod',
					`0 hiz_borc`,
					`0 hiz_alacak`,
					`SUM(case when har.ba = 'B' then har.bedel else 0 end) muh_borc`,
					`SUM(case when har.ba = 'A' then har.bedel else 0 end) muh_alacak`
				])
				sent.groupByOlustur()
				uni.add(sent)
			}
			let stm = new MQStm(), {with: _with, orderBy} = stm
			_with.add(uni.asTmpTable('onhesap'))
			{
				let sent = stm.sent = new MQSent(), {sahalar, having} = sent
				sent.fromAdd('onhesap onh')
					.fromIliski('muhhesap mhes', 'onh.muhHesapKod = mhes.kod')
				sahalar.add(
					'onh.muhHesapKod', 'mhes.aciklama muhHesapAdi',
					...['hiz_borc', 'hiz_alacak', 'muh_borc', 'muh_alacak']
							.map(alias => `SUM(onh.${alias}) ${alias}`)
				)
				sent.groupByOlustur()
				having.add(new MQOrClause([
					`SUM(onh.hiz_borc) <> SUM(onh.muh_borc)`,
					`SUM(onh.hiz_alacak) <> SUM(onh.muh_alacak)`
				]))
			}
			orderBy.add('muhHesapKod')
			recs = await this.sqlExecSelect(stm)
			for (let rec of recs) {
				for (let prefix of ['hiz', 'muh']) {
					let borc = rec[`${prefix}_borc`], alacak = rec[`${prefix}_alacak`]
					rec[`${prefix}_bakiye`] = roundToBedelFra(borc - alacak)
				}
				rec.bakiye = rec.muh_bakiye - rec.hiz_bakiye
			}
		}
		return recs ?? []
	}*/
}
