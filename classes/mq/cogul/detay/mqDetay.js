class MQDetay extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get fisSayacSaha() { return 'fissayac' } static get seqSaha() { return 'seq' }
	/* static get table() { return null } */ static get tableAlias() { return 'har' } /* static get sinifAdi() { return null } */
	static get detaymi() { return true } get detaymi() { return this.class.detaymi } get dipHesabaEsasDegerler() { return {} }
	get kod() { return this.sayac } set kod(value) { this.sayac = value }

	constructor(e) {
		e = e || {}; super(e); if (e.isCopy) { return }
		const {args} = e; if (args) { for (const key in args) { const value = args[key]; if (value !== undefined) { this[key] = value } } }
		this.tempsReset()
	}
	static getDetayTable(e) { return this.table }
	static pTanimDuzenle({ pTanim }) {
		super.pTanimDuzenle(...arguments)
		$.extend(pTanim, { /* fisSayac: new PInst(this.fisSayacSaha), */ okunanHarSayac: new PInst(), eskiSeq: new PInst(), seq: new PInst(this.seqSaha) })
	}
	static orjBaslikListesi_argsDuzenle(e) { }
	static standartGorunumListesiDuzenle(e) {
		const {liste} = e, orjBaslikListesi = e.orjBaslikListesi ?? this.orjBaslikListesi;
		const ignoreBelirtecSet = asSet([config.dev ? null : this.sayacSaha].filter(x => !!x));
		liste.push(...orjBaslikListesi.map(colDef => colDef.belirtec).filter(belirtec => !ignoreBelirtecSet[belirtec]))
	}
	static orjBaslikListesiDuzenle(e) { super.orjBaslikListesiDuzenle(e); this.orjBaslikListesiDuzenle_ilk(e); this.orjBaslikListesiDuzenle_ara(e); this.orjBaslikListesiDuzenle_son(e) }
	static orjBaslikListesiDuzenle_ilk(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_ilk', e) }
	static orjBaslikListesiDuzenle_ara(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_ara', e) }
	static orjBaslikListesiDuzenle_son(e) { this.forAltYapiClassesDo('orjBaslikListesiDuzenle_son', e) }
	static gridVeriYuklendi(e) { }
	static raporQueryDuzenle(e) { }
	static loadServerData_queryDuzenle(e) {
		e = $.extend({}, e || {}); for (const key of ['ozelQueryDuzenleBlock', 'ozelQueryDuzenle', 'ozelQueryDuzenleBlock', 'ozelQueryDuzenle']) { delete e[key] }
		e.ozelQueryDuzenle = e => {}, super.loadServerData_queryDuzenle(e);
		const {aliasVeNokta, fisSayacSaha, sayacSaha, seqSaha} = this, {sent, stm} = e, parentRec = e.parentRec ?? e.rec ?? {};
		const fisSayac = e.sayac || e.fisSayac || e.fissayac || e.kaySayac || e.kaysayac || parentRec[sayacSaha] || parentRec.fissayac || parentRec.kaysayac;
		if (fisSayacSaha) {
			if (fisSayac) { sent.where.degerAta(fisSayac, `${aliasVeNokta}${fisSayacSaha}`) }
			sent.sahalar.add(`${aliasVeNokta}${fisSayacSaha}`);
			stm.orderBy.add(`${aliasVeNokta}${fisSayacSaha}`)
		}
		if (seqSaha) {
			sent.sahalar.add(`${aliasVeNokta}${seqSaha}`); stm.orderBy.add(`${aliasVeNokta}${seqSaha}`);
			sent.sahalar.liste = sent.sahalar.liste.filter(saha => saha.alias != sayacSaha)
		}
	}
	static tekilOku_queryDuzenle(e) { this.loadServerData_queryDuzenle(e) }
	async disKaydetOncesiIslemler(e) { }
	async disKaydetSonrasiIslemler(e) { }
	kaydetVeyaSilmeSonrasiIslemler(e) { /* do nothing */ }
	kopyaIcinDuzenle(e) {
		super.kopyaIcinDuzenle(e);
		if (this.okunanHarSayac) { this.okunanHarSayac = null }
	}
	hostVarsDuzenle(e) {
		super.hostVarsDuzenle(e); let {hv, fis} = e, {fisSayacSaha, seqSaha, table} = this.class;
		if (fis && fisSayacSaha) { hv[fisSayacSaha] = fis.sayac }
		if (seqSaha) { hv[seqSaha] = this.seq }
		if (table == 'finanshar' || table == 'hehar' || table == 'posilkhar') { /* finanshar için özel durum */ if (!hv.ticmustkod) { hv.ticmustkod = hv.must || '' } }
		e.det = this;
		if (fis) { fis.detayHostVarsDuzenle?.(e) }
	}
	setValues(e) {
		e = e || {}; super.setValues(e); let {rec, fis} = e, {sayacSaha, seqSaha} = this.class, parentRec = e.parentRec || e.rec || {};
		let sayac =  e.sayac || e.kaySayac || e.kaysayac || rec[sayacSaha] || rec.kaySayac || rec.kaysayac;
		let seq = e.seq || parentRec[seqSaha] || parentRec.seq;
		if (sayac) { this.okunanHarSayac = sayac }
		if (seqSaha) { this.seq = this.eskiSeq = seq }
		e.det = this; if (fis) { fis.detaySetValues(e) }
	}
	inExp_setValues({ rec }) {
		super.inExp_setValues(...arguments);
		this.okunanHarSayac = null
	}
	eBilgiSetValues(e) { this.eBilgiSetValues_ilk(e); this.eBilgiSetValues_son(e) }
	eBilgiSetValues_ilk(e) { } eBilgiSetValues_son(e) { }
	tempsReset() { this._temps = {}; return this }
}
class MQDetayGUID extends MQDetay {
    static { window[this.name] = this; this._key2Class[this.name] = this } static get idKullanilirmi() { return true }
	static get sayacSaha() { return 'id' } static get fisSayacSaha() { return 'fisid' }
	hostVarsDuzenle({ hv }) {
		super.hostVarsDuzenle(...arguments)
		let id = this.id ??= newGUID(), {class: { idKullanilirmi, idSaha }} = this
		if (idKullanilirmi && idSaha) { hv[idSaha] = id }
	}
	static logRecDonusturucuDuzenle({ result }) {
		super.logRecDonusturucuDuzenle(...arguments)
		let {sayacSaha, kodKullanilirmi, kodSaha} = this
		result[sayacSaha] = 'xkod'
		if (kodSaha == sayacSaha) { delete result[kodSaha] }
	}
	logHVDuzenle({ hv }) {
		super.logHVDuzenle(...arguments);
		hv.xkod = this.sayac || ''; delete hv.xsayac
	}
}
