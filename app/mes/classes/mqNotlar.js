class MQEkNotlar extends MQSayacliOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ek Notlar' }
	static get table() { return 'meseknotlar' } static get tableAlias() { return 'eknot' } static get sayacSaha() { return 'kaysayac' }
	static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return MQCogul.secimSinif } static get noAutoFocus() { return true }
	static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true } static get urlCount() { return 3 }
	static get urlCount() { return 3 }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, {
			kayitTarih: new PInstDateNow('kayittarih'), kayitZaman: new PInstStr({ rowAttr: 'kayitzaman', init: e => timeToString(now()) }),
			tip: new PInstTekSecim('tip', HatTezgah), hatKod: new PInstStr('hatkod'), tezgahKod: new PInstStr('tezgahkod'),
			notlar: new PInstStr('notlar')
		});
		for (let i = 1; i <= this.urlCount; i++) { pTanim[`url${i}`] = new PInstStr(`url${i}`) }
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); const rfb = e.rootBuilder;
		this.fbd_listeEkrani_addButton(rfb, { id: 'dokumanGoster', text: 'Döküman Göster', handler: e => this.dokumanGosterIstendi(e) })
	}
	static secimlerDuzenle(e) {
		const {secimler: sec} = e; sec.secimTopluEkle({
			kayitTarih: new SecimDate({ etiket: 'Kayıt Tarih' }), tipSecim: new SecimTekSecim({ etiket: 'Tip', tekSecim: new BuDigerVeHepsi(['Hat', 'Tezgah']) }),
			hatKod: new SecimString({ etiket: 'Hat', mfSinif: MQHat }), hatAdi: new SecimOzellik({ etiket: 'Hat Adı' }),
			tezgahKod: new SecimString({ etiket: 'Tezgah', mfSinif: MQTezgah }), tezgahAdi: new SecimOzellik({ etiket: 'Tezgah Adı' })
		});
		sec.whereBlockEkle(e => {
			const {secimler: sec, where: wh} = e, alias = e.alias ?? this.tableAlias;
			wh.basiSonu(sec.kayitTarih, `${alias}.kayittarih`);
			let tSec = sec.tipSecim.tekSecim; if (!tSec.hepsimi) { wh.degerAta(tSec.bumu ? 'HT' : 'TZ', `${alias}.tip`) }
			wh.basiSonu(sec.hatKod, `${alias}.hatkod`); wh.ozellik(sec.hatAdi, 'hat.aciklama');
			wh.basiSonu(sec.tezgahKod, `${alias}.tezgahkod`); wh.ozellik(sec.tezgahAdi, 'tez.aciklama')
		})
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); const {args} = e; $.extend(args, { rowsHeight: 180 /*selectionmode: 'multiplecellsextended'*/ }) }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); const {rec, result} = e, belirtec = e.belirtec ?? e.dataField ?? e.datafield, {tip} = rec;
		switch (belirtec) { case 'tipText': case 'hatkod': case 'hatadi': case 'tezgahkod': case 'tezgahadi': result.push('bold'); break }
		if (belirtec == 'hatkod' || belirtec == 'hatadi') { result.push('royalblue') }
		else if (belirtec == 'tipText') { switch (tip) { case 'HT': result.push('bg-lightgreen'); break; case 'TZ': result.push('bg-lightred'); break } }
		else {
			const {localData} = app.params, ekNotLastReadId = asInteger(localData.getData('ekNotLastReadId')), {kaysayac: id} = rec;
			if (id && (!ekNotLastReadId || id > ekNotLastReadId)) { result.push('yeni-not') }
		}
		
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); let {liste} = e, _liste = e.liste = liste.filter(colDef => !colDef?.startsWith('url')) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e, alias = e.alias ?? this.tableAlias, {urlCount} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'kayittarih', text: 'Tarih', genislikCh: 10 }).tipDate(),
			new GridKolon({ belirtec: 'kayitzaman', text: 'Saat', genislikCh: 8 }).tipTime_noSecs(),
			new GridKolon({ belirtec: 'tipText', text: 'Tip', genislikCh: 8, sql: HatTezgah.getClause(`${alias}.tip`) }),
			new GridKolon({ belirtec: 'hatkod', text: 'Hat', genislikCh: 8 }),
			new GridKolon({ belirtec: 'hatadi', text: 'Hat Adı', genislikCh: 15, sql: 'hat.aciklama' }),
			new GridKolon({ belirtec: 'tezgahkod', text: 'Tezgah', genislikCh: 16 }),
			new GridKolon({ belirtec: 'tezgahadi', text: 'Tezgah Adı', genislikCh: 30, sql: 'tez.aciklama' })
		]);
		for (let i = 1; i <= urlCount; i++) { liste.push(new GridKolon({ belirtec: `url${i}`, text: `Dokuman URL ${i}` })) }
		for (let i = 1; i <= urlCount; i++) {
			liste.push(new GridKolon({
				filterable: false, sortable: false, groupable: false,
				belirtec: `resim${i}`, text: `Dokuman Resim ${i}`, genislikCh: 20, cellsRenderer: (colDef, rowIndex, belirtec, _value, html, jqxCol, rec) => {
					let i = asInteger(belirtec.slice('resim'.length)), value = rec[`url${i}`], parts = value ? value.split('=') : null, ext, resimmi = false;
					if (parts?.length) {
						let ind = parts.findIndex(part => part?.toLowerCase()?.endsWith('ext'));
						if (ind != -1) { ext = parts[ind + 1]?.trim()?.toLowerCase(); resimmi = !!fileExtSet_image[ext] }
					}
					if (value) {
						html = resimmi
									? `<div class="full-wh" style="background-repeat: no-repeat; background-size: contain; background-image: url(${value})"/>`
									: `<iframe class="full-wh" style="border: none; margin: 0; padding: 0; background-size: contain" src="${value}"></iframe>`
					}
					return html
				}
			}).noSql())
		}
		liste.push(new GridKolon({ belirtec: 'notlar', text: 'Ek Notlar', genislikCh: 150 }))
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {stm, sent} = e, alias = e.alias ?? this.tableAlias;
		sent.fromIliski('ismerkezi hat', `${alias}.hatkod = hat.kod`);
		sent.fromIliski('tekilmakina tez', `${alias}.tezgahkod = tez.kod`);
		sent.sahalar.add(`${alias}.tip`); for (let i = 1; i <= this.urlCount; i++) { sent.sahalar.add(`${alias}.url${i}`) };
		stm.orderBy.add(`${alias}.kayittarih DESC`, `${alias}.kayitzaman DESC`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder;
		let form = tanimForm.addFormWithParent().yanYana(3);
			form.addDateInput('kayitTarih', 'Kayıt Tarihi'); form.addTimeInput('kayitZaman');
			form.addModelKullan('tip', 'Tip').kodsuz().bosKodAlinmaz().bosKodEklenmez().dropDown().noMF().setSource(e => HatTezgah.kaListe).degisince(e => {
				const {builder} = e, {id2Builder} = builder.parentBuilder, value = builder.value?.char ?? builder.value;
				for (const key of ['hatKod', 'tezgahKod']) { id2Builder[key]?.updateVisible() }
			});
			form.addModelKullan('hatKod', 'Hat').setMFSinif(MQHat).comboBox().setVisibleKosulu(e => { let value = e.builder.altInst.tip; value = value?.char ?? value; return value == 'HT' ? true : 'jqx-hidden' });
			form.addModelKullan('tezgahKod', 'Tezgah').setMFSinif(MQTezgah).comboBox().setVisibleKosulu(e => { let value = e.builder.altInst.tip; value = value?.char ?? value; return value == 'TZ' ? true : 'jqx-hidden' });;
		form = tanimForm.addFormWithParent().yanYana().addStyle(e => `$elementCSS { margin-top: 10px }`);
		for (let i = 1; i <= this.urlCount; i++) {
			form.addTextInput(`url${i}`, `Doküman URL ${i}`).onAfterRun(e => {
				const {builder} = e, {layout} = builder, label = layout.children('label');
				const btn = $(`<button id="upload"/>`).jqxButton({ theme }); btn.prependTo(layout);
				btn.on('click', evt => this.dokumanYukleIstendi({ ...e, builder }))
			}).addStyle(e => `
				$elementCSS { --button-width: 45px; --button-margin-right: 10px; --button-right: calc(var(--button-width) + calc(--button-margin-right)) }
				$elementCSS > button#upload { width: var(--button-width); height: calc(var(--button-width) - 8px); margin-right: var(--button-margin-right) }
				$elementCSS > label { width: calc(var(--full) - var(--button-right)) !important }`
		   )
		}
		form = tanimForm.addFormWithParent().yanYana().addStyle(e => `$elementCSS { margin-top: 10px }`);
			form.addTextArea('notlar', 'Notlar').setRows(20)
	}
	static orjBaslikListesi_gridRendered(e) {
		super.orjBaslikListesi_gridRendered(e); const {type} = e;
		if (type == 'full') {
			const {gridWidget} = e; if (!gridWidget) { return }
			const {localData} = app.params; let ekNotLastReadId = asInteger(localData.getData('ekNotLastReadId')), savedLastReadId = ekNotLastReadId;
			for (const {kaysayac: id} of gridWidget.getvisiblerows()) { if (id && ekNotLastReadId < id) { ekNotLastReadId = id } }
			if (ekNotLastReadId != savedLastReadId) { localData.setData('ekNotLastReadId', ekNotLastReadId); localData.kaydetDefer() }
		}
	}
	static orjBaslikListesi_satirTiklandi(e) {
		e = e || {}; const gridPart = e.gridPart ?? e.sender, gridWidget = e?.event?.args?.owner ?? gridPart.gridWidget;
		setTimeout(() => {
			const belirtec = e.belirtec ?? gridWidget?._clickedcolumn, rec = e.rec ?? gridPart.selectedRec; let focusURL;
			if (rec && belirtec?.startsWith('resim') && (focusURL = rec[belirtec.replace('resim', 'url')]?.trim())) { this.dokumanGosterIstendi({ ...e, focusURL }) }
		}, 100)
	}
	static dokumanGosterIstendi(e) {
		e = e || {}; const islemAdi = 'Döküman Göster'; try {
			const {builder, focusURL} = e, gridPart = e.gridPart ?? builder?.rootPart ?? e.sender ?? app.activeWndPart, recs = gridPart.selectedRecs, {urlCount} = this;
			let urlListe = []; for (const rec of recs) { for (let i = 1; i <= urlCount; i++) { let value = rec[`url${i}`]; if (value) { urlListe.push(value.trim()) } } }
			if (!urlListe.length) { return } if (focusURL) { urlListe.sort((a, b) => a == focusURL ? -1 : 0) }
			new MESDokumanWindowPart({ urlListe }).run()
		}
		catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
	}
	static async dokumanYukleIstendi(e) {
		e = e || {}; const PrefixURL = 'url', islemAdi = 'Döküman Yükle'; try {
			const {builder} = e, gridPart = e.gridPart ?? builder?.rootPart ?? e.sender ?? app.activeWndPart;
			const id = e.id ?? builder?.id; let i = asInteger(e.seq ?? e.index ?? id?.slice(PrefixURL.length)); const key = `${PrefixURL}${i}`;
			let elm = $(`<input type="file" capture accept="image/*, application/pdf, video/*">`).appendTo('body'); elm.addClass('jqx-hidden');
			elm.on('change', async evt => {
				try {
					const file = evt.target.files[0]; let fileName = file.name.replaceAll(' ', '_'), ext = fileName.split('.').slice(-1)[0] ?? '';
					const resimId = ext ? fileName.slice(0, -(ext.length + 1)) : fileName, data = file ? new Uint8Array(await file.arrayBuffer()) : null; if (!data?.length) { return }
					const result = await app.wsResimDataKaydet({ resimId, ext, data }); if (!result?.result) { throw { isError: true, errorText: 'Resim Kayıt Sorunu' } }
					if (builder) {
						const {altInst, input} = builder;
						const value = builder.value = altInst[id] = `${app.getWSUrlBase()}/stokResim/?id=${resimId}&ext=${ext}`; input?.focus()
					}
					gridPart?.tazeleDefer?.(e)
				}
				catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
				finally { $(evt.target).remove() }
			}); elm.click()
		}
		catch (ex) { if (ex instanceof DOMException) { return } hConfirm(getErrorText(ex), islemAdi); throw ex }
	}
}
