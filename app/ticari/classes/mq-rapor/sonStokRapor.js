class SonStokRapor extends StokRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporGrup() { return 'SSON' }	
	constructor(e) { e = e || {}; super(e); }
	listeOlustur(e) {
		super.listeOlustur(e);
		this.grupTopluEkle([ { kod: 'yer', aciklama: 'Yer', renk: '#555', zeminRenk: 'lightgreen', kapali: true } ]);
		this.secimTopluEkle({
			yerKod: new SecimString({ mfSinif: MQStokYer, grupKod: 'yer' }),
			yerAdi: new SecimOzellik({ etiket: 'Yer Adı', grupKod: 'yer' })
		});
		this.whereBlockEkle(e => {
			const {aliasVeNokta} = e, sec = e.secimler, wh = e.where;
			wh.basiSonu(sec.yerKod, `${aliasVeNokta}yerkod`);
			wh.ozellik(sec.yerAdi, `yer.aciklama`);
		})
	}
	async stokKategorileriOlustur(e) {
		await super.stokKategorileriOlustur(e);
		const sections = ['SonStok-Yer', 'SonStok-YerGrup'];
		const kat = new RKolonKategori({ kod: 'SONSTOK', aciklama: 'Son Stoklar' }); await kat.ekSahaYukle({ section: sections });
		kat.addDetay(new RRSahaDegisken({ attr: 'miktar', baslik: 'Miktar', sql: `SUM(xtop.miktar)` }).tipDecimal('brm'));
		kat.addDetay(new RRSahaDegisken({ attr: 'miktar2', baslik: 'Miktar 2', sql: `SUM(xtop.miktar2)` }).tipDecimal('brm2'));
		for (const item of HMRBilgi.hmrIter()) {
			const sahalar = item.asRaporKolonlari({ alias: 'xtop' }); if (!$.isEmptyObject(sahalar)) kat.addDetaylar(sahalar)
		}
		this.addKolonKategori(kat)
	}
	async dataSourceDuzenle(e) {
		await super.dataSourceDuzenle(e);
		/*e.relations.push({ parent: { dsName: 'Data', colNames: ['kaysayac'] }, child: { dsName: 'Detay', colNames: ['fissayac'] } })*/
	}
	queryDuzenle(e) {
		super.queryDuzenle(e); const {stm, rRapor, filtreRecs} = e;
		let sent = new MQSent({
			from: 'sonstok son',
			fromIliskiler: [
				{ from: 'stkmst stk', iliski: 'stk.kod = son.stokkod' },
				{ from: 'stkyer yer', iliski: 'yer.kod = son.yerkod' }
			],
			where: [ { birlestir: this.getTBWhereClause({ alias: 'stk' }) }, 'son.opno is null' ]
		});
		sent.stokHepsiBagla(); sent.har2HMRBagla({ alias: 'son' });
		sent.sahalar.add('son.stokkod', 'son.yerkod', 'SUM(son.sonmiktar) miktar', 'SUM(son.sonmiktar2) miktar2');
		for (const item of HMRBilgi.hmrIter()) { const {rowAttr} = item; sent.sahalar.add(`son.${rowAttr}`) }
		sent.groupByOlustur(); sent.gereksizTablolariSil({ disinda: ['son', 'stk', 'yer'] });
		stm.with.add(sent.asTmpTable('toplamlar'));
		
		sent = stm.sent;
		sent.fromAdd('toplamlar xtop');
		sent.fromIliski('stkmst stk', 'stk.kod = xtop.stokkod');
		sent.fromIliski('stkyer yer', 'yer.kod = xtop.yerkod');
		sent.stokHepsiBagla(); sent.har2HMRBagla({ alias: 'xtop' });
		const _e = { sent, attrListesi: rRapor.tumAttrListesi, filtreRecs };
		this.queryKolonlariDuzenle(_e); sent.groupByOlustur(); sent.gereksizTablolariSil({ disinda: ['xtop', 'stk', 'yer'] });
	}
}
