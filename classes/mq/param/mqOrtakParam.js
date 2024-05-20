class MQOrtakParam extends MQOrtakParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'ORTAK' }
	constructor(e) {
		e = e || {};
		super(e);
		$.extend(this, { autoComplete_maxRow: 500 })
	}
	static paramAttrListeDuzenle(e) {
		const {liste} = e;
		/*liste.push(...[
			'autoComplete_maxRow'
		]);*/
	}
}
