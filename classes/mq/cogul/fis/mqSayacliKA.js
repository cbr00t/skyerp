class MQSayacliKA extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kodSaha() { return MQKA.kodSaha }
	static get adiSaha() { return MQKA.adiSaha }
	static get zeminRenkDesteklermi() { return MQKA.zeminRenkDesteklermi }
	
	constructor(e) {
		e = e || {};
		super(e)
	}

	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e);
		
		const {pTanim} = e;
		$.extend(pTanim, {
			kod: new PInstStr(this.kodSaha),
			aciklama: new PInstStr(this.adiSaha)
		});
		if (this.zeminRenkDesteklermi)
			pTanim.zeminRenk = new PInstStr()
	}
	static ekCSSDuzenle(e) {
		super.ekCSSDuzenle(e);
		MQKA.ekCSSDuzenle(e)
	}
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e);
		const {secimler} = e;
		secimler.secimTopluEkle({
			instKod: new SecimString({ mfSinif: this }),
			instAdi: new SecimOzellik({ etiket: `${this.sinifAdi} Adı` })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.instKod, `${aliasVeNokta}${this.kodSaha}`);
			where.ozellik(secimler.instAdi, `${aliasVeNokta}${this.adiSaha}`)
		})
	}
	static secimlerDuzenleSon(e) {
		super.secimlerDuzenleSon(e);
		const {secimler} = e;
		secimler.grupTopluEkle([
			{ kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true }
		]);
		secimler.secimTopluEkle({
			sayac: new SecimInteger({ etiket: 'ID' })
		});
		secimler.whereBlockEkle(e => {
			const {aliasVeNokta} = this;
			const {where, secimler} = e;
			where.basiSonu(secimler.sayac, `${aliasVeNokta}${this.sayacSaha}`)
		})
	}
	static rootFormBuilderDuzenle(e) {
		super.rootFormBuilderDuzenle(e);
		MQKA.rootFormBuilderDuzenle(e)
	}
	static getFormBuilders_ka(e) {
		const _e = $.extend(e, { liste: [] });
		this.formBuildersDuzenle_ka(_e);
		return e.liste
	}
	static formBuildersDuzenle_ka(e) {
		MQKA.formBuildersDuzenle_ka(e)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e);
		const cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			const _osColor = rec.oscolor;
			const htmlColor = _osColor ? os2HTMLColor(_osColor) : null;
			if (htmlColor) {
				const textColor = getContrastedColor(htmlColor);
				html = html.replace('style="', `style="background-color: ${htmlColor}; color: ${textColor}; `);
			}
			return html
		};

		const {kodSaha, adiSaha} = this;
		const {liste} = e;
		liste.push(
			new GridKolon({ belirtec: kodSaha, text: 'Kod', genislikCh: 30, cellsRenderer: cellsRenderer }),
			new GridKolon({
				belirtec: adiSaha, text: this.adiEtiket, 
				minWidth: Math.min(200, asInteger($(window).width() / 4)),
				width: Math.min(600, asInteger($(window).width() / 2)),
				cellsRenderer: cellsRenderer
			})
		)
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e);
		e.liste.push(this.kodSaha, this.adiSaha)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e);
		const {sent} = e;
		const {aliasVeNokta, kodSaha, adiSaha} = this;
		if (!this.bosKodAlinirmi) {
			sent.where
				.add(`${aliasVeNokta}${kodSaha} <> ''`)
		}
		if (!sent.sahalar.liste.find(saha => saha.alias == kodSaha)) {
			sent.sahalar
				.add(`${aliasVeNokta}${kodSaha}`)
		}
		if (adiSaha && !sent.sahalar.liste.find(saha => saha.alias == adiSaha)) {
			sent.sahalar
				.add(`${aliasVeNokta}${adiSaha}`)
		}
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);
		const {aliasVeNokta, kodSaha} = this.class;
		const {kod} = this;
		const {sent} = e;
		if (kod && kodSaha) {
			sent.where
				.degerAta(kod, `${aliasVeNokta}${kodSaha}`)
		}
	}
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e) }
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e);
		const {hv} = e;
		hv[this.class.kodSaha] = this.kod
	}
	keySetValues(e) { super.keySetValues(e) }
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e);
		const {hv} = e;
		if (this.class.zeminRenkDesteklermi)
			hv.oscolor = html2OSColor(this.zeminRenk) || 0
	}
	setValues(e) {
		e = e || {};
		super.setValues(e);
		const {rec} = e;
		if (this.class.zeminRenkDesteklermi) {
			const {oscolor} = rec;
			this.zeminRenk = oscolor ? os2HTMLColor(oscolor) : ''
		}
	}
	cizgiliOzet(e) { return new KodVeAdi(this).cizgiliOzet(e) }
	parantezliOzet(e) { return new KodVeAdi(this).parantezliOzet(e) }
	toString(e) { return this.parantezliOzet(e) }
	static getGridKolonGrup(e) {
		e = e || {};
		e.mfSinif = e.mfSinif || this;
		return MQKA.getGridKolonGrup(e)
	}
	static kodVarmi(e) {
		e = e || {};
		const kod = typeof e == 'object' ? e.kod : e;
		return new this({ kod }).varmi(e)
	}
}
