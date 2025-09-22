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
	static get inExpKullanilirmi() { return false }
	get inExpKeys() { let e = { result: [] }; this.inExp_keysDuzenle(e); return Object.keys(asSet(e.result)) }
	get asExportData() {
		let {inExpKeys} = this, result = {};
		for (let key of inExpKeys) {
			let value = this[key]; if (value === undefined) { continue }
			if (isPlainObject(value)) {
				let parent = value; if (isPlainObject(parent)) {
					let isArray = Array.isArray(parent);
					let newObj = isArray ? [] : {};
					for (let [k, v] of Object.entries(parent)) {
						v = v === this ? v : (v?.asExportData ?? v);
						newObj[k] = v
					}
					value = newObj
				}
			}
			else if (value instanceof TekSecim) { value = value.char }
			value = value.asExportData ?? value;
			result[key] = value
		}
		let e = { result }; this.exportDataDuzenle(e); result = e.result;
		return result
	}
	/*get super1() { return this.superN(1) } get super2() { return this.superN(2) } get super3() { return this.superN(3) }
	get super4() { return this.superN(4) } get super5() { return this.superN(5) } get super6() { return this.superN(6) }*/
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
	static From(e) {
		e = e || {}; const inst = new this();
		for (const [key, value] of Object.entries(e)) { inst[key] = value }
		return inst
	}
	inExp_keysDuzenle({ result }) {
		let {_p} = this, instYapi = $.extend(true, {}, this);
		if (!$.isEmptyObject(_p)) { $.extend(instYapi, _p) }
		let removeKeys = ['_supers', '_p', 'ayrimlar', 'ozelSahalar', 'sayac', 'okunanHarSayac'].filter(x => !!x);
		for (let [key, value] of Object.entries(instYapi)) {
			value = value?.value ?? value;
			if (key[0] == '_' || key[0] == '#' || value === undefined || isClass(value) || isFunction(value)) {
				removeKeys.push(key) }
		}
		for (let key of removeKeys) { delete instYapi[key] }
		result.push(...Object.keys(instYapi))
	}
	exportDataDuzenle({ result }) { }
	static exportAll(e) {
		e ??= {}; let {liste} = e; liste ??= $.makeArray(e.item ?? e.inst);
		if (!liste.length) { return [] }
		let result = []; for (let inst of liste) {
			let hv = {}; if (inst.exportTo({ ...e, hv }) === false) { continue }
			if (!$.isEmptyObject(hv)) { result.push(hv) }
		}
		return result
	}
	static importAll(e) {
		e ??= {}; let recs = e.recs ?? $.makeArray(e.rec) ?? e;
		if (!recs.length) { return [] }
		let result = []; for (let rec of recs) {
			let inst = this.importFrom({ ...e, rec });
			if (inst) { result.push(inst) }
		}
		return result
	}
	static importFrom(e) {
		e ??= {}; let rec = e.rec ?? e; if (!rec) { return [] }
		let inst = new this();
		return inst.importFrom({ ...e, rec }) === false ? null : inst
	}
	exportSelf(e) { let _e = { ...e, hv: {} }; this.exportTo(_e); return _e.hv }
	exportTo(e) {
		let _hv = this.inExp_hostVars(e);
		if (!_hv) { return false }
		$.extend(e.hv, _hv); return true
	}
	importFrom(e) {
		if (!e?.rec) { e = { rec: e } }
		let {rec} = e; if (!rec) { return false }
		this.inExp_setValues(e);
		return true
	}
	inExp_hostVars(e){
		e ??= {}; let _e = { ...e, hv: {} };
		this.inExp_hostVarsDuzenle(_e);
		return _e.hv
	}
	inExp_hostVarsDuzenle({ hv }) { $.extend(hv, this.asExportData) }
	inExp_setValues({ rec }) { $.extend(this, rec) }
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
