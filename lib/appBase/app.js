class App extends AppBase {
    static { window[this.name] = this; this._key2Class[this.name] = this } get dbMgrClass() { return null }
	get offlineMode() { return this._offlineMode ?? config.offlineMode } set offlineMode(value) { this._offlineMode = value }
	get superDefaultWSPath() { return super.defaultWSPath } get defaultWSPath() { return `${super.defaultWSPath}/skyERP` } get testBaseClass() { return TestBase }
	get configParamSinif() { return MQYerelParamConfig } get yerelParamSinif() { return MQYerelParamApp } get ortakParamSinif() { return window.MQOrtakParam } get isLoginRequired() { return true }
	get autoExecMenuId() { return this._autoExecMenuId } get sqlDeferWaitMS() { return 100 } get dbMgr_initDBNames() { return [] }
	get raporEkSahaDosyalari() { let result = this._raporEkSahaDosyalari; if (!result) { let _e = { liste: [] }; this.raporEkSahaDosyalariDuzenle(_e); result = _e.liste } return result }
	static get tumModuller() {
		let result = this._tumModuller; if (result == null) {
			let e = { liste: [] }; this.tumModulleriDuzenle(e); let {liste} = e;
			result = {}; for (let modul of liste) { let {kod} = modul; if (kod) { result[kod] = modul } }
			this._tumModuller = result
		}
		return result
	}
	
	constructor(e) {
		super(e); e = e || {}; let _wsSQL = qs.sql; this.wsSQL = ( _wsSQL ? ( typeof _wsSQL == 'object' ? _wsSQL : JSON.parse(_wsSQL) ) : null ) || null;
		$.extend(this, { mqGlobals: {}, params: {}, sabitTanimlar: {}, moduller: {}, temps: {}, promise_login: new $.Deferred(), promise_ready: new $.Deferred(), trnId2Count: {} })
		let {offlineMode, dbMgrClass} = this; if (offlineMode !== false && dbMgrClass) {
			this.dbMgr = new dbMgrClass(); this.dbMgr_createDefaultDBs(e);
			this._promise_dbMgr_tablolariOlustur_fetchAndSaveQueries = this.dbMgr_tablolariOlustur_fetchAndSaveQueries(e)
		}
	}
	init(e) { super.init(e); this.params.config = this.configParamSinif.getInstance() }
	async runDevam(e) {
		await super.runDevam(e); if (this.isLoginRequired) { await this.loginIstendi(e) } else { this.promise_login?.resolve() }
		if (!this._ilkIslemlerYapildimi) {
			let {params, sabitTanimlar, dbMgr} = this; this.class.tumModuller; /* cache */
			if (dbMgr) { await this._promise_dbMgr_tablolariOlustur_fetchAndSaveQueries; try { await dbMgr.yukle() } finally { this.dbMgr_createDefaultDBs(e) } }
			try { await MQParam.topluYukleVerisiOlustur(e) } catch (ex) { console.error(ex) }
			{
				let promises = [this.paramsDuzenle({ params }), this.sabitTanimlarDuzenle({ sabitTanimlar })];
				if (promises?.length) { try { await Promise.all(promises) } catch (ex) { console.error(ex); debugger } promises = [] }
			}
			{
				let promises = [this.paramsDuzenleSonrasi(e), this.sabitTanimlarDuzenleSonrasi(e)];
				if (promises?.length) { try { await Promise.all(promises) } catch (ex) { console.error(ex); debugger } promises = [] }
			}
		}
	}
	async afterRun(e) {
		await super.afterRun(e); await this.promise_login;
		let promises = []; if (!this._ilkIslemlerYapildimi) {
			if (promises?.length) { try { await Promise.all(promises) } catch (ex) { console.error(ex); debugger } promises = [] }
			promises.push(this.gecerliModulleriBelirleWithReset(e));
			this._ilkIslemlerYapildimi = true
		}
		if (promises?.length) { try { await Promise.all(promises) } catch (ex) { console.error(ex); debugger } promises = [] }
		this.uzakScript_startTimer(e); this.registerCloseHandlers(e); /* this.loadTrnInfo(e); */
		let {promise_ready} = this; if (promise_ready) { promise_ready.resolve(e) }
		this._initFlag = true
	}
	paramsDuzenle({ params }) {
		let {yerelParamSinif, ortakParamSinif} = this; $.extend(params, { prot: MQProtParam.getInstance() });
		if (yerelParamSinif) { params.yerel = yerelParamSinif.getInstance() } if (ortakParamSinif) { params.ortak = ortakParamSinif.getInstance() }
		if (window?.MQLocalData) { MQLocalData._instance = undefined }
	}
	async paramsDuzenleSonrasi(e) {
		let {params} = this;
		for (let [key, param] of Object.entries(params)) {
			if (!param) { continue } let {_promise} = param;
			if (_promise) { try { param = params[key] = await _promise }
			catch (ex) { console.error('params', key, getErrorText(ex), ex) } }
		}
		window?.HMRBilgi?.cacheReset?.()
	}
	sabitTanimlarDuzenle(e) { }
	async sabitTanimlarDuzenleSonrasi(e) {
		let {sabitTanimlar} = this;
		for (let [key, tanim] of Object.entries(sabitTanimlar)) {
			if (!tanim) { continue }
			try { sabitTanimlar[key] = await tanim }
			catch (ex) { sabitTanimlar[key] = null; console.error('sabitTanimlar', key, getErrorText(ex), ex) }
		}
	}
	static tumModulleriDuzenle(e) { }
	gecerliModulleriBelirle(e) {
		e = e ?? {}; let {tumModuller} = this.class, moduller = e.moduller ?? this.moduller;
		for (let kod in tumModuller) { let modul = tumModuller[kod]; if (!modul.araSeviyemi && modul.kullaniliyormuVeAnahtarVarmi) { moduller[kod] = modul } }
		return this
	}
	async gecerliModulleriBelirleSonrasi(e) { }
	gecerliModulleriBelirleWithReset(e) {
		let _e = { ...e, moduller: this.moduller = {} }; this.gecerliModulleriBelirle(_e);
		this.gecerliModulleriBelirleSonrasi(_e); return this
	}
	raporEkSahaDosyalariDuzenle(e) { }
	async anaMenuOlustur(e) {
		let divMenu = this.divMenu = this.layout.find(`#anaMenu`), frMenu = this.frMenu = await this.getAnaMenu(e);
		if (frMenu && divMenu?.length) { await frMenu.menuLayoutOlustur({ parent: divMenu }) }
		await this.anaMenuOlusturSonrasi(e)
	}
	anaMenuOlusturSonrasi(e) { this.navBarDuzenle(e); return this.anaMenuOlusturSonrasiDevam(e) }
	navBarDuzenle(e) {
		let {frMenu, mainNav} = this;
		if (frMenu) frMenu.navLayoutOlustur({ parent: mainNav })
	}
	navLayoutOlustur_araIslem(e) {
		let items = [
			new FRMenuChoice({ id: '_ayarlar', text: `<span class="img"></span><span class="text">Ayarlar</span>`, block: e => app.ayarlarIstendi(e) }),
			new FRMenuChoice({ id: '_scale', text: `<span class="img"></span><span class="text">Boyutlandır</span>`, block: e => app.scaleIstendi(e) }),
			new FRMenuChoice({ id: '_fullScreen', text: `<span class="img"></span><span class="text">Tam Ekran</span>`, block: e => app.toggleFullScreen(e) }),
			new FRMenuChoice({ id: '_newWindow', text: `<span class="img"></span><span class="text">Yeni Pencerede Aç</span>`, block: e => app.openNewWindow(e) }),
			new FRMenuChoice({ id: '_logout', text: `<span class="img"></span><span class="text">Çıkış</span>`, block: e => app.logoutIstendi(e) })
		];
		for (let item of items) { item.navLayoutOlustur(e) }
	}
	anaMenuOlusturSonrasiDevam(e) {
		let {mainNav, btnMainNavToggle} = this;
		if (mainNav?.length) {
			let mainNav_menu = mainNav.children('ul'); if (!mainNav_menu.length) { mainNav_menu = mainNav } makeScrollable(mainNav_menu);
			mainNav.jqxResponsivePanel({ width: false, height: false, collapseBreakpoint: 10000, toggleButton: btnMainNavToggle, animationType: animationType, autoClose: true })
			if (btnMainNavToggle && btnMainNavToggle.length) { btnMainNavToggle.removeClass('jqx-hidden basic-hidden') } mainNav.removeClass('jqx-hidden basic-hidden')
			setTimeout(() => { let hizliBulPart = this.frMenu?.part?.hizliBulPart; if (hizliBulPart?.focus) { hizliBulPart.focus() } }, 100)
		}
		else { if (btnMainNavToggle?.length) btnMainNavToggle.addClass('jqx-hidden') }
		let sonIslemlerExecFlag = false; let menuId = qs.menuAdim || qs.menuId || qs.menuID || qs.menu || this.autoExecMenuId;
		if (menuId) {
			let {frMenu} = this; if (frMenu) {
				let menuItem = frMenu.mne2Item[menuId];
				if (menuItem) {
					this.hideBasic(); sonIslemlerExecFlag = true;
					setTimeout(async () => {
						await app.promise_ready; let menuPart = frMenu.part;
						if (menuPart) { let parentItem = menuItem; if (parentItem.choicemi) { parentItem = parentItem.parentItem } menuPart.parentItem = parentItem; await menuPart.tazele() }
						await this.promise_ready; try { await menuItem.run() } catch (ex) { console.error(ex); hConfirm(getErrorText(ex)) }
						setTimeout(() => this.sonIslemler(e), 0)
					}, 5)
				}
			}
		}
		if (!sonIslemlerExecFlag) { sonIslemlerExecFlag = true; setTimeout(() => this.sonIslemler(e), 0) }
	}
	async sonIslemler(e) {
		let {promise_ready} = this; if (promise_ready) { await promise_ready }
		let afterRunBlock = qs.afterRun; if (afterRunBlock && typeof afterRunBlock == 'string') { afterRunBlock = getFunc(afterRunBlock) }
		if (!afterRunBlock) {
			afterRunBlock = qs.afterRunBase64; if (afterRunBlock && typeof afterRunBlock == 'string') { afterRunBlock = Base64.decode(afterRunBlock) }
			if (afterRunBlock && typeof afterRunBlock == 'string') { afterRunBlock = getFunc(afterRunBlock) }
		}
		if (afterRunBlock) {
			let promise = new $.Deferred();
			setTimeout(() => {
				try { promise.resolve(getFuncValue.call(this, afterRunBlock, $.extend({}, e, { sender: this, app: this, activePart: this.activePart, frMenu: this.frMenu }))) }
				catch (ex) { promise.reject(ex) }
			}, 0)
			try { await promise } catch (ex) { let errorText = getErrorText(ex); displayMessage(errorText); throw ex }
		}
		setTimeout(() => { let {activePart} = this; if (!activePart || activePart == this) this.show(); else this.hide() }, 100)
	}
	getAnaMenu(e) { return null }
	buildAjaxArgs(e) {
		e = e || {}; let {args} = e; if (!args) { return }
		super.buildAjaxArgs(e); if (!args.sql) { let {wsSQL} = this; if (wsSQL) { args.sql = toJSONStr(wsSQL) } }
	}
	async setCurrentDBAndDo(e, _server, _block) {
		e = typeof e == 'object' ? e : { db: e, server: _server, block: _block };
		let block = e.block ?? e.action, result;
		let timerKey = '_timer_restoreCurrentDB'; clearTimeout(this[timerKey]);
		try { await this.setCurrentDB(e); result = await block?.call(e) }
		finally {
			await this.restoreCurrentDB(e);
			this[timerKey] = setTimeout(() => {
				try { this.restoreCurrentDB(e) }
				finally { delete this[timerKey] }
			}, 500)
		}
		return result
	}
	async setCurrentDB(e, _server) {
		e = typeof e == 'object' ? e : { db: e, server: _server };
		let newServer = e.server ?? e.sqlServer, newDB = e.db ?? e.dbName;
		let orjSQL = this.orjSQL = e.orjSQL = this.orjSQL ?? this.wsSQL ?? {};
		this._oldDB = this._oldDB || (await this.wsGetSessionInfo()).dbName;
		/*if (!orjSQL.db) {
			let {sqlServer: server, dbName: db} = await this.wsGetSessionInfo();
			$.extend(orjSQL, { server, db })
		}*/
		let sql = this.wsSQL = e.sql = { server: newServer, db: newDB };
		try {
			this._useYapildiFlag = true;
			await this.sqlExecNone(`USE ${newDB}`);
			this.divDBName.html(`<span class="newDB bold orangered">${newDB}</span>`);
		}
		catch (ex) { this.restoreCurrentDB(); throw ex }
		return true
	}
	async restoreCurrentDB(e) {
		e = e ?? {}; let {orjSQL} = this; if (!orjSQL) { return false }
		let oldDB = orjSQL.db || this._oldDB, {wsSQL: newSQL} = this;
		this.wsSQL = orjSQL;
		try {
			this._useYapildiFlag = true;
			await app.sqlExecNone(`USE ${oldDB}`);
			/*delete this.orjSQL; delete this._oldDB;*/
			this.updateAppTitle(e)
		}
		catch (ex) { this.wsSQL = newSQL; throw ex }
		return true
	}
	dbMgr_createDefaultDBs(e) {
		let {dbMgr} = this; if (!dbMgr) { return }
		let {dbMgr_initDBNames} = this; if (!dbMgr_initDBNames?.length) { dbMgr_initDBNames = [null] }
		for (let dbName of dbMgr_initDBNames) { dbMgr.addDatabase(dbName) }
	}
	dbMgr_tablolariOlustur(e) {
		let {dbMgr, db2InitQueries} = this; if (!dbMgr || $.isEmptyObject(db2InitQueries)) { return }
		for (let db of dbMgr.iterValues()) {
			let queries = db2InitQueries[db.name]; if (!queries?.length) { continue }
			for (let query of queries) { try { db.execute(query) } catch (ex) { console.error({ islem: 'dbMgr_tablolariOlustur', query, ex }) } }
		}
	}
	dbMgr_tabloEksikleriTamamla(e) { /*e = e || {}; let {db} = e */ }
	dbMgr_tablolariOlustur_fetchAndSaveQueries(e) {
		let db2Urls = this.dbMgr_tablolariOlustur_getQueryURLs(e); if ($.isEmptyObject(db2Urls)) { return }
		let promises = [], db2InitQueries = this.db2InitQueries = {}; for (let [dbName, url] of Object.entries(db2Urls)) {
			if (!url.includes('?')) { url += '?' }
			if (!url.includes('version')) { url += `&version=${appVersion}&` }
			promises.push(ajaxPost({ dataType: 'text', ajaxContentType: 'text/x-sql', url }).then(data => {
				(db2InitQueries[dbName] = db2InitQueries[dbName] ?? []).push(...(data || []).split(';').filter(x => !!x)) } ))
		}
		return Promise.all(promises)
	}
	dbMgr_tablolariOlustur_getQueryURLs(e) {
		let {dbMgr} = this; if (!dbMgr) { return }
		let db2Urls = {}; for (let db of dbMgr.iterValues()) { db2Urls[db.name] = [] } return db2Urls
	}
	async barkodBilgiBelirleBasit(e) {
		e = e || {}; if (typeof e != 'object') e = { barkod: e };
		e.basitmi = true; return await this.barkodBilgiBelirle(e)
	}
	async barkodBilgiBelirle(e) {
		e = e || {}; if (typeof e != 'object') e = { barkod: e }
		let barkod = (e.barkod || '').trim(); if (!barkod) { return null }
		let basitmi = e.basitmi ?? e.basit ?? e.basitFlag, {carpan} = e;
		if (barkod.length > 2) {
			let kural = await BarkodParser_Kuralli.kuralFor({ basitmi, carpan, barkod, basKod: barkod.substring(0, 2) });
			if (kural) {
				let parser = await kural.parseSonucu(e);
				if (parser) { return parser }
			}
		}
		if (!basitmi) {
			let parser = new BarkodParser_Referans({ basitmi, carpan, barkod });
			if (await parser.parse(e)) { return parser }
		}
		return null
	}
	async loadTrnInfo(e) {
		let id2Trn = await this.wsSqlTrnList();
		if (id2Trn) { let id2TrnCount = this.id2TrnCount = this.id2TrnCount || {}; for (let id in id2Trn) { id2TrnCount[id] = (id2TrnCount[id] || 0) + 1 } }
		return id2Trn
	}
	async sonDegisenDosyalar(e) {
		e = e || {}; let gunSayi = e.gunSayi ?? 0, {dir} = e, recursiveFlag = e.recursive ?? e.recursiveFlag ?? false;
		let pattern = e.pattern ?? e.mask, _today = today().addDays(-gunSayi);
		let recs = (await app.wsDosyaListe({ dir, recursive: recursiveFlag, pattern }))?.recs;
		recs = recs.filter(rec => asDate(rec.lastWriteTime) >= _today)
					.map(rec => { return { name: rec.name, relDir: rec.relDir, size: rec.size, lastWriteTime: asDate(rec.lastWriteTime) } })
					.sort((a, b) => a.lastWriteTime.getTime() < b.lastWriteTime.getTime() ? 1 : -1); return recs
	}
	async sysInfo(e) {
		let {DefaultWSHostName_SkyServer: host} = config.class, delim = '@';
		let str = await this.shell(`echo %COMPUTERNAME%${delim}%USERNAME%`);
		str += `${delim}${await this.webRequestAsStream({ type: 'text', url: `https://${host}:90/ip.php` })}`;
		let tokens = str.split(delim), result = { computerName: tokens[0], userName: tokens[1], ip: tokens[2] };
		return result
	}
	sonDegisenDosyalar_skyERP(e) {
		e = e || {}; $.extend(e, {
			gunSayi: e.gunSayi ?? 3, dir: e.dir || '/appserv/www/skyerp',
			recursive: e.recursive ?? e.recursiveFlag ?? true, pattern: e.pattern ?? e.mask ?? '*.js'
		});
		for (let key of ['recursiveFlag', 'mask']) delete e[key]
		return this.sonDegisenDosyalar(e)
	}
	async xuserTanimYukle(e) {
		let {session} = config, {user} = session, xkod = await app.wsXEnc(user);
		let rec = await app.sqlExecTekil(new MQSent({ from: 'ORTAK..xuser', where: { degerAta: xkod, saha: 'xkod' }, sahalar: ['xkod', 'xtanim', 'xmodulbilgi'] }));
		let enc = [rec.xkod, rec.xtanim, rec.xmodulbilgi], dec = await app.wsXDec(enc); $.extend(rec, { xkod: dec[0], xtanim: dec[1], xmodulbilgi: dec[2] });
		let sep = '\u00ff', parts = rec.xmodulbilgi.split(sep); let subParts;
		for (let part of parts) { let _subParts = part.trim().split('\t'); if (_subParts.length >= 4 && _subParts[0].startsWith('Sube')) { subParts = _subParts; break } }
		if (!subParts) { return false } let tRec = session.subeYapi = { subeKod: subParts[1], subeGecerlilik: subParts[2] == 'T' ? 'T' : subParts[4] };
		tRec.subeGrupKod = (await app.sqlExecTekilDeger(new MQSent({ from: 'isyeri', where: { degerAta: tRec.subeKod, saha: 'kod' }, sahalar: 'isygrupkod' })))?.trimEnd()
	}
	*getModulIter() { let {moduller} = this; if (moduller) { for (let modul of Object.values(moduller)) { yield modul } } }
	registerCloseHandlers(e) {
		let handler = evt => {
			evt = evt || {}; if (!navigator.sendBeacon || evt.persisted === false) { return }
			let {trnId, id2TrnCount} = this, trnIdSet = {}; if (trnId) { trnIdSet[trnId] = true } if (id2TrnCount) { $.extend(trnIdSet, id2TrnCount) }
			if (!$.isEmptyObject(trnIdSet)) {
				let proc = async () => { let promises = []; for (let trnId in trnIdSet) { promises.push(this.wsSqlTrnRollback({ trnId })) } await Promise.all(promises) };
				if (evt.waitUntil) { evt.waitUntil(proc) } else { proc() }
				if (!confirm('Uygulamadan çıkmak üzeresiniz, devam edilsin mi?')) { evt.preventDefault(); return false }
			}
		};
		for (let key of ['beforeunload', 'pagehide', 'navigate']) { window.addEventListener(key, handler) }
	}
	async sqlGetConstraints(e, _typeDizi, _tableLike) {
		let nameDizi = typeof e == 'object' ? (e.name || e.names || e.table || e.tablo || e.tables) : e;
		let typeDizi = typeof e == 'object' ? (e.type || e.typeDizi) : _typeDizi, tableLike = typeof e == 'object' ? e.tableLike : _tableLike;
		let sent = new MQSent({
			from: 'sysobjects',
			sahalar: ['id', 'xtype', 'name', 'crdate', 'parent_obj', 'seltrig', 'instrig', 'updtrig', 'deltrig', `OBJECT_NAME(parent_obj) parentname`]
		});
		if (nameDizi) {
			nameDizi = (typeof nameDizi == 'object') ? ($.isArray(nameDizi) ? nameDizi : Object.keys(nameDizi)) : [nameDizi];
			sent.where.inDizi(nameDizi, 'name')
		}
		if (typeDizi) {
			typeDizi = (typeof typeDizi == 'object') ? ($.isArray(typeDizi) ? typeDizi : Object.keys(typeDizi)) : [typeDizi];
			sent.where.inDizi(typeDizi, 'xtype')
		}
		if (tableLike)
			sent.where.like({ deger: tableLike, saha: 'name', aynenAlinsinmi: true, yazildigiGibimi: true })
		let stm = new MQStm({ sent, orderBy: ['name'] }), result = {}, recs = await app.sqlExecSelect(stm);
		for (let rec of recs) result[rec.name] = rec
		return result
	}
	async sqlHasConstraint(e, _typeDizi, _tableLike) { return !$.isEmptyObject(await this.sqlGetConstraints(e, _typeDizi, _tableLike)) }
	sqlGetTables(e, _tableLike) {
		let nameDizi = typeof e == 'object' ? (e.name || e.names || e.table || e.tablo || e.tables) : e;
		let tableLike = typeof e == 'object' ? e.tableLike : _tableLike;
		return this.sqlGetConstraints({ name: nameDizi, type: 'U', tableLike: tableLike })
	}
	async sqlHasTable(e, _tableLike) { return !$.isEmptyObject(await this.sqlGetTables(e, _tableLike)) }
	async sqlGetColumns(e, _nameDizi, _typeDizi, _nameLike) {
		let table = typeof e == 'object' ? (e.table || e.tablo) : e;
		let nameDizi = typeof e == 'object' ? (e.name || e.names) : _nameDizi, typeDizi = typeof e == 'object' ? (e.type || e.types) : _typeDizi;
		let nameLike = typeof e == 'object' ? e.nameLike : _nameLike;
		let sent = new MQSent({
			from: 'syscolumns', sahalar: ['name', 'xtype', 'length'],
			where: [`id = OBJECT_ID(${MQSQLOrtak.sqlServerDegeri(table)})`]
		});
		if (nameDizi) {
			nameDizi = (typeof nameDizi == 'object') ? ($.isArray(nameDizi) ? nameDizi : Object.keys(nameDizi)) : [nameDizi];
			sent.where.inDizi(nameDizi, 'name')
		}
		if (typeDizi) {
			typeDizi = (typeof typeDizi == 'object') ? ($.isArray(typeDizi) ? typeDizi : Object.keys(typeDizi)) : [typeDizi];
			sent.where.inDizi(typeDizi, 'xtype')
		}
		if (nameLike) { sent.where.like({ deger: nameLike, saha: 'name', aynenAlinsinmi: true, yazildigiGibimi: true }) }
		let stm = new MQStm({ sent: sent, orderBy: ['name'] }), result = {}, recs = await app.sqlExecSelect(stm);
		for (let rec of recs) { result[rec.name] = rec }
		return result
	}
	async sqlHasColumn(e, _nameDizi, _typeDizi, _nameLike) { return !$.isEmptyObject(await this.sqlGetColumns(e, _nameDizi, _typeDizi, _nameLike)) }
	sqlDefTrnDo(e, _proc) { e = e || {}; if (typeof e != 'object') { e = { trnId: e, proc: _proc } } return this.sqlTrnDo(e) }
	async sqlTrnDo(e, _proc) {
		e = e || {}; if (typeof e != 'object') { e = { trnId: e, proc: _proc } }
		let {defTrn} = e; let {trnId} = e, trnResult, trnOlustumu = false;
		let isMainTrn = false; if (trnId == null) { trnId = this.trnId; isMainTrn = true }
		if (trnId == null) { trnResult = await this[defTrn ? 'sqlDefTrnBegin' : 'sqlTrnBegin']({ trnId }), trnId = trnResult?.trnId; trnOlustumu = true }
		if (trnId == null) { throw { isError: true, rc: 'noTransaction', errorText: 'Transaction yok veya geçersiz' } }
		let {trnId2Count} = this; let trnSayi = trnId2Count[trnId] || 0;
		if (!trnOlustumu) { trnId2Count[trnId] = ++trnSayi; trnResult = { trnId, trnSayi } }
		let rollback = false;
		try {
			let proc = typeof e == 'object' ? e.proc ?? e.block : _proc;
			let _e = $.extend({}, e, trnResult); if (isMainTrn) { _e._trnId = _e.trnId; delete _e.trnId }
			let result = trnResult.result = await getFuncValue.call(this, proc, _e);
			if (result === false) { rollback = true }
		}
		catch (ex) { rollback = true; throw ex }
		finally { let result = await this.sqlTrnEnd({ trnId, rollback, isMainTrn }); $.extend(trnResult, { rollback }, result || {}) }
		return trnResult
	}
	async sqlTrnList(e) {
		e = e || {}; let trnId = e.trnId ?? e.trnIdList; let db = e.db ?? e.dbName; if (db === true) { db = app.wsSQL.db }
		return await this.wsSqlTrnList({ trnId })
	}
	async sqlDefTrnBegin(e) {
		e = e || {}; let {trnId2Count} = this; let trnId = typeof e == 'object' ? e.trnId : e;
		if (trnId == null) { trnId = this.trnId }
		if (trnId != null) { let trnSayi = trnId2Count[trnId]; if (trnSayi) { await this.sqlTrnRollback({ trnId }); hConfirm('Açık transaction var, son yapılan işlemler iptal edildi') } }
		return await this.sqlTrnBegin({ trnId })
	}
	async sqlTrnBegin(e) {
		e = e || {}; let {trnId2Count} = this; let trnId = typeof e == 'object' ? e.trnId : e; let trnResult;
		let isMainTrn = false; if (trnId == null) { trnId = this.trnId; isMainTrn = true }
		if (trnId == null) { trnId = this.trnId }
		if (trnId == null) { trnResult = await this.wsSqlTrnBegin({ trnId }); trnId = trnResult?.trnId }
		if (trnId == null) { return null }
		let trnSayi = trnId2Count[trnId] = (trnId2Count[trnId] || 0) + 1;
		let result = $.extend({}, { trnId, trnSayi }, trnResult ?? {});
		/*if (result != null && isMainTrn) { this.trnId = trnId }*/
		return result
	}
	async sqlTrnEnd(e) {
		e = e || {}; let trnId = typeof e == 'object' ? e.trnId : e, isMainTrn = typeof e == 'object' ? e.isMainTrn : null;
		if (isMainTrn && trnId == null) { trnId = this.trnId }
		if (trnId == null) { return null } let {trnId2Count} = this, {rollback} = e; let trnSayi = trnId2Count[trnId] || 0;
		if (trnSayi) { trnSayi = rollback ? 0 : Math.max(trnSayi - 1, 0); trnId2Count[trnId] = trnSayi }
		let result = { trnId, trnSayi };
		if (!trnSayi) {
			let _result; try { _result = await this.wsSqlTrnEnd({ trnId, rollback }) }
			catch (ex) {
				let err = ex?.responseJSON ?? ex, code = err?.rc || err?.code;
				let ignoreCodeSet = asSet(['InvalidOperationException', 'invalidArgument']); if (!ignoreCodeSet[code]) { throw ex }
				_result = err
			}
			$.extend(result, _result); delete trnId2Count[trnId]; if (isMainTrn) { this.trnId = null } /*this.loadTrnInfo()*/
		}
		return result
	}
	sqlTrnCommit(e) { e = e || {}; if (typeof e != 'object') { e = { trnId: e } } e.rollback = false; return this.sqlTrnEnd(e) }
	sqlTrnRollback(e) { e = e || {}; if (typeof e != 'object') { e = { trnId: e } } e.rollback = true; return this.sqlTrnEnd(e) }
	wsSqlTrnList(e) { e = e || {}; return ajaxPost({ timeout: 8000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'sqlTrnList', args: e }) }) }
	wsSqlTrnBegin(e) { e = e || {}; return ajaxPost({ timeout: 8000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'sqlTrnBegin', args: e }) }) }
	wsSqlTrnEnd(e) { e = e || {}; return ajaxPost({ timeout: 8000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'sqlTrnEnd', args: e }) }) }
	wsSqlTrnCommit(e) { e = e || {}; return ajaxPost({ timeout: 8000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'sqlTrnCommit', args: e }) }) }
	wsSqlTrnRollback(e) { e = e || {}; return ajaxPost({ timeout: 8000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'sqlTrnRollback', args: e }) }) }
	async sqlSiraliExec(e) {
		e = e || {}; if (!(e.query ?? e.queries)) { e = { query: e } };
		let delim = 'UNION ALL', queries = e.query ?? e.queries;
		queries = queries?.liste ?? queries;
		if (!$.isArray(queries)) { queries = queries.split(delim) }
		if ($.isArray(queries)) { queries = queries.flat() }
		if (!queries.length) { return [] }
		let execTip = e.execTip || 'dt', _e = { ...e, execTip }; delete _e.queries;
		let results = [], seq = 0; for (let query of queries) {
			let item; seq++;
			try {
				_e.query = query; let result = await app.sqlExec(_e);
				item = { isError: false, result }
			}
			catch (ex) {
				item = { isError: true, code: ex.code ?? ex.rc ?? 'sqlError', errorText: getErrorText(ex) };
				console.error(getErrorText(ex))
			}
			let queryYapi = query?.getQueryYapi?.() ?? query;
			$.extend(item, { seq, query, queryYapi }); results.push(item)
		}
		return results
	}
	sqlExecNoneWithResult(e) {
		e = e || {}; if (!(e.query ?? e.queries)) { e = { query: e } }
		let _e = $.extend({}, e, { execTip: 'none' }); delete _e.tip; return this.sqlExec(_e)
	}
	sqlExecNone(e) {
		return this.sqlExecNoneWithResult(e).then(results => {
			for (let i in results) { let result = results[i]; let {rowsAffected} = (result || {}); results[i] = result = rowsAffected ?? result }
			return results?.length < 2 ? results[0] : results
		})
	}
	sqlExecSelect(e) {
		e = e || {}; if (!(e.query ?? e.queries)) { e = { query: e } }
		let _e = $.extend({}, e, { execTip: 'dt' }); delete _e.tip; return this.sqlExec(_e)
	}
	sqlExecSP(e) {
		e = e || {}; if (!(e.query ?? e.queries)) { e = { query: e } }
		let _e = $.extend({}, e, { execTip: 'sp' }); delete _e.tip; return this.sqlExec(_e)
	}
	sqlExecTekil(e) {
		e = e || {}; if (!(e.query ?? e.queries)) { e = { query: e } } e.maxRow = 2; let promise = this.sqlExecSelect(e);
		if (promise) { promise = promise.then(recs => { if (recs && recs.length > 1) console.warn('Birden çok kayıt geldi', e); return recs[0] }) }
		return promise
	}
	sqlExecTekilDeger(e) { let promise = this.sqlExecTekil(e); if (promise) { promise = promise.then(rec => Object.values(rec || {})[0]) } return promise }
	async sqlExec(e) {
		if (!this._useYapildiFlag) {
			let {wsSQL} = this; if (wsSQL?.db) {
				await this._sqlExec({ execTip: 'none', query: `SET DATEFORMAT ymd USE ${wsSQL.db}` });
				this._useYapildiFlag = true
			}
		}
		return await this._sqlExec(e)
	}
	_sqlExec(e) {
		e = e || {}; if (!(e.query ?? e.queries)) { e = { query: e } }
		this.sqlType = this.dbMgr?.default && !navigator.onLine ? 'sqlite' : '';
		let {wsArgs, params} = e, execTip = e.execTip || e.tip; let queries = e.query ?? e.queries; if (queries && !$.isArray(queries)) { queries = [queries] }
		let _firstQuery = (queries || [])[0], firstQueryOrSelf = typeof _firstQuery == 'object' ? _firstQuery : e; let offset = 0, maxRow, recordStartIndex, recordEndIndex;
		for (let source of [firstQueryOrSelf, e]) {
			if (!source) { continue } let value = source.offset; if (value != null) { offset = value } value = source.maxRow ?? source.maxrow;
			if (!value) { let _limit = (source.paketSayisi ?? source.limit); if (_limit) { value = offset + _limit } } if (value != null) { maxRow = value }
			value = source.recordStartIndex ?? source.recordStartIndex ?? source.startIndex ?? source.startindex ?? source.offset; if (value != null) { recordStartIndex = value }
			value = source.recordEndIndex ?? source.recordEndIndex ?? source.endIndex ?? source.endindex; if (value != null) { recordEndIndex = value }
		}
		let _e = $.extend({}, e),  keys = ['offlineMode', 'isOfflineMode', 'offline', 'wsArgs', 'query', 'queries', /*'params'*/]; for (let key of keys) { delete _e[key] }
		if (wsArgs) { $.extend(_e, wsArgs) } if (offset != null) { _e.offset = offset } if (maxRow) { _e.maxRow = maxRow }
		if (recordStartIndex != null) { _e.recordStartIndex = recordStartIndex } if (recordEndIndex != null) { _e.recordEndIndex = recordEndIndex }
		let args = _e.args = _e.args ?? {}; if (execTip) { args.execTip = execTip } if (queries) { args.queries = queries } if (params) { args.params = params }
		if (_e.offset) { delete _e.pageindex; delete _e.recordstartindex; delete _e.recordStartIndex }
		if (_e.maxRow) { delete _e.pagesize; delete _e.recordendindex; delete _e.recordEndIndex }
		let trnId = e.trnId ?? this.trnId; if (trnId) { _e.trnId = trnId }
		return this.wsSqlExec(_e).catch(ex => { if (ex.statusText?.toLowerCase() == 'parsererror' || ex.statusText?.toUpperCase() == 'OK') { return null } else { throw ex } })
	}
	wsSqlExec(e) {
		let deferFlag = e.batch ?? e.batchMode ?? e.defer ?? e.deferFlag, {args} = e, {params} = args; delete args.params;
		if (args.query) { args.queries = [args.query]; delete _args.query }
		if (args.queries) {
			let {queries} = args;
			for (let i = 0; i < queries.length; i++) {
				let query = queries[i]; if (query.getQueryYapi) query = query.getQueryYapi()
				if (typeof query != 'object') query = queries[i] = { query }
				if (typeof query.query == 'object') query.query = query.query?.toString()
				if (!$.isEmptyObject(params)) { let _params = query.params = query.params || []; _params.push(...params) }
				queries[i] = query
			}
		}
		if (!args.execTip) args.execTip = 'dt'
		if (deferFlag) {
			let {execTip, queries} = args; let uygunmu = !$.isEmptyObject(queries);
			if (uygunmu) { for (let query of queries) { if (!(query && typeof query == 'object' && $.isEmptyObject(query.params))) { uygunmu = false; break } } }
			if (uygunmu) {
				let id = e.id = e.id || newGUID(), execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs || {};
				let id2SqlExecArgs = execTip2Id2SqlExecArgs[execTip] = execTip2Id2SqlExecArgs[execTip] || {}; if (id2SqlExecArgs[id]) { uygunmu = false }
				if (uygunmu) {
					let sqlExecArgs = id2SqlExecArgs[id] = id2SqlExecArgs[id] || []; sqlExecArgs.push(args);
					let sqlExecYapi_id2Promise = this._sqlExecYapi_id2Promise = this._sqlExecYapi_id2Promise || {};
					let promise = new $.Deferred(); /* sqlExecYapi_id2Promise[id] = promise; */
					/*let {_timer_sqlDeferExec} = this; if (_timer_sqlDeferExec) clearTimeout(_timer_sqlDeferExec);*/
					let sqlExec_waitTime_queueSize = this._sqlExec_waitTime_queueSize = this._sqlExec_waitTime_queueSize || 0;
					let waitTimeMS = asFloat(qs.sqlBatchWait ?? qs.sqlDeferWait ?? this.sqlDeferWaitMS)
											* (sqlExec_waitTime_queueSize > 1 ? Math.max(sqlExec_waitTime_queueSize - 2, 0) * 1.3 : 0);
					this._sqlExec_waitTime_queueSize++;
					console.debug('sqlExec', { defer: deferFlag, queueSize: sqlExec_waitTime_queueSize, waitTimeMS, execTip, id, args });
					let _timer_sqlDeferExec = setTimeout(async e => {
						try {
							let execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs || {};
							for (let execTip in execTip2Id2SqlExecArgs) {
								try {
									let id2SqlExecArgs = execTip2Id2SqlExecArgs[execTip];
									if ($.isEmptyObject(id2SqlExecArgs)) continue
									let args, index = 0; let queryIndex2Id = {};
									for (let id in id2SqlExecArgs) {
										let _argsListe = id2SqlExecArgs[id] || [];
										for (let _args of _argsListe) {
											let {queries} = _args;
											if ($.isEmptyObject(queries)) continue
											for (let key in queries) { let query = queries[key]; queryIndex2Id[index] = id; index++ }
											if (args == null) args = $.extend(true, {}, _args)
											else args.queries.push(...queries)
										}
									}
									if ($.isEmptyObject(args) || $.isEmptyObject(args.queries)) return
									args.batch = true; let {session} = e;
									for (let key of ['session', 'args', 'defer', 'deferFlag', 'batch', 'batchMode', 'batchModeFlag']) delete e[key]
									let _e = {
										timeout: 500000, processData: false, contentType: wsContentTypeVeCharSet,
										data: toJSONStr(args), url: this.getWSUrl({ session, api: 'sqlExec', args: e })
									};
									try {
										let result = Object.values(await ajaxPost(_e));
										for (let index = 0; index < result.length; index++) {
											let id = queryIndex2Id[index], _promise = sqlExecYapi_id2Promise[id];
											if (_promise) { let _result = result[index]; _promise.resolve(_result) }
										}
									}
									catch (ex) {
										for (let index in queryIndex2Id) {
											let id = queryIndex2Id[index], _promise = sqlExecYapi_id2Promise[id];
											if (_promise) _promise.reject(ex)
										}
									}
									finally {
										for (let id of Object.keys(id2SqlExecArgs)) {
											delete id2SqlExecArgs[id]; delete sqlExecYapi_id2Promise[id];
											if ((this._sqlExec_waitTime_queueSize || 0) > 0) this._sqlExec_waitTime_queueSize--
										}
									}
								}
								finally { for (let execTip of Object.keys(execTip2Id2SqlExecArgs)) delete execTip2Id2SqlExecArgs[execTip] }
							}
						}
						finally { delete this._timer_sqlDeferExec }
					}, waitTimeMS, e);
					return promise
				}
			}
		}
		let {session} = e;
		for (let key of ['session', 'args', 'defer', 'deferFlag', 'batch', 'batchMode', 'batchModeFlag']) delete e[key]
		let data = toJSONStr(args); delete e.args; delete e.params;
		let _e = { timeout: 500000, processData: false, contentType: wsContentTypeVeCharSet, data, url: this.getWSUrl({ session, wsPath: this.sqlExecWSPath, api: 'sqlExec', args: e }) };
		console.debug('sqlExec', { defer: false, args: args });
		return ajaxPost(_e)
	}
	wsVIOQueryYapi(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 30000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'vioQueryYapi', args: e })
		})
	}
	shell_lines(e) {
		e = typeof e == 'object' ? e : { data: { cmd: e } };
		return this.wsShell(e).then(result => result?.result)
	}
	shell(e) { return this.shell_lines(e).then(result => result?.join(CrLf)) }
	shell_firstLine(e) { return this.shell_lines(e).then(result => result?.[0]) }
	wsShell(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 300_000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'shell', args: e })
		})
	}
	wsCVMCall(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 120000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'cvmCall', args: e })
		})
	}
	webRequest(e) { e = { data: e }; return this.wsWebRequest(e).then(result => result?.response ?? result) }
	webRequestAsStream(e) { e = { data: e }; return this.wsWebRequestAsStream(e).then(result => result) }
	wsWebRequest(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		let type = e.type ?? data.type; delete data.type;
		return ajaxPost({
			timeout: 300000, processData: false, dataType: type, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'webRequest', args: e })
		})
	}
	wsWebRequestAsStream(e) {
		e = typeof e == 'object' ? e : { data: e };
		let data = e.data ?? e.args; data.stream = true;
		return this.wsWebRequest(e)
	}
	async vioUserListe(e) {
		e = e ?? {}; let {ozelQueryDuzenle} = e, aktifmi = e.aktifmi ?? e.aktif ?? e.aktiflik;
		let query = new MQSent({ from: 'ORTAK..xuser', sahalar: '*' }), {where: wh} = query;
		if (aktifmi != null) { wh.add(`baktifmi ${aktifmi ? '>' : '='} 0`) }
		let _e ={ ...e, query }; ozelQueryDuzenle?.call(this, _e); query = _e.query;
		let recs = await app.sqlExecSelect(query);
		for (let rec of recs) {
			let {xkod, xtanim, xmodulbilgi} = rec;
			let result = await app.xdec([xkod, xtanim, xmodulbilgi]);
			$.extend(rec, { xkod: result[xkod], xtanim: result[xtanim], xmodulbilgi: result[xmodulbilgi] })
		}
		return recs
	}
	wsVIOUserListe(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 300_000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'vioUserListe', args: e })
		})
	}
	wsCRUT(e) {
		e = e || {}; let data = e.data ?? e.args ?? e.queries ?? e.query ?? {};
		for (let key of ['data', 'args', 'queries', 'query']) { delete e[key] }
		if (typeof data == 'object' && !(data.query ?? data.queries)) {
			let isArray = $.isArray(data);
			data = isArray ? { queries: $.makeArray(data) } : { query: data }
		}
		if (!(data == null || typeof data == 'string')) { data = toJSONStr(data) }
		return ajaxPost({
			timeout: 60_000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'crut', args: e })
		})
	}
	wsVioWS(e) {
		e = e || {}; let data = e.data ?? e.args ?? {};
		for (let key of ['data', 'args']) { delete e[key] }
		if (!(data == null || typeof data == 'string')) { data = toJSONStr(data) }
		return ajaxPost({
			timeout: 60_000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'vioWS', args: e })
		})
	}
	wsDosyaListe(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data), url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'dosyaListe', args: e }) })
	}
	wsSqlServerListe(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 8000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'sqlServerListe', args: e })
		})
	}
	wsDBListe(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		if (!data.orderBy) data.orderBy = [`SUBSTRING(name, 3, 2) DESC`, `SUBSTRING(name, 1, 2) DESC`]
		return ajaxPost({
			timeout: 13000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'dbListe', args: e })
		})
	}
	wsDownload(e) {
		e = typeof e == 'object' ? e : { remoteFile: e, localFile: e };
		let data = e.data ?? e.args ?? {};
		for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 500000, processData: false, dataType: 'text', ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'download', args: e }), data: toJSONStr(data)
		})
	}
	wsDownloadAsStream(e) {
		e = typeof e == 'object' ? e : { remoteFile: e, localFile: e };
		return this.wsDownload({ ...e, stream: true })
	}
	wsDownloadAsFile(e) {
		e = typeof e == 'object' ? e : { remoteFile: e, localFile: e };
		return this.wsDownload({ ...e, stream: false })
	}
	wsUpload(e, _data) {
		e = typeof e == 'object' ? e : { localFile: e, remoteFile: e, data: _data };
		let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 60000, processData: false, data, ajaxContentType: `application/octet-stream; charset=utf-8`,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'upload', args: e })
		})
	}
	wsMultiUpload(e) {
		e = typeof e == 'object' ? e : { data: e };
		let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		if ($.isArray(data)) { data = { files: data } } if (typeof data == 'object') { data = toJSONStr(data) }
		return ajaxPost({
			timeout: 60000, processData: false, data, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'multiUpload', args: e })
		})
	}
	wsYardimIcerik(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 30000, processData: false, dataType: 'text', ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'yardimIcerik', args: e }), data: toJSONStr(data)
		})
	}
	wsResimData(e) { e = e || {}; return ajaxGet({ timeout: 30000, processData: false, dataType: null, url: app.getWSUrl({ api: 'resimData', args: e }) }) }
	wsResimDataKaydet(e) {
		e = e || {}; let {data} = e, mimeType = e.mimeType ?? e.contentType ?? e.type; for (let key of ['args', 'data', 'mimeType', 'contentType', 'type']) { delete e[key] }
		return ajaxPost({ timeout: 60000, ajaxContentType: mimeType ?? 'application/octet-stream', processData: false, url: app.getWSUrl({ api: 'resimDataKaydet', args: e }), data })
	}
	wsDBResimData(e) { e = e || {}; return ajaxGet({ timeout: 30000, processData: false, dataType: null, url: app.getWSUrl({ api: 'dbResimData', args: e }) }) }
	wsStokResimParam(e) {
		e = e || {}; let data = e.data ?? e.args ?? {}; for (let key of ['data', 'args']) { delete e[key] }
		return ajaxPost({
			timeout: 13000, processData: false, ajaxContentType: wsContentTypeVeCharSet, data: toJSONStr(data), url: app.getWSUrl({ wsPath: 'ws/genel', api: 'stokResimParam', args: e }) })
	}
	wsResimDataSil(e) { e = e || {}; return ajaxPost({ timeout: 10000, url: app.getWSUrl({ api: 'resimDataSil', args: e }) }) }
	wsFRRaporGoster(e) { return this.wsFRRaporIslemi($.extend({}, e, { tip: 'show' })) }
	wsFRRaporYazdir(e) { return this.wsFRRaporIslemi($.extend({}, e, { tip: 'print' })) }
	wsFRRaporExport_fpx(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'fpx' })) }
	wsFRRaporExport_pdf(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'pdf' })) }
	wsFRRaporExport_pdc(e) { /* PDF (compressed) */ return this.wsFRRaporExport($.extend({}, e, { exportType: 'pdc' })) }
	wsFRRaporExport_html(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'html' })) }
	wsFRRaporExport_mht(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'mht' })) }
	wsFRRaporExport_text(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'text' })) }
	wsFRRaporExport_word(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'word' })) }
	wsFRRaporExport_excel(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'excel' })) }
	wsFRRaporExport_xml(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'xml' })) }
	wsFRRaporExport_csv(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'csv' })) }
	wsFRRaporExport_json(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'json' })) }
	wsFRRaporExport_png(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'png' })) }
	wsFRRaporExport_tiff(e) { return this.wsFRRaporExport($.extend({}, e, { exportType: 'tiff' })) }
	wsFRRaporExport(e) { return this.wsFRRaporIslemi($.extend({}, e, { tip: 'export' })) }
	async wsFRRaporIslemi(e) {
		let qs = $.extend({}, e), result = await this.wsFork(); let {wsPort} = result;
		let {ssl} = config; if (ssl) wsPort += config.class.SSLPortShift
		for (let key of ['frXMLStr', 'dataSource', 'secimler', 'relations', 'yaziciAdi']) {
			let value = qs[key];
			if (value == null || value == '' || $.isEmptyObject(value))
				delete qs[key]
			else {
				let data = value, result = await this.wsWriteTemp({ ssl: ssl, port: wsPort, temp: true, data: data });
				if (!result || result.isError) { return result }
				let tempKey = result.key; qs[key] = (wsPrefixTemp + tempKey)
			}
		}
		return ({ url: this.getWSUrl({ ssl, port: wsPort, api: 'frRaporIslemi', args: qs }) })
	}
	wsEIslemXMLData(e) { e = e || {}; return ajaxGet({ timeout: 60000, dataType: 'text', url: app.getWSUrl({ api: 'eIslemXMLData', args: e }) }) }
	wsEIslemXSLTData(e) { e = e || {}; return ajaxGet({ timeout: 60000, dataType: 'text', url: app.getWSUrl({ api: 'eIslemXSLTData', args: e }) }) }
	wsEIslemXSLTScript(e) { e = e || {}; return ajaxGet({ timeout: 10000, dataType: 'text', url: app.getWSUrl({ api: 'eIslemXSLTScript', args: e }) }) }
	wsEIslemGoruntu(e) { e = e || {}; return ajaxGet({ timeout: 60000, dataType: 'text', url: app.getWSUrl({ api: 'eIslemGoruntu', args: e }) }) }
	wsCariListe(e) { e = e || {}; return ajaxGet({ url: app.getWSUrl({ api: 'cariListe', args: e }) }) }
	wsPlasiyerListe(e) { e = e || {}; return ajaxGet({ url: app.getWSUrl({ api: 'plasiyerListe', args: e }) }) }
	wsPlasiyerIcinCariler(e) { e = e || {}; return ajaxGet({ url: app.getWSUrl({ api: 'plasiyerIcinCariler', args: e }) }) }
	wsStokListe(e) { e = e || {}; return ajaxGet({ url: app.getWSUrl({ api: 'stokListe', args: e }) }) }
	wsStokRBKliListe(e) { e = e || {}; return ajaxGet({ url: app.getWSUrl({ api: 'stokRBKliListe', args: e }) }) }
	wsFiyatListe(e) { e = e || {}; return ajaxGet({ url: app.getWSUrl({ api: 'fiyatListe', args: e }) }) }
	wsCariKaydet(e) {
		let args = e || {}, data = args.data ?? args.args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data; delete args.args;
		return ajaxPost({ timeout: 60 * 60 * 1000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'cariKaydet', args }), data })
	}
	wsIPCTest(e) {
		let args = e || {}, data = args.data ?? args.args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data; delete args.args;
		return ajaxPost({ timeout: 60 * 60 * 1000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'ipcTest', args }), data })
	}
	wsSiparisKaydet(e) {
		let args = e || {}, data = args.data ?? args.args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data; delete args.args;
		return ajaxPost({ timeout: 60 * 60 * 1000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'siparisKaydet', args }), data })
	}
	wsTahsilatKaydet(e) {
		let args = e || {}, data = args.data ?? args.args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data; delete args.args;
		return ajaxPost({ timeout: 60 * 60 * 1000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'tahsilatKaydet', args }), data })
	}
	wsEIslemYap(e) {
		let args = e || {}, data = args.data ?? args.args; if (typeof data == 'object') { data = toJSONStr(data) } delete args.data; delete args.args;
		let {ekArgs} = args; if (typeof ekArgs == 'object') { ekArgs = args.ekArgs = toJSONStr(ekArgs) }
		return ajaxPost({ timeout: 60 * 60 * 1000, processData: false, ajaxContentType: wsContentTypeVeCharSet, url: app.getWSUrl({ api: 'eIslemYap', args }), data })
	}
	wsEMailGonder(e) {
		let args = e || {}, {data} = args;
		if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		let url = app.getWSUrl({ session: null, wsPath: 'ws/eMail', api: 'send', args });
		let timeout = 120 * 1000, processData = false, ajaxContentType = wsContentTypeVeCharSet;
		return ajaxPost({ timeout, processData, ajaxContentType, url, data })
	}
	wsEMailQueue_add(e) {
		let args = e || {}, {data} = args;
		if (typeof data == 'object') { data = toJSONStr(data) } delete args.data;
		let url = app.getWSUrl({ session: null, wsPath: 'ws/eMailQueue', api: 'add', args });
		let timeout = 120 * 1000, processData = false, ajaxContentType = wsContentTypeVeCharSet;
		return ajaxPost({ timeout, processData, ajaxContentType, url, data })
	}
	uzakScript_startTimer(e) {
		e = e || {}; super.uzakScript_startTimer(e);
		let param = (this.params || {}).config || {}; let {uzakScriptURL} = param; if (!uzakScriptURL) { return null }
		let uzakScriptIntervalSecs = asFloat(qs.uzakScriptTekrar || qs.uzakScriptIntervalSecs) || param.uzakScriptIntervalSecs; this.uzakScript_stopTimer(e);
		return this._timer_uzakScript = setTimeout(async () => {
			try { await this.uzakScript_proc(e) }
			catch (ex) { console.error('uzakScript_proc', ex) }
			finally { delete this._timer_uzakScript; if ((uzakScriptIntervalSecs || 0) > 0) this.uzakScript_startTimer(e) }
		}, uzakScriptIntervalSecs * 1000, e)
	}
	async uzakScript_proc(e) {
		e = e || {}; let param = (this.params || {}).config || {}, {uzakScriptURL} = param; if (!uzakScriptURL) return false
		let result = null; try { result = await ajaxGet({ timeout: 0, url: uzakScriptURL, dataType: 'text' }) } catch (ex) { } if (!result) return false
		let funcResult; let func = result ? getFunc.call(this, result) : null;
		if (func) { let _e = $.extend({}, e, { sender: this, app: this }); funcResult = await getFuncValue.call(this, func, _e) } return funcResult
	}
	async getEMailAuth(e) {
		let result = this._eMailAuth; if (result === undefined) {
			let encData = e?.encData || encEMailAuthStr; if (!encData) { return null }
			result = this._eMailAuth = JSON.parse(await this.xdec(Base64.decode(encData)))
		}
		return result
	}
	online() { this._offlineMode = false; return this } offline() { this._offlineMode = true; return this } resetOfflineStatus() { this._offlineMode = null; return this }
}

