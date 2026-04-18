class SahaDurumApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this } get autoExecMenuId() { return 'DEF' } get defaultLoginTipi() { return 'plasiyerLogin' }
	get configParamSinif() { return MQYerelParamConfig_SahaDurum } get yerelParamSinif() { return MQYerelParam }
	get sablonDosyaPrefix() { return 'sahaDurum' }

	constructor(e = {}) { super(e) }
	async runDevam(e) {
		await super.runDevam(e)
		if (qs.user)
			await this.loginIstendi(e)
		else
			this.promise_login?.resolve()
		/*if (app.params.tablet?.yaslandirmaTarihmi) { MustBilgi.kademeEk = 30 }*/
		await this.anaMenuOlustur(e)
		let { session } = config, { yerel: yerelParam } = this.params
		let lastSession = yerelParam?.lastSession ?? session
		if (lastSession) {
			lastSession = yerelParam.lastSession = isPlainObject(lastSession) ? new Session(lastSession) : lastSession.deepCopy()
			//lastSession.user = `<span class="gray italic">${yerelParam?.lastSession.user}</span>`
			yerelParam.kaydetDefer()
		}
		this.updateAppTitle({
			userSession: session?.hasSession ? session : new Session(yerelParam?.lastSession)
		})
	}
	loginTipleriDuzenle({ loginTipleri }) {
		super.loginTipleriDuzenle(...arguments)
	}
	paramsDuzenle({ params }) {
		super.paramsDuzenle(...arguments)
		extend(params, {
			tablet: MQTabletParam.getInstance(),
			eIslem: MQEIslemParam.getInstance()
		})
	}
	async paramsDuzenleSonrasi(e) { try { await super.paramsDuzenleSonrasi(e) } finally { this.params.localData = await MQLocalData.getInstance() } }
	getAnaMenu(e) {
		/* const disabledMenuIdSet = this.disabledMenuIdSet || {}; */
		return new FRMenu({ items: [
			new FRMenuChoice({ mnemonic: 'BILGI-YUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }),
			new FRMenuChoice({ mnemonic: 'MUSTERILER', text: 'Müşteriler', block: e => MQMustBilgi.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'TABLET-PARAM', text: 'Tablet Parametreleri', block: e => app.params.tablet.tanimla(e) })
		]})
	}
	navLayoutOlustur_araIslem(e) {
		super.navLayoutOlustur_araIslem(e);
		const items = [
			new FRMenuChoice({
				id: '_verileriSil', text: `<span class="img"></span><span class="text">Verileri Sil</span>`,
				block: e => app.verileriSilIstendi(e)
			})
		];
		for (const item of items)
			item.navLayoutOlustur(e)
	}
	async bilgiYukleIstendi(e) {
		if (!config.session?.user) {
			await this.loginIstendi(e); const {session} = config, yerelParam = this.params.yerel;
			if (session?.user) { yerelParam.lastSession = session; setTimeout(() => yerelParam.kaydet(), 100) }
		}
		try {
			showProgress('İnternet bağlantısı kontrol ediliyor...', null, true); await new $.Deferred(p => setTimeout(() => p.resolve(), 100))
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
		const TotalCount = 4
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
		for (const selector of selectors) {
			let param = params[selector];
			if (param) { let data = localStorage.getItem(param.class?.fullTableName); size += data?.length }
		}
		const sizeMB = roundToFra(size / 1024 / 1024, 2);
		let promise = new $.Deferred();
		const {wnd} = displayMessage((
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
		const buttons = wnd.find('.jqx-window-content > .buttons > button');
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
					catch (ex) { clog(getErrorText(ex)) }
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

	
	wsPlasiyerIcinCariler(e) {
		e = e || {}; return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'plasiyerIcinCariler', args: e })
		})
	}
	wsTopluDurum(e) {
		e = e || {}; const {plasiyerKod, mustKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null)
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_topluDurum', params })
	}
	wsTicKapanmayanHesap(e) {
		e = e || {}; const {plasiyerKod, mustKod} = e, {yaslandirmaTarihmi} = app.params.tablet, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/
			{ name: '@argSadecePlasiyereBagliOlanlar', type: 'bit', value: bool2Int(!!plasiyerKod) },
			(yaslandirmaTarihmi ? { name: '@argGecikmeTarihten', type: 'bit', value: bool2Int(yaslandirmaTarihmi) } : null)
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_kapanmayanHesap', params })
		/*return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'tic_kapanmayanHesap', args: e })
		})*/
	}
	wsTicCariEkstre(e) {
		e = e || {}; const {plasiyerKod, mustKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_cariEkstre', params })
		/* return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'tic_cariEkstre', args: e })
		})*/
	}
	wsTicCariEkstre_icerik(e) {
		e = e || {}; const {plasiyerKod, mustKod, cariTipKod} = e, params = [
			(plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null),
			(mustKod ? { name: '@argMustKod', value: mustKod } : null),
			/*(cariTipKod ? { name: '@argCariTipKod', value: cariTipKod } : null),*/
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_ticariIcerik', params })
	}
	/*wsX(e) {
		e = e || {}; const {args} = e;
		const url = this.getWSUrl({ api: 'X', args }); return ajaxPost({ url })
	}
	wsY(e) {
		e = e || {}; const data = e.args || {}; delete e.args;
		return ajaxPost({
			processData: false, ajaxContentType: wsContentType,
			url: app.getWSUrl({ wsPath: 'ws/yonetim', api: 'Y', args: e }), data: toJSONStr(data)
		})
	}*/
}
