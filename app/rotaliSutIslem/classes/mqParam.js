class MQSutParam extends MQTicariParamBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Süt Parametreleri' } static get paramKod() { return 'MUSHZ' }
	get postaKAListe() { const postalar = this.postalar || {}; return Posta.kaListe.filter(ka => !!postalar[ka.kod]) }
	get postalar() { return this._postalar } set postalar(value) { this._postalar = value }
	constructor(e) {
		e = e || {}; super(e); const kullanim = this.kullanim = e.kullanim || this.kullanim || {};
		$.extend(this, { postalar: asSet(e.postalar), kesafet: e.kesafet });
		$.extend(kullanim, { sutToplama: e.sutToplama });
		this.initDefaults(e)
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e); const {paramci} = e; paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 10px !important }`);
		let form = paramci.addFormWithParent();
		form.addGridGiris('postalar').addStyle_wh(300, 500).rowNumberOlmasin()
			.setTabloKolonlari(e => [ new GridKolon({ belirtec: 'kod', text: 'Postalar' }).tipTekSecim({ tekSecimSinif: Posta }).kodsuz() ])
			.setSource(e => e.builder.altInst.postaKAListe)
			.veriDegisinceIslemi(e => { const {builder} = e, {altInst, part} = builder, {gridWidget} = part; altInst.postalar = asSet(gridWidget.getboundrows().map(rec => rec.kod)) })
			.onAfterRun(e => { const {builder} = e, {rootPart} = builder; rootPart.fbd_postalar = builder })
	}
	kaydetOncesiIslemler(e) {
		const {sender} = e, {inst, fbd_postalar} = sender;
		let {gridWidget} = fbd_postalar.part; inst.postalar = asSet(gridWidget.getboundrows().map(rec => rec.kod));
		return super.kaydetOncesiIslemler(e)
	}
	paramSetValues(e) {
		/* postalar: { F:Şafak, S:Sabah, K:kuşluk, O:öğle, I:ikindi, A:Akşam, G:gece }  kesafet: "1 kg kaç lt’dir değeridir" */
		const {rec} = e, {kullanim} = this; $.extend(this, { postalar: asSet(rec.postalar), kesafet: asFloat(rec.kesafet) });
		$.extend(kullanim, { sutToplama: rec.sutToplama });
		this.initDefaults(e)
	}
	initDefaults(e) {
		let {postalar, kesafet} = this; if ($.isEmptyObject(postalar)) { postalar = this.postalar = asSet(['S', 'A'])}
		kesafet = this.kesafet = kesafet || 1
	}
}

