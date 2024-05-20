
/*

result = await new CEnc_AES_CBC({ pass: 'cbr00t' }).enc('ABC');
encData = result.result;
iv = result.iv;

decData = await new CEnc_AES_CBC({ iv: iv, pass: 'cbr00t' }).dec(encData)


result = await new CEnc_AES_CBC().enc('ABC');
encData = result.result;
iv = result.iv;

decData = await new CEnc_AES_CBC().dec(encData)


*/


class CEnc extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }

	static get type() { return null }
	static get ivSize() { return null }
	get type() { return this.class.type }
	get ivSize() { return this.class.ivSize }
	get key() {
		let result = this._key;
		if (!result) {
			result = this._key = this.generateKey()
			if (result && result.then) {
				result.then(result =>
					this._key = result)
			}
		}
		return result
	}
	set key(value) { this._key = value }
	get iv() {
		let result = this._iv;
		if (!result)
			result = this._iv = Base64.fromUint8Array(crypto.getRandomValues(new Uint8Array(this.ivSize)))
		return result
	}
	set iv(value) {
		if (value != null && typeof value != 'string')
			value = Base64.fromUint8Array(value)
		this._iv = value
	}

	static getClass(e) {
		e = e || {};
		const type = typeof e == 'object' ? (e.type || e.name) : e;
		return this._tip2Sinif[type] || null
	}
	static newFor(e) {
		e = e || {};
		const cls = this.getClass(e);
		return cls ? new cls(e) : null
	}

	constructor(e) {
		e = e || {};
		super(e);
		
		this.key = e.key;
		this.iv = e.iv
	}

	async enc(e) {
		e = e || {};
		const data = e.data === undefined ? e : e.data;
		const key = await this.key;
		const {type, iv} = this;
		let _iv = iv;
		if (typeof _iv == 'string')
			_iv = Base64.toUint8Array(_iv)
		
		const encodedData = typeof data == 'object' ? data : new TextEncoder().encode(data);
		const encryptedData = await crypto.subtle.encrypt(
			{ name: type, iv: _iv },
			key, encodedData
		);
		return {
			iv: typeof iv == 'string' ? iv : Base64.fromUint8Array(_iv),
			result: Base64.fromUint8Array(new Uint8Array(encryptedData)),
			mergedResult: Base64.fromUint8Array(new Uint8Array([..._iv, ...new Uint8Array(encryptedData)]))
		}
	}
	async dec(e) {
		e = e || {};
		let data = e.data === undefined ? e : e.data;
		if (typeof data == 'object')
			data = data.result || data
		
		const key = await this.key;
		const {type, iv} = this;
		let _iv = iv;
		if (typeof _iv == 'string')
			_iv = Base64.toUint8Array(_iv)

		const encodedData = typeof data == 'object' ? data : Base64.toUint8Array(data)
		const buffer = await crypto.subtle.decrypt(
			{ name: type, iv: _iv },
			key, encodedData
		);
		return new TextDecoder().decode(buffer)
	}
	generateKey() { return null }
}

class CEnc_AES_GCM extends CEnc {
	static get type() { return 'AES-GCM' }
	static get ivSize() { return 12 }
	generateKey() {
		return crypto.subtle.generateKey(
			{ name: this.type, length: 256 },
			true, ['encrypt', 'decrypt']
		)
	}
}

class CEnc_AES_CBC extends CEnc {
	static get type() { return 'AES-CBC' }
	static get ivSize() { return 16 }
	get pass() { return this._pass }
	set pass(value) { this._pass = value }

	constructor(e) {
		e = e || {};
		super(e);
		
		this.pass = e.pass
	}
	
	async generateKey() {
		let passBuffer = this.pass || '';
		if (typeof passBuffer != 'object')
			passBuffer = new TextEncoder().encode(passBuffer)

		const deriveType = 'PBKDF2';
		const derivedKey = await crypto.subtle.importKey(
			'raw', passBuffer, { name: deriveType },
			false, ['deriveBits', 'deriveKey']
		);
		
		return crypto.subtle.deriveKey(
			{ name: deriveType, salt: new Uint8Array(16), iterations: 100000, hash: 'SHA-256' },
			derivedKey,
			{ name: this.type, length: 256 },
			true,
			['encrypt', 'decrypt']
		)
	}
}

(() => {
	const tip2Sinif = CEnc.prototype._tip2Sinif = CEnc.prototype._tip2Sinif || {};
	const classes = [CEnc_AES_GCM, CEnc_AES_CBC];
	for (const cls of classes) {
		const {type} = cls;
		if (type)
			tip2Sinif[type] = cls
	}
})()
