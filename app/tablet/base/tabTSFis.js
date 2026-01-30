// class MQTabTestFis extends mixin($TabFisTemplate, MQGenelFis) {
class TabTSFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabTSFis }
	static get kodListeTipi() { return 'TABTS' } static get sinifAdi() { return 'Ticari/Stok Fiş' }
	static get detaySinif() { return TabTSDetay } static get almSat() { return 'T' }

	constructor(e = {}) {
		super(e)
		let {offlineBuildQuery} = e
		if (!offlineBuildQuery) {
			['yerKod'].forEach(k => {
				let bu = this[k], def = app[k]
				if (!bu && def != null)
					this[k] = bu = def
			})
		}
	}
	static pTanimDuzenle({ pTanim }) {
		// MQOrtakFis.pTanimDuzenle(...arguments)
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { yerKod: new PInstStr('yerkod') })
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode }) {
		/*if (!offlineRequest) {
			let cacheClasses = [MQTabStok]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}*/
		return await super.loadServerDataDogrudan(...arguments)
	}
	static async loadServerData_detaylar({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabStok]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		return await super.loadServerData_detaylar(...arguments)
	}
	async dataDuzgunmuDuzenle({ eskiInst: eskiFis, parentPart, gridPart, result }) {
		let {yerKod} = this
		if (yerKod && !await MQTabYer.kodVarmi(yerKod))
			result.push(`<b>Yer (Depo) [<span class=firebrick>${yerKod}</span>]</b> hatalıdır`)
		return await super.dataDuzgunmuDuzenle(...arguments)
	}

	static async barkodOkundu({ tanimPart, barkodlar }) {
		let e = arguments[0]
		let barkodYapilar = barkodlar.filter(Boolean).map(barkod => {
			let carpan = 1
			for (let s of ['x', '*']) {
				let i = barkod.indexOf(s)
				if (i != -1) {
					carpan = asFloat(barkod.slice(0, i))
					barkod = barkod.slice(i + 1).trimEnd()
				}
				break
			}
			carpan ||= 1
			return barkod ? ({ carpan, barkod }) : null
		}).filter(Boolean)
		let results = await Promise.allSettled(barkodYapilar.map(item =>
			app.barkodBilgiBelirle(item)))
		; results = results
			.filter(_ => _.value && _.status == 'fulfilled')
			.map(_ => _.value)
		if (empty(results))
			return
		/*{
			let html = [
				`<div>Belirlenen ürünler:</div>`,
				`<ul>`,
				...results.map(({ stokAdi: val }) => `<li>${val}</li>`),
				'</ul>'
			].join(CrLf)
			eConfirm(html, 'Barkod Okundu')
		}*/
		let {acc, inst: fis, gridPart = {}} = tanimPart
		let {class: { detaySinif }} = fis, {gridWidget: w} = gridPart
		if (w) {
			w.beginupdate()
			try {
				for (let item of results) {
					$.extend(item, { stokKod: item.shKod, stokAdi: item.shAdi })
					let det = new detaySinif(item)
					await det.detayEkIslemler({ ...arguments, fis })
					det.htmlOlustur?.()
					w.addrow(null, det, 'first')
				}
			}
			finally {
				w.endupdate(false)
				w.clearselection()
				w.selectrow(0)
				w.ensurerowvisible(0)
				fis.topluHesaplaDefer(e)
				setTimeout(() => acc?.render(), 1)
				{
					let css = 'degisti'
					acc.get('duzenle')?.contentLayout?.find(`.${css}`).removeClass(css)
				}
			}
		}
	}
	yerDegisti({ oldValue = this._prev.yerKod, value = this.yerKod }) {
		this._prev.yerKod = value
	}

	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		let {sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm, acc} = e
		// tanimForm.addForm().setLayout(() => $(`<p><h3>hello world from ${this.name}</h3></p>`))
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslikOncesi(e) {
		await super.rootFormBuilderDuzenle_tablet_acc_baslikOncesi(e)
		let {sender: tanimPart, acc, getBuilder} = e
		// let getBuilder = layout => this.rootFormBuilderDuzenle_tablet_getBuilder({ ...e, layout })
		acc.add({
			id: 'duzenle', title: 'Satır Düzenle',
			collapsedContent: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				await this.rootFormBuilderDuzenle_tablet_acc_duzenleCollapsed({ ...e, rfb, item, layout })
				rfb.run()
			},
			content: async ({ item, layout }) => {
				let rfb = getBuilder(layout)
				await this.rootFormBuilderDuzenle_tablet_acc_duzenle({ ...e, rfb, item, layout })
				if (!rfb.builders?.length)
					rfb.addStyle_fullWH(null, 1)
				if (rfb.builders?.length)
					setTimeout(() => rfb.run(), 100)
			}
		})
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		let {yerKod} = fis
		if (yerKod) {
			let aciklama = (await MQTabYer.getGloKod2Adi(yerKod)) || yerKod
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					`<div class="rebeccapurple">`,
						`<span>Yer:</span>`,
						`<b>${aciklama}</b></div>`,
					`</div>`,
				`</div>`
			].join(CrLf)))
		}
		await super.rootFormBuilderDuzenle_tablet_acc_baslikCollapsed(...arguments)
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslik({ sender: tanimPart, inst: fis, rfb, acc }) {
		let e = arguments[0]
		await super.rootFormBuilderDuzenle_tablet_acc_baslik(e)
		{
			let {wndId} = tanimPart.wndPart
			let mfSinif = MQTabYer.getMFSinif_subeFiltreli(() => fis.subeKod, wndId)
			let {sinifAdi: etiket} = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			form.addSimpleComboBox('yerKod', etiket, etiket)
				.etiketGosterim_yok()
				.kodsuz().setMFSinif(mfSinif)
				.degisince(({ type, events, ...rest }) => {
					if (type != 'batch')
						return
					let _e = { type, events, ...rest, oldValue: fis.yerKod, value: events.at(-1).value?.trimEnd() }
					setTimeout(() => {
						fis.yerDegisti({ ...e, ..._e, tanimPart })
						acc?.render()
					}, 5)
				})
				.onAfterRun(({ builder: { part } }) =>
					tanimPart.ddYer = part)
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dipCollapsed(...arguments)
		let {dipIslemci = {}, detaylar: { length: topSatir }} = fis
		let {brut, topIskBedel, topKdv, sonuc} = dipIslemci
		if (topSatir) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					(topIskBedel || topKdv ? `<div>` +
						 `<span class="lightgray">BR: </span>` +
						 `<span>${toStringWithFra(brut)}</span>` +
					 `</div>` : ''),
					(topKdv ? `<div>` +
						 `<span class="lightgray">KD: </span>` +
						 `<span>${toStringWithFra(topKdv)}</span>` +
					 `</div>` : ''),
					(sonuc ? `<div class="orangered"><b>${toStringWithFra(sonuc)}</b> TL</div>` : ''),
					(topSatir ? `<div class="royalblue"><b>${numberToString(topSatir)}</b> satır</div>` : ''),
				`</div>`
			].join(CrLf)))
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_dip({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dip(...arguments)
		let {acc} = tanimPart, {dvKod, dipIslemci, detaylar} = fis
	}
	static async rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detayCollapsed(...arguments)
		let {gridPart: { selectedRec: det } = {}} = tanimPart
		let {length: topSayi} = fis.detaylar
		if (det) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					`<div class="orangered bold">${det.stokAdi || ''}</div>`,
					`<div class="royalblue bold"${det.barkod || ''} satır</div>`,
				`</div>`
			].join(CrLf)))
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_detay({ sender: tanimPart, inst: fis, rfb }) {
		let e = arguments[0]
		await super.rootFormBuilderDuzenle_tablet_acc_detay(e)
		let {depomu} = app, {tablet: { depoBedelGorur }} = app.params
		let {acc} = tanimPart, {detaylar, class: { bedelKullanilirmi }} = fis
		bedelKullanilirmi &&= !(depomu && depoBedelGorur === false)
		rfb.addSimpleComboBox('barkod', 'Barkod', 'Barkod giriniz veya Ürün seçiniz')
			.addStyle(`$elementCSS { max-width: 800px }`)
			.etiketGosterim_yok()
			// .autoClear()
			.setMFSinif(MQTabStok)
			//.noMF()
			.degisince(({ type, events = [], ...rest }) => {
				if (type != 'batch')
					return
				let barkodlar = events.map(_ => _.value).filter(_ => _)
				this.barkodOkundu({ ...arguments, ...rest, tanimPart, barkodlar })
				tanimPart.sonEklemeDuzenleEkranindanmi = false
			})
			.onAfterRun(({ builder: { rootPart, part } }) => {
				rootPart.barkodPart = part
				part.focus()
			})
		rfb.addGridliGosterici('grid')
			.addStyle_fullWH(null, `calc(var(--full) - 55px)`)
			.rowNumberOlmasin().notAdaptive()
			.widgetArgsDuzenleIslemi(({ args }) => $.extend(args, {
				rowsHeight: 70, selectionMode: 'singlerow'
			}))
			.setTabloKolonlari([
				new GridKolon({ belirtec: '_html', text: 'Ürün', filterType: 'input' }),
				(bedelKullanilirmi ? new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 11, filterType: 'checkedlist' }).tipDecimal_bedel() : null),
				new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 4 })
					.tipButton('X')
					.onClick(({ gridRec, args: { owner: w } }) => {
						w.deleterow(gridRec.uid)
						tanimPart.sonEklemeDuzenleEkranindanmi = false
						fis.topluHesaplaDefer(e)
						acc?.render()
					})
			].filter(Boolean))
			.setSource(detaylar)
			.onAfterRun(({ builder: { rootPart, part } }) => {
				rootPart.gridPart = part
				$.extend(part, {
					gridSatirCiftTiklandiBlock: ({ sender: tanimPart, event: { args } = {} }) => {
						let {gridWidget: w, selectedRec: det} = tanimPart ?? {}
						let {row: { bounddata: _det } = {}} = args ?? {}
						let {uid} = det ?? {}
						let {_lastClickedCell: { column: belirtec } = {}} = w
						if (belirtec && w.getcolumn(belirtec)?.columntype?.toLowerCase() == 'button')
							return
						if (det && det != _det) {
							let ind = w.getrowboundindexbyid(uid)
							w.clearselection()
							w.selectrow(ind)
							w.ensurerowvisible(ind)
						}
						acc.expand('duzenle')
					},
					gridContextMenuIstendiBlock: ({ sender: { gridWidget: w }}) => {
						let {clickedrow: tr} = w.mousecaptureposition ?? {}
						let uid = $(tr).attr('row-id')                                   // tr = null ==> skinti yok, sadece undefined alır
						if (uid == null)
							return true                                                  // continue next events
						let ind = w.getrowboundindexbyid(uid)
						w.clearselection()
						w.selectrow(ind)
						w.ensurerowvisible(ind)
						acc.expand('duzenle')
						return false                                                     // prevent next events
					}
				})
			})
	}
	static async rootFormBuilderDuzenle_tablet_acc_duzenleCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		tanimPart.sonEklemeDuzenleEkranindanmi = false
	}
	static async rootFormBuilderDuzenle_tablet_acc_duzenle(e) {
		let {params: { zorunlu, tablet }} = app
		let {fiyatFra, bedelFra} = zorunlu
		let {fiyatDegistirir, iskDegistirir, iskMaxSayi} = tablet
		let {sender: tanimPart, inst: fis, rfb, item} = e
		let {bedelKullanilirmi} = fis.class
		let {acc, gridPart, gridPart: { gridWidget: w, selectedRec: det } = {}} = tanimPart
		fiyatFra ??= 5; bedelFra ||= 2
		let getDetay = () => gridPart?.selectedRec
		let initFlag = !getDetay()
		if (!initFlag)
			setTimeout(() => initFlag = true, 200)
		let temps = item.temps ??= {}
		let txtMiktar, divBedel
		let updateUI = temps.updateUI = () => {
			// recursive update builders
			let det = getDetay()
			let {detayForm} = rfb.id2Builder
			if (detayForm) {
				for (let fbd of detayForm) {
					let {id} = fbd, value = det?.[id]
					if (value !== undefined)
						fbd.setValue(value)
					fbd.updateVisible()
				}
			}
			if (divBedel) {
				let {netBedel: bedel} = det ?? {}
				divBedel?.html(`${toStringWithFra(bedel ?? 0, bedelFra)}`)
			}
			setTimeout(() => $(document.activeElement)?.select?.())
		}
		// rfb.setAltInst(() => getDetay())
		{
			rfb.addButton('sil')
				.addStyle_wh(38, 38)
				.addStyle(`$elementCSS { top: 5px; right: 100px }`)
				.addCSS('absolute')
				.onClick(e => {
					let {uid} = getDetay()
					if (uid != null) {
						w.deleterow(uid)
						w.selectrow(0)
						w.ensurerowvisible(0)
						txtMiktar?.focus()
						fis.topluHesaplaDefer(e)
					}
					acc?.render()
					updateUI()
				})
			rfb.addButton('tamam')
				.addStyle_wh(38, 38)
				.addStyle(`$elementCSS { top: 5px; right: 15px }`)
				.addCSS('absolute')
				.onClick(e =>
					acc.expand('detay'))
		}
		{
			let timer
			rfb.addSimpleComboBox('stokKod', 'Barkod', 'Yeni Satır eklemek için Barkod giriniz veya Ürün seçiniz')
				.addStyle(`$elementCSS { max-width: 800px }`)
				.etiketGosterim_yok()
				// .autoClear()
				.setMFSinif(MQTabStok)
				.degisince(({ type, events = [], ...rest }) => {
					if (type != 'batch')
						return
					if (!initFlag) {                                      // prevent first async event trigger
						initFlag = true
						return
					}
					let barkodlar = events.map(_ => _.value).filter(_ => _)
					clearTimeout(timer)
					this.barkodOkundu({ ...e, ...rest, tanimPart, barkodlar }).then(() => {
						tanimPart.sonEklemeDuzenleEkranindanmi = true
						timer = setTimeout(() => updateUI(), 10)
					})
				})
				.onAfterRun(({ builder: { rootPart, part } }) => {
					rootPart.dBarkodPart = part
					part.focus()
				})
		}
		let detayForm = rfb.addFormWithParent('detayForm').altAlta()
		detayForm.onAfterRun(({ builder: { layout } }) => {
			layout.on('keydown', ({ key }) => {
				key = key?.toLowerCase()
				if (key == 'enter' || key == 'linefeed') {
					let {sonEklemeDuzenleEkranindanmi, dBarkodPart} = tanimPart
					$(document.activeElement).blur()
					if (sonEklemeDuzenleEkranindanmi && dBarkodPart)
						dBarkodPart.focus()
					else
						acc.expand('detay')
				}
			})
		})
		let degisinceOrtak = ({ input } = {}) => {
			let det = getDetay()
			det.bedelHesapla().htmlOlustur()
			w?.updaterow(det.uid, det)
			fis.topluHesaplaDefer(e)
			acc.render()
			updateUI()
			input?.addClass('degisti')
		}
		{
			let form = detayForm.addFormWithParent().yanYana()
				.addStyle(`$elementCSS > div:not(:first-child) { margin-left: 20px }`)
			form.addNumberInput('miktar', 'Miktar', 'Miktar')
				.addStyle_wh(110)
				.setMin(0).setMax(10000)
				.degisince(({ builder: { input }, value }) => {
					getDetay().miktar = value
					degisinceOrtak({ input })
				})
				.onAfterRun(({ builder: { input } }) =>
					txtMiktar = tanimPart.txtMiktar = input)
			if (bedelKullanilirmi) {
				form.addSelectElement('kdvOrani', 'KDV %')
					.addStyle_wh(80)
					.setSource(MQVergiKdv.sabitOranlar.map(_ => new CKodVeAdi([_, _])))
					[fiyatDegistirir ? 'editable' : 'readOnly']()
					.degisince(({ builder: { input }, value }) => {
						getDetay().kdvOrani = asFloat(value)
						degisinceOrtak({ input })
					})
					.onAfterRun(({ builder: { input } }) =>
						tanimPart.ddKdvOrani = input)
			}
		}
		if (bedelKullanilirmi) {
			let form = detayForm.addFormWithParent().yanYana()
				.addStyle(`$elementCSS > div:not(:first-child) { margin-left: 20px }`)
			form.addNumberInput('fiyat', 'Fiyat', 'Fiyat')
				.addStyle_wh(150).setFra(fiyatFra)
				.setMin(0).setMax(10_000_000)
				[fiyatDegistirir ? 'editable' : 'readOnly']()
				.degisince(({ builder: { input }, value }) => {
					getDetay().fiyat = value
					degisinceOrtak({ input })
				})
				.onAfterRun(({ builder: { input } }) =>
					tanimPart.txtFiyat = input)
			form.addDiv('_bedel', 'Bedel')
				.addStyle_wh(200)
				.addStyle(
					`$elementCSS { }
					$elementCSS > div { width: var(--full); padding: 5px; border: 1px solid #333; border-radius: 10px }`
				)
				.addCSS('fs-110 bold forestgreen right')
				.onAfterRun(({ builder: { input } }) =>
					divBedel = tanimPart.divBedel = input)
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_onExpand({ sender: { parentPart: tanimPart = {} }, acc, id, item }) {
		super.rootFormBuilderDuzenle_tablet_acc_onExpand(...arguments)
		let {barkodPart, dBarkodPart, txtMiktar} = tanimPart, {temps, contentLayout} = item
		switch (id) {
			case 'detay': {
				barkodPart?.clear()
				barkodPart?.focus()
				break
			}
			case 'duzenle': {
				contentLayout?.find('.degisti')?.removeClass('degisti')
				dBarkodPart?.clear()
				txtMiktar?.focus()
				setTimeout(() => {
					if (!txtMiktar)
						txtMiktar = tanimPart.txtMiktar
					txtMiktar?.focus()
					temps?.updateUI?.()
				}, 100)
				break
			}
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_onCollapse({ sender: { parentPart: tanimPart = {} }, id, acc }) {
		super.rootFormBuilderDuzenle_tablet_acc_onCollapse(...arguments)
		if (id != 'detay' && !acc.hasActivePanel)
			acc.expand('detay')
	}
}
