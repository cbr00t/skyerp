class DRapor_Hareketci_Cari extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'CARIHAR' } static get aciklama() { return 'Cari' }
}
class DRapor_Hareketci_Cari_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return CariHareketci }
	static get raporClass() { return DRapor_Hareketci_Cari }
	tabloYapiDuzenle({ result }) { super.tabloYapiDuzenle(...arguments); this.tabloYapiDuzenle_cari(...arguments) }
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {hvDegeri} = e, kodClause = hvDegeri('must');
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause });
		this.loadServerData_queryDuzenle_odemeGun({ ...e, kodClause: hvDegeri('odgunkod') })
	}
	tabloYapiDuzenle_odemeGun(e) { super.super_tabloYapiDuzenle_odemeGun(e) }
}
class DRapor_Hareketci_Kasa extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'KASAHAR' } static get aciklama() { return 'Kasa' }
}
class DRapor_Hareketci_Kasa_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return KasaHareketci }
	static get raporClass() { return DRapor_Hareketci_Kasa }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result.addKAPrefix('kasa').addGrupBasit('KASA', 'Kasa', 'kasa', DMQKasa)
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

class DRapor_Hareketci_BankaOrtak extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get kategoriKod() { return 'FIN' } static get araSeviyemi() { return this == DRapor_Hareketci_BankaOrtak } 
}
class DRapor_Hareketci_BankaOrtak_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get raporClass() { return DRapor_Hareketci_BankaOrtak }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		result.addKAPrefix('banka', 'banhesap')
			.addGrupBasit('BANKAHESAP', 'Banka Hesap', 'banhesap', DMQBankaHesap)
			.addGrupBasit('BANKA', 'Banka', 'banka', DMQBanka)
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
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return null }
	static get kod() { return 'BANKA' } static get aciklama() { return 'Banka Mevduat' }
}
class DRapor_Hareketci_BankaMevduat_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return BankaMevduatHareketci }
	static get raporClass() { return DRapor_Hareketci_BankaMevduat }
}

class DRapor_Hareketci_POSKrOrtak extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return this == DRapor_Hareketci_POSKrOrtak } static get vioAdim() { return null }
}
class DRapor_Hareketci_POSKrOrtak_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return PsKrOrtakHareketci }
	static get raporClass() { return DRapor_Hareketci_POSKrOrtak }
}
class DRapor_Hareketci_POS extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'POSHAR' } static get aciklama() { return 'POS' }
}
class DRapor_Hareketci_POS_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return POSHareketci }
	static get raporClass() { return DRapor_Hareketci_POS }
}
class DRapor_Hareketci_KrediKarti extends DRapor_Hareketci_POSKrOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'KREDIHAR' } static get aciklama() { return 'Kredi Kartı' }
}
class DRapor_Hareketci_KrediKarti_Main extends DRapor_Hareketci_POSKrOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return KrediKartiHareketci }
	static get raporClass() { return DRapor_Hareketci_KrediKarti }
}

class DRapor_Hareketci_KrediTaksit extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return null }
	static get kod() { return 'KRTAKSIT' } static get aciklama() { return 'Kredi Kartı Taksit' }
}
class DRapor_Hareketci_KrediTaksit_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return KrediTaksitOrtakHareketci }
	static get raporClass() { return DRapor_Hareketci_KrediTaksit }
}
class DRapor_Hareketci_Akreditif extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return null }
	static get kod() { return 'AKREDITIF' } static get aciklama() { return 'Akreditif' }
}
class DRapor_Hareketci_Akreditif_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return BankaAkreditifHareketci }
	static get raporClass() { return DRapor_Hareketci_Akreditif }
}
class DRapor_Hareketci_TeminatMektup extends DRapor_Hareketci_BankaOrtak {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get vioAdim() { return null }
	static get kod() { return 'TEMMEKTUP' } static get aciklama() { return 'Teminat Mektup' }
}
class DRapor_Hareketci_TeminatMektup_Main extends DRapor_Hareketci_BankaOrtak_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return BankaTeminatMektupHareketci }
	static get raporClass() { return DRapor_Hareketci_TeminatMektup }
}

class DRapor_Hareketci_CekSenet extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get araSeviyemi() { return false }
	static get uygunmu() { return !!config.dev } static get vioAdim() { return null }
	static get kod() { return 'CSHAR' } static get aciklama() { return 'Çek/Senet' }
}
class DRapor_Hareketci_CekSenet_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return CSHareketci }
	static get raporClass() { return DRapor_Hareketci_CekSenet }
	tabloYapiDuzenle({ result }) {
		super.tabloYapiDuzenle(...arguments);
		/* result.addKAPrefix('kasa').addGrupBasit('KASA', 'Kasa', 'kasa', DMQKasa) */
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('kasakod');
		if (attrSet.KASA) { sent.fromIliski('kasmst kas', `${kodClause} = kas.kod`) }
		for (let key in attrSet) {
			switch (key) { case 'KASA': sahalar.add(`${kodClause} kasakod`, 'kas.aciklama kasaadi'); wh.icerikKisitDuzenle_kasa({ ...e, saha: kodClause }); break }
		}
	}
	tabloYapiDuzenle_takip(e) { /* do nothing */ }
}
