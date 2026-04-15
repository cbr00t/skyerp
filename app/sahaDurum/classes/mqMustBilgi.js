class MQMustBilgi extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dataKey() { return 'mustBilgi' } static get tableAlias() { return 'mbil' }
	static kodListeTipi() { return 'MUST' } static get sinifAdi() { return 'Plasiyer için Müşteriler' }
	static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return null }
	static get tekilOkuYapilazmi() { return true }

	static islemTuslariDuzenle_listeEkrani({ liste, part }) {
		let e = arguments[0]
		let removeIdSet = asSet(['yeni', 'sil', 'kopya'])
		liste = e.liste = liste.filter(_ => !removeIdSet[_.id])
		let rec = liste.find(_ => _.id == 'degistir')
		if (rec)
			rec.id = 'izle'
		let ekSagButonIdSet = part.ekSagButonIdSet ??= {}
		ekSagButonIdSet.izle = true
	}
	static orjBaslikListesi_argsDuzenle({ args }) {
		super.orjBaslikListesi_argsDuzenle(...arguments)
		$.extend(args, { groupsExpandedByDefault: true })
	}
	static orjBaslikListesi_gridInit({ grid }) {
		super.orjBaslikListesi_gridInit(...arguments)
		grid.on('filter', ({ args }) => {
			if (grid.jqxGrid('groups').length && args.filters?.length)
				grid.jqxGrid('expandallgroups')
		})
	}
	static ekCSSDuzenle({ dataField: belirtec, rec, result }) {
		super.ekCSSDuzenle(...arguments)
		if (belirtec == 'bakiye' || belirtec.startsWith('kademe')) {
			let value = rec[belirtec]
			if (value) { result.push(value < 0 ? 'red' : 'green') }
			else { result.push('lightgray') }
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let {session} = config, {yerl} = app.params
		session ??= yerel.lastSession ?? {}
		let {loginTipi, user} = session
		let colDef = liste.find(_ => _.belirtec == 'kod')
		colDef?.hidden()
		colDef = liste.find(_ => _.belirtec == 'aciklama')
		$.extend(colDef, {
			genislikCh: null,
			cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
				rec = rec?.tanim ?? rec; let marginStyle = 'margin-inline-end: 20px';
				return changeTagContent(html,
					`<div class="flex-row"><div class="bold gray" style="${marginStyle}">${rec.kod || ''}</div>` +
					`<div style="${marginStyle}">${rec.aciklama || ''}</div></div>`
				)
			}
		})
		liste.push(...[
			new GridKolon({ belirtec: 'yore', text: 'Yöre', genislikCh: 20, cellClassName: 'darkgray' }),
			new GridKolon({ belirtec: 'iladi', text: 'İl Adı', genislikCh: 13, cellClassName: 'darkgray' }),
			new GridKolon({
				belirtec: 'bakiye', text: 'Bakiye', genislikCh: 13, cellClassName: 'bold',
				aggregates: [{ TOPLAM: gridDipIslem_sum }]
			}).tipDecimal_bedel()
		])
		for (let i = 1; i <= MustBilgi.kademeler.length; i++) {
			liste.push(new GridKolon({
				belirtec: `kademe${i}Bedel`, text: MustBilgi.getKademeText(i - 1),
				genislikCh: 13, aggregates: [{ TOPLAM: gridDipIslem_sum }]
			}).tipDecimal_bedel())
		}
		liste.push(
			new GridKolon({ belirtec: 'plasiyerText', text: 'Plasiyer', genislikCh: 10, cellClassName: 'darkgray' }))
	}
	static gridVeriYuklendi(e) {
		let {grid} = e, {session} = config, {yerel} = app.params
		session ??= yerel.lastSession ?? {}
		let {loginTipi, user} = session, groups = []
		if (!(user && loginTipi == 'plasiyerLogin'))
			groups.push('plasiyerText')
		groups.push('iladi')
		if (groups?.length)
			grid.jqxGrid('groups', groups)
	}
	static async loadServerData(e = {}) {
		await super.loadServerData(e)
		let {wsArgs} = e, {dataKey} = this, {localData} = app.params
		let result = await localData.get(dataKey)
		if (result == null) {
			let recs = await MQCari.loadServerDataDogrudan(e)
			let classes = [MQKapanmayanHesaplar, MQKapanmayanHesaplar_Dip, MQCariEkstre, MQCariEkstre_Detay]
			result = {}
			for (let rec of recs) {
				let {kod} = rec
				if (kod)
					result[kod] = new MustBilgi(rec)
			}
			let cariEkstre_fisSayac2Rec = {}
			for (let cls of classes) {
				let {dataKey: subDataKey} = cls
				if (!subDataKey)
					continue
				let recs = await cls.loadServerDataDogrudan(e) ?? []
				for (let rec of recs) {
					let parentRec, {icerikfissayac: fisSayac} = rec
					switch (cls) {
						case MQCariEkstre: if (fisSayac) { cariEkstre_fisSayac2Rec[fisSayac] = rec } break
						case MQCariEkstre_Detay: parentRec = cariEkstre_fisSayac2Rec[fisSayac]; break
					}
					let kod = (rec.mustkod ?? rec.mustKod ?? rec.must ?? rec.kod) ??
								(parentRec?.mustkod ?? parentRec?.mustKod ?? parentRec?.must ?? parentRec?.kod)
					if (!kod) 
						continue
					let mustBilgi = result[kod]
					if (mustBilgi)
						(mustBilgi[subDataKey] ??= []).push(rec)
				}
			}
			let AsyncMax = 5, promises = []
			for (let mustBilgi of values(result)) {
				promises.push(promise(r =>
					r( mustBilgi.kapanmayanHesap_yaslandirmaOlustur(e) )
				))
				if (promises.length >= AsyncMax) {
					await Promise.all(promises)
					promises = []
				}
			}
			if (promises.length)
				await Promise.all(promises)
			await localData.set(dataKey, result)
			localData.kaydetDefer()
		}
		if (result) {
			for (let kod in result) {
				let rec = result[kod]
				if (isPlainObject(rec))
					result[kod] = rec = new MustBilgi(rec)
			}
		}
		let recs = values(result)
		return recs
	}
	static tanimPart_islemTuslariDuzenle(e) {
		super.tanimPart_islemTuslariDuzenle(e)
		let { dev } = config
		let { sender: tanimPart } = e
		let { inst } = tanimPart
		let items = [
			(dev ? {
				id: 'dataOutput', text: 'PDF<br/>e-Mail',
				handler: _e =>
					inst.dataOutputIstendi({ ...e, ..._e })
			} : null)
		].filter(Boolean)
		e.liste = [...items, ...e.liste]
		let ekSagButonIdSet = e.part.ekSagButonIdSet ??= {}
		extend(ekSagButonIdSet, asSet(items.map(_ => _.id)))
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e)
		let { rootBuilder: rfb, tanimFormBuilder: tanimForm, sender: tanimPart, mfSinif, inst, kaForm } = e
		let { layout } = tanimPart
		rfb.addCSS('no-scroll').addStyle(
			`$elementCSS .form-layout > [data-builder-id = "kaForm"] { margin-top: -80px }`)
		rfb.setAltInst(({ builder: fbd }) => {
			let { localData } = app.params
			let mustBilgiDict = localData.get(this.dataKey)
			let { part: { inst: { kod } } } = fbd
			let mustBilgi = mustBilgiDict[kod]
			return mustBilgi
		})
		tanimPart.islem = 'izle'
		tanimPart.title = `<b>${inst.kod}</b><span class="gray"> - Müşteri Detayları</span>`

		let fbd_islemTuslari = rfb.addForm('islemTuslari_sol')
			.setLayout(({ builder: { rootPart: { layout } } }) =>
				layout.find('.header > .islemTuslari'))
			.addStyle(`$elementCSS .sag > #dataOutput { width: 100px }`)
		tanimForm.addStyle_wh('var(--full)')
		tanimForm.addForm('bakiyeText').addStyle_wh('auto')
			.setLayout(({ builder: { altInst: inst }}) => $(`<span class="bakiyeForm">${inst.bakiyeText}</span>`))
			.addStyle(`$elementCSS { font-size: 130%; color: gray; position: absolute; top: 30px; right: 250px }`)
		let tabPanel = tanimForm.addTabPanel('tabPanel').addStyle_fullWH(null, 'calc(var(--full) - 100px)')
			.addStyle(`$elementCSS > .content > div { padding-bottom: 0 !important }`);
		let addGrid = (id, etiket, mfSinif, ekIslemler, parentBuilder) => {
			ekIslemler ??= {}
			etiket ??= mfSinif?.sinifAdi ?? ''
			if (!parentBuilder)
				parentBuilder = tabPanel.addTab(id, etiket).yanYana().addStyle_fullWH()
			//let altForm = parentBuilder.addBaslik(id).setEtiket(etiket).addCSS('baslik').addStyle_fullWH();
			if (ekIslemler.ilk)
				getFuncValue.call(this, ekIslemler.ilk, { id, etiket, mfSinif, etiket, parentBuilder })
			let prevFbd = parentBuilder.builders[parentBuilder.builders.length - 1], prevWidth = prevFbd?._width || 0
			let fbd = parentBuilder.addGridliGosterici(id).addStyle_fullWH()
				//.addCSS('dock-bottom')
				.setMFSinif(mfSinif)
				.widgetArgsDuzenleIslemi(({ sender, args, builder }) => {
					let { mfSinif } = builder
					mfSinif.orjBaslikListesi_argsDuzenle({ ...e, sender, args, builder })
				})
				.setTabloKolonlari(({ builder: fbd }) =>
					fbd.mfSinif.listeBasliklari)
				.setSource(({ builder: fbd }) => {
					let { rootPart, mfSinif } = fbd
					let { inst: { kod: mustKod } } = rootPart
					let _e = { ...e, mustKod }
					return mfSinif.loadServerData(_e)
				})
			fbd.addCSS('full-height-important').addStyle(
				`$elementCSS:not(.full-width):not(.full-width-important) {
					width: calc(var(--full) - ${prevWidth ? prevWidth + 10 : 0}px) !important
				}`
			)
			fbd.onAfterRun(({ builder: fbd }) => {
				if (mfSinif?.orjBaslikListesi_gridInit) {
					let { part } = fbd, { grid, gridWidget } = part
					mfSinif.orjBaslikListesi_gridInit({ ...e, sender: part, gridPart: part, builder: fbd, mfSinif, grid, gridWidget })
				}
			})
			if (ekIslemler.son)
				etFuncValue.call(this, ekIslemler.ilk, { id, etiket, mfSinif, etiket, parent, fbd })
			return fbd
		}
		addGrid('kapanmayanHesaplar', null, MQKapanmayanHesaplar, { ilk: e => {
			let {parentBuilder} = e;
			parentBuilder.addButton('navToggle')
				.onClick(e => {
					let {builder} = e, {parentBuilder, rootPart} = builder;
					let builder_sol = parentBuilder.id2Builder[id], builder_sag = parentBuilder.id2Builder.kapanmayanHesaplar;
					builder_sol.layout.toggleClass('jqx-hidden'); builder_sag.layout.toggleClass('full-width-important');
					rootPart.onResize()
				}).addStyle(e => `$elementCSS { position: absolute; width: auto !important; height: auto !important; margin-top: -45px; z-index: 500 }`)
				.addStyle(e => `$elementCSS > button { width: 45px !important; height: 45px !important }`);
			let width = 400, subParentBuilder = parentBuilder.addFormWithParent().altAlta().addStyle_fullWH(width); subParentBuilder._width = width;
			{
				let mfSinif = MQKapanmayanHesaplar_Yaslandirma, {dataKey: id} = mfSinif;
				let fbd = subParentBuilder.addGridliGosterici(id).addStyle_fullWH(null, 350)
					.setMFSinif(mfSinif).rowNumberOlmasin()
					.widgetArgsDuzenleIslemi(({ sender, args, builder: fbd }) => {
						let {mfSinif} = fbd; mfSinif.orjBaslikListesi_argsDuzenle({ ...e, sender, args, builder: fbd }) })
					.setTabloKolonlari(({ builder: fbd }) => fbd.mfSinif.listeBasliklari)
					.setSource(({ builder: fbd }) => { let {rootPart, mfSinif} = fbd; e.mustKod = rootPart.inst.kod; return mfSinif.loadServerData(e) });
				fbd.onAfterRun(({ builder: fbd }) => {
					if (mfSinif?.orjBaslikListesi_gridInit) {
						let {part} = fbd, {grid, gridWidget} = part;
						mfSinif.orjBaslikListesi_gridInit({ ...e, sender: part, gridPart: part, builder: fbd, mfSinif, grid, gridWidget })
					}
				})
			}
			{
				let mfSinif = MQKapanmayanHesaplar_Dip, {dataKey: id} = mfSinif;
				let fbd = subParentBuilder.addGridliGosterici(id).addStyle_fullWH(null, 400)
					.setMFSinif(mfSinif).rowNumberOlmasin()
					.widgetArgsDuzenleIslemi(({ sender, args, builder: fbd }) => {
						let {mfSinif} = fbd; mfSinif.orjBaslikListesi_argsDuzenle({ ...e, sender, args, builder: fbd }) })
					.setTabloKolonlari(({ builder: fbd }) => fbd.mfSinif.listeBasliklari)
					.setSource(({ builder: fbd }) => { let {rootPart, mfSinif} = fbd; e.mustKod = rootPart.inst.kod; return mfSinif.loadServerData(e) });
				fbd.onAfterRun(({ builder: fbd }) => {
					if (mfSinif?.orjBaslikListesi_gridInit) {
						let {part} = fbd, {grid, gridWidget} = part;
						mfSinif.orjBaslikListesi_gridInit({ ...e, sender: part, gridPart: part, builder: fbd, mfSinif, grid, gridWidget })
					}
				})
			}
		} })
		addGrid('cariEkstre', null, MQCariEkstre)
	}
	static formBuildersDuzenle_ka(e) {
		super.formBuildersDuzenle_ka(...arguments)
		let {kaForm} = e
		for (let builder of kaForm.getBuilders()) {
			builder.etiketGosterim_placeholder()
				.onAfterRun(({ builder: { input } }) => input.attr('readonly', ''))
		}
	}

	async dataOutputIstendi({ sender: tanimPart }) {
		let { params: { localData } } = app
		let { kod: mustKod, aciklama: mustUnvan, class: { sinifAdi: islemAdi } } = this
		let { [mustKod]: mustBilgi } = localData.get('mustBilgi') ?? {}
		if (!mustBilgi)
			return

		let { cariEkstre: _cariEkstre, cariEkstre_detay = [] } = mustBilgi ?? {}
		let { part: gridPart } =
			tanimPart.builder.getBuilders()
				.find(fbd => fbd.id == 'cariEkstre' && fbd instanceof FBuilder_Grid) ?? {}
		let { selectedRecs: cariEkstre } = gridPart ?? {}
		if (empty(cariEkstre))
			cariEkstre = _cariEkstre
		
		if (empty(cariEkstre)) {
			hConfirm('Çıktı alınacak bilgi yok', islemAdi)
			return
		}

		let id2Detaylar = {}
		;cariEkstre_detay.forEach(r => {
			let { icerikfissayac: id } = r
			if (id)
				(id2Detaylar[id] ??= []).push({ ...r })
		})

		let islemTipi, uiArgs = {}
		;{
			let rfb = new RootFormBuilder()
				.setLayout($('<div/>'))
				.setInst(uiArgs)
				.addStyle_wh('calc(var(--full) - 20px)')
				.addStyle(
					`$elementCSS > div { padding: 10px }
					 $elementCSS > div > .formBuilder-element:not(:first-child) { margin-top: 30px !important }
					 $elementCSS > div .formBuilder-element { gap: 10px !important }`
				)
			;{
				let form = rfb.addFormWithParent().altAlta()
				form.addForm().setLayout(() => $(
					`<h3>Seçilen <b class=royalblue>${cariEkstre.length}</b> kayıt için işlem yapılacak</h3>`))
				form.addTextInput('ozelEMailStr', 'Özel e-Mail Adresleri')
					.onBuildEk(({ builder: { input }}) => {
						input.attr('autocomplete', 'email')
						input.attr('placeholder', 'Boş bırakılırsa Müşteri e-Mail adresleri kullanılacak')
					})
			}
			rfb.run()
			let content = rfb.layout

			islemTipi = await promise(async (c, f) => {
				let wnd
				let callback = val => {
					c(val)
					wnd?.jqxWindow('destroy')
				}
				wnd = createJQXWindow({
					content,
					title: 'e-Mail/PDF',
					args: {
						isModal: true,
						width: Math.min(600, $(window).width() - 50),
						height: Math.min(300, $(window).height() - 20),
						closeButtonAction: 'close'
					},
					buttons: {
						'PDF Göster': () => callback('pdf'),
						'e-Mail Gönder': () => callback('email'),
						'VAZGEÇ': () => callback(null)
					}
				})
				wnd.on('close', () =>
					callback(null))
				let btns = wnd.find('.buttons').children()
				btns.eq(0).addClass('bg-lightgreen')
				btns.eq(1).addClass('bg-lightroyalblue')
			})
		}
		if (!islemTipi)
			return

		let sablon = {}
		;{
			sablon.baslik = `
				<div class="dokum">
					<style>
						.dokum { margin: 0 }
						.dokum > table { margin-top: 30px }
						.dokum table { width: 100% }
						.dokum table tr.header > * { text-align: center }
						.dokum table tr.content { page-break-inside: avoid }
						.dokum table.detay { font-size: 80% }
						.dokum table.baslik tr.content { border-bottom: 1px solid #eee }
						.dokum table.baslik tr { }
						.dokum table.baslik tr > * { font-weight: bold; padding: 4px 10px }
						.dokum table.detay tr > * { padding: 2px 5px }
						.dokum table.detay tr.content > * { font-weight: normal; color: #777 }
						.dokum table.baslik tr.header { border-bottom: 5px solid royalblue }
						.dokum table.detay tr.header { border-bottom: 3px solid forestgreen }
						.dokum table.baslik tr.dip { border-top: 3px solid royalblue; background-color: #ddd }
						.dokum table.detay tr.dip { border-top: 2px solid forestgreen; background-color: #eee }
						/*@media screen {
							.dokum table.baslik { box-shadow: 0 0 8px 3px royalblue }
							.dokum table tr.content:hover { background-color: #88ccff33; cursor: pointer }
						}*/
					</style>
					<h3 style="color: royalblue">
						[mustUnvan]
					</h3>
					<table class="baslik" border="1">
						<tr class="header">
							<th width="80">TARİH</th>
							<th width="250">BELGE NO</th>
							<th>İŞLEM</th>
							<th width="150" align="right">BORÇ</th>
							<th width="150" align="right">ALACAK</th>
						</tr>
						<tr class="content">
							<td colspan="100">
								<table>
									<tr class="asil">
										<td width="80">[tarih]</td>
										<td width="250" align="right">[fisnox]</td>
										<td>[isladi]</td>
										<td width="150" align="right">[borcBedelStr]</td>
										<td width="150" align="right">[alacakBedelStr]</td>
									</tr>
									<tr class="detaylar">
										<td colspan="100">
											[detayTable]
										</td>
									</tr>
								</table>
							</td>
						</tr>
						<tr class="dip">
							<td colspan="3">&nbsp;</td>
							<td align="right">[borcBedelStr]</td>
							<td align="right">[alacakBedelStr]</td>
						</tr>
					</table>
				</div>`
		}
		;{
			sablon.detay = 
				`<table class="detay" border="0">
					<tr class="header">
						<th>Ürün</th>
						<th align="right">Miktar</th>
						<th align="right">Bedel</th>
					</tr>
					<tr class="content">
						<td>[stokadi]</td>
						<td align="right">[miktar]</td>
						<td align="right">[bedelStr]</td>
					</tr>
					<tr class="dip">
						<td>&nbsp;</td>
						<td align="right">[miktar]</td>
						<td align="right">[bedelStr]</td>
					</tr>
				 </table>`
		}
		function getBedelStr(value, detaymi) {
			if (!value)
				return space
			let color = value < 0 ? 'firebrick' : detaymi ? 'forestgreen' : 'royalblue'
			return `<b style="color: ${color}">${bedelToString(value)}</b>`
		}
		mustUnvan ??= ( await MQMustBilgi.getGloKod2Adi() )?.[mustKod]?.trimEnd()
		let baslik = { mustKod, mustUnvan }
		let dip = { borc: 0, alacak: 0}
		let detaylar = cariEkstre.map(_r => {
			let r = { ..._r }
			let { tarih, borcbedel: borc, alacakbedel: alacak, icerikfissayac: id } = r
			if (tarih)
				tarih = r.tarih = asDate(tarih)
			dip.borc += borc
			dip.alacak += alacak
			r.borcBedelStr = getBedelStr(borc, false)
			r.alacakBedelStr = getBedelStr(alacak, false)
			let _detaylar = r.detaylar = id2Detaylar[id] ?? []
			if (!empty(_detaylar)) {
				let _dip = {}
				;_detaylar.forEach(det => {
					_dip.miktar = (_dip.miktar ?? 0) + det.miktar
					_dip.bedel = (_dip.bedel ?? 0) + det.bedel
					det.bedelStr = getBedelStr(det.bedel, true)
				})
				_dip.bedelStr = getBedelStr(_dip.bedel, true)
				
				if (r.detayTable == null) {
					let { result: detayTable } = (
						new HTMLDokum(sablon.detay)
							.process({ baslik: {}, detaylar: _detaylar, dip: _dip })
					)
					if (detayTable)
						detayTable = $(detayTable)[0].outerHTML
					r.detayTable = detayTable
				}
			}
			r.detayTable ??= ''
			return r
		})
		dip.borcBedelStr = getBedelStr(dip.borc, false)
		dip.alacakBedelStr = getBedelStr(dip.alacak, false)

		let dokumcu = new HTMLDokum(sablon.baslik)
		let { result: htmlContent } = dokumcu.process({ baslik, detaylar, dip })
		let htmlElm = htmlContent && isString(htmlContent) ? $(htmlContent)[0] : null
		if (!htmlElm)
			throw { isError: true, errorText: 'Görüntülenecek veri yok' }
		
		// displayMessage(htmlElm)
		
		//let url = URL.createObjectURL(new Blob([htmlContent], { type: 'text/html' }))
		//openNewWindow(url)
		//setTimeout(() => URL.revokeObjectURL(url), 5_000)

		showProgress()
		try {
			let getPdf = type =>
				getPdfOutput(type, htmlElm, { margin: 5, orientation: 'landscape' })
			switch (islemTipi) {
				case 'email': {
					let { ozelEMailStr: eMailStr } = uiArgs
					// eMailStr ||= ??  // gerekirse cari tanımdan email adresi alınacak kısım
					
					let to, cc = []
					if (eMailStr) {
						let tokens = eMailStr.split(';').map(_ => _.trim())
						to = tokens[0]
						cc.push(...tokens.slice(1))
					}
					if (empty(to))
						throw { isError: true, errorText: 'Gönderilecek e-Mail adresi boş olamaz' }
					
					let blob = await getPdf('blob')
					let pdfContent = blob
					
					let { appID } = app
					let fileName = `skyERP/sahaDurum/${appID}.pdf`
					await app.wsTempUpload({ fileName, data: pdfContent })
					
					let auth = await app.getEMailAuth() ?? {}
					;{
						let html = true
						let subject = `Sky Saha Durum - Cari Ekstre | ${dateTimeAsKisaString(now())} | ${mustUnvan}`
						let body = htmlContent
						let tempUploadDir = Base64.decode('L1Byb2dyYW1EYXRhL3Zpby9zZXJ2aWNlL0NTa3lXUy91cGxvYWQ=')
						let attachments = [`${tempUploadDir}/${fileName}`]
						let data = {
							...auth, html, to, cc,
							subject, body, attachments
						}
						await app.wsEMailGonder({ data })
					}
					
					/*let te = new TextEncoderStream()
					a.stream().pipeTo(te.writable)
					await Array.fromAsync( te.readable.values() )
					*/
					eConfirm('e-Mail Gönderimi tamamlandı')
					break
				}
				case 'pdf': {
					let url = await getPdf('bloburl')
					openNewWindow(url)
					setTimeout(() => URL.revokeObjectURL(url), 5_000)
					break
				}
			}
		}
		finally { hideProgress() }
	}
}


