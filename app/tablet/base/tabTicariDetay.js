class TabTicariDetay extends TabTSDetay {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static io2RowAttrOlustur({ result }) {
		super.io2RowAttrOlustur(...arguments)
		let _keys = [
			'fiyat', 'kdvOrani', 'kdv',
			'brutBedel', 'bedel', 'dagitDipIskBedel',
			'fiyatKosulKod', 'iskKosulKod'
		]
		for (let k of _keys)
			result[k] = k.toLowerCase()
		for (let {ioAttr: i, rowAttr: r} of TicIskYapi)
			result[i] = r
	}
	getHTML(e) {
		let _ = super.super_getHTML(e) ?? '', {dev} = config
		let {bedelKullanilirmi} = TabTicariFis
		let {stokAdi, stokKod, barkod, kdvOrani, miktar, brm, fiyat} = this
		let iskHTMLListe = [], kosulKodHTMLListe = []
		for (let {ioAttr: k} of TicIskYapi) {
			let v = this[k]
			if (!v)
				continue
			iskHTMLListe.push(
				`<span>${iskHTMLListe.length ? '+' : '- %'}</span>`,
				`<span class="orangered">${numberToString(v)}</span>`
			)
		}
		if (dev) {
			for (let [p, lbl] of entries({ fiyat: 'FY', isk: 'IS' })) {
				let k = `${p}KosulKod`, v = this[k]
				if (!v)
					continue
				kosulKodHTMLListe.push(
					`<span class=lightgray>${lbl}:</span>`,
					`<span class="purple">${v}</span>`
				)
			}
		}
		return [
			_,
			`<div class="asil flex-row" style="gap: 0 10px">`,
				`<div class="stokAdi">${stokAdi}</div>`,
				`<div class="stokKod orangered">${stokKod}</div>`,
				(stokKod == barkod ? null : `<div class="barkod bold float-right">${barkod}</div>`),
				(!kdvOrani ? null : `<div class=kdvOrani><span>%</span><span class=purple>${kdvOrani}</span></div>`),
			`</div>`,
			`<div class="miktarFiyat ek-bilgi float-right" style="gap: 0 10px">`,
				`<span class="miktar bold forestgreen">${miktar} ${brm}</span>`,
				...(bedelKullanilirmi ? [
					`<span> x </span>`,
					`<span class="fiyat bold royalblue">${numberToString(roundToFiyatFra(fiyat))}</span>`,
					`<span>TL</span>`
				] : []),
				...iskHTMLListe,
			`</div>`,
			...(!empty(kosulKodHTMLListe) ? [
				`<div style="margin-top: 13px" class="kosulBilgi ek-bilgi" style="gap: 0 13px">`,
					...kosulKodHTMLListe,
				`</div>`
			] : [])
		].filter(_ => _).join(CrLf)
	}
}
