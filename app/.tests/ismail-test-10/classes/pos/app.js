class PosApp extends App {
	static { window[this] = this; this._key2Class[this.name] = this }
	get activePart() { return this._activePart }
	set activePart(value) { this._activePart = value }
	constructor(e) {
		e = e || {}; super(e);
		this._activePart = e.activePart
	}
	run(e) {
		e = e || {};
		super.run(e);
		new PaymentPart(e).run(e)
	}
}

