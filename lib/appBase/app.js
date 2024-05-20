class App extends AppBase {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get superDefaultWSPath() { return super.defaultWSPath } get defaultWSPath() { return `${super.defaultWSPath}/skyERP` }
	get autoExecMenuId() { return this._autoExecMenuId } get sqlDeferWaitMS() { return 100 } get configParamSinif() { return MQYerelParamConfig }
	get raporEkSahaDosyalari() { let result = this._raporEkSahaDosyalari; if (!result) { const _e = { liste: [] }; this.raporEkSahaDosyalariDuzenle(_e); result = _e.liste } return result }
	
	constructor(e) {
		super(e); e = e || {}; const _wsSQL = qs.sql; this.wsSQL = ( _wsSQL ? ( typeof _wsSQL == 'object' ? _wsSQL : JSON.parse(_wsSQL) ) : null ) || null;
		$.extend(this, { mqGlobals: {}, params: {}, sabitTanimlar: {}, temps: {}, promise_login: new $.Deferred(), promise_ready: new $.Deferred() })
	}
	init(e) { super.init(e); this.params.config = this.configParamSinif.getInstance() }
	async afterRun(e) {
		await super.afterRun(e); const {promise_login} = this; if (promise_login) await promise_login
		let promises = [];
		if (!this._ilkIslemlerYapildimi) {
			const {params, sabitTanimlar} = this;
			this.paramsDuzenle({ params }); promises.push(this.paramsDuzenleSonrasi(e));
			this.sabitTanimlarDuzenle({ sabitTanimlar }); promises.push(this.sabitTanimlarDuzenleSonrasi(e));
			this._ilkIslemlerYapildimi = true
		}
		if (promises && promises.length) { try { await Promise.all(promises) } catch (ex) { console.error(ex); debugger } }
		this.uzakScript_startTimer(e);
		setTimeout(() => { let {promise_ready} = this; if (promise_ready) { promise_ready.resolve(e) } this._initFlag = true }, 50)
	}
	paramsDuzenle(e) { /* const {params} = e */ }
	async paramsDuzenleSonrasi(e) {
		const {params} = this;
		for (const key in params) {
			let param = await params[key]; params[key] = param;
			if (param) { const {_promise} = param; if (_promise) { try { param = params[key] = await _promise } catch (ex) { console.error('params', key, getErrorText(ex), ex) } } }
		}
	}
	sabitTanimlarDuzenle(e) { }
	async sabitTanimlarDuzenleSonrasi(e) {
		const {sabitTanimlar} = this;
		for (const key in sabitTanimlar) {
			const tanim = sabitTanimlar[key];
			if (tanim) { try { sabitTanimlar[key] = await tanim } catch (ex) { sabitTanimlar[key] = null; console.error('sabitTanimlar', key, getErrorText(ex), ex) } }
		}
	}
	raporEkSahaDosyalariDuzenle(e) { }
	async anaMenuOlustur(e) {
		const divMenu = this.divMenu = this.layout.find(`#anaMenu`), frMenu = this.frMenu = await this.getAnaMenu();
		if (frMenu && (divMenu && divMenu.length)) await frMenu.menuLayoutOlustur({ parent: divMenu })
		this.anaMenuOlusturSonrasi(e)
	}
	anaMenuOlusturSonrasi(e) { this.navBarDuzenle(e); this.anaMenuOlusturSonrasiDevam(e) }
	navBarDuzenle(e) {
		const {frMenu, mainNav} = this;
		if (frMenu) frMenu.navLayoutOlustur({ parent: mainNav })
	}
	navLayoutOlustur_araIslem(e) {
		const items = [
			new FRMenuChoice({ id: '_ayarlar', text: `<span class="img"/><span class="text">Ayarlar</span>`, block: e => app.ayarlarIstendi(e) }),
			new FRMenuChoice({ id: '_scale', text: `<span class="img"/><span class="text">Boyutlandır</span>`, block: e => app.scaleIstendi(e) }),
			new FRMenuChoice({ id: '_fullScreen', text: `<span class="img"/><span class="text">Tam Ekran</span>`, block: e => app.toggleFullScreen(e) }),
			new FRMenuChoice({ id: '_logout', text: `<span class="img"/><span class="text">Çıkış</span>`, block: e => app.logoutIstendi(e) })
		];
		for (const item of items) item.navLayoutOlustur(e)
	}
	anaMenuOlusturSonrasiDevam(e) {
		const {mainNav, btnMainNavToggle} = this;
		if (mainNav?.length) {
			let mainNav_menu = mainNav.children('ul'); if (!mainNav_menu.length) { mainNav_menu = mainNav } makeScrollable(mainNav_menu);
			mainNav.jqxResponsivePanel({ width: false, height: false, collapseBreakpoint: 10000, toggleButton: btnMainNavToggle, animationType: animationType, autoClose: true })
			if (btnMainNavToggle && btnMainNavToggle.length) { btnMainNavToggle.removeClass('jqx-hidden basic-hidden') } mainNav.removeClass('jqx-hidden basic-hidden')
			setTimeout(() => { const hizliBulPart = this.frMenu?.part?.hizliBulPart; if (hizliBulPart?.focus) { hizliBulPart.focus() } }, 100)
		}
		else { if (btnMainNavToggle?.length) btnMainNavToggle.addClass('jqx-hidden') }
		
		let sonIslemlerExecFlag = false; const menuId = qs.menuId || qs.menuID || qs.menuAdim || qs.menu || this.autoExecMenuId;
		if (menuId) {
			const {frMenu} = this;
			if (frMenu) {
				const menuItem = frMenu.mne2Item[menuId];
				if (menuItem) {
					this.hideBasic(); sonIslemlerExecFlag = true;
					setTimeout(async () => {
						const menuPart = frMenu.part;
						if (menuPart) { let parentItem = menuItem; if (parentItem.choicemi) { parentItem = parentItem.parentItem } menuPart.parentItem = parentItem; await menuPart.tazele() }
						try { setTimeout(async () => { await this.promise_ready; await menuItem.run(); setTimeout(() => this.sonIslemler(e), 0) }, 0) }
						catch (ex) { setTimeout(() => this.show(), 10); const errorText = getErrorText(ex); displayMessage(errorText); throw ex }
					}, 1)
				}
			}
		}
		if (!sonIslemlerExecFlag) { sonIslemlerExecFlag = true; setTimeout(() => this.sonIslemler(e), 0) }
	}
	async sonIslemler(e) {
		let {promise_ready} = this; if (promise_ready) await promise_ready
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
			try { await promise } catch (ex) { const errorText = getErrorText(ex); displayMessage(errorText); throw ex }
		}
		setTimeout(() => { const {activePart} = this; if (!activePart || activePart == this) this.show(); else this.hide() }, 100)
	}
	async barkodBilgiBelirleBasit(e) {
		e = e || {}; if (typeof e != 'object') e = { barkod: e };
		e.basitmi = true; return await this.barkodBilgiBelirle(e)
	}
	async barkodBilgiBelirle(e) {
		e = e || {}; if (typeof e != 'object') e = { barkod: e }
		const barkod = (e.barkod || '').trim(); if (!barkod) return null
		const basitmi = e.basitmi ?? e.basit ?? e.basitFlag, {carpan} = e;
		if (barkod.length > 2) {
			const kural = await BarkodParser_Kuralli.kuralFor({ basitmi, carpan, barkod, basKod: barkod.substring(0, 2) });
			if (kural) { const parser = await kural.parseSonucu(e); if (parser) return parser }
		}
		if (!basitmi) {
			const parser = new BarkodParser_Referans({ basitmi, carpan, barkod });
			if (parser.parse(e)) return parser
		}
		return null
	}
	async sqlGetConstraints(e, _typeDizi, _tableLike) {
		let nameDizi = typeof e == 'object' ? (e.name || e.names || e.table || e.tablo || e.tables) : e;
		let typeDizi = typeof e == 'object' ? (e.type || e.typeDizi) : _typeDizi, tableLike = typeof e == 'object' ? e.tableLike : _tableLike;
		const sent = new MQSent({
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
		const stm = new MQStm({ sent, orderBy: ['name'] }), result = {}, recs = await app.sqlExecSelect(stm);
		for (const rec of recs) result[rec.name] = rec
		return result
	}
	sqlGetTables(e, _tableLike) {
		let nameDizi = typeof e == 'object' ? (e.name || e.names || e.table || e.tablo || e.tables) : e;
		let tableLike = typeof e == 'object' ? e.tableLike : _tableLike;
		return this.sqlGetConstraints({ name: nameDizi, type: 'U', tableLike: tableLike })
	}
	async sqlGetColumns(e, _nameDizi, _typeDizi, _nameLike) {
		const table = typeof e == 'object' ? (e.table || e.tablo) : e;
		let nameDizi = typeof e == 'object' ? (e.name || e.names) : _nameDizi, typeDizi = typeof e == 'object' ? (e.type || e.types) : _typeDizi;
		let nameLike = typeof e == 'object' ? e.nameLike : _nameLike;
		const sent = new MQSent({
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
		if (nameLike) sent.where.like({ deger: nameLike, saha: 'name', aynenAlinsinmi: true, yazildigiGibimi: true })
		const stm = new MQStm({ sent: sent, orderBy: ['name'] }), result = {}, recs = await app.sqlExecSelect(stm);
		for (const rec of recs) result[rec.name] = rec
		return result
	}
	sqlExecNoneWithResult(e) {
		e = e || {}; if (!(e.query ?? e.queries)) e = { query: e };
		const _e = $.extend({}, e, { execTip: 'none' }); delete _e.tip; return this.sqlExec(_e)
	}
	sqlExecNone(e) {
		return this.sqlExecNoneWithResult(e).then(results => {
			for (const i in results) {
				let result = results[i]; const {rowsAffected} = (result || {});
				results[i] = result = (rowsAffected == null ? result : rowsAffected)
			}
			return results && results.length < 2 ? results[0] : results
		})
	}
	sqlExecSelect(e) {
		e = e || {}; if (!(e.query ?? e.queries)) e = { query: e };
		const _e = $.extend({}, e, { execTip: 'dt' }); delete _e.tip; return this.sqlExec(_e)
	}
	sqlExecSP(e) {
		e = e || {}; if (!(e.query ?? e.queries)) e = { query: e };
		const _e = $.extend({}, e, { execTip: 'sp' }); delete _e.tip; return this.sqlExec(_e)
	}
	sqlExecTekil(e) {
		e = e || {}; if (!(e.query ?? e.queries)) e = { query: e }; e.maxRow = 2; let promise = this.sqlExecSelect(e);
		if (promise) { promise = promise.then(recs => { if (recs && recs.length > 1) console.warn('Birden çok kayıt geldi', e); return recs[0] }) }
		return promise
	}
	sqlExecTekilDeger(e) {
		let promise = this.sqlExecTekil(e); if (promise) promise = promise.then(rec => Object.values(rec || {})[0])
		return promise
	}
	async sqlExec(e) {
		if (!this._useYapildiFlag) { const {wsSQL} = this; if (wsSQL?.db) { await this._sqlExec({ execTip: 'none', query: `USE ${wsSQL.db}` }); this._useYapildiFlag = true } }
		return await this._sqlExec(e)
	}
	_sqlExec(e) {
		e = e || {}; if (!(e.query ?? e.queries)) e = { query: e }
		const {wsArgs, params} = e, execTip = e.execTip || e.tip; let queries = e.query ?? e.queries; if (queries && !$.isArray(queries)) queries = [queries]
		const _firstQuery = (queries || [])[0], firstQueryOrSelf = typeof _firstQuery == 'object' ? _firstQuery : e; let offset = 0, maxRow, recordStartIndex, recordEndIndex;
		for (const source of [firstQueryOrSelf, e]) {
			if (!source) continue
			let value = source.offset; if (value != null) offset = value; value = source.maxRow ?? source.maxrow;
			if (!value) { const _limit = (source.paketSayisi ?? source.limit); if (_limit) value = offset + _limit } if (value != null) maxRow = value
			value = source.recordStartIndex ?? source.recordStartIndex ?? source.startIndex ?? source.startindex ?? source.offset; if (value != null) recordStartIndex = value
			value = source.recordEndIndex ?? source.recordEndIndex ?? source.endIndex ?? source.endindex; if (value != null) recordEndIndex = value
		}
		const _e = $.extend({}, e),  keys = ['wsArgs', 'query', 'queries', /*'params'*/];
		for (const key of keys) delete _e[key];
		if (wsArgs) $.extend(_e, wsArgs)
		if (offset != null) _e.offset = offset; if (maxRow != null) _e.maxRow = maxRow || limit
		if (recordStartIndex != null) _e.recordStartIndex = recordStartIndex; if (recordEndIndex != null) _e.recordEndIndex = recordEndIndex
		const args = _e.args = _e.args ?? {}; if (execTip) args.execTip = execTip; if (queries) args.queries = queries; if (params) args.params = params
		if (_e.offset) { delete _e.pageindex; delete _e.recordstartindex; delete _e.recordStartIndex }
		if (_e.maxRow) { delete _e.pagesize; delete _e.recordendindex; delete _e.recordEndIndex }
		return this.wsSqlExec(_e)
	}
	wsSqlExec(e) {
		const deferFlag = e.batch ?? e.batchMode ?? e.defer ?? e.deferFlag, {args} = e, {params} = args; delete args.params;
		if (args.query) { args.queries = [args.query]; delete _args.query }
		if (args.queries) {
			const {queries} = args;
			for (let i = 0; i < queries.length; i++) {
				let query = queries[i]; if (query.getQueryYapi) query = query.getQueryYapi()
				if (typeof query != 'object') query = queries[i] = { query }
				if (typeof query.query == 'object') query.query = query.query?.toString()
				if (!$.isEmptyObject(params)) { const _params = query.params = query.params || []; _params.push(...params) }
				queries[i] = query
			}
		}
		if (!args.execTip) args.execTip = 'dt'
		if (deferFlag) {
			const {execTip, queries} = args; let uygunmu = !$.isEmptyObject(queries);
			if (uygunmu) { for (const query of queries) { if (!(query && typeof query == 'object' && $.isEmptyObject(query.params))) { uygunmu = false; break } } }
			if (uygunmu) {
				const id = e.id = e.id || newGUID(), execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs || {};
				const id2SqlExecArgs = execTip2Id2SqlExecArgs[execTip] = execTip2Id2SqlExecArgs[execTip] || {}; if (id2SqlExecArgs[id]) { uygunmu = false }
				if (uygunmu) {
					const sqlExecArgs = id2SqlExecArgs[id] = id2SqlExecArgs[id] || []; sqlExecArgs.push(args);
					const sqlExecYapi_id2Promise = this._sqlExecYapi_id2Promise = this._sqlExecYapi_id2Promise || {};
					const promise = new $.Deferred(); /* sqlExecYapi_id2Promise[id] = promise; */
					/*let {_timer_sqlDeferExec} = this; if (_timer_sqlDeferExec) clearTimeout(_timer_sqlDeferExec);*/
					let sqlExec_waitTime_queueSize = this._sqlExec_waitTime_queueSize = this._sqlExec_waitTime_queueSize || 0;
					let waitTimeMS = asFloat(qs.sqlBatchWait ?? qs.sqlDeferWait ?? this.sqlDeferWaitMS)
											* (sqlExec_waitTime_queueSize > 1 ? Math.max(sqlExec_waitTime_queueSize - 2, 0) * 1.3 : 0);
					this._sqlExec_waitTime_queueSize++;
					console.debug('sqlExec', { defer: deferFlag, queueSize: sqlExec_waitTime_queueSize, waitTimeMS, execTip, id, args });
					let _timer_sqlDeferExec = setTimeout(async e => {
						try {
							const execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs = this._execTip2Id2SqlExecArgs || {};
							for (const execTip in execTip2Id2SqlExecArgs) {
								try {
									const id2SqlExecArgs = execTip2Id2SqlExecArgs[execTip];
									if ($.isEmptyObject(id2SqlExecArgs)) continue
									let args, index = 0; const queryIndex2Id = {};
									for (const id in id2SqlExecArgs) {
										const _argsListe = id2SqlExecArgs[id] || [];
										for (const _args of _argsListe) {
											const {queries} = _args;
											if ($.isEmptyObject(queries)) continue
											for (const key in queries) { const query = queries[key]; queryIndex2Id[index] = id; index++ }
											if (args == null) args = $.extend(true, {}, _args)
											else args.queries.push(...queries)
										}
									}
									if ($.isEmptyObject(args) || $.isEmptyObject(args.queries)) return
									args.batch = true; const {session} = e;
									for (const key of ['session', 'args', 'defer', 'deferFlag', 'batch', 'batchMode', 'batchModeFlag']) delete e[key]
									const _e = {
										timeout: 500000, processData: false, contentType: wsContentTypeVeCharSet,
										data: toJSONStr(args), url: this.getWSUrl({ session, api: 'sqlExec', args: e })
									};
									try {
										const result = Object.values(await ajaxPost(_e));
										for (let index = 0; index < result.length; index++) {
											const id = queryIndex2Id[index], _promise = sqlExecYapi_id2Promise[id];
											if (_promise) { const _result = result[index]; _promise.resolve(_result) }
										}
									}
									catch (ex) {
										for (const index in queryIndex2Id) {
											const id = queryIndex2Id[index], _promise = sqlExecYapi_id2Promise[id];
											if (_promise) _promise.reject(ex)
										}
									}
									finally {
										for (const id of Object.keys(id2SqlExecArgs)) {
											delete id2SqlExecArgs[id]; delete sqlExecYapi_id2Promise[id];
											if ((this._sqlExec_waitTime_queueSize || 0) > 0) this._sqlExec_waitTime_queueSize--
										}
									}
								}
								finally { for (const execTip of Object.keys(execTip2Id2SqlExecArgs)) delete execTip2Id2SqlExecArgs[execTip] }
							}
						}
						finally { delete this._timer_sqlDeferExec }
					}, waitTimeMS, e);
					return promise
				}
			}
		}
		const {session} = e;
		for (const key of ['session', 'args', 'defer', 'deferFlag', 'batch', 'batchMode', 'batchModeFlag']) delete e[key]
		const data = toJSONStr(args); delete e.args; delete e.params;
		const _e = { timeout: 500000, processData: false, contentType: wsContentTypeVeCharSet, data, url: this.getWSUrl({ session, wsPath: this.sqlExecWSPath, api: 'sqlExec', args: e }) };
		console.debug('sqlExec', { defer: false, args: args });
		return ajaxPost(_e)
	}
	wsVIOQueryYapi(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 30000, processData: false, ajaxContentType: wsContentType, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'vioQueryYapi', args: e })
		})
	}
	wsShell(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 120000, processData: false, ajaxContentType: wsContentType, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'shell', args: e })
		})
	}
	wsCVMCall(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 120000, processData: false, ajaxContentType: wsContentType, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'cvmCall', args: e })
		})
	}
	wsWebRequest(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 300000, processData: false, dataType: e.type, ajaxContentType: wsContentType, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'webRequest', args: e })
		})
	}
	wsWebRequestAsStream(e) {
		e = e || {}; const args = e.args = e.args || {};
		args.stream = true; return this.wsWebRequest(e)
	}
	wsDosyaListe(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 60000, processData: false, ajaxContentType: wsContentType, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'dosyaListe', args: e })
		})
	}
	wsSqlServerListe(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 8000, processData: false, ajaxContentType: wsContentType, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'sqlServerListe', args: e })
		})
	}
	wsDBListe(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		if (!data.orderBy) data.orderBy = [`SUBSTRING(name, 3, 2) DESC`, `SUBSTRING(name, 1, 2) DESC`]
		return ajaxPost({
			timeout: 13000, processData: false, ajaxContentType: wsContentType, data: toJSONStr(data),
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'dbListe', args: e })
		})
	}
	wsDownloadAsStream(e) { return this.wsDownload($.extend({}, e, { stream: true })) }
	wsDownloadAsFile(e) { return this.wsDownload($.extend({}, e, { stream: false })) }
	wsDownload(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 500000, processData: false, dataType: 'text', ajaxContentType: wsContentType,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'download', args: e }), data: toJSONStr(data)
		})
	}
	wsUpload(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 13000, processData: false, data,
			ajaxContentType: `application/octet-stream; charset=utf-8`,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'upload', args: e })
		})
	}
	wsYardimIcerik(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			timeout: 13000, processData: false, dataType: 'text', ajaxContentType: wsContentType,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'yardimIcerik', args: e }), data: toJSONStr(data)
		})
	}
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
		const qs = $.extend({}, e), result = await this.wsFork(); let {wsPort} = result;
		const {ssl} = config; if (ssl) wsPort += config.class.SSLPortShift
		for (const key of ['frXMLStr', 'dataSource', 'secimler', 'relations', 'yaziciAdi']) {
			const value = qs[key];
			if (value == null || value == '' || $.isEmptyObject(value))
				delete qs[key]
			else {
				const data = value, result = await this.wsWriteTemp({ ssl: ssl, port: wsPort, temp: true, data: data });
				if (!result || result.isError) return result
				const tempKey = result.key; qs[key] = (wsPrefixTemp + tempKey)
			}
		}
		return ({ url: this.getWSUrl({ ssl, port: wsPort, api: 'frRaporIslemi', args: qs }) })
	}
	wsEIslemXMLData(e) { e = e || {}; return ajaxGet({ timeout: 60000, dataType: 'text', url: app.getWSUrl({ api: 'eIslemXMLData', args: e }) }) }
	wsEIslemXSLTData(e) { e = e || {}; return ajaxGet({ timeout: 60000, dataType: 'text', url: app.getWSUrl({ api: 'eIslemXSLTData', args: e }) }) }
	wsEIslemXSLTScript(e) { e = e || {}; return ajaxGet({ timeout: 10000, dataType: 'text', url: app.getWSUrl({ api: 'eIslemXSLTScript', args: e }) }) }
	wsEIslemYap(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		let {ekArgs} = e; if (typeof ekArgs == 'object') ekArgs = e.ekArgs = toJSONStr(ekArgs)
		return ajaxPost({
			timeout: 40 * 60 * 1000, processData: false, ajaxContentType: wsContentType,
			url: app.getWSUrl({ api: 'eIslemYap', args: e }), data: toJSONStr(data)
		})
	}
	async sonDegisenDosyalar(e) {
		e = e || {}; const gunSayi = e.gunSayi ?? 0, {dir} = e, recursiveFlag = e.recursive ?? e.recursiveFlag ?? false;
		const pattern = e.pattern ?? e.mask, _today = today().addDays(-gunSayi);
		let recs = (await app.wsDosyaListe({ dir, recursive: recursiveFlag, pattern }))?.recs;
		recs = recs.filter(rec => asDate(rec.lastWriteTime) >= _today)
					.map(rec => { return { name: rec.name, relDir: rec.relDir, size: rec.size, lastWriteTime: asDate(rec.lastWriteTime) } })
					.sort((a, b) => a.lastWriteTime.getTime() < b.lastWriteTime.getTime() ? 1 : -1); return recs
	}
	sonDegisenDosyalar_skyERP(e) {
		e = e || {}; $.extend(e, {
			gunSayi: e.gunSayi ?? 3, dir: e.dir || '/appserv/www/skyerp',
			recursive: e.recursive ?? e.recursiveFlag ?? true, pattern: e.pattern ?? e.mask ?? '*.js'
		});
		for (const key of ['recursiveFlag', 'mask']) delete e[key]
		return this.sonDegisenDosyalar(e)
	}
	async xuserTanimYukle(e) {
		const {session} = config, {user} = session, xkod = await app.wsXEnc(user);
		let rec = await app.sqlExecTekil(new MQSent({ from: 'ORTAK..xuser', where: { degerAta: xkod, saha: 'xkod' }, sahalar: ['xkod', 'xtanim', 'xmodulbilgi'] }));
		const enc = [rec.xkod, rec.xtanim, rec.xmodulbilgi], dec = await app.wsXDec(enc); $.extend(rec, { xkod: dec[0], xtanim: dec[1], xmodulbilgi: dec[2] });
		const sep = '\u00ff', parts = rec.xmodulbilgi.split(sep); let subParts;
		for (const part of parts) { const _subParts = part.trim().split('\t'); if (_subParts.length >= 4 && _subParts[0].startsWith('Sube')) { subParts = _subParts; break } }
		if (!subParts) { return false } const tRec = session.subeYapi = { subeKod: subParts[1], subeGecerlilik: subParts[2] == 'T' ? 'T' : subParts[4] };
		tRec.subeGrupKod = (await app.sqlExecTekilDeger(new MQSent({ from: 'isyeri', where: { degerAta: tRec.subeKod, saha: 'kod' }, sahalar: 'isygrupkod' })))?.trimEnd()
	}

	getAnaMenu(e) { return null }
	buildAjaxArgs(e) {
		e = e || {}; const {args} = e; if (!args) return
		super.buildAjaxArgs(e); if (!args.sql) { const {wsSQL} = this; if (wsSQL) { args.sql = toJSONStr(wsSQL) } }
	}
	uzakScript_startTimer(e) {
		e = e || {}; super.uzakScript_startTimer(e);
		const param = (this.params || {}).config || {}; const {uzakScriptURL} = param; if (!uzakScriptURL) return null
		const uzakScriptIntervalSecs = asFloat(qs.uzakScriptTekrar || qs.uzakScriptIntervalSecs) || param.uzakScriptIntervalSecs; this.uzakScript_stopTimer(e);
		return this._timer_uzakScript = setTimeout(async () => {
			try { await this.uzakScript_proc(e) }
			catch (ex) { console.error('uzakScript_proc', ex) }
			finally { delete this._timer_uzakScript; if ((uzakScriptIntervalSecs || 0) > 0) this.uzakScript_startTimer(e) }
		}, uzakScriptIntervalSecs * 1000, e)
	}
	async uzakScript_proc(e) {
		e = e || {}; const param = (this.params || {}).config || {}, {uzakScriptURL} = param; if (!uzakScriptURL) return false
		let result = null; try { result = await ajaxGet({ timeout: 0, url: uzakScriptURL, dataType: 'text' }) } catch (ex) { } if (!result) return false
		let funcResult; const func = result ? getFunc.call(this, result) : null;
		if (func) { const _e = $.extend({}, e, { sender: this, app: this }); funcResult = await getFuncValue.call(this, func, _e) } return funcResult
	}
}

