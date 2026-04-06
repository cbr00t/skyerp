class TabTSDetay extends TabDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get stokSinif() { return MQTabStok }
	static get stokKodGosterilirmi() { return true }
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
		let { defaultBrm } = this.class
		this.miktar ??= 1
		this.brm ??= defaultBrm
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
		let { tableAlias: alias, stokSinif } = this
		if (!from.aliasIcinTable('stk'))
			sent.innerJoin(alias, `${stokSinif.table} stk`, `${alias}.stokkod = stk.kod`)
		sahalar.add('stk.aciklama stokAdi')
	}
	hostVarsDuzenle({ fis, hv }) {
		super.hostVarsDuzenle(...arguments)
		// deleteKeys(hv, 'brm')
	}
	setValues({ fis, rec }) {
		super.setValues(...arguments)
		let { stokAdi } = rec
		extend(this, { stokAdi })
	}
	static getYazmaIcinDetaylar(e) {
		return this.detaylar.filter(_ => _.miktar)
	}
	async dataDuzgunmuDuzenle({ fis, seq, result }) {
		await super.dataDuzgunmuDuzenle(...arguments)
		let { stokKod, class: { stokSinif } } = this
		let { sinifAdi: stokEtiket } = stokSinif ?? {}
		if (stokSinif) {
			if (!stokKod)
				result.push(`<b class=royalblue>${seq}.</b> satırdaki <b class=firebrick>${stokEtiket}</b> belirtilmelidir`)
			if (stokKod && !await stokSinif.kodVarmi(stokKod))
				result.push(`<b class=royalblue>${seq}.</b> satırdaki <b>${stokEtiket} [<span class=firebrick>${stokKod}</span>]</b> hatalıdır`)
		}
		return null
	}

	async detayEkIslemler({ fis } = {}) {
		await super.detayEkIslemler(...arguments)
		let { stokKod } = this
		let { stokSinif, defaultBrm } = this.class
		if (stokKod) {
			let { [stokKod]: rec } = await stokSinif.getGloKod2Rec() ?? {}
			if (rec) {
				let bosDegilseAktar = (i, r) => {
					let rv = rec[r]
					if (rv)
						this[i] = rv
				}
				bosDegilseAktar('stokAdi', 'aciklama')
				bosDegilseAktar('brm', 'brm')
			}
			this.brm ||= defaultBrm
		}
		return this
	}

	getHTML(e) {
		let _ = super.getHTML(e) ?? ''
		let { stokAdi, stokKod, barkod, miktar, brm } = this
		brm ??= ''
		return [
			_,
			`<div class="full-wh">`,
				`<div class="asil flex-row float-left" style="gap: 0 10px">`,
					( stokAdi ? `<div class="stokAdi">${stokAdi}</div>` : null ),
					( stokKod ? `<div class="stokKod orangered">${stokKod}</div>` : null ),
					( !barkod || stokKod == barkod ? null : `<div class="barkod bold float-right">${barkod}</div>` ),
				`</div>`,
				( miktar ?
					`<div class="miktarFiyat ek-bilgi float-right" style="gap: 0 10px">` +
						`<span class="miktar bold forestgreen">${miktar} ${brm}</span>` +
					`</div>`
				: null),
			`</div>`
		].filter(Boolean).join(CrLf)
	}
	super_getHTML(e) { return super.getHTML(e) }
}
