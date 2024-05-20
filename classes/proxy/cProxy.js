class CProxyHandler extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	get(target, prop, $this) {
		// if (prop == 'x') return (...args) => args
		let value = this[prop];
		if (value === undefined)
			value = target[prop]
		return value
	}
	
	set(target, prop, value, $this) {
		(Reflect.has(this, prop) ? this : target)[prop] = value;
		return true
	}

	has(target, key) {
		return key[0] != '_' && (Reflect.has(this, key) || Reflect.has(target, key))
	}

	ownKeys(target) {
		return $.merge(
			Reflect.ownKeys(this).filter(key => key[0] != '_'),
			Reflect.ownKeys(target).filter(key => key[0] != '_')
		)
	}

	apply(target, $this, args) {
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


class CTekSecimProxyHandler extends CProxyHandler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get(target, prop, $this) {
		if (prop.length > 2) {
			if (prop.endsWith('mi') || prop.endsWith('mu')) {
				const question = prop.substr(0, prop.length - 2);
				const ka = target.questionDict[question];
				if (ka)
					return target.char == ka.kod
			}
			else if (prop.endsWith('Yap')) {
				const question = prop.substr(0, prop.length - 3);
				const ka = target.questionDict[question];
				if (ka)
					return (() => { target.char = ka.kod; return this })
			}
		}
		return super.get(target, prop, receiver)
	}

	has(target, key) {
		return !!target.kaDict[key] || super.has(target, key)
	}

	ownKeys(target) {
		return $.merge(
			super.ownKeys(target),
			Object.keys(target.kaDict)
		)
	}
}
