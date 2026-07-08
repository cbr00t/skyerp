
function Xextend() { return $.extend(...arguments) }

class XCBasiSonu {
    get bosmu() { return !(this.basi || this.sonu) }
    get bosDegilmi() { return !this.bosmu }
	static get empty() { return new this({ basi: '', sonu: '' }) }
	static get zero() { return new this({ basi: 0, sonu: 0 }) }
	
	constructor(e = {}) { extend(this, { basi: e.basi ?? e.Basi, sonu: e.sonu ?? e.Sonu }) }

}
