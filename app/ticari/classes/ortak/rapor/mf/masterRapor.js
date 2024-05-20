class MasterRapor extends MasterFisRaporOrtak {
	get defaultRaporGrup() { return `K_${this.mfKodListeTipi}` }
	
	constructor(e) {
		e = e || {};
		super(e);
	}

	sabitKolonlarOlustur(e) {
		super.sabitKolonlarOlustur(e);
		
		this.mfSinif.raporSabitKolonlarOlustur(e)
	}

	async kategorileriOlustur_ara(e) {
		await super.kategorileriOlustur_ara(e);

		const kat = new RKolonKategori({
			kod: 'MAS', aciklama: 'Master Bilgiler',
			detaylar: this.sabitKolonlar
		});
		await this.kategoriDuzenle_master({ modelRapor: this, kat: kat });
		await this.mfSinif.raporKategorileriDuzenle_master({ modelRapor: this, kolonKategoriler: this.kolonKategoriler, kat: kat });
		this.addKolonKategori(kat);
	}

	kategoriDuzenle_master(e) {
	}
}
