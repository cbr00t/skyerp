class DRapor_Uretim_Total extends DRapor_UretimBase {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get kod() { return 'URET_TOTAL' } static get aciklama() { return 'Üretim Total' } static get vioAdim() { return null }
}
class DRapor_Uretim_Total_Main extends DRapor_UretimBase_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_Total }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); let {result} = e, {isAdmin, rol} = config.session ?? {};
		let maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT'), {uretimMalMuh} = app.params.uretim.kullanim;
		this.tabloYapiDuzenle_sube(e).tabloYapiDuzenle_takip(e).tabloYapiDuzenle_yer(e);
		result
			.addKAPrefix('isl', 'paket')
			.addGrupBasit('FISNOX', 'Belge No', 'fisnox')
			.addGrupBasit('ISLEM', 'Üretim İşlem', 'isl', null, null, ({ item }) => item.setOrderBySaha('islkod'));
		this.tabloYapiDuzenle_stok(e);
		result
			.addGrupBasit('URETBRM', 'Ür.Brm', 'uretbrm')
			.addGrupBasit('PAKET', 'Paket', 'paket', null, null, ({ item }) => item.setOrderBySaha('paketkod'))
			.addToplamBasit('KOLI', 'Koli', 'koli')
			.addToplamBasit('URETMIKTAR', 'Üretim Miktar', 'uretmiktar')
			.addToplamBasit('FIREMIKTAR', 'Fire Miktar', 'firemiktar')
			.addToplamBasit('BRMIKTAR', 'Brüt Üret. Miktar', 'bruretmiktar');
		if (maliyetGorurmu) {
			result
				.addToplamBasit_bedel('TUMMALIYET', 'Tüm Maliyet', 'tummaliyet')
				.addToplamBasit_bedel('HAMMALIYET', 'Ham Maliyet', 'hammaliyet');
			if (uretimMalMuh) { result.addToplamBasit_bedel('MALMUH', 'Maliyet Muhasebesi', 'malmuh') }
		}
		this.tabloYapiDuzenle_hmr(e)
	}
	loadServerData_queryDuzenle(e) {
		super.loadServerData_queryDuzenle(e); let {stm, attrSet} = e, alias = 'fis';
		for (let sent of stm) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent, alias });
			sent.fisHareket('ufis', 'ustok');
			this.donemBagla({ ...e, tarihSaha: 'fis.tarih' });
			this.loadServerData_queryDuzenle_sube({ ...e, kodClause: 'fis.bizsubekod' });
			this.loadServerData_queryDuzenle_yer({ ...e, kodClause: 'har.yerkod' });
			this.loadServerData_queryDuzenle_takip({ ...e, kodClause: 'har.takipno' });
			this.loadServerData_queryDuzenle_stok({ ...e, kodClause: 'har.stokkod' });
			if (attrSet.ISLEM) { sent.fromIliski('urtisl isl', 'fis.islkod = isl.kod') }
			if (attrSet.PAKET) { sent.leftJoin('har', 'paket pak', 'har.paketsayac = pak.kaysayac') }
			if (!(attrSet.STANAGRP || attrSet.STGRP || attrSet.STISTGRP || attrSet.STOK || attrSet.STOKMARKA)) { sent.har2StokBagla() }
			let uretBrmClause = `(case when stk.uretbirimtipi = '2' then stk.brm2 else stk.brm end)`;
			let uretMiktarClause = `SUM(case when stk.uretbirimtipi = '2' then har.miktar2 else har.miktar end)`;
			sahalar.add(`${uretBrmClause} uretbrm`);
			for (const key in attrSet) {
				switch (key) {
					case 'FISNOX': sahalar.add('fis.fisnox'); break
					case 'ISLEM': sahalar.add('fis.islkod islkod', 'isl.aciklama isladi'); break
					case 'PAKET': sahalar.add('pak.kod paketkod', 'pak.aciklama paketadi'); break
					case 'URETBRM': sahalar.add(`${uretBrmClause} uretbrm`); break
					case 'KOLI': sahalar.add('SUM(har.koli) koli'); break
					case 'URETMIKTAR': sahalar.add(`${uretMiktarClause} uretmiktar`); break
					case 'FIREMIKTAR': sahalar.add(`SUM(har.firemiktar) firemiktar`); break
					case 'BRURETMIKTAR': sahalar.add(`SUM(${uretMiktarClause} - (har.firemiktar + har.hurdamiktar)) bruretmiktar`); break
					case 'HAMMALIYET': sahalar.add(`SUM(har.fmalhammadde) hammaliyet`); break
					case 'FIREMIKTAR': sahalar.add(`SUM(har.fmalmuh + har.fmalaktmuh) malmuh`); break
					case 'FIREMIKTAR': sahalar.add(`SUM(har.fmalhammadde + har.fmalmuh + har.fmalaktmuh) tummaliyet`); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'tarih' })
	}
}
