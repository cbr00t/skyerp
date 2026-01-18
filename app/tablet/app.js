class TabletApp extends TicariApp {
    static { window[this.name] = this; this._key2Class[this.name] = this } get isLoginRequired() { return true }
	static get yerelParamSinif() { return MQYerelParam } get configParamSinif() { return MQYerelParamConfig_App }
	get offlineMode() { return super.offlineMode ?? true } set offlineMode(value) { super.offlineMode = value }
	get dbMgrClass() { return SqlJS_DBMgr } get defaultOfflineRequestChunkSize() { return 4 } // get autoExecMenuId() { return MQTest.kodListeTipi }
	get sicakVeyaSogukmu() { return this.sicakmi || this.sogukmu } get rotaKullanilirmi() { return this.sicakVeyaSogukmu }
	get defaultLoginTipi() { return this.sicakVeyaSogukmu ? 'plasiyerLogin' : super.defaultLoginTipi }
	get plasiyerKod() {
		let {session: { loginTipi, user: plasiyerKod } = {}} = config
		return loginTipi == 'plasiyerLogin' ? plasiyerKod : null
	}
	get offlineBilgiYukleGonderOrtakSiniflar() {
		let {_offlineBilgiYukleGonderOrtakSiniflar: result} = this
		if (!result)
			result = this._offlineBilgiYukleGonderOrtakSiniflar = [MQTicNumarator, MQTabStok, MQTabCari]
		return result
	}
	get offlineBilgiYukleSiniflar() {
		let {_offlineBilgiYukleSiniflar: result} = this
		if (!result) {
			result = this._offlineBilgiYukleSiniflar = [
				MQParam, MQTabTahsilSekli, MQTabSube, MQTabYer, MQTabNakliyeSekli,
				MQTabCariTip, MQPaket, MQUrunPaket, MQTabUgramaNeden,
				MQTabKasa, MQTabStokAnaGrup, MQTabStokGrup, MQTabStokMarka,
				MQTabBolge, MQTabIl, MQTabUlke, MQTabPlasiyer
			]
			for (let {kami, mfSinif} of HMRBilgi) {
				if (kami && mfSinif)
					result.push(mfSinif)
			}
			result.push(...[
				MQTabBarkodReferans, MQTabBarkodAyrisim,
				...this.offlineBilgiYukleGonderOrtakSiniflar,
				MQCariSatis, SatisKosulYapi
			])
		}
		return result
	}
	get offlineBilgiGonderSiniflar() {
		let {_offlineBilgiGonderSiniflar: result} = this
		if (!result) {
			result = this._offlineBilgiGonderSiniflar = [
				...this.offlineBilgiYukleGonderOrtakSiniflar,
				...TabFis.subClasses.filter(_ => !_.araSeviyemi)
			]
		}
		return result
	}
	get offlineClearTableSiniflar() {
		let fisSiniflar = TabFis.subClasses.filter(_ => !_.araSeviyemi)
		let detSiniflar = fisSiniflar.map(_ => _.detaySinif).flat().filter(_ => !!_)
		return [
			...this.offlineBilgiYukleSiniflar.filter(_ => _ != MQTabPlasiyer),
			...fisSiniflar, ...detSiniflar
		]
	}
	get offlineCreateTableSiniflar() {
		return [...this.offlineClearTableSiniflar]
	}

	constructor(e) {
		window.appRoot = '../tablet'
		super(e)
	}
	loginTipleriDuzenle({ loginTipleri }) {
		let {sicakVeyaSogukmu} = this
		loginTipleri.push(...[
			(sicakVeyaSogukmu ? null : { kod: 'login', aciklama: 'VIO Kullanıcısı' }),
			{ kod: 'plasiyerLogin', aciklama: 'Plasiyer' }
		].filter(x => !!x))
	}
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		$.extend(params, { localData: MQLocalData.getInstance(), tablet: MQTabletParam.getInstance() })
	}
	async afterRun(e) {
		await super.afterRun(e)
		this.cacheReset()
	}
	async getAnaMenu(e) {
		let {noMenuFlag, params} = this
		if (noMenuFlag) { return new FRMenu() }
		let items = []
		let addMenuSubItems = (mne, text, ...classes) => {
			let subItems = classes.flat().map(cls =>
				new FRMenuChoice({
					mne: cls.kodListeTipi || cls.partName, text: cls.sinifAdi,
					block: e =>
						cls.tanimmi ? cls.tanimla(e) :
						cls.listeEkraniAc ? cls.listeEkraniAc(e) :
						new cls(e).run()
				})
			)
			let menuItems = []
			if (subItems?.length) {
				menuItems = mne
					? [new FRMenuCascade({ mne, text, items: subItems })]
					: subItems
				items.push(...menuItems)
			}
			return menuItems
		};
		items.push(new FRMenuChoice({ mne: 'BILGIYUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }))
		addMenuSubItems('TANIM', 'Tanımlar', [
			MQTabStok, MQTabCari, MQTabPlasiyer, MQTabSube, MQTabYer,
			MQTabStokGrup, MQTabStokAnaGrup, MQTabStokMarka, MQTabNakliyeSekli,
			MQTabTahsilSekli, MQTabBarkodReferans, MQTabBarkodAyrisim,
			MQCariSatis, MQTabUgramaNeden
		])
		{
			let mfSinif = TabFisListe, {kodListeTipi: mne, sinifAdi: text} = mfSinif
			items.push(new FRMenuChoice({ mne, text, block: e => mfSinif.listeEkraniAc(e) }))
		}
		items.push(new FRMenuChoice({ mne: 'BILGIGONDER', text: 'Bilgi Gönder', block: e => this.bilgiGonderIstendi(e) }))
		// addMenuSubItems(null, null, [MQTest])
		return new FRMenu({ items })
	}
	dbMgr_tablolariOlustur_urlDuzenle({ name, urls }) {
		super.dbMgr_tablolariOlustur_urlDuzenle(...arguments)
		urls.push(`${appRoot}/queries/${name}.sql?${appVersion}`)
	}
	dbMgr_tablolariOlustur_queryDuzenle({ name, queries }) {
		super.dbMgr_tablolariOlustur_queryDuzenle(...arguments)
	}
	dbMgr_tablolariOlustur_urlDuzenle_son({ name, urls }) {
		super.dbMgr_tablolariOlustur_urlDuzenle_son(...arguments)
		urls.push(`${appRoot}/queries/${name}-son.sql?${appVersion}`)
	}
	dbMgr_tablolariOlustur_queryDuzenle_son({ name, queries }) {
		super.dbMgr_tablolariOlustur_queryDuzenle_son(...arguments)
	}
	dbMgr_tabloEksikleriTamamla(e = {}) {
		let {dbMgr} = this, {offlineRequest, offlineMode, classes} = e
		offlineMode ??= MQCogul.isOfflineMode
		let db = e.db ??= dbMgr?.main
		let name = e.name ??= db?.name
		super.dbMgr_tabloEksikleriTamamla(e)
		let {main} = app.dbMgr ?? {}
		if (db == main) {
			classes ??= this.offlineCreateTableSiniflar ?? []
			for (let cls of classes) {
				let queries = makeArray(cls.offlineGetSQLiteQuery({ offlineRequest, offlineMode })).filter(_ => _ && _ != ';')
				if (!empty(queries)) {
					for (let query of queries) {
						try { db.execute(query, null, true) }
						catch (ex) { console.error(ex, getErrorText(ex), cls, query) }
					}
				}
			}
		}
	}
	async bilgiYukleIstendi(e) {
		let {offlineBilgiYukleSiniflar: classes, offlineClearTableSiniflar: clearClasses} = this
		let {params, dbMgr, dbMgr: { main: db, main: { name } }, defaultOfflineRequestChunkSize: chunkSize} = this
		if (!classes?.length)
			return
		let withClear = true
		{
			let args = { noClear: false }
			let {wnd, result} = displayMessage('Merkezden veriler yüklensin mi?', appName, 'eh')
			let parent = wnd.find('.jqx-window-content > .subContent')
			let rfb = new RootFormBuilder().setLayout(parent).setInst(args)
			rfb.addCheckBox('noClear', 'Veriler SilinMEsin').addStyle(`
				$elementCSS { margin: 30px 0 0 30px !important }
				$elementCSS > input:not(:checked) + label { font-weight: bold; color: firebrick !important }
			`)
			wnd.jqxWindow('height', wnd.jqxWindow('height') + 30)
			rfb.run()
			let {index: rdlg} = await result ?? {}
			if (rdlg !== 0)
				return
			withClear = !args.noClear
		}
		let getArrayKey = arr => arr.join('|')
		let offlineRequest = true, offlineMode = true, internal = true
		let pm = showProgress('Veriler yükleniyor...', null, true)
		pm.setProgressMax(classes.length * 300 + 200).progressReset()
		try {
			let {belirtecListe: hmrBelirtecler_eski} = HMRBilgi
			if (!withClear)
				clearClasses = clearClasses.filter(cls => !cls.offlineFis)
			this.cacheReset()
			{
				if (clearClasses?.length) {
					await MQCogul.sqlExecNone({ offlineRequest, offlineMode, query: 'BEGIN TRANSACTION' })
					await Promise.allSettled( clearClasses.map(cls => cls.offlineDropTable?.({ ...e, offlineRequest, offlineMode, internal })) )
					await app.dbMgr_tablolariOlustur({ ...e, offlineRequest, offlineMode, internal, classes: [MQParam] })
					await MQCogul.sqlExecNone({ offlineMode, query: 'COMMIT' })
					pm.progressStep(1)
				}
			}
			{
				await MQCogul.sqlExecNone({ offlineMode, query: 'BEGIN TRANSACTION' })
				this.cacheReset()
				await MQParam.offlineSaveToLocalTable({ offlineRequest, offlineMode }).finally(() => pm.progressStep())
				await MQCogul.sqlExecNone({ offlineMode, query: 'COMMIT' })
				pm.progressStep(1)
				// let params = this.params = {}
				let {params} = this
				for (let {class: cls} of values(params))
					delete cls._instance
				await this.paramsDuzenle({ ...e, offlineRequest, offlineMode, params })
				await this.paramsDuzenleSonrasi({ ...e, offlineRequest, offlineMode })
				HMRBilgi.globalleriSil()
				pm.progressStep(2)
			}
			{
				await MQCogul.sqlExecNone({ offlineMode, query: 'BEGIN TRANSACTION' })
				await Promise.all(
					clearClasses.filter(cls => cls != MQParam).map(cls =>
						cls.offlineDropTable?.({ ...e, offlineRequest, offlineMode, internal }))
				)
				await app.dbMgr_tablolariOlustur({ ...e, offlineRequest, offlineMode, internal })
				await MQCogul.sqlExecNone({ offlineMode, query: 'COMMIT' })
				pm.progressStep(1)
			}
			{	
				classes = this.offlineBilgiYukleSiniflar.filter(cls => cls != MQParam)             // parametrelere göre YENİ OLUŞAN 'offlineBilgiYukleSiniflar'
				for (let _classes of arrayIterChunks(classes, chunkSize)) {
					await Promise.all(_classes.map(cls =>
						cls.offlineSaveToLocalTable({ offlineRequest, offlineMode }).finally(() =>
							pm.progressStep())
					))
				}
			}
			await this.dbMgr_tabloEksikleriTamamla({ db, name, offlineRequest, offlineMode })
			pm.progressStep(5)
		}
		catch (ex) {
			let errText = getErrorText(ex)
			console.error(errText, ex)
			hConfirm(errText, 'Veri Yükle')
		}
		/*for (let cls of classes) {
			try {
				await cls.offlineSaveToLocalTable()
			}
			catch (ex) {
				let errText = getErrorText(ex)
				console.error(errText, ex)
				hConfirm(errText, 'Veri Yükle')
			}
			finally { pm.progressStep() }
		}*/
		setTimeout(() => pm.progressEnd(), 50)
		eConfirm('Veri Yükleme tamamlandı')
		setTimeout(() => hideProgress(), 150)
	}
	async bilgiGonderIstendi(e) {
		let {offlineBilgiGonderSiniflar: classes, defaultOfflineRequestChunkSize: chunkSize} = this
		if (!classes?.length)
			return
		if (!await ehConfirm('Tabletteki veriler merkeze gönderilsin mi?', appName))
			return
		let pm = showProgress('Veriler gönderiliyor...', null, true)
		pm.setProgressMax(classes.length * 70).progressReset()
		for (let _classes of arrayIterChunks(classes, chunkSize)) {
			for (let cls of _classes) {
				try { await cls.offlineSaveToRemoteTable() }
				catch (ex) {
					let errText = getErrorText(ex)
					console.error(errText, ex)
					hConfirm(errText, 'Veri Gönder')
				}
				finally { pm.progressStep() }
			}
		}
		pm.progressEnd()
		eConfirm('Veri Gönderimi tamamlandı')
		setTimeout(() => hideProgress(), 200)
	}
	cacheReset() {
		let {_cls2PTanim} = CIO, {offlineClearTableSiniflar} = this
		for (let cls of [...offlineClearTableSiniflar, MQTabPlasiyer, TicIskYapi, BarkodParser /*, HMRBilgi*/]) {
			let {detaySinif} = cls ?? {}
			cls?.globalleriSil?.()
			detaySinif?.globalleriSil?.()
		}
		delete MQParam._topluYukle_kod2Rec
		deleteKeys(this,
			'_offlineBilgiYukleSiniflar', '_offlineBilgiGonderSiniflar',
			'_offlineBilgiYukleGonderOrtakSiniflar', '_offlineCreateTableSiniflar', '_offlineClearTableSiniflar'
		)
		for (let key in _cls2PTanim)
			delete _cls2PTanim[key]
		for (let key of ['mqGlobals', 'mqTemps']) {
			if (this[key])
				this[key] = {}
		}
		return this
	}
}



/*
; let detCls = (class extends MQDetay {
	static get table() { return 'testhar' }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, {
			stokKod: new PInstStr('shkod'),
			stokAdi: new PInstStr(),
			bedel: new PInstNum('bedel')
		})
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: '_urunText', text: 'Ürün', genislikCh: 60 }).noSql()
				.setCellsRenderer((colDef, rowIndex, belirtec, value, html, jqxCol, rec) => {
					let result = [
						`<span class="bold gray ek-bilgi">${rec.shkod}</span>`,
						`<span class="asil">${rec.shadi}</span>`
					].join(CrLf)
					return changeTagContent(html, result)
				}),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel()
		)
	}
	static loadServerData_queryDuzenle({ alias, sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		alias ||= this.tableAlias
		sent.har2StokBagla({ alias })
		sahalar.addWithAlias('stk', 'aciklama stokadi', 'brm', 'satfiyat1')
	}
})
; let gridciCls = (class extends GridKontrolcu {
	tabloKolonlariDuzenle({ tabloKolonlari: liste }) {
		super.tabloKolonlariDuzenle(...arguments)
		liste.push(
			...MQTabStok.getGridKolonlar({ belirtec: 'stok' }),
			new GridKolon({ belirtec: 'bedel', text: 'Bedel', genislikCh: 15 }).tipDecimal_bedel(),
			new GridKolon({ belirtec: '_serbestBilgi', text: 'Serbest Gösterim', genislikCh: 200 }).readOnly()
				.setCellsRenderer((colDef, rowIndex, belirtec, value, html, jqxCol, det) => {
					let result = `<b>${det.stokAdi || ''}</b> ürünü için <span class=royalblue>${numberToString(det.bedel || 0)} TL'lik</span> satış kalemi`
					return changeTagContent(html, result)
				})
		)
	}
})
let fisCls = (class extends MQGenelFis {
	static get kodListeTipi() { return 'TST1' }
	static get sinifAdi() { return 'Fiş Yapısı - Test 1' }
	static get table() { return 'testfis' }
	static get detaySinif() { return detCls }
	static get gridKontrolcuSinif() { return gridciCls }
	static pTanimDuzenle({ pTanim }) {
		$.extend(pTanim, {
			mustKod: new PInstStr('must'),
			aciklama: new PInstStr('aciklama')
		})
	}
	static rootFormBuilderDuzenle(e) {
		let { sender: tanimUI, layout, gridIslemTuslari, builders, islem, fis: inst } = e
		let { tsnForm, baslikForm: { builders: frm } } = builders
		{
			let mfSinif = MQTabCari, {sinifAdi: etiket} = mfSinif
			frm[0].addModelKullan('mustKod', etiket)
				.comboBox().setMFSinif(mfSinif)
				.etiketGosterim_yok().setPlaceHolder('Müşteri')
				.addStyle_wh('calc(var(--full) - 180px)')
				.degisince(({ item: rec, value, builder: { inst } }) =>
					inst.musteriDegisti({ ...e, rec, value }))
			frm[2].addTextInput('aciklama', 'Açıklama')
				.etiketGosterim_yok().setPlaceHolder('Belge açıklaması')
		}
	}
	static orjBaslikListesiDuzenle({ liste }) {
		super.orjBaslikListesiDuzenle(...arguments)
		liste.push(
			new GridKolon({ belirtec: 'mustKod', text: 'Müşteri', genislikCh: 16 }),
			new GridKolon({ belirtec: 'mustAdi', text: 'Müşteri Ünvan', genislikCh: 40, sql: 'car.aciklama' }),
			new GridKolon({ belirtec: 'aciklama', text: 'Açıklama', genislikCh: 50 })
		)
	}
	static loadServerData_queryDuzenle({ alias, sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle(...arguments)
		alias ||= this.tableAlias
		sent.fis2CariBagla({ alias })
	}
	async musteriDegisti({ rec, value }) {
		debugger
	}
})
fis = new fisCls()
await fis.tanimla({ islem: 'yeni' })
*/
