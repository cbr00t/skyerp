class DRapor_Hareketci_AlimSatisOrtak extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return null } static get araSeviyemi() { return this == DRapor_Hareketci_AlimSatisOrtak }
}
class DRapor_Hareketci_AlimSatisOrtak_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_AlimSatisOrtak }
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		let {tip2BrmListe} = MQStokGenelParam
		let {isAdmin, rol} = config.session ?? {}
		let maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT')
		let {toplam} = result, brmListe = keys(tip2BrmListe)
		this.tabloYapiDuzenle_cari(e).tabloYapiDuzenle_stok(e)
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR', etiket: 'Miktar' })
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR2', etiket: 'Miktar2' })
		if (maliyetGorurmu)
			this.tabloYapiDuzenle_gc({ ...e, tip: 'MALIYET', etiket: 'Maliyet', belirtec: 'tummaliyet' })
		{
			let {ISARETLIBEDEL: item} = toplam
			if (item)
				item.ka.aciklama = item.colDefs[0].text = 'Bedel'
		}
		//{ let {TUMMALIYET: item} = toplam; if (item) { item.ka.aciklama = item.colDefs[0].text = 'Tüm Maliyet' } }
		deleteKeys(toplam, 'BORCBEDEL', 'ALACAKBEDEL', 'BORCBAKIYE', 'ALACAKBAKIYE', 'TUMMALIYET')
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {attrSet, sent, hvDegeri} = e;
		let {where: wh, sahalar} = sent, PrefixMiktar = 'MIKTAR', gcClause = hvDegeri('gc'), tarihClause = hvDegeri('tarih');
		/* if (Object.keys(attrSet).find(key => (key.startsWith('GIRIS_') || key.startsWith('CIKIS_')))) { attrSet.GC = true } */
		this.loadServerData_queryDuzenle_stok({ ...e, kodClause: hvDegeri('stokkod') })
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') })
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') })
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR', clause: hvDegeri('miktar'), gcClause, tarihClause })
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR2', clause: hvDegeri('miktar2'), gcClause, tarihClause })
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MALIYET', clause: hvDegeri('fmaliyet'), gcClause, tarihClause })
		for (let key in attrSet) {
			switch (key) {
				case 'BRM': sahalar.add(`${hvDegeri('brm')} brm`); break
				case 'BRM2': sahalar.add(`${hvDegeri('brm2')} brm2`); break
				case 'BRMORANI': sahalar.add('stk.brmorani'); break
			}
		}
	}
}
class DRapor_Hareketci_Satislar extends DRapor_Hareketci_AlimSatisOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'SATIS' } static get kategoriAdi() { return 'Satışlar' }
	static get vioAdim() { return 'ST-IR' }
	static get hareketciSinif() { return SatisHareketci } 
}
class DRapor_Hareketci_Satislar_Main extends DRapor_Hareketci_AlimSatisOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Satislar }
}
class DRapor_Hareketci_Alimlar extends DRapor_Hareketci_AlimSatisOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ALIM' } static get kategoriAdi() { return 'Alımlar' }
	static get vioAdim() { return 'ST-IR' }
	static get hareketciSinif() { return AlimHareketci } 
}
class DRapor_Hareketci_Alimlar_Main extends DRapor_Hareketci_AlimSatisOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Alimlar }
}

class DRapor_Hareketci_Cari extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/* static get oncelik() { return 10 } */
	static get kategoriKod() { return 'CARI' } static get kategoriAdi() { return 'Cari' }
	static get vioAdim() { return 'CR-TT' } static get hareketciSinif() { return CariHareketci }
}
class DRapor_Hareketci_Cari_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Cari }
	tabloYapiDuzenle({ result }) {
		this.tabloYapiDuzenle_cari(...arguments)
		super.tabloYapiDuzenle(...arguments)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e)
		let {hvDegeri} = e, kodClause = hvDegeri('must')
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause })
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}

