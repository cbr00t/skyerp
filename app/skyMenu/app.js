class SkyMenuApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get grids() {
		return [this.grid_programlar, this.grid_vtListe].filter(x => !!x);
	}
	
	constructor(e) {
		super(e);
	}
	
	async runDevam(e) {
		await super.runDevam(e);

		const {promise_login} = this;
		const loginPart = this.loginPart = new LoginPart();
		try {
			const result = await loginPart.run();
			if (promise_login)
				promise_login.resolve(result);
		}
		catch (ex) {
			if (promise_login)
				promise_login.reject(ex);
			throw ex;
		}
		finally {
			delete this.loginPart;
		}

		this.updateAppTitle(e);

		this.show();
		this.initGrid_programlar();
		this.initGrid_vtListe();
		
		setTimeout(() => this.onResize(), 1)
	}

	initGrid_programlar(e) {
		const {layout} = this;
		const gridPart = this.grid_programlar = new GridliGostericiPart({
			layout: layout.find('#programlar'),
			tabloKolonlari: [
				new GridKolon({ belirtec: 'paketAdi', text: 'Paket Adı' }),
				new GridKolon({ belirtec: 'vtBelirtec', text: ' ', genislikCh: 8 }).alignCenter()
			],
			argsDuzenle: e => {
				const {args} = e;
				$.extend(args, {
					rowsHeight: 75,
					selectionMode: 'multipleRowsExtended', showFilterRow: true
				});
			},
			loadServerData: e => {
				const {wsArgs} = e;
				return [
					{ paketAdi: 'Sky Ticari', vtBelirtec: 'XTIC', localApp: true, appPath: 'ticari' },
					{ paketAdi: 'Sky Üretim Veri Toplama', vtBelirtec: 'XUVT', localApp: true, appPath: 'uretimVeriToplama' }
					/*{ paketAdi: 'Fatura Test', vtBelirtec: 'T01', localApp: true, appPath: 'test/fatTestApp' },
					{ paketAdi: 'Grid Test', vtBelirtec: 'T02', localApp: true, appPath: 'test/gridTestApp' }*/
				]
				/*return this.wsSqlExec({
					args: {
						execTip: 'dt',
						query: ``,
						recordStartIndex: e.recordstartindex == null ? '' : e.recordstartindex,
						recordEndIndex: e.recordendindex == null ? '' : e.recordendindex
					}
				})*/
			}
		});
		gridPart.run();

		const {grid} = gridPart;
		grid.on('rowclick', evt => {
			setTimeout(() => {
				const {grid_vtListe} = this;
				if (grid_vtListe) {
					const subGrid = grid_vtListe.grid;
					const rec = evt.args.row;
					if (rec && subGrid && subGrid.length)
						subGrid.jqxGrid('updateBoundData');
				}
			}, 100);
		});
		grid.on('bindingcomplete', evt => {
			const {grid_programlar} = this;
			const grid = grid_programlar.grid;
			grid.jqxGrid('selectRow', 0);
		});
	}

	initGrid_vtListe(e) {
		const {layout} = this;
		const gridPart = this.grid_vtListe = new GridliGostericiPart({
			layout: layout.find('#vtListe'),
			tabloKolonlari: [
				new GridKolon({ belirtec: 'vtAdi', text: 'VT Adı' }),
				new GridKolon({
					belirtec: 'vtBelirtec', text: ' ', genislikCh: 8
					/*cellsRenderer: (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
						const {vtAdi} = rec;
						const text = vtAdi && vtAdi.length > 2 ? vtAdi.substr(0, 2).toUpperCase() : '';
						return changeTagContent(html, text);
					}*/
				}).alignCenter()
			],
			argsDuzenle: e => {
				const {args} = e;
				$.extend(args, {
					rowsHeight: 60,
					selectionMode: 'singleRow', showFilterRow: true
				});
			},
			loadServerData: async e => {
				e = e || {};
				const parentGrid = (this.grid_programlar || {}).grid;
				const parentRowIndex = parentGrid && parentGrid.length ? parentGrid.jqxGrid('selectedrowindex') : null;
				const parentRec = parentRowIndex == null || parentRowIndex < 0 ? null : parentGrid.jqxGrid('getRowData', parentRowIndex);
				const vtBelirtec = parentRec && !parentRec.localApp ? (parentRec.vtBelirtec || '').toUpperCase() :  null;

				const {wsArgs} = e;
				let server;
				if (server)
					wsArgs.sql = toJSONStr({ server: server, db: 'ORTAK' });
	
				if ($.isEmptyObject(wsArgs.orderBy)) {
					wsArgs.orderBy = [
						`SUBSTRING(name, 3, 2) DESC`,
						`SUBSTRING(name, 1, 2) DESC`
					].join(delimWS);
				}

				const ozelVTAdiSet = asSet(['master', 'tempdb', 'ORTAK', 'GECICI', 'VTORTAK']);
				const _recs = await this.wsDBListe(wsArgs);
				let recs = [];
				for (const i in _recs) {
					const vtAdi = _recs[i];
					if (ozelVTAdiSet[vtAdi.toUpperCase()])
						continue;
					
					const rec = { vtAdi: vtAdi };
					if (!rec.vtBelirtec)
						rec.vtBelirtec = vtAdi && vtAdi.length > 2 ? vtAdi.substr(0, 2).toUpperCase() : null;
					recs.push(rec);
				}
				if (vtBelirtec) {
					recs = recs.filter(rec =>
						!vtBelirtec || parentRec.localApp || rec.vtBelirtec == vtBelirtec);
				}
				
				return recs;

				
				/*return this.wsSqlExec({
					args: {
						execTip: 'dt',
						query: ``,
						recordStartIndex: e.recordstartindex == null ? '' : e.recordstartindex,
						recordEndIndex: e.recordendindex == null ? '' : e.recordendindex
					}
				})*/
			}
		});
		gridPart.run();

		const {grid} = gridPart;
		grid.on('bindingcomplete', evt => {
			const {grid_vtListe} = this;
			const grid = grid_vtListe.grid;
			grid.jqxGrid('clearSelection');
		});
		grid.on('rowdoubleclick', evt => {
			const parentGrid = (this.grid_programlar || {}).grid;
			const parentRowIndex = parentGrid && parentGrid.length ? parentGrid.jqxGrid('selectedrowindex') : null;
			const parentRec = parentRowIndex == null || parentRowIndex < 0 ? null : parentGrid.jqxGrid('getRowData', parentRowIndex);
			
			this.vtListe_satirCiftTiklandi({
				event: evt,
				progRec: parentRec,
				dbRec: evt.args.row.bounddata
			})
		});
	}

	progBaslat(e) {
		e = e || {};
		let {progRec, dbRec} = e;
		if (!progRec) {
			const grid = (this.grid_programlar || {}).grid;
			const rowIndex = grid && grid.length ? grid.jqxGrid('selectedrowindex') : null;
			progRec = rowIndex == null || rowIndex < 0 ? null : grid.jqxGrid('getRowData', rowIndex);
		}
		if (!dbRec) {
			const grid = (this.grid_vtListe || {}).grid;
			const rowIndex = grid && grid.length ? grid.jqxGrid('selectedrowindex') : null;
			dbRec = rowIndex == null || rowIndex < 0 ? null : grid.jqxGrid('getRowData', rowIndex);
		}
		
		const {vtAdi} = (dbRec || {});
		if (!vtAdi)
			return;

		const {paketAdi} = progRec;
		let {appPath} = progRec;
		if (!(paketAdi || appPath))
			return;
		
		const _qs = $.extend({}, qs);
		const _sql = (_qs.sql ? (typeof _qs.sql == 'object' ? _qs.sql : JSON.parse(_qs.sql)) : null) || {};
		_sql.db = vtAdi;
		_qs.sql = toJSONStr(_sql);
		
		delete _qs[''];
		delete _qs.nbb;
		delete _qs.ws;

		const {ws} = config;
		if (ws) {
			if (ws.hostName)
				_qs.ws = toJSONStr(ws);
			else
				_qs.wsURL = ws.url
		}
		
		const {session} = config;
		if (session && session.hasSession)
			config.session.buildAjaxArgs({ args: _qs });

		if (paketAdi) {
			qs.prog = paketAdi
			/*if (!appPath)
				appPath = 'ticMenuApp';*/
		}
		
		const url = `${webRoot}/app/${appPath}/?${$.param(_qs)}`;
		showProgress();
		setTimeout(() => {
			if (config.dev)
				location.href = url;
			else
				openNewWindow(url);
			setTimeout(() => hideProgress(), 2000);
		}, 100);
	}

	vtListe_satirCiftTiklandi(e) {
		this.progBaslat(e);
	}

	wsDBListe(e) {
		if (this.class.isTest)
			return { isError: false, result: [] };

		e = e || {};
		delete e.session;
		return ajaxGet({
			timeout: 10000, processData: false,
			contentType: wsContentTypeVeCharSet,
			url: this.getWSUrl({ api: 'dbListe', args: e })
		});
	}

	onResize(e) {
		super.onResize(e)
		
		/*const panels = this.layout.find('.panel');
		for (let i = 0; i < panels.length; i++) {
			const div = panels.eq(i);
			div.height($(window).height() - div.offset().top - 20);
		}*/
	}
}
