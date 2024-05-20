class SeriVeNo extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get asText() { return this.toString() }
	constructor(e, _no) {
		e = e || {}; super(e);
		this.seri = (typeof e == 'object' ? e.seri : e) || '';
		this.no = (typeof e == 'object' ? e.no : _no) || 0
	}
	static fromText(e) {
		if (typeof e != 'string') { return e }
		const value = e; let alphaInd = -1;
		for (let i = value.length - 1; i >= 0; i--) { if (!isDigit(value[i])) { alphaInd = i; break } }
		const result = new this();
		if (alphaInd < 0) { result.no = asInteger(value) }
		else {
			/* substring() endIndex dahil etmiyor */
			result.seri = value.substring(0, alphaInd + 1);
			result.no = asInteger(value.substring(alphaInd + 1))
		}
		return result
	}
	toString() { return `${this.seri || ''}${this.no || 0}` }
}
class TicariSeriliNo extends SeriVeNo {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e, _noYil, _no) {
		e = e || {}; super(e, _no);
		this.noYil = (typeof e == 'object' ? e.noYil : _noYil) || 0
	}
	static fromText(e) {
		if (typeof e != 'string') { return e }
		const value = e; if (value.length != 16) { return null }
		return new this({ seri: value.substr(0, 3), noYil: asInteger(value.substr(3, 4)), no: asInteger(value.substr(7)) })
	}
	toString() {
		const {noYil} = this; if (!noYil) { return super.toString() }
		const seri = (this.seri || '').padEnd(3, 'A'), noYilStr = (this.noYil || 0).toString().padStart(4, '0');
		const noStr = (this.no || 0).toString().padStart(9, '0');
		return (seri + noYilStr + noStr)
	}
}
