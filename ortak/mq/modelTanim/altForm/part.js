class ModelTanimAltFormPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true }
	static get rootPartName() { return 'modelTanim-altForm' }
	static get partName() { return this.rootPartName }

	get islem() { return (this.parentPart || {}).islem }
	get mfSinif() { return (this.parentPart || {}).mfSinif }
	get inst() { return (this.parentPart || {}).inst }
	get eskiInst() { return (this.parentPart || {}).eskiInst }
	get yeniVeyaKopyami() { return (this.parentPart || {}).yeniVeyaKopyami }
	get degistirVeyaSilmi() { return (this.parentPart || {}).degistirVeyaSilmi }
	get degistirmi() { return (this.parentPart || {}).degistirmi }
	get silmi() { return (this.parentPart || {}).silmi }


	constructor(e) {
		e = e || {};
		super(e);

		$.extend(this, {
			// parentPart: e.parentPart,
			parentLayout: e.parentLayout
		});
	}

	init(e) {
		super.init(e);

		const {rootPartName, partName} = this.class;
		const {layout} = this;
		layout.addClass(rootPartName);
		if (partName && partName != rootPartName)
			layout.addClass(partName);
	}

	runDevam(e) {
		e = e || {};
		super.runDevam(e);
		
		this.initFlag = true;
	}

	initLayoutOncesi(e) {
	}
	
	initLayout(e) {
	}
	
	initLayoutSonrasi(e) {
	}

	yeniTanimOncesiIslemler(e) {
	}

	kaydetOncesiIslemler(e) {
	}

	kaydetSonrasiIslemler(e) {
	}
}
