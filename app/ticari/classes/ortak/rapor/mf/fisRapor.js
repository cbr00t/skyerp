class FisRapor extends MasterFisRaporOrtak {
	get defaultRaporGrup() { return `FS_${this.mfKodListeTipi}` }
	get sabitKolonlar_detaylar() {
		let result = this._sabitKolonlar_detaylar;
		if (result == null) { const _e = { liste: [] }; this.sabitKolonlarOlustur_detaylar(_e); result = this._sabitKolonlar_detaylar = _e.liste }
		return result
	}
	
	constructor(e) { e = e || {}; super(e); }
	sabitKolonlarOlustur(e) { super.sabitKolonlarOlustur(e) }
	async kategorileriOlustur_ara(e) {
		await super.kategorileriOlustur_ara(e);
		const {mfSinif, kolonKategoriler} = this;
		let kat = new RKolonKategori({ kod: 'BAS', aciklama: 'Başlık Bilgileri', detaylar: this.sabitKolonlar });
		await this.kategoriDuzenle_baslik({ modelRapor: this, kat }); await mfSinif.raporKategorileriDuzenle_baslik({ modelRapor: this, kolonKategoriler, kat }); this.addKolonKategori(kat);
		await this.kategoriDuzenle_baslikDetayArasi({ modelRapor: this }); await mfSinif.raporKategorileriDuzenle_baslikDetayArasi({ modelRapor: this, kolonKategoriler, kat });
		kat = new RKolonKategori({ kod: 'DET', aciklama: 'Detaylar', detaylar: this.sabitKolonlar_detaylar });
		await this.kategoriDuzenle_detaylar({ modelRapor: this, kat }); await mfSinif.raporKategorileriDuzenle_detaylar({ modelRapor: this, kolonKategoriler, kat }); this.addKolonKategori(kat)
	}
	kategoriDuzenle_baslik(e) {
		const {mfSinif} = this, {kat} = e;
		kat.addDetay(new RRSahaDegisken({ attr: 'fissayac', baslik: ['Fiş', 'Kimlik ID'], genislikCh: 8, sql: `fis.kaysayac` }).tipNumerik())
	}
	kategoriDuzenle_baslikDetayArasi(e) { }
	kategoriDuzenle_detaylar(e) {
		const {kat} = e; kat.addDetay(
			new RRSahaDegisken({ attr: 'harsayac', baslik: ['Hareket', 'Kimlik ID'], genislikCh: 8, sql: `har.kaysayac` }).tipNumerik(),
			new RRSahaDegisken({ attr: 'harsira', baslik: ['Hareket', 'Sırası'], genislikCh: 8, sql: `har.seq` }).tipNumerik()
		)
	}
	sabitKolonlarOlustur_detaylar(e) { /* this.mfSinif.raporSabitKolonlarOlustur_detaylar(e) */ }
	async dataSourceDuzenle_ara(e) {
		await super.dataSourceDuzenle_ara(e);
		/*let query = this.queryOlustur_detaylar(e); if (query && query.getQueryYapi) query = query.getQueryYapi();
		if (query) { e.dataSource.Detay = { tip: 'query', veri: query }; await this.dataSourceDuzenle_detaylar_ara(e) */
	}
	async dataSourceDuzenle_detaylar_ara(e) { }
	queryDuzenle(e) {
		/* super yok */ const {mfSinif} = this, {table, detaySiniflar} = mfSinif, {rRapor, filtreRecs} = e;
		const {tumAttrListesi} = rRapor, tumAttrSet = asSet(tumAttrListesi); let tableAlias = 'fis', {stm} = e;
		const basSent = e.basSent = new MQSent({ from: `${table} ${tableAlias}` });
		const uni = e.uni = stm.sent = new MQUnionAll();
		for (let i = 0; i < detaySiniflar.length; i++) {
			const detaySinif = detaySiniflar[i], detayTable = detaySinif.table;
			const sent = new MQSent({ from: `${detayTable} har`, where: ['har.fissayac = fis.kaysayac'], birlestir: basSent }); uni.add(sent)
		}
		const _e = { modelRapor: this, stm, sent: basSent, attrListesi: tumAttrListesi, attrSet: tumAttrSet, filtreRecs, sahalarAlinmasin: true };
		mfSinif.loadServerData_queryDuzenle(_e); mfSinif.raporQueryDuzenle(_e); stm = _e.stm;
		const tbWhereClause = this.getTBWhereClause({ alias: tableAlias });
		for (const _sent of stm.getSentListe()) { _sent.sahalarVeGroupByVeHavingReset(); _sent.where.birlestir(tbWhereClause) }
		for (let i = 0; i < detaySiniflar.length; i++) {
			const detaySinif = detaySiniflar[i], detayTable = detaySinif.table, sent = stm.sent.liste[i];
			const _e = { modelRapor: this, fisSinif: mfSinif, detaySinif, detayTable, stm, uni, sent, index: i + 1, attrListesi: tumAttrListesi, attrSet: tumAttrSet, filtreRecs };
			/*mfSinif.loadServerData_detaylar_queryDuzenle(_e);				// ** bu işlem sonucunda _e.sent oluşur ve uni'ye add yapılmış olur
			const sent = _e.sent; sent.birlestir(basSent); sent.where.add(`har.fissayac = fis.kaysayac`); sent.sahalarVeGroupByVeHavingReset();*/
			this.queryKolonlariDuzenle(_e); mfSinif.raporQueryDuzenle_detaylar(_e); stm = _e.stm;
			sent.groupByOlustur(); sent.gereksizTablolariSil();
		}
		e.stm = stm
	}
}
