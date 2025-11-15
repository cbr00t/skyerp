class SatisKosul_AlimAnlasma extends SatisKosul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'AL' } static get aciklama() { return 'Alım Anlaşma' } static get alimmi() { return true }
	static get table() { return 'alimanlasma' } static get detayTables() { return { stok: 'anlastarife', grup: 'anlastargrup' } }
	static get detayMustTable() { return 'fiymust' }
	yukle_queryDuzenle({ stm, sent, mustKod }) {  /* edt: a!cbr00t-CGP */
		let {kapsam} = this, {table} = this.class;
		let {where: wh, sahalar} = sent, {orderBy} = stm, alias = 'fis';
		let tipListe = ['tarih'], {tip2RowAttrListe} = SatisKosulKapsam;
		let mustSqlDegeri = MQSQLOrtak.sqlServerDegeri(mustKod);
		sent.fromAdd(`${table} ${alias}`); wh.fisSilindiEkle().add(`${alias}.devredisi = ''`);
		wh.add(`fis.ayrimkod = ''`, `fis.almsat = 'A'`);
		if (mustKod) { wh.degerAta(mustKod, `${alias}.must`) }
		kapsam?.uygunlukClauseDuzenle({ alias, where: wh, alim: true });
		sahalar.addWithAlias(alias, 'kaysayac sayac', 'kod', 'aciklama', 'dvkod dvKod');
		for (let tip of tipListe) {
			let rowAttrs = tip2RowAttrListe[tip] ?? [`${tip}b`, `${tip}s`];
			if (rowAttrs?.length) { sahalar.addWithAlias('fis', ...rowAttrs) }
		}
		sahalar.addWithAlias('fis', 'must mustb', 'must musts');
		orderBy.add('tarihb', 'kod')
	}
	getAltKosullar_queryDuzenle({ stm, sent, stokKodListe }) {
		super.getAltKosullar_queryDuzenle(...arguments); let {where: wh, sahalar} = sent, ekClause = 'har.ozelfiyat';
		wh.add(`${ekClause} > 0`); sahalar.add(`${ekClause} fiyat`, 'har.endusukfiyat enDusukFiyat')
	}
	/** Stoklar için Fiyat, En Düşük Fiyat bilgilerini ver
		@example(s):
			let tarih = asDate('09.03.2025'), subeKod = '1001', mustKod = 'M120 10 001', stokKodListe = ['8691520102767', '8691520108325'], kapsam = { tarih, subeKod, mustKod };
			let satisKosul = new SatisKosul_Fiyat({ kapsam }); if (!await satisKosul.yukle()) { satisKosul = null }
			console.table(await SatisKosul_Fiyat.getAltKosulYapilar(stokKodListe, satisKosul, mustKod))
	*/
	static async getAltKosulYapilar(e, _satisKosul, _mustKod) {
		let result = await this._getAltKosulYapilar(e, _satisKosul, _mustKod); if (result) {
			for (const [xKod, rec] of Object.entries(result)) {
				if (rec.detTip == null) { rec.detTip = 'S' }
				if (rec.xKod == null) { rec.xKod = xKod }
			}
		}
		return result
	}
	static async _getAltKosulYapilar(e, _satisKosullar, _mustKod) {
	    e = e ?? {}; let isObj = typeof e == 'object' && !$.isArray(e);
		let kodListe = $.makeArray(isObj ? e.kodListe ?? e.kod : e); if (!kodListe.length) { return {} }
		let satisKosullar = $.makeArray(isObj ? e.satisKosullar ?? e.satisKosul ?? e.kosullar ?? e.kosul : _satisKosullar);
		/* Satış koulundan belirlemede mustKod değerine ihtiyaç yok, satisKosul nesnesinin içinde zaten atanmış durumdadır.
		       Ancak koşul yoksa satisKosul == null olacağı için, ek fiyat belirleme kısımlarında gerekli.
			   Normalde (mustkod == satisKosul.mustKod) - aynı değer - geleceği varsayılıyor
		*/
		let mustKod = isObj ? e.mustKod : _mustKod, eksikKodSet = asSet(kodListe);
		/* 1) Satış Koşul varsa koşuldan fiyatları belirle.
			  Eksik kalan kısımlar için araştırmaya devam et */
		let result = {}; if (!$.isEmptyObject(satisKosullar)) {
			let altKosullar = {}; for (let kosul of satisKosullar) {
				$.extend(altKosullar, await kosul.getAltKosullar(kodListe)) }
	        for (let [stokKod, rec] of Object.entries(altKosullar)) {
	            result[stokKod] ??= rec; rec.kayitTipi = 'K';
	            if (rec.fiyat) { delete eksikKodSet[stokKod] }
	        }
	    }
	    if ($.isEmptyObject(eksikKodSet)) { return result }
		let musterisizListeFiyatiBelirle = async () => {
			let fiyatClause = 'stk.almfiyat';
			let sent = new MQSent({
				from: 'stkmst stk',
				where: { inDizi: keys(eksikKodSet), saha: 'stk.kod' },
				sahalar: ['stk.kod', `${fiyatClause} fiyat`]
			});
			for (let {kod, fiyat} of await app.sqlExecSelect(sent)) {
				let rec = result[kod] = result[kod] ?? {};
				rec.fiyat = fiyat; delete eksikKodSet[kod]
			}
		};
		/* 2) Eksik kalanlar için - mustKod belirsiz ise doğrudan stok 1. fiyatı esas al */
		if (!mustKod) { await musterisizListeFiyatiBelirle(); return result }
		if ($.isEmptyObject(eksikKodSet)) { return result }
		/* 4) 'mustKod' belli iken: hala eksik fiyatlar varsa stok tanımından fiyatını belirle */ {
			let fiyatClause = 'stk.almfiyat';
			let sent = new MQSent({
				from: 'stkmst stk', where: { inDizi: keys(eksikKodSet), saha: 'stk.kod' },
				sahalar: ['stk.kod stokKod', `${fiyatClause} fiyat`]
			});
			/* const iskontoYokmu = false, promosyonYokmu = false; -- !! don't override flags */
			for (let {stokKod, fiyat} of await app.sqlExecSelect(sent)) {
				if (!fiyat) { continue }
				let rec = result[stokKod] ??= {}, kod = '', kayitTipi = 'S';
				$.extend(rec, { kayitTipi, kod, fiyat }); delete eksikKodSet[stokKod]
			}
		}
		if ($.isEmptyObject(eksikKodSet)) { return result }
		/* 5) 'mustKod' hatalı da olabilir.
		       Eksik kalanlar için - 'Müşterisiz Liste Fiyatı Belirle' işlemini uygula */
		await musterisizListeFiyatiBelirle();
		return result
	}
}
