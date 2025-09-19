class MQYerelParamBase extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return null } get paramKod() { return this.class.paramKod} static get sinifAdi() { return 'Yerel Parametreler' } static get tanimUISinif() { return null }
	get tableWithPrefix() { '' } get rootTable() { return app.rootName } get fullTableName() { return `${this.rootTable}.${this.paramKod || ''}${this.tableWithPrefix || ''}` }
	static get paramAttrListe() { let result = this._paramAttrListe; if (!result) { result = this._paramAttrListe = []; this.paramAttrListeDuzenle({ liste: result }) } return result }
	static getInstance() {
		let result = this._instance; if (!result) {
			result = new this(); result._promise = new $.Deferred();
			result.getInstance_yukleIslemi()
				.then(() => { result._yuklendimi = true; let {_promise} = result; if (_promise) { _promise.resolve(result) } })
				.catch(ex => { result._yuklendimi = false; let {_promise} = result; if (_promise) { _promise.reject(ex) } })
			this._instance = result
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e); const {paramAttrListe} = this.class, table = e.table ?? e.tableName; $.extend(this, { table });
		for (const key of paramAttrListe) { const value = e[key]; if (value !== undefined) { this[key] = value } }
		this.resetCache(e)
	}
	static paramAttrListeDuzenle(e) { }
	getInstance_yukleIslemi(e) { return this.yukle(e) }
	async yukle(e) {
		e = { ...e }; this.resetCache(e); this.yukleOncesi(e);
		let rec = await this.yukleIslemi(e);
		if (typeof rec == 'string') { rec = rec ? JSON.parse(rec) : {} }
		if (!$.isEmptyObject(rec)) { e.rec = rec; this.setValues(e) }
		await await this.yukleSonrasi(e);
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
		e = $.extend({}, e || {}); this.resetCache(e); this.kaydetOncesi(e); let rec = this.hostVars(e); if (!rec) { return this }
		if (typeof rec == 'object') {
			let _rec = rec; const keys = Object.keys(rec), _keys = keys.filter(key => key[0] != '_');
			if (keys.length != _keys.length) { _rec = {}; for (const key of _keys) _rec[key] = rec[key]; rec = _rec }
			try { rec = toJSONStr(rec) }
			catch (ex) { debugger; throw ex }
		}
		e.rec = rec; await this.kaydetIslemi(e); this.kaydetSonrasi(e); return this
	}
	yukleOncesi(e) { this.yukleVeKaydetOncesi(e) }
	yukleSonrasi(e) { this.yukleVeKaydetSonrasi(e); this._eskiInst = this.deepCopy() }
	yukleVeKaydetOncesi(e) { } yukleVeKaydetSonrasi(e) { }
	yukleIslemi(e) { const {fullTableName} = this; const rec = localStorage.getItem(fullTableName); return rec }
	kaydetIslemi(e) { const {fullTableName} = this, {rec} = e; localStorage.setItem(fullTableName, rec) }
	kaydetOncesi(e) { this.yukleVeKaydetOncesi(e) } kaydetSonrasi(e) { this.yukleVeKaydetSonrasi(e) }
	hostVarsDuzenle(e) {
		e = e || {}; super.hostVarsDuzenle(e); const _hv = this.paramHostVars(e);
		if (_hv) { $.extend(e.hv, _hv) }
	}
	setValues(e) {
		e = e || {}; super.setValues(e); const {rec} = e; if (rec && typeof rec != 'object') { rec = JSON.parse(rec) }
		if (rec) { this.paramSetValues({ ...e, rec }) }
	}
	paramHostVars(e) { const hv = {}; this.paramHostVarsDuzenle({ ...e, hv }); return hv }
	paramHostVarsDuzenle(e) {
		e = e || {}; const {paramAttrListe} = this.class; const {hv} = e;
		for (const key of paramAttrListe) { let value = this[key]; if (value !== undefined && !isFunction(value)) { hv[key] = value } }
	}
	paramSetValues(e) {
		e = e || {}; const {rec} = e; const {paramAttrListe} = this.class;
		for (const key of paramAttrListe) {
			if (key == '_p' && key[0] == '_') { continue }
			let value = rec[key]; if (value !== undefined && !isFunction(value)) { this[key] = value }
		}
	}
	static rootFormBuilderDuzenle(e) { /*e.rootBuilder.onPartInit(e => { const {wndArgs} = e.part; wndArgs.width = 1000 })*/ }
	static rootFormBuilderDuzenleSonrasi(e) { }
	static getFormBuilders(e) { const _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return e.liste }
	static formBuildersDuzenle(e) { }
	getRootFormBuilder(e) { return this.class.getRootFormBuilder(e) }
	getFormBuilders(e) { e = e || {}; const _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle(_e); return e.liste }
	formBuildersDuzenle(e) { this.class.formBuildersDuzenle(e) }
	static tanimla(e) {
		const {tanimUISinif} = this; if (!tanimUISinif) { return null }
		e = e || {}; e._eskiInst = e._eskiInst ?? e.inst?._eskiInst; const _e = { ...e, islem: e.islem || 'yeni', mfSinif: e.mfSinif ?? this };
		try {
			const part = new tanimUISinif(_e), result = part.run(), content = part.layout, {title} = part, args = part.wndArgs;
			const wnd = part.wnd = createJQXWindow({ content, title, args });
			wnd.on('close', evt => { part.destroyPart(); $('body').removeClass('bg-modal') });
			setTimeout(() => $('body').addClass('bg-modal'), 1); return { part, wnd, result }
		}
		catch (ex) { hConfirm(getErrorText(ex)); throw ex }
	}
	tanimla(e) { e = e || {}; $.extend(e, { inst: e.inst ?? this, _eskiInst: e._eskiInst ?? this._eskiInst }); return this.class.tanimla(e) }
	resetCache(e) { this.class._paramAttrListe = undefined }
}
