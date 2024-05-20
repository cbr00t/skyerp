class MQYerelParamBase extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get paramKod() { return null } static get sinifAdi() { return 'Yerel Parametreler' }
	static get rootTable() { return app.rootName } static get fullTableName() { return `${this.rootTable}.${this.paramKod}` }
	static get tanimUISinif() { return null }
	static get paramAttrListe() {
		let result = this._paramAttrListe; if (!result) { result = this._paramAttrListe = []; this.paramAttrListeDuzenle({ liste: result }) }
		return result
	}
	static getInstance() {
		let result = this._instance; if (!result) { result = new this(); result.yukle(); this._instance = result }
		return result
	}
	constructor(e) {
		e = e || {}; super(e);
		for (const key of this.class.paramAttrListe) { const value = e[key]; if (value !== undefined) this[key] = value }
	}
	static paramAttrListeDuzenle(e) { }
	yukle(e) {
		e = $.extend({}, e || {}); this.yukleOncesi(e); const {fullTableName} = this.class;
		let rec = localStorage.getItem(fullTableName); if (typeof rec == 'string') rec = rec ? JSON.parse(rec) : {}
		if (!$.isEmptyObject(rec)) { e.rec = rec; this.setValues(e) } this.yukleSonrasi(e);
		return this
	}
	yukleOncesi(e) { this.yukleVeKaydetOncesi(e) }
	yukleSonrasi(e) { this.yukleVeKaydetSonrasi(e) }
	kaydetDefer(e) { clearTimeout(this._timer_kaydetDefer); this._timer_kaydetDefer = setTimeout(e => { try { this.kaydet(e) } finally { delete this._timer_kaydetDefer } }, 500) }
	kaydet(e) {
		e = $.extend({}, e || {}); this.kaydetOncesi(e); const {fullTableName} = this.class;
		let rec = this.hostVars(e); if (!rec) return this
		if (typeof rec == 'object') {
			let _rec = rec; const keys = Object.keys(rec), _keys = keys.filter(key => key[0] != '_');
			if (keys.length != _keys.length) { _rec = {}; for (const key of _keys) _rec[key] = rec[key]; rec = _rec }
			rec = toJSONStr(rec)
		}
		e.rec = rec; localStorage.setItem(fullTableName, rec);
		this.kaydetSonrasi(e); return this
	}
	kaydetOncesi(e) { this.yukleVeKaydetOncesi(e) }
	kaydetSonrasi(e) { this.yukleVeKaydetSonrasi(e) }
	yukleVeKaydetOncesi(e) { }
	yukleVeKaydetSonrasi(e) { }
	hostVarsDuzenle(e) {
		e = e || {}; super.hostVarsDuzenle(e); const _hv = this.paramHostVars(e);
		if (_hv) { $.extend(e.hv, _hv) }
	}
	setValues(e) {
		e = e || {}; super.setValues(e); const {rec} = e;
		if (rec && typeof rec != 'object') { rec = JSON.parse(rec) }
		if (rec) { this.paramSetValues($.extend({}, e, { rec })) }
	}
	paramHostVars(e) { const hv = {}; this.paramHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	paramHostVarsDuzenle(e) {
		e = e || {}; const {paramAttrListe} = this.class; const {hv} = e;
		for (const key of paramAttrListe) { let value = this[key]; if (value !== undefined && !$.isFunction(value)) { hv[key] = value } }
	}
	paramSetValues(e) {
		e = e || {}; const {rec} = e; const {paramAttrListe} = this.class;
		for (const key of paramAttrListe) {
			if (key == '_p' && key[0] == '_') { continue }
			let value = rec[key]; if (value !== undefined && !$.isFunction(value)) this[key] = value
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
		const {tanimUISinif} = this; if (!tanimUISinif) return null
		e = e || {}; const _e = $.extend({}, e, { islem: e.islem || 'yeni', mfSinif: e.mfSinif || this });
		try {
			const part = new tanimUISinif(_e), result = part.run();
			const wnd = part.wnd = createJQXWindow({ content: part.layout, title: part.title, args: part.wndArgs });
			wnd.on('close', evt => { $('body').removeClass('bg-modal'); part.destroyPart() });
			$('body').addClass('bg-modal');
			return { part, wnd, result }
		}
		catch (ex) { displayMessage(getErrorText(ex)); throw ex }
	}
	tanimla(e) { e = e || {}; e.inst = e.inst || this; return this.class.tanimla(e) }
}
