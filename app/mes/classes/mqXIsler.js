class MQXIsler extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get parentMFSinif() { return MQXIsler }
	static get sinifAdi() { return 'X İşler' } static get switchPartClass() { return this } static get switchButtonText() { return null }
	static ekCSSDuzenle(e) {
		const {rec, result} = e; if (rec.devreDisimi) { result.push('devreDisi') }
		if (rec.batandimi) { result.push('atandi') } if (rec.bzamanetudu) { result.push('zamanEtudu') }
	}
	static listeEkrani_activated(e) { super.listeEkrani_activated(e) /* const gridPart = e.gridPart ?? e.sender; gridPart.tazeleDefer() */ }
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args, sender} = e, rowsHeight = 60; $.extend(args, { rowsHeight }) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(...[
			new GridKolon({
				belirtec: 'fisnox', text: 'Emir No', genislikCh: 16,
				cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, `<span class="asil">${getTagContent(html)}</span><span class="diger">${dateKisaString(asDate(rec.emirtarih))}</span>`)
			}),
			new GridKolon({
				belirtec: 'opadi', text: 'Operasyon Adı',
				cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, `<span class="asil">${getTagContent(html)}</span><span class="diger">${rec.opno}</span>`)
			}),
			new GridKolon({
				belirtec: 'urunadi', text: 'Ürün Adı',
				cellsRenderer: (colDef, rowIndex, belirtec, value, html, jqxCol, rec) => changeTagContent(html, `<span class="asil">${getTagContent(html)}</span><span class="diger">${rec.urunkod}</span>`)
			}),
			new GridKolon({ belirtec: 'sinyalBilgiText', text: 'Sinyal', genislikCh: 10 }).alignCenter(),
			new GridKolon({ belirtec: 'emirtarih', text: 'Emir Tarih' }).hidden()
		])
	}
	static listeEkrani_init(e) {
		super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.sender, args = gridPart.args || {}, {tezgahKod, tezgahAdi} = gridPart;
		if (tezgahKod) {
			let tezgahText = `<u class="gray">${tezgahKod || ''}</u>`; if (tezgahAdi) { tezgahText += ` <span class="royalblue">${tezgahAdi}</span>` }
			let {title} = gridPart; title += ` [${tezgahText}]`; gridPart.updateWndTitle(gridPart.title = title)
		}
	}
	static loadServerData_argsDuzenle(e) { const {gridPart, args} = e, {tezgahKod} = gridPart || {}; if (tezgahKod) { $.extend(args, { tezgahKod }) } }
	static loadServerData(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.part ?? e.builder?.rootPart ?? e.builder?.part;
		const args = {}, _e = $.extend({}, e, { gridPart, args }); if (gridPart) { this.loadServerData_argsDuzenle(_e) }
		return this.loadServerDataDevam(_e)
	}
	static loadServerDataDevam(e) { }
	static orjBaslikListesi_recsDuzenle(e) {
		const {recs} = e; if (!recs) { return }
		for (const rec of recs) {
			let value = rec.batandimi; if (value !== undefined) { rec.atandimiText = value ? `<span class="atandimiText">İş Atandı</span>` : '' }
			value = rec.bzamanetudu; if (value !== undefined) { rec.zamanEtudumuText = value ? `<span class="zamanEtudumuText">Zaman Etüdü</span>` : '' }
			$.extend(rec, {
				devreDisimi: (rec.bdevredisi || rec.rotadegisdurum == 'D'),
				sinyalBilgiText: (
					`<div class="sinyal full-wh">` +
						`<span class="ek-bilgi">(</span>` +
						`<span class="saymaSayisi veri">${rec.sinyalsayisi ?? ''}</span><span class="ek-bilgi">; </span>` +
						`<span class="saymaArasiSure veri">${rec.sinyaltekilsure ?? ''}</span><span class="ek-bilgi">; </span>` +
						`<span class="saymaSonSure veri">${rec.sinyaltoplamsure ?? ''}</span>` +
						`<span class="ek-bilgi">)</span>` +
					`</div>`
				)
			})
		}
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		const {liste} = e, butonlarPart = e.part, gridPart = e.gridPart ?? e.sender ?? e.parentPart, {noSwitchFlag} = gridPart;
		if (!noSwitchFlag && this.switchPartClass) { liste.push({ id: 'switch', text: this.switchButtonText, handler: e => this.switchIstendi(e) }) }
		let _e = $.extend({}, e, { liste: []}); this.islemTuslariDuzenleInternal_listeEkrani(_e); if (_e.liste?.length) {
			const ekSagButonIdSet = butonlarPart.ekSagButonIdSet = butonlarPart.ekSagButonIdSet || {}, _liste = _e.liste;
			liste.splice(liste.findIndex(item => item.id == 'vazgec'), 0, ..._liste)
			$.extend(ekSagButonIdSet, asSet(_liste.map(rec => rec.id)))
		};
	}
	static islemTuslariDuzenleInternal_listeEkrani(e) {
		const {liste} = e, gridPart = e.gridPart ?? e.sender ?? e.parentPart; /*, {noSwitchFlag} = gridPart; */
		/* if (!noSwitchFlag && this.switchPartClass) { liste.push({ id: 'switch', text: 'S', handler: e => this.switchIstendi(e) }) }*/
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		/*this.fbd_listeEkrani_addCheckBox(rfb, 'cokluSecim', 'Çoklu Seç').onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder, input = layout.children('input'), {grid, gridWidget} = rootPart;
			input.on('change', evt => {
				const value = rootPart.cokluSecimFlag = $(evt.currentTarget).is(':checked');
				grid.jqxGrid('selectionmode', value ? 'multiplecells' : 'singlecell'); gridWidget.clearselection()
			})
		});
		this.fbd_listeEkrani_addButton(rfb, 'isEmirleri', 'EMR', 80, e => this.xIstendi(e));
		this.fbd_listeEkrani_addButton(rfb, 'topluX', 'TPL', 80, e => this.xIstendi(e))*/
	}
	static switchIstendi(e) {
		const {switchPartClass} = this; if (!switchPartClass) { return }
		const gridPart = e.gridPart = e.gridPart ?? e.sender ?? e.parentPart, {args} = gridPart;
		args.noSwitchFlag = true; switchPartClass.listeEkraniAc({ args })
	}
}
class MQSiradakiIsler extends MQXIsler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Sıradaki İşler' } static get switchPartClass() { return MQBekleyenIsler } static get switchButtonText() { return 'B' }
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const {liste} = e, gridPart = e.gridPart ?? e.sender ?? e.parentPart;
		liste.push(
			{ id: 'isAtaKaldir', text: 'İŞ ATA/KALDIR', handler: e => this.isAtaKaldirIstendi(e) },
			{ id: 'sirayadanKaldir', text: 'SIRADAN KALDIR', handler: e => this.siradanKaldirIstendi(e) },
			{ id: 'sureSayiDuzenle', text: 'SÜRE DÜZENLE', handler: e => this.sureSayiDuzenleIstendi(e) },
			{ id: 'zamanEtudu', text: 'ZAMAN ETÜDÜ', handler: e => this.zamanEtuduIstendi(e) },
			{ id: 'baskaTezgahaTasi', text: 'TAŞI', handler: e => this.baskaTezgahaTasiIstendi(e) },
			{ id: 'isParcala', text: 'PARÇALA', handler: e => this.isParcalaIstendi(e) }
		)
	}
	static orjBaslikListesiDuzenle(e) {
		const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'atandimiText', text: 'Atandı?', genislikCh: 5.8, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'zamanEtudumuText', text: 'Zaman Etüdü?', genislikCh: 5.8, filterType: 'checkedlist' })
		]); super.orjBaslikListesiDuzenle(e)
	}
	static loadServerDataDevam(e) { const {args} = e; return app.wsSiradakiIsler(args) }
	static async isAtaKaldirIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = gridPart.selectedRecs; if (!recs?.length) { return }
		const errors = []; for (const rec of recs) { const isId = rec.issayac; try { await app.wsIsAta({ tezgahKod, isId }) } catch (ex) { errors.push(getErrorText(ex)); console.error(ex) } }
		if (errors?.length) { hConfirm(`<ul class="errors">${errors.map(x => `<li>${x}</li>`).join('')}</ul>`, 'İş Kaldır') } app.signalChange()
	}
	static siradanKaldirIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = gridPart.selectedRecs; if (!recs?.length) { return }
		const isIdListe = recs.map(rec => rec.issayac).join(delimWS); if (!isIdListe?.length) { return }
		app.wsSiradanKaldir({ tezgahKod, isIdListe }).then(result => app.signalChange({ result })).catch(ex => hConfirm(getErrorText(ex), 'Sıradan Kaldır'))
	}
	static sureSayiDuzenleIstendi(e) {
		try {
			const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, rec = gridPart.selectedRec; if (!rec) { return }
			let inst = new MQSureSayi({ rec }); inst.tanimla({ islem: 'degistir', kaydetIslemi: async e => {
				const {inst} = e, {rec, sinyalSayisi, sinyalTekilSure, sinyalToplamSure} = inst, isId = rec.issayac, oemSayac = rec.oemsayac;
				await app.wsSureDuzenle({ tezgahKod, oemSayac, isId, sinyalSayisi, sinyalTekilSure, sinyalToplamSure }); return true
			} })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Süre/Sayı Düzenle') }
	}
	static async zamanEtuduIstendi(e) {
		try {
			const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, rec = gridPart.selectedRec; if (!rec) { return }
			const zamanEtuduRec = await app.wsGorevZamanEtuduVeriGetir({ isId: rec.issayac })
			let inst = new MQZamanEtudu({ rec, zamanEtuduRec }); inst.tanimla({ islem: 'izle' })
		}
		catch (ex) { hConfirm(getErrorText(ex), 'Zaman Etüdü') }
	}
	static baskaTezgahaTasiIstendi(e) {
		const islemAdi = 'Başka Tezgaha Taşı', gridPart = e.gridPart ?? e.parentPart ?? e.sender, {hatKod, tezgahKod} = gridPart, excludeTezgahKod = tezgahKod;
		const isIdListe = gridPart.selectedRecs.filter(rec => !rec.devreDisimi).map(rec => rec.issayac);
		if (!isIdListe?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', islemAdi); return }
		const args = { cokluSecimFlag: false, tezgahKod, hatKod, excludeTezgahKod, title: `<b class="gray">${tezgahKod}</b> - <span class="ek-bilgi">Şuraya Taşı:</span>` };
		MQHatYonetimi.listeEkraniAc({ args, secince: e => {
			const gridPart = e.gridPart ?? e.parentPart ?? e.sender, hedefTezgahKodListe = gridPart.getSubRecs({ cells: gridPart.gridWidget.getselectedcells() }).map(rec => rec.tezgahKod);
			if (!hedefTezgahKodListe?.length) { return } let promises = [];
			for (const hedefTezgahKod of hedefTezgahKodListe) { promises.push(app.wsBaskaTezgahaTasi({ isIdListe: isIdListe.join(delimWS), tezgahKod, hedefTezgahKod })) }
			Promise.all(promises).then(result => app.signalChange(result)).catch(ex => hConfirm(getErrorText(ex), islemAdi))
		} })
	}
	static isParcalaIstendi(e) {
		const islemAdi = 'İş Parçala', gridPart = e.gridPart ?? e.parentPart ?? e.sender, {hatKod, tezgahKod} = gridPart, excludeTezgahKod = tezgahKod;
		const isIdListe = gridPart.selectedRecs.filter(rec => !rec.devreDisimi).map(rec => rec.issayac);
		if (!isIdListe?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', islemAdi); return }
		const args = { cokluSecimFlag: false, tezgahKod, hatKod, excludeTezgahKod, title: `<b class="gray">${tezgahKod}</b> - <span class="ek-bilgi">Parçala:</span>` };
		MQHatYonetimi.listeEkraniAc({ args, secince: e => {
			const gridPart = e.gridPart ?? e.parentPart ?? e.sender, hedefTezgahKodListe = gridPart.getSubRecs({ cells: gridPart.gridWidget.getselectedcells() }).map(rec => rec.tezgahKod);
			if (!hedefTezgahKodListe?.length) { return }
			app.wsCokluIsParcala({ isIdListe: isIdListe.join(delimWS), tezgahKod, hedefTezgahKod: hedefTezgahKodListe.join(delimWS) })
				.then(result => app.signalChange(result)).catch(ex => hConfirm(getErrorText(ex), islemAdi))
		} })
	}
}
class MQBekleyenIsler extends MQXIsler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get sinifAdi() { return 'Bekleyen İşler' } static get switchPartClass() { return MQSiradakiIsler } static get switchButtonText() { return 'S' }
	static loadServerDataDevam(e) { const {args} = e; return app.wsBekleyenIsler(args) }
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const {liste} = e, gridPart = e.gridPart ?? e.sender ?? e.parentPart;
		liste.push(
			{ id: 'sirayaAl', text: 'SIRAYA AL', handler: e => this.sirayaAlIstendi(e) },
			{ id: 'aktifPasif', text: 'AKTİF PASİF', handler: e => this.aktifPasifIstendi(e) },
			{ id: 'yeniOper', text: 'YENİ OPER', handler: e => this.yeniOperIstendi(e) }
		)
	}
	static sirayaAlIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = gridPart.selectedRecs.filter(rec => !rec.devreDisimi);
		if (!recs?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', 'Sıraya Al'); return }
		const oemSayacListe = recs.map(rec => rec.oemsayac).join(delimWS); if (!oemSayacListe?.length) { return }
		app.wsSirayaAl({ tezgahKod, oemSayacListe }).then(result => app.signalChange({ result })).catch(ex => hConfirm(getErrorText(ex), 'Sıraya Al'))
	}
	static aktifPasifIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = gridPart.selectedRecs; if (!recs?.length) { return }
		const oemSayacListe = recs.map(rec => rec.oemsayac).join(delimWS); if (!oemSayacListe?.length) { return }
		app.wsBekleyenIs_devredisiYapKaldir({ tezgahKod, oemSayacListe }).then(result => app.signalChange({ result })).catch(ex => hConfirm(getErrorText(ex), 'Aktif/Pasif'))
	}
	static yeniOperIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = gridPart.selectedRecs.filter(rec => !rec.devreDisimi);
		if (!recs?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', 'Yeni Operasyon'); return }
		const oemSayac = recs[0].oemsayac; if (!oemSayac) { return } const args = { tekil: false, oemSayac };
		MQOperasyon.listeEkraniAc({ args, secince: e => {
			const opNoListe = e.values; if (!opNoListe?.length) { return }
			const gridPart = e.gridPart ?? e.parentPart ?? e.sender, urunAgacinaEkleFlag = gridPart.urunAgacineEkleFlag;
			app.wsYeniOperListeEkle({ tezgahKod, oemSayac, urunAgacinaEkleFlag, opNoListe: opNoListe.join(delimWS) })
				.then(result => app.signalChange(result))
				.catch(ex => hConfirm(getErrorText(ex), 'Yeni Operasyon'))
		} })
	}
}
