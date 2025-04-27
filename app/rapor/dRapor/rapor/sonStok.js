class DRapor_SonStok extends DRapor_AraSeviye {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get altRaporClassPrefix() { return 'DRapor_SonStok' } get stokmu() { return true }
	static get kod() { return 'SONSTOK' } static get aciklama() { return 'Son Stok' } static get vioAdim() { return 'ST-LS' } static get kategoriKod() { return 'TICARI-STOK' }
}
class DRapor_SonStok_Main extends DRapor_AraSeviye_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_SonStok } get stokmu() { return this.rapor?.stokmu }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e);
		let {result} = e, {toplamPrefix} = this.class, {isAdmin, rol} = config.session ?? {};
		let brmDict = app.params?.stokBirim?.brmDict ?? {}, {tip2BrmListe} = MQStokGenelParam;
		let brmListe = Object.keys(tip2BrmListe ?? {});
		result
			.addKAPrefix('anagrup', 'grup', 'sistgrup', 'stok', 'yer', 'yergrup', 'sube', 'subegrup')
			.addGrupBasit('SUBE', 'Şube', 'sube', DMQSube)
			.addGrupBasit('SUBEGRUP', 'Şube Grup', 'subegrup', DMQSubeGrup)
			.addGrupBasit('STANAGRP', 'Stok Ana Grup', 'anagrup', DMQStokAnaGrup)
			.addGrupBasit('STGRP', 'Stok Grup', 'grup', DMQStokGrup)
			.addGrupBasit('STISTGRP', 'Stok İst. Grup', 'sistgrup', DMQStokIstGrup)
			.addGrupBasit('STOK', 'Stok', 'stok', DMQStok)
			.addGrupBasit('STOKRESIM', 'Stok Resim', 'stokresim');
		this.tabloYapiDuzenle_yer(e);
		for (let tip of brmListe) {
			let fra = brmDict[tip];
			result.addToplamBasit(`MIKTAR${tip}`, `Miktar (${tip})`, `miktar${tip}`, null, 100, ({ colDef }) => colDef.tipDecimal(fra))
		}
		if (isAdmin || !rol?.ozelRolVarmi('XMALYT')) {
			result
				.addToplamBasit_bedel('DEG_ALIMNETFIYAT', 'Değerleme: Alım Net Fiyat', 'deg_alimnetfiyat')
				.addToplamBasit_bedel('DEG_ORTMALIYET', 'Değerleme: Ort. Maliyet', 'deg_ortmaliyet')
				.addToplamBasit_bedel('DEG_RAYICALIM', 'Değerleme: Rayiç Alım', 'deg_rayicalim')
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
		let degMiktarClause = `(case when stk.almfiyatmiktartipi = '2' then son.sonmiktar2 else son.sonmiktar end)`;
		for (const key in attrSet) {
			switch (key) {
				case 'SUBE': sahalar.add('yer.bizsubekod subekod', 'sub.aciklama subeadi'); wh.icerikKisitDuzenle_sube({ ...e, saha: 'fis.bizsubekod' }); break
				case 'SUBEGRUP': sahalar.add('sub.isygrupkod subegrupkod', 'igrp.aciklama subegrupadi'); wh.icerikKisitDuzenle_subeGrup({ ...e, saha: 'sub.isygrupkod' }); break
				case 'STANAGRP': sent.stokGrup2AnaGrupBagla(); sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_stokAnaGrup({ ...e, saha: 'grp.anagrupkod' }); break
				case 'STGRP': sent.stok2GrupBagla(); sahalar.add('stk.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_stokGrup({ ...e, saha: 'stk.grupkod' }); break
				case 'STISTGRP': sent.stok2IstGrupBagla(); sahalar.add('stk.sistgrupkod', 'sigrp.aciklama sistgrupadi'); wh.icerikKisitDuzenle_stokIstGrup({ ...e, saha: 'grp.sistgrupkod' }); break
				case 'STOK': sahalar.add('son.stokkod', 'stk.aciklama stokadi'); wh.icerikKisitDuzenle_stok({ ...e, saha: 'son.stokkod' }); break
				case 'STOKRESIM': sahalar.add('son.stokkod resimid', 'NULL stokresim'); break
				case 'DEPO': sahalar.add('son.yerkod', 'yer.aciklama yeradi'); wh.icerikKisitDuzenle_yer({ ...e, saha: 'son.yerkod' }); break
				case 'DEPOGRUP': sahalar.add('yer.yergrupkod yergrupkod', 'ygrp.aciklama yergrupadi'); wh.icerikKisitDuzenle_yerGrup({ ...e, saha: 'yer.yergrupkod' }); break
				case 'DEG_ALIMNETFIYAT': sahalar.add(`SUM(${degMiktarClause} * stk.almnetfiyat) deg_alimnetfiyat`); break
				case 'DEG_ORTMALIYET': sahalar.add(`SUM(${degMiktarClause} * stk.ortmalfiyat) deg_ortmaliyet`); break
				case 'DEG_RAYICALIM': sahalar.add(`SUM(${degMiktarClause} * (case when stk.rayicalimfiyati < stk.almnetfiyat then stk.almnetfiyat else stk.rayicalimfiyati end)) deg_rayicalim`); break
				/*case 'SATISCIRO': sahalar.add(`SUM(${degMiktarClause} * stk.satfiyat1) satisciro`); break*/
				case PrefixMiktar: sahalar.add(`SUM(son.sonmiktar) miktar`); break
				default:
					if (key.startsWith(PrefixMiktar)) {
						let brmTip = key.slice(PrefixMiktar.length)?.toUpperCase();
						sahalar.add(`${this.getBrmliMiktarClause({ brmTip, mstAlias: 'stk', harAlias: 'son', miktarPrefix: 'son' })} miktar${brmTip}`)
					}
					break
			}
		}
		this.loadServerData_queryDuzenle_hmr(e).loadServerData_queryDuzenle_ek(e)
	}
	loadServerData_queryDuzenle_ek(e) { super.loadServerData_queryDuzenle_ek(e) }
}
