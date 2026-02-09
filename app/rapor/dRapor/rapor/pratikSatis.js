
class DRapor_PratikSatis extends DRaporMQ {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get oncelik() { return 130 } static get hareketciSinif() { return PratikSatisHareketci }
	// static get kategoriKod() { return '' } static get kategoriAdi() { return '' }
	static get kod() { return this.hareketciSinif.kod } static get aciklama() { return this.hareketciSinif.aciklama }
	get uygunmu() { return this.class.uygunmu } static get uygunmu() { return this.hareketciSinif.uygunmu }
	static get secimSinif() { return DonemselSecimler } static get sadeceTanimmi() { return true }
	static get kolonFiltreKullanilirmi() { return false } static get bulFormKullanilirmi() { return true }
	// static get vioAdim() { return 'MH-R' }

	uiGirisOncesiIslemler({ sender: tanimPart }) {
		e.islem = tanimPart.islem = 'izle'
		let {sinifAdi: title} = this.class
		let secimler = new DonemselSecimler()
		extend(tanimPart, { title })
		extend(this, { secimler })
		return super.uiGirisOncesiIslemler(...arguments)
	}
	static rootFormBuilderDuzenle_islemTuslari({ fbd_islemTuslari: fbd }) {
		super.rootFormBuilderDuzenle_islemTuslari(...arguments)
		fbd.addStyle(
			`$elementCSS { pointer-events: none !important }
			 $elementCSS > .sag { pointer-events: auto !important }`
		)
	}
	static tanimPart_islemTuslariDuzenle(e) {
		super.tanimPart_islemTuslariDuzenle(e)
		let { sender: tanimPart, liste, part: { ekSagButonIdSet: sagSet } } = e
		let { inst } = tanimPart
		extend(e, { tanimPart, inst })
		liste = e.liste = liste.filter(_ => _.id != 'tamam')
		let items = [
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
		;{
			rfb.addGridliGosterici('ozet')
				.addStyle_fullWH(null, '40%')
				.setSource([])
		}
		;{
			let form = rfb.addFormWithParent().yanYana()
				.addStyle_fullWH(null, 250)
			form.addGridliGosterici('tahsilat')
				.addStyle_fullWH('70%')
				.setSource([])
			form.addGridliGosterici('ozel')
				.addStyle_fullWH('29.3%')
				.setSource([])
		}
		;{
			rfb.addGridliGosterici('matrahKdv')
				.addStyle_wh(null, 200)
				.setSource([])
		}
		rfb.run()
	}
	acc_initCollapsedContent_genel({ tanimPart, islem, acc, item, layout, rfb }) {
		return this._acc_initCollapsedContent_ortak(...arguments)
	}
	async acc_initContent_satis({ tanimPart, islem, acc, item, layout, rfb }) {
		;{
			rfb.addGridliGosterici('satisGrid')
				.addStyle_fullWH()
				.setSource([])
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
	acc_onCollapse({ acc }) {
		let {activePanelId: id} = acc
		let targetId = id == 'genel' ? 'satis' : 'genel'
		acc.expand(targetId)
	}
	acc_onExpand({ acc }) {
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
