class FormBuilder_SubPart extends FBuilderWithInitLayout {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get defaultYanYanami() { return true } static get defaultHeight() { return 45 } static get defaultHeightCSS() { return `${this.defaultHeight}px` }
	get input() {
		let result = this._input;
		if (result != null && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result: result, commitFlag: true }); result = getFuncValue.call(this, result, e);
			if (e.commitFlag) this._input = result
		}
		return result
	}
	set input(val) { this._input = val }
	get kodAttr() {
		let result = this._kodAttr
		if (result === undefined) {
			result = this._kodAttr = e => {
				e.temp();
				let {rootPart} = this;
				if (rootPart)
					return rootPart.kodAttr || (rootPart.inst || {}).kodAttr || ((rootPart.inst || {}).class || {}).kodAttr
			};
		}
		if (result != null && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result: result, commitFlag: false });
			result = getFuncValue.call(this, result, e);
			if (e.commitFlag)
				this._kodAttr = result;
		}
		return result
	}
	set kodAttr(value) {
		this._kodAttr = value
	}
	get adiAttr() {
		let result = this._adiAttr
		if (result === undefined) {
			result = this._adiAttr = e => {
				e.temp();
				let {rootPart} = this;
				if (rootPart)
					return rootPart.adiAttr || (rootPart.inst || {}).adiAttr || ((rootPart.inst || {}).class || {}).adiAttr
			};
		}
		if (result != null && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result: result, commitFlag: false });
			result = getFuncValue.call(this, result, e);
			if (e.commitFlag)
				this._adiAttr = result;
		}
		return result
	}
	set adiAttr(value) {
		this._adiAttr = value
	}
	get source() {
		let result = this._source;
		if (result != null && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result, commitFlag: false }); result = getFuncValue.call(this, result, e);
			if (e.commitFlag) { this._source = result }
		}
		return result
	}
	set source(value) { this._source = value }
	get etiket() {
		let result = this._etiket;
		if (result != null && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ commitFlag: false }); result = getFuncValue.call(this, result, e);
			if (result === undefined) { let {mfSinif} = this; if (mfSinif) result = mfSinif.sinifAdi }
			if (e.commitFlag) this._etiket = result
		}
		if (result === undefined) { let {mfSinif} = this; if (mfSinif) { result = mfSinif.sinifAdi } }
		return result
	}
	set etiket(val) { this._etiket = val }
	get value() {
		let result = this._initValueSetFlag ? this._value : undefined; this._initValueSetFlag = false;
		let func = this._getValue ?? (e => this.defaultGetValue(e));
		if (func != null && typeof func == 'object') { let _e = this.getBuilderBlockArgs({ get initValue() { return this._value } }); result = getFuncValue.call(this, func, _e) }
		if (result != null && typeof result == 'object' && (isFunction(result) || result.run)) {
			let _e = this.getBuilderBlockArgs({ get initValue() { return result }, commitFlag: false }); result = getFuncValue.call(this, result, _e);
			if (_e.commitFlag) this._value = result
		}
		return result
	}
	set value(val) {
		let func = this._setValue || (e => this.defaultSetValue(e));
		if (func) {
			if (val != null && !val.prototype && isFunction(val)) {
				let e = this.getBuilderBlockArgs({ result: val }); val = val != null && typeof val == 'object' ? getFuncValue.call(this, val, e) : val;
				if (e.commitFlag) this._value = val
			}
			let _e = this.getBuilderBlockArgs({ value: val, get initValue() { return this._value } }); getFuncValue.call(this, func, _e);
			this._initValueSetFlag = true
		}
		return this
	}
	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			inputCSSClass: e.inputCSSClass, _input: e.input, _kodAttr: e.kodAttr, _adiAttr: e.adiAttr, _source: e.source,
			_getValue: e.getValue, _setValue: e.setValue, _etiket: e.etiket, etiketGosterim: e.etiketGosterim || '', _value: e.value,
			widgetArgsDuzenle: e.widgetArgsDuzenle, placeHolder: e.placeHolder ?? e.placeholder
		});
		if (this._value !== undefined) { this._initValueSetFlag = true }
	}
	buildDevam(e) {
		super.buildDevam(e); let {etiket, etiketGosterim, styles} = this;
		let elmLabel = this.elmLabel = $(`<label>${etiket == null ? '' : (etiket || '&nbsp;')}</label>`); elmLabel.prependTo(this.layout);
		styles.push(`$elementCSS > label { color: #888; width: var(--full) }`);
		if (etiketGosterim == 'placeholder') { elmLabel.addClass('basic-hidden') } else if (etiketGosterim == 'none') { elmLabel.addClass('jqx-hidden') }
	}
	afterBuild(e) {
		super.afterBuild(e); let {input} = this;
		if (input?.length) {
			let {elmLabel} = this; if (elmLabel?.length) {
				let id = this.getElementId(input); if (!input.attr('name')) { input.attr('name', id) }
				let {labelCSSClass} = this; if (!$.isEmptyObject(labelCSSClass)) { elmLabel.addClass(lCSSClass) }
			}
			let {inputCSSClass} = this; if (!$.isEmptyObject(inputCSSClass)) { input.addClass(inputCSSClass) }
		}
		if (this.autoInitLayoutFlag !== false) {
			let {temps} = e; if (temps.waitMS == null) { temps.waitMS = 0 } this.initLayout(e)
			/*setTimeout(e => this.initLayout(e), temps.waitMS, e); temps.waitMS += 10*/
		}
	}
	initLayout(e) { }
	kaydetOncesiIslemler(e) { }
	defaultGetValue(e) { return this.getConverted_getValue({ value: this._value }) }
	defaultSetValue(e) { this._value = this.getConverted_setValue({ value: e.value }) }
	getConverted_getValue(e) { return this.getConvertedValue(e) }
	getConverted_setValue(e) { return this.getConvertedValue(e) }
	getConvertedValue(e) {
		let {value} = e;
		if (value != null && value.char != null)
			value = value.char
		return value
	}
	etiketGosterim_normal() { this.etiketGosterim = ''; return this }
	etiketGosterim_placeholder() { this.etiketGosterim = 'placeholder'; return this }
	etiketGosterim_placeHolder() { return this.etiketGosterim_placeholder()}
	etiketGosterim_yok() { this.etiketGosterim = 'none'; return this }
	setMaxLength(value) { this.maxLength = value; return this }
	setSource(value) { this.source = value; return this }
	widgetArgsDuzenleIslemi(handler) { this.widgetArgsDuzenle = handler; return this }
	setEtiket(value) { this.etiket = value; return this }
	setInput(value) { this.input = value; return this }
	getValueIslemi(handler) { this._getValue = handler; return this }
	setValueIslemi(handler) { this._setValue = handler; return this }
	setValue(value) { let {input} = this; if (input?.length) { this.value = value } else { this._value = value; this._initValueSetFlag = true } return this }
	setPlaceHolder(value) { this.placeHolder = value; return this }
	setPlaceholder(value) { return this.setPlaceHolder(value) }
}
class FBuilder_SimpleElement extends FormBuilder_SubPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return null }
	constructor(e = {}) {
		super(e)
		$.extend(this, {
			inputTagName: e.tagName || e.tag || e.inputTagName || this.class.inputTagName,
			onChangeEvent: e.onChange || e.degisince,
			onKeyUpEvent: e.onKeyUp || e.tusaBasilinca
		})
	}
	buildDevam(e) {
		super.buildDevam(e); let {input} = this;
		if (input?.length) { if (!input.parent()?.length && this.autoAppendFlag) { input.appendTo(this.layout) } }
		else { let {inputTagName} = this; if (inputTagName) { let input = this.input = $(`<${inputTagName}/>`); input.appendTo(this.layout) } }
	}
	initLayout(e) {
		super.initLayout(e)
		let {ioAttr} = this
		if (ioAttr) {
			let {altInst} = this;
			if (altInst) {
				let {value} = this;
				if (this._initValueSetFlag)
					this.defaultSetValue({ value })
				else {
					value = altInst[ioAttr]
					if (!isFunction(value))
						this.value = value
				}
				let {_p} = altInst, pInst = _p?.[ioAttr]
				pInst?.change?.(e =>
					this.value = e.value) 
			}
		}
	}
	afterBuild(e) {
		super.afterBuild(e); let {input} = this;
		if (input?.length) {
			// let elmLabel_width = this.elmLabel_width || 0;
			if (!!this.etiketGosterim) { input.attr('placeholder', (this.placeHolder == null ? this.etiket : this.placeHolder) ?? '') }
			let {value} = this; if (value != null && this.ioAttr && this.altInst) { this.value = value }
		}
	}
	defaultGetValue(e) {
		let {input} = this; if (input?.length) return this.getConverted_getValue({ value: input.val() })
		return super.defaultGetValue(e)
	}
	defaultSetValue(e) {
		let {input} = this; if (input?.length) { input.val(this.getConverted_setValue({ value: e.value })); return }
		super.defaultSetValue(e)
	}
	signalChange(e) {
		let {onChangeEvent} = this; if (!onChangeEvent) return this
		if (!$.isArray(onChangeEvent)) onChangeEvent = [onChangeEvent]
		if ($.isEmptyObject(onChangeEvent)) return this
		for (let handler of onChangeEvent) getFuncValue.call(this, handler, e)
		return this
	}
	signalKeyUp(e) {
		let {onKeyUpEvent} = this; if (!onKeyUpEvent) return this
		if (!$.isArray(onKeyUpEvent)) onKeyUpEvent = [onKeyUpEvent];
		if ($.isEmptyObject(onKeyUpEvent)) return this
		for (let handler of onKeyUpEvent) getFuncValue.call(this, handler, e)
		return this
	}
	degisince(handler) { this.onChange(handler); return this }
	onChange(handler) {
		let {onChangeEvent} = this;
		if (!onChangeEvent) { onChangeEvent = this.onChangeEvent = [] }
		else if (!$.isArray(onChangeEvent)) { onChangeEvent = this.onChangeEvent = [onChangeEvent] }
		onChangeEvent.push(handler);
		return this
	}
	clearChangeEvents() { this.onChangeEvent = null; return this }
	onKeyUp(handler) {
		let {onKeyUpEvent} = this;
		if (!onKeyUpEvent) onKeyUpEvent = this.onKeyUpEvent = [];
		else if (!$.isArray(onKeyUpEvent)) onKeyUpEvent = this.onKeyUpEvent = [onKeyUpEvent]
		onKeyUpEvent.push(handler); return this
	}
	clearKeyUpEvents() { this.onKeyUpEvent = null; return this }
}
class FBuilder_DivOrtak extends FBuilder_SimpleElement {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'div' }
}
class FBuilder_Span extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'span' }
}
class FBuilder_InputOrtak extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'input' } static get noAutoChangeEvent() { return false }
	constructor(e = {}) {
		super(e)
		$.extend(this, {
			_value: e.value, inputType: e.inputType || this.class.inputType, maxLength: e.maxLength ?? this.class.maxLength,
			isReadOnly: e.readOnly ?? e.readonly ?? e.isReadOnly ?? e.isReadonly
		})
	}
	buildDevam(e) {
		let {value} = this
		super.buildDevam(e)
		let {input} = this
		if (input?.length) {
			let {inputType, maxLength, isReadOnly, etiket} = this
			if (inputType) { input.attr('type', inputType) }
			if (maxLength) { input.attr('maxlength', maxLength) }
			if (isReadOnly) { input.attr('readonly', '') }
			if (value != null) { if (value.then) { value.then(value => input.prop('value', value)) } else { input.prop('value', value) } }
			this.styles.push(`$elementCSS { min-width: 50px }`);
			/*if (etiket)*/ this.styles.push(`$elementCSS > input { width: var(--full); height: ${this.class.defaultHeight}px }`)
			if (this.onKeyUpEvent)
				input.on('keyup', evt => this.signalKeyUp({ sender: this, builder: this, event: evt }))
		}
	}
	postBuild(e) {
		super.postBuild(e)
		let {input, class: { noAutoChangeEvent }} = this
		if (input?.length) {
			input.on('focus', evt => setTimeout(() => evt.target.select(), 50))
			if (!noAutoChangeEvent) {
				input.on('change', evt => {
					let {currentTarget: target} = evt
					let sender = this, builder = this, {ioAttr} = this
					let value = this.getConverted_setValue({ value: target.value })
					if (value?.toString() != target.value?.toString())
						evt.currentTarget.value = value
					value = this.getConverted_getValue({ value })
					if (ioAttr) {
						let {altInst} = this
						if (altInst) {
							let {_p} = altInst, pInst = _p?.[ioAttr]
							if (pInst)
								pInst.setValues({ value })
							else
								altInst[ioAttr] = value
						}
					}
					this.signalChange({ sender, builder, event: evt, value })
					this._lastValue = value
				})
			}
		}
	}
	getConvertedValue(e) {
		let value = super.getConvertedValue(e)
		let {maxLength} = this
		if (value && maxLength && typeof value == 'string')
			value = value.toString().slice(0, maxLength)
		return value
	}
	editable() { this.isReadOnly = false; return this }
	readOnly() { this.isReadOnly = true; return this }
}
class FBuilder_LabelBase extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'div' }
	static get inputCSSClass() { return null }
	
	constructor(e) {
		e = e || {}; super(e);
		if (e.etiketGosterim == null) this.etiketGosterim_yok()
		this.altAlta()
	}
	buildDevam(e) {
		super.buildDevam(e); let {input} = this;
		if (input?.length) {
			let {etiket} = this; if (etiket) input.html(etiket)
			let {inputCSSClass} = this.class; if (inputCSSClass) input.addClass(inputCSSClass)
		}
	}
}
class FBuilder_Label extends FBuilder_LabelBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'label' }
	static get inputCSSClass() { return 'label' }
	
	constructor(e) { e = e || {}; super(e); this.etiket = e.etiket }
	buildDevam(e) {
		super.buildDevam(e)
		/*let {inputTagName, inputCSS} = this.class, {etiket} = this;
		this.layout = $(`<${inputTagName} class="${inputCSS} gray">${etiket || ''}</${inputTagName}>`)*/
	}
}
class FBuilder_Baslik extends FBuilder_LabelBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'h4' }
	static get inputCSSClass() { return 'baslik' }

	buildDevam(e) {
		super.buildDevam(e);
		let {inputTagName, inputCSSClass} = this.class;
		let {cssClasses} = this;
		cssClasses.push('cadetblue')
	}
}
class FBuilder_GroupBox extends FBuilder_LabelBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputCSSClass() { return 'groupbox' }
	buildDevam(e) {
		super.buildDevam(e);
		let {inputTagName, inputCSSClass} = this.class;
		let {styles} = this;
		let paddingTop = 8;
		styles.push(
			`$elementCSS { border: 2px solid #ccc; min-height: 10px; padding-top: 0 }`,
			`$elementCSS > *:not(${inputTagName}.${inputCSSClass}) { padding: 0 8px }`,
			`$elementCSS > ${inputTagName}.${inputCSSClass} {
				font-weight: bold; font-size: 65% !important; color: #999; background-color: white; min-width: 0 !important; width: min-content !important; height: min-content !important;
				position: relative; top: -${paddingTop}px; left: 25px; margin-bottom: -${paddingTop}px; padding: 0 10px; z-index: 1 }`
		)
	}
}
class FBuilder_TextInput extends FBuilder_InputOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get inputType() { return 'textbox' }
}
class FBuilder_PassInput extends FBuilder_InputOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get inputType() { return 'password' }
}
class FBuilder_TextArea extends FBuilder_InputOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get inputTagName() { return 'textarea' } static get inputType() { return null }
	constructor(e) { e = e || {}; super(e); $.extend(this, { rows: e.rows || 1, cols: e.cols ?? e.columns, maxRows: e.maxRows }) }
	buildDevam(e) {
		super.buildDevam(e); let {input} = this; if (input?.length) {
			let {rows, cols, maxRows} = this; if (rows) { input.attr('rows', rows) } if (cols) { input.attr('cols', cols) }
			if (maxRows) {
				input.on('change', evt => {
					let value = this.getConverted_getValue({ value: evt.target.value });
					if (value && typeof value == 'string') {
						let parts = value.split('\n');
						if (parts.length > maxRows) {
							let {_lastValue} = this; value = this._lastValue; if (value == null) { value = this.getConverted_setValue({ value: parts.slice(0, 1).join('\n') }) }
							evt.target.value = value
						}
					}
				})
			}
			this.styles.push( `$elementCSS { height: auto; vertical-align: top }`)
		}
	}
	setRows(value) { this.rows = value; return this } setCols(value) { this.cols = value; return this } setMaxRows(value) { this.maxRows = value; return this }
}
class FBuilder_NumberInput extends FBuilder_InputOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get inputType() { return 'number' }
	constructor(e) { e = e || {}; super(e); $.extend(this, { min: e.min, max: e.max, step: e.step, fra: e.fra }) }
	buildDevam(e) {
		super.buildDevam(e); let {input} = this;
		if (input?.length) {
			let {min, max, step, fra} = this; if (min != null) { input.attr('min', min) } if (max != null) { input.attr('max', max) } if (step != null) { input.attr('step', step) }
			input.on('change', evt => {
				let _value = evt.target.value; let value = typeof _value == 'number' ? this.getConverted_getValue({ value: _value }) : _value;
				if (value != null) {
					if (min != null && value < min) { value = min }
					if (max != null && value > max) { value = max }
					if (fra != null && typeof value == 'number') { value = roundToFra(value, fra) }
				}
				evt.target.value = value
			})
			this.styles.push(e => `$elementCSS > input { text-align: right }`)
		}
	}
	setMin(value) { this.min = value; return this } setMax(value) { this.max = value; return this }
	setStep(value) { this.step = value; return this } setFra(value) { this.fra = value; return this }
	getConvertedValue(e) {
		let value = super.getConvertedValue(e); value = value == null ? value : asFloat(value);
		let {fra} = this; if (typeof value == 'number' && fra != null) { value = roundToFra(value, fra) }
		let {maxLength} = this; if (value && maxLength) { value = asFloat(value.toString().slice(0, maxLength)) }
		return value
	}
}
class FBuilder_DateInput extends FBuilder_TextInput {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get maxLength() { return 12 } static get noAutoChangeEvent() { return true }
	buildDevam(e) {
		super.buildDevam(e); let {input, styles} = this; input.addClass('tarih');
		let part = this.part = new TarihUIPart({ layout: input }); part.change(e => {
			let value = this.getConverted_getValue({ value: e.value }), {ioAttr} = this;
			if (ioAttr) { let {altInst} = this; if (altInst) { let {_p} = altInst, pInst = (_p || {})[ioAttr]; if (pInst) { pInst.setValues({ value }) } else { altInst[ioAttr] = value } } }
			this.signalChange({ sender: part, builder: this, event: e, value }); this._lastValue = value
		});
		part.run(); styles.push(e => `$elementCSS { width: 130px !important }`)
	}
	defaultGetValue(e) { let {part} = this; if (part && !part.isDestroyed) { return this.getConverted_getValue({ value: part.value }) } return super.defaultGetValue(e) }
	defaultSetValue(e) { let {part} = this; if (part && !part.isDestroyed) { part.value = e.value; return } return super.defaultSetValue(e) }
}
class FBuilder_TimeInput extends FBuilder_TextInput {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get inputType() { return 'time' } static get maxLength() { return null }
	constructor(e) { e = e || {}; super(e); $.extend(this, { saniyesizmi: e.saniyesiz ?? e.saniyesizmi ?? true }) }
	preBuild(e) { super.preBuild(e); this.maxLength = this.maxLength || (this.saniyesizmi ? 5 : 7) }
	buildDevam(e) {
		super.buildDevam(e)
		let {input, styles, saniyesizmi} = this
		if (input?.length) {
			input.addClass('zaman')
			input[saniyesizmi ? 'addClass' : 'removeClass']('saniyesiz')
		}
		styles.push(
			`$elementCSS { --width: calc(120px + ${saniyesizmi ? 0 : 25}px); min-width: var(--width) !important; width: var(--width) !important }`)
	}
	saniyesiz() { this.saniyesizmi = true; return this }
	saniyeli() { this.saniyesizmi = false; return this }
	getConvertedValue({ value }) {
		if (value) {
			if (!isString(value))
				value = timeToString(value)
			value = value.slice(0, this.maxLength)
		}
		return value
	}
	getConverted_getValue(e) { return asDate(super.getConverted_getValue(e)) }
}
class FBuilder_ToggleButton extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		if (this.etiketGosterim == null) { this.etiketGosterim_placeholder() }
		$.extend(this, {
			_value: e.value, inputType: e.inputType || this.class.inputType, maxLength: e.maxLength ?? this.class.maxLength,
			isReadOnly: e.readOnly ?? e.readonly ?? e.isReadOnly ?? e.isReadonly
		})
	}
	buildDevam(e) {
		super.buildDevam(e); let {styles, layout, input} = this;
		if (input?.length) { styles.push( `$elementCSS { min-width: 100px; width: 150px !important; margin-right: 13px }`, `$elementCSS > input { width: var(--full) }` ) }
		let {elmLabel} = this; if (elmLabel?.length) { styles.push( `${this.getCSSElementSelector(elmLabel)} { width: auto !important; padding-top: 8px; margin-right: 13px }` ) }
		
	}
	getConvertedValue(e) { return asBoolQ(e.value) }
	editable() { this.isReadOnly = false; return this }
	readOnly() { this.isReadOnly = true; return this }
}
class FBuilder_CheckBox extends FBuilder_ToggleButton {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'input' }
	constructor(e) {
		e = e || {}; super(e);
		this.bottomFlag = e.bottomFlag ?? e.bottom ?? true
	}
	buildDevam(e) {
		let {value} = this; super.buildDevam(e);
		let {input, isReadOnly} = this; if (input?.length) {
			input.prop('type', 'checkbox');
			if (isReadOnly) { input.prop('disabled', true) }
			let setter = value => {
				if (value == null) { input.prop('indeterminate', true) }
				else { input.prop('indeterminate', false); input.prop('checked', value) }
			};
			if (value != null) { if (value.then) { value.then(value => setter(value)) } else { setter(value) } }
			input.on('change', evt => {
				let {ioAttr} = this, value = this.getConverted_getValue({ value: $(evt.currentTarget).is(':checked') });
				if (ioAttr) {
					let {altInst} = this;
					if (altInst) {
						let {_p} = altInst, pInst = (_p || {})[ioAttr];
						if (pInst) { pInst.setValues({ value }) } else { altInst[ioAttr] = value }
					}
				}
				this.signalChange({ sender: this, builder: this, event: evt, value })
			});
			let {styles, layout, elmLabel} = this;
			if (this.bottomFlag) { styles.push(`$elementCSS { margin-top: ${this.class.defaultHeight}px }`) }
			styles.push(...[
				`$elementCSS { min-width: unset !important; width: initial !important }`,
				`$elementCSS > label { color: #888; width: calc(var(--full) - 45px) !important }`,
				`$elementCSS > input { width: unset !important; min-width: 24px; min-height: 24px; margin-right: 11px }`,
				`$elementCSS > input:checked + label { font-weight: bold; color: cadetblue }`
			] );
			if (elmLabel?.length) {
				elmLabel.on('click', evt => input.click());
				styles.push(`$elementCSS { vertical-align: middle } $elementCSS > label { width: auto !important }` )
			}
		}
	}
	postBuild(e) {
		super.postBuild(e); let {input} = this;
		if (input?.length) {
			let layout = input.parent(); if (!layout?.length) { layout = this.layout }
			input.detach(); input.prependTo(layout)
		}
	}
	defaultGetValue(e) {
		let {input} = this; if (input?.length) { return this.getConverted_getValue({ value: input.prop('indeterminate') ? null : input.is(':checked') }) }
		return super.defaultGetValue(e)
	}
	defaultSetValue(e) {
		let {input} = this;
		if (input?.length) {
			let value = this.getConverted_setValue({ value: e.value }); input.prop('checked', value);
			if (value == null) { input.prop('indeterminate', true) }
			return
		}
		return super.defaultSetValue(e)
	}
	top() { this.bottomFlag = false; return this }
	bottom() { this.bottomFlag = true; return this }
}
class FBuilder_SwitchButton extends FBuilder_ToggleButton {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e = {}) {
		super(e); this.etiketGosterim_yok()
		;['onLabel', 'offLabel'].forEach(k =>
			this[k] = e[k])
	}
	buildDevam(e) {
		let {value} = this; super.buildDevam(e); let {input} = this;
		if (input?.length) {
			let {layout, isReadOnly} = this; layout.addClass('flex-row');
			let {widgetArgsDuzenle} = this; let _e = $.extend({}, e, { args: { theme, width: '100%', height: this.class.defaultHeight, value } });
			for (let key of ['onLabel', 'offLabel']) { let _value = this[key]; if (_value != null) { _e.args[key] = _value } }
			if (isReadOnly) { _e.args.disabled = true }
			if (widgetArgsDuzenle) { getFuncValue.call(this, widgetArgsDuzenle, _e); }
			input.jqxSwitchButton(_e.args);
			input.on('change', evt => {
				let {ioAttr} = this, value = this.getConverted_getValue({ value: !$(evt.currentTarget).val() });
				if (ioAttr) {
					let {altInst} = this;
					if (altInst) { let {_p} = altInst, pInst = (_p || {})[ioAttr]; if (pInst) { pInst.setValues({ value }) } else { altInst[ioAttr] = value } }
				}
				this.signalChange({ sender: this, builder: this, event: evt, value })
			});
			let {styles, elmLabel} = this;
			styles.push( `$elementCSS { margin-right: 0 !important; margin-bottom: 0 !important }` );
			if (elmLabel?.length) { elmLabel.on('click', evt => input.click()) }
		}
	}
	defaultSetValue(e) {
		let {input} = this; if (input?.length) { input.jqxSwitchButton('checked', this.getConverted_setValue({ value: e.value })); return }
		return super.defaultSetValue(e)
	}
}
class FBuilder_OptionBase extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return null }
	get source() { return super.source }
	set source(value) {
		super.source = value;
		let {layout} = this
		if (layout?.length)
			this.sourceAtandi({ sender: this, builder: this, source: value })
	}
	
	constructor(e = {}) {
		super(e)
		let {_kodAttr, _adiAttr} = this
		if (_kodAttr === undefined)
			_kodAttr = this._kodAttr = CKodVeAdi.kodSaha
		if (_adiAttr === undefined)
			_adiAttr = this._adiAttr = CKodVeAdi.adiSaha
		;['isReadOnly'].forEach(k =>
			this[k] = e[k])
	}
	buildDevam(e) {
		super.buildDevam(e)
		let {input, isReadOnly} = this
		if (input?.length)
			input.attr('readonly', '')
	}
	afterBuild(e) {
		super.afterBuild(e)
		let {layout, isReadOnly} = this
		if (layout?.length) {
			if (!this.layoutHasParent)
				layout.appendTo(this.parent)
			this.sourceAtandi(e)
		}
	}
	sourceAtandi(e = {}) {
		let source = e.source ?? this.source
		if (source) {
			let _e = { ...e, source }
			if (source.then) {
				source.then(recs => {
					_e.source = recs
					this.sourceAtandiDevam(_e)
				})
			}
			else
				this.sourceAtandiDevam(_e)
		}
	}
	sourceAtandiDevam(e) { }
	editable() { this.isReadOnly = false; return this }
	readOnly() { this.isReadOnly = true; return this }
}
class FBuilder_SelectElement extends FBuilder_OptionBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'select' }
	
	buildDevam(e) {
		super.buildDevam(e)
		let {input, styles} = this
		if (input?.length) {
			input.on('change', evt => {
				let value = $(evt.currentTarget).val()
				if (value != null) {
					value = this.getConverted_getValue({ value })
					let {ioAttr} = this
					if (ioAttr) {
						let {altInst} = this
						if (altInst) {
							let {_p} = altInst
							let pInst = _p?.[ioAttr]
							if (pInst)
								pInst.setValues({ value })
							else
								altInst[ioAttr] = value
						}
					}
					this.signalChange({ sender: this, builder: this, event: evt, value })
				}
			})
		}
		styles.push(`$elementCSS > select { width: var(--full); height: 45px; max-height: 60px }`)
	}
	sourceAtandiDevam(e) {
		let {input} = this; if (!input?.length) return
		let {source} = e; if (!source) return
		let {kodAttr, adiAttr} = this; if (!(kodAttr || adiAttr)) return
		let {_value} = this
		input.children().remove()
		for (let key in source) {
			let item = source[key], kod = item[kodAttr], aciklama = item[adiAttr];
			let optValue = coalesce(kod, aciklama), optLabel = coalesce(aciklama, kod) || '', elm = $(`<option value="${optValue}">${optLabel}</option>`);
			elm.appendTo(input); if (_value != null && _value == optValue) { elm.select() }
		}
	}
}
class FBuilder_RadioButton extends FBuilder_OptionBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'div' }
	
	buildDevam(e) {
		super.buildDevam(e); let {input, styles} = this;
		if (input?.length) { input.addClass('options') }
		styles.push(...[
			e => `$elementCSS { height: 40px }`,
			e => `$elementCSS > label { margin-top: 8px }`,
			e => `$elementCSS > .options { margin-left: 10px }`,
			e => `$elementCSS > .options, $elementCSS > .options > * { height: var(--full) }`,
			e => `$elementCSS > .options > button { background: whitesmoke; min-width: 100px; height: var(--full); padding: 0 20px }`,
			e => `$elementCSS > .options > button:not(.selected).jqx-fillstate-normal { background: whitesmoke }`,
			e => `$elementCSS > .options > button.selected { background: royalblue }`,
			e => `$elementCSS > .options > button.selected, $elementCSS > .options > button.selected > * { color: whitesmoke !important }`
		])
	}
	sourceAtandiDevam(e) {
		let {input} = this; if (!input?.length) { return }
		let {source} = e; if (!source) return
		let {kodAttr, adiAttr} = this; if (!(kodAttr || adiAttr)) return
		this.input = null; let {value} = this; this.input = input;
		input.children().remove();
		for (let key in source) {
			let item = source[key], kod = item[kodAttr], aciklama = item[adiAttr];
			let optValue = coalesce(kod, aciklama), optLabel = coalesce(aciklama, kod) || '';
			let elm = $(`<button data-value="${optValue}">${optLabel}</button>`); elm.appendTo(input);
			if (value != null && value == optValue) { elm.addClass('selected') }
		}
		let buttons = input.find('button').jqxButton({ theme });
		buttons.on('click', evt => {
			let elm = $(evt.currentTarget);
			let value = elm.data('value'); if (value == null) { return }
			input.find(`button:not([data-value="${value}"])`).removeClass('selected'); elm.addClass('selected');
			value = this.getConverted_getValue({ value });
			let {ioAttr} = this;
			if (ioAttr) {
				let {altInst} = this;
				if (altInst) {
					let {_p} = altInst, pInst = (_p || {})[ioAttr];
					if (pInst) { pInst.setValues({ value }) } else { altInst[ioAttr] = value }
				}
			}
			this.signalChange({ sender: this, builder: this, event: evt, value })
		})
	}
	defaultGetValue(e) {
		let {input} = this;
		if (input && input.length)
			return this.getConverted_getValue({ value: input.find(`button.selected`).data('value') });
		return super.defaultGetValue(e)
	}
	defaultSetValue(e) {
		let {input} = this;
		if (input?.length) {
			let value = this.getConverted_setValue({ value: e.value }), filterSelector = `[data-value="${value}"]`;
			input.find(`:not(${filterSelector})`).removeClass('selected'); input.find(filterSelector).addClass('selected');
			return
		}
		return super.defaultSetValue(e)
	}
}
class FBuilder_Button extends FBuilder_InputOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputTagName() { return 'button' }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { disabled: e.disabled ?? false, onClickEvent: e.onClick || e.onClickEvent || e.handler });
		if (e.etiketGosterim == null) { this.etiketGosterim_yok() }
	}
	buildDevam(e) {
		let {value} = this; super.buildDevam(e);
		let {input, styles} = this; if (input?.length) {
			input.prop('id', this.id); input.html(value);
			let {widgetArgsDuzenle} = this;
			let _e = $.extend({}, e, { args: { theme, width: '100%', height: '100%', disabled: this.disabled } }); if (widgetArgsDuzenle) { getFuncValue.call(this, widgetArgsDuzenle, _e); }
			input.jqxButton(_e.args); input.on('click', evt => this.signalClick($.extend({}, e, { builder: this, input: input, event: evt })))
		}
		styles.push(
			`$elementCSS > input { font-weight: bold; font-size: 85%; min-width: 60px; padding-left: 30px; padding-right: 30px }
			 $elementCSS > input.jqx-fill-state-normal { color: #999 }`
		)
	}
	postBuild(e) {
		super.postBuild(e);
		let {input} = this; if (input?.length) { input.off('focus') }
	}
	defaultGetValue(e) {
		let {input} = this; if (input?.length) { return this.getConverted_getValue({ value: input.html() }) }
		return super.defaultGetValue(e)
	}
	defaultSetValue(e) {
		let {input} = this; if (input?.length) { input.html(this.getConverted_setValue({ value: e.value })); return }
		return super.defaultSetValue(e)
	}
	signalClick(e) {
		let {onClickEvent} = this; if (!onClickEvent) return this
		if (!$.isArray(onClickEvent)) onClickEvent = [onClickEvent];
		if ($.isEmptyObject(onClickEvent)) return this
		for (let handler of onClickEvent) { getFuncValue.call(this, handler, e) }
		return this
	}
	enable() { this.disabled = false; return this }
	disable() { this.disabled = true; return this }
	tiklaninca(handler) { this.onClick(handler); return this }
	onClick(handler) {
		let {onClickEvent} = this; if (!onClickEvent) { onClickEvent = this.onClickEvent = [] } else if (!$.isArray(onClickEvent)) { onClickEvent = this.onClickEvent = [onClickEvent] }
		onClickEvent.push(handler); return this
	}
	clearClickEvents() { this.onClickEvent = null; return this }
}
class FBuilder_Color extends FBuilder_InputOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get inputType() { return 'color' }
	buildDevam(e) {
		super.buildDevam(e); let {input} = this;
		if (input?.length) {
			input.on('change', evt => this.signalChange({ sender: input, builder: this, event: evt, id: evt.target.id, value: this.value }));
			this.styles.push(`$elementCSS > input { font-weight: bold; font-size: 85%; min-width: 50px !important; width: auto !important }`)
		}
	}
	getConverted_getValue(e) { return super.getConverted_getValue(e) || null }
	getConverted_setValue(e) { return super.getConverted_setValue(e) || '#000000' }
}
class FBuilder_ModelKullan extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, {
			listedenSecilemezFlag: e.listedenSecilemezFlag ?? e.listedenSecilemez ?? false,
			noAutoWidthFlag: e.noAutoWidthFlag ?? e.noAutoWidth ?? true,
			isDropDown: e.isDropDown ?? e.dropDown,
			autoBindFlag: e.autoBindFlag ?? e.autoBind ?? false,
			kodGosterilsinmi: e.kodGosterilsinmi ?? e.kodGosterilsin,
			bosKodAlinirmi: e.bosKodAlinirmi ?? e.bosKodAlinir ?? true,
			bosKodEklenirmi: e.bosKodEklenirmi ?? e.bosKodEklenir ?? true,
			ozelQueryDuzenle: e.ozelQueryDuzenle || e.ozelQueryDuzenleBlock,
			loadServerDataBlock: e.loadServerData ?? e.loadServerDataBlock,
			initArgsDuzenle: e.initArgsDuzenle || e.initArgsDuzenleBlock,
			listeArgsDuzenle: e.listeArgsDuzenle || e.listeArgsDuzenleBlock,
			ekDuzenleyici: e.loadServerDataEkDuzenleBlock || e.loadServerDataEkDuzenle || e.ekDuzenleyici,
			veriYuklenince: e.veriYukleninceBlock || e.veriYuklenince || e.bindingCompleteBlock || e.bindingComplete,
			coklumu: e.coklu ?? e.coklumu, disabled: e.disabled ?? false
		})
	}
	buildDevam(e) {
		super.buildDevam(e); let {input} = this;
		if (input?.length) {
			let {widgetArgsDuzenle, etiketGosterim} = this; let {value} = this;
			if (value === undefined) { let {ioAttr} = this; if (ioAttr) { let {altInst} = this; if (altInst) { this.value = altInst[ioAttr]; value = this.value } } }
			let _e = $.extend({}, e, { args: {
				sender: this.sender, builder: this, autoBind: this.autoBindFlag, parentPart: this.rootPart, layout: input, listedenSecilemez: this.listedenSecilemezFlag,
				width: false, height: this.class.defaultHeight, mfSinif: this.mfSinif, source: this.source, ekDuzenleyici: this.ekDuzenleyici, value,
				isDropDown: this.isDropDown, coklumu: this.coklumu, noAutoWidth: this.noAutoWidthFlag, listedenSecilemez: this.listedenSecilemezFlag,
				kodGosterilsinmi: this.kodGosterilsinmi, bosKodAlinirmi: this.bosKodAlinirmi, bosKodEklenirmi: this.bosKodEklenirmi,
				ozelQueryDuzenle: this.ozelQueryDuzenle, loadServerDataBlock: this.loadServerDataBlock, initArgsDuzenle: this.initArgsDuzenle,
				listeArgsDuzenle: this.listeArgsDuzenle, veriYukleninceBlock: this.veriYuklenince, kodSaha: this.kodAttr, adiSaha: this.adiAttr,
				disabled: this.disabled, placeHolder: this.placeHolder ?? (() => (etiketGosterim == 'placeholder') ? this.etiket : '')
			} });
			if (widgetArgsDuzenle) { getFuncValue.call(this, widgetArgsDuzenle, _e) }
			let part = this.part = new ModelKullanPart(_e.args); part.run();
			if (part && !part.isDestroyed) {
				let _input = part.input; if (_input?.length) { this.input = _input }
				part.change(e => {
					let value = this.getConverted_getValue({ value: e.value }), {ioAttr} = this;
					if (ioAttr) { let {altInst} = this; if (altInst) { let {_p} = altInst, pInst = (_p || {})[ioAttr]; if (pInst) { pInst.setValues({ value }) } else { altInst[ioAttr] = value } } }
					this.signalChange({ sender: part, builder: this, event: e, item: e.item, value })
				})
			}
			if (!part?.width) { this.styles.push( `$elementCSS { min-width: 200px }`, `$elementCSS > input { /*width: auto !important;*/ width: 99.5% !important; height: ${this.class.defaultHeight}px !important }` ) }
		}
	}
	initLayout(e) {
		super.initLayout(e) /*let {part} = this;
		if (part && !part.isDestroyed) {
			let {value} = this;
			let block = value => {
				part.kod = null; part.kodAtandimi = false; let savedHandler = part.veriYukleninceBlock;
				part.veriYukleninceBlock = e => {
					part.veriYukleninceBlock = savedHandler; part.kod = value;
					part.kodAtandimi = true; part.input.val(value)
				}
			};
			if (value != null) { if (value.then) { value.then(value => block(value)) } else { block(value) } }
		}*/
	}
	dataBind() { this.part.dataBind(); return this }
	defaultGetValue(e) {
		let {part} = this; if (part && !part.isDestroyed) return this.getConverted_getValue({ value: part.value ?? this._value })
		return super.defaultGetValue(e)
	}
	defaultSetValue(e) {
		let {value} = e, {part} = this; if (part && !part.isDestroyed) { value = this.getConverted_setValue({ value }); if (value) { part.kodAtandimi = true } part.value = value; return }
		let {input} = this; if (input?.length) { input.val(this.getConverted_setValue({ value })); return }
		return super.defaultSetValue(e)
	}
	tekli() { this.coklumu = false; return this } tekil() { return this.tekli() } coklu() { this.coklumu = true; return this }
	comboBox() { this.isDropDown = false; return this } dropDown() { this.isDropDown = true; return this }
	autoBind() { this.autoBindFlag = true; return this } noAutoBind() { this.autoBindFlag = false; return this }
	kodGosterilsin() { this.kodGosterilsinmi = true; return this } kodGosterilmesin() { this.kodGosterilsinmi = false; return this }
	kodlu() { this.kodGosterilsin(); return this } kodsuz() { this.kodGosterilmesin(); return this }
	enable() { this.disabled = false; return this } disable() { this.disabled = true; return this }
	listedenSecilemez() { this.listedenSecilemezFlag = true; return this } listedenSecilmez() { return this.listedenSecilemez() } listedenSecilir() { this.listedenSecilemezFlag = false; return this }
	autoWidth() { this.noAutoWidthFlag = false; return this } noAutoWidth() { this.noAutoWidthFlag = true; return this }
	bosKodAlinir() { this.bosKodAlinirmi = true; return this } bosKodAlinmaz() { this.bosKodAlinirmi = false; return this }
	bosKodEklenir() { this.bosKodEklenirmi = true; return this } bosKodEklenmez() { this.bosKodEklenirmi = false; return this }
	tekil() { this.coklumu = false; return this } coklu() { this.coklumu = true; return this }
	loadServerDataHandler(handler) { this.loadServerDataBlock = handler; return this }
	ozelQueryDuzenleHandler(handler) { this.ozelQueryDuzenle = handler; return this } ozelQueryDuzenleBlock(handler) { return this.ozelQueryDuzenleHandler(handler) }
	ozelQueryDuzenleIslemi(handler) { return this.ozelQueryDuzenleHandler(handler) }
	initArgsDuzenleHandler(handler) { this.initArgsDuzenle = handler; return this } initArgsDuzenleBlock(handler) { return this.initArgsDuzenleHandler(handler) }
	listeArgsDuzenleHandler(handler) { this.listeArgsDuzenle = handler; return this } listeArgsDuzenleBlock(handler) { return this.listeArgsDuzenleHandler(handler) }
	setEkDuzenleyici(value) { this.ekDuzenleyici = value; return this } veriYukleninceBlock(handler) { this.veriYuklenince = handler; return this }
}
class FBuilder_Grid extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get gridSinif() {
		let result = this._gridSinif; if (result === undefined) { result = this._gridSinif = e => { e.temp(); let {rootPart} = this; if (rootPart) return rootPart.gridSinif ?? rootPart.gridPart?.class } }
		if (result != null && !result.prototype && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result })
			result = getFuncValue.call(this, result, e)
			if (e.commitFlag)
				this._gridSinif = result
		}
		return result
	}
	set gridSinif(value) { this._gridSinif = value }
	get detaySinif() {
		let result = this._detaySinif
		if (result === undefined) {
			result = this._detaySinif = e => {
				e.temp()
				let {rootPart} = this
				if (rootPart)
					return rootPart.detaySinif ?? rootPart.fis?.detaySinif ?? rootPart.inst?.detaySinif
			}
		}
		if (result != null && !result.prototype && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result })
			result = getFuncValue.call(this, result, e)
			if (e.commitFlag)
				this._detaySinif = result
		}
		return result
	}
	set detaySinif(value) { this._detaySinif = value }
	get kontrolcu() {
		let result = this._kontrolcu; if (result === undefined) { result = this._kontrolcu = e => { e.temp(); let {rootPart} = this; if (rootPart) return rootPart.kontrolcu } }
		if (result != null && !result.prototype && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, e);
			if (e.commitFlag) { this._kontrolcu = result }
		}
		return result
	}
	set kontrolcu(value) { this._kontrolcu = value }
	get kontrolcuSinif() {
		let result = this._kontrolcuSinif; if (result === undefined) { result = this._kontrolcuSinif = e => { e.temp(); let {rootPart} = this; return rootPart?.kontrolcuSinif || this.kontrolcu?.class } }
		if (result != null && !result.prototype && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, e);
			if (e.commitFlag) { this._kontrolcuSinif = result }
		}
		return result
	}
	set kontrolcuSinif(value) { this._kontrolcuSinif = value }
	get tabloKolonlari() {
		let result = this._tabloKolonlari;
		if (result === undefined) { result = this._tabloKolonlari = e => { e.temp(); let {rootPart} = this; if (rootPart) return rootPart.tabloKolonlari ?? rootPart.gridPart?.tabloKolonlari ?? rootPart.defaultTabloKolonlari } }
		if (result != null && !result.prototype && isFunction(result)) {
			let e = this.getBuilderBlockArgs({ result }); result = getFuncValue.call(this, result, e);
			if (e.commitFlag) { this._tabloKolonlari = result }
		}
		return result
	}
	set tabloKolonlari(value) { this._tabloKolonlari = value }

	constructor(e) {
		e = e || {}; super(e); this.etiketGosterim_yok();
		$.extend(this, {
			_gridSinif: e.gridSinif ?? GridliGirisPart, _detaySinif: e.detaySinif,
			_kontrolcu: e.kontrolcu ?? e.gridKontrolcu, _kontrolcuSinif: e.kontrolcuSinif ?? e.gridKontrolcuSinif,
			_tabloKolonlari: e.tabloKolonlari, tabloKolonlariDuzenle: e.tabloKolonlariDuzenle || e.tabloKolonlariDuzenleBlock,
			ozelQueryDuzenle: e.ozelQueryDuzenle || e.ozelQueryDuzenleBlock, ozelQuerySonucu: e.ozelQuerySonucu || e.ozelQuerySonucuBlock,
			yeniInstOlusturucu: e.yeniInstOlusturucu, noEmptyRowFlag: e.noEmptyRow ?? e.noEmptyRowFlag,
			editablemi: e.editable ?? e.editablemi ?? e.isEditable, sabitmi: e.sabitmi ?? e.sabit,
			veriYuklenince: e.veriYuklenince || e.veriYukleninceBlock || e.bindingComplete || e.bindingCompleteBlock,
			veriDegisince: e.veriDegisince || e.veriDegistiBlock || e.veriDegisti || e.cellValueChanged, rowNumberOlmasinFlag: e.rowNumberOlmasin ?? e.rowNumberOlmasinFlag,
			groupsChanged: e.groupsChanged ?? e.gridGroupsChanged ?? e.gridGroupsChangedBlock, notAdaptiveFlag: e.notAdaptive ?? e.notAdaptiveFlag, noAnimateFlag: e.noAnimate ?? e.noAnimateFlag,
			toplamYapi: e.toplamYapi
		})
		let {_kontrolcu} = this
		if (_kontrolcu)
			this._kontrolcuSinif = _kontrolcu.class
	}
	buildDevam(e) {
		super.buildDevam(e)
		let {input} = this
		if (input?.length) {
			/* input.addClass('dock-bottom') */
			let tabloKolonlari = this.tabloKolonlari || []; let {tabloKolonlariDuzenle, widgetArgsDuzenle} = this
			if (tabloKolonlariDuzenle) { 
				let _e = { liste: tabloKolonlari }
				let result = getFuncValue.call(this, tabloKolonlariDuzenle, _e)
				if (isArray(result))
					tabloKolonlari = result
			}
			let {kontrolcu, kontrolcuSinif} = this
			if (!kontrolcuSinif)
				kontrolcuSinif = this.kontrolcuSinif = kontrolcu?.class
			if (!kontrolcu && kontrolcuSinif) { kontrolcu = this.kontrolcu = new kontrolcuSinif() }
			let {mfSinif, yeniInstOlusturucu, detaySinif, noEmptyRowFlag, rowNumberOlmasinFlag, notAdaptiveFlag, noAnimateFlag, toplamYapi} = this
			let _e = {
				...e,
				args: {
					sender: this.sender, builder: this, parentPart: this.rootPart, layout: input, mfSinif, kontrolcu, tabloKolonlari,
					ozelQueryDuzenleBlock: this.ozelQueryDuzenle, ozelQuerySonucuBlock: this.ozelQuerySonucu, yeniInstOlusturucu,
					loadServerData: e => this.source, bindingCompleteBlock: e => this.veriYuklendi(e), gridVeriDegistiBlock: this.veriDegisince,
					gridGroupsChangedBlock: this.groupsChanged, sabitFlag: this.sabitmi,
					noEmptyRowFlag, detaySinif, rowNumberOlmasinFlag, notAdaptiveFlag,
					noAnimateFlag, toplamYapi
				}
			};
			if (widgetArgsDuzenle) {
				_e.args.argsDuzenle = e => {
					let _e = { sender: this.part, builder: this, ...e }
					getFuncValue.call(this, widgetArgsDuzenle, _e)
				}
			}
			this.part = new this.gridSinif(_e.args)
		}
	}
	afterBuildDevam(e) {
		let {part, styles, editablemi} = this; if (part) { part.run() }
		if (part && !part.isDestroyed) {
			let {grid, gridWidget} = part
			if (grid?.length) {
				this.input = grid
				this.widget = gridWidget
			}
			if (editablemi != null)
				part.isEditable = editablemi
		}
		styles.push(`$elementCSS > input { min-width: 150px; max-width: 99.7% }`)
		super.afterBuildDevam(e)
	}
	veriYuklendi(e) {
		let {part} = this, {gridWidget} = part
		if (gridWidget.editable && !part.sabitFlag && !this.noEmptyRowFlag && empty(gridWidget.getboundrows()))
			gridWidget.addrow(null, part.newRec())
		let {veriYuklenince} = this
		if (veriYuklenince)
			getFuncValue.call(this, veriYuklenince, e)
	}
	gridliGiris() { this.gridSinif = GridliGirisPart; return this } gridliGosterici() { this.gridSinif = GridliGostericiPart; return this }
	masterListe() { this.gridSinif = MasterListePart; return this } fisListe() { this.gridSinif = FisListePart; return this }
	rowNumberOlsun() { this.rowNumberOlmasinFlag = false; return this } rowNumberOlmasin() { this.rowNumberOlmasinFlag = true; return this }
	adaptive() { return this.notAdaptiveFlag = false; return this } notAdaptive() { this.notAdaptiveFlag = true; return this }
	animate() { this.noAnimateFlag = false; return this } noAnimate() { this.noAnimateFlag = true; return this }
	setSabitmi(value) { this.sabitmi = value; return this } sabit() { return this.setSabitmi(true) }
	setEditablemi(value) { this.editablemi = value; return this } resetEditable() { return this.setEditablemi(undefined) }
	editable() { return this.setEditablemi(true) } readOnly() { return this.setEditablemi(false) }
	autoGrow() { return this.setSabitmi(false) } setNoEmptyRow(value) { this.noEmptyRowFlag = value; return this }
	noEmptyRow() { return this.setNoEmptyRow(true) } allowEmptyRow() { return this.setNoEmptyRow(false) }
	setGridSinif(value) { this.gridSinif = value; return this } setDetaySinif(value) { this.detaySinif = value; return this }
	setTabloKolonlari(value) { this.tabloKolonlari = value; return this }
	ozelQueryDuzenleHandler(handler) { this.ozelQueryDuzenle = handler; return this } ozelQueryDuzenleBlock(handler) { return this.ozelQueryDuzenleHandler(handler) }
	ozelQuerySonucuHandler(handler) { this.ozelQuerySonucu = handler; return this } ozelQuerySonucuBlock(handler) { return this.ozelQuerySonucuHandler(handler) }
	veriYukleninceIslemi(handler) { this.veriYuklenince = handler; return this } veriYukleninceBlock(handler) { return this.veriYukleninceIslemi(handler) }
	veriDegisinceIslemi(handler) { this.veriDegisince = handler; return this } veriDegisinceBlock(handler) { return this.veriDegisinceIslemi(handler) }
	groupsChangedIslemi(handler) { this.groupsChanged = handler; return this } onBindingComplete(value) { return this.veriYukleninceIslemi(value) }
	setKontrolcu(value) { this.kontrolcu = value; return this } setKontrolcuSinif(value) { this.kontrolcuSinif = value; return this }
	setToplamYapi(value) { this.toplamYapi = value; return this }
}

