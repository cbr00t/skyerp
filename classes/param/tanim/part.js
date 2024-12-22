class ParamTanimPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get rootPartName() { return 'paramTanim' } static get partName() { return this.rootPartName }
	static get isWindowPart() { return true } get defaultLayoutSelector() { return `#${this.class.rootPartName}` }
	get yenimi() { return this.islem == 'yeni' } get degistirmi() { return this.islem == 'degistir' } get silmi() { return this.islem == 'silmi' } get kopyami() { return this.islem == 'kopya' }
	get yeniVeyaKopyami() { return this.yenimi || this.kopyami } get degistirVeyaSilmi() { return this.degistirmi || this.silmi }

	constructor(e) {
		e = e || {}; super(e);
		$.extend(this, { islem: e.islem, mfSinif: e.mfSinif, inst: e.inst, eskiInst: e.eskiInst, kaydedince: e.kaydedince }); let {mfSinif, inst, eskiInst} = this;
		if (!inst && mfSinif) { inst = this.inst = new mfSinif() }
		if (inst && !mfSinif) { mfSinif = this.mfSinif = inst.class }
		if (inst && !eskiInst && this.degistirmi) { eskiInst = this.eskiInst = inst; inst = this.inst = inst.deepCopy() }
		this.title = this.title || `${(mfSinif || {}).sinifAdi || 'Parametre'} Tanım`;
		const {islem} = this; if (islem) { const islemText = islem[0].toUpperCase() + islem.slice(1); this.title += ` &nbsp;[<span class="window-title-ek">${islemText}</span>]` }
	}
	init(e) {
		e = e || {}; super.init(e); const {layout, mfSinif, inst, eskiInst, parentPart} = this; let {builder} = this;
		layout.addClass(`${this.class.partName} ${this.class.rootPartName}`);
		const header = this.header = layout.children('.header'), form = this.form = layout.children('.form');
		this.initBulForm(e); this.initIslemTuslari(e);
		if (!builder) { if (!builder && mfSinif) { builder = this.builder = mfSinif.getRootFormBuilder($.extend({}, e, { sender: this, part: this, parentPart, layout: form, mfSinif, inst, eskiInst })) } }
		if (inst && builder) { inst.builder = builder }
	}
	run(e) {
		e = e || {}; super.run(e); this.initBuilder(e);
		const {layout} = this, inputs = layout.find('input[type=textbox], input[type=number]');
		inputs.on('focus', evt => evt.currentTarget.select());
		inputs.on('keyup', evt => { const key = evt.key?.toLowerCase(); if (key == 'enter' || key == 'linefeed') this.kaydetIstendi({ event: evt }) })
	}
	initBulForm(e) {
		const {header, form} = this;
		const bulPart = this.bulPart = new FiltreFormPart({ layout: header.find('.bulForm'), degisince: e => FiltreFormPart.hizliBulIslemi({ sender: this, layout: form, tokens: e.tokens }) });
		bulPart.run()
	}
	initIslemTuslari(e) {
		const islemTuslari = this.islemTuslari = this.header.find(`.islemTuslari`);
		let _e = { args: { sender: this, layout: islemTuslari } }; if (this.islemTuslariArgsDuzenle(_e) === false) return null	
		const islemTuslariPart = this.islemTuslariPart = new ButonlarPart(_e.args); islemTuslariPart.run(); return islemTuslariPart
	}
	initBuilder(e) { const {builder} = this; if (builder) builder.autoInitLayout().run(e) }
	islemTuslariArgsDuzenle(e) {
		const {args, builder} = e; e.sender = this;
		$.extend(args, { tip: 'tamamVazgec', id2Handler: { tamam: e => this.kaydetIstendi(e), vazgec: e => this.vazgecIstendi(e) } });
		if (builder) {
			e.builder = builder;
			for (const _builder of builder.getItemsAndSelf()) { if (_builder.islemTuslariArgsDuzenle) _builder.islemTuslariArgsDuzenle(e) }
		}
	}
	async kaydet(e) {
		const {mfSinif, inst, eskiInst} = this;
		if (inst && eskiInst) {
			const {builder} = this, _e = $.extend({}, e, { sender: this, builder, mfSinif, inst, eskiInst });
			for (const _builder of builder.getItemsAndSelf()) { if (_builder.kaydetOncesi) await _builder.kaydetOncesi(e) }
			if (inst.kaydetOncesiIslemler) await inst.kaydetOncesiIslemler(_e)
			const almaSet = asSet(inst.class.deepCopyAlinmayacaklar); const keys = Reflect.ownKeys(inst).filter(key => !almaSet[key]); for (const key of keys) eskiInst[key] = inst[key]
		}
		return true
	}
	async kaydetIstendi(e) {
		try {
			await this.kaydet(e);
			const {builder, kaydedince, mfSinif, inst, eskiInst} = this, _e = $.extend({}, e, { sender: this, builder, mfSinif, inst, eskiInst });
			for (const _builder of builder.getItemsAndSelf()) { if (_builder.kaydedince) await _builder.kaydedince(_e) }
			await inst.kaydet(e);
			if (inst.kaydetSonrasiIslemler) await inst.kaydetSonrasiIslemler(_e)
			if (kaydedince) getFuncValue.call(this, kaydedince, _e)
		}
		catch (ex) { hConfirm(getErrorText(ex, this.title)); throw ex }
		this.close()
	}
	vazgecIstendi(e) { this.close() }
}
