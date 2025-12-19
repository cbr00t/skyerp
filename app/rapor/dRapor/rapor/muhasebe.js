/*select fis.tarih, ....
	, SUM(case when har.ba='B' then har.bedel else 0 end) borc
	, SUM(case when har.ba='A' then har.bedel else 0 end) alacak
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
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		let {toplamPrefix} = this.class
		let brmDict = app.params?.stokBirim?.brmDict ?? {}
		let {isAdmin, rol} = config.session ?? {}
		result
			.addKAPrefix('sinifhesap', 'kebirhesap', 'cercevehesap', 'usthesap', 'muhhesap', 'muhgrup')
			.addGrupBasit('CERCEVEHESAP', 'Çerçeve Hesap', 'cercevehesap', DMQMuhHesap, null, ({ item }) => item.secimKullanilmaz())
			.addGrupBasit('SINIFHESAP', 'Sınıf Hesap', 'sinifhesap', DMQMuhHesap, null, ({ item }) => item.secimKullanilmaz())
			.addGrupBasit('KEBIRHESAP', 'Kebir Hesap', 'kebirhesap', DMQMuhHesap_Kebir)
			.addGrupBasit('USTHESAP', 'Üst Hesap', 'usthesap', DMQMuhUstHesap)
			.addGrupBasit('MUHHESAP', 'Muh. Hesap', 'muhhesap', DMQMuhHesap)
			.addGrupBasit('MUHGRUP', 'Muh. Grup', 'muhgrup', DMQMuhGrup)
			/*.addToplamBasit_bedel('BORC', 'Borç', 'borc')
			.addToplamBasit_bedel('ALACAK', 'Alacak', 'alacak')*/
		this.tabloYapiDuzenle_baBedelBasit(e)
		this.tabloYapiDuzenle_baBakiye(e)
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e)
		let {params: { muhasebe: muhParam = {} }} = app
		let maliYil = muhParam.maliYil || today().yil
		let {attrSet, stm: { sent, sent: { where: wh, sahalar } }} = e
		let alias = 'fis'; $.extend(e, { sent, alias })
		sent.fisHareket('muhfis', 'muhhar')
		sent.har2MuhHesapBagla()
		wh.degerAta(maliYil, 'fis.maliyil')
		this.donemBagla({ ...e, tarihSaha: 'fis.tarih' })
		for (let key in attrSet) {
			switch (key) {
				case 'CERCEVEHESAP': {
					sent.fromIliski('muhhesap ches', 'substring(mhes.kod, 1, 1) = ches.kod')
					sahalar.add('ches.kod cercevehesapkod', 'ches.aciklama cercevehesapadi')
					wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'ches.kod' })
					break
				}
				case 'SINIFHESAP': {
					sent.fromIliski('muhhesap shes', 'substring(mhes.kod, 1, 2) = shes.kod')
					sahalar.add('shes.kod sinifhesapkod', 'shes.aciklama sinifhesapadi')
					wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'shes.kod' })
					break
				}
				case 'KEBIRHESAP': {
					sent.fromIliski('muhhesap khes', 'substring(mhes.kod, 1, 3) = khes.kod')
					sahalar.add('khes.kod kebirhesapkod', 'khes.aciklama kebirhesapadi')
					wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'khes.kod' })
					break
				}
				case 'USTHESAP': {
					sent.leftJoin('mhes', 'muhhesap uhes', 'mhes.usthesapkod = uhes.kod')
					sahalar.add('mhes.usthesapkod', 'uhes.aciklama usthesapadi')
					wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'mhes.usthesapkod' })
					break
				}
				case 'MUHHESAP': {
					sahalar.add('mhes.kod muhhesapkod', 'mhes.aciklama muhhesapadi')
					wh.icerikKisitDuzenle_muhHesap({ ...e, saha: 'mhes.kod' })
					break
				}
				case 'MUHGRUP': {
					sent.muhHesap2GrupBagla()
					sahalar.add('mhes.grupkod muhgrupkod', 'mhgrp.aciklama muhgrupadi')
					break
				}
				/*case 'BORC': {
					sahalar.add(`SUM(case when har.ba = 'B' then har.bedel else 0 end) borc`)
					break
				}
				case 'ALACAK': {
					sahalar.add(`SUM(case when har.ba = 'A' then har.bedel else 0 end) alacak`)
					break
				}*/
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'tarih' })
		{
			let baClause = 'har.ba', bedelClause = 'har.bedel'
			this.loadServerData_queryDuzenle_baBedel({ ...e, baClause, bedelClause })
		}
		this.loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_ek(e) { super.loadServerData_queryDuzenle_ek(e) }
}
