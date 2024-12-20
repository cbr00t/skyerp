/*select fis.tarih, ....
	, sum(case when har.ba='B' then har.bedel else 0 end) borc
	, sum(case when har.ba='A' then har.bedel else 0 end) alacak
	. mhes.kod muhhesapkod, mhes.aciklama muhhesapadi
	. khes.kod kebirhesapkod, khes.aciklama kebirhesapadi
	. shes.kod sinifhesapkod, shes.aciklama sinifhesapadi
	. ches.kod cercevehesapkod, ches.aciklama cercevehesapadi
	. mhgrp.kod mhgrupkod, mhgrp.aciklama muhgrupadi	
from muhfis fis, muhhar har
	, muhhesap mhes, muhhesap khes, muhhesap shes, muhhesap ches
	, muhgrup mhgrp
where fis.maliyil=@MALIYIL@
	and fis.kaysayac=har.fissayac
	and har.muhhesapkod=mhes.kod
	and substring(mhes.kod,1,3)=khes.kod
	and substring(mhes.kod,1,2)=shes.kod
	and substring(mhes.kod,1,1)=ches.kod
	and mhes.grupkod=mhgrp.kod
group by ...*/

class DRapor_Muhasebe extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_Muhasebe' }
	static get kod() { return 'MUHASEBE' } static get aciklama() { return 'Muhasebe' } static get vioAdim() { return 'MH-R' } static get kategoriKod() { return 'TICARI' }
}
class DRapor_Muhasebe_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Muhasebe }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {toplamPrefix} = this.class, brmDict = app.params?.stokBirim?.brmDict ?? {}, {isAdmin, rol} = config.session ?? {};
		result
			.addKAPrefix('muhhesap', 'kebirhesap', 'sinifhesap', 'cercevehesap', 'muhgrup')
			.addGrup(new TabloYapiItem().setKA('MUHHESAP', 'Muh. Hesap').secimKullanilir().setMFSinif(DMQMuhHesap).addColDef(new GridKolon({ belirtec: 'muhhesap', text: 'Muh. Hesap', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('KEBIRHESAP', 'Kebir Hesap').secimKullanilir().setMFSinif(DMQMuhHesap).addColDef(new GridKolon({ belirtec: 'kebirhesap', text: 'Kebir Hesap', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('SINIFHESAP', 'Sınıf Hesap').secimKullanilir().setMFSinif(DMQMuhHesap).addColDef(new GridKolon({ belirtec: 'sinifhesap', text: 'Sınıf Hesap', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('CERCEVEHESAP', 'Çerçeve Hesap').secimKullanilir().setMFSinif(DMQMuhHesap).addColDef(new GridKolon({ belirtec: 'cercevehesap', text: 'Çerçeve Hesap', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('MUHGRUP', 'Muh. Grup').secimKullanilir().setMFSinif(DMQMuhGrup).addColDef(new GridKolon({ belirtec: 'muhgrup', text: 'Muh. Grup', maxWidth: 450, filterType: 'checkedlist' })));			
		result
			.addToplam(new TabloYapiItem().setKA('BORC', 'Borç').addColDef(new GridKolon({ belirtec: 'borc', text: 'Borç', genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))
			.addToplam(new TabloYapiItem().setKA('ALACAK', 'Alacak').addColDef(new GridKolon({ belirtec: 'alacak', text: 'Alacak', genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, {sent} = stm, {where: wh, sahalar} = sent;
		let muhParam = app.params.muhasebe ?? {}, maliYil = muhParam.maliYil || today().yil;
		$.extend(e, { sent, alias: 'fis' }); sent.fisHareket('muhfis', 'muhhar').har2MuhHesapBagla(); wh.degerAta(maliYil, 'fis.maliyil');
		for (const key in attrSet) {
			switch (key) {
				case 'MUHHESAP': sahalar.add('mhes.kod muhhesapkod', 'mhes.aciklama muhhesapadi'); wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'mhes.kod' }); break
				case 'KEBIRHESAP': sent.fromIliski('muhhesap khes', 'substring(mhes.kod, 1, 3) = khes.kod'); sahalar.add('khes.kod kebirhesapkod', 'khes.aciklama kebirhesapadi'); wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'khes.kod' }); break
				case 'SINIFHESAP': sent.fromIliski('muhhesap shes', 'substring(mhes.kod, 1, 2) = shes.kod'); sahalar.add('shes.kod sinifhesapkod', 'shes.aciklama sinifhesapadi'); wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'shes.kod' }); break
				case 'CERCEVEHESAP': sent.fromIliski('muhhesap ches', 'substring(mhes.kod, 1, 1) = ches.kod'); sahalar.add('ches.kod cercevehesapkod', 'ches.aciklama cercevehesapadi'); wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'ches.kod' }); break
				case 'MUHGRUP': sent.muhHesap2GrupBagla(); sahalar.add('mhes.grupkod muhgrupkod', 'mhgrp.aciklama muhgrupadi'); break
				case 'BORC': sahalar.add(`sum(case when har.ba = 'B' then har.bedel else 0 end) borc`); break
				case 'ALACAK': sahalar.add(`sum(case when har.ba = 'A' then har.bedel else 0 end) alacak`); break
			}
		}
		this.loadServerData_queryDuzenle_tarih(e).loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { }
}