/*
# REMOTE DEBUG
```javascript
		// remote script url = https://cloud.vioyazilim.com.tr:9200/ws/skyERP/wait/?key=test-script
	const ws = { url: 'https://cloud.vioyazilim.com.tr:9200' }, ipcKey = 'test', scriptKey = `${ipcKey}-script`, callbackKey = `${ipcKey}-callback`;
	try {
		const _ws = config.ws; $.extend(config.ws, ws);
		await app.wsSignal({ key: scriptKey, data: `new (class extends CObject {
			async run(e) {
				const _ws = config.ws; $.extend(config.ws, ${toJSONStr(ws)}); const callbackKey = '${callbackKey}';
				const {params} = app, {yerel, localData} = params, data = { yerel, localData: { data: localData.data } };
				await app.wsWriteTemp({ key: callbackKey, data: toJSONStr(data) });
				setTimeout(() => { app.wsSignal({ key: callbackKey, data: '{}' }); config.ws = _ws }, 3000)
			}
		})()` });
		await app.wsWait({ key: callbackKey }); const data = await app.wsReadTempAsStream({ key: callbackKey }); config.ws = _ws;
		if (data?.isError) { throw data }; console.table(data)
	}
	catch (ex) { console.error(ex) }

	
	await app.wsSignal({ key: 'debug-script', data: `(e => { '${newGUID()}'; app.wsWriteTemp({ key: 'debug-pc', data: toJSONStr({a: '<?xml version="1.0"?><xroot>a</xroot>' }) }) })` });
	setTimeout(async () => console.debug( (await app.wsReadTempAsStream({ key: 'debug-pc' })) ), 2000)
	
	await app.wsSignal({ key: 'debug-script', data: `(e => { '${newGUID()}'; app.wsWriteTemp({ key: 'debug-pc', data: toJSONStr(app.params.localData?.data) }) })` });
	setTimeout(async () => console.table( (await app.wsReadTempAsStream({ key: 'debug-pc' })) ), 2000)
```
*/
