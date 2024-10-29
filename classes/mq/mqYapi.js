class MQYapi extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get mqYapimi() { return true } static get isOfflineMode() { return app.offlineMode }
	static get sinifAdi() { return null } static get table() { return null } static get tableAlias() { return null }
	static get tableAndAlias() { const {table, tableAlias} = this; if (tableAlias) { return `${table} ${tableAlias}` } return table }
	static get aliasVeNokta() { const {tableAlias} = this; if (tableAlias) { return `${tableAlias}.` } return '' }
	static get silinebilirmi() { return false } static get tekilOku_querySonucu_returnValueGereklimi() { return false }
	static get tekilOku_sqlBatchFlag() { return true } static get tekilOkuYapilazmi() { return false }

	constructor(e) { e = e || {}; super(e) }
	static getInstance() {
		let result = this._instance;
		if (!result) {
			result = new this(); result._promise = new $.Deferred();
			result.yukle()
				.then(() => { result._yuklendimi = true; const {_promise} = result; if (_promise) { _promise.resolve(result) } })
				.catch(ex => { result._yuklendimi = false; const {_promise} = result; if (_promise) { _promise.reject(ex) } })
			this._instance = result
		}
		return result
	}
	static yeniInstOlustur(e) { e = e || {}; const {args} = e; return new this(args) }
	async kaydet(e) {
		if (await this.varmi(e)) return this.degistir(e)
		return this.yaz(e)
	}
	async yaz(e) {
		e = e || {}; const keyHV = this.alternateKeyHostVars(e);
		if (!$.isEmptyObject(keyHV)) {
			const _e = $.extend({}, e, { keyHV }); const result = await this.varmi(_e);
			if (result) { throw { isError: true, rc: 'duplicateRecord', errorText: 'Kayıt tekrarlanıyor' } }
		}
		await this.yeniTanimOncesiIslemler(e); const hv = this.hostVars(e); if (!$.isEmptyObject(keyHV)) { $.extend(hv, keyHV) }
		const {table} = this.class; let query = new MQInsert({ table, hv });
		const {trnId} = e, {isOfflineMode} = this, dbMgr_db = app?.dbMgr?.default, _e = { trnId, query }; let result;
		if (dbMgr_db && isOfflineMode !== false) {
			try { result = await dbMgr_db.execute(_e) }
			catch (ex) { if (isOfflineMode === true || !navigator.onLine) { throw ex } }
		}
		if (result === undefined && isOfflineMode !== true) { result = await app.sqlExecNone(_e) }
		await this.yeniSonrasiIslemler(e); return result
	}
	async degistir(e) {
		e = e || {}; await this.degistirOncesiIslemler(e);
		const {table} = this.class, hv = this.hostVars(e), keyHV = this.keyHostVars($.extend({}, e, { varsayilanAlma: true }));
		let sent = new MQSent({ from: table, where: { birlestirDict: keyHV }, sahalar: '*' });
		const basRec = await app.sqlExecTekil(sent), degisenHV = degisimHV(hv, basRec);
		let result = true; if (!$.isEmptyObject(degisenHV)) {
			let query = new MQIliskiliUpdate({ from: table, where: { birlestirDict: keyHV }, set: { birlestirDict: degisenHV } });
			const {trnId} = e, {isOfflineMode} = this, dbMgr_db = app?.dbMgr?.default, _e = { trnId, query }; result = undefined;
			if (dbMgr_db && isOfflineMode !== false) {
				try { result = await dbMgr_db.execute(_e) }
				catch (ex) { if (isOfflineMode === true || !navigator.onLine) { throw ex } }
			}
			if (result === undefined && isOfflineMode !== true) { result = await app.sqlExecNone(_e) }
		}
		await this.degistirSonrasiIslemler(e); return result
	}
	async sil(e) {
		e = e || {}; const keyHV = this.alternateKeyHostVars(e); if ($.isEmptyObject(keyHV)) { return true }
		await this.silmeOncesiIslemler(e); const {table} = this.class; let query = new MQIliskiliDelete({ from: table, where: { birlestirDict: keyHV } });
		const {trnId} = e, {isOfflineMode} = this, dbMgr_db = app?.dbMgr?.default, _e = { trnId, query }; let result;
		if (dbMgr_db && isOfflineMode !== false) {
			try { result = await dbMgr_db.execute(_e) }
			catch (ex) { if (isOfflineMode === true || !navigator.onLine) { throw ex } }
		}
		if (result === undefined && isOfflineMode !== true) { result = await app.sqlExecNone(_e) }
		await this.silmeSonrasiIslemler(e); return result
	}
	async yukle(e) {
		e = e || {}; let {rec} = e;
		if (!rec) {
			rec = await this.tekilOku(e);
			const {params} = rec || {}; if (params) { const param = params.result ?? params.baslik ?? params.fis; if (params) { rec = params.value } }
			e.rec = rec
		} if (!rec) { return false }
		const basitFlag = e.basit ?? e.basitmi ?? e.basitFlag; if (!basitFlag) { await this.yukleSonrasiIslemler(e) }
		return true
	}
	yukleSonrasiIslemler(e) { this.setValues(e) }
	kopyaIcinDuzenle(e) { }
	async varmi(e) {
		let result = await this.varmiDogrudan(e); if (!result) return false
		// kod değeri varsa içeriksel kontrol yapılacak
		return result
	}
	async varmiDogrudan(e) {
		const kayitSayisi = await this.kayitSayisi(e); if (!kayitSayisi) { return false }
		if (kayitSayisi > 1) { return { isError: false, rc: 'multiRecord', errorText: 'Aynı özellikte birden çok kayıt geldi' } }
		return true
	}
	async kayitSayisi(e) {
		e = e || {}; let keyHV = e.keyHV || this.alternateKeyHostVars(e); if ($.isEmptyObject(keyHV)) { return 0 }
		const {table} = this.class; let query = new MQSent({ from: table, where: { birlestirDict: keyHV }, sahalar: 'COUNT(*) sayi' });
		const {trnId} = e, {isOfflineMode} = this, dbMgr_db = app?.dbMgr?.default, _e = { trnId, query }; let result;
		if (dbMgr_db && isOfflineMode !== false) {
			try { result = await dbMgr_db.execute(_e) }
			catch (ex) { if (isOfflineMode === true || !navigator.onLine) { throw ex } }
		}
		if (result === undefined && isOfflineMode !== true) { result = await app.sqlExecTekilDeger(_e) }
	}
	tekilOku(e) {
		e = e || {}; if (this.class.tekilOkuYapilazmi) { return e.rec ?? e._rec }
		e.query = this.tekilOku_queryOlustur(e); return this.class.tekilOku_querySonucu(e)
	}
	tekilOku_queryOlustur(e) {
		e = e || {}; const {tableAlias: alias, aliasVeNokta, tableAndAlias} = this.class;
		const sent = new MQSent({ from: tableAndAlias }); sent.sahalar.add(`${aliasVeNokta}*`);
		const keyHV = this.class.varsayilanKeyHostVars(e); if (keyHV) { sent.where.birlestirDict({ alias, dict: keyHV }) }
		sent.gereksizTablolariSil({ disinda: alias }); const stm = new MQStm({ sent }); $.extend(e, { stm, sent });
		this.tekilOku_queryDuzenle(e); return stm
	}
	tekilOku_queryDuzenle(e) { }
	static tekilOku_querySonucu(e) {
		e = e || {}; const sender = e.sender || e;
		const ozelQuerySonucuBlock = e.ozelQuerySonucuBlock || e.ozelQuerySonucu || sender.ozelQuerySonucuBlock || sender.ozelQuerySonucu;
		if (ozelQuerySonucuBlock) { return getFuncValue.call(this, ozelQuerySonucuBlock, e) }
		const {tekilOku_sqlBatchFlag: batch, wsArgs, query} = e; const _e = { batch, wsArgs, query };
		return this.tekilOku_querySonucu_returnValueGereklimi ? app.sqlExecNoneWithResult(_e) : app.sqlExecTekil(_e)
	}
	yeniTanimOncesiIslemler(e) { return this.yeniVeyaDegistirOncesiIslemler(e) } degistirOncesiIslemler(e) { return this.yeniVeyaDegistirOncesiIslemler(e) } silmeOncesiIslemler(e) { return this.kaydetOncesiIslemler(e) }
	kaydetOncesiIslemler(e) { }
	yeniSonrasiIslemler(e) { return this.yeniVeyaDegistirSonrasiIslemler(e) }
	degistirSonrasiIslemler(e) { return this.yeniVeyaDegistirSonrasiIslemler(e) }
	silmeSonrasiIslemler(e) { /* return this.kaydetSonrasiIslemler(e) */ }
	yeniVeyaDegistirOncesiIslemler(e) { return this.kaydetOncesiIslemler(e) }
	yeniVeyaDegistirSonrasiIslemler(e) { return this.kaydetSonrasiIslemler(e) }
	degistirSonrasiIslemler(e) { return this.kaydetSonrasiIslemler(e) }
	kaydetSonrasiIslemler(e) { }
	static varsayilanKeyHostVars(e) { const hv = {}; this.varsayilanKeyHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	static varsayilanKeyHostVarsDuzenle(e) { }
	keyHostVars(e) { const hv = {}; this.keyHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	keyHostVarsDuzenle(e) { e = e || {}; if (!e.varsayilanAlma) { this.class.varsayilanKeyHostVarsDuzenle(e) } }
	alternateKeyHostVars(e) {
		let hv = {}; const _e = $.extend({}, e, { hv }); this.class.varsayilanKeyHostVarsDuzenle(_e);
		let _hv = {}; this.alternateKeyHostVarsDuzenle(_e);
		if ($.isEmptyObject(_hv)) { _hv = this.keyHostVars(e) }
		$.extend(_hv, _e.hv); if (!$.isEmptyObject(_hv)) { $.extend(hv, _hv) }
		return hv
	}
	alternateKeyHostVarsDuzenle(e) { }
	hostVars(e) { const hv = super.hostVars(e); return hv }
	hostVarsDuzenle(e) { /* this.keyHostVarsDuzenle(e); */ this.alternateKeyHostVarsDuzenle(e) }
	keySetValues(e) { }
	setValues(e) { this.keySetValues(e); super.setValues(e) }
}
