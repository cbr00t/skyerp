class TabDokumSaha extends CObject {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'TABMATSAHA' } static get sinifAdi() { return 'Tablet Matbuu Saha' }
	static get kodSaha() { return 'key' } static get adiSaha() { return 'text' }
	static get kodEtiket() { return 'Belirteç' } static get adiEtiket() { return 'Değer' }
	static get ioKeys() {
		return [
			'key', 'text', 'pos', 'length', 'right',
			'ozelIsaret', 'iade',
			'converter', 'block', '_comment'
		]
	}
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
		let {ioKeys} = this.class
		;ioKeys.forEach(k =>  {
			let v = this[k]
			if (v)
				hv[k] = v
		})
	}
	setValues({ rec }) {
		let {ioKeys} = this.class
		;ioKeys.forEach(k =>  {
			let v = rec[k]
			this[k] = v ?? null
		})
		this.length ??= 0
		this.right ??= false
		let {kosul} = rec
		if (!empty(kosul))
			extend(this, kosul)
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
		;['converter', 'block'].forEach(k => {
			let v = this[k]
			if (v && isString(v)) {
				if (v[0] != '(')
					v = `(${v})`
				v = eval(v)
			}
		})
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
		let { inst, key, text = e.value } = e
		let { right, ozelIsaret, iade, length: fullLength } = this
		if (key === undefined)
			key = this.key
		if (text === undefined)
			text = this.text
		let _e = { ...e, saha: this, ozelIsaret, iade }
		let convertWith = async f => {
			if (!f)
				return text
			if (!isFunction(f))
				f = eval(f)
			let r = await f.call(this, { ..._e, key, text, value: null })
			return r === undefined ? text : r
		}
		{
			let Prefix = '!FUNC'
			let v = key || text
			if (isString(v) && v.startsWith(Prefix) && v.length > Prefix.length) {
				text = await convertWith(v.slice(Prefix.length))
				key = null
			}
		}
		let expressions = getExpressions(text || key)
		if (!empty(expressions)) {
			let sr = fromEntries(expressions.map(k => 
				[`[${k}]`, this.getValue({ ..._e, key: k, text: null, value: null })]
			))
			for (let [s, r] of entries(sr))
				text = text.replaceAll(s, await r ?? '')
		}
		if (!text && key) {
			text = await inst?.dokumGetValue?.({ ..._e, key, text }) ??
				   await inst?.[key]
			if (isFunction(text))
				text = await text.call(this, { ..._e, key, text, value: null })
		}
		if (text == null || text == '')
			return null

		let {converter = this.converter, block = this.block} = e
		text = await convertWith(converter)
		if (isNumber(text))
			text = numberToString(text, { useGrouping: false })
		else if (!isInvalidDate(text))
			text = hasTime(text) ? dateTimeToString(text) : dateToString(text)
		else if (!isString(text))
			text = text?.toString() ?? ''
		text = await convertWith(block)
		
		let length = this.getActualLength({ ...e, text: null, value: text })
		if (length) {
			// let targetLength = fullLength || length
			text = right
				? text.padStart(fullLength, ' ')
				: text.slice(0, length)
			//if (text.length < targetLength)
			//	text = text.padEnd(targetLength, ' ')
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
			len = len ? Math.min(len, value.length) : value.length
		if (!TabDokumYontemi.isPOSCommand(value)) {
			let {sayfaBoyut: { x: maxX } = {}} = form ?? {}
			if (maxX)
				len = len ? Math.min(len, maxX - x0 + 1) : maxX - x0 + 1
		}
		return len < 0 ? 0 : len
	}
}

