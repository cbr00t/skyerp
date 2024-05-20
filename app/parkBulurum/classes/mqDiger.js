class MQYakindakiOtoparklar extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get gridDetaylimi() { return true } static get tumKolonlarGosterilirmi() { return true }
	static get sinifAdi() { return 'Yakındaki Otoparkları Bul' } static get tanimUISinif() { return ModelTanimPart }
	constructor(e) { e = e || {}; super(e); $.extend(this, { uzaklikMT: e.uzaklikMT ?? 1000 }) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); const {sender} = e, rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder; sender.title = 'Yakındaki Otoparklar';
		rfb.onAfterRun(e => setTimeout(() => e.builder.layout.find(`[data-builder-id = 'gpsEnlem'] > input`).focus(), 100));
		let form = tanimForm.addFormWithParent().addStyle_wh('max-content').addStyle(...[
				e => `$elementCSS  { font-size: 230% !important; position: relative; top: 220px; left: 13%; padding: 40px; border: 1px solid #aaa; background: #eee }`,
				e => `$elementCSS > * input, $elementCSS > * > button { font-size: 75% !important }`,
				e => `$elementCSS > * input { color: cyan; background-color: #555; height: 60px !important }`,
				e => `$elementCSS > * input[type = number] { text-align: center !important }`
			]);
			form.addNumberInput('gpsEnlem', 'GPS Enlem').setStep(.000001).addStyle_wh(400).degisince(e => this.konumDegisti(e));
			form.addNumberInput('gpsBoylam', 'GPS Boylam').setStep(.000001).addStyle_wh(400).degisince(e => this.konumDegisti(e));
			form.addNumberInput('uzaklikMT', 'Uzaklık(MT)').setStep(100).addStyle_wh(250);
			form.addButton('konumBelirle').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.konumBelirleIstendi(e));
			form.addButton('konumGoster').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.konumGosterIstendi(e));
			form.addButton('yakindakiOtoparklar').addStyle_wh(50, 50).addStyle(e => `$elementCSS { min-width: unset !important }`).etiketGosterim_placeholder().setEtiket('.').onClick(e => MQYakindakiOtoparklar.yakindakiOtoparklarIstendi(e));
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const {liste} = e, gridPart = e.parentPart, butonlarPart = e.part;
		liste.splice(liste.findIndex(item => item.id == 'vazgec'), 0, ...[ { id: 'konumGoster', text: ' ', handler: e => e.sender.mfSinif.konumGosterIstendi(e) } ]);
		const ekSagButonIdSet = butonlarPart.ekSagButonIdSet = butonlarPart.ekSagButonIdSet || {}; $.extend(ekSagButonIdSet, asSet(['konumGoster']))
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { showStatusBar: true, showAggregates: true, showGroupAggregates: true }) }
	static orjBaslikListesi_argsDuzenle_detaylar(e) { super.orjBaslikListesi_argsDuzenle_detaylar(e); const {args} = e; $.extend(args, { groupable: true, showGroupsHeader: true, groupsExpandedByDefault: true }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'alanId', text: 'Alan ID', genislikCh: 40 }), new GridKolon({ belirtec: 'alanAdi', text: 'Alan Adı', genislikCh: 30 }),
			new GridKolon({ belirtec: 'lokasyonText', text: 'Lokasyon', genislikCh: 20, aggregates: gridDipIslem_sum }).alignCenter(),
			new GridKolon({ belirtec: 'toplam', text: 'TOP', genislikCh: 8, aggregates: gridDipIslem_sum, cellClassName: 'bg-lightcyan' }).tipNumerik(),
			new GridKolon({ belirtec: 'rezerve', text: 'REZ', genislikCh: 8, aggregates: gridDipIslem_sum, cellClassName: 'bg-lightgreen' }).tipNumerik(),
			new GridKolon({ belirtec: 'kullanimda', text: 'KUL', genislikCh: 8, aggregates: gridDipIslem_sum, cellClassName: 'bg-lightorangered' }).tipNumerik()
		])
	}
	static orjBaslikListesiDuzenle_detaylar(e) {
		super.orjBaslikListesiDuzenle_detaylar(e); const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'id', text: 'Cihaz ID', genislikCh: 40 }), new GridKolon({ belirtec: 'aciklama', text: 'Cihaz Adı', genislikCh: 30 }),
			new GridKolon({ belirtec: 'durum', text: 'Durum', genislikCh: 8, filterType: 'checkedlist', cellClassName: (colDef, rowIndex, belirtec, value, rec) => `${belirtec} durum-${rec?.durum}` }).alignCenter(),
			new GridKolon({ belirtec: 'icYerKodu', text: 'İç Yer Kodu', genislikCh: 10 }), new GridKolon({ belirtec: 'bolumAdi', text: 'Bölüm Adı', genislikCh: 10, filterType: 'checkedlist' })
		])
	}
	static loadServerData(e) { const {source} = e.args; return source }
	static async loadServerData_detaylar(e) {
		const {alanId} = e.parentRec; const bolumAdi2Recs = (await app.wsOtoparkCihazlari({ alanId }) || {}), recs = [];
		for (const subRecs of Object.values(bolumAdi2Recs)) { recs.push(...(subRecs.filter(rec => !!rec))) }
		return recs
	}
	static gridVeriYuklendi_detaylar(e) { super.gridVeriYuklendi_detaylar(e); const {grid} = e; grid.jqxGrid('groups', ['bolumAdi']) }
	static async yakindakiOtoparklarIstendi(e) {
		const {builder} = e, rootBuilder = builder?.rootBuilder, {id2Builder} = builder || {}, inst = e.altInst ?? e.inst ?? builder?.altInst, parentPart = e.parentPart ?? e.sender ?? builder?.part;
		let {gpsEnlem, gpsBoylam} = inst; let {uzaklikMT, uzaklikKM} = inst; if (!uzaklikMT && uzaklikKM) { uzaklikMT = uzaklikKM * 1000 }
		if (!(gpsEnlem && gpsBoylam)) { await this.konumBelirleIstendi(e); gpsEnlem = inst.gpsEnlem; gpsBoylam = inst.gpsBoylam }
		/*if (!(gpsEnlem && gpsBoylam)) { hConfirm(`<span class="darkred"><b>GPS Enlem</b> ve <b>Boylam</b> bilgileri belirtilmelidir</span>`, 'Konum Göster'); return false }*/
		showProgress('Yakındaki Otoparklar belirleniyor...');
		try {
			const _recs = (await app.wsYakindakiOtoparklar({ gpsEnlem, gpsBoylam, uzaklikMT }) || []); const title = `Yakındaki Otoparklar (<span class="cadetblue">${gpsEnlem}, ${gpsBoylam}</span>)`;
			const source = []; for (const _rec of _recs) {
				const {alan, lokasyon, uygunCihaz} = _rec, {gpsEnlem, gpsBoylam} = lokasyon, {toplam, kullanimda, rezerve} = uygunCihaz;
				const rec = { alanId: alan.id, alanAdi: alan.aciklama, gpsEnlem, gpsBoylam, lokasyonText: `${gpsEnlem}, ${gpsBoylam}`, toplam, kullanimda, rezerve };
				source.push(rec)
			} const args = { source };
			hideProgress(); setTimeout(() => this.listeEkraniAc({ parentPart, title, args }), 100)
		}
		catch (ex) { hideProgress(); hConfirm(getErrorText(ex)); throw ex }
	}
	uiKaydetOncesiIslemler(e) { this.class.yakindakiOtoparklarIstendi(e); return false }
	static async konumBelirleIstendi(e) {
		const {builder} = e, {id2Builder} = builder.parentBuilder, inst = e.altInst ?? e.inst ?? e.rec ?? builder?.altInst; showProgress();
		try {
			const coords = await new $.Deferred(p => { navigator.geolocation.getCurrentPosition(result => p.resolve(result.coords), err => p.reject(err)) });
			const {latitude, longitude} = coords; if (latitude) { inst.gpsEnlem = latitude } if (longitude) { inst.gpsBoylam = longitude }
			if (id2Builder) { for (const key of ['gpsEnlem', 'gpsBoylam']) { let fbd = id2Builder[key]; if (fbd) { fbd.value = inst[key] } } }
			hideProgress()
		}
		catch (ex) { hideProgress();  hConfirm(getErrorText(ex)); throw ex }
	}
	static async konumGosterIstendi(e) {
		const gridPart = e.gridPart ?? e.sender ?? e.parentPart, builder = e.builder || {}, inst = e.altInst ?? e.inst ?? e.rec ?? builder?.altInst ?? gridPart?.selectedRec;
		const {id2Builder} = builder?.parentBuilder || {}; let {aciklama, gpsEnlem, gpsBoylam} = inst;
		/*if (!(gpsEnlem && gpsBoylam)) { hConfirm(`<span class="darkred"><b>GPS Enlem</b> ve <b>Boylam</b> bilgileri belirtilmelidir</span>`, 'Konum Göster'); return false }*/
		if (!(gpsEnlem && gpsBoylam)) {
			await this.konumBelirleIstendi(e); gpsEnlem = altInst.gpsEnlem, gpsBoylam = altInst.gpsBoylam;
			if (id2Builder) { for (const key of ['gpsEnlem', 'gpsBoylam']) { let fbd = id2Builder[key]; if (fbd) { fbd.value = inst[key] } } }
		}
		const url = this.getMapsUrl(inst), wnd = openNewWindow(url, 'maps'); if (!wnd) { return } wnd.title = `${aciklama || 'Park Alanı'} Konumu`;
		let activateHandler; activateHandler = async evt => {
			if (!wnd || wnd.closed) { window.removeEventListener('focus', activateHandler) }
			const text = await navigator.clipboard.readText(), tokens = text?.split(','); if (tokens?.length != 2) { return }
			gpsEnlem = inst.gpsEnlem = asFloat(tokens[0].trim()); gpsBoylam = inst.gpsBoylam = asFloat(tokens[1].trim());
			if (id2Builder) { for (const key of ['gpsEnlem', 'gpsBoylam']) { let fbd = id2Builder[key]; if (fbd) { fbd.value = inst[key] } } }
		}
		window.addEventListener('focus', activateHandler)
	}
	static konumDegisti(e) {
		const {builder} = e, {altInst} = builder, {id2Builder} = builder.parentBuilder, fbd_maps = id2Builder.maps; if (!fbd_maps?.layout) { return }
		fbd_maps.layout.prop('src', this.getMapsUrl(altInst))
	}
	static getMapsUrl(e) {
		const inst = e.inst ?? e.rec ?? e, gpsEnlem = inst.gpsEnlem ?? inst.gpsenlem, gpsBoylam = inst.gpsBoylam ?? inst.gpsboylam;
		return gpsEnlem && gpsBoylam ? `https://www.google.com/maps/search/?api=1&query=${gpsEnlem || 0}%2C${gpsBoylam || 0}` : `htpps://maps.google.com`
	}
}
class MQYakindakiOtoparklarDetay extends MQDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e)
	}
}
