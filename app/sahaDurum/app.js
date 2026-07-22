class SahaDurumApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get autoExecMenuId() { return 'DEF' }
	get defaultLoginTipi() { return 'plasiyerLogin' }
	get configParamSinif() { return MQYerelParamConfig_SahaDurum }
	get yerelParamSinif() { return MQYerelParam }
	get localDataSinif() { return MQLocalData }
	get sablonDosyaPrefix() { return 'sahaDurum' }

	constructor(e = {}) { super(e) }
	async init(e) {
		globalThis.rootAppName = 'sahaDurum'
		await super.init(e)
	}
	async runDevam(e) {
		await super.runDevam(e)
		if (qs.user)
			await this.loginIstendi(e)
		else
			this.promise_login?.resolve()
		
		await this.anaMenuOlustur(e)
		let { session } = config, { yerel: yerelParam } = this.params
		let lastSession = yerelParam?.lastSession ?? session
		if (lastSession) {
			lastSession = yerelParam.lastSession = isPlainObject(lastSession) ? new Session(lastSession) : lastSession.deepCopy()
			//lastSession.user = `<span class="gray italic">${yerelParam?.lastSession.user}</span>`
			yerelParam.kaydetDefer()
		}
		this.updateAppTitle({
			userSession: session?.hasSession
				? session
				: new Session(yerelParam?.lastSession)
		})
	}
	loginTipleriDuzenle({ loginTipleri }) {
		super.loginTipleriDuzenle(...arguments)
	}
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		extend(params, {
			zorunlu: MQZorunluParam.getInstance(),
			finans: MQFinansParam.getInstance(),
			tablet: MQTabletParam.getInstance(),
			eIslem: MQEIslemParam.getInstance()
		})
	}
	async paramsDuzenleSonrasi(e) {
		try { await super.paramsDuzenleSonrasi(e) }
		finally { this.params.localData = await this.localDataSinif.getInstance() }
		await this.yaslandirmaGunleriDuzenle(e)
	}
	yaslandirmaGunleriDuzenle(e) {
		let { finans: { yaslandirmaGunleri } = {} } = app.params
		if (!empty(yaslandirmaGunleri)) {
			let { ilkKademe: ilk } = MustBilgi
			let arr = yaslandirmaGunleri
			if (ilk != 0)
				arr = arr.filter(Boolean)
			if (arr[0] != ilk)
				arr.unshift(ilk)
			MustBilgi.kademeler = arr
		}
	}
	getAnaMenu(e) {
		// let disabledMenuIdSet = this.disabledMenuIdSet ?? {}
		let items = [
			new FRMenuChoice({ mne: 'BILGI-YUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }),
			new FRMenuChoice({ mne: 'MUSTERILER', text: 'Müşteriler', block: e => MQMustBilgi.listeEkraniAc(e) }),
			( config.dev ? new FRMenuCascade({
				mne: 'PARAM', text: 'Parametreler', items: [
					new FRMenuChoice({ mne: 'TABLET', text: 'Tablet', block: e => app.params.tablet.tanimla(e) }),
					new FRMenuChoice({ mne: 'FINANS', text: 'Finans', block: e => app.params.finans.tanimla(e) })
				]
			}) : null)
		].filter(Boolean)
		return new FRMenu({ items })
	}
	navLayoutOlustur_araIslem(e) {
		super.navLayoutOlustur_araIslem(e)
		let items = [
			new FRMenuChoice({
				id: '_verileriSil', text: `<span class="img"></span><span class="text">Verileri Sil</span>`,
				block: e => app.verileriSilIstendi(e)
			})
		];
		for (let item of items)
			item.navLayoutOlustur(e)
	}
	async bilgiYukleIstendi(e) {
		if (!config.session?.user) {
			await this.loginIstendi(e); let {session} = config, yerelParam = this.params.yerel;
			if (session?.user) { yerelParam.lastSession = session; setTimeout(() => yerelParam.kaydet(), 100) }
		}
		try {
			showProgress('İnternet bağlantısı kontrol ediliyor...', null, true)
			await new $.Deferred(p => setTimeout(() => p.resolve(), 100))
			try {
				if (!navigator.onLine)
					throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' }
			}
			finally { hideProgress() }
			if ((await ehConfirm('Bilgi Yükle yapılsın mı?', appName)) != true)
				return
			
			showProgress(' ', null, true, e => { e.abortFlag = true })
			let result = await this.bilgiYukle(e)
			progressManager?.progressEnd()
			await delay(200)
			hideProgress()
			
			if (result !== false)
				eConfirm('Bilgi yükleme işlemi bitti', appName)
		}
		catch (ex) {
			setTimeout(() => hideProgress(), 1000)
			hConfirm(getErrorText(ex), `${appName}: <span class="bold ek-bilgi">Bilgi Yükle</span>`)
			throw ex
		}
	}
	async bilgiYukle(e = {}) {
		if (!navigator.onLine)
			throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' }
		let TotalCount = 4
		if (progressManager) progressManager.progressMax = TotalCount
		if (e.abortFlag)
			return false
		if (progressManager)
			progressManager.text = `SkyWS Erişimi kontrol ediliyor...`
			try { await this.wsGetSessionInfo() }
			catch (ex) { console.error(ex); return false }
		progressManager?.progressStep()
		progressManager.text = `Yerel Veriler siliniyor...`
		progressManager?.progressStep()
		setTimeout(() => progressManager?.progressReset(), 50)
		await this.verileriSil(e)
		progressManager?.progressStep()
		let { localData } = app.params
		let mqYukle = async (mfSinif, normalmi, ozelmi) => {
			let selector = normalmi ? 'loadServerData' : 'loadServerDataDogrudan'
			if (progressManager)
				progressManager.text = `${mfSinif.sinifAdi} yükleniyor...`
			let recs = await mfSinif[selector]()
			if (!ozelmi && recs != null)
				localData.setData(mfSinif.dataKey, recs)
			progressManager?.progressStep()
			if (e.abortFlag) {
				localData.kaydet()
				throw { code: 'userAbort' }
			}
		};
		await Promise.all([
			this.sablonYukle(e),
			mqYukle(MQMustBilgi, true, true)
		])
		localData.kaydetDefer()
		return true
	}
	async verileriSilIstendi(e = {}) {
		let {params} = this, selectors = ['yerel', 'localData']
		let size = 0;
		for (let selector of selectors) {
			let param = params[selector];
			if (param) { let data = localStorage.getItem(param.class?.fullTableName); size += data?.length }
		}
		let sizeMB = roundToFra(size / 1024 / 1024, 2);
		let promise = new $.Deferred();
		let {wnd} = displayMessage((
			`<p class="bold">Yerel Veriler <u class="darkred">SİLİNECEK</u>.` +
				(sizeMB
					? (
						`<span class="ek-bilgi gray" style="font-size: 85%; margin-left: 10px">` +
							`(<b class="bold blue">${sizeMB.toLocaleString()} MB</b> veri)` +
						`</span>`
					)
					: ''
				) +
			`</p>` +
			`<p>Devam edilsin mi?</p>`
		), '',
			{ 'SİL': e => { promise.resolve(true); e.close() }, 'Vazgeç': e => { promise.resolve(false); e.close() } }
		);
		wnd.on('close', evt => promise.resolve(false));
		wnd.jqxWindow({ width: 500, height: 180, position: 'center' }); setTimeout(() => wnd.jqxWindow('resize'), 1);
		let buttons = wnd.find('.jqx-window-content > .buttons > button');
		buttons.eq(0).addClass('jqx-danger'); buttons.eq(1).addClass('jqx-inverse');
		let result = await promise
		if (result) {
			await this.verileriSil(e)
			eConfirm('Yerel veriler silindi', '')
		}
	}

	async verileriSil(e = {}) {
		let {params} = this, selectors = ['yerel', 'localData']
		for (let selector of selectors) {
			let param = params[selector]
			param = params[selector] = new param.class()
			await param.kaydet()
		}
	}

	async sablonYukle(e = {}) {
		if (!navigator.onLine)
			return false

		let { sablonDosyaPrefix: prefix } = this
		let { localData } = app.params
		let sablonYapi = {}
		await promiseAllSet([null, 'cariEkstre', 'kapanmayanHesap'].map(async k => {
			for (let k2 of [null, 'detay']) {
				let key = k || '_'
				let fullKey = [key, k2].filter(Boolean).join('.')
				let file = [prefix, k, k2].filter(Boolean).join('.') + '.htm'
				let content
				try { sablon = await HTMLDokum.FromDosyaAdi(file)?.result }
				catch (ex) { clog(getErrorText(ex)) }
				if (!content) {
					let dataType = 'html'
					let timeout = 5_000
					let url = `data/${file}`
					try { content = await ajaxPost({ dataType, timeout, url }) }
					catch (ex) {
						url = `../sahaDurum/${url}`
						try { content = await ajaxPost({ dataType, timeout, url }) }
						catch (ex) { clog(getErrorText(ex)) }
					}
				}
				if (content)
					sablonYapi[fullKey] = content
			}
		}))
		
		localData.set('sablon', sablonYapi)
		localData.kaydetDefer()
		return true
	}
	getSablonIcerik(e, _detaymi) {
		let isObj = isObject(e)
		let tip = isObj ? e.veriTipi ?? e.tip ?? e.kod : e
		let detaymi = _detaymi ?? ( isObj ? e.detay ?? e.detaymi : false )

		if (tip == 'icerikliCariEkstre')
			tip = 'cariEkstre'

		let { sablonDosyaPrefix: prefix } = this
		let { localData } = app.params
		let sablon = localData.get('sablon')
		if (empty(sablon))
			return null
		
		for (let k of [tip, '_']) {
			let key = k + (detaymi ? '.detay' : '')
			let v = sablon[key]
			if (v)
				return v
		}
		return null
	}

	wsTopluDurum({ plasiyerKod, mustKod } = {}) {
		let params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null)
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_topluDurum', params })
	}
	wsTicKapanmayanHesap({ plasiyerKod, mustKod } = {}) {
		let { params: par } = app
		let { yaslandirmaTarihmi } = par.finans ?? {}
		let params = [
			( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
			( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
			{ name: '@argSadecePlasiyereBagliOlanlar', type: 'bit', value: bool2Int(!!plasiyerKod) },
			( yaslandirmaTarihmi ? { name: '@argGecikmeTarihten', type: 'bit', value: bool2Int(yaslandirmaTarihmi) } : null )
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_kapanmayanHesap', params })
	}
	wsTicCariEkstre({ plasiyerKod, mustKod } = {}) {
		let params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_cariEkstre', params })
	}
	wsTicCariEkstre_icerik({ plasiyerKod, mustKod, cariTipKod } = {}) {
		let params = [
			( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
			( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(Boolean)
		return this.sqlExecSP({ query: 'tic_ticariIcerik', params })
	}
	wsCariEkstre_normal(e) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_normal', args: e }) })
	}
	wsCariEkstre_fiili(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_fiili', args: e }) })
	}
	wsCariEkstre_detaylar(e = {}) {
		deleteKeys(e, 'data', 'args')
		return ajaxGet({ timeout: 300000, processData: false, ajaxContentType: wsContentType, url: app.getWSUrl({ wsPath: 'ws/genel', api: 'cariEkstre_detaylar', args: e }) })
	}
}
