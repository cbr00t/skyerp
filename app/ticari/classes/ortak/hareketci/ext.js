class ModulExt_Hareketci_Cari extends ModulExt_Hareketci { static { window[this.name] = this; this._key2Class[this.name] = this } }
class ModulExt_Hareketci_Cari_SutAlim extends ModulExt_Hareketci_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static hareketTipSecim_kaListeDuzenle(e) { super.hareketTipSecim_kaListeDuzenle(e); const {kaListe} = e; kaListe.push( new CKodVeAdi(['sutAlimMakbuz', 'Süt Alım Makbuz']) ) }
	static uygunluk2UnionBilgiListeDuzenle(e) {
		super.uygunluk2UnionBilgiListeDuzenle(e); const {liste} = e; $.extend(liste, {
			sutAlimMakbuz: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where;
					sent.fromAdd('topmakbuzfis fis').fromIliski('topmakbuzara ara', 'fis.kaysayac = ara.fissayac').fromIliski('topmakbuzstok har', 'ara.kaysayac = har.arasayac')
						.fromIliski('carmst car', 'ara.mustahsilkod = car.must').leftJoin({ alias: 'fis', from: 'rota rot', on: 'fis.rotasayac = rot.kaysayac' }).fis2AltHesapBagla();
					wh.fisSilindiEkle().add(`ara.biptalmi = 0`, `fis.fistipi = 'M'`);
				}).hvDuzenleIslemi(e => {
					let fisNoxClause = `(case when har.belgeno = 0 then fis.fisnox else har.belgenox end)`, vadeSql = 'fis.tarih', fisNoxSql = 'ara.makbuznox', mustSql = 'ara.mustahsilkod';
					$.extend(e.hv, {
						kaysayac: 'har.kaysayac', unionayrim: `'TMak'`, oncelik: '80', fistipi: 'fis.fistipi', kayittipi: `'TPMAK'`, anaislemadi: `'Toplu Alım Makbuzu'`,
						isladi: `'Toplu Alım Makbuzu'`, ba: `'A'`, vade: vadeSql, karsiodemetarihi: vadeSql,
						seri: 'ara.makbuzseri', noyil: 'ara.makbuznoyil', fisno: 'ara.makbuzno', fisnox: fisNoxSql, disfisnox: fisNoxSql,
						must: mustSql, asilmust: mustSql, althesapkod: 'fis.althesapkod', althesapadi: 'alth.aciklama',
						refkod: 'rot.kod', refadi: 'rot.aciklama', bedel: 'har.sonuc', aciklama: 'fis.aciklama'
					})
				})
			]
		})
	}
}
class ModulExt_Hareketci_Cari_YazarKasa extends ModulExt_Hareketci_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static hareketTipSecim_kaListeDuzenle(e) { super.hareketTipSecim_kaListeDuzenle(e); const {kaListe} = e; kaListe.push( new CKodVeAdi(['yazarKasa', 'Yazar Kasa']) ) }
	static uygunluk2UnionBilgiListeDuzenle(e) {
		super.uygunluk2UnionBilgiListeDuzenle(e); const {liste} = e; $.extend(liste, {
			yazarKasa: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(e => {
					const {sent} = e, wh = sent.where;
					sent.fromAdd('yktotalcari ykcar').fromIliski('carmst car', 'ykcar.mustkod = car.must').fromIliski('yktotalfis yktot', 'ykcar.fissayac = yktot.kaysayac')
					wh.fisSilindiEkle('yktot').add(`ykcar.mustkod <> ''`);
				}).hvDuzenleIslemi(e => {
					$.extend(e.hv, {
						kaysayac: 'ykcar.kaysayac', ozelisaret: 'yktot.ozelisaret', oncelik: '15', unionayrim: `'ZTot'`, kayittipi: `'ZTot'`, iceriktipi: 'ZTot',
						anaislemadi: `'Z Total Bilgi'`, isladi: `'YK. Veresiye'`, ba: `'B'`, must: 'ykcar.mustkod', asilmust: 'ykcar.mustkod',
						tarih: 'yktot.tarih', karsiodemetarihi: 'yktot.tarih', vade: 'yktot.tarih', refadi: 'yktot.zbilgi', bedel: 'har.sonuc',
						fissayac: 'yktot.kaysayac', sonzamants: 'yktot.tarih'
					})
				})
			]
		})
	}
}
