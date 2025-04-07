class ModulExt_Hareketci_Cari extends ModulExt_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class ModulExt_Hareketci_Cari_SutAlim extends ModulExt_Hareketci_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static hareketTipSecim_kaListeDuzenle(e) { super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push( new CKodVeAdi(['sutAlimMakbuz', 'Süt Alım Makbuz']) ) }
	static uygunluk2UnionBilgiListeDuzenle(e) {
		super.uygunluk2UnionBilgiListeDuzenle(e); const {liste, uygunluk} = e;
		$.extend(liste, {
			sutAlimMakbuz: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fromAdd('topmakbuzfis fis').fis2AltHesapBagla()
						.leftJoin({ alias: 'fis', from: 'rota rot', on: 'fis.rotasayac = rot.kaysayac' })
						.fromIliski('topmakbuzara ara', 'fis.kaysayac = ara.fissayac').fromIliski('topmakbuzstok har', 'ara.kaysayac = har.arasayac')
						.fromIliski('carmst car', 'ara.mustahsilkod = car.must');
					wh.fisSilindiEkle().add(`ara.biptalmi = 0`, `fis.fistipi = 'M'`);
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'har.kaysayac', oncelik: 80, unionayrim: `'TMak'`, kayittipi: `'TPMAK'`, iceriktipi: `'TMAK'`,
						anaislemadi: `'Toplu Alım Makbuzu'`, isladi: `'Toplu Alım Makbuzu'`, refkod: 'rot.kod', refadi: 'rot.aciklama',
						fistipi: 'fis.fistipi', must: 'ara.mustahsilkod', fisnox: 'ara.makbuznox', althesapkod: 'fis.althesapkod',
						ba: `'A'`, bedel: 'har.sonuc', aciklama: 'fis.aciklama'
					})
				})
			]
		})
	}*/
}
