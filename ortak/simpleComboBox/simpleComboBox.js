class SimpleComboBoxPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get partName() { return 'simpleComboBox' }
	get mfSinif() {
		let { _mfSinif: res } = this
		let { sender, builder, parentPart, colDef } = this
		return isFunction(res) || res?.run
			? getFuncValue.call(this, res, { sender, builder, parentPart, colDef })
			: res
	}
	set mfSinif(cls) {
		this._mfSinif = cls
		let { mfSinif } = this
		this.kodSaha = mfSinif?.kodSaha
		this.adiSaha = mfSinif?.adiSaha
	}
	get kodSaha() { return this._kodSaha ?? MQKA.kodSaha }
	set kodSaha(value) { this._kodSaha = value || null }
	get adiSaha() { return this._adiSaha ?? MQKA.adiSaha }
	set adiSaha(value) { this._adiSaha = value || null }
	get item() {
		let { kodSaha, _item: item } = this
		if (!isObject(item))
			item = this._item = { [kodSaha]: item }
		return item
	}
	set item(value) {
		let { layout, input, kodSaha, adiSaha, autoClearFlag: autoClear } = this
		let item = value
		if (!isObject(item))
			item = { [adiSaha]: item }
		this._item = item
		let { [kodSaha]: kod } = item ?? {}
		layout?.[kod ? 'addClass' : 'removeClass']('has-value')
		if (input?.length) {
			// input.val(this.renderedInputText)
			let {placeholder, _initPlaceholder} = this
			if (!autoClear)
				placeholder = this.renderedText || _initPlaceholder
			input.attr('placeholder', placeholder)
		}
	}
	get value() {
		let {item, kodSaha} = this
		let value = item?.[kodSaha]
		value = value?.trimEnd?.() ?? value
		return value
	}
	set value(value) {
		let {kodSaha} = this
		value = value?.trimEnd?.() ?? value
		if (value != null && !(value || isString(value)))
			value = null
		this.item = { [kodSaha]: value }
		if (!this.aciklama)
			setTimeout(() => this.aciklamaBelirle(), 10)
	}
	get aciklama() {
		let {item, adiSaha} = this
		let value = item?.[adiSaha]
		value = value?.trimEnd?.() ?? value
		return value
	}
	set aciklama(value) {
		let {adiSaha} = this
		let item = this.item ??= {}
		item[adiSaha] = value?.trimEnd?.() ?? value
		this.item = item                                     // trigger
	}
	get placeholder() {
		let {input, _placeholder} = this
		return input?.length ? input.attr('placeholder') : _placeholder
	}
	set placeholder(value) {
		let {input} = this
		this._placeholder = value
		this._initPlaceholder ??= value
		input?.attr('placeholder', value)
	}
	get disabled() {
		let { input, _disabled } = this
		return _disabled ?? input?.attr('readonly') != null
	}
	set disabled(value) {
		let { input, layout } = this
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
	/****** CKodVeAdi/MQKA interface ********/
	get kod() { return this.value }
	set kod(value) { this.value = value }
	/****************************************/

	constructor(e = {}) {
		super(e)
		let {
			item, value, mfSinif,
			noInitCommit: noInitCommitFlag = e.noInitCommitFlag,
			noQueue = e.noQueueFlag,
			autoClear: autoClearFlag = e.autoClearFlag,
			source, listSource, delay, minLength, maxRows, renderer,
			kodsuzmu = e.kodsuz, kodSaha, adiSaha,
			disabled: _disabled, events, queue, queueDelay
		} = e
		autoClearFlag ??= false; kodsuzmu ??= false
		delay ??= 500; maxRows ??= 10;
		minLength ??= 1; queueDelay ??= 250
		_disabled ??= false
		events ??= {}
		if (!noQueue)
			queue ??= []
		
		mergeAllInto(e, this,
			'id', 'name', 'placeholder', 'userData')
		mergeInto(e, this,
			'argsDuzenle', 'parentPart', 'sender', 'builder', 'colDef')
		
		extend(this, {
			mfSinif, autoClearFlag, source, listSource,
			_disabled, kodsuzmu, noInitCommitFlag,
			delay, minLength, maxRows, renderer, events,
			queue, queueDelay
		})
		// !! (kodSaha, adiSaha) ve (item, value) mutlaka (mfSinif) sonrası atanmalı.
		//	(kodSaha, adiSaha) değerleri ve (value -> item set işlemi) duruma göre mfSinif'a bakarak belirleniyor
		if (kodSaha)
			this.kodSaha = kodSaha
		if (adiSaha)
			this.adiSaha = adiSaha
		extend(this, { item, value })
	}
	runDevam(e = {}) {
		super.runDevam(e)
		let sender = this
		let { layout, argsDuzenle, class: { partName } } = this
		layout.addClass(`${partName} part`)
		let input = this.input ??= layout.children('input')
		if (!input?.length)
			( input = $(`<input type="text">`) ).appendTo(layout)
		let _e = { ...e, sender, layout, input }
		argsDuzenle?.call(this, _e)
		let { id, name = this.id, mfSinif, kodSaha, adiSaha, delay } = this
		let { minLength, maxRows, listSource, _disabled: disabled } = this
		layout = this.layout = _e.layout
		input = this.input = _e.input
		for (let [k, v] of entries({ id, name })) {
			if (v)
				input.attr(k, v)
		}
		input.val(this.renderedInputText || null)
		input.attr('placeholder', this.renderedText)
		input.on('change', event => {
			let { currentTarget: { value } } = event
			this._dirty = true
			this._onChange({ type: 'change', event, layout, input, value })
		})
		input.on('keydown', event => {
			let { key, currentTarget: { value } } = event
			key = key?.toLowerCase()
			let editCellmi = layout?.hasClass('jqx-grid-cell-edit')
			if (key == 'enter' || key == 'linefeed' || (editCellmi && key == 'tab'))
				this._onChange({ type: 'commit', event, layout, input, value })
		})
		input.on('contextmenu', event => {
			let { button, pointerId } = event
			if (pointerId == 1 && button != 2)    // touch durumda textbox dolu ise, sol tıklama için contextmenu event gelebiliyor
				return
			event?.preventDefault()
			setTimeout(() => this.listeIstendi({ event }))
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
					// let result = recs.map(rec => rec[adiSaha] || rec[kodSaha]).sort()
					let result = recs.map(rec => ({ value: rec[kodSaha], label: rec[adiSaha] }))
					function getSortText(item) {
						let value = isObject(item)
							? item.label ?? item.value
							: item
						return value?.toString() ?? ''
					}
					result.sort((a, b) =>
						getSortText(a).localeCompare(getSortText(b), culture, {
							numeric: true,
							sensitivity: 'base'
						})
					)
					callback(result)
				}),
				select: ((event, { item }) =>
					this._onChange({ type: 'select', event, layout, input, item }))
			})
		}, 100)
		if (listSource || mfSinif) {
			let btnListe = layout.children('button#liste')
			if (!btnListe?.length)
				(btnListe = $('<button id="liste" tabindex="-1"> L </button>')).appendTo(layout)
			btnListe.off('click')
			btnListe.on('click', event =>
				this.listeIstendi({ event }))
		}
		this.disabled = disabled    // init event trigger
		this._initialized = true
		setTimeout(() => {
			let { kodSaha, noInitCommitFlag: noInitCommit } = this
			this.onResize(e)
			let value = input.val()
			this.item = { [kodSaha]: value }
			if (value && !noInitCommit)
				this._onChange({ type: 'commit', layout, input, value })
		})
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
		if (ka.kod != null && ka.kod == ka.aciklama)
			ka.kod = null
		if (ka.kod != null && !(ka.kod || isString(ka.kod)))
			ka.kod = null
		let result = renderer?.call(this, ...arguments)
		// result ??= kodsuz ? ka.aciklama || ka.kod : ka.parantezliOzet()                                // * kodsuz ise ve aciklama boşsa (kod => aciklama kabul edilir)
		result ??= kodsuz || !(ka.kod && ka.aciklama)
			? ka.aciklama || ka.kod || ''
			: `${ka.aciklama || ''}  (${ka.kod || ''})`
		return result
	}
	 async _onChange({ type, item }) {
		// event debounce & type checks
		let { _inEvent, disabled } = this
		if (_inEvent || disabled || type == 'keypress' || type == 'change')
			return

		this._dirty = false
		this._inEvent = true
		let isSelect = type == 'select', fromList = type == 'list'
		let isCommit = type == 'commit'
		let isTrigger = !type || type == 'trigger'
		let e = { ...arguments[0], select: isSelect, commit: isCommit, trigger: isTrigger }
		try {
			let { layout, input, autoClearFlag: autoClear, queue } = this
			let hasFocus = layout?.is(':focus') || input?.is(':focus')
			if (isSelect) {
				if (item != null) {
					let {kodSaha, adiSaha} = this
					let {value, label} = item
					item = { [kodSaha]: value, [adiSaha]: label }
				}
			    this.item = item
			}
			else if (isCommit) {
			    this.value = input.val()
				if (!this.aciklama) {
					clearTimeout(this._timer_aciklama)
					this._timer_aciklama = setTimeout(async () => {
						try { await this.aciklamaBelirle() }
						finally { delete this._timer_aciklama }
					}, 10)
				}
				item = this.item
			}
			else if (fromList)
				this.item = item
			
			;{
				let { value, aciklama: label, value: kod, aciklama } = this
				extend(e, { item, value, label, kod, aciklama })
			}
			// input.attr('placeholder', this.renderedInputText)
			// no change event trigger, if possible
			setTimeout(() => input[0].value = null, 1)
			if (queue) {
				let { queueDelay } = this
				queue.push(e)
				clearTimeout(this._timer_queue)
				this._timer_queue = setTimeout(() => this.processQueue(), queueDelay || 0)
			}
			else
				this.signalChange(e)

			clearTimeout(this._timerFocus)
			if (!isTrigger) {
				input.blur()
				this._timerFocus = setTimeout(() => input.focus(), 5)
			}
		}
		finally { setTimeout(() => this._inEvent = false, 5) }
	}
	processQueue(e) {
		let { queue } = this
		let events = queue.filter(_ => _ != null)
		if (empty(events))
			return this

		promise(() =>
			this.signalChange({ type: 'batch', events }))
		;queue.forEach(args =>
			promise(() => this.signalChange({ ...args })))
		
		queue.splice(0)
		return this
	}
	async aciklamaBelirle() {
		let sender = this
		let { value, mfSinif, kodSaha, adiSaha, source, listSource } = this
		if (!value) {
			if (this.aciklama)
				this.aciklama = ''
			return this
		}
		if (!(mfSinif || source || listSource))
			return this
		let aciklama = await mfSinif?.getGloKod2Adi?.(value?.toString())
		if (!aciklama && adiSaha && (listSource || source)) {
			let e = { ...arguments[0], sender, kodSaha, adiSaha, value, maxRow: 1 }
			let rec = (await (listSource ?? source).call?.(this, e))?.[0]
			aciklama = rec?.[adiSaha]
		}
		if (aciklama)
			this.aciklama = aciklama
		return this
	}
	listeIstendi({ event: evt }) {
		let { disabled, mfSinif, listSource: source } = this
		source ??= this.source
		if (disabled || !(source || mfSinif))
			return

		let sender = this
		let { layout, input } = this
		let { kodsuzmu, kodSaha, adiSaha, item, value: kod, aciklama } = this
		let inGridEditor = layout?.hasClass('jqx-grid-cell-edit')
		let inputVal = input.val() ?? ''
		let orjMFSinif = mfSinif ?? MQKA
		let { kodSaha: mfKodSaha, adiSaha: mfAdiSaha } = orjMFSinif
		let cls = (class extends orjMFSinif {
			static get classKey() { return orjMFSinif.classKey }
			
			static orjBaslikListesi_gridInit({ sender: gridPart, sender: { bulPart } }) {
				super.orjBaslikListesi_gridInit(...arguments)
				if (!inGridEditor) {
					let { bulFormKullanilirmi } = this
					if (bulFormKullanilirmi) {
						gridPart.filtreTokens = inputVal
							? inputVal
								.split(' ')
								.map(x => x.trim())
								.filter(Boolean)
							: null
					}
				}
			}
			static standartGorunumListesiDuzenle({ liste }) {
				super.standartGorunumListesiDuzenle(...arguments)
				let { kodKullanilirmi, adiKullanilirmi } = this
				if (empty(liste))
					orjMFSinif.standartGorunumListesiDuzenle({ liste })
				if (kodKullanilirmi && !liste.includes(mfKodSaha))
					liste.push(mfKodSaha)
				if (adiKullanilirmi && !liste.includes(mfAdiSaha))
					liste.push(mfAdiSaha)
			}
			static orjBaslikListesiDuzenle({ liste }) {
				super.orjBaslikListesiDuzenle(...arguments)
				let { kodKullanilirmi, adiKullanilirmi } = this
				// query builder için kolon eksiklerini tamamla
				let key2Col = fromEntries(liste.map(_ => [_.belirtec, _]))
				let kodCol = key2Col[mfKodSaha], adiCol = key2Col[mfAdiSaha]
				if (!(kodCol && adiCol)) {
					let _e = { ...arguments[0], liste: [] }
					orjMFSinif.orjBaslikListesiDuzenle(_e)
					let { liste: _liste } = _e
					if (kodKullanilirmi) {
						kodCol ??= _liste[0]
						kodCol.belirtec = mfKodSaha
					}
					if (adiKullanilirmi) {
						adiCol ??= _liste[1]
						adiCol.belirtec = mfAdiSaha
					}
				}
				/*if (kodsuzmu)
					kodCol?.hidden()*/
				// ters sırada ekle
				if (adiCol && !key2Col[mfAdiSaha])
					liste.unshift(adiCol)
				if (kodCol && !key2Col[mfKodSaha])
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
					return orjMFSinif.loadServerData(_e)
				return source?.(_e)
			}
		})
		let args = {
			secince: async ({ recs, value }) => {
				recs ??= []
				if (empty(recs))
					return
				
				let { queue, kodSaha, adiSaha } = this
				if (queue) {
					for (let item of recs.slice(0, -1)) {
						let value = item[kodSaha], aciklama = item[adiSaha]
						let kod = value, label = aciklama
						let event = { type: 'list', layout, input, item, recs, kod, aciklama, value, label }
						queue.push(event)
					}
					//clearTimeout(this._timer_queue)
					//this._timer_queue = setTimeout(() => this.processQueue(), 250)
				}
				;{
					let item = this.item = recs.at(-1)
					let value = item[kodSaha], aciklama = item[adiSaha]
					let kod = value, label = aciklama
					await this._onChange({ type: 'list', layout, input, item, recs, kod, aciklama, value, label })
				}
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
		
		let sender = this
		let { kodsuzmu: kodsuz, mfSinif, kodSaha, adiSaha, maxRows: maxRow } = this
		let { source, item, value: kod, aciklama, renderedInputText: text } = this
		let { ozelQueryDuzenle } = this
		
		if (!source && mfSinif) {
			source = ({ term: value, ...e }) =>
				mfSinif.loadServerDataDogrudan({ maxRow, ozelQueryDuzenle, value: value?.trimEnd?.() || undefined })
		}
		if (!source)
			return null
		if (!isFunction(source))
			return source
		
		extend(e, { sender, item, kod, aciklama, text, kodsuz, mfSinif, kodSaha, adiSaha })
		return source.call(this, e)
	}
	_onFocus(e) {
		let  { input } = this
		if (input.val())
			input.select()
		// input.attr('placeholder', '')
		this.onResize()
		this.signal('focus', e)
	}
	_onBlur(e) {
		let { _dirty, input } = this
		if (_dirty) {
			let { layout } = this
			this._dirty = false
			let value = input.val()
			this.val(value)
			this._onChange({ type: 'trigger', layout, input, value })
		}
		/*let {input} = this
		input.attr('placeholder', this.currentPlaceholder)*/
		this.signal('blur', e)
	}
	onResize(e) {
		super.onResize(e)
		let { layout, input } = this
		let btnListe = layout.children('button#liste')
		if (btnListe?.length) {
			let editCellmi = layout?.hasClass('jqx-grid-cell-edit')
			let secimmi = !!layout?.parents('.secim')?.length
			if (editCellmi) {
				btnListe.css({
					left: 'unset',
					right: `${ btnListe.height() + ( btnListe.width() + 25 ) }px`,
					top: 'unset'
				})
			}
			else if (secimmi) {
				btnListe.css({
					left: `${input.width() - 70}px`,
					right: 'unset',
					top: `${-btnListe.height() - 22}px`
				})
			}
			else {
				btnListe.css({
					left: `${input.width() - 45}px`,
					right: 'unset',
					top: `${-btnListe.height() - 20}px`
				})
			}
		}
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
		this.input.val(null)
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
		let handlers = events[name] ??= []
		handlers.push(handler)
		return this
	}
	off(name, handler) {
		let {events} = this
		let handlers = events[name] ?? []
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
		this.value = value            // kod/item
		return this
	}
	setItem(value) { this.item = value; return this }
	setValue(value) { this.value = value; return this }
	setAciklama(value) { this.aciklama = value; return this }
	setMFSinif(value) { this.mfSinif = value; return this }
	setPlaceholder(value) { this.placeholder = value; return this }
	setPlaceHolder(value) { return this.setPlaceholder(value) }
	setKodSaha(value) { this.kodSaha = value; return this }
	setAdiSAha(value) { this.adiSaha = value; return this }
	setSource(value) { this.source = value; return this }
	setListSource(value) { this.listSource = value; return this }
	kodlu() { this.kodsuzmu = false; return this }
	kodsuz() { this.kodsuzmu = true; return this }
	noAutoClear() { this.autoClearFlag = false; return this }
	degisince(handler) { return this.onChange(handler) }
	change(handler) { return this.onChange(handler) }
	onChange(handler) { return this.on('change', handler) }
	onFocus(handler) { return this.on('focus', handler) }
	onBlur(handler) { return this.on('blur', handler) }
	setUserData(value) { this.userData = value; return this }
	setDelay(value) { this.delay = value; return this }
	setMinLength(value) { this.minLength = value; return this }              // autocomplete search trigger - minLength
	setMaxRows(value) { this.maxRows = value; return this }                  // autocomplete maxRows
	enable() { this.disabled = false; return this }
	disable() { this.disabled = true; return this }
	argsDuzenleIslemi(handler) { this.argsDuzenle = handler; return this }
	setParentPart(v) { this.parentPart = v; return this }
	setSender(v) { this.sender = v; return this }
	setBuilder(v) { this.builder = v; return this }
	noInitCommit() { this.noInitCommitFlag = true; return this }
	doInitCommit() { this.noInitCommitFlag = false; return this }
	ozelQueryDuzenleIslemi(h) { this.ozelQueryDuzenle = h; return this }
	noQueue() { this.queue = null; return this }
	useQueue() { this.queue = []; return this }
	getLayout() { return $(`<div><input type="text"></div>`) }
}



/*refs:
function empty(value) { return !value || (!value?.size && $.isEmptyObject(value)) }
function entries(value) { return value ? Object.entries(value) : null }
function keys(value) { return value ? Object.keys(value) : null }
function values(value) { return value ? Object.values(value) : null }
function fromEntries(value) { return value ? Object.fromEntries(value) : null }
function extend() { return $.extend(...arguments) }
function merge() { return $.merge(...arguments) }
function len(value) {
	if (value == null)
		return 0
	if (isPlainObject(value))
		return keys(value).length
	return value.length
}
function mergeAllInto(src, dest, ..._keys) {
	if (!( (src ?? dest) == null || empty(_keys) )) {
		;_keys.forEach(k =>
			dest[k] = src[k])
	}
	return dest
}
function mergeInto(src, dest, ..._keys) {
	if (!( (src ?? dest) == null || empty(_keys) )) {
		;_keys.forEach(k => {
			let v = src[k]
			if (v !== undefined)
				dest[k] = v
		})
	}
	return dest
}
function mergeIntoIfExists(src, dest, ..._keys) {
	if (empty(_keys))
		_keys = keys(src)
	if (!( (src ?? dest) == null || empty(_keys) )) {
		for (let k of _keys) {
			if (dest[k] === undefined)
				continue
			let v = src[k]
			if (v !== undefined)
				dest[k] = v
		}
	}
	return dest
}
function mergeIntoIfTargetNull(src, dest, ..._keys) {
	if (empty(_keys))
		_keys = keys(src)
	if (!( (src ?? dest) == null || empty(_keys) )) {
		for (let k of _keys) {
			if (dest[k] != null)
				continue
			let v = src[k]
			if (v !== undefined)
				dest[k] = v
		}
	}
	return dest
}
function mergeIntoIfTargetEmpty(src, dest, ..._keys) {
	if (empty(_keys))
		_keys = keys(src)
	if (!( (src ?? dest) == null || empty(_keys) )) {
		for (let k of _keys) {
			if (!empty(dest[k]))
				continue
			let v = src[k]
			if (v !== undefined)
				dest[k] = v
		}
	}
	return dest
}
function deleteKeys(obj, ...keys) {
	if (!(obj == null || empty(keys))) {
		for (let key of keys)
			delete obj[key]
	}
	return obj
}*/
