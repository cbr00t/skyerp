
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
			let {tarihBS} = sec
			sent
				.fromIliski('isyeri sub', 'fis.bizsubekod = sub.kod')
				.fromIliski('kasiyer kas', 'fis.kasiyerkod = kas.kod')
			wh
				.fisSilindiEkle()
				.add(new MQOrClause([`fis.ozelisaret <> '*'`, `fis.fisanatipi = 'YM'`]))
			if (tarihBS)
				wh.basiSonu(tarihBS, 'fis.tarih')
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
			{ id: 'seviyeAc', text: 'Sev. Aç', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: true }) },
			{ id: 'seviyeKapat', text: 'Sev. Kapat', handler: _e => inst.gridSeviyeAcKapatIstendi({ ..._e, ...e, state: false }) },
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
			.fullScreen()
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
			.addStyle(`$elementCSS > div { overflow-y: auto !important }`)
		
		// özet
		;{
			let altForm = form.addFormWithParent().altAlta()
				.addStyle_wh(450)
			;{
				altForm.addGridliGosterici('ozet')
					.addStyle_fullWH(null, 197)
					.rowNumberOlmasin().notAdaptive()
					.setToplamYapi({ etiket: { belirtec: 'tipText' } })
					.widgetArgsDuzenleIslemi(({ args }) =>
						extend(args, {
							autoHeight: true, rowsHeight: 30, columnsMenu: false, columnsReorder: false,
							showStatusBar: false, showAggregates: false, showGroupAggregates: false,
							selectionMode: 'multiplerowsextended'
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
							new GridKolon({ belirtec: 'tipText', text: `<span class=darkviolet>ÖZET</span>`, genislikCh: 16, filterType: 'checkedlist', cellClassName }),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10, filterType: 'checkedlist', aggregates: ['sum'], cellClassName }).tipNumerik(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 17, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
						]
					})
					.setSource(async e => {
					let uni = new MQUnionAll()
					;{
						let sent = new MQSent(), {where: wh, sahalar} = sent
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
					let recs = await app.sqlExecSelect(stm)
					recs = recs.filter(r => r.fisSayi)
					return recs
				})
			}
			;{
				altForm.addGridliGosterici('ozetEk')
					.addStyle_fullWH(null, 130)
					.rowNumberOlmasin().notAdaptive()
					.widgetArgsDuzenleIslemi(({ args }) =>
						extend(args, {
							rowsHeight: 30, columnsHeight: 25, columnsMenu: false, columnsReorder: false,
							selectionMode: 'multiplerowsextended'
							// showStatusBar: true, showAggregates: false, showGroupAggregates: false
						})
					)
					.setTabloKolonlari(e => {
						let cellClassName = (sender, rowIndex, belirtec, value, rec, prefix) => {
							let result = [belirtec]
							return result.join(' ')
						}
						return [
							new GridKolon({ belirtec: 'tipText', text: `<span class=violet>ÖZET-EK</span>`, genislikCh: 16, filterType: 'checkedlist', cellClassName }),
							new GridKolon({ belirtec: 'fisSayi', text: 'Fiş Sayı', genislikCh: 10, filterType: 'checkedlist', aggregates: ['sum'], cellClassName }).tipNumerik(),
							new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 17, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
						]
					})
					.setSource(async e => {
					let uni = new MQUnionAll()
					;{
						let sent = new MQSent(), {where: wh, sahalar} = sent
						this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorandetay' })
						wh.add(`har.biptalmi = 0`, `har.bikrammi = 0`)
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
						let sent = new MQSent(), {where: wh, sahalar} = sent
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
						let sent = new MQSent(), {where: wh, sahalar} = sent
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
					let recs = await app.sqlExecSelect(stm)
					recs = recs.filter(r => r.fisSayi)
					return recs
				})
			}
		}

		// özel aralık
		;{
			form.addGridliGosterici('ozel')
				.addStyle_fullWH(440, 130)
				.addStyle(`$elementCSS { min-width: 200px !important; max-width: 440px !important }`)
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'text' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						rowsHeight: 30, showStatusBar: true, columnsMenu: false, columnsReorder: false,
						showAggregates: true, showGroupAggregates: true,
						selectionMode: 'multiplerowsextended'
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
		let form = rfb.addFormWithParent().yanYana()
			.addStyle(`$elementCSS > div { overflow-y: auto !important }`)
		
		// tahsilat
		;{
			form.addGridliGosterici('tahsilat')
				.addStyle_fullWH(450, 500)
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'aciklama' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						rowsHeight: 30, showStatusBar: false, columnsMenu: false, columnsReorder: false,
						showAggregates: false, showGroupAggregates: false,
						selectionMode: 'multiplerowsextended'
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
						new GridKolon({ belirtec: 'aciklama', text: `<span class=limegreen>TAHSİLAT</span>`, genislikCh: 25, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 18, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
				.setSource(async e => {
					let sent = new MQSent(), {where: wh, sahalar} = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent, harTable: 'restorantahsil' })
					sent.har2TahSekliBagla()
					sahalar.add(
						'har.tahseklino kod', 'tsek.aciklama aciklama',
						`(case tsek.tahsiltipi when 'NK' then 1 when 'PS' then 2 else 9 end) oncelik`,
						'SUM(har.bedel) bedel'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['oncelik', 'bedel DESC'] })
					let recs = await app.sqlExecSelect(stm)
					return recs
				})
		}
		
		rfb.run()
	}
	async acc_initContent_kdv({ tanimPart, islem, acc, item, layout, rfb }) {
		// rfb.addStyle_fullWH()
		let form = rfb.addFormWithParent().yanYana()
			.addStyle(`$elementCSS > div { overflow-y: auto !important }`)

		// matrah ve kdv
		;{
			form.addGridliGosterici('matrahKdv')
				.addStyle_fullWH(450, 500)
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'text' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						rowsHeight: 30, showStatusBar: false, columnsMenu: false, columnsReorder: false,
						showAggregates: false, showGroupAggregates: false,
						selectionMode: 'multiplerowsextended'
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
						new GridKolon({ belirtec: 'text', text: `<span class=orangered>KDV</span>`, genislikCh: 10, filterType: 'checkedlist', cellClassName }).alignRight(),
						new GridKolon({ belirtec: 'matrah', text: 'Matrah', genislikCh: 16, aggregates: ['sum'], cellClassName }).tipDecimal_bedel(),
						new GridKolon({ belirtec: 'kdv', text: 'Kdv', genislikCh: 16, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
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
			// .addStyle_fullWH()
			.addStyle(`$elementCSS > div { overflow-y: auto !important }`)

		// kasiyer
		;{
			form.addGridliGosterici('kasiyer')
				.addStyle_fullWH(450, 500)
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'aciklama' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						rowsHeight: 30, showStatusBar: false, columnsMenu: false, columnsReorder: false,
						showAggregates: false, showGroupAggregates: false,
						selectionMode: 'multiplerowsextended'
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
						new GridKolon({ belirtec: 'aciklama', text: `<span class=orange>KASİYER</span>`, genislikCh: 25, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
				.setSource(async e => {
					let sent = new MQSent(), {where: wh, sahalar} = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent })
					sent.fromIliski('kasiyer ksy', 'fis.kasiyerkod = ksy.kod')
					sahalar.add(
						'fis.kasiyerkod kod', 'ksy.aciklama aciklama',
						'SUM(fis.fissonuc) bedel'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['bedel DESC', 'aciklama'] })
					let recs = await app.sqlExecSelect(stm)
					return recs
				})
		}
		
		rfb.run()
	}
	async acc_initContent_sube({ tanimPart, islem, acc, item, layout, rfb }) {
		// rfb.addStyle_fullWH()
		let form = rfb.addFormWithParent().yanYana()
			// .addStyle_fullWH()
			.addStyle(`$elementCSS > div { overflow-y: auto !important }`)

		// şube
		;{
			form.addGridliGosterici('sube')
				.addStyle_fullWH(450, 300)
				.rowNumberOlmasin().notAdaptive()
				.setToplamYapi({ etiket: { belirtec: 'aciklama' } })
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						rowsHeight: 30, showStatusBar: false, columnsMenu: false, columnsReorder: false,
						showAggregates: false, showGroupAggregates: false,
						selectionMode: 'multiplerowsextended'
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
						new GridKolon({ belirtec: 'aciklama', text: `<span class=orange>ŞUBE</span>`, genislikCh: 25, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'bedel', text: 'Hasılat', genislikCh: 18, aggregates: ['sum'], cellClassName }).tipDecimal_bedel()
					]
				})
				.setSource(async e => {
					let sent = new MQSent(), {where: wh, sahalar} = sent
					this.baslikSentDuzele({ ...arguments[0], ...e, sent })
					sent.fromIliski('isyeri sub', 'fis.bizsubekod = sub.kod')
					sahalar.add(
						'fis.bizsubekod kod', 'sub.aciklama aciklama',
						'SUM(fis.fissonuc) bedel'
					)
					sent.groupByOlustur()
					let stm = new MQStm({ sent, orderBy: ['bedel DESC', 'aciklama'] })
					let recs = await app.sqlExecSelect(stm)
					return recs
				})
		}
		
		rfb.run()
	}
	async acc_initContent_satis({ tanimPart, islem, acc, item, layout, rfb }) {
		let {secimler: sec} = this
		let {sqlNull, sqlEmpty} = Hareketci_UniBilgi.ortakArgs
		;{
			rfb.addGridliGosterici('satisGrid')
				.addStyle_fullWH()
				.widgetArgsDuzenleIslemi(({ args }) =>
					extend(args, {
						showGroupsHeader: true, rowsHeight: 50, showStatusBar: true,
						columnsMenu: false, columnsReorder: false,
						showAggregates: true, showGroupAggregates: true,
						selectionMode: 'multiplerowsextended'
					})
				)
				.veriYukleninceIslemi(({ builder: { part: { grid } }}) =>
					grid.jqxGrid('groups', ['grupAdi']))
				.setTabloKolonlari(e => {
					let cellClassName = (sender, rowIndex, belirtec, value, rec, prefix) => {
						let result = [belirtec]
						//if (rec._toplam)
						//	result.push('_toplam')
						return result.join(' ')
					}
					return [
						new GridKolon({ belirtec: 'stokAdi', text: 'Stok', filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'miktar', text: 'Miktar', genislikCh: 9, filterType: 'checkedlist', aggregates: ['sum'], cellClassName }).tipDecimal(),
						new GridKolon({ belirtec: 'brm', text: 'Brm', genislikCh: 4, filterType: 'checkedlist', cellClassName }),
						new GridKolon({ belirtec: 'hasilat', text: 'Hasılat (Kdvli)', genislikCh: 13, aggregates: ['sum'], cellClassName }).tipDecimal_bedel(),
						new GridKolon({ belirtec: 'grupAdi', text: 'Grup', genislikCh: 20, filterType: 'checkedlist', cellClassName })
					]
				})
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
					let recs = [
						...await app.sqlExecSelect(getSatisStm(false)),
						...await app.sqlExecSelect(getSatisStm(true))
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
		/*let {activePanelId: id} = acc
		let targetId = id == 'genel' ? 'satis' : 'genel'
		acc.expand(targetId)*/
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
		let { secimler } = this
		if (harTable)
			sent.fisHareket('restoranfis', harTable)
		else
			sent.fromAdd('restoranfis fis')
		wh
			.add(`fis.kapanmazamani IS NOT NULL`, 'fis.biptalmi = 0')
			.degerAta(iade ? 'I' : '', 'fis.iade')
			.birlestir(secimler.getTBWhereClause(e))
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
