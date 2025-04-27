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
		for (let sent of stm.getSentListe()) {
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

class DRapor_Uretim_Gercekleme extends DRapor_Uretim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get kod() { return 'GERCEKLEME' } static get aciklama() { return 'Gerçekleme Analizi' } static get vioAdim() { return null }
}
class DRapor_Uretim_Gercekleme_Main extends DRapor_Uretim_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_Gercekleme }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result
			.addToplam(new TabloYapiItem().setKA('MIKTAR', 'Miktar').addColDef(new GridKolon({ belirtec: 'miktar', text: 'Miktar', maxWidth: 130, filterType: 'input' }).tipDecimal()))
			.addToplam(new TabloYapiItem().setKA('MIKTAR2', 'Miktar 2').addColDef(new GridKolon({ belirtec: 'miktar2', text: 'Miktar 2', maxWidth: 130, filterType: 'input' }).tipDecimal()))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, alias = 'ger';
		for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent, alias });
			this.loadServerData_queryDuzenle_uretimOrtakBagla({ ...e, sent }); this.donemBagla({ ...e, tarihSaha: `${alias}.detbitts` });
			if (attrSet.TEZGAH || attrSet.HAT) { sent.fromIliski('tekilmakina tez', `${alias}.tezgahkod = tez.kod`) }
			for (const key in attrSet) {
				switch (key) {
					case 'MIKTAR': sahalar.add(`SUM(${alias}.miktar) miktar`); break
					case 'MIKTAR2': sahalar.add(`SUM(${alias}.miktar2) miktar2`); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'detbitts' })
	}
}

class DRapor_Uretim_Iskarta extends DRapor_Uretim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false } static get uygunmu() { return false }
	static get kod() { return 'ISKARTA' } static get aciklama() { return 'Iskarta Analizi' } static get vioAdim() { return null }
}
class DRapor_Uretim_Iskarta_Main extends DRapor_Uretim_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_Iskarta }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {iskartaMaxSayi} = app.params.operGenel, {result} = e; result.addKAPrefix('neden')
			.addGrup(new TabloYapiItem().setKA('NEDEN', 'Neden').secimKullanilir().setMFSinif(DMQIskNeden).addColDef(new GridKolon({ belirtec: 'neden', text: 'Neden', minWidth: 210, maxWidth: 300, filterType: 'checkedlist' })))
			.addToplam(new TabloYapiItem().setKA('MIKTAR', 'Miktar').addColDef(new GridKolon({ belirtec: 'miktar', text: 'Miktar', maxWidth: 130, filterType: 'input' }).tipDecimal()))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {iskartaMaxSayi} = app.params.operGenel, {stm, attrSet} = e, alias = 'onk';
		let wUni = new MQUnionAll(); for (let i = 1; i <= iskartaMaxSayi; i++) {
			let sent = new MQSent({ from: 'operemri', where: `iskartanedenkod${i} <> ''`, sahalar: ['gersayac', 'nedenkod', `iskartamiktar${i} iskmiktar`] });
			wUni.add(sent)
		}
		stm.with.add(new MQToplu([
			`onkomut ${new MQClause(['gersayac', 'nedenkod', 'iskmiktar']).parantezli()} AS`,
			new MQClause([wUni]).parantezli()
		]));
		for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent, alias }); sent.fromAdd('onkomut onk');
			this.loadServerData_queryDuzenle_gerDetayBagla({ ...e, sent }); wh.add(`ger.kaysayac = onk.gersayac`);
			this.donemBagla({ ...e, tarihSaha: `${alias}.gertarih` }); for (const key in attrSet) {
				switch (key) {
					case 'TEZGAH': sent.fromIliski('tekilmakina tez', 'ger.tezgahkod = tez.kod'); break
					case 'NEDEN': sent.fromIliski('opiskartanedeni ined', 'onk.isknedenkod = ined.kod'); sahalar.add('ined.kod nedenkod', 'ined.aciklama nedenadi'); break
					case 'MIKTAR': sahalar.add('SUM(onk.iskmiktar) miktar'); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'gertarih' })
	}
}

class DRapor_Uretim_Duraksama extends DRapor_Uretim {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get kod() { return 'DURAKSAMA' } static get aciklama() { return 'Duraksama Analizi' } static get vioAdim() { return null }
}
class DRapor_Uretim_Duraksama_Main extends DRapor_Uretim_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Uretim_Duraksama }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); const {result} = e; result.addKAPrefix('neden')
			.addGrup(new TabloYapiItem().setKA('NEDEN', 'Neden').secimKullanilir().setMFSinif(DMQDurNeden).addColDef(new GridKolon({ belirtec: 'neden', text: 'Neden', minWidth: 210, maxWidth: 300, filterType: 'checkedlist' })))
			.addToplam(new TabloYapiItem().setKA('SURESN', 'Dur. Süre (sn)').addColDef(new GridKolon({ belirtec: 'suresn', text: 'Dur. Süre (sn)', maxWidth: 130, filterType: 'input' })))
			.addToplam(new TabloYapiItem().setKA('SUREDK', 'Dur. Süre (dk)').addColDef(new GridKolon({ belirtec: 'suredk', text: 'Dur. Süre (dk)', maxWidth: 130, filterType: 'input' })))
	}
	loadServerData_queryDuzenle_ek(e) {
		super.loadServerData_queryDuzenle_ek(e); let {stm, attrSet} = e, alias = 'mdur';
		for (let sent of stm.getSentListe()) {
			let {sahalar, where: wh} = sent; $.extend(e, { sent, alias }); this.loadServerData_queryDuzenle_uretimOrtakBagla({ ...e, sent });
			this.loadServerData_queryDuzenle_gerDetayBagla({ ...e, sent }).loadServerData_queryDuzenle_duraksamaBagla({ ...e, sent });
			this.donemBagla({ ...e, tarihSaha: `${alias}.duraksamabasts` }); for (const key in attrSet) {
				switch (key) {
					case 'TEZGAH': sent.fromIliski('tekilmakina tez', `${alias}.makinakod = tez.kod`); break
					case 'NEDEN': sent.fromIliski('makdurneden dned', `${alias}.durnedenkod = dned.kod`); wh.add('dned.bkritikmi <> 0'); sahalar.add('dned.kod nedenkod', 'dned.aciklama nedenadi'); break
					case 'SURESN': sahalar.add(`SUM(${alias}.dursuresn) suresn`); break; case 'SUREDK': sahalar.add(`SUM(ROUND(${alias}.dursuresn / 60, 1)) dursuredk`); break
				}
			}
		}
		this.loadServerData_queryDuzenle_tarih({ ...e, alias, tarihSaha: 'duraksamabasts' })
	}
}
