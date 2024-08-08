class MQSayacliKA extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodSaha() { return MQKA.kodSaha } static get adiSaha() { return MQKA.adiSaha }
	static get kodKullanilirmi() { return MQKA.kodKullanilirmi } static get bosKodAlinirmi() { return false } static get zeminRenkDesteklermi() { return MQKA.zeminRenkDesteklermi }
	
	constructor(e) { e = e || {}; super(e) }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e; $.extend(pTanim, { kod: new PInstStr(this.kodSaha), aciklama: new PInstStr(this.adiSaha) });
		if (this.zeminRenkDesteklermi) { pTanim.zeminRenk = new PInstStr() }
	}
	static ekCSSDuzenle(e) { super.ekCSSDuzenle(e); MQKA.ekCSSDuzenle(e) }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({ instKod: new SecimString({ mfSinif: this, hidden: !this.kodKullanilirmi }), instAdi: new SecimOzellik({ etiket: `${this.sinifAdi} Adı` }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, kodSaha, adiSaha} = this, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.instKod, `${aliasVeNokta}${kodSaha}`);
			wh.ozellik(sec.instAdi, `${aliasVeNokta}${adiSaha}`)
		})
	}
	static secimlerDuzenleSon(e) {
		super.secimlerDuzenleSon(e); const sec = e.secimler;
		sec.grupTopluEkle({ kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true });
		sec.secimTopluEkle({ sayac: new SecimInteger({ etiket: 'ID' }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, wh = e.where, sec = e.secimler;
			wh.basiSonu(sec.sayac, `${aliasVeNokta}${sayacSaha}`)
		})
	}
	static rootFormBuilderDuzenle(e) { super.rootFormBuilderDuzenle(e); e.mfSinif = this; MQKA.rootFormBuilderDuzenle(e) }
	static getFormBuilders_ka(e) { const _e = $.extend(e, { liste: [] }); this.formBuildersDuzenle_ka(_e); return e.liste }
	static formBuildersDuzenle_ka(e) { MQKA.formBuildersDuzenle_ka(e) }
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e;
		if (this.kodKullanilirmi) { liste.push(this.kodSaha) } liste.push(this.adiSaha)
	}
	static orjBaslikListesiDuzenle(e) {
		super.orjBaslikListesiDuzenle(e); const cellsRenderer = (colDef, rowIndex, columnField, value, html, jqxCol, rec) => {
			const _osColor = rec.oscolor, htmlColor = _osColor ? os2HTMLColor(_osColor) : null;
			if (htmlColor) { const textColor = getContrastedColor(htmlColor); html = html.replace('style="', `style="background-color: ${htmlColor}; color: ${textColor}; `) }
			return html
		};
		const {kodSaha, adiSaha, kodKullanilirmi} = this, {liste} = e;
		liste.push(
			new GridKolon({ belirtec: kodSaha, text: 'Kod', genislikCh: 30, cellsRenderer, hidden: !kodKullanilirmi, sql: kodKullanilirmi ? undefined : false }),
			new GridKolon({ belirtec: adiSaha, text: this.adiEtiket,  minWidth: Math.min(200, asInteger($(window).width() / 4)), width: Math.min(600, asInteger($(window).width() / 2)), cellsRenderer })
		)
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {aliasVeNokta, kodSaha, adiSaha} = this;
		if (!this.bosKodAlinirmi) { sent.where.add(`${aliasVeNokta}${kodSaha} <> ''`) }
		if (!sent.sahalar.liste.find(saha => saha.alias == kodSaha)) { sent.sahalar.add(`${aliasVeNokta}${kodSaha}`) }
		if (adiSaha && !sent.sahalar.liste.find(saha => saha.alias == adiSaha)) { sent.sahalar.add(`${aliasVeNokta}${adiSaha}`) }
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e); const {aliasVeNokta, kodSaha} = this.class, {kod} = this, {sent} = e;
		if (kod && kodSaha) { sent.where.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
	}
	keyHostVarsDuzenle(e) { super.keyHostVarsDuzenle(e) }
	alternateKeyHostVarsDuzenle(e) { super.alternateKeyHostVarsDuzenle(e); const {hv} = e; hv[this.class.kodSaha] = this.kod }
	keySetValues(e) { super.keySetValues(e) }
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {hv} = e;
		if (this.class.zeminRenkDesteklermi) { hv.oscolor = html2OSColor(this.zeminRenk) || 0 }
	}
	setValues(e) {
		e = e || {}; super.setValues(e); const {rec} = e;
		if (this.class.zeminRenkDesteklermi) { const {oscolor} = rec; this.zeminRenk = oscolor ? os2HTMLColor(oscolor) : '' }
	}
	cizgiliOzet(e) { return new KodVeAdi(this).cizgiliOzet(e) } parantezliOzet(e) { return new KodVeAdi(this).parantezliOzet(e) } toString(e) { return this.parantezliOzet(e) }
	static getGridKolonGrup(e) { e = e || {}; e.mfSinif = e.mfSinif ?? this; return MQKA.getGridKolonGrup(e) }
	static kodVarmi(e) { e = e || {}; const kod = typeof e == 'object' ? e.kod : e; return new this({ kod }).varmi(e) }
}
