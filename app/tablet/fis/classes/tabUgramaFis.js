class TabUgramaFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABUGR' } static get sinifAdi() { return 'Uğrama' }
	static get onlineFisSinif() { return TabUgramaOnlineFis }

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			nedenKod: new PInstStr('nedenkod')
		})
	}
	async yeniTanimOncesiVeyaYukleSonrasiIslemler({ fis }) {
		let {detaylar, class: { detaySinif }} = this
		let kod2Det = fromEntries(detaylar.map(_ => [_.tahSekliNo, _]))
		this.detaylar = (await MQTabUgramaNeden.loadServerData()).filter(_ => _.kod)
		return await super.yeniTanimOncesiVeyaYukleSonrasiIslemler(...arguments)
	}
	async kaydetOncesiIslemler(e) {
		this.detaylar = []
		return await super.kaydetOncesiIslemler(e)
	}
	static async loadServerData_detaylar({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabUgramaNeden]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		return await super.loadServerData_detaylar(...arguments)
	}
	async onlineFisDuzenle({ oFis }) {
		super.onlineFisDuzenle(...arguments)
		let {mustKod, nedenKod} = this
		let {detaySinif: oDetSinif} = oFis.class
		oFis.detaylar = [ new oDetSinif({ mustKod, nedenKod }) ]
	}

	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		// let {sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm, acc} = e
	}
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		await super.rootFormBuilderDuzenle_tablet_acc(e)
		let {acc} = e
		acc.delete('dip')
		// let {sender: tanimPart, acc, getBuilder} = e
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dipCollapsed(...arguments)
	}
	static async rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detayCollapsed(...arguments)
		let {nedenKod: kod} = fis
		let {[kod]: aciklama} = await MQTabUgramaNeden.getGloKod2Adi() ?? {}
		if (aciklama) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					`<div class="royalblue bold">${aciklama}</div>`,
				`</div>`
			].join(CrLf)))
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_detay({ sender: tanimPart, inst: fis, rfb, item }) {
		item.title = 'Nedenler'
		await super.rootFormBuilderDuzenle_tablet_acc_detay(...arguments)
		let {acc} = tanimPart, {detaylar} = fis
		let gridPart
		{
			let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
				let result = [belirtec]
				return result.join(' ')
			}
			rfb.addGridliGosterici('grid')
				.addStyle_fullWH(null, `calc(var(--full) - 20px)`)
				.rowNumberOlmasin().notAdaptive()
				.widgetArgsDuzenleIslemi(({ args }) => $.extend(args, {
					rowsHeight: 70, selectionMode: 'singlerow'
				}))
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', cellClassName }).readOnly()
				])
				.setSource(detaylar)
				.onAfterRun(({ builder: { rootPart, part } }) => {
					gridPart = rootPart.gridPart = part
					let {gridWidget: w} = part, {nedenKod} = fis
					$.extend(part, {
						gridSatirTiklandiBlock: ({ sender: tanimPart, event: { args } = {} }) => {
							let {selectedRec: det} = tanimPart ?? {}
							fis.nedenKod = det?.kod ?? ''
							acc?.render()
						}
					})
					if (nedenKod) {
						let handler = e => {
							let {boundRecs: recs} = gridPart
							let ind = recs.findIndex(_ => _.kod == nedenKod)
							if (ind > -1) {
								w.clearselection()
								w.selectrow(ind)
							}
						}
						let {bindingCompleteBlock: savedHandler} = gridPart
						part.veriYuklenince(e => {
							part.veriYuklenince(savedHandler)
							handler(e)
						})
					}
				})
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_onExpand({ sender: { parentPart: tanimPart = {} }, acc, id, item }) {
		super.rootFormBuilderDuzenle_tablet_acc_onExpand(...arguments)
		let {gridPart} = tanimPart
		if (id == 'detay')
			gridPart?.focus()
	}
	static rootFormBuilderDuzenle_tablet_acc_onCollapse({ sender: { parentPart: tanimPart = {} }, id, acc }) {
		super.rootFormBuilderDuzenle_tablet_acc_onCollapse(...arguments)
		if (id != 'detay' && !acc.hasActivePanel)
			acc.expand('detay')
	}
}

class TabUgramaOnlineFis extends MQDetayliOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	// fis: plasiyersonuc  =>  har: plas2musugramasonuc
	static get table() { return 'plasiyersonuc' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return TabUgramaOnlineDetay }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			tarih: new PInstDateNow('tarih'),
			plasiyerKod: new PInstStr('plasiyerkod')
		})
	}
	keyHostVarsDuzenle({ hv }) {
		super.keyHostVarsDuzenle(...arguments)
		let {tarih, plasiyerKod: plasiyerkod} = this
		$.extend(hv, { tarih, plasiyerkod })
	}
	keySetValues({ rec }) {
		super.keySetValues(...arguments)
		let {tarih, plasiyerkod: plasiyerKod} = rec
		$.extend(this, { tarih, plasiyerKod })
	}
}
class TabUgramaOnlineDetay extends MQDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'plas2musugramasonuc' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			mustKod: new PInstStr('must'),
			nedenKod: new PInstStr('nedenkod')
		})
	}
}
