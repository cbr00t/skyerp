class MQTicNumarator extends MQNumarator {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get numaratorPartSinif() { return TicNumaratorPart } static get fisGirisLayoutSelector() { return '.ticNumarator' }
	static get sinifAdi() { return 'Ticari Numaratör' } static get table() { return 'tnumara' } static get sayacSaha() { return 'sayac' } static get kodSaha() { return 'belirtec' }
	get belirtec() { return this.kod } set belirtec(value) { return this.kod = value }

	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, {
			sayac: new PInstNum(this.sayacSaha), tip: new PInstStr('tip'),
			noYil: new PInstNum({ rowAttr: 'noyil' /*, init: e => app.params.zorunlu.cariYil || today().getYear() */ })
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		const {tanimFormBuilder} = e;
		const tabPageBuilder_genel = tanimFormBuilder.id2Builder.tabPanel.id2Builder.genel;
		tabPageBuilder_genel.builders[0]
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} .formBuilder-separator { width: 3px !important; }`)
		const {builders} = tabPageBuilder_genel.builders[0];
		builders.unshift(
			new FBuilder_TextInput({ id: 'belirtec', etiket: 'Belirteç', maxLength: 3 })
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 70px !important; margin-right: 20px; }`)
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} { text-align: center !important; }`)
		)
		builders.splice(
			builders.length - 1,
			0,
			new FBuilder_NumberInput({ id: 'noYil', etiket: 'No Yıl', maxLength: 4 })
				.onBuildEk(e => {
					const {builder} = e;
					builder.input.on('contextmenu', evt =>
						builder.inst.noYil = app.params.zorunlu.cariYil || today().getYear()
					)
				})
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 80px !important; }`)
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} { text-align: center !important; }`)
		)
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); const {liste} = e; liste.push('noyil') }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, {kodSaha} = this;
		const colDef = liste.find(x => x.belirtec == kodSaha);
		if (colDef) { colDef.text = 'Belirteç'; colDef.genislikCh = 13 }
		liste.push(new GridKolon({ belirtec: 'noyil', text: 'No Yıl', genislikCh: 8 }).tipNumerik())
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e;
		sent.sahalar.add(`${aliasVeNokta}tip`)
	}
	async yukle(e) {
		e = e || {}; let {rec} = e;
		if (!rec) {
			const {tip} = this; if (!tip) return false
			const {belirtec} = this, {table} = this.class
			const sent = new MQSent({
				from: table, sahalar: '*',
				where: belirtec ? { birlestirDict: this.alternateKeyHostVars(e) } : { degerAta: this.tip, saha: 'tip' }
			});
			rec = await app.sqlExecTekil(sent);
		}
		return await super.yukle($.extend({}, e, { rec }))
	}
	keyHostVarsDuzenle(e) { super.superKeyHostVarsDuzenle(e); const {hv} = e; hv.tip = this.tip; }
	keySetValues(e) { super.superKeySetValues(e); const {rec} = e; let value = rec.tip; if (value != null) this.tip = value }
	async kesinlestir(e) {
		const {table} = this.class, {sayac} = this;
		let sonNo = this.sonNo || 0; if (!sayac) { this.sonNo = ++sonNo; return this }
		let {sayacSaha} = this.class, result = await app.sqlExecNoneWithResult({
			query: `UPDATE ${table} SET @sonNo = sonno = sonno + 1 WHERE ${sayacSaha} = ${sayac}`,
			params: [{ name: '@sonNo', type: 'int', direction: 'output' }]
		});
		if ($.isArray(result)) { result = result[0] }
		let qParam = (result?.params || {})['@sonNo']; if (qParam?.value) { sonNo = this.sonNo = qParam.value }
		return this
	}
}
