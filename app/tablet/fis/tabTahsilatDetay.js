class TabTahsilatDetay extends TabDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }

	constructor(e = {}) {
		super(e)
		this.bedel ??= 0
	}
	static io2RowAttrOlustur({ result }) {
		super.io2RowAttrOlustur(...arguments)
		for (let k of ['tahSekliNo', 'bedel'])
			result[k] = k.toLowerCase()
		$.extend(result, { tahSekliAdi: null })
	}
	static loadServerData_queryDuzenle({ sent, sent: { from, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		if (!from.aliasIcinTable('tsek'))
			sent.x2TahSekliBagla({ alias })
		sahalar.add('tsek.aciklama tahsekliadi')
	}
	hostVarsDuzenle({ fis, hv }) {
		super.hostVarsDuzenle(...arguments)
	}
	setValues({ fis, rec }) {
		super.setValues(...arguments)
		let {tahsekliadi: tahSekliAdi} = rec
		$.extend(this, { tahSekliAdi })
	}

	getHTML(e) {
		let _ = super.getHTML(e) ?? ''
		let {tahSekliNo, tahSekliAdi, bedel} = this
		return [
			_,
			`<div class="asil flex-row" style="gap: 0 10px">`,
				`<div class="tahSekliAdi">${tahSekliAdi}</div>`,
			`</div>`
		].filter(_ => _).join(CrLf)
	}
}
