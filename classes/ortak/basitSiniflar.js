class CPoint extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get empty() { return new this({ x: 0, y: 0 }) } static get zero() { return this.empty } static get oneOne() { return new this({ x: 1, y: 1 }) }
	get bosmu() { return !(this.x || this.y) } get legalmi() { return (this.x && this.y) }
	constructor(e) {
		e = e || {}; super(e);
		for (const key of ['x', 'X', 'basi', 'Basi']) { let value = e[key]; if (value != null) { this.x = asFloat(value); break } }
		for (const key of ['y', 'Y', 'sonu', 'Sonu']) { let value = e[key]; if (value != null) { this.y = asFloat(value); break } }
	}
	static fromText(e) {
		e = e || {};
		if (typeof e == 'object' && !$.isPlainObject(e)) return e		/* CPoint gelmistir */
		let value = typeof e == 'object' && e.value !== undefined ? e.value : e; if (value == null) return null
		if (typeof value == 'object') {
			let inst = $.isPlainObject(value) ? new this(value) : value;
			for (const key of ['x', 'y']) { let value = inst[key]; if (typeof value != 'number') inst[key] = value = asFloat(value) }
			return inst
		}
		let ind = value.indexOf('@'); ind = ind < 0 ? value.indexOf('x') : ind; ind = ind < 0 ? value.indexOf('|') : ind; if (ind < 0) return null
		return new this({ x: asFloat(value.substring(0, ind).trim()) || 0, y: asFloat(value.substring(ind + 1).trim()) || 0 })
	}
	toString(e) { return `${this.x} x ${this.y}` }
}
class CBasiSonu extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get empty() { return new this({ basi: '', sonu: '' }) } static get zero() { return new this({ basi: 0, sonu: 0 }) }
	get bosmu() { return !(this.basi || this.sonu) } get bosDegilmi() { return !this.bosmu }
	constructor(e) { e = e || {}; super(e); $.extend(this, { basi: e.basi ?? e.Basi, sonu: e.sonu ?? e.Sonu }) }
	static fromText(e) {
		e = e || {}; if (typeof e == 'object' && !$.isPlainObject(e)) return e		/* CBasiSonu gelmistir */
		let value = typeof e == 'object' && e.value !== undefined ? e.value : e; if (value == null) return null
		if (typeof value == 'object') {
			let inst = $.isPlainObject(value) ? new this(value) : value; const {converter} = e;
			if (converter) { for (const key of ['basi', 'sonu']) { let value = inst[key]; inst[key] = value = converter.call(inst, { value }) } }
			return inst
		}
		let ind = value.indexOf('@'); ind = ind < 0 ? value.indexOf('x') : ind; ind = ind < 0 ? value.indexOf('|') : ind; if (ind < 0) return null
		const converter = e.converter ?? (value => value); return new this({
			basi: converter.call(this, { value: value.substring(0, ind).trim() }),
			sonu: converter.call(this, { value: value.substring(ind + 1).trim() })
		})
	}
	toString(e) { const basi = this.basi ?? '', sonu = this.sonu; return basi ? (sonu ? `${basi} -> ${sonu}` : basi) : '' }
}
class YilVeAy extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get bosmu() { return !(this.basi || !this.sonu) }
	get yilAy() { const {yil, ay} = this; return asYilAy(yil, ay) }
	set yilAy(value) { const yilVeAy = ya2YilVeAy(value); if (yilVeAy) { const {yil, ay} = yilVeAy; $.extend(this, { yil, ay }) } }
	constructor(e, _ay) {
		e = e || {}; super(e); let yil, ay;
		if (typeof e == 'object') {
			let yilAy = e.yilAy ?? e.YilAy ?? e.yilay;
			if (yilAy) { const yilVeAy = ya2YilVeAy(e); yil = yilVeAy?.yil; ay = yilVeAy?.ay } else { yil = e.yil ?? e.Yil; ay = e.ay ?? e.Ay }
		}
		else {
			if (_ay === undefined) { const yilVeAy = ya2YilVeAy(e); yil = yilVeAy?.yil; ay = yilVeAy?.ay }
			else { yil = e; ay = _ay }
		}
		if (yil && yil < 100) { yil = yil2To4(yil) }
		$.extend(this, { yil, ay })
	}
}
