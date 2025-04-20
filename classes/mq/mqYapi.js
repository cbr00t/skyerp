class MQYapi extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get mqYapimi() { return true }
	static get isOfflineMode() { return app.offlineMode } get isOfflineMode() { return this.class.isOfflineMode }
	static get dbMgr_db() { return app?.dbMgr?.default } get dbMgr_db() { return this.class.dbMgr_db }
	static get sinifAdi() { return null } static get table() { return null } static get tableAlias() { return null } static get idSaha() { return this.sayacSaha ?? this.kodSaha }
	static get tableAndAlias() { const {table, tableAlias} = this; if (tableAlias) { return `${table} ${tableAlias}` } return table }
	static get aliasVeNokta() { const {tableAlias} = this; if (tableAlias) { return `${tableAlias}.` } return '' }
	static get silinebilirmi() { return false } static get tekilOku_querySonucu_returnValueGereklimi() { return false }
	static get tekilOku_sqlBatchFlag() { return true } static get tekilOkuYapilazmi() { return false }
	static get gonderildiDesteklenirmi() { return false } static get gonderimTSSaha() { return 'gonderimts' }
	static get offlineSahaListe() { return new this().offlineSahaListe } get offlineSahaListe() { return Object.keys(this.hostVars() ?? {}) }
	static get logRecDonusturucu() { let e = { result: {} }; this.logRecDonusturucuDuzenle(e); return e.result }
	get logHV() { let e = { hv: {} }; this.logHVDuzenle(e); return e.hv }

	constructor(e) { e = e || {}; super(e) }
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
	static yeniInstOlustur(e) { e = e || {}; const {args} = e; return new this(args) }
	async kaydet(e) { return await this.varmi(e) ? await this.degistir(e) : await this.yaz(e) }
	async yaz(e) {
		e = e || {}; const keyHV = this.alternateKeyHostVars(e);
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId };
		if (!$.isEmptyObject(keyHV)) {
			$.extend(_e, { keyHV }); const result = await this.varmi(_e); delete _e.keyHV;
			if (result) { throw { isError: true, rc: 'duplicateRecord', errorText: 'Kayıt tekrarlanıyor' } }
		}
		await this.yeniOncesiIslemler(e); const hv = this.hostVars(e); if (!$.isEmptyObject(keyHV)) { $.extend(hv, keyHV) }
		const {table} = this.class; let query = _e.query = new MQInsert({ table, hv });
		let result = await this.sqlExecNone(_e); await this.yeniSonrasiIslemler({ ...e, ..._e }); return result
	}
	async degistir(e) {
		e = e || {}; e = e || {}; if (!$.isPlainObject(e)) { e = { islem: 'degistir', eskiInst: e } } await this.degistirOncesiIslemler(e);
		const {table} = this.class; let keyHV = this.keyHostVars({ ...e, varsayilanAlma: true }) ?? {};
		let altKeyHV = this.alternateKeyHostVars({ ...e, varsayilanAlma: true }); if (!$.isEmptyObject(altKeyHV)) { $.extend(keyHV, altKeyHV) }
		let sent = new MQSent({ from: table, where: { birlestirDict: keyHV }, sahalar: '*' });
		const basRec = await this.sqlExecTekil(sent), hv = this.hostVars(e), degisenHV = degisimHV(hv, basRec);
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId }; 
		let result = true; if (!$.isEmptyObject(degisenHV)) {
			let query = _e.query = new MQIliskiliUpdate({ from: table, where: { birlestirDict: keyHV }, set: { birlestirDict: degisenHV } });
			result = await this.sqlExecNone(_e)
		}
		await this.degistirSonrasiIslemler({ ...e, ..._e }); return result
	}
	async sil(e) {
		e = e || {}; let keyHV = this.keyHostVars({ ...e, varsayilanAlma: true }) ?? {};
		let altKeyHV = this.alternateKeyHostVars({ ...e, varsayilanAlma: true }); if (!$.isEmptyObject(altKeyHV)) { $.extend(keyHV, altKeyHV) }
		if ($.isEmptyObject(keyHV)) { return true }
		await this.silmeOncesiIslemler(e); const {table} = this.class; let query = new MQIliskiliDelete({ from: table, where: { birlestirDict: keyHV } });
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId, query }; let result = await this.sqlExecNone(_e);
		await this.silmeSonrasiIslemler({ ...e, ..._e }); return result
	}
	async getInstance_yukleIslemi(e) { return await this.yukle(e) }
	async yukle(e) {
		e = e || {}; let {rec} = e; e.orjRec = rec;
		if (!rec) {
			rec = await this.tekilOku(e); let {params} = rec || {};
			if (params) {
				let param = params.result ?? params.baslik ?? params.fis;
				if (params) { rec = params.value }
			}
			e.rec = rec
		}
		if (!rec) { return false }
		let basitFlag = e.basit ?? e.basitmi ?? e.basitFlag;
		if (!basitFlag) { await this.yukleSonrasiIslemler(e) }
		return true
	}
	kopyaIcinDuzenle(e) { }
	async varmi(e) {
		let result = await this.varmiDogrudan(e); if (!result) { return false } /* kod değeri varsa içeriksel kontrol yapılacak */
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
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId, query };
		let result = await this.sqlExecTekilDeger(_e); return result
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
		e = e || {}; const sender = e.sender || e, ozelQuerySonucuBlock = e.ozelQuerySonucuBlock || e.ozelQuerySonucu || sender.ozelQuerySonucuBlock || sender.ozelQuerySonucu;
		const {trnId, tekilOku_sqlBatchFlag: batch, wsArgs, query} = e, {tekilOku_querySonucu_returnValueGereklimi} = this;
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, _e = { offlineMode, batch, trnId, wsArgs, query };
		if (ozelQuerySonucuBlock) { return getFuncValue.call(this, ozelQuerySonucuBlock, _e) }
		return this[tekilOku_querySonucu_returnValueGereklimi ? 'sqlExecNoneWithResult' : 'sqlExecTekil'](_e)
	}
	async yeniTanimOncesiIslemler(e) { await this.yeniTanimOncesiVeyaYukleSonrasiIslemler(e) } 
	async yukleSonrasiIslemler(e) { let results = [await this.setValues(e), await this.yeniTanimOncesiVeyaYukleSonrasiIslemler(e)]; return results.filter(x => !!x)[0] }
	async yeniTanimOncesiVeyaYukleSonrasiIslemler(e) { }
	yeniOncesiIslemler(e) { return this.kaydetOncesiIslemler(e) }
	degistirOncesiIslemler(e) { return this.kaydetOncesiIslemler(e) }
	silmeOncesiIslemler(e) { return this.kaydetVeyaSilmeOncesiIslemler(e) }
	async kaydetOncesiIslemler(e) {
		e = e ?? {}; await this.kaydetVeyaSilmeOncesiIslemler(e);
		const {islem} = e; if (islem == 'degistir') {
			const {isOfflineMode, gonderildiDesteklenirmi, gonderimTSSaha} = this.class;
			if (isOfflineMode && gonderildiDesteklenirmi && gonderimTSSaha) {
				let keyHV = this.alternateKeyHostVars(e); if ($.isEmptyObject(keyHV)) { keyHV = this.keyHostVars(e) } if (!$.isEmptyObject(keyHV)) {
					const {table} = this.class, {trnId} = e; let query = new MQSent({ from: table, where: [`${gonderimTSSaha} <> ''`, { birlestirDict: keyHV }], sahalar: 'count(*) sayi' });
					let _e = { trnId, isOfflineMode, query }; let result = await this.sqlExecTekilDeger(_e);
					if (!!result) { throw { isError: true, errorText: 'Bu kayıt merkeze gönderildiği için üzerinde değişiklik yapılamaz' } }
				}
			}
		}
	}
	kaydetVeyaSilmeOncesiIslemler(e) { }
	yeniSonrasiIslemler(e) { return this.kaydetSonrasiIslemler(e) }
	degistirSonrasiIslemler(e) { return this.kaydetSonrasiIslemler(e) }
	silmeSonrasiIslemler(e) { return this.kaydetVeyaSilmeSonrasiIslemler(e) }
	kaydetSonrasiIslemler(e) { return this.kaydetVeyaSilmeSonrasiIslemler(e) }
	kaydetVeyaSilmeSonrasiIslemler(e) { }
	static async logKaydet(e) {
		e = e ?? {}; let {
			sent: _sent, where, wh, degisenler, adimBelirtec, tableVeAlias, tabloVeAlias, table, alias,
			duzenle, logRecDonusturucu, duzenleyici
		} = e;
		degisenler = degisenler ?? []; adimBelirtec = adimBelirtec ?? this.kodListeTipi;
		where = where ?? wh ?? _sent?.where; duzenleyici = duzenleyici ?? duzenle; tableVeAlias = tableVeAlias ?? tabloVeAlias;
		table = table ?? tableVeAlias?.table ?? this.table; let tAlias = (alias ?? tableVeAlias?.alias ?? this.tableAlias) || 't';
		logRecDonusturucu = logRecDonusturucu ?? this.logRecDonusturucu;
		let sent = new MQSent({ from: `${table} ${tAlias}`, where }), {sahalar} = sent;
		sahalar.add(`${table.sqlServerDegeri()} tablo`);
		let _e = { ...e, sent, where, table, alias: tAlias }; duzenleyici.call(this, _e);
		sent = _e.sent; sahalar = sent.sahalar;
		sent.gereksizTablolariSilDisinda({ disindaSet: tAlias });
		let {alias2Deger} = sent, sahaAdiSet = asSet(Object.values(sent.alias2Deger));
		for (let [buAttr, logAttr] of Object.entries(logRecDonusturucu)) {
			if (sahaAdiSet[logAttr]) { continue }
			sahalar.add(`${tAlias}.${buAttr} ${logAttr}`)
		}
		let ins = _e.ins = new MQSelect2Insert({ table, sent });
		$.extend(_e, { degisenler: degisenler.map(x => x.replaceAll(' ', '_')) })
		this.logInsertDuzenle(_e); ins = _e.ins;
		return await app.sqlExecNone(ins)
	}
	logKaydet(e) { return this.class.logKaydet(e) }
	static logInsertDuzenle(e) { }
	static logRecDonusturucuDuzenle(e) { }
	logHVDuzenle(e) { }
	static varsayilanKeyHostVars(e) { const hv = {}; this.varsayilanKeyHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	static varsayilanKeyHostVarsDuzenle(e) { }
	keyHostVars(e) { const hv = {}; this.keyHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	keyHostVarsDuzenle(e) { e = e || {}; if (!e.varsayilanAlma) { this.class.varsayilanKeyHostVarsDuzenle(e) } }
	alternateKeyHostVars(e) {
		const _e = { ...e, hv: {} }; this.class.varsayilanKeyHostVarsDuzenle(_e); let hv = _e.hv;
		_e.hv = {}; this.alternateKeyHostVarsDuzenle(_e); let _hv = _e.hv;
		if ($.isEmptyObject(_hv)) { _hv = _e.hv = this.keyHostVars(e) }
		if (!$.isEmptyObject(_hv)) { $.extend(hv, _hv) }
		return hv
	}
	alternateKeyHostVarsDuzenle(e) { }
	hostVars(e) { const hv = super.hostVars(e); return hv }
	hostVarsDuzenle(e) { /* this.keyHostVarsDuzenle(e); */ this.alternateKeyHostVarsDuzenle(e) }
	keySetValues(e) { }
	setValues(e) { this.keySetValues(e); super.setValues(e) }
	static sqlExecNone(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecNone' }) }
	static sqlExecNoneWithResult(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecNoneWithResult' }) }
	static sqlExecSelect(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecSelect' }) }
	static sqlExecTekil(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecTekil' }) }
	static sqlExecTekilDeger(e, params) {  e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecTekilDeger' }) }
	sqlExecNone(e, params) {  e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecNone' }) }
	sqlExecNoneWithResult(e, params) {  e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecNoneWithResult' }) }
	sqlExecSelect(e, params) {  e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecSelect' }) }
	sqlExecTekil(e, params) {  e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecTekil' }) }
	sqlExecTekilDeger(e, params) {  e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecTekilDeger' }) }
	static gonderildiIsaretiKoy(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: true }) }
	static gonderildiIsaretiKaldir(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: false }) }
	static async gonderildiIsaretiKoyKaldir(e) {
		e = e ?? {}; const {gonderildiDesteklenirmi, gonderimTSSaha} = this, {keyHV, flag} = e;
		if (!(flag != null && gonderildiDesteklenirmi && gonderimTSSaha && !$.isEmptyObject(keyHV))) { return false }
		const {table} = this; let query = new MQIliskiliUpdate({
			from: table, where: { birlestirDict: keyHV }, set: { degerAta: flag ? asReverseDateTimeString(now()) : '', saha: gonderimTSSaha } });
		let _e = { ...e, isOfflineMode: true, query }; await this.sqlExecNone(_e); return true
	}
	gonderildiIsaretiKoy(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: true }) }
	gonderildiIsaretiKaldir(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: false }) }
	gonderildiIsaretiKoyKaldir(e) {
		e = e ?? {}; let keyHV = e.keyHV ?? this.alternateKeyHostVars(e); if ($.isEmptyObject(keyHV)) { keyHV = this.keyHostVars(e) }
		return this.class.gonderildiIsaretiKoyKaldir({ ...e, keyHV })
	}
	static async offlineDropTable(e) {
		e = e ?? {}; if (!this.dbMgr_db) { return false } const offlineTable = e.table ?? e.offlineTable ?? this.table; if (!offlineTable) { return false }
		let offlineMode = true; let query = `DROP TABLE IF EXISTS ${offlineTable}`; return this.sqlExecNone({ ...e, offlineMode, query })
	}
	static async offlineClearTable(e) {
		e = e ?? {}; if (!this.dbMgr_db) { return false } const offlineTable = e.table ?? e.offlineTable ?? this.table; if (!offlineTable) { return false }
		let {trnId} = e, offlineMode = e.offline ?? e.offlineMode ?? true;
		let query = new MQIliskiliDelete({ from: offlineTable }); return this.sqlExecNone({ ...e, offlineMode, trnId, query })
	}
	static async offlineSaveToLocalTable(e) {
		e = e ?? {}; if (!this.dbMgr_db) { return false } const offlineTable = e.table ?? e.offlineTable ?? this.table; if (!offlineTable) { return this }
		const {idSaha, gonderildiDesteklenirmi, gonderimTSSaha} = this, clear = e.clear ?? e.clearFlag;
		const offlineMode = true, {trnId} = e; const recs = await this.loadServerData({ ...e, trnId, offlineMode: !offlineMode, offlineYukleRequest: true });
		const {offlineSahaListe: attrListe, kodKullanilirmi, kodSaha} = this; let inLocalTrn = false, directFlag = true, okIdList = [];
		try { await this.sqlExecNone({ ...e, offlineMode, query: 'BEGIN TRANSACTION' }); inLocalTrn = true } catch (ex) { }
		try {
			let templateInst = new this(), keyHV;
			if (!templateInst.detaymi) { keyHV = templateInst.alternateKeyHostVars(e); if ($.isEmptyObject(keyHV)) { keyHV = templateInst.keyHostVars(e) } }
			if (clear) { this.offlineClearTable({ ...e, offlineMode }) }; 
			if (kodKullanilirmi && kodSaha) { let hv = {}; hv[kodSaha] = ''; await this.sqlExecNone({ ...e, offlineMode, query: new MQInsert({ table: offlineTable, hv }) }) }
			if (attrListe?.length) {
				if (directFlag) { if (recs?.length) {
					const attrSet = asSet(attrListe), hvListe = []; for (const rec of recs) {
						const hv = {}; let empty = true; for (const key in rec) {
							if (!attrSet[key]) { continue } let value = rec[key]; if (typeof value == 'string') { value = value.trimEnd() }
							hv[key] = value; empty = false
						} if (!empty) { hvListe.push(hv) }
					}
					let query = new MQInsert({ table: offlineTable, hvListe }); if (!await this.sqlExecNone({ ...e, offlineMode, query })) { return this }
					if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha) { okIdList.push(recs.map(rec => rec[idSaha])) }
				} }
				else { if (recs?.length) {
					for (const rec of recs) {
						let inst = new this(); if (!await inst.yukle({ offlineMode: !offlineMode, rec })) { continue }
						if (!await inst.yaz({ offlineMode })) { continue }
						if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha) { okIdList.push(rec[idSaha]) }
					}
				} }
			}
		}
		finally {
			if (okIdList?.length) {
				let query = new MQIliskiliUpdate({ from: offlineTable, where: { inDizi: okIdList, saha: idSaha }, set: { degerAta: asReverseDateTimeString(now()), saha: gonderimTSSaha } });
				await this.sqlExecNone({ trnId, offlineMode, query })
			}
			if (inLocalTrn) { await this.sqlExecNone({ ...e, offlineMode, query: 'COMMIT' }) } 
		}
		return this
	}
	static async offlineSaveToRemoteTable(e) {
		e = e ?? {}; if (!this.dbMgr_db) { return false } const offlineTable = e.table ?? e.offlineTable ?? this.table; if (!offlineTable) { return this }
		const {offlineSahaListe: attrListe, idSaha, gonderildiDesteklenirmi, gonderimTSSaha} = this;
		const offlineMode = false, offlineGonderRequest = true, {trnId} = e; const recs = await this.loadServerData({ ...e, offlineMode: !offlineMode, offlineGonderRequest });
		if (attrListe?.length) {
			let directFlag = !idSaha, okIdList = []; app.online();
			try {
				if (directFlag) { if (recs?.length) {
					const attrSet = asSet(attrListe), hvListe = []; for (const rec of recs) {
						const hv = {}; let empty = true; for (const key in rec) {
							if (!attrSet[key]) { continue } let value = rec[key]; if (typeof value == 'string') { value = value.trimEnd() }
							hv[key] = value; empty = false
						} if (!empty) { hvListe.push(hv) }
					}
					let query = new MQInsert({ table: offlineTable, hvListe }); if (!await this.sqlExecNone({ ...e, trnId, offlineMode, query })) { return this }
					if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha) { okIdList.push(recs.map(rec => rec[idSaha])) }
				} }
				else { if (recs?.length) {
					for (const rec of recs) {
						let inst = new this(); if (!await inst.yukle({ offlineMode: !offlineMode, rec, offlineGonderRequest })) { continue }
						if (inst.sayac) { inst.sayac = null }
						if (await inst.varmi({ trnId, offlineMode, offlineGonderRequest })) { continue }
						if (!await inst.yaz({ trnId, offlineMode, offlineGonderRequest })) { continue }
						if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha) { okIdList.push(rec[idSaha]) }
					}
				} }
			}
			finally {
				if (okIdList?.length) {
					let query = new MQIliskiliUpdate({ from: offlineTable, where: { inDizi: okIdList, saha: idSaha }, set: { degerAta: asReverseDateTimeString(now()), saha: gonderimTSSaha } });
					await this.sqlExecNone({ trnId, offlineMode: !offlineMode, query })
				}
				app.resetOfflineStatus()
			}
		}
		return this
	}
	static offlineSaveToLocalTableWithClear(e) { e = e ?? {}; return this.offlineSaveToLocalTable({ ...e, clear: true }) }
	static offlineSaveToRemoteTableWithClear(e) { e = e ?? {}; return this.offlineSaveToRemoteTable({ ...e, clear: true }) }
	static _sqlExec(e, params) {
		e = $.isPlainObject(e) ? e ?? {} : { query: e, params }; e = { ...e };
		const {selector} = e, offlineMode = e.isOfflineMode ?? e.offlineMode ?? e.isOffline ?? e.offline ?? this.isOfflineMode, db = e.db ?? app.dbMgr?.default;
		for (const key of ['selector', 'db', 'isOfflineMode', 'offlineMode', 'isOffline', 'offline']) { delete e[key] }
		let result = offlineMode && db ? db.execute(e) : app[selector](e); if (offlineMode) {
			switch (selector) {
				case 'sqlExecNone': result = { lastRowsAffected: db.internalDB.getRowsModified() }; break
				case 'sqlExecTekil': result = result?.[0]; break
				case 'sqlExecTekilDeger': result = Object.values(result?.[0] ?? {})[0]; if (typeof result == 'string') { result = result.trimEnd() } break
			}
		}
		return result
	}
	_sqlExec(e, _params) {
		e = $.isPlainObject(e) ? e : { query: e, params: _params }; const offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.isOffline ?? e.offline ?? this.isOfflineMode;
		const {selector, db, trnId, query, params, deferFlag, batch} = e;
		return this.class._sqlExec({ selector, db, offlineMode, trnId, query, params, deferFlag, batch })
	}
}
