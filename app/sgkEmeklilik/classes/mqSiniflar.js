class MQEmeklilikSorgu extends MQCogul {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'SGK Emeklilik Sorgu' } static get localDataSelector_tcKimlikNo2Rec() { return `${this.classKey}-tcKimlikNo2Rec` }
	static get tanimlanabilirmi() { return false } static get silinebilirmi() { return false } static get raporKullanilirmi() { return false } static get secimSinif() { return null }
	static islemTuslariDuzenle_listeEkrani_ilk(e) {
		super.islemTuslariDuzenle_listeEkrani_ilk(e); const {liste} = e, gridPart = e.gridPart ?? e.parentPart ?? e.sender
		liste.push(
			{ id: 'sorguYap', text: 'Sorgu Yap', handler: _e => this.sorguYapIstendi({ ...e, ..._e, gridPart }) },
			/*{ id: 'kaydet', handler: _e => this.kaydetIstendi({ ...e, ..._e, gridPart }) },*/
			{ id: 'temizle', handler: _e => this.temizleIstendi({ ...e, ..._e, gridPart }) }
		)
	}
	static listeEkrani_init(e) { super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.parentPart ?? e.sender; if (!$.isEmptyObject(gridPart.tcKimlikNoSet)) { gridPart.tazeleIstendi(e) } }
	static orjBaslikListesi_gridInit(e) { super.orjBaslikListesi_gridInit(e); const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {grid} = gridPart; grid.jqxGrid('selectionmode', 'multiplecellsextended') }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e) /*; const {args} = e; $.extend(args, { editable: true, editMode: 'selectedcell' })*/ }
	static async gridTazeleIstendi(e) { await super.gridTazeleIstendi(e); await this.sorguYap(e); return false }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {result, rec} = e; result.push(rec.isError ? 'error' : 'success');
		if (rec.emeklimi) { result.push('emekli') }
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'durumText', text: 'Durum', genislikCh: 10 }).readOnly(),
			new GridKolon({ belirtec: 'tcKimlikNo', text: 'TC Kimlik No', genislikCh: 20 }).tipString(11),
			new GridKolon({ belirtec: 'emeklimi', text: 'Emekli?', genislikCh: 8 }).tipBool().readOnly(),
			new GridKolon({ belirtec: 'ekBilgi', text: 'Ek Bilgi' }).readOnly()
		)
	}
	static async loadServerDataDogrudan(e) {
		const {gridPart} = e, {localData} = app.params; let tcKimlikNo2Rec = gridPart.tcKimlikNo2Rec || {};
		if ($.isEmptyObject(tcKimlikNo2Rec)) { tcKimlikNo2Rec = await localData.getData(this.localDataSelector_tcKimlikNo2Rec) }
		return Object.values(tcKimlikNo2Rec || {})
	}
	static gridVeriYuklendi(e) { const {gridPart} = e, {gridWidget} = gridPart; gridWidget.clearselection() }
	static async sorguYap(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {localData} = app.params;
		let {tcKimlikNoSet} = gridPart; if ($.isArray(tcKimlikNoSet)) { tcKimlikNoSet = asSet(tcKimlikNoSet.filter(x => !!x)) }
		let {tcKimlikNo2Rec} = gridPart; if ($.isEmptyObject(tcKimlikNo2Rec)) { tcKimlikNo2Rec = await localData.getData(this.localDataSelector_tcKimlikNo2Rec) }
		gridPart.tcKimlikNo2Rec = tcKimlikNo2Rec = tcKimlikNo2Rec || {};
		try {
			let sorguTCKimlikNoListe = Object.keys(tcKimlikNoSet || {}); if (!$.isEmptyObject(tcKimlikNo2Rec)) {
				const haricTCKNSet = {}; for (const [tcKimlikNo, rec] of Object.entries(tcKimlikNo2Rec)) { if (rec && !rec.isError) { haricTCKNSet[tcKimlikNo] = true } }
				sorguTCKimlikNoListe = sorguTCKimlikNoListe.filter(tcKimlikNo => !haricTCKNSet[tcKimlikNo])
			}
			let promise_ajax; if (sorguTCKimlikNoListe?.length) {
				await showProgress(`<b>${sorguTCKimlikNoListe.length}</b> adet TC Kimlik No için sorgulama yapılıyor...`, this.sinifAdi, true, e => { promise_ajax?.abort(); promise_ajax = null }, undefined, true);
				window.progressManager?.setProgressMax(Math.max(sorguTCKimlikNoListe?.length * 4, 1))
			}
			/*if (sorguTCKimlikNoListe?.length) { debugger }*/
			let result = sorguTCKimlikNoListe?.length ? await (promise_ajax = app.wsEmekliDurumKontrol({ tcKimlikNo: sorguTCKimlikNoListe.join(delimWS) }) ): null;
			window.progressManager?.progressStep(sorguTCKimlikNoListe.length * 3);
			let recs = []; for (const [tcKimlikNo, _rec] of Object.entries(result?.subResults || [])) {
				let rec = tcKimlikNo2Rec[tcKimlikNo]; if (rec) { $.extend(rec, _rec) } else { rec = tcKimlikNo2Rec[tcKimlikNo] = _rec }
				const {error, uyari} = rec, ekBilgi = (error ?? uyari) || '', isError = !!error, durumText = isError ? 'HATA' : 'OK';
				$.extend(rec, { tcKimlikNo, isError, durumText, ekBilgi }); window.progressManager?.progressStep()
			}
			await localData.setData(this.localDataSelector_tcKimlikNo2Rec, tcKimlikNo2Rec); localData.kaydetDefer()
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Sorgu Hatası') }
		finally { window.progressManager?.progressEnd(); setTimeout(() => hideProgress(), 200) }
		gridPart.tazele(e)
	}
	static sorguYapIstendi(e) {
		const {gridPart} = e, tcKimlikNoSet = gridPart.tcKimlikNoSet || {}, gridRecs = Object.keys(tcKimlikNoSet).map(tcKimlikNo => ({ tcKimlikNo }));
		/*if (!gridRecs.length) { gridRecs.push({ tcKimlikNo: '' }) }*/
		gridRecs.push(...new Array(50000).fill(undefined).map(x => ({ tcKimlikNo: '' })));
		const wRFB = new RootFormBuilder('tcKimlikNoGiris').asWindow('TC Kimlik No Giriş Ekranı').addCSS('part').noDestroy()
			.addStyle(e => `$elementCSS { --islemTuslari-height: 50px }`);
		let fbd_islemTuslari = wRFB.addIslemTuslari('islemTuslari').setTip('tamamVazgec')
			.setId2Handler({ tamam: _e => this.sorguYap_tamamIstendi({ ...e, ..._e }), vazgec: _e => _e.builder.rootPart.close() })
			.addStyle(e => `$elementCSS .butonlar.part > .sol { z-index: -1; background-color: unset !important; background: transparent !important }`);
		let fbd_content = wRFB.addFormWithParent('content').altAlta().addStyle_fullWH(``).addStyle(e => `$elementCSS { position: relative; top: 10px; z-index: 100 }`);
		fbd_content.addGridliGiris('_grid').addStyle_fullWH(null, 'calc(var(--full) - var(--islemTuslari-height))')
			.onBuildEk(e => e.builder.part.id = '')
			.setTabloKolonlari(e => [new GridKolon({ belirtec: 'tcKimlikNo', text: 'TC Kimlik No', genislikCh: 25 }).tipString(11) ])
			.setSource(e => gridRecs).onAfterRun(e => e.builder.rootPart.gridPart = e.builder.part);
		wRFB.run()
	}
	static async temizle(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {localData} = app.params;
		gridPart.tcKimlikNo2Rec = {}; await localData.setData(this.localDataSelector_tcKimlikNo2Rec, null); localData.kaydetDefer(); gridPart.tazele()
	}
	static sorguYap_tamamIstendi(e) {
		const {gridPart, builder} = e, {rootPart} = builder;
		gridPart.tcKimlikNoSet = asSet(builder.rootPart.gridPart.gridWidget.getboundrows().map(rec => rec.tcKimlikNo).filter(x => !!x));
		rootPart?.close(); this.sorguYap(e)
	}
	static async kaydetIstendi(e) { }
	static async temizleIstendi(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tcKimlikNo2Rec} = gridPart; if ($.isEmptyObject(tcKimlikNo2Rec)) { return }
		let rdlg = await ehConfirm(`<b class="firebrick">Tüm sorgulama sonuçları temizlenecek, emin misiniz?`, this.sinifAdi); if (rdlg) { await this.temizle(e) }
	}
}
