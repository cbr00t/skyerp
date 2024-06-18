class MQMasterOrtak extends MQCogul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return null } static get secimSinif() { return null }
	static get silinebilirmi() { return false } static get raporKullanilirmi() { return false }
	static get idSahaDonusum() { return {} }
	static async orjBaslikListesi_argsDuzenle(e) {
		super.orjBaslikListesi_argsDuzenle(e);
		$.extend(args, { selectionMode: 'checkbox', showGroupsHader: false, showColumnsMenu: true, rowsHeight: 40 });
	}
	static loadServerData(e) {
		/*e = e || {}; const {promise} = app.getMQRecs($.extend({}, { defer: e.defer ?? false, cacheOnly: e.cacheOnly ?? false, mfSinif: e.mfSinif || this, query: e.query }, e)) || {};
		const recs = await promise; return recs*/
		return super.loadServerData(e)
	}
}
class MQKodOrtak extends MQKod {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } /* static get secimSinif() { return null } */
	static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static get idSaha() { return this.kodSaha }
	static loadServerData(e) { e = e || {}; return MQMasterOrtak.loadServerData($.extend({}, e, { mfSinif: this })) }
}
class MQKAOrtak extends MQKA {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } /* static get secimSinif() { return null } */
	static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static get idSaha() { return this.kodSaha }
	static loadServerData(e) { e = e || {}; return MQMasterOrtak.loadServerData($.extend({}, e, { mfSinif: this })) }
}
class MQSayacliOrtak extends MQSayacli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } /* static get secimSinif() { return null } */
	static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static get idSaha() { return this.sayacSaha }
	static loadServerData(e) { e = e || {}; return MQMasterOrtak.loadServerData($.extend({}, e, { mfSinif: this })) }
}
class MQDetayliOrtak extends MQDetayli {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tanimUISinif() { return MQMasterOrtak.tanimUISinif } /* static get secimSinif() { return null } */
	static get silinebilirmi() { return MQMasterOrtak.silinebilirmi } static get raporKullanilirmi() { return MQMasterOrtak.raporKullanilirmi }
	static get idSaha() { return this.sayacSaha }
	static loadServerData(e) { e = e || {}; return MQMasterOrtak.loadServerData($.extend({}, e, { mfSinif: this })) }
}
