class MQSayacli extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static kami() { return this.kodKullanilirmi }
	static get kodKullanilirmi() { return false } static get adiKullanilirmi() { return false }
	static get sayacSaha() { return 'kaysayac' } static get kodSaha() { return this.kodKullanilirmi ? MQKA.kodSaha : this.sayacSaha } static get bosKodAlinirmi() { return false }
	static get adiSaha() { return this.adiKullanilirmi ? MQKA.adiSaha : null } static get kodEtiket() { return MQKA.kodEtiket } static get adiEtiket() { return MQKA.adiEtiket }
	static get offlineSahaListe() { return [...super.offlineSahaListe, this.sayacSaha, this.kodKullanilirmi ? this.kodSaha : null, this.adiKullanilirmi ? this.adiSaha : null].filter(x => !!x) }
	static get zeminRenkDesteklermi() { return MQKA.zeminRenkDesteklermi }
	
	constructor(e) { e = e || {}; super(e); /* this.sayac = this.sayac || 0 */ }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {kodKullanilirmi, adiKullanilirmi, adiSaha} = this, {pTanim} = e;
		$.extend(pTanim, { sayac: new PInst() }); if (kodKullanilirmi) { pTanim.kod = new PInstStr() } 
		if (adiKullanilirmi) { pTanim.aciklama = new PInstStr(adiSaha) }
	}
	static ekCSSDuzenle(e) { super.ekCSSDuzenle(e); MQKA.ekCSSDuzenle(e) }
	static secimlerDuzenle(e) {
		super.secimlerDuzenle(e); const sec = e.secimler;
		sec.secimTopluEkle({
			instKod: new SecimString({ mfSinif: this, hidden: !this.kodKullanilirmi }),
			instAdi: new SecimOzellik({ etiket: `${this.sinifAdi} Adı`, hidden: !this.adiKullanilirmi })
		});
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, kodSaha, adiSaha} = this, wh = e.where, sec = e.secimler;
			if (this.kodKullanilirmi) { wh.basiSonu(sec.instKod, `${aliasVeNokta}${kodSaha}`) }
			if (this.adiKullanilirmi) { wh.ozellik(sec.instAdi, `${aliasVeNokta}${adiSaha}`) }
		})
	}
	static secimlerDuzenleSon(e) {
		super.secimlerDuzenleSon(e); const sec = e.secimler;
		sec.grupTopluEkle([ { kod: 'teknik', aciklama: 'Teknik', renk: '#eee', zeminRenk: 'orangered', kapalimi: true } ]);
		sec.secimTopluEkle({ sayac: new SecimInteger({ etiket: 'ID', grupKod: 'teknik' }) });
		sec.whereBlockEkle(e => {
			const {aliasVeNokta, sayacSaha} = this, {where: wh, secimler: sec} = e;
			wh.basiSonu(sec.sayac, `${aliasVeNokta}${sayacSaha}`)
		})
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); let {liste} = e, {kodKullanilirmi, kodSaha, adiKullanilirmi, adiSaha} = this;
		if (kodKullanilirmi) { liste.push(kodSaha) }
		if (adiKullanilirmi) { liste.push(adiSaha) }
	}
	static orjBaslikListesiDuzenle(e) { super.orjBaslikListesiDuzenle(e); e.mfSinif = this; MQKA.orjBaslikListesiDuzenle(e) }
	static rootFormBuilderDuzenle(e) { super.rootFormBuilderDuzenle(e); e.mfSinif = this; MQKA.rootFormBuilderDuzenle(e) }
	static getFormBuilders_ka(e) { let _e = { ...e, liste: [] }; this.formBuildersDuzenle_ka(_e); return e.liste }
	static formBuildersDuzenle_ka(e) { MQKA.formBuildersDuzenle_ka(e) }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {aliasVeNokta, sayacSaha, kodKullanilirmi, kodSaha, adiKullanilirmi, adiSaha, zeminRenkDesteklermi} = this;
		let {sent} = e, {sahalar} = sent;
		if (sayacSaha && !sahalar.liste.find(saha => saha.alias == sayacSaha)) { sahalar.add(`${aliasVeNokta}${sayacSaha}`) }
		if (kodKullanilirmi && kodSaha && !sahalar.liste.find(saha => saha.alias == kodSaha)) { sahalar.add(`${aliasVeNokta}${kodSaha}`) }
		if (adiKullanilirmi && adiSaha && !sahalar.liste.find(saha => saha.alias == adiSaha)) { sahalar.add(`${aliasVeNokta}${adiSaha}`) }
		if (zeminRenkDesteklermi) { sahalar.add(`${aliasVeNokta}oscolor`) }
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e); let {aliasVeNokta, sayacSaha, kodKullanilirmi, kodSaha} = this.class, {sayac, kod} = this;
		let {sent} = e, {where: wh} = sent;
		if (sayacSaha && sayac) { wh.liste = []; wh.degerAta(sayac, `${aliasVeNokta}${sayacSaha}`) }
		else if (kodKullanilirmi && kodSaha && kod) { wh.degerAta(kod, `${aliasVeNokta}${kodSaha}`) }
	}
	async yaz(e) {
		let result = await super.yaz(e); if (result === false) { return result }
		await this.sayacBelirle(e); return result
	}
	async sayacBelirle(e) {
		e = e ?? {}; const {sayacSaha, table} = this.class; if (!sayacSaha) { return null }
		const hv = this.alternateKeyHostVars(e); if ($.isEmptyObject(hv)) { return null }
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e;
		const query = new MQSent({ from: table, where: { birlestirDict: hv }, sahalar: [sayacSaha] });
		const sayac = this.sayac = await this.sqlExecTekilDeger({ offlineMode, trnId, query });
		if (!sayac) throw { isError: true, rc: 'sayacBelirlenemedi', errorText: 'Kaydedilen fiş belirlenemedi' }
		return sayac
	}
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e);
		let {sayacSaha} = this.class; if (sayacSaha) { this.sayac = null }
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments);
		let {sayacSaha} = this; result[sayacSaha] = 'xsayac'
		let {kodKullanilirmi, kodSaha} = this; if (kodKullanilirmi) { result[kodSaha] = 'xkod' }
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		hv.xsayac = this.sayac || 0;
		let {kodKullanilirmi} = this.class; if (kodKullanilirmi) { hv.xkod = this.kod || '' }
	}
	keyHostVarsDuzenle(e) {
		super.keyHostVarsDuzenle(e); const {hv} = e, {sayacSaha, kodKullanilirmi, kodSaha} = this.class, {sayac, kod} = this;
		if (sayacSaha && sayac) { hv[sayacSaha] = sayac }
	}
	keySetValues(e) {
		super.keySetValues(e); let {rec} = e, {sayacSaha, kodKullanilirmi, kodSaha} = this.class;
		if (sayacSaha) { let value = rec?.[sayacSaha]; if (value != null) { this.sayac = value } }
		if (kodKullanilirmi && kodSaha) { let value = rec?.[kodSaha]; if (value != null) { this.kod = value } }
	}
	alternateKeyHostVarsDuzenle(e) {
		super.alternateKeyHostVarsDuzenle(e); const {hv} = e, {kodKullanilirmi, kodSaha} = this.class;
		if (kodKullanilirmi) { hv[kodSaha] = this.kod } else { delete hv[kodSaha] }
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {sayacSaha} = this.class;
		const {hv} = e; $.extend(e.hv, this.alternateKeyHostVars(e)); if (sayacSaha) { delete hv[sayacSaha] }
		if (this.class.zeminRenkDesteklermi) { hv.oscolor = html2OSColor(this.zeminRenk) || 0 }
	}
	setValues(e) {
		e = e || {}; super.setValues(e); const {rec} = e;
		if (this.class.zeminRenkDesteklermi) { const {oscolor} = rec; this.zeminRenk = oscolor ? os2HTMLColor(oscolor) : '' }
	}
	inExp_setValues({ rec }) {
		super.inExp_setValues(...arguments);
		/*let {guidmi} = this.class; if (!guidmi) { this.sayac = null } */
		this.sayac = null
	}
	static sayacVarmi(e, _zorunlumu) {
		e = e || {}; let sayac = typeof e == 'object' ? e.sayac : e;
		let zorunlumu = _zorunlumu ?? (typeof e == 'object' ? e.zorunlu ?? e.zorunlumu : null);
		if (zorunlumu && !sayac) { return false }
		return !sayac || new this({ sayac }).varmi(e)
	}
	cizgiliOzet(e) { return new CKodVeAdi(this).cizgiliOzet(e) } parantezliOzet(e) { return new CKodVeAdi(this).parantezliOzet(e) } toString(e) { return this.parantezliOzet(e) }
	static getGridKolonGrup(e) { e = e || {}; e.mfSinif = e.mfSinif ?? this; return MQKA.getGridKolonGrup(e) }
	setId(value) { this.sayac = value; return this }
}
