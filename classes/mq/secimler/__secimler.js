class Secimler extends CIO {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get uiSinif() { return window.SecimlerWindowPart }
	static get duzenlemeUISinif() { return this.uiSinif }
	
	static getClass(e) {
		return this
	}	

	static from(e) {
		if (!e)
			return null;
		
		const cls = this.getClass(e);
		if (!cls)
			return null

		const result = new cls(e);
		if (!result.readFrom(e))
			return null

		return result
	}
	
	constructor(e) {
		e = e || {};
		super(e);

		if ($.isArray(e))
			e = { liste: e };
		else {
			this.uiSinif = e.uiSinif;
			this.duzenlemeUISinif = e.duzenlemeUISinif || this.uiSinif
		}

		this.uiSinif = this.uiSinif || this.class.uiSinif;
		this.duzenlemeUISinif = this.duzenlemeUISinif || this.class.duzenlemeUISinif;

		this.secimleriTemizle();
		this.listeOlustur({ liste: this.liste });
		this.readFrom(e)
	}

	listeOlustur(e) {
	}

	initProps(e) {
		const {liste} = this;
		for (const key in liste) {
			/*if (Object.hasOwn(this, key))
				continue;*/
			Object.defineProperty(this, key, {
				get: () =>
					this.liste[key],
				set: value =>
					this.liste[key] = value,
				configurable: true
			})
		}
	}

	get asObject() {
		const _e = { _reduce: true };
		this.writeTo(_e);
		
		delete _e._reduce;
		for (const key of Object.keys(_e)) {
			if (key[0] == '_') {
				delete _e[key];
				continue;
			}
			const item = _e[key];
			if ($.isEmptyObject(item)) {
				delete _e[key];
				continue;
			}
		}
		
		return _e
	}

	readFrom(e) {
		if (!e)
			return false

		let {mfSinif} = e;
		if (typeof mfSinif == 'string')
			mfSinif = getFunc.call(this, mfSinif, e)
		this.mfSinif = mfSinif;

		let _whereBlockListe = getFunc(e.whereBlockListe);
		if (!$.isEmptyObject(_whereBlockListe)) {
			const whereBlockListe = this.whereBlockListe = [];
			whereBlockListe.push(..._whereBlockListe);
		}

		const _grupListe = e.grupListe;
		if (!$.isEmptyObject(_grupListe))
			this.grupTopluEkle(_grupListe)

		const {liste} = this;
		const _liste = e.liste;
		if ($.isEmptyObject(_liste)) {
			this.initProps()
		}
		else {
			this.beginUpdate();
			for (const key in _liste) {
				let secim = liste[key];
				const item = _liste[key];
				if (!item)
					continue;
				
				const isDef = $.isPlainObject(item);
				if (secim) {
					if (isDef)
						secim.readFrom(item);
					else
						liste[key] = secim = item;
				}
				else {
					secim = isDef ? Secim.from(item) : item;
					if (secim)
						this.secimEkle({ key: key, secim: secim, noInit: true });
				}
			}
			this.endUpdate()
		}

		return true;
	}

	writeTo(e) {
		if (!e)
			return false;
		
		const {liste} = this;
		for (const key in liste) {
			const secim = liste[key];
			if (secim) {
				const item = e[key] || {};
				item._reduce = e._reduce;
				secim.writeTo(item);
				delete item._reduce;
				
				if ($.isEmptyObject(item))
					delete e[key];
				else
					e[key] = item;
			}
		}

		return true;
	}

	secimTopluEkle(e) {
		const liste = e.liste || e;
		const noInitFlag = (e.noInit || this._noInit);
		if (!noInitFlag)
			this.beginUpdate()
		if (liste) {
			for (const key in liste)
				this.secimEkle({ key: key, secim: liste[key], noInit: true });
		}
		if (!noInitFlag)
			this.endUpdate();
		return this;
	}

	secimEkle(e, _secim) {
		e = e || {};
		const noInitFlag = (e.noInit || this._noInit);
		const key = e.key || e.belirtec || e;
		let secim = e.secim || e.value || e.item || _secim;

		if (!noInitFlag)
			this.beginUpdate();
		if (key && secim) {
			if (typeof secim == 'string')
				secim = getFunc(secim);
			if ($.isPlainObject(secim))
				secim = Secim.From(secim);
			
			if (secim) {
				this.liste[key] = secim;
				const {grupListe} = this;
				const {grupKod} = secim;
				if (grupKod && !grupListe[grupKod])
					this.grupEkle(grupKod);
			}
			
		}
		if (!noInitFlag)
			this.endUpdate();
		return this
	}

	grupTopluEkle(e) {
		const liste = e.grupListe || e;
		if (liste) {
			for (const key in liste)
				this.grupEkle(liste[key]);
		}
		return this
	}

	grupEkle(e, _aciklama, _kapalimi, _renk, _zeminRenk, _css, _ekBilgi) {
		e = e || {};
		const kod = e.kod || e.key || e.belirtec || e;
		const {grupListe} = this;
		if (!grupListe[kod]) {
			const aciklama = coalesce(e.aciklama || e.adi || _aciklama, kod);
			const kapalimi = coalesce(coalesce(e.kapali, e.kapalimi), _kapalimi);
			const renk = e.renk || _renk;
			const zeminRenk = e.zeminRenk || _zeminRenk;
			const css = e.css || _css;
			const ekBilgi = e.ekBilgi || _ekBilgi;
			grupListe[kod] = { kod: kod, aciklama: aciklama, kapalimi: kapalimi, renk: renk, zeminRenk: zeminRenk, css: css, ekBilgi: ekBilgi }
		}
		return this
	}

	secimleriTemizle(e) {
		this.liste = {};
		this.gruplariTemizle();
	}

	gruplariTemizle(e) {
		this.grupListe = {};
	}

	birlestir(e) {
		e = e || {};
		const diger = e.secimler || e.diger || e;
		this.grupTopluEkle(diger);
		this.secimTopluEkle(diger);

		const _whereBlockListe = diger.whereBlockListe;
		if (_whereBlockListe) {
			const whereBlockListe = this.whereBlockListe = this.whereBlockListe || [];
			whereBlockListe.push(..._whereBlockListe)
		}
	}

	beginUpdate() {
		this._noInit = true;
	}

	endUpdate() {
		if (this._noInit) {
			delete this._noInit;
			this.initProps();
		}
	}

	whereBlockEkle(block) {
		let {whereBlockListe} = this;
		if (!whereBlockListe)
			whereBlockListe = this.whereBlockListe = [];

		block = getFunc(block);
		if (block)
			whereBlockListe.push(block);

		return this;
	}

	get tbWhereClause() {
		return this.getTBWhereClause()
	}

	getTBWhereClause(e) {
		e = e || {}; const {alias} = e, aliasVeNokta = alias ? alias + '.' : '';
		const _e = $.extend({}, e, { alias: e.alias, aliasVeNokta: aliasVeNokta, secimler: this, where: new MQWhereClause() });
		const {whereBlockListe} = this;
		if (whereBlockListe) {
			for (const block of whereBlockListe)
				getFuncValue.call(this, block, _e);
		}
		this.tbWhereClauseDuzenle(_e);
		return _e.where;
	}

	tbWhereClauseDuzenle(e) {
	}

	get asHTMLElements() {
		const _e = { grup2Info: {} }
		this.buildHTMLElementsInto(_e);
		return _e.grup2Info;
	}

	buildHTMLElementsInto(e) {
		const {grup2Info} = e;
		const {liste, grupListe} = this;
		
		const grupKod2Liste = {};
		for (const key in liste) {
			const secim = liste[key];
			const grupKod = secim.grupKod || '';
			const _liste = (grupKod2Liste[grupKod] = grupKod2Liste[grupKod] || {});
			_liste[key] = secim;
		}
			
		for (const grupKod in grupKod2Liste) {
			const grup = grupListe[grupKod] || { aciklama: grupKod };
			const grupInfo = grup2Info[grupKod] = grup2Info[grupKod] || { grup: grup, key2Info: {} };
			const _liste = grupKod2Liste[grupKod];
			for (const key in _liste) {
				const secim = _liste[key];
				if (secim.isHidden)
					continue;
				
				const {anaTip, tip} = secim.class;
				const elmStr = secim.asHTMLElementString;
				const elm = elmStr ? $(elmStr) : null;
				if (elm && elm.length) {
					if (!elm.prop('id'))
						elm.prop('id', key);
					if (tip)
						elm.addClass(tip);
					elm.addClass(`${anaTip} secim`);
					elm.data('secim', secim);

					if (secim.isDisabled) {
						elm.prop('disabled', true);
						elm.prop('readonly', true);
						elm.attr('disabled', true);
						elm.attr('readonly', true);
						elm.addClass('disabled');
					}
	
					const {mfSinif} = secim;
					const etiket = secim.etiket || (secim.mfSinif || {}).sinifAdi;
					if (etiket) {
						const elmLabel = $(
							`<label class="etiket">${etiket}</label>`
						);
						elmLabel.prependTo(elm);
					}
	
					const {key2Info} = grupInfo;
					key2Info[key] = { secim: secim, element: elm };
				}
			}
		}
	}
	temizle(e) {
		const {liste} = this;
		for (const secim of Object.values(liste))
			secim.temizle(e);
	}

	duzenlemeEkraniAc(e) {
		e = e || {};
		const uiSinif = e.uiSinif || this.duzenlemeUISinif;
		if (!uiSinif)
			return null

		const part = new uiSinif($.extend({}, e, {
			parentPart: e.parentPart,
			secimler: this, mfSinif: e.mfSinif,
			tamamIslemi: e.tamamIslemi
		}));
		part.run();

		return part
	}
}
