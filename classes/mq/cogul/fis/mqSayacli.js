class MQSayacli extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get kodKullanilirmi() { return false }
	static get sayacSaha() { return 'kaysayac' } static get kodSaha() { return this.sayacSaha }
	static get offlineSahaListe() { return [...super.offlineSahaListe, this.sayacSaha] }
	
	constructor(e) { e = e || {}; super(e); /* this.sayac = this.sayac || 0 */ }
	static pTanimDuzenle(e) {
		super.pTanimDuzenle(e); const {pTanim} = e;
		$.extend(pTanim, { sayac: new PInst() })
	}
	static loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); const {aliasVeNokta, sayacSaha} = this, {sent} = e;
		if (sayacSaha) { sent.sahalar.add(`${aliasVeNokta}${sayacSaha}`) }
	}
	tekilOku_queryDuzenle(e) {
		super.tekilOku_queryDuzenle(e);
		const {aliasVeNokta, sayacSaha} = this.class, {sayac} = this, {sent} = e;
		if (sayac && sayacSaha) { sent.where.liste = []; sent.where.degerAta(sayac, `${aliasVeNokta}${sayacSaha}`) }
	}
	async yaz(e) {
		let result = await super.yaz(e); if (result === false) return result
		await this.sayacBelirle(e); return result
	}
	async sayacBelirle(e) {
		const {sayacSaha, table} = this.class; if (!sayacSaha) { return null }
		const hv = this.alternateKeyHostVars(e); if ($.isEmptyObject(hv)) { return null }
		const offlineMode = e.offlineMode ?? e.isOfflineMode ?? this.isOfflineMode, {trnId} = e;
		const query = new MQSent({ from: table, where: { birlestirDict: hv }, sahalar: [sayacSaha] });
		const sayac = this.sayac = await this.sqlExecTekilDeger({ offlineMode, trnId, query });
		if (!sayac) throw { isError: true, rc: 'sayacBelirlenemedi', errorText: 'Kaydedilen fiş belirlenemedi' }
		return sayac
	}
	kopyaIcinDuzenle(e) { super.kopyaIcinDuzenle(e); const {sayacSaha} = this.class; if (sayacSaha) { this.sayac = null } }
	keyHostVarsDuzenle(e) {
		super.keyHostVarsDuzenle(e); const {hv} = e, {sayacSaha} = this.class, {sayac} = this;
		if (sayacSaha && sayac) { hv[sayacSaha] = sayac }
	}
	keySetValues(e) {
		super.keySetValues(e); const {rec} = e, {sayacSaha} = this.class;
		if (sayacSaha) { let value = rec[sayacSaha]; if (value != null) this.sayac = value }
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); const {sayacSaha} = this.class;
		const {hv} = e; $.extend(e.hv, this.alternateKeyHostVars(e)); if (sayacSaha) delete hv[sayacSaha]
	}
	static sayacVarmi(e) { e = e || {}; const sayac = typeof e == 'object' ? e.sayac : e; return new this({ sayac }).varmi(e) }
}
