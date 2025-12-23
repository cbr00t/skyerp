class TabTahsilatFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABTAH' } static get sinifAdi() { return 'Karma Tahsilat' }
	static get detaySinif() { return TabTahsilatDetay } static get almSat() { return 'T' }
	get tahsilBedel() {
		let {toplamBedel, detaylar} = this
		if (!toplamBedel)
			return 0
		return roundToBedelFra(topla(_ => _.bedel, detaylar))
	}
	get kalanBedel() {
		let {toplamBedel, detaylar} = this
		return toplamBedel ? roundToBedelFra(toplamBedel - this.tahsilBedel) : 0
	}

	constructor(e = {}) {
		super(e)
		for (let k of ['toplamBedel']) {
			let v = e[k]
			if (v !== undefined)
				this[k] = v
		}
	}
	async yeniTanimOncesiVeyaYukleSonrasiIslemler({ fis }) {
		let {detaylar, class: { detaySinif }} = this
		let kod2Det = fromEntries(detaylar.map(_ => [_.tahSekliNo, _]))
		this.detaylar = (await MQTabTahsilSekli.loadServerData())
			.filter(_ => _.tahsiltipi)
			.map(({ kodno: tahSekliNo, aciklama: tahSekliAdi, tahsiltipi: tip, ahalttipi: altTip }) => {
				let det = kod2Det[tahSekliNo] ?? {}
				let {bedel = 0, aciklama = ''} = det
				return new detaySinif({ tahSekliNo, tahSekliAdi, tip, altTip, bedel, aciklama })
			})
		return await super.yeniTanimOncesiVeyaYukleSonrasiIslemler(...arguments)
	}
	async kaydetOncesiIslemler(e) {
		this.detaylar = this.detaylar.filter(_ => _.bedel)
		return await super.kaydetOncesiIslemler(e)
	}
	static async loadServerData_detaylar({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabTahsilSekli]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		return await super.loadServerData_detaylar(...arguments)
	}

	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		// let {sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm, acc} = e
	}
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		await super.rootFormBuilderDuzenle_tablet_acc(e)
		// let {sender: tanimPart, acc, getBuilder} = e
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_dipCollapsed(...arguments)
		let {sonucBedel, detaylar: { length: topSatir }} = fis
		if (topSatir) {
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					`<div class="orangered"><b>${toStringWithFra(sonucBedel, 2)}</b> TL</div>`,
					`<div class="royalblue"><b>${numberToString(topSatir)}</b> Tahsil Tipi</div>`,
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
					`<div class="orangered bold">${det.tahSekliAdi || ''}</div>`,
					`<div class="royalblue bold"${toStringWithFra(det.bedel, 2)} TL</div>`,
				`</div>`
			].join(CrLf)))
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_detay({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detay(...arguments)
		let {acc} = tanimPart, {detaylar} = fis
		{
			let cellClassName = (sender, rowIndex, belirtec, value, rec) => {
				let result = [belirtec]
				if (belirtec == 'bedel' && rec?._degisti)
					result.push('bg-lightgreen')
				return result.join(' ')
			}
			rfb.addGridliGiris_sabit('grid')
				.addStyle_fullWH(null, `calc(var(--full) - 20px)`)
				.rowNumberOlmasin().notAdaptive()
				.widgetArgsDuzenleIslemi(({ args }) => $.extend(args, {
					rowsHeight: 70, selectionMode: 'singlerow'
				}))
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'tahSekliAdi', text: 'Tahsil Şekli', cellClassName }).readOnly(),
					new GridKolon({
						belirtec: 'bedel', text: 'Bedel', genislikCh: 15, cellClassName,
						cellValueChanged: ({ belirtec, rowIndex, value, gridWidget: w, gridRec: det }) =>  {
							det._degisti = true
							w.updaterow(det.uid, det)
							acc?.render()
						}
					}).tipDecimal_bedel(),
					new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 6 })
						.tipButton('X')
						.onClick(({ gridRec, args: { owner: w } }) => {
							gridRec.bedel = 0
							w.update(gridRec.uid, gridRec)
							acc?.render()
						})
				])
				.setSource(detaylar)
				.onAfterRun(({ builder: { rootPart, part } }) => {
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
							let {kalanBedel} = fis
							if (kalanBedel > 0) {
								let det = w.getrowdatabyid(uid)
								$.extend(det, { _degisti: true, bedel: kalanBedel })
								w.updaterow(uid, det)
							}
							return false                                                     // prevent next events
						}
					})
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
