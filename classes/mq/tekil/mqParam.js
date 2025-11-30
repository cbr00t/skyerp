class MQTekil extends MQYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQParam extends MQTekil {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ozelCopyKeys() { return ['_promise', '_paramci', '_builder'] }
	static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, ...this.ozelCopyKeys] }
	static get table() { return 'yflaglar' } static get tableAlias() { return 'par' }
	static get tanimUISinif() { return ParamTanimPart } static get paramKod() { return null }
	static get kodKullanilirmi() { return true } static get kodSaha() { return 'kod' }
	static get tekilOku_sqlBatchFlag() { return false }
	get tekSecimDonusum_receiver() { return this }
	get paramci() { return this._paramci } set paramci(value) { this._paramci = value }
	get builder() { return this._builder } set builder(value) { this._builder = value }
	static get paramAttrListe() { let result = this._paramAttrListe; if (!result) { this.paramAttrListeDuzenle({ liste: result = [] }); this._paramAttrListe = result } return result }
	static get tekSecimDonusum() { let result = this._tekSecimDonusum; if (!result) { this.tekSecimDonusumDuzenle({ liste: result = [] }); this._tekSecimDonusum = result } return result }
	static get paramYapi() { let _e = { paramci: new RootParamBuilder() }; this.paramYapiDuzenle(_e); let {paramci} = _e; return paramci }
	get offlineSahaListe() {
		let {class: { kodSaha }} = this
		return [kodSaha, 'jsonstr']
	}
	
	constructor(e = {}) {
		super(e)
		if (e.isCopy)
			return
		$.extend(this, { _promise: new $.Deferred(), kullanim: e.kullanim || {} })
		this.paramciInit(e)
	}
	paramciInit(e) {
		let paramci = this.paramci = this.class.paramYapi
		if (paramci) {
			paramci.inst = this
			paramci.run(e)
		}
		return this
	}
	static paramYapiDuzenle(e) { }
	static paramAttrListeDuzenle(e) { }
	static tekSecimDonusumDuzenle(e) { }
	static getRootFormBuilder(e) {
		e = e || {}; let {inst} = e, paramci = inst?.paramci ?? this.paramYapi;
		let _e = $.extend({}, e, { paramci, rootBuilder: new (paramci.class.formBuilderClass || RootFormBuilder)(e) });
		_e.builder = _e.rootBuilder; this.formBuilderDuzenle(_e); return _e.rootBuilder
	}
	static formBuilderDuzenle(e) {
		let {builder, paramci} = e; if (!builder._id) builder.id = 'root'
		if (builder.isRootFormBuilder) {
			let rootBuilder = builder.rootBuilder = builder.parentBuilder = builder;
			let tabPanel = e.tabPanel = builder.addTabPanel('tabPanel').onAfterRun(e => {
				let {builder} = e, id2TabPanel = builder.rootPart.id2TabPanel = {};
				for (let subBuilder of builder.builders) id2TabPanel[subBuilder.id] = subBuilder
			});
			let tabPage_genel = e.tabPage_genel = tabPanel.addTab('genel', 'Genel'); e.builder = builder = tabPage_genel.addForm()
		}
		if (paramci) {
			for (let key of ['_id2Item', 'builder', '_root', '_parent', '_inst', '_altInst']) { delete paramci[key] }
			let {inst, part, layout} = e; $.extend(paramci, { inst, part, layout });
			if (!paramci._initFlag) { paramci.run(e) } if (paramci.formBuilderDuzenle) { paramci.formBuilderDuzenle(e) }
		}
	}
	static async loadServerData({ offlineRequest, offlineMode }) {
		let e = arguments[0]
		if (offlineRequest && !offlineMode) {
			// Bilgi Yükle
			let {_topluYukle_kod2Rec: kod2Rec} = this
			if (empty(kod2Rec)) {
				let promise = app.promise_param = this.topluYukleVerisiOlustur(e)
				await promise
				kod2Rec = this._topluYukle_kod2Rec
			}
			return values(kod2Rec).filter(rec => !!rec?.jsonstr)
		}
	}
	static async topluYukleVerisiOlustur(e) {
		let {table, kodSaha} = this, sahalar = [kodSaha, /*'tanim',*/ 'jsonstr']
		let uni = new MQUnionAll([
			new MQSent({ from: `ORTAK..${table}`, sahalar }),
			new MQSent({ from: table, sahalar })
		])
		for (let {where: wh} of uni)
			wh.add(`kod <> ''`, `jsonstr <> ''`)
		let stm = new MQStm({ sent: uni })
		let recs = await this.sqlExecSelect({ ...e, query: stm })
		let kod2Rec = this._topluYukle_kod2Rec = {}
		for (let rec of recs) { let {kod} = rec; kod2Rec[kod] = rec }
		return kod2Rec
	}
	async getInstance_yukleIslemi(e) { return await this.topluYukle(e) }
	topluYukle(e) {
		e = { ...e }
		let {_topluYukle_kod2Rec, paramKod: kod} = this.class
		e.rec = empty(_topluYukle_kod2Rec) ? undefined : (_topluYukle_kod2Rec[kod] ?? {})
		return this.yukle(e)
	}
	async kaydetOncesiIslemler(e) {
		let {paramci} = this; if (paramci) { for (let item of paramci.getItemsAndSelf()) { if (item.kaydetOncesi) { await item.kaydetOncesi(e) } } }
		super.kaydetOncesiIslemler(e)
	}
	async kaydetSonrasiIslemler(e) {
		let {paramci} = this; if (paramci) { for (let item of paramci.getItemsAndSelf()) { if (item.kaydedince) { await item.kaydedince(e) } } }
		await super.kaydetSonrasiIslemler(e)
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments)
		result.kod = 'xkod'
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		hv.xkod = this.class.paramKod || ''
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments)
		let {paramKod: kod} = this
		$.extend(hv, { kod })
	}
	keyHostVarsDuzenle(e = {}) {
		e.varsayilanAlma = false
		let {paramci} = this
		if (paramci) {
			for (let item of paramci.getItemsAndSelf())
				item?.keyHostVarsDuzenle?.(e)
		}
		super.keyHostVarsDuzenle(e)
	}
	hostVarsDuzenle(e) {
		let {class: { paramKod: kod }} = this
		kod ??= ''; super.hostVarsDuzenle(e)
		let _hv = this.paramHostVars({ ... e })
		if (!_hv)
			return
		let {hv} = e, jsonstr = toJSONStr(_hv)
		$.extend(hv, { kod, jsonstr })
	}
	setValues(e) {
		super.setValues(e)
		let {rec} = e, {result = rec.jsonstr} = rec
		if (result && typeof result != 'object')
			result = JSON.parse(result)
		if (!result)
			return
		e.rec = result
		this.paramSetValues(e)
	}
	paramHostVars(e = {}) {
		e.hv = {}
		this.paramHostVarsDuzenle(e)
		return e.hv
	}
	paramHostVarsDuzenle({ hv }) {
		let {class: { paramAttrListe }, paramci} = this
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
		let {class: { paramAttrListe, tekSecimDonusum }, tekSecimDonusum_receiver, paramci} = this
		for (let key of paramAttrListe) {
			if (key == '_p' && key[0] == '_') continue
			let value = rec[key]; if (value !== undefined && !isFunction(value)) { this[key] = value }
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
	static async tanimla(e) {
		let {tanimUISinif} = this; if (!tanimUISinif) { return null }
		e = e || {}; e.islem = e.islem || 'degistir'; e.mfSinif = e.mfSinif || this;
		try {
			let {paramci} = this; if (paramci?.tanimUIArgsDuzenle) { paramci.tanimUIArgsDuzenle(e) }
			/*let kaydedinceHandler = e.kaydedince; e.kaydedince = e => { if (kaydedinceHandler) getFuncValue.call(this, kaydedinceHandler, e); if (paramci?.kaydedince) paramci.kaydedince(e) }*/
			let part = new tanimUISinif(e), result = await part.run(); return { part, result }
		}
		catch (ex) { displayMessage(getErrorText(ex)); throw ex }
	}
	tanimla(e) { e = e || {}; e.inst = e.inst || this; return this.class.tanimla(e) }
	shallowCopy(e) {
		let inst = super.shallowCopy(e); /* for (let key of this.class.ozelCopyKeys) delete inst[key] */
		inst.builder = undefined; inst.paramciInit(e); return inst
	}
	deepCopy(e) {
		let inst = super.deepCopy(e); /*for (let key of this.class.ozelCopyKeys) delete inst[key]*/
		inst.builder = undefined; inst.paramciInit(e); return inst
	}
}
