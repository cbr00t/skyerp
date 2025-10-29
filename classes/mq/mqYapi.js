class MQYapi extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get mqYapimi() { return true }
	static get isOfflineMode() { return app.offlineMode } get isOfflineMode() { return this.class.isOfflineMode }
	static get dbMgr_db() { return app?.dbMgr?.default } get dbMgr_db() { return this.class.dbMgr_db }
	static get sinifAdi() { return null } static get table() { return null } static get tableAlias() { return null } static get idSaha() { return this.sayacSaha ?? this.kodSaha }
	static get tableAndAlias() { let {table, tableAlias} = this; if (tableAlias) { return `${table} ${tableAlias}` } return table }
	static get aliasVeNokta() { let {tableAlias} = this; if (tableAlias) { return `${tableAlias}.` } return '' }
	static get silinebilirmi() { return false } static get tekilOku_querySonucu_returnValueGereklimi() { return false }
	static get tekilOku_sqlBatchFlag() { return true } static get tekilOkuYapilazmi() { return false }
	static get gonderildiDesteklenirmi() { return false } static get gonderimTSSaha() { return 'gonderimts' }
	static get offlineSahaListe() { return new this().offlineSahaListe }
	get offlineSahaListe() { return Object.keys(this.hostVars() ?? {}) }
	static get logKullanilirmi() { return true } static get logAnaTip() { return 'K' }
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
	static yeniInstOlustur(e) { e = e || {}; let {args} = e; return new this(args) }
	async kaydet(e) { return await this.varmi(e) ? await this.degistir(e) : await this.yaz(e) }
	async yaz(e) {
		e = e || {}; let keyHV = this.alternateKeyHostVars(e);
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId };
		if (!$.isEmptyObject(keyHV)) {
			$.extend(_e, { keyHV }); let result = await this.varmi(_e); delete _e.keyHV;
			if (result) { throw { isError: true, rc: 'duplicateRecord', errorText: 'Kayıt tekrarlanıyor' } }
		}
		await this.yeniOncesiIslemler(e); let hv = this.hostVars(e); if (!$.isEmptyObject(keyHV)) { $.extend(hv, keyHV) }
		let {table} = this.class; let query = _e.query = new MQInsert({ table, hv });
		let result = await this.sqlExecNone(_e); await this.yeniSonrasiIslemler({ ...e, ..._e }); return result
	}
	async degistir(e) {
		e = e || {}; e = e || {}; if (!$.isPlainObject(e)) { e = { islem: 'degistir', eskiInst: e } } await this.degistirOncesiIslemler(e);
		let {table} = this.class; let keyHV = this.keyHostVars({ ...e, varsayilanAlma: true }) ?? {};
		let altKeyHV = this.alternateKeyHostVars({ ...e, varsayilanAlma: true }); if (!$.isEmptyObject(altKeyHV)) { $.extend(keyHV, altKeyHV) }
		let sent = new MQSent({ from: table, where: { birlestirDict: keyHV }, sahalar: '*' });
		let basRec = await this.sqlExecTekil(sent), hv = this.hostVars(e), degisenHV = degisimHV(hv, basRec);
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId }; 
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
		await this.silmeOncesiIslemler(e); let {table} = this.class; let query = new MQIliskiliDelete({ from: table, where: { birlestirDict: keyHV } });
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId, query }; let result = await this.sqlExecNone(_e);
		await this.silmeSonrasiIslemler({ ...e, ..._e }); return result
	}
	static async oku(e) {
		let inst = new this(e);
		return await inst.oku(e)
	}
	async oku(e) {
		if (!await this.yukle(e)) { return null }
		return this
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
		let kayitSayisi = await this.kayitSayisi(e); if (!kayitSayisi) { return false }
		if (kayitSayisi > 1) { return { isError: false, rc: 'multiRecord', errorText: 'Aynı özellikte birden çok kayıt geldi' } }
		return true
	}
	async kayitSayisi(e) {
		e = e || {}; let keyHV = e.keyHV || this.alternateKeyHostVars(e); if ($.isEmptyObject(keyHV)) { return 0 }
		let {table} = this.class; let query = new MQSent({ from: table, where: { birlestirDict: keyHV }, sahalar: 'COUNT(*) sayi' });
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId, query };
		let result = await this.sqlExecTekilDeger(_e); return result
	}
	tekilOku(e) {
		e = e || {}; if (this.class.tekilOkuYapilazmi) { return e.rec ?? e._rec }
		e.query = this.tekilOku_queryOlustur(e); return this.class.tekilOku_querySonucu(e)
	}
	tekilOku_queryOlustur(e) {
		e = e || {}; let {tableAlias: alias, aliasVeNokta, tableAndAlias} = this.class;
		let sent = new MQSent({ from: tableAndAlias }); sent.sahalar.add(`${aliasVeNokta}*`);
		let keyHV = this.class.varsayilanKeyHostVars(e); if (keyHV) { sent.where.birlestirDict({ alias, dict: keyHV }) }
		sent.gereksizTablolariSil({ disinda: alias }); let stm = new MQStm({ sent }); $.extend(e, { stm, sent });
		this.tekilOku_queryDuzenle(e); return stm
	}
	tekilOku_queryDuzenle(e) { }
	static tekilOku_querySonucu(e) {
		e = e || {}; let sender = e.sender || e, ozelQuerySonucuBlock = e.ozelQuerySonucuBlock || e.ozelQuerySonucu || sender.ozelQuerySonucuBlock || sender.ozelQuerySonucu;
		let {trnId, tekilOku_sqlBatchFlag: batch, wsArgs, query} = e, {tekilOku_querySonucu_returnValueGereklimi} = this;
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, _e = { offlineMode, batch, trnId, wsArgs, query };
		if (ozelQuerySonucuBlock) { return getFuncValue.call(this, ozelQuerySonucuBlock, _e) }
		return this[tekilOku_querySonucu_returnValueGereklimi ? 'sqlExecNoneWithResult' : 'sqlExecTekil'](_e)
	}
	async yeniTanimOncesiIslemler(e) { await this.yeniTanimOncesiVeyaYukleSonrasiIslemler(e) } 
	async yukleSonrasiIslemler(e) {
		let results = [await this.setValues(e), await this.yeniTanimOncesiVeyaYukleSonrasiIslemler(e)];
		return results.filter(x => !!x)[0]
	}
	async yeniTanimOncesiVeyaYukleSonrasiIslemler(e) { }
	yeniOncesiIslemler(e) { return this.kaydetOncesiIslemler(e) }
	degistirOncesiIslemler(e) { return this.kaydetOncesiIslemler(e) }
	silmeOncesiIslemler(e) { return this.kaydetVeyaSilmeOncesiIslemler(e) }
	async kaydetOncesiIslemler(e) {
		e = e ?? {}; await this.kaydetVeyaSilmeOncesiIslemler(e);
		let {islem} = e; if (islem == 'degistir') {
			let {isOfflineMode, gonderildiDesteklenirmi, gonderimTSSaha} = this.class;
			if (isOfflineMode && gonderildiDesteklenirmi && gonderimTSSaha) {
				let keyHV = this.alternateKeyHostVars(e); if ($.isEmptyObject(keyHV)) { keyHV = this.keyHostVars(e) }
				if (!$.isEmptyObject(keyHV)) {
					let {table} = this.class, {trnId} = e;
					let query = new MQSent({ from: table, where: [`${gonderimTSSaha} <> ''`, { birlestirDict: keyHV }], sahalar: 'count(*) sayi' });
					let _e = { trnId, isOfflineMode, query }; let result = await this.sqlExecTekilDeger(_e);
					if (!!result) { throw { isError: true, errorText: 'Bu kayıt merkeze gönderildiği için üzerinde değişiklik yapılamaz' } }
				}
			}
		}
	}
	kaydetVeyaSilmeOncesiIslemler(e) { }
	yeniSonrasiIslemler(e) { e ??= {}; e.islem ||= 'yeni'; return this.kaydetSonrasiIslemler(e) }
	degistirSonrasiIslemler(e) { e ??= {}; e.islem ||= 'degistir'; return this.kaydetSonrasiIslemler(e) }
	kaydetSonrasiIslemler(e) { e ??= {}; return this.kaydetVeyaSilmeSonrasiIslemler(e) }
	silmeSonrasiIslemler(e) { e ??= {}; e.islem ||= 'sil'; return this.kaydetVeyaSilmeSonrasiIslemler(e) }
	kaydetVeyaSilmeSonrasiIslemler({ islem, fis, trn } = {}) {
		fis ??= this; let {class: fisSinif} = fis;
		let {sinifAdi, kodListeTipi, name: className} = fisSinif;
		sinifAdi ||= kodListeTipi || className;
		islem = (islem ?? 'd')[0].toUpperCase();
		let degisenler = [`SkyERP:${sinifAdi}`];
		let keyTimer = '_timer_logKaydet';
		clearTimeout(fisSinif[keyTimer]);
		fisSinif[keyTimer] = setTimeout(async () => {
			try { await fis.logKaydet({ islem, degisenler }) }
			finally { delete fisSinif[keyTimer] }
		}, 10);
		return delay(20)
	}
	static async logKaydet(e) {
		if (!this.logKullanilirmi) { return true }
		e = e ?? {}; let {
			sent: _sent, where, wh, adimBelirtec, logAnaTip, islem, degisenler,
			tableVeAlias, tabloVeAlias, table, alias, logHV, /*logRecDonusturucu,*/
			duzenle, duzenleyici, trn
		} = e, {user: loginUser} = config.session;
		islem ??= ''; adimBelirtec ??= this.kodListeTipi; logAnaTip ??= this.logAnaTip;
		degisenler = degisenler?.map(x => x.replaceAll(' ', '_')) ?? [];
		where = where ?? wh ?? _sent?.where; table ??= tableVeAlias?.table ?? this.table;
		tableVeAlias ??= tabloVeAlias; duzenleyici ??= duzenle;
		let tAlias = (alias ?? tableVeAlias?.alias ?? this.tableAlias) || 't';
		// logRecDonusturucu ??= this.logRecDonusturucu;
		let sysInfo = app._sysInfo ??= await app.sysInfo();
		let {computerName, userName, ip} = sysInfo ?? {};
		let _e = { ...e, /*logRecDonusturucu,*/ degisenler }, hv = _e.hv = {
			islem, adimbelirtec: adimBelirtec.slice(0, 10),
			kullanici: loginUser?.slice(0, 20),
			terminal: [ip || '', computerName || '', userName || ''].join('_'),
			anatip: logAnaTip, tablo: table, ...logHV,
			xdegisenler: degisenler.join('_').slice(0, 400)
		};
		duzenleyici?.call(this, _e); hv = _e.hv;
		await this.logHVDuzenle(_e); hv = _e.hv;
		let ins = _e.ins = new MQInsert({ table: 'vtlog', hv });
		await this.logInsertDuzenle(_e); ins = _e.ins;
		return await app.sqlExecNone({ query: ins, trn })
	}
	logKaydet(e) {
		e = e ?? {}; let logHV = e.logHV ?? this.logHV;
		return this.class.logKaydet({ ...e, logHV })
	}
	static logHVDuzenle({ hv }) { }
	static logInsertDuzenle(e) { }
	static logRecDonusturucuDuzenle(e) { }
	logHVDuzenle(e) { }
	static varsayilanKeyHostVars(e) { let hv = {}; this.varsayilanKeyHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	static varsayilanKeyHostVarsDuzenle(e) { }
	keyHostVars(e) { let hv = {}; this.keyHostVarsDuzenle($.extend({}, e, { hv })); return hv }
	keyHostVarsDuzenle(e) { e = e || {}; if (!e.varsayilanAlma) { this.class.varsayilanKeyHostVarsDuzenle(e) } }
	alternateKeyHostVars(e) {
		let _e = { ...e, hv: {} }; this.class.varsayilanKeyHostVarsDuzenle(_e); let hv = _e.hv;
		_e.hv = {}; this.alternateKeyHostVarsDuzenle(_e); let _hv = _e.hv;
		if ($.isEmptyObject(_hv)) { _hv = _e.hv = this.keyHostVars(e) }
		if (!$.isEmptyObject(_hv)) { $.extend(hv, _hv) }
		return hv
	}
	alternateKeyHostVarsDuzenle(e) { }
	hostVars(e) { let hv = super.hostVars(e); return hv }
	hostVarsDuzenle(e) { /* this.keyHostVarsDuzenle(e); */ this.alternateKeyHostVarsDuzenle(e) }
	keySetValues(e) { }
	setValues(e) { this.keySetValues(e); super.setValues(e) }
	inExp_hostVarsDuzenle(e) { $.extend(e.hv, this.hostVars(e)) }
	inExp_setValues(e) { this.setValues(e) }
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
		e = e ?? {}; let {gonderildiDesteklenirmi, gonderimTSSaha} = this, {keyHV, flag} = e;
		if (!(flag != null && gonderildiDesteklenirmi && gonderimTSSaha && !$.isEmptyObject(keyHV))) { return false }
		let {table} = this; let query = new MQIliskiliUpdate({
			from: table, where: { birlestirDict: keyHV }, set: { degerAta: flag ? asReverseDateTimeString(now()) : '', saha: gonderimTSSaha } });
		let _e = { ...e, isOfflineMode: true, query }; await this.sqlExecNone(_e); return true
	}
	gonderildiIsaretiKoy(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: true }) }
	gonderildiIsaretiKaldir(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: false }) }
	gonderildiIsaretiKoyKaldir(e = {}) {
		let keyHV = e.keyHV ?? this.alternateKeyHostVars(e)
		if (empty(keyHV)) { keyHV = this.keyHostVars(e) }
		return this.class.gonderildiIsaretiKoyKaldir({ ...e, keyHV })
	}
	static async offlineDropTable(e) {
		e = e ?? {}; if (!this.dbMgr_db) { return false } let offlineTable = e.table ?? e.offlineTable ?? this.table; if (!offlineTable) { return false }
		let offlineMode = true; let query = `DROP TABLE IF EXISTS ${offlineTable}`; return this.sqlExecNone({ ...e, offlineMode, query })
	}
	static async offlineClearTable(e) {
		e = e ?? {}; if (!this.dbMgr_db) { return false } let offlineTable = e.table ?? e.offlineTable ?? this.table; if (!offlineTable) { return false }
		let {trnId} = e, offlineMode = e.offline ?? e.offlineMode ?? true;
		let query = new MQIliskiliDelete({ from: offlineTable }); return this.sqlExecNone({ ...e, offlineMode, trnId, query })
	}
	static async offlineSaveToLocalTable(e = {}) {
		if (!this.dbMgr_db)
			return false
		let offlineTable = e.table ?? e.offlineTable ?? this.table
		if (!offlineTable)
			return this
		let {idSaha, gonderildiDesteklenirmi, gonderimTSSaha} = this, clear = e.clear ?? e.clearFlag
		let {trnId} = e, offlineMode = true, offlineRequest = true, offlineYukleRequest = true
		let recs = await this.loadServerData({ ...e, trnId, offlineMode: !offlineMode, offlineRequest, offlineYukleRequest })
		let {offlineSahaListe: attrListe, kodKullanilirmi, kodSaha} = this
		let inLocalTrn = false, directFlag = true, okIdList = []
		try {
			await this.sqlExecNone({ ...e, offlineMode, query: 'BEGIN TRANSACTION' })
			inLocalTrn = true
		}
		catch (ex) { }
		try {
			let templateInst = new this()
			if (!templateInst.detaymi) {
				let keyHV = templateInst.alternateKeyHostVars(e)
				if (empty(keyHV))
					keyHV = templateInst.keyHostVars(e)
			}
			if (clear)
				this.offlineClearTable({ ...e, offlineMode })
			if (kodKullanilirmi && kodSaha) {
				let hv = { [kodSaha]: '' }
				let query = new MQInsert({ table: offlineTable, hv })
				await this.sqlExecNone({ ...e, offlineMode, query })
			}
			if (attrListe?.length && recs?.length) {
				for (let _recs of arrayIterChunks(recs, 500)) {
					if (directFlag) {
						let attrSet = asSet(attrListe)
						let hvListe = []
						for (let rec of _recs) {
							let hv = {}, empty = true
							for (let key in rec) {
								if (!attrSet[key])
									continue
								let value = rec[key]
								if (typeof value == 'string')
									value = value.trimEnd()
								hv[key] = value
								empty = false
							}
							if (!empty)
								hvListe.push(hv)
						}
						let query = new MQInsert({ table: offlineTable, hvListe })
						if (!await this.sqlExecNone({ ...e, offlineMode, query }))
							return this
						if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha)
							okIdList.push(_recs.map(rec => rec[idSaha]))
					}
					else {
						for (let rec of recs) {
							let inst = new this()
							if (!await inst.yukle({ offlineMode: !offlineMode, rec, offlineRequest, offlineYukleRequest }))
								continue
							if (!await inst.yaz({ offlineMode, offlineRequest, offlineYukleRequest }))
								continue
							if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha)
								okIdList.push(rec[idSaha])
						}
					}
				}
			}
		}
		finally {
			if (okIdList?.length) {
				let query = new MQIliskiliUpdate({
					from: offlineTable,
					where: { inDizi: okIdList, saha: idSaha },
					set: { degerAta: asReverseDateTimeString(now()), saha: gonderimTSSaha }
				})
				await this.sqlExecNone({ trnId, offlineMode, query })
			}
			if (inLocalTrn)
				await this.sqlExecNone({ ...e, offlineMode, query: 'COMMIT' }) 
		}
		return this
	}
	static async offlineSaveToRemoteTable(e = {}) {
		if (!this.dbMgr_db)
			return false
		let offlineTable = e.table ?? e.offlineTable ?? this.table
		if (!offlineTable)
			return this
		let {offlineSahaListe: attrListe, idSaha, gonderildiDesteklenirmi, gonderimTSSaha} = this
		let offlineMode = false, offlineRequest = true, offlineGonderRequest = true, {trnId} = e
		let recs = await this.loadServerData({ ...e, offlineMode: !offlineMode, offlineRequest, offlineGonderRequest })
		if (attrListe?.length) {
			let directFlag = !idSaha, okIdList = []
			app.online()
			try {
				if (directFlag) {
					if (recs?.length) {
						let attrSet = asSet(attrListe), hvListe = []
						for (let rec of recs) {
							let hv = {}; let empty = true; for (let key in rec) {
								if (!attrSet[key]) { continue } let value = rec[key]; if (typeof value == 'string') { value = value.trimEnd() }
								hv[key] = value; empty = false
							}
							if (!empty) { hvListe.push(hv) }
						}
						let query = new MQInsert({ table: offlineTable, hvListe }); if (!await this.sqlExecNone({ ...e, trnId, offlineMode, query })) { return this }
						if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha) { okIdList.push(recs.map(rec => rec[idSaha])) }
					}
				}
				else { if (recs?.length) {
					for (let rec of recs) {
						let inst = new this()
						if (!await inst.yukle({ offlineMode: !offlineMode, rec, offlineRequest, offlineGonderRequest })) { continue }
						if (inst.sayac) { inst.sayac = null }
						if (await inst.varmi({ trnId, offlineMode, offlineRequest, offlineGonderRequest })) { continue }
						if (!await inst.yaz({ trnId, offlineMode, offlineRequest, offlineGonderRequest })) { continue }
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
		e = { ...($.isPlainObject(e) ? e ?? {} : { query: e, params }) }
		let {selector} = e, offlineMode = e.isOfflineMode ?? e.offlineMode ?? e.isOffline ?? e.offline ?? this.isOfflineMode
		let db = e.db ?? app.dbMgr?.default
		if (db?.internalDB === null) { db = null }
		for (let key of ['selector', 'db', 'isOfflineMode', 'offlineMode', 'isOffline', 'offline']) { delete e[key] }
		let result = offlineMode && db ? db.execute(e) : app[selector](e);
		if (offlineMode && db) {
			switch (selector) {
				case 'sqlExecNone': result = { lastRowsAffected: db.internalDB.getRowsModified() }; break
				case 'sqlExecTekil': result = result?.[0]; break
				case 'sqlExecTekilDeger': result = Object.values(result?.[0] ?? {})[0]; if (typeof result == 'string') { result = result.trimEnd() } break
			}
		}
		return result
	}
	_sqlExec(e, _params) {
		e = $.isPlainObject(e) ? e : { query: e, params: _params }; let offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.isOffline ?? e.offline ?? this.isOfflineMode;
		let {selector, db, trnId, query, params, deferFlag, batch} = e;
		return this.class._sqlExec({ selector, db, offlineMode, trnId, query, params, deferFlag, batch })
	}
}
