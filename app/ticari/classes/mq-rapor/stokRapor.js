class StokRapor extends ModelRapor {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	constructor(e) { e = e || {}; super(e); }
	listeOlustur(e) { super.listeOlustur(e); MQStok.secimlerDuzenle({ secimler: this }) }
	async kategorileriOlustur(e) { await super.kategorileriOlustur(e); await this.stokKategorileriOlustur(e) }
	static async getStokKategori(e) {
		const kat = new RKolonKategori({ kod: 'STOK', aciklama: 'Stok Bilgiler' });
		const sections = ['STOKSABIT1', 'STOKSABIT2', 'STOKSABIT3']; await kat.ekSahaYukle({ sections }); return kat
	}
	async stokKategorileriOlustur(e) { const kat = await this.class.getStokKategori(e); this.addKolonKategori(kat) }
}
