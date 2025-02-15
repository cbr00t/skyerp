class DRapor_SonStok extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_SonStok' } get stokmu() { return true }
	static get kod() { return 'SONSTOK' } static get aciklama() { return 'Son Stok' } static get vioAdim() { return 'ST-LS' } static get kategoriKod() { return 'TICARI-STOK' }
}
class DRapor_SonStok_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_SonStok } get stokmu() { return this.rapor?.stokmu }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e, {toplamPrefix} = this.class, brmDict = app.params?.stokBirim?.brmDict ?? {}, {isAdmin, rol} = config.session ?? {};
		result
			.addKAPrefix('anagrup', 'grup', 'sistgrup', 'stok', 'yer', 'yergrup', 'sube', 'subegrup')
			.addGrup(new TabloYapiItem().setKA('SUBE', 'Şube').secimKullanilir().setMFSinif(DMQSube).addColDef(new GridKolon({ belirtec: 'sube', text: 'Şube', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('SUBEGRUP', 'Şube Grup').secimKullanilir().setMFSinif(DMQSubeGrup).addColDef(new GridKolon({ belirtec: 'subegrup', text: 'Şube Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STANAGRP', 'Stok Ana Grup').secimKullanilir().setMFSinif(DMQStokAnaGrup).addColDef(new GridKolon({ belirtec: 'anagrup', text: 'Stok Ana Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STGRP', 'Stok Grup').secimKullanilir().setMFSinif(DMQStokGrup).addColDef(new GridKolon({ belirtec: 'grup', text: 'Stok Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STISTGRP', 'Stok İst. Grup').secimKullanilir().setMFSinif(DMQStokIstGrup).addColDef(new GridKolon({ belirtec: 'sistgrup', text: 'Stok İst. Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('STOK', 'Stok').secimKullanilir().setMFSinif(DMQStok).addColDef(new GridKolon({ belirtec: 'stok', text: 'Stok', maxWidth: 600, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('DEPO', 'Depo').secimKullanilir().setMFSinif(DMQYer).addColDef(new GridKolon({ belirtec: 'yer', text: 'Depo', maxWidth: 500, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('DEPOGRUP', 'Depo Grup').secimKullanilir().setMFSinif(DMQYerGrup).addColDef(new GridKolon({ belirtec: 'yergrup', text: 'Depo Grup', maxWidth: 500, filterType: 'checkedlist' })));
		for (const tip of Object.keys(MQStokGenelParam.tip2BrmListe) ?? []) {
			const fra = brmDict[tip]; result.addToplam(new TabloYapiItem().setKA(`MIKTAR${tip}`, `Miktar (${tip})`)
				 .addColDef(new GridKolon({ belirtec: `miktar${tip}`, text: `${tip}`, genislikCh: 15, filterType: 'numberinput' }).tipDecimal(fra)))
		}
		if (isAdmin || !rol?.ozelRolVarmi('XMALYT')) {
			result
				.addToplam(new TabloYapiItem().setKA('ALIMNETFIYAT', 'Alım Net Fiyat').addColDef(new GridKolon({ belirtec: 'alimnetfiyat', text: 'Alım Net Fiyat', genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))
				/*.addToplam(new TabloYapiItem().setKA('SATISCIRO', 'Satış Ciro').addColDef(new GridKolon({ belirtec: 'satisciro', text: 'Satış Cirosu', genislikCh: 19, filterType: 'numberinput' }).tipDecimal_bedel()))*/
		}
		this.tabloYapiDuzenle_hmr(e)
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
				case 'ALIMNETFIYAT': sent.sahalar.add('SUM(son.sonmiktar * stk.almnetfiyat) alimnetfiyat'); break
				/*case 'SATISCIRO': sent.sahalar.add('SUM(son.sonmiktar * stk.satfiyat1) satisciro'); break*/
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
	loadServerData_queryDuzenle_ek(e) { super.loadServerData_queryDuzenle_ek(e) }
}
