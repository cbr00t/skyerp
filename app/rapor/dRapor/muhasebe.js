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

class DRapor_Muhasebe extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_Muhasebe' }
	static get kod() { return 'MUHASEBE' } static get aciklama() { return 'Muhasebe' } static get vioAdim() { return 'MH-R' } static get kategoriKod() { return 'TICARI' }
}
class DRapor_Muhasebe_Main extends DRapor_AraSeviye_Main {
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
		super.loadServerData_queryDuzenle(e); const {stm, attrSet} = e, PrefixMiktar = 'MIKTAR'; let {sent} = stm, {where: wh, sahalar} = sent;
		$.extend(e, { sent, alias: 'son' }); sent.fromAdd('sonstok son').son2StokBagla(); wh.add('son.opno IS NULL');
		if (attrSet.STGRP) { sent.stok2GrupBagla() } if (attrSet.STANAGRP) { sent.stokGrup2AnaGrupBagla() } if (attrSet.STISTGRP) { sent.stok2IstGrupBagla() }
		if (attrSet.DEPOGRUP || attrSet.DEPO || attrSet.SUBE || attrSet.SUBEGRUP) { sent.son2YerBagla() } if (attrSet.DEPOGRUP) { sent.yer2GrupBagla() }
		if (attrSet.SUBE || attrSet.SUBEGRUP) { sent.yer2SubeBagla() } if (attrSet.SUBEGRUP) { sent.sube2GrupBagla() }
		if (attrSet.STOK || Object.keys(attrSet).find(x => x.startsWith(PrefixMiktar))) { sahalar.add('brm') }
		for (const key in attrSet) {
			switch (key) {
				case 'SUBE': sahalar.add('yer.bizsubekod subekod', 'sub.aciklama subeadi'); wh.icerikKisitDuzenle_sube({ ...e, saha: 'fis.bizsubekod' }); break
				case 'SUBEGRUP': sahalar.add('sub.isygrupkod subegrupkod', 'igrp.aciklama subegrupadi'); wh.icerikKisitDuzenle_subeGrup({ ...e, saha: 'sub.isygrupkod' }); break
				case 'STANAGRP': sent.stokGrup2AnaGrupBagla(); sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_stokAnaGrup({ ...e, saha: 'grp.anagrupkod' }); break
				case 'STGRP': sent.stok2GrupBagla(); sahalar.add('stk.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_stokGrup({ ...e, saha: 'stk.grupkod' }); break
				case 'STISTGRP': sent.stok2IstGrupBagla(); sahalar.add('stk.sistgrupkod', 'sigrp.aciklama sistgrupadi'); wh.icerikKisitDuzenle_stokIstGrup({ ...e, saha: 'grp.sistgrupkod' }); break
				case 'STOK': sahalar.add('son.stokkod', 'stk.aciklama stokadi'); wh.icerikKisitDuzenle_stok({ ...e, saha: 'son.stokkod' }); break
				case 'DEPO': sahalar.add('son.yerkod', 'yer.aciklama yeradi'); wh.icerikKisitDuzenle_yer({ ...e, saha: 'son.yerkod' }); break
				case 'DEPOGRUP': sahalar.add('yer.yergrupkod yergrupkod', 'ygrp.aciklama yergrupadi'); wh.icerikKisitDuzenle_yerGrup({ ...e, saha: 'yer.yergrupkod' }); break
				case 'ALIMNETFIYAT': sent.sahalar.add('SUM(son.sonmiktar * stk.almnetfiyat) satisciro'); break
				case 'SATISCIRO': sent.sahalar.add('SUM(son.sonmiktar * stk.satfiyat1) satisciro'); break
				case PrefixMiktar: sahalar.add('SUM(son.sonmiktar) miktar'); break
				default:
					if (key.startsWith(PrefixMiktar)) {
						const brmTip = key.slice(PrefixMiktar.length)?.toUpperCase();
						sahalar.add(`${this.getBrmliMiktarClause({ brmTip, mstAlias: 'stk', harAlias: 'son', miktarPrefix: 'son' })} miktar${brmTip}`)
					}
					break
			}
		}
		this.loadServerData_queryDuzenle_hmr(e).loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) { }
}
