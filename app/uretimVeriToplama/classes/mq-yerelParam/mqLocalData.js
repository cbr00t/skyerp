class MQLocalData extends MQYerelParamApp {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get QueryCacheTimeoutSecs() { return .5 } static get DelimAnah() { return '$' } static get paramKod() { return `${super.paramKod}.localData` }
	get data() { return this._data = this._data || {} } set data(value) { this._data = value }
	
	constructor(e) {
		e = e || {}; super(e);
		for (const key of ['barkodKurallari', '_data']) this[key] = this[key] || {}
	}
	static paramAttrListeDuzenle(e) { super.paramAttrListeDuzenle(e); e.liste.push( 'barkodKurallari', 'data', 'fiyatFra', 'bedelFra') }
	yukleSonrasi(e) {
		e = e || {}; super.yukleSonrasi(e);
		const promises = [ this.yukleSonrasi_param(e), this.yukleSonrasi_barkodKurallari(e) ];
		Promise.all(promises).finally(() => { if (e.paramDegistimi) this.kaydetDefer() })
	}
	async yukleSonrasi_param(e) {
		let param = app.params.zorunlu; if (!param) param = app.params.zorunlu = MQZorunluParam.getInstance();
		if (param) {
			const block = param => {
				const keys = ['fiyatFra', 'bedelFra']; for (const key of keys) this[key] = param[key];
				e.paramDegistimi = true
			};
			if (param.then) {
				param.then(_param => block(_param)).catch(ex => {
					console.error(ex);
					const param = app.params.zorunlu = new MQZorunluParam();
					for (const key of keys) param[key] = this[key]
				})
			}
			else block(param)
		}
	}
	async yukleSonrasi_barkodKurallari(e) {
		const barkodKurallari = this.barkodKurallari = this.barkodKurallari || {};
		const barkodKurallariVarmi = !!(barkodKurallari.baslangicKod2Kural && barkodKurallari.ayrisimKurallari);
		let promise; if (!barkodKurallariVarmi) promise = this._promise = new $.Deferred()
		const parserSinif = BarkodParser_Kuralli;
		try {
			const recs = {};
			try { await parserSinif.barkodKurallariBelirle({ recs: recs }); $.extend(barkodKurallari, recs) }
			catch (ex2) { console.error(ex2); await parserSinif.barkodKurallariBelirle({ recs: barkodKurallari }) }
			e.paramDegistimi = true;
			if (promise) promise.resolve(recs)
		}
		catch (ex) { console.error(ex); if (promise) promise.reject(ex); throw ex }
	}
	getMQRecs(e) {
		const {mfSinif, cacheOnly} = e, localDataBelirtec = e.localDataBelirtec || e.belirtec || mfSinif?.localDataBelirtec;
		if (!localDataBelirtec) { return undefined }
		const {args} = e, ozelQueryDuzenleBlock = e.ozelQueryDuzenle ?? e.ozelQueryDuzenleBlock, idSahaOrArray = mfSinif?.idSaha;
		const idDizimi = !$.isEmptyObject(idSahaOrArray) && $.isArray(idSahaOrArray);
		let idListe = e.idSet || e.idListe || null; if (!idDizimi && $.isArray(idListe)) { idListe = Object.keys(asSet(idListe)) }
		const ozelQueryDuzenle = e => {
			// e.param = this;
			if (idListe && idSahaOrArray) {
				const alias = e.alias || mfSinif.tableAlias, idSahaDonusum = mfSinif.idSahaDonusum || {};
				for (const sent of e.stm.getSentListe()) {
					sent.distinctYap();
					if (idDizimi) {
						const or = new MQOrClause(); for (const idValues of idListe) {
							const and = new MQAndClause();
							for (let i = 0; i < idSahaOrArray.length; i++) {
								let idSaha = idSahaOrArray[i]; idSaha = idSahaDonusum[idSaha] || `${alias}.${idSaha}`;
								and.degerAta(idValues[i], idSaha)
							}
							or.add(and)
						}
						sent.where.add(or)
					}
					else { sent.where.inDizi(idListe, `${alias}.${idSahaOrArray}`) }
				}
			}
			if (ozelQueryDuzenleBlock) { getFuncValue.call(this, ozelQueryDuzenleBlock, e) }
		};
		const query = ($.isFunction(e.query) ? getFuncValue.call(this, e.query, e) : e.query) ?? mfSinif?.loadServerData_queryOlustur({ ...e, ozelQueryDuzenle }), queryStr = query.toString();
		/*let query2Result = this.getData({ key: localDataBelirtec }) || {}; let _result = query2Result[queryStr];
		if (_result && !cacheOnly && onLine) {
			const {QueryCacheTimeoutSecs} = this.class;
			if (QueryCacheTimeoutSecs != null && QueryCacheTimeoutSecs > 0) {
				let {timestamp} = _result; if (typeof timestamp == 'string') timestamp = asDate(timestamp)
				if (isInvalidDate(timestamp)) timestamp = null
				if (timestamp) {
					const farkSn = (now() - timestamp) / 1000;
					if (farkSn > QueryCacheTimeoutSecs) { _result = undefined; delete query2Result[queryStr]; this.setData({ key: localDataBelirtec, data: query2Result }); this.kaydetDefer() }
				}
			}
		}
		let {timestamp, recs} = _result || {};
		const result = { query, timestamp, recs };
		if (recs) {
			const _promise = result.promise = new $.Deferred(); _promise.resolve(recs);
			return result
		}*/
		const result = {}, promise = result.promise = new $.Deferred(); let _result;
		const {onLine} = navigator; if (onLine) {
			const _promise = (mfSinif || MQMasterOrtak).loadServerData_querySonucu({ ...e, query, args });
			_promise.then(recs => {
				result.recs = recs; /*_result = query2Result[queryStr] =*/ $.extend(result, { timestamp: now(), recs });
				promise.resolve(recs);
				/* this.setData({ key: localDataBelirtec, value: query2Result }); this.kaydetDefer() */
			}).catch(ex => { promise.reject(ex) })
		}
		else { promise.reject({ isError: true, rc: 'offline' }) }
		return result
	}
	getData(e) {
		const key = typeof e == 'object' ? e.key : e, {data} = this;
		if (typeof e != 'object') e = {}; const {ifAbsent, ifAbsentPut, ifPresent} = e;
		let value = data[key];
		if (value === undefined && ifAbsentPut) {
			value = getFuncValue.call(this, ifAbsentPut, $.extend({}, e, { value: value }));
			if (value !== undefined) data[key] = value
		}
		if (value === undefined) return ifAbsent ? getFuncValue.call(this, ifAbsent, $.extend({}, e, { value: value })) : undefined
		return ifPresent ? getFuncValue.call(this, ifPresent, $.extend({}, e, { value: value })) : value
	}
	setData(e, _value) {
		const key = typeof e == 'object' ? e.key : e, value = typeof e == 'object' ? e.value : _value, {data} = this;
		if (value == null) delete data[key]; else data[key] = value;
		return this
	}
	clearData(e) { this.data = null; return this }
}
