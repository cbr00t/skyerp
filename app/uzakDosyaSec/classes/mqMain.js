class MQMain extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodListeTipi() { return 'MAIN' } static get sinifAdi() { return 'Uzak Dosya Seç' }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static get secimSinif() { return null } static get tumKolonlarGosterilirmi() { return true }
	static listeEkrani_init(e) {
		super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.sender, {args} = gridPart; if (args) { $.extend(gridPart, args) }
		let {secince} = gridPart; if (secince == null) { const {ipcCallbackKey} = app; if (ipcCallbackKey) { secince = gridPart.secince = e => this.tamamIslemi(e) } }
	}
	static islemTuslariDuzenle_listeEkrani(e) { super.islemTuslariDuzenle_listeEkrani(e) /*; const {liste} = e*/ }
	static orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e); const {args, sender} = e;
		$.extend(args, { showFilterRow: false, groupsExpandedByDefault: true, rowsHeight: 150, groupIndentWidth: 10 })
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
			new GridKolon({ belirtec: 'resim', text: 'Resim', genislikCh: 60 }),
			new GridKolon({ belirtec: 'isDir' }).tipBool().hidden()
		)
	}
	static async loadServerDataDogrudan(e) {
		let includeDirs = app.includeDirs ?? true, dir = [app.rootDir, app.currentRelDir].filter(x => !!x).join('/');
		return (await app.wsDosyaListe({ args: { dir, includeDirs } }))?.recs || []
	}
	static orjBaslikListesi_recsDuzenle(e) {
		super.orjBaslikListesi_recsDuzenle(e); const url = app.rootDir, dir = app.currentRelDir, {recs} = e;
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
		/*recs.unshift({ isDir: true, name: '..', parentDir: dir })*/
	}
	static tamamIslemi(e) {
		const key = app.ipcCallbackKey; if (!key) { return false }
		const {recs} = e, url = app.rootDir, dir = app.currentRelDir, data = { url, dir, recs };
		app.wsWriteTemp({ key, data }).then(() => app.wsSignal({ key, data: true }))
	}
}
