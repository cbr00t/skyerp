class TicVergiYapi extends CKod {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) {
		e = e || {};
		super(e);

		for (const key of ['oran', 'matrah', 'ekMatrah', 'bedel']) {
			const value = e[key];
			this[key] = asFloat(value) || 0;
		}
	}

	get topMatrah() { return this.matrah + this.ekMatrah }
}
