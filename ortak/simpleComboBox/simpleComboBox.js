class SimpleComboBoxPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'simpleComboBox' }
	get mfSinif() { return this._mfSinif }
	set mfSinif(cls) {
		this._mfSinif = cls
		this.kodSaha ||= cls?.kodSaha
		this.adiSaha ||= cls?.adiSaha
	}
	get kodSaha() { return this._kodSaha ?? MQKA.kodSaha }
	set kodSaha(value) { this._kodSaha = value || null }
	get adiSaha() { return this._adiSaha ?? MQKA.adiSaha }
	set adiSaha(value) { this._adiSaha = value || null }
	get item() {
		let {kodSaha, _item: item} = this
		if (!isObject(item))
			item = this._item = { [kodSaha]: item }
		return item
	}
	set item(value) {
		let {input, kodSaha, adiSaha, autoClearFlag: autoClear} = this
		let item = value
		if (!isObject(item))
			item = { [kodSaha]: item }
		this._item = item
		if (input?.length) {
			input.val(this.renderedInputText)
			input.attr('placeholder', autoClear ? this.placeholder ?? null : this.renderedText)
		}
	}
	/****** CKodVeAdi/MQKA interface ********/
	get kod() { return this.value }
	set kod(value) { this.value = value }
	/****************************************/
	get value() {
		let {item, kodSaha} = this
		return item?.[kodSaha]
	}
	set value(value) {
		let {kodSaha} = this
		this.item = { [kodSaha]: value }
	}
	get aciklama() {
		let {item, adiSaha} = this
		return item?.[adiSaha]
	}
	set aciklama(value) {
		let {adiSaha} = this
		this.item = { [adiSaha]: value }
	}
	get placeholder() {
		let {input, _placeholder} = this
		return input?.length ? input.attr('placeholder') : _placeholder
	}
	set placeholder(value) {
		let {input} = this
		this._placeholder = value
		input?.attr('placeholder', value)
	}
	get disabled() {
		let {input, _disabled} = this
		return input?.length ? input.attr('readonly') : _disabled
	}
	set disabled(value) {
		let {input, layout} = this
		this._disabled = value
		input?.attr('readonly', value ? '' : null)
		if (layout?.length) {
			let btn = layout.children('button#liste')
			btn[value ? 'addClass' : 'removeClass']('jqx-hidden')
		}
	}
	get inputValue() {
		let {value: kod, aciklama} = this
		return kod ?? aciklama
	}
	get renderedInputText() {
		let {value: kod, aciklama} = this
		return aciklama || kod
	}
	get renderedText() {
		let sender = this, {layout, item, kodsuzmu: kodsuz, mfSinif, kodSaha, adiSaha} = this
		return this.renderItem({ sender, layout, item, kodsuz, mfSinif, kodSaha, adiSaha })
	}

	constructor(e = {}) {
		super(e)
		let {
			id, name, item, value, placeholder, mfSinif,
			autoClear: autoClearFlag = e.autoClear,
			source, listSource, delay, minLength, maxRows, renderer,
			kodsuz: kodsuzmu = e.kodsuz, kodSaha, adiSaha,
			disabled, userData, events, queue
		} = e
		autoClearFlag ??= true; kodsuzmu ??= false
		kodSaha ??= mfSinif?.kodSaha || null
		adiSaha ??= mfSinif?.adiSaha || null
		delay ??= 500; maxRows ??= 10; minLength ??= 1
		disabled ??= false
		events ??= {}; queue ??= []
		$.extend(this, {
			id, name, item, value, placeholder,
			mfSinif, autoClearFlag, source, listSource,
			delay, minLength, maxRows, renderer,
			kodsuzmu, kodSaha, adiSaha, disabled,
			userData, events, queue
		})
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let sender = this, {layout, argsDuzenleBlock, class: { partName }} = this
		layout.addClass(`${partName} part`)
		let input = this.input ??= layout.children('input')
		let _e = { ...e, sender, layout, input }
		argsDuzenleBlock?.call(this, _e)
		let {id, name = this.id, item, kodsuzmu: kodsuz, mfSinif, kodSaha, adiSaha, delay, minLength, maxRows, listSource} = this
		layout = this.layout = _e.layout
		input = this.input = _e.input
		// $.extend(_e, { kodsuz, mfSinif, kodSaha, adiSaha, delay, minLength })
		let kv = { id, name }
		for (let [k, v] of entries(kv)) {
			if (v)
				input.attr(k, v)
		}
		input.val(this.renderedInputText ?? '')
		input.attr('placeholder', this.renderedText)
		input.on('change', event => {
			let {currentTarget: { value }} = event
			this._onChange({ type: 'change', event, layout, input, value })
		})
		input.on('keydown', event => {
			let {key, currentTarget: { value }} = event
			key = key?.toLowerCase()
			if (key == 'enter' || key == 'linefeed')
				this._onChange({ type: 'commit', event, layout, input, value })
		})
		input.on('focus', event =>
			this._onFocus({ event, layout, input }))
		input.on('blur', event =>
			this._onBlur({ event, layout, input }))
		setTimeout(() => {
			input.autocomplete({
				delay, minLength,
				source: (async ({ term } = {}, callback) => {
					let tokens = term?.split(' ').map(_ => _.trim()).filter(_ => !!_)
					let recs = await this._onSourceReq({ layout, input, term, tokens })
					if (!recs)
						return
					if (maxRows != null && maxRows > -1 && recs.length > maxRows)
						recs = recs.slice(0, maxRows)
					let result = recs.map(rec => rec[adiSaha] || rec[kodSaha]).sort()
					callback(result)
				}),
				select: ((event, { item }) =>
					this._onChange({ type: 'select', event, layout, input, item }))
			})
		}, 100)
		if (listSource || mfSinif) {
			let btnListe = layout.children('button#liste')
			if (!btnListe?.length)
				(btnListe = $('<button id="liste"> L </button>')).prependTo(layout)
			btnListe.off('click')
			btnListe.on('click', event =>
				this.listeIstendi({ event }))
		}
		this._initialized = true
	}
	destroyPart(e) {
		this.clear()
		this.events = this.queue = this.userData = null
		this._initialized = false
		return super.destroyPart(e)
	}
	renderItem({ sender, layout, input, item, kodsuz, mfSinif, kodSaha, adiSaha }) {
		let {renderer} = this, ka = item
		ka = isObject(item)
				? new CKodVeAdi({ kod: item[kodSaha], aciklama: item[adiSaha] })
				: new CKodVeAdi({ kod: null, aciklama: item })
		let result = renderer?.call(this, ...arguments)
		// result ??= kodsuz ? ka.aciklama || ka.kod : ka.parantezliOzet()                                // * kodsuz ise ve aciklama boşsa (kod => aciklama kabul edilir)
		result ??= kodsuz || !(ka.kod && ka.aciklama)
			? ka.aciklama || ka.kod || ''
			: `${ka.aciklama || ''}  (${ka.kod || ''})`
		return result
	}
	 async _onChange({ type, item }) {
		// event debounce & type checks
		if (this._inEvent || type == 'keypress' || type == 'change')
			return
		this._inEvent = true
		let isSelect = type == 'select', fromList = type == 'list'
		let isCommit = type == 'commit', isTrigger = !type                                                                          // muhtemelen .trigger('change') vs
		let e = { ...arguments[0], select: isSelect, commit: isCommit, trigger: isTrigger }
		try {
			let {layout, input, autoClearFlag: autoClear, queue} = this
			let hasFocus = layout?.is(':focus') || input?.is(':focus')
			if (isSelect) {
				if (item != null) {
					let {kodSaha, adiSaha} = this
					let {value, label} = item
					if (label == value)
						label = null
					item = { [kodSaha]: value, [adiSaha]: label }
				}
			    this.item = item
			}
			else if (isCommit) {
			    this.value = input.val()
				item = this.item
			}
			else if (fromList)
				this.item = item
			e.item = item
			e.value = this.value
			// input.attr('placeholder', this.renderedInputText)
			// no change event trigger, if possible
			setTimeout(() => input[0].value = null, 1)
			if (queue) {
				queue.push(e)
				clearTimeout(this._timer_queue)
				this._timer_queue = setTimeout(() => this.processQueue(), 200)
			}
			else
				this.signalChange(e)
			input.blur()
			setTimeout(() => input.focus(), 1)
		}
		finally { setTimeout(() => this._inEvent = false, 5) }
	}
	processQueue(e) {
		let {queue} = this
		let events = queue.filter(_ => _ != null)
		if (!events?.length)
			return this
		; (async events =>
			this.signalChange({ type: 'batch', events })
		)(events)
		for (let evt of queue) {
			(async args =>
				this.signalChange({ ...args })
			)(evt)
		}
		queue.splice(0)
		return this
	}
	listeIstendi({ event: evt }) {
		let {layout, input, mfSinif, listSource: source} = this
		if (!(source || mfSinif))
			return
		let sender = this, {kodsuzmu, kodSaha, adiSaha, item, value: kod, aciklama} = this
		let inputVal = input.val() ?? ''
		let cls = (class extends mfSinif {
			static orjBaslikListesi_gridInit({ sender: gridPart, sender: { bulPart } }) {
				super.orjBaslikListesi_gridInit(...arguments)
				let {bulFormKullanilirmi} = this
				if (bulFormKullanilirmi)
					gridPart.filtreTokens = inputVal ? inputVal.split(' ').map(x => x.trim()).filter(x => !!x) : null
			}
			static orjBaslikListesiDuzenle({ liste }) {
				super.orjBaslikListesiDuzenle(...arguments)
				let {kodKullanilirmi, adiKullanilirmi} = this

				// query builder için kolon eksiklerini tamamla
				let key2Col = fromEntries(liste.map(_ => [_.belirtec, _]))
				let kodCol = key2Col[kodSaha], adiCol = key2Col[adiSaha]
				if (!(kodCol && adiCol)) {
					let _e = { ...arguments[0], liste: [] }
					MQKA.orjBaslikListesiDuzenle(_e)
					let {liste: _liste} = _e
					if (kodKullanilirmi) { kodCol ??= _liste[0]; kodCol.belirtec = kodSaha }
					if (adiKullanilirmi) { adiCol ??= _liste[1]; adiCol.belirtec = adiSaha }
				}
				if (kodsuzmu)
					kodCol?.hidden()
				// ters sırada ekle
				if (adiCol && !key2Col[adiSaha])
					liste.unshift(adiSaha)
				if (kodCol && !key2Col[kodSaha])
					liste.unshift(kodCol)
			}
			static loadServerData(e) {
				let mfSinif = this, {sender: gridPart} = e
				let likeValue = aciklama || kod
				let _e = {
					...e, sender, gridPart, layout, input,
					mfSinif, kodSaha, adiSaha, item
					// value: likeValue                                                         // server-side LIKE filtering, if class supports
				}
				if (!source)
					return super.loadServerData(_e)
				return source?.(_e)
			}
		})
		let args = {
			secince: ({ rec: item, value }) => {
				this.item = item
				this._onChange({ type: 'list', layout, input, item })
				// this.focus()
			},
			kapaninca: () =>
				this.focus()
		}
		cls.listeEkraniAc({ args })
	}
	_onSourceReq(e) {
		if (this.disabled)
			return null
		let sender = this, {kodsuzmu: kodsuz, mfSinif, kodSaha, adiSaha, maxRows: maxRow} = this
		let {source, item, value: kod, aciklama, renderedInputText: text} = this
		if (!source && mfSinif) {
			source = ({ term: value, ...e }) =>
				mfSinif.loadServerData({ maxRow, value: value?.trimEnd?.() || undefined })
		}
		if (!source)
			return null
		if (!isFunction(source))
			return source
		$.extend(e, { sender, item, kod, aciklama, text, kodsuz, mfSinif, kodSaha, adiSaha })
		return source.call(this, e)
	}
	_onFocus(e) {
		let {input} = this
		if (input.val())
			input.select()
		// input.attr('placeholder', '')
		this.onResize()
		this.signal('focus', e)
	}
	_onBlur(e) {
		/*let {input} = this
		input.attr('placeholder', this.currentPlaceholder)*/
		this.signal('blur', e)
	}
	onResize(e) {
		super.onResize(e)
		let {layout, input} = this
		let btnListe = layout.children('button#liste')
		if (btnListe?.length)
			btnListe.css('left', `${input.offset().left + input.width() - 40}px`)
	}
	blur(e) {
		this.input.blur()
		return this
	}
	focus(e) {
		this.input.focus()
		return this
	}
	clear() {
		this.value = null
		return this
	}
	signalChange(e) { return this.signal('change', e) }
	signalFocus(e) { return this.signal('focus', e) }
	signalBlur(e) { return this.signal('blur', e) }
	async signal(name, args) {
		let sender = this, {layout, input, events} = this
		let handlers = events[name] ?? []
		for (let handler of handlers)
			await handler?.call?.(this, { sender, layout, input, ...args })
		return this
	}
	on(name, handler) {
		let {events} = this
		(events[name] ??= []).push(handler)
		return this
	}
	off(name, handler) {
		let {events} = this
		let handlers = (events[name] ?? [])
		if (!handler) {
			handlers.splice(0)
			return this
		}
		let ind = handlers.indexOf(handler) ?? -1
		if (ind > -1)
			handlers.splice(ind, 1)
		return this
	}
	val(value) {
		if (value === undefined)
			return this.value         // sadece 'kod'
		this.item = value             // kod/item
		return this
	}
	setItem(value) { this.item = value; return this }
	setValue(value) { this.value = value; return this }
	setAciklama(value) { this.aciklama = value; return this }
	setMFSinif(value) { this.mfSinif = value; return this }
	setPlaceholder(value) { this.placeholder = value; return this }
	setKodSaha(value) { this.kodSaha = value; return this }
	setAdiSAha(value) { this.adiSaha = value; return this }
	setSource(value) { this.source = value; return this }
	setListSource(value) { this.listSource = value; return this }
	kodlu() { this.kodsuzmu = false; return this }
	kodsuz() { this.kodsuzmu = true; return this }
	noAutoClear() { this.autoClearFlag = false; return this }
	degisince(handler) { return this.onChange(handler) }
	onChange(handler) { return this.on('change', handler) }
	onFocus(handler) { return this.on('focus', handler) }
	onBlur(handler) { return this.on('blur', handler) }
	setUserData(value) { this.userData = value; return this }
	setDelay(value) { this.delay = value; return this }
	setMinLength(value) { this.minLength = value; return this }              // autocomplete search trigger - minLength
	setMaxRows(value) { this.maxRows = value; return this }                  // autocomplete maxRows
	enable() { this.disabled = false; return this }
	disable() { this.disabled = true; return this }
	getLayout() { return $(`<div><input type="text"></div>`) }
}