class DRapor_Hareketci_Kasa extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'KASA' } static get kategoriAdi() { return 'Kasa' }
	static get vioAdim() { return 'KS-RT' }
	static get hareketciSinif() { return KasaHareketci }
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
	static get kategoriKod() { return 'Hizmet' } static get kategoriAdi() { return 'Hizmet' }
	static get vioAdim() { return 'HZ-TT' } static get hareketciSinif() { return HizmetHareketci }
}
class DRapor_Hareketci_Hizmet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Hizmet }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		sec.secimTopluEkle({
			hizmetTipi: new SecimBirKismi({ etiket: 'Hizmet Tipi', tekSecimSinif: HizmetTipi, grupKod: 'HIZMET' }).birKismi()
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh }) => { wh.birKismi(sec.hizmetTipi, 'hiz.tip') })
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
	static get kategoriKod() { return 'BANKA' } static get kategoriAdi() { return 'Banka' }
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
class DRapor_Hareketci_BankaYatirim extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-YO' }
	static get uygunmu() { return super.uygunmu }
	static get hareketciSinif() { return this.totalmi ? BankaYatirimKalanHareketci : BankaYatirimHareketci }
}
class DRapor_Hareketci_BankaYatirim_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_BankaYatirim }
}
class DRapor_Hareketci_POSKrOrtak extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci_POSKrOrtak }
	static get hareketciSinif() { return PsKrOrtakHareketci }
}
class DRapor_Hareketci_POSKrOrtak_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_POSKrOrtak }
	static get posKosulMQSinif() { return DMQPosKrHesap }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		let {posKosulMQSinif} = this.class
		result.addKAPrefix('poskosul')
		result.addGrupBasit('POSKOSUL', posKosulMQSinif.sinifAdi, 'poskosul', posKosulMQSinif)
	}
	loadServerData_queryDuzenle_hrkSent({ attrSet, hv, hvDegeri, sent, sent: { where: wh, sahalar } }) {
		let e = arguments[0]; super.loadServerData_queryDuzenle_hrkSent(e)
		let clause_posKosul = hvDegeri('poskosulkod')
		if (attrSet.POSKOSUL)
			sent.fromIliski('poskosul kos', `${clause_posKosul} = kos.kod`)
		for (let key in attrSet) {
			switch (key) {
				case 'POSKOSUL':
					sahalar.add(`${clause_posKosul} poskosulkod`, 'kos.aciklama poskosuladi')
					wh.icerikKisitDuzenle_posKosul({ ...e, saha: clause_posKosul})
					break
			}
		}
	}
}
class DRapor_Hareketci_POS extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-PRO' } static get hareketciSinif() { return POSHareketci }
}
class DRapor_Hareketci_POS_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_POS }
	static get posKosulMQSinif() { return DMQPosHesap }
}
class DRapor_Hareketci_KrediKarti extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return 'BN-DRO' } static get hareketciSinif() { return KrediKartiHareketci }
}
class DRapor_Hareketci_KrediKarti_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_KrediKarti }
	static get posKosulMQSinif() { return DMQKrediKarti }
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
	static get kategoriKod() { return 'CS' } static get kategoriAdi() { return 'Çek/Senet' }
	static get vioAdim() { return 'CS-TP' } static get hareketciSinif() { return CSHareketci }
}
class DRapor_Hareketci_CekSenet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_CekSenet }
	secimlerDuzenle({ secimler: sec }) {
		super.secimlerDuzenle(...arguments)
		let grupKod = 'donemVeTarih'
		sec.secimTopluEkle({
			belgeTipi: new SecimBirKismi({ grupKod, etiket: 'Belge Tipi', tekSecimSinif: CSBelgeTipi, default: null }).birKismi(),
			portfTipi: new SecimBirKismi({ grupKod, etiket: 'Portf. Tipi', tekSecimSinif: CSPortfTipi, default: null }).birKismi(),
			portfoydeOlanlar: new SecimBoolTrue({ grupKod, etiket: 'Portfoyde Olanlar' })
		})
		sec.whereBlockEkle(({ secimler: sec, where: wh, alias, hvDegeri, hv }) => {
			let {raporClass: { hareketciSinif: harSinif }} = this.class
			{
				let clause = hvDegeri('belgetipi')
				if (clause)
					wh.birKismi(sec.belgeTipi, clause)
			}
			{
				let clause = hvDegeri('portftipi')
				if (clause)
					wh.birKismi(sec.portfTipi, clause)
			}
			if (sec.portfoydeOlanlar.value)
				harSinif.ortakSentDuzenle_isiBitenlerHaric({ sender: this, hv, where: wh })
		})
	}
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments)
		// result.addKAPrefix('portftipi')
		result
			.addGrupBasit('PORTFTIPIADI', 'Portföy Tipi', 'portftipiadi', null, null, ({ item }) => item.noOrderBy())
	}
	loadServerData_queryDuzenle_hrkSent({ attrSet, hvDegeri, sent, sent: { where: wh, sahalar } }) {
		super.loadServerData_queryDuzenle_hrkSent(...arguments)
		// if (attrSet.KASA) { sent.fromIliski('kasmst kas', `${kodClause} = kas.kod`) }
		for (let key in attrSet) {
			switch (key) {
				case 'PORTFTIPI': {
					let alias = 'portftipi', clause = hvDegeri(alias)
					sahalar.add(`${clause} ${alias}`)
					break
				}
				case 'PORTFTIPIADI': {
					let clause = CSPortfTipi.getClause(hvDegeri('portftipi'))
					sahalar.add(`${clause} portftipiadi`)
					break
				}
			}
		}
	}
	tabloYapiDuzenle_takip(e) { /* do nothing */ }
}

