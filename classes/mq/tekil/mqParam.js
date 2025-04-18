class MQTekil extends MQYapi {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class MQParam extends MQTekil {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get ozelCopyKeys() { return ['_promise', '_paramci', '_builder'] } static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, ...this.ozelCopyKeys] }
	static get table() { return 'yflaglar' } static get tableAlias() { return 'par' } static get tanimUISinif() { return ParamTanimPart } static get paramKod() { return null }
	static get tekilOku_sqlBatchFlag() { return false } get tekSecimDonusum_receiver() { return this }
	get paramci() { return this._paramci } set paramci(value) { this._paramci = value } get builder() { return this._builder } set builder(value) { this._builder = value }
	static get paramAttrListe() { let result = this._paramAttrListe; if (!result) { this.paramAttrListeDuzenle({ liste: result = [] }); this._paramAttrListe = result } return result }
	static get tekSecimDonusum() { let result = this._tekSecimDonusum; if (!result) { this.tekSecimDonusumDuzenle({ liste: result = [] }); this._tekSecimDonusum = result } return result }
	static get paramYapi() { const _e = { paramci: new RootParamBuilder() }; this.paramYapiDuzenle(_e); const {paramci} = _e; return paramci }
	
	constructor(e) {
		e = e || {}; super(e); if (e.isCopy) { return }
		$.extend(this, { _promise: new $.Deferred(), kullanim: e.kullanim || {} }); this.paramciInit(e)
	}
	paramciInit(e) {
		let paramci = this.paramci = this.class.paramYapi;
		if (paramci) { paramci.inst = this; paramci.run(e) }
		return this
	}
	static paramYapiDuzenle(e) { }
	static getRootFormBuilder(e) {
		e = e || {}; const {inst} = e, paramci = inst?.paramci ?? this.paramYapi;
		const _e = $.extend({}, e, { paramci, rootBuilder: new (paramci.class.formBuilderClass || RootFormBuilder)(e) });
		_e.builder = _e.rootBuilder; this.formBuilderDuzenle(_e); return _e.rootBuilder
	}
	static formBuilderDuzenle(e) {
		let {builder, paramci} = e; if (!builder._id) builder.id = 'root'
		if (builder.isRootFormBuilder) {
			const rootBuilder = builder.rootBuilder = builder.parentBuilder = builder;
			let tabPanel = e.tabPanel = builder.addTabPanel('tabPanel').onAfterRun(e => {
				const {builder} = e, id2TabPanel = builder.rootPart.id2TabPanel = {};
				for (let subBuilder of builder.builders) id2TabPanel[subBuilder.id] = subBuilder
			});
			let tabPage_genel = e.tabPage_genel = tabPanel.addTab('genel', 'Genel'); e.builder = builder = tabPage_genel.addForm()
		}
		if (paramci) {
			for (const key of ['_id2Item', 'builder', '_root', '_parent', '_inst', '_altInst']) { delete paramci[key] }
			const {inst, part, layout} = e; $.extend(paramci, { inst, part, layout });
			if (!paramci._initFlag) { paramci.run(e) } if (paramci.formBuilderDuzenle) { paramci.formBuilderDuzenle(e) }
		}
	}
	static paramAttrListeDuzenle(e) { }
	static tekSecimDonusumDuzenle(e) { }
	static async topluYukleVerisiOlustur(e) {
		let {table} = this, uni = new MQUnionAll([
			new MQSent({ from: `ORTAK..${table}`, where: `kod <> ''`, sahalar: ['kod', 'jsonstr'] }),
			new MQSent({ from: table, where: `kod <> ''`, sahalar: ['kod', 'jsonstr'] })
		]), stm = new MQStm({ sent: uni });
		let recs = await app.sqlExecSelect(stm), kod2Rec = this._topluYukle_kod2Rec = {};
		for (let rec of recs) { let {kod} = rec; kod2Rec[kod] = rec }
		return this
	}
	async getInstance_yukleIslemi(e) { return await this.topluYukle(e) }
	topluYukle(e) {
		e = { ...e }; let {_topluYukle_kod2Rec, paramKod: kod} = this.class;
		e.rec = _topluYukle_kod2Rec?.[kod];
		return this.yukle(e)
	}
	async kaydetOncesiIslemler(e) {
		const {paramci} = this; if (paramci) { for (const item of paramci.getItemsAndSelf()) { if (item.kaydetOncesi) { await item.kaydetOncesi(e) } } }
		super.kaydetOncesiIslemler(e)
	}
	async kaydetSonrasiIslemler(e) {
		const {paramci} = this; if (paramci) { for (const item of paramci.getItemsAndSelf()) { if (item.kaydedince) { await item.kaydedince(e) } } }
		await super.kaydetSonrasiIslemler(e)
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments);
		result.kod = 'xkod'
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		hv.xkod = this.class.paramKod || ''
	}
	static varsayilanKeyHostVarsDuzenle({ hv }) {
		super.varsayilanKeyHostVarsDuzenle(...arguments);
		let {paramKod: kod} = this; $.extend(hv, { kod });
	}
	keyHostVarsDuzenle(e) {
		e = e || {}; e.varsayilanAlma = false; const {paramci} = this;
		if (paramci) { for (const item of paramci.getItemsAndSelf()) { if (item.keyHostVarsDuzenle) item.keyHostVarsDuzenle(e) } }
		super.keyHostVarsDuzenle(e)
	}
	hostVarsDuzenle(e) {
		e = e || {}; super.hostVarsDuzenle(e); const result = this.paramHostVars(e); if (!result) { return }
		const {hv} = e; hv.jsonstr = toJSONStr(result)
	}
	setValues(e) {
		e = e || {}; super.setValues(e); let {rec} = e;
		let result = rec.jsonstr; if (result && typeof result != 'object') { result = JSON.parse(result) } if (!result) { return }
		e.rec = result; this.paramSetValues({ ...e, rec: result })
	}
	paramHostVars(e) { const hv = {}; this.paramHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	paramHostVarsDuzenle(e) {
		e = e || {}; const {paramAttrListe} = this.class, {hv} = e;
		for (const key of paramAttrListe) { let value = this[key]; if (value !== undefined && !$.isFunction(value)) { hv[key] = value } }
		const {paramci} = this; if (paramci) { for (const item of paramci.getItemsAndSelf()) { if (item.paramHostVarsDuzenle) { item.paramHostVarsDuzenle(e) } } }
	}
	paramSetValues(e) {
		e = e || {}; const {rec} = e, {paramAttrListe} = this.class;
		for (const key of paramAttrListe) {
			if (key == '_p' && key[0] == '_') continue
			let value = rec[key]; if (value !== undefined && !isFunction(value)) { this[key] = value }
		}
		let {tekSecimDonusum} = this.class, {tekSecimDonusum_receiver} = this; for (const key in tekSecimDonusum) {
			let cls = tekSecimDonusum[key]; if (!cls) { continue }
			let value = rec[key]; tekSecimDonusum_receiver[key] = new cls(value || '')
		}
		let {paramci} = this; if (paramci) { for (let item of paramci.getItemsAndSelf()) { item?.paramSetValues(e) } }
	}
	static async tanimla(e) {
		const {tanimUISinif} = this; if (!tanimUISinif) { return null }
		e = e || {}; e.islem = e.islem || 'degistir'; e.mfSinif = e.mfSinif || this;
		try {
			const {paramci} = this; if (paramci?.tanimUIArgsDuzenle) { paramci.tanimUIArgsDuzenle(e) }
			/*let kaydedinceHandler = e.kaydedince; e.kaydedince = e => { if (kaydedinceHandler) getFuncValue.call(this, kaydedinceHandler, e); if (paramci?.kaydedince) paramci.kaydedince(e) }*/
			const part = new tanimUISinif(e), result = await part.run(); return { part, result }
		}
		catch (ex) { displayMessage(getErrorText(ex)); throw ex }
	}
	tanimla(e) { e = e || {}; e.inst = e.inst || this; return this.class.tanimla(e) }
	shallowCopy(e) {
		const inst = super.shallowCopy(e); /* for (const key of this.class.ozelCopyKeys) delete inst[key] */
		inst.builder = undefined; inst.paramciInit(e); return inst
	}
	deepCopy(e) {
		const inst = super.deepCopy(e); /*for (const key of this.class.ozelCopyKeys) delete inst[key]*/
		inst.builder = undefined; inst.paramciInit(e); return inst
	}
}
