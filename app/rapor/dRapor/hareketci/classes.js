class DRapor_Hareketci_Cari extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'CR-TT' } static get hareketciSinif() { return CariHareketci }
}
class DRapor_Hareketci_Cari_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Cari }
	tabloYapiDuzenle({ result }) {
		this.tabloYapiDuzenle_cari(...arguments);
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {hvDegeri} = e, kodClause = hvDegeri('must');
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause });
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}
class DRapor_Hareketci_Kasa extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'KS-RT' } static get hareketciSinif() { return KasaHareketci }
}
class DRapor_Hareketci_Kasa_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Kasa }
	tabloYapiDuzenle({ result }) {
		result.addKAPrefix('kasa').addGrupBasit('KASA', 'Kasa', 'kasa', DMQKasa);
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('kasakod');
		if (attrSet.KASA) { sent.fromIliski('kasmst kas', `${kodClause} = kas.kod`) }
		for (let key in attrSet) {
			switch (key) { case 'KASA': sahalar.add(`${kodClause} kasakod`, 'kas.aciklama kasaadi'); wh.icerikKisitDuzenle_kasa({ ...e, saha: kodClause }); break }
		}
	}
}
class DRapor_Hareketci_Hizmet extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'HZ-TT' } static get hareketciSinif() { return HizmetHareketci }
}
class DRapor_Hareketci_Hizmet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Hizmet }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments);
		sec.secimTopluEkle({
			hizmetTipi: new SecimBirKismi({ etiket: 'Hizmet Tipi', tekSecimSinif: HizmetTipi, grupKod: 'HIZMET' }).birKismi()
		}).whereBlockEkle(({ secimler: sec, where: wh }) => { wh.birKismi(sec.hizmetTipi, 'hiz.tip') })
	}
	tabloYapiDuzenle({ result }) {
		result
			.addKAPrefix('anagrup', 'grup', 'histgrup', 'kategori')
			.addGrup(new TabloYapiItem().setKA('HZANAGRP', 'Hizmet Ana Grup').secimKullanilir().setMFSinif(DMQHizmetAnaGrup)
				.addColDef(new GridKolon({ belirtec: 'anagrup', text: 'Hizmet Ana Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZGRP', 'Hizmet Grup').secimKullanilir().setMFSinif(DMQHizmetGrup)
				.addColDef(new GridKolon({ belirtec: 'grup', text: 'Hizmet Grup', maxWidth: 450, filterType: 'checkedlist' })))
			.addGrup(new TabloYapiItem().setKA('HZISTGRP', 'Hizmet İst. Grup').secimKullanilir().setMFSinif(DMQHizmetIstGrup)
				.addColDef(new GridKolon({ belirtec: 'sistgrup', text: 'Hizmet İst. Grup', maxWidth: 450, filterType: 'checkedlist' })));
		this.tabloYapiDuzenle_hizmet(...arguments);
		result
			.addGrup(new TabloYapiItem().setKA('KATEGORI', 'Kategori').secimKullanilir().setMFSinif(DMQKategori)
				.addColDef(new GridKolon({ belirtec: 'kategori', text: 'Kategori', maxWidth: 600, filterType: 'input' })))
			.addGrup(new TabloYapiItem().setKA('KATDETAY', 'Kategori Detay')
				.addColDef(new GridKolon({ belirtec: 'katdetay', text: 'Kat. Detay', maxWidth: 600, filterType: 'input' })));
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent({ sent, attrSet, hvDegeri }) {
		super.loadServerData_queryDuzenle_hrkSent(...arguments); let {sqlNull} = Hareketci_UniBilgi.ortakArgs;
		let {from, sahalar, where: wh} = sent, kDetayClause;
		let kodClause = hvDegeri('hizmetkod'); this.loadServerData_queryDuzenle_hizmet({ ...arguments[0], kodClause });
		if (attrSet.HZANAGRP) { sent.hizmet2GrupBagla() }
		if (attrSet.HZANAGRP || attrSet.HZGRP || attrSet.HZISTGRP) { sent.x2HizmetBagla({ kodClause }) }
		if (attrSet.KATEGORI || attrSet.KATDETAY) {
			kDetayClause = hvDegeri('kdetaysayac');
			if (kDetayClause?.sqlDoluDegermi()) { sent.har2KatDetayBagla({ kodClause: kDetayClause }) }
			else { sent.x2KatDetayBagla({ alias: 'fis', kodClause: sqlNull }) }
		}
		for (const key in attrSet) {
			switch (key) {
				case 'HZANAGRP': sent.hizmetGrup2AnaGrupBagla(); sahalar.add('grp.anagrupkod', 'agrp.aciklama anagrupadi'); wh.icerikKisitDuzenle_hizmetAnaGrup({ ...arguments[0], saha: 'grp.anagrupkod' }); break
				case 'HZGRP': sent.hizmet2GrupBagla(); sahalar.add('hiz.grupkod', 'grp.aciklama grupadi'); wh.icerikKisitDuzenle_hizmetGrup({ ...arguments[0], saha: 'hiz.grupkod' }); break
				case 'HZISTGRP': sent.hizmet2IstGrupBagla(); sahalar.add('hiz.histgrupkod', 'higrp.aciklama histgrupadi'); wh.icerikKisitDuzenle_hizmetIstGrup({ ...arguments[0], saha: 'grp.histgrupkod' }); break
				case 'KATDETAY': sahalar.add('kdet.kdetay katdetay'); break
				case 'KATEGORI':
					sent.leftJoin('kdet', 'kategori kat', 'kdet.fissayac = kat.kaysayac');
					sahalar.add('kat.kod kategorikod', 'kat.aciklama kategoriadi');
					break
			}
		}
		return this
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}

class DRapor_Hareketci_BankaOrtak extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci_BankaOrtak } 
}
class DRapor_Hareketci_BankaOrtak_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_BankaOrtak }
	tabloYapiDuzenle({ result }) {
		result.addKAPrefix('banhesap', 'banka')
			.addGrupBasit('BANKAHESAP', 'Banka Hesap', 'banhesap', DMQBankaHesap)
			.addGrupBasit('BANKA', 'Banka', 'banka', DMQBanka, null, ({ item }) => item.secimKullanilmaz())
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('banhesapkod');
		if (attrSet.BANKAHESAP || attrSet.BANKA) { sent.fromIliski('banbizhesap bhes', `${kodClause} = bhes.kod`) }
		if (attrSet.BANKA) { sent.fromIliski('banmst ban', 'bhes.bankakod = ban.kod') }
		for (let key in attrSet) {
			switch (key) { case 'BANKAHESAP': sahalar.add(`${kodClause} banhesapkod`, 'bhes.aciklama banhesapadi'); wh.icerikKisitDuzenle_bankaHesap({ ...e, saha: kodClause }); break }
			switch (key) { case 'BANKA': sahalar.add('bhes.bankakod', 'ban.aciklama bankaadi'); wh.icerikKisitDuzenle_banka({ ...e, saha: 'bhes.bankakod' }); break }
		}
	}
}
class DRapor_Hareketci_BankaMevduat extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-MO' } static get hareketciSinif() { return BankaMevduatHareketci }
}
class DRapor_Hareketci_BankaMevduat_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_BankaMevduat }
}

