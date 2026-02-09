class SecimlerPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this } /*static get isSubPart() { return true }*/ static get isWindowPart() { return false }
	static get canDestroy() { return false } static get partName() { return 'secimler' }
	get tipBelirtec() { let {secimler, mfSinif} = this; return [secimler.class.classKey, mfSinif?.classKey].filter(x => x).join('|') }
	get rootConfig() { return app?.params?.yerel }
	get config() {
		let result = this._config; if (result === undefined) {
			let rootConfig = this.rootConfig ?? {}, baseConfig = rootConfig.secimler = rootConfig.secimler ?? {};
			let key = this.tipBelirtec ?? ''; result = this._config = baseConfig[key] = baseConfig[key] ?? {}
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e); let secimler = this.secimler = e.secimler; $.extend(this, {
			parentPart: e.parentPart ?? app.activeWndPart, layout: e.secimlerParent ?? this.layout, wnd: e.wnd,
			secimlerForm: e.secimlerForm || this.secimlerForm, islemTuslariPart: e.islemTuslariPart || this.islemTuslariPart, islemTuslari: e.islemTuslari || this.islemTuslari,
			mfSinif: e.mfSinif || secimler?.mfSinif, tamamIslemi: e.tamamIslemi,
			kolonFiltreDuzenleyici: e.kolonFiltreDuzenleyici || {}
		});
		let {mfSinif} = this, {sinifAdi} = mfSinif || {};
		this.title = e.title == null ? (( sinifAdi ? `<u style="font-size: 110%;">${sinifAdi}</u> ` : '' ) || 'Filtre Ekranı') : e.title || '';
	}
	runDevam(e = {}) {
		super.runDevam(e); let {layout} = this
		this.header = layout.find('.header')
		this.initIslemTuslari(e); this.initFiltreForm(e)
	}
	afterRun(e = {}) {
		super.afterRun(e)
		let {partName} = this.class
		let parentPartName = this.parentPart?.partName
		let elms = [this.wnd, this.layout]; for (let elm of elms) {
			if (!elm?.length)
				continue
			let ignorePartName = 'modelTanim'
			if (partName != ignorePartName)
				elm.addClass(partName)
			elm.addClass('with-tabs')
			if (parentPartName && parentPartName != ignorePartName)
				elm.addClass(parentPartName)
		}
		this.initTabPages(e); this.formGenelEventleriBagla(e)
	}
	initTabLayout(e) { let tabID = e.tabPage.id; switch (tabID) { case 'secimler': this.initTabLayout_secimler(e); break } }
	initTabLayout_secimler(e) {
		e = e || {}; let layout = e.secimlerParent || e.tabPage?.content || this.layout; makeScrollable(layout, evt => !(document.activeElement && document.activeElement.classList.contains('jqx-widget-content')));
		let divKolonFiltreBilgiParent = this.divKolonFiltreBilgiParent = layout.find('.secimler-kolonFiltre-bilgi-parent');
		let btnKolonFiltreTemizle = this.btnKolonFiltreTemizle = divKolonFiltreBilgiParent && divKolonFiltreBilgiParent.length ? divKolonFiltreBilgiParent.find('.kolonFiltre-temizle') : null;
		if (btnKolonFiltreTemizle?.length) { btnKolonFiltreTemizle.jqxButton({ theme }); btnKolonFiltreTemizle.on('click', evt => this.kolonFiltreTemizleIstendi($.extend({}, e, { event: evt }))) }
		let divKolonFiltreBilgi = this.divKolonFiltreBilgi = divKolonFiltreBilgiParent && divKolonFiltreBilgiParent.length ? divKolonFiltreBilgiParent.find('.kolonFiltre-bilgi') : null;
		let {secimlerForm} = e; if (!(secimlerForm && secimlerForm.length)) { secimlerForm = this.secimlerForm }
		if (!secimlerForm?.length) { secimlerForm = layout.find('.secimler-form') }
		if (!secimlerForm?.length) { secimlerForm = layout }
		this.secimlerForm = secimlerForm
		let {secimler} = this, {asHTMLElements: grup2Info} = secimler, secim2Info = this.secim2Info = {}
		if (grup2Info) {
			secimlerForm.children().remove()
			let docFrg = $(document.createDocumentFragment());
			for (let [grupKod, grupBilgi] of entries(grup2Info)) {
				grupKod = grupKod ?? '';
				let grup = grupBilgi.grup || {}, key2Info = grupBilgi.key2Info || {};
				let _e = { ...e, liste: [], grupKod }; for (let {secim} of Object.values(key2Info)) { secim.ozetBilgiHTMLOlustur(_e) }
				let grupHeaderHTML = secimler.getGrupHeaderHTML(_e) ?? '', divGrup = grupBilgi.element = $(
					`<div class="secim-grup" data-id="${grupKod}">` +
						`<div class="header" style="color:${grup.renk || ''};background-color:${grup.zeminRenk || ''};${grup.css}">${grupHeaderHTML}</div>` +
						`<div class="content"></div>` +
					`</div>`
				)
				let divGrupContent = divGrup.find('.content')
				for (let [key, secimBilgi] of entries(key2Info)) {
					let {secim, element} = secimBilgi
					if (element?.length)
						element.appendTo(divGrupContent)
					secim2Info[key] = secimBilgi
				}
				divGrup.appendTo(docFrg)
			}
			docFrg.appendTo(secimlerForm);
			for (let [grupKod, grupBilgi] of entries(grup2Info)) {
				let {element} = grupBilgi
				if (!element?.length)
					continue
				let {grup} = grupBilgi, {kapalimi} = grup
				let navBar = element.jqxNavigationBar({
					theme, animationType, expandMode: 'toggle', width: false, /*toggleMode: 'none',*/
					expandAnimationDuration: 10, collapseAnimationDuration: 10, expandedIndexes: kapalimi ? [] : [0]
				});
				let navBarArrowClickHandler = evt => {
					let index = 0, widget = navBar.jqxNavigationBar('getInstance');
					if (widget.expandedIndexes.includes(index)) { widget.collapseAt(index) } else { widget.expandAt(index) }
					for (let timeout of [50, 100]) { setTimeout(() => this.onResize(e), timeout) }
				};
				navBar.find(`.jqx-expander-header-content`).off('click, mouseup, touchend')
					.on('click, mouseup, touchend', evt => {
						let {target} = evt, tagName = target.tagName.toUpperCase();
						if (!(tagName == 'INPUT' || tagName == 'TEXTAREA' ||
							  tagName == 'BUTTON' || target.classList.contains(`jqx-input-icon`))) {
							navBarArrowClickHandler(evt)
						}
					});
				navBar.on('expandedItem', event => this.onNavBarExpanded({ event, ...e }));
				navBar.on('collapsedItem', event => { this.onNavBarCollapsed({ event, ...e }) })
			}
			let WaitMS_Ek = 0, waitMS = 0, focusYapildimi = false
			let _e = { ...e, sender: this, part: this, secim2Info };
			secimler?.initHTMLElements(_e)
			// setTimeout(() => layout.blur(), 100)
		}
	}
	formGenelEventleriBagla(e) {
		let {layout} = this; let inputs = layout.find('input[type=textbox], input[type=text], input[type=number]'); if (inputs.length) { inputs.on('focus', evt => evt.target.select()) }
		/*inputs = layout.find('input'); if (inputs.length) {
			inputs.on('keyup', evt => {
				let key = (evt.key || '').toLowerCase(); if (key == 'enter' || key == 'linefeed') {
					let elm = document.activeElement;
					if (!(elm && $(elm).parents('.filtreForm.part')?.length)) { this.tamamIstendi(e) }
				}
			})
		}*/
	}
	initIslemTuslari(e) {
		e = e || {}; let {islemTuslariPart} = this;
		if (!islemTuslariPart) {
			let {header} = e; if (!header?.length) { header = this.header } let {islemTuslari} = e; if (!islemTuslari?.length) { islemTuslari = this.islemTuslari }
			if (!islemTuslari?.length) { islemTuslari = this.islemTuslari = header.find('.islemTuslari') }
			if (islemTuslari?.length) {
				let _e = { args: { sender: this, layout: islemTuslari } }; if (this.islemTuslariArgsDuzenle(_e) === false) { return null }
				islemTuslariPart = this.islemTuslariPart = new ButonlarPart(_e.args); islemTuslariPart.run()
			}
		}
		return islemTuslariPart
	}
	islemTuslariArgsDuzenle(e) {
		let ekButonlar = [ { id: 'temizle', handler: e => this.temizleIstendi(e) } ];
		/*if (this.kolonFiltreDuzenleyici) { ekButonlar.push({ id: 'kolonFiltre', handler: e => this.kolonFiltreIstendi(e) }) }*/
		ekButonlar.push(
			{ id: 'seviyeleriAc', handler: e => this.seviyeleriAcKapatIstendi($.extend({}, e, { flag: true })) },
			{ id: 'seviyeleriKapat', handler: e => this.seviyeleriAcKapatIstendi($.extend({}, e, { flag: false })) },
			{ id: 'secimSakla', text: 'Kaydet', handler: e => this.secimSaklaIstendi(e) },
			{ id: 'secimYukle', text: 'Yükle', handler: e => this.secimYukleIstendi(e) }
		);
		let {args} = e; $.extend(args, { ekButonlarIlk: ekButonlar, ekSagButonIdSet: ['temizle'] })
	}
	initFiltreForm(e) {
		e = e || {}; let {header} = this;
		let filtreFormPart = this.filtreFormPart = new FiltreFormPart({ layout: header.find(`#filtreForm`), degisince: e => this.filtreDegisti(e) });
		filtreFormPart.run()
	}
	initTabPages(e) {
		let tabPanel = this.tabPanel = this.layout.find('#tabPanel');
		let _e = { args: { parentPart: this, builder: this.builder, layout: tabPanel } };
		this.initTabPagesArgsDuzenle(_e); (this.tabPanelPart = new TabsPart(_e.args)).run()
	}
	initTabPagesArgsDuzenle(e) {
		let {args} = e;
		$.extend(args, { theme, position: 'top', /* width: 1, */ height: false, initContent: e => { this.initTabLayout(e) } })
	}
	temizleIstendi(e) {
		e = e || {}; let {secimler, secim2Info} = this; if (!secimler) { return }
		secimler.temizle(e); if (secim2Info) {
			for (let key in secim2Info) {
				let secimBilgi = secim2Info[key], {secim, element} = secimBilgi;
				if (secim) { secim.uiSetValues({ parent: element }) }
			}
			let {secimlerForm} = this, divGrupListe = secimlerForm.find('.secim-grup')
			if (divGrupListe?.length) {
				divGrupListe.jqxNavigationBar('expandAt', 0)
				setTimeout(() => divGrupListe.jqxNavigationBar('collapseAt', 0), 10)
			}
		}
	}
	async kolonFiltreIstendi(e) {
		e = e || {}; let promise = new $.Deferred();
		let {kolonFiltreDuzenleyici} = this; if (!kolonFiltreDuzenleyici || getFuncValue.call(this, kolonFiltreDuzenleyici.uygunmu, e) === false) { return false }
		let kolonFiltrePart = new GridliKolonFiltrePart({
			duzenleyici: kolonFiltreDuzenleyici,
			tamamIslemi: e => { if (promise) { promise.resolve(e) } },
			kapaninca: e => { if (promise) { promise.reject(e) } }
		});
		kolonFiltrePart.run();
		let result = await promise, filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi || {};
		filtreBilgi.recs = result.recs; this.kolonFiltreDegisti(e)
	}
	kolonFiltreTemizleIstendi(e) {
		let {kolonFiltreDuzenleyici} = this, filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi || {};
		filtreBilgi.recs = []; this.kolonFiltreDegisti(e)
	}
	kolonFiltreDegisti(e) {
		e = e || {}; let {kolonFiltreDuzenleyici, divKolonFiltreBilgi, divKolonFiltreBilgiParent} = this;
		let filtreBilgi_recs = (kolonFiltreDuzenleyici._filtreBilgi || {}).recs || []; let {filtreText} = e;
		if (filtreText == null) { filtreText = GridliKolonFiltrePart.getFiltreText(filtreBilgi_recs) }
		divKolonFiltreBilgi.html(filtreText); divKolonFiltreBilgiParent[filtreBilgi_recs.length ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	seviyeleriAcKapatIstendi(e) {
		let {flag} = e, {secimlerForm} = this; if (this.isDestroyed || !secimlerForm?.length) { return }
		let divGrupListe = secimlerForm.find('.secim-grup'); if (divGrupListe.length) {
			divGrupListe.jqxNavigationBar(flag ? 'expandAt' : 'collapseAt', 0);
			if (!flag) { divGrupListe.eq(0).jqxNavigationBar('expandAt', 0) }
		}
	}
	secimSaklaIstendi(e) {
		let aciklama = prompt('Seçim Adını giriniz')
		if (!aciklama) { return }
		let {config, rootConfig, secimler, mfSinif} = this
		config[aciklama] = secimler.asObject
		rootConfig?.kaydetDefer()
		eConfirm(`Seçim içerikleri <b class="royalblue">${aciklama}</b> ismi ile web tarayıcınızda kaydedildi`, [mfSinif?.sinifAdi, 'Seçimler'].filter(x => x).join(' '))
	}
	secimYukleIstendi(e) {
		let {tipBelirtec} = this
		MQSecim.listeEkraniAc({
			args: { tipBelirtec },
			secince: e => {
				let {aciklama, icerik} = e.rec ?? {}
				if (!icerik) { return }
				let {secimler, secim2Info} = this
				for (let [key, _secim] of Object.entries(icerik)) {
					let secim = secimler[key]
					if (!secim)
						continue
					secim.temizle()
					if (_secim.birKismimi !== undefined) {
						_secim.hepsimi = !_secim.birKismimi
						delete _secim.birKismimi
					}
					$.extend(secim, _secim)
					let {element: parent} = secim2Info[key]
					if (parent)
						secim.uiSetValues({ parent })
				}
				this.seviyeleriAcKapatIstendi({ flag: true }) /* eConfirm(`<b>${aciklama}</b> seçim içerikleri yüklendi`, [this.mfSinif?.sinifAdi, 'Seçimler'].filter(x => x).join(' ')) */
			}
		})
	}
	async tamamIstendi(e) {
		let {mfSinif, secimler, tamamIslemi} = this, result
		try {
			await this.tamamOncesiIslemler(e)
			if (tamamIslemi) {
				let _e = { ...e, sender: this, mfSinif, secimler }
				await tamamIslemi.call(this, _e)
			}
		}
		catch (ex) {
			let error = getErrorText(ex)
			if (error) { hConfirm(error, mfSinif?.sinifAdi || 'Filtre') }
			// throw ex
			return false
		}
		this[this.canDestroy ? 'close' : 'hide']()
	}
	tamamOncesiIslemler(e) { }
	filtreDegisti(e) {
		e = e || {}; let {secimlerForm, filtreFormPart} = this; if (this.isDestroyed || !secimlerForm?.length) { return }
		let value = coalesce(e.value, () => filtreFormPart?.value); if (value == null) { return }
		let divGrupListe = secimlerForm.find('.secim-grup');
		let parts = value ? value.split(' ').filter(x => !!x).map(x => x.trim()) : null, {secimler} = this, divSecimListe = secimlerForm.find('.secim');
		let hasParts = !$.isEmptyObject(parts);
		if (hasParts) {
			for (let i = 0; i < divSecimListe.length; i++) {
				let divSecim = divSecimListe.eq(i), secim = secimler[divSecim.prop('id')]; if (!secim) { continue }
				let {mfSinif} = secim; let etiket = secim.etiket || mfSinif?.sinifAdi, uygunmu = !etiket;
				let divGrup = divSecim.parent('.content').prev('.header'), grupEtiket = divGrup?.children('.jqx-expander-header-content')?.text();
				if (!uygunmu) {
					uygunmu = true; for (let part of parts) {
						if (!(etiket.toLocaleUpperCase(culture).includes(part.toLocaleUpperCase(culture)) || etiket.toUpperCase().includes(part.toUpperCase()))) { uygunmu = false }
						if (!uygunmu && grupEtiket) { uygunmu = grupEtiket.toLocaleUpperCase(culture).includes(part.toLocaleUpperCase(culture)) || grupEtiket.toUpperCase().includes(part.toUpperCase()) }
						if (!uygunmu) { break }
					}
				}
				if (uygunmu) { divSecim.removeClass('jqx-hidden basic-hidden') } else { divSecim.addClass('jqx-hidden') }
			}
		}
		else { divSecimListe.removeClass('jqx-hidden basic-hidden') }
		if (divGrupListe.length) {
			divGrupListe.jqxNavigationBar(hasParts ? 'expandAt' : 'collapseAt', 0);
			if (!hasParts) { setTimeout(() => divGrupListe.eq(0).jqxNavigationBar('expandAt', 0), 1) }
		}
	}
	onNavBarExpanded(e) {
		let evt = e.event, elmGrup = $(evt.currentTarget), secimElms = elmGrup.find('.content > .secim'), {secimler} = this;
		let _e = { ...e, liste: [], elmGrup }; secimler.grupOzetBilgiDuzenle(_e); this.onNavBarToggled(e)
	}
	onNavBarCollapsed(e) {
		let {event: evt} = e, elmGrup = $(evt.currentTarget), secimElms = elmGrup.find('.content > .secim');
		let {secim2Info, secimler} = this, _e = { ...e, liste: [], elmGrup };
		for (let i = 0; i < secimElms.length; i++) {
			let id = secimElms.eq(i).prop('id'), item = secim2Info[id]; if (!item) { continue }
			let elm = item.element, {secim} = item
			if (secim.isHidden || secim.isDisabled) { continue }
			secim.ozetBilgiHTMLOlustur(_e)
		}
		secimler.grupOzetBilgiDuzenle(_e); this.onNavBarToggled(e)
	}
	onNavBarToggled(e) { this.onResize(e) }
}
