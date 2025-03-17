class SatisKosul_Fiyat extends SatisKosul {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get tipKod() { return 'FY' } static get aciklama() { return 'Fiyat' }
	static get table() { return 'fiyliste' } static get detayTables() { return { stok: 'fiytarife', grup: 'fiytargrup' } }
	static get detayMustTable() { return 'fiymust' }
	yukle_queryDuzenle({ stm, sent, mustKod }) {
		super.yukle_queryDuzenle(...arguments); let {where: wh, sahalar} = sent;
		wh.add(`fis.ayrimkod = ''`).inDizi(['', 'N'], 'fis.isaretdurum');
		sahalar.addWithAlias('fis', 'iskontoyok iskontoYokmu', 'promosyonyok promosyonYokmu')
	}
	getAltKosullar_queryDuzenle({ stm, sent, stokKodListe }) {
		super.getAltKosullar_queryDuzenle(...arguments); const {where: wh, sahalar} = sent, ekClause = 'har.ozelfiyat';
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
	static async _getAltKosulYapilar(e, _satisKosul, _mustKod) {
	    e = e ?? {}; let isObj = typeof e == 'object' && !$.isArray(e);
		let kodListe = $.makeArray(isObj ? e.kodListe ?? e.kod : e); if (!kodListe.length) { return {} }
		let satisKosul = isObj ? e.satisKosul ?? e.kosul : _satisKosul;
		/* Satış koulundan belirlemede mustKod değerine ihtiyaç yok, satisKosul nesnesinin içinde zaten atanmış durumdadır.
		       Ancak koşul yoksa satisKosul == null olacağı için, ek fiyat belirleme kısımlarında gerekli.
			   Normalde (mustkod == satisKosul.mustKod) - aynı değer - geleceği varsayılıyor
		*/
		let mustKod = isObj ? e.mustKod : _mustKod, result = {}, eksikKodSet = asSet(kodListe);
		/* 1) Satış Koşul varsa koşuldan fiyatları belirle.
			  Eksik kalan kısımlar için araştırmaya devam et */
	    if (satisKosul) {
	        for (let [stokKod, rec] of Object.entries(await satisKosul.getAltKosullar(kodListe))) {
	            result[stokKod] = rec; rec.kayitTipi = 'K';
	            if (rec.fiyat) { delete eksikKodSet[stokKod] }
	        }
	    }
	    if ($.isEmptyObject(eksikKodSet)) { return result }
		const musterisizListeFiyatiBelirle = async () => {
			let sent = new MQSent({
				from: 'stkmst', where: { inDizi: Object.keys(eksikKodSet), saha: 'kod' },
				sahalar: ['kod', 'satfiyat1 fiyat']
			});
			for (let {kod, fiyat} of await app.sqlExecSelect(sent)) {
				let rec = result[kod] = result[kod] ?? {};
				rec.fiyat = fiyat; delete eksikKodSet[kod]
			}
		};
		/* 2) Eksik kalanlar için - mustKod belirsiz ise doğrudan stok 1. fiyatı esas al */
		if (!mustKod) { await musterisizListeFiyatiBelirle(); return result }
		/* 3) 'mustKod' belli iken: Cari Fiyat Listesini kontrol et */ {
			let sent = new MQSent({
				from: 'carmst car', fromIliskiler: [
					{ from: 'carfiyatliste fis', iliski: 'car.fiyatlistekod = fis.kod' },
					{ from: 'carfiyattarife har', iliski: 'fis.kaysayac = har.fissayac' }
				], where: [
					{ inDizi: Object.keys(eksikKodSet), saha: 'har.stokkod' },
					{ degerAta: mustKod, saha: 'car.must' },
					`car.fiyatlistekod > ''`, 'har.satisfiyat > 0'
				],
				sahalar: ['car.fiyatlistekod kod', 'har.stokkod stokKod', 'har.satisfiyat fiyat']
			});
			const iskontoYokmu = false, promosyonYokmu = false;  /* ref: (SatisKosul::getAltKosullar) [in loop] */
			for (let {kod, stokKod, fiyat} of await app.sqlExecSelect(sent)) {
				let rec = result[stokKod] = result[stokKod] ?? {}, kayitTipi = 'L'; kod = `CR-${kod}`;
				$.extend(rec, { kayitTipi, fiyat, kod, iskontoYokmu, promosyonYokmu });
				delete eksikKodSet[stokKod]  /* Fiyatı bulunanları eksik listesinden çıkar */ 
			}
		}
		if ($.isEmptyObject(eksikKodSet)) { return result }
		/* 4) 'mustKod' belli iken: hala eksik fiyatlar varsa stok tanımından fiyatını belirle */ {
			let fiyatSayi = app.params.fiyatVeIsk.fiyatSayi || 1, fiyatClause = 'stk.satfiyat1';
			if (fiyatSayi > 1) {
				fiyatClause = '(CASE'; for (let i = 2; i <= fiyatSayi; i++) {
					fiyatClause += ` WHEN car.stkfytind = ${i} THEN stk.satfiyat${i}` }
		        fiyatClause += ' ELSE stk.satfiyat1 END)'
			}
			let sent = new MQSent({
				from: 'stkmst stk', where: [
					{ degerAta: mustKod, saha: 'car.must' },
					{ inDizi: Object.keys(eksikKodSet), saha: 'stk.kod' }
				],
				sahalar: ['stk.kod stokKod', `${fiyatClause} fiyat`]
			}).fromAdd('carmst car');
			/* const iskontoYokmu = false, promosyonYokmu = false; -- !! don't override flags */
			for (let {stokKod, fiyat} of await app.sqlExecSelect(sent)) {
				if (!fiyat) { continue }
				let rec = result[stokKod] = result[stokKod] ?? {}, kod = '', kayitTipi = 'S';
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
