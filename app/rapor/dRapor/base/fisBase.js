class DRapor_Fis extends DRapor_Donemsel {
	static { window[this.name] = this; this._key2Class[this.name] = this }
}
class DRapor_Fis_Main extends DRapor_Donemsel_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addKAPrefix('sube', 'subegrup')
			.addGrup(new TabloYapiItem().setKA('ISARET', 'İşaret').secimKullanilir().setMFSinif(MQOzelIsaret).addColDef(new GridKolon({ belirtec: 'ozelisaret', text: 'İşaret', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('SUBE', 'Şube').secimKullanilir().setMFSinif(DMQSube).addColDef(new GridKolon({ belirtec: 'sube', text: 'Şube', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('SUBEGRUP', 'Şube Grup').secimKullanilir().setMFSinif(DMQSubeGrup).addColDef(new GridKolon({ belirtec: 'subegrup', text: 'Şube Grup', maxWidth: 450, filterType: 'checkedlist' })))
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, {sent} = stm, alias = e.alias ?? 'fis';
		$.extend(e, { alias, sent }); this.loadServerData_queryDuzenle_ek(e); sent.groupByOlustur()
	}
	loadServerData_queryDuzenle_ek(e) {
		let {stm, attrSet, alias} = e, {sent} = stm, {where: wh} = sent;
		this.donemBagla({ ...e, tarihSaha: `${alias}.tarih` }); wh.fisSilindiEkle()/*.add(`${alias}.ozelisaret <> 'X'`)*/;
		if (attrSet.SUBE || attrSet.SUBEGRUP) { sent.fis2SubeBagla() }
		for (const key in attrSet) {
			switch (key) {
				case 'ISARET': sent.sahalar.add(`${alias}.ozelisaret`); break
				case 'SUBE': sent.sahalar.add(`${alias}.bizsubekod subekod`, 'sub.aciklama subeadi'); wh.icerikKisitDuzenle_sube({ ...e, saha: `${alias}.bizsubekod` }); break
				case 'SUBEGRUP': sent.sahalar.add('sub.isygrupkod subegrupkod', 'igrp.aciklama subegrupadi'); wh.icerikKisitDuzenle_subeGrup({ ...e, saha: 'sub.isygrupkod' }); break
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'tarih' })
	}
}
