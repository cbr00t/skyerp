class MQMain extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'MAIN' } static get sinifAdi() { return 'Uzak Dosya Seç' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false }
	static get raporKullanilirmi() { return false } static get kolonDuzenlemeYapilirmi() { return false } 
	static get secimSinif() { return null } static get tumKolonlarGosterilirmi() { return true }
	static listeEkrani_init(e) {
		super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.rootPart ?? e.sender, {args} = gridPart; if (args) { $.extend(gridPart, args) }
		gridPart.rowNumberOlmasin(); $.extend(gridPart, {
			initRowsHeight: 40, previewRowsHeight: 180, rootDir: (gridPart.rootDir ?? qs.url ?? qs.rootDir)?.trim('/'), includeDirs: gridPart.includeDirs ?? qs.includeDirs,
			ipcKey: gridPart.ipcKey ?? qs.ipc ?? qs.ipcKey, subDirs: (e.dir ?? qs.dir ?? e.subDir ?? qs.subDir)?.trim('/')?.split('/')?.filter(x => !!x) || [],
			hasPreviewFlag: gridPart.hasPreviewFlag ?? qs.hasPreview ?? true
		});
		let {secince} = gridPart; if (secince == null) { const {ipcKey} = app; if (ipcKey) { secince = gridPart.secince = e => this.tamamIslemi(e) } }
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {liste} = e;
		liste.push({ id: 'goParent', text: '..', handler: e => { const {subDirs} = gridPart; if (subDirs?.length) { subDirs.pop(); gridPart.tazele() } } })
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder, gridPart = e.gridPart ?? e.rootPart ?? e.sender;
		rfb.addForm('islemTuslari_sol', e => e.builder.rootPart.islemTuslariPart.sol).onAfterRun(e => this.initIslemTuslari_sol_ek(e))
	}
	static initIslemTuslari_sol_ek(e) {
		const gridPart = e.gridPart ?? e.rootPart ?? e.sender, {builder} = e, {layout} = builder;
		builder.yanYana()
			.addStyle(...[e =>
				`$elementCSS > .formBuilder-element { position: absolute; top: 0; margin-top: 0 }
				 $elementCSS > .formBuilder-element:has(input[type = checkbox]) { top: 13px }`
			])
			.addCheckBox('hasPreviewFlag', 'Önizleme').setAltInst(gridPart)
			.degisince(e => {
				const hasPreviewFlag = e.value, {grid, gridWidget} = gridPart, {initRowsHeight, previewRowsHeight} = gridPart;
				grid.jqxGrid('rowsheight', hasPreviewFlag ? previewRowsHeight : initRowsHeight); gridWidget[hasPreviewFlag ? 'showcolumn' : 'hidecolumn']('resim');
				gridPart.tazele(e)
			}).addStyle_wh('auto').addStyle(e => `$elementCSS { left: 170px }`)
	}
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args} = e, gridPart = e.gridPart ?? e.rootPart ?? e.sender;
		const {hasPreviewFlag, initRowsHeight, previewRowsHeight} = gridPart;
		$.extend(args, { showFilterRow: true, groupsExpandedByDefault: true, groupIndentWidth: 50, altRows: false, rowsHeight: (hasPreviewFlag ? previewRowsHeight : initRowsHeight) })
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {result, rec} = e; if (!rec) { return }
		if (rec.isDir) { result.push('dir') }
		if (rec.name == '..') { result.push('parent') }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'name', text: 'Dosya Adı', minWidth: 200, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'parentDir', text: 'Klasör', minWidth: 200, genislikCh: 30, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'sizeKB', text: 'Boyut (KB)', genislikCh: 15 }).tipDecimal(2),
			new GridKolon({ belirtec: 'lastWriteTime', text: 'Değiştirme Zamanı', genislikCh: 20, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'isDir', text: 'Dir', genislikCh: 5 }).tipBool(),
			new GridKolon({ belirtec: 'resim', text: 'Resim', genislikCh: 60, filterable: false, sortable: false, grpupable: false })
		)
	}
	static async loadServerDataDogrudan(e) {
		const gridPart = e.gridPart ?? e.rootPart ?? e.sender, {rootDir} = gridPart, includeDirs = gridPart.includeDirs ?? true, relDir = this.getCurrentRelDir(e);
		const dir = [rootDir, relDir].filter(x => !!x).join('/'); return (await app.wsDosyaListe({ args: { dir, includeDirs } }))?.recs || []
	}
	static orjBaslikListesi_recsDuzenle(e) {
		super.orjBaslikListesi_recsDuzenle(e); const {recs} = e, gridPart = e.gridPart ?? e.rootPart ?? e.sender, url = gridPart.rootDir, dir = this.getCurrentRelDir(e);
		for (const rec of recs) {
			const {name, size, isDir} = rec; rec.sizeKB = size ? roundToFra(size / 1024, 2) : (size || 0)
			let fullURL = rec.fullURL = [url, dir, name].filter(x => !!x).join('/'); rec.parentDir = dir;
			if (!isDir) {
				const proxyURL = app.getWSUrl({ api: 'webRequest', args: { args: toJSONStr({ stream: true, method: 'RETR', url: fullURL }) } });
				rec.resim = `<div class="full-wh" style="background-image: url(${proxyURL})" onclick="openNewWindow('${proxyURL}')"></div>`
			}
		}
		recs.sort((a, b) =>
			a.isDir < b.isDir ? 1 : a.isDir > b.isDir ? -1 :
			a.lastWriteTime < b.lastWriteTime ? 1 : a.lastWriteTime > b.lastWriteTime ? -1 :
			a.name < b.name ? -1 : a.name > b.name ? 1 : 0
		)
		if (gridPart.subDirs?.length) { recs.unshift({ isDir: true, name: '..', parentDir: dir }) }
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const gridPart = e.gridPart ?? e.rootPart ?? e.sender, {gridWidget, hasPreviewFlag} = gridPart;
		gridWidget[hasPreviewFlag ? 'showcolumn' : 'hidecolumn']('resim')
	}
	static orjBaslikListesi_satirTiklandi(e) {
		super.orjBaslikListesi_satirTiklandi(e); const gridPart = e.gridPart ?? e.sender;
		gridPart._lastClickedColumn = gridPart.clickedColumn || gridPart._lastClickedColumn
	}
	static orjBaslikListesi_satirCiftTiklandi(e) {
		/* ignore super */ const gridPart = e.gridPart ?? e.sender, {subDirs} = gridPart, {args, currentTarget} = e.event;
		let rec = e.rec ?? args.row; rec = rec?.bounddata ?? rec; const rowIndex = e.rowIndex ?? args.rowindex, belirtec = e.belirtec ?? gridPart.clickedColumn ?? gridPart._lastClickedColumn;
		/*if (belirtec == 'name') {*/
		const {name} = rec; if (name) {
			if (name == '..') { if (subDirs.length) { subDirs.pop(); gridPart.tazele() } }
			else if (rec.isDir) { subDirs.push(name.trim()); gridPart.tazele() }
		}
		/*}*/
		return false
	}
	static tamamIslemi(e) {
		const gridPart = e.gridPart ?? e.rootPart ?? e.sender, key = gridPart.ipcKey; if (!key) { return false }
		const {recs} = e, url = gridPart.rootDir, dir = this.getCurrentRelDir(e), data = { url, dir, recs };
		app.wsWriteTemp({ key, data }).then(() => app.wsSignal({ key, data: true }))
	}
	static getCurrentRelDir(e) {
		const gridPart = e.gridPart ?? e.rootPart ?? e.sender;
		const {subDirs} = gridPart; return (subDirs || []).filter(x => !!x).join('/').trim('/')
	}
}
