// class MQTabTestFis extends mixin($TabFisTemplate, MQGenelFis) {
class TabTSFis extends TabFis {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABTS' } static get sinifAdi() { return 'Tablet Fiş' }
	static get detaySinif() { return TabTSDetay } static get almSat() { return 'T' }
	
	static pTanimDuzenle({ pTanim }) {
		// MQOrtakFis.pTanimDuzenle(...arguments)
		super.pTanimDuzenle(...arguments)
	}
	static async rootFormBuilderDuzenle_tablet(e) {
		await super.rootFormBuilderDuzenle_tablet(e)
		let {sender: tanimPart, inst, rootBuilder: rfb, kaForm, tanimFormBuilder: tanimForm, acc} = e
		// tanimForm.addForm().setLayout(() => $(`<p><h3>hello world from ${this.name}</h3></p>`))
	}
	static async rootFormBuilderDuzenle_tablet_acc({ sender: tanimPart, acc }) {
		await super.rootFormBuilderDuzenle_tablet_acc(...arguments)
		acc.onExpand(e => setTimeout(() => {
			let {barkodPart} = tanimPart
			barkodPart?.focus()
		}, 1))
	}
	static async rootFormBuilderDuzenle_tablet_acc_dipCollapsed({ sender: tanimPart, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detayCollapsed(...arguments)
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
	static async rootFormBuilderDuzenle_tablet_acc_detay({ sender: tanimPart, sender: { acc }, inst: fis, rfb }) {
		await super.rootFormBuilderDuzenle_tablet_acc_detay(...arguments)
		let {detaylar} = fis
		rfb.addSimpleComboBox('barkod', 'Barkod', 'Barkod giriniz')
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
			.addStyle_fullWH(null, `calc(var(--full) - 50px)`)
			.rowNumberOlmasin().notAdaptive()
			.widgetArgsDuzenleIslemi(({ args }) => $.extend(args, {
				rowsHeight: 70
			}))
			.setTabloKolonlari([
				new GridKolon({ belirtec: '_text', text: 'Ürün' }),
				new GridKolon({ belirtec: 'netBedel', text: 'Bedel', genislikCh: 13 }).tipDecimal_bedel(),
				new GridKolon({ belirtec: '_sil', text: ' ', genislikCh: 6 })
					.tipButton('X')
					.onClick(({ gridRec, args: { owner: w } }) => {
						w.deleterow(gridRec.uid)
						acc?.render()
					})
			])
			.setSource(detaylar)
			.onAfterRun(({ builder: { rootPart, part } }) =>
				rootPart.gridPart = part)
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
		let {acc, inst: fis, inst: { class: { detaySinif }}, gridPart, gridPart: { gridWidget: w } = {}} = tanimPart
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
				acc?.render()
			}
		}
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
}

class TabTSDetay extends TabFisDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get io2RowAttr() {
		let {_io2RowAttr: result} = this
		if (!result) {
			result = this._io2RowAttr = { _text: null, stokAdi: null }
			for (let k of ['stokKod', 'barkod', 'miktar', 'brm', 'fiyat', 'kdvOrani', 'brutBedel'])
				result[k] = k.toLowerCase()
			$.extend(result, {
				stokAdi: null,
				netBedel: 'bedel',
				aciklama: 'ekaciklama'
			})
			for (let {ioAttr: i, rowAttr: r} of TicIskYapi.getIskIter())
				result[i] = r
		}
		return result
	}
	
	constructor(e = {}) {
		super(e)
		this.miktar ??= 1; this.brm ||= 'AD'
		this.fiyat ??= 0; this.kdvOrani ??= 0
		this.brutBedel ??= 0; this.netBedel ??= 0
		let {carpan} = e
		if (carpan && carpan != 1)
			this.miktar *= carpan
		this.htmlOlustur()
	}
	async detayEkIslemler({ fis } = {}) {
		let {stokKod} = this
		if (stokKod) {
			let mfSinif = MQTabStok, {class: { alimmi } = {}} = fis
			let {[stokKod]: rec} = await mfSinif.getGloKod2Rec() ?? {}
			if (rec) {
				let bosDegilseAktar = (i, r) => {
					let rv = rec[r]
					if (rv)
						this[i] = rv
				}
				bosDegilseAktar('brm', 'brm')
				bosDegilseAktar(mfSinif.getKdvOraniSaha(alimmi), 'kdvOrani')
			}
		}
		this.bedelHesapla({ fis })
	}
	bedelHesapla({ fis } = {}) {
		let {miktar, fiyat} = this
		miktar ??= 0; fiyat ??= 0
		this.brutBedel = roundToBedelFra(miktar * fiyat)
		this.netBedelHesapla(...arguments)
	}
	netBedelHesapla({ fis } = {}) {
		let {brutBedel: netBedel} = this
		for (let {rowAttr} of TicIskYapi.getIskIter())
			netBedel -= this[rowAttr] ?? 0
		netBedel = roundToBedelFra(netBedel)
		this.netBedel = netBedel
		this.htmlOlustur()
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
	}
	static loadServerData_queryDuzenle({ sent, sent: { from, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		if (!from.aliasIcinTable('stk'))
			sent.x2StokBagla({ alias })
		sahalar.add('stk.aciklama stokadi')
	}
	hostVarsDuzenle({ fis, hv }) {
		super.hostVarsDuzenle(...arguments)
		deleteKeys(hv, 'brm')
	}
	setValues({ fis, rec }) {
		super.setValues(...arguments)
		$.extend(this, { stokAdi: rec.stokadi })
		this.htmlOlustur()
	}
	htmlOlustur(e) {
		let {stokAdi, stokKod, barkod, miktar, brm, fiyat} = this
		super.htmlOlustur(e); let {_text} = this
		_text = this._text = [
			(_text ?? ''),
			`<div class="flex-row">`,
				`<div class="asil">${stokAdi}</div>`,
				`<div class="ek-bilgi bold float-right" style="padding-left: 10px">${stokKod}</div>`,
			`</div>`,
			`<div>`,
				`<div class="asil orangered">${barkod}</div>`,
				`<div class="ek-bilgi float-right" style="padding-left: 10px">`,
					`<b class="forestgreen">${miktar} ${brm}</b>`,
					`<span> x </span>`,
					`<b class="royalblue">${numberToString(roundToFiyatFra(fiyat))}</b> <span>TL</span>`,
				`</div>`,
			`</div>`
		].join(CrLf)
		return this
	}
}
