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
			sayac: new PInstNum(this.sayacSaha),
			tip: new PInstStr('tip'),
			noYil: new PInstNum({ rowAttr: 'noyil' /*, init: e => app.params.zorunlu.cariYil || today().getYear() */ }),
			belgeTipi: new PInstTekSecim('belgetipi', EIslemTipi)
		})
	}
	static rootFormBuilderDuzenle(e = {}) {
		super.rootFormBuilderDuzenle(e)
		let { inst, tanimFormBuilder: tanimForm } = e
		let { tabPanel } = tanimForm.id2Builder
		let { genel } = tabPanel.id2Builder
		genel.builders[0]
			.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} .formBuilder-separator { width: 3px !important }`)

		;{
			let { builders } = genel.builders[0]
			/*builders.unshift(
				new FBuilder_TextInput({ id: 'belirtec', etiket: 'Belirteç', maxLength: 3 })
					.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.layout)} { min-width: auto !important; width: 70px !important; margin-right: 20px }`)
					.addStyle(e => `${e.builder.getCSSElementSelector(e.builder.input)} { text-align: center !important }`)
			)*/
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

		;{
			genel.addSelect('belgeTipi', 'Belge Tipi')
				.setPlaceholder('Belge Tipi')
				.etiketGosterim_normal()
				.setSource(EIslemOrtak.kaListe)
				//.setValue(belgeTipi?.char)
				.degisince(({ value, builder: { altInst: inst } }) =>
					inst.belgeTipi = value)
				.addStyle_wh(200)
		}
	}
	static ekCSSDuzenle({ dataField: k, rec: r, result: res }) {
		super.ekCSSDuzenle(...arguments)
		if (k == 'belgeTipiText') {
			let { belgetipi: v } = r
			let css = (
				v == 'A' ? 'bg-lightgreen' :
				v == 'E' || v == 'IR' ? 'bg-lightorangered' :
				null
			)
			if (css)
				res.push(css)
		}
	}
	static standartGorunumListesiDuzenle({ liste }) {
		liste.push('tip')
		super.standartGorunumListesiDuzenle(...arguments)
		liste.push('noyil', 'belgeTipiText')
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		let { tableAlias: alias, kodSaha } = this
		liste.push(new GridKolon({ belirtec: 'tip', text: 'Tip', genislikCh: 10 }).checkedList())
		;{
			let cd = liste.find(x => x.belirtec == kodSaha)
			if (cd) {
				extend(cd, { text: 'Belirteç', genislikCh: 13 })
				cd.checkedList()
			}
		}
		liste.push(
			new GridKolon({ belirtec: 'noyil', text: 'No Yıl', genislikCh: 8 }).tipNumerik().checkedList(),
			new GridKolon({
				belirtec: 'belgeTipiText', text: 'Belge Tipi', genislikCh: 10,
				sql: EIslemTipi.getClause(`${alias}.belgetipi`)
			}).checkedList()
		)
	}
	static loadServerData_queryDuzenle({ sent, sent: { where: wh, sahalar }, offlineRequest, offlineMode, idAlinsin = true }) {
		super.loadServerData_queryDuzenle(...arguments)
		let { tableAlias: alias } = this
		sahalar.add(`${alias}.tip`)
		if (idAlinsin) {
			let { idSaha, sayacSaha } = this
			if (idSaha)
				sahalar.add(`${alias}.${idSaha}`)
			if (sayacSaha && sayacSaha != idSaha)
				sahalar.add(`${alias}.${sayacSaha}`)
		}
		sahalar.add(`${alias}.belgetipi`)
	}
	async yukle(e = {}) {
		let { rec } = e
		if (!rec) {
			let { tip } = this
			if (!tip) 
				return false
			let { sayac, belirtec, class: { table, sayacSaha } } = this
			let sent = new MQSent({
				from: table, sahalar: '*',
				where: sayac
					? { degerAta: sayac, saha: sayacSaha }
					: belirtec
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
	setValues({ rec }) {
		super.setValues(...arguments)
		let { sayac } = rec
		if (sayac)
			this.sayac = sayac
	}

	offlineBuildSQLiteQuery({ result: r = [] }) {
		super.offlineBuildSQLiteQuery(...arguments)
		let {table, sayacSaha} = this.class
		let ind = r.findIndex(_ => _.includes(`	belirtec TEXT`))
		if (ind)
			r.splice(ind, 0, `\t${sayacSaha} INTEGER,`)
	}
}
