class TestSecimler extends Secimler {
    static { window[this.name] = this; this._key2Class[this.name] = this }
	listeOlustur(e) {
		super.listeOlustur(e); const {liste} = e; this.grupTopluEkle([ { kod: 'diger', aciklama: 'Diger', zeminRenk: '#aaa', kapali: true } ])
		const serbestListe = ['item1', 'item2', 'item3', 'x1', 'x2', 'y1', 'y2'];
		$.extend(liste, {
			cariKod: new SecimString({ mfSinif: MQCari }), cariUnvan: new SecimOzellik({ etiket: 'Cari Ünvan' }),
			seri: new SecimString({ etiket: 'Seri' }), no: new SecimNumber({ etiket: 'Belge no' }),
			aktiflik: new SecimTekSecim({ etiket: 'Aktiflik', tekSecim: new BuDigerVeHepsi([`<span class="forestgreen">Aktif</span>`, `<span class="indianred">Devre Dışı</span>`]).bu() }),
			serbestListe: new SecimBirKismi({ etiket: 'Serbest Liste ile Bir Kısmı', kaListe: serbestListe.map((item, index) => new CKodVeAdi([index, item])) }),
			tarih: new SecimDate({ etiket: 'Tarih', basiSonu: today() })
		})
	}
}
