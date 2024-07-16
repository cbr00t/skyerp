class Rapor extends MQDetayliOrtak {				/* MQCogul tabanlı rapor sınıfları için gerekli inherit desteği için MQDetayliOrtak'dan getirildi */
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return null }
	static get araSeviyemi() { return false } static get tumKolonlarGosterilirmi() { return false }
	static get rapormu() { return true } get rapormu() { return this.class.rapormu } static get altRapormu() { return false } get altRapormu() { return this.class.altRapormu }
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
	onInit(e) { } onAfterRun(e) { }
}
class MQRapor extends Rapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'mq' }
	goster(e) {
		e = e || {}; const args = e.args = e.args || {}; args.inst = this;
		const result = this.class.listeEkraniAc(e); if (result == null) { return null }
		const {part} = result, {anaTip} = this.class; part.layout.addClass(`${anaTip} rapor`);
		const {builder} = part; $.extend(this, { part, builder }); return result
	}
	tazele(e) { super.tazele(e); }
	static listeEkrani_init(e) { return e.sender.inst.onInit(e) }
	static listeEkrani_afterRun(e) { return e.sender.inst.onAfterRun(e) }
}
class OzelRapor extends Rapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'ozel' }
	goster(e) {
		e = e || {}; const inst = this, title = e.title ?? `<b class="royalblue">${this.class.aciklama}</b> Raporu`
		let rfb = new RootFormBuilder({ id: 'rapor' }).setInst(this).asWindow(title), _e = { ...e, rfb }; this.rootFormBuilderDuzenle(_e); rfb = _e.rfb;
		rfb.onInit(e => this.onInit({ ...e, rfb: e.builder })); rfb.onAfterRun(e => this.onAfterRun({ ...e, rfb: e.builder }));
		rfb.run(); const builder = rfb, {part} = builder, {anaTip} = this.class; part.layout.addClass(anaTip);
		$.extend(this, { part, builder }); return ({ inst, part, builder })
	}
	rootFormBuilderDuzenle(e) {
		const {rfb} = e; rfb.addIslemTuslari('islemTuslari').addCSS('islemTuslari').setTip('tazeleVazgec')
			.setButonlarDuzenleyici(e => e.builder.inst.islemTuslariArgsDuzenle(e))
			.setId2Handler(this.islemTuslariGetId2Handler(e))
	}
	onAfterRun(e) {
		super.onAfterRun(e); const {rfb} = e, rootPart = rfb.part; rootPart.builder = rfb
		/*const {builder} = e, rootPart = builder.part, _title = rootPart?._title; if (_title) { setTimeout(() => rootPart.updateWndTitle(_title), 10); delete rootPart._title }*/
	}
	islemTuslariArgsDuzenle(e) { }
	islemTuslariGetId2Handler(e) { return ({ tazele: e => e.builder.inst.tazele(e), vazgec: e => e.builder.rootPart.close(e) }) }
	tazele(e) {
		super.tazele(e); const {builder} = e, rfb = builder.rootBuilder, parentBuilder = rfb.id2Builder.items ?? rfb;
		for (const fbd of parentBuilder.getBuilders()) { const {part} = fbd; if (part?.tazele) { part.tazele(e) } if (part?.dataBind) { part.dataBind(e) } }
	}
}
class PanelRapor extends OzelRapor {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get anaTip() { return 'panel' }
	constructor(e) {
		e = e || {}; super(e); $.extend(this, { id2AltRapor: e.id2AltRapor });
		if (this.id2AltRapor == null) { this.clear(); this.altRaporlarDuzenle(e) }
	}
	rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e); const {rfb} = e, {id2AltRapor} = this;
		let form = rfb.addForm('items').setLayout(e => $(`<div id="${e.builder.id}" class="full-wh"/>`));
		for (const [id, altRapor] of Object.entries(id2AltRapor)) {
			const raporAdi = altRapor.class.aciklama ?? '';
			let fbd = form.addDiv(id, raporAdi).altAlta().addCSS('item'); const _e = { ...e, id, builder: fbd }; altRapor.subFormBuilderDuzenle(_e);
			const {width, height} = altRapor; if (width || height) { fbd.addStyle_wh(width, height) } altRapor.rootFormBuilderDuzenle(e)
		}
	}
	altRaporlarDuzenle(e) { }
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
}
