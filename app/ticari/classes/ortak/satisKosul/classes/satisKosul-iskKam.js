class SatisKosul_IskVeKamOrtak extends SatisKosul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get prefix() { return null } static get maxSayi() { return 0 }
	getAltKosullar_queryDuzenle({ stm, sent, stokKodListe }) {
		super.getAltKosullar_queryDuzenle(...arguments); const {where: wh, sahalar} = sent, {prefix, maxSayi} = this.class;
		wh.add(`har.${prefix}oran1 > 0`);
		for (let i = 1; i <= maxSayi; i++) { sahalar.add(`har.${prefix}oran${i} oran${i}`) }
	}
	static getAltKosulYapilar() { return this.stoklarIcinOranlar(...arguments) }
	/** Stoklar için Oran bilgilerini ver
		@example(s):
			let tarih = asDate('09.03.2025'), subeKod = '1001', mustKod = 'M120 10 001', stokKodListe = ['8691520102767', '8691520108325'], kapsam = { tarih, subeKod, mustKod };
			let satisKosul = new SatisKosul_Iskonto({ kapsam }); if (!await satisKosul.yukle()) { satisKosul = null }
			console.table(await SatisKosul_Iskonto.stoklarIcinOranlar(stokKodListe, satisKosul))

			let tarih = asDate('09.03.2025'), subeKod = '1001', mustKod = 'M120 10 001', stokKodListe = ['8691520102767', '8691520108325'], kapsam = { tarih, subeKod, mustKod };
			let satisKosul = new SatisKosul_Kampanya({ kapsam }); if (!await satisKosul.yukle()) { satisKosul = null }
			console.table(await SatisKosul_Kampanya.stoklarIcinOranlar(stokKodListe, satisKosul))

	*/
	static async stoklarIcinOranlar(e, _satisKosul) {
	    e = e ?? {}; let isObj = typeof e == 'object' && !$.isArray(e);
		let kodListe = $.makeArray(isObj ? e.kodListe ?? e.kod : e); if (!kodListe.length) { return {} }
		let satisKosul = isObj ? e.satisKosul ?? e.kosul : _satisKosul, result = {};
		/* Satış Koşul varsa koşuldan oranları belirle */
	    if (satisKosul) {
	        const kayitTipi = 'K'; for (let [xKod, rec] of Object.entries(await satisKosul.getAltKosullar(kodListe))) {
	            $.extend(rec, { xKod, kayitTipi });
				result[xKod] = rec
			}
	    }
		return result
	}
}
class SatisKosul_Iskonto extends SatisKosul_IskVeKamOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'SB' } static get aciklama() { return 'İskonto' } static get prefix() { return 'isk' }
	static get table() { return 'sabittarife' } static get detayTables() { return { stok: 'sbttarife', grup: 'sbttargrup' } }
	static get detayMustTable() { return 'sbtmust' } static get fisSayacSaha() { return 'sbtsayac' }
	static get maxSayi() { return app.params?.fiyatVeIsk?.iskSayi?.sabit || 0 }
}
class SatisKosul_Kampanya extends SatisKosul_IskVeKamOrtak {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'KM' } static get aciklama() { return 'İskonto' } static get prefix() { return 'kam' }
	static get table() { return 'kampanya' } static get detayTables() { return { stok: 'kamtarife', grup: 'kamtargrup' } }
	static get detayMustTable() { return 'kammust' } static get fisSayacSaha() { return 'kamsayac' }
	static get maxSayi() { return app.params?.fiyatVeIsk?.iskSayi?.kampanya || 0 }
}
