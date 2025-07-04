class MQEkNotAnaGrup extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ek Not Ana Grup' } static get table() { return 'meseknotanagrup' }
	static get tableAlias() { return 'agrp' } static get kodListeTipi() { return 'MESNOTANAGRUP' }
	static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return MQCogul.secimSinif } static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true }
}
class MQEkNotGrup extends MQKAOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ek Not Grup' } static get table() { return 'meseknotgrup' }
	static get tableAlias() { return 'grp' } static get kodListeTipi() { return 'MESNOTGRUP' }
	static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return MQCogul.secimSinif } static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true }
	static pTanimDuzenle(e) { super.pTanimDuzenle(e); let {pTanim} = e; $.extend(pTanim, { anaGrupKod: new PInstStr('anagrupkod') }) }
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); this.formBuilder_addTabPanelWithGenelTab(e); let {tabPage_genel} = e;
		let form = tabPage_genel.addFormWithParent(); form.addModelKullan({ id: 'anaGrupKod', etiket: 'Ana Grup', mfSinif: MQEkNotAnaGrup }).dropDown().autoBind()
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e; liste.push(
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 10 }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 30, sql: 'agrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {tableAlias: alias} = this, {sent} = e;
		sent.fromIliski('meseknotanagrup agrp', `${alias}.anagrupkod = agrp.kod`)
	}
}
class MQEkNotlar extends MQSayacliOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get sinifAdi() { return 'Ek Notlar' }
	static get table() { return 'meseknotlar' } static get tableAlias() { return 'eknot' } static get sayacSaha() { return 'kaysayac' }
	static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return MQCogul.secimSinif } static get noAutoFocus() { return true }
	static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true } static get urlCount() { return 3 }
	static get urlCount() { return 3 }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); let {pTanim} = e; $.extend(pTanim, {
			kayitTarih: new PInstDateNow('kayittarih'), kayitZaman: new PInstStr({ rowAttr: 'kayitzaman', init: e => timeToString(now()) }),
			grupKod: new PInstStr('grupkod'), tip: new PInstTekSecim('tip', HatTezgah), hatKod: new PInstStr('hatkod'), tezgahKod: new PInstStr('tezgahkod'),
			perKod: new PInstStr({ rowAttr: 'perkod', init: () => this.paramGlobals.sonPerKod }), notlar: new PInstStr('notlar')
		});
		for (let i = 1; i <= this.urlCount; i++) { pTanim[`url${i}`] = new PInstStr(`url${i}`) }
	}
	static rootFormBuilderDuzenle_listeEkrani(e) {
		super.rootFormBuilderDuzenle_listeEkrani(e); let {rootBuilder: rfb} = e;
		this.fbd_listeEkrani_addButton(rfb, { id: 'dokumanGoster', text: 'Döküman Göster', handler: e => this.dokumanGosterIstendi(e) })
	}
	static secimlerDuzenle(e) {
		let {secimler: sec} = e;
		sec.grupTopluEkle([ { kod: 'grup', aciklama: 'Grup', kapali: true }, { kod: 'hatTezgah', aciklama: 'Hat/Tezgah', kapali: true } ]);
		sec.secimTopluEkle({
			kayitTarih: new SecimDate({ etiket: 'Kayıt Tarih' }),
			grupKod: new SecimString({ etiket: 'Grup', mfSinif: MQEkNotGrup, grupKod: 'grup' }), grupAdi: new SecimOzellik({ etiket: 'Grup Adı', grupKod: 'grup' }),
			anaGrupKod: new SecimString({ etiket: 'Ana Grup', mfSinif: MQEkNotAnaGrup, grupKod: 'grup' }), anaGrupAdi: new SecimOzellik({ etiket: 'Ana Grup Adı', grupKod: 'grup' }),
			tipSecim: new SecimTekSecim({ etiket: 'Tip', tekSecim: new BuDigerVeHepsi(['Hat', 'Tezgah']), grupKod: 'hatTezgah' }),
			hatKod: new SecimString({ etiket: 'Hat', mfSinif: MQHat, grupKod: 'hatTezgah' }), hatAdi: new SecimOzellik({ etiket: 'Hat Adı', grupKod: 'hatTezgah' }),
			tezgahKod: new SecimString({ etiket: 'Tezgah', mfSinif: MQTezgah, grupKod: 'hatTezgah' }), tezgahAdi: new SecimOzellik({ etiket: 'Tezgah Adı', grupKod: 'hatTezgah' }),
			perKod: new SecimString({ etiket: 'Personel', mfSinif: MQPersonel, grupKod: 'hatTezgah' }), perIsim: new SecimOzellik({ etiket: 'Personel İsim', grupKod: 'hatTezgah' }),
		});
		sec.whereBlockEkle(e => {
			let {secimler: sec, where: wh} = e, alias = e.alias ?? this.tableAlias;
			wh.basiSonu(sec.kayitTarih, `${alias}.kayittarih`);
			wh.basiSonu(sec.grupKod, `${alias}.grupkod`).ozellik(sec.grupAdi, 'grp.aciklama');
			wh.basiSonu(sec.anaGrupKod, 'grp.anagrupkod').ozellik(sec.anaGrupAdi, 'agrp.aciklama');
			let tSec = sec.tipSecim.tekSecim; if (!tSec.hepsimi) { wh.degerAta(tSec.bumu ? 'HT' : 'TZ', `${alias}.tip`) }
			wh.basiSonu(sec.hatKod, `${alias}.hatkod`).ozellik(sec.hatAdi, 'hat.aciklama');
			wh.basiSonu(sec.tezgahKod, `${alias}.tezgahkod`).ozellik(sec.tezgahAdi, 'tez.aciklama')
			wh.basiSonu(sec.perKod, `${alias}.perkod`).ozellik(sec.perIsim, 'per.aciklama')
		})
	}
	static orjBaslikListesi_argsDuzenle(e) { super.orjBaslikListesi_argsDuzenle(e); let {args} = e; $.extend(args, { rowsHeight: 180 /*selectionmode: 'multiplecellsextended'*/ }) }
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e); let {rec, result} = e, belirtec = e.belirtec ?? e.dataField ?? e.datafield, {tip} = rec;
		switch (belirtec) { case 'tipText': case 'hatkod': case 'hatadi': case 'tezgahkod': case 'tezgahadi': result.push('bold'); break }
		if (belirtec == 'hatkod' || belirtec == 'hatadi') { result.push('royalblue') }
		else if (belirtec == 'tipText') { switch (tip) { case 'HT': result.push('bg-lightgreen'); break; case 'TZ': result.push('bg-lightred'); break } }
		else {
			let {localData} = app.params, ekNotLastReadId = asInteger(localData.getData('ekNotLastReadId')), {kaysayac: id} = rec;
			if (id && (!ekNotLastReadId || id > ekNotLastReadId)) { result.push('yeni-not') }
		}
		
	}
	static standartGorunumListesiDuzenle(e) { super.standartGorunumListesiDuzenle(e); let {liste} = e, _liste = e.liste = liste.filter(colDef => !colDef?.startsWith('url')) }
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); let {liste} = e, alias = e.alias ?? this.tableAlias, {urlCount} = this;
		liste.push(...[
			new GridKolon({ belirtec: 'kayittarih', text: 'Tarih', genislikCh: 10 }).tipDate(),
			new GridKolon({ belirtec: 'kayitzaman', text: 'Saat', genislikCh: 8 }).tipTime_noSecs(),
			new GridKolon({ belirtec: 'tipText', text: 'Tip', genislikCh: 8, sql: HatTezgah.getClause(`${alias}.tip`) }),
			new GridKolon({ belirtec: 'hatkod', text: 'Hat', genislikCh: 8 }),
			new GridKolon({ belirtec: 'hatadi', text: 'Hat Adı', genislikCh: 15, sql: 'hat.aciklama' }),
			new GridKolon({ belirtec: 'tezgahkod', text: 'Tezgah', genislikCh: 16 }),
			new GridKolon({ belirtec: 'tezgahadi', text: 'Tezgah Adı', genislikCh: 30, sql: 'tez.aciklama' }),
			new GridKolon({ belirtec: 'perkod', text: 'Personel', genislikCh: 16 }),
			new GridKolon({ belirtec: 'perisim', text: 'Personel İsim', genislikCh: 30, sql: 'per.aciklama' }),
			new GridKolon({ belirtec: 'grupkod', text: 'Grup', genislikCh: 16 }),
			new GridKolon({ belirtec: 'anagrupkod', text: 'Ana Grup', genislikCh: 8, sql: 'grp.anagrupkod' }),
		]);
		for (let i = 1; i <= urlCount; i++) {
			liste.push(new GridKolon({ belirtec: `url${i}`, text: `Dokuman URL ${i}` })) }
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
		liste.push(
			new GridKolon({ belirtec: 'notlar', text: 'Ek Notlar', genislikCh: 80 }),
			new GridKolon({ belirtec: 'grupadi', text: 'Grup Adı', genislikCh: 40, sql: 'grp.aciklama' }),
			new GridKolon({ belirtec: 'anagrupadi', text: 'Ana Grup Adı', genislikCh: 40, sql: 'agrp.aciklama' })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let alias = e.alias ?? this.tableAlias, {stm, sent} = e, {orderBy} = stm, {sahalar} = sent;
		sent.fromIliski('meseknotgrup grp', `${alias}.grupkod = grp.kod`).fromIliski('meseknotanagrup agrp', 'grp.anagrupkod = agrp.kod');
		sent.fromIliski('ismerkezi hat', `${alias}.hatkod = hat.kod`).fromIliski('tekilmakina tez', `${alias}.tezgahkod = tez.kod`);
		sent.fromIliski('personel per', `${alias}.perkod = per.kod`);
		sahalar.add(`${alias}.tip`); for (let i = 1; i <= this.urlCount; i++) { sahalar.add(`${alias}.url${i}`) };
		orderBy.add(`${alias}.kayittarih DESC`, `${alias}.kayitzaman DESC`)
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); let {rootBuilder: rfb, tanimFormBuilder: tanimForm} = e;
		rfb.addStyle(e => `$elementCSS .modelTanim.form { margin-top: -50px !important; z-index: 1000 !important }`);
		let form = tanimForm.addFormWithParent().yanYana(2.5);
			form.addDateInput('kayitTarih', 'Kayıt Tarihi'); form.addTimeInput('kayitZaman');
			form.addModelKullan('grupKod', 'Grup').setMFSinif(MQEkNotGrup).comboBox().autoBind().addStyle_wh(250);
			form.addModelKullan('perKod', 'Personel').setMFSinif(MQPersonel).comboBox().autoBind().addStyle_wh(350)
				.degisince(({ builder: fbd, value }) => { this.paramGlobals.sonPerKod = value; app.params.yerel.kaydet() });
		// form = tanimForm.addFormWithParent().yanYana(3);
			form.addModelKullan('tip', 'Tip').kodsuz().bosKodAlinmaz().bosKodEklenmez().dropDown().noMF().autoBind()
				.addStyle_wh(130).setSource(e => HatTezgah.kaListe).degisince(e => {
					let {builder} = e, {id2Builder} = builder.parentBuilder, value = builder.value?.char ?? builder.value;
					for (let key of ['hatKod', 'tezgahKod']) { id2Builder[key]?.updateVisible() }
				});
			form.addModelKullan('hatKod', 'Hat').setMFSinif(MQHat).comboBox().autoBind()
				.addStyle_wh(300).setVisibleKosulu(e => { let value = e.builder.altInst.tip; value = value?.char ?? value; return value == 'HT' ? true : 'jqx-hidden' });
			form.addModelKullan('tezgahKod', 'Tezgah').setMFSinif(MQTezgah).comboBox().autoBind()
				.addStyle_wh(350).setVisibleKosulu(e => { let value = e.builder.altInst.tip; value = value?.char ?? value; return value == 'TZ' ? true : 'jqx-hidden' });;
		form = tanimForm.addFormWithParent().yanYana().addStyle(e => `$elementCSS { margin-top: 10px }`);
		for (let i = 1; i <= this.urlCount; i++) {
			form.addTextInput(`url${i}`, `Doküman URL ${i}`).onAfterRun(e => {
				let {builder} = e, {layout} = builder, label = layout.children('label');
				let btn = $(`<button id="upload"/>`).jqxButton({ theme }); btn.prependTo(layout);
				btn.on('click', evt => this.dokumanYukleIstendi({ ...e, builder }))
			}).addStyle(e => `
				$elementCSS { --button-width: 45px; --button-margin-right: 10px; --button-right: calc(var(--button-width) + calc(--button-margin-right)) }
				$elementCSS > button#upload { width: var(--button-width); height: calc(var(--button-width) - 8px); margin-right: var(--button-margin-right) }
				$elementCSS > label { width: calc(var(--full) - var(--button-right)) !important }`
		   )
		}
		form = tanimForm.addFormWithParent().altAlta().addStyle(e => `$elementCSS { margin-top: 10px }`)
				.addStyle_fullWH(null, `calc(var(--full) - ${$(window).width() < 1100 ? 400: 350}px)`);
			form.addDiv('notlar', 'Notlar').addStyle_fullWH().onAfterRun(({ builder }) => {
				let toolbar = [
					 ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
					 ['blockquote', 'code-block'],
					 ['link', /*'image',*/ 'video', 'formula'],
					 [{ 'header': 1 }, { 'header': 2 }],               // custom button values
					 [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
					 [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
					 [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
					 [{ 'direction': 'rtl' }],                         // text direction
					 [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
					 [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
					 [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
					 [{ 'font': [] }],
					 [{ 'align': [] }],
					 ['clean']                                         // remove formatting button
				];
				let {id, altInst, input, etiket: placeholder} = builder; input.html(altInst[id]);
				let part = builder.part = new Quill(input[0], { theme: 'snow', placeholder, modules: { toolbar } }); input.addClass('full-wh bg-white')
				part.on('text-change', evt => altInst[id] = part.root.innerHTML)
			})
	}
	static gridVeriYuklendi(e) {
		super.gridVeriYuklendi(e); let gridPart = e.gridPart ?? e.sender; if (!gridPart) { return }
		let {localData} = app.params, ekNotLastReadId = asInteger(localData.getData('ekNotLastReadId')), savedLastReadId = ekNotLastReadId;
		let {boundRecs: recs} = gridPart; for (let {kaysayac: id} of recs) { if (id && ekNotLastReadId < id) { ekNotLastReadId = id } }
		if (ekNotLastReadId != savedLastReadId) { setTimeout(() => { localData.setData('ekNotLastReadId', ekNotLastReadId); localData.kaydet() }, 500) }
	}
	static orjBaslikListesi_gridRendered(e) {
		super.orjBaslikListesi_gridRendered(e)/*; let {type} = e;
		if (type == 'full') {
			let {gridPart, gridWidget} = e; if (!gridWidget) { return }
			let {localData} = app.params; let ekNotLastReadId = asInteger(localData.getData('ekNotLastReadId')), savedLastReadId = ekNotLastReadId;
			for (let {kaysayac: id} of gridWidget.getvisiblerows()) { if (id && ekNotLastReadId < id) { ekNotLastReadId = id } }
			if (ekNotLastReadId != savedLastReadId) { localData.setData('ekNotLastReadId', ekNotLastReadId); localData.kaydetDefer() }
		}*/
	}
	static orjBaslikListesi_satirTiklandi(e) {
		e = e || {}; let gridPart = e.gridPart ?? e.sender, gridWidget = e?.event?.args?.owner ?? gridPart.gridWidget;
		setTimeout(() => {
			let belirtec = e.belirtec ?? gridWidget?._clickedcolumn, rec = e.rec ?? gridPart.selectedRec; let focusURL;
			if (rec && belirtec?.startsWith('resim') && (focusURL = rec[belirtec.replace('resim', 'url')]?.trim())) { this.dokumanGosterIstendi({ ...e, focusURL }) }
		}, 100)
	}
	static dokumanGosterIstendi(e) {
		e = e || {}; let islemAdi = 'Döküman Göster'; try {
			let {builder, focusURL} = e, gridPart = e.gridPart ?? builder?.rootPart ?? e.sender ?? app.activeWndPart, recs = gridPart.selectedRecs, {urlCount} = this;
			let urlListe = []; for (let rec of recs) { for (let i = 1; i <= urlCount; i++) { let value = rec[`url${i}`]; if (value) { urlListe.push(value.trim()) } } }
			if (!urlListe.length) { return } if (focusURL) { urlListe.sort((a, b) => a == focusURL ? -1 : 0) }
			new MESDokumanWindowPart({ urlListe }).run()
		}
		catch (ex) { hConfirm(getErrorText(ex), islemAdi); throw ex }
	}
	static async dokumanYukleIstendi(e) {
		e = e || {}; let PrefixURL = 'url', islemAdi = 'Döküman Yükle'; try {
			let {builder} = e, gridPart = e.gridPart ?? builder?.rootPart ?? e.sender ?? app.activeWndPart;
			let id = e.id ?? builder?.id; let i = asInteger(e.seq ?? e.index ?? id?.slice(PrefixURL.length)); let key = `${PrefixURL}${i}`;
			let elm = $(`<input type="file" capture="environment" accept="image/*, application/pdf, video/*">`).appendTo('body'); elm.addClass('jqx-hidden');
			elm.on('change', async evt => {
				try {
					let file = evt.target.files[0]; let fileName = file.name.replaceAll(' ', '_'), ext = fileName.split('.').slice(-1)[0] ?? '';
					let resimId = ext ? fileName.slice(0, -(ext.length + 1)) : fileName, data = file ? new Uint8Array(await file.arrayBuffer()) : null;
					if (!data?.length) { return }
					resimId = newGUID();
					let urlBase = app.getWSUrlBase({ wsPath: 'vio-resim' }).replace('https:', 'http:').replace(':8200', '').replace(':9200', '').replace(':80', '').replace(':443', '');
					let url = `${urlBase}/${[resimId, ext].join('.')}`;
					try { await ajaxPost({ url, data, contentType: 'application/octet-stream' }) }
					catch (ex) {
						console.error(ex);
						let result = await app.wsResimDataKaydet({ resimId, ext, data });
						if (!result?.result) { throw { isError: true, errorText: 'Resim Kayıt Sorunu' } }
					}
					if (builder) {
						let {altInst, input} = builder;
						/* let url = `${urlBase}/stokResim/?id=${resimId}&ext=${ext}`; */
						builder.value = altInst[id] = url; input?.focus()
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
