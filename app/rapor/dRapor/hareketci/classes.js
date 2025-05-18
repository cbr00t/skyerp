class DRapor_Hareketci_Cari extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return 'CR-TT' }
	static get _kod() { return 'CARIHAR' } static get _aciklama() { return 'Cari' }
}
class DRapor_Hareketci_Cari_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return CariHareketci }
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
	static get araSeviyemi() { return false } static get vioAdim() { return 'KS-RT' }
	static get _kod() { return 'KASAHAR' } static get _aciklama() { return 'Kasa' }
}
class DRapor_Hareketci_Kasa_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return KasaHareketci }
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
	static get araSeviyemi() { return false } static get vioAdim() { return 'HZ-TT' }
	static get _kod() { return 'HIZHAR' } static get _aciklama() { return 'Hizmet' }
}
class DRapor_Hareketci_Hizmet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return HizmetHareketci }
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
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Hareketci_BankaOrtak }
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
			switch (key) { case 'BANKAHESAP': sahalar.add(`${kodClause} banhesapkod`, 'bhes.aciklama bankaadi'); wh.icerikKisitDuzenle_bankaHesap({ ...e, saha: kodClause }); break }
			switch (key) { case 'BANKA': sahalar.add('bhes.bankakod', 'ban.aciklama bankaadi'); wh.icerikKisitDuzenle_banka({ ...e, saha: 'bhes.bankakod' }); break }
		}
	}
}
class DRapor_Hareketci_BankaMevduat extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return 'BN-MO' }
	static get _kod() { return 'BANKA' } static get _aciklama() { return 'Banka Mevduat' }
}
class DRapor_Hareketci_BankaMevduat_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return BankaMevduatHareketci }
	static get raporClass() { return DRapor_Hareketci_BankaMevduat }
}

class DRapor_Hareketci_POSKrOrtak extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci_POSKrOrtak }
}
class DRapor_Hareketci_POSKrOrtak_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return PsKrOrtakHareketci }
	static get raporClass() { return DRapor_Hareketci_POSKrOrtak }
}
class DRapor_Hareketci_POS extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return 'BN-PRO' }
	static get _kod() { return 'POSHAR' } static get _aciklama() { return 'POS' }
}
class DRapor_Hareketci_POS_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return POSHareketci }
	static get raporClass() { return DRapor_Hareketci_POS }
}
class DRapor_Hareketci_KrediKarti extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return 'BN-DRO' }
	static get _kod() { return 'KREDIHAR' } static get _aciklama() { return 'Kredi Kartı' }
}
class DRapor_Hareketci_KrediKarti_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return KrediKartiHareketci }
	static get raporClass() { return DRapor_Hareketci_KrediKarti }
}

class DRapor_Hareketci_KrediTaksit extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return 'BN-KRO' }
	static get _kod() { return 'KRTAKSIT' } static get _aciklama() { return 'Kredi Kartı Taksit' }
}
class DRapor_Hareketci_KrediTaksit_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return KrediTaksitHareketci }
	static get raporClass() { return DRapor_Hareketci_KrediTaksit }
}
class DRapor_Hareketci_Akreditif extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return 'BN-AHR' }
	static get _kod() { return 'AKREDITIF' } static get _aciklama() { return 'Akreditif' }
}
class DRapor_Hareketci_Akreditif_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return BankaAkreditifHareketci }
	static get raporClass() { return DRapor_Hareketci_Akreditif }
}
class DRapor_Hareketci_TeminatMektup extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return 'BN-TRH' }
	static get _kod() { return 'TEMMEKTUP' } static get _aciklama() { return 'Teminat Mektup' }
}
class DRapor_Hareketci_TeminatMektup_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return BankaTeminatMektupHareketci }
	static get raporClass() { return DRapor_Hareketci_TeminatMektup }
}

class DRapor_Hareketci_CekSenet extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/*static get uygunmu() { return !!config.dev }*/ static get vioAdim() { return 'CS-TP' }
	static get _kod() { return 'CSHAR' } static get _aciklama() { return 'Çek/Senet' }
}
class DRapor_Hareketci_CekSenet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return CSHareketci }
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
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get _kod() { return 'MASHAR' } static get _aciklama() { return 'Masraf' }
}
class DRapor_Hareketci_Masraf_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get hareketciSinif() { return MasrafHareketci } static get raporClass() { return DRapor_Hareketci_Masraf }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		this.tabloYapiDuzenle_cari(...arguments);
		result.addKAPrefix('masraf')
			.addGrupBasit('MASRAF', 'Masraf', 'masraf', DMQMasraf, null, ({ item }) => item.secimKullanilmaz());
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('masrafkod');
		/* if (attrSet.MASRAF) { sent.fromIliski('stkmasraf kas', `${kodClause} = mas.kod`) } */
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: 'car.must' });
		for (let key in attrSet) {
			switch (key) {
				case 'MASRAF': sahalar.add(`${kodClause} masrafkod` /*, 'mas.aciklama masrafadi'*/); break
			}
		}
	}
	async loadServerData_recsDuzenleIlk({ recs }) {
		let kod2Adi; for (let rec of recs) {
			let {masrafkod: kod, masrafadi: adi} = rec;
			if (adi == null) {
				if (kod2Adi == null) { kod2Adi = await DMQMasraf.getGloKod2Adi() }
				adi = rec.masrafadi = kod2Adi[kod]?.trimEnd() ?? ''
			}
		}
		await super.loadServerData_recsDuzenleIlk(...arguments)
	}
}
