class MQYapi extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get mqYapimi() { return true }
	static get isOfflineMode() { return app.offlineMode } get isOfflineMode() { return this.class.isOfflineMode }
	static get dbMgr_db() { return app?.dbMgr?.default } get dbMgr_db() { return this.class.dbMgr_db }
	static get sinifAdi() { return null } static get table() { return null } static get tableAlias() { return null }
	static get idSaha() { return this.sayacSaha ?? this.kodSaha } static get onlineIdSaha() { return this.idSaha }
	static get tableAndAlias() { let {table, tableAlias} = this; if (tableAlias) { return `${table} ${tableAlias}` } return table }
	static get aliasVeNokta() { let {tableAlias} = this; if (tableAlias) { return `${tableAlias}.` } return '' }
	static get silinebilirmi() { return false } static get tekilOku_querySonucu_returnValueGereklimi() { return false }
	static get tekilOku_sqlBatchFlag() { return true } static get tekilOkuYapilazmi() { return false }
	static get gonderildiDesteklenirmi() { return false } static get gonderimTSSaha() { return 'gonderimts' }
	static get offlineSahaListe() { return new this().offlineSahaListe }
	get offlineSahaListe() {
		let e = { offlineRequest: true, offlineMode: false }
		let result = [...keys(this.hostVars(e) ?? {}), ...keys(this.keyHostVars(e) ?? {})]
		return result
	}
	static get offlineTemp() { return !this.offlineFis } static get offlineFis() { return false }
	static get offlineDirect() { return true } static get offlineGonderYapilirmi() { return false }
	static get offline2OnlineSaha() { return {} }
	static get online2OfflineSaha() { return asReverseDict(this.offline2OnlineSaha) }
	static get logKullanilirmi() { return !(app.offlineMode || this.isOfflineMode) }
	static get logAnaTip() { return 'K' }
	static get logRecDonusturucu() { let e = { result: {} }; this.logRecDonusturucuDuzenle(e); return e.result }
	get logHV() { let e = { hv: {} }; this.logHVDuzenle(e); return e.hv }

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
	async yaz(e = {}) {
		e.islem ||= 'yeni'
		let keyHV = this.alternateKeyHostVars(e);
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e, _e = { offlineMode, trnId };
		if (!$.isEmptyObject(keyHV)) {
			$.extend(_e, { keyHV }); let result = await this.varmi(_e); delete _e.keyHV;
			if (result) { throw { isError: true, rc: 'duplicateRecord', errorText: 'Kayıt tekrarlanıyor' } }
		}
		await this.yeniOncesiIslemler(e); let hv = this.hostVars(e); if (!$.isEmptyObject(keyHV)) { $.extend(hv, keyHV) }
		let {table} = this.class; let query = _e.query = new MQInsert({ table, hv });
		let result = await this.sqlExecNone(_e); await this.yeniSonrasiIslemler({ ...e, ..._e }); return result
	}
	async degistir(e = {}) {
		if (!isPlainObject(e)) { e = { islem: 'degistir', eskiInst: e } }
		await this.degistirOncesiIslemler(e)
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
	async sil(e = {}) {
		e.islem ||= 'sil'
		let keyHV = this.keyHostVars({ ...e, varsayilanAlma: true }) ?? {};
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
	async yukle(e = {}) {
		let {rec} = e
		e.orjRec = rec
		if (!rec) {
			rec = await this.tekilOku(e)
			let {params} = rec || {}
			if (params) {
				let param = params.result ?? params.baslik ?? params.fis
				if (params)
					rec = params.value
			}
			e.rec = rec
		}
		if (!rec)
			return false
		let basitFlag = e.basit ?? e.basitmi ?? e.basitFlag
		if (!basitFlag)
			await this.yukleSonrasiIslemler(e)
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
		await this.setValues(e)
		return await this.yeniTanimOncesiVeyaYukleSonrasiIslemler(e)
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
	kaydetVeyaSilmeSonrasiIslemler({ islem, fis, trn, offlineRequest, offlineMode } = {}) {
		fis ??= this
		if (!(offlineRequest && offlineMode)) {
			let {class: fisSinif, class: { sinifAdi, kodListeTipi, name: className }} = fis
			sinifAdi ||= kodListeTipi || className
			islem = (islem ?? 'd')[0].toUpperCase()
			let degisenler = [`SkyERP:${sinifAdi}`]
			let keyTimer = '_timer_logKaydet'
			clearTimeout(fisSinif[keyTimer])
			fisSinif[keyTimer] = setTimeout(async () => {
				try { await fis.logKaydet({ islem, degisenler }) }
				finally { delete fisSinif[keyTimer] }
			}, 10)
			return delay(20)
		}
	}
	static async logKaydet(e = {}) {
		if (!this.logKullanilirmi)
			return true
		let {
			sent: _sent, where, wh, adimBelirtec, logAnaTip, islem, degisenler,
			tableVeAlias, tabloVeAlias, table, alias, logHV, /*logRecDonusturucu,*/
			duzenle, duzenleyici, trn
		} = e
		let {user: loginUser} = config.session ?? {}
		islem ??= ''; adimBelirtec ??= this.kodListeTipi ?? ''
		logAnaTip ??= this.logAnaTip ?? ''
		degisenler = degisenler?.map(x => x.replaceAll(' ', '_')) ?? []
		where = where ?? wh ?? _sent?.where
		table ??= tableVeAlias?.table ?? this.table
		tableVeAlias ??= tabloVeAlias; duzenleyici ??= duzenle
		let tAlias = (alias ?? tableVeAlias?.alias ?? this.tableAlias) || 't'
		// logRecDonusturucu ??= this.logRecDonusturucu
		let sysInfo = app._sysInfo ??= await app.sysInfo()
		let {computerName, userName, ip} = sysInfo ?? {}
		let _e = { ...e, /*logRecDonusturucu,*/ degisenler }
		let hv = _e.hv = {
			islem, adimbelirtec: adimBelirtec?.slice(0, 10),
			kullanici: loginUser?.slice(0, 20),
			terminal: [ip || '', computerName || '', userName || ''].join('_'),
			anatip: logAnaTip, tablo: table, ...logHV,
			xdegisenler: degisenler.join('_').slice(0, 400)
		};
		duzenleyici?.call(this, _e); hv = _e.hv
		await this.logHVDuzenle(_e); hv = _e.hv
		let ins = _e.ins = new MQInsert({ table: 'vtlog', hv })
		await this.logInsertDuzenle(_e); ins = _e.ins
		return await this.sqlExecNone({ query: ins, trn })
	}
	logKaydet({ logHV = this.logHV } = {}) {
		return this.class.logKaydet({ ...arguments[0], logHV })
	}
	static logHVDuzenle({ hv }) { }
	static logInsertDuzenle(e) { }
	static logRecDonusturucuDuzenle(e) { }
	logHVDuzenle(e) { }
	static varsayilanKeyHostVars(e) {
		let hv = {}
		this.varsayilanKeyHostVarsDuzenle({ ...e, hv })
		return hv
	}
	static varsayilanKeyHostVarsDuzenle(e) { }
	keyHostVars(e) {
		let hv = {}
		this.keyHostVarsDuzenle({ ...e, hv })
		return hv
	}
	keyHostVarsDuzenle(e = {}) {
		if (!e.varsayilanAlma)
			this.class.varsayilanKeyHostVarsDuzenle(e)
	}
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
	static sqlExecTekilDeger(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecTekilDeger' }) }
	sqlExecNone(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecNone' }) }
	sqlExecNoneWithResult(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecNoneWithResult' }) }
	sqlExecSelect(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecSelect' }) }
	sqlExecTekil(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecTekil' }) }
	sqlExecTekilDeger(e, params) { e = $.isPlainObject(e) ? e : { query: e, params }; return this._sqlExec({ ...e, selector: 'sqlExecTekilDeger' }) }
	static gonderildiIsaretiKoy(e = {}) { return this.gonderildiIsaretiKoyKaldir({ ...e, flag: true }) }
	static gonderildiIsaretiKaldir(e = {}) { return this.gonderildiIsaretiKoyKaldir({ ...e, flag: false }) }
	static async gonderildiIsaretiKoyKaldir(e = {}) {
		let {gonderildiDesteklenirmi, gonderimTSSaha} = this, {keyHV, flag} = e
		if (!(flag != null && gonderildiDesteklenirmi && gonderimTSSaha && !$.isEmptyObject(keyHV)))
			return false
		let {table} = this
		let query = new MQIliskiliUpdate({
			from: table,
			where: { birlestirDict: keyHV },
			set: { degerAta: flag ? asReverseDateTimeString(now()) : '', saha: gonderimTSSaha }
		})
		let _e = { ...e, isOfflineMode: true, query }
		await this.sqlExecNone(_e)
		return true
	}
	gonderildiIsaretiKoy(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: true }) }
	gonderildiIsaretiKaldir(e) { e = e ?? {}; return this.gonderildiIsaretiKoyKaldir({ ...e, flag: false }) }
	gonderildiIsaretiKoyKaldir(e = {}) {
		let keyHV = e.keyHV ?? this.alternateKeyHostVars(e)
		if (empty(keyHV)) { keyHV = this.keyHostVars(e) }
		return this.class.gonderildiIsaretiKoyKaldir({ ...e, keyHV })
	}
	static offlineDropTable(e = {}) {
		if (!this.dbMgr_db)
			return false
		let offlineTable = e.table ?? e.offlineTable ?? this.table
		if (!offlineTable)
			return false
		let offlineMode = true
		let query = `DROP TABLE IF EXISTS ${offlineTable}`
		return this.sqlExecNone({ ...e, offlineMode, query })
	}
	static offlineClearTable(e = {}) {
		if (!this.dbMgr_db) { return false }
		let offlineTable = e.table ?? e.offlineTable ?? this.table
		if (!offlineTable) { return false }
		let {trnId} = e, offlineMode = e.offline ?? e.offlineMode ?? true
		let query = new MQIliskiliDelete({ from: offlineTable })
		return this.sqlExecNone({ ...e, offlineMode, trnId, query })
	}
	static async offlineSaveToLocalTable(e = {}) {
		if (!this.dbMgr_db)
			return false
		let noLocalTable = e.noLocalTable ?? this.noLocalTable
		let offlineTable = e.table ?? e.offlineTable ?? this.table
		if (!(noLocalTable || offlineTable))
			return false
		let {offlineDirect: directFlag, idSaha, gonderildiDesteklenirmi, gonderimTSSaha} = this
		let clear = e.clear ?? e.clearFlag
		let {offlineSahaListe: attrListe, kodKullanilirmi, kodSaha, bosKodAlinirmi, emptyKodValue = ''} = this
		let {trnId} = e, offlineMode = true, offlineRequest = true, offlineYukleRequest = true, internal = true
		let recs = await this.loadServerData({ ...e, trnId, offlineMode: !offlineMode, offlineRequest, offlineYukleRequest })
		let inLocalTrn = false, okIdList = []
		if (!inLocalTrn) {
			try {
				await this.sqlExecNone({ ...e, offlineMode, query: 'BEGIN TRANSACTION' })
				inLocalTrn = true
				window.progressManager?.progressStep()
			}
			catch (ex) { }
		}
		try {
			if (clear)
				await this.offlineClearTable({ ...e, offlineMode })
			window.progressManager?.progressStep(20)
			window.progressManager?.progressStep()
			if (kodKullanilirmi && kodSaha && !bosKodAlinirmi) {
				let hv = { [kodSaha]: emptyKodValue }
				let query = new MQInsert({ table: offlineTable, hv }).insertOnly()
				try { await this.sqlExecNone({ ...e, offlineMode, query }) }
				catch (ex) {
					if (ex.rc == 'duplicateKey') {
						let query = new MQInsert({ table: offlineTable, hv }).insertIgnore()
						await this.sqlExecNone({ ...e, offlineMode, query })
					}
					else
						cerr(ex)
				}
				window.progressManager?.progressStep(3)
			}
			if (attrListe?.length) {
				if (directFlag && recs?.length) {
					let attrSet = asSet(attrListe)
					let {online2OfflineSaha} = this
					for (let _recs of arrayIterChunks(recs, 800)) {
						let hvListe = []
						for (let rec of _recs) {
							let hv = {}, empty = true
							for (let lKey in rec) {
								if (!attrSet[lKey])
									continue
								let rKey = online2OfflineSaha[lKey] ?? lKey
								if (!rKey)
									continue
								let value = rec[rKey]
								if (typeof value == 'string')
									value = value.trimEnd()
								hv[lKey] = value
								empty = false
							}
							if (!empty)
								hvListe.push(hv)
						}
						let result
						try {
							let query = new MQInsert({ table: offlineTable, hvListe }).insertOnly()
							result = await this.sqlExecNone({ ...e, offlineMode, query })
						}
						catch (ex) {
							if (ex.rc == 'duplicateKey') {
								let query = new MQInsert({ table: offlineTable, hvListe }).insertIgnore()
								result = await this.sqlExecNone({ ...e, offlineMode, query })
							}
							else {
								cerr(ex)
								return this
							}
						}
						if (!result)
							return this
						window.progressManager?.progressStep(10)
						if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha)
							okIdList.push(_recs.map(rec => rec[idSaha]))
						window.progressManager?.progressStep(5)
					}
				}
				else if (recs?.length) {
					for (let rec of recs) {
						let inst = new this()
						await inst.setValues({ rec })
						if (!await inst.yukle({ offlineMode: !offlineMode, offlineRequest, offlineYukleRequest }))
							continue
						window.progressManager?.progressStep(3)
						if (!await inst.yaz({ offlineMode, offlineRequest, offlineYukleRequest }))
							continue
						window.progressManager?.progressStep(10)
						if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha)
							okIdList.push(rec[idSaha])
					}
				}
			}
		}
		finally {
			if (okIdList?.length) {
				let query
				if (await app.sqlHasColumn(offlineTable, idSaha)) {
					query = new MQIliskiliUpdate({
						from: offlineTable,
						where: { inDizi: okIdList, saha: idSaha },
						set: { degerAta: asReverseDateTimeString(now()), saha: gonderimTSSaha }
					})
				}
				if (query)
					await this.sqlExecNone({ trnId, offlineMode, query })
			}
			if (inLocalTrn)
				await this.sqlExecNone({ ...e, offlineMode, query: 'COMMIT' }) 
			window.progressManager?.progressStep(5)
		}
		return true
	}
	static async offlineSaveToRemoteTable(e = {}) {
		if (!this.dbMgr_db)
			return false
		let {offlineGonderYapilirmi} = this
		if (!offlineGonderYapilirmi)
			return false
		let noLocalTable = e.noLocalTable ?? this.noLocalTable
		let offlineTable = e.table ?? e.offlineTable ?? this.table
		if (!(noLocalTable || offlineTable))
			return false
		let {offlineDirect: directFlag, offlineSahaListe: attrListe, idSaha, onlineIdSaha = idSaha, sayacSaha, gonderildiDesteklenirmi, gonderimTSSaha} = this
		let offlineMode = false, offlineRequest = true, offlineGonderRequest = true
		let {trnId} = e
		let recs = await this.loadServerData({ ...e, offlineMode: !offlineMode, offlineRequest, offlineGonderRequest })
		window.progressManager?.progressStep(20)
		if (attrListe && onlineIdSaha && onlineIdSaha != idSaha && !attrListe.includes(onlineIdSaha))
			attrListe.push(onlineIdSaha)
		if (attrListe?.length) {
			// let directFlag = !sayacSaha    // sayac olanlar grupInsert ile yazılamaz
			let okIdList = []
			app.online()
			try {
				if (directFlag) {
					let mevcutIdSet = {}
					if (recs?.length) {
						// let priKeys = idSaha ? null : keys(new this().keyHostVars({ offlineRequest, offlineMode: true }))
						if (onlineIdSaha && !empty(recs)) {
							let idList = keys(asSet(recs.map(rec => rec[onlineIdSaha] ?? rec[idSaha]).filter(_ => _ != null)))
							let sent = new MQSent(), {where: wh, sahalar} = sent
							sent.fromAdd(offlineTable)
							wh.inDizi(idList, onlineIdSaha)
							sahalar.add(onlineIdSaha)
							sent.distinctYap()
							/*if (priKeys) {
								let or = new MQOrClause()
								for (let rec of recs) {
									let values = priKeys.map(k => rec[k] ?? null)
									let and = new MQSubWhereClause()
									priKeys.forEach((key, i) => and.degerAta(values[i], key))
									or.add(and)
								}
								if (or.liste.length)
									wh.add(or)
							}
							else {
								let idList = keys(asSet(recs.map(rec => rec[onlineIdSaha] ?? rec[idSaha])))
								wh.inDizi(idList, onlineIdSaha)
							}
							if (onlineIdSaha)
								sahalar.add(onlineIdSaha)
							else
								sahalar.add(...priKeys)*/
							let _recs = await this.sqlExecSelect({ ...e, trnId, offlineMode, query: sent })
							mevcutIdSet = asSet(_recs.map(rec => rec[onlineIdSaha]))
							window.progressManager?.progressStep(5)
						}
						let attrSet = asSet(attrListe), {online2OfflineSaha} = this
						let hvListe = []
						for (let rec of recs) {
							let hv = {}, _empty = true
							for (let lKey in rec) {
								if (mevcutIdSet[rec[idSaha] ?? rec[onlineIdSaha]])
									break    // skip this rec
								if (!attrSet[lKey])
									continue
								let value = rec[lKey]
								if (typeof value == 'string')
									value = value.trimEnd()
								let rKey = online2OfflineSaha[lKey] ?? lKey
								if (!rKey)
									continue
								hv[rKey] = value
								_empty = false
							}
							if (!_empty)
								hvListe.push(hv)
						}
						window.progressManager?.progressStep(5)
						if (!empty(hvListe)) {
							for (let _hvListe of arrayIterChunks(hvListe, 500)) {
								let query = new MQInsert({ table: offlineTable, hvListe: _hvListe })
								if (!await this.sqlExecNone({ ...e, trnId, offlineMode, query }))
									return this
								if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha)
									okIdList.push(recs.map(rec => rec[idSaha]))
								window.progressManager?.progressStep(2)
							}
						}
					}
				}
				else if (recs?.length) {
					for (let rec of recs) {
						let inst = new this()
						await inst.setValues({ rec })
						if (!await inst.yukle({ offlineMode: !offlineMode, offlineRequest, offlineGonderRequest })) { continue }
						inst = await inst.asOnlineFis?.({ ...e, rec }) ?? inst
						if (inst.sayac) { inst.sayac = null }
						if (await inst.varmi({ trnId, offlineMode, offlineRequest, offlineGonderRequest })) { continue }
						if (!await inst.yaz({ trnId, offlineMode, offlineRequest, offlineGonderRequest })) { continue }
						if (idSaha && gonderildiDesteklenirmi && gonderimTSSaha)
							okIdList.push(rec[idSaha])
						window.progressManager?.progressStep()
					}
				}
			}
			finally {
				if (okIdList?.length) {
					let query
					if (await app.sqlHasColumn(offlineTable, idSaha)) {
						query = new MQIliskiliUpdate({
							from: offlineTable,
							where: { inDizi: okIdList, saha: idSaha },
							set: { degerAta: asReverseDateTimeString(now()), saha: gonderimTSSaha }
						})
					}
					if (query)
						await this.sqlExecNone({ trnId, offlineMode: !offlineMode, query })
				}
				app.resetOfflineStatus()
				window.progressManager?.progressStep(5)
			}
		}
		window.progressManager?.progressStep()
		return true
	}
	static offlineSaveToLocalTableWithClear(e) { e = e ?? {}; return this.offlineSaveToLocalTable({ ...e, clear: true }) }
	static offlineSaveToRemoteTableWithClear(e) { e = e ?? {}; return this.offlineSaveToRemoteTable({ ...e, clear: true }) }
	static offlineGetSQLiteQuery(e = {}) {
		e.result ??= []
		this.offlineBuildSQLiteQuery(e)
		return e.result.join(CrLf) + ';'
	}
	offlineGetSQLiteQuery(e = {}) {
		e.result ??= []
		this.offlineBuildSQLiteQuery(e)
		return e.result.join(CrLf) + ';'
	}
	static offlineBuildSQLiteQuery({ result = [] }) {
		let e = arguments[0]
		e.offlineBuildQuery = true
		let inst = new this(e)
		inst.offlineBuildSQLiteQuery(e)
	}
	offlineBuildSQLiteQuery({ result: r = [] }) {
		let {class: { noLocalTable, table, primaryKeys }} = this
		if (noLocalTable || !table)
			return
		let e = { ...arguments[0], offlineRequest: true, offlineMode: true, queryBuild: true }
		let hv = this.hostVars(e)
		let altKeyHV = this.alternateKeyHostVars(e)
		let keyHV = this.keyHostVars(e)
		let priHV, tumKeyHV = {}
		if (!empty(altKeyHV)) {
			Object.assign(tumKeyHV, altKeyHV)
			priHV = altKeyHV
		}
		if (!empty(keyHV)) {
			Object.assign(tumKeyHV, keyHV)
			if (empty(priHV))
				priHV = keyHV
		}
		for (let [k, v] of entries(tumKeyHV)) {
			if (v !== undefined)
				hv[k] = v
		}
		let autoIncSet = asSet(['sayac', 'kaysayac'])
		if (primaryKeys && $.isArray(primaryKeys))
			primaryKeys = asSet(primaryKeys)
		if (!primaryKeys)
			primaryKeys = asSet(keys(priHV))
		for (let [k, v] of entries(hv)) {
			let autoInc = autoIncSet[k]
			if (!autoInc)
				continue
			primaryKeys = asSet([k])
			break
		}
		let hasMultiPK = keys(primaryKeys)?.length > 1
		let atFirst = true, i = 0, c = keys(hv).length
		r.push(`CREATE TABLE IF NOT EXISTS ${table} (`)
		// if (this instanceof MQTabPlasiyer)
		// 	debugger
		for (let [k, v] of entries(hv)) {
			let autoInc = autoIncSet[k]
			let _isNum = isNum(v)
			if (autoInc && !_isNum) {
				v = asInteger(v) ?? 0
				_isNum = true
			}
			let isPK = primaryKeys[k]
			let atLast = i + 1 == c
			let t = (
				isBool(v) ? 'INTEGER' :
				isStr(v) ? 'TEXT' :
				_isNum ? (isPK || autoInc ? 'INTEGER' : 'REAL') :
				'NONE'
			)
			let isNull = v == null
			let pre = '\t'
			let post = isNull || autoInc ? '' : ' NOT NULL'
			if (!(isNull || isPK || autoInc))
				post += ` DEFAULT ${MQSQLOrtak.sqlDegeri(v)}`
			if (isPK && !hasMultiPK)
				post += ' PRIMARY KEY'
			if (autoInc)
				post += ' AUTOINCREMENT'
			if (!atLast || hasMultiPK)
				post += ','
			r.push(`${pre}${k} ${t}${post}`)
			atFirst = false; i++
		}
		if (!atFirst && hasMultiPK)
			r.push(`\tPRIMARY KEY (${keys(primaryKeys).join(', ')})`)
		r.push(')')
	}
	static _sqlExec(e, params) {
		e = { ...(isPlainObject(e) ? e ?? {} : { query: e, params }) }
		let {selector} = e, offlineMode = e.isOfflineMode ?? e.offlineMode ?? e.isOffline ?? e.offline ?? this.isOfflineMode
		let db = e.db ?? app.dbMgr?.default
		if (db?.internalDB === null)
			db = null
		deleteKeys(e, 'selector', 'db', 'isOfflineMode', 'offlineMode', 'isOffline', 'offline')
		let result = offlineMode && db ? db.execute(e) : app[selector](e)
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
		e = $.isPlainObject(e) ? e : { query: e, params: _params }
		let offlineMode = e.offlineMode ?? e.isOfflineMode ?? e.isOffline ?? e.offline ?? this.isOfflineMode
		let {selector, db, trnId, query, params, deferFlag, batch} = e
		return this.class._sqlExec({ selector, db, offlineMode, trnId, query, params, deferFlag, batch })
	}
}
