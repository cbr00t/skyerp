class MQXIsler extends MQMasterOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get parentMFSinif() { return MQXIsler } static get noAutoFocus() { return true } static get menuyeAlinmazmi() { return true }
	static get sinifAdi() { return 'X İşler' } static get gridIslemTuslariKullanilirmi() { return false } static get switchPartClass() { return this } static get switchButtonText() { return null }

	static ekCSSDuzenle(e) {
		const {rec, result} = e; if (rec.devreDisimi) { result.push('devreDisi') }
		if (rec.batandimi) { result.push('atandi') } if (rec.bzamanetudu) { result.push('zamanEtudu') } if (rec.sonmu) { result.push('son') }
	}
	static listeEkrani_activated(e) { super.listeEkrani_activated(e); const gridPart = e.gridPart ?? e.sender; gridPart.tazele() }
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
		super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.sender, {hatBazindami, hatKod, hatAdi, tezgahKod, tezgahAdi} = gridPart;
		const targetKod = hatBazindami ? hatKod : tezgahKod, targetAdi = hatBazindami ? hatAdi : tezgahAdi;
		if (targetKod) {
			let tezgahText = `<u class="indianred">${targetKod || ''}</u>`; if (targetAdi) { tezgahText += ` <span class="${hatBazindami ? 'forestgreen' : 'royalblue'}">${targetAdi}</span>` }
			let {title} = gridPart; title += ` [${tezgahText}]`; gridPart.updateWndTitle(gridPart.title = title)
		}
	}
	static loadServerData(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.sender ?? e.parentPart ?? e.part ?? e.builder?.rootPart ?? e.builder?.part;
		const args = {}, _e = $.extend({}, e, { gridPart, args }); if (gridPart) { this.loadServerData_argsDuzenle(_e) }
		return this.loadServerDataDevam(_e)
	}
	static loadServerData_argsDuzenle(e) { const {gridPart, args} = e, {tezgahKod} = gridPart || {}; if (tezgahKod) { $.extend(args, { tezgahKod }) } }
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
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); const gridPart = e.gridPart ?? e.sender ?? e.parentPart, {gridWidget} = e, {siralamami} = gridPart;
		if (!siralamami) { gridWidget.clearselection() }
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		const {liste} = e, butonlarPart = e.part, gridPart = e.gridPart ?? e.sender ?? e.parentPart, {noSwitchFlag} = gridPart;
		if (!noSwitchFlag && this.switchPartClass) { liste.push({ id: 'switch', text: this.switchButtonText, handler: e => this.switchIstendi(e) }) }
		let _e = $.extend({}, e, { liste: []}); this.islemTuslariDuzenleInternal_listeEkrani(_e); if (_e.liste?.length) {
			const ekSagButonIdSet = butonlarPart.ekSagButonIdSet = butonlarPart.ekSagButonIdSet || {}, _liste = _e.liste;
			liste.splice(liste.findIndex(item => item.id == 'vazgec'), 0, ..._liste)
			$.extend(ekSagButonIdSet, asSet(_liste.map(rec => rec.id)))
		}
	}
	static islemTuslariDuzenleInternal_listeEkrani(e) {
		const {liste} = e, gridPart = e.gridPart ?? e.sender ?? e.parentPart /*, {noSwitchFlag} = gridPart; */
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
	static yeniOperIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = gridPart.selectedRecs.filter(rec => !rec.devreDisimi);
		if (!recs?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', 'Yeni Operasyon'); return }
		const {oemsayac: oemSayac, urunkod: urunKod} = recs[0]; if (!oemSayac) { return } const args = { tekil: false, oemSayac };
		MQOperasyon.listeEkraniAc({ args, secince: async e => {
			const opNoListe = e.values; if (!opNoListe?.length) { return }
			const _gridPart = e.gridPart ?? e.parentPart ?? e.sender, urunAgacinaEkleFlag = _gridPart.urunAgacineEkleFlag;
			try {
				await app.wsYeniOperListeEkle({ tezgahKod, oemSayac, urunAgacinaEkleFlag, opNoListe: opNoListe.join(delimWS) });
				await this.yeniOperIstendi_ek({ ...e, gridPart, tezgahKod, oemSayac, urunKod, opNoListe, urunAgacinaEkleFlag })
				gridPart.tazele()
			}
			catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Yeni Operasyon') }
		} })
	}
	static yeniOperIstendi_ek(e) { }
}
class MQSiradakiIsler extends MQXIsler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'SIRADAKI_ISLER' } static get sinifAdi() { return 'Sıradaki İşler' }
	static get switchPartClass() { return MQBekleyenIsler } static get switchButtonText() { return 'B' }
	static listeEkrani_init(e) {
		super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.sender, {layout, siralamami, secince} = gridPart;
		if (siralamami) {
			gridPart.noAnimate();
			layout.addClass('siralama'); gridPart.secince = async e => {
				await this.siralamaKaydetIstendi(e); return await secince?.call(this, e) }
		}
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const {liste} = e, gridPart = e.gridPart ?? e.sender ?? e.parentPart, {siralamami} = gridPart;
		liste.push(...[
			{ id: 'isAtaKaldir', text: 'İŞ ATA/KALDIR', handler: e => this.isAtaKaldirIstendi(e) },
			{ id: 'sirayadanKaldir', text: 'SIRADAN KALDIR', handler: e => this.siradanKaldirIstendi(e) },
			{ id: 'isBitti', text: 'İŞ BİTTİ', handler: e => this.isBittiIstendi(e) },
			{ id: 'sureSayiDuzenle', text: 'SÜRE DÜZENLE', handler: e => this.sureSayiDuzenleIstendi(e) },
			{ id: 'zamanEtudu', text: 'ZAMAN ETÜDÜ', handler: e => this.zamanEtuduIstendi(e) },
			{ id: 'baskaTezgahaTasi', text: 'TAŞI', handler: e => this.baskaTezgahaTasiIstendi(e) },
			{ id: 'isParcala', text: 'PARÇALA', handler: e => this.isParcalaIstendi(e) },
			{ id: 'yeniOper', text: 'YENİ OPER', handler: e => this.yeniOperIstendi(e) },
			(siralamami ? null : { id: 'siralama', handler: e => this.siralamaIstendi(e) }),
			(siralamami ? { id: 'yukari', handler: e => this.siraDegistirIstendi({ ...e, yon: 'yukari' }) } : null),
			(siralamami ? { id: 'asagi', handler: e => this.siraDegistirIstendi({ ...e, yon: 'asagi' }) } : null)
		].filter(x => !!x))
	}
	static orjBaslikListesiDuzenle(e) {
		const {liste} = e; liste.push(...[
			new GridKolon({ belirtec: 'atandimiText', text: 'Atandı?', genislikCh: 5.8, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'zamanEtudumuText', text: 'Zaman Etüdü?', genislikCh: 5.8, filterType: 'checkedlist' }),
			new GridKolon({ belirtec: 'sonmu', text: 'Son?', genislikCh: 5, filterType: 'checkedlist' }).tipBool(),
		]); super.orjBaslikListesiDuzenle(e)
	}
	static async loadServerDataDevam(e) {
		await super.loadServerDataDevam(e); let gridPart = e.gridPart ?? e.sender, {siralamami, _recs} = gridPart, {args} = e;
		let recs = siralamami && _recs ? _recs : await app.wsSiradakiIsler(args); if (!recs) { return recs }
		if (!(siralamami && _recs)) {
			let sonRecInd = null, maxIsID = -Infinity; if (recs?.length) {
				for (let i = 0; i < recs.length; i++) {
					let rec = recs[i], {issayac: isID} = rec;
					if (isID > maxIsID) { maxIsID = isID; sonRecInd = i }
				}
				if (sonRecInd != null) { recs[sonRecInd].sonmu = true }
			}
		}
		if (siralamami && recs) { _recs = gridPart._recs = recs }
		return recs
	}
	static async isAtaKaldirIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = e.recs ?? gridPart.selectedRecs; if (!recs?.length) { return }
		const errors = []; for (const rec of recs) { const isId = rec.issayac; try { await app.wsIsAta({ tezgahKod, isId }) } catch (ex) { errors.push(getErrorText(ex)); console.error(ex) } }
		if (errors?.length) { hConfirm(`<ul class="errors">${errors.map(x => `<li>${x}</li>`).join('')}</ul>`, 'İş Kaldır') } gridPart.tazele()
	}
	static async siradanKaldirIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = e.recs ?? gridPart.selectedRecs; if (!recs?.length) { return }
		const isIdListe = recs.map(rec => rec.issayac).join(delimWS); if (!isIdListe?.length) { return }
		try { await app.wsSiradanKaldir({ tezgahKod, isIdListe }); gridPart.tazele() }
		catch(ex) { console.error(ex); hConfirm(getErrorText(ex), 'Sıradan Kaldır') }
	}
	static async isBittiIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart;
		let rdlg = await ehConfirm(`<b class="royalblue">${tezgahKod}</b> kodlu Makineye ait <u>TÜM İŞLER İÇİN</u> <b class="darkred">İş Bitti</b> yapılacak, devam edilsin mi?`, 'İş Bitti Yap');
		if (!rdlg) { return } try { await app.wsIsBittiYap({ tezgahKod }); gridPart.tazele() } catch(ex) { console.error(ex); hConfirm(getErrorText(ex), 'İş Bitti Yap') }
	}
	static sureSayiDuzenleIstendi(e) {
		try {
			const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, rec = e.rec ?? gridPart.selectedRec; if (!rec) { return }
			let inst = new MQSureSayi({ rec }); inst.tanimla({ islem: 'degistir', kaydetIslemi: async e => {
				const {inst} = e, {rec, sinyalSayisi, sinyalTekilSure, sinyalToplamSure} = inst, isId = rec.issayac, oemSayac = rec.oemsayac;
				try { await app.wsSureDuzenle({ tezgahKod, oemSayac, isId, sinyalSayisi, sinyalTekilSure, sinyalToplamSure }); return true }
				catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Süre/Sayı Düzenle') }
			} })
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Süre/Sayı Düzenle') }
	}
	static async zamanEtuduIstendi(e) {
		try {
			const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, rec = e.rec ?? gridPart.selectedRec; if (!rec) { return }
			const zamanEtuduRec = await app.wsGorevZamanEtuduVeriGetir({ isId: rec.issayac });
			let inst = new MQZamanEtudu({ rec, zamanEtuduRec }); inst.tanimla({ islem: 'izle' })
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Zaman Etüdü') }
	}
	static baskaTezgahaTasiIstendi(e) {
		const islemAdi = 'Başka Tezgaha Taşı', gridPart = e.gridPart ?? e.parentPart ?? e.sender, {hatKod, tezgahKod} = gridPart, excludeTezgahKod = tezgahKod;
		const isIdListe = e.recs ?? gridPart.selectedRecs.filter(rec => !rec.devreDisimi).map(rec => rec.issayac);
		if (!isIdListe?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', islemAdi); return }
		const args = { cokluSecimFlag: true, tezgahKod, hatKod, excludeTezgahKod, title: `<b class="gray">${tezgahKod}</b> - <span class="ek-bilgi">Şuraya Taşı:</span>` };
		HatYonetimiPart.listeEkraniAc({ args, secince: async e => {
			/*const _gridPart = e.gridPart ?? e.parentPart ?? e.sender, hedefTezgahKodListe = _gridPart.getSubRecs({ cells: _gridPart.gridWidget.getselectedcells() }).map(rec => rec.tezgahKod);*/
			let hedefTezgahKodListe = e.recs.map(rec => rec.tezgahKod); if (!hedefTezgahKodListe?.length) { return }
			let promises = []; const isIdListeStr = isIdListe.join(delimWS);
			for (const hedefTezgahKod of hedefTezgahKodListe) { promises.push(app.wsCokluIsParcala({ isIdListe: isIdListeStr, tezgahKod, hedefTezgahKod })) }
			try {
				await Promise.all(promises); await app.wsSiradanKaldir({ tezgahKod, isIdListe: isIdListeStr });
				const kod2Rec = await app.getTezgahKod2Rec({ hedefTezgahKodListe }); for (const hedefTezgahKod of hedefTezgahKodListe) {
					const tezgahKod = hedefTezgahKod, rec = kod2Rec[tezgahKod] || {}, {tezgahAdi, hatKod, hatAdi} = rec;
					/*const bindingCompleteBlock = e => {
						delete e.sender.bindingCompleteBlock; setTimeout(() => { e.gridWidget.clearselection(); gridPart.gridWidget.clearselection() }, 300) };*/
					this.listeEkraniAc({ /*bindingCompleteBlock,*/ args: { hatKod, hatAdi, tezgahKod, tezgahAdi } });
					try { await new $.Deferred(p => setTimeout(() => p.resolve(null), 200)) } catch (ex) { }
				}
				if (gridPart && !gridPart.isDestroyed) { setTimeout(() => gridPart.tazele(e), 100) }
			}
			catch (ex) { console.error(ex); hConfirm(getErrorText(ex), islemAdi) }
		} })
	}
	static isParcalaIstendi(e) {
		const islemAdi = 'İş Parçala', gridPart = e.gridPart ?? e.parentPart ?? e.sender, {hatKod, tezgahKod} = gridPart, excludeTezgahKod = tezgahKod;
		const isIdListe = e.recs ?? gridPart.selectedRecs.filter(rec => !rec.devreDisimi).map(rec => rec.issayac);
		if (!isIdListe?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', islemAdi); return }
		const args = { cokluSecimFlag: true, tezgahKod, hatKod, excludeTezgahKod, title: `<b class="gray">${tezgahKod}</b> - <span class="ek-bilgi">Parçala:</span>` };
		HatYonetimiPart.listeEkraniAc({ args, secince: async e => {
			/*const _gridPart = e.gridPart ?? e.parentPart ?? e.sender, hedefTezgahKodListe = _gridPart.getSubRecs({ cells: _gridPart.gridWidget.getselectedcells() }).map(rec => rec.tezgahKod);*/
			let hedefTezgahKodListe = e.recs.map(rec => rec.tezgahKod); if (!hedefTezgahKodListe?.length) { return }
			if (!hedefTezgahKodListe?.length) { return }
			try {
				await app.wsCokluIsParcala({ isIdListe: isIdListe.join(delimWS), tezgahKod, hedefTezgahKod: hedefTezgahKodListe.join(delimWS) });
				const kod2Rec = await app.getTezgahKod2Rec({ hedefTezgahKodListe });
				for (const hedefTezgahKod of hedefTezgahKodListe) {
					const tezgahKod = hedefTezgahKod, rec = kod2Rec[tezgahKod] || {}, {tezgahAdi, hatKod, hatAdi} = rec;
					/*const bindingCompleteBlock = e => {
						delete e.sender.bindingCompleteBlock; setTimeout(() => { e.gridWidget.clearselection(); gridPart.gridWidget.clearselection() }, 300) };*/
					this.listeEkraniAc({ /*bindingCompleteBlock,*/ args: { hatKod, hatAdi, tezgahKod, tezgahAdi } });
					try { await new $.Deferred(p => setTimeout(() => p.resolve(null), 200)) } catch (ex) { }
				}
				if (gridPart && !gridPart.isDestroyed) { gridPart.tazele(e) }
			}
			catch (ex) { console.error(ex); hConfirm(getErrorText(ex), islemAdi) }
		} })
	}
	static siralamaIstendi(e) {
		const gridPart = e.gridPart = e.gridPart ?? e.sender ?? e.parentPart, {mfSinif} = gridPart, args = { ...gridPart.args, siralamami: true };
		return mfSinif.listeEkraniAc({ args, secinceKontroluYapilmaz: true /*, secince: e => gridPart.tazeleDefer()*/ })
	}
	static siraDegistirIstendi(e) {
		const islemAdi = 'Sırala', gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, {yon} = e;
		let recs = e.recs ?? gridPart.boundRecs, selRecs = [...(e.selRecs ?? gridPart.selectedRecs)];
		selRecs.sort((a, b) => recs.indexOf(a) - recs.indexOf(b));
		switch (yon) {
	        case 'yukari':
	            for (let i = 0; i < selRecs.length; i++) {  /* Baştan sona doğru işliyoruz */
	                let rec = selRecs[i], ind = recs.indexOf(rec); if (ind < 1) { continue }  /* En üstteki kayıt yukarı çıkamaz */
	                [recs[ind], recs[ind - 1]] = [recs[ind - 1], recs[ind]]
	            }
	            break;
	        case 'asagi':
	            for (let i = selRecs.length - 1; i >= 0; i--) {  /* Baştan sona işlemek yerine, TERSTEN işliyoruz */
	                let rec = selRecs[i], ind = recs.indexOf(rec); if (ind >= recs.length - 1) { continue }  /* En alttaki kayıt aşağı inemez */
	                [recs[ind], recs[ind + 1]] = [recs[ind + 1], recs[ind]]
	            }
	            break;
	    }
	    let newRowIndexes = selRecs.map(rec => recs.indexOf(rec));  /* Swap sonrası tüm yeni indeksleri al */
		gridPart.veriYuklenince(e => {
			const {gridPart: p, gridWidget: w} = e; w.clearselection();
			for (let ind of newRowIndexes) { w.selectrow(ind) }  /* sırası değişen yeni satırları seç */
			p.veriYuklenince(null)
		});
		gridPart.tazele()
	}
	static async siralamaKaydetIstendi(e) {
		const islemAdi = 'Sırala', gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart;
		let {boundRecs: recs} = gridPart, isIdListe = recs.filter(rec => !rec.devreDisimi).map(rec => rec.issayac);
		if (!isIdListe?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', islemAdi); return }
		try {
			isIdListe = [...isIdListe].reverse();  /* UYARI: 'recs' verisi 'ORDER BY seq DESC' sebebiyle TERS SIRADA gelecek. Sıralamayı kaydederken de TERS SIRADA verilmelidir */
			await app.wsSiraDuzenle({ tezgahKod, isIdListe: isIdListe.join(delimWS) });
			gridPart.degistimi = false; gridPart.close()
		}
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), islemAdi) }
	}
	static async yeniOperIstendi_ek(e) {
		let {opNoListe, gridPart} = e, {args} = gridPart, {part} = MQBekleyenIsler.listeEkraniAc({ args });
		if (opNoListe?.length == 1) {
			let kod2Adi = await MQOperasyon.getGloKod2Adi(), {bulPart} = part, {input} = bulPart;
			input.val(opNoListe.map(opNo => kod2Adi[opNo] ?? opNo.toString()).join('|'));
			part.veriYuklenince(() => {
				if (part.veriYukleninceCalistimi) { return } part.veriYukleninceCalistimi = true;
				let {layout} = part, tokens = input.val().split('|');
				part.hizliBulIslemi({ sender: this, layout, tokens })
			})
		}
		/*try {
			let {tezgahKod, urunKod, opNoListe} = e, hatBazinda = false, hatBazindami;
			let sent = new MQSent({
				from: 'operemri emr',
				where: [{ degerAta: urunKod, saha: 'emr.formul' },
				{ inDizi: opNoListe, saha: emr.'opno' }],
				sahalar: ['emr.opno opno', 'MAX(kaysayac) oemsayac']
			})
			sent.groupByOlustur()
			let recs = (await app.sqlExecSelect(sent)).map(({ oemsayac }) => oemsayac)
			await MQBekleyenIsler.sirayaAlIstendi({ ...e, tezgahKod, hatBazinda, hatBazindami, recs })
		} catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Yeni Operasyon: Sıraya Al') }*/
	}
	static async listeEkrani_vazgecOncesi(e) {
		if (await super.listeEkrani_vazgecOncesi(e) === false) { return false }
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {siralamami, degistimi} = gridPart;
		if (siralamami && degistimi) {
			let mesaj = `<p><b class=gray><u>UYARI</u>:</b> <b class=red>Kaydedilmemiş Sıralama Değişkliği</b> var</p><p>Yine de ekran kapatılsın mı?</p>`;
			if (!await ehConfirm(mesaj, 'Kaydedilmemiş Sıralama')) { return false }
		}
		return true
	}
}
class MQBekleyenIsler extends MQXIsler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodListeTipi() { return 'BEKLEYEN_ISLER' } static get sinifAdi() { return 'Bekleyen İşler' }
	static get switchPartClass() { return MQSiradakiIsler } static get switchButtonText() { return 'S' }
	static listeEkrani_init(e) { super.listeEkrani_init(e); const gridPart = e.gridPart ?? e.sender; $.extend(gridPart, { sadeceUygunAsamami: true }) }
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addCheckBox(rfb, 'sadeceUygunAsamami', 'Uygun Aşamalar').onAfterRun(e => {
			const {builder} = e, {rootPart, layout} = builder, input = builder.input ?? layout.children('input');
			input.prop('checked', rootPart.sadeceUygunAsamami);
			input.on('change', evt => { const value = rootPart.sadeceUygunAsamami = $(evt.currentTarget).is(':checked'); rootPart.tazele() })
		})
	}
	static loadServerDataDevam(e) {
		super.loadServerDataDevam(e); const {args} = e, gridPart = e.gridPart ?? e.sender; let {sadeceUygunAsamami} = gridPart;
		sadeceUygunAsamami = args.sadeceUygunAsamami = sadeceUygunAsamami ?? true; return app.wsBekleyenIsler(args)
	}
	static islemTuslariDuzenle_listeEkrani(e) {
		super.islemTuslariDuzenle_listeEkrani(e); const {liste} = e, gridPart = e.gridPart ?? e.sender ?? e.parentPart;
		liste.push(
			{ id: 'sirayaAl', text: 'SIRAYA AL', handler: e => this.sirayaAlIstendi(e) },
			{ id: 'aktifPasif', text: 'AKTİF PASİF', handler: e => this.aktifPasifIstendi(e) },
			{ id: 'yeniOper', text: 'YENİ OPER', handler: e => this.yeniOperIstendi(e) }
		)
	}
	static async sirayaAlIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender;
		let tezgahKod = e.tezgahKod ?? gridPart.tezgahKod, hatKod = e.hatKod ?? gridPart.hatKod;
		let hatBazindami = e.hatBazinda ?? e.hatBazindami ?? gridPart.hatBazinda ?? gridPart.hatBazindami;
		const recs = e.recs ?? gridPart.selectedRecs.filter(rec => !rec.devreDisimi); if (!recs?.length) { hConfirm('İşlem yapılacak Aktif kayıt(lar) seçilmelidir', 'Sıraya Al'); return }
		const oemSayacListe = recs.map(rec => rec.oemsayac).join(delimWS); if (!oemSayacListe?.length) { return }
		try {
			if (hatBazindami) {
				const excludeTezgahKod = null /*tezgahKod*/, args = { cokluSecimFlag: true, tezgahKod, hatKod, excludeTezgahKod, title: `<b class="gray">${tezgahKod}</b> - <span class="ek-bilgi">Şu Tezgahlar için:</span>` };
				HatYonetimiPart.listeEkraniAc({ args, secince: async e => {
					/*const _gridPart = e.gridPart ?? e.parentPart ?? e.sender, hedefTezgahKodListe = _gridPart.getSubRecs({ cells: _gridPart.gridWidget.getselectedcells() }).map(rec => rec.tezgahKod);*/
					let hedefTezgahKodListe = e.recs.map(rec => rec.tezgahKod); if (!hedefTezgahKodListe?.length) { return }
					try {
						for (const hedefTezgahKod of hedefTezgahKodListe) { await app.wsSirayaAl({ tezgahKod: hedefTezgahKod, oemSayacListe }) }
						gridPart.tazele(); const kod2Rec = await app.getTezgahKod2Rec({ hedefTezgahKodListe });
						for (let tezgahKod of hedefTezgahKodListe) {
							const {tezgahAdi, hatKod, hatAdi} = kod2Rec[tezgahKod] ?? {};
							await MQSiradakiIsler.listeEkraniAc({ args: { hatKod, hatAdi , tezgahKod, tezgahAdi } }); await new $.Deferred(p => setTimeout(() => p.resolve(), 200))
						}
					}
					catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Sıraya Al') }
				} })
			}
			else { await app.wsSirayaAl({ tezgahKod, oemSayacListe }); gridPart.tazele() }
		}
		catch(ex) { console.error(ex); hConfirm(getErrorText(ex), 'Sıraya Al') }
	}
	static async aktifPasifIstendi(e) {
		const gridPart = e.gridPart ?? e.parentPart ?? e.sender, {tezgahKod} = gridPart, recs = e.recs ?? gridPart.selectedRecs; if (!recs?.length) { return }
		const oemSayacListe = recs.map(rec => rec.oemsayac).join(delimWS); if (!oemSayacListe?.length) { return }
		try { await app.wsBekleyenIs_devredisiYapKaldir({ tezgahKod, oemSayacListe }); gridPart.tazele() }
		catch (ex) { console.error(ex); hConfirm(getErrorText(ex), 'Aktif/Pasif') }
	}
}
