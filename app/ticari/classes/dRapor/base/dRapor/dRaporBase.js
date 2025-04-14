class DRapor extends DMQDetayli {					/* MQCogul tabanlı rapor sınıfları için gerekli inherit desteği için DMQDetayli'dan getirildi */
	static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'dRapor' } get partName() { return this.class.partName }
	static get dRapormu() { return true } get dRapormu() { return this.class.dRapormu } static get dAltRapormu() { return false } get dAltRapormu() { return this.class.dAltRapormu }
	static get anaTip() { return null } static get araSeviyemi() { return false } static get sinifAdi() { return this.aciklama }
	static get kategoriKod() { return null } static get kod() { return null } static get aciklama() { return null } static get detaylimi() { return false }
	static get tumKolonlarGosterilirmi() { return false } static get noOverflowFlag() { return false }
	static get uygunmu() { return true } get uygunmu() { return this.class.uygunmu }
	static get raporBilgiler() {
		return Object.values(this.kod2Sinif)
			.filter(({ uygunmu, araSeviyemi, dRapormu, kod }) => uygunmu && !araSeviyemi && dRapormu && kod)
			.map(cls => ({ kod: cls.kod, aciklama: cls.aciklama, vioAdim: cls.vioAdim, cls }))
	}
	static get kod2Sinif() {
		let result = this._kod2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) {
				const {araSeviyemi, uygunmu, kod} = cls;
				if (!araSeviyemi && uygunmu && kod) { result[kod] = cls }
			}
			this._kod2Sinif = result
		}
		return result
   }
	static getClass(e) { const kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
	static async goster(e) {
		let inst = new this(e); const result = await inst.goster(); if (result == null) { return null }
		const {part} = result, {builder} = part; return { inst, part, builder }
	}
	goster(e) { return null } tazele(e) { }
	onInit(e) { } onBuildEk(e) { } onAfterRun(e) { }
}
class DRaporMQ extends DRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'mq' } static get dMQRapormu() { return true }
	goster(e) {
		e = e || {}; const args = e.args = e.args || {}; args.inst = this, result = this.class.listeEkraniAc(e); if (result == null) { return null }
		const {part} = result, {anaTip} = this.class, {partName} = this; part.layout.addClass(`${anaTip} ${partName}`);
		const {builder} = part; $.extend(this, { part, builder }); return result
	}
	tazele(e) { super.tazele(e) }
	static listeEkrani_init(e) { return e.sender.inst.onInit(e) }
	static listeEkrani_afterRun(e) { return e.sender.inst.onAfterRun(e) }
}
class DRaporOzel extends DRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'ozel' } static get dOzelRapormu() { return true }
	async goster(e) {
		e = e || {}; const inst = this, {partName} = this, {aciklama} = this.class, title = e.title ?? `<b class="royalblue">${aciklama}</b> Raporu`
		let rfb = new RootFormBuilder({ id: partName }).noDestroy().setInst(this).asWindow(title), _e = { ...e, rfb }; this.rootFormBuilderDuzenle(_e); rfb = _e.rfb;
		await this.ilkIslemler(e); await this.ilkIslemler_ek(e);
		rfb.onInit(e => this.onInit({ ...e, rfb: e.builder }));
		rfb.onBuildEk(e => this.onBuildEk({ ...e, rfb: e.builder }));
		rfb.onAfterRun(e => this.onAfterRun({ ...e, rfb: e.builder }));
		await rfb.run();
		let builder = rfb, {part} = builder, {anaTip} = this.class; part.layout.addClass(anaTip);
		$.extend(this, { part, builder }); await this.sonIslemler(e); await this.sonIslemler_ek(e);
		return ({ inst, part, builder });
	}
	async ilkIslemler(e) { } async ilkIslemler_ek(e) { this.ilkIslemler_ozel?.(e) } async sonIslemler(e) { } async sonIslemler_ek(e) { }
	rootFormBuilderDuzenle(e) {
		const {rfb} = e; this.rootBuilder = rfb;
		/* rfb.addStyle(e => `$elementCSS { overflow: hidden !important }`); */
		rfb.addIslemTuslari('islemTuslari').addCSS('islemTuslari').setTip('tazeleVazgec')
			.setButonlarDuzenleyici(e => this.islemTuslariArgsDuzenle(e)).setId2Handler(this.islemTuslariGetId2Handler(e))
		rfb.addForm('bulForm')
			.setLayout(e => $(`<div class="${e.builder.id} part"><input class="input full-wh" type="textbox" maxlength="100"></input></div>`))
			.onAfterRun(e => {
				const {builder} = e, {layout} = builder;
				let bulPart = builder.part = new FiltreFormPart({ layout, degisince: e => { const {tokens} = e; this.hizliBulIslemi({ ...e, builder, bulPart, sender: this, layout, tokens }) } });
				bulPart.run()
			})
	}
	onAfterRun(e) {
		super.onAfterRun(e); const {rfb} = e, rootPart = rfb.part; $.extend(rootPart, { builder: rfb, inst: this });
		let resizeHandler = this._resizeHandler = event => this.onResize({ ...e, event });
		rootPart.builder = rfb; rootPart.layout.prop('id', rfb.id); window.addEventListener('resize', resizeHandler)
	}
	onResize(e) { if (this.part?.isDestroyed) { window.removeEventListener('resize', this._resizeHandler); return false } }
	islemTuslariArgsDuzenle(e) { }
	islemTuslariGetId2Handler(e) { return ({ tazele: e => e.builder.inst.tazele(e), vazgec: e => e.builder.rootPart.close(e) }) }
	hizliBulIslemi(e) {
		const {bulPart} = e; clearTimeout(this._timer_hizliBulIslemi_ozel); this._timer_hizliBulIslemi_ozel = setTimeout(() => {
			try {
				const {input} = bulPart; this.hizliBulIslemi_ara(e)
				for (const delayMS of [400, 1000]) { setTimeout(() => { bulPart.focus(); setTimeout(() => { input[0].selectionStart = input[0].selectionEnd = input[0].value?.length }, 205) }, delayMS) }
				setTimeout(() => FiltreFormPart.hizliBulIslemi(e), 500)
			}
			finally { delete this._timer_hizliBulIslemi_ozel }
		}, 100)
	}
	hizliBulIslemi_ara(e) { }
	tazele(e) {
		super.tazele(e); const {builder} = e, rfb = builder.rootBuilder, parentBuilder = rfb.id2Builder.items ?? rfb;
		for (const fbd of parentBuilder.getBuilders()) { const {part} = fbd; if (part?.tazele) { part.tazele(e) } if (part?.dataBind) { part.dataBind(e) } }
	}
	super_tazele(e) { super.tazele(e) }
}
class DPanelRapor extends DRaporOzel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dPanelRapormu() { return true }
	static get anaTip() { return 'panel' } static get sabitmi() { return false }
	static get ozetVarmi() { return !this.sabitmi } static get chartVarmi() { return !this.sabitmi }
	get main() { return this.id2AltRapor?.main }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { id2AltRapor: e.id2AltRapor, altRapor_lastZIndex: 100 });
		if (this.id2AltRapor == null) { this.clear(); this.altRaporlarDuzenle(e) }
	}
	rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {rfb} = e, {id2AltRapor} = this, {noOverflowFlag, kod} = this.class;
		let form = e.rfb_items = this.rfb_items = rfb.addForm('items').setLayout(e => $(`<div id="${e.builder.id}" class="${kod ? `${kod} ` : ''}full-wh"></div>`));
		if (noOverflowFlag) { form.addCSS('no-overflow') }
		for (const [id, altRapor] of Object.entries(id2AltRapor)) {
			const raporAdi = altRapor.class.aciklama ?? '';
			let fbd = altRapor.parentBuilder = form.addForm(id).addCSS('item').addStyle_fullWH()
				.setLayout(e => $(`<div class="${id}"><label>${raporAdi || ''}</label></div>`))
				.addStyle(e => `$elementCSS { overflow: hidden !important; z-index: ${this.altRapor_lastZIndex++} !important }`);
			let _e = { ...e, id, builder: fbd }; altRapor.subFormBuilderDuzenle(_e);
			let {width, height} = altRapor; if (width || height) { fbd.addStyle_wh(width, height) }
			altRapor.rootFormBuilderDuzenle(e)
		}
	}
	async ilkIslemler(e) {
		await super.ilkIslemler(e); let {id2AltRapor} = this;
		for (let altRapor of Object.values(id2AltRapor)) { await altRapor.ilkIslemler?.(e) }
	}
	async ilkIslemler_ek(e) {
		await super.ilkIslemler_ek(e); let {id2AltRapor} = this;
		for (let altRapor of Object.values(id2AltRapor)) { await altRapor.ilkIslemler_ek?.(e) }
	}
	async sonIslemler(e) {
		await super.sonIslemler(e); let {id2AltRapor} = this;
		for (let altRapor of Object.values(id2AltRapor)) { await altRapor.sonIslemler?.(e) }
	}
	async sonIslemler_ek(e) {
		await super.sonIslemler_ek(e); let {id2AltRapor} = this;
		for (let altRapor of Object.values(id2AltRapor)) { await altRapor.sonIslemler_ek?.(e) }
	}
	onAfterRun(e) {
		super.onAfterRun(e); const {rfb} = e, {layout: itemsLayout} = rfb.id2Builder.items, itemSelector = '.item', focusSelector = 'hasFocus';
		const elmSubItems = itemsLayout.children(itemSelector); elmSubItems.eq(0).addClass(focusSelector);
		elmSubItems.on('click', evt => {
			const itemLayout = $(evt.currentTarget);
			itemLayout.parent().children(itemSelector).removeClass(focusSelector);
			itemLayout.addClass(focusSelector)
		})
	}
	onResize(e) {
		if (super.onResize(e) === false) { return false }
		const {id2AltRapor} = this; if (!id2AltRapor) { return }
		for (const altRapor of Object.values(id2AltRapor)) { altRapor?.onResize?.(e) }
	}
	altRaporlarDuzenle(e) { }
	tazele(e) {
		super.super_tazele(e); const {id2AltRapor} = this, {main} = id2AltRapor, {gridPart: mainGridPart} = main ?? {};
		for (const altRapor of Object.values(id2AltRapor)) {
			if (!altRapor?.tazeleYapilirmi) { continue }
			if (mainGridPart && altRapor != main) {
				let {mainmi} = altRapor.class, {gridPart} = altRapor;
				if (mainmi && gridPart) { gridPart.filtreTokens = mainGridPart.filtreTokens }
			}
			altRapor.tazele?.(e)
		}
	}
	hizliBulIslemi_ara(e) {
		super.hizliBulIslemi_ara(e); const {tokens} = e, {main} = this;
		for (const altRapor of [main]) {
			if (!altRapor.fbd_grid) { continue }
			let {part: gridPart} = altRapor.fbd_grid; gridPart.filtreTokens = tokens;
			this.tazele({ action: 'hizliBul' })
		}
	}
	add(...items) {
		const {id2AltRapor} = this; for (const item of items) {
			if (item == null) { continue } if ($.isArray(item)) { this.add(...item); continue } 
			let id, altRapor; if ($.isPlainObject(item)) { id = item.id; altRapor = item.altRapor ?? item.rapor } else { altRapor = item }
			if (isClass(altRapor)) { altRapor = new altRapor({ rapor: this }) }
			if (altRapor == null) { continue } if (!id) { id = altRapor.class.kod || newGUID() }
			altRapor.rapor = this; id2AltRapor[id] = altRapor
		} return this
	}
	clear() { this.id2AltRapor = {}; return this }
}
class DGrupluPanelRapor extends DPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get dGrupluPanelRapormu() { return true }
	static get noOverflowFlag() { return true } static get altRaporClassPrefix() { return null }
	altRaporlarDuzenle(e) {
		super.altRaporlarDuzenle(e); let {altRaporClassPrefix: prefix, ozetVarmi, chartVarmi} = this.class;
		if (prefix) {
			const postfixes = ['_Main'/*, '_Ozet', '_Chart', '_Diagram'*/], classes = postfixes.map(postfix => window[prefix + postfix]).filter(cls => !!cls);
			this.add(...classes)
		}
		if (ozetVarmi) { this.add(DAltRapor_Grid_Ozet) }
		if (chartVarmi) { this.add(DAltRapor_Chart) }
	}
	islemTuslariArgsDuzenle(e) {
		super.islemTuslariArgsDuzenle(e); let {liste} = e, {sabitmi} = this.class;
		liste.push(...[
			(sabitmi ? null : { id: 'raporTanim', text: 'Rapor Tanım', handler: _e => this.main.raporTanimIstendi({ ...e, ..._e }) }),
			{ id: 'secimler', text: '', handler: _e => this.main.secimlerIstendi({ ...e, ..._e }) },
			{ id: 'seviyeAc', text: 'Seviye Aç', handler: _e => this.seviyeAcIstendi({ ...e, ..._e }) },
			{ id: 'seviyeKapat', text: 'Seviye Kapat', handler: _e => this.seviyeKapatIstendi({ ...e, ..._e }) },
			{ id: 'excel', text: '', handler: _e => this.exportExcelIstendi({ ...e, ..._e }) },
			/*{ id: 'pdf', text: '', handler: _e => this.exportPDFIstendi({ ...e, ..._e }) },*/
			{ id: 'html', text: '', handler: _e => this.exportHTMLIstendi({ ...e, ..._e }) }
		].filter(x => !!x))
	}
	seviyeAcIstendi(e) { for (let altRapor of Object.values(this.id2AltRapor)) { altRapor?.seviyeAcIstendi?.(e) }; return this }
	seviyeKapatIstendi(e) { for (let altRapor of Object.values(this.id2AltRapor)) { altRapor?.seviyeKapatIstendi?.(e) }; return this }
	exportExcelIstendi(e) { for (let altRapor of Object.values(this.id2AltRapor)) { altRapor?.exportExcelIstendi?.(e) }; return this }
	exportPDFIstendi(e) { for (let altRapor of Object.values(this.id2AltRapor)) { altRapor?.exportPDFIstendi?.(e) }; return this }
	exportHTMLIstendi(e) { for (let altRapor of Object.values(this.id2AltRapor)) { altRapor?.exportHTMLIstendi?.(e) }; return this }
}
