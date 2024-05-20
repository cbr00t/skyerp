class CariRapor extends ModelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); }
	listeOlustur(e) { super.listeOlustur(e); MQCari.secimlerDuzenle({ secimler: this }) }
	async kategorileriOlustur(e) { await super.kategorileriOlustur(e); await this.cariKategorileriOlustur(e) }

	static async getCariKategori(e) {
		e = e || {}; const alinacaklar = asSet(e.alinacaklar || []), {cariGenel} = app.params, cariGenelKullanim = cariGenel.kullanim;
		const kat = new RKolonKategori({ kod: 'CARI', aciklama: 'Cari Bilgiler' });
		const sections = [
			'CarSabit0', 'CarSabit1',
			( cariGenelKullanim.konsolide ? 'CarSabit-Konsolide' : null ),
			'CarSabit2', 'CarSabit3', 'CarBFormKonsolide',
			( alinacaklar.banka ? 'CarSabitBanka' : null ),
			( alinacaklar.muhasebe ? 'CarSabitMuh' : null ),
			'CarSabit4',
			( alinacaklar.limit ? 'CarSabitLimit' : null ),
			( alinacaklar.plasiyer ? 'CarSabitPlasiyer' : null ),
			'CarSabitTahGun'
		];
		await kat.ekSahaYukle({ sections }); return kat
	}
	async cariKategorileriOlustur(e) { const kat = await this.class.getCariKategori(e); this.addKolonKategori(kat) }
}
