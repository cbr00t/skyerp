class ModulExt_Hareketci_Cari extends ModulExt_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class ModulExt_Hareketci_Cari_SutAlim extends ModulExt_Hareketci_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static hareketTipSecim_kaListeDuzenle(e) { super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push( new CKodVeAdi(['sutAlimMakbuz', 'Süt Alım Makbuz']) ) }
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
	}
}
class ModulExt_Hareketci_Cari_YazarKasa extends ModulExt_Hareketci_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static hareketTipSecim_kaListeDuzenle(e) {
		super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push(
			new CKodVeAdi(['ykZRapor', 'Yazar Kasa Z Raporu']),
			new CKodVeAdi(['kasiyerIslem', 'Kasiyer İşlem'])
		)
	}
	static uygunluk2UnionBilgiListeDuzenle(e) {
		super.uygunluk2UnionBilgiListeDuzenle(e); const {liste, uygunluk, sqlEmpty} = e, akt = app.params?.aktarim?.kullanim;
		$.extend(liste, {
			ykZRapor: [
				(akt.yazarKasa ? new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fromAdd('yktotalcari ykcar')
						.fromIliski('carmst car', 'ykcar.mustkod = car.must').fromIliski('yktotalfis yktot', 'ykcar.fissayac = yktot.kaysayac')
					wh.fisSilindiEkle('yktot').add(`ykcar.mustkod <> ''`);
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'ykcar.kaysayac', fissayac: 'yktot.kaysayac', ozelisaret: 'yktot.ozelisaret', oncelik: '145',
						unionayrim: `'ZTot'`, kayittipi: `'ZTot'`, iceriktipi: `'ZTot'`, anaislemadi: `'Z Total Bilgi'`, islemadi: `'YK. Veresiye'`, ba: `'B'`,
						bizsubekod: 'yktot.bizsubekod', refadi: 'yktot.zbilgi', tarih: 'yktot.tarih', must: 'ykcar.mustkod',
						fisnox: sqlEmpty, bedel: 'ykcar.bedel'
					})
				}) : null)
			].filter(x => !!x),
			kasiyerIslem: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fromAdd('kasiyerislem pisl')
						.fromIliski('carmst car', 'pisl.mustkod = car.must').fromIliski('kasiyer ksy', 'pisl.kasiyerkod = ksy.kod')
					wh.add(`pisl.mustkod <> ''`).degerAta(['NT', 'PT', 'NO'], 'pisl.tipkod');
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'pisl.kaysayac', ozelisaret: 'pisl.ozelisaret', oncelik: '150',
						unionayrim: `'Ksy'`, kayittipi: `'Ksy'`, iceriktipi: `'Ksy'`, anaislemadi: `'Kasiyer İşlemi'`, islemadi: `'Kasiyer İşlemi'`, ba: `dbo.tersba(pisl.ba)`,
						bizsubekod: 'pisl.bizsubekod', refkod: 'pisl.kasiyerkod', refadi: 'ksy.aciklama', tarih: 'pisl.tarih', fisnox: 'pisl.fisno',
						must: 'pisl.mustkod', bedel: 'pisl.bedel', aciklama: 'pisl.aciklama'
					})
				})
			]
		})
	}
}
class ModulExt_Hareketci_Cari_KonsinyeLojistik extends ModulExt_Hareketci_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static hareketTipSecim_kaListeDuzenle(e) { super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push( new CKodVeAdi(['konsinyeLojistik', 'Konsinye Resmi Kurum']) ) }
	static uygunluk2UnionBilgiListeDuzenle(e) {
		super.uygunluk2UnionBilgiListeDuzenle(e); const {liste, uygunluk} = e, {params} = app;
		let getUniBilgiler = (kayitTipi, adi, bedelSql, acikSql) => [
			new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fromAdd('piffis fis').fis2CariBagla()
					wh.fisSilindiEkle().add(`fis.piftipi = 'F'`, `fis.fisekayrim = ''`, `${bedelSql} > 0`);
				}).hvDuzenleIslemi(({ hv }) => {
					const kayitTipiSql = kayitTipi.sqlServerDegeri(), adiSql = adi.sqlServerDegeri();
					$.extend(hv, {
						kaysayac: 'fis.kaysayac', oncelik: '160', kayittipi: kayitTipiSql, unionayrim: `'KLoj'`,
						iade: 'fis.iade', must: 'fis.must', anaislemadi: adiSql, islemadi: adiSql, fisnox: 'fis.fisnox',
						ba: `(case when fis.gc = 'C' then 'A' else 'B' end)`, bedel: bedelSql, aciklama: 'fis.cariaciklama'
					})
				})
		];
		$.extend(liste, {
			konsinyeLojistik: [
				...getUniBilgiler('KLojD', 'Konsinye Damga Vergisi', 'fis.kldamgavergisi', 'fis.kldamgaacikkisim'),
				...getUniBilgiler('KLojR', 'Konsinye Reyon Bedeli', 'fis.klreyonbedeli', 'fis.klreyonacikkisim')
			]
		})
	}
}
class ModulExt_Hareketci_Cari_SiteYonetim extends ModulExt_Hareketci_Cari {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static hareketTipSecim_kaListeDuzenle(e) { super.hareketTipSecim_kaListeDuzenle(e); e.kaListe.push( new CKodVeAdi(['siteYonetimTahakkuk', 'Site Yönetim Tahakkuk']) ) }
	static uygunluk2UnionBilgiListeDuzenle(e) {
		super.uygunluk2UnionBilgiListeDuzenle(e); const {liste, uygunluk} = e;
		$.extend(liste, {
			siteYonetimTahakkuk: [
				new Hareketci_UniBilgi().sentDuzenleIslemi(({ sent }) => {
					const {where: wh} = sent; sent.fisHareket('sytahfis', 'sytahhar').har2CariBagla().fis2AltHesapBagla()
						.fromIliski('sytahgrup tgrp', 'fis.tahgrupkod = tgrp.kod')
				}).hvDuzenleIslemi(({ hv }) => {
					$.extend(hv, {
						kaysayac: 'har.kaysayac', ozelisaret: `''`, oncelik: 2, bizsubekod: `''`, kayittipi: `'SYON'`, unionayrim: `'SYonet'`,
						anaislemadi: 'tgrp.aciklama', fistipi: `''`, must: 'har.must', fisnox: `''`, althesapkod: 'fis.althesapkod',
						ba: `'B'`, isladi: 'tgrp.aciklama', bedel: 'har.bedel' 
					})
				})
			]
		})
	}
}
