// class MQTabTestFis extends mixin($TabFisTemplate, MQGenelFis) {
class TabTSFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return super.araSeviyemi || this == TabTSFis }
	static get kodListeTipi() { return 'TABTS' } static get sinifAdi() { return 'Ticari/Stok Fiş' }
	static get detaySinif() { return TabTSDetay } static get almSat() { return 'T' }
	static get barkodGirisYapi() {
		return {
			etiket: 'Barkod',
			placeholder: 'Yeni Satır eklemek için Barkod giriniz veya Ürün seçiniz'
		}
	}

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
	static async loadServerDataDogrudan({ offlineRequest, offlineMode } = {}) {
		/*if (!offlineRequest) {
			let cacheClasses = [MQTabStok]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}*/
		return await super.loadServerDataDogrudan(...arguments)
	}
	static async loadServerData_detaylar({ offlineRequest, offlineMode } = {}) {
		if (!offlineRequest) {
			let { stokSinif } = this.detaySinif
			let cacheClasses = [stokSinif]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		return await super.loadServerData_detaylar(...arguments)
	}
	async dataDuzgunmuDuzenle({ eskiInst: eskiFis, parentPart, gridPart, result }) {
		let { yerKod } = this
		if (yerKod && !await MQTabYer.kodVarmi(yerKod))
			result.push(`<b>Yer (Depo) [<span class=firebrick>${yerKod}</span>]</b> hatalıdır`)
		return await super.dataDuzgunmuDuzenle(...arguments)
	}

	static async barkodOkundu({ tanimPart, barkodlar }) {
		let e = arguments[0]
		let barkodYapilar = barkodlar.filter(Boolean).map(barkod => {
			let carpan = 1
			let barkodLower = barkod?.toLowerCase() ?? ''
			for (let s of ['x', '*']) {
				let i = barkodLower.indexOf(s)
				if (i != -1) {
					carpan = asFloat(barkod.slice(0, i))
					barkod = barkod.slice(i + 1).trimEnd()
					break
				}
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
	tanimUI_gridVeriYuklenince({ tanimPart, gridPart }) {
		if (!gridPart._gridVeriYuklenince_fixFlag && this.detaylar != gridPart.boundRecs) {
			gridPart._gridVeriYuklenince_fixFlag = true
			gridPart.tazele()
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
		let { depomu, params: { tablet } } = app
		let bakiyeGosterim = tablet[`${depomu ? 'depo' : 'ss'}MusteriBakiye`] != false
		let { mustKod, dvKod, yerKod } = fis
		let { dipIslemci = {}, detaylar: { length: topSatir } } = fis
		let { brut, topIskBedel, topKdv, sonuc } = dipIslemci
		let mustRec = ( mustKod ? (await MQTabCari.getGloKod2Rec())?.[mustKod] : null ) ?? {}
		dvKod ||= 'TL'
		let layoutList = []
		if (mustRec) {
			let { [mustKod]: rec } = await MQTabMusDurum.getGloKod2Rec() ?? {}
			let bakiye = rec?.orjBakiye + rec?.tabBakiye
			let kalanRisk = rec?.orjKalanRisk + rec?.tabKalanRisk
			let takipBorc = rec?.orjTakipBorc + rec?.tabTakipBorc
			let bakiyeRenk = bakiye ? ( bakiye < 0 ? 'orangered' : 'forestgreen' ) : '_'
			let kalanRiskRenk = kalanRisk ? ( kalanRisk < 0 ? 'forestgreen' : 'orangered' ) : '_'
			let takipBorcRenk = takipBorc ? ( takipBorc < 0 ? 'orangered' : 'forestgreen' ) : '_'
			layoutList.push(...[
				( bakiyeGosterim ? (
					`<div class="item flex-row" style="gap: 5px">` +
						( takipBorc ? `<span class="takipBorc etiket gray">TKP: </span>` : '' ) +
						( takipBorc ? `<span class="takipBorc veri bold ${takipBorcRenk}">${takipBorc ? `${bedelToString(takipBorc)}` : '-'}</span>` : '' ) +
						( takipBorc ? `<span class="takipBorc separator lightgray"> | </span>` : '' ) +
						( kalanRisk ? `<span class="kalanRisk etiket gray">KR: </span>` : '' ) +
						( kalanRisk ? `<span class="kalanRisk veri bold ${kalanRiskRenk}">${kalanRisk ? `${bedelToString(kalanRisk)}` : '-'}</span>` : '' ) +
						( kalanRisk ? `<span class="kalanRisk separator lightgray"> | </span>` : '' ) +
						( bakiye ? `<span class="bakiye etiket gray">BK: </span>` : '' ) +
						( bakiye ? `<span class="bakiye veri bold ${bakiyeRenk}">${bakiye ? `${bedelToString(bakiye)}` : '-'}</span>` : '' ) +
					`</div>`
				) : null )
			].filter(Boolean))
		}
		if (yerKod) {
			let aciklama = (await MQTabYer.getGloKod2Adi(yerKod)) || yerKod
			layoutList.push(...[
				`<div class="item">` +
					 `<span class="yer etiket lightgray">Yer:</span>` +
					 `<span class="yer veri rebeccapurple bold">${aciklama}</span>` +
				`</div>`
			].filter(Boolean))
		}

		layoutList = layoutList?.filter(Boolean)
		if (!empty(layoutList)) {
			rfb.addForm().setLayout(() => {
				/*layoutList = [
					`<div style="gap: 10px">`,
					...layoutList,
					`</div>`
				]*/
				return $(layoutList.join(CrLf))
			})
		}
		
		await super.rootFormBuilderDuzenle_tablet_acc_baslikCollapsed(...arguments)
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslik({ sender: tanimPart, inst: fis, rfb, acc }) {
		let e = arguments[0]
		let { siparismi } = this
		await super.rootFormBuilderDuzenle_tablet_acc_baslik(e)
		{
			let { wndId } = tanimPart.wndPart
			let mfSinif = MQTabYer.getMFSinif_subeFiltreli(() => fis.subeKod, wndId)
			let { sinifAdi: etiket } = mfSinif
			let form = rfb.addFormWithParent().altAlta()
			if (!siparismi) {
				form.addSimpleComboBox('yerKod', etiket, etiket)
					.etiketGosterim_yok()
					.kodsuz().setMFSinif(mfSinif)
					.degisince(({ type, events, ...rest }) => {
						if (type == 'batch') {
							let _e = { type, events, ...rest, oldValue: fis.yerKod, value: events.at(-1).value?.trimEnd() }
							setTimeout(() => {
								fis.yerDegisti({ ...e, ..._e, tanimPart })
								acc?.render()
							}, 5)
						}
					})
					.onAfterRun(({ builder: { part } }) =>
						tanimPart.ddYer = part)
			}
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dipCollapsed(...arguments)
		let { depomu, params: { tablet } } = app
		let bakiyeGosterim = tablet[`${depomu ? 'depo' : 'ss'}MusteriBakiye`] != false
		let { mustKod, dvKod } = fis
		let { dipIslemci = {}, detaylar: { length: topSatir } } = fis
		let { brut, topIskBedel, topKdv, sonuc } = dipIslemci
		dvKod ||= 'TL'
		let layoutList = []
		if (sonuc) {
			layoutList.push(...[
				`<div class="item flex-row" style="gap: 10px">`,
					( topIskBedel || topKdv ?
						`<div>` +
							 `<span class="brut etiket lightgray">BR: </span>` +
							 `<span class="brut veri">${bedelToString(brut)}</span>` +
						`</div>`
					: null ),
					( topKdv ?
						`<div>` +
							 `<span class="kdv etiket lightgray">KD: </span>` +
							 `<span class="kdv veri">${bedelToString(topKdv)}</span>` +
						`</div>`
					: null ),
					( sonuc ?
						`<div>` +
							`<span class="sonuc etiket lightgray">Top: </span>` +
							`<span class="sonuc veri forestgreen bold">${bedelToString(sonuc)} ${dvKod}</span>` +
						`</div>`
					: null ),
					(
						`<div>` +
							`<span class="topSatir veri orangered"><b>${numberToString(topSatir)}</b> satır</span>` +
						 `</div>`
					),
				`</div>`
			].filter(Boolean))
		}
		
		layoutList = layoutList?.filter(Boolean)
		if (!empty(layoutList)) {
			rfb.addForm().setLayout(() => {
				/*layoutList = [
					`<div style="gap: 10px">`,
					...layoutList,
					`</div>`
				]*/
				return $(layoutList.join(CrLf))
			})
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_dip({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dip(...arguments)
		let { acc } = tanimPart
		let { dvKod, dipIslemci, detaylar } = fis
	}
	static async rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detayCollapsed(...arguments)
		let { gridPart: { selectedRec: det } = {} } = tanimPart
		let { length: topSayi } = fis.detaylar
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
		let { depomu } = app, { tablet: { depoBedelGorur } = {} } = app.params
		let { acc } = tanimPart, { detaySinif, bedelKullanilirmi } = fis.class
		let { stokSinif } = detaySinif
		bedelKullanilirmi &&= !(depomu && depoBedelGorur === false)
		rfb.addSimpleComboBox('barkod', 'Barkod', 'Barkod giriniz veya Ürün seçiniz')
			.addStyle(`$elementCSS { max-width: 800px }`)
			.etiketGosterim_yok()
			// .autoClear()
			.setMFSinif(stokSinif)
			//.noMF()
			.degisince(({ type, events = [], ...rest }) => {
				if (type == 'batch') {
					let barkodlar = events.map(_ => _.value).filter(_ => _)
					this.barkodOkundu({ ...arguments, ...rest, tanimPart, barkodlar })
					tanimPart.sonEklemeDuzenleEkranindanmi = false
				}
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
				(bedelKullanilirmi ? new GridKolon({
					belirtec: 'bedel', text: 'Bedel', genislikCh: 11, filterType: 'checkedlist',
					cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
						let ekCSS = $(window).width() < 500 ? ' pt-1' : ''
						return changeTagContent(html, (
							// `<div>&nbsp;</div>` +
							`<div class="royalblue bold${ekCSS}">${getTagContent(html)}</div>`
						))
					}
				}).tipDecimal_bedel() : null),
				new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 4 })
					.tipButton('X')
					.onClick(({ gridRec, args: { owner: w } }) => {
						w.deleterow(gridRec.uid)
						tanimPart.sonEklemeDuzenleEkranindanmi = false
						fis.topluHesaplaDefer(e)
						acc?.render()
					})
			].filter(Boolean))
			.setSource(() => {
				fis = tanimPart?.inst ?? fis
				return fis?.detaylar
			})
			.onAfterRun(({ builder: fbd, builder: { rootPart, part: gridPart, part: { gridWidget: gw } } }) => {
				rootPart.gridPart = gridPart
				$.extend(gridPart, {
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
				{
					let { bindingCompleteBlock: savedHandler } = gridPart
					let veriYuklenince = async (...rest) => {
						try {
							fis = tanimPart?.fis ?? fis
							await fis.tanimUI_gridVeriYuklenince({ ...e, ...rest, tanimPart, gridPart, fbd })
						}
						finally { await savedHandler?.call(this, ...rest) }
					}
					gridPart.veriYuklenince(veriYuklenince)
				}
			})
	}
	static async rootFormBuilderDuzenle_tablet_acc_duzenleCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		tanimPart.sonEklemeDuzenleEkranindanmi = false
	}
	static async rootFormBuilderDuzenle_tablet_acc_duzenle(e) {
		let { params: { zorunlu, tablet } } = app
		let { fiyatFra, bedelFra } = zorunlu
		let { fiyatDegistirir, iskDegistirir, iskMaxSayi = 3 } = tablet
		let { sender: tanimPart, inst: fis, rfb, item } = e
		let { class: fisSinif } = fis
		let { bedelKullanilirmi, detaySinif, ticarimi } = fisSinif
		let { stokSinif } = detaySinif
		let { acc, gridPart = {}, barkodGirisYapi = {} } = tanimPart
		let { gridWidget: w, selectedRec: det } = gridPart
		fiyatFra ??= 5; bedelFra ||= 2
		let getDetay = () =>
			gridPart?.selectedRec ?? {}
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
					let { uid } = getDetay()
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
			rfb.addSimpleComboBox('stokKod',
				barkodGirisYapi.etiket ?? 'Barkod',
				barkodGirisYapi.placeholder ?? 'Yeni Satır eklemek için Barkod giriniz veya Ürün seçiniz'
			)
				.addStyle(`$elementCSS { max-width: 800px }`)
				.etiketGosterim_yok()
				// .autoClear()
				.setMFSinif(stokSinif)
				.degisince(({ type, events = [], ...rest }) => {
					if (type == 'batch') {
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
					}
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
				form.addSelect('kdvOrani', 'KDV %')
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
		if (ticarimi) {
			if (iskMaxSayi) {
				let form = detayForm.addFormWithParent().yanYana()
					.addStyle(`$elementCSS > div:not(:first-child) { margin-left: 20px }`)
				for (let i = 1; i <= iskMaxSayi; i++) {
					form.addNumberInput(`iskOran${i}`, `İsk${i}`, `İsk${i}`)
						.addStyle_wh(90).setFra(1)
						.setMin(0).setMax(100)
						[iskDegistirir ? 'editable' : 'readOnly']()
						.degisince(({ builder: { id, input }, value }) => {
							getDetay()[id] = value
							degisinceOrtak({ input })
						})
				}
			}
			
			let form = detayForm.addFormWithParent().yanYana()
				.addStyle(`$elementCSS > div:not(:first-child) { margin-left: 20px }`)
			for (let { ioAttr, etiket, numerikmi, kami, mfSinif } of HMRBilgi) {
				let fbd
				if (kami && mfSinif) {
					fbd = form.addSimpleComboBox(ioAttr, etiket, etiket)
						.setMFSinif(mfSinif)
						.degisince(({ sender: { input }, type, events = [], ...rest }) => {
							if (type == 'batch') {
								let { value } = events.at(-1) ?? {}
								getDetay()[ioAttr].value = numerikmi ? asFloat(value) : (value ?? '')
								degisinceOrtak()
							}
						})
						.addStyle_wh(250)
				}
				else {
					fbd = form[numerikmi ? 'addNumberInput' : 'addTextInput'](ioAttr, etiket, etiket)
						.degisince(({ builder: { input, value } }) => {
							getDetay()[ioAttr].value = numerikmi ? asFloat(value) : (value ?? '')
							degisinceOrtak({ input })
						})
						.addStyle_wh(150)
				}
				
				if (fbd)
					fbd.etiketGosterim_yok()
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
