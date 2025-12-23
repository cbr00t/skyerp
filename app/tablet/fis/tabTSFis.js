// class MQTabTestFis extends mixin($TabFisTemplate, MQGenelFis) {
class TabTSFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABTS' } static get sinifAdi() { return 'Tablet Fiş' }
	static get detaySinif() { return TabTSDetay } static get almSat() { return 'T' }
	
	static pTanimDuzenle({ pTanim }) {
		// MQOrtakFis.pTanimDuzenle(...arguments)
		super.pTanimDuzenle(...arguments)
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

	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		let {sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm, acc} = e
		// tanimForm.addForm().setLayout(() => $(`<p><h3>hello world from ${this.name}</h3></p>`))
	}
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		await super.rootFormBuilderDuzenle_tablet_acc(e)
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
				if (rfb.builders?.length)
					setTimeout(() => rfb.run(), 100)
			}
		})
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dipCollapsed(...arguments)
		let {fisTopNet, detaylar: { length: topSatir }} = fis
		if (topSatir) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					`<div class="orangered"><b>${fisTopNet}</b> TL</div>`,
					`<div class="royalblue"><b>${topSatir}</b> satır</div>`,
				`</div>`
			].join(CrLf)))
		}
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
		await super.rootFormBuilderDuzenle_tablet_acc_detay(...arguments)
		let {acc} = tanimPart, {detaylar} = fis
		rfb.addSimpleComboBox('barkod', 'Barkod', 'Barkod giriniz veya Ürün seçiniz')
			.addStyle(`$elementCSS { max-width: 800px }`)
			.etiketGosterim_yok().autoClear()
			.setMFSinif(MQTabStok)
			//.noMF()
			.degisince(({ type, events = [], ...rest }) => {
				if (type != 'batch')
					return
				let barkodlar = events.map(_ => _.value).filter(_ => _)
				this.barkodOkundu({ ...arguments, ...rest, tanimPart, barkodlar })	
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
				new GridKolon({ belirtec: '_text', text: 'Ürün' }),
				new GridKolon({ belirtec: 'netBedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel(),
				new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 6 })
					.tipButton('X')
					.onClick(({ gridRec, args: { owner: w } }) => {
						w.deleterow(gridRec.uid)
						acc?.render()
					})
			])
			.setSource(detaylar)
			.onAfterRun(({ builder: { rootPart, part } }) => {
				let {grid} = part
				rootPart.gridPart = part
				$.extend(part, {
					gridSatirCiftTiklandiBlock: ({ sender: tanimPart = {}, event: { args = {} } = {} }) => {
						let {gridWidget: w, selectedRec: det} = tanimPart
						let {row: { bounddata: _det } = {}} = args
						let {uid} = det ?? {}
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
	static async rootFormBuilderDuzenle_tablet_acc_duzenleCollapsed({ sender: tanimPart, inst: fis, rfb }) { }
	static async rootFormBuilderDuzenle_tablet_acc_duzenle(e) {
		let {sender: tanimPart, inst: fis, rfb, item} = e
		let {acc, gridPart, gridPart: { gridWidget: w, selectedRec: det } = {}} = tanimPart
		let {depomu, params: { zorunlu, tablet }} = app
		let {fiyatFra, bedelFra} = zorunlu
		let {depoBedelGorur: bedelGorur, fiyatDegistirir, iskDegistirir, iskMaxSayi} = tablet
		fiyatFra ??= 5; bedelFra ||= 2
		if (!depomu)
			bedelGorur = true
		let getDetay = () => gridPart.selectedRec
		let initFlag = !getDetay()
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
				.etiketGosterim_yok().autoClear()
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
					this.barkodOkundu({ ...e, ...rest, tanimPart, barkodlar }).then(() =>
						timer = setTimeout(() => updateUI(), 10))
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
					$(document.activeElement).blur()
					acc.expand('detay')
				}
			})
		})
		let degisinceOrtak = ({ input } = {}) => {
			let det = getDetay()
			det.bedelHesapla()
			det.htmlOlustur()
			w?.updaterow(det.uid, det)
			acc.render()
			updateUI()
			input?.addClass('degisti')
		}
		let form = detayForm.addFormWithParent().yanYana()
		{
			form.addNumberInput('miktar', 'Miktar', 'Miktar')
				.addStyle_wh(150)
				.degisince(({ builder: { input }, value }) => {
					getDetay().miktar = value
					degisinceOrtak({ input })
				})
				.onAfterRun(({ builder: { input } }) =>
					txtMiktar = tanimPart.txtMiktar = input)
		}
		if (bedelGorur) {
			form.addNumberInput('fiyat', 'Fiyat', 'Fiyat')
				.addStyle_wh(200).setFra(fiyatFra)
				[fiyatDegistirir ? 'editable' : 'readOnly']()
				.degisince(({ builder: { input }, value }) => {
					getDetay().fiyat = value
					degisinceOrtak({ input })
				})
				.onAfterRun(({ builder: { input } }) =>
					tanimPart.txtFiyat = input)
			//
			// ... kdv, isk. vs ...
			//
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
		let {gridPart = {}, barkodPart, dBarkodPart, txtMiktar} = tanimPart
		let {selectedRec: det} = gridPart
		let {temps, contentLayout} = item
		switch (id) {
			case 'detay': {
				barkodPart?.focus()
				break
			}
			case 'duzenle': {
				contentLayout?.find('.degisti')?.removeClass('degisti')
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
	static rootFormBuilderDuzenle_tablet_acc_onCollapse({ sender: { parentPart: tanimPart }, id, acc }) {
		super.rootFormBuilderDuzenle_tablet_acc_onCollapse(...arguments)
		switch (id) {
			case 'detay':
				break
			default: {
				if (!acc.hasActivePanel)
					acc.expand('detay')
				break
			}
		}
	}

	static async barkodOkundu({ tanimPart, barkodlar }) {
		let results = await Promise.allSettled(barkodlar.map(barkod => app.barkodBilgiBelirle({ barkod })))
		results = results
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
					w.addrow(null, det, 'first')
				}
			}
			finally {
				w.endupdate(false)
				w.clearselection()
				w.selectrow(0)
				w.ensurerowvisible(0)
				acc?.render()
			}
		}
	}
}
