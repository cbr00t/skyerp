class SecimlerPart extends Part {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get isSubPart() { return true } static get isWindowPart() { return false }
	static get canDestroy() { return false } static get partName() { return 'secimler' }

	constructor(e) {
		e = e || {}; super(e); const secimler = this.secimler = e.secimler;
		$.extend(this, {
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
		e = e || {}; super.afterRun(e); const {partName} = this.class;
		const elms = [this.wnd, this.layout];
		for (const elm of elms) { if (elm?.length) { elm.addClass(`${partName} with-tabs`) } }
		this.initTabPages(e); this.formGenelEventleriBagla(e)
	}
	initTabLayout(e) {
		const tabID = e.tabPage.id;
		switch (tabID) { case 'secimler': this.initTabLayout_secimler(e); break }
	}
	initTabLayout_secimler(e) {
		e = e || {}; const layout = e.secimlerParent || (e.tabPage || {}).content || this.layout; makeScrollable(layout);
		const divKolonFiltreBilgiParent = this.divKolonFiltreBilgiParent = layout.find('.secimler-kolonFiltre-bilgi-parent');
		const btnKolonFiltreTemizle = this.btnKolonFiltreTemizle = divKolonFiltreBilgiParent && divKolonFiltreBilgiParent.length ? divKolonFiltreBilgiParent.find('.kolonFiltre-temizle') : null;
		if (btnKolonFiltreTemizle?.length) { btnKolonFiltreTemizle.jqxButton({ theme }); btnKolonFiltreTemizle.on('click', evt => this.kolonFiltreTemizleIstendi($.extend({}, e, { event: evt }))) }
		const divKolonFiltreBilgi = this.divKolonFiltreBilgi = divKolonFiltreBilgiParent && divKolonFiltreBilgiParent.length ? divKolonFiltreBilgiParent.find('.kolonFiltre-bilgi') : null;
		let {secimlerForm} = e; if (!(secimlerForm && secimlerForm.length)) secimlerForm = this.secimlerForm
		if (!(secimlerForm && secimlerForm.length)) secimlerForm = layout.find('.secimler-form');
		if (!(secimlerForm && secimlerForm.length)) secimlerForm = layout
		this.secimlerForm = secimlerForm;
		const {secimler} = this, grup2Info = secimler.asHTMLElements, secim2Info = this.secim2Info = {};
		if (grup2Info) {
			secimlerForm.children().remove();
			const docFrg = $(document.createDocumentFragment());
			for (const grupKod in grup2Info) {
				const grupBilgi = grup2Info[grupKod], grup = grupBilgi.grup || {}, grupAciklama = grup.aciklama || '', key2Info = grupBilgi.key2Info || {};
				const divGrup = grupBilgi.element = $(
					`<div class="secim-grup" data-id="${grupKod}">` +
						`<div class="header" style="color:${grup.renk || ''};background-color:${grup.zeminRenk || ''};${grup.css}">${grupAciklama}</div>` +
						`<div class="content"></div>` +
						// `<div class="content" style="border: .5px solid ${grup.renk || '#aaa'};"></div>` +
					`</div>`
				);
				const divGrupContent = divGrup.find('.content');
				for (const key in key2Info) {
					const secimBilgi = key2Info[key];
					const {secim, element} = secimBilgi; if (element?.length) { element.appendTo(divGrupContent) }
					secim2Info[key] = secimBilgi
				}
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
					navBar.on('expandedItem', evt => this.onResize(e));
					navBar.on('collapsedItem', evt => this.onResize(e))
				}
			}
			const WaitMS_Ek = 0; let waitMS = 0, focusYapildimi = false;
			for (const secimBilgi of Object.values(secim2Info)) {
				const {secim, element} = secimBilgi;
				if (secim) {
					setTimeout(async () => {
						await secim.initHTMLElements({ secimler: this, parent: element });
						if (!focusYapildimi) { const input = element.find('input:eq(0)'); if (input.length) { setTimeout(() => input.focus(), 100); focusYapildimi = true } }
					}, waitMS);
					waitMS += WaitMS_Ek
				}
			}
		}
	}

	formGenelEventleriBagla(e) {
		const {layout} = this;
		let inputs = layout.find('input[type=textbox], input[type=text], input[type=number]');
		if (inputs.length) { inputs.on('focus', evt => evt.target.select()); }
		inputs = layout.find('input'); if (inputs.length) { inputs.on('keyup', evt => { const key = (evt.key || '').toLowerCase(); if (key == 'enter' || key == 'linefeed') { this.tamamIstendi(e) } }) }
	}
	initIslemTuslari(e) {
		e = e || {};
		let {islemTuslariPart} = this;
		if (!islemTuslariPart) {
			let {header} = e; if (!(header && header.length)) header = this.header
			let {islemTuslari} = e; if (!(islemTuslari && islemTuslari.length)) islemTuslari = this.islemTuslari
			if (!islemTuslari?.length) islemTuslari = this.islemTuslari = header.find('.islemTuslari')
			if (islemTuslari?.length) {
				let _e = { args: { sender: this, layout: islemTuslari } }; if (this.islemTuslariArgsDuzenle(_e) === false) { return null }
				islemTuslariPart = this.islemTuslariPart = new ButonlarPart(_e.args); islemTuslariPart.run()
			}
		}
		return islemTuslariPart
	}
	islemTuslariArgsDuzenle(e) {
		const ekButonlar = [ { id: 'temizle', handler: e => this.temizleIstendi(e) } ];
		if (this.kolonFiltreDuzenleyici) { ekButonlar.push({ id: 'kolonFiltre', handler: e => this.kolonFiltreIstendi(e) }) }
		ekButonlar.push(
			{ id: 'seviyeleriAc', handler: e => this.seviyeleriAcKapatIstendi($.extend({}, e, { flag: true })) },
			{ id: 'seviyeleriKapat', handler: e => this.seviyeleriAcKapatIstendi($.extend({}, e, { flag: false })) }
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
		e = e || {}; const {secimler, secim2Info} = this;
		if (!secimler) { return } secimler.temizle(e);
		if (secim2Info) {
			for (const key in secim2Info) {
				const secimBilgi = secim2Info[key], {secim, element} = secimBilgi;
				if (secim) { secim.uiSetValues({ parent: element }) }
			}
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
		if (filtreText == null) filtreText = GridliKolonFiltrePart.getFiltreText(filtreBilgi_recs);
		divKolonFiltreBilgi.html(filtreText);
		divKolonFiltreBilgiParent[filtreBilgi_recs.length ? 'removeClass' : 'addClass']('jqx-hidden')
	}
	seviyeleriAcKapatIstendi(e) {
		const {flag} = e, {secimlerForm} = this;
		if (this.isDestroyed || !(secimlerForm && secimlerForm.length)) return
		const divGrupListe = secimlerForm.find('.secim-grup');
		if (divGrupListe.length) {
			//secimlerForm.css('opacity', .05);
			divGrupListe.jqxNavigationBar(flag ? 'expandAt' : 'collapseAt', 0);
			//setTimeout(() => secimlerForm.css('opacity', .1), 50);
			//setTimeout(() => secimlerForm.css('opacity', 1), 100);
		}
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
		e = e || {}; const {secimlerForm} = this; if (this.isDestroyed || !(secimlerForm && secimlerForm.length)) { return }
		const value = coalesce(e.value, () => (this.filtreFormPart || {}).value); if (value == null) { return }
		const divGrupListe = secimlerForm.find('.secim-grup'); if (divGrupListe.length) { divGrupListe.jqxNavigationBar('expandAt', 0) }
		const parts = value ? value.split(' ').filter(x => !!x).map(x => x.trim()) : null, {secimler} = this, divSecimListe = secimlerForm.find('.secim');
		if ($.isEmptyObject(parts)) { divSecimListe.removeClass('jqx-hidden basic-hidden') }
		else {
			for (let i = 0; i < divSecimListe.length; i++) {
				const divSecim = divSecimListe.eq(i), secim = secimler[divSecim.prop('id')]; if (!secim) { continue }
				const {mfSinif} = secim; let etiket = secim.etiket || mfSinif?.sinifAdi, uygunmu = !etiket;
				if (!uygunmu) {
					uygunmu = true; etiket = etiket.toLocaleUpperCase(culture);
					for (let part of parts) { part = part.toLocaleUpperCase(culture); if (!etiket.includes(part)) { uygunmu = false; break } }
				}
				if (uygunmu) { divSecim.removeClass('jqx-hidden basic-hidden') } else { divSecim.addClass('jqx-hidden') }
			}
		}
	}
}