class DRapor_Hareketci_POSKrOrtak extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci_POSKrOrtak }
	static get hareketciSinif() { return PsKrOrtakHareketci }
}
class DRapor_Hareketci_POSKrOrtak_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_POSKrOrtak }
}
class DRapor_Hareketci_POS extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-PRO' } static get hareketciSinif() { return POSHareketci }
}
class DRapor_Hareketci_POS_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_POS }
}
class DRapor_Hareketci_KrediKarti extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-DRO' } static get hareketciSinif() { return KrediKartiHareketci }
}
class DRapor_Hareketci_KrediKarti_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_KrediKarti }
}

class DRapor_Hareketci_KrediTaksit extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-KRO' } static get hareketciSinif() { return KrediTaksitHareketci }
}
class DRapor_Hareketci_KrediTaksit_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_KrediTaksit }
}
class DRapor_Hareketci_Akreditif extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-AHR' } static get hareketciSinif() { return BankaAkreditifHareketci }
}
class DRapor_Hareketci_Akreditif_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Akreditif }
}
class DRapor_Hareketci_TeminatMektup extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-TRH' } static get hareketciSinif() { return BankaTeminatMektupHareketci }
}
class DRapor_Hareketci_TeminatMektup_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_TeminatMektup }
}

