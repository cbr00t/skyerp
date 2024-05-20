class SahaDurumApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get autoExecMenuId() { return 'DEF' } get defaultLoginTipi() { return 'plasiyerLogin' }
	constructor(e) { e = e || {}; super(e) }
	async runDevam(e) {
		await super.runDevam(e); if (qs.user) await this.loginIstendi(e); else this.promise_login.resolve();
		await this.promise_ready; await this.anaMenuOlustur(e); const {session} = config, yerelParam = this.params.yerel;
		let lastSession = yerelParam?.lastSession ?? session;
		if (lastSession) {
			lastSession = yerelParam.lastSession = $.isPlainObject(lastSession) ? new Session(lastSession) : lastSession.deepCopy(); /*lastSession.user = `<span class="gray italic">${yerelParam?.lastSession.user}</span>`;*/
			setTimeout(() => yerelParam.kaydet(), 100)
		}
		this.updateAppTitle({ userSession: session?.hasSession ? session : new Session(yerelParam?.lastSession) });
	}
	loginTipleriDuzenle(e) {
		const {loginTipleri} = e; $.merge(loginTipleri, [
			{ kod: 'plasiyerLogin', aciklama: 'Plasiyer' },
			{ kod: 'musteriLogin', aciklama: 'Müşteri' }
		])
	}
	paramsDuzenle(e) {
		super.paramsDuzenle(e);	 const {params} = e;
		$.extend(params, { yerel: MQYerelParam.getInstance(), ortak: MQOrtakParam.getInstance() })
	}
	async paramsDuzenleSonrasi(e) { await super.paramsDuzenleSonrasi(e); this.params.localData = await MQLocalData.getInstance() }
	getAnaMenu(e) {
		/* const disabledMenuIdSet = this.disabledMenuIdSet || {}; */
		return new FRMenu({ items: [
			new FRMenuChoice({ mnemonic: 'BILGI-YUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }),
			new FRMenuChoice({ mnemonic: 'MUSTERILER', text: 'Müşteriler', block: e => MQMustBilgi.listeEkraniAc() })
		]})
	}
	navLayoutOlustur_araIslem(e) {
		super.navLayoutOlustur_araIslem(e);
		const items = [
			new FRMenuChoice({
				id: '_verileriSil', text: `<span class="img"/><span class="text">Verileri Sil</span>`,
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
			try { if (!navigator.onLine) { throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' } } } finally { hideProgress() }
			if ((await ehConfirm('Bilgi Yükle yapılsın mı?', appName)) != true) return
			showProgress(' ', null, true, e => { e.abortFlag = true });
			const result = await this.bilgiYukle(e);
			progressManager?.progressEnd(); await new $.Deferred(p => setTimeout(() => { hideProgress(); p.resolve() }, 200));
			if (result !== false) eConfirm('Bilgi yükleme işlemi bitti', appName)
		}
		catch (ex) {
			await new $.Deferred(p => setTimeout(() => { hideProgress(); p.resolve() }, 1000)); hConfirm(getErrorText(ex), `${appName}: <span class="bold ek-bilgi">Bilgi Yükle</span>`);
			throw ex
		}
	}
	async bilgiYukle(e) { /* https://195.87.111.251:9200 */
		e = e || {}; if (!navigator.onLine) { throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' } }
		const TotalCount = 4; if (progressManager) progressManager.progressMax = TotalCount; if (e.abortFlag) return false
		if (progressManager) progressManager.text = `SkyWS Erişimi kontrol ediliyor...`; try { await this.wsGetSessionInfo() } catch (ex) { console.error(ex); return false } progressManager?.progressStep()
		progressManager.text = `Yerel Veriler siliniyor...`; progressManager?.progressStep(); await new $.Deferred(p => setTimeout(() => { progressManager?.progressReset(); p.resolve() }, 50)); await this.verileriSil(e);
		const {localData} = app.params; progressManager?.progressStep()
		const mqYukle = async (mfSinif, normalmi, ozelmi) => {
			const selector = normalmi ? 'loadServerData' : 'loadServerDataDogrudan';
			if (progressManager) progressManager.text = `${mfSinif.sinifAdi} yükleniyor...`; const recs = await mfSinif[selector]();
			if (!ozelmi && recs != null) { localData.setData(mfSinif.dataKey, recs) }
			progressManager?.progressStep(); if (e.abortFlag) { localData.kaydet(); throw { code: 'userAbort' } }
		};
		await Promise.all([mqYukle(MQMustBilgi, true, true)]); localData.kaydet(); return true
	}
	async verileriSilIstendi(e) {
		e = e || {}; const {params} = this, selectors = ['yerel', 'localData'];
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
		let result = await promise; if (result) { await this.verileriSil(e); eConfirm('Yerel veriler silindi', ''); }
	}
	async verileriSil(e) {
		e = e || {}; const {params} = this, selectors = ['yerel', 'localData'];
		for (const selector of selectors) { let param = params[selector]; param = params[selector] = new param.class(); await param.kaydet() }
	}
	wsPlasiyerIcinCariler(e) {
		e = e || {}; return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'plasiyerIcinCariler', args: e })
		})
	}
	wsTicKapanmayanHesap(e) {
		e = e || {}; const {plasiyerKod, mustKod} = e, params = [
			( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
			( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_kapanmayanHesap', params })
		/*return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'tic_kapanmayanHesap', args: e })
		})*/
	}
	wsTicCariEkstre(e) {
		e = e || {}; const {plasiyerKod, mustKod} = e, params = [
			( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
			( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
			{ name: '@argSadecePlasiyereBagliOlanlar', value: bool2Int(!!plasiyerKod) }
		].filter(x => !!x);
		return this.sqlExecSP({ query: 'tic_cariEkstre', params })
		/* return ajaxPost({
			timeout: 10 * 60000, processData: false, ajaxContentType: wsContentTypeVeCharSet,
			url: app.getWSUrl({ wsPath: 'ws/genel', api: 'tic_cariEkstre', args: e })
		})*/
	}
	wsTicCariEkstre_icerik(e) {
		e = e || {}; const {plasiyerKod, mustKod} = e, params = [
			( plasiyerKod ? { name: '@argPlasiyerKod', value: plasiyerKod } : null ),
			( mustKod ? { name: '@argMustKod', value: mustKod } : null ),
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
