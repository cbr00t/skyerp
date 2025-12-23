class TabFis extends MQDetayliGUID {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get table() { return 'tabfis' } static get tableAlias() { return 'fis' }
	static get detaySinif() { return TabFisDetay } static get sayacSaha() { return 'id' }
	static get tanimUISinif() { return TabFisGirisPart } static get secimSinif() { return null }
	static get tumKolonlarGosterilirmi() { return true } static get kolonFiltreKullanilirmi() { return false }
	static get gridIslemTuslariKullanilirmi() { return false }
	// static get noAutoFocus() { return true }
	static get offlineFis() { return true } static get almSat() { return null }
	static get satismi() { return this.almSat == 'T' } static get alimmi() { return this.almSat == 'A' }
	static get numTipKod() { return 'TB' } static get numKod() { return 'TB' }
	static get defaultSeri() { return 'TAB' }
	static get numYapi() {
		let {numTipKod: tip, numKod: belirtec, defaultSeri: seri} = this
		return tip ? new MQTicNumarator({ tip, belirtec, aciklama: 'Sky Tablet', seri }) : null
	}
	get numYapi() { return this.class.numYapi }
	get fisNox() { return this.tsn?.asText() }
	get dipIslemci() {
		let {_dipIslemci: result} = this
		if (result === undefined) {
			this.dipOlustur()
			result = this._dipIslemci
		}
		return result
	}
	set dipIslemci(value) { this._dipIslemci = value }
	get dipGridSatirlari() { return null }
	get bakiyeciler() { return [] }
	get fisTopBrut() {
		let {detaylar} = this
		return detaylar ? roundToBedelFra(topla(_ => _.brutBedel || 0, detaylar)) : 0
	}
	get fisTopNet() {
		let {detaylar} = this
		return detaylar ? roundToBedelFra(topla(_ => _.netBedel || _.bedel || 0, detaylar)) : 0
	}
	get fisTopDvNet() {
		let {detaylar} = this
		return detaylar ? roundToBedelFra(topla(_ => _.dvNetBedel || _.dvBedel || 0, detaylar)) : 0
	}

	constructor({ offlineBuildQuery } = {}) {
		super(...arguments)
		if (!offlineBuildQuery) {
			let num = this.numarator ??= this.numYapi?.deepCopy()
			if (num)
				num._promise = num.yukle()
			this.fisNo ||= null
		}
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			tarih: new PInstDateToday('tarih'),
			seri: new PInstStr('seri'),
			noYil: new PInstNum('noyil'),
			fisNo: new PInst('fisno'),
			mustKod: new PInstStr('must'),
			aciklama: new PInstStr('cariaciklama'),
			fisSonuc: new PInstNum('sonuc')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: '_text', text: 'Belge' }).noSql(),
			new GridKolon({ belirtec: 'sonuc', text: 'Fiş Bedeli', genislikCh: 15 }).noSql().tipDecimal_bedel()
		)
	}
	static async loadServerDataDogrudan({ offlineRequest, offlineMode }) {
		if (!offlineRequest) {
			let cacheClasses = [MQTabCari, MQTabTahsilSekli]
			await Promise.allSettled(cacheClasses.map(_ => _.getGloKod2Rec()))
		}
		let recs = await super.loadServerDataDogrudan(...arguments)
		if (!offlineRequest) {
			for (let rec of recs)
				rec._text = this.getHTML({ ...e, rec })
		}
		return recs
	}
	static loadServerData_queryDuzenle({ offlineRequest, offlineMode, stm }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle(e)
		let {tableAlias: alias} = this
		let unvanSaha = offlineMode === false ? 'birunvan' : MQTabCari.adiSaha
		for (let sent of stm) {
			let {from, where: wh, sahalar} = sent
			if (!from.aliasIcinTable('car'))
				sent.leftJoin(alias, 'carmst car', 'fis.must = car.kod')
			// if (!from.aliasIcinTable('tsek'))
			// 	sent.fis2TahSekliBagla()
			sahalar.add(`car.${unvanSaha} mustunvan`)
		}
		let {orderBy} = stm
		orderBy.liste = orderBy.liste.filter(_ => !_.startsWith('_'))
	}
	static async loadServerData_detaylar({ offlineRequest, offlineMode }) {
		let recs = await super.loadServerData_detaylar(...arguments)
		if (!offlineRequest) {
			let _det = new this.detaySinif()
			for (let rec of recs) {
				_det.setValues({ rec })
				_det?.htmlOlustur()
				let {_text} = _det
				if (_text != null)
					rec._text = _text
			}
		}
		return recs
	}
	async yeniTanimOncesiIslemler(e) {
		await super.yeniTanimOncesiIslemler(e)
		let {numarator: num} = this
		if (num) {
			await num?._promise
			if (!this.fisNo) {
				$.extend(this, {
					seri: num.seri ?? this.seri,
					noYil: num.noYil ?? this.noYil,
					fisNo: null
				})
			}
		}
	}
	async kaydetOncesiIslemler({ islem }) {
		await super.kaydetOncesiIslemler(...arguments)
		this.fisSonuc = this.fisTopNet
		let {fisNo, numarator: num} = this
		let yeniVeyaKopyami = islem == 'yeni' || islem == 'kopya'
		if (!fisNo && num && yeniVeyaKopyami) {
			if (!num.sayac)
				await num.kaydet()
			do {
				await num.kesinlestir()
				this.fisNo = num.sonNo
			} while (await this.varmi())
		}
	}
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e)
		this.fisNo = null
	}
	topluYazmaKomutlariniOlustur_baslikSayacBelirle(e) {
		// super yok
		return this.id ||= newGUID()
	}
	topluYazmaKomutlariniOlustur_sqlParamsDuzenle({ params, paramName_fisSayac }) {
		// do nothing
	}

	static getRootFormBuilder(e) { return MQCogul.getRootFormBuilder(e) }
	static getRootFormBuilder_fis(e) { return null }
	static async rootFormBuilderDuzenle_tablet(e) { }
	static async rootFormBuilderDuzenle_tablet_acc(e) {
		let {sender: tanimPart, inst, inst: { numarator: num }, acc} = e
		let getBuilder = e.getBuilder = layout =>
			this.rootFormBuilderDuzenle_tablet_getBuilder({ ...e, layout })
		acc.deferRedraw(() => {
			acc.add({
				id: 'baslik', title: 'Belge', expanded: true,
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					rfb.addStyle_fullWH(null, 170)
					{
						let form = rfb.addFormWithParent().yanYana()
						form.addDateInput('tarih', 'Tarih').etiketGosterim_yok()
						form.addTextInput('seri', 'Seri').etiketGosterim_yok()
							.addStyle(`$elementCSS { max-width: 130px }`)
						form.addNumberInput('fisNo', 'No', undefined, num?.sonNo).etiketGosterim_yok()
							.addStyle(`$elementCSS { max-width: 200px }`)
							.degisince(({ value }) => inst.fisNo = value || null)
					}
					await this.rootFormBuilderDuzenle_tablet_acc_baslik({ ...e, rfb, item, layout })
					{
						let form = rfb.addFormWithParent().yanYana()
						rfb.addTextInput('aciklama', 'Açıklama').etiketGosterim_yok()
							.addStyle(`$elementCSS { max-width: 800px }`)
					}
					if (rfb.builders?.length)
						setTimeout(() => rfb.run(), 100)
				}
			})
			acc.add({
				id: 'dip', title: 'Sonuç',
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_dip({ ...e, rfb, item, layout })
					if (!rfb.builders?.length)
						rfb.addStyle_fullWH(null, 1)
					setTimeout(() => rfb.run(), 100)
				}
			})
			acc.add({
				id: 'detay', title: 'Kalemler',
				collapsedContent: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ ...e, rfb, item, layout })
					rfb.run()
				},
				content: async ({ item, layout }) => {
					let rfb = getBuilder(layout)
					await this.rootFormBuilderDuzenle_tablet_acc_detay({ ...e, rfb, item, layout })
					if (rfb.builders?.length)
						setTimeout(() => rfb.run(), 100)
				}
			})
		})
		acc.expand('detay')

		acc.onExpand(_e => setTimeout(e =>
			this.rootFormBuilderDuzenle_tablet_acc_onExpand(e), 1, { ...e, ..._e }))
		acc.onCollapse(_e => setTimeout(e =>
			this.rootFormBuilderDuzenle_tablet_acc_onCollapse(e), 1, { ...e, ..._e }))
	}
	static rootFormBuilderDuzenle_tablet_acc_baslik({ rfb, inst: fis }) {
		{
			let form = rfb.addFormWithParent().altAlta()
			// addSimpleComboBox(e, _etiket, _placeholder, _value, _source, _autoClear, _delay, _minLength, _disabled, _name, _userData)
			form.addSimpleComboBox('mustKod', MQTabCari.sinifAdi, MQTabCari.sinifAdi)
				.etiketGosterim_yok()
				.addStyle(`$elementCSS { max-width: 800px }`)
				.kodsuz().setMFSinif(MQTabCari)
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))
			/*form.addModelKullan('mustKod', MQTabCari.sinifAdi)
				.addStyle(`$elementCSS { max-width: 800px }`)
				.comboBox().autoBind()
				.setMFSinif(MQTabCari)
				.onAfterRun(({ builder: { part } }) =>
					setTimeout(() => part.focus(), 1))*/
		}
	}
	static async rootFormBuilderDuzenle_tablet_acc_baslikCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		let {mustKod} = fis
		if (mustKod) {
			let {adiSaha} = MQTabCari
			let {[mustKod]: { [adiSaha]: aciklama }} = await MQTabCari.getGloKod2Rec() ?? {}
			aciklama ||= mustKod
			rfb.addForm().setLayout(() => $([
				`<div class="flex-row" style="gap: 10px">`,
					// `<div class="orangered"><b>${dateKisaString(asDate(tarih))}</b></div>`,
					`<div class="royalblue"><b>${aciklama}</b></div>`,
				`</div>`
			].join(CrLf)))
		}
	}
	static rootFormBuilderDuzenle_tablet_acc_dip({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detay({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_detayCollapsed({ rfb }) { }
	static rootFormBuilderDuzenle_tablet_acc_onExpand({ sender: { parentPart: tanimPart }, acc: { activePanel } }) {
		/*let {id} = activePanel ?? {}
		let {islemTuslari} = tanimPart
		islemTuslari[id == 'duzenle' ? 'addClass' : 'removeClass']('jqx-hidden')*/
	}
	static rootFormBuilderDuzenle_tablet_acc_onCollapse(e) { }

	static rootFormBuilderDuzenle_tablet_getBuilder({ sender: tanimPart, inst, acc, layout }) {
		return new RootFormBuilder()
			.setLayout(layout).setPart(tanimPart)
			.setInst(inst)
	}
	static getHTML({ rec }) {
		let {tarih, seri, noyil, fisno, must, mustunvan} = rec
		// let {kod2Rec: kod2Must} = MQTabCari.globals
		let tsnText = [
			seri || '',
			noyil ? noyil.toString().padStart(4, '0') : '',
			fisno?.toString() || '0'
		].filter(_ => _).join(' ')
		return [
			`<div class="flex-row" style="gap: 0 10px">`,
				`<div class="asil">${tsnText}</div>`,
				`<div class="ek-bilgi bold float-right">${dateKisaString(asDate(tarih)) ?? ''}</div>`,
				`<div class="asil orangered">${mustunvan || ''}</div>`,
				`<div class="ek-bilgi bold float-right">${must || ''}</div>`,
			`</div>`
		].join(CrLf)
	}
}
