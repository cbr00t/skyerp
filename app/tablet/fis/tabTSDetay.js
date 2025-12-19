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

	htmlOlustur(e) {
		let {stokAdi, stokKod, barkod, miktar, brm, fiyat} = this
		super.htmlOlustur(e)
		let {_text} = this
		_text = this._text = [
			(_text ?? ''),
			`<div class="flex-row" style="gap: 0 10px">`,
				`<div class="asil">${stokAdi}</div>`,
				`<div class="ek-bilgi bold float-right">${stokKod}</div>`,
				`<div class="asil orangered">${barkod}</div>`,
			`</div>`,
			`<div class="ek-bilgi float-right" style="gap: 0 10px">`,
				`<b class="forestgreen">${miktar} ${brm}</b>`,
				`<span> x </span>`,
				`<b class="royalblue">${numberToString(roundToFiyatFra(fiyat))}</b> <span>TL</span>`,
			`</div>`
		].join(CrLf)
		return this
	}
}
