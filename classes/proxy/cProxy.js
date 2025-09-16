class CProxyHandler extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(obj) { super(); this._ = obj }
	has(target, key) {
		if (key === undefined) { return this.has(this._, target) }
		return key?.[0] != '_' && (Reflect.has(this, key) || Reflect.has(target, key))
	}
	ownKeys(target) {
		if (target === undefined) { return this.ownKeys(this._) }
		return [...
			Reflect.ownKeys(this).filter(key => key[0] != '_'),
			Reflect.ownKeys(target).filter(key => key[0] != '_')
		]
	}
	get(target, prop, $this) {
		// if (prop == 'x') return (...args) => args
		if ($this === undefined) { return this.get(this._, prop, this) }
		let value = this[prop];
		if (value === undefined) { value = target[prop] }
		return value
	}
	set(target, prop, value, $this) {
		if ($this === undefined) { return this.set(this._, prop, value, this) }
		(Reflect.has(this, prop) ? this : target)[prop] = value;
		return true
	}
	apply(target, $this, args) {
		if (args === undefined) { return this.apply(this._, this, args) }
		return (target || this).call($this, ...args)
	}
	/*
		 f = ((a, b) => a + b);
		 f2 = f.bind(this, 10);
		 f2(20);

		a = {};
		b = CKodVeAdi.bind(CKod, { kod: 'kod değeri' });
		new b()
	*/
}
class MapSetHandler extends CProxyHandler {
	has(target, key) {
		if (key === undefined) { return this.has(this._, target) }
		if (target?.has) { return target.has(key) }
		if (target?.includes) { return target.includes(key) }
		return super.has(target, key)
	}
	ownKeys(target) {
		if (target === undefined) { return this.ownKeys(this._) }
		if (target?.keys) { return Array.from(target.keys) }
		return super.ownKeys(target)
	}
	get(target, prop, $this) {
		if ($this === undefined) { return this.get(this._, prop, this) }
		if (target?.get) { return target.get(prop) }
		if (target?.at) { return target.at(prop) }
		return super.get(target, prop, $this)
	}
	set(target, prop, value, $this) {
		if ($this === undefined) { return this.set(this._, prop, value, this) }
		if (target?.set) { target.set(prop, value); return true }
		if (target?.put) { target.put(prop, value); return true }
		return super.set(target, prop, value, $this)
	}
}
class CTekSecimProxyHandler extends CProxyHandler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get(target, prop, $this) {
		if (prop.length > 2) {
			if (prop.endsWith('mi') || prop.endsWith('mu')) {
				let question = prop.substr(0, prop.length - 2);
				let ka = target.questionDict[question];
				if (ka) { return target.char == ka.kod }
			}
			else if (prop.endsWith('Yap')) {
				let question = prop.substr(0, prop.length - 3);
				let ka = target.questionDict[question];
				if (ka) { return (() => { target.char = ka.kod; return this }) }
			}
		}
		return super.get(target, prop, receiver)
	}
	has(target, key) { return !!target.kaDict[key] || super.has(target, key) }
	ownKeys(target) { return [...super.ownKeys(target), Object.keys(target.kaDict)] }
}
