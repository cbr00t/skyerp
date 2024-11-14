class SecimlerPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this } /*static get isSubPart() { return true }*/ static get isWindowPart() { return false }
	static get canDestroy() { return false } static get partName() { return 'secimler' }
	get tipBelirtec() { const {secimler, mfSinif} = this; return [secimler.class.classKey, mfSinif?.classKey].filter(x => x).join('|') }
	get rootConfig() { return app?.params?.yerel }
	get config() {
		let result = this._config; if (result === undefined) {
			let rootConfig = this.rootConfig ?? {}, baseConfig = rootConfig.secimler = rootConfig.secimler ?? {};
			const key = this.tipBelirtec ?? ''; result = this._config = baseConfig[key] = baseConfig[key] ?? {}
		}
		return result
	}
	constructor(e) {
		e = e || {}; super(e); const secimler = this.secimler = e.secimler; $.extend(this, {
			parentPart: e.parentPart ?? app.activeWndPart, layout: e.secimlerParent ?? this.layout, wnd: e.wnd,
			secimlerForm: e.secimlerForm || this.secimlerForm, islemTuslariPart: e.islemTuslariPart || this.islemTuslariPart, islemTuslari: e.islemTuslari || this.islemTuslari,
			mfSinif: e.mfSinif || secimler?.mfSinif, tamamIslemi: e.tamamIslemi,
			kolonFiltreDuzenleyici: e.kolonFiltreDuzenleyici || {}
		});
		const {mfSinif} = this, {sinifAdi} = mfSinif || {};
		this.title = e.title == null ? (( sinifAdi ? `<u style="font-size: 110%;">${sinifAdi}</u> ` : '' ) || 'Filtre Ekranı') : e.title || '';
	}
	runDevam(e) {
		e = e || {}; super.runDevam(e); const {layout} = this;
		this.header = layout.find('.header'); this.initIslemTuslari(e); this.initFiltreForm(e)
	}
	afterRun(e) {
		e = e || {}; super.afterRun(e); const {partName} = this.class, parentPartName = this.parentPart?.partName;
		const elms = [this.wnd, this.layout]; for (const elm of elms) {
			if (!elm?.length) { continue }
			elm.addClass(`${partName} with-tabs`);
			if (parentPartName) { elm.addClass(parentPartName) }
		}
		this.initTabPages(e); this.formGenelEventleriBagla(e)
	}
	initTabLayout(e) { const tabID = e.tabPage.id; switch (tabID) { case 'secimler': this.initTabLayout_secimler(e); break } }
	initTabLayout_secimler(e) {
		e = e || {}; const layout = e.secimlerParent || e.tabPage?.content || this.layout; makeScrollable(layout, evt => !(document.activeElement && document.activeElement.classList.contains('jqx-widget-content')));
		const divKolonFiltreBilgiParent = this.divKolonFiltreBilgiParent = layout.find('.secimler-kolonFiltre-bilgi-parent');
		const btnKolonFiltreTemizle = this.btnKolonFiltreTemizle = divKolonFiltreBilgiParent && divKolonFiltreBilgiParent.length ? divKolonFiltreBilgiParent.find('.kolonFiltre-temizle') : null;
		if (btnKolonFiltreTemizle?.length) { btnKolonFiltreTemizle.jqxButton({ theme }); btnKolonFiltreTemizle.on('click', evt => this.kolonFiltreTemizleIstendi($.extend({}, e, { event: evt }))) }
		const divKolonFiltreBilgi = this.divKolonFiltreBilgi = divKolonFiltreBilgiParent && divKolonFiltreBilgiParent.length ? divKolonFiltreBilgiParent.find('.kolonFiltre-bilgi') : null;
		let {secimlerForm} = e; if (!(secimlerForm && secimlerForm.length)) { secimlerForm = this.secimlerForm }
		if (!secimlerForm?.length) { secimlerForm = layout.find('.secimler-form') } if (!secimlerForm?.length) { secimlerForm = layout }
		this.secimlerForm = secimlerForm; const {secimler} = this, grup2Info = secimler.asHTMLElements, secim2Info = this.secim2Info = {};
		if (grup2Info) {
			secimlerForm.children().remove(); const docFrg = $(document.createDocumentFragment());
			for (const grupKod in grup2Info) {
				const grupBilgi = grup2Info[grupKod], grup = grupBilgi.grup || {}, key2Info = grupBilgi.key2Info || {};
				const _e = { ...e, liste: [], grupKod }; for (const {secim} of Object.values(key2Info)) { secim.ozetBilgiHTMLOlustur(_e) }
				const grupHeaderHTML = secimler.getGrupHeaderHTML(_e), divGrup = grupBilgi.element = $(
					`<div class="secim-grup" data-id="${grupKod}">` +
						`<div class="header" style="color:${grup.renk || ''};background-color:${grup.zeminRenk || ''};${grup.css}">${grupHeaderHTML}</div>` +
						`<div class="content"></div>` +
					`</div>`
				);
				const divGrupContent = divGrup.find('.content');
				for (const key in key2Info) { const secimBilgi = key2Info[key], {secim, element} = secimBilgi; if (element?.length) { element.appendTo(divGrupContent) } secim2Info[key] = secimBilgi }
				divGrup.appendTo(docFrg)
			}
			docFrg.appendTo(secimlerForm);
			for (const grupKod in grup2Info) {
				const grupBilgi = grup2Info[grupKod], {element} = grupBilgi;
				if (element?.length) {
					const {grup} = grupBilgi, {kapalimi} = grup;
					const navBar = element.jqxNavigationBar({ theme, animationType, expandMode: 'toggle', width: false, /*toggleMode: 'none',*/ expandAnimationDuration: 10, collapseAnimationDuration: 10, expandedIndexes: kapalimi ? [] : [0] });
					const navBarArrowClickHandler = evt => {
						const widget = navBar.jqxNavigationBar('getInstance'), index = 0;
						if (widget.expandedIndexes.includes(index)) { widget.collapseAt(index) } else { widget.expandAt(index) }
						const timeouts = [50, 100]; for (const timeout of timeouts) { setTimeout(() => this.onResize(e), timeout) }
					};
					navBar.find(`.jqx-expander-header-content`).off('click, mouseup, touchend')
						.on('click, mouseup, touchend', evt => {
							const {target} = evt, tagName = target.tagName.toUpperCase();
							if (!(tagName == 'INPUT' || tagName == 'TEXTAREA' || tagName == 'BUTTON' || target.classList.contains(`jqx-input-icon`))) { navBarArrowClickHandler(evt) }
						});
					navBar.on('expandedItem', event => this.onNavBarExpanded({ event, ...e })); navBar.on('collapsedItem', event => { this.onNavBarCollapsed({ event, ...e }) })
				}
			}
			const WaitMS_Ek = 0; let waitMS = 0, focusYapildimi = false;
			for (const secimBilgi of Object.values(secim2Info)) {
				const {secim, element} = secimBilgi;
				if (secim) {
					secim.initHTMLElements({ secimler: this, parent: element });
					/*setTimeout(async () => await secim.initHTMLElements({ secimler: this, parent: element }), waitMS);
					waitMS += WaitMS_Ek*/
				}
			}
			setTimeout(() => layout.blur(), 100)
		}
	}
	formGenelEventleriBagla(e) {
		const {layout} = this; let inputs = layout.find('input[type=textbox], input[type=text], input[type=number]'); if (inputs.length) { inputs.on('focus', evt => evt.target.select()) }
		/*inputs = layout.find('input'); if (inputs.length) {
			inputs.on('keyup', evt => {
				const key = (evt.key || '').toLowerCase(); if (key == 'enter' || key == 'linefeed') {
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
		const ekButonlar = [ { id: 'temizle', handler: e => this.temizleIstendi(e) } ];
		/*if (this.kolonFiltreDuzenleyici) { ekButonlar.push({ id: 'kolonFiltre', handler: e => this.kolonFiltreIstendi(e) }) }*/
		ekButonlar.push(
			{ id: 'seviyeleriAc', handler: e => this.seviyeleriAcKapatIstendi($.extend({}, e, { flag: true })) },
			{ id: 'seviyeleriKapat', handler: e => this.seviyeleriAcKapatIstendi($.extend({}, e, { flag: false })) },
			{ id: 'secimSakla', text: 'Kaydet', handler: e => this.secimSaklaIstendi(e) },
			{ id: 'secimYukle', text: 'Yükle', handler: e => this.secimYukleIstendi(e) }
		);
		const {args} = e; $.extend(args, { ekButonlarIlk: ekButonlar, ekSagButonIdSet: ['temizle'] })
	}
	initFiltreForm(e) {
		e = e || {}; const {header} = this;
		const filtreFormPart = this.filtreFormPart = new FiltreFormPart({ layout: header.find(`#filtreForm`), degisince: e => this.filtreDegisti(e) });
		filtreFormPart.run()
	}
	initTabPages(e) {
		const tabPanel = this.tabPanel = this.layout.find('#tabPanel');
		const _e = { args: { parentPart: this, builder: this.builder, layout: tabPanel } };
		this.initTabPagesArgsDuzenle(_e); (this.tabPanelPart = new TabsPart(_e.args)).run()
	}
	initTabPagesArgsDuzenle(e) {
		const {args} = e;
		$.extend(args, { theme, position: 'top', /* width: 1, */ height: false, initContent: e => { this.initTabLayout(e) } })
	}
	temizleIstendi(e) {
		e = e || {}; const {secimler, secim2Info} = this; if (!secimler) { return }
		secimler.temizle(e); if (secim2Info) {
			for (const key in secim2Info) {
				const secimBilgi = secim2Info[key], {secim, element} = secimBilgi;
				if (secim) { secim.uiSetValues({ parent: element }) }
			}
			const {secimlerForm} = this, divGrupListe = secimlerForm.find('.secim-grup');
			divGrupListe.jqxNavigationBar('expandAt', 0); setTimeout(() => divGrupListe.jqxNavigationBar('collapseAt', 0), 10)
		}
	}
	async kolonFiltreIstendi(e) {
		e = e || {}; const promise = new $.Deferred();
		const {kolonFiltreDuzenleyici} = this; if (!kolonFiltreDuzenleyici || getFuncValue.call(this, kolonFiltreDuzenleyici.uygunmu, e) === false) { return false }
		const kolonFiltrePart = new GridliKolonFiltrePart({
			duzenleyici: kolonFiltreDuzenleyici,
			tamamIslemi: e => { if (promise) { promise.resolve(e) } },
			kapaninca: e => { if (promise) { promise.reject(e) } }
		});
		kolonFiltrePart.run();
		const result = await promise, filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi || {};
		filtreBilgi.recs = result.recs; this.kolonFiltreDegisti(e)
	}
	kolonFiltreTemizleIstendi(e) {
		const {kolonFiltreDuzenleyici} = this, filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi = kolonFiltreDuzenleyici._filtreBilgi || {};
		filtreBilgi.recs = []; this.kolonFiltreDegisti(e)
	}
	kolonFiltreDegisti(e) {
		e = e || {}; const {kolonFiltreDuzenleyici, divKolonFiltreBilgi, divKolonFiltreBilgiParent} = this;
		const filtreBilgi_recs = (kolonFiltreDuzenleyici._filtreBilgi || {}).recs || []; let {filtreText} = e;
		if (filtreText == null) { filtreText = GridliKolonFiltrePart.getFiltreText(filtreBilgi_recs) }
		divKolonFiltreBilgi.html(filtreText); divKolonFiltreBilgiParent[filtreBilgi_recs.length ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	seviyeleriAcKapatIstendi(e) {
		const {flag} = e, {secimlerForm} = this; if (this.isDestroyed || !secimlerForm?.length) { return }
		const divGrupListe = secimlerForm.find('.secim-grup'); if (divGrupListe.length) {
			//secimlerForm.css('opacity', .05);
			divGrupListe.jqxNavigationBar(flag ? 'expandAt' : 'collapseAt', 0);
			if (!flag) { divGrupListe.eq(0).jqxNavigationBar('expandAt', 0) }
			//setTimeout(() => secimlerForm.css('opacity', .1), 50);
			//setTimeout(() => secimlerForm.css('opacity', 1), 100);
		}
	}
	secimSaklaIstendi(e) {
		let aciklama = prompt('Seçim Adını giriniz'); if (!aciklama) { return }
		const {config, rootConfig, secimler, mfSinif} = this; config[aciklama] = secimler.asObject; rootConfig?.kaydetDefer();
		eConfirm(`Seçim içerikleri <b class="royalblue">${aciklama}</b> ismi ile web tarayıcınızda kaydedildi`, [mfSinif?.sinifAdi, 'Seçimler'].filter(x => x).join(' '))
	}
	secimYukleIstendi(e) {
		const {tipBelirtec} = this; MQSecim.listeEkraniAc({
			args: { tipBelirtec },
			secince: e => {
				const {aciklama, icerik} = e.rec ?? {}; if (!icerik) { return }
				const {secimler, secim2Info} = this; for (const [key, _secim] of Object.entries(icerik)) {
					const secim = secimler[key]; if (!secim) { continue } $.extend(secim, _secim); 
					const {element: parent} = secim2Info[key]; if (parent) { secim.uiSetValues({ parent }) }
				}
				this.seviyeleriAcKapatIstendi({ flag: true }); eConfirm(`<b>${aciklama}</b> seçim içerikleri yüklendi`, [this.mfSinif?.sinifAdi, 'Seçimler'].filter(x => x).join(' '))
			}
		})
	}
	async tamamIstendi(e) {
		const {mfSinif, secimler} = this; let result;
		try {
			await this.tamamOncesiIslemler(e); const {tamamIslemi} = this;
			if (tamamIslemi) { const _e = $.extend({}, e, { sender: this, mfSinif, secimler }); await getFuncValue.call(this, tamamIslemi, _e) }
		}
		catch (ex) { const error = getErrorText(ex); if (error) { hConfirm(error, mfSinif?.sinifAdi || 'Filtre') } return false }
		this[this.canDestroy ? 'close' : 'hide']()
	}
	tamamOncesiIslemler(e) { }
	filtreDegisti(e) {
		e = e || {}; const {secimlerForm, filtreFormPart} = this; if (this.isDestroyed || !secimlerForm?.length) { return }
		const value = coalesce(e.value, () => filtreFormPart?.value); if (value == null) { return }
		const divGrupListe = secimlerForm.find('.secim-grup');
		const parts = value ? value.split(' ').filter(x => !!x).map(x => x.trim()) : null, {secimler} = this, divSecimListe = secimlerForm.find('.secim');
		const hasParts = !$.isEmptyObject(parts);
		if (hasParts) {
			for (let i = 0; i < divSecimListe.length; i++) {
				const divSecim = divSecimListe.eq(i), secim = secimler[divSecim.prop('id')]; if (!secim) { continue }
				const {mfSinif} = secim; let etiket = secim.etiket || mfSinif?.sinifAdi, uygunmu = !etiket;
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
		const evt = e.event, elmGrup = $(evt.currentTarget), secimElms = elmGrup.find('.content > .secim'), {secimler} = this;
		const _e = { ...e, liste: [], elmGrup }; secimler.grupOzetBilgiDuzenle(_e); this.onNavBarToggled(e)
	}
	onNavBarCollapsed(e) {
		const evt = e.event, elmGrup = $(evt.currentTarget), secimElms = elmGrup.find('.content > .secim'), {secim2Info, secimler} = this;
		const _e = { ...e, liste: [], elmGrup };
		for (let i = 0; i < secimElms.length; i++) {
			let id = secimElms.eq(i).prop('id'), item = secim2Info[id]; if (!item) { continue }
			let elm = item.element, {secim} = item; if (secim.isHidden || secim.isDisabled) { continue }
			secim.ozetBilgiHTMLOlustur(_e)
		}
		secimler.grupOzetBilgiDuzenle(_e); this.onNavBarToggled(e)
	}
	onNavBarToggled(e) { this.onResize(e) }
}
