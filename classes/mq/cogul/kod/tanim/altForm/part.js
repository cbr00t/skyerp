class MQKATanimAltFormPart extends ModelTanimAltFormPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'ka' }

	constructor(e) {
		e = e || {};
		super(e);
	}

	initLayout(e) {
		e = e || {};
		super.initLayout(e);
		
		const {yenimi, degistirmi, layout, inst} = this;
		const txtKod = this.txtKod = layout.find('.kod');
		if (degistirmi) {
			txtKod.prop('readonly', true);
			txtKod.addClass('readOnly');
		}
		else {
			txtKod.on('keyup', evt =>
				evt.target.value = evt.target.value || null);
			txtKod.on('change', evt =>
				inst.kod = evt.target.value || '');
		}
		
		const txtAciklama = this.txtAciklama = layout.find('.aciklama');
		txtAciklama.on('keyup', evt =>
			evt.target.value = evt.target.value || null);
		txtAciklama.on('change', evt =>
			inst.aciklama = evt.target.value || '');

		if (!yenimi) {
			txtKod.val(inst.kod || null);
			txtAciklama.val(inst.aciklama || null);
		}
	}
}
