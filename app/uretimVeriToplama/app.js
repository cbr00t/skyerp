class UretimVeriToplamaApp extends App {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get configParamSinif() { return MQYerelParamConfig_Uretim } get sqlDeferWaitMS() { return 200 } /*get autoExecMenuId() { return 'BG' }*/
	constructor(e) {
		e = e || {}; super(e)
		/* $.extend(this, { veriAktarici_waitSecs: coalesce(e.veriAktarici_waitSecs, 4), otoGonderFlag: coalesce(e.otoGonderFlag, false) }) */
	}
	init(e) { super.init(e); this.params.yerel = MQYerelParamUretim.getInstance() }
	async runDevam(e) {
		await super.runDevam(e); await this.loginIstendi(e); await this.promise_ready;
		await this.wsConfigKontrol(e); await this.setValuesFromParam(e); await this.gerceklemeler_ilkIslemler(e)
	}
	async afterRun(e) {
		await super.afterRun(e); await this.promise_ready;
		let kullanim = app.params.operGenel?.kullanim || {}, eksikParamIsimleri = [];
		if (!kullanim.operasyonIsYonetimi) { eksikParamIsimleri.push('Operasyon İş Yönetimi') }
		if (!kullanim.mesVeriToplama) { eksikParamIsimleri.push('Tablet Veri Toplama') }
		if (eksikParamIsimleri.length) {
			const _e = {
				query: 'opyon_bekleyenler',
				params: [
					{ name: '@hatKod', type: 'varchar', value: '---' },
					{ name: '@sadeceIslenebilir', type: 'bit', value: bool2Int(true) },
					{ name: '@goreviOlanlar', type: 'bit', value: bool2Int(true) },
					{ name: '@sadeceBaslamis', type: 'bit', value: bool2Int(true) }
				].filter(x => !!x)
			}
			try { await app.sqlExecSP(_e) } catch (ex) {
				this.disabledMenuIdSet = asSet(['M', 'BG', 'GK', 'T']);
				const paramIsimleriGosterim = eksikParamIsimleri.map(x => `<span class="bold firebrick">${x}</span>`).join(' VE ');
				const wnd = createJQXWindow({
					content: (
						`<div>${paramIsimleriGosterim} parametreleri</div>
						<div>Vio Ticari Program &gt; <span class="bold royalblue">Operasyon Genel Parametreleri</span> kısmından açılmalıdır.</div><p/>
						<div class="darkgray">Bu parametreler kapalı iken <b class="gray">Gerçekleme ekranlarında</b> <u class="red">program hataya düşecektir</u>.</div><p/><p/>
						<div class="gray">Eğer bu parametreler işaretli ise <b class="royalblue">Güncel Ticari Sürümün</b> yüklü olduğundan emin olunuz ve <u>ilgili parametre adımına girip</u> <b>Kaydet</b> butonuna tıklayınız</div>`
					),
					title: `<span class="bold">!! UYARI !!</span><span class="gray"> - ${appName}</span>`,
					args: { isModal: true, width: Math.min(830, $(window).width() / 1.5), height: 330, showCloseButton: true, showCollapseButton: false, closeButtonAction: 'destroy' }
					// buttons: { TAMAM: e => e.close() }
				});
				wnd.css('font-size', '130%'); wnd.find('div > .jqx-window-header').addClass('bg-darkred') /* wnd.find('div > .buttons > button:eq(0)').jqxButton('template', 'danger') */
			}
		}
		await this.anaMenuOlustur(e); await this.initLayout(e) /* this.veriAktarici_startTimer(e) */
	}
	paramsDuzenle(e) {
		super.paramsDuzenle(e); const {params} = e;
		$.extend(params, {
			ortak: MQOrtakParam.getInstance(), zorunlu: MQZorunluParam.getInstance(), stokBirim: MQStokBirimParam.getInstance(), stokGenel: MQStokGenelParam.getInstance(),
			uretim: MQUretimParam.getInstance(), operGenel: MQOperGenelParam.getInstance(), kalite: MQKaliteParam.getInstance()
		})
	}
	async paramsDuzenleSonrasi(e) { await super.paramsDuzenleSonrasi(e); this.params.localData = await MQLocalData.getInstance() }
	initLayout(e) { }
	async wsConfigKontrol(e) {
		const {params} = this; let yerelParam = params.yerel;
		if (yerelParam?.wsConfigDegistimi) {
			let promise = new $.Deferred();
			const {wnd} = displayMessage(
				`<p>WS Bağlantı Ayarları Değiştiği için Yerel Veriler sıfırlanmalı</p><p class="bold darkred">Yerel Veriler <u>SİLİNEREK</u> devam edilsin mi?</p>`,
				'', { 'SİL ve Devam Et': e => { promise.resolve(true); e.close() }, 'SilMEden Devam Et': e => { promise.resolve(false); e.close() } }
			);
			wnd.on('close', evt => promise.resolve(false));
			wnd.jqxWindow({ width: 500, height: 180, position: 'center' }); setTimeout(() => wnd.jqxWindow('resize'), 1);
			const buttons = wnd.find('.jqx-window-content > .buttons > button'); buttons.eq(0).addClass('jqx-danger'); buttons.eq(1).addClass('jqx-inverse');
			let result = await promise; if (result) await this.verileriSil(e)
		}
	}
	setValuesFromParam(e) { const {params} = this; const hmr = asSet(params.operGenel.hmr) ?? {}; /*if (!$.isEmptyObject(hmr))*/ if (hmr) { HMRBilgi.belirtecListe = Object.keys(hmr) } }
	gerceklemeler_ilkIslemler(e) {
		const yerelParam = this.params.yerel, gerceklemeler = yerelParam.gerceklemeler || [];
		let degistimi = false; const durumSet = asSet(['processing', 'changing', 'error']);
		for (const rec of gerceklemeler) { const {_durum} = rec; if (durumSet[_durum]) { rec._durum = ''; degistimi = true } }
		if (degistimi) { yerelParam.kaydet(); const {activePart} = this; if (activePart?.tazele) activePart.tazele() }
	}
	async barkodBilgiBelirleFromEOU(e) {
		let result = await this.barkodBilgiBelirleBasit(e); if (result != null) { return result }
		e = e || {}; if (typeof e != 'object') e = { barkod: e }
		const barkod = e.barkod?.trim(); if (!barkod) { return null }
		const MinParcaSayi = 3; const basitmi = e.basitmi ?? e.basit ?? e.basitFlag, {carpan} = e; let result_parts;
		let separator = ';', parts = barkod.split(separator);
		if (parts?.length < MinParcaSayi) { separator = '-'; parts = barkod.split(separator) }
		if (parts?.length < MinParcaSayi) { separator = '/'; parts = barkod.split(separator) }
		if (parts?.length < MinParcaSayi) { separator = '|'; parts = barkod.split(separator) }
		if (parts?.length >= MinParcaSayi) { result_parts = parts }
		if (result_parts) {
			/*if (!(result_parts[0] || asInteger(result_parts[1]))) { return {} }*/
			result_parts = [...result_parts.slice(0, 2), result_parts.slice(2).join(separator || '')];
			return {
				okunanBarkod: barkod, barkod,
				carpan: carpan || null, miktar: carpan || null,
				emirNox: result_parts[0], opNo: result_parts[1],
				revNo: (result_parts.length == 4 ? result_parts[2] : null),
				shKod: (result_parts.length == 4 ? result_parts[3] : result_parts[2])
			}
		}
		return barkod ? {} : null
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
			const {wnd} = displayMessage(
				(
					`<p class="bold">Yerel Veriler <u class="darkred">SİLİNECEK</u>.` +
						(sizeMB
							? (
								`<span class="ek-bilgi gray" style="font-size: 85%; margin-left: 10px">` +
									 `(<b class="bold blue">${sizeMB.toLocaleString()} MB</b> veri)` +
								`</span>`
							) : '') +
					`</p><p>Devam edilsin mi?</p>`
				),
				'',
				{ 'SİL': e => { promise.resolve(true); e.close() }, 'Vazgeç': e => { promise.resolve(false); e.close() } }
			);
			wnd.on('close', evt => promise.resolve(false));
			wnd.jqxWindow({ width: 500, height: 180, position: 'center' }); setTimeout(() => wnd.jqxWindow('resize'), 1);
			const buttons = wnd.find('.jqx-window-content > .buttons > button');
			buttons.eq(0).addClass('jqx-danger'); buttons.eq(1).addClass('jqx-inverse');
			let result = await promise;
			if (result) { await this.verileriSil(e); eConfirm('Yerel veriler silindi', ''); }
	}
	async verileriSil(e) {
		e = e || {}; const {params} = this, selectors = ['yerel', 'localData'];
		for (const selector of selectors) { let param = params[selector]; param = params[selector] = new param.class(); await param.kaydet() }
	}
	async createTestTables(e) {
		/*await this.sqlExecNoneWithResult(
			`DROP TABLE tmp
			 GO
			 CREATE TABLE tmp (id CHAR(40) NOT NULL PRIMARY KEY, barkod CHAR(60) NOT NULL DEFAULT '', stok CHAR(80) NOT NULL DEFAULT '', miktar DEC(17, 6) NOT NULL DEFAULT 0)`
		);
		await this.sqlExecNoneWithResult(
			`CREATE TABLE tmp (id CHAR(40) NOT NULL PRIMARY KEY, barkod CHAR(60) NOT NULL DEFAULT '', stok CHAR(80) NOT NULL DEFAULT '', miktar DEC(17, 6) NOT NULL DEFAULT 0)`
		)*/
	}
	navLayoutOlustur_araIslem(e) {
		super.navLayoutOlustur_araIslem(e);
		const items = [new FRMenuChoice({ id: '_verileriSil', text: `<span class="img"></span><span class="text">Verileri Sil</span>`, block: e => app.verileriSilIstendi(e) })];
		for (const item of items) item.navLayoutOlustur(e)
	}
	getAnaMenu(e) {
		const disabledMenuIdSet = this.disabledMenuIdSet || {};
		const items = [
			/*new FRMenuChoice({ mnemonic: 'SG', text: 'Seçerek Gerçekleme Yap', block: e => new SecerekGerceklemePart().run(e) }),*/
			new FRMenuChoice({ mnemonic: 'BG', text: 'Barkodlu Gerçekleme Yap', block: e => new BarkodluGerceklemePart().run(e) }),
			new FRMenuChoice({ mnemonic: 'M', text: 'Operasyon ve Görevler', block: e => MQOEMVeGorev.listeEkraniAc(e) }),
			new FRMenuChoice({ mnemonic: 'GK', text: 'Gerçekleme Listesi', block: e => MQGercekleme.listeEkraniAc(e) }),
			new FRMenuCascade({ mnemonic: 'T', text: 'Tanımlar', items: [
				new FRMenuChoice({ mnemonic: 'H', text: 'Hat Listesi', block: e => MQHat.listeEkraniAc(e) }),
				new FRMenuChoice({ mnemonic: 'T', text: 'Tezgah Listesi', block: e => MQTezgah.listeEkraniAc(e) }),
				new FRMenuChoice({ mnemonic: 'O', text: 'Operasyon Listesi', block: e => MQOperasyon.listeEkraniAc(e) }),
				new FRMenuChoice({ mnemonic: 'U', text: 'Ürün Listesi', block: e => MQStok.listeEkraniAc(e) }),
				new FRMenuChoice({ mnemonic: 'Y', text: 'Stok Yer Listesi', block: e => MQStokYer.listeEkraniAc(e) }),
				new FRMenuChoice({ mnemonic: 'R', text: 'Yer Raf Listesi', block: e => MQYerRaf.listeEkraniAc(e) })
			] })
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
	getMQRecs(e) { return this.params.localData.getMQRecs(e) }
	veriAktarici_startTimer(e) {
		this.veriAktarici_stopTimer(e);
		this.veriAktarici_timer = setTimeout(async e => {
			let result; try { if (!this.otoGonderFlag) { result = false; return } result = await this.veriAktarici_timerProc(e) }
			catch (ex) { console.error(ex) } finally { if (result !== false) this.veriAktarici_startTimer(e) }
		}, this.veriAktarici_waitSecs * 1000, e)
	}
	veriAktarici_stopTimer(e) {
		const {veriAktarici_timer} = this;
		if (veriAktarici_timer) { clearTimeout(veriAktarici_timer); delete this.veriAktarici_timer }
		return veriAktarici_timer
	}
	async veriAktarici_timerProc(e) {
		e = e || {}; const ignoreSet = asSet([/*'done',*/ 'removed']), yerelParam = this.params.yerel;
		const orjGerceklemeler = yerelParam.gerceklemeler || [], gerceklemeler = yerelParam.gerceklemeler = orjGerceklemeler.filter(rec => !ignoreSet[rec._durum]);
		let degistimi = gerceklemeler.length != orjGerceklemeler.length, id2Rec; const {recs} = e;
		if (recs) { id2Rec = {}; for (const rec of recs) { const {id} = rec; if (id != null) { id2Rec[id] = rec } } }
		const isOnline = navigator.onLine, index2Bilgi = {}, queries = [];
		for (let i = 0; i < gerceklemeler.length; i++) {
			const rec = gerceklemeler[i]; if (id2Rec) { const {id} = rec; if (id == null || !id2Rec[id]) { continue } }
			const {_durum} = rec; if (_durum == 'changing' || _durum == 'done') { continue }
			if (!rec.oemSayac) { rec._durum = isOnline ? 'error' : 'offline'; continue }
			const bilgi = index2Bilgi[i] = { index: i, rec };
			if (isOnline) {
				const subQueries = []; let query = await rec.getQueryYapi(e); if (query) { subQueries.push(query) }
				if (!$.isEmptyObject(rec.iskartalar)) { subQueries.push(_e => _e.rec.getQueryYapi_iskartalar(e)) }
				if (!$.isEmptyObject(rec.kaliteYapi?.recs)) { subQueries.push(_e => _e.rec.getQueryYapi_kalite(e)) }
				bilgi.queries = subQueries
			}
		}
		for (const bilgi of Object.values(index2Bilgi)) {
			const value = isOnline ? 'processing' : 'offline'; const {_durum} = bilgi.rec;
			if (_durum != value) { bilgi.rec._durum = value; degistimi = true }
		} /*if (degistimi) { const {activeWndPart} = this; if (activeWndPart && activeWndPart.tazele) activeWndPart.tazele() }*/
		let error; if (isOnline) {
			try {
				if (queries?.length) { await this.sqlExecSP(queries); degistimi = true }
				const _e = $.extend({}, e); for (const bilgi of Object.values(index2Bilgi)) {
					$.extend(_e, bilgi); const {queries, rec} = bilgi;
					if (queries?.length) {
						for (const _query of queries) {
							let query = await _query; if (isFunction(query) || query.run) { query = await getFuncValue.call(this, query, _e) } if (!query) { continue }
							let result = bilgi.result = (isFunction(query) || query.run) ? await getFuncValue.call(this, query, _e) : await this.sqlExecSP(query)
							let gerSayac; const params = (result || {}).params || {}, param_gerSayac = params['@gerSayac'];
							if (param_gerSayac) { gerSayac = asInteger(param_gerSayac.value) || null }
							if (gerSayac) { rec.gerSayac = gerSayac }
							const value = 'done'; if (rec._durum != value) { rec._durum = value }
						}
					}
				}
			}
			catch (ex) { error = ex; for (const bilgi of Object.values(index2Bilgi)) { const value = 'error'; if (bilgi.rec._durum != value) { bilgi.rec._durum = value } } }
		}
		if (degistimi) { yerelParam.gerceklemeler = orjGerceklemeler; yerelParam.kaydet(); degistimi = false } if (error) { throw error }
		return index2Bilgi
	}
	playSound_barkodOkundu() {
		setTimeout(async () => {
			for (let i = 0; i < 1; i++) {
				const audio = new Audio(`${webRoot}/media/Barcode-scanner-beep-sound.mp3`);
				try { await audio.play() }
				catch (ex) { }
			}
		}, 0)
	}
	playSound_barkodError() {
		setTimeout(async () => {
			for (let i = 0; i < 2; i++) {
				const audio = new Audio(`${webRoot}/media/Beep-tone-sound-effect.mp3`);
				try { await audio.play() }
				catch (ex) { }
			}
		}, 0)
	}
	wsX(e) {
		e = e || {};
		if (this.class.isTest)
			return { isError: false, result: [] };
		
		const {args} = e;
		const url = this.getWSUrl({ api: 'X', args: args });
		return ajaxPost({ url: url })
	}
	wsY(e) {
		e = e || {};
		if (this.class.isTest)
			return { isError: false, result: [] };

		const data = e.args || {};
		delete e.args;
		
		return ajaxPost({
			timeout: 5000, processData: false, ajaxContentType: wsContentType,
			url: app.getWSUrl({ /* wsPath: 'ws/yonetim', */ api: 'Y', args: e }),
			data: toJSONStr(data)
		})
	}
}
