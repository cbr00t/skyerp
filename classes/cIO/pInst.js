class PInst extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get deepCopyAlinmayacaklar() { return [...(super.deepCopyAlinmayacaklar || []), 'events', 'value'] }	
	get initValue() { const {initBlock} = this; if (initBlock) { return getFuncValue.call(this, initBlock, { sender: this }) } return this.getValue(null) }
	constructor(e) {
		e = e || {}; super(e); this.events = {};
		if (typeof e == 'object') { this.ioAttr = e.ioAttr; this.rowAttr = e.rowAttr; this.initBlock = e.initBlock || e.init; this.converter = e.converter }
		else { this.rowAttr = e }
	}
	getValue(value) {
		const {converter} = this; value = this.getValueDevam(value);
		if (converter) { value = getFuncValue.call(this, converter, { sender: this, value }) }
		return value
	}
	getValueDevam(value) { return value }
	get hostVarsDegeri() { return this.getValue(this.value) }
	setValues(e) { const {value} = e; this.value = this.getValue(value) }
	pTanim2Inst_ek(e) { }
	addEventListener(eventName, handler) {
		const {events} = this, handlers = events[eventName] = events[eventName] || [];
		handlers.push(handler); return this
	}
	removeEventListener(eventName, handler) {
		const {events} = this, handlers = events[eventName]; if (!handlers) { return this }
		if (!handler) { delete handlers[eventName]; return this }
		for (let i = handlers.length - 1; i >= 0; i--) { const _handler = handlers[i]; if (_handler == handler) { handlers.splice(i, 1) } }
		if (!handlers.length) { delete events[eventName] } return this
	}
	clearEvents(eventName, handler) { const {events} = this; delete events[eventName]; return this }
	async raiseEvent(eventName, ...args) {
		const {events} = this, handlers = events[eventName]; if (!handlers) { return }
		for (const handler of handlers) { await getFuncValue.call(this, handler, ...args) }
	}
	on(eventName, handler) { return this.addEventListener(eventName, handler) }
	off(eventName, handler) { return this.removeEventListener(eventName, handler) }
	trigger(eventName, ...args) { return this.raiseEvent(eventName, ...args) }
	degisince(handler) { return this.change(handler) }
	onChange(handler) { return this.onChange(handler) }
	change(handler) { return this.on('change', handler) }
	shallowCopy(e) {
		const inst = super.shallowCopy(e); let {value} = this;
		if (value) {
			if (value.shallowCopy) { value = value.shallowCopy(e) }
			else if ($.isArray(value)) {
				const _arr = value = $.extend([], value), arr = [];
				for (let _value of _arr) {
					if (_value) {
						if (_value.shallowCopy) { _value = _value.shallowCopy(e) } else if ($.isArray(_value)) { _value = $.extend([], _value) }
						else if (typeof value == 'object') { _value = $.extend({}, _value) }
					}
					arr[i] = _value
				}
			}
			else if (typeof value == 'object') { value = $.extend({}, value) }
		}
		inst.value = value; return inst
	}
	deepCopy(e) {
		const inst = super.deepCopy(e); let {value} = this;
		if (value) {
			if (value.deepCopy) { value = value.deepCopy(e) }
			else if ($.isArray(value)) {
				const _arr = value, arr = value = [];
				for (let _value of _arr) {
					if (_value) {
						if (_value.deepCopy) { _value = _value.deepCopy() } else if ($.isArray(_value)) { _value = $.extend(true, [], _value) }
						else if ($.isPlainObject(value) && !isDate(value)) { _value = $.extend(true, {}, _value) }
					}
					arr[i] = _value
				}
			}
			else if ($.isPlainObject(value) && !isDate(value)) { value = $.extend(true, {}, value) }
		}
		inst.value = value; return inst
	}
}
class PInstStr extends PInst {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return value ?? '' }
}
class PInstGuid extends PInst {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get hostVarsDegeri() { return super.hostVarsDegeri || null }
	getValueDevam(value) { return value || null }
}
class PInstNum extends PInst {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return typeof value == 'number' ? (value || 0) : (asFloat(value) || 0) }
}
class PInstDate extends PInst {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { value = asDate(value); return isInvalidDate(value) ? null : value }
	get hostVarsDegeri() { let value = super.hostVarsDegeri; return value ? asDate(value) : null }
	setValues(e) { let value = this.getValue(e.value); this.value = value }
}
class PInstDateToday extends PInstDate {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return super.getValueDevam(value === undefined ? today() : value) }
}
class PInstDateNow extends PInstDate {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return super.getValueDevam(value === undefined ? now() : value) }
}
class PInstDateTime extends PInst {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { value = asDate(value); return isInvalidDate(value) ? null : value }
	get hostVarsDegeri() { let value = super.hostVarsDegeri; return value ? asDate(value) : null }
	setValues(e) { let value = this.getValue(e.value); this.value = value }
	pTanim2Inst_ek(e) {
		super.pTanim2Inst_ek(e); const {inst} = e, {ioAttr} = this;
		let ioAttrPrefix = ioAttr.toUpperCase().endsWith('TS') ? ioAttr.slice(0, -2) : null;
		if (ioAttrPrefix != null) {
			let subIOAttr = ioAttrPrefix ? `${ioAttrPrefix}Tarih` : 'tarih';
			if (!inst.hasOwnProperty(subIOAttr)) {
				Object.defineProperty(inst, subIOAttr, {
					get: () => { const ts = inst[ioAttr]; return ts?.clearTime ? new Date(ts).clearTime() : ts },
					set: value => { inst[ioAttr] = value?.clearTime ? new Date(value).clearTime() : value }
				})
			}
			subIOAttr = ioAttrPrefix ? `${ioAttrPrefix}Saat` : 'saat';
			if (!inst.hasOwnProperty(subIOAttr)) {
				Object.defineProperty(inst, subIOAttr, {
					get: () => timeToString(inst[ioAttr]),
					set: value => {
						const ts = inst[ioAttr]; if (value && ts == null) { inst[ioAttr] = ts = new Date() }
						if (ts) { let time = value ? asDate(value) : null; if (isInvalidDate(time)) { time = today() } setTime(ts, time?.getTime() ?? 0) }
					}
				})
			}
		}
	}
}
class PInstDateTimeNow extends PInstDateTime {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return super.getValueDevam(value === undefined ? now() : value) }
}
class PInstBool extends PInst {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return asBool(value) }

	get hostVarsDegeri() { return bool2FileStr(super.hostVarsDegeri) }
	get superHostVarsDegeri() { return super.hostVarsDegeri }
}
class PInstTrue extends PInstBool {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return value == null ? true : super.getValueDevam(value) }
}
class PInstBitBool extends PInstBool {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get hostVarsDegeri() { return bool2Int(super.superHostVarsDegeri) }
}
class PInstBitTrue extends PInstBitBool {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) { return super.getValueDevam(value == null ? true : value) }
}
class PInstClass extends PInst {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get pInstClassmi() { return true }
	constructor(e, _sinif) {
		e = e || {};
		if (typeof e != 'object') { e = (_sinif === undefined) ? { sinif: e } : { rowAttr: e, sinif: _sinif } }
		super(e); this.sinif = e.sinif ?? e.class
	}
	getValueDevam(value) { return coalesce(value, new this.sinif()) }
}
class PInstTekSecim extends PInstClass {
	static get pInstClassmi() { return false }
	static { window[this.name] = this; this._key2Class[this.name] = this }
	getValueDevam(value) {
		value = super.getValueDevam(value); if (typeof value != 'object') value = new this.sinif({ char: value });
		return value
	}
	get initValue() {
		let result = super.initValue;
		if (result == null) result = this.value?.defaultChar
		return result
	}
	get hostVarsDegeri() { return this.value.char }
	setValues(e) { const {value} = e; this.value.char = value ?? this.value.class.defaultChar }
}
