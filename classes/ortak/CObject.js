class CObject {
	static _class2SingletonInstance = {}; static _key2Class = {};
	static { window[this.name] = this; this._key2Class[this.name] = this; if (window.boot) { window.boot.step() } }
	static get classKey() { return this.name || this } static get deepCopyAlinmayacaklar() { return [] }
	static get metaClass() { return this.prototype } static get superClass() { return this.__proto__ }
	get class() { return this.constructor || this.__proto__.constructor }
	get bosmu() { return false } get bosDegilmi() { return !this.bosmu }
	static get key2Class() { return this._key2Class }
	static get key2SubClasses() {
		let result = this._key2SubClasses;
		if (result === undefined) {
			result = {}; const {key2Class} = CObject;
			for (const key in key2Class) {
				const cls = key2Class[key];
				if (cls && cls != this && this.isPrototypeOf(cls)) result[key] = cls
			}
			this._key2SubClasses = result
		}
		return result
	}
	static get subClasses() { let result = this._subClasses; if (result === undefined) { result = this._subClasses = Object.values(this.key2SubClasses) } return result }
	static get instance() { const {classKey, _class2SingletonInstance} = this; return _class2SingletonInstance[classKey] = _class2SingletonInstance[classKey] ?? new this() }
	get super1() { return this.superN(1) } get super2() { return this.superN(2) } get super3() { return this.superN(3) }
	get super4() { return this.superN(4) } get super5() { return this.superN(5) } get super6() { return this.superN(6) }
	superN(n) {
		if (!n || n < 1) { return null }
		/* let result = this[`super${n}`]; if (result !== undefined) { return result } */
		let getProto = n => {
			let $this = n == 1 ? this : this.superN(n - 1);
			return $this == null ? null : Object.getPrototypeOf($this)
		}
		let result = (this._supers ??= {})[n] = getProto(n) ?? null;
		return result
	}
	constructor(e) {
		this._supers = {};
		if (window.boot) { window.boot.step() }
	}
	static From(e) { e = e || {}; const inst = new this(); { for (const key in e) { const value = e[key]; inst[key] = value } } return inst }
	static Serialize(e) {
		if (!e) return null; if (e.serialize) return e.serialize()
		if (e.reduce && !$.isArray(e)) e = e.reduce()
		if (e != null && ($.isArray(e) || $.isPlainObject(e))) {
			var _e = $.isArray(e) ? [] : {};
			for (const key in e) {
				const sub = e[key];
				if ($.isArray(sub)) { const arr = []; for (const _sub of sub) { arr.push(_sub && !$.isArray(_sub) && _sub.reduce ? _sub.reduce() : _sub) } _e[key] = arr }
				else { _e[key] = sub && !$.isArray(sub) && sub.reduce ? sub.reduce() : sub }
			}
			return toJSONStr(_e)
		}
		return toJSONStr(e)
	}
	static Deserialize(e) {
		if (!e) return null; let _obj = typeof e == 'object' ? e : $.parseJSON(e); if (!_obj) return null
		let obj = this.From(_obj); if (obj.deserialize) obj = obj.deserialize.call(obj); return obj
	}
	static DeserializeWithNew(e) {
		if (!e) return null; let _obj = typeof e == 'object' ? e : $.parseJSON(e); if (!_obj) return null
		let obj = new this(_obj); if (obj.deserialize) obj = obj.deserialize.call(obj); return obj
	}
	serialize() { return toJSONStr(this.reduce()) }
	deserialize() { return this.expand() }
	reduce() { const inst = this.shallowCopy(); return inst }
	expand() { return this.shallowCopy() }
	shallowCopy(e) {
		e = e || {}; const deepCopyAlinmayacaklar = asSet(this.class.deepCopyAlinmayacaklar || []), inst = new (this.class)({ isCopy: true, isDeepCopy: false });
		for (const key in this) {
			let value = this[key];
			if (value && !deepCopyAlinmayacaklar[key]) {
				if (value.shallowCopy) value = value.shallowCopy(e)
				else if ($.isArray(value)) value = $.extend(true, [], value)
				else if ($.isPlainObject(value) && !isDate(value)) value = $.extend(true, {}, value)
			}
			inst[key] = value
		}
		return inst
	}
	deepCopy(e) {
		e = e || {}; const deepCopyAlinmayacaklar = asSet(this.class.deepCopyAlinmayacaklar || []), inst = new (this.class)({ isCopy: true, isDeepCopy: true });
		for (const key in this) {
			let value = this[key];
			if (value && !deepCopyAlinmayacaklar[key]) {
				if (value.deepCopy) { value = value.deepCopy() }
				else if ($.isArray(value)) {
					const _arr = value; const arr = value = [];
					for (let i = 0; i < _arr.length; i++) {
						let _value = _arr[i];
						if (_value) {
							if (_value.deepCopy) _value = _value.deepCopy(e)
							else if ($.isArray(_value)) _value = $.extend(true, [], _value)
							else if ($.isPlainObject(value) && !isDate(value)) _value = $.extend(true, {}, _value)
						}
						arr[i] = _value
					}
				}
				else if ($.isPlainObject(value) && !isDate(value)) { value = $.extend(true, {}, value) }
			}
			inst[key] = value
		}
		return inst
	}
	setUniqueTimeout(e) {		/* e: { key, block, delayMS, ...e } */
		this.clearUniqueTimeout(e);
		const id = e.key || e.id, isInterval = e.interval || e.isInterval, {delayMS} = e, timers = this.uniqueTimers = this.uniqueTimers || {};
		const timer = timers[id] = setTimeout(async _e => {
			const id = _e.key || _e.id, isInterval = _e.interval || _e.isInterval;
			try {
				let args = _e.args || []; if (!$.isArray(args)) args = [args];
				try { _e.result = await _e.block.call(this, ...args) }
				finally { if (isInterval) { /* await this.clearUniqueTimeout(_e) */ await this.setUniqueTimeout(_e) } }
			}
			finally { if (!isInterval) { delete timers[id] } }
		}, delayMS, e);
		return timer
	}
	clearUniqueTimeout(e) {
		const timers = this.uniqueTimers = this.uniqueTimers || {}, clearSelector = e.interval || e.isInterval ? 'clearInterval' : 'clearTimeout', key = e.key || e.id;
		let timer = timers[key]; if (timer) { window[clearSelector](timer); delete timers[key] } return timer
	}
	[Symbol.toStringTag]() { return this.toString() }
}
