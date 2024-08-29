class Hareketci extends CObject {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kod() { return null } static get aciklama() { return null } static get araSeviyemi() { return this == Hareketci }
	static get kod2Sinif() {
		let result = this._kod2Sinif; if (result == null) {
			result = {}; const {subClasses} = this; for (const cls of subClasses) { const {araSeviyemi, kod} = cls; if (!araSeviyemi && kod) { result[kod] = cls } }
			this._kod2Sinif = result
		}
		return result
   }
	static getClass(e) { const kod = typeof e == 'object' ? (e.kod ?? e.tip) : e; return this.kod2Sinif[kod] }
	static get hareketTipSecim() {
		let cacheSelector = '_hareketTipTekSecim', result = this[cacheSelector];
		if (result === undefined) { result = this[cacheSelector] = this.hareketTipSecimInternal } return result
	}
	static get hareketTipSecimInternal() { let cls = this.hareketTipSecimSinif; return cls ? new cls() : null }
	static get hareketTipSecimSinif() {
		const $this = this; return class extends TekSecim {
			kaListeDuzenle(e) {
				super.kaListeDuzenle(e); const _e = { ...e, kaListe: [] }; $this.hareketTipSecim_kaListeDuzenle(_e);
				const {kaListe} = e; if (kaListe) { this.kaListe = kaListe.filter(ka => !!ka) }
			}
		}
	}
	get attrSet() { let result = this._attrSet; if ($.isArray(result)) { result = this.attrSet = asSet(result) } return result } set attrSet(value) { this._attrSet = value }
	get uygunluk() {
		let result = this._uygunluk; if (result == null) { result = this.class.hareketTipSecim }
		if (!(result.class?.birKismimi ?? result.birKismimi)) { result = this._uygunluk = new SecimBirKismi({ tekSecim: result }) }
		return result
	} set uygunluk(value) { this._uygunluk = value }

	constructor(e) {
		e = e || {}; super(e); $.extend(this, {
			_attrSet: e.attrListe ?? e.attrSet, whereYapi: e.whereYapi ?? {}, _uygunluk: e.uygunluk,
			gereksizTablolariSilFlag: e.gereksizTablolariSil ?? e.gereksizTablolariSilFlag ?? false,
			serbestliBedelSql: e.serbestliBedelSql || 'har.bedel'
		});
		const {whereYapi} = this; for (const key of ['master', 'hareket']) { const value = e[key]; if (value !== undefined) { whereYapi[key] = value } }
	}
	static hareketTipSecim_kaListeDuzenle(e) { }
	uniOlustur(e) {
		e = e || {}; const uni = new MQUnionAll(), _e = { ...e, uni }; this.uniDuzenle(_e);
		if (this.gereksizTablolariSilFlag) { for (const sent of uni.getSentListe()) { sent.gereksizTablolariSil() } }
		return uni
	}
	uniDuzenle(e) {
		e = e || {}; $.extend(e, {
			...e, sqlEmpty: `''`,
			ekleyici: (e, ...items) => { for (const item of items) { let sql = item[0], alias = item[1]; this.sentSahaEkleyici({ ...e, sql, alias }) } }
		}); return this.uniDuzenleDevam(e)
	}
	uniDuzenleDevam(e) { }
	sentSahaEkleyici(e) {
		const {sent, sql, alias, attr2Deger} = e, {attrSet} = this;
		let saha = alias ? new MQAliasliYapi({ alias, deger: sql }) : MQAliasliYapi.newForSahaText(sql), sahaAlias = saha.alias;
		if (!attrSet || attrSet[sahaAlias]) { sent.add(saha) } attr2Deger[sahaAlias] = saha.deger; return this
	}
	withAttrs(...items) { this.attrSet = items.flat(); return this }
	setWhereDuzenleyiciler(value) { this.whereYapi = value; return this }
	setWHD_master(value) { this.whereYapi.master = value; return this } setWHD_hareket(value) { this.whereYapi.hareket = value; return this } setUygunluk(value) { this.uygunluk = value; return this }
	gereksizTablolariSil() { this.gereksizTablolariSilFlag = true; return this } gereksizTablolariSilme() { this.gereksizTablolariSilFlag = false; return this }
	setSerbestliBedelSql(value) { this.serbestliBedelSql = value; return this }
}
