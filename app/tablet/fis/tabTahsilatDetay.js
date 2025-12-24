class TabTahsilatDetay extends TabDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get io2RowAttr() {
		let {_io2RowAttr: result} = this
		if (!result)
			result = this._io2RowAttr = { tahSekliNo: 'tahseklino', tahSekliAdi: null, bedel: 'bedel', aciklama: 'ekaciklama' }
		return result
	}
	
	constructor(e = {}) {
		super(e)
		this.bedel ??= 0
		this.htmlOlustur()
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
		this.htmlOlustur()
	}

	htmlOlustur(e) {
		let {tahSekliNo, tahSekliAdi, bedel} = this
		super.htmlOlustur(e)
		let {_text} = this
		_text = this._text = [
			(_text ?? ''),
			`<div class="asil flex-row" style="gap: 0 10px">`,
				`<div class="tahSekliAdi">${tahSekliAdi}</div>`,
			`</div>`
		].filter(_ => _).join(CrLf)
		return this
	}
}