/*
# RUNNABLES
let {ws} = config, _session = config.session, session = { loginTipi: _session.loginTipi, user: _session.user, pass: _session.pass };
let test = new Ticari_TrnRollbackAll({ ws, session }); await test.run();

# TESTS
let {ws} = config, _session = config.session, session = { loginTipi: _session.loginTipi, user: _session.user, pass: _session.pass };
let test = new Ticari_TrnListTest({ ws, session }); await test.delay(50).runSync(-1)

# REMOTE DEBUG
```javascript
		// remote script url = https://cloud.vioyazilim.com.tr:9200/ws/skyERP/wait/?key=test-script
	let ws = { url: 'https://cloud.vioyazilim.com.tr:9200' }, ipcKey = 'test', scriptKey = `${ipcKey}-script`, callbackKey = `${ipcKey}-callback`;
	try {
		let _ws = config.ws; $.extend(config.ws, ws);
		await app.wsSignal({ key: scriptKey, data: `new (class extends CObject {
			async run(e) {
				let _ws = config.ws; $.extend(config.ws, ${toJSONStr(ws)}); let callbackKey = '${callbackKey}';
				let {params} = app, {yerel, localData} = params, data = { yerel, localData: { data: localData.data } };
				await app.wsWriteTemp({ key: callbackKey, data: toJSONStr(data) });
				setTimeout(() => { app.wsSignal({ key: callbackKey, data: '{}' }); config.ws = _ws }, 3000)
			}
		})()` });
		await app.wsWait({ key: callbackKey }); let data = await app.wsReadTempAsStream({ key: callbackKey }); config.ws = _ws;
		if (data?.isError) { throw data }; console.table(data)
	}
	catch (ex) { console.error(ex) }

	
	await app.wsSignal({ key: 'debug-script', data: `(e => { '${newGUID()}'; app.wsWriteTemp({ key: 'debug-pc', data: toJSONStr({a: '<?xml version="1.0"?><xroot>a</xroot>' }) }) })` });
	setTimeout(async () => console.debug( (await app.wsReadTempAsStream({ key: 'debug-pc' })) ), 2000)
	
	await app.wsSignal({ key: 'debug-script', data: `(e => { '${newGUID()}'; app.wsWriteTemp({ key: 'debug-pc', data: toJSONStr(app.params.localData?.data) }) })` });
	setTimeout(async () => console.table( (await app.wsReadTempAsStream({ key: 'debug-pc' })) ), 2000)
```

# EVENT SOURCE
let es = new EventSource(app.getEventStreamURL('a'));
es.onmessage = evt => console.warn('es', JSON.parse(evt.data));
es.onerror = evt => console.error('es', evt);
await new $.Deferred(p => setTimeout(() => p.resolve(), 100));
await app.wsSignal({ key: 'a', data: toJSONStr({ result: true }) })

# PAVO
let headers = { serialNumber: 'PAV210000852', ip: '192.168.1.36', ssl: true };
let actions = [
    { ...headers, api: 'AbortCurrentPayment', args: {} },
    { ...headers, api: 'CancelSale', args: { Sale: { OrderNo: '692298141' } } }
];
let api = 'run', args = {};
let data = toJSONStr({ actions });
let url = `http://localhost:8200/ws/api/pavo/${api}/?${$.param(args)}`;
let processData = false, ajaxContentType = wsContentTypeVeCharSet;
try {
    let results = Object.values(await ajaxPost({ processData, ajaxContentType, url, data }))[0];
    results = results.map(x => ({ seq: x.trn?.TransactionSequence, ...x.args, ...x.action, ...x.result }));
    console.table(results)
}
catch (ex) { console.error(getErrorText(ex)) }
*/