class DRapor_Hareketci_Masraf extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'MASRAF' } static get kategoriAdi() { return 'Masraf' }
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
	static get kategoriKod() { return 'TAKIP' } static get kategoriAdi() { return 'Takip' }
	static get vioAdim() { return null } static get hareketciSinif() { return TakipHareketci } 
}
class DRapor_Hareketci_Takip_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Takip }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments); let {isAdmin, rol} = config.session ?? {}, maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT');
		this.tabloYapiDuzenle_cari(...arguments).tabloYapiDuzenle_takip(...arguments)
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
				case 'TUMMALIYET': sahalar.add(`${hvDegeri('maliyet').asSumDeger()} tummaliyet`); break
				case 'BRUTKAR': sahalar.add(`SUM(${hvDegeri('isaretlibedel').sumOlmaksizin()} - ${hvDegeri('maliyet').sumOlmaksizin()}) brutkar`); break
			}
		}
	}
}

class DRapor_Hareketci_Stok extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'STOK' } static get kategoriAdi() { return 'Stok' }
	static get vioAdim() { return null } static get araSeviyemi() { return this == DRapor_Hareketci_Stok }
}
class DRapor_Hareketci_Stok_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok }
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]; super.tabloYapiDuzenle(e)
		let {tip2BrmListe} = MQStokGenelParam
		let {isAdmin, rol} = config.session ?? {}
		let maliyetGorurmu = isAdmin || !rol?.ozelRolVarmi('XMALYT')
		let {toplam} = result, brmListe = keys(tip2BrmListe)
		this.tabloYapiDuzenle_cari(e).tabloYapiDuzenle_stok(e)
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR', etiket: 'Miktar' })
		this.tabloYapiDuzenle_gc({ ...e, tip: 'MIKTAR2', etiket: 'Miktar2' })
		if (maliyetGorurmu)
			this.tabloYapiDuzenle_gc({ ...e, tip: 'MALIYET', etiket: 'Maliyet', belirtec: 'tummaliyet' })
		{
			let {ISARETLIBEDEL: item} = toplam
			if (item)
				item.ka.aciklama = item.colDefs[0].text = 'Bedel'
		}
		//{ let {TUMMALIYET: item} = toplam; if (item) { item.ka.aciklama = item.colDefs[0].text = 'Tüm Maliyet' } }
		deleteKeys(toplam, 'BORCBEDEL', 'ALACAKBEDEL', 'TUMMALIYET')
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {attrSet, sent, hvDegeri} = e;
		let {where: wh, sahalar} = sent, PrefixMiktar = 'MIKTAR', gcClause = hvDegeri('gc'), tarihClause = hvDegeri('tarih');
		/* if (Object.keys(attrSet).find(key => (key.startsWith('GIRIS_') || key.startsWith('CIKIS_')))) { attrSet.GC = true } */
		this.loadServerData_queryDuzenle_stok({ ...e, kodClause: hvDegeri('stokkod') });
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') });
		this.loadServerData_queryDuzenle_takip({ ...e, kodClause: hvDegeri('takipno') });
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR', clause: hvDegeri('miktar'), gcClause, tarihClause });
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MIKTAR2', clause: hvDegeri('miktar2'), gcClause, tarihClause });
		this.loadServerData_queryDuzenle_gc({ ...e, tip: 'MALIYET', clause: hvDegeri('fmaliyet'), gcClause, tarihClause })
		for (let key in attrSet) {
			switch (key) {
				case 'BRM': sahalar.add(`${hvDegeri('brm')} brm`); break
				case 'BRM2': sahalar.add(`${hvDegeri('brm2')} brm2`); break
				case 'BRMORANI': sahalar.add('stk.brmorani'); break
			}
		}
	}
}
class DRapor_Hareketci_Stok_Gercek extends DRapor_Hareketci_Stok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return this.hareketmi ? 'ST-AH' : this.envantermi ? 'ST-LE' : 'ST-AH' }
	static get hareketciSinif() { return StokHareketci_Gercek } 
}
class DRapor_Hareketci_Stok_Gercek_Main extends DRapor_Hareketci_Stok_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok_Gercek }
}
class DRapor_Hareketci_Stok_Maliyetli extends DRapor_Hareketci_Stok {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get vioAdim() { return this.hareketmi ? 'ST-AH' : this.envantermi ? 'ML-RH' : 'ML-RE' }
	static get hareketciSinif() { return StokHareketci_Maliyetli } 
}
class DRapor_Hareketci_Stok_Maliyetli_Main extends DRapor_Hareketci_Stok_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Stok_Maliyetli }
}

