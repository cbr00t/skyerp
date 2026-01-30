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
		super.getAltKosullar_queryDuzenle(...arguments)
		let {where: wh, sahalar} = sent
		let ekClause = 'har.ozelfiyat'
		wh.add(`${ekClause} > 0`)
		sahalar.add(`${ekClause} fiyat`, 'har.endusukfiyat enDusukFiyat')
	}
	/** Stoklar için Fiyat, En Düşük Fiyat bilgilerini ver
		@example(s):
			let tarih = asDate('09.03.2025'), subeKod = '1001', mustKod = 'M120 10 001', stokKodListe = ['8691520102767', '8691520108325'], kapsam = { tarih, subeKod, mustKod };
			let satisKosul = new SatisKosul_Fiyat({ kapsam }); if (!await satisKosul.yukle()) { satisKosul = null }
			console.table(await SatisKosul_Fiyat.getAltKosulYapilar(stokKodListe, satisKosul, mustKod))
	*/
	static async getAltKosulYapilar(e, _satisKosul, _mustKod) {
		e ??= {}
		let cache = this._cache ??= {}
		let anah = toJSONStr({ ...e, _satisKosul, _mustKod })
		let result = cache[anah] ??= await this._getAltKosulYapilar(e, _satisKosul, _mustKod)
		if (result) {
			for (const [xKod, rec] of entries(result)) {
				rec.detTip ??= 'S'
				rec.xKod ??= xKod
			}
		}
		return result
	}
	static async _getAltKosulYapilar(e = {}, _kosullar, _mustKod) {
	    let isObj = isObject(e) && !isArray(e)
		let kodListe = makeArray(isObj ? e.kodListe ?? e.kod : e)
		if (empty(kodListe))
			return {}
		let kosullar = makeArray(isObj ? e.kosullar ?? e.kosul : _kosullar)
		let mustKod = isObj ? e.mustKod : _mustKod
		let result = {}, eksikKodSet = asSet(kodListe)
		if (!empty(kosullar)) {
			let altKosullar = {}
			for (let kosul of kosullar)
				$.extend(altKosullar, await kosul.getAltKosullar(kodListe))
	        for (let [stokKod, rec] of entries(altKosullar)) {
	            result[stokKod] ??= rec
				rec.kayitTipi = 'K'
	            if (rec.fiyat)
					delete eksikKodSet[stokKod]
	        }
	    }
	    if (empty(eksikKodSet))
			return result
		
		let musterisizListeFiyatiBelirle = async () => {
			let sent = new MQSent({
				from: 'stkmst stk',
				where: { inDizi: keys(eksikKodSet), saha: 'stk.kod' },
				sahalar: ['stk.kod', 'stk.satfiyat1 fiyat']
			})
			for (let {kod, fiyat} of await MQCogul.sqlExecSelect(sent)) {
				let rec = result[kod] = result[kod] ?? {}
				rec.fiyat = fiyat
				delete eksikKodSet[kod]
			}
		}
		if (!mustKod) {
			await musterisizListeFiyatiBelirle()
			return result
		}
		
		{
			let sent = new MQSent({
				from: 'carmst car', fromIliskiler: [
					{ from: 'carfiyatliste fis', iliski: 'car.fiyatlistekod = fis.kod' },
					{ from: 'carfiyattarife har', iliski: 'fis.kaysayac = har.fissayac' }
				], where: [
					{ inDizi: keys(eksikKodSet), saha: 'har.stokkod' },
					{ degerAta: mustKod, saha: 'car.must' },
					`car.fiyatlistekod > ''`, 'har.satisfiyat > 0'
				],
				sahalar: ['car.fiyatlistekod kod', 'har.stokkod stokKod', 'har.satisfiyat fiyat']
			});
			let iskontoYokmu = false, promosyonYokmu = false
			for (let {kod, stokKod, fiyat} of await MQCogul.sqlExecSelect(sent)) {
				kod = `CR-${kod}`
				let kayitTipi = 'L', rec = result[stokKod] ??= {}
				$.extend(rec, { kayitTipi, fiyat, kod, iskontoYokmu, promosyonYokmu })
				delete eksikKodSet[stokKod]    // Fiyatı bulunanları eksik listesinden çıkar */ 
			}
		}
		if (empty(eksikKodSet))
			return result
		
		{
			let fiyatSayi = app.params.fiyatVeIsk.fiyatSayi || 1
			let fiyatClause = 'stk.satfiyat'
			if (fiyatSayi > 1) {
				fiyatClause = '(CASE'
				for (let i = 2; i <= fiyatSayi; i++)
					fiyatClause += ` WHEN car.stkfytind = ${i} THEN stk.satfiyat${i}`
		        fiyatClause += ' ELSE stk.satfiyat END)'
			}
			let sent = new MQSent({
				from: 'stkmst stk',
				where: [
					{ degerAta: mustKod, saha: 'car.must' },
					{ inDizi: keys(eksikKodSet), saha: 'stk.kod' }
				],
				sahalar: ['stk.kod stokKod', `${fiyatClause} fiyat`]
			}).fromAdd('carmst car')
			for (let {stokKod, fiyat} of await MQCogul.sqlExecSelect(sent)) {
				if (!fiyat)
					continue
				let rec = result[stokKod] ??= {}, kod = '', kayitTipi = 'S'
				$.extend(rec, { kayitTipi, kod, fiyat })
				delete eksikKodSet[stokKod]
			}
		}
		if (empty(eksikKodSet))
			return result

		await musterisizListeFiyatiBelirle()
		return result
	}
}
