class CMapChain extends Map {
    /*static { window[this.name] = this; this._key2Class[this.name] = this }*/
	static NullKey = '\x00'; get class() { return this.constructor ?? this.__proto__.constructor }
	get(keys) {
		const {NullKey} = this.class; let current = this;
		for (let i = 0; i < keys.length; i++) {
			let key = (keys[i] ?? NullKey).toString(); if (!current.has(key)) { return undefined }
			if (i === keys.length - 1) { return current == this ? super.get(key) : current.get(key) }
			current = current == this ? super.get(key) : current?.get(key)
		}
	}
	set(keys, value) {
		const {NullKey} = this.class; let current = this;
		for (let i = 0; i < keys.length; i++) {
			let key = (keys[i] ?? NullKey).toString();
			if (!current.has(key)) { if (current == this) { super.set(key, new Map()) } else { current.set(key, new Map()) } }
			if (i == keys.length - 1) { if (current == this) { super.set(key, value) } else { current.set(key, value) } }
			else { current = current == this ? super.get(key) : current?.get(key); if (!current) { debugger /* buraya gelmemeli idi */ } }
		}
	    return this
    }
}
