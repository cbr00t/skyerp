class TabTSDetay extends TabDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*get dipHesabaEsasDegerler() {
		let result = super.dipHesabaEsasDegerler || {}
		$.extend(result, {
			brutBedel: this.brutBedel,
			iskBedelYapi: null,              // ??
			netBedel: this.bedel
		})
		return result
	}*/

	constructor(e = {}) {
		super(e)
		this.miktar ??= 1; this.brm ||= 'AD'
		for (let k of ['fiyat', 'kdvOrani', 'kdv', 'brutBedel', 'bedel', 'dagitDipIskBedel'])
			this[k] ??= 0
		/*let {carpan} = e
		if (carpan && carpan != 1)
			this.miktar *= carpan*/
	}
	static io2RowAttrOlustur({ result }) {
		super.io2RowAttrOlustur(...arguments)
		let _keys = ['stokKod', 'barkod', 'miktar', 'brm']
		for (let k of _keys)
			result[k] = k.toLowerCase()
		extend(result, { stokAdi: null, aciklama: 'ekaciklama' })
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
		// deleteKeys(hv, 'brm')
	}
	setValues({ fis, rec }) {
		super.setValues(...arguments)
		$.extend(this, { stokAdi: rec.stokadi })
	}
	static async uiKaydetOncesiIslemler({ fis, fis: { detaylar }, result }) {
		detaylar = fis.detaylar = detaylar.filter(_ => _.miktar)
		await super.uiKaydetOncesiIslemler(...arguments)
	}
	async dataDuzgunmuDuzenle({ fis, seq, result }) {
		await super.dataDuzgunmuDuzenle(...arguments)
		let {stokKod} = this
		if (!stokKod)
			result.push(`<b class=royalblue>${seq}.</b> satırdaki <b class=firebrick>Ürün</b> belirtilmelidir`)
		if (stokKod && !await MQTabStok.kodVarmi(stokKod))
			result.push(`<b class=royalblue>${seq}.</b> satırdaki <b>Ürün [<span class=firebrick>${stokKod}</span>]</b> hatalıdır`)
		return null
	}

	async detayEkIslemler({ fis } = {}) {
		await super.detayEkIslemler(...arguments)
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
				bosDegilseAktar('fiyat', 'fiyat')
				bosDegilseAktar('kdvOrani', mfSinif.getKdvOraniSaha(alimmi))
			}
		}
		this.bedelHesapla({ fis })
		return this
	}
	bedelHesapla(e = {}) {
		this.brutBedelHesapla(e)
		this.netBedelHesapla(e)
		return this
	}
	brutBedelHesapla({ fis } = {}) {
		let miktar = this.miktar ??= 0
		let fiyat = this.fiyat ??= 0
		this.brutBedel = roundToBedelFra(miktar * fiyat)
		return this
	}
	netBedelHesapla({ fis } = {}) {
		let {brutBedel: bedel} = this
		for (let {ioAttr} of TicIskYapi.getIskIter()) {
			let oran = this[ioAttr] ?? 0
			if (!oran)
				continue
			let iskBedel = roundToBedelFra(bedel * oran / 100)
			bedel -= iskBedel
		}
		this.bedel = bedel = roundToBedelFra(bedel)
		return this
	}

	getHTML(e) {
		let _ = super.getHTML(e) ?? ''
		let {stokAdi, stokKod, barkod, miktar, brm} = this
		return [
			_,
			`<div class="asil flex-row" style="gap: 0 10px">`,
				`<div class="stokAdi">${stokAdi}</div>`,
				`<div class="stokKod orangered">${stokKod}</div>`,
				(stokKod == barkod ? null : `<div class="barkod bold float-right">${barkod}</div>`),
			`</div>`,
			`<div class="miktarFiyat ek-bilgi float-right" style="gap: 0 10px">`,
				`<span class="miktar bold forestgreen">${miktar} ${brm}</span>`,
			`</div>`
		].filter(_ => _).join(CrLf)
	}
	super_getHTML(e) { return super.getHTML(e) }
}
