class MQTicNumarator extends MQNumarator {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get numaratorPartSinif() { return TicNumaratorPart } static get fisGirisLayoutSelector() { return '.ticNumarator' }
	static get kodListeTipi() { return 'TICNUM' }  static get sinifAdi() { return 'Ticari Numaratör' }
	static get table() { return 'tnumara' } static get sayacSaha() { return 'sayac' } static get kodSaha() { return 'belirtec' }
	get belirtec() { return this.kod } set belirtec(value) { return this.kod = value }

	constructor(e) {
		e = e || {}; super(e);
		let {belirtec} = e; if (belirtec) { this.belirtec = belirtec }
	}
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e;
		$.extend(pTanim, {
			sayac: new PInstNum(this.sayacSaha), tip: new PInstStr('tip'),
			noYil: new PInstNum({ rowAttr: 'noyil' /*, init: e => app.params.zorunlu.cariYil || today().getYear() */ })
		})
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e);
		let {tanimFormBuilder} = e;
		let tabPageBuilder_genel = tanimFormBuilder.id2Builder.tabPanel.id2Builder.genel;
		tabPageBuilder_genel.builders[0]
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} .formBuilder-separator { width: 3px !important; }`)
		let {builders} = tabPageBuilder_genel.builders[0];
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
					let {builder} = e;
					builder.input.on('contextmenu', evt =>
						builder.inst.noYil = app.params.zorunlu.cariYil || today().getYear()
					)
				})
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 80px !important; }`)
				.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} { text-align: center !important; }`)
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
	async kayitSayisi(e) { return await super.kayitSayisi(e)	 }
	keyHostVarsDuzenle(e) { super.superKeyHostVarsDuzenle(e); let {hv} = e; hv.tip = this.tip; }
	keySetValues(e) { super.superKeySetValues(e); let {rec} = e; let value = rec.tip; if (value != null) this.tip = value }
	async kesinlestir(e = {}) {
		let {sayac, class: { table, isOfflineMode: _isOfflineMode }} = this
		let {isOfflineMode = _isOfflineMode} = e
		let sonNo = this.sonNo || 0
		if (isOfflineMode) {
			if (!await this.varmi()) {
				sonNo = ++this.sonNo
				await this.yaz()
			}
			else {
				let keyHV = this.alternateKeyHostVars(e)
				let toplu = new MQToplu([
					new MQIliskiliUpdate({
						from: table,
						where: { birlestirDict: keyHV },
						set: `sonno = sonno + 1`
					}),
					new MQSent({
						from: table, sahalar: ['sonno'],
						where: { birlestirDict: keyHV }
					})
				]).withTrn()
				sonNo = this.sonNo = asInteger(await this.sqlExecTekilDeger(toplu))
			}
			return sonNo
		}
		if (!sayac) {
			this.sonNo = ++sonNo
			return this
		}
		let {sayacSaha} = this.class, result = await this.class.sqlExecNoneWithResult({
			query: `UPDATE ${table} SET @sonNo = sonno = sonno + 1 WHERE ${sayacSaha} = ${sayac}`,
			params: [{ name: '@sonNo', type: 'int', direction: 'output' }]
		})
		if (isArray(result)) { result = result[0] }
		let qParam = (result?.params || {})['@sonNo']
		if (qParam?.value)
			sonNo = this.sonNo = qParam.value
		return this
	}
}
