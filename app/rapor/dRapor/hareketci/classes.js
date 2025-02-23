class DRapor_Hareketci_Cari extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get uygunmu() { return true }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'CARIHAR' } static get aciklama() { return 'Cari Hareketci' }
}
class DRapor_Hareketci_Cari_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return CariHareketci }
	static get raporClass() { return DRapor_Hareketci_Cari }
	tabloYapiDuzenle(e) { super.tabloYapiDuzenle(e); let {result} = e; this.tabloYapiDuzenle_cari(e) }
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e); let {hvDegeri} = e, kodClause = hvDegeri('must');
		this.loadServerData_queryDuzenle_cari({ ...e, kodClause });
		/*for (let key in attrSet) {
			switch (key) { case 'KASA': sahalar.add(`${kodClause} carikod`, 'car.birunvan cariunvan'); wh.icerikKisitDuzenle_cari({ ...e, saha: kodClause }); break }
		}*/
	}
}

class DRapor_Hareketci_Kasa extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'KASAHAR' } static get aciklama() { return 'Kasa Hareketci' }
}
class DRapor_Hareketci_Kasa_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return KasaHareketci }
	static get raporClass() { return DRapor_Hareketci_Kasa }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); let {result} = e;
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

class DRapor_Hareketci_Banka extends DRapor_Hareketci {
	static { window[this.name] = this; this._key2Class[this.name] = this }
	static get araSeviyemi() { return false } static get vioAdim() { return null }
	static get kod() { return 'BANKAHAR' } static get aciklama() { return 'Banka Hareketci' }
}
class DRapor_Hareketci_Banka_Main extends DRapor_Hareketci_Main {
	static { window[this.name] = this; this._key2Class[this.name] = this } static get hareketciSinif() { return BankaHareketci }
	static get raporClass() { return DRapor_Hareketci_Banka }
	tabloYapiDuzenle(e) {
		super.tabloYapiDuzenle(e); let {result} = e;
		result.addKAPrefix('banka', 'bankahesap')
			.addGrupBasit('BANKAHESAP', 'Banka Hesap', 'bankahesap', DMQBankaHesap)
			.addGrupBasit('BANKA', 'Banka', 'banka', DMQBanka)
	}
	loadServerData_queryDuzenle_hrkSent(e) {
		super.loadServerData_queryDuzenle_hrkSent(e);
		let {attrSet, sent, hvDegeri} = e, {where: wh, sahalar} = sent, kodClause = hvDegeri('banhesapkod');
		if (attrSet.BANKAHESAP || attrSet.BANKA) { sent.fromIliski('banbizhesap bhes', `${kodClause} = bhes.kod`) }
		if (attrSet.BANKA) { sent.fromIliski('banmst ban', 'bhes.bankakod = ban.kod') }
		for (let key in attrSet) {
			switch (key) { case 'BANKAHESAP': sahalar.add(`${kodClause} bankahesapkod`, 'bhes.aciklama bankaadi'); wh.icerikKisitDuzenle_bankaHesap({ ...e, saha: kodClause }); break }
			switch (key) { case 'BANKA': sahalar.add('bhes.bankakod', 'ban.aciklama bankaadi'); wh.icerikKisitDuzenle_banka({ ...e, saha: 'bhes.bankakod' }); break }
		}
	}
}
