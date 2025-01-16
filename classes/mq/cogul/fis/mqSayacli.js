class MQSayacli extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodKullanilirmi() { return false } static get adiKullanilirmi() { return false }
	static get sayacSaha() { return 'kaysayac' } static get kodSaha() { return this.kodKullanilirmi ? MQKA.kodSaha : this.sayacSaha }
	static get adiSaha() { return this.adiKullanilirmi ? MQKA.adiSaha : null } static get kodEtiket() { return MQKA.kodEtiket } static get adiEtiket() { return MQKA.adiEtiket }
	static get offlineSahaListe() { return [...super.offlineSahaListe, this.sayacSaha, this.kodKullanilirmi ? this.kodSaha : null, this.adiKullanilirmi ? this.adiSaha : null].filter(x => !!x) }
	
	constructor(e) { e = e || {}; super(e); /* this.sayac = this.sayac || 0 */ }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {kodKullanilirmi, adiKullanilirmi, adiSaha} = this, {pTanim} = e;
		$.extend(pTanim, { sayac: new PInst() }); if (kodKullanilirmi) { pTanim.kod = new PInstStr() } 
		if (adiKullanilirmi) { pTanim.aciklama = new PInstStr(adiSaha) }
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, sayacSaha, kodKullanilirmi, kodSaha} = this, {sent} = e, {sahalar} = sent;
		if (sayacSaha) { sahalar.add(`${aliasVeNokta}${sayacSaha}`) }
		if (kodKullanilirmi && kodSaha) { sahalar.add(`${aliasVeNokta}${kodSaha}`) }
	}
	static standartGorunumListesiDuzenle(e) {
		super.standartGorunumListesiDuzenle(e); const {liste} = e, {kodKullanilirmi, kodSaha, adiKullanilirmi, adiSaha} = this;
		if (kodKullanilirmi) { liste.push(kodSaha) } if (adiKullanilirmi) { liste.push(adiSaha) }
	}
	static orjBaslikListesiDuzenle(e) { super.orjBaslikListesiDuzenle(e); e.mfSinif = this; MQKA.orjBaslikListesiDuzenle(e) }
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {sent} = e, {aliasVeNokta, kodSaha} = this;
		if (!this.bosKodAlinirmi) { sent.where.add(`${aliasVeNokta}${kodSaha} <> ''`) }
		if (!sent.sahalar.liste.find(saha => saha.alias == kodSaha)) { sent.sahalar.add(`${aliasVeNokta}${kodSaha}`) }
		if (this.zeminRenkDesteklermi) sent.sahalar.add(`${aliasVeNokta}oscolor`)
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e); const {aliasVeNokta, sayacSaha} = this.class, {sayac} = this, {sent} = e;
		if (sayac && sayacSaha) { sent.where.liste = []; sent.where.degerAta(sayac, `${aliasVeNokta}${sayacSaha}`) }
	}
	async yaz(e) {
		let result = await super.yaz(e); if (result === false) return result
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
	kopyaIcinDuzenle(e) { super.kopyaIcinDuzenle(e); const {sayacSaha} = this.class; if (sayacSaha) { this.sayac = null } }
	keyHostVarsDuzenle(e) {
		super.keyHostVarsDuzenle(e); const {hv} = e, {sayacSaha, kodKullanilirmi, kodSaha} = this.class, {sayac, kod} = this;
		if (sayacSaha && sayac) { hv[sayacSaha] = sayac }
		if (kodKullanilirmi && kodSaha && kod) { hv[kodSaha] = kod }
	}
	keySetValues(e) {
		super.keySetValues(e); const {rec} = e, {sayacSaha, kodKullanilirmi, kodSaha} = this.class;
		if (sayacSaha) { let value = rec[sayacSaha]; if (value != null) { this.sayac = value } }
		if (kodKullanilirmi && kodSaha) { let value = rec[kodSaha]; if (value != null) { this.kod = value } }
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {sayacSaha} = this.class;
		const {hv} = e; $.extend(e.hv, this.alternateKeyHostVars(e)); if (sayacSaha) { delete hv[sayacSaha] }
	}
	static sayacVarmi(e) { e = e || {}; const sayac = typeof e == 'object' ? e.sayac : e; return new this({ sayac }).varmi(e) }
}
