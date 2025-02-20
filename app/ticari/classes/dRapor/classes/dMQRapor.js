class DMQRapor extends DMQSayacliKA {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get deepCopyAlinmayacaklar() { return [...super.deepCopyAlinmayacaklar, 'rapor'] }
	static get kodListeTipi() { return 'DMQRAPOR' } static get sinifAdi() { return 'Rapor' } static get table() { return 'wgruprapor' } static get tableAlias() { return 'rap' }
	static get tanimlanabilirmi() { return true } static get silinebilirmi() { return true } static get tanimUISinif() { return ModelTanimPart } static get secimSinif() { return Secimler }
	static get kodKullanilirmi() { return false } static get idSaha() { return this.sayacSaha }
	get raporKod() { let result = this._raporKod; if (result === undefined) { result = this.class.getRaporKod(this.rapor) }; return result }
	get attrSet() { const result = {}; for (const selector of ['grup', 'icerik']) { $.extend(result, asSet(Object.keys(this[selector]))) } return result }
	get grupListe() { return Object.keys(this.grup || {}) } set grupListe(value) { return this.grup = asSet(value || []) }
	get icerikListe() { return Object.keys(this.icerik || {}) } set icerikListe(value) { return this.icerik = asSet(value || []) }
	get secilenVarmi() { return !!(Object.keys(this.grup).length || Object.keys(this.icerik).length) }
	constructor(e) {
		e = e || {}; super(e); const {isCopy} = e, {user, encUser} = config.session; this.rapor = e.rapor?.main ?? e.rapor
		$.extend(this, {
			user: e.userkod ?? user, encUser: e.encuser ?? e.encUser ?? encUser, grup: e.grupListe ?? e.grup, icerik: e.icerikListe ?? e.icerik,
			ozetMax: e.ozetMax ?? 5, kullanim: asSet(e.kullanim) ?? {}
		});
		if (!isCopy) {
			for (const key of ['grup', 'icerik']) {
				let value = this[key], orjValue = value; if ($.isArray(value)) { value = asSet(value) }
				if (value == null) { value = {} } if (value != orjValue) { this[key] = value }
			}
		}
	}
	static getRaporKod(e) {
		e = e ?? {}; let kod = typeof e == 'object'
			? (e.raporKod ?? e.raporkod ?? e.raporTip ?? e.raportip ?? e.kod ?? e.tip ?? e.rapor?.kod ?? e.class?.raporClass?.kod ?? e.rapor?.class?.kod ?? e.class?.kod) : e;
		return kod || null
	}
	static getDefault(e) {
		const {yerel} = app.params, tip2SonDRaporRec = yerel.tip2SonDRaporRec || {}, {rapor} = e, raporKod = this.getRaporKod(rapor);
		let rec = raporKod ? tip2SonDRaporRec[raporKod] : null; let inst = new DMQRapor({ rapor });
		if (rec) { inst.setValues({ ...e, rec }) } return inst
	}
	setDefault(e) {
		const {yerel} = app.params, tip2SonDRaporRec = yerel.tip2SonDRaporRec = yerel.tip2SonDRaporRec || {};
		const {raporKod} = this; let hv = raporKod ? this.hostVars(e) : null; if (hv) { tip2SonDRaporRec[raporKod] = hv; yerel.kaydetDefer(e) }
		return this
	}
	static rootFormBuilderDuzenle(e) {
		e = e || {}; super.rootFormBuilderDuzenle(e); const rfb = e.rootBuilder, tanimForm = e.tanimFormBuilder, kaForm = tanimForm.builders.find(fbd => fbd.id == 'kaForm');
		const {inst} = e, {rapor, ozetMax, kullanim} = inst, {tabloYapi} = rapor, {kaListe, grupVeToplam} = tabloYapi;
		const kaDict = {}; for (const ka of kaListe) { kaDict[ka.kod] = ka }
		const tumAttrSet = asSet(Object.keys(kaDict)), getKalanlarSource = selector => {
			let {attrSet} = inst, tabloYapiItems = selector ? tabloYapi[selector] : null;
			return Object.keys(tumAttrSet).filter(attr => !attrSet[attr] && (!tabloYapiItems || tabloYapiItems[attr]))
		}
		const className_listBox = 'listBox', ustHeight = '50px', contentTop = '13px';
		let solWidth = '230px', ortaWidth = `calc(var(--full) - (${solWidth} + 10px))`;
		let ortaHeight_grup = '35%', ortaHeight_icerik = `calc(var(--full) - (${ortaHeight_grup} + 5px))`; /*ortaHeight = 'calc((var(--full) / 2) - 5px)'*/;
		if ($(window).width() >= 700) { ortaHeight_grup = ortaHeight_icerik = 'calc(var(--full) - 50px)' }
		tanimForm.addStyle(e => `$elementCSS { --ustHeight: ${ustHeight} }`);
		kaForm.yanYana().addStyle(e => `$elementCSS { --ozetMax-width: 80px; --sag-width: calc(var(--ozetMax-width) + 230px); margin: 10px 0 0 0 !important; padding 0 !important }`);
		kaForm.id2Builder.aciklama.addStyle_wh(`calc(var(--full) - var(--sag-width)) !important`).addStyle(e => `$elementCSS { max-width: unset !important }`);
		kaForm.addNumberInput('ozetMax', 'İlk ... kayıt').addStyle_wh('var(--ozetMax-width)');
		let form = kaForm.addFormWithParent('kullanim');
			form.addModelKullan('yatayAnaliz', 'Çapraz').setInst(null).dropDown().noMF().kodsuz().listedenSecilemez()
				.setSource(e => {
					let result = [new CKodVeAdi(['', ''])];
					for (let [kod, {text: aciklama}] of Object.entries(DRapor_AraSeviye_Main.yatayTip2Bilgi)) { result.push(new CKodVeAdi({ kod, aciklama })) }
					return result
				})
				.setValue(kullanim.yatayAnaliz).degisince(({ value }) => kullanim.yatayAnaliz = value);
		let fbd_content = tanimForm.addFormWithParent('content').yanYana().addStyle_fullWH(null, 'calc(var(--full) - var(--ustHeight) - var(--top) + 8px)').addStyle([e =>
			`$elementCSS { --top: ${contentTop}; position: relative; top: var(--top); z-index: 100 }
			 $elementCSS > div .${className_listBox} { --label-height: 30px; --label-margin-bottom: 20px }
			 $elementCSS > div .${className_listBox} > label { font-size: 180%; color: #999; height: var(--label-height); padding-bottom: var(--label-margin-bottom) }
			 $elementCSS > div .${className_listBox} > :not(label) { vertical-align: top; height: calc(var(--full) - var(--label-height) - var(--label-margin-bottom)) !important }
			 $elementCSS > div .${className_listBox} > .jqx-listbox .jqx-listitem-element { font-size: 110% }`]);
		const kalanlarSourceDuzenlenmis = _source => {
			if (_source?.length) { _source = _source.filter(({ kod }) => grupVeToplam[kod] && !grupVeToplam[kod].isHidden ) }
			_source = [..._source, ...(new Array(10).fill(null).map(x => ({ /*group: ' ',*/ disabled: true })))];
			/*for (const item of _source) {
				const kod = item?.kod; if (kod == null) { continue }
				item.group = `${tabloYapi.grup[kod] ? '- Grup -' : tabloYapi.toplam[kod] ? '- Toplam -' : ''}`
			}*/
			return _source
		};
		const updateKalanlarDS = listBox => listBox.jqxListBox('source', kalanlarSourceDuzenlenmis(getKalanlarSource(listBox.data('selector')).map(kod => kaDict[kod])));
		const initListBox = e => {
			const {builder} = e, {id, altInst, input, userData} = builder, selector = userData?.selector; let {source} = e;
			if (source == null) { source = (id.startsWith('kalanlar') ? getKalanlarSource(selector) : altInst[id] ?? []).map(kod => kaDict[kod]) }
			if (source?.length && typeof source[0] != 'object') { source = source.map(kod => new CKodVeAdi({ kod, aciklama: kod })) }
			if (id.startsWith('kalanlar')) { source = kalanlarSourceDuzenlenmis(source) } if (source) { source = source.filter(x => !!x) }
			if (source?.length) { source = source.filter(({ kod }) => grupVeToplam[kod] && !grupVeToplam[kod].isHidden ) }
			const width = '100%', height = width, valueMember = 'kod', displayMember = 'aciklama';
			const allowDrop = true, allowDrag = allowDrop, autoHeight = false, itemHeight = 36, scrollBarSize = 20, filterable = true, filterHeight = 40, filterPlaceHolder = 'Bul', searchMode = 'containsignorecase';
			input.prop('id', id); if (selector != null) { input.data('selector', selector) }
			input.jqxListBox({ theme, width, height, valueMember, displayMember, source, allowDrag, allowDrop, autoHeight, itemHeight, scrollBarSize, filterable, filterHeight, filterPlaceHolder, searchMode });
			const changeHandler = evt => {
				const target = evt.currentTarget, {id} = target, args = evt.args ?? {}, {owner, type} = args, {vScrollInstance} = owner ?? {};
				if (id.startsWith('kalanlar')) {
					if (!type || type == 'none') {
						if (vScrollInstance?.value) { owner._lastScrollValue = vScrollInstance.value }
						clearTimeout(this._timer_kalanlarTazele); this._timer_kalanlarTazele = setTimeout(() => {
							try {
								updateKalanlarDS($(target)); let {_lastScrollValue} = owner ?? {};
								if (_lastScrollValue) { owner.scrollTo(0, _lastScrollValue) }
							}
							finally { delete this._timer_kalanlarTazele }
						}, 20)
					}
				}
				else { let items = $(target).jqxListBox('getItems'); altInst[id] = items.map(item => item.value) }
			};
			input.on('change', changeHandler); input.on('dragEnd', changeHandler);
			if (id.startsWith('kalanlar')) { setTimeout(input => updateKalanlarDS(input), 10, input) }
		};
		let fbd_sol = fbd_content.addFormWithParent('sol').altAlta().addStyle_fullWH(solWidth);
		let fbd_tabs = fbd_sol.addTabPanel('kalanlar').addStyle_fullWH().tabPageChangedHandler(e => {
			for (const fbd_tabPage of e.builder.builders) {
				const {input} = fbd_tabPage.builders[0];
				if (input?.length) { setTimeout(input => { updateKalanlarDS(input) /*input.jqxListBox('refresh')*/ }, 20, input) } }
		});
		fbd_tabs.addTab('grup', 'Sabitler').addStyle_fullWH().addDiv('kalanlar_grup').setEtiket('Kalanlar').etiketGosterim_yok().addCSS(className_listBox).addStyle_fullWH().setUserData({ selector: 'grup' }).onAfterRun(e => initListBox(e));
		fbd_tabs.addTab('toplam', 'Toplamlar').addStyle_fullWH().addDiv('kalanlar_toplam').setEtiket('Kalanlar').etiketGosterim_yok().addCSS(className_listBox).addStyle_fullWH().setUserData({ selector: 'toplam' }).onAfterRun(e => initListBox(e));
		let fbd_orta = fbd_content.addFormWithParent('orta').yanYana().addStyle_fullWH(ortaWidth)
			.addStyle(e => `$elementCSS > .formBuilder-element { max-width: 250px !important; min-width: 150px !important; min-height: 200px !important }`)
		fbd_orta.addDiv('grupListe').setEtiket('Grup').addCSS(className_listBox).addStyle_fullWH(null, ortaHeight_grup).onAfterRun(e => initListBox(e));
		fbd_orta.addDiv('icerikListe').setEtiket('İçerik').addCSS(className_listBox).addStyle_fullWH(null, ortaHeight_icerik).onAfterRun(e => initListBox(e))
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const {liste} = e; liste.push(
			new GridKolon({ belirtec: 'grupbelirtecler', text: 'Gruplar', maxWidth: 500 }), new GridKolon({ belirtec: 'icerikbelirtecler', text: 'İçerikler', maxWidth: 500 }),
			new GridKolon({ belirtec: 'ilkxsayi', text: 'Özet Sayı', genislikCh: 10 }).tipNumerik(),
			new GridKolon({ belirtec: 'xuserkod', text: 'Kullanıcı', genislikCh: 10 }),
			new GridKolon({ belirtec: 'kullanim', text: 'Kullanım', genislikCh: 100 })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta} = this, {sent} = e, args = e.args || {};
		const {encUser, isAdmin} = config.session, {rapor} = args, raporKod = this.getRaporKod(rapor);
		if (raporKod) { sent.where.degerAta(raporKod, `${aliasVeNokta}raportip`) }
		if (!isAdmin && encUser) { sent.where.add(new MQOrClause([`${aliasVeNokta}xuserkod = ''`, { degerAta: encUser, saha: `${aliasVeNokta}xuserkod` }])) }
		sent.sahalar.add(`${aliasVeNokta}raportip`, `${aliasVeNokta}xuserkod`)
	}
	static yeniInstOlustur(e) {
		const inst = super.yeniInstOlustur(e), args = e.args || {}, {rapor} = args;
		if (inst && rapor) { inst.rapor = rapor } return inst
	}
	async dataDuzgunmu(e) { await super.dataDuzgunmu(e); return await this.dataDuzgunmuDevam(e) }
	dataDuzgunmuDevam(e) {
		const {rapor} = this, {tabloYapi} = rapor, {toplam} = tabloYapi, {grup, icerik, kullanim} = this, {yatayAnaliz} = kullanim;
		let normalIcerikVarmi = false, toplanabilirVarmi = false, grupUygunmu = true;
		for (const key in grup) { if (toplam[key]) { grupUygunmu = false; break } }
		for (const key in icerik) {
			if (toplam[key]) { toplanabilirVarmi = true } else { normalIcerikVarmi = true }
			if (toplanabilirVarmi && normalIcerikVarmi) { break}
		}
		if (!grupUygunmu) { throw { isError: true, errorText: 'Toplanabilir Sahalar, Gruplama kısmına eklenemez' } }
		if (!(toplanabilirVarmi && normalIcerikVarmi)) { throw { isError: true, errorText: 'En az birer Toplanabilir ve Normal saha olmalıdır' } }
		if (yatayAnaliz) {
			let {grup} = this, {kod, text} = DRapor_AraSeviye_Main.yatayTip2Bilgi[yatayAnaliz] ?? {};
			if (kod && grup[kod]) { throw { isError: true, errorText: `<b>${text} Çapraz Analiz</b> işaretli iken <b class="royalblue">${kod}</b> <span class="firebrick">kolonu eklenemez</span>` } }
		}
	}
	async yukleSonrasiIslemler(e) { await super.yukleSonrasiIslemler(e); const {encUser} = this; this.user = encUser ? await app.xdec(encUser) : encUser }
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e); const {hv} = e, {adiSaha, sayacSaha} = this.class, {encUser, raporKod, aciklama} = this;
		$.extend(hv, { raportip: raporKod, xuserkod: encUser }); hv[adiSaha] = aciklama; delete hv[sayacSaha]
	}
	keySetValues(e) { super.keySetValues(e); const {rec} = e; $.extend(this, { aciklama: rec.aciklama }) }
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e, liste2HV = value => {
			if (value && typeof value == 'object' && !$.isArray(value)) { value = Object.keys(value) };
			return $.isArray(value) ? value.filter(x => !!x).map(x => x.trim()).join(delimWS) : (value?.trim() || '')
		};
		$.extend(hv, {
			raportip: this.raporKod, xuserkod: this.encUser || '', grupbelirtecler: liste2HV(this.grup), icerikbelirtecler: liste2HV(this.icerik),
			ilkxsayi: this.ozetMax, kullanim: toJSONStr(this.kullanim ?? {})
		})
	}
	setValues(e) {
		super.setValues(e); const {rec} = e, getListe = value => value ? asSet(value.split(delimWS).filter(x => !!x).map(x => x.trim())) : {};
		let kullanim; try { let {kullanim: value} = rec; if (value) { kullanim = JSON.parse(rec.kullanim) } } catch (ex) { console.error(ex) } kullanim = kullanim ?? {};
		$.extend(this, {
			encUser: rec.xuserkod || '', grup: getListe(rec.grupbelirtecler), icerik: getListe(rec.icerikbelirtecler),
			ozetMax: rec.ilkxsayi, kullanim
		})
	}
	reset(e) { $.extend(this, new this.class()); return this }
}
