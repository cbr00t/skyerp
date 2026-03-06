class MQYerelParam extends MQYerelParamTicari { static { window[this.name] = this; this._key2Class[this.name] = this } }
class MQYerelParamConfig_App extends MQYerelParamConfig {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	yukleSonrasi(e) {
		if (!app.isAdmin) {
			for (let key of ['sql', 'wsProxyServerURL']) { delete this[key] }
			let {DefaultWSHostName_SkyServer: host, DefaultSSLWSPort: port} = config.class;
			this.wsURL = `https://${host}:${port}`
		}
		super.yukleSonrasi(e)
	}
}
class MQParam_ESE extends MQParam {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'ESE Parametreleri' } static get paramKod() { return 'ESEPARAM' }
	get asArray() { let result = []; for (let rec of this.getIter()) { result.push(rec) } return result }
	constructor(e = {}) {
		super(e)
		let {sablon, sablonId2Adi} = e
		extend(this, { sablon, sablonId2Adi })
		this.fix(e)
	}
	static paramYapiDuzenle(e) {
		super.paramYapiDuzenle(e)
		let {paramci} = e
		paramci.addStyle(e => `$elementCSS > .parent { padding-block-end: 0px !important }`)
		let form = paramci.addFormWithParent(); form.addGrup({ etiket: 'Varsayılan Şablon' })
		let formSablon = form.addFormWithParent().yanYana().addStyle_fullWH();
		for (let [tip, cls] of entries(MQSablon.tip2Sinif)) {
			let {maxSayi} = cls
			formSablon.addGridGiris_sabit(tip).addStyle_fullWH('49.5%')
				.setTabloKolonlari(_e => [
					new GridKolon({ belirtec: 'kisaEtiket', text: 'Kısa Etiket', genislikCh: 10 }),
					new GridKolon({ belirtec: 'etiket', text: 'Etiket', genislikCh: 20 }),
					...cls.getGridKolonlar({ belirtec: 'sablonId', kodAttr: 'sablonId', adiAttr: 'sablonAdi', genislikCh: 35 })
						.map(colDef => colDef.kodsuz())
				])
				.setSource(_e => [..._e.builder.inst.sablon[tip]])
				.veriDegisinceIslemi(({ action, rowIndex, belirtec, builder, builder: { altInst, id }, newValue: value }) => {
					if (action == 'cellValueChanged')
						altInst.sablon[id][rowIndex][belirtec] = value
				})
				.widgetArgsDuzenleIslemi(({ args, sender: gridPart, sender: { tabloKolonlari: colDefs } }) => {
					for (let c of colDefs)
						c.dropDown().autoBind()
				})
		}
	}
	async yukle(e) {
		if (app.isAdmin)
			return await super.yukle(e)
		let rec = await app.wsParams()
		if (!rec)
			return false
		this.paramSetValues({ ...e, rec })
		return true
	}
	paramHostVarsDuzenle({ hv }) {
		super.paramHostVarsDuzenle(...arguments)
		extend(hv, { sablon: this.sablon })
	}
	paramSetValues({ rec }) {
		super.paramSetValues(...arguments)
		let {sablon, sablonId2Adi} = rec
		extend(this, { sablon, sablonId2Adi })
		this.fix(e)
	}
	fix(e) {
		let {sablon} = this
		if (sablon == null)
			sablon = this.sablon = {}
		let items = sablon[MQSablonCPT.tip] = sablon[MQSablonCPT.tip] ?? []
		if ((items?.length ?? 0) < 1) 
			items.push({ etiket: 'CPT' })
		items[0].belirtec = ''
		items = sablon[MQSablonAnket.tip] = sablon[MQSablonAnket.tip] ?? [];
		if ((items?.length ?? 0) < 2) {
			items.push(
				{ kisaEtiket: 'DE', etiket: 'Dikkat Eksikliği' },
				{ kisaEtiket: 'HI', etiket: 'Hiperaktivite' }
			)
		}
		items[0].belirtec = 'de'
		items[1].belirtec = 'hi'
		return this
	}
	*getIter(e) {
		let {sablon} = this
		for (let [tip, items] of entries(sablon ?? {})) {
			for (let i = 0; i < items?.length || 0; i++) {
				let item = items[i], sablonId = item?.sablonId; if (!sablonId) { continue }
				let seq = i + 1, belirtec = item.belirtec || '', prefix = tip + belirtec;
				let etiket = item.etiket || '', kisaEtiket = item.kisaEtiket || etiket;
				let sablonTable = `ese${tip}sablon`;
				yield { i, seq, item, tip, belirtec, prefix, kisaEtiket, etiket, sablonId, sablonTable }
			}
		}
	}
	[Symbol.iterator](e) { return this.getIter(e) }
}
