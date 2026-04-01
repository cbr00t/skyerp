class MQYerelParamBase extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ozelCopyKeys() { return ['_promise', '_paramci', '_builder'] }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, ...this.ozelCopyKeys] }
	static get paramKod() { return null } get paramKod() { return this.class.paramKod }
	static get sinifAdi() { return 'Yerel Parametreler' }
	static get tanimUISinif() { return MQParam.tanimUISinif }
	static get kodKullanilirmi() { return true } static get kodSaha() { return 'kod' }
	static get parammi() { return true } static get tanimmi() { return true }
	static get paramYapi() {
		let _e = { paramci: new RootParamBuilder() }
		this.paramYapiDuzenle(_e)
		return _e.paramci
	}
	static get tekSecimDonusum() {
		let { _tekSecimDonusum: result } = this
		if (!result) {
			this.tekSecimDonusumDuzenle({ liste: result = [] })
			this._tekSecimDonusum = result
		}
		return result
	}
	get tekSecimDonusum_receiver() { return this }
	get paramci() { return this._paramci } set paramci(value) { this._paramci = value }
	get builder() { return this._builder } set builder(value) { this._builder = value }
	get tableWithPrefix() { '' } get rootTable() { return app.rootName }
	get fullTableName() { return `${this.rootTable}.${this.paramKod || ''}${this.tableWithPrefix || ''}` }
	static get paramAttrListe() {
		let { _paramAttrListe: result } = this
		if (!result) {
			result = this._paramAttrListe = []
			this.paramAttrListeDuzenle({ liste: result })
		}
		return result
	}

	static getInstance() {
		let { _instance: result } = this
		if (!result) {
			result = new this()
			result._promise = new $.Deferred()
			result.getInstance_yukleIslemi()
				.then(() => {
					result._yuklendimi = true
					result._promise?.resolve(result)
				})
				.catch(ex => {
					result._yuklendimi = false
					result._promise?.reject(ex)
				})
			this._instance = result
		}
		return result
	}
	
	constructor(e = {}) {
		super(e)
		if (e.isCopy)
			return
		let { paramAttrListe } = this.class
		let { table = e.tableName } = e
		extend(this, { table });
		for (let key of paramAttrListe) {
			let value = e[key]
			if (value !== undefined)
				this[key] = value
		}
		extend(this, { _promise: new $.Deferred(), kullanim: e.kullanim || {} })
		this.paramciInit(e)
		this.resetCache(e)
	}
	paramciInit(e) {
		let paramci = this.paramci = this.class.paramYapi
		if (paramci) {
			paramci.inst = this
			paramci.run(e)
		}
		return this
	}
	static paramAttrListeDuzenle(e) { }
	static paramYapiDuzenle(e) { }
	static tekSecimDonusumDuzenle(e) { }
	static getRootFormBuilder({ inst } = {}) {
		let paramci = inst?.paramci ?? this.paramYapi
		let _e = arguments[0]
		let e = { ..._e, paramci, rootBuilder: new (paramci.class.formBuilderClass || RootFormBuilder)(_e) }
		e.builder = e.rootBuilder
		this.formBuilderDuzenle(e)
		return e.rootBuilder
	}
	static formBuilderDuzenle(e) {
		let { builder, paramci } = e
		if (!builder._id)
			builder.id = 'root'
		if (builder.isRootFormBuilder) {
			let rootBuilder = builder.rootBuilder = builder.parentBuilder = builder
			let tabPanel = e.tabPanel = builder.addTabPanel('tabPanel')
				.onAfterRun(({ builder: fbd }) => {
					let id2TabPanel = fbd.rootPart.id2TabPanel = {}
					for (let subBuilder of fbd.builders)
						id2TabPanel[subBuilder.id] = subBuilder
				})
			let tabPage_genel = e.tabPage_genel = tabPanel.addTab('genel', 'Genel')
			e.builder = builder = tabPage_genel.addForm()
		}
		if (paramci) {
			deleteKeys(paramci, '_id2Item', 'builder', '_root', '_parent', '_inst', '_altInst')
			let { inst, part, layout } = e
			extend(paramci, { inst, part, layout })
			if (!paramci._initFlag)
				paramci.run(e)
			paramci?.formBuilderDuzenle?.(e)
		}
	}
	getInstance_yukleIslemi(e) { return this.yukle(e) }
	async yukle(e) {
		e = { ...e }; this.resetCache(e); this.yukleOncesi(e);
		let rec = await this.yukleIslemi(e);
		if (typeof rec == 'string') { rec = rec ? JSON.parse(rec) : {} }
		if (!$.isEmptyObject(rec)) { e.rec = rec; this.setValues(e) }
		await await this.yukleSonrasi(e)
		return this
	}
	kaydetDefer(e) {
		clearTimeout(this._timer_kaydetDefer)
		this._timer_kaydetDefer = setTimeout(async e => {
			try { await this.kaydet(e) }
			finally { delete this._timer_kaydetDefer }
		}, 700)
	}
	async kaydet(e) {
		e = { ...e }; this.resetCache(e)
		this.kaydetOncesi(e)
		let rec = this.hostVars(e); if (!rec) { return this }
		if (typeof rec == 'object') {
			let _rec = rec; let keys = Object.keys(rec), _keys = keys.filter(key => key[0] != '_');
			if (keys.length != _keys.length) { _rec = {}; for (let key of _keys) _rec[key] = rec[key]; rec = _rec }
			try { rec = toJSONStr(rec) }
			catch (ex) { debugger; throw ex }
		}
		e.rec = rec; await this.kaydetIslemi(e); this.kaydetSonrasi(e); return this
	}
	yukleOncesi(e) { return this.yukleVeKaydetOncesi(e) }
	async yukleSonrasi(e) {
		await this.yukleVeKaydetSonrasi(e)
		this._eskiInst = this.deepCopy()
	}
	yukleIslemi(e) { let {fullTableName} = this; let rec = localStorage.getItem(fullTableName); return rec }
	kaydetIslemi(e) { let {fullTableName} = this, {rec} = e; localStorage.setItem(fullTableName, rec) }
	async kaydetOncesi(e) {
		let { paramci } = this
		if (paramci) {
			for (let item of paramci.getItemsAndSelf())
				 await item?.kaydetOncesi?.(e)
		}
		await this.yukleVeKaydetOncesi(e)
		
	}
	async kaydetSonrasi(e) {
		let { paramci } = this
		if (paramci) {
			for (let item of paramci.getItemsAndSelf())
				 await item?.kaydedince?.(e)
		}
		await this.yukleVeKaydetSonrasi(e)
	}
	yukleVeKaydetOncesi(e) { }
	yukleVeKaydetSonrasi(e) { }
	
	hostVarsDuzenle(e = {}) {
		super.hostVarsDuzenle(e)
		let _hv = this.paramHostVars(e)
		if (_hv)
			extend(e.hv, _hv)
	}
	setValues(e = {}) {
		super.setValues(e)
		let { rec } = e
		if (rec && !isObject(rec))
			rec = JSON.parse(rec)
		if (rec)
			this.paramSetValues({ ...e, rec })
	}
	paramHostVars(e) {
		let hv = {}
		this.paramHostVarsDuzenle({ ...e, hv })
		return hv
	}
	paramHostVarsDuzenle({ hv }) {
		let { class: { paramAttrListe }, paramci } = this
		for (let key of paramAttrListe) {
			let value = this[key]
			if (value !== undefined && !isFunction(value))
				hv[key] = value
		}
		if (paramci) {
			for (let item of paramci.getItemsAndSelf())
				item?.paramHostVarsDuzenle?.(...arguments)
		}
	}
	paramSetValues({ rec }) {
		let { class: { paramAttrListe, tekSecimDonusum }, tekSecimDonusum_receiver, paramci } = this
		for (let key of paramAttrListe) {
			if (key == '_p' && key[0] == '_')
				continue
			let value = rec[key]
			if (value !== undefined && !isFunction(value))
				this[key] = value
		}
		for (let [key, cls] of entries(tekSecimDonusum)) {
			if (!cls)
				continue
			let value = rec[key]
			tekSecimDonusum_receiver[key] = new cls(value ?? '')
		}
		if (paramci) {
			for (let item of paramci.getItemsAndSelf())
				item?.paramSetValues?.(...arguments)
		}
	}
	static rootFormBuilderDuzenle(e) {
		/*e.rootBuilder.onPartInit(e => { let {wndArgs} = e.part; wndArgs.width = 1000 })*/
	}
	static rootFormBuilderDuzenleSonrasi(e) { }
	static getFormBuilders(e) { let _e = extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return e.liste }
	static formBuildersDuzenle(e) { }
	getRootFormBuilder(e) { return this.class.getRootFormBuilder(e) }
	getFormBuilders(e) { e = e || {}; let _e = extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return e.liste }
	formBuildersDuzenle(e) { this.class.formBuildersDuzenle(e) }
	static async tanimla(e = {}) {
		let { tanimUISinif } = this
		if (!tanimUISinif)
			return null
		e.islem = e.islem || 'degistir'
		e.mfSinif = e.mfSinif || this
		try {
			let { paramci } = this
			paramci?.tanimUIArgsDuzenle?.(e)
			let part = new tanimUISinif(e)
			let result = await part.run()
			return { part, result }
		}
		catch (ex) { displayMessage(getErrorText(ex)); throw ex }
	}
	tanimla(e = {}) {
		let { inst = this, _eskiInst = this._eskiInst } = e
		extend(e, { inst, _eskiInst })
		return this.class.tanimla(e)
	}
	shallowCopy(e) {
		let inst = super.shallowCopy(e)
		inst.builder = undefined
		inst.paramciInit?.(e)
		return inst
	}
	deepCopy(e) {
		let inst = super.deepCopy(e)
		inst.builder = undefined
		inst.paramciInit?.(e)
		return inst
	}
	resetCache(e) {
		this.class._paramAttrListe = undefined
	}
}
