class MQKATanimPart extends ModelTanimPart {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get partName() { return 'kaTanim' }
	get hasTabPages() { return false }
	get formDeferMS() { return super.formDeferMS }


	constructor(e) {
		e = e || {};
		super(e);
	}

	initLayout(e) {
		e = e || {};
		super.initLayout(e);

		/*const {yeniVeyaKopyami, degistirmi, form, inst} = this;*/
	}

	formFocusIslemi(e) {
		const part = this.genelAltFormParts.ka;
		(this.degistirmi ? part.txtAciklama : part.txtKod).focus();
	}

	initWndArgsDuzenle(e) {
		super.initWndArgsDuzenle(e);
		
		const {wndArgs} = this;
		/*$.extend(wndArgs, {
			width: 750,
			height: 350
		});*/
	}
}