class FBuilder_IslemTuslari extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get islemTuslarimi() { return true }
	constructor(e = {}) {
		super(e)
		$.extend(this, {
			tip: e.tip, id2Handler: e.id2Handler,
			prependFlag: asBool(e.prepend ?? e.prependFlag), ekButonlarIlk: e.ekButonlarIlk || [],
			ekButonlarSon: e.ekButonlarSon || [],
			butonlarDuzenleyici: e.butonlarDuzenleyici,
			sagButonlar: e.sagButonlar ?? e.sagButonIdSet,
			ekSagButonlar: e.ekSagButonIdSet ?? e.ekSagButonIdSet,
			userData: e.userData
		})
		this.etiketGosterim_yok()
	}
	buildDevam(e) {
		super.buildDevam(e); let {input} = this
		if (input?.length) {
			input.css('width', 'var(--full)')
			input.css('height', 'var(--full)')
			let {widgetArgsDuzenle} = this
			let _e = { ...e, args: {
				sender: this.sender, parentPart: this.rootPart, builder: this, layout: input, userData: this.userData,
				tip: this.tip, id2Handler: this.id2Handler, prepend: this.prependFlag, ekButonlarIlk: this.ekButonlarIlk, ekButonlarSon: this.ekButonlarSon,
				butonlarDuzenleyici: this.butonlarDuzenleyici, sagButonIdSet: this.sagButonlar, ekSagButonIdSet: this.ekSagButonlar
			} };
			widgetArgsDuzenle?.call(this, _e)
			let part = this.part = new ButonlarPart(_e.args)
			part.run()
		}
	}
	append() { this.prependFlag = false; return this }
	prepend() { this.prependFlag = true; return this } setPrependFlag(value) { this.prependFlag = value; return this }
	setTip(value) { this.tip = value; return this }
	setButonlarIlk(value) { this.ekButonlarIlk = value; return this }
	setButonlarSon(value) { this.ekButonlarSon = true; return this }
	setId2Handler(handler) { this.id2Handler = handler; return this }
	setButonlarDuzenleyici(handler) { this.butonlarDuzenleyici = handler; return this }
	setSagButonlar(..._values) { let values = _values?.flat(); this.sagButonlar = values; return this }
	setEkSagButonlar(..._values) { let values = _values?.flat(); this.ekSagButonlar = values; return this }
	setUserData(value) { this.userData = value; return this }
}
class FBuilder_AccordionPart extends FBuilder_DivOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
    constructor({ panels, coklu, coklumu, defaultCollapsed, events, userData, ...e } = {}) {
        super(e)
		panels ??= []; coklu ??= coklumu
		$.extend(this, { panels, coklu, defaultCollapsed, events, userData })
		this.etiketGosterim_yok()
    }
	afterBuild(e) {
		let {input} = this, part
        if (input?.length) {
			let sender = this, builder = this, layout = input
			let {rootPart: parentPart, panels, coklumu: coklu, isDefaultCollapsed: defaultCollapsed, events, userData} = this
            // AccordionPart kendi layout’unu input olarak kullanacak
            input.addClass('full-wh')
            let _e = {
                ...e,
                args: { sender, parentPart, builder, layout, panels, coklu, defaultCollapsed, events, userData }
			}
            this.widgetArgsDuzenle?.call(this, _e)
            part = this.part = new AccordionPart(_e.args)
        }
		super.afterBuild(e)
		if (part) {
			part.run()
			if (part && !part.isDestroyed)
                this.input = part.layout
		}
    }
	// PANEL EKLEME
    addPanel(item) {
        let {panels, part} = this
        // Forward to runtime Part if already built
        if (part && !part.isDestroyed)
            part.add(item)
		else
	        panels.push(item)
        return this
    }
    // DSL setters
    coklu(value = true) { this.coklumu = !!value; return this }
    tekli(value = true) { this.coklumu = !value; return this }
    defaultCollapsed(value = true) { this.isDefaultCollapsed = !!value; return this }
    defaultExpanded(value) { this.isDefaultCollapsed = !value; return this }
    setEvents(value) { this.events = value; return this }
    setUserData(value) { this.userData = value; return this }
	on(name, handler) { (this.getEvents()[name] ??= []).push(handler); this.part?.on(name, handler); return this }
	off(name) { delete this.getEvents()[name]; this.part?.off(name, handler); return this }
	signal(name) { this.part?.signal(name); return this }
	onStateChange(handler) { return this.on('stateChange', handler) }
	onExpand(handler) { return this.on('expand', handler) }
	onCollapse(handler) { return this.on('collapse', handler) }
	onFocus(handler) { return this.on('focus', handler) }
	onBlur(handler) { return this.on('blur', handler) }
    setEvents(v) { this.events = v; this.part?.setEvents(v); return this }
	getEvents() { return this.events ??= {} }
}
class FBuilder_SimpleComboBox extends FBuilder_TextInput {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
        super(e)
		let {
			name, etiket, placeholder = e.placeHolder,
			value = this.value, source: _source, listSource,
			mfSinif, kodSaha, adiSaha,
			kodsuzmu = e.kodsuz, autoClearFlag = e.autoClear,
			delay, minLength, maxRows,
	        disabled, userData, events
		} = e
		$.extend(this, {
            name, etiket, placeholder,
			value, _source, listSource,
			mfSinif, kodSaha, adiSaha,
			kodsuzmu, autoClearFlag,
			delay, minLength, maxRows,
			disabled, events, userData
        })
        // this.etiketGosterim_normal()
    }
    buildDevam(e) {
        super.buildDevam(e)
        let {input} = this                                                    // Layout aslında input olarak hizmet edecek
        if (input?.length) {
            let sender = this, builder = this, {parent, layout, input} = this
			if (layout?.length && parent?.length && layout.parent() != parent)
				layout.detach().appendTo(parent)
			let {placeholder = e.placeHolder, _source: source, widgetArgsDuzenle} = this
            let args = { layout, input, placeholder, source }
			let keys = [
				'id', 'name', 'etiket', 'value', 'listSource', 'autoClearFlag', 'kodsuzmu',
				'mfSinif', 'kodSaha', 'adiSaha', 'delay', 'minLength', 'maxRows',
				'disabled', 'userData', 'events'
			]
			for (let k of keys) {
				let v = this[k]
				if (v !== undefined)
					args[k] = v
			}
			if (args.value == null) {
				let {id, altInst: inst} = this
				if (inst)
					args.value = inst[id]
			}
			let _e = { ...e, args }
			// Kullanıcı custom düzenleme isterse
            widgetArgsDuzenle?.call(this, _e)
            let part = this.part = new SimpleComboBoxPart(_e.args)
            part.run()
            // Builder input pointer’ı güncelle
            if (part && !part.isDestroyed) {
				for (let k of ['layout', 'input'])
					this[k] = part[k] ?? this[k]
			}
        }
    }
	postBuild(e) {
		let {input, part, class: { noAutoChangeEvent }} = this
		this.input = null
		super.postBuild(e)
		this.input = input
		if (part) {
			// input.on('focus', evt =>
			// 		setTimeout(() => evt.target.select(), 50))
			if (!noAutoChangeEvent) {
				part.degisince(({ type, events = [] }) => {
					if (type != 'batch')
						return
					let {value} = events.at(-1) ?? {}
					if (value === undefined)
						return
					let sender = this, builder = this, {ioAttr} = this
					value = this.getConverted_setValue({ value })
					if (ioAttr) {
						let {altInst} = this
						if (altInst) {
							let {_p} = altInst, pInst = _p?.[ioAttr]
							if (pInst)
								pInst.setValues({ value })
							else
								altInst[ioAttr] = value
						}
					}
					this.signalChange({ sender, builder, event, value })
					this._lastValue = value
				})
			}
		}
	}
	getConverted_getValue(e) {
		let {part} = this
		return part && !part.isDestroyed ? part.renderedInputText : super.getConverted_getValue(e)
	}
	getConverted_setValue(e) {
		let {part} = this
		return part && !part.isDestroyed ? part.val() : super.getConverted_setValue(e)
	}
    setId(v) { super.setId(v); this.part?.setId(v); return this }
    setName(v) { this.name = v; this.part?.setName(v); return this }
    setValue(v) { this.value = v; this.part?.setItem(v); return this }                                     // * widget 'item' setter => (value, item) durumların her ikisini de destekler
    setPlaceHolder(v) { super.setPlaceHolder(v); this.part?.setPlaceholder(v); return this }
	setPlaceholder(v) { return this.setPlaceHolder(v) }
    setSource(v) { this._source = v; this.part?.setSource(v); return this }
	setListSource(v) { this.listSource = v; this.part?.setListSource(v); return this }
    setMFSinif(v) { this.mfSinif = v; this.part?.setMFSinif(v); return this }
    setKodSaha(v) { this.kodSaha = v; this.part?.setKodSaha(v); return this }
    setAdiSaha(v) { this.adiSaha = v; this.part?.setAdiSaha(v); return this }
    setDelay(v) { this.delay = v; this.part?.setDelay(v); return this }
    setMinLength(v) { this.minLength = v; this.part?.setMinLength(v); return this }
    setMaxRows(v) { this.maxRows = v; this.part?.setMaxRows(v); return this }
	autoClear() { this.autoClearFlag = true; this.part?.autoClear(); return this }
	noAutoClear() { this.autoClearFlag = false; this.part?.noAutoClear(); return this }
	kodlu() { this.kodsuzmu = false; this.part?.kodlu(); return this }
	kodsuz() { this.kodsuzmu = true; this.part?.kodsuz(); return this }
    setUserData(v) { this.userData = v; this.part?.setUserData(v); return this }
	enable() { this.disabled = false; this.part?.enable(); return this }
	disable() { this.disabled = true; this.part?.disable(); return this }
	on(name, handler) { (this.getEvents()[name] ??= []).push(handler); this.part?.on(name, handler); return this }
	off(name) { delete this.getEvents()[name]; this.part?.off(name, handler); return this }
	signal(name) { this.part?.signal(name); return this }
	onChange(handler) { return this.on('change', handler) }
	degisince(handler) { return this.onChange(handler) }
	onFocus(handler) { return this.on('focus', handler) }
	onBlur(handler) { return this.on('blur', handler) }
    setEvents(v) { this.events = v; this.part?.setEvents(v); return this }
	getEvents() { return this.events ??= {} }
}