/*
let { params: { localData }, activeWndPart: listePart } = app
let { selectedRec: mustBilgi } = listePart ?? {}
mustBilgi ??= values( localData.get('mustBilgi') )[0]
let { cariEkstre: recs } = mustBilgi
let kod2Adi = await MQMustBilgi.getGloKod2Adi()
;recs.forEach(r =>
	r.mustunvan ??= kod2Adi[r.must] || r.must)

let d = new HTMLDokum({
	sablon: `
		<div class="dokum">
			<style>
				.dokum { padding: 20px }
				.dokum > * { margin-bottom: 30px }
				.dokum table { max-width: 90%; box-shadow: 0 0 5px 1px royalblue }
				.dokum table tr { border-bottom: 1px solid #eee; page-break-inside: avoid }
				@media screen {
					.dokum table tr:not(.header):not(.dip):hover { background: #88ccff33; cursor: pointer }
				}
				.dokum table tr > * { padding: 5px 10px }
				.dokum table tr.header { border-bottom: 3px solid #aaa }
				.dokum table tr.dip { border-top: 2px solid #ccc; background: #eee }
				
			</style>
			<h3 style="color: royalblue">
				[aciklama]
			</h3>
			<table border="1">
				<tr class="header">
					<th>TARİH</th>
					<th>BELGE NO</th>
					<th>İŞLEM</th>
				</tr>
				<tr class="content">
					<td>[tarih]</td>
					<td>[fisnox]</td>
					<td>[isladi]</td>
				</tr>
				<tr class="dip">
					<td>[DIP-REPLACE]</td>
				</tr>
			</table>
		</div>
	`
})
let data = {
	baslik: mustBilgi,
	detaylar: recs,
	dip: {}
}
let result = d.process({ data })
let { result: content } = result
content = content && isString(content) ? $(content)[0] : null
if (!content)
	throw { isError: true, errorText: 'Görüntülenecek veri yok' }
// displayMessage(content)

//let url = URL.createObjectURL(new Blob([content], { type: 'text/html' }))
//openNewWindow(url)
//setTimeout(() => URL.revokeObjectURL(url), 5_000)

let pdf = html2pdf()
	.from(content)
	.set({
		margin: 10,
		// filename: 'rapor.pdf',
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: { scale: 2, useCORS: true },
		jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
	})
let url = await pdf.output('bloburl')
openNewWindow(url)
setTimeout(() => URL.revokeObjectURL(url), 5_000)
*/

