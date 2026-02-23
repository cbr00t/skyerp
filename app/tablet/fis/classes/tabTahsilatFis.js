class TabTahsilatFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABTAH' } static get sinifAdi() { return 'Karma Tahsilat' }
	static get detaySinif() { return TabTahsilatDetay } static get almSat() { return 'T' }
	static get onlineFisSinif() { return CariTahsilatFis }
	static get bedelKullanilirmi() { return true }
	static get tahsilatmi() { return true }
	get dokumDetaylar() {
		return super.dokumDetaylar.filter(_ => _.bedel)
	}
	get tahsilBedel() {
		let {detaylar} = this
		return roundToBedelFra(topla(_ => _.bedel, detaylar))
	}
	get kalanBedel() {
		let {hedefBedel, detaylar} = this
		return hedefBedel ? roundToBedelFra(hedefBedel - this.tahsilBedel) : 0
	}

	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			tahFisId: new PInstStr('tahfisid'),
			hedefBedel: new PInstNum()
		})
	}
	static async loadServerData_detaylar({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabTahsilSekli]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		return await super.loadServerData_detaylar(...arguments)
	}
	async yeniTanimOncesiVeyaYukleSonrasiIslemler(e) {
		let {detaylar, class: { detaySinif }} = this
		let kod2Det = fromEntries(detaylar.map(_ => [_.tahSekliNo, _]))
		this.detaylar = (await MQTabTahsilSekli.loadServerData())
			.filter(_ => _.tahsiltipi)
			.map(({ kodno: tahSekliNo, aciklama: tahSekliAdi, tahsiltipi: tip, ahalttipi: altTip }) => {
				let det = kod2Det[tahSekliNo] ?? {}
				let {bedel = 0, aciklama = ''} = det
				return new detaySinif({ tahSekliNo, tahSekliAdi, tip, altTip, bedel, aciklama })
			})
		return await super.yeniTanimOncesiVeyaYukleSonrasiIslemler(e)
	}
	async yukleSonrasiIslemler({ islem }) {
		let e = arguments[0]
		await super.yukleSonrasiIslemler(e)
		let {_noCheck, tahFisId: asilFisId} = this
		if (!_noCheck && asilFisId && islem == 'degistir') {    // Ticari belgeye bağlı Tahsilat değiştirilemez
			islem = e.islem = 'izle'
			setTimeout(() => wConfirm(`Bu Tahsilat, Ticari belgeye bağlı olduğu için değişiklik yapılamaz`, 'UYARI'), 200)
		}
	}
	async kaydetOncesiIslemler(e) {
		this.detaylar = this.detaylar.filter(_ => _.bedel)
		return await super.kaydetOncesiIslemler(e)
	}
	async silmeOncesiIslemler(e = {}) {
		let {_noCheck, tahFisId: asilFisId} = this
		if (!(_noCheck || asilFisId)) {
			let {id, class: { idSaha, table }} = this
			let sent = new MQSent(), {where: wh, sahalar} = sent
			sent.fromAdd(table)
			wh.degerAta(id, idSaha)
			sahalar.add('tahfisid')
			asilFisId = this.tahFisId = await this.sqlExecTekilDeger(sent)
		}
		if (!_noCheck && asilFisId)
			throw { isError: true, errorText: `Bu Tahsilat bir Ticari Belgeye bağlıdır ve silinemez. Lütfen önce Ticari Belgeyi siliniz` }
		await super.silmeOncesiIslemler(e)
	}
	
	getDokumForm(e) {
		let bedelX = 22
		let data = ({
			dipYok: false, dipX: bedelX - 20,
			// sayfaBoyut: { x: 60, y: 58 },
			otoYBasiSonu: { x: 8 },
			sabit: [
				{ key: 'fisTipText', pos: { x: 5, y: 2 }, length: 19 },
				{ text: '[islemTarih] [islemZaman]', pos: { x: 40, y: 3 } },
				{ text: 'SAYIN [mustUnvan],', pos: { x: 1, y: 5 }, length: 55 },
				{ text: '[vergiDairesi] [vergiNo]', pos: { x: 5, y: 6 }, length: 40 },
				{ text: '** BİLGİ FİŞİ **', pos: { x: 5, y: -1 }, length: 50 }
			],
			detay: [
				{ key: 'tahSekliAdi', pos: { x: 2, y: 1 }, length: 18 },
				{ key: 'bedel', pos: { x: bedelX, y: 1 }, length: 15, right: true }
			],
			oto: [
				{ key: 'yalnizText', x: 2 },
				{ key: 'bakiyeText', x: 2 },
				{ key: 'notlar', x: 2 }
			]
		})
		return new TabDokumForm(data)
	}
	
	noCheck() { this._noCheck = true; return this }

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
		let {kalanBedel, sonucBedel, detaylar} = fis
		let topSatir = detaylar.filter(_ => _.bedel).length
		rfb.addForm().setLayout(() => $([
			`<div class="flex-row" style="gap: 10px">`,
				(kalanBedel ? `<div style="margin-right: 20px"><span>Kalan:</span> <b class=forestgreen>${toStringWithFra(kalanBedel, 2)}</b> TL</div>` : null),
				(topSatir ? `<div class="orangered"><b>${toStringWithFra(sonucBedel, 2)}</b> TL</div>` : null),
				(topSatir ? `<div class="royalblue"><b>${numberToString(topSatir)}</b> satır</div>` : null),
			`</div>`
		].filter(Boolean).join(CrLf)))
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
		let gridPart
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
					rowsHeight: 70, selectionMode: 'singlerow',
					editMode: 'selectedcell'
				}))
				.setTabloKolonlari([
					new GridKolon({ belirtec: 'tahSekliAdi', text: 'Tahsil Şekli', cellClassName }).readOnly(),
					new GridKolon({
						belirtec: 'bedel', text: 'Bedel', genislikCh: 15, cellClassName,
						cellValueChanged: ({ belirtec, rowIndex, value, gridWidget: w, gridRec: det }) =>  {
							det._degisti = true
							w.updaterow(det.uid, det)
							acc?.render()
							if (gridPart) {
								setTimeout(() => {
									let {selectedBelirtec: newBelirtec, selectedRowIndex: newRowIndex, gridWidget: w} = gridPart
									if (newBelirtec == belirtec && newRowIndex != rowIndex) {
										if (!gridPart.editing)
											w.begincelledit(newRowIndex, belirtec)
									}
								}, 30)
							}
						}
					}).tipDecimal_bedel(),
					new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 6 })
						.tipButton('X')
						.onClick(({ gridRec: det, args: { owner: w } }) => {
							det.bedel = 0
							det.htmlOlustur?.()
							w.updaterow(det.uid, det)
							acc?.render()
						})
				])
				.setSource(detaylar)
				.onAfterRun(({ builder: { rootPart, part } }) => {
					gridPart = rootPart.gridPart = part
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
								det.htmlOlustur?.()
								w.updaterow(uid, det)
								acc?.render()
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
