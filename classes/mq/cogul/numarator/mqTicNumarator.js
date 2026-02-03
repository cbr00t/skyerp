class MQTicNumarator extends MQNumarator {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get numaratorPartSinif() { return TicNumaratorPart } static get fisGirisLayoutSelector() { return '.ticNumarator' }
	static get kodListeTipi() { return 'TICNUM' }  static get sinifAdi() { return 'Ticari Numaratör' }
	static get table() { return 'tnumara' } static get idSaha() { return this.sayacSaha }
	static get sayacSaha() { return 'sayac' } static get kodSaha() { return 'belirtec' }
	get belirtec() { return this.kod } set belirtec(value) { return this.kod = value }

	constructor({ belirtec } = {}) {
		super(...arguments)
		if (belirtec)
			this.belirtec = belirtec
	}
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		extend(pTanim, {
			sayac: new PInstNum(this.sayacSaha), tip: new PInstStr('tip'),
			noYil: new PInstNum({ rowAttr: 'noyil' /*, init: e => app.params.zorunlu.cariYil || today().getYear() */ })
		})
	}
	static rootFormBuilderDuzenle(e = {}) {
		super.rootFormBuilderDuzenle(e)
		let {tanimFormBuilder: tanimForm} = e
		let {id2Builder: { genel: tabPageBuilder_genel }} = tanimForm.id2Builder.tabPanel
		tabPageBuilder_genel.builders[0]
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} .formBuilder-separator { width: 3px !important }`)
		let {builders} = tabPageBuilder_genel.builders[0]
		builders.unshift(
			new FBuilder_TextInput({ id: 'belirtec', etiket: 'Belirteç', maxLength: 3 })
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 70px !important; margin-right: 20px }`)
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} { text-align: center !important }`)
		)
		builders.splice(
			builders.length - 1, 0,
			new FBuilder_NumberInput({ id: 'noYil', etiket: 'No Yıl', maxLength: 4 })
				.onBuildEk(e => {
					let {builder} = e;
					builder.input.on('contextmenu', evt =>
						builder.inst.noYil = app.params.zorunlu.cariYil || today().getYear()
					)
				})
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 80px !important }`)
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} { text-align: center !important }`)
		)
	}
	static standartGorunumListesiDuzenle({ liste }) {
		super.standartGorunumListesiDuzenle(...arguments)
		liste.push('noyil')
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e, {kodSaha} = this;
		let colDef = liste.find(x => x.belirtec == kodSaha);
		if (colDef) { colDef.text = 'Belirteç'; colDef.genislikCh = 13 }
		liste.push(new GridKolon({ belirtec: 'noyil', text: 'No Yıl', genislikCh: 8 }).tipNumerik())
	}
	static loadServerData_queryDuzenle({ sent, sent: { where: wh, sahalar }, offlineRequest, offlineMode }) {
		super.loadServerData_queryDuzenle(...arguments)
		let {tableAlias: alias} = this
		sahalar.add(`${alias}.tip`)
	}
	async yukle(e = {}) {
		let {rec} = e
		if (!rec) {
			let {tip} = this
			if (!tip) 
				return false
			let {belirtec, class: { table }} = this
			let sent = new MQSent({
				from: table, sahalar: '*',
				where: belirtec
					? { birlestirDict: this.alternateKeyHostVars(e) }
					: { degerAta: tip, saha: 'tip' }
			})
			rec = await this.class.sqlExecTekil(sent)
		}
		return await super.yukle({ ...e, rec })
	}
	async kayitSayisi(e) { return await super.kayitSayisi(e) }
	keyHostVarsDuzenle({ hv, offlineBuildQuery, offlineRequest, offlineMode }) {
		super.superKeyHostVarsDuzenle(...arguments)
		hv.tip = this.tip
	}
	hostVarsDuzenle({ hv, offlineBuildQuery, offlineRequest, offlineMode }) {
		super.hostVarsDuzenle(...arguments)
	}
	keySetValues({ rec }) {
		super.superKeySetValues(...arguments)
		let {tip: value} = rec
		if (value != null)
			this.tip = value
	}

	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
		let {table, sayacSaha} = this.class
		let ind = r.findIndex(_ => _.includes(`	belirtec TEXT`))
		if (ind)
			r.splice(ind, 0, `\t${sayacSaha} INTEGER,`)
	}
}