class DRapor_Hareketci_Tahsilat extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	/* static get oncelik() { return 10 } */
	static get kategoriKod() { return 'TAHSILAT' } static get kategoriAdi() { return 'Tahsilat' }
	static get vioAdim() { return 'CR-CT' } static get hareketciSinif() { return TahsilatHareketci }
}
class DRapor_Hareketci_Tahsilat_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Tahsilat }
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		this.tabloYapiDuzenle_tahsilSekli(e)
		this.tabloYapiDuzenle_cari(e)
		super.tabloYapiDuzenle(e)
	}
	loadServerData_queryDuzenle_hrkSent({ hvDegeri }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_hrkSent(e)
		this.loadServerData_queryDuzenle_tahsilSekli({ ...e, kodClause: hvDegeri('tahseklino') })
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') })
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}

class DRapor_Hareketci_Odeme extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'ODEME' } static get kategoriAdi() { return 'Ödeme' }
	static get vioAdim() { return 'CR-CO' } static get hareketciSinif() { return OdemeHareketci }
}
class DRapor_Hareketci_Odeme_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get raporClass() { return DRapor_Hareketci_Odeme }
	tabloYapiDuzenle({ result }) {
		let e = arguments[0]
		this.tabloYapiDuzenle_tahsilSekli(e)
		this.tabloYapiDuzenle_cari(e)
		super.tabloYapiDuzenle(e)
	}
	loadServerData_queryDuzenle_hrkSent({ hvDegeri }) {
		let e = arguments[0]
		super.loadServerData_queryDuzenle_hrkSent(e)
		this.loadServerData_queryDuzenle_tahsilSekli({ ...e, kodClause: hvDegeri('tahseklino') })
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause: hvDegeri('must') })
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}
