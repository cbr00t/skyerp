class TabDokumSaha extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABMATSAHA' } static get sinifAdi() { return 'Tablet Matbuu Saha' }
	static get kodSaha() { return 'key' } static get adiSaha() { return 'text' }
	static get kodEtiket() { return 'Belirteç' } static get adiEtiket() { return 'Değer' }
	get x() { return this.pos?.x } set x(value) { (this.pos ??= {}).x = value }
	get y() { return this.pos?.y } set y(value) { (this.pos ??= {}).y = value }
	get uygunmu() { return !!(this.x && (this.key || this.text)) }
	get expressions() {
		let {text} = this
		return text ? keys(asSet(getExpressions(text))) : []
	}
	get keyOrText() { return this.text || this.key }    // text, key'den önceliklidir

	constructor(e = {}) {
		super(e)
		this.setValues({ rec: e })
	}
	hostVars(e = {}) {
		e = { ...e, hv: {} }
		this.hostVarsDuzenle(e)
		return e.hv
	}
	hostVarsDuzenle({ hv }) {
		let keys = ['key', 'text', 'pos', 'length', 'right', 'ozelIsaret', 'iade', '_comment']
		;keys.forEach(k =>  {
			let v = this[k]
			if (v)
				hv[k] = v
		})
	}
	setValues({ rec }) {
		extend(this, { key: null, text: null, pos: {}, length: 0, right: false, kosul: {}, _comment: null })
		;['pos'].forEach(k =>
			this[k] ||= {})
		for (let [k, v] of entries(rec)) {
			if (v != null && this[k] !== undefined)    // değer var ve inst var karşılığı da varsa
				this[k] = v
		}
		if (empty(this.pos)) {
			let {x, y} = rec
			let pos = this.pos = { x }
			if (y)
				pos.y = y
		}
	}
	async satirDuzenle({ chars, inst }) {
		let e = arguments[0]
		let v = await this.getValue(e)
		if (!v)
			return this
		let {x} = this, x0 = x - 1
		for (let i = 0; i < v.length; i++)
			chars[i + x0] = v[i]
		return this
	}
	async getValue(e = {}) {
		let { inst } = e
		let { key, text, right, ozelIsaret, iade } = this
		let _e = { ...e, saha: this }
		if (text) {
			let {expressions} = this
			if (!empty(expressions)) {
				let sr = fromEntries(expressions.map(async k => 
					[k, await this.getValue({ ..._e, key: k })]
				))
				for (let [s, r] of entries(sr))
					text = text.replaceAll(s, r)
			}
		}
		else if (key) {
			text = await inst?.dokumGetValue?.(key) ??
				   await inst?.[key]
			if (isFunction(text))
				text = await text.call(this, { ..._e, key, value: text })
		}
		if (!text)
			return null

		let length = this.getActualLength({ ...e, value: text })
		if (length) {
			text = right
				? text.padStart(length, ' ')
				: text.slice(0, length)
		}
		
		return text
	}
	getActualLength({ form, value }) {
		let {x, length: len} = this
		x ??= 0; len ??= 0
		let x0 = x - 1
		if (x0 < 0)
			return 0
		value = value?.toString() ?? ''
		if (value)
			len = Math.min(len, value.length)
		let {sayfaBoyut: { x: maxX } = {}} = form ?? {}
		if (maxX)
			len = Math.min(len, maxX - x0 + 1)
		return len < 0 ? 0 : len
	}
}


/*
({
	nakil: false, tekDetaySatirSayisi: 2, dipYok: false,
	sayfaBoyut: { x: 60, y: 58 },
	otoYBasiSonu: { x: 17, y: 52 },
	sabit: [
		{ key: 'fisTipText', pos: { x: 5, y: 2 }, length: 19 },
		{ text: '[islemTarih] [islemZaman]', pos: { x: 40, y: 5 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
		{ key: 'islemZaman', pos: { x: 48, y: 6 }, _comment: '(pos.X = 0) => text length ne ise aynen yazılır, kırpmadan' },
		{ key: 'yildizlimiText', pos: { x: 1, y: 0 }, length: 5, _comment: '(Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
		{ key: 'tahsilatSekliText', pos: { x: 0, y: 0 }, _comment: '(X = 0) => Bu bilgi yazılmaz | (Y = 0) ==> Cursor ın kaldığı Y pozisyonundan devam et' },
		{ text: 'SAYIN [mustUnvan],', pos: { x: 1, y: 8 }, length: 55 },
		{ text: '[vergiDairesi] [vergiNo]', pos: { x: 5, y: 9 }, length: 40 },
		{ text: '** BİLGİ FİŞİ **', pos: { x: 5, y: -1 }, length: 50, kosul: { ozelIsaret: '*', iade: false }, _comment: '(Y = -1) => Bittiği yer veya Sayfa Boyutu Y ye göre tersten relative satır no' }
	],
	detay: [
		{ key: 'barkod', pos: { x: 2, y: 1 }, length: 15 },
		{ key: 'stokAdi', pos: { x: 18, y: 1 }, length: 40 },
		{ key: 'miktar', pos: { x: 5, y: 2 }, length: 8, right: true },
		{ key: 'brm', pos: { x: 15, y: 2 }, length: 4, right: true },
		{ key: 'fiyat', pos: { x: 21, y: 2 }, length: 10, right: true },
		{ key: 'netBedel', pos: { x: 33, y: 2 }, length: 13, right: true }
	]
})
*/
