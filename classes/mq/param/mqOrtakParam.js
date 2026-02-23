class MQOrtakParam extends MQOrtakParamBase {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return 'ORTAK' } static get sinifAdi() { return 'Ortak Parametreler' }

	constructor(e = {}) {
		super(e)
		$.extend(this, { onayYili: e.onayYili || null, autoComplete_maxRow: e.autoComplete_maxRow || 2000 })
	}
	static paramYapiDuzenle({ paramci }) {
		super.paramYapiDuzenle(e)
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`)
		{
			let form = paramci.addFormWithParent()
			form.addNumber('onayYili', 'Onay Yılı')
				.addCSS('center')
				.addStyle_wh(100)
				.setMaxLength(4)
				.degisince(({ builder: { input } }) =>
					input.val(asInteger(input.val()) || null))
				.onAfterRun(({ builder: { id, inst, input }}) =>
					setTimeout(() => input.val(asInteger(inst[id]) || null))
				)
		}
	}
}
