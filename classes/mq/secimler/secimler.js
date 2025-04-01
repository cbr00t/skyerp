class Secimler extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uiSinif() { return window.SecimlerWindowPart } static get duzenlemeUISinif() { return this.uiSinif }
	constructor(e) {
		e = e || {}; super(e); const {eConf} = e; if (eConf != null) { this.eConf = eConf }
		if ($.isArray(e)) { e = { liste: e } } else { this.uiSinif = e.uiSinif; this.duzenlemeUISinif = e.duzenlemeUISinif || this.uiSinif }
		this.uiSinif = this.uiSinif || this.class.uiSinif; this.duzenlemeUISinif = this.duzenlemeUISinif || this.class.duzenlemeUISinif;
		this.secimleriTemizle(); const {liste} = this; this.listeOlustur({ liste }); this.readFrom(e);
		if (this.afterRun) { this.afterRun(e) }
	}
	static getClass(e) { return this }	
	static from(e) {
		if (!e) { return null } const cls = this.getClass(e); if (!cls) { return null }
		const result = new cls(e); if (!result.readFrom(e)) { return null }
		return result
	}
	duzenlemeEkraniAc(e) {
		e = e || {}; const uiSinif = e.uiSinif || this.duzenlemeUISinif; if (!uiSinif) { return null }
		const {parentPart, mfSinif, tamamIslemi} = e;
		const secimler = this, part = new uiSinif($.extend({}, e, { parentPart, secimler, mfSinif, tamamIslemi }));
		part.run(); return part
	}
	listeOlustur(e) { }
	initProps(e) {
		const {liste} = this; for (const key in liste) {
			Object.defineProperty(this, key, { configurable: true, get() { return this.liste[key] }, set(value) { this.liste[key] = value } })
		}
	}
	get asObject() {
		const _e = { _reduce: true }; this.writeTo(_e); delete _e._reduce;
		for (const key of Object.keys(_e)) { if (key[0] == '_') { delete _e[key]; continue } const item = _e[key]; if ($.isEmptyObject(item)) { delete _e[key]; continue } }
		return _e
	}
	readFrom(e) {
		if (!e) { return false }
		let {mfSinif} = e; if (typeof mfSinif == 'string') { mfSinif = getFunc.call(this, mfSinif, e) } this.mfSinif = mfSinif;
		let _whereBlockListe = getFunc(e.whereBlockListe); if (!$.isEmptyObject(_whereBlockListe)) { const whereBlockListe = this.whereBlockListe = []; whereBlockListe.push(..._whereBlockListe) }
		const _grupListe = e.grupListe; if (!$.isEmptyObject(_grupListe)) { this.grupTopluEkle(_grupListe) }
		const {liste} = this, _liste = e.liste; if ($.isEmptyObject(_liste)) { this.initProps() }
		else {
			this.beginUpdate();
			for (const key in _liste) {
				let secim = liste[key]; const item = _liste[key]; if (!item) { continue } const isDef = $.isPlainObject(item);
				if (secim) { if (isDef) { secim.readFrom(item) } else { liste[key] = secim = item } }
				else { secim = isDef ? Secim.from(item) : item; if (secim) { this.secimEkle({ key, secim, noInit: true }) } }
			}
			this.endUpdate()
		}
		return true
	}
	writeTo(e) {
		if (!e) { return false } const {liste} = this;
		for (const [key, secim] of Object.entries(liste)) {
			if (!secim) { continue }
			const item = e[key] || {}; item._reduce = e._reduce; secim.writeTo(item); delete item._reduce;
			if ($.isEmptyObject(item)) { delete e[key] } else { e[key] = item }
		}
		return true
	}
	secimTopluEkle(e) {
		const liste = e.liste || e, noInitFlag = (e.noInit ?? this._noInit);
		if (!noInitFlag) { this.beginUpdate() } if (liste) { for (const key in liste) { this.secimEkle({ key, secim: liste[key], noInit: true }) } } if (!noInitFlag) { this.endUpdate() }
		return this
	}
	secimEkle(e, _secim, _noInit) {
		e = e || {}; const key = e.key ?? e.belirtec ?? e, noInitFlag = (e.noInit ?? _noInit ?? this._noInit);
		let secim = e.secim ?? e.value ?? e.item ?? _secim;
		if (!noInitFlag) { this.beginUpdate() }
		if (key && secim) {
			if (typeof secim == 'string') { secim = getFunc(secim) } if ($.isPlainObject(secim)) { secim = Secim.From(secim) }
			if (secim) { this.liste[key] = secim; const {grupListe} = this, {grupKod} = secim; if (grupKod && !grupListe[grupKod]) { this.grupEkle(grupKod) } }
		}
		if (!noInitFlag) { this.endUpdate() } return this
	}
	grupTopluEkle(e) {
		const liste = e.grupListe ?? e;
		if (liste) { for (const key in liste) { const value = liste[key]; if (typeof value == 'object' && !value.kod) { value.kod = key } this.grupEkle(value) } }
		return this
	}
	grupEkle(e, _aciklama, _kapalimi, _renk, _zeminRenk, _css, _ekBilgi) {
		e = e || {}; const kod = e.kod ?? e.key ?? e.belirtec ?? e, {grupListe} = this;
		if (!grupListe[kod]) {
			const aciklama = (e.aciklama ?? e.adi ?? _aciklama) ?? kod, kapalimi = e.kapali ?? e.kapalimi ?? _kapalimi;
			const renk = e.renk ?? _renk, zeminRenk = e.zeminRenk ?? _zeminRenk, css = e.css ?? _css, ekBilgi = e.ekBilgi ?? _ekBilgi;
			grupListe[kod] = { kod, aciklama, kapalimi, renk, zeminRenk, css, ekBilgi }
		}
		return this
	}
	secimleriTemizle(e) { this.liste = {}; this.gruplariTemizle(e); return this }
	gruplariTemizle(e) { this.grupListe = {};  return this }
	temizle(e) { for (const sec of Object.values(this.liste)) { sec.temizle(e) } return this }
	birlestir(e) {
		e = e || {}; const diger = e.secimler || e.diger || e; let whereBlockListe;
		this.grupTopluEkle(diger); this.secimTopluEkle(diger);
		const _whereBlockListe = diger.whereBlockListe; if (_whereBlockListe) { whereBlockListe = this.whereBlockListe = this.whereBlockListe || []; whereBlockListe.push(..._whereBlockListe) }
		return this
	}
	beginUpdate() { this._noInit = true; return this }
	endUpdate() { if (this._noInit) { delete this._noInit; this.initProps() } return this }
	whereBlockEkle(block) {
		let {whereBlockListe} = this; if (!whereBlockListe) { whereBlockListe = this.whereBlockListe = [] }
		block = getFunc(block); if (block) { whereBlockListe.push(block) } return this
	}
	get tbWhereClause() { return this.getTBWhereClause() }
	getTBWhereClause(e) {
		e = e || {}; const {alias} = e, aliasVeNokta = alias ? alias + '.' : '', _e = $.extend({}, e, { alias, aliasVeNokta, secimler: this, where: new MQWhereClause() });
		const {whereBlockListe} = this; if (whereBlockListe) { for (const block of whereBlockListe) { getFuncValue.call(this, block, _e) } }
		this.tbWhereClauseDuzenle(_e); return _e.where
	}
	tbWhereClauseDuzenle(e) { }
	get asHTMLElements() { const _e = { grup2Info: {} }; this.buildHTMLElementsInto(_e); return _e.grup2Info }
	buildHTMLElementsInto(e) {
		let {grup2Info} = e, {liste, grupListe} = this, grupKod2Liste = {};
		for (const key in liste) { const secim = liste[key], grupKod = secim.grupKod || '', _liste = (grupKod2Liste[grupKod] = grupKod2Liste[grupKod] || {}); _liste[key] = secim }
		for (const grupKod in grupKod2Liste) {
			const grup = grupListe[grupKod] || { aciklama: grupKod },  grupInfo = grup2Info[grupKod] = grup2Info[grupKod] || { grup, key2Info: {} }, _liste = grupKod2Liste[grupKod];
			for (const key in _liste) {
				const secim = _liste[key]; /*if (secim.isHidden) { continue }*/
				const {anaTip, tip} = secim.class, elmStr = secim.asHTMLElementString, elm = elmStr ? $(elmStr) : null;
				if (elm?.length) {
					if (!elm.prop('id')) { elm.prop('id', key) } if (tip) { elm.addClass(tip) } elm.addClass(`${anaTip} secim`); elm.data('secim', secim);
					if (secim.isDisabled) { elm.prop('disabled', true); elm.prop('readonly', true); elm.attr('disabled', true); elm.attr('readonly', true); elm.addClass('disabled'); elm.attr('aria-disabled', true) }
					const {mfSinif} = secim, {key2Info} = grupInfo, etiket = secim.etiket || secim.mfSinif?.sinifAdi;
					if (etiket) { const elmLabel = $(`<label class="etiket">${etiket}</label>`); elmLabel.prependTo(elm) }
					key2Info[key] = { secim, element: elm }
				}
			}
		}
	}
	initHTMLElements({ secim2Info }) {
		let secimler = this; this.initHTMLElements_ilk({ ...arguments[0], secimler });
		for (let {secim, element: parent} of Object.values(secim2Info)) {
			if (!secim) { continue }
			secim.initHTMLElements({ ...arguments[0], secimler, parent });
			/*setTimeout(async () => await secim.initHTMLElements({ secimler, parent }), waitMS); waitMS += WaitMS_Ek*/
		}
		this.initHTMLElements_ara({ ...arguments[0], secimler });
		this.initHTMLElements_son({ ...arguments[0], secimler });
	}
	initHTMLElements_ilk(e) { } initHTMLElements_ara(e) { } initHTMLElements_son(e) { }
	grupOzetBilgiDuzenle(e) {
		const {elmGrup} = e, elmHeaderText = elmGrup?.find('.header > .jqx-expander-header-content');
		if (elmHeaderText?.length) { elmHeaderText.html(this.getGrupHeaderHTML(e)) }
	}
	getGrupHeaderHTML(e) {
		const innerHTML = this.getGrupOzetBilgiHTML(e), {elmGrup} = e, grupKod = e.grupKod ?? (elmGrup?.data('id') || elmGrup?.prop('id'));
		const grup = this.grupListe[grupKod], grupText = grup?.aciklama ?? '';
		return `<div class="item asil float-left">${grupText}</div><div class="item diger float-left">${innerHTML || ''}</div>`
	}
	getGrupOzetBilgiHTML(e) { let innerHTML = e.html ?? $.isArray(e.liste) ? e.liste.join('') : null; if (innerHTML?.html) { innerHTML = innerHTML.html() } return innerHTML || null }
}
class DonemselSecimler extends Secimler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	get tarihBS() {
		let {donem, tarihAralik} = this, {tarihAralikmi, basiSonu} = donem?.tekSecim ?? {};
		if (tarihAralikmi) { basiSonu = new CBasiSonu(tarihAralik) }
		return basiSonu
	}
	get tarihBSVeyaCariDonem() {
		let {tarihBS} = this; if (tarihBS?.bosDegilmi) { return tarihBS }
		let donemBS = new CBasiSonu({ basi: today().yilBasi(), sonu: today().yilSonu() });
		let {cariYil: yil} = app.params?.zorunlu ?? {}; if (yil && yil != today().yil) {
			for (const key of ['basi', 'sonu']) { let value = donemBS[key]; if (!isInvalidDate(value)) { value.setYil(yil) } }
		}
		let {donem, tarihAralik} = this, {tarihAralikmi, basiSonu: bs} = donem?.tekSecim ?? {};
		if (tarihAralikmi) { bs = new CBasiSonu(tarihAralik) }
		if (bs?.bosmu ?? true) { bs = donemBS }
		return bs
	}
	listeOlustur({ liste }) {
		let grupKod = 'donemVeTarih'; this.grupEkle(grupKod, 'Dönem Ve Tarih');
		$.extend(liste, {
			donem: new SecimTekSecim({ etiket: 'Dönem', tekSecimSinif: DonemTarihAralikVeHepsiSecim, grupKod }).autoBind().setOzetBilgiValueGetter(e => {
				const kod = e.value?.kod ?? e.value, result = [e.value?.aciklama ?? kod];
				if (kod == 'TR') { let value = this.tarihAralik.ozetBilgiValueDuzenlenmis; if (value) { result.push(value) } }
				return result
			}),
			tarihAralik: new SecimDate({ etiket: 'Tarih', grupKod }).hidden()
		});
		super.listeOlustur(...arguments)
	}
	initHTMLElements_son({ secim2Info }) {
		super.initHTMLElements_son(...arguments);
		let part = secim2Info?.donem?.element?.find('.ddList')?.data('part'); if (part) {
			part.degisince(e => {
				const {tarihAralikmi} = secim2Info.donem.secim.tekSecim;
				secim2Info.tarihAralik.element[tarihAralikmi ? 'removeClass' : 'addClass']('jqx-hidden')
			})
		}
	}
}
