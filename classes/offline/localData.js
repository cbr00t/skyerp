class MQLocalData extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return `${super.paramKod}.localData` }
	get data() { return this._data = this._data || {} }
	set data(value) { this._data = value }

	constructor(e) { e = e || {}; super(e); for (const key of ['_data']) this[key] = this[key] || {} }
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push('data') }
	getData(e) {
		const key = typeof e == 'object' ? e.key : e, {data} = this;
		if (typeof e != 'object') e = {}; const {ifAbsent, ifAbsentPut, ifPresent} = e;
		let value = data[key];
		if (value === undefined && ifAbsentPut) {
			value = getFuncValue.call(this, ifAbsentPut, $.extend({}, e, { value: value }));
			if (value !== undefined) data[key] = value
		}
		if (value === undefined) return ifAbsent ? getFuncValue.call(this, ifAbsent, $.extend({}, e, { value: value })) : undefined
		return ifPresent ? getFuncValue.call(this, ifPresent, $.extend({}, e, { value: value })) : value
	}
	setData(e, _value) {
		const key = typeof e == 'object' ? e.key : e, value = typeof e == 'object' ? e.value : _value, {data} = this;
		if (value == null) delete data[key]; else data[key] = value;
		return this
	}
	clearData(e) { this.data = null; return this }
}
