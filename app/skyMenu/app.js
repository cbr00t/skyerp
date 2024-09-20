class SkyMenuApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get grids() { return [this.grid_programlar, this.grid_vtListe].filter(x => !!x); }
	async runDevam(e) { await super.runDevam(e); this.show() }
	initGrid_programlar(e) {
		const {layout} = this, gridPart = this.grid_programlar = new GridliGostericiPart({
			layout: layout.find('#programlar'),
			tabloKolonlari: [
				new GridKolon({ belirtec: 'paketAdi', text: 'Paket Adı' }),
				new GridKolon({ belirtec: 'vtBelirtec', text: ' ', genislikCh: 8 }).alignCenter()
			],
			argsDuzenle: e => { const {args} = e; $.extend(args, { rowsHeight: 75, selectionMode: 'multipleRowsExtended', showFilterRow: true }); },
			loadServerData: e => {
				const {wsArgs} = e;
				return [
					{ paketAdi: 'Sky Ticari', vtBelirtec: 'XTIC', localApp: true, appPath: 'ticari' },
					{ paketAdi: 'Sky Üretim Veri Toplama', vtBelirtec: 'XUVT', localApp: true, appPath: 'uretimVeriToplama' }
				]
			}
		});
		gridPart.run();
		const {grid} = gridPart;
		grid.on('rowclick', evt => {
			setTimeout(() => { const {grid_vtListe} = this; if (grid_vtListe) { const subGrid = grid_vtListe.grid, rec = evt.args.row; if (rec && subGrid?.length) { subGrid.jqxGrid('updateBoundData') } } }, 100) });
		grid.on('bindingcomplete', evt => { const {grid_programlar} = this, grid = grid_programlar.grid; grid.jqxGrid('selectRow', 0) });
	}
	initGrid_vtListe(e) {
		const {layout} = this;
		const gridPart = this.grid_vtListe = new GridliGostericiPart({
			layout: layout.find('#vtListe'),
			tabloKolonlari: [
				new GridKolon({ belirtec: 'vtAdi', text: 'VT Adı' }),
				new GridKolon({ belirtec: 'vtBelirtec', text: ' ', genislikCh: 8 }).alignCenter()
			],
			argsDuzenle: e => { const {args} = e; $.extend(args, { rowsHeight: 60, selectionMode: 'singleRow', showFilterRow: true }) },
			loadServerData: async e => {
				e = e || {}; const parentGrid = (this.grid_programlar || {}).grid;
				const parentRowIndex = parentGrid && parentGrid.length ? parentGrid.jqxGrid('selectedrowindex') : null;
				const parentRec = parentRowIndex == null || parentRowIndex < 0 ? null : parentGrid.jqxGrid('getRowData', parentRowIndex);
				const vtBelirtec = parentRec && !parentRec.localApp ? (parentRec.vtBelirtec || '').toUpperCase() :  null;
				const {wsArgs} = e; let server; if (server) { wsArgs.sql = toJSONStr({ server: server, db: 'ORTAK' }) }
				if ($.isEmptyObject(wsArgs.orderBy)) { wsArgs.orderBy = [`SUBSTRING(name, 3, 2) DESC`, `SUBSTRING(name, 1, 2) DESC`].join(delimWS); }
				const ozelVTAdiSet = asSet(['master', 'tempdb', 'ORTAK', 'GECICI', 'VTORTAK']);
				const _recs = await this.wsDBListe(wsArgs); let recs = [];
				for (const vtAdi of _recs) {
					if (ozelVTAdiSet[vtAdi.toUpperCase()]) { continue }
					const rec = { vtAdi }; if (!rec.vtBelirtec) { rec.vtBelirtec = vtAdi && vtAdi.length > 2 ? vtAdi.substr(0, 2).toUpperCase() : null }
					recs.push(rec)
				}
				if (vtBelirtec) { recs = recs.filter(rec => !vtBelirtec || parentRec.localApp || rec.vtBelirtec == vtBelirtec) }
				return recs
			}
		});
		gridPart.run();
		const {grid} = gridPart;
		grid.on('bindingcomplete', evt => { const {grid_vtListe} = this, grid = grid_vtListe.grid; grid.jqxGrid('clearSelection') });
		grid.on('rowdoubleclick', evt => {
			const parentGrid = this.grid_programlar?.grid, parentRowIndex = parentGrid && parentGrid.length ? parentGrid.jqxGrid('selectedrowindex') : null;
			const parentRec = parentRowIndex == null || parentRowIndex < 0 ? null : parentGrid.jqxGrid('getRowData', parentRowIndex);
			this.vtListe_satirCiftTiklandi({ event: evt, progRec: parentRec, dbRec: evt.args.row.bounddata })
		})
	}
	progBaslat(e) {
		e = e || {}; let {progRec, dbRec} = e;
		if (!progRec) {
			const grid = this.grid_programlar?.grid, rowIndex = grid && grid.length ? grid.jqxGrid('selectedrowindex') : null;
			progRec = rowIndex == null || rowIndex < 0 ? null : grid.jqxGrid('getRowData', rowIndex);
		}
		if (!dbRec) {
			const grid = this.grid_vtListe?.grid, rowIndex = grid && grid.length ? grid.jqxGrid('selectedrowindex') : null;
			dbRec = rowIndex == null || rowIndex < 0 ? null : grid.jqxGrid('getRowData', rowIndex);
		}
		const {vtAdi} = (dbRec || {}); if (!vtAdi) { return }
		const {paketAdi} = progRec; let {appPath} = progRec; if (!(paketAdi || appPath)) { return }
		const _qs = $.extend({}, qs), _sql = (_qs.sql ? (typeof _qs.sql == 'object' ? _qs.sql : JSON.parse(_qs.sql)) : null) || {};
		_sql.db = vtAdi; _qs.sql = toJSONStr(_sql);
		delete _qs['']; delete _qs.nbb; delete _qs.ws;
		const {ws} = config; if (ws) { if (ws.hostName) { _qs.ws = toJSONStr(ws) } else { _qs.wsURL = ws.url } }
		const {session} = config; if (session?.hasSession) { config.session.buildAjaxArgs({ args: _qs }) }
		if (paketAdi) { qs.prog = paketAdi }
		const url = `${webRoot}/app/${appPath}/?${$.param(_qs)}`; showProgress();
		setTimeout(() => { if (config.dev) { location.href = url } else { openNewWindow(url) } setTimeout(() => hideProgress(), 2000) }, 100)
	}
	vtListe_satirCiftTiklandi(e) { this.progBaslat(e) }
	wsDBListe(e) {
		e = e || {}; delete e.session;
		return ajaxGet({ timeout: 10000, processData: false, contentType: wsContentTypeVeCharSet, url: this.getWSUrl({ api: 'dbListe', args: e }) })
	}
}