class DRapor_Hareketci_CekSenet extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'CS-TP' } static get hareketciSinif() { return CSHareketci }
}
class DRapor_Hareketci_CekSenet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_CekSenet }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		/* result.addKAPrefix('kasa').addGrupBasit('KASA', 'Kasa', 'kasa', DMQKasa) */
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		/*let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('kasakod');
		if (attrSet.KASA) { sent.fromIliski('kasmst kas', `${kodClause} = kas.kod`) }
		for (let key in attrSet) {
			switch (key) { case 'KASA': sahalar.add(`${kodClause} kasakod`, 'kas.aciklama kasaadi'); wh.icerikKisitDuzenle_kasa({ ...e, saha: kodClause }); break }
		}*/
	}
	tabloYapiDuzenle_takip(e) { /* do nothing */ }
}

class DRapor_Hareketci_Masraf extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get hareketciSinif() { return MasrafHareketci }
}
class DRapor_Hareketci_Masraf_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Masraf }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments); this.tabloYapiDuzenle_cari(...arguments);
		result.addKAPrefix('masraf')
			.addGrupBasit('MASRAF', 'Masraf', 'masraf', DMQMasraf, null, null, 'masrafkod');
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('masrafkod');
		sent.fromIliski('stkmasraf kas', `${kodClause} = mas.kod`);
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: 'car.must' });
		for (let key in attrSet) {
			switch (key) {
				case 'MASRAF': sahalar.add(`${kodClause} masrafkod`, 'mas.aciklama masrafadi'); break
			}
		}
	}
	async loadServerData_recsDuzenleIlk({ recs }) {
		/*let kod2Adi; for (let rec of recs) {
			let {masrafkod: kod, masrafadi: adi} = rec;
			if (adi == null) {
				if (kod2Adi == null) { kod2Adi = await DMQMasraf.getGloKod2Adi() }
				adi = rec.masrafadi = kod2Adi[kod]?.trimEnd() ?? ''
			}
		}*/
		await super.loadServerData_recsDuzenleIlk(...arguments)
	}
}

class DRapor_Hareketci_Takip extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get hareketciSinif() { return TakipHareketci } 
}
class DRapor_Hareketci_Takip_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Takip }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments); let {isAdmin, rol} = config.session ?? {}, maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT');
		this.tabloYapiDuzenle_cari(...arguments).tabloYapiDuzenle_takip(...arguments);
		if (maliyetGorurmu) {
			result
				.addToplamBasit_bedel('TUMMALIYET', 'Tüm Maliyet', 'tummaliyet')
				.addToplamBasit('YUZDE_CIRO_TUMMALIYET', 'Mal. Ciro(%)', 'yuzde_ciro_tummaliyet', null, null, ({ item }) =>
					item.setFormul(['TUMMALIYET', 'ISARETLIBEDEL'], ({ rec }) => rec.isaretlibedel ? roundToFra((rec.tummaliyet / rec.isaretlibedel) * 100, 1) : 0))
				.addToplamBasit_bedel('BRUTKAR', 'Brüt Kar', 'brutkar')
				.addToplamBasit('YUZDE_CIRO_BRUTKAR', 'Kar Ciro(%)', 'yuzde_ciro_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'ISARETLIBEDEL'], ({ rec }) => rec.isaretlibedel ? roundToFra((rec.brutkar / rec.isaretlibedel) * 100, 1) : 0))
				.addToplamBasit('YUZDE_MALIYET_BRUTKAR', 'Kar Mal.(%)', 'yuzde_maliyet_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'TUMMALIYET'], ({ rec }) => rec.tummaliyet ? roundToFra((rec.brutkar / rec.tummaliyet) * 100, 1) : 0))
		}
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {attrSet, sent, hvDegeri} = e;
		let {where: wh, sahalar} = sent, kodClause = hvDegeri('takipno');
		sent.fromIliski('takipno tak', `${kodClause} = tak.kod`);
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause });
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: 'car.must' });
		for (let key in attrSet) {
			switch (key) {
				case 'TUMMALIYET': sahalar.add(`SUM(${hvDegeri('maliyet')}) tummaliyet`); break;
				case 'BRUTKAR': sahalar.add(`SUM(har.bedel - (${hvDegeri('maliyet')})) brutkar`); break;
			}
		}
	}
}

