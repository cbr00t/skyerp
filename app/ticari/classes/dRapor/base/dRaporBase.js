class DRapor extends DMQDetayliOrtak {				/* MQCogul tabanlı rapor sınıfları için gerekli inherit desteği için MQDetayliOrtak'dan getirildi */
	static { window[this.name] = this; this._key2Class[this.name] = this } static get partName() { return 'dRapor' } get partName() { return this.class.partName }
	static get anaTip() { return null } static get araSeviyemi() { return false } static get tumKolonlarGosterilirmi() { return false }
	static get dRapormu() { return true } get dRapormu() { return this.class.dRapormu } static get dAltRapormu() { return false } get dAltRapormu() { return this.class.dAltRapormu }
	static get kod() { return null } static get aciklama() { return null } static get detaylimi() { return false } static get sinifAdi() { return this.aciklama }
	static get kod2Sinif() {
		let result = this._kod2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, kod} = cls; if (!araSeviyemi && kod) { result[kod] = cls } }
			this._kod2Sinif = result
		}
		return result
   }
	static getClass(e) { const kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
	static goster(e) {
		let inst = new this(e); const result = inst.goster(); if (result == null) { return null }
		const {part} = result, {builder} = part; return { inst, part, builder }
	}
	goster(e) { return null } tazele(e) { }
	onInit(e) { } onBuildEk(e) { } onAfterRun(e) { }
}
class DMQRapor extends DRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'mq' } static get dMQRapormu() { return true }
	goster(e) {
		e = e || {}; const args = e.args = e.args || {}; args.inst = this, result = this.class.listeEkraniAc(e); if (result == null) { return null }
		const {part} = result, {anaTip} = this.class, {partName} = this; part.layout.addClass(`${anaTip} ${partName}`); const {builder} = part; $.extend(this, { part, builder }); return result
	}
	tazele(e) { super.tazele(e) }
	static listeEkrani_init(e) { return e.sender.inst.onInit(e) }
	static listeEkrani_afterRun(e) { return e.sender.inst.onAfterRun(e) }
}
class DOzelRapor extends DRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'ozel' } static get dOzelrapormu() { return true }
	goster(e) {
		e = e || {}; const inst = this, {partName} = this, {aciklama} = this.class, title = e.title ?? `<b class="royalblue">${aciklama}</b> Raporu`
		let rfb = new RootFormBuilder({ id: partName }).setInst(this).asWindow(title), _e = { ...e, rfb }; this.rootFormBuilderDuzenle(_e); rfb = _e.rfb;
		rfb.onInit(e => this.onInit({ ...e, rfb: e.builder })); rfb.onBuildEk(e => this.onBuildEk({ ...e, rfb: e.builder })); rfb.onAfterRun(e => this.onAfterRun({ ...e, rfb: e.builder }));
		rfb.run(); const builder = rfb, {part} = builder, {anaTip} = this.class; part.layout.addClass(anaTip);
		$.extend(this, { part, builder }); return ({ inst, part, builder })
	}
	rootFormBuilderDuzenle(e) {
		const {rfb} = e; rfb.addIslemTuslari('islemTuslari').addCSS('islemTuslari').setTip('tazeleVazgec')
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
		super.onAfterRun(e); const {rfb} = e, rootPart = rfb.part; rootPart.builder = rfb; rootPart.layout.prop('id', rfb.id)
		/*const {builder} = e, rootPart = builder.part, _title = rootPart?._title; if (_title) { setTimeout(() => rootPart.updateWndTitle(_title), 10); delete rootPart._title }*/
	}
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
}
class DPanelRapor extends DOzelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'panel' } static get dPanelRapormu() { return true }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { id2AltRapor: e.id2AltRapor });
		if (this.id2AltRapor == null) { this.clear(); this.altRaporlarDuzenle(e) }
	}
	rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {rfb} = e, {id2AltRapor} = this;
		let form = rfb.addForm('items').setLayout(e => $(`<div id="${e.builder.id}" class="full-wh"/>`));
		for (const [id, altRapor] of Object.entries(id2AltRapor)) {
			const raporAdi = altRapor.class.aciklama ?? '';
			let fbd = altRapor.parentBuilder = form.addDiv(id, raporAdi).altAlta().addCSS('item'); const _e = { ...e, id, builder: fbd }; altRapor.subFormBuilderDuzenle(_e);
			const {width, height} = altRapor; if (width || height) { fbd.addStyle_wh(width, height) } altRapor.rootFormBuilderDuzenle(e)
		}
	}
	altRaporlarDuzenle(e) { }
	hizliBulIslemi_ara(e) {
		super.hizliBulIslemi_ara(e); const {tokens} = e, {id2AltRapor} = this;
		for (const altRapor of Object.values(id2AltRapor)) { if (altRapor.fbd_grid) { const gridPart = altRapor.fbd_grid.part; gridPart.filtreTokens = tokens; gridPart.tazele({ action: 'hizliBul' }) } }
	}
	add(...items) {
		const {id2AltRapor} = this; for (const item of items) {
			if (item == null) { continue } if ($.isArray(item)) { this.add(...item); continue } 
			let id, altRapor; if ($.isPlainObject(item)) { id = item.id; altRapor = item.altRapor ?? item.rapor } else { altRapor = item }
			if (isClass(altRapor)) { altRapor = new altRapor() }
			if (altRapor == null) { continue } if (!id) { id = altRapor.class.kod || newGUID() }
			altRapor.rapor = this; id2AltRapor[id] = altRapor
		} return this
	}
	clear() { this.id2AltRapor = {}; return this }
	tazele(e) {
		super.tazele(e); const {id2AltRapor} = this;
		for (const altRapor of Object.values(id2AltRapor)) { if (altRapor?.tazele) { altRapor.tazele(e) } }
	}
}
class DGrupluPanelRapor extends DPanelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get dGrupluPanelRapormu() { return true } static get altRaporClassPrefix() { return null }
	altRaporlarDuzenle(e) {
		super.altRaporlarDuzenle(e); const prefix = this.class.altRaporClassPrefix;
		if (prefix) { const postfixes = ['_Main', '_Chart', '_Diagram'],  classes = postfixes.map(postfix => window[prefix + postfix]).filter(cls => !!cls); this.add(...classes) }
	}
	islemTuslariArgsDuzenle(e) {
		super.islemTuslariArgsDuzenle(e); const {liste} = e;
		liste.push({ id: 'gruplamalar', text: 'Gruplamalar', handler: _e => this.id2AltRapor.main.gruplamalarIstendi({ ...e, ..._e }), args: { width: 150 } })
	}
}