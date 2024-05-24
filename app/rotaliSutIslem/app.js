class RotaliSutIslemApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get configParamSinif() { return MQYerelParamConfig_App } get autoExecMenuId() { return super.autoExecMenuId } /* get defaultLoginTipi() { return 'plasiyerLogin' } */
	get gonderilmemisVeriler() {
		const {localData} = this.params, {dataKey} = MQRotaliFis; let recs = localData.getData(dataKey) || [];
		recs = recs.filter(rec => !(rec.devredisi || rec.gonderimTS || $.isEmptyObject(rec.detaylar?.filter(det => !!det.toplam)))); return recs
	}
	constructor(e) { e = e || {}; super(e) }
	async runDevam(e) {
		await super.runDevam(e); if (qs.user) await this.loginIstendi(e); else this.promise_login.resolve();
		await this.promise_ready; await this.params.config.sonIslemler(e); const {session} = config, yerelParam = this.params.yerel;
		let lastSession = yerelParam?.lastSession ?? session;
		if (lastSession) {
			lastSession = yerelParam.lastSession = $.isPlainObject(lastSession) ? new Session(lastSession) : lastSession.deepCopy(); /*lastSession.user = `<span class="gray italic">${yerelParam?.lastSession.user}</span>`;*/
			setTimeout(() => yerelParam.kaydet(), 100)
		}
		this.updateAppTitle({ userSession: session?.hasSession ? session : new Session(yerelParam?.lastSession) });
	}
	async afterRun(e) {
		await super.afterRun(e); await this.promise_ready; const {params, appName} = this, sutParam = params.sut || {}; let {kullanim} = sutParam;
		if (kullanim.sutToplama == false) {
			this.disabledMenuIdSet = asSet(['ROTALI-FIS']);
			const wnd = createJQXWindow({
				content: (
					`<div class="royalblue bold">Süt Toplama parametresi</div>` +
					`<div>Vio Ticari Program &gt; <span class="bold royalblue">Ticari Genel Parametreleri</span> kısmından açılmalıdır.</div>` +
					`<p/><p/>` +
					`<div class="gray">Eğer bu parametreler işaretli ise <b class="royalblue">Güncel Ticari Sürümün</b> yüklü olduğundan emin olunuz ve <u>ilgili parametre adımına girip</u> <b>Kaydet</b> butonuna tıklayınız</div>`
				),
				title: `<span class="bold">!! UYARI !!</span><span class="gray"> - ${appName}</span>`,
				args: { isModal: true, width: Math.min(830, $(window).width() / 1.5), height: 330, showCloseButton: true, showCollapseButton: false, closeButtonAction: 'destroy' }
				// buttons: { TAMAM: e => e.close() }
			});
			wnd.css('font-size', '130%'); wnd.find('div > .jqx-window-header').addClass('bg-darkred');
		}
		await this.anaMenuOlustur(e)
	}
	paramsDuzenle(e) {
		super.paramsDuzenle(e);	 const {params} = e;
		$.extend(params, { yerel: MQYerelParam.getInstance(), ortak: MQOrtakParam.getInstance(), sut: MQSutParam.getInstance() })
	}
	async paramsDuzenleSonrasi(e) { await super.paramsDuzenleSonrasi(e); this.params.localData = await MQLocalData.getInstance() }
	getAnaMenu(e) {
		const disabledMenuIdSet = this.disabledMenuIdSet || {};
		let items = [
			new FRMenuChoice({ mnemonic: 'BILGI-YUKLE', text: 'Bilgi Yükle', block: e => this.bilgiYukleIstendi(e) }),
			new FRMenuChoice({ mnemonic: 'ROTALI-FIS', text: 'Rotalı Fiş', block: e => MQRotaliFis.listeEkraniAc() }),
			new FRMenuChoice({ mnemonic: 'BILGI-GONDER', text: 'Bilgi Gönder', block: e => this.bilgiGonderIstendi(e) })
		];
		const kisitla = items => {
			for (const item of items) {
				if (!item) continue; if (item?.items) kisitla(item.items)
				const mne = item.mnemonic;
				if (disabledMenuIdSet[mne]) { item.isDisabled = true; if (item.items) { for (const _item of item.items) { _item.isDisabled = true } } }
			}
		}; kisitla(items);
		return new FRMenu({ items })
	}
	navLayoutOlustur_araIslem(e) {
		super.navLayoutOlustur_araIslem(e); const {dev, session} = config;
		if (dev && (!session || session?.isAdmin)) {
			const items = [ new FRMenuChoice({ id: '_verileriSil', text: `<span class="img"></span><span class="text">Verileri Sil</span>`, block: e => this.verileriSilIstendi(e) }) ];
			for (const item of items) item.navLayoutOlustur(e)
		}
	}
	async bilgiYukleIstendi(e) {
		e = e || {}; if (!config.session?.user) {
			await this.loginIstendi(e); const {session} = config, yerelParam = this.params.yerel;
			if (session?.user) { yerelParam.lastSession = session; setTimeout(() => yerelParam.kaydet(), 100) }
		}
		try {
			showProgress('İnternet bağlantısı kontrol ediliyor...', null, true); await new $.Deferred(p => setTimeout(() => p.resolve(), 100))
			try { if (!navigator.onLine) { throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' } } } finally { hideProgress() }
			let ekMesaj = ''; const recs = this.gonderilmemisVeriler; if (recs?.length) { ekMesaj += `<div class="darkred"><span class="bold">** <u>UYARI</u>: Gönderilmemiş ${recs.length} adet belge</span> var</div>` }
			if (recs?.length && !config.dev) { hideProgress(); throw { isError: true, errorText: 'gonderilmemisVeriVar', errorText: ekMesaj } }
			if ((await ehConfirm(`<div class="bold" style="margin-top: 8px">Bilgi Yükle yapılsın mı?</div>${ekMesaj}`, appName)) != true) return; showProgress(' ', null, true, e => { e.abortFlag = true });
			const result = await this.bilgiYukle(e);
			progressManager?.progressEnd(); await new $.Deferred(p => setTimeout(() => { hideProgress(); p.resolve() }, 200));
			if (result !== false) eConfirm('Bilgi Yükleme işlemi bitti', appName)
		}
		catch (ex) {
			await new $.Deferred(p => setTimeout(() => { hideProgress(); p.resolve() }, 200)); const errorText = getErrorText(ex);
			if (errorText) { hConfirm(errorText, `${appName}: <span class="bold ek-bilgi">Bilgi Yükle</span>`) } throw ex
		}
	}
	async bilgiGonderIstendi(e) {
		e = e || {}; if (!config.session?.user) {
			await this.loginIstendi(e); const {session} = config, yerelParam = this.params.yerel;
			if (session?.user) { yerelParam.lastSession = session; setTimeout(() => yerelParam.kaydet(), 100) }
		}
		try {
			showProgress('İnternet bağlantısı kontrol ediliyor...', null, true); await new $.Deferred(p => setTimeout(() => p.resolve(), 100))
			try { if (!navigator.onLine) { throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' } } } finally { hideProgress() }
			const recs = e.recs = this.gonderilmemisVeriler; if ($.isEmptyObject(recs)) { hideProgress(); throw { isError: true, rc: 'noData', errorText: 'Gönderilmeyi bekleyen veri yok' } }
			if ((await ehConfirm(`<div class="bold"><span class="green">${recs.length} adet belge</span> merkeze gönderilsin mi?</div>`, appName)) != true) return; showProgress(' ', null, true, e => { e.abortFlag = true });
			const result = await this.bilgiGonder(e); progressManager?.progressEnd(); await new $.Deferred(p => setTimeout(() => { hideProgress(); p.resolve() }, 200));
			if (result !== false) eConfirm('Bilgi Gönderim işlemi bitti', appName)
		}
		catch (ex) {
			await new $.Deferred(p => setTimeout(() => { hideProgress(); p.resolve() }, 1000)); const errorText = getErrorText(ex);
			if (errorText) { hConfirm(errorText, `${appName}: <span class="bold ek-bilgi">Bilgi Gönder</span>`) } throw ex
		}
	}
	async bilgiYukle(e) {
		e = e || {}; if (!navigator.onLine) { throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' } }
		const TotalCount = 4; if (progressManager) progressManager.progressMax = TotalCount; if (e.abortFlag) return false
		if (progressManager) progressManager.text = `SkyWS Erişimi kontrol ediliyor...`; try { await this.wsGetSessionInfo() } catch (ex) { console.error(ex); return false } progressManager?.progressStep()
		progressManager.text = `Yerel Veriler siliniyor...`; progressManager?.progressStep(); await new $.Deferred(p => setTimeout(() => { progressManager?.progressReset(); p.resolve() }, 50)); await this.verileriSil(e);
		const {params} = app, {localData} = params, postaKod = params.config.postaKod || null; progressManager?.progressStep();
		const mqYukle = async (mfSinif, block) => {
			if (!block) block = 'loadServerDataDogrudan'; if (progressManager) progressManager.text = `${mfSinif.sinifAdi} yükleniyor...`;
			let recs = await (typeof block == 'string' ? mfSinif[block]() : getFuncValue.call(this, block, $.extend({}, e, { mfSinif })));
			if (recs != null) {
				/*if (mfSinif == MQSutSira || MQSutSira.isPrototypeOf(mfSinif)) { }*/
				localData.setData(mfSinif.dataKey, recs)
			}
			progressManager?.progressStep(); if (e.abortFlag) { localData.kaydet(); throw { code: 'userAbort' } }
			return recs
		};
		let result = await Promise.all([ mqYukle(MQSutRota), mqYukle(MQSutSira) ]); const rotaRecs = result[0], siraRecs = result[1];
		await mqYukle(MQRotaliFis, e => {
			const rotaTipi_kod2Adi = {}; for (const ka of RotaTipi.kaListe) { rotaTipi_kod2Adi[ka.kod] = ka.aciklama }
			const fisRecs = [], rotaAnahSet = {}; for (const rec of rotaRecs) {
				const kayitTipi = rec.kayittipi, rotaKod = rec.rotakod, anah = `${kayitTipi}|${rotaKod}`;
				if (rotaAnahSet[anah]) continue; rotaAnahSet[anah] = true;
				const rotaAdi = rec.rotaadi, {gonderimTS} = rec, devreDisimi = rec.devredisi ?? rec.devreDisimi, fis = {
					sayac: rec.rotasayac, seq: rec.seq, gonderimTS, devreDisimi, rotaTipi: kayitTipi, rotaKod, rotaAdi, mustKod: rec.mustkod, mustAdi: rec.mustadi,
					tankerIseAracKod: rec.tankerisearackod, _rotaTipiText: rotaTipi_kod2Adi[kayitTipi]
					/* _rotaText: `<div class="parent flex-row"><div class="kod ek-bilgi">${rotaKod}</div><div class="aciklama asil">${rotaAdi}</div></div>`, */
				}; fisRecs.push(fis)
			}
		return fisRecs })
		localData.kaydet(); return true
	}
	async bilgiGonder(e) {
		e = e || {}; if (!navigator.onLine) { throw { isError: true, rc: 'noInternet', errorText: 'Bu işlem için İnternet Bağlantısı gereklidir' } } if (e.abortFlag) return false
		if (progressManager) progressManager.text = `SkyWS Erişimi kontrol ediliyor...`; try { await this.wsGetSessionInfo() } catch (ex) { console.error(ex); return false } progressManager?.progressStep()
		await new $.Deferred(p => setTimeout(() => { progressManager?.progressReset(); p.resolve() }, 50)); const recs = e.recs ?? this.gonderilmemisVeriler; if (progressManager) progressManager.progressMax = recs?.length ?? 0
		const {PrefixSut} = MQRotaliFis, {params} = this, postaKod = params.config.postaKod || null, {localData} = params, {maxSayi} = MQSutSira, sutKodlari = localData.getData(MQSutSira.dataKey).map(_rec => _rec.stokkod).slice(0, maxSayi); let degistimi = false;
		for (const rec of recs) {
			const detaylar = (rec.detaylar || []).filter(det => !!det.toplam); if (!detaylar?.length) { continue } const {sayac, rotaTipi} = rec, argSutKodlari = sutKodlari.map(kod => ({ kod }));
			const argDetaylar = detaylar.map(det => {
				const {mustKod} = det, _rec = { kayitTipi: '', mustKod, toplayiciRotaSayac: null };		/* dict sırası önemli */
				for (let i = 0; i < maxSayi; i++) { const seq = i + 1, key = `${PrefixSut}${seq}`, value = roundToFra(asFloat(det[key]), 1); _rec[`${key}Miktar`] = value }
				return _rec
			})
			const params = [
				{ name: '@argRotaSayac', type: 'int', value: sayac },
				{ name: '@argFisTipi', type: 'char', value: rotaTipi },
				/* { name: '@argTarih', type: 'char', value: null }, */
				{ name: '@argPosta', type: 'char', value: postaKod },
				{ name: '@argSutKodlari', type: 'structured', typeName: 'type_charList', value: argSutKodlari },
				{ name: '@argDetaylar', type: 'structured', typeName: 'type_sut_detay', value: argDetaylar }
			]
			console.debug('sut_fisKaydet', await this.sqlExecSP({ query: 'sut_fisKaydet', params }));
			rec.gonderimTS = now(); degistimi = true
		}
		if (degistimi) { localData.kaydet() }; return true
	}
	async verileriSilIstendi(e) {
		e = e || {}; const {params} = this, selectors = ['yerel', 'localData'];
		let size = 0;
		for (const selector of selectors) {
			let param = params[selector];
			if (param) { let data = localStorage.getItem(param.class?.fullTableName); size += data?.length }
		}
		const sizeMB = roundToFra(size / 1024 / 1024, 2); let promise = new $.Deferred();
		const {wnd} = displayMessage((
			`<p class="bold">Yerel Veriler <u class="darkred">SİLİNECEK</u>.` +
				( sizeMB ? `<span class="ek-bilgi gray" style="font-size: 85%; margin-left: 10px">(<b class="bold blue">${sizeMB.toLocaleString()} MB</b> veri)</span>` : '' ) +
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
}