class DRapor_Hareketci_Stok extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get araSeviyemi() { return this == DRapor_Hareketci_Stok }
}
class DRapor_Hareketci_Stok_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments); let {tip2BrmListe} = MQStokGenelParam, brmListe = Object.keys(tip2BrmListe);
		let {isAdmin, rol} = config.session ?? {}, maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT'), {toplam} = result;
		this.tabloYapiDuzenle_cari(...arguments).tabloYapiDuzenle_stok(...arguments);
		result.addGrupBasit('GC', 'G/Ç', 'gc', null, 60, ({ colDef }) => colDef.alignCenter());
		result.addToplamBasit('MIKTAR', 'Miktar', 'miktar', null, null, ({ item }) => item.hidden());
		/* for (let tip of brmListe) { result.addToplamBasit(`MIKTAR${tip}`, `Miktar(${tip})`, `miktar${tip}`) } */
		result.addToplamBasit('MIKTAR2', 'Miktar2', 'miktar2', null, null, ({ item }) => item.hidden());
		result.addToplamBasit('KALAN_MIKTAR', 'K.Miktar', 'kalanmiktar', null, null, ({ item }) =>
			item.setFormul(['GIRIS_MIKTAR', 'CIKIS_MIKTAR', 'MIKTAR', 'GC'], ({ rec }) => rec.girismiktar - rec.cikismiktar));
		result.addToplamBasit('KALAN_MIKTAR2', 'K.Miktar2', 'kalanmiktar2', null, null, ({ item }) =>
			item.setFormul(['GIRIS_MIKTAR2', 'CIKIS_MIKTAR2', 'MIKTAR2', 'GC'], ({ rec }) => rec.girismiktar2 - rec.cikismiktar2));
		result.addToplamBasit('GIRIS_MIKTAR', 'G.Miktar', 'girismiktar', null, null, ({ item }) =>
			item.setFormul(['MIKTAR', 'GC'], ({ rec }) => rec.gc == 'G' ? rec.miktar : 0));
		result.addToplamBasit('CIKIS_MIKTAR', 'Ç.Miktar', 'cikismiktar', null, null, ({ item }) =>
			item.setFormul(['MIKTAR', 'GC'], ({ rec }) => rec.gc == 'C' ? rec.miktar : 0));
		result.addToplamBasit('GIRIS_MIKTAR2', 'G.Miktar2', 'girismiktar2', null, null, ({ item }) =>
			item.setFormul(['MIKTAR2', 'GC'], ({ rec }) => rec.gc == 'G' ? rec.miktar2 : 0));
		result.addToplamBasit('CIKIS_MIKTAR2', 'Ç.Miktar2', 'cikismiktar2', null, null, ({ item }) =>
			item.setFormul(['MIKTAR2', 'GC'], ({ rec }) => rec.gc == 'C' ? rec.miktar2 : 0));
		{	let item = toplam.ISARETLIBEDEL; item.ka.aciklama = item.colDefs[0].text = 'Bedel'
			for (let key of ['BORCBEDEL', 'ALACAKBEDEL']) { delete toplam[key] }
		}
		if (maliyetGorurmu) {
			result
				.addToplamBasit_bedel('TUMMALIYET', 'Tüm Maliyet', 'tummaliyet')
				.addToplamBasit('YUZDE_CIRO_TUMMALIYET', 'Mal. Ciro(%)', 'yuzde_ciro_tummaliyet', null, null, ({ item }) =>
					item.setFormul(['TUMMALIYET', 'ISARETLIBEDEL'], ({ rec }) => rec.isaretlibedel ? roundToFra((rec.tummaliyet / rec.isaretlibedel) * 100, 1) : 0))
				.addToplamBasit_bedel('BRUTKAR', 'Brüt Kar', 'brutkar')
				.addToplamBasit('YUZDE_CIRO_BRUTKAR', 'Kar Ciro(%)', 'yuzde_ciro_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'ISARETLIBEDEL'], ({ rec }) => rec.isaretlibedel ? roundToFra((rec.brutkar / rec.isaretlibedel) * 100, 1) : 0))
				.addToplamBasit('YUZDE_MALIYET_BRUTKAR', 'Kar Mal.(%)', 'yuzde_maliyet_brutkar', null, null, ({ item }) =>
					item.setFormul(['BRUTKAR', 'TUMMALIYET'], ({ rec }) => rec.tummaliyet ? roundToFra((rec.brutkar / rec.tummaliyet) * 100, 1) : 0))
		}
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {attrSet, sent, hvDegeri} = e;
		let {where: wh, sahalar} = sent, PrefixMiktar = 'MIKTAR';
		if (Object.keys(attrSet).find(key => (key.startsWith('GIRIS_') || key.startsWith('CIKIS_')))) { attrSet.GC = true }
		this.loadServerData_queryDuzenle_stok({ ...e, kodClause: hvDegeri('stokkod') });
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') });
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') });
		for (let key in attrSet) {
			switch (key) {
				case 'GC': sahalar.add(`${hvDegeri('gc')} gc`); break
				case 'TUMMALIYET': sahalar.add(`SUM(${hvDegeri('maliyet')}) tummaliyet`); break
				case 'BRUTKAR': sahalar.add(`SUM(${hvDegeri('isaretlibedel')} - ${hvDegeri('maliyet')}) brutkar`); break
				case 'BRM': sahalar.add(`${hvDegeri('brm')} brm`); break
				case 'BRM2': sahalar.add(`${hvDegeri('brm2')} brm2`); break
				case 'BRMORANI': sahalar.add('stk.brmorani'); break
				case 'MIKTAR2': sahalar.add(`${hvDegeri('miktar2')} miktar2`); break
				default:
					if (key.startsWith(PrefixMiktar) || key.endsWith(PrefixMiktar)) {
						if (key == PrefixMiktar || key.endsWith(PrefixMiktar)) {
							sahalar.add(`${hvDegeri('miktar')} miktar`)
						}
						else {
							let brmTip = key.slice(PrefixMiktar.length)?.toUpperCase();
							sahalar.add(`${this.getBrmliMiktarClause({ brmTip, mstAlias: 'stk', harAlias: 'har' })} miktar${brmTip}`)
						}
						if (!sahalar.alias2Deger.brm) { sahalar.add(`${hvDegeri('brm')} brm`) }
						if (!sahalar.alias2Deger.brm) { sahalar.add(`${hvDegeri('brm2')} brm2`) }
					}
					break
			}
		}
	}
}
class DRapor_Hareketci_Stok_Gercek extends DRapor_Hareketci_Stok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get hareketciSinif() { return StokHareketci_Gercek } 
}
class DRapor_Hareketci_Stok_Gercek_Main extends DRapor_Hareketci_Stok_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok_Gercek }
}
class DRapor_Hareketci_Stok_Maliyetli extends DRapor_Hareketci_Stok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get hareketciSinif() { return StokHareketci_Maliyetli } 
}
class DRapor_Hareketci_Stok_Maliyetli_Main extends DRapor_Hareketci_Stok_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok_Maliyetli }
}
